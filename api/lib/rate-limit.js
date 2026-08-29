const { createHash } = require('node:crypto');
const { isIP } = require('node:net');
const { consumeRateLimit } = require('./store');

const LIMIT = 100;
const WINDOW_SECONDS = 60;

function header(req, name) {
  if (typeof req?.headers?.get === 'function') return req.headers.get(name);
  const headers = req?.headers || {};
  return headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
}

function clientAddress(req) {
  const forwarded = header(req, 'x-azure-clientip') || header(req, 'x-forwarded-for') || header(req, 'client-ip') || req?.ip || 'unknown';
  const address = String(forwarded).split(',')[0].trim().slice(0, 128);
  const bracketed = address.match(/^\[([^\]]+)](?::\d+)?$/);
  if (bracketed && isIP(bracketed[1])) return bracketed[1];
  const ipv4WithPort = address.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort && isIP(ipv4WithPort[1]) === 4) return ipv4WithPort[1];
  if (isIP(address)) return address;
  const lastColon = address.lastIndexOf(':');
  const possibleIpv6 = lastColon > 0 ? address.slice(0, lastColon) : '';
  if (/^\d+$/.test(address.slice(lastColon + 1)) && isIP(possibleIpv6) === 6) return possibleIpv6;
  return address || 'unknown';
}

function createRateLimiter(options = {}) {
  const consume = options.consume || consumeRateLimit;
  const clock = options.clock || Date.now;
  return async function enforceRateLimit(req) {
    const now = clock();
    const key = createHash('sha256').update(clientAddress(req)).digest('hex');
    try {
      const result = await consume(key, LIMIT, WINDOW_SECONDS, now);
      const retryAfter = Math.max(1, Math.ceil((result.resetAtMs - now) / 1000));
      const headers = {
        'X-RateLimit-Limit': String(LIMIT),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAtMs / 1000))
      };
      if (result.allowed) return { allowed: true, headers };
      return {
        allowed: false,
        response: {
          status: 429,
          headers: { ...headers, 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: `This client has used its ${LIMIT} snapshot requests for this minute. Try again in ${retryAfter} seconds.` })
        }
      };
    } catch {
      return {
        allowed: false,
        response: {
          status: 503,
          headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json', 'Retry-After': '5' },
          body: JSON.stringify({ error: 'The snapshot service is temporarily unavailable. Try again in a few seconds.' })
        }
      };
    }
  };
}

function addRateHeaders(response, rate) {
  return { ...response, headers: { ...rate.headers, ...(response.headers || {}) } };
}

module.exports = { LIMIT, WINDOW_SECONDS, clientAddress, createRateLimiter, enforceRateLimit: createRateLimiter(), addRateHeaders };
