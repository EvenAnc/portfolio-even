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
//     interrompu, il faut donc choisir le bon moment pour le lancer ;
//   - un seul rendu a la fois en fond, contre deux a la demande.
// ─────────────────────────────────────
const REPOS_APRES_INTERACTION = 450;   // ms de calme exiges avant de relancer

let _dernierGeste = 0;

let _prechargeDemarree = false;

function marquerGeste() { _dernierGeste = Date.now(); }

function ecouterGestes() {
    ['wheel', 'touchmove', 'pointerdown', 'keydown'].forEach(ev =>
        window.addEventListener(ev, marquerGeste, { passive: true }));
    document.querySelectorAll('.page').forEach(pg =>
        pg.addEventListener('scroll', marquerGeste, { passive: true }));
}

function canvasParPriorite() {
    const tous = Array.from(document.querySelectorAll('.pdf-inline-render'));
    const prioritaire = c => c.closest('.stack-item')
        || (c.closest('.bd-slide') && c.closest('.bd-slide').classList.contains('active'));
    return [...tous.filter(prioritaire), ...tous.filter(c => !prioritaire(c))];
}

export function demarrerPrechargeFond() {
    if (_prechargeDemarree) return;
    _prechargeDemarree = true;

    // Background preloading spends data the visitor did not ask for: skip
    // it when they asked to save data or when the connection is slow.
    // Decided once per visit: it is not retried if the connection improves.
    const connection = navigator.connection;
    if (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''))) return;

    ecouterGestes();

    // Les plans sont desormais de simples images : le prechargement se
    // resume a les demander au reseau. Le navigateur les decode ensuite
    // hors du fil principal, ce qui ne peut plus faire saccader la page.
    // The srcset travels with the address so that the preload requests the
    // same candidate the page will display, not a second file.
    const liste = canvasParPriorite()
        .map(el => ({ src: el.getAttribute('src'), srcset: el.getAttribute('srcset') }))
        .filter(entry => entry.src);
    let i = 0;

    const planifier = (delai) => {
        const lancer = () => etape();
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(lancer, { timeout: 4000 });
        } else {
            setTimeout(lancer, delai || 250);
        }
    };

    const etape = () => {
        if (i >= liste.length) return;                       // tout est en cache
        if (document.visibilityState !== 'visible') return planifier(2000);
        if (Date.now() - _dernierGeste < REPOS_APRES_INTERACTION) return planifier(500);

        const entry = liste[i++];
        const img = new Image();
        img.decoding = 'async';
        // on enchaine des que l'image est en cache, succes ou non
        img.onload = img.onerror = () => planifier(80);
        if (entry.srcset) img.srcset = entry.srcset;
        img.src = entry.src;
    };

    planifier();
}
