'use strict';

const CACHE_NAME = 'catapultapay-v4.5.8'; // bump fuerza reinstalación

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/improvements.js',
  '/i18n.js',
  '/imagecata.png',
  '/favicon.svg',
];

// ── INSTALL: cachear individualmente — un fallo no rompe todo ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        PRECACHE_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] No se pudo cachear:', url, err))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpiar cachés viejos ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== 'catapultapay-external-v1')
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo mismo origen — fuera: solo cachear fuentes gstatic
  if (url.origin !== location.origin) {
    if (url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        cacheFirst(new Request(request, { mode: 'no-cors' }), 'catapultapay-external-v1')
      );
    }
    // Cualquier otro externo: el browser lo maneja solo
    return;
  }

  // Video: nunca interceptar (demasiado pesado y tiene range requests)
  if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.webm')) {
    return;
  }

  // HTML → Network first (siempre contenido fresco)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // CSS, JS, imágenes → Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

/* ─────────────────────────────────────────
   Estrategias de caché
───────────────────────────────────────── */

// Network first: intenta red → si falla usa caché → si no hay caché retorna 503
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Sin conexión', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache first: caché → red → fallback 404
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response) {
      const cache = await caches.open(cacheName || CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('No encontrado', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale while revalidate: sirve caché inmediato + actualiza en background
// NUNCA retorna null — siempre un Response válido
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Lanzar fetch en background sin await (no bloqueamos)
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  // Si tenemos caché: servir inmediato, actualizar en background
  if (cached) {
    fetchPromise.catch(() => {}); // evitar unhandled rejection
    return cached;
  }

  // Sin caché: esperar la red
  const fresh = await fetchPromise;
  if (fresh) return fresh;

  // Sin caché ni red: respuesta de error controlada (nunca null)
  return new Response('No disponible', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}