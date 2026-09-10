// DOBERTO VCF — stable PWA service worker: fresh code, safe offline fallback.
const CACHE = 'doberto-vcf-v18-20260910';
const OFFLINE_URL = '/offline.html';
const APP_SHELL = [
  '/',
  '/index.html',
  '/register.html',
  '/list.html',
  '/privacy.html',
  '/terms.html',
  '/mesi.html',
  '/offline.html',
  '/css/style.css',
  '/css/pro-v3.css',
  '/css/brand-v7.css',
  '/css/site-v10.css',
  '/css/site-v11.css',
  '/css/site-v13.css',
  '/css/site-v14.css',
  '/css/site-v15.css',
  '/css/prompt-premium.css',
  '/js/stability.js',
  '/js/home-v10.js',
  '/js/i18n.js',
  '/js/i18n-v12.js',
  '/js/countries.js',
  '/js/country-picker.js',
  '/js/icons.js',
  '/js/app.js',
  '/js/list.js',
  '/js/mesi.js',
  '/js/push.js',
  '/js/install-prompt.js',
  '/js/tour.js',
  '/js/pro-v3.js',
  '/js/google-auth.js',
  '/icons/doberto-vcf-192.png',
  '/icons/doberto-vcf-512.png',
  '/icons/doberto-vcf-maskable-512.png',
  '/icons/doberto-vcf-mark.svg'
];

async function fetchWithTimeout(request, timeoutMs = 10000, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(request, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/push/onesignal/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetchWithTimeout(request, 9000, { cache: 'no-store' });
        if (response && response.ok && !response.redirected) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        const fallbackPath = url.pathname === '/' ? '/index.html' : url.pathname;
        return (await caches.match(request, { ignoreSearch: true })) ||
          (await caches.match(fallbackPath, { ignoreSearch: true })) ||
          (await caches.match(OFFLINE_URL));
      }
    })());
    return;
  }

  const isCodeAsset = url.pathname.endsWith('.css') || url.pathname.endsWith('.js');
  if (isCodeAsset) {
    event.respondWith((async () => {
      try {
        const response = await fetchWithTimeout(request, 9000, { cache: 'no-store' });
        if (response && response.ok && !response.redirected) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return (await caches.match(request, { ignoreSearch: true })) ||
          new Response('', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    const networkPromise = fetchWithTimeout(request, 12000)
      .then(async (response) => {
        if (response && response.ok && !response.redirected) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
      .catch(() => null);

    return cached || (await networkPromise) || new Response('', { status: 503, statusText: 'Offline' });
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
