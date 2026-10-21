/**
 * Carousels: slides with autoplay, a progress bar, dots, arrows and swipe.
 */

import { on, EVENTS } from './core/state.js';
import { SWIPE_MIN_DISTANCE_PX, prefersReducedMotion, onReducedMotionChange } from './core/env.js';

const SLIDE_DURATION_MS = 5000;
// Share of the carousel that must be on screen for autoplay to run.
const ON_SCREEN_THRESHOLD = 0.3;
const OBSERVER_FALLBACK_MS = 4000;
// The thin band across the middle of the screen that the frame of a video
// must cover for it to start: the video is then in the middle of the screen,
// and two carousels can never qualify at once.
const CENTRE_BAND_MARGIN = '-48% 0px -48% 0px';

// A video leads its carousel (study overview). It starts on its own, muted,
// when its carousel reaches the middle of the screen, and the progress bar
// waits for its end before moving on. Only one video plays at a time: the
// one that starts pauses the other. Off screen it pauses, and goes on when
// its carousel is back in the middle. It plays even when the system asks for
// reduced motion (Windows does whenever its animation effects are turned
// off): Even wants the video to run for every visitor, and it is muted and
// keeps its controls. The slides themselves still follow that preference.
// A visitor who pauses it takes over: the carousel then runs as usual. A
// browser that refuses to play it (autoplay blocked, low power) releases the
// carousel too, and the video is tried again at the visitor's first click or
// key, which browsers count as permission. 'done' marks a video that no
// longer holds the carousel; it is cleared each time its slide comes back.
const videoDone = new WeakSet();
// Pauses the script makes itself, which must not count as the visitor's.
const pausedByScript = new WeakSet();
// Slides shown at the last move, to tell a slide that comes back.
const currentSlides = new WeakSet();
// The video playing now, if any: there is never more than one.
let playingVideo = null;

function pauseByScript(video) {
    if (video.paused) return;
    pausedByScript.add(video);
    video.pause();
}

// Videos refused by the browser, with their carousel, to try again once the
// visitor has interacted with the page.
const refusedVideos = new Map();

function retryRefusedVideos() {
    refusedVideos.forEach((carousel, video) => {
        videoDone.delete(video);
        carousel.syncAutoplay();
    });
    refusedVideos.clear();
}

['pointerdown', 'keydown'].forEach(type => {
    document.addEventListener(type, retryRefusedVideos, { passive: true });
});

function startVideo(video, carousel) {
    if (playingVideo && playingVideo !== video) pauseByScript(playingVideo);
    // Set again in script: some browsers only trust the properties.
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {
        videoDone.add(video);
        refusedVideos.set(video, carousel);
        carousel.syncAutoplay();
    });
}

// True while the current slide's video holds the carousel. It starts when
// the carousel is in the middle of the open page, and pauses when it leaves
// the screen.
function holdForVideo(slide, carousel) {
    const video = slide.querySelector('video');
    if (!video || videoDone.has(video)) return false;
    // The pause that ends playback comes before the ended event: without
    // this check the video would be started again from the beginning.
    if (video.ended) {
        videoDone.add(video);
        return false;
    }

    if (!carousel.isPageOpen || !carousel.isOnScreen) {
        pauseByScript(video);
    } else if (carousel.isCentred && video.paused) {
        startVideo(video, carousel);
    }
    return true;
}

// Hidden slides stay in the DOM: only the visible sheet may take keyboard
// focus. Sheets that keyboard-activation.js left out of the tab order carry
// no tabindex and stay out of it. A video on a slide that leaves the screen
// stops, and its controls leave the tab order with it; a video whose slide
// comes back holds the carousel again, from the start if it had ended.
function setSlideShown(slide, isCurrent) {
    slide.classList.toggle('is-active', isCurrent);
    const sheet = slide.querySelector('.drawing-sheet-wrap');
    if (sheet && sheet.hasAttribute('tabindex')) sheet.tabIndex = isCurrent ? 0 : -1;
    slide.querySelectorAll('video').forEach(video => {
        video.tabIndex = isCurrent ? 0 : -1;
        if (!isCurrent) {
            pauseByScript(video);
        } else if (!currentSlides.has(slide)) {
            videoDone.delete(video);
            if (video.ended) video.currentTime = 0;
        }
    });
    if (isCurrent) currentSlides.add(slide);
    else currentSlides.delete(slide);
}

// Builds the state and the moves of one carousel. Autoplay runs only while
// it is switched on, the page is open AND the carousel is on screen: a
// carousel lower down the page must not have moved on by the time the
// visitor reaches it. Every path goes through syncAutoplay, so the carousel
// cannot be left frozen by accident.
function createCarousel(container, slides) {
    const dots = container.querySelectorAll('.carousel-dot');
    // The bar is styled differently on the project pages and on the drawings
    // page; the hook is the same.
    const progressBar = container.querySelector('.js-carousel-progress');
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
        isCentred: false,
        isVideoPlaying: false,
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

    // A video being watched holds the carousel on its slide, and so does the
    // leading video until it is over.
    function syncAutoplay() {
        if (holdForVideo(slides[currentIndex], carousel)) stopAutoplay();
        else if (carousel.isPlaying && carousel.isPageOpen && carousel.isOnScreen && !carousel.isVideoPlaying) startAutoplay();
        else stopAutoplay();
    }

    function goToSlide(index) {
        // Wraps around at both ends.
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => setSlideShown(slide, slideIndex === currentIndex));

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

    // Only a carousel with a video needs to know when its frame is in the
    // middle of the screen.
    const frame = container.querySelector('video') && container.querySelector('.frame-wrap');
    if (frame) {
        new IntersectionObserver(entries => {
            carousel.isCentred = entries[0].isIntersecting;
            carousel.syncAutoplay();
        }, { rootMargin: CENTRE_BAND_MARGIN }).observe(frame);
    }

    // A working observer reports at once, even to say "not visible". If it
    // never reports, autoplay falls back to running rather than staying
    // frozen for good.
    setTimeout(() => {
        if (hasObserverFired) return;
        carousel.isOnScreen = true;
        carousel.isCentred = true;
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

// Videos of a carousel (study overview): autoplay waits while one plays.
// Its end, or a pause from the visitor, releases the carousel; a pause the
// script made (off screen, other slide, other page) keeps it held.
function bindVideos(container, carousel) {
    const videos = container.querySelectorAll('video');
    if (!videos.length) return;

    const setVideoPlaying = isVideoPlaying => {
        carousel.isVideoPlaying = isVideoPlaying;
        carousel.syncAutoplay();
    };
    videos.forEach(video => {
        video.addEventListener('play', () => {
            // A video started by the visitor stops the one already playing.
            if (playingVideo && playingVideo !== video) pauseByScript(playingVideo);
            playingVideo = video;
            setVideoPlaying(true);
        });
        video.addEventListener('pause', () => {
            if (playingVideo === video) playingVideo = null;
            if (pausedByScript.has(video)) pausedByScript.delete(video);
            else if (!video.ended) videoDone.add(video);
            setVideoPlaying(false);
        });
        video.addEventListener('ended', () => {
            videoDone.add(video);
            setVideoPlaying(false);
        });
    });

    const parentPage = container.closest('.page');
    if (!parentPage) return;
    on(EVENTS.PAGE_SHOWN, () => {
        if (!parentPage.classList.contains('is-active')) videos.forEach(pauseByScript);
    });
}

function initCarousel(container) {
    const slides = container.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    const carousel = createCarousel(container, slides);
    bindControls(container, carousel);
    watchVisibility(container, carousel);
    bindSwipe(container, carousel);
    bindVideos(container, carousel);
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
