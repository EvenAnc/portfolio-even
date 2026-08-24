/**
 * Portfolio Even ANICET — cache longue duree
 *
 * GitHub Pages impose Cache-Control: max-age=600 sur TOUT, et ce reglage
 * n'est pas modifiable. Passe 10 minutes, un visiteur qui revient
 * retelecharge donc l'integralite du site. Ce fichier corrige ca.
 *
 * Deux strategies, volontairement differentes :
 *
 *   MEDIAS (images, plans, polices, PDF) — cache d'abord.
 *   Ils ne changent quasiment jamais. Servis instantanement depuis le
 *   disque du visiteur, sans aucun aller-retour reseau.
 *
 *   CODE (HTML, CSS, JS) — reseau d'abord, cache en secours.
 *   C'est ce qui evite le piege classique du service worker : un site
 *   fige sur une vieille version apres une mise a jour. Le visiteur a
 *   toujours le code le plus recent ; le cache ne sert que s'il est
 *   hors ligne.
 *
 * Pour forcer le renouvellement de tous les medias : incrementer VERSION.
 */

const VERSION = 'v1';
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
        event.respondWith(cacheDAbord(req));
    } else {
        event.respondWith(reseauDAbord(req));
    }
});

// Medias : on sert le cache immediatement s'il existe.
async function cacheDAbord(req) {
    const cache = await caches.open(CACHE_MEDIAS);
    const enCache = await cache.match(req);
    if (enCache) return enCache;
    try {
        const reponse = await fetch(req);
        // On ne met en cache que les reponses completes et valides.
        if (reponse && reponse.status === 200 && reponse.type === 'basic') {
            cache.put(req, reponse.clone());
        }
        return reponse;
    } catch (e) {
        return enCache || Response.error();
    }
}

// Code : le reseau fait foi, le cache n'est qu'un filet hors ligne.
async function reseauDAbord(req) {
    const cache = await caches.open(CACHE_CODE);
    try {
        const reponse = await fetch(req);
        if (reponse && reponse.status === 200 && reponse.type === 'basic') {
            cache.put(req, reponse.clone());
        }
        return reponse;
    } catch (e) {
        const enCache = await cache.match(req);
        if (enCache) return enCache;
        throw e;
    }
}
