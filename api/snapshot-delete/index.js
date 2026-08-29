const { createHash, timingSafeEqual } = require('node:crypto');
const { get, removePayload } = require('../lib/store');
const { enforceRateLimit, addRateHeaders } = require('../lib/rate-limit');

module.exports = async function (context, req) {
  const rate = await enforceRateLimit(req);
  if (!rate.allowed) return rate.response;
  const token = context.bindingData.token;
  const record = await get(token);
  if (record?.unavailable) return addRateHeaders({ status: 204, headers: { 'Cache-Control': 'no-store' } }, rate);
  const supplied = createHash('sha256').update(String(req.body?.revokeKey || '')).digest();
  const expected = record?.revokeHash ? Buffer.from(record.revokeHash, 'hex') : Buffer.alloc(32);
  if (!record || !timingSafeEqual(supplied, expected)) {
    return addRateHeaders({ status: 403, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'The revocation key is not valid.' }) }, rate);
  }
  await removePayload(token, 'revoked');
  return addRateHeaders({ status: 204, headers: { 'Cache-Control': 'no-store' } }, rate);
};
