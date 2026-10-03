/**
 * Home hero: entrance animation, and the logo that hands over to the
 * header on scroll.
 */

import { state } from './core/state.js';
import { tweenTo, tweenFromTo } from './core/gsap-fallback.js';

// Resting opacity of the scroll hint under the hero. The hint is shown at
// full strength so that its label keeps enough contrast; the thin line is
// dimmed on its own in the stylesheet. Must match .scroll-invite there.
const SCROLL_INVITE_OPACITY = 1;

// Scroll distance past which the hero logo hands over to the header.
const LOGO_HANDOVER_SCROLL_PX = 120;

// Entrance of each part of the hero: start state, then end state.
const INTRO_STEPS = [
    ['#hero-logo-wrap',
        { opacity: 0, y: 40, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.1 }],
    ['.hero-profession',
        { opacity: 0, y: 16, letterSpacing: '0.4em' },
        { opacity: 1, y: 0, letterSpacing: '0.25em', duration: 0.9, ease: 'power2.out', delay: 0.55 }],
    ['.hero-seeking',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.85 }],
    ['#scroll-invite',
        { opacity: 0 },
        { opacity: SCROLL_INVITE_OPACITY, duration: 0.8, delay: 1.5 }],
    ['.home-showcase',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.4 }],
    ['.projects-shortcut',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7 }],
];

// True once the hero logo has handed over to the header.
let logoInHeader = false;
let isNativeScrollBound = false;

/** Plays the entrance of the hero, one frame later so that the page is laid out. */
export function playHeroIntro() {
    requestAnimationFrame(() => {
        INTRO_STEPS.forEach(([selector, from, to]) => {
            const element = document.querySelector(selector);
            if (element) tweenFromTo(element, from, to);
        });
    });
}

/**
 * Puts the hero back in its resting state when the home page is shown.
 * @param {string} pageId
 */
export function resetHero(pageId) {
    if (pageId !== 'home') return;
    logoInHeader = false;
    const heroLogoWrap = document.getElementById('hero-logo-wrap');
    const scrollInvite = document.getElementById('scroll-invite');
    if (heroLogoWrap) gsap.set(heroLogoWrap, { y: 0, opacity: 1 });
    if (scrollInvite) gsap.set(scrollInvite, { opacity: SCROLL_INVITE_OPACITY });
}

/**
 * Past a threshold the hero logo leaves and the header logo takes over;
 * scrolling back up reverses it.
 * @param {HTMLElement} homePage the home page box
 * @param {object|null} lenis its scroll instance, or null when it scrolls natively
 */
export function bindHeroScroll(homePage, lenis) {
    const heroLogoWrap = document.getElementById('hero-logo-wrap');
    const headerLogo = document.getElementById('header-logo');
    const scrollInvite = document.getElementById('scroll-invite');
    if (!heroLogoWrap || !headerLogo || !scrollInvite) return;

    function onScroll(scroll) {
        if (scroll > LOGO_HANDOVER_SCROLL_PX && !logoInHeader) {
            logoInHeader = true;

            tweenTo(heroLogoWrap, {
                y: -50,
                opacity: 0,
                duration: 0.5,
                ease: 'power3.in',
                onComplete: () => headerLogo.classList.add('is-visible'),
            });
            tweenTo(scrollInvite, { opacity: 0, duration: 0.3 });
        } else if (scroll <= LOGO_HANDOVER_SCROLL_PX && logoInHeader) {
            logoInHeader = false;

            headerLogo.classList.remove('is-visible');
            tweenTo(heroLogoWrap, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
            tweenTo(scrollInvite, { opacity: SCROLL_INVITE_OPACITY, duration: 0.4 });
        }
    }

    if (lenis) {
        lenis.on('scroll', ({ scroll }) => onScroll(scroll));
    } else if (!isNativeScrollBound) {
        // The page element outlives every scroll instance: bound once, and
        // silent whenever an instance is reporting the scroll itself.
        isNativeScrollBound = true;
        homePage.addEventListener('scroll', () => {
            if (!state.scroll && state.page === 'home') onScroll(homePage.scrollTop);
        }, { passive: true });
    }
}
