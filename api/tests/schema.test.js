const assert = require('node:assert/strict');
const test = require('node:test');
const { validateSnapshot } = require('../lib/snapshot-schema');

function validSnapshot(overrides = {}) {
  return {
    version: 2,
    question: 'Did Northstar orders arrive?',
    answer: '1,842 orders',
    status: 'On track',
    observedAt: '2026-08-29T10:00:00.000Z',
    createdAt: '2026-08-29T10:01:00.000Z',
    redacted: true,
    demo: false,
    ...overrides
  };
}

test('accepts the exact redacted and unredacted snapshot schemas', () => {
  assert.equal(validateSnapshot(validSnapshot(), false).ok, true);
  assert.equal(validateSnapshot(validSnapshot({ redacted: false, owner: 'Data Platform', source: 'Approved export', note: '' }), false).ok, true);
});

test('rejects every malformed type from the verifier reproduction with one plain recovery error', () => {
  const malformed = validSnapshot({ question: null, answer: { value: 1 }, status: 7, observedAt: 'not-a-date', createdAt: 'bad' });
  assert.deepEqual(validateSnapshot(malformed, false), {
    ok: false,
    error: 'The answer copy is invalid. Review it and try again.'
  });
});

test('rejects invalid dates, enums, lengths, extra keys, demo mismatches, and broken redaction invariants', () => {
  const invalid = [
    validSnapshot({ version: '2' }),
    validSnapshot({ question: '' }),
    validSnapshot({ question: 'q'.repeat(101) }),
    validSnapshot({ answer: 'a'.repeat(121) }),
    validSnapshot({ status: 'Fine' }),
    validSnapshot({ observedAt: '2026-02-30T00:00:00.000Z' }),
    validSnapshot({ createdAt: '2026-08-29' }),
    validSnapshot({ demo: true }),
    validSnapshot({ owner: 'Must stay hidden' }),
    validSnapshot({ extra: 'not allowed' }),
    validSnapshot({ redacted: false, owner: 'Owner', source: 'Source' })
  ];
  for (const value of invalid) assert.equal(validateSnapshot(value, false).ok, false);
});

test('create handler rejects the exact malformed payload before storage', async () => {
  const handlerPath = require.resolve('../snapshots-create');
  const storePath = require.resolve('../lib/store');
  const ratePath = require.resolve('../lib/rate-limit');
  let writes = 0;
  require.cache[storePath] = { id: storePath, filename: storePath, loaded: true, exports: { put: async () => { writes++; } } };
  require.cache[ratePath] = {
    id: ratePath,
    filename: ratePath,
    loaded: true,
    exports: {
      enforceRateLimit: async () => ({ allowed: true, headers: { 'X-RateLimit-Limit': '100' } }),
      addRateHeaders: (response, rate) => ({ ...response, headers: { ...rate.headers, ...response.headers } })
    }
  };
  delete require.cache[handlerPath];
  const handler = require(handlerPath);
  const response = await handler({}, {
    body: {
      demo: false,
      ttlSeconds: 60,
      snapshot: validSnapshot({ question: null, answer: { value: 1 }, status: 7, observedAt: 'not-a-date', createdAt: 'bad' })
    }
  });
  assert.equal(response.status, 400);
  assert.equal(writes, 0);
  assert.deepEqual(JSON.parse(response.body), { error: 'The answer copy is invalid. Review it and try again.' });
});

test('read handler removes malformed stored data and returns a plain unavailable response', async () => {
  const handlerPath = require.resolve('../snapshot-get');
  const storePath = require.resolve('../lib/store');
  const ratePath = require.resolve('../lib/rate-limit');
  let removed;
  require.cache[storePath] = {
    id: storePath,
    filename: storePath,
    loaded: true,
    exports: {
      get: async () => ({ payload: JSON.stringify(validSnapshot({ question: null })), expiresAt: '2026-08-30T10:00:00.000Z', demo: false }),
      removePayload: async (token, reason) => { removed = { token, reason }; }
    }
  };
  require.cache[ratePath] = {
    id: ratePath,
    filename: ratePath,
    loaded: true,
    exports: {
      enforceRateLimit: async () => ({ allowed: true, headers: { 'X-RateLimit-Limit': '100' } }),
      addRateHeaders: (response, rate) => ({ ...response, headers: { ...rate.headers, ...response.headers } })
    }
  };
  delete require.cache[handlerPath];
  const handler = require(handlerPath);
  const response = await handler({ bindingData: { token: 'r_bad' } }, { headers: {} });
  assert.equal(response.status, 410);
  assert.deepEqual(JSON.parse(response.body), { error: 'This answer link is unavailable.', reason: 'invalid' });
  assert.deepEqual(removed, { token: 'r_bad', reason: 'invalid' });
});
