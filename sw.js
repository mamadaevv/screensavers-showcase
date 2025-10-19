const CACHE_NAME = 'screensavers-v1.0.1';
const urlsToCache = [
  '/screensavers-showcase/',
  '/screensavers-showcase/index.html',
  '/screensavers-showcase/style.css',
  '/screensavers-showcase/script.js',
  '/screensavers-showcase/manifest.json',
  '/screensavers-showcase/favicon.ico',
  '/screensavers-showcase/icon-192.png',
  '/screensavers-showcase/icon-512.png',
  '/screensavers-showcase/screensavers/linear-gradient/linear-gradient-component.js',
  '/screensavers-showcase/screensavers/conic-gradient/conic-gradient-component.js',
  '/screensavers-showcase/screensavers/color-transition/color-transition-component.js',
  '/screensavers-showcase/screensavers/solid-color/solid-color-component.js',
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/dark.css',
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/shoelace-autoloader.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Обработка запросов с кэшем
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированную версию или загружаем из сети
        return response || fetch(event.request);
      })
  );
});
