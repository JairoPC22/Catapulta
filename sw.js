'use strict';
const CACHE_NAME = 'catapultapay-v41.0';
const CACHE_PREFIX = 'catapultapay-';
const PRECACHE_ASSETS = [
  '/', '/index.html', '/styles.css?v=41', '/design.css?v=41', '/design.js?v=41',
  '/runtime.js?v=41', '/script.js?v=41', '/i18n.js?v=41', '/assets/js/icons.js?v=41',
  '/page-state.css?v=41', '/loading.js?v=41', '/recovery.js?v=41',
  '/404.html', '/error.html', '/offline.html', '/assets/fonts/design/manrope.woff2',
  '/assets/css/terminal-icons.css?v=41',
  '/assets/audio/catapultapayment-signature.mp3', '/imagecata.png', '/favicon.svg', '/favicon.ico', '/manifest.json',
  '/assets/icons/icon-192.png', '/assets/icons/icon-512.png'
];
const ESSENTIAL = new Set(PRECACHE_ASSETS.map(path => new URL(path, self.location.origin).href));
const MAX_EXTRA_ENTRIES = 60;
async function safeMatch(request) { try { return await caches.match(request); } catch { return null; } }
async function store(cache, request, response) {
  if (!response.ok || response.status === 206) return;
  try {
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    const extras = keys.filter(key => !ESSENTIAL.has(key.url));
    await Promise.all(extras.slice(0, Math.max(0, extras.length - MAX_EXTRA_ENTRIES)).map(key => cache.delete(key)));
  } catch { /* Cache quota/storage restrictions must not fail a network response. */ }
}
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('range') || /\.(mp4|webm|pdf)$/i.test(url.pathname)) return;
  if (request.mode === 'navigate') { event.respondWith(networkFirst(request)); return; }
  // Source and discovery files should always be current; only runtime assets are cached.
  if (!/\.(css|js|png|jpe?g|webp|svg|ico|woff2?|ttf|json|mp3)$/i.test(url.pathname)) return;
  event.respondWith(staleWhileRevalidate(request, event));
});
async function networkFirst(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (response.status === 404 || response.status >= 500) {
      const fallback = await safeMatch(response.status === 404 ? '/404.html' : '/error.html');
      if (fallback) return new Response(await fallback.text(), { status: response.status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (response.ok) { try { const cache = await caches.open(CACHE_NAME); await store(cache, request, response); } catch { /* Network remains usable without storage. */ } }
    return response;
  } catch {
    const cached = await safeMatch(request);
    if (cached) return cached;
    const offline = await safeMatch('/offline.html');
    if (offline) return new Response(await offline.text(), { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    return new Response('Sin conexión. Revisa tu conexión e intenta de nuevo.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } finally { clearTimeout(timeout); }
}
async function staleWhileRevalidate(request, event) {
  let cache;
  try { cache = await caches.open(CACHE_NAME); }
  catch { return fetch(request).catch(() => new Response('No disponible', { status: 503 })); }
  const cached = await cache.match(request);
  const refresh = fetch(request).then(async response => { await store(cache, request, response); return response; }).catch(() => null);
  event.waitUntil(refresh.then(() => {}));
  if (cached) return cached;
  return (await refresh) || new Response('No disponible', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
