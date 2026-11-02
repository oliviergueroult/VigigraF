// VigigraF — fonctionnement hors connexion
const CACHE='vigigraf-v1-59762649';
const FILES=['./','index.html','manifest.webmanifest','lib/jspdf.umd.min.js','lib/svg2pdf.umd.min.js','lib/jspdf.plugin.autotable.min.js','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // page : réseau d'abord (pour recevoir les mises à jour), sinon cache
    if(req.mode==='navigate'){e.respondWith(fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return r;}).catch(()=>caches.match('index.html')));return;}
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));return;
  }
  // polices Google : cache au passage
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(r=>r||fetch(req).then(res=>{c.put(req,res.clone());return res;}))));
  }
});
