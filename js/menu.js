/**
 * Full-screen menu: opening, closing, and the navigation controls of the
 * header.
 */

import { state, on, EVENTS } from './core/state.js';
import { showPage, goToContact } from './router.js';

// Time the menu takes to close; the page changes once it is out of the way.
const MENU_CLOSE_MS = 420;

let isMenuOpen = false;
let burger = null;
let menuOverlay = null;
// Page change waiting for the menu to close.
let navigationTimer = null;

function setMenuOpen(isOpen) {
    isMenuOpen = isOpen;
    document.body.classList.toggle('menu-open', isOpen);
    if (menuOverlay) menuOverlay.setAttribute('aria-hidden', String(!isOpen));
    burger.setAttribute('aria-expanded', String(isOpen));
}

function playOpeningAnimation() {
    gsap.fromTo(document.querySelectorAll('.menu-nav-item'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.065, ease: 'power3.out', delay: 0.12 },
    );

    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
        gsap.fromTo(menuLogo,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.05 },
        );
    }

    const scribble = document.querySelector('.menu-scribble');
    if (scribble) {
        gsap.fromTo(scribble,
            { opacity: 0, rotate: -15 },
            { opacity: 0.35, rotate: -8, duration: 0.5, delay: 0.5 },
        );
    }
}

function openMenu() {
    setMenuOpen(true);
    playOpeningAnimation();
}

function closeMenu() {
    setMenuOpen(false);
}

function toggleMenu() {
    if (isMenuOpen) closeMenu();
    else openMenu();
}

// Each item waits for the menu to close before the page changes.
function onMenuItemClick(event) {
    event.preventDefault();
    const page = event.currentTarget.dataset.page;
    closeMenu();

    clearTimeout(navigationTimer);
    if (page === 'contact') {
        goToContact(MENU_CLOSE_MS);
    } else {
        navigationTimer = setTimeout(() => showPage(page), MENU_CLOSE_MS);
    }
}

function bindHeaderControls() {
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => showPage('projects'));

    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
        headerLogo.addEventListener('click', event => {
            event.preventDefault();
            if (state.page !== 'home') showPage('home');
        });
    }
}

/** Wires the burger button, the menu items, the header logo and the back button. */
export function initMenu() {
    burger = document.getElementById('burger-btn');
    if (!burger) return;
    menuOverlay = document.getElementById('menu-overlay');

    burger.addEventListener('click', toggleMenu);
    bindHeaderControls();

    document.querySelectorAll('.menu-nav-item').forEach(item => {
        item.addEventListener('click', onMenuItemClick);
    });

    // A click on the backdrop, outside links and buttons, closes the menu.
    if (menuOverlay) {
        menuOverlay.setAttribute('aria-hidden', 'true');
        menuOverlay.addEventListener('click', event => {
            if (!event.target.closest('a, button')) closeMenu();
        });
    }

    // History navigation swaps the page underneath: a menu left open would
    // cover the new page, and a page change still waiting for the menu to
    // close would override the history.
    on(EVENTS.HISTORY_NAVIGATION, () => {
        clearTimeout(navigationTimer);
        if (isMenuOpen) closeMenu();
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !isMenuOpen) return;
        closeMenu();
        // Focus was on a menu link that has just become hidden.
        burger.focus({ preventScroll: true });
    });
}
