// DOBERTO VCF — service worker
// 1) Rezon debaz: Chrome/Android mande yon service worker aktif anvan
//    l ka montre "beforeinstallprompt" (enstale kòm app).
// 2) Nou enpòte SDK OneSignal la la a menm pou notifikasyon push yo
//    ka fonksyone san yo pa antre an konfli ak service worker nou an
//    (yo dwe pataje menm "scope").
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDKWorker.js");

const CACHE = 'doberto-vcf-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Pass-through senp — pa gen cache agresif pou pa afekte done fòm yo.
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
