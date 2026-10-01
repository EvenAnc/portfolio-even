/**
 * Touch reveal: on touch devices, plays on scroll the animations that a pointer triggers on hover.
 */

import { TOUCH_MEDIA_QUERY } from './core/env.js';

// ─────────────────────────────────────
// ─────────────────────────────────────
// ANIMATIONS AU SCROLL — MOBILE TOUCH
// Remplace les effets de survol sur les appareils tactiles
// ─────────────────────────────────────
// Reglages du declenchement tactile — voir initTouchReveal
const TOUCH_REVEAL_THRESHOLD  = 0.35;   // l'element doit etre franchement a l'ecran

const TOUCH_REVEAL_ROOT_MARGIN  = '0px 0px -12% 0px';

const TOUCH_REVEAL_DELAY_MS  = 160;    // ms : laisse le temps de poser le regard

// Pending reveal of each observed element.
const revealTimers = new WeakMap();

export function initTouchReveal() {
    const mq = window.matchMedia(TOUCH_MEDIA_QUERY);
    if (!mq.matches) {
        // Le mode peut changer en cours de route : tablette dont on detache
        // le clavier, fenetre passee sur un ecran tactile. On reessaie alors
        // au lieu d'abandonner definitivement.
        const retry = () => {
            if (mq.matches) {
                mq.removeEventListener('change', retry);
                initTouchReveal();
            }
        };
        mq.addEventListener('change', retry);
        return;
    }

    // Sélecteurs à observer — même liste que les éléments animés en CSS
    const SELECTORS = [
        '.drawing-item',
        '.ci-block',
        '.fg',
        '.notebook-section',
        '.home-projects-shortcut',
    ].join(', ');

    // BUG ANDROID FIX : Le scroll se fait à l'intérieur des éléments .page
    // (overflow-y: auto), pas dans le viewport du navigateur.
    // Il faut donc créer un IntersectionObserver PAR PAGE avec root = la page,
    // sinon le navigateur considère que tout est "dans le viewport" car .page
    // couvre tout l'écran en position: absolute.
    const pageObservers = new Map(); // page element → IntersectionObserver

    function createObserverForPage(page) {
        if (pageObservers.has(page)) return pageObservers.get(page);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    // Micro-delai avant de declencher : si le visiteur fait
                    // defiler vite, l'animation est annulee plutot que de
                    // clignoter au passage. S'il s'arrete, elle demarre sous
                    // ses yeux — c'est l'equivalent tactile du survol.
                    if (revealTimers.has(el)) return;
                    revealTimers.set(el, setTimeout(() => {
                        el.classList.add('is-inview');
                        revealTimers.delete(el);
                    }, TOUCH_REVEAL_DELAY_MS));
                } else {
                    // Sorti de l'ecran : on annule un declenchement en attente
                    // et on retire l'etat, pour que l'element rejoue son
                    // animation au prochain passage — comme un survol repete.
                    if (revealTimers.has(el)) {
                        clearTimeout(revealTimers.get(el));
                        revealTimers.delete(el);
                    }
                    el.classList.remove('is-inview');
                }
            });
        }, {
            // Seuil releve : a 0,05 l'animation partait alors que l'element
            // affleurait a peine le bas de l'ecran, souvent hors du regard.
            threshold: TOUCH_REVEAL_THRESHOLD,
            rootMargin: TOUCH_REVEAL_ROOT_MARGIN
        });

        pageObservers.set(page, observer);
        return observer;
    }

    // Observer tous les éléments d'une page donnée
    function observeInPage(page) {
        const observer = createObserverForPage(page);
        page.querySelectorAll(SELECTORS).forEach(el => {
            if (!el.dataset.mobileObserved) {
                el.dataset.mobileObserved = '1';
                observer.observe(el);
            }
        });
    }

    // Lancement initial sur la page home (déjà active au moment de l'appel)
    const homePage = document.getElementById('page-home');
    if (homePage) {
        // Léger délai pour s'assurer que showPage() a bien ajouté is-active
        // et que le layout est statisé
        setTimeout(() => observeInPage(homePage), 300);
    }

    // A deep link activates its page before the class watchers below exist,
    // so they never fire for it: observe the page that is already active.
    const activePage = document.querySelector('.page.is-active');
    if (activePage && activePage !== homePage) {
        setTimeout(() => observeInPage(activePage), 300);
    }

    // Pour chaque autre page : observer dès qu'elle devient active (navigation SPA)
    document.querySelectorAll('.page').forEach(page => {
        if (page.id === 'page-home') return; // déjà géré ci-dessus

        const mutObserver = new MutationObserver(() => {
            if (page.classList.contains('is-active')) {
                // Délai pour laisser la transition de page se terminer
                setTimeout(() => observeInPage(page), 450);
            }
        });
        mutObserver.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
}
