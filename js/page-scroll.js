/**
 * Page scroll: one smooth-scroll instance per page, driven by the
 * animation ticker, and the measured scrollbar width.
 */

import { state } from './core/state.js';
import { gsapMissing, hasScrollTrigger, prefersReducedMotion } from './core/env.js';

const SCROLL_DURATION_S = 1.0;
const TOUCH_MULTIPLIER = 1.5;
const RESIZE_DEBOUNCE_MS = 150;

let tickerCallback = null;

/**
 * Destroys the scroll instance of the page on display, if any. The ticker
 * callback goes with it: left in place, the ticker would keep calling raf
 * on nothing for the whole page transition.
 */
export function destroyPageScroll() {
    if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        tickerCallback = null;
    }
    if (state.scroll) {
        state.scroll.destroy();
        state.scroll = null;
    }
}

/**
 * Gives a page its smooth-scroll instance, published as `state.scroll`.
 * @param {HTMLElement} scrollContainer the page box, which scrolls on its own
 */
export function createPageScroll(scrollContainer) {
    // Lenis takes over the wheel but only moves when the GSAP ticker drives
    // it: without GSAP the page keeps its native scrolling. So does a
    // visitor who asked for reduced motion.
    if (typeof Lenis === 'undefined' || gsapMissing || prefersReducedMotion()) return;

    // One instance and one ticker callback at a time.
    destroyPageScroll();

    const options = {
        wrapper: scrollContainer,
        // The page box, not the whole document.
        eventsTarget: scrollContainer,
        duration: SCROLL_DURATION_S,
        easing: progress => Math.min(1, 1.001 - Math.pow(2, -10 * progress)),
        touchMultiplier: TOUCH_MULTIPLIER,
    };
    const contentWrapper = scrollContainer.querySelector('.page-inner');
    if (contentWrapper) options.content = contentWrapper;

    const lenis = new Lenis(options);

    if (hasScrollTrigger) lenis.on('scroll', ScrollTrigger.update);

    tickerCallback = time => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    state.scroll = lenis;
}

/**
 * Publishes the real scrollbar width as --scrollbar-width. Full-width blocks sized in
 * vw include the scrollbar of the page and would overflow by its width,
 * which varies: a few pixels on desktop, zero for overlay scrollbars.
 */
export function updateScrollbarWidth() {
    const page = document.querySelector('.page.is-active') || document.querySelector('.page');
    if (!page) return;
    const scrollbarWidth = Math.max(0, Math.round(page.offsetWidth - page.clientWidth));
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
}

/**
 * Keeps --scrollbar-width up to date. A ResizeObserver as well as the resize event: the
 * scrollbar can come and go without the window changing size (content
 * growing, images loading, device rotation).
 */
export function watchScrollbarWidth() {
    updateScrollbarWidth();
    const observer = new ResizeObserver(updateScrollbarWidth);
    document.querySelectorAll('.page').forEach(page => observer.observe(page));

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateScrollbarWidth, RESIZE_DEBOUNCE_MS);
    }, { passive: true });
}
