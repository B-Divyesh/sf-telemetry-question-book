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
  delete require.cache[ratePath];
  const { createRateLimiter, LIMIT, WINDOW_SECONDS } = require(ratePath);
  const counts = new Map();
  const consume = async (key, limit, window, now) => {
    assert.equal(limit, LIMIT);
    assert.equal(window, WINDOW_SECONDS);
    const count = (counts.get(key) || 0) + 1;
    counts.set(key, count);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAtMs: now + 60_000 };
  };
  const limit = createRateLimiter({ consume, clock: () => 2_000_000 });
  const req = { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } };
  for (let index = 0; index < LIMIT; index++) {
    const result = await limit(req);
    assert.equal(result.allowed, true);
  }
  const blocked = await limit(req);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.response.status, 429);
  assert.equal(blocked.response.headers['Retry-After'], '60');
  assert.match(JSON.parse(blocked.response.body).error, /100 snapshot requests/);

  const otherClient = await limit({ headers: { 'x-forwarded-for': '203.0.113.10' } });
  assert.equal(otherClient.allowed, true);
});

test('limiter fails closed with a plain retry response when shared storage is unavailable', async () => {
  const { createRateLimiter } = require('../lib/rate-limit');
  const limit = createRateLimiter({ consume: async () => { throw new Error('connection details must not leak'); } });
  const result = await limit({ headers: {} });
  assert.equal(result.response.status, 503);
  assert.equal(result.response.headers['Retry-After'], '5');
  assert.deepEqual(JSON.parse(result.response.body), { error: 'The snapshot service is temporarily unavailable. Try again in a few seconds.' });
});
