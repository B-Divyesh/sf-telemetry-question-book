import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { randomBytes, randomUUID, createHash } from 'node:crypto';

const root = join(process.cwd(), 'dist');
const snapshots = new Map();
const revoked = new Set();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };
const appRoutes = new Set(['/', '/demo', '/demo/snapshot', '/book', '/privacy', '/terms', '/snapshot', '/sample-sources/northstar-orders', '/sample-sources/atlas-webhooks', '/sample-sources/harbor-export']);

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(status === 204 ? '' : JSON.stringify(body));
}

async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1:4173');
  if (url.pathname === '/api/snapshots' && req.method === 'POST') {
    const input = await body(req);
    const ttlSeconds = Number(input.ttlSeconds);
    if (!input.snapshot || !Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > 604800) return json(res, 400, { error: 'The answer copy or expiry is invalid.' });
    const token = `${input.demo === true ? 'd' : 'r'}_${randomUUID().replaceAll('-', '')}`;
    const revokeKey = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    snapshots.set(token, { snapshot: structuredClone(input.snapshot), expiresAt, revokeHash: createHash('sha256').update(revokeKey).digest('hex') });
    return json(res, 201, { token, revokeKey, expiresAt });
  }
  const match = url.pathname.match(/^\/api\/snapshots\/([a-z]_[a-f0-9]+)$/);
  if (match && req.method === 'GET') {
    const record = snapshots.get(match[1]);
    if (!record) return json(res, 404, { error: 'This answer link was not found.' });
    if (revoked.has(match[1]) || Date.parse(record.expiresAt) <= Date.now()) return json(res, 410, { error: 'This answer link has expired or was revoked.' });
    return json(res, 200, { snapshot: record.snapshot, expiresAt: record.expiresAt });
  }
  if (match && req.method === 'DELETE') {
    const input = await body(req);
    const record = snapshots.get(match[1]);
    const hash = createHash('sha256').update(String(input.revokeKey || '')).digest('hex');
    if (!record || hash !== record.revokeHash) return json(res, 403, { error: 'The revocation key is not valid.' });
    revoked.add(match[1]);
    return json(res, 204, {});
  }
  const relative = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.(\/|\\|$))+/, '');
  const asset = join(root, relative === '/' ? 'index.html' : relative);
  if (existsSync(asset) && !asset.endsWith('/')) {
    res.writeHead(200, { 'Content-Type': types[extname(asset)] || 'application/octet-stream' });
    return createReadStream(asset).pipe(res);
  }
  if (appRoutes.has(url.pathname) || url.pathname.startsWith('/s/')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(await readFile(join(root, 'index.html')));
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(await readFile(join(root, '404.html')));
}).listen(4173, '127.0.0.1');
