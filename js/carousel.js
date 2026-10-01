/**
 * Carousels: slides with autoplay, a progress bar, dots, arrows and swipe.
 */

/** Sets up every carousel of the document; each one keeps its own state. */
export function initCarousels() {
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
        // The project pages and the drawings page name these two elements
        // differently; both are accepted.
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

            syncAutoplay();
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
                syncAutoplay();
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

        // Autoplay runs only while the page is open AND the carousel is on
        // screen: a carousel lower down the page must not have moved on by the
        // time the visitor reaches it. Every path goes through syncAutoplay, so
        // the carousel cannot be left frozen by accident.
        const parentPage = container.closest('.page');
        let isPageOpen = !parentPage || parentPage.classList.contains('is-active');
        let isOnScreen = false;

        function syncAutoplay() {
            if (isPlaying && isPageOpen && isOnScreen) startAutoplay();
            else stopAutoplay();
        }

        if ('IntersectionObserver' in window) {
            let hasObserverFired = false;
            new IntersectionObserver(entries => {
                hasObserverFired = true;
                isOnScreen = entries[0].isIntersecting;
                syncAutoplay();
            }, { threshold: 0.3 }).observe(container);

            // A working observer reports at once, even to say "not visible".
            // If the API exists but never reports, autoplay falls back to
            // running rather than staying frozen for good.
            setTimeout(() => {
                if (!hasObserverFired) {
                    isOnScreen = true;
                    syncAutoplay();
                }
            }, 4000);
        } else {
            isOnScreen = true;
            syncAutoplay();
        }

        if (parentPage) {
            const pageObserver = new MutationObserver(() => {
                const isOpen = parentPage.classList.contains('is-active');
                if (isOpen !== isPageOpen) {
                    isPageOpen = isOpen;
                    syncAutoplay();
                }
            });
            pageObserver.observe(parentPage, { attributes: true, attributeFilter: ['class'] });
        }

        let touchStartX = 0;
        const viewport = container.querySelector('.bd-carousel-viewport');
        if (viewport) {
            viewport.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].clientX;
                stopAutoplay();
            }, { passive: true });
            // A touch pauses autoplay; one that was not a swipe resumes it.
            // Fingers land on the image whenever the page is scrolled, and
            // the carousel must not stay paused after that.
            viewport.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 40) {
                    if (dx < 0) nextSlide();
                    else prevSlide();
                } else {
                    syncAutoplay();
                }
            }, { passive: true });
            viewport.addEventListener('touchcancel', () => syncAutoplay(), { passive: true });
        }
    });
}
