/**
 * Grupo Pronoeo, S.A. - Service Worker (sw.js)
 * Architecture & Base PWA Development: Jose Carlos Rodas Macal
 * GitHub: https://github.com/jrodas-2021373
 * Habilita capacidades de Progressive Web App (PWA), instalación móvil y carga ultra rápida en carretera.
 */

const CACHE_NAME = 'pronoeo-cache-v2.1';
 
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './pilotos.html',
  './humans.txt',
  './css/styles.css?v=7.5',
  './css/pilotos.css?v=3.6',
  './js/config.js?v=1.1',
  './js/script.js?v=5.9',
  './js/pilotos.js?v=2.2',
  './site.webmanifest',
  './favicon.ico?v=3',
  './img/favicon-32x32.png?v=3',
  './img/favicon-16x16.png?v=3',
  './img/apple-touch-icon.png?v=3',
  './img/pronoeo-isotype.png?v=1',
  './img/pronoeo-logo.png',
  './img/cabezal-6x4.jpg',
  './img/terminal-logistica.jpg'
];

// Instalación: Pre-cachear activos esenciales y omitir espera
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[Pronoeo SW] Pre-cache parcial skip:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de cachés anteriores y reclamación inmediata de clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptor de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Solo interceptar peticiones GET sobre HTTP/HTTPS
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Navegación de páginas (HTML): Estrategia Network-First con fallback a caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Activos estáticos (CSS, JS, imágenes): Cache-First con actualización en segundo plano
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
