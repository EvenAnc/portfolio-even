/**
 * Full-screen menu: opening, closing, and the navigation controls of the
 * header.
 */

import { state, on } from './core/state.js';
import { showPage, goToContact } from './router.js';

let isMenuOpen = false;

export function initMenu() {
    const burger = document.getElementById('burger-btn');
    burger.addEventListener('click', toggleMenu);

    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showPage('projects');
        });
    }

    // Each item waits for the menu to close before the page changes.
    document.querySelectorAll('.menu-nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const page = item.dataset.page;
            closeMenu();

            if (page === 'contact') {
                goToContact(420);
            } else {
                setTimeout(() => showPage(page), 420);
            }
        });
    });

    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
        headerLogo.addEventListener('click', e => {
            e.preventDefault();
            if (state.page !== 'home') showPage('home');
        });
    }

    // A click on the backdrop, outside links and buttons, closes the menu.
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
        menuOverlay.setAttribute('aria-hidden', 'true');
        menuOverlay.addEventListener('click', e => {
            if (!e.target.closest('a') && !e.target.closest('button')) {
                closeMenu();
            }
        });
    }

    // History navigation swaps the page underneath: a menu left open would
    // cover the new page.
    on('history-navigation', () => {
        if (isMenuOpen) closeMenu();
    });

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
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) menuOverlay.setAttribute('aria-hidden', 'false');
    setBurgerExpanded(true);

    const items = document.querySelectorAll('.menu-nav-item');
    gsap.fromTo(items, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1,
        duration: 0.55, stagger: 0.065,
        ease: 'power3.out',
        delay: 0.12
    });

    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
        gsap.fromTo(menuLogo,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.05 }
        );
    }

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
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) menuOverlay.setAttribute('aria-hidden', 'true');
    setBurgerExpanded(false);
}

function setBurgerExpanded(expanded) {
    const burger = document.getElementById('burger-btn');
    if (burger) burger.setAttribute('aria-expanded', String(expanded));
}
