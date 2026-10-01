/**
 * Long-lived cache for the portfolio.
 *
 * The host (GitHub Pages) forces Cache-Control: max-age=600 on everything
 * and that cannot be changed: ten minutes later a returning visitor would
 * download the whole site again. This worker fixes that, with two
 * deliberately different strategies:
 *
 *   MEDIA (images, plans, fonts, PDF) — stale-while-revalidate.
 *   Served at once from the visitor's disk, then refreshed in the
 *   background: a file replaced under the same name shows up on the
 *   following visit instead of staying frozen forever.
 *
 *   CODE (HTML, CSS, JS) — network first, cache as a fallback.
 *   This avoids the classic service worker trap of a site stuck on an old
 *   version after an update: the cache only serves when offline.
 *
 * Each cache has its own version. Media refresh themselves, so their
 * version only changes if the storage format does: bumping it makes every
 * returning visitor download all media again.
 */

const MEDIA_VERSION = 'v1';
const CODE_VERSION  = 'v1';
const CACHE_MEDIAS = 'even-medias-' + MEDIA_VERSION;
const CACHE_CODE   = 'even-code-' + CODE_VERSION;

const EXT_MEDIAS = /\.(webp|png|jpe?g|svg|woff2?|pdf|ico)$/i;

self.addEventListener('install', () => {
    // No precaching: the first visit must not be slowed down. The cache
    // fills up as the visitor browses.
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const noms = await caches.keys();
        await Promise.all(
            noms.filter(n => n !== CACHE_MEDIAS && n !== CACHE_CODE)
                .map(n => caches.delete(n))
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

    if (EXT_MEDIAS.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event));
    } else {
        event.respondWith(reseauDAbord(req));
    }
});

// Only complete same-origin answers are stored: a partial (206) or error
// response kept in the cache would be served again on every later visit.
function isCacheable(response) {
    return Boolean(response) && response.status === 200 && response.type === 'basic';
}

// Media: answer from the cache when possible and refresh it behind the
// visitor's back. The refresh goes through the HTTP cache, so a file is
// re-requested at most once per freshness window (10 minutes on the host).
async function staleWhileRevalidate(event) {
    const req = event.request;
    const cache = await caches.open(CACHE_MEDIAS);
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

// Code: the network is the reference, the cache only an offline fallback.
async function reseauDAbord(req) {
    const cache = await caches.open(CACHE_CODE);
    try {
        const reponse = await fetch(req);
        if (isCacheable(reponse)) {
            cache.put(req, reponse.clone()).catch(() => {});
        }
        return reponse;
    } catch (e) {
        const enCache = await cache.match(req);
        if (enCache) return enCache;
        throw e;
    }
}
