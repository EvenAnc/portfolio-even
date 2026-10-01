/**
 * Lightbox: the full-screen viewer for drawings and PDF sheets. Handles
 * opening, closing, navigation, zoom controls, keyboard and focus.
 */

import { state, on } from '../core/state.js';
import { isTouch } from '../core/env.js';
import { t } from '../i18n/i18n.js';
import { DRAWINGS } from './galleries.js';
import { attachGestures } from './gestures.js';
import { loadPdfJs, renderPdfPage } from './pdf-renderer.js';

// The second click of a double-click lands on the viewer that the first
// one just opened; it must neither close it nor zoom.
const OPEN_CLICK_GUARD_MS = 400;
const CONTROLS_HIDE_DELAY_MS = 2500;
// Matches the closing fade of the stylesheet.
const CLOSING_FADE_MS = 350;
const IMAGE_MAX_ZOOM = 4;
const PDF_MAX_ZOOM = 10;
const BUTTON_ZOOM = 2;

let lightbox = null;
let canvasWrap = null;
let counterEl = null;
let closeBtn = null;
let prevBtn = null;
let nextBtn = null;
let loader = null;
let dotsWrap = null;
let zoomRange = null;
let sliderRedPath = null;

// Zoom and pan of the item on display, shared with the gesture handlers.
const view = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    isZoomed: false,
    maxZoom: IMAGE_MAX_ZOOM,
};

let gallery = DRAWINGS;
let current = 0;
// A single image is shown without counter, dots or arrows.
let singleItem = null;
let renderId = 0;
let activeRender = null;
let openedAt = 0;
let hideTimer = null;
let clearTimer = null;
let focusBeforeOpen = null;
// Tracked by hand rather than read from :focus-visible, which older Safari
// rejects as a selector: the last input device used decides.
let keyboardDriven = false;

/** @returns {boolean} */
export function isLightboxOpen() {
    return Boolean(lightbox) && lightbox.getAttribute('aria-hidden') === 'false';
}

// Aborts a PDF render still in flight and frees its document.
function cancelActiveRender() {
    if (!activeRender) return;
    activeRender.abort();
    activeRender = null;
}

// Zeroing a canvas frees its backing store at once; mobile Safari
// otherwise keeps it until a garbage collection that may come late.
function clearCanvasWrap() {
    canvasWrap.querySelectorAll('canvas').forEach(canvas => { canvas.width = canvas.height = 0; });
    canvasWrap.innerHTML = '';
}

function setLoading(isLoading) {
    if (loader) loader.classList.toggle('active', isLoading);
}

// A zoomed image may travel only as far as it overflows the frame on
// each side, so it can never be dragged out of view.
function clampTranslation(item) {
    const maxX = Math.max(0, (item.offsetWidth * view.scale - canvasWrap.clientWidth) / 2);
    const maxY = Math.max(0, (item.offsetHeight * view.scale - canvasWrap.clientHeight) / 2);
    view.translateX = Math.min(maxX, Math.max(-maxX, view.translateX));
    view.translateY = Math.min(maxY, Math.max(-maxY, view.translateY));
}

function updateTransform() {
    const item = canvasWrap.querySelector('img, canvas');
    if (item) {
        clampTranslation(item);
        item.style.transform = `translate(${view.translateX}px, ${view.translateY}px) scale(${view.scale})`;
    }

    if (sliderRedPath && zoomRange) {
        const percent = (view.scale - zoomRange.min) / (zoomRange.max - zoomRange.min);
        sliderRedPath.style.strokeDashoffset = 100 - (percent * 100);
    }
}

function setZoomed(isZoomed) {
    view.isZoomed = isZoomed;
    lightbox.classList.toggle('zoomed', isZoomed);
}

function resetView() {
    view.scale = 1;
    view.translateX = 0;
    view.translateY = 0;
    if (zoomRange) zoomRange.value = 1;
    updateTransform();
    setZoomed(false);
}

function toggleZoom() {
    setZoomed(!view.isZoomed);
    if (view.isZoomed) {
        view.scale = BUTTON_ZOOM;
    } else {
        view.scale = 1;
        view.translateX = 0;
        view.translateY = 0;
    }
    if (zoomRange) zoomRange.value = view.scale;
    updateTransform();
}

function generateDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    gallery.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'lb-dot' + (index === current ? ' active' : '');
        dot.addEventListener('click', event => {
            event.stopPropagation();
            showItem(index);
        });
        dotsWrap.appendChild(dot);
    });
}

function updateDots() {
    dotsWrap.querySelectorAll('.lb-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
    });
}

function showControls() {
    lightbox.classList.remove('controls-hidden');
    clearTimeout(hideTimer);
    // A pointer brings the controls back by moving; a finger has no such
    // movement, so on touch devices the controls stay.
    if (isTouch()) return;
    hideTimer = setTimeout(() => {
        // Hiding would take the close button away from someone panning
        // a zoomed image or driving the viewer from the keyboard.
        if (view.isZoomed || keyboardDriven) return;
        lightbox.classList.add('controls-hidden');
    }, CONTROLS_HIDE_DELAY_MS);
}

function onPointerActivity() {
    keyboardDriven = false;
    showControls();
}

function placeItem(element) {
    canvasWrap.innerHTML = '';
    canvasWrap.appendChild(element);
}

function showPdf(url, altText, isStale) {
    const canvas = document.createElement('canvas');
    canvas.style.backgroundColor = '#ffffff';
    // A canvas has no alt: it is exposed as an image with a name.
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', altText);

    const controller = new AbortController();
    activeRender = controller;

    renderPdfPage(url, canvas, { signal: controller.signal }).then(drawn => {
        if (activeRender === controller) activeRender = null;
        if (!drawn || isStale()) {
            canvas.width = canvas.height = 0;
            return;
        }
        placeItem(canvas);
        setLoading(false);
    }).catch(error => {
        if (activeRender === controller) activeRender = null;
        if (isStale()) {
            canvas.width = canvas.height = 0;
        } else {
            setLoading(false);
            console.error('[portfolio] PDF sheet could not be rendered:', error);
        }
    });
}

function showImage(url, altText, isStale) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = altText;
    img.draggable = false;

    img.onload = () => {
        if (!isStale()) setLoading(false);
    };
    img.onerror = () => {
        if (isStale()) return;
        setLoading(false);
        console.error('[portfolio] image could not be loaded:', img.src);
    };

    placeItem(img);
}

function showItem(index) {
    const isSingle = singleItem !== null;
    current = index;
    resetView();

    if (counterEl) {
        counterEl.style.display = isSingle ? 'none' : '';
        if (!isSingle) counterEl.textContent = `${index + 1} / ${gallery.length}`;
    }
    [dotsWrap, prevBtn, nextBtn].forEach(control => {
        if (control) control.style.display = isSingle ? 'none' : '';
    });
    if (!isSingle) updateDots();

    // A reopening during the closing fade must not be emptied by it.
    clearTimeout(clearTimer);
    clearCanvasWrap();
    setLoading(true);

    const id = ++renderId;
    const isStale = () => id !== renderId;
    cancelActiveRender();

    const entry = isSingle ? singleItem : gallery[index];
    const altText = (entry.altKey && t(entry.altKey)) || entry.title || '';
    const isPdf = entry.url.toLowerCase().endsWith('.pdf');

    view.maxZoom = isPdf ? PDF_MAX_ZOOM : IMAGE_MAX_ZOOM;
    if (zoomRange) zoomRange.max = view.maxZoom;

    if (isPdf) showPdf(entry.url, altText, isStale);
    else showImage(entry.url, altText, isStale);

    showControls();
}

function showNext() {
    if (singleItem === null) showItem((current + 1) % gallery.length);
}

function showPrevious() {
    if (singleItem === null) showItem((current - 1 + gallery.length) % gallery.length);
}

// The viewer is modal: focus moves in on open, stays in while it is open,
// and goes back to where it was on close.
function takeFocus() {
    if (!lightbox.contains(document.activeElement)) focusBeforeOpen = document.activeElement;
    if (closeBtn) closeBtn.focus({ preventScroll: true });
}

function giveFocusBack() {
    const target = focusBeforeOpen;
    focusBeforeOpen = null;
    if (target && target !== document.body && target.isConnected) {
        target.focus({ preventScroll: true });
    } else if (lightbox.contains(document.activeElement)) {
        document.activeElement.blur();
    }
}

function trapFocus(event) {
    const focusables = Array.from(lightbox.querySelectorAll('button, input'))
        .filter(element => element.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (!lightbox.contains(active)) {
        event.preventDefault();
        first.focus();
    } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
    }
}

function open() {
    openedAt = performance.now();
    lightbox.setAttribute('aria-hidden', 'false');
    takeFocus();
    if (state.scroll) state.scroll.stop();
    document.body.style.overflow = 'hidden';
}

/**
 * Opens the viewer on one entry of a gallery.
 * @param {Array<{url: string, title: string, altKey?: string}>} items
 * @param {number} index
 */
export function openGallery(items, index) {
    if (!lightbox) return;
    // Opening on a missing entry would lock scrolling behind an empty viewer.
    if (!Number.isInteger(index) || index < 0 || index >= items.length) return;
    gallery = items;
    singleItem = null;
    open();
    generateDots();
    showItem(index);
}

/**
 * Opens the viewer on a lone image, without navigation.
 * @param {string} url
 * @param {string} title
 */
export function openSingleImage(url, title) {
    if (!lightbox) return;
    singleItem = { url, title };
    open();
    showItem(0);
}

export function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    resetView();
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    clearTimeout(hideTimer);
    // A render still in flight must not land in the closed viewer.
    ++renderId;
    cancelActiveRender();
    setLoading(false);
    // Emptied only once the closing fade has played.
    clearTimer = setTimeout(clearCanvasWrap, CLOSING_FADE_MS);
    if (state.scroll) state.scroll.start();
    document.body.style.overflow = '';
    giveFocusBack();
}

function bindZoomControls() {
    const zoomBtn = lightbox.querySelector('.lb-zoom-btn');
    if (zoomBtn) {
        zoomBtn.addEventListener('click', event => {
            event.stopPropagation();
            toggleZoom();
        });
    }

    if (!zoomRange) return;

    zoomRange.addEventListener('input', event => {
        view.scale = parseFloat(event.target.value);
        if (view.scale > 1 && !view.isZoomed) {
            setZoomed(true);
        } else if (view.scale === 1 && view.isZoomed) {
            // The zoomed state is kept until the slider is released: dropping
            // it here would hide the slider under the pointer, and the
            // release would land on the backdrop and close the viewer.
            view.translateX = 0;
            view.translateY = 0;
        }
        updateTransform();
    });

    zoomRange.addEventListener('change', () => {
        if (view.scale <= 1 && view.isZoomed) {
            setZoomed(false);
            view.translateX = 0;
            view.translateY = 0;
            updateTransform();
        }
    });

    // A click on the slider must not reach the backdrop, which closes.
    zoomRange.parentNode.addEventListener('click', event => event.stopPropagation());
}

function bindFullscreenButton() {
    const fullBtn = lightbox.querySelector('.lb-fullscreen-btn');
    if (!fullBtn) return;

    // Some browsers (iPhone Safari) have no element fullscreen at all: a
    // button that does nothing is worse than no button.
    if (!lightbox.requestFullscreen) fullBtn.style.display = 'none';

    fullBtn.addEventListener('click', event => {
        event.stopPropagation();
        if (!lightbox.requestFullscreen) return;
        if (!document.fullscreenElement) {
            lightbox.requestFullscreen().catch(error => console.error(error));
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });
}

function onKeydown(event) {
    if (!isLightboxOpen()) return;
    // Any key counts as activity, like a mouse move.
    keyboardDriven = true;
    showControls();
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'Tab') trapFocus(event);
    // On the zoom slider the arrow keys already change the zoom.
    if (event.target !== zoomRange) {
        if (event.key === 'ArrowRight') showNext();
        else if (event.key === 'ArrowLeft') showPrevious();
    }
}

// A click outside the item closes; a click on the item zooms in.
function onBackdropClick(event) {
    if (performance.now() - openedAt < OPEN_CLICK_GUARD_MS) return;
    const tagName = event.target.tagName.toLowerCase();
    if (event.target === lightbox || event.target.classList.contains('lb-canvas-wrap')) {
        closeLightbox();
    } else if (tagName === 'img' || tagName === 'canvas') {
        // On touch devices the natural gesture is the pinch, and a plain
        // tap must not zoom: click-to-zoom is for the mouse only.
        if (isTouch()) return;
        if (!view.isZoomed) toggleZoom();
    }
}

export function initLightbox() {
    const root = document.getElementById('drawing-lightbox');
    const wrap = document.getElementById('lb-canvas-wrap');
    if (!root || !wrap) return;

    lightbox = root;
    canvasWrap = wrap;
    counterEl = lightbox.querySelector('.lb-counter');
    closeBtn = lightbox.querySelector('.lb-close');
    prevBtn = lightbox.querySelector('.lb-prev');
    nextBtn = lightbox.querySelector('.lb-next');
    loader = document.getElementById('lb-loader');
    dotsWrap = lightbox.querySelector('.lb-dots');
    zoomRange = lightbox.querySelector('#lb-zoom-range');
    sliderRedPath = lightbox.querySelector('#lb-slider-red-path');

    // The open/closed state lives in this attribute; it starts closed.
    lightbox.setAttribute('aria-hidden', 'true');

    lightbox.addEventListener('mousemove', onPointerActivity);
    lightbox.addEventListener('touchstart', onPointerActivity);

    if (closeBtn) {
        closeBtn.addEventListener('click', event => {
            event.stopPropagation();
            closeLightbox();
        });
    }
    bindZoomControls();
    bindFullscreenButton();
    document.addEventListener('keydown', onKeydown);
    if (prevBtn) {
        prevBtn.addEventListener('click', event => {
            event.stopPropagation();
            showPrevious();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', event => {
            event.stopPropagation();
            showNext();
        });
    }
    lightbox.addEventListener('click', onBackdropClick);

    attachGestures({
        lightbox,
        canvasWrap,
        zoomRange,
        view,
        isOpen: isLightboxOpen,
        setZoomed,
        updateTransform,
        showNext,
        showPrevious,
    });

    // History navigation swaps the page underneath: a viewer left open
    // would cover the new page and keep scrolling locked.
    on('history-navigation', () => {
        if (isLightboxOpen()) closeLightbox();
    });

    // The diploma project is the only page with PDF sheets: fetch the
    // library ahead of the first opening. A failure here is retried when a
    // sheet is opened.
    on('page-change', ({ to }) => {
        if (to === 'project-diploma') loadPdfJs().catch(() => {});
    });
}
