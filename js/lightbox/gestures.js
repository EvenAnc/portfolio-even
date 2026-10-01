/**
 * Lightbox gestures: drag to pan, wheel and pinch to zoom, swipe to change
 * item.
 */

const WHEEL_ZOOM_STEP = 0.15;
const SWIPE_MIN_DISTANCE_PX = 40;
// Below this scale a pinch counts as back to the fitted size.
const PINCH_ZOOMED_THRESHOLD = 1.05;

const isItem = element => {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'img' || tagName === 'canvas';
};

const distanceBetween = (touchA, touchB) =>
    Math.hypot(touchB.clientX - touchA.clientX, touchB.clientY - touchA.clientY);

/**
 * @param {object} api
 * @param {HTMLElement} api.lightbox
 * @param {HTMLElement} api.canvasWrap
 * @param {HTMLInputElement|null} api.zoomRange
 * @param {{scale: number, translateX: number, translateY: number, isZoomed: boolean, maxZoom: number}} api.view
 * @param {() => boolean} api.isOpen
 * @param {(isZoomed: boolean) => void} api.setZoomed
 * @param {() => void} api.updateTransform
 * @param {() => void} api.showNext
 * @param {() => void} api.showPrevious
 */
export function attachGestures({ lightbox, canvasWrap, zoomRange, view, isOpen, setZoomed, updateTransform, showNext, showPrevious }) {
    // Scales around a point given from the centre of the frame, so that the
    // content under the pointer or between the fingers stays in place.
    function zoomAround(clientX, clientY, newScale) {
        const rect = canvasWrap.getBoundingClientRect();
        const pointX = clientX - rect.left - rect.width / 2;
        const pointY = clientY - rect.top - rect.height / 2;
        const ratio = newScale / view.scale;

        view.translateX = pointX - (pointX - view.translateX) * ratio;
        view.translateY = pointY - (pointY - view.translateY) * ratio;
        view.scale = newScale;
        if (zoomRange) zoomRange.value = view.scale;
    }

    // Drag to pan a zoomed item.
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOriginX = 0;
    let dragOriginY = 0;

    canvasWrap.addEventListener('pointerdown', event => {
        if (!view.isZoomed || !isItem(event.target)) return;
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragOriginX = view.translateX;
        dragOriginY = view.translateY;
        event.target.classList.add('dragging');
        event.target.setPointerCapture(event.pointerId);
    });

    canvasWrap.addEventListener('pointermove', event => {
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
        event.target.classList.remove('dragging');
        if (event.target.hasPointerCapture(event.pointerId)) {
            event.target.releasePointerCapture(event.pointerId);
        }
    }

    canvasWrap.addEventListener('pointerup', endDrag);
    canvasWrap.addEventListener('pointercancel', endDrag);
    canvasWrap.addEventListener('lostpointercapture', endDrag);

    canvasWrap.addEventListener('wheel', event => {
        if (!isOpen()) return;
        if (!view.isZoomed && event.deltaY > 0) return;
        event.preventDefault();

        let newScale = view.scale + (event.deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP);
        if (zoomRange) {
            newScale = Math.max(parseFloat(zoomRange.min), Math.min(parseFloat(zoomRange.max), newScale));
        }
        if (newScale === view.scale) return;

        zoomAround(event.clientX, event.clientY, newScale);

        if (view.scale <= 1) {
            view.scale = 1;
            setZoomed(false);
            view.translateX = 0;
            view.translateY = 0;
        } else if (!view.isZoomed) {
            setZoomed(true);
        }
        updateTransform();
    }, { passive: false });

    // Pinch to zoom, swipe to change item.
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

        zoomAround((touchA.clientX + touchB.clientX) / 2, (touchA.clientY + touchB.clientY) / 2, newScale);

        if (view.scale > PINCH_ZOOMED_THRESHOLD && !view.isZoomed) {
            setZoomed(true);
        } else if (view.scale <= PINCH_ZOOMED_THRESHOLD && view.isZoomed) {
            setZoomed(false);
            view.translateX = 0;
            view.translateY = 0;
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
    }, { passive: false });
}
