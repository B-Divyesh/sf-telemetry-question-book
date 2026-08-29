import assert from 'node:assert/strict';

const expectedBuildId = process.argv[2];
const origin = process.env.DEPLOY_ORIGIN || 'https://telemetry-question-book.sociobot.in';

if (!/^[0-9a-f]{40}$/.test(expectedBuildId || '')) {
  throw new Error('Pass the exact 40-character deployed commit as the first argument.');
}

const probeToken = `d_live_rate_${Date.now().toString(36)}`;
let firstRemaining;

for (let index = 0; index <= 100; index += 1) {
  const response = await fetch(`${origin}/api/snapshots/${probeToken}`, {
    headers: {
      // Azure Front Door overwrites X-Azure-SocketIP. The other values are
      // intentionally rotated to prove caller-controlled headers cannot reset
      // the allowance.
      'X-Azure-SocketIP': `198.18.0.${(index % 200) + 1}`,
      'X-Azure-ClientIP': `198.51.100.${(index % 200) + 1}`,
      'X-Forwarded-For': `192.0.2.${(index % 200) + 1}`,
      'Client-IP': `2001:db8::${index + 1}`
    }
  });
  const limit = Number(response.headers.get('x-ratelimit-limit'));
  const remaining = Number(response.headers.get('x-ratelimit-remaining'));
  assert.equal(limit, 100, 'live sharing allowance must advertise a 100-request limit');

  if (index === 0) {
    assert.equal(response.status, 404, 'the first live rate probe must reach the missing-link response');
    assert.ok(Number.isInteger(remaining) && remaining >= 0 && remaining <= 99, 'the first remaining count must be valid');
    firstRemaining = remaining;
    continue;
  }

  if (index <= firstRemaining) {
    assert.equal(response.status, 404, `rotated spoof headers must not change allowance request ${index + 1}`);
    assert.equal(remaining, firstRemaining - index, 'the shared allowance must decrease monotonically');
  } else {
    assert.equal(response.status, 429, 'the first request after the shared allowance must be blocked');
    assert.equal(remaining, 0);
    assert.ok(Number(response.headers.get('retry-after')) >= 1, '429 must include Retry-After');
    break;
  }
}

const healthResponse = await fetch(`${origin}/api/health`, { cache: 'no-store' });
assert.equal(healthResponse.status, 200);
const health = await healthResponse.json();
assert.deepEqual(Object.keys(health).sort(), ['buildId', 'ok', 'snapshotStoreConfigured']);
assert.equal(health.ok, true);
assert.equal(health.snapshotStoreConfigured, true);
assert.equal(health.buildId, expectedBuildId, 'live API BUILD_ID must equal the deployed commit');

console.log(`Live API passed: spoofed headers shared one allowance; buildId=${health.buildId}`);
