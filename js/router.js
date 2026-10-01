/**
 * Router: maps URL fragments to pages, runs the page transition and keeps browser history in sync.
 */

import { state, emit } from './core/state.js';
import { hasScrollTrigger } from './core/env.js';
import { updatePageMeta } from './i18n/i18n.js';
import { destroyPageLenis, initPageLenis, updateScrollbarWidth } from './page-scroll.js';
import { updateHeaderLogo, updateBackButton } from './header.js';
import { resetHomeHero, bindHeroScroll } from './hero.js';

let hasHistoryEntry = false;

// ─────────────────────────────────────
// FIX Q-03 — ADRESSES PARTAGEABLES ET BOUTON RETOUR
// Avant : une seule URL pour tout le site. Le bouton Retour du
// navigateur (et le geste de retour sur mobile, le plus utilise de
// tous) faisait SORTIR du site, impossible d'envoyer un lien vers un
// projet precis, et un rafraichissement ramenait toujours a l'accueil.
//
// Routage par fragment (#dessins) et non par chemin (/dessins) : sur
// un hebergement statique comme GitHub Pages, un chemin exigerait une
// redirection via 404.html, avec un clignotement a chaque ouverture.
// Le fragment fonctionne partout, sans configuration serveur.
//
// La logique est placee DANS showPage() : les points d'appel existants
// (menu, fleches page suivante, logo, bouton retour) en beneficient
// sans etre modifies.
// ─────────────────────────────────────
const PAGE_SLUGS = {
    'home':            '',
    'projects':        'projets',
    'project-diploma': 'projet-diplome',
    'project-2':       'projet-paterr-suisse',
    'project-3':       'projet-03',
    'drawings':        'dessins',
    'diploma':         'diplome',
    'hobbies':         'hobbies',
};

// A Map, not a plain object: fragments such as #constructor would otherwise
// resolve to members inherited from Object.prototype.
const SLUG_TO_PAGE = new Map(
    Object.entries(PAGE_SLUGS).filter(([, slug]) => slug).map(([id, slug]) => [slug, id])
);

// Lit le fragment courant. Renvoie null si l'adresse ne correspond a rien
// de connu, pour qu'un vieux lien casse retombe proprement sur l'accueil.
export function pageFromHash() {
    let raw;
    try {
        raw = decodeURIComponent((location.hash || '').replace(/^#/, '')).trim();
    } catch {
        // A malformed escape sequence (#%) is just another unknown address.
        return null;
    }
    if (!raw) return 'home';
    if (raw === 'contact') return 'contact';
    return SLUG_TO_PAGE.get(raw) || null;
}

function urlForPage(pageId) {
    const slug = PAGE_SLUGS[pageId];
    // location.search est conserve : sans lui, naviguer depuis /?lang=en
    // ramenait silencieusement le visiteur au francais.
    const base = location.pathname + location.search;
    return slug ? base + '#' + slug : base;
}

// Amene le visiteur au bloc Contact, en bas de la page d'accueil.
// Extrait ici parce que trois chemins y menent : le menu, les fleches
// « page suivante », et desormais l'ouverture directe sur #contact.
function scrollToContact() {
    const contactEl = document.getElementById('home-contact');
    // On another page the scroller would be asked to reach an element it
    // does not contain.
    if (!contactEl || state.page !== 'home') return;
    if (state.scroll) {
        state.scroll.scrollTo(contactEl, { offset: -40, duration: 1.2 });
    } else {
        const homeEl = document.getElementById('page-home');
        if (homeEl) homeEl.scrollTo({ top: contactEl.offsetTop - 40, behavior: 'smooth' });
    }
}

// Contact is the bottom of the home page: bring home in if needed, then
// scroll once its transition has settled. Never touches the history, so
// the caller decides whether this navigation adds an entry.
function revealContact(outerDelay = 0) {
    cancelContactReveal();
    const wasOnHome = state.page === 'home';
    contactTimers.push(setTimeout(() => {
        // The visitor may have gone back while the menu was closing.
        if (pageFromHash() !== 'contact') return;
        if (state.page !== 'home') showPage('home', true, false);
        contactTimers.push(setTimeout(scrollToContact, wasOnHome ? 100 : 750));
    }, outerDelay));
}

// A reveal still pending belongs to a navigation that has been superseded:
// left alone, it would switch page or scroll after the visitor moved on.
let contactTimers = [];

function cancelContactReveal() {
    contactTimers.forEach(clearTimeout);
    contactTimers = [];
}

// Leaving the #contact entry for the plain home address stays on the same
// page, so the only thing left to undo is the scroll.
function scrollHomeToTop() {
    cancelContactReveal();
    if (state.scroll) {
        state.scroll.scrollTo(0);
    } else {
        const homeEl = document.getElementById('page-home');
        if (homeEl) homeEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// One navigation, one history entry: the #contact entry stands for the
// whole move, including the switch to the home page.
export function goToContact(outerDelay) {
    revealContact(outerDelay);
    if (location.hash !== '#contact') {
        history.pushState({ page: 'contact' }, '', location.pathname + location.search + '#contact');
        hasHistoryEntry = true;
    }
}

export function showPage(pageId, animate = true, updateHistory = true) {
    if (pageId === state.page && animate) return;
    cancelContactReveal();

    const outEl = document.getElementById(`page-${state.page}`);
    const inEl  = document.getElementById(`page-${pageId}`);
    if (!inEl) return;

    const previousPage = state.page;
    state.page = pageId;
    updatePageMeta(pageId);
    emit('page-change', { from: previousPage, to: pageId });

    // Synchronise l'adresse. replaceState au tout premier affichage pour ne
    // pas creer une entree d'historique fantome avant meme la 1re navigation.
    if (updateHistory) {
        const url = urlForPage(pageId);
        const method = hasHistoryEntry ? 'pushState' : 'replaceState';
        history[method]({ page: pageId }, '', url);
        hasHistoryEntry = true;
    }

    updateBackButton(pageId);

    // Détruire le Lenis de l'ancienne page
    destroyPageLenis();

    if (!animate || !outEl) {
        if (outEl) {
            outEl.classList.remove('is-active');
            outEl.setAttribute('aria-hidden', 'true');
        }
        inEl.classList.add('is-active');
        inEl.setAttribute('aria-hidden', 'false');
        inEl.scrollTop = 0;
        resetHomeHero(pageId);
        startPageScroll(inEl);
        if (hasScrollTrigger) ScrollTrigger.refresh();
        updateHeaderLogo(pageId);
        
        loadPageImages(inEl);
        updateScrollbarWidth();
        return;
    }

    // Transition GSAP
    gsap.to(outEl, {
        opacity: 0, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
            outEl.classList.remove('is-active');
            outEl.setAttribute('aria-hidden', 'true');
            outEl.style.opacity = '';

            inEl.classList.add('is-active');
            inEl.setAttribute('aria-hidden', 'false');
            inEl.scrollTop = 0;
            resetHomeHero(pageId);

            gsap.fromTo(inEl,
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
            );

            startPageScroll(inEl);
            if (hasScrollTrigger) ScrollTrigger.refresh();
            updateHeaderLogo(pageId);

            loadPageImages(inEl);
            updateScrollbarWidth();
            focusPage(inEl);
        }
    });
}

// The hero follows the scroll position of the home page only.
function startPageScroll(pageEl) {
    initPageLenis(pageEl);
    if (state.page === 'home' && state.scroll) bindHeroScroll(state.scroll);
}

// Pages scroll inside their own box: unless focus sits in the visible one,
// Space and PageDown scroll nothing after a navigation. Not done on the
// first display, where focus must stay at the top of the document.
function focusPage(pageEl) {
    if (!pageEl.hasAttribute('tabindex')) pageEl.setAttribute('tabindex', '-1');
    pageEl.focus({ preventScroll: true });
}

// ─────────────────────────────────────
// FIX P-01c — REVEIL DES IMAGES A L'OUVERTURE D'UNE PAGE
// Les pages inactives sont en content-visibility:hidden : le navigateur
// saute entierement leur rendu, ce qui est precisement l'effet recherche
// (c'est ce qui fait tomber le chargement initial de 47,5 Mo a 1,5 Mo).
// Corollaire : le declenchement de loading="lazy" repose sur le calcul
// d'intersection, qui n'a pas lieu dans un sous-arbre non rendu. On ne
// laisse donc pas au navigateur le soin de rattraper le coup : a
// l'ouverture d'une page, on bascule explicitement SES images en
// chargement immediat. Chaque page ne charge ainsi que ses propres
// images, et seulement quand on l'ouvre.
// ─────────────────────────────────────
function loadPageImages(pageEl) {
    if (!pageEl) return;
    pageEl.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'eager';
        // relance le telechargement si le navigateur l'avait mis de cote
        if (!img.complete || img.naturalWidth === 0) {
            const src = img.getAttribute('src');
            if (src) { img.setAttribute('src', src); }
        }
    });
}

// ─────────────────────────────────────
// SPA — GESTION DES PAGES
// ─────────────────────────────────────
export function resetActivePages() {
    document.querySelectorAll('.page').forEach(p => {
        // Hidden state is set here rather than in the markup: declared
        // statically it would hide focusable content from assistive
        // technology even if this script never ran.
        p.setAttribute('aria-hidden', 'true');
        p.classList.remove('is-active');
    });
}

// ─────────────────────────────────────
// FLÈCHES "SUIVANT" → PAGE SUIVANTE
// ─────────────────────────────────────
export function initPageLinks() {
    document.querySelectorAll('.page-next, .showcase-projects-btn').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const nextPage = link.dataset.next;
            if (nextPage === 'contact') {
                goToContact(300);
            } else if (nextPage) {
                showPage(nextPage);
            }
        });
    });

    document.querySelectorAll('[data-page-link]').forEach(card => {
        card.addEventListener('click', () => showPage(card.dataset.pageLink));
    });
}

export function showInitialPage() {
    // Révéler la page correspondant à l'adresse demandée (accueil par défaut).
    // Un fragment inconnu retombe sur l'accueil plutôt que sur une page blanche.
    const requestedPage = pageFromHash();
    const initialPage = (requestedPage && requestedPage !== 'contact') ? requestedPage : 'home';
    // updateHistory=false pour #contact : showPage remettrait l'adresse a
    // celle de l'accueil et effacerait le fragment, si bien qu'un
    // rafraichissement ne ramenerait plus au bloc contact.
    showPage(initialPage, false, requestedPage !== 'contact');
    if (requestedPage === 'contact') {
        history.replaceState({ page: 'contact' }, '', '#contact');
    }
    // The landing entry now exists whichever branch ran: the next
    // navigation must add an entry, not overwrite this one.
    hasHistoryEntry = true;

    // Fragment inconnu (vieux lien, faute de frappe) : on est retombe sur
    // l'accueil, on nettoie aussi la barre d'adresse pour ne pas laisser
    // une adresse qui a l'air cassee.
    if (requestedPage === null) {
        history.replaceState({ page: 'home' }, '', location.pathname + location.search);
    }

    // Ouverture directe sur #contact : afficher l'accueil puis descendre.
    if (requestedPage === 'contact') {
        setTimeout(scrollToContact, 600);
    }
}

export function initHistory() {
    // Boutons Précédent / Suivant du navigateur, et geste de retour sur mobile.
    // updateHistory=false : on suit l'historique, on n'y ajoute rien.
    window.addEventListener('popstate', () => {
        const targetPage = pageFromHash();
        emit('history-navigation', { from: state.page, to: targetPage });
        if (targetPage === 'contact') {
            revealContact();
            return;
        }
        if ((targetPage || 'home') === 'home' && state.page === 'home') {
            scrollHomeToTop();
            return;
        }
        showPage(targetPage || 'home', true, false);
    });

    // Adresse modifiée à la main dans la barre du navigateur.
    window.addEventListener('hashchange', () => {
        const targetPage = pageFromHash();
        emit('history-navigation', { from: state.page, to: targetPage });
        if (targetPage === null) {
            // adresse inconnue saisie a la main : repli sur l'accueil
            showPage('home', true, false);
            history.replaceState({ page: 'home' }, '', location.pathname + location.search);
            return;
        }
        if (targetPage === 'home' && state.page === 'home') {
            scrollHomeToTop();
        } else if (targetPage !== 'contact' && targetPage !== state.page) {
            showPage(targetPage, true, false);
        }
    });
}
