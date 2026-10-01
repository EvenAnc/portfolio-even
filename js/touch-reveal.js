/**
 * Touch reveal: on touch devices, plays on scroll the animations that a
 * pointer triggers on hover.
 */

import { TOUCH_MEDIA_QUERY } from './core/env.js';

// The element must be well inside the screen, not merely touching its
// bottom edge, where the eye is not looking yet.
const TOUCH_REVEAL_THRESHOLD = 0.35;
const TOUCH_REVEAL_ROOT_MARGIN = '0px 0px -12% 0px';
const TOUCH_REVEAL_DELAY_MS = 160;

// Pending reveal of each observed element.
const revealTimers = new WeakMap();

export function initTouchReveal() {
    const mq = window.matchMedia(TOUCH_MEDIA_QUERY);
    if (!mq.matches) {
        // The mode can change along the way (a tablet whose keyboard is
        // detached, a window moved to a touch screen): try again then.
        const retry = () => {
            if (mq.matches) {
                mq.removeEventListener('change', retry);
                initTouchReveal();
            }
        };
        mq.addEventListener('change', retry);
        return;
    }

    // Must match the elements animated by the stylesheet.
    const SELECTORS = [
        '.drawing-item',
        '.ci-block',
        '.fg',
        '.notebook-section',
        '.home-projects-shortcut',
    ].join(', ');

    // Pages scroll inside their own box, not in the viewport: each page
    // needs an observer rooted on itself, otherwise everything counts as
    // visible since the page covers the screen.
    const pageObservers = new Map();  // page element -> IntersectionObserver

    function createObserverForPage(page) {
        if (pageObservers.has(page)) return pageObservers.get(page);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    // Short delay before the reveal: scrolling past quickly cancels
                    // it instead of flashing; stopping lets it play in view, like
                    // a hover.
                    if (revealTimers.has(el)) return;
                    revealTimers.set(el, setTimeout(() => {
                        el.classList.add('is-inview');
                        revealTimers.delete(el);
                    }, TOUCH_REVEAL_DELAY_MS));
                } else {
                    // Off screen: cancel a pending reveal and drop the state, so
                    // that the animation plays again next time, like a repeated
                    // hover.
                    if (revealTimers.has(el)) {
                        clearTimeout(revealTimers.get(el));
                        revealTimers.delete(el);
                    }
                    el.classList.remove('is-inview');
                }
            });
        }, {
            threshold: TOUCH_REVEAL_THRESHOLD,
            rootMargin: TOUCH_REVEAL_ROOT_MARGIN
        });

        pageObservers.set(page, observer);
        return observer;
    }

    function observeInPage(page) {
        const observer = createObserverForPage(page);
        page.querySelectorAll(SELECTORS).forEach(el => {
            if (!el.dataset.mobileObserved) {
                el.dataset.mobileObserved = '1';
                observer.observe(el);
            }
        });
    }

    const homePage = document.getElementById('page-home');
    if (homePage) {
        // Left time for the initial layout to settle.
        setTimeout(() => observeInPage(homePage), 300);
    }

    // A deep link activates its page before the class watchers below exist,
    // so they never fire for it: observe the page that is already active.
    const activePage = document.querySelector('.page.is-active');
    if (activePage && activePage !== homePage) {
        setTimeout(() => observeInPage(activePage), 300);
    }

    // Other pages are observed once they become active.
    document.querySelectorAll('.page').forEach(page => {
        if (page.id === 'page-home') return;

        const mutObserver = new MutationObserver(() => {
            if (page.classList.contains('is-active')) {
                // Left time for the page transition to finish.
                setTimeout(() => observeInPage(page), 450);
            }
        });
        mutObserver.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
}
