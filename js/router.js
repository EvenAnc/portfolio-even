/**
 * Router: maps URL fragments to pages, runs the page transition and keeps
 * browser history in sync.
 *
 * Routing uses fragments (#dessins) rather than paths (/dessins): on a
 * static host a path would need a redirect through 404.html, with a flash
 * on every direct opening.
 */

import { state, emit, EVENTS } from './core/state.js';
import { hasScrollTrigger, prefersReducedMotion } from './core/env.js';
import { updatePageMeta } from './i18n/i18n.js';
import { destroyPageScroll, createPageScroll, updateScrollbarWidth } from './page-scroll.js';
import { updateHeaderLogo, updateBackButton } from './header.js';
import { resetHero, bindHeroScroll } from './hero.js';

// Page id -> URL fragment. The fragments are public addresses.
const PAGE_SLUGS = {
    'home': '',
    'projects': 'projets',
    'project-diploma': 'projet-diplome',
    'project-2': 'projet-paterr-suisse',
    'project-3': 'projet-03',
    'drawings': 'dessins',
    'diploma': 'diplome',
    'hobbies': 'hobbies',
};

// A Map, not a plain object: fragments such as #constructor would otherwise
// resolve to members inherited from Object.prototype.
const SLUG_TO_PAGE = new Map(
    Object.entries(PAGE_SLUGS).filter(([, slug]) => slug).map(([id, slug]) => [slug, id]),
);

const FADE_OUT_S = 0.35;
const FADE_IN_S = 0.55;
const FADE_IN_RISE_PX = 22;

// The contact block stops a little below the top edge of the page.
const CONTACT_SCROLL_MARGIN_PX = 40;
const CONTACT_SCROLL_DURATION_S = 1.2;
// Wait before scrolling to the contact block: when already on the home
// page, after a page transition, and on a direct opening.
const CONTACT_SCROLL_DELAY_MS = 100;
const CONTACT_SCROLL_DELAY_AFTER_TRANSITION_MS = 750;
const CONTACT_SCROLL_DELAY_ON_LOAD_MS = 600;
// Wait between a click on a "next page" arrow and the move to contact.
const CONTACT_LINK_DELAY_MS = 300;

// False until the landing entry is written: the first display replaces the
// current history entry instead of adding one.
let hasHistoryEntry = false;

// A reveal still pending belongs to a navigation that has been superseded:
// left alone, it would switch page or scroll after the visitor moved on.
let contactTimers = [];

// Fade of the page that is leaving, while it runs.
let fadeOut = null;

// Address the display was last synchronised with by a history event. Reset
// whenever this module writes an entry itself.
let syncedUrl = null;

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

// The query string carries the language (?lang=en) and must survive
// navigation.
function baseUrl() {
    return location.pathname + location.search;
}

function urlForPage(pageId) {
    const slug = PAGE_SLUGS[pageId];
    return slug ? `${baseUrl()}#${slug}` : baseUrl();
}

// For the pages that scroll natively: no glide under reduced motion.
function nativeScrollBehavior() {
    return prefersReducedMotion() ? 'auto' : 'smooth';
}

// Contact is not a page: it is the last block of the home page.
function scrollToContact() {
    const contactEl = document.getElementById('home-contact');
    // On another page the scroller would be asked to reach an element it
    // does not contain.
    if (!contactEl || state.page !== 'home') return;
    if (state.scroll) {
        state.scroll.scrollTo(contactEl, {
            offset: -CONTACT_SCROLL_MARGIN_PX,
            duration: CONTACT_SCROLL_DURATION_S,
        });
    } else {
        const homeEl = document.getElementById('page-home');
        if (homeEl) homeEl.scrollTo({ top: contactEl.offsetTop - CONTACT_SCROLL_MARGIN_PX, behavior: nativeScrollBehavior() });
    }
}

function cancelContactReveal() {
    contactTimers.forEach(clearTimeout);
    contactTimers = [];
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
        if (state.page !== 'home') showPage('home', { updateHistory: false });
        const scrollDelay = wasOnHome ? CONTACT_SCROLL_DELAY_MS : CONTACT_SCROLL_DELAY_AFTER_TRANSITION_MS;
        contactTimers.push(setTimeout(scrollToContact, scrollDelay));
    }, outerDelay));
}

// Leaving the #contact entry for the plain home address stays on the same
// page, so the only thing left to undo is the scroll.
function scrollHomeToTop() {
    cancelContactReveal();
    if (state.scroll) {
        state.scroll.scrollTo(0);
    } else {
        const homeEl = document.getElementById('page-home');
        if (homeEl) homeEl.scrollTo({ top: 0, behavior: nativeScrollBehavior() });
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
        history.pushState({ page: 'contact' }, '', `${baseUrl()}#contact`);
        hasHistoryEntry = true;
        syncedUrl = null;
    }
}

// A navigation asked during the fade supersedes it: the fade stops and its
// completion never runs, so only the latest navigation activates a page.
function cancelFadeOut() {
    if (!fadeOut) return false;
    fadeOut.kill();
    fadeOut = null;
    return true;
}

function recordHistoryEntry(pageId) {
    const method = hasHistoryEntry ? 'pushState' : 'replaceState';
    history[method]({ page: pageId }, '', urlForPage(pageId));
    hasHistoryEntry = true;
    syncedUrl = null;
}

function swapActivePage(outEl, inEl, pageId) {
    if (outEl) {
        outEl.classList.remove('is-active');
        outEl.setAttribute('aria-hidden', 'true');
    }
    inEl.classList.add('is-active');
    inEl.setAttribute('aria-hidden', 'false');
    inEl.scrollTop = 0;
    resetHero(pageId);
}

// The hero follows the scroll position of the home page only.
function startPageScroll(pageEl, pageId) {
    createPageScroll(pageEl);
    if (pageId === 'home') bindHeroScroll(pageEl, state.scroll);
}

/**
 * Rebuilds the scroll of the page on display, after the motion preference
 * changed: smooth scrolling is only there for visitors who accept motion.
 */
export function refreshPageScroll() {
    const pageEl = document.querySelector('.page.is-active');
    if (!pageEl) return;
    destroyPageScroll();
    startPageScroll(pageEl, state.page);
}

// Inactive pages are in content-visibility: hidden, which skips their
// rendering and keeps the first load light. Lazy loading relies on an
// intersection that is never computed in a skipped subtree, so the images
// of a page are switched to eager loading when that page opens.
function loadPageImages(pageEl) {
    pageEl.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'eager';
        // Setting src again restarts a download the browser had deferred.
        if (!img.complete || img.naturalWidth === 0) {
            const src = img.getAttribute('src');
            if (src) img.setAttribute('src', src);
        }
    });
}

function settlePage(inEl, pageId) {
    startPageScroll(inEl, pageId);
    if (hasScrollTrigger) ScrollTrigger.refresh();
    updateHeaderLogo(pageId);
    loadPageImages(inEl);
    updateScrollbarWidth();
}

// Pages scroll inside their own box: unless focus sits in the visible one,
// Space and PageDown scroll nothing after a navigation. Not done on the
// first display, where focus must stay at the top of the document.
function focusPage(pageEl) {
    if (!pageEl.hasAttribute('tabindex')) pageEl.setAttribute('tabindex', '-1');
    pageEl.focus({ preventScroll: true });
}

function fadeToPage(outEl, inEl, pageId) {
    fadeOut = gsap.to(outEl, {
        opacity: 0,
        duration: FADE_OUT_S,
        ease: 'power2.in',
        onComplete: () => {
            fadeOut = null;
            outEl.style.opacity = '';
            swapActivePage(outEl, inEl, pageId);

            gsap.fromTo(inEl,
                { opacity: 0, y: FADE_IN_RISE_PX },
                { opacity: 1, y: 0, duration: FADE_IN_S, ease: 'power3.out' },
            );

            settlePage(inEl, pageId);
            focusPage(inEl);
            emit(EVENTS.PAGE_SHOWN, { page: pageId });
        },
    });
}

/**
 * Displays a page.
 * @param {string} pageId
 * @param {object} [options]
 * @param {boolean} [options.animate] false swaps the pages at once
 * @param {boolean} [options.updateHistory] false when following the history rather than adding to it
 */
export function showPage(pageId, { animate = true, updateHistory = true } = {}) {
    if (pageId === state.page && animate) return;
    cancelContactReveal();

    const inEl = document.getElementById(`page-${pageId}`);
    if (!inEl) return;
    // The page on display: during a fade it is still the one that was
    // leaving, not the one state.page already names.
    const outEl = document.querySelector('.page.is-active');
    const wasFading = cancelFadeOut();

    const previousPage = state.page;
    state.page = pageId;
    updatePageMeta(pageId);
    emit(EVENTS.PAGE_CHANGE, { from: previousPage, to: pageId });

    if (updateHistory) recordHistoryEntry(pageId);

    updateBackButton(pageId);

    // The scroll instance belongs to the page that is leaving.
    destroyPageScroll();

    const isNavigation = animate && Boolean(outEl);
    if (isNavigation && !prefersReducedMotion()) {
        fadeToPage(outEl, inEl, pageId);
        return;
    }

    // First display, or a navigation under reduced motion: no fade.
    if (wasFading && outEl) outEl.style.opacity = '';
    swapActivePage(outEl, inEl, pageId);
    settlePage(inEl, pageId);
    if (isNavigation) focusPage(inEl);
    emit(EVENTS.PAGE_SHOWN, { page: pageId });
}

/** Hides every page; the router then reveals the one the address asks for. */
export function resetActivePages() {
    document.querySelectorAll('.page').forEach(page => {
        // Hidden state is set here rather than in the markup: declared
        // statically it would hide focusable content from assistive
        // technology even if this script never ran.
        page.setAttribute('aria-hidden', 'true');
        page.classList.remove('is-active');
    });
}

/** Wires the "next page" arrows, the home shortcut and the project cards. */
export function initPageLinks() {
    document.querySelectorAll('.page-next, .projects-shortcut, .patchwork-item[data-target]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetPage = link.dataset.target;
            if (targetPage === 'contact') {
                goToContact(CONTACT_LINK_DELAY_MS);
            } else if (targetPage) {
                showPage(targetPage);
            }
        });
    });
}

/** Displays the page the address asks for; an unknown fragment falls back to home. */
export function showInitialPage() {
    const requestedPage = pageFromHash();
    const initialPage = (requestedPage && requestedPage !== 'contact') ? requestedPage : 'home';
    // For #contact the history is left alone: showPage would write the home
    // address and drop the fragment, so a reload would no longer come back
    // to the contact block.
    showPage(initialPage, { animate: false, updateHistory: requestedPage !== 'contact' });
    if (requestedPage === 'contact') {
        history.replaceState({ page: 'contact' }, '', '#contact');
    }
    // The landing entry now exists whichever branch ran: the next
    // navigation must add an entry, not overwrite this one.
    hasHistoryEntry = true;

    // An unknown fragment is also removed from the address bar.
    if (requestedPage === null) {
        history.replaceState({ page: 'home' }, '', baseUrl());
    }

    if (requestedPage === 'contact') {
        setTimeout(scrollToContact, CONTACT_SCROLL_DELAY_ON_LOAD_MS);
    }
}

// Brings the display in line with the address, without adding an entry.
function showAddress(targetPage) {
    // An unknown fragment shows home and leaves the address bar.
    const pageId = targetPage || 'home';
    if (targetPage === 'contact') {
        revealContact();
    } else if (pageId === 'home' && state.page === 'home') {
        scrollHomeToTop();
    } else {
        showPage(pageId, { updateHistory: false });
    }
    if (targetPage === null) history.replaceState({ page: 'home' }, '', baseUrl());
}

// Back, Forward and a fragment typed by hand all end here. A fragment
// change fires popstate and then hashchange for the same address: the
// second event finds the address already synchronised and does nothing.
function syncWithAddress() {
    if (location.href === syncedUrl) return;
    const targetPage = pageFromHash();
    emit(EVENTS.HISTORY_NAVIGATION, { from: state.page, to: targetPage });
    showAddress(targetPage);
    syncedUrl = location.href;
}

/** Follows the browser history: Back and Forward, and fragments typed by hand. */
export function initHistory() {
    window.addEventListener('popstate', syncWithAddress);
    window.addEventListener('hashchange', syncWithAddress);
}
