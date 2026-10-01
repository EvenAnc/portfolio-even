/**
 * Animation fallback: a minimal stand-in for GSAP that applies the end state of every animation.
 */

import { gsapMissing } from './env.js';

export function installGsapFallback() {
    if (!gsapMissing) return;

    console.warn('[portfolio] GSAP indisponible — mode degrade sans animations.');

    const TWEEN_KEYS = ['duration', 'ease', 'delay', 'onComplete', 'onStart',
                        'onUpdate', 'stagger', 'overwrite', 'repeat', 'yoyo', 'paused'];

    const toElements = (targets) => {
        if (!targets) return [];
        if (typeof targets === 'string') return [...document.querySelectorAll(targets)];
        if (targets instanceof Element) return [targets];
        if (targets.length !== undefined) return [...targets];
        return [];
    };

    const applyVars = (targets, vars) => {
        vars = vars || {};
        toElements(targets).forEach(el => {
            if (!el || !el.style) return;
            const transform = [];
            for (const key in vars) {
                if (TWEEN_KEYS.indexOf(key) !== -1) continue;
                const v = vars[key];
                if (key === 'x')            transform.push('translateX(' + (typeof v === 'number' ? v + 'px' : v) + ')');
                else if (key === 'y')       transform.push('translateY(' + (typeof v === 'number' ? v + 'px' : v) + ')');
                else if (key === 'scale')   transform.push('scale(' + v + ')');
                else if (key === 'rotation')transform.push('rotate(' + v + 'deg)');
                else if (key === 'opacity') el.style.opacity = v;
                else if (key in el.style)   el.style[key] = typeof v === 'number' && key !== 'zIndex' ? v + 'px' : v;
            }
            if (transform.length) el.style.transform = transform.join(' ');
        });
        if (typeof vars.onComplete === 'function') {
            try { vars.onComplete(); } catch (e) { console.error(e); }
        }
        return { kill() {}, pause() {}, play() {}, progress() { return 1; } };
    };

    const chainable = () => {
        const api = {};
        ['to', 'from', 'fromTo', 'set', 'add', 'call', 'pause', 'play', 'kill', 'clear']
            .forEach(m => { api[m] = () => api; });
        return api;
    };

    window.gsap = {
        to:     (t, vars) => applyVars(t, vars),
        set:    (t, vars) => applyVars(t, vars),
        from:   (t, vars) => applyVars(t, {}),
        fromTo: (t, from, to) => applyVars(t, to),
        timeline: chainable,
        ticker: { add() {}, remove() {}, lagSmoothing() {} },
        registerPlugin() {},
        utils: { toArray: toElements }
    };
}
