// DOBERTO VCF — stable PWA service worker: fresh code first, safe offline fallback.
const CACHE='doberto-vcf-v23-20260910';
const OFFLINE_URL='/offline.html';
const APP_SHELL=[
  '/','/index.html','/register.html','/list.html','/vip.html','/privacy.html','/terms.html','/mesi.html','/offline.html',
  '/css/style.css','/css/pro-v3.css','/css/brand-v7.css','/css/site-v10.css','/css/site-v11.css','/css/site-v13.css','/css/site-v14.css','/css/site-v15.css','/css/site-v16.css','/css/register-v17.css','/css/register-v18.css','/css/vip-v17.css','/css/polish-v18.css','/css/payment-brands-v20.css','/css/prompt-premium.css',
  '/js/stability.js','/js/ui-l10n-v18.js','/js/home-v10.js','/js/i18n.js','/js/i18n-v12.js','/js/countries.js','/js/country-picker.js','/js/icons.js','/js/app.js','/js/list.js','/js/mesi.js','/js/push.js','/js/install-prompt.js','/js/tour.js','/js/pro-v3.js','/js/google-auth.js','/js/vip.js','/js/payment-brands-v20.js',
  '/icons/doberto-vcf-192.png','/icons/doberto-vcf-512.png','/icons/doberto-vcf-maskable-512.png','/icons/doberto-vcf-mark.svg','/icons/natcash.svg'
];
async function fetchTimeout(request,timeout=10000,options={}){const c=new AbortController();const t=setTimeout(()=>c.abort(),timeout);try{return await fetch(request,{...options,signal:c.signal});}finally{clearTimeout(t);}}
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.allSettled(APP_SHELL.map(url=>cache.add(url)));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/push/onesignal/'))return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{try{const r=await fetchTimeout(req,9000,{cache:'no-store'});if(r?.ok&&!r.redirected)(await caches.open(CACHE)).put(req,r.clone()).catch(()=>{});return r;}catch(_){const fallback=url.pathname==='/'?'/index.html':url.pathname;return(await caches.match(req,{ignoreSearch:true}))||(await caches.match(fallback,{ignoreSearch:true}))||(await caches.match(OFFLINE_URL));}})());return;
  }
  const code=/\.(?:css|js)$/.test(url.pathname);
  if(code){event.respondWith((async()=>{try{const r=await fetchTimeout(req,9000,{cache:'no-store'});if(r?.ok&&!r.redirected)(await caches.open(CACHE)).put(req,r.clone()).catch(()=>{});return r;}catch(_){return(await caches.match(req,{ignoreSearch:true}))||new Response('',{status:503,statusText:'Offline'});}})());return;}
  event.respondWith((async()=>{const cached=await caches.match(req,{ignoreSearch:true});const network=fetchTimeout(req,12000).then(async r=>{if(r?.ok&&!r.redirected)(await caches.open(CACHE)).put(req,r.clone()).catch(()=>{});return r;}).catch(()=>null);return cached||(await network)||new Response('',{status:503,statusText:'Offline'});})());
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});