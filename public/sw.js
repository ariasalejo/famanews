const CACHE_NAME = 'famanews-v2';
const DYNAMIC_CACHE = 'famanews-dynamic-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/news-loader.js',
  '/assets/js/theme-switcher.js',
  '/assets/images/logo.webp',
  '/assets/icons/favicon.ico',
  '/assets/fonts/roboto.woff2',
  '/offline.html'  // Página de respaldo offline
];

// Instalación: Cachear recursos esenciales
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando recursos críticos');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Estrategia de Cache: Stale-While-Revalidate
self.addEventListener('fetch', (e) => {
  const request = e.request;
  
  // Ignorar solicitudes no GET y de terceros
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    caches.match(request).then(cachedResponse => {
      const networkFetch = fetch(request).then(response => {
        // Actualizar cache con nueva respuesta
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, response.clone());
        });
        return response;
      });

      // Devolver respuesta cacheada o esperar red
      return cachedResponse || networkFetch.catch(() => {
        // Fallback para imágenes
        if (request.destination === 'image') {
          return caches.match('/assets/images/placeholder.webp');
        }
        return caches.match('/offline.html');
      });
    })
  );
});

// Limpiar caches antiguos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME && key !== DYNAMICIC_CACHE)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
);
