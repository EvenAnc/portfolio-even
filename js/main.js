/**
 * Portfolio Even ANICET — app.js V3
 * SPA + Logo Bandeau Scroll + Contact = scroll bas accueil
 * Rectangle SVG dessiné main + Menu habillé + Carrousel inertie
 */

import { state } from './core/state.js';
import { REQUETE_TACTILE, gsapMissing, hasScrollTrigger } from './core/env.js';
import { installGsapFallback } from './core/gsap-fallback.js';
import { t, resolveInitialLanguage, majMetaPage, applyLang, initLangSwitcher } from './i18n/i18n.js';
import { allDrawings, diplomePlans, diplomeCoupes, diplomeAnalyses } from './lightbox/galleries.js';
import { animateFavicon } from './favicon.js';
import { demarrerPrechargeFond } from './preload.js';

// Au doigt, un appui ouvre la visionneuse instantanement : le rectangle
// rouge n'a pas le temps de se dessiner, et Even ne voit jamais
// l'animation qu'il voit pourtant a la souris. On retient donc
// l'ouverture juste assez pour la laisser se jouer en entier.
//
// 1,5 s (la duree du trace a la souris) serait insupportable sur un
// appui. Le trace est donc accelere a 0,40 s cote CSS, et l'ouverture
// attend 0,46 s : l'animation se termine, puis la visionneuse s'ouvre.
// En dessous de ~0,3 s on ne percoit rien ; au-dela de ~0,5 s l'appui
// commence a sembler ignore.
const TACTILE_TRACE = 460;

// Joue le trace du cadre rouge, puis execute l'action. A la souris —
// ou si l'element n'a pas de cadre a dessiner — rien n'est retarde.
function tracerPuis(element, action) {
    if (!window.matchMedia(REQUETE_TACTILE).matches) { action(); return; }

    const cadre = element.closest('.frame-wrap');
    if (!cadre || !cadre.querySelector('.sketch-rect-svg')) { action(); return; }

    // Un second appui pendant l'animation ne doit pas ouvrir deux fois.
    if (cadre.dataset.traceEnCours) return;
    cadre.dataset.traceEnCours = '1';
    cadre.classList.add('trace-tactile');

    setTimeout(() => {
        cadre.classList.remove('trace-tactile');
        delete cadre.dataset.traceEnCours;
        // The page may have changed while the frame was being drawn.
        if (element.closest('.page') && !element.closest('.page.is-active')) return;
        action();
    }, TACTILE_TRACE);
}

// ─────────────────────────────────────
// FIX Q-07 — FILET DE SECURITE CDN
// GSAP, ScrollTrigger, Lenis et PDF.js viennent de CDN externes.
// Si l'un d'eux ne repond pas, le premier appel gsap.* levait une
// erreur et TOUT le JavaScript s'arretait : site fige sur le hero,
// menu compris. Ce shim n'est installe QUE si gsap est absent ; il
// applique instantanement l'etat final de chaque animation.
// Resultat : le site reste entierement navigable, simplement sans
// transitions. Quand le CDN repond normalement, ce bloc ne fait rien.
// ─────────────────────────────────────

// Resting opacity of the scroll hint under the hero. The hint is shown at
// full strength so that its label keeps enough contrast; the thin line is
// dimmed on its own in the stylesheet. Must match .scroll-invite there.
const SCROLL_INVITE_OPACITY = 1;

let isMenuOpen  = false;
let lenis       = null;
let _historyInitialised = false;
let lenisTickerFn = null;
let openDrawingGallery = null;
let closeDrawingLightbox = null;

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────
function init() {
    installGsapFallback();
    initCoupeClicks();
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

    initDrawingLightbox();
    initCopyEmail();
    initKeyboardActivation();

    // Révéler la page correspondant à l'adresse demandée (accueil par défaut).
    // Un fragment inconnu retombe sur l'accueil plutôt que sur une page blanche.
    const demandee = pageFromHash();
    const pageInitiale = (demandee && demandee !== 'contact') ? demandee : 'home';
    // updateHistory=false pour #contact : showPage remettrait l'adresse a
    // celle de l'accueil et effacerait le fragment, si bien qu'un
    // rafraichissement ne ramenerait plus au bloc contact.
    showPage(pageInitiale, false, demandee !== 'contact');
    if (demandee === 'contact') {
        history.replaceState({ page: 'contact' }, '', '#contact');
    }
    // The landing entry now exists whichever branch ran: the next
    // navigation must add an entry, not overwrite this one.
    _historyInitialised = true;

    // Fragment inconnu (vieux lien, faute de frappe) : on est retombe sur
    // l'accueil, on nettoie aussi la barre d'adresse pour ne pas laisser
    // une adresse qui a l'air cassee.
    if (demandee === null) {
        history.replaceState({ page: 'home' }, '', location.pathname + location.search);
    }

    // Ouverture directe sur #contact : afficher l'accueil puis descendre.
    if (demandee === 'contact') {
        setTimeout(scrollToContactSection, 600);
    }

    // Boutons Précédent / Suivant du navigateur, et geste de retour sur mobile.
    // updateHistory=false : on suit l'historique, on n'y ajoute rien.
    window.addEventListener('popstate', () => {
        closeOverlays();
        const cible = pageFromHash();
        if (cible === 'contact') {
            revealContact();
            return;
        }
        if ((cible || 'home') === 'home' && state.page === 'home') {
            scrollHomeToTop();
            return;
        }
        showPage(cible || 'home', true, false);
    });

    // Adresse modifiée à la main dans la barre du navigateur.
    window.addEventListener('hashchange', () => {
        closeOverlays();
        const cible = pageFromHash();
        if (cible === null) {
            // adresse inconnue saisie a la main : repli sur l'accueil
            showPage('home', true, false);
            history.replaceState({ page: 'home' }, '', location.pathname + location.search);
            return;
        }
        if (cible === 'home' && state.page === 'home') {
            scrollHomeToTop();
        } else if (cible !== 'contact' && cible !== state.page) {
            showPage(cible, true, false);
        }
    });

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

    // Animations au scroll pour les appareils tactiles (mobile)
    // Appelé APRÈS showPage pour que is-active soit bien présent
    initScrollAnimationsMobile();

    // Animation d'entrée du hero — décalée pour laisser la page se monter
    requestAnimationFrame(() => {
        const heroWrap  = document.getElementById('hero-logo-wrap');
        const profession = document.querySelector('.hero-profession');
        const scrollInv = document.getElementById('scroll-invite');
        const showcase  = document.querySelector('.home-showcase');
        const shortcut  = document.querySelector('.home-projects-shortcut');

        if (heroWrap) {
            gsap.fromTo(heroWrap,
                { opacity: 0, y: 40, scale: 0.94 },
                { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.1 }
            );
        }
        if (profession) {
            gsap.fromTo(profession,
                { opacity: 0, y: 16, letterSpacing: '0.4em' },
                { opacity: 1, y: 0, letterSpacing: '0.25em', duration: 0.9, ease: 'power2.out', delay: 0.55 }
            );
        }
        const seeking = document.querySelector('.hero-seeking');
        if (seeking) {
            gsap.fromTo(seeking,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.85 }
            );
        }
        if (scrollInv) {
            gsap.fromTo(scrollInv,
                { opacity: 0 },
                { opacity: SCROLL_INVITE_OPACITY, duration: 0.8, delay: 1.5 }
            );
        }
        if (showcase) {
            gsap.fromTo(showcase,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.4 }
            );
        }
        if (shortcut) {
            gsap.fromTo(shortcut,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7 }
            );
        }
    });
}

// ─────────────────────────────────────
// FIX P-01c — REVEIL DES IMAGES A L'OUVERTURE D'UNE PAGE
// Les pages inactives sont en content-visibility:hidden : le navigateur
// saute entierement leur rendu, ce qui est precisement l'effet recherche
// (c'est ce qui fait tomber le chargement initial de 47,5 Mo a 1,5 Mo).
// Corollaire : le declenchement de loading="lazy" repose sur le calcul
// d'intersection, qui n'a pas lieu dans un sous-arbre non rendu. On ne
// laisse donc pas au navigateur le soin de rattraper le coup : a
// l'ouverture d'une page, on bascule explicitement SES images en
// chargement immediat. Chaque page ne charge ainsi que ses propres
// images, et seulement quand on l'ouvre.
// ─────────────────────────────────────
function hydratePageImages(pageEl) {
    if (!pageEl) return;
    pageEl.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'eager';
        // relance le telechargement si le navigateur l'avait mis de cote
        if (!img.complete || img.naturalWidth === 0) {
            const src = img.getAttribute('src');
            if (src) { img.setAttribute('src', src); }
        }
    });
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
function updateScrollbarWidth() {
    const page = document.querySelector('.page.is-active') || document.querySelector('.page');
    if (!page) return;
    const sbw = Math.max(0, Math.round(page.offsetWidth - page.clientWidth));
    document.documentElement.style.setProperty('--sbw', sbw + 'px');
}

// ─────────────────────────────────────
// MENU OVERLAY
// ─────────────────────────────────────
function initMenu() {
    const burger = document.getElementById('burger-btn');
    burger.addEventListener('click', toggleMenu);

    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showPage('projects');
        });
    }

    // Clic sur item du menu
    document.querySelectorAll('.menu-nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const page = item.dataset.page;
            closeMenu();

            if (page === 'contact') {
                // CONTACT → aller sur la page accueil puis scroller vers le bas
                goToContact(420);
            } else {
                setTimeout(() => showPage(page), 420);
            }
        });
    });

    // Logo header → retour accueil
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
        headerLogo.addEventListener('click', e => {
            e.preventDefault();
            if (state.page !== 'home') showPage('home');
        });
    }

    // Clic sur l'arrière-plan du menu (partie grise) pour revenir en arrière
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
        menuOverlay.setAttribute('aria-hidden', 'true');
        menuOverlay.addEventListener('click', e => {
            if (!e.target.closest('a') && !e.target.closest('button')) {
                closeMenu();
            }
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape' || !isMenuOpen) return;
        closeMenu();
        // Focus was on a menu link that has just become hidden.
        burger.focus({ preventScroll: true });
    });
}

function toggleMenu() {
    isMenuOpen ? closeMenu() : openMenu();
}

function openMenu() {
    isMenuOpen = true;
    document.body.classList.add('menu-open');
    // BUG-12 FIX : mettre à jour aria-hidden pour les screen readers
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) menuOverlay.setAttribute('aria-hidden', 'false');
    setBurgerExpanded(true);

    // Animation d'entrée des items avec décalage vertical
    const items = document.querySelectorAll('.menu-nav-item');
    gsap.fromTo(items, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1,
        duration: 0.55, stagger: 0.065,
        ease: 'power3.out',
        delay: 0.12
    });

    // Animer le logo du menu
    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
        gsap.fromTo(menuLogo,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.05 }
        );
    }

    // Animer le scribble
    const scribble = document.querySelector('.menu-scribble');
    if (scribble) {
        gsap.fromTo(scribble,
            { opacity: 0, rotate: -15 },
            { opacity: 0.35, rotate: -8, duration: 0.5, delay: 0.5 }
        );
    }
}

function closeMenu() {
    isMenuOpen = false;
    document.body.classList.remove('menu-open');
    // BUG-12 FIX : mettre à jour aria-hidden pour les screen readers
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) menuOverlay.setAttribute('aria-hidden', 'true');
    setBurgerExpanded(false);
}

function setBurgerExpanded(expanded) {
    const burger = document.getElementById('burger-btn');
    if (burger) burger.setAttribute('aria-expanded', String(expanded));
}

// Click-only elements (cards, sheets, dots) become reachable and operable
// from the keyboard without touching their markup or their look: focusable,
// announced as buttons, activated by Enter or Space.
function makeKeyboardActivable(el, label) {
    if (el.closest('a[href], button')) return;
    el.setAttribute('role', 'button');
    // Sheets of a carousel that are not on display stay out of the tab order.
    el.setAttribute('tabindex', el.closest('.bd-slide:not(.active)') ? '-1' : '0');
    if (label) el.setAttribute('aria-label', label);
    el.addEventListener('keydown', e => {
        if (e.target !== el || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        el.click();
    });
}

function initKeyboardActivation() {
    const activable = [
        '.polaroid-card',
        '#page-drawings .drawing-item .frame-wrap',
        '.bd-slide .drawing-sheet-wrap',
        '[data-coupe-gallery] .stack-item[data-coupe-index]',
        '.single-lightbox-trigger',
    ].join(', ');
    document.querySelectorAll(activable).forEach(el => makeKeyboardActivable(el));
    // "Page" reads the same in both languages, so this name needs no
    // dictionary entry.
    document.querySelectorAll('.bd-dot').forEach(dot => {
        makeKeyboardActivable(dot, 'Page ' + (Number(dot.dataset.goto) + 1));
    });
}

// History navigation swaps the page underneath: an overlay left open would
// cover the new page and keep scrolling locked.
function closeOverlays() {
    if (closeDrawingLightbox) closeDrawingLightbox();
    if (isMenuOpen) closeMenu();
}

// ─────────────────────────────────────
// SPA — GESTION DES PAGES
// ─────────────────────────────────────
function initSPA() {
    document.querySelectorAll('.page').forEach(p => {
        // Hidden state is set here rather than in the markup: declared
        // statically it would hide focusable content from assistive
        // technology even if this script never ran.
        p.setAttribute('aria-hidden', 'true');
        p.classList.remove('is-active');
    });
}

// ─────────────────────────────────────
// FIX Q-03 — ADRESSES PARTAGEABLES ET BOUTON RETOUR
// Avant : une seule URL pour tout le site. Le bouton Retour du
// navigateur (et le geste de retour sur mobile, le plus utilise de
// tous) faisait SORTIR du site, impossible d'envoyer un lien vers un
// projet precis, et un rafraichissement ramenait toujours a l'accueil.
//
// Routage par fragment (#dessins) et non par chemin (/dessins) : sur
// un hebergement statique comme GitHub Pages, un chemin exigerait une
// redirection via 404.html, avec un clignotement a chaque ouverture.
// Le fragment fonctionne partout, sans configuration serveur.
//
// La logique est placee DANS showPage() : les points d'appel existants
// (menu, fleches page suivante, logo, bouton retour) en beneficient
// sans etre modifies.
// ─────────────────────────────────────
const PAGE_SLUGS = {
    'home':            '',
    'projects':        'projets',
    'project-diploma': 'projet-diplome',
    'project-2':       'projet-paterr-suisse',
    'project-3':       'projet-03',
    'drawings':        'dessins',
    'diploma':         'diplome',
    'hobbies':         'hobbies',
};
// A Map, not a plain object: fragments such as #constructor would otherwise
// resolve to members inherited from Object.prototype.
const SLUG_TO_PAGE = new Map(
    Object.entries(PAGE_SLUGS).filter(([, slug]) => slug).map(([id, slug]) => [slug, id])
);

// Lit le fragment courant. Renvoie null si l'adresse ne correspond a rien
// de connu, pour qu'un vieux lien casse retombe proprement sur l'accueil.
function pageFromHash() {
    let raw;
    try {
        raw = decodeURIComponent((location.hash || '').replace(/^#/, '')).trim();
    } catch {
        // A malformed escape sequence (#%) is just another unknown address.
        return null;
    }
    if (!raw) return 'home';
    if (raw === 'contact') return 'contact';
    return SLUG_TO_PAGE.get(raw) || null;
}

function urlForPage(pageId) {
    const slug = PAGE_SLUGS[pageId];
    // location.search est conserve : sans lui, naviguer depuis /?lang=en
    // ramenait silencieusement le visiteur au francais.
    const base = location.pathname + location.search;
    return slug ? base + '#' + slug : base;
}

// Amene le visiteur au bloc Contact, en bas de la page d'accueil.
// Extrait ici parce que trois chemins y menent : le menu, les fleches
// « page suivante », et desormais l'ouverture directe sur #contact.
function scrollToContactSection() {
    const contactEl = document.getElementById('home-contact');
    // On another page the scroller would be asked to reach an element it
    // does not contain.
    if (!contactEl || state.page !== 'home') return;
    if (window._lenis) {
        window._lenis.scrollTo(contactEl, { offset: -40, duration: 1.2 });
    } else {
        const homeEl = document.getElementById('page-home');
        if (homeEl) homeEl.scrollTo({ top: contactEl.offsetTop - 40, behavior: 'smooth' });
    }
}

// Contact is the bottom of the home page: bring home in if needed, then
// scroll once its transition has settled. Never touches the history, so
// the caller decides whether this navigation adds an entry.
function revealContact(outerDelay = 0) {
    cancelContactReveal();
    const wasOnHome = state.page === 'home';
    contactTimers.push(setTimeout(() => {
        // The visitor may have gone back while the menu was closing.
        if (pageFromHash() !== 'contact') return;
        if (state.page !== 'home') showPage('home', true, false);
        contactTimers.push(setTimeout(scrollToContactSection, wasOnHome ? 100 : 750));
    }, outerDelay));
}

// A reveal still pending belongs to a navigation that has been superseded:
// left alone, it would switch page or scroll after the visitor moved on.
let contactTimers = [];
function cancelContactReveal() {
    contactTimers.forEach(clearTimeout);
    contactTimers = [];
}

// Leaving the #contact entry for the plain home address stays on the same
// page, so the only thing left to undo is the scroll.
function scrollHomeToTop() {
    cancelContactReveal();
    if (window._lenis) {
        window._lenis.scrollTo(0);
    } else {
        const homeEl = document.getElementById('page-home');
        if (homeEl) homeEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// One navigation, one history entry: the #contact entry stands for the
// whole move, including the switch to the home page.
function goToContact(outerDelay) {
    revealContact(outerDelay);
    if (location.hash !== '#contact') {
        history.pushState({ page: 'contact' }, '', location.pathname + location.search + '#contact');
        _historyInitialised = true;
    }
}

function showPage(pageId, animate = true, updateHistory = true) {
    if (pageId === state.page && animate) return;
    cancelContactReveal();

    const outEl = document.getElementById(`page-${state.page}`);
    const inEl  = document.getElementById(`page-${pageId}`);
    if (!inEl) return;

    state.page = pageId;
    majMetaPage(pageId);

    // The only page with PDF sheets: fetch the library ahead of the first
    // opening. A failure here is retried when a sheet is opened.
    if (pageId === 'project-diploma') loadPdfJs().catch(() => {});

    // Synchronise l'adresse. replaceState au tout premier affichage pour ne
    // pas creer une entree d'historique fantome avant meme la 1re navigation.
    if (updateHistory) {
        const url = urlForPage(pageId);
        const method = _historyInitialised ? 'pushState' : 'replaceState';
        history[method]({ page: pageId }, '', url);
        _historyInitialised = true;
    }

    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        const surProjet = pageId.startsWith('project-');
        backBtn.style.display = surProjet ? 'flex' : 'none';
        // Sur telephone le bouton retour et le logo centre se chevauchent
        // (mesure : 74px de recouvrement sur un ecran de 412px). La CSS
        // s'appuie sur cette classe pour masquer le logo dans ce cas.
        document.body.classList.toggle('a-bouton-retour', surProjet);
    }

    // Détruire le Lenis de l'ancienne page
    destroyPageLenis();

    if (!animate || !outEl) {
        if (outEl) {
            outEl.classList.remove('is-active');
            outEl.setAttribute('aria-hidden', 'true');
        }
        inEl.classList.add('is-active');
        inEl.setAttribute('aria-hidden', 'false');
        inEl.scrollTop = 0;
        resetHomeHero(pageId);
        initPageLenis(inEl);
        if (hasScrollTrigger) ScrollTrigger.refresh();
        updateHeaderLogo(pageId);
        
        hydratePageImages(inEl);
        updateScrollbarWidth();
        return;
    }

    // Transition GSAP
    gsap.to(outEl, {
        opacity: 0, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
            outEl.classList.remove('is-active');
            outEl.setAttribute('aria-hidden', 'true');
            outEl.style.opacity = '';

            inEl.classList.add('is-active');
            inEl.setAttribute('aria-hidden', 'false');
            inEl.scrollTop = 0;
            resetHomeHero(pageId);

            gsap.fromTo(inEl,
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
            );

            initPageLenis(inEl);
            if (hasScrollTrigger) ScrollTrigger.refresh();
            updateHeaderLogo(pageId);

            hydratePageImages(inEl);
            updateScrollbarWidth();
            focusPage(inEl);
        }
    });
}

// Pages scroll inside their own box: unless focus sits in the visible one,
// Space and PageDown scroll nothing after a navigation. Not done on the
// first display, where focus must stay at the top of the document.
function focusPage(pageEl) {
    if (!pageEl.hasAttribute('tabindex')) pageEl.setAttribute('tabindex', '-1');
    pageEl.focus({ preventScroll: true });
}

// Quand on revient sur la page home, remettre le hero logo en état initial
function resetHomeHero(pageId) {
    if (pageId !== 'home') return;
    const heroLogoWrap = document.getElementById('hero-logo-wrap');
    const scrollInvite = document.getElementById('scroll-invite');
    if (heroLogoWrap) {
        gsap.set(heroLogoWrap, { y: 0, opacity: 1 });
    }
    if (scrollInvite) {
        gsap.set(scrollInvite, { opacity: SCROLL_INVITE_OPACITY });
    }
}

// ─────────────────────────────────────
// LOGO BANDEAU — APPARAÎT AU SCROLL SUR HOME
// ─────────────────────────────────────
function updateHeaderLogo(pageId) {
    const headerLogo = document.getElementById('header-logo');
    if (!headerLogo) return;

    if (pageId === 'home') {
        // Sur la page home, masquer le logo header (le hero logo est visible)
        headerLogo.classList.remove('is-visible');
    } else {
        // Sur les autres pages, afficher le logo header
        headerLogo.classList.add('is-visible');
    }
}

// ─────────────────────────────────────
// LENIS SCROLL PAR PAGE
// ─────────────────────────────────────
// The ticker callback and the exposed reference both point at the
// instance: they go with it, otherwise the ticker keeps calling raf on
// nothing for the whole page transition.
function destroyPageLenis() {
    if (lenisTickerFn) {
        gsap.ticker.remove(lenisTickerFn);
        lenisTickerFn = null;
    }
    if (lenis) {
        lenis.destroy();
        lenis = null;
    }
    window._lenis = null;
}

function initPageLenis(scrollContainer) {
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

    lenis = new Lenis(lenisOptions);

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

    // Sur la page home : animer le logo vers le header au scroll
    if (state.page === 'home') {
        const heroLogoWrap = document.getElementById('hero-logo-wrap');
        const headerLogo   = document.getElementById('header-logo');
        const scrollInvite = document.getElementById('scroll-invite');

        let logoInHeader = false;

        lenis.on('scroll', ({ scroll }) => {
            const threshold = 120;

            if (scroll > threshold && !logoInHeader) {
                logoInHeader = true;

                // Hero logo disparaît vers le haut
                gsap.to(heroLogoWrap, {
                    y: -50, opacity: 0,
                    duration: 0.5, ease: 'power3.in',
                    onComplete: () => {
                        headerLogo.classList.add('is-visible');
                    }
                });

                gsap.to(scrollInvite, { opacity: 0, duration: 0.3 });

            } else if (scroll <= threshold && logoInHeader) {
                logoInHeader = false;

                headerLogo.classList.remove('is-visible');
                gsap.to(heroLogoWrap, {
                    y: 0, opacity: 1,
                    duration: 0.5, ease: 'power3.out', delay: 0.1
                });
                gsap.to(scrollInvite, { opacity: SCROLL_INVITE_OPACITY, duration: 0.4 });
            }
        });
    }

    window._lenis = lenis;
}

// ─────────────────────────────────────
// SAFARI : LE PAPIER DECHIRE CALCULE UNE SEULE FOIS
// ─────────────────────────────────────
// La feuille du cahier porte filter:url(#paper-tear), un bruit
// feTurbulence a 3 octaves sur toute la section. Chrome le garde en
// memoire. Safari le recalcule sur le processeur a chaque image des
// qu'une animation bouge ailleurs sur la page (logo qui tremble...).
// Mesure dans WebKit : 2,5 images par seconde au repos sur l'accueil,
// c'etait le lag du Mac.
//
// Sur Safari seulement, on dessine la meme feuille UNE fois dans une
// image SVG : meme filtre, memes coordonnees, meme graine, donc memes
// dechirures et meme marge rouge ondulee. Safari la garde en cache
// comme n'importe quelle image : 40 images par seconde au repos.
//
// -webkit-hyphens n'est reconnu que par WebKit (Safari Mac, iPhone,
// iPad). Chrome ne passe jamais ici : son rendu ne change pas d'un pixel.
function initPapierSafari() {
    if (!(window.CSS && CSS.supports('-webkit-hyphens', 'none'))) return;
    const feuille = document.querySelector('#notebook-section .notebook-bg-sheet');
    const filtre  = document.getElementById('paper-tear');
    if (!feuille || !filtre || typeof ResizeObserver === 'undefined' || typeof XMLSerializer === 'undefined') return;

    const definition = new XMLSerializer().serializeToString(filtre);
    let empreinte = '';

    // Les deux traits de la marge rouge (::before et ::after) sont relus
    // dans la feuille de style : ils changent de place sur mobile.
    function trait(pseudo, h) {
        const s = getComputedStyle(feuille, pseudo);
        if (s.content === 'none') return '';
        return '<rect x="' + parseFloat(s.left) + '" y="0" width="' + parseFloat(s.width) +
               '" height="' + h + '" fill="' + s.backgroundColor + '"/>';
    }

    function peindre() {
        const w = feuille.offsetWidth, h = feuille.offsetHeight;
        if (!w || !h) return;
        const fond  = getComputedStyle(feuille).getPropertyValue('--notebook-bg').trim() || '#f2f0eb';
        const marge = trait('::before', h) + trait('::after', h);
        const cle = w + 'x' + h + '|' + fond + '|' + marge;
        if (cle === empreinte) return;   // meme taille, rien a redessiner
        empreinte = cle;
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h +
                    '" viewBox="0 0 ' + w + ' ' + h + '"><defs>' + definition + '</defs>' +
                    '<g filter="url(#paper-tear)"><rect width="' + w + '" height="' + h +
                    '" fill="' + fond + '"/>' + marge + '</g></svg>';
        feuille.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
        feuille.classList.add('papier-precalcule');
    }

    // Redessine si la feuille change de taille (rotation, changement de
    // langue qui rallonge le texte, chargement des polices).
    new ResizeObserver(peindre).observe(feuille);
    peindre();
}

// ─────────────────────────────────────
// LIGNES DE CAHIER ALÉATOIRES
// ─────────────────────────────────────
function initNotebookLines() {
    const container = document.getElementById('notebook-lines');
    if (!container) return;

    // Attendre que la section soit visible pour mesurer
    // The first notification draws the lines, as it always did. Later ones
    // redraw them only when the width has changed (window resize, device
    // rotation): the text then reflows and the sheet needs a different
    // number of lines. Height alone is ignored, since the lines themselves
    // and late-loading content would otherwise trigger needless redraws.
    let drawnWidth = null;
    let drawnHeight = null;
    const draw = () => {
        generateLines(container);
        drawnHeight = container.parentElement.offsetHeight;
    };
    let redrawTimer = null;
    const observer = new ResizeObserver(entries => {
        const width = Math.round(entries[0].contentRect.width);
        if (drawnWidth === null) {
            drawnWidth = width;
            draw();
            return;
        }
        if (width === drawnWidth) return;
        clearTimeout(redrawTimer);
        redrawTimer = setTimeout(() => {
            drawnWidth = width;
            // Emptied first so that the old lines do not count in the
            // height the new ones are measured against.
            container.innerHTML = '';
            draw();
        }, 200);
    });
    observer.observe(container.parentElement);

    // Fonts that arrive after the first draw change the height of the sheet
    // without changing its width, which the observer above ignores.
    if (document.fonts && document.fonts.addEventListener) {
        document.fonts.addEventListener('loadingdone', () => {
            if (drawnHeight === null || container.parentElement.offsetHeight === drawnHeight) return;
            container.innerHTML = '';
            draw();
        });
    }

    // Génération immédiate aussi
    setTimeout(() => draw(), 200);
}

function generateLines(container) {
    const parent = container.parentElement;
    if (!parent) return;
    const h = Math.max(parent.scrollHeight, parent.offsetHeight, 800);
    container.innerHTML = '';

    const spacing = 34;
    const numLines = Math.ceil(h / spacing) + 2;

    for (let i = 0; i < numLines; i++) {
        const line = document.createElement('div');
        line.className = 'nb-line';

        // Longueurs aléatoires : début et fin varient
        const leftOffset  = 4 + Math.random() * 20;   // 4-24px
        const rightOffset = 6 + Math.random() * 35;   // 6-41px
        const opacity     = 0.18 + Math.random() * 0.12; // 0.18-0.30

        line.style.left    = leftOffset + 'px';
        line.style.right   = rightOffset + 'px';
        line.style.top     = (10 + i * spacing) + 'px';
        line.style.opacity = opacity;

        container.appendChild(line);
    }
}

// ─────────────────────────────────────
// FLÈCHES "SUIVANT" → PAGE SUIVANTE
// ─────────────────────────────────────
function initNextPageLinks() {
    document.querySelectorAll('.page-next, .showcase-projects-btn').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const nextPage = link.dataset.next;
            if (nextPage === 'contact') {
                goToContact(300);
            } else if (nextPage) {
                showPage(nextPage);
            }
        });
    });

    document.querySelectorAll('[data-page-link]').forEach(card => {
        card.addEventListener('click', () => showPage(card.dataset.pageLink));
    });
}

// Fonction pour copier l'email
// Resolves to true when the text reached the clipboard. The async API only
// exists in secure contexts and recent browsers, hence the legacy command.
function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text) {
    const previousFocus = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch {
        copied = false;
    }
    field.remove();
    if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
    return copied;
}

function selectContents(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function initCopyEmail() {
    document.querySelectorAll('.copy-email').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.dataset.email || this.innerText.trim();
            copyText(email).then(copied => {
                // Nothing could be copied: select the address so that the
                // visitor can copy it by hand, and say so.
                if (!copied) selectContents(this);
                const feedback = this.nextElementSibling;
                if (feedback && feedback.classList.contains('copy-feedback')) {
                    const key = copied ? 'copied' : 'copy_manual';
                    feedback.setAttribute('data-i18n', key);
                    feedback.textContent = t(key);
                    feedback.style.opacity = '1';
                    feedback.style.transform = 'translateX(5px)';
                    setTimeout(() => {
                        feedback.style.opacity = '0';
                        feedback.style.transform = 'translateX(-10px)';
                    }, 2000);
                }
            }).catch(err => console.error('Erreur de copie', err));
        });
    });
}

function initContactAnimation() {
    if (!hasScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const homeContact = document.getElementById('home-contact');
    const homePage = document.getElementById('page-home');
    if (!homeContact || !homePage) return;

    const heading = homeContact.querySelector('.page-heading');
    const intro = homeContact.querySelector('.page-intro');
    const formGroups = homeContact.querySelectorAll('.fg');
    const submitBtn = homeContact.querySelector('.btn-wrap');
    const infoBlocks = homeContact.querySelectorAll('.ci-block');

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: homeContact,
            scroller: "#page-home",
            start: "top 85%",
            toggleActions: "play none none none"
        }
    });

    tl.fromTo(heading, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    
    tl.fromTo(intro,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
    );

    const formElements = [...formGroups, submitBtn];
    tl.fromTo(formElements,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
        "-=0.5"
    );

    tl.fromTo(infoBlocks,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
        "-=0.6"
    );
}

// Kept apart from the entrance animation: the form must be intercepted even
// when the animation library failed to load, otherwise the browser posts it
// natively and lands on the raw JSON answer.
function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    if (!form || !feedback) return;

    // FIX: Observer les changements de taille du formulaire (textarea focus) pour Lenis/ScrollTrigger
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            if (window._lenis) window._lenis.resize();
            if (hasScrollTrigger) ScrollTrigger.refresh();
        });
        ro.observe(form);
    }

    // The message is readable through its CSS class alone; the slide-in is
    // an extra that needs the animation library.
    function animateFeedback(duration) {
        if (typeof gsap === 'undefined') return;
        gsap.fromTo(feedback, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration });
    }

    // The label shows whichever dictionary key it carries, so a language
    // switch during a request translates the pending label and the
    // restored one alike.
    function setSubmitLabel(button, key) {
        const label = button.querySelector('[data-i18n]');
        if (!label) return;
        label.setAttribute('data-i18n', key);
        label.textContent = t(key);
    }

    // Pressing Enter in a field submits the form without going through the
    // button, so the lock has to live on the submit event itself.
    let isSubmitting = false;

    // Past this delay the request is treated as lost: the visitor gets an
    // error and a usable form back instead of a button stuck on "sending".
    const SUBMIT_TIMEOUT_MS = 15000;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const nameEl  = document.getElementById('fn');
        const emailEl = document.getElementById('fe');
        const msgEl   = document.getElementById('fm');

        const name  = nameEl.value.trim();
        const email = emailEl.value.trim();
        const msg   = msgEl.value.trim();

        // Nettoyage des erreurs précédentes
        [nameEl, emailEl, msgEl].forEach(el => el.classList.remove('fi-error'));
        feedback.className = 'form-feedback';
        feedback.textContent = '';

        // Validation
        let hasError = false;
        
        if (!name) { nameEl.classList.add('fi-error'); hasError = true; }
        
        // Validation basique pour autoriser les emails étranges (ex: sans .com)
        if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) {
            emailEl.classList.add('fi-error'); 
            hasError = true;
        }
        
        if (!msg) { msgEl.classList.add('fi-error'); hasError = true; }

        if (hasError) {
            const errMsg = state.lang === 'fr'
                ? 'Merci de remplir tous les champs correctement.'
                : 'Please fill in all fields correctly.';
                
            feedback.textContent = errMsg;
            feedback.classList.add('form-feedback--error');
            animateFeedback(0.35);
            return;
        }

        // Soumission AJAX à Formspree
        const formData = new FormData(form);
        const submitBtn = document.getElementById('contact-submit');
        isSubmitting = true;
        setSubmitLabel(submitBtn, 'form_sending');
        submitBtn.style.pointerEvents = 'none';
        submitBtn.disabled = true;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        }).then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            // A 200 answer can still carry a refusal in its body. When the
            // body is not JSON, the status already checked is all there is.
            return response.json().catch(() => null);
        }).then(result => {
            // Form services send this flag as a boolean, a string or a number.
            const flag = result ? result.success : undefined;
            const refused = flag === false || flag === 0
                || ['false', '0'].includes(String(flag).toLowerCase());
            if (!refused) {
                const successMsg = state.lang === 'fr'
                    ? '✓ Message envoyé avec succès !'
                    : '✓ Message sent successfully!';
                feedback.textContent = successMsg;
                feedback.classList.add('form-feedback--success');
                animateFeedback(0.4);
                form.reset();
            } else {
                throw new Error('The form service refused the message.');
            }
        }).catch(error => {
            const errorMsg = state.lang === 'fr'
                ? 'Erreur lors de l\'envoi. Veuillez réessayer.'
                : 'Error sending message. Please try again.';
            feedback.textContent = errorMsg;
            feedback.classList.add('form-feedback--error');
            animateFeedback(0.35);
        }).finally(() => {
            clearTimeout(timeoutId);
            setSubmitLabel(submitBtn, 'form_send');
            submitBtn.style.pointerEvents = 'auto';
            submitBtn.disabled = false;
            isSubmitting = false;
            setTimeout(() => {
                feedback.textContent = '';
                feedback.classList.remove('form-feedback--success', 'form-feedback--error');
            }, 5000);
        });
    });
}

// ─────────────────────────────────────
// CARROUSEL BANDE DESSINÉE (BD)
// ─────────────────────────────────────
function initBDCarousel() {
    const containers = document.querySelectorAll('.bd-carousel-section');
    if (!containers.length) return;

    containers.forEach(container => {
        const slides = container.querySelectorAll('.bd-slide');
        if (!slides.length) return;

        const dots = container.querySelectorAll('.bd-dot');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        const playPauseBtn = container.querySelector('.bd-play-pause-btn');
        const iconPause = playPauseBtn ? playPauseBtn.querySelector('.icon-pause') : null;
        const iconPlay = playPauseBtn ? playPauseBtn.querySelector('.icon-play') : null;
        // Deux carrousels, deux jeux de noms de classes historiques :
        //   pages projet -> .progress-bar        + .bd-carousel-pagination
        //   page dessins -> .bd-progress-bar     + .bd-page-indicator
        // Le code ne connaissait que le premier jeu : sur la page dessins,
        // le compteur restait fige sur « 1 / 4 » et la barre de progression
        // ne bougeait jamais. On accepte les deux noms.
        const progressBar = container.querySelector('.progress-bar, .bd-progress-bar');
        const indicator = container.querySelector('.bd-carousel-pagination, .bd-page-indicator');

        let currentIndex = 0;
        let isPlaying = true;
        let autoplayTimeout = null;
        let progressAnimFrame = null;
        const slideDuration = 5000;
        let progressStart = performance.now();

        function updateCarousel(index) {
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;

            currentIndex = index;

            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentIndex);
                // Hidden slides stay in the DOM: only the visible sheet may
                // take keyboard focus.
                const sheet = slide.querySelector('.drawing-sheet-wrap');
                if (sheet && sheet.hasAttribute('tabindex')) sheet.tabIndex = i === currentIndex ? 0 : -1;
            });

            if (dots.length > 0) {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }

            if (indicator) {
                indicator.textContent = `${currentIndex + 1} / ${slides.length}`;
            }

            majAutoplay();
        }

        function nextSlide() { updateCarousel(currentIndex + 1); }
        function prevSlide() { updateCarousel(currentIndex - 1); }

        function startAutoplay() {
            stopAutoplay();
            
            progressStart = performance.now();
            autoplayTimeout = setTimeout(nextSlide, slideDuration);
            
            function drawProgress(time) {
                if (!isPlaying) return;
                const elapsed = time - progressStart;
                const percent = Math.min((elapsed / slideDuration) * 100, 100);
                if (progressBar) progressBar.style.width = `${percent}%`;
                
                if (elapsed < slideDuration) {
                    progressAnimFrame = requestAnimationFrame(drawProgress);
                }
            }
            progressAnimFrame = requestAnimationFrame(drawProgress);
        }

        function stopAutoplay() {
            if (autoplayTimeout) clearTimeout(autoplayTimeout);
            if (progressAnimFrame) cancelAnimationFrame(progressAnimFrame);
            if (progressBar) progressBar.style.width = '0%';
        }

        // The button is a toggle named after autoplay: pressed while it runs.
        if (playPauseBtn) playPauseBtn.setAttribute('aria-pressed', 'true');

        function togglePlayPause() {
            isPlaying = !isPlaying;
            playPauseBtn.setAttribute('aria-pressed', String(isPlaying));
            if (isPlaying) {
                if(iconPause) iconPause.style.display = 'block';
                if(iconPlay) iconPlay.style.display = 'none';
                majAutoplay();
            } else {
                if(iconPause) iconPause.style.display = 'none';
                if(iconPlay) iconPlay.style.display = 'block';
                stopAutoplay();
            }
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); });
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => { togglePlayPause(); });
        
        if (dots.length > 0) {
            dots.forEach((dot, i) => {
                dot.addEventListener('click', () => { stopAutoplay(); updateCarousel(i); });
            });
        }

        // ── Quand le carrousel a-t-il le droit de defiler ? ──────────────
        //
        // Deux conditions, et non plus une seule :
        //   la page doit etre ouverte  ET  le carrousel doit etre a l'ecran.
        //
        // Avant, il suffisait que la page soit ouverte. Le carrousel de la
        // bande dessinee se trouvant tout en bas de la page Dessins, il
        // defilait pendant qu'Even lisait le haut de la page : le temps
        // d'arriver dessus, il en etait deja a la planche 3. Meme chose sur
        // les pages projet, ou les panneaux s'enchainent.
        //
        // Une seule fonction decide desormais, et tout le monde passe par
        // elle — c'est ce qui garantit qu'on ne puisse plus laisser le
        // carrousel dans un etat fige par accident.
        const parentPage = container.closest('.page');
        let pageOuverte = !parentPage || parentPage.classList.contains('is-active');
        let aLEcran = false;

        function majAutoplay() {
            if (isPlaying && pageOuverte && aLEcran) startAutoplay();
            else stopAutoplay();
        }

        if ('IntersectionObserver' in window) {
            let observateurARepondu = false;
            new IntersectionObserver(entrees => {
                observateurARepondu = true;
                aLEcran = entrees[0].isIntersecting;
                majAutoplay();
            }, { threshold: 0.3 }).observe(container);

            // Filet de securite. Un navigateur qui gere IntersectionObserver
            // repond dans la foulee, meme pour dire « pas visible » : le
            // minuteur ne sert alors a rien. Mais si l'API existe sans
            // fonctionner, le carrousel resterait fige pour toujours — et
            // c'est precisement le defaut qu'on est en train de corriger. On
            // repasse donc en marche par defaut au bout de 4 secondes de
            // silence complet.
            setTimeout(() => {
                if (!observateurARepondu) {
                    aLEcran = true;
                    majAutoplay();
                }
            }, 4000);
        } else {
            aLEcran = true;
            majAutoplay();
        }

        if (parentPage) {
            const pageObserver = new MutationObserver(() => {
                const ouverte = parentPage.classList.contains('is-active');
                if (ouverte !== pageOuverte) {
                    pageOuverte = ouverte;
                    majAutoplay();
                }
            });
            pageObserver.observe(parentPage, { attributes: true, attributeFilter: ['class'] });
        }

        let bdTouchStartX = 0;
        const bdViewport = container.querySelector('.bd-carousel-viewport');
        if (bdViewport) {
            bdViewport.addEventListener('touchstart', e => {
                bdTouchStartX = e.changedTouches[0].clientX;
                stopAutoplay();
            }, { passive: true });
            // Le simple fait de poser le doigt coupait le defilement — et
            // rien ne le relancait. Or on pose le doigt sur l'image des qu'on
            // fait defiler la page : le carrousel restait donc fige tant
            // qu'on n'avait pas appuye sur une fleche. On relance apres
            // chaque contact qui n'etait pas un balayage.
            bdViewport.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - bdTouchStartX;
                if (Math.abs(dx) > 40) {
                    if (dx < 0) nextSlide();
                    else prevSlide();
                } else {
                    majAutoplay();
                }
            }, { passive: true });
            bdViewport.addEventListener('touchcancel', () => majAutoplay(), { passive: true });
        }
    });
}

// ─────────────────────────────────────
// PDF.JS, LOADED ON DEMAND
// ─────────────────────────────────────
const PDFJS_URL = 'vendor/pdfjs-3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'vendor/pdfjs-3.11.174/pdf.worker.min.js';
const PDFJS_INTEGRITY = 'sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e';

let pdfJsPromise = null;

// Injects the library once. A failed attempt is forgotten, so that the next
// sheet opened can try again.
function loadPdfJs() {
    if (!pdfJsPromise) {
        pdfJsPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = PDFJS_URL;
            script.integrity = PDFJS_INTEGRITY;
            script.onload = () => {
                if (!window.pdfjsLib) {
                    reject(new Error('PDF.js did not initialise.'));
                    return;
                }
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                resolve(window.pdfjsLib);
            };
            script.onerror = () => {
                script.remove();
                reject(new Error('PDF.js could not be loaded.'));
            };
            document.head.appendChild(script);
        }).catch(error => {
            pdfJsPromise = null;
            throw error;
        });
    }
    return pdfJsPromise;
}

// Share of the page height that is drawn: the bottom strip only holds
// the sheet's page number.
const PDF_VISIBLE_HEIGHT = 0.95;
const PDF_MAX_SCALE = 3;
const PDF_ZOOM_RESERVE = 4;
const PDF_MAX_PIXELS = 9e6;
const PDF_MAX_PIXELS_TOUCH = 4e6;

// Scale = what the screen can show (fitted size x pixel ratio x zoom
// reserve), never above PDF_MAX_SCALE, then capped by a pixel budget so
// that one sheet cannot exhaust canvas memory on a phone or tablet.
function pdfRenderScale(page) {
    const base = page.getViewport({ scale: 1 });
    const fit = Math.min(window.innerWidth / base.width, window.innerHeight / base.height);
    const wanted = fit * (window.devicePixelRatio || 1) * PDF_ZOOM_RESERVE;
    const budget = window.matchMedia(REQUETE_TACTILE).matches ? PDF_MAX_PIXELS_TOUCH : PDF_MAX_PIXELS;
    const budgetScale = Math.sqrt(budget / (base.width * base.height * PDF_VISIBLE_HEIGHT));
    return Math.min(PDF_MAX_SCALE, wanted, budgetScale);
}

// Draws the first page of a PDF into the canvas. Resolves to true once the
// page is drawn and to false when the signal aborted the work; rejects when
// the document cannot be loaded or rendered.
async function renderPdfPage(url, canvas, { signal } = {}) {
    const isAborted = () => Boolean(signal && signal.aborted);

    const pdfLib = await loadPdfJs();
    if (isAborted()) return false;

    const loadingTask = pdfLib.getDocument(encodeURI(url));
    let renderTask = null;

    // Destroying the loading task also destroys the document it produced.
    const release = () => Promise.resolve(loadingTask.destroy()).catch(() => {});
    const onAbort = () => {
        if (renderTask) renderTask.cancel();
        release();
    };
    if (signal) signal.addEventListener('abort', onAbort);

    try {
        const pdf = await loadingTask.promise;
        if (isAborted()) return false;
        const page = await pdf.getPage(1);
        if (isAborted()) return false;

        const viewport = page.getViewport({ scale: pdfRenderScale(page) });

        canvas.width = viewport.width;
        canvas.height = viewport.height * PDF_VISIBLE_HEIGHT;

        const context = canvas.getContext('2d');

        // Fill canvas with white before rendering
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
            canvasContext: context,
            viewport: viewport,
            background: 'white'
        });
        await renderTask.promise;
        renderTask = null;
        return !isAborted();
    } catch (error) {
        if (isAborted()) return false;
        throw error;
    } finally {
        if (signal) signal.removeEventListener('abort', onAbort);
        // The canvas keeps its pixels: the document is no longer needed.
        release();
    }
}

// ─────────────────────────────────────
// LIGHTBOX ULTRA-ÉPURÉE (STYLE FORTICHE)
// ─────────────────────────────────────
function initDrawingLightbox() {
    const lightbox = document.getElementById('drawing-lightbox');
    if (!lightbox) return;
    // The open/closed state lives in this attribute; it starts closed.
    lightbox.setAttribute('aria-hidden', 'true');

    const canvasWrap = document.getElementById('lb-canvas-wrap');
    const counterEl  = lightbox.querySelector('.lb-counter');
    const closeBtn   = lightbox.querySelector('.lb-close');
    const prevBtn    = lightbox.querySelector('.lb-prev');
    const nextBtn    = lightbox.querySelector('.lb-next');
    const loader     = document.getElementById('lb-loader');
    const dotsWrap   = lightbox.querySelector('.lb-dots');
    const zoomBtn    = lightbox.querySelector('.lb-zoom-btn');
    const fullBtn    = lightbox.querySelector('.lb-fullscreen-btn');
    const zoomRange  = lightbox.querySelector('#lb-zoom-range');
    const sliderRedPath = lightbox.querySelector('#lb-slider-red-path');

    let current = 0;
    let hideTimer = null;
    let isZoomed = false;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;
    let initialTx, initialTy;
    let isSingleMode = false;
    let currentGallery = allDrawings;
    let maxZoom = 4;
    let currentRenderId = 0;
    let activeRender = null;
    let openedAt = 0;
    let clearTimer = null;
    let focusBeforeOpen = null;

    // The second click of a double-click lands on the viewer that the first
    // one just opened; it must neither close it nor zoom.
    const OPEN_CLICK_GUARD_MS = 400;

    // Aborts a PDF render still in flight and frees its document.
    function cancelActiveRender() {
        if (!activeRender) return;
        activeRender.abort();
        activeRender = null;
    }

    // Zeroing a canvas frees its backing store at once; mobile Safari
    // otherwise keeps it until a garbage collection that may come late.
    function clearCanvasWrap() {
        if (!canvasWrap) return;
        canvasWrap.querySelectorAll('canvas').forEach(c => { c.width = c.height = 0; });
        canvasWrap.innerHTML = '';
    }

    // A zoomed image may travel only as far as it overflows the frame on
    // each side, so it can never be dragged out of view.
    function clampTranslation(item) {
        const maxX = Math.max(0, (item.offsetWidth * scale - canvasWrap.clientWidth) / 2);
        const maxY = Math.max(0, (item.offsetHeight * scale - canvasWrap.clientHeight) / 2);
        translateX = Math.min(maxX, Math.max(-maxX, translateX));
        translateY = Math.min(maxY, Math.max(-maxY, translateY));
    }

    function updateTransform() {
        const item = canvasWrap.querySelector('img, canvas');
        if (item) {
            clampTranslation(item);
            item.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }
        
        if (sliderRedPath && zoomRange) {
            const percent = (scale - zoomRange.min) / (zoomRange.max - zoomRange.min);
            sliderRedPath.style.strokeDashoffset = 100 - (percent * 100);
        }
    }

    // ── Créer les points indicateurs ──
    function generateDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        currentGallery.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'lb-dot' + (i === current ? ' active' : '');
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showDrawing(i);
            });
            dotsWrap.appendChild(dot);
        });
    }

    function updateDots() {
        dotsWrap.querySelectorAll('.lb-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    // ── Auto-masquage des contrôles ──
    function showControls() {
        lightbox.classList.remove('controls-hidden');
        clearTimeout(hideTimer);
        // A la souris, le moindre mouvement rappelle les commandes : les
        // masquer au bout de 2,5s est confortable. Au doigt il n'y a pas de
        // mouvement — la croix de fermeture disparaissait et le visiteur se
        // retrouvait bloque devant l'image. Sur tactile, elles restent.
        if (window.matchMedia(REQUETE_TACTILE).matches) return;
        hideTimer = setTimeout(() => {
            // Hiding would take the close button away from someone panning
            // a zoomed image or driving the viewer from the keyboard.
            if (isZoomed || keyboardDriven) return;
            lightbox.classList.add('controls-hidden');
        }, 2500);
    }

    // Tracked by hand rather than read from :focus-visible, which older
    // Safari rejects as a selector: the last input device used decides.
    let keyboardDriven = false;
    const onPointerActivity = () => {
        keyboardDriven = false;
        showControls();
    };

    lightbox.addEventListener('mousemove', onPointerActivity);
    lightbox.addEventListener('touchstart', onPointerActivity);

    // ── Afficher un dessin ──
    async function showDrawing(index) {
        current = index;
        isZoomed = false;
        scale = 1;
        translateX = 0;
        translateY = 0;
        if (zoomRange) zoomRange.value = 1;
        updateTransform();
        lightbox.classList.remove('zoomed');

        // Mettre à jour le compteur
        if (counterEl) {
            if (isSingleMode) {
                counterEl.style.display = 'none';
            } else {
                counterEl.style.display = '';
                counterEl.textContent = `${index + 1} / ${currentGallery.length}`;
            }
        }

        if (isSingleMode) {
            if (dotsWrap) dotsWrap.style.display = 'none';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (dotsWrap) dotsWrap.style.display = '';
            if (prevBtn) prevBtn.style.display = '';
            if (nextBtn) nextBtn.style.display = '';
            updateDots();
        }

        // Préparer l'image
        // A reopening during the closing fade must not be emptied by it.
        clearTimeout(clearTimer);
        clearCanvasWrap();
        if (loader) loader.classList.add('active');

        const renderId = ++currentRenderId;
        cancelActiveRender();

        const url = isSingleMode ? index.url : currentGallery[index].url;
        const entry = isSingleMode ? index : currentGallery[index];
        const altText = (entry.altKey && t(entry.altKey)) || entry.title || '';

        const isPdf = url.toLowerCase().endsWith('.pdf');
        maxZoom = isPdf ? 10 : 4;
        if (zoomRange) {
            zoomRange.max = maxZoom;
        }

        if (isPdf) {
            // Render as PDF on a canvas
            const canvas = document.createElement('canvas');
            canvas.style.backgroundColor = '#ffffff'; // White background for PDF
            // A canvas has no alt: it is exposed as an image with a name.
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', altText);
            
            const controller = new AbortController();
            activeRender = controller;
            const isStale = () => renderId !== currentRenderId;

            renderPdfPage(url, canvas, { signal: controller.signal }).then(drawn => {
                if (activeRender === controller) activeRender = null;
                if (!drawn || isStale()) {
                    canvas.width = canvas.height = 0;
                    return;
                }
                if (canvasWrap) {
                    canvasWrap.innerHTML = '';
                    canvasWrap.appendChild(canvas);
                }
                if (loader) loader.classList.remove('active');
            }).catch(err => {
                if (activeRender === controller) activeRender = null;
                if (isStale()) {
                    canvas.width = canvas.height = 0;
                } else {
                    if (loader) loader.classList.remove('active');
                    console.error('Erreur lors du chargement du PDF:', err);
                }
            });

        } else {
            // Render as standard image
            const img = document.createElement('img');
            img.src = url;
            img.alt = altText;
            img.draggable = false;
            
            img.onload = () => {
                if (renderId === currentRenderId && loader) loader.classList.remove('active');
            };
            img.onerror = () => {
                if (renderId === currentRenderId) {
                    if (loader) loader.classList.remove('active');
                    console.error("Erreur lors du chargement de l'image:", img.src);
                }
            };
            
            if (canvasWrap) {
                canvasWrap.innerHTML = '';
                canvasWrap.appendChild(img);
            }
        }

        showControls();
    }

    // The viewer is modal: focus moves in on open, stays in while it is
    // open, and goes back to where it was on close.
    function takeFocus() {
        if (!lightbox.contains(document.activeElement)) focusBeforeOpen = document.activeElement;
        if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    function giveFocusBack() {
        const target = focusBeforeOpen;
        focusBeforeOpen = null;
        if (target && target !== document.body && target.isConnected) {
            target.focus({ preventScroll: true });
        } else if (lightbox.contains(document.activeElement)) {
            document.activeElement.blur();
        }
    }

    function trapFocus(e) {
        const focusables = Array.from(lightbox.querySelectorAll('button, input'))
            .filter(el => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!lightbox.contains(active)) {
            e.preventDefault();
            first.focus();
        } else if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    }

    // ── Ouvrir / Fermer ──
    function openLightbox(index) {
        // Opening on a missing entry would lock scrolling behind an empty viewer.
        if (!Number.isInteger(index) || index < 0 || index >= currentGallery.length) return;
        isSingleMode = false;
        openedAt = performance.now();
        lightbox.setAttribute('aria-hidden', 'false');
        takeFocus();
        if (window._lenis) window._lenis.stop();
        document.body.style.overflow = 'hidden';
        generateDots();
        showDrawing(index);
    }

    // ── API globale pour ouvrir avec une galerie spécifique ──
    openDrawingGallery = function(gallery, index) {
        currentGallery = gallery;
        openLightbox(index || 0);
    };

    function openSingleImage(url, title) {
        isSingleMode = true;
        openedAt = performance.now();
        lightbox.setAttribute('aria-hidden', 'false');
        takeFocus();
        if (window._lenis) window._lenis.stop();
        document.body.style.overflow = 'hidden';
        // En mode single, index = { url, title }
        showDrawing({ url, title });
    }

    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        isZoomed = false;
        scale = 1;
        translateX = 0;
        translateY = 0;
        if (zoomRange) zoomRange.value = 1;
        updateTransform();
        lightbox.classList.remove('zoomed');
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(()=>{});
        }
        clearTimeout(hideTimer);
        // A render still in flight must not land in the closed viewer.
        ++currentRenderId;
        cancelActiveRender();
        if (loader) loader.classList.remove('active');
        // Emptied only once the closing fade has played.
        clearTimer = setTimeout(clearCanvasWrap, 350);
        if (window._lenis) window._lenis.start();
        document.body.style.overflow = '';
        giveFocusBack();
    }

    // Lets the router close the viewer; a no-op when it is already closed,
    // so page scrolling is never restarted behind another lock.
    closeDrawingLightbox = function() {
        if (lightbox.getAttribute('aria-hidden') === 'false') closeLightbox();
    };

    // ── Clic sur les dessins de la galerie et les slides BD ──
    // Scoped to the drawings page: the index below maps onto allDrawings, and
    // other pages reuse .drawing-item for cards that have nothing to open.
    document.querySelectorAll('#page-drawings .drawing-item .frame-wrap, #page-drawings .bd-slide .drawing-sheet-wrap').forEach((item) => {
        item.addEventListener('click', () => {
            const parentItem = item.closest('.drawing-item, .bd-slide');
            if (!parentItem) return;

            const parentPage = item.closest('.page');
            if (parentPage && !parentPage.classList.contains('is-active')) return;

            if (parentItem.classList.contains('bd-slide') && !parentItem.classList.contains('active')) return;

            const allElements = Array.from(document.querySelectorAll('#page-drawings .drawing-item, #page-drawings .bd-slide'));
            const idx = allElements.indexOf(parentItem);
            if (idx !== -1) {
                tracerPuis(item, () => {
                    currentGallery = allDrawings;
                    openLightbox(idx);
                });
            }
        });
    });

    // ✦ ✦ Clic sur les PDF des carrousels Projets ✦ ✦
    document.querySelectorAll('.project-detail-page .bd-slide .drawing-sheet-wrap').forEach((wrap) => {
        wrap.addEventListener('click', () => {
            const parentSlide = wrap.closest('.bd-slide');
            if (parentSlide && !parentSlide.classList.contains('active')) return;

            const parentPage = wrap.closest('.page');
            if (parentPage && !parentPage.classList.contains('is-active')) return;

            // .pdf-inline-render sans prefixe : marche pour l'image comme
            // pour l'ancien canvas, si jamais il en restait un quelque part.
            const canvas = wrap.querySelector('.pdf-inline-render');
            if (canvas) {
                const url = canvas.dataset.pdfUrl;
                
                let foundGallery = null;
                let foundIndex = -1;
                for (const gallery of [diplomePlans, diplomeCoupes, diplomeAnalyses]) {
                    foundIndex = gallery.findIndex(item => item.url === url);
                    if (foundIndex !== -1) {
                        foundGallery = gallery;
                        break;
                    }
                }

                tracerPuis(wrap, () => {
                    if (foundGallery && foundIndex !== -1) {
                        currentGallery = foundGallery;
                        openLightbox(foundIndex);
                    } else {
                        openSingleImage(url, "Plan Architecture");
                    }
                });
            }
        });
    });

    // ── Clic sur le scan du diplôme (Mode image unique) ──
    document.querySelectorAll('.single-lightbox-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const src = trigger.getAttribute('src');
            const alt = trigger.getAttribute('alt');
            if (src) tracerPuis(trigger, () => openSingleImage(src, alt));
        });
    });

    // ── Fermeture ──
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

    // ── Outils (Zoom & Fullscreen) ──
    function toggleZoom() {
        isZoomed = !isZoomed;
        lightbox.classList.toggle('zoomed', isZoomed);
        if (isZoomed) {
            scale = 2;
        } else {
            scale = 1;
            translateX = 0;
            translateY = 0;
        }
        if (zoomRange) zoomRange.value = scale;
        updateTransform();
    }
    if (zoomBtn) zoomBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleZoom(); });

    if (zoomRange) {
        zoomRange.addEventListener('input', (e) => {
            scale = parseFloat(e.target.value);
            if (scale > 1 && !isZoomed) {
                isZoomed = true;
                lightbox.classList.add('zoomed');
            } else if (scale === 1 && isZoomed) {
                translateX = 0;
                translateY = 0;
                // On ne retire pas la classe .zoomed ici pour éviter que 
                // la barre ne disparaisse sous le clic de l'utilisateur, ce qui 
                // déclencherait un clic sur le fond et fermerait la fenêtre.
            }
            updateTransform();
        });

        // L'événement 'change' se déclenche quand on relâche le clic sur la barre
        zoomRange.addEventListener('change', (e) => {
            if (scale <= 1 && isZoomed) {
                isZoomed = false;
                lightbox.classList.remove('zoomed');
                translateX = 0;
                translateY = 0;
                updateTransform();
            }
        });

        // Click on slider wrapper shouldn't close lightbox
        zoomRange.parentNode.addEventListener('click', e => e.stopPropagation());
    }

    // Some browsers (iPhone Safari) have no element fullscreen at all: a
    // button that does nothing is worse than no button.
    if (fullBtn && !lightbox.requestFullscreen) fullBtn.style.display = 'none';

    if (fullBtn) fullBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!lightbox.requestFullscreen) return;
        if (!document.fullscreenElement) {
            lightbox.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen().catch(()=>{});
        }
    });

    // Navigation Clavier
    document.addEventListener('keydown', (e) => {
        if (lightbox.getAttribute('aria-hidden') === 'false') {
            // Any key counts as activity, like a mouse move.
            keyboardDriven = true;
            showControls();
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'Tab') trapFocus(e);
            // On the zoom slider the arrow keys already change the zoom.
            if (!isSingleMode && e.target !== zoomRange) {
                if (e.key === 'ArrowRight') showDrawing((current + 1) % currentGallery.length);
                else if (e.key === 'ArrowLeft') showDrawing((current - 1 + currentGallery.length) % currentGallery.length);
            }
        }
    });

    // Boutons Suivant / Précédent
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isSingleMode) showDrawing((current - 1 + currentGallery.length) % currentGallery.length);
    });
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isSingleMode) showDrawing((current + 1) % currentGallery.length);
    });

    // Clic en dehors de l'image = fermer, clic sur l'image = zoom (si non zoomé)
    lightbox.addEventListener('click', (e) => {
        if (performance.now() - openedAt < OPEN_CLICK_GUARD_MS) return;
        if (e.target === lightbox || e.target.classList.contains('lb-canvas-wrap')) {
            closeLightbox();
        } else if (e.target.tagName.toLowerCase() === 'img' || e.target.tagName.toLowerCase() === 'canvas') {
            // Au doigt, un simple appui declenchait ce zoom sans qu'on l'ait
            // demande. Sur tactile le geste naturel est le pincement, et le
            // bouton de zoom reste disponible : on reserve donc le zoom au
            // clic a la souris.
            if (window.matchMedia(REQUETE_TACTILE).matches) return;
            if (!isZoomed) toggleZoom();
        }
    });

    // ── Pan & Zoom Pointer Events ──
    if (canvasWrap) {
        canvasWrap.addEventListener('pointerdown', (e) => {
            if (!isZoomed || (e.target.tagName.toLowerCase() !== 'img' && e.target.tagName.toLowerCase() !== 'canvas')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialTx = translateX;
            initialTy = translateY;
            e.target.classList.add('dragging');
            e.target.setPointerCapture(e.pointerId);
        });

        canvasWrap.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            translateX = initialTx + (e.clientX - startX);
            translateY = initialTy + (e.clientY - startY);
            updateTransform();
        });

        canvasWrap.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            e.target.classList.remove('dragging');
            e.target.releasePointerCapture(e.pointerId);
        });

        canvasWrap.addEventListener('wheel', (e) => {
            if (lightbox.getAttribute('aria-hidden') === 'true') return;
            if (!isZoomed && e.deltaY > 0) return;
            e.preventDefault();
            const zoomSpeed = 0.15;
            
            let oldScale = scale;
            let newScale = scale + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed);
            
            if (zoomRange) {
                newScale = Math.max(parseFloat(zoomRange.min), Math.min(parseFloat(zoomRange.max), newScale));
            }
            
            if (newScale === oldScale) return;
            
            // Zoom at pointer logic
            const rect = canvasWrap.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;
            
            translateX = mouseX - (mouseX - translateX) * (newScale / oldScale);
            translateY = mouseY - (mouseY - translateY) * (newScale / oldScale);
            
            scale = newScale;
            if (zoomRange) zoomRange.value = scale;
            
            if (scale <= 1) {
                scale = 1;
                isZoomed = false;
                lightbox.classList.remove('zoomed');
                translateX = 0;
                translateY = 0;
            } else if (!isZoomed) {
                isZoomed = true;
                lightbox.classList.add('zoomed');
            }
            updateTransform();
        }, { passive: false });
    }

    // ── Touch : Pinch-to-zoom et Swipe ──
    let lbTouchStartX = 0;
    let lbTouchStartY = 0;
    let initialPinchDistance = null;
    let initialPinchScale = 1;
    let pinchInProgress = false;

    lightbox.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            pinchInProgress = true;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialPinchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            initialPinchScale = scale;
        } else if (e.touches.length === 1) {
            // A first finger starts a new gesture, whatever became of the last.
            pinchInProgress = false;
            lbTouchStartX = e.touches[0].clientX;
            lbTouchStartY = e.touches[0].clientY;
        }
    }, { passive: false });

    lightbox.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialPinchDistance) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            const delta = dist / initialPinchDistance;
            
            let oldScale = scale;
            let newScale = initialPinchScale * delta;
            
            if (newScale < 1) newScale = 1;
            if (newScale > maxZoom) newScale = maxZoom;
            
            if (newScale === oldScale) return;
            
            const rect = canvasWrap.getBoundingClientRect();
            const mouseX = ((touch1.clientX + touch2.clientX) / 2) - rect.left - rect.width / 2;
            const mouseY = ((touch1.clientY + touch2.clientY) / 2) - rect.top - rect.height / 2;
            
            translateX = mouseX - (mouseX - translateX) * (newScale / oldScale);
            translateY = mouseY - (mouseY - translateY) * (newScale / oldScale);
            
            scale = newScale;
            if (zoomRange) zoomRange.value = scale;
            
            if (scale > 1.05 && !isZoomed) {
                isZoomed = true;
                lightbox.classList.add('zoomed');
            } else if (scale <= 1.05 && isZoomed) {
                isZoomed = false;
                lightbox.classList.remove('zoomed');
                translateX = 0;
                translateY = 0;
            }
            updateTransform();
        }
    }, { passive: false });

    // The system can take a gesture away (home swipe, incoming call) without
    // any touchend: forget it, or the next swipe would be swallowed.
    lightbox.addEventListener('touchcancel', () => {
        pinchInProgress = false;
        initialPinchDistance = null;
    });

    lightbox.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialPinchDistance = null;
        }
        // Lifting the fingers of a pinch one after the other is not a swipe:
        // the gesture only ends when the last finger leaves the screen.
        if (pinchInProgress) {
            if (e.touches.length === 0) pinchInProgress = false;
            return;
        }
        if (e.changedTouches.length === 1 && !initialPinchDistance) {
            const dx = e.changedTouches[0].clientX - lbTouchStartX;
            const dy = e.changedTouches[0].clientY - lbTouchStartY;
            if (!isZoomed && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                if (!isSingleMode) {
                    if (dx < 0) showDrawing((current + 1) % currentGallery.length);
                    else showDrawing((current - 1 + currentGallery.length) % currentGallery.length);
                }
            }
        }
    }, { passive: false });
}

// ─────────────────────────────────────
// ─────────────────────────────────────
// ANIMATIONS AU SCROLL — MOBILE TOUCH
// Remplace les effets de survol sur les appareils tactiles
// ─────────────────────────────────────
// Reglages du declenchement tactile — voir initScrollAnimationsMobile
const TACTILE_SEUIL  = 0.35;   // l'element doit etre franchement a l'ecran
const TACTILE_MARGE  = '0px 0px -12% 0px';
const TACTILE_DELAI  = 160;    // ms : laisse le temps de poser le regard

function initScrollAnimationsMobile() {
    const mq = window.matchMedia(REQUETE_TACTILE);
    if (!mq.matches) {
        // Le mode peut changer en cours de route : tablette dont on detache
        // le clavier, fenetre passee sur un ecran tactile. On reessaie alors
        // au lieu d'abandonner definitivement.
        const relancer = () => {
            if (mq.matches) {
                mq.removeEventListener('change', relancer);
                initScrollAnimationsMobile();
            }
        };
        mq.addEventListener('change', relancer);
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
                    if (el._minuteurVue) return;
                    el._minuteurVue = setTimeout(() => {
                        el.classList.add('is-inview');
                        el._minuteurVue = null;
                    }, TACTILE_DELAI);
                } else {
                    // Sorti de l'ecran : on annule un declenchement en attente
                    // et on retire l'etat, pour que l'element rejoue son
                    // animation au prochain passage — comme un survol repete.
                    if (el._minuteurVue) {
                        clearTimeout(el._minuteurVue);
                        el._minuteurVue = null;
                    }
                    el.classList.remove('is-inview');
                }
            });
        }, {
            // Seuil releve : a 0,05 l'animation partait alors que l'element
            // affleurait a peine le bas de l'ecran, souvent hors du regard.
            threshold: TACTILE_SEUIL,
            rootMargin: TACTILE_MARGE
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

/* ==========================================================================
   LA PLANCHE QUI SE SOULEVE
   ==========================================================================
   Aujourd'hui la coupe disparait et la visionneuse la remplace. Ici elle
   grandit depuis sa place jusqu'a occuper l'ecran : c'est le navigateur
   qui fait le lien entre les deux images, on lui dit seulement « ces deux
   la sont la meme chose » en leur donnant le meme nom de transition.

   Une difficulte : les coupes sont des PDF, et leur rendu prend quelques
   centaines de millisecondes. Au moment ou la transition demarre, la
   visionneuse est donc vide — il n'y a rien vers quoi grandir.
   On y glisse la vignette WebP deja affichee et deja decodee. Elle sert
   de cible au mouvement, puis le rendu PDF la remplace quand il arrive.
   Effet secondaire heureux : la visionneuse n'est plus jamais vide, on
   voit la planche tout de suite, en moins net, avant qu'elle ne
   s'affine.

   Si le navigateur ne connait pas les transitions de vue, ou si le
   visiteur a demande moins d'animations, on ouvre normalement.
   ========================================================================== */
function souleverLaPlanche(source, ouvrir) {
    const vignette   = source.querySelector('img');
    const bandeau    = document.getElementById('lb-canvas-wrap');
    const visionneuse = document.getElementById('drawing-lightbox');

    if (!document.startViewTransition || !vignette || !bandeau || !visionneuse ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ouvrir();
        return;
    }

    const NOM = 'planche-ouverte';

    function nettoyer() {
        vignette.style.viewTransitionName = '';
        visionneuse.classList.remove('sans-fondu');
        bandeau.querySelectorAll('img').forEach(i => { i.style.viewTransitionName = ''; });
    }

    // Image de depart : la vignette, a sa place dans la page.
    vignette.style.viewTransitionName = NOM;

    const transition = document.startViewTransition(() => {
        // PREMIERE FAUTE CORRIGEE. Un nom de transition ne peut etre porte
        // que par UN SEUL element a la fois. En laissant le nom sur la
        // vignette tout en le posant sur le relais, ils etaient deux dans
        // l'image d'arrivee — et le navigateur refusait toute la transition
        // (« Transition was aborted because of invalid state »). L'image de
        // depart, elle, est deja prise : on peut retirer le nom sans risque.
        vignette.style.viewTransitionName = '';

        ouvrir();

        // SECONDE FAUTE CORRIGEE. La visionneuse s'ouvre en fondu sur 0,35s.
        // Au moment ou le navigateur photographie l'image d'arrivee, le
        // fondu vient de commencer : elle est encore a opacite 0, et la
        // planche grandissait donc vers quelque chose d'invisible.
        // Pendant la transition on la rend visible d'un coup — c'est la
        // transition elle-meme qui fait l'animation, le fondu ferait double
        // emploi.
        visionneuse.classList.add('sans-fondu');

        const relais = vignette.cloneNode();
        relais.removeAttribute('id');
        relais.style.viewTransitionName = NOM;
        relais.style.maxWidth = '100%';
        relais.style.maxHeight = '100%';
        relais.style.objectFit = 'contain';
        relais.style.transform = 'none';   // la vignette porte un recadrage
        bandeau.appendChild(relais);
    });

    transition.finished.catch(() => {}).finally(nettoyer);
}

/* ==========================================================================
   COUPE CLICK → Open in Drawing Lightbox (reuses the same viewer)
   ========================================================================== */
function initCoupeClicks() {
    const coupeItems = document.querySelectorAll('[data-coupe-gallery] .stack-item[data-coupe-index]');
    if (!coupeItems.length) return;

    coupeItems.forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.getAttribute('data-coupe-index'), 10);
            // Use the drawing lightbox with diplomeCoupes gallery
            if (openDrawingGallery) {
                tracerPuis(item, () => souleverLaPlanche(item,
                    () => openDrawingGallery(diplomeCoupes, idx)));
            }
        });
    });
}

// Last statement of the file: every declaration above must exist before
// init runs. A module runs once the document is parsed; the guard also covers a
// late injection, when DOMContentLoaded has already fired.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
