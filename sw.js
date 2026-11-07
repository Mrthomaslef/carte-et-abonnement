const CACHE_NAME = 'pass-zoo-mnhn-v1';
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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
