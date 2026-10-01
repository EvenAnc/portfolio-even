/**
 * Animated favicon: three hand-drawn frames cycled while the tab is
 * visible.
 */

import { prefersReducedMotion } from './core/env.js';

/** Draws the frames once the display font is ready, then cycles them. */
export function initFavicon() {
    const favicon = document.getElementById('favicon');
    if (!favicon) return;

    // The letter is drawn with the display font, which must be loaded.
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

            // Rounded dark background.
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(0, 0, 100, 100, 25);
            } else {
                ctx.rect(0, 0, 100, 100);  // roundRect is missing before Safari 16
            }
            ctx.fill();

            // The letter, slightly moved, turned and scaled on each frame.
            ctx.save();
            ctx.translate(50, 50);
            ctx.rotate(transforms[i].r);
            ctx.scale(transforms[i].s, transforms[i].s);
            ctx.translate(transforms[i].x, transforms[i].y);

            ctx.fillStyle = "#ffffff";
            ctx.font = "105px 'Skribblugh', cursive";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("E", 0, 15);  // offset that centres the glyph

            ctx.restore();

            frames.push(canvas.toDataURL('image/png'));
        }

        // The loop is suspended while the tab is hidden and never starts when
        // reduced motion is requested.
        const reduceMotion = prefersReducedMotion();

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
            favicon.href = frames[0];  // a single still frame
        } else if (document.visibilityState === 'visible') {
            startFavicon();
        }
    });
}
