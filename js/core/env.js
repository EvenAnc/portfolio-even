/**
 * Environment detection: input type, available libraries, safe storage access.
 */

// Un appareil est considere tactile s'il n'a pas de survol OU si son
// pointeur est grossier (doigt). Le second critere rattrape les tablettes
// et PC tactiles qui se declarent a tort comme ayant un survol : sans lui
// ils n'avaient NI le survol reel, NI l'equivalent tactile.
export const REQUETE_TACTILE = '(hover: none), (pointer: coarse)';

// GSAP may be missing when its file failed to load; see gsap-fallback.js.
export const gsapMissing = typeof window.gsap === 'undefined';

// ScrollTrigger can load on its own when GSAP did not; it then throws on
// first use, so it only counts when the real GSAP is there to drive it.
export const hasScrollTrigger = !gsapMissing && typeof window.ScrollTrigger !== 'undefined';

// ─────────────────────────────────────
// LANGUE
// ─────────────────────────────────────
// Storage access throws when site data is blocked (privacy settings, some
// embedded browsers). A remembered preference must never stop the page
// from starting, so both directions fail silently.
export function readStored(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function writeStored(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // The preference simply lasts for this visit only.
    }
}
