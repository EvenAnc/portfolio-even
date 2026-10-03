/**
 * Animation helpers: tweens that jump to their end state under reduced
 * motion, and a minimal stand-in for GSAP, installed only when the library
 * failed to load. The stand-in applies the end state of every animation at
 * once, so the site stays fully usable, just without transitions.
 */

import { gsapMissing, prefersReducedMotion } from './env.js';

// Tween settings, as opposed to the properties being animated.
const TWEEN_KEYS = ['duration', 'ease', 'delay', 'onComplete', 'onStart',
    'onUpdate', 'stagger', 'overwrite', 'repeat', 'yoyo', 'paused'];

// Settings that spread a tween over time; without them it is a plain set.
const TIMING_KEYS = ['duration', 'ease', 'delay', 'stagger', 'onComplete'];

// gsap.set would honour a delay and skip nothing else, so the timing is
// removed and the completion callback is run by hand.
function jumpToEnd(targets, vars) {
    const endState = { ...vars };
    TIMING_KEYS.forEach(key => delete endState[key]);
    gsap.set(targets, endState);
    if (typeof vars.onComplete === 'function') vars.onComplete();
}

/**
 * gsap.to, or its end state at once under reduced motion.
 * @param {Element|NodeList|Array} targets
 * @param {object} vars
 */
export function tweenTo(targets, vars) {
    if (prefersReducedMotion()) jumpToEnd(targets, vars);
    else gsap.to(targets, vars);
}

/**
 * gsap.fromTo, or its end state at once under reduced motion.
 * @param {Element|NodeList|Array} targets
 * @param {object} from
 * @param {object} to
 */
export function tweenFromTo(targets, from, to) {
    if (prefersReducedMotion()) jumpToEnd(targets, to);
    else gsap.fromTo(targets, from, to);
}

const toPx = value => (typeof value === 'number' ? `${value}px` : value);

const TRANSFORMS = {
    x: value => `translateX(${toPx(value)})`,
    y: value => `translateY(${toPx(value)})`,
    scale: value => `scale(${value})`,
    rotation: value => `rotate(${value}deg)`,
    rotate: value => `rotate(${value}deg)`,
};

function toElements(targets) {
    if (!targets) return [];
    if (typeof targets === 'string') return [...document.querySelectorAll(targets)];
    if (targets instanceof Element) return [targets];
    if (targets.length !== undefined) return [...targets];
    return [];
}

function applyEndState(element, vars) {
    if (!element || !element.style) return;
    const transform = [];
    Object.keys(vars).forEach(key => {
        if (TWEEN_KEYS.includes(key)) return;
        const value = vars[key];
        if (key in TRANSFORMS) transform.push(TRANSFORMS[key](value));
        else if (key === 'opacity' || key === 'zIndex') element.style[key] = value;
        else if (key in element.style) element.style[key] = toPx(value);
    });
    if (transform.length) element.style.transform = transform.join(' ');
}

function applyVars(targets, vars = {}) {
    toElements(targets).forEach(element => applyEndState(element, vars));
    if (typeof vars.onComplete === 'function') {
        try {
            vars.onComplete();
        } catch (error) {
            console.error(error);
        }
    }
    return { kill() {}, pause() {}, play() {}, progress: () => 1 };
}

function chainable() {
    const api = {};
    ['to', 'from', 'fromTo', 'set', 'add', 'call', 'pause', 'play', 'kill', 'clear']
        .forEach(method => { api[method] = () => api; });
    return api;
}

/** Defines a global `gsap` that jumps to end states; does nothing when GSAP loaded. */
export function installGsapFallback() {
    if (!gsapMissing) return;

    console.warn('[portfolio] GSAP unavailable: running without animations.');

    window.gsap = {
        to: applyVars,
        set: applyVars,
        // The end state of a "from" tween is the element as it stands.
        from: (targets, vars = {}) => applyVars(targets, { onComplete: vars.onComplete }),
        fromTo: (targets, from, to) => applyVars(targets, to),
        timeline: chainable,
        ticker: { add() {}, remove() {}, lagSmoothing() {} },
        registerPlugin() {},
        utils: { toArray: toElements },
    };
}
