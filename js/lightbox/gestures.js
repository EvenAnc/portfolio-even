/**
 * Lightbox gestures: drag to pan, wheel and pinch to zoom, swipe to change
 * item.
 */

import { SWIPE_MIN_DISTANCE_PX } from '../core/env.js';

const WHEEL_ZOOM_STEP = 0.15;
// Below this scale a pinch counts as back to the fitted size.
const PINCH_ZOOMED_THRESHOLD = 1.05;

/**
 * @param {Element} element
 * @returns {boolean} true for the image or the canvas on display
 */
export function isItem(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'img' || tagName === 'canvas';
}

function distanceBetween(touchA, touchB) {
    return Math.hypot(touchB.clientX - touchA.clientX, touchB.clientY - touchA.clientY);
}

// Scales around a point given from the centre of the frame, so that the
// content under the pointer or between the fingers stays in place.
function zoomAround({ stage, zoomRange, view }, clientX, clientY, newScale) {
    const rect = stage.getBoundingClientRect();
    const pointX = clientX - rect.left - rect.width / 2;
    const pointY = clientY - rect.top - rect.height / 2;
    const ratio = newScale / view.scale;

    view.translateX = pointX - (pointX - view.translateX) * ratio;
    view.translateY = pointY - (pointY - view.translateY) * ratio;
    view.scale = newScale;
    if (zoomRange) zoomRange.value = view.scale;
}

// Drag to pan a zoomed item.
function bindDrag({ stage, view, updateTransform }) {
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOriginX = 0;
    let dragOriginY = 0;

    stage.addEventListener('pointerdown', event => {
        if (!view.isZoomed || !isItem(event.target)) return;
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragOriginX = view.translateX;
        dragOriginY = view.translateY;
        event.target.classList.add('is-dragging');
        event.target.setPointerCapture(event.pointerId);
    });

    stage.addEventListener('pointermove', event => {
        if (!isDragging) return;
        view.translateX = dragOriginX + (event.clientX - dragStartX);
        view.translateY = dragOriginY + (event.clientY - dragStartY);
        updateTransform();
    });

    // The system can take the pointer away (system gesture, lost capture)
    // without any pointerup: the drag must end all the same.
    function endDrag(event) {
        if (!isDragging) return;
        isDragging = false;
        event.target.classList.remove('is-dragging');
        if (event.target.hasPointerCapture(event.pointerId)) {
            event.target.releasePointerCapture(event.pointerId);
        }
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('lostpointercapture', endDrag);
}

function bindWheelZoom(api) {
    const { stage, view, isOpen, setZoomed, resetPan, updateTransform } = api;

    stage.addEventListener('wheel', event => {
        if (!isOpen()) return;
        if (!view.isZoomed && event.deltaY > 0) return;
        event.preventDefault();

        const step = event.deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP;
        const newScale = Math.min(view.maxZoom, Math.max(1, view.scale + step));
        if (newScale === view.scale) return;

        zoomAround(api, event.clientX, event.clientY, newScale);

        if (view.scale <= 1) {
            setZoomed(false);
            resetPan();
        } else if (!view.isZoomed) {
            setZoomed(true);
        }
        updateTransform();
    }, { passive: false });
}

function bindPinchAndSwipe(api) {
    const { lightbox, view, setZoomed, resetPan, updateTransform, showNext, showPrevious } = api;

    let touchStartX = 0;
    let touchStartY = 0;
    let initialPinchDistance = null;
    let initialPinchScale = 1;
    let pinchInProgress = false;

    lightbox.addEventListener('touchstart', event => {
        if (event.touches.length === 2) {
            event.preventDefault();
            pinchInProgress = true;
            initialPinchDistance = distanceBetween(event.touches[0], event.touches[1]);
            initialPinchScale = view.scale;
        } else if (event.touches.length === 1) {
            // A first finger starts a new gesture, whatever became of the last.
            pinchInProgress = false;
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }
    }, { passive: false });

    lightbox.addEventListener('touchmove', event => {
        if (event.touches.length !== 2 || !initialPinchDistance) return;
        event.preventDefault();
        const [touchA, touchB] = event.touches;

        const pinchRatio = distanceBetween(touchA, touchB) / initialPinchDistance;
        const newScale = Math.min(view.maxZoom, Math.max(1, initialPinchScale * pinchRatio));
        if (newScale === view.scale) return;

        zoomAround(api, (touchA.clientX + touchB.clientX) / 2, (touchA.clientY + touchB.clientY) / 2, newScale);

        if (view.scale > PINCH_ZOOMED_THRESHOLD && !view.isZoomed) {
            setZoomed(true);
        } else if (view.scale <= PINCH_ZOOMED_THRESHOLD && view.isZoomed) {
            setZoomed(false);
            resetPan();
        }
        updateTransform();
    }, { passive: false });

    // The system can take a gesture away (home swipe, incoming call) without
    // any touchend: forget it, or the next swipe would be swallowed.
    lightbox.addEventListener('touchcancel', () => {
        pinchInProgress = false;
        initialPinchDistance = null;
    });

    lightbox.addEventListener('touchend', event => {
        if (event.touches.length < 2) {
            initialPinchDistance = null;
        }
        // Lifting the fingers of a pinch one after the other is not a swipe:
        // the gesture only ends when the last finger leaves the screen.
        if (pinchInProgress) {
            if (event.touches.length === 0) pinchInProgress = false;
            return;
        }
        if (event.changedTouches.length !== 1 || initialPinchDistance || view.isZoomed) return;

        const deltaX = event.changedTouches[0].clientX - touchStartX;
        const deltaY = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > SWIPE_MIN_DISTANCE_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) showNext();
            else showPrevious();
        }
    });
}

/**
 * Wires the pointer, wheel and touch gestures of the viewer.
 * @param {object} api
 * @param {HTMLElement} api.lightbox
 * @param {HTMLElement} api.stage
 * @param {HTMLInputElement|null} api.zoomRange
 * @param {{scale: number, translateX: number, translateY: number, isZoomed: boolean, maxZoom: number}} api.view
 * @param {() => boolean} api.isOpen
 * @param {(isZoomed: boolean) => void} api.setZoomed
 * @param {() => void} api.resetPan
 * @param {() => void} api.updateTransform
 * @param {() => void} api.showNext
 * @param {() => void} api.showPrevious
 */
export function initGestures(api) {
    bindDrag(api);
    bindWheelZoom(api);
    bindPinchAndSwipe(api);
}
