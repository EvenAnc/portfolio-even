/**
 * Home hero: entrance animation, and the logo that hands over to the
 * header on scroll.
 */

// Resting opacity of the scroll hint under the hero. The hint is shown at
// full strength so that its label keeps enough contrast; the thin line is
// dimmed on its own in the stylesheet. Must match .scroll-invite there.
const SCROLL_INVITE_OPACITY = 1;

/** Plays the entrance of the hero, one frame later so that the page is laid out. */
export function playHeroIntro() {
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

/**
 * Puts the hero back in its resting state when the home page is shown.
 * @param {string} pageId
 */
export function resetHero(pageId) {
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

/**
 * Past a threshold the hero logo leaves and the header logo takes over;
 * scrolling back up reverses it.
 * @param {object} lenis scroll instance of the home page
 */
export function bindHeroScroll(lenis) {
    const heroLogoWrap = document.getElementById('hero-logo-wrap');
    const headerLogo   = document.getElementById('header-logo');
    const scrollInvite = document.getElementById('scroll-invite');

    let logoInHeader = false;

    lenis.on('scroll', ({ scroll }) => {
        const threshold = 120;

        if (scroll > threshold && !logoInHeader) {
            logoInHeader = true;

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
