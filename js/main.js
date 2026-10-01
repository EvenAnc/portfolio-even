/**
 * Entry point: starts every feature in a fixed order.
 *
 * The order matters: the language is applied before anything reads the
 * text, the router displays a page only once every listener is in place,
 * and the touch reveal starts after a page is active.
 */

import { installGsapFallback } from './core/gsap-fallback.js';
import { resolveInitialLanguage, applyLanguage, initLanguageSwitcher } from './i18n/i18n.js';
import { initLightbox } from './lightbox/lightbox.js';
import { initLightboxTriggers } from './lightbox/triggers.js';
import { initFavicon } from './favicon.js';
import { startBackgroundPreload } from './preload.js';
import { watchScrollbarWidth } from './page-scroll.js';
import { playHeroIntro } from './hero.js';
import { resetActivePages, initPageLinks, showInitialPage, initHistory } from './router.js';
import { initMenu } from './menu.js';
import { initSafariPaperCache, initNotebookLines } from './notebook.js';
import { initCarousels } from './carousel.js';
import { initTouchReveal } from './touch-reveal.js';
import { initKeyboardActivation } from './keyboard-activation.js';
import { initCopyEmail, initContactReveal, initContactForm } from './contact.js';

// Delayed so that the preload does not compete with the first display.
const PRELOAD_DELAY_MS = 2500;

// The host caps HTTP caching at ten minutes; the service worker keeps media
// on the visitor's device. Registered after load so that it does not
// compete with the first display.
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const register = () => {
        navigator.serviceWorker.register('sw.js').catch(error => {
            // Harmless: the site works the same, without the long-lived cache.
            console.warn('[portfolio] long-lived cache unavailable:', error.message);
        });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);
}

function init() {
    installGsapFallback();
    // iOS Safari only applies :active styles on a page that listens to touches.
    document.addEventListener('touchstart', () => {}, { passive: true });
    initFavicon();

    applyLanguage(resolveInitialLanguage());
    initLanguageSwitcher();
    initMenu();
    resetActivePages();
    initNotebookLines();
    initSafariPaperCache();
    initPageLinks();
    initContactReveal();
    initContactForm();
    initCarousels();

    initLightbox();
    initLightboxTriggers();
    initCopyEmail();
    initKeyboardActivation();

    showInitialPage();
    initHistory();

    registerServiceWorker();
    setTimeout(startBackgroundPreload, PRELOAD_DELAY_MS);
    watchScrollbarWidth();

    // Must run after the initial page is active.
    initTouchReveal();

    playHeroIntro();
}

// A module runs once the document is parsed; the guard covers a module
// injected before that.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
