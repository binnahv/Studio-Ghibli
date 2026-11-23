// Estratégias de cache:
//  - arquivos do site e API: rede primeiro (sempre a versão nova), cache se offline
//  - pôsteres (TMDB) e fontes: cache primeiro, pois nunca mudam
// Ao alterar a lista ASSETS, incremente a versão para renovar o cache.
const CACHE_NAME = 'ghibli-explorer-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/api.js',
  './js/config.js',
  './js/favorites.js',
  './js/filters.js',
  './js/format.js',
  './js/modal.js',
  './js/render.js',
  './img/fallback.svg',
  './img/icon-192.png',
  './img/icon-512.png',
];

const CACHE_FIRST_HOSTS = ['image.tmdb.org', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: request.mode === 'navigate' });
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // Respostas "opaque" (imagens sem CORS) têm status 0 mas podem ser guardadas
  if (response.ok || response.type === 'opaque') {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (CACHE_FIRST_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request));
  } else if (url.origin === self.location.origin || url.hostname === 'ghibliapi.vercel.app') {
    event.respondWith(networkFirst(request));
  }
});
