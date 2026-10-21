/**
 * Closing quote of the drawings and diploma pages (quote-band.css). Its
 * neighbours part as it crosses the screen and close back by the end of the
 * page, where the "next" arrow sits just under it. How far the quote gets at
 * the very bottom depends on the screen and on the footer below it, so the
 * end of the animation range is measured here, once per display and resize:
 * the animation then closes exactly when the page stops scrolling. Nothing
 * runs while scrolling; the browser drives the animation itself.
 */

import { on, EVENTS } from './core/state.js';

// The opening starts at a fifth of the crossing, as before; the closing
// must end a little before the last pixel, where the scroll comes to rest.
const RANGE_START = 21;
const END_MARGIN = 1;
// A range shorter than this, in percent of the crossing, would part and close
// the blocks too abruptly: it starts earlier, down to the entry of the quote.
const MIN_SPAN = 40;
const RESIZE_DELAY_MS = 150;

function fitRange(page) {
    const body = page.querySelector('.quote-band-body');
    if (!body || !page.clientHeight) return;

    // Where the quote stands once the page is scrolled to the bottom, in
    // the cover range of its view timeline (0: entering from below, 100:
    // gone at the top).
    const viewport = page.clientHeight;
    const maxScroll = page.scrollHeight - viewport;
    const top = body.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop;
    const topAtEnd = top - maxScroll;
    const progress = ((viewport - topAtEnd) / (viewport + body.offsetHeight)) * 100;

    const end = Math.min(79, progress - END_MARGIN);
    const start = Math.max(0, Math.min(RANGE_START, end - MIN_SPAN));
    page.style.setProperty('--quote-start', `${start.toFixed(1)}%`);
    page.style.setProperty('--quote-end', `${end.toFixed(1)}%`);
}

function fitActive() {
    const page = document.querySelector('.page--with-quote.is-active');
    if (page) fitRange(page);
}

/** Measures the closing quote of the page on display, now and whenever it changes. */
export function initQuoteBands() {
    if (!document.querySelector('.page--with-quote')) return;
    on(EVENTS.PAGE_SHOWN, fitActive);
    let timer = null;
    window.addEventListener('resize', () => {
        clearTimeout(timer);
        timer = setTimeout(fitActive, RESIZE_DELAY_MS);
    });
    // Late images change the height of the page above the quote.
    window.addEventListener('load', fitActive);
    fitActive();
}
