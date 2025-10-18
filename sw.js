const CACHE_NAME = 'screensavers-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/favicon.ico',
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/dark.css',
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/shoelace-autoloader.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  // Пропускаем кэширование, сразу активируем
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  // Очищаем весь кэш
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Обработка запросов - всегда сеть, без кэша
self.addEventListener('fetch', (event) => {
  // Для всех запросов используем только сеть, игнорируя кэш
  event.respondWith(fetch(event.request));
});
