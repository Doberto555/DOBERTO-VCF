// DOBERTO VCF — retired root cache worker.
// Registration/login must always use the live network version.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  try{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('doberto-vcf-')).map(k=>caches.delete(k)));
  }catch(_){}
  try{await self.registration.unregister()}catch(_){}
  try{
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    clients.forEach(client=>client.postMessage({type:'DOBERTO_ROOT_SW_RETIRED'}));
  }catch(_){}
})()));
// Intentionally no fetch handler: browser requests go straight to the network.
