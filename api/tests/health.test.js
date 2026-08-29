const assert = require('node:assert/strict');
const test = require('node:test');

test('health publishes only the injected non-secret build identity and is not rate limited', async () => {
  const previous = process.env.BUILD_ID;
  process.env.BUILD_ID = '753ed02-repair.3';
  const health = require('../health');
  const responses = await Promise.all(Array.from({ length: 200 }, () => health({}, {})));
  assert.equal(responses.every((response) => response.status === 200), true);
  assert.deepEqual(JSON.parse(responses[0].body), { ok: true, snapshotStoreConfigured: false, buildId: '753ed02-repair.3' });
  assert.equal(responses[0].headers['X-RateLimit-Limit'], undefined);
  if (previous === undefined) delete process.env.BUILD_ID;
  else process.env.BUILD_ID = previous;
});

test('health sanitizes an accidental unsafe build label', () => {
  const health = require('../health');
  const previous = process.env.BUILD_ID;
  process.env.BUILD_ID = 'repair 3\nsecret=value';
  assert.equal(health.buildId(), 'repair-3-secret-value');
  if (previous === undefined) delete process.env.BUILD_ID;
  else process.env.BUILD_ID = previous;
});
