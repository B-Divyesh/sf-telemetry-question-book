module.exports = async function () {
  return {
    status: 200,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, snapshotStoreConfigured: Boolean(process.env.SnapshotStorage) })
  };
};
