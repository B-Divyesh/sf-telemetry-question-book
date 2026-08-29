function buildId() {
  const value = process.env.BUILD_ID || process.env.GITHUB_SHA || 'development';
  return String(value).replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 64) || 'development';
}

module.exports = async function () {
  return {
    status: 200,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, snapshotStoreConfigured: Boolean(process.env.SnapshotStorage), buildId: buildId() })
  };
};

module.exports.buildId = buildId;
