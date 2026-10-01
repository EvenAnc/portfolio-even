/**
 * Carousels: slides with autoplay, a progress bar, dots, arrows and swipe.
 */

// ─────────────────────────────────────
// CARROUSEL BANDE DESSINÉE (BD)
// ─────────────────────────────────────
export function initBDCarousel() {
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
