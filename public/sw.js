const CACHE = 'tqb-shell-v5';
const CORE = ['/assets/question-console-960.webp', '/favicon.svg', '/404.css'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    const shell = await fetch('/');
    await cache.put('/', shell.clone());
    const html = await shell.text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)].map((match) => match[1]);
    await cache.addAll([...new Set(assets)]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(async () => {
        const url = new URL(event.request.url);
        const cached = await caches.match(url.pathname, { ignoreSearch: true, ignoreVary: true });
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('/');
        return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      })
  );
});
