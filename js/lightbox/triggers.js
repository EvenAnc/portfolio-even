/**
 * Lightbox triggers: wires the drawings, plan sheets, section cuts and lone
 * images of the pages to the viewer.
 */

import { isTouch, prefersReducedMotion } from '../core/env.js';
import { t } from '../i18n/i18n.js';
import { DRAWINGS, DIPLOMA_SECTIONS, findGalleryByUrl } from './galleries.js';
import { openGallery, openSingleImage, showPlaceholder, setFadeEnabled } from './lightbox.js';

/** Section cuts of the diploma project, which open the viewer. */
export const SECTION_TRIGGER_SELECTOR = '[data-section-gallery] .section-stack-item[data-section-index]';

const DRAWING_ITEM_SELECTOR = '#page-drawings .drawing-item, #page-drawings .carousel-slide';
const DRAWING_TRIGGER_SELECTOR = '#page-drawings .drawing-item .frame-wrap, #page-drawings .carousel-slide .drawing-sheet-wrap';

// On touch devices a tap would open the viewer before the red frame had
// time to draw itself. The opening waits for the trace, which the
// stylesheet shortens to 0.4 s for touch: long enough to be seen, short
// enough for the tap not to feel ignored.
const TOUCH_TRACE_DELAY_MS = 460;

// Must match the view-transition rules of the stylesheet.
const BOARD_TRANSITION_NAME = 'open-sheet';

// Plays the trace of the red frame, then runs the action. With a mouse, or
// when the element has no frame to draw, nothing is delayed.
function traceFrameThen(element, action) {
    const frame = isTouch() ? element.closest('.frame-wrap') : null;
    if (!frame || !frame.querySelector('.sketch-rect-svg')) {
        action();
        return;
    }

    // A second tap during the animation must not open twice.
    if (frame.dataset.tracing) return;
    frame.dataset.tracing = '1';
    frame.classList.add('is-tracing');

    setTimeout(() => {
        frame.classList.remove('is-tracing');
        delete frame.dataset.tracing;
        // The page may have changed while the frame was being drawn.
        if (element.closest('.page') && !element.closest('.page.is-active')) return;
        action();
    }, TOUCH_TRACE_DELAY_MS);
}

// A copy of the thumbnail, already decoded, that stands in the viewer as
// the target of the movement until the PDF render replaces it.
function createPlaceholder(thumbnail) {
    const placeholder = thumbnail.cloneNode();
    placeholder.removeAttribute('id');
    placeholder.style.viewTransitionName = BOARD_TRANSITION_NAME;
    placeholder.style.maxWidth = '100%';
    placeholder.style.maxHeight = '100%';
    placeholder.style.objectFit = 'contain';
    // The thumbnail is cropped with a transform of its own.
    placeholder.style.transform = 'none';
    return placeholder;
}

// Grows the thumbnail from its place in the page up to the viewer with a
// view transition. Without view transitions, or when reduced motion is
// requested, the viewer opens normally.
function liftBoard(source, open) {
    const thumbnail = source.querySelector('img');

    if (!document.startViewTransition || !thumbnail || prefersReducedMotion()) {
        open();
        return;
    }

    let placeholder = null;
    thumbnail.style.viewTransitionName = BOARD_TRANSITION_NAME;

    const transition = document.startViewTransition(() => {
        // A transition name may be carried by one element at a time: the
        // old state is already captured, so the thumbnail can let go of it
        // before the placeholder takes it.
        thumbnail.style.viewTransitionName = '';

        open();

        // The viewer normally fades in; captured mid-fade it would still be
        // transparent. The transition is the animation, so the fade is
        // skipped while it runs.
        setFadeEnabled(false);

        placeholder = createPlaceholder(thumbnail);
        showPlaceholder(placeholder);
    });

    transition.finished.catch(() => {}).finally(() => {
        thumbnail.style.viewTransitionName = '';
        setFadeEnabled(true);
        if (placeholder) placeholder.style.viewTransitionName = '';
    });
}

function isOnActivePage(element) {
    const page = element.closest('.page');
    return !page || page.classList.contains('is-active');
}

function isOnHiddenSlide(element) {
    const slide = element.closest('.carousel-slide');
    return Boolean(slide) && !slide.classList.contains('is-active');
}

// Drawings page: framed drawings and comic sheets, in document order, map
// onto the drawings gallery. Scoped to that page because other pages reuse
// .drawing-item for cards that have nothing to open.
function bindDrawings() {
    document.querySelectorAll(DRAWING_TRIGGER_SELECTOR).forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.drawing-item, .carousel-slide');
            if (!item || !isOnActivePage(trigger) || isOnHiddenSlide(trigger)) return;

            const index = Array.from(document.querySelectorAll(DRAWING_ITEM_SELECTOR)).indexOf(item);
            if (index !== -1) {
                traceFrameThen(trigger, () => openGallery(DRAWINGS, index));
            }
        });
    });
}

// Project pages: each sheet of a carousel opens the gallery it belongs to.
function bindProjectSheets() {
    document.querySelectorAll('.project-detail-page .carousel-slide .drawing-sheet-wrap').forEach(sheet => {
        sheet.addEventListener('click', () => {
            if (isOnHiddenSlide(sheet) || !isOnActivePage(sheet)) return;

            const preview = sheet.querySelector('.js-pdf-source');
            if (!preview) return;

            const url = preview.dataset.pdfUrl;
            const match = findGalleryByUrl(url);

            traceFrameThen(sheet, () => {
                if (match) openGallery(match.gallery, match.index);
                else openSingleImage(url, t('sheet_fallback'));
            });
        });
    });
}

function bindSingleImages() {
    document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const src = trigger.getAttribute('src');
            const alt = trigger.getAttribute('alt');
            if (src) traceFrameThen(trigger, () => openSingleImage(src, alt));
        });
    });
}

// Section cuts of the diploma project: the sheet lifts off the page into
// the viewer.
function bindSections() {
    document.querySelectorAll(SECTION_TRIGGER_SELECTOR).forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-section-index'), 10);
            traceFrameThen(item, () => liftBoard(item, () => openGallery(DIPLOMA_SECTIONS, index || 0)));
        });
    });
}

/** Wires every element of the pages that opens the viewer. */
export function initLightboxTriggers() {
    bindSections();
    bindDrawings();
    bindProjectSheets();
    bindSingleImages();
}
