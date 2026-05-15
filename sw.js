'use strict';

const CACHE_NAME = 'catapultapay-v4.5.5';

// Assets que se cachean en la instalación
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/improvements.js',
  '/i18n.js',
  '/imagecata.png',
  '/favicon.svg',
  // Fuentes (se cachean en runtime automáticamente)
];

// ── INSTALL: precachear assets principales ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// ── ACTIVATE: limpiar cachés viejos ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: estrategia por tipo de asset ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    // Para Google Fonts y CDNs — cache first
    if (
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com' ||
      url.hostname === 'unpkg.com'
    ) {
      event.respondWith(cacheFirst(request, 'catapultapay-external-v1'));
    }
    return;
  }

  // HTML → Network first (siempre fresco)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Video → no cachear (demasiado pesado)
  if (url.pathname.endsWith('.mp4')) {
    return;
  }

  // CSS, JS, imágenes → Stale While Revalidate
  // (carga rápido desde caché y actualiza en background)
  event.respondWith(staleWhileRevalidate(request));
});

/* ── Estrategias de caché ── */

// Network first: intenta red, si falla usa caché
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// Cache first: caché prioritario, red como fallback
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName || CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate: caché inmediato + actualiza en background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || await fetchPromise;
}