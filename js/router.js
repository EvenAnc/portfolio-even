/**
 * Router: maps URL fragments to pages, runs the page transition and keeps
 * browser history in sync.
 *
 * Routing uses fragments (#dessins) rather than paths (/dessins): on a
 * static host a path would need a redirect through 404.html, with a flash
 * on every direct opening.
 */

import { state, emit } from './core/state.js';
import { hasScrollTrigger } from './core/env.js';
import { updatePageMeta } from './i18n/i18n.js';
import { destroyPageScroll, createPageScroll, updateScrollbarWidth } from './page-scroll.js';
import { updateHeaderLogo, updateBackButton } from './header.js';
import { resetHero, bindHeroScroll } from './hero.js';

// False until the landing entry is written: the first display replaces the
// current history entry instead of adding one.
let hasHistoryEntry = false;

// Page id -> URL fragment. The fragments are public addresses.
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

/**
 * Reads the current fragment.
 * @returns {string|null} a page id, 'contact', or null for an unknown address
 */
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
    // The query string carries the language (?lang=en) and must survive
    // navigation.
    const base = location.pathname + location.search;
    return slug ? base + '#' + slug : base;
}

// Contact is not a page: it is the last block of the home page.
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

// Brings home in if needed, then scrolls once its transition has settled.
// Never touches the history, so the caller decides whether this navigation
// adds an entry.
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

/**
 * Navigates to the contact block. One navigation, one history entry: the
 * #contact entry stands for the whole move, including the switch to the
 * home page.
 * @param {number} [outerDelay] milliseconds to wait before moving
 */
export function goToContact(outerDelay) {
    revealContact(outerDelay);
    if (location.hash !== '#contact') {
        history.pushState({ page: 'contact' }, '', location.pathname + location.search + '#contact');
        hasHistoryEntry = true;
    }
}

/**
 * Displays a page.
 * @param {string} pageId
 * @param {boolean} [animate] false swaps the pages at once
 * @param {boolean} [updateHistory] false when following the history rather than adding to it
 */
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

    if (updateHistory) {
        const url = urlForPage(pageId);
        const method = hasHistoryEntry ? 'pushState' : 'replaceState';
        history[method]({ page: pageId }, '', url);
        hasHistoryEntry = true;
    }

    updateBackButton(pageId);

    // The scroll instance belongs to the page that is leaving.
    destroyPageScroll();

    if (!animate || !outEl) {
        if (outEl) {
            outEl.classList.remove('is-active');
            outEl.setAttribute('aria-hidden', 'true');
        }
        inEl.classList.add('is-active');
        inEl.setAttribute('aria-hidden', 'false');
        inEl.scrollTop = 0;
        resetHero(pageId);
        startPageScroll(inEl);
        if (hasScrollTrigger) ScrollTrigger.refresh();
        updateHeaderLogo(pageId);

        loadPageImages(inEl);
        updateScrollbarWidth();
        return;
    }

    gsap.to(outEl, {
        opacity: 0, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
            outEl.classList.remove('is-active');
            outEl.setAttribute('aria-hidden', 'true');
            outEl.style.opacity = '';

            inEl.classList.add('is-active');
            inEl.setAttribute('aria-hidden', 'false');
            inEl.scrollTop = 0;
            resetHero(pageId);

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
    createPageScroll(pageEl);
    if (state.page === 'home' && state.scroll) bindHeroScroll(state.scroll);
}

// Pages scroll inside their own box: unless focus sits in the visible one,
// Space and PageDown scroll nothing after a navigation. Not done on the
// first display, where focus must stay at the top of the document.
function focusPage(pageEl) {
    if (!pageEl.hasAttribute('tabindex')) pageEl.setAttribute('tabindex', '-1');
    pageEl.focus({ preventScroll: true });
}

// Inactive pages are in content-visibility: hidden, which skips their
// rendering and keeps the first load light. Lazy loading relies on an
// intersection that is never computed in a skipped subtree, so the images
// of a page are switched to eager loading when that page opens.
function loadPageImages(pageEl) {
    if (!pageEl) return;
    pageEl.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'eager';
        // Setting src again restarts a download the browser had deferred.
        if (!img.complete || img.naturalWidth === 0) {
            const src = img.getAttribute('src');
            if (src) { img.setAttribute('src', src); }
        }
    });
}

/** Hides every page; the router then reveals the one the address asks for. */
export function resetActivePages() {
    document.querySelectorAll('.page').forEach(p => {
        // Hidden state is set here rather than in the markup: declared
        // statically it would hide focusable content from assistive
        // technology even if this script never ran.
        p.setAttribute('aria-hidden', 'true');
        p.classList.remove('is-active');
    });
}

/** Wires the "next page" arrows, the home shortcut and the project cards. */
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

/** Displays the page the address asks for; an unknown fragment falls back to home. */
export function showInitialPage() {
    const requestedPage = pageFromHash();
    const initialPage = (requestedPage && requestedPage !== 'contact') ? requestedPage : 'home';
    // For #contact the history is left alone: showPage would write the home
    // address and drop the fragment, so a reload would no longer come back
    // to the contact block.
    showPage(initialPage, false, requestedPage !== 'contact');
    if (requestedPage === 'contact') {
        history.replaceState({ page: 'contact' }, '', '#contact');
    }
    // The landing entry now exists whichever branch ran: the next
    // navigation must add an entry, not overwrite this one.
    hasHistoryEntry = true;

    // An unknown fragment is also removed from the address bar.
    if (requestedPage === null) {
        history.replaceState({ page: 'home' }, '', location.pathname + location.search);
    }

    if (requestedPage === 'contact') {
        setTimeout(scrollToContact, 600);
    }
}

/** Follows the browser history: Back and Forward, and fragments typed by hand. */
export function initHistory() {
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

    window.addEventListener('hashchange', () => {
        const targetPage = pageFromHash();
        emit('history-navigation', { from: state.page, to: targetPage });
        if (targetPage === null) {
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
