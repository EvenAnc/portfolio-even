/**
 * Portfolio Even ANICET — cache longue duree
 *
 * GitHub Pages impose Cache-Control: max-age=600 sur TOUT, et ce reglage
 * n'est pas modifiable. Passe 10 minutes, un visiteur qui revient
 * retelecharge donc l'integralite du site. Ce fichier corrige ca.
 *
 * Deux strategies, volontairement differentes :
 *
 *   MEDIA (images, plans, fonts, PDF) — stale-while-revalidate.
 *   Served at once from the visitor's disk, then refreshed in the
 *   background: a file replaced under the same name shows up on the
 *   following visit instead of staying frozen forever.
 *
 *   CODE (HTML, CSS, JS) — reseau d'abord, cache en secours.
 *   C'est ce qui evite le piege classique du service worker : un site
 *   fige sur une vieille version apres une mise a jour. Le visiteur a
 *   toujours le code le plus recent ; le cache ne sert que s'il est
 *   hors ligne.
 *
 * Pour forcer le renouvellement de tous les medias : incrementer VERSION.
 */

const VERSION = 'v2';
const CACHE_MEDIAS = 'even-medias-' + VERSION;
const CACHE_CODE   = 'even-code-' + VERSION;

const EXT_MEDIAS = /\.(webp|png|jpe?g|svg|woff2?|pdf|ico)$/i;

self.addEventListener('install', () => {
    // Pas de prechargement ici : on ne veut pas ralentir la premiere visite.
    // Le cache se remplit naturellement, au fil de la navigation.
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

    // On ne touche qu'aux GET de notre propre site.
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

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

    const refresh = fetch(req).then(async response => {
        if (isCacheable(response)) await cache.put(req, response.clone());
        return response;
    });

    if (!cached) return refresh;

    // Keeps the worker alive until the refresh is stored; a failed refresh
    // only means the cached copy stays in use.
    event.waitUntil(refresh.catch(() => {}));
    return cached;
}

// Code : le reseau fait foi, le cache n'est qu'un filet hors ligne.
async function reseauDAbord(req) {
    const cache = await caches.open(CACHE_CODE);
    try {
        const reponse = await fetch(req);
        if (isCacheable(reponse)) {
            cache.put(req, reponse.clone());
        }
        return reponse;
    } catch (e) {
        const enCache = await cache.match(req);
        if (enCache) return enCache;
        throw e;
    }
}
