const { createHash, timingSafeEqual } = require('node:crypto');

module.exports = async function (context, req) {
  const record = context.bindings.snapshot;
  const supplied = createHash('sha256').update(String(req.body?.revokeKey || '')).digest();
  const expected = record?.revokeHash ? Buffer.from(record.revokeHash, 'hex') : Buffer.alloc(32);
  if (!record || !timingSafeEqual(supplied, expected)) {
    return { status: 403, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'The revocation key is not valid.' }) };
  }
  context.bindings.revocationTable = { PartitionKey: 'revocations', RowKey: context.bindingData.token, revokedAt: new Date().toISOString() };
  return { status: 204, headers: { 'Cache-Control': 'no-store' } };
};
