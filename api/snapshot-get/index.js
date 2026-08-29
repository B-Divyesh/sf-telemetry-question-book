const { get, removePayload } = require('../lib/store');
const { enforceRateLimit, addRateHeaders } = require('../lib/rate-limit');

module.exports = async function (context, req) {
  const rate = await enforceRateLimit(req);
  if (!rate.allowed) return rate.response;
  const token = context.bindingData.token;
  const record = await get(token);
  const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
  if (!record) return addRateHeaders({ status: 404, headers, body: JSON.stringify({ error: 'This answer link was not found.' }) }, rate);
  const revoked = Boolean(record.unavailable);
  const expired = Date.parse(record.expiresAt) <= Date.now();
  const missingPayload = !record.payload;
  if (revoked || expired || missingPayload) {
    if (expired && !revoked) await removePayload(token, 'expired');
    const reason = revoked ? record.reason || 'revoked' : expired ? 'expired' : 'unavailable';
    return addRateHeaders({ status: 410, headers, body: JSON.stringify({ error: 'This answer link has expired or was revoked.', reason }) }, rate);
  }
  try {
    return addRateHeaders({ status: 200, headers, body: JSON.stringify({ snapshot: JSON.parse(record.payload), expiresAt: record.expiresAt }) }, rate);
  } catch {
    await removePayload(token, 'invalid');
    return addRateHeaders({ status: 410, headers, body: JSON.stringify({ error: 'This answer link is unavailable.', reason: 'invalid' }) }, rate);
  }
};
