// Service worker for the installed web app. It keeps the visitor flow opening
// without a connection: pages are network-first with a cached fallback, and
// static assets and still images are cache-first. Video and audio stream from
// the network, because they use range requests the Cache API does not serve.
// Bump CACHE_VERSION when the caching rules or the precached files change.
const CACHE_VERSION = 'v1';
const PAGE_CACHE = `calm-pages-${CACHE_VERSION}`;
const ASSET_CACHE = `calm-assets-${CACHE_VERSION}`;
const PRECACHE_PAGES = ['/', '/nl'];
const PRECACHE_ASSETS = [
  '/manifest.webmanifest',
  '/nl/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/nl-icon-192.png',
  '/icons/nl-icon-512.png',
  '/brand/calm-logo-large.png',
  '/brand/rir-logo-large.svg',
  '/media/experience/nature-meadow-poster.jpg',
];
const CACHE_FIRST_PATH = /^\/(_next\/static|_next\/image|icons|brand)\//;
const CACHE_FIRST_MEDIA = /^\/media\/.+\.(jpe?g|png|webp|avif|svg)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(PAGE_CACHE).then((cache) => cache.addAll(PRECACHE_PAGES)),
      caches.open(ASSET_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS)),
    ]).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  const current = new Set([PAGE_CACHE, ASSET_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('calm-') && !current.has(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match('/'));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    if (url.pathname.startsWith('/admin')) return;
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (CACHE_FIRST_PATH.test(url.pathname) || CACHE_FIRST_MEDIA.test(url.pathname)) {
    event.respondWith(cacheFirstAsset(request));
  }
});
