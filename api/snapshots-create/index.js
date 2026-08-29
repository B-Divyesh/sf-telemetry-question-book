const { randomBytes, randomUUID, createHash } = require('node:crypto');
const { put } = require('../lib/store');
const { validateSnapshot } = require('../lib/snapshot-schema');
const { enforceRateLimit, addRateHeaders } = require('../lib/rate-limit');

module.exports = async function (context, req) {
  const rate = await enforceRateLimit(req);
  if (!rate.allowed) return rate.response;
  const payload = req.body?.snapshot;
  const demo = req.body?.demo === true;
  const ttlSeconds = Number(req.body?.ttlSeconds);
  const checked = validateSnapshot(payload, req.body?.demo);
  if (!checked.ok) return addRateHeaders({ status: 400, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: checked.error }) }, rate);
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > 604800) {
    return addRateHeaders({ status: 400, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Expiry must be between 1 second and 7 days.' }) }, rate);
  }
  const serialized = JSON.stringify(checked.value);
  if (serialized.length > 8192) return addRateHeaders({ status: 413, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'The answer copy is too large.' }) }, rate);
  const token = `${demo ? 'd' : 'r'}_${randomUUID().replaceAll('-', '')}`;
  const revokeKey = randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  await put({
    rowKey: token,
    payload: serialized,
    expiresAt,
    demo,
    revokeHash: createHash('sha256').update(revokeKey).digest('hex')
  });
  return addRateHeaders({
    status: 201,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, revokeKey, expiresAt })
  }, rate);
};
