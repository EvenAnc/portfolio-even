/**
 * Lightbox triggers: wires the drawings, plan sheets, section cuts and lone
 * images of the pages to the viewer.
 */

import { isTouch, prefersReducedMotion } from '../core/env.js';
import { DRAWINGS, DIPLOMA_SECTIONS, findGalleryByUrl } from './galleries.js';
import { openGallery, openSingleImage } from './lightbox.js';

// On touch devices a tap would open the viewer before the red frame had
// time to draw itself. The opening waits for the trace, which the
// stylesheet shortens to 0.4 s for touch: long enough to be seen, short
// enough for the tap not to feel ignored.
const TOUCH_TRACE_DELAY_MS = 460;

const BOARD_TRANSITION_NAME = 'planche-ouverte';
const FALLBACK_SHEET_TITLE = 'Plan Architecture';

// Plays the trace of the red frame, then runs the action. With a mouse, or
// when the element has no frame to draw, nothing is delayed.
function traceFrameThen(element, action) {
    if (!isTouch()) { action(); return; }

    const frame = element.closest('.frame-wrap');
    if (!frame || !frame.querySelector('.sketch-rect-svg')) { action(); return; }

    // A second tap during the animation must not open twice.
    if (frame.dataset.traceEnCours) return;
    frame.dataset.traceEnCours = '1';
    frame.classList.add('trace-tactile');

    setTimeout(() => {
        frame.classList.remove('trace-tactile');
        delete frame.dataset.traceEnCours;
        // The page may have changed while the frame was being drawn.
        if (element.closest('.page') && !element.closest('.page.is-active')) return;
        action();
    }, TOUCH_TRACE_DELAY_MS);
}

// Grows the thumbnail from its place in the page up to the viewer with a
// view transition. The PDF takes a moment to render, so a copy of the
// thumbnail, already decoded, stands in as the target of the movement
// until the render replaces it. Without view transitions, or when reduced
// motion is requested, the viewer opens normally.
function liftBoard(source, open) {
    const thumbnail = source.querySelector('img');
    const stage = document.getElementById('lb-canvas-wrap');
    const lightbox = document.getElementById('drawing-lightbox');

    if (!document.startViewTransition || !thumbnail || !stage || !lightbox ||
        prefersReducedMotion()) {
        open();
        return;
    }

    function cleanup() {
        thumbnail.style.viewTransitionName = '';
        lightbox.classList.remove('sans-fondu');
        stage.querySelectorAll('img').forEach(img => { img.style.viewTransitionName = ''; });
    }

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
        lightbox.classList.add('sans-fondu');

        const placeholder = thumbnail.cloneNode();
        placeholder.removeAttribute('id');
        placeholder.style.viewTransitionName = BOARD_TRANSITION_NAME;
        placeholder.style.maxWidth = '100%';
        placeholder.style.maxHeight = '100%';
        placeholder.style.objectFit = 'contain';
        // The thumbnail is cropped with a transform of its own.
        placeholder.style.transform = 'none';
        stage.appendChild(placeholder);
    });

    transition.finished.catch(() => {}).finally(cleanup);
}

const isOnActivePage = element => {
    const page = element.closest('.page');
    return !page || page.classList.contains('is-active');
};

const isOnHiddenSlide = element => {
    const slide = element.closest('.bd-slide');
    return Boolean(slide) && !slide.classList.contains('active');
};

// Drawings page: framed drawings and comic sheets, in document order, map
// onto the drawings gallery. Scoped to that page because other pages reuse
// .drawing-item for cards that have nothing to open.
function bindDrawings() {
    const selector = '#page-drawings .drawing-item .frame-wrap, #page-drawings .bd-slide .drawing-sheet-wrap';
    document.querySelectorAll(selector).forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.drawing-item, .bd-slide');
            if (!item || !isOnActivePage(trigger)) return;
            if (item.classList.contains('bd-slide') && !item.classList.contains('active')) return;

            const items = Array.from(document.querySelectorAll('#page-drawings .drawing-item, #page-drawings .bd-slide'));
            const index = items.indexOf(item);
            if (index !== -1) {
                traceFrameThen(trigger, () => openGallery(DRAWINGS, index));
            }
        });
    });
}

// Project pages: each sheet of a carousel opens the gallery it belongs to.
function bindProjectSheets() {
    document.querySelectorAll('.project-detail-page .bd-slide .drawing-sheet-wrap').forEach(sheet => {
        sheet.addEventListener('click', () => {
            if (isOnHiddenSlide(sheet) || !isOnActivePage(sheet)) return;

            const preview = sheet.querySelector('.pdf-inline-render');
            if (!preview) return;

            const url = preview.dataset.pdfUrl;
            const match = findGalleryByUrl(url);

            traceFrameThen(sheet, () => {
                if (match) openGallery(match.gallery, match.index);
                else openSingleImage(url, FALLBACK_SHEET_TITLE);
            });
        });
    });
}

function bindSingleImages() {
    document.querySelectorAll('.single-lightbox-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const src = trigger.getAttribute('src');
            const alt = trigger.getAttribute('alt');
            if (src) traceFrameThen(trigger, () => openSingleImage(src, alt));
        });
    });
}

export function initLightboxTriggers() {
    bindDrawings();
    bindProjectSheets();
    bindSingleImages();
}

/** Section cuts of the diploma project: the sheet lifts off the page into the viewer. */
export function initSectionTriggers() {
    document.querySelectorAll('[data-coupe-gallery] .stack-item[data-coupe-index]').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-coupe-index'), 10);
            traceFrameThen(item, () => liftBoard(item, () => openGallery(DIPLOMA_SECTIONS, index || 0)));
        });
    });
}
