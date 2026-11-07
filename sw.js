const CACHE_NAME = 'pass-zoo-mnhn-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon.svg',
  './assets/qr-pass-1.png',
  './assets/qr-pass-2.png',
  './assets/card-pass-1-mobile.png',
  './assets/card-pass-2-mobile.png',
  './assets/card-pass-1-eticket.png',
  './assets/card-pass-2-eticket.png',
  './tickets/Pass-SOLO-1-ETICKET.pdf',
  './tickets/Pass-SOLO-1-MOBILE.pdf',
  './tickets/Pass-SOLO-2-ETICKET.pdf',
  './tickets/Pass-SOLO-2-MOBILE.pdf',
  './tickets/Recapitulatif-Dossier-1358995.pdf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first with offline cache fallback so updates appear immediately when online
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
