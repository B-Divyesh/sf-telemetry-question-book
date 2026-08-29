const { TableClient } = require('@azure/data-tables');
const { QueueServiceClient } = require('@azure/storage-queue');

const TABLE = 'TelemetryQuestionSnapshots';
const RATE_PARTITION = 'rate';

function partition(token) {
  return token.startsWith('d_') ? 'demo' : 'real';
}

function queueName(token) {
  return `tqb-${token.replace('_', '-')}`;
}

function isMissing(error) {
  return error?.statusCode === 404;
}

function isConflict(error) {
  return error?.statusCode === 409 || error?.statusCode === 412;
}

function createStore(options = {}) {
  const clock = options.clock || Date.now;
  let tableValue = options.tableClient;
  let queueServiceValue = options.queueServiceClient;
  let ready;

  function connection() {
    const value = process.env.SnapshotStorage;
    if (!value) throw new Error('SnapshotStorage is not configured.');
    return value;
  }

  async function table() {
    tableValue ||= TableClient.fromConnectionString(connection(), TABLE);
    ready ||= tableValue.createTable().catch((error) => {
      if (!isConflict(error)) throw error;
    });
    await ready;
    return tableValue;
  }

  function queue(token) {
    queueServiceValue ||= QueueServiceClient.fromConnectionString(connection());
    return queueServiceValue.getQueueClient(queueName(token));
  }

  async function put(record) {
    const value = await table();
    const payloadQueue = queue(record.rowKey);
    const ttlSeconds = Math.max(1, Math.ceil((Date.parse(record.expiresAt) - clock()) / 1000));
    const { payload, ...metadata } = record;
    await payloadQueue.createIfNotExists();
    try {
      await payloadQueue.sendMessage(payload, { messageTimeToLive: ttlSeconds });
      await value.createEntity({ partitionKey: partition(record.rowKey), ...metadata });
    } catch (error) {
      await payloadQueue.deleteIfExists().catch(() => {});
      throw error;
    }
  }

  async function getMetadata(token) {
    const value = await table();
    try {
      return await value.getEntity(partition(token), token);
    } catch (error) {
      if (isMissing(error)) return null;
      throw error;
    }
  }

  async function get(token) {
    const record = await getMetadata(token);
    if (!record || record.unavailable || record.payload) return record;
    if (Date.parse(record.expiresAt) <= clock()) return record;
    const result = await queue(token).peekMessages({ numberOfMessages: 1 });
    const payload = result.peekedMessageItems?.[0]?.messageText;
    return payload === undefined ? record : { ...record, payload };
  }

  async function removePayload(token, reason) {
    const value = await table();
    await queue(token).deleteIfExists();
    const removedAtMs = clock();
    await value.upsertEntity({
      partitionKey: partition(token),
      rowKey: token,
      unavailable: true,
      reason,
      removedAt: new Date(removedAtMs).toISOString(),
      removedAtMs
    }, 'Replace');
  }

  async function migrateLegacyPayloads(now = clock()) {
    const value = await table();
    let removed = 0;
    let migrated = 0;
    for await (const entity of value.listEntities()) {
      if (!['demo', 'real'].includes(entity.partitionKey)) continue;
      if (!entity.payload) continue;
      if (Date.parse(entity.expiresAt) <= now) {
        await removePayload(entity.rowKey, 'expired');
        removed++;
        continue;
      }
      const payloadQueue = queue(entity.rowKey);
      const ttlSeconds = Math.max(1, Math.ceil((Date.parse(entity.expiresAt) - now) / 1000));
      await payloadQueue.createIfNotExists();
      await payloadQueue.sendMessage(entity.payload, { messageTimeToLive: ttlSeconds });
      const metadata = Object.fromEntries(Object.entries(entity).filter(([key]) => !['payload', 'etag', 'timestamp'].includes(key)));
      await value.updateEntity(metadata, 'Replace', { etag: entity.etag });
      migrated++;
    }
    return { removed, migrated };
  }

  async function consumeRateLimit(clientHash, limit, windowSeconds, now = clock()) {
    const value = await table();
    const rowKey = clientHash;
    const windowMs = windowSeconds * 1000;
    for (let attempt = 0; attempt < 128; attempt++) {
      let record;
      try {
        record = await value.getEntity(RATE_PARTITION, rowKey);
      } catch (error) {
        if (!isMissing(error)) throw error;
      }

      if (!record) {
        const resetAtMs = now + windowMs;
        try {
          await value.createEntity({ partitionKey: RATE_PARTITION, rowKey, count: 1, resetAtMs });
          return { allowed: true, remaining: limit - 1, resetAtMs };
        } catch (error) {
          if (isConflict(error)) continue;
          throw error;
        }
      }

      const resetAtMs = Number(record.resetAtMs);
      const expired = !Number.isFinite(resetAtMs) || resetAtMs <= now;
      const count = expired ? 0 : Number(record.count) || 0;
      const nextResetAtMs = expired ? now + windowMs : resetAtMs;
      if (count >= limit) return { allowed: false, remaining: 0, resetAtMs: nextResetAtMs };

      try {
        await value.updateEntity({
          partitionKey: RATE_PARTITION,
          rowKey,
          count: count + 1,
          resetAtMs: nextResetAtMs
        }, 'Replace', { etag: record.etag });
        return { allowed: true, remaining: limit - count - 1, resetAtMs: nextResetAtMs };
      } catch (error) {
        if (isConflict(error)) continue;
        throw error;
      }
    }
    throw new Error('The shared request allowance could not be updated.');
  }

  return { put, get, getMetadata, removePayload, migrateLegacyPayloads, consumeRateLimit };
}

const store = createStore();

module.exports = { ...store, createStore, partition, queueName };
