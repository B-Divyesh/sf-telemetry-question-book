module.exports = async function (context) {
  const record = context.bindings.snapshot;
  const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
  if (!record) return { status: 404, headers, body: JSON.stringify({ error: 'This answer link was not found.' }) };
  if (context.bindings.revocation || Date.parse(record.expiresAt) <= Date.now()) {
    return { status: 410, headers, body: JSON.stringify({ error: 'This answer link has expired or was revoked.' }) };
  }
  return { status: 200, headers, body: JSON.stringify({ snapshot: JSON.parse(record.payload), expiresAt: record.expiresAt }) };
};
