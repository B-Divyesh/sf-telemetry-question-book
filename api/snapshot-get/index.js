const { get, removePayload } = require('../lib/store');

module.exports = async function (context) {
  const token = context.bindingData.token;
  const record = await get(token);
  const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
  if (!record) return { status: 404, headers, body: JSON.stringify({ error: 'This answer link was not found.' }) };
  const revoked = Boolean(record.unavailable);
  const expired = Date.parse(record.expiresAt) <= Date.now();
  if (revoked || expired) {
    if (expired && !revoked) await removePayload(token, 'expired');
    return { status: 410, headers, body: JSON.stringify({ error: 'This answer link has expired or was revoked.', reason: revoked ? 'revoked' : 'expired' }) };
  }
  return { status: 200, headers, body: JSON.stringify({ snapshot: JSON.parse(record.payload), expiresAt: record.expiresAt }) };
};
