/**
 * Carousels: slides with autoplay, a progress bar, dots, arrows and swipe.
 */

import { on, EVENTS } from './core/state.js';
import { SWIPE_MIN_DISTANCE_PX, prefersReducedMotion, onReducedMotionChange } from './core/env.js';

const SLIDE_DURATION_MS = 5000;
// Share of the carousel that must be on screen for autoplay to run.
const ON_SCREEN_THRESHOLD = 0.3;
const OBSERVER_FALLBACK_MS = 4000;

// Builds the state and the moves of one carousel. Autoplay runs only while
// it is switched on, the page is open AND the carousel is on screen: a
// carousel lower down the page must not have moved on by the time the
// visitor reaches it. Every path goes through syncAutoplay, so the carousel
// cannot be left frozen by accident.
function createCarousel(container, slides) {
    const dots = container.querySelectorAll('.carousel-dot');
    // The project pages and the drawings page name these two elements
    // differently; both are accepted.
    const progressBar = container.querySelector('.carousel-progress-bar, .carousel-timer-bar');
    const indicator = container.querySelector('.carousel-counter');

    let currentIndex = 0;
    let autoplayTimeout = null;
    let progressFrame = null;
    let progressStart = 0;

    const carousel = {
        // Under reduced motion the slides only change when the visitor asks.
        isPlaying: !prefersReducedMotion(),
        isPageOpen: false,
        isOnScreen: false,
        goToSlide,
        showNext: () => goToSlide(currentIndex + 1),
        showPrevious: () => goToSlide(currentIndex - 1),
        stopAutoplay,
        syncAutoplay,
    };

    function drawProgress(time) {
        if (!carousel.isPlaying) return;
        const elapsed = time - progressStart;
        const percent = Math.min((elapsed / SLIDE_DURATION_MS) * 100, 100);
        if (progressBar) progressBar.style.width = `${percent}%`;

        if (elapsed < SLIDE_DURATION_MS) {
            progressFrame = requestAnimationFrame(drawProgress);
        }
    }

    function stopAutoplay() {
        clearTimeout(autoplayTimeout);
        cancelAnimationFrame(progressFrame);
        if (progressBar) progressBar.style.width = '0%';
    }

    function startAutoplay() {
        stopAutoplay();

        progressStart = performance.now();
        autoplayTimeout = setTimeout(carousel.showNext, SLIDE_DURATION_MS);
        progressFrame = requestAnimationFrame(drawProgress);
    }

    function syncAutoplay() {
        if (carousel.isPlaying && carousel.isPageOpen && carousel.isOnScreen) startAutoplay();
        else stopAutoplay();
    }

    function goToSlide(index) {
        // Wraps around at both ends.
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            const isCurrent = slideIndex === currentIndex;
            slide.classList.toggle('is-active', isCurrent);
            // Hidden slides stay in the DOM: only the visible sheet may take
            // keyboard focus. Sheets that keyboard-activation.js left out of
            // the tab order carry no tabindex and stay out of it.
            const sheet = slide.querySelector('.drawing-sheet-wrap');
            if (sheet && sheet.hasAttribute('tabindex')) sheet.tabIndex = isCurrent ? 0 : -1;
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === currentIndex);
        });

        if (indicator) {
            indicator.textContent = `${currentIndex + 1} / ${slides.length}`;
        }

        syncAutoplay();
    }

    return carousel;
}

function bindPlayPause(container, carousel) {
    const playPauseBtn = container.querySelector('.carousel-toggle');
    if (!playPauseBtn) return;

    // The button is a toggle named after autoplay: pressed while it runs.
    // The stylesheet swaps the pause and play icons on is-paused.
    function showPlayState() {
        playPauseBtn.setAttribute('aria-pressed', String(carousel.isPlaying));
        playPauseBtn.classList.toggle('is-paused', !carousel.isPlaying);
    }

    function setPlaying(isPlaying) {
        carousel.isPlaying = isPlaying;
        showPlayState();
        carousel.syncAutoplay();
    }

    showPlayState();
    playPauseBtn.addEventListener('click', () => setPlaying(!carousel.isPlaying));
    // Asking for less motion during the visit pauses autoplay; the button
    // still starts it again.
    onReducedMotionChange(isReduced => {
        if (isReduced) setPlaying(false);
    });
}

function bindControls(container, carousel) {
    const prevBtn = container.querySelector('.carousel-arrow--prev');
    const nextBtn = container.querySelector('.carousel-arrow--next');

    if (prevBtn) prevBtn.addEventListener('click', carousel.showPrevious);
    if (nextBtn) nextBtn.addEventListener('click', carousel.showNext);
    bindPlayPause(container, carousel);

    container.querySelectorAll('.carousel-dot').forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => carousel.goToSlide(dotIndex));
    });
}

function watchVisibility(container, carousel) {
    const parentPage = container.closest('.page');
    carousel.isPageOpen = !parentPage || parentPage.classList.contains('is-active');

    let hasObserverFired = false;
    new IntersectionObserver(entries => {
        hasObserverFired = true;
        carousel.isOnScreen = entries[0].isIntersecting;
        carousel.syncAutoplay();
    }, { threshold: ON_SCREEN_THRESHOLD }).observe(container);

    // A working observer reports at once, even to say "not visible". If it
    // never reports, autoplay falls back to running rather than staying
    // frozen for good.
    setTimeout(() => {
        if (hasObserverFired) return;
        carousel.isOnScreen = true;
        carousel.syncAutoplay();
    }, OBSERVER_FALLBACK_MS);

    if (!parentPage) return;
    on(EVENTS.PAGE_SHOWN, () => {
        const isOpen = parentPage.classList.contains('is-active');
        if (isOpen === carousel.isPageOpen) return;
        carousel.isPageOpen = isOpen;
        carousel.syncAutoplay();
    });
}

function bindSwipe(container, carousel) {
    const viewport = container.querySelector('.carousel-viewport');
    if (!viewport) return;

    let touchStartX = 0;

    viewport.addEventListener('touchstart', event => {
        touchStartX = event.changedTouches[0].clientX;
        carousel.stopAutoplay();
    }, { passive: true });

    // A touch pauses autoplay; one that was not a swipe resumes it. Fingers
    // land on the image whenever the page is scrolled, and the carousel
    // must not stay paused after that.
    viewport.addEventListener('touchend', event => {
        const deltaX = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) <= SWIPE_MIN_DISTANCE_PX) {
            carousel.syncAutoplay();
        } else if (deltaX < 0) {
            carousel.showNext();
        } else {
            carousel.showPrevious();
        }
    }, { passive: true });

    viewport.addEventListener('touchcancel', carousel.syncAutoplay, { passive: true });
}

function initCarousel(container) {
    const slides = container.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    const carousel = createCarousel(container, slides);
    bindControls(container, carousel);
    watchVisibility(container, carousel);
    bindSwipe(container, carousel);
    // A carousel without a play button follows the preference on its own.
    if (!container.querySelector('.carousel-toggle')) {
        onReducedMotionChange(isReduced => {
            carousel.isPlaying = !isReduced;
            carousel.syncAutoplay();
        });
    }
}

/** Sets up every carousel of the document; each one keeps its own state. */
export function initCarousels() {
    document.querySelectorAll('.carousel').forEach(initCarousel);
}
