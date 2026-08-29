const REQUIRED_KEYS = ['version', 'question', 'answer', 'status', 'observedAt', 'createdAt', 'redacted', 'demo'];
const OPTIONAL_KEYS = ['owner', 'source', 'note'];
const ALLOWED_KEYS = new Set([...REQUIRED_KEYS, ...OPTIONAL_KEYS]);
const STATUS = new Set(['On track', 'Needs attention', 'Stale']);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function isText(value, min, max) {
  return typeof value === 'string' && value.trim().length >= min && value.length <= max;
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}

function validateSnapshot(payload, requestDemo) {
  const invalid = { ok: false, error: 'The answer copy is invalid. Review it and try again.' };
  if (!isPlainObject(payload) || typeof requestDemo !== 'boolean') return invalid;
  const keys = Object.keys(payload);
  if (keys.some((key) => !ALLOWED_KEYS.has(key)) || REQUIRED_KEYS.some((key) => !Object.hasOwn(payload, key))) return invalid;
  if (payload.version !== 2 || !isText(payload.question, 1, 100) || !isText(payload.answer, 1, 120)) return invalid;
  if (!STATUS.has(payload.status) || !isIsoDate(payload.observedAt) || !isIsoDate(payload.createdAt)) return invalid;
  if (typeof payload.redacted !== 'boolean' || typeof payload.demo !== 'boolean' || payload.demo !== requestDemo) return invalid;

  const hasPrivateFields = OPTIONAL_KEYS.some((key) => Object.hasOwn(payload, key));
  if (payload.redacted && hasPrivateFields) return invalid;
  if (!payload.redacted) {
    if (!OPTIONAL_KEYS.every((key) => Object.hasOwn(payload, key))) return invalid;
    if (!isText(payload.owner, 1, 60) || !isText(payload.source, 1, 60) || typeof payload.note !== 'string' || payload.note.length > 240) return invalid;
  }
  return { ok: true, value: Object.fromEntries(keys.map((key) => [key, payload[key]])) };
}

module.exports = { validateSnapshot, isIsoDate };
