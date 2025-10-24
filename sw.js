const CACHE_NAME = 'screensavers-v1.0.1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'favicon.ico',
  'icon-192.png',
  'icon-512.png',
  'screensavers/linear-gradient/linear-gradient-component.js',
  'screensavers/conic-gradient/conic-gradient-component.js',
  'screensavers/color-transition/color-transition-component.js',
  'screensavers/solid-color/solid-color-component.js',
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

// Обработка запросов с network-first стратегией для разработки
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Если запрос успешен, обновляем кэш
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // При ошибке сети возвращаем кэшированную версию
        console.log('Service Worker: Загружаю кэшированную версию для:', event.request.url);
        return caches.match(event.request);
      })
  );
});
