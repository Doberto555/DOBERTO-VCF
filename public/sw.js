// DOBERTO VCF — service worker minimal
// Sèl rezon li egziste: Chrome/Android mande yon service worker aktif
// anvan l ka montre "beforeinstallprompt" (enstale kòm app).
const CACHE = 'doberto-vcf-v3-20260825';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  // Pass-through senp — pa gen cache agresif pou pa afekte done fòm yo.
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
