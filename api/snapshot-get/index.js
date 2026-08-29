const { get, removePayload } = require('../lib/store');
const { enforceRateLimit, addRateHeaders } = require('../lib/rate-limit');
const { validateSnapshot } = require('../lib/snapshot-schema');

module.exports = async function (context, req) {
  const rate = await enforceRateLimit(req);
  if (!rate.allowed) return rate.response;
  const token = context.bindingData.token;
  const record = await get(token);
  const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
  if (!record) return addRateHeaders({ status: 404, headers, body: JSON.stringify({ error: 'This expiring link was not found.' }) }, rate);
  const revoked = Boolean(record.unavailable);
  const expired = Date.parse(record.expiresAt) <= Date.now();
  const missingPayload = !record.payload;
  if (revoked || expired || missingPayload) {
    if (expired && !revoked) await removePayload(token, 'expired');
    const reason = revoked ? record.reason || 'revoked' : expired ? 'expired' : 'unavailable';
    return addRateHeaders({ status: 410, headers, body: JSON.stringify({ error: 'This expiring link has expired or was revoked.', reason }) }, rate);
  }
  try {
    const snapshot = JSON.parse(record.payload);
    const checked = validateSnapshot(snapshot, Boolean(record.demo));
    if (!checked.ok) throw new Error('invalid stored snapshot');
    return addRateHeaders({ status: 200, headers, body: JSON.stringify({ snapshot: checked.value, expiresAt: record.expiresAt }) }, rate);
  } catch {
    await removePayload(token, 'invalid');
    return addRateHeaders({ status: 410, headers, body: JSON.stringify({ error: 'This expiring link is unavailable.', reason: 'invalid' }) }, rate);
  }
};
