// Vegas Roulette Casino Game Service Worker
const CACHE_NAME = 'vegas-roulette-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/icon.svg',
  '/main/roulette.html',
  '/main/css/style.css',
  '/main/css/startup.css',
  '/main/assets/705363.png',
  '/main/assets/Vegas.png',
  '/main/assets/roulettewheel.png',
  '/main/assets/coin-and-money-place-bets.mp3',
  '/main/assets/paper-shuffle-new-game.mp3',
  '/main/assets/poker-chips-clear-bets.mp3',
  '/main/chip images/casino-chip-1.png',
  '/main/chip images/casino-chip-5.png',
  '/main/chip images/casino-chip-10.png',
  '/main/chip images/casino-chip-25.png',
  '/main/chip images/casino-chip-50.png',
  '/main/chip images/casino-chip-100.png',
  '/main/chip images/casino-chip-500.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets could not be cached immediately:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Exclude API requests from cache
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
