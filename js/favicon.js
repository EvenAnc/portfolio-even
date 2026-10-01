/**
 * Animated favicon: three hand-drawn frames cycled while the tab is visible.
 */

/* --- FAVICON ANIMATION (CANVAS BASED) --- */
export function animateFavicon() {
    const favicon = document.getElementById('favicon');
    if (!favicon) return;
    
    // Attendre que la police soit chargée
    document.fonts.ready.then(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        const frames = [];
        const transforms = [
            { r: -0.01, x: -3, y: -1, s: 1.02 },
            { r: 0.01,  x:  2, y:  1,  s: 0.98 },
            { r: 0,     x: -1, y: 0, s: 1.0 }
        ];

        for (let i = 0; i < 3; i++) {
            ctx.clearRect(0, 0, 100, 100);
            
            // Fond noir arrondi
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(0, 0, 100, 100, 25);
            } else {
                ctx.rect(0, 0, 100, 100); // Fallback
            }
            ctx.fill();
            
            // Texte E
            ctx.save();
            ctx.translate(50, 50);
            ctx.rotate(transforms[i].r);
            ctx.scale(transforms[i].s, transforms[i].s);
            ctx.translate(transforms[i].x, transforms[i].y);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "105px 'Skribblugh', cursive";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("E", 0, 15); // Offset X et Y pour centrer parfaitement la lettre
            
            ctx.restore();
            
            frames.push(canvas.toDataURL('image/png'));
        }

        // FIX Q-02 : la boucle tournait a 8 img/s indefiniment, y compris
        // onglet en arriere-plan (batterie mobile + main thread reveille en
        // permanence). Elle est desormais suspendue des que l'onglet n'est
        // plus visible, et desactivee si l'utilisateur demande moins d'animation.
        // Comportement a l'ecran, onglet au premier plan : strictement identique.
        const reduceMotion = window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let currentFrame = 0;
        let faviconTimer = null;

        const stepFavicon = () => {
            favicon.href = frames[currentFrame];
            currentFrame = (currentFrame + 1) % 3;
        };

        const startFavicon = () => {
            if (faviconTimer !== null || reduceMotion) return;
            faviconTimer = setInterval(stepFavicon, 120);
        };
        const stopFavicon = () => {
            if (faviconTimer === null) return;
            clearInterval(faviconTimer);
            faviconTimer = null;
        };

        document.addEventListener('visibilitychange', () => {
            document.visibilityState === 'visible' ? startFavicon() : stopFavicon();
        });

        if (reduceMotion) {
            favicon.href = frames[0];   // une frame fixe, pas d'animation
        } else if (document.visibilityState === 'visible') {
            startFavicon();
        }
    });
}
