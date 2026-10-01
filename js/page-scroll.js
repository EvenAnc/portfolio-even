/**
 * Page scroll: one smooth-scroll instance per page, driven by the
 * animation ticker, and the measured scrollbar width.
 */

import { state } from './core/state.js';
import { gsapMissing, hasScrollTrigger } from './core/env.js';

let tickerCallback = null;

/**
 * The ticker callback goes with the instance: left in place, the ticker
 * would keep calling raf on nothing for the whole page transition.
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

export function createPageScroll(scrollContainer) {
    // Lenis takes over the wheel but only moves when the GSAP ticker drives
    // it: without GSAP the page keeps its native scrolling.
    if (typeof Lenis === 'undefined' || gsapMissing) return;

    // One instance and one ticker callback at a time.
    destroyPageScroll();

    const contentWrapper = scrollContainer.querySelector('.page-inner') || null;

    const options = {
        wrapper: scrollContainer,
        eventsTarget: scrollContainer,  // the page box, not the whole document
        duration: 1.0,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        smoothTouch: false,
        infinite: false,
        orientation: 'vertical',
    };

    if (contentWrapper) {
        options.content = contentWrapper;
    }

    const lenis = new Lenis(options);

    if (hasScrollTrigger) lenis.on('scroll', ScrollTrigger.update);

    tickerCallback = time => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    state.scroll = lenis;
}

/**
 * Publishes the real scrollbar width as --sbw. Full-width blocks sized in
 * vw include the scrollbar of the page and would overflow by its width,
 * which varies: a few pixels on desktop, zero for overlay scrollbars.
 */
export function updateScrollbarWidth() {
    const page = document.querySelector('.page.is-active') || document.querySelector('.page');
    if (!page) return;
    const scrollbarWidth = Math.max(0, Math.round(page.offsetWidth - page.clientWidth));
    document.documentElement.style.setProperty('--sbw', scrollbarWidth + 'px');
}

export function watchScrollbarWidth() {
    // A ResizeObserver as well as the resize event: the scrollbar can come
    // and go without the window changing size (content growing, images
    // loading, device rotation).
    updateScrollbarWidth();
    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => updateScrollbarWidth());
        document.querySelectorAll('.page').forEach(pg => observer.observe(pg));
    }
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateScrollbarWidth, 150);
    }, { passive: true });
}
