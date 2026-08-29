const { TableClient } = require('@azure/data-tables');

const TABLE = 'TelemetryQuestionSnapshots';
let ready;

function client() {
  const connection = process.env.SnapshotStorage;
  if (!connection) throw new Error('SnapshotStorage is not configured.');
  return TableClient.fromConnectionString(connection, TABLE);
}

async function table() {
  const value = client();
  ready ||= value.createTable().catch((error) => {
    if (error.statusCode !== 409) throw error;
  });
  await ready;
  return value;
}

function partition(token) {
  return token.startsWith('d_') ? 'demo' : 'real';
}

async function put(record) {
  const value = await table();
  await value.createEntity({ partitionKey: partition(record.rowKey), ...record });
}

async function get(token) {
  const value = await table();
  try { return await value.getEntity(partition(token), token); }
  catch (error) { if (error.statusCode === 404) return null; throw error; }
}

async function removePayload(token, reason) {
  const value = await table();
  await value.upsertEntity({ partitionKey: partition(token), rowKey: token, unavailable: true, reason, removedAt: new Date().toISOString() }, 'Replace');
}

module.exports = { put, get, removePayload };
