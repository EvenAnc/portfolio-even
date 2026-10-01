/**
 * Page scroll: one smooth-scroll instance per page, driven by the animation ticker, and the measured scrollbar width.
 */

import { state } from './core/state.js';
import { gsapMissing, hasScrollTrigger } from './core/env.js';

let lenisTickerFn = null;

// ─────────────────────────────────────
// LENIS SCROLL PAR PAGE
// ─────────────────────────────────────
// The ticker callback and the exposed reference both point at the
// instance: they go with it, otherwise the ticker keeps calling raf on
// nothing for the whole page transition.
export function destroyPageLenis() {
    if (lenisTickerFn) {
        gsap.ticker.remove(lenisTickerFn);
        lenisTickerFn = null;
    }
    if (state.scroll) {
        state.scroll.destroy();
        state.scroll = null;
    }
}

export function initPageLenis(scrollContainer) {
    // Lenis takes over the wheel but only moves when the GSAP ticker drives
    // it: without GSAP the page keeps its native scrolling.
    if (typeof Lenis === 'undefined' || gsapMissing) return;

    const contentWrapper = scrollContainer.querySelector('.page-inner') || null;

    const lenisOptions = {
        wrapper: scrollContainer,
        eventsTarget: scrollContainer,  // FIX: cible le container de la page, pas le document entier
        duration: 1.0,                  // FIX: réduit de 1.15 → 1.0 pour un scroll plus réactif
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        wheelMultiplier: 1.0,           // FIX: remplace mouseMultiplier (API Lenis v2)
        touchMultiplier: 1.5,
        smoothTouch: false,
        infinite: false,
        orientation: 'vertical',
    };

    // Only set content if we found a specific wrapper
    if (contentWrapper) {
        lenisOptions.content = contentWrapper;
    }

    const lenis = new Lenis(lenisOptions);

    // FIX Q-07 : garde — si le CDN GSAP/ScrollTrigger n'a pas repondu,
    // cette ligne levait une erreur et stoppait tout le JS de la page.
    if (hasScrollTrigger) lenis.on('scroll', ScrollTrigger.update);

    // BUG-04 FIX : stocker la référence du ticker pour pouvoir le supprimer plus tard
    // et éviter l'accumulation de tickers à chaque navigation entre pages.
    if (lenisTickerFn) {
        gsap.ticker.remove(lenisTickerFn);
    }
    lenisTickerFn = time => lenis.raf(time * 1000);
    gsap.ticker.add(lenisTickerFn);
    gsap.ticker.lagSmoothing(0);

    state.scroll = lenis;
}

// ─────────────────────────────────────
// FIX R-01 — LARGEUR REELLE DE LA BARRE DE DEFILEMENT
// Le footer pleine largeur utilise 100vw, qui INCLUT la barre de
// defilement de .page (4px) : il debordait donc de ~5px sur les 8
// pages, a toutes les tailles d'ecran. On mesure la valeur reelle
// (elle varie : 4px sur Chrome via ::-webkit-scrollbar, autre chose
// sur Firefox « thin », 0px sur les overlay scrollbars de macOS/mobile)
// et la CSS s'en sert via var(--sbw). Valeur de repli : 0px, ce qui
// redonne exactement le comportement d'avant.
// ─────────────────────────────────────
export function updateScrollbarWidth() {
    const page = document.querySelector('.page.is-active') || document.querySelector('.page');
    if (!page) return;
    const sbw = Math.max(0, Math.round(page.offsetWidth - page.clientWidth));
    document.documentElement.style.setProperty('--sbw', sbw + 'px');
}

export function watchScrollbarWidth() {
    // FIX R-01 : mesurer la barre de défilement une fois la page active.
    // ResizeObserver plutôt que l'événement 'resize' seul : la barre peut
    // apparaître ou disparaître sans redimensionnement de fenêtre (contenu
    // qui grandit, images qui se chargent, rotation d'écran sur mobile).
    updateScrollbarWidth();
    if (typeof ResizeObserver !== 'undefined') {
        const sbwObserver = new ResizeObserver(() => updateScrollbarWidth());
        document.querySelectorAll('.page').forEach(pg => sbwObserver.observe(pg));
    }
    let _sbwTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(_sbwTimer);
        _sbwTimer = setTimeout(updateScrollbarWidth, 150);
    }, { passive: true });
}
