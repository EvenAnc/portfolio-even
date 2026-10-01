/**
 * Portfolio Even ANICET — app.js V3
 * SPA + Logo Bandeau Scroll + Contact = scroll bas accueil
 * Rectangle SVG dessiné main + Menu habillé + Carrousel inertie
 */

import { installGsapFallback } from './core/gsap-fallback.js';
import { resolveInitialLanguage, applyLang, initLangSwitcher } from './i18n/i18n.js';
import { initLightbox } from './lightbox/lightbox.js';
import { initLightboxTriggers, initSectionTriggers } from './lightbox/triggers.js';
import { animateFavicon } from './favicon.js';
import { demarrerPrechargeFond } from './preload.js';
import { watchScrollbarWidth } from './page-scroll.js';
import { playHeroIntro } from './hero.js';
import { initSPA, initNextPageLinks, showInitialPage, initHistory } from './router.js';
import { initMenu } from './menu.js';
import { initPapierSafari, initNotebookLines } from './notebook.js';
import { initBDCarousel } from './carousel.js';
import { initScrollAnimationsMobile } from './touch-reveal.js';
import { initKeyboardActivation } from './keyboard-activation.js';
import { initCopyEmail, initContactAnimation, initContactForm } from './contact.js';

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────
function init() {
    installGsapFallback();
    initSectionTriggers();
    animateFavicon();

    applyLang(resolveInitialLanguage());
    initLangSwitcher();
    initMenu();
    initSPA();
    initNotebookLines();
    initPapierSafari();
    initNextPageLinks();
    initContactAnimation();
    initContactForm();
    initBDCarousel();

    initLightbox();
    initLightboxTriggers();
    initCopyEmail();
    initKeyboardActivation();

    showInitialPage();
    initHistory();

    // CACHE-01 : cache longue durée via un service worker.
    // GitHub Pages force un cache de 10 minutes seulement, non modifiable :
    // passé ce délai un visiteur qui revient retélécharge tout. Le service
    // worker garde les médias sur son disque et les ressert instantanément.
    // Enregistré après le chargement pour ne pas concurrencer l'affichage.
    if ('serviceWorker' in navigator) {
        const registerServiceWorker = () => {
            navigator.serviceWorker.register('sw.js').catch(err => {
                // Un échec ici n'a aucune conséquence : le site fonctionne
                // exactement comme avant, simplement sans cache longue durée.
                console.warn('[portfolio] cache longue durée indisponible :', err.message);
            });
        };
        if (document.readyState === 'complete') registerServiceWorker();
        else window.addEventListener('load', registerServiceWorker);
    }

    // PERF-04 : préparer les plans en fond, une fois l'accueil installé.
    // 2,5 s de délai pour ne pas concurrencer l'affichage initial.
    setTimeout(demarrerPrechargeFond, 2500);

    watchScrollbarWidth();

    // Animations au scroll pour les appareils tactiles (mobile)
    // Appelé APRÈS showPage pour que is-active soit bien présent
    initScrollAnimationsMobile();

    playHeroIntro();

}

// Last statement of the file: every declaration above must exist before
// init runs. A module runs once the document is parsed; the guard also covers a
// late injection, when DOMContentLoaded has already fired.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
