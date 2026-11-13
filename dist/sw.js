// Aldermoor : permet de rejouer sans connexion (le MJ IA, lui, a besoin d'internet).
// Réseau d'abord : on a toujours la dernière version quand on est connecté ; sinon, la copie gardée.
const CACHE='aldermoor-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const r=e.request;
 if(r.method!=='GET'||r.url.includes('api.anthropic.com')||r.url.includes('@anthropic-ai'))return;
 e.respondWith(fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(k=>k.put(r,c));}return res;})
  .catch(()=>caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(m=>m||Response.error())));});
