/* Saturn Pay service worker: sadece site dosyalarını önbelleğe alır.
   API (api.saturnpays.com) ve başka alan adlarına ASLA dokunmaz. */
const V = 'sp-v1';
const CORE = ['offline.html','icon-192.png','icon-512.png','favicon.svg','saturnpay-config.js','i18n.js','pwa.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(()=>{})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(m => m || caches.match('offline.html'))));
    return;
  }
  // diğer dosyalar: önce ağ (güncel kalsın), olmazsa önbellek
  e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })
    .catch(() => caches.match(req)));
});
