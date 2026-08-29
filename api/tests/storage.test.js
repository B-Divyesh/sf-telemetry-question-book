const assert = require('node:assert/strict');
const test = require('node:test');

class FakeTable {
  constructor(seed = []) { this.version = 0; this.entities = new Map(seed.map((entity) => [`${entity.partitionKey}/${entity.rowKey}`, { ...structuredClone(entity), etag: entity.etag || `v${++this.version}` }])); }
  async createTable() {}
  async createEntity(entity) { this.entities.set(`${entity.partitionKey}/${entity.rowKey}`, structuredClone(entity)); }
  async getEntity(partitionKey, rowKey) {
    const value = this.entities.get(`${partitionKey}/${rowKey}`);
    if (!value) throw Object.assign(new Error('missing'), { statusCode: 404 });
    return structuredClone(value);
  }
  async upsertEntity(entity) { this.entities.set(`${entity.partitionKey}/${entity.rowKey}`, structuredClone(entity)); }
  async updateEntity(entity, mode, options) {
    const key = `${entity.partitionKey}/${entity.rowKey}`;
    const current = this.entities.get(key);
    if (!current || current.etag !== options.etag) throw Object.assign(new Error('conflict'), { statusCode: 412 });
    this.entities.set(key, { ...structuredClone(entity), etag: `v${++this.version}` });
  }
  async *listEntities() { for (const entity of this.entities.values()) yield structuredClone(entity); }
}

class FakeQueue {
  constructor(clock) { this.clock = clock; this.message = undefined; this.deleted = false; }
  async createIfNotExists() { this.deleted = false; }
  async sendMessage(messageText, options) { this.message = { messageText, expiresAt: this.clock() + options.messageTimeToLive * 1000, ttl: options.messageTimeToLive }; }
  async peekMessages() {
    if (this.message && this.clock() >= this.message.expiresAt) this.message = undefined;
    return { peekedMessageItems: this.message ? [{ messageText: this.message.messageText }] : [] };
  }
  async deleteIfExists() { this.deleted = true; this.message = undefined; }
}

class FakeQueueService {
  constructor(clock) { this.clock = clock; this.queues = new Map(); }
  getQueueClient(name) {
    if (!this.queues.has(name)) this.queues.set(name, new FakeQueue(this.clock));
    return this.queues.get(name);
  }
}

test('@claim:snapshot-retention payload storage uses service-enforced TTL and table metadata contains no customer payload', async () => {
  let now = Date.parse('2026-08-29T12:00:00.000Z');
  const clock = () => now;
  const table = new FakeTable();
  const queues = new FakeQueueService(clock);
  const { createStore, queueName } = require('../lib/store');
  const store = createStore({ tableClient: table, queueServiceClient: queues, clock });
  const token = 'r_1234567890abcdef1234567890abcdef';
  const payload = JSON.stringify({ question: 'Customer-impact question' });
  await store.put({ rowKey: token, payload, expiresAt: new Date(now + 1000).toISOString(), demo: false, revokeHash: 'hash' });

  const metadata = table.entities.get(`real/${token}`);
  assert.equal(Object.hasOwn(metadata, 'payload'), false);
  assert.deepEqual(Object.keys(metadata).sort(), ['demo', 'expiresAt', 'partitionKey', 'revokeHash', 'rowKey']);
  const payloadQueue = queues.queues.get(queueName(token));
  assert.equal(payloadQueue.message.ttl, 1);
  assert.equal(payloadQueue.message.messageText, payload);

  now += 1001;
  const storedAfterExpiry = await payloadQueue.peekMessages();
  assert.deepEqual(storedAfterExpiry.peekedMessageItems, []);
  assert.equal(table.entities.get(`real/${token}`).unavailable, undefined);
});

test('@claim:snapshot-storage-minimization stores only link controls in metadata and deletes answer data on revocation', async () => {
  const now = Date.parse('2026-08-29T12:00:00.000Z');
  const table = new FakeTable();
  const queues = new FakeQueueService(() => now);
  const { createStore, queueName } = require('../lib/store');
  const store = createStore({ tableClient: table, queueServiceClient: queues, clock: () => now });
  const token = 'd_abcdef1234567890abcdef1234567890';
  await store.put({ rowKey: token, payload: 'PRIVATE ANSWER', expiresAt: '2026-08-29T13:00:00.000Z', demo: true, revokeHash: 'one-way-code' });

  const metadata = table.entities.get(`demo/${token}`);
  assert.deepEqual(Object.keys(metadata).sort(), ['demo', 'expiresAt', 'partitionKey', 'revokeHash', 'rowKey']);
  assert.equal(JSON.stringify(metadata).includes('PRIVATE ANSWER'), false);
  const queue = queues.queues.get(queueName(token));
  assert.equal(queue.message.messageText, 'PRIVATE ANSWER');

  await store.removePayload(token, 'revoked');
  assert.equal(queue.deleted, true);
  assert.equal(queue.message, undefined);
  assert.deepEqual(Object.keys(table.entities.get(`demo/${token}`)).sort(), ['partitionKey', 'reason', 'removedAt', 'removedAtMs', 'rowKey', 'unavailable']);
});

test('legacy migration removes expired data and moves active payloads to TTL storage without reading either token', async () => {
  const now = Date.parse('2026-08-29T12:00:00.000Z');
  const expired = { partitionKey: 'real', rowKey: 'r_expired', payload: 'CUSTOMER-DATA', expiresAt: new Date(now - 1).toISOString() };
  const current = { partitionKey: 'demo', rowKey: 'd_current', payload: 'SAMPLE-DATA', expiresAt: new Date(now + 60_000).toISOString() };
  const table = new FakeTable([expired, current]);
  const queues = new FakeQueueService(() => now);
  const { createStore } = require('../lib/store');
  const store = createStore({ tableClient: table, queueServiceClient: queues, clock: () => now });

  assert.deepEqual(await store.migrateLegacyPayloads(now), { removed: 1, migrated: 1 });
  assert.deepEqual(table.entities.get('real/r_expired'), {
    partitionKey: 'real', rowKey: 'r_expired', unavailable: true, reason: 'expired', removedAt: '2026-08-29T12:00:00.000Z', removedAtMs: now
  });
  assert.equal(Object.hasOwn(table.entities.get('demo/d_current'), 'payload'), false);
  assert.equal(queues.queues.get('tqb-d-current').message.messageText, 'SAMPLE-DATA');
});
