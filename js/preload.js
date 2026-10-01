/**
 * Background preload: fetches the plan previews during idle time, before their page is opened.
 */

// ─────────────────────────────────────
// PERF-04 — PRECHARGEMENT DE FOND, PENDANT LA VISITE
// Constat d'Even : en arrivant sur la page des plans, les 4 coupes du bas
// ne se dessinaient qu'apres avoir fait defiler, et ca saccadait pendant.
//
// Un visiteur ne fonce pas sur « Projets » en une seconde : il regarde
// l'accueil, cherche la navigation. On met ce temps a profit pour preparer
// les plans en fond, de sorte qu'ils soient deja prets a l'arrivee.
//
// Ordre de priorite :
//   1. les 6 visibles d'emblee (2 diapos actives du carrousel + 4 coupes)
//   2. les 9 diapos masquees, ensuite et sans se presser
//
// Trois regles pour ne JAMAIS faire saccader la page :
//   - on ne travaille que pendant les temps morts du navigateur
//     (requestIdleCallback), donc jamais en concurrence avec le visiteur ;
//   - on ne DEMARRE pas un rendu si le visiteur vient d'interagir
//     (defilement, molette, doigt) — un rendu lance ne peut plus etre
//     interrompu, il faut donc choisir le bon moment pour le run ;
//   - un seul rendu a la fois en fond, contre deux a la demande.
// ─────────────────────────────────────
const IDLE_AFTER_INTERACTION_MS = 450;   // ms de calme exiges avant de relancer

let lastInteractionAt = 0;

let preloadStarted = false;

function markInteraction() { lastInteractionAt = Date.now(); }

function listenForInteractions() {
    ['wheel', 'touchmove', 'pointerdown', 'keydown'].forEach(ev =>
        window.addEventListener(ev, markInteraction, { passive: true }));
    document.querySelectorAll('.page').forEach(pg =>
        pg.addEventListener('scroll', markInteraction, { passive: true }));
}

function previewsByPriority() {
    const all = Array.from(document.querySelectorAll('.pdf-inline-render'));
    const isPriority = c => c.closest('.stack-item')
        || (c.closest('.bd-slide') && c.closest('.bd-slide').classList.contains('active'));
    return [...all.filter(isPriority), ...all.filter(c => !isPriority(c))];
}

export function startBackgroundPreload() {
    if (preloadStarted) return;
    preloadStarted = true;

    // Background preloading spends data the visitor did not ask for: skip
    // it when they asked to save data or when the connection is slow.
    // Decided once per visit: it is not retried if the connection improves.
    const connection = navigator.connection;
    if (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''))) return;

    listenForInteractions();

    // Les plans sont desormais de simples images : le prechargement se
    // resume a les demander au reseau. Le navigateur les decode ensuite
    // hors du fil principal, ce qui ne peut plus faire saccader la page.
    // The srcset travels with the address so that the preload requests the
    // same candidate the page will display, not a second file.
    const queue = previewsByPriority()
        .map(el => ({ src: el.getAttribute('src'), srcset: el.getAttribute('srcset') }))
        .filter(entry => entry.src);
    let i = 0;

    const schedule = (delay) => {
        const run = () => step();
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(run, { timeout: 4000 });
        } else {
            setTimeout(run, delay || 250);
        }
    };

    const step = () => {
        if (i >= queue.length) return;                       // tout est en cache
        if (document.visibilityState !== 'visible') return schedule(2000);
        if (Date.now() - lastInteractionAt < IDLE_AFTER_INTERACTION_MS) return schedule(500);

        const entry = queue[i++];
        const img = new Image();
        img.decoding = 'async';
        // on enchaine des que l'image est en cache, succes ou non
        img.onload = img.onerror = () => schedule(80);
        if (entry.srcset) img.srcset = entry.srcset;
        img.src = entry.src;
    };

    schedule();
}
