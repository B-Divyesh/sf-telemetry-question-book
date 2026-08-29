const { createHash, timingSafeEqual } = require('node:crypto');
const { get, removePayload } = require('../lib/store');

module.exports = async function (context, req) {
  const token = context.bindingData.token;
  const record = await get(token);
  if (record?.unavailable) return { status: 204, headers: { 'Cache-Control': 'no-store' } };
  const supplied = createHash('sha256').update(String(req.body?.revokeKey || '')).digest();
  const expected = record?.revokeHash ? Buffer.from(record.revokeHash, 'hex') : Buffer.alloc(32);
  if (!record || !timingSafeEqual(supplied, expected)) {
    return { status: 403, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'The revocation key is not valid.' }) };
  }
  await removePayload(token, 'revoked');
  return { status: 204, headers: { 'Cache-Control': 'no-store' } };
};
