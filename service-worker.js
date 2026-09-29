// Ao mudar qualquer arquivo da lista, incremente a versão para renovar o cache
const CACHE_NAME = 'ghibli-cache-v3';
const ASSETS = [
  './', './index.html', './manifest.json',
  './css/style.css',
  './js/app.js', './js/config.js', './js/filmService.js', './js/ui.js', './js/modal.js', './js/search.js',
  './img/fallback.svg', './img/icon-192.png', './img/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // API e arquivos do próprio site: rede primeiro (sempre a versão mais nova), cache só offline
  if (url.hostname === 'ghibliapi.vercel.app' || url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // CDNs (Bootstrap, ícones): cache primeiro
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
      if (res.ok && url.hostname === 'cdn.jsdelivr.net') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
      }
      return res;
    }))
  );
});
