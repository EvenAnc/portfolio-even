/**
 * Background preload: fetches the plan previews while the visitor is still
 * on another page, so that they are ready when the project page opens.
 *
 * Priority goes to the previews visible at once on that page; hidden
 * carousel slides follow. Work only happens during idle time and never
 * right after an interaction, so it cannot make the page stutter.
 */

// Quiet time required after an interaction before the next request.
const IDLE_AFTER_INTERACTION_MS = 450;
const RETRY_AFTER_INTERACTION_MS = 500;
const NEXT_IMAGE_DELAY_MS = 80;
// Longest wait for idle time once the delay has elapsed.
const IDLE_TIMEOUT_MS = 4000;

const INTERACTION_EVENTS = ['wheel', 'touchmove', 'pointerdown', 'keydown'];

let lastInteractionAt = 0;
let preloadStarted = false;

function markInteraction() {
    lastInteractionAt = Date.now();
}

function listenForInteractions() {
    INTERACTION_EVENTS.forEach(eventName =>
        window.addEventListener(eventName, markInteraction, { passive: true }));
    document.querySelectorAll('.page').forEach(page =>
        page.addEventListener('scroll', markInteraction, { passive: true }));
}

function stopListeningForInteractions() {
    INTERACTION_EVENTS.forEach(eventName =>
        window.removeEventListener(eventName, markInteraction));
    document.querySelectorAll('.page').forEach(page =>
        page.removeEventListener('scroll', markInteraction));
}

function previewsByPriority() {
    const previews = Array.from(document.querySelectorAll('.js-pdf-source'));
    const isPriority = preview => {
        if (preview.closest('.section-stack-item')) return true;
        const slide = preview.closest('.carousel-slide');
        return Boolean(slide) && slide.classList.contains('is-active');
    };
    return [...previews.filter(isPriority), ...previews.filter(preview => !isPriority(preview))];
}

// The delay always elapses first; idle time is then requested where the
// browser can report it (Safari cannot).
function runWhenIdle(callback, delay) {
    setTimeout(() => {
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
        } else {
            callback();
        }
    }, delay);
}

// Background preloading spends data the visitor did not ask for: skipped
// when they asked to save data or when the connection is slow. Decided
// once per visit: it is not retried if the connection improves.
function isConnectionConstrained() {
    const connection = navigator.connection;
    return Boolean(connection)
        && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''));
}

/** Starts fetching the plan previews, one at a time; later calls do nothing. */
export function startBackgroundPreload() {
    if (preloadStarted) return;
    preloadStarted = true;
    if (isConnectionConstrained()) return;

    listenForInteractions();

    // The srcset travels with the address so that the preload requests the
    // same candidate the page will display, not a second file.
    const queue = previewsByPriority()
        .map(preview => ({ src: preview.getAttribute('src'), srcset: preview.getAttribute('srcset') }))
        .filter(entry => entry.src);
    let nextIndex = 0;

    const loadNext = () => {
        if (nextIndex >= queue.length) {
            stopListeningForInteractions();
            return;
        }
        // A hidden tab waits for the visitor to come back instead of polling.
        if (document.visibilityState !== 'visible') {
            document.addEventListener('visibilitychange', loadNext, { once: true });
            return;
        }
        if (Date.now() - lastInteractionAt < IDLE_AFTER_INTERACTION_MS) {
            runWhenIdle(loadNext, RETRY_AFTER_INTERACTION_MS);
            return;
        }

        const entry = queue[nextIndex++];
        const img = new Image();
        img.decoding = 'async';
        // Move on as soon as this one is settled, whether it loaded or not.
        img.onload = img.onerror = () => runWhenIdle(loadNext, NEXT_IMAGE_DELAY_MS);
        if (entry.srcset) img.srcset = entry.srcset;
        img.src = entry.src;
    };

    runWhenIdle(loadNext, 0);
}
