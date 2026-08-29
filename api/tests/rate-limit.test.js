const assert = require('node:assert/strict');
const test = require('node:test');

class FakeTable {
  constructor() {
    this.entities = new Map();
    this.version = 0;
  }
  async createTable() {}
  key(partitionKey, rowKey) { return `${partitionKey}/${rowKey}`; }
  async getEntity(partitionKey, rowKey) {
    const value = this.entities.get(this.key(partitionKey, rowKey));
    if (!value) throw Object.assign(new Error('missing'), { statusCode: 404 });
    return structuredClone(value);
  }
  async createEntity(entity) {
    const key = this.key(entity.partitionKey, entity.rowKey);
    if (this.entities.has(key)) throw Object.assign(new Error('conflict'), { statusCode: 409 });
    this.entities.set(key, { ...structuredClone(entity), etag: `v${++this.version}` });
  }
  async updateEntity(entity, mode, options) {
    const key = this.key(entity.partitionKey, entity.rowKey);
    const current = this.entities.get(key);
    if (!current || current.etag !== options.etag) throw Object.assign(new Error('conflict'), { statusCode: 412 });
    this.entities.set(key, { ...structuredClone(entity), etag: `v${++this.version}` });
  }
}

test('shared atomic storage allowance admits 100 concurrent requests and rejects the rest', async () => {
  const storePath = require.resolve('../lib/store');
  delete require.cache[storePath];
  const { createStore } = require(storePath);
  const store = createStore({ tableClient: new FakeTable(), queueServiceClient: {}, clock: () => 1_000_000 });
  const results = await Promise.all(Array.from({ length: 120 }, () => store.consumeRateLimit('same-client', 100, 60, 1_000_000)));
  assert.equal(results.filter((result) => result.allowed).length, 100);
  assert.equal(results.filter((result) => !result.allowed).length, 20);
  assert.equal(results.at(-1).resetAtMs, 1_060_000);
});

test('@claim:api-rate-limit all snapshot routes share one per-client minute and 429 includes Retry-After', async () => {
  const ratePath = require.resolve('../lib/rate-limit');
  const storePath = require.resolve('../lib/store');
  const createPath = require.resolve('../snapshots-create');
  const getPath = require.resolve('../snapshot-get');
  const deletePath = require.resolve('../snapshot-delete');
  const originalRate = require.cache[ratePath];
  const originalStore = require.cache[storePath];
  delete require.cache[ratePath];
  const { createRateLimiter, LIMIT, WINDOW_SECONDS, addRateHeaders } = require(ratePath);
  const counts = new Map();
  const consume = async (key, limit, window, now) => {
    assert.equal(limit, LIMIT);
    assert.equal(window, WINDOW_SECONDS);
    const count = (counts.get(key) || 0) + 1;
    counts.set(key, count);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAtMs: now + 60_000 };
  };
  const enforceRateLimit = createRateLimiter({ consume, clock: () => 2_000_000 });
  require.cache[ratePath] = { id: ratePath, filename: ratePath, loaded: true, exports: { enforceRateLimit, addRateHeaders } };
  require.cache[storePath] = {
    id: storePath,
    filename: storePath,
    loaded: true,
    exports: { put: async () => {}, get: async () => null, removePayload: async () => {} }
  };
  for (const path of [createPath, getPath, deletePath]) delete require.cache[path];
  const create = require(createPath);
  const open = require(getPath);
  const revoke = require(deletePath);
  const headers = { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' };
  const snapshot = {
    version: 2,
    question: 'Did Northstar orders arrive?',
    answer: '1,842 orders',
    status: 'On track',
    observedAt: '2026-08-29T10:00:00.000Z',
    createdAt: '2026-08-29T10:01:00.000Z',
    redacted: true,
    demo: true
  };

  try {
    for (let index = 0; index < 34; index++) {
      assert.equal((await create({}, { headers, body: { snapshot, demo: true, ttlSeconds: 60 } })).status, 201);
    }
    for (let index = 0; index < 33; index++) {
      assert.equal((await open({ bindingData: { token: 'd_missing' } }, { headers })).status, 404);
    }
    for (let index = 0; index < 33; index++) {
      assert.equal((await revoke({ bindingData: { token: 'd_missing' } }, { headers, body: { revokeKey: 'wrong' } })).status, 403);
    }

    const blocked = await create({}, { headers, body: { snapshot, demo: true, ttlSeconds: 60 } });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers['Retry-After'], '60');
    assert.match(JSON.parse(blocked.body).error, /100 snapshot requests/);

    const otherClient = await open({ bindingData: { token: 'd_missing' } }, { headers: { 'x-forwarded-for': '203.0.113.10' } });
    assert.equal(otherClient.status, 404);
    assert.equal(otherClient.headers['X-RateLimit-Remaining'], '99');
  } finally {
    for (const path of [createPath, getPath, deletePath]) delete require.cache[path];
    if (originalRate) require.cache[ratePath] = originalRate;
    else delete require.cache[ratePath];
    if (originalStore) require.cache[storePath] = originalStore;
    else delete require.cache[storePath];
  }
});

test('forwarded source ports cannot split one client into multiple allowances', async () => {
  const { clientAddress } = require('../lib/rate-limit');
  assert.equal(clientAddress({ headers: { 'x-forwarded-for': '203.0.113.9:49152' } }), '203.0.113.9');
  assert.equal(clientAddress({ headers: { 'x-forwarded-for': '203.0.113.9:58301, 10.0.0.1' } }), '203.0.113.9');
  assert.equal(clientAddress({ headers: { 'x-forwarded-for': '[2001:db8::7]:49152' } }), '2001:db8::7');
  assert.equal(clientAddress({ headers: { 'x-forwarded-for': '2001:db8::7' } }), '2001:db8::7');
  assert.equal(clientAddress({ headers: { 'x-azure-clientip': '198.51.100.4:5000', 'x-forwarded-for': '203.0.113.9:49152' } }), '198.51.100.4');
});

test('limiter fails closed with a plain retry response when shared storage is unavailable', async () => {
  const { createRateLimiter } = require('../lib/rate-limit');
  const limit = createRateLimiter({ consume: async () => { throw new Error('connection details must not leak'); } });
  const result = await limit({ headers: {} });
  assert.equal(result.response.status, 503);
  assert.equal(result.response.headers['Retry-After'], '5');
  assert.deepEqual(JSON.parse(result.response.body), { error: 'The snapshot service is temporarily unavailable. Try again in a few seconds.' });
});
