/**
 * Service worker: long-lived caching on a host that caps Cache-Control at
 * ten minutes. Three strategies, one per kind of file:
 *
 *   Media (images, plans, fonts, PDF): stale-while-revalidate. Served at
 *   once from the cache, then refreshed in the background, so a file
 *   replaced under the same name shows up on the following visit.
 *
 *   Vendored libraries: cache first. Their path carries the version, so
 *   the content behind a given address never changes.
 *
 *   Site code (HTML, CSS, JS): network first, bypassing the HTTP cache so
 *   that ES modules are never served in mixed versions. The cache only
 *   answers when offline.
 *
 * Caches that are not listed below are deleted on activation. Renaming the
 * media cache makes every returning visitor download all media again.
 */

const MEDIA_CACHE  = 'portfolio-media-v2';
const VENDOR_CACHE = 'portfolio-vendor-v2';
const CODE_CACHE   = 'portfolio-code-v2';
const CURRENT_CACHES = [MEDIA_CACHE, VENDOR_CACHE, CODE_CACHE];

const MEDIA_EXTENSIONS = /\.(webp|png|jpe?g|svg|woff2?|pdf|ico)$/i;
const VENDOR_PATH = /\/vendor\//;

self.addEventListener('install', () => {
    // No precaching: the first visit must not be slowed down. The caches
    // fill up as the visitor browses.
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(
            names.filter(name => !CURRENT_CACHES.includes(name))
                .map(name => caches.delete(name))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const req = event.request;

    // Only same-origin GET requests are handled.
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    // A range request expects a partial answer; the cache only holds whole
    // files and would answer with one. The browser handles these itself.
    if (req.headers.has('range')) return;

    if (VENDOR_PATH.test(url.pathname)) {
        event.respondWith(cacheFirst(req));
    } else if (MEDIA_EXTENSIONS.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event));
    } else {
        event.respondWith(networkFirst(req));
    }
});

// Only complete same-origin answers are stored: a partial (206) or error
// response kept in the cache would be served again on every later visit.
function isCacheable(response) {
    return Boolean(response) && response.status === 200 && response.type === 'basic';
}

// Media: answer from the cache when possible and refresh it behind the
// visitor's back. The refresh goes through the HTTP cache, so a file is
// re-requested at most once per freshness window.
async function staleWhileRevalidate(event) {
    const req = event.request;
    const cache = await caches.open(MEDIA_CACHE);
    const cached = await cache.match(req);

    const network = fetch(req);

    // Storing runs beside the answer, never in front of it: the page gets
    // the response as it streams, and a failed write (quota, offline) costs
    // nothing but the cached copy. The clone is taken before the page
    // starts reading the body, since this handler is registered first.
    const stored = network
        .then(response => (isCacheable(response) ? cache.put(req, response.clone()) : undefined))
        .catch(() => {});
    event.waitUntil(stored);

    return cached || network;
}

// Vendored libraries: the cached copy is final, the network is only asked once.
async function cacheFirst(req) {
    const cache = await caches.open(VENDOR_CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;

    const response = await fetch(req);
    if (isCacheable(response)) {
        cache.put(req, response.clone()).catch(() => {});
    }
    return response;
}

// Code: the network is the reference, the cache only an offline fallback.
// 'no-cache' revalidates with the server instead of trusting the HTTP cache.
async function networkFirst(req) {
    const cache = await caches.open(CODE_CACHE);
    try {
        const response = await fetch(req, { cache: 'no-cache' });
        if (isCacheable(response)) {
            cache.put(req, response.clone()).catch(() => {});
        }
        return response;
    } catch (error) {
        const cached = await cache.match(req);
        if (cached) return cached;
        throw error;
    }
}
