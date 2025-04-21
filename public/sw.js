const CACHE_NAME = 'famanews-v2';
const ASSETS = [
  '/',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/images/logo.webp',
  '/assets/data/news.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});
