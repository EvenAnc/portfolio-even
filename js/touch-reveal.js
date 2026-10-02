/**
 * Touch reveal: on touch devices, plays on scroll the animations that a
 * pointer triggers on hover.
 */

import { on, EVENTS } from './core/state.js';
import { TOUCH_MEDIA_QUERY } from './core/env.js';

// Must match the elements animated by the stylesheet.
const REVEAL_SELECTOR = [
    '.drawing-item',
    '.contact-block',
    '.form-field',
    '.notebook-section',
    '.projects-shortcut',
].join(', ');

// The element must be well inside the screen, not merely touching its
// bottom edge, where the eye is not looking yet.
const REVEAL_THRESHOLD = 0.35;
const REVEAL_ROOT_MARGIN = '0px 0px -12% 0px';
// Scrolling past quickly cancels the reveal instead of flashing it;
// stopping lets it play in view, like a hover.
const REVEAL_DELAY_MS = 160;
// Left time for the initial layout to settle.
const INITIAL_OBSERVE_DELAY_MS = 300;
// Left time for the entrance of the page to be mostly played.
const PAGE_SHOWN_OBSERVE_DELAY_MS = 450;

// Pending reveal of each observed element.
const revealTimers = new WeakMap();

// Pages scroll inside their own box, not in the viewport: each page needs
// an observer rooted on itself, otherwise everything counts as visible
// since the page covers the screen.
const pageObservers = new Map();

function scheduleReveal(element) {
    if (revealTimers.has(element)) return;
    revealTimers.set(element, setTimeout(() => {
        element.classList.add('is-in-view');
        revealTimers.delete(element);
    }, REVEAL_DELAY_MS));
}

// Off screen: cancel a pending reveal and drop the state, so that the
// animation plays again next time, like a repeated hover.
function cancelReveal(element) {
    if (revealTimers.has(element)) {
        clearTimeout(revealTimers.get(element));
        revealTimers.delete(element);
    }
    element.classList.remove('is-in-view');
}

function observerForPage(page) {
    if (!pageObservers.has(page)) {
        pageObservers.set(page, new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) scheduleReveal(entry.target);
                else cancelReveal(entry.target);
            });
        }, {
            threshold: REVEAL_THRESHOLD,
            rootMargin: REVEAL_ROOT_MARGIN,
        }));
    }
    return pageObservers.get(page);
}

function observeInPage(page) {
    const observer = observerForPage(page);
    page.querySelectorAll(REVEAL_SELECTOR).forEach(element => {
        if (element.dataset.mobileObserved) return;
        element.dataset.mobileObserved = '1';
        observer.observe(element);
    });
}

// The mode can change along the way (a tablet whose keyboard is detached,
// a window moved to a touch screen): start then.
function startOnceTouch(touchQuery) {
    const retry = () => {
        if (!touchQuery.matches) return;
        touchQuery.removeEventListener('change', retry);
        initTouchReveal();
    };
    touchQuery.addEventListener('change', retry);
}

/** Starts observing the pages on a touch device; must run after a page is active. */
export function initTouchReveal() {
    const touchQuery = window.matchMedia(TOUCH_MEDIA_QUERY);
    if (!touchQuery.matches) {
        startOnceTouch(touchQuery);
        return;
    }

    const homePage = document.getElementById('page-home');
    if (homePage) {
        setTimeout(() => observeInPage(homePage), INITIAL_OBSERVE_DELAY_MS);
    }

    // A deep link activated its page before this subscription existed:
    // observe the page that is already active.
    const activePage = document.querySelector('.page.is-active');
    if (activePage && activePage !== homePage) {
        setTimeout(() => observeInPage(activePage), INITIAL_OBSERVE_DELAY_MS);
    }

    // Other pages are observed once they are shown.
    on(EVENTS.PAGE_SHOWN, ({ page }) => {
        if (page === 'home') return;
        const pageEl = document.getElementById(`page-${page}`);
        setTimeout(() => observeInPage(pageEl), PAGE_SHOWN_OBSERVE_DELAY_MS);
    });
}
