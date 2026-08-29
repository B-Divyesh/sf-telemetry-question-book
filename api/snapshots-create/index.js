const { randomBytes, randomUUID, createHash } = require('node:crypto');
const { put } = require('../lib/store');

const allowedKeys = ['version', 'question', 'answer', 'status', 'observedAt', 'createdAt', 'owner', 'source', 'note', 'redacted'];

module.exports = async function (context, req) {
  const payload = req.body?.snapshot;
  const demo = req.body?.demo === true;
  const ttlSeconds = Number(req.body?.ttlSeconds);
  if (!payload || typeof payload !== 'object' || !allowedKeys.every((key) => key in payload || !['version', 'question', 'answer', 'status', 'observedAt', 'createdAt', 'redacted'].includes(key))) {
    return { status: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'The answer copy is incomplete.' }) };
  }
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > 604800) {
    return { status: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Expiry must be between 1 second and 7 days.' }) };
  }
  const clean = Object.fromEntries(allowedKeys.filter((key) => payload[key] !== undefined).map((key) => [key, payload[key]]));
  const serialized = JSON.stringify(clean);
  if (serialized.length > 8192) return { status: 413, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'The answer copy is too large.' }) };
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
  return {
    status: 201,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, revokeKey, expiresAt })
  };
};
