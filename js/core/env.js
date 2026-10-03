/**
 * Environment detection: input type, motion preference, available
 * libraries, and storage access that cannot throw.
 *
 * The libraries are classic scripts loaded before the modules. They are
 * reached through their globals: gsap, ScrollTrigger and Lenis from the
 * start, pdfjsLib once pdf-renderer.js has injected it.
 */

// A device counts as touch when it has no hover OR when its pointer is
// coarse. The second test catches tablets and touch laptops that wrongly
// report a hover capability.
export const TOUCH_MEDIA_QUERY = '(hover: none), (pointer: coarse)';

// Horizontal travel beyond which a touch counts as a swipe.
export const SWIPE_MIN_DISTANCE_PX = 40;

/**
 * @returns {boolean} true on a touch-first device
 */
export function isTouch() {
    return window.matchMedia(TOUCH_MEDIA_QUERY).matches;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * @returns {boolean} true when the visitor asked for reduced motion
 */
export function prefersReducedMotion() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Follows the motion preference when it is switched during the visit.
 * @param {(isReduced: boolean) => void} handler
 */
export function onReducedMotionChange(handler) {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    // Safari 13 and older only have the deprecated addListener; they keep
    // the preference read at each use.
    if (query.addEventListener) query.addEventListener('change', () => handler(query.matches));
}

// GSAP is missing when its file failed to load; see gsap-fallback.js.
export const gsapMissing = typeof gsap === 'undefined';

// ScrollTrigger can load on its own when GSAP did not; it then throws on
// first use, so it only counts when the real GSAP is there to drive it.
export const hasScrollTrigger = !gsapMissing && typeof ScrollTrigger !== 'undefined';

/**
 * Reads a stored preference. Storage access throws when site data is
 * blocked (privacy settings, some embedded browsers); a remembered
 * preference must never stop the page from starting.
 * @param {string} key
 * @returns {string|null} null when absent or unreadable
 */
export function readStored(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

/**
 * Stores a preference; fails silently, like readStored.
 * @param {string} key
 * @param {string} value
 */
export function writeStored(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // The preference simply lasts for this visit only.
    }
}
