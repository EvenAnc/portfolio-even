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
import { initLightboxTriggers, initSectionTriggers } from './lightbox/triggers.js';
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

function init() {
    installGsapFallback();
    initSectionTriggers();
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

    // The host caps HTTP caching at ten minutes; the service worker keeps
    // media on the visitor's device. Registered after load so that it does
    // not compete with the first display.
    if ('serviceWorker' in navigator) {
        const registerServiceWorker = () => {
            navigator.serviceWorker.register('sw.js').catch(err => {
                // Harmless: the site works the same, without the long-lived cache.
                console.warn('[portfolio] long-lived cache unavailable:', err.message);
            });
        };
        if (document.readyState === 'complete') registerServiceWorker();
        else window.addEventListener('load', registerServiceWorker);
    }

    // Delayed so that the preload does not compete with the first display.
    setTimeout(startBackgroundPreload, 2500);

    watchScrollbarWidth();

    // Must run after the initial page is active.
    initTouchReveal();

    playHeroIntro();
}

// Last statement of the file: every import must be evaluated before init
// runs. A module runs once the document is parsed; the guard also covers a
// late injection, when DOMContentLoaded has already fired.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
