/**
 * Animated favicon: three hand-drawn frames cycled while the tab is
 * visible.
 */

import { prefersReducedMotion } from './core/env.js';

const ICON_SIZE_PX = 100;
const ICON_CORNER_RADIUS_PX = 25;
const ICON_BACKGROUND = '#111111';
const LETTER = 'E';
const LETTER_COLOR = '#ffffff';
const LETTER_FONT = "105px 'Skribblugh', cursive";
// Vertical offset that centres the glyph.
const LETTER_OFFSET_Y_PX = 15;
const FRAME_INTERVAL_MS = 120;

// The letter is slightly turned, scaled and moved on each frame.
const FRAME_TRANSFORMS = [
    { rotation: -0.01, x: -3, y: -1, scale: 1.02 },
    { rotation: 0.01, x: 2, y: 1, scale: 0.98 },
    { rotation: 0, x: -1, y: 0, scale: 1.0 },
];

function drawFrame(context, { rotation, x, y, scale }) {
    context.clearRect(0, 0, ICON_SIZE_PX, ICON_SIZE_PX);

    context.fillStyle = ICON_BACKGROUND;
    context.beginPath();
    if (context.roundRect) {
        context.roundRect(0, 0, ICON_SIZE_PX, ICON_SIZE_PX, ICON_CORNER_RADIUS_PX);
    } else {
        // roundRect is missing before Safari 16.
        context.rect(0, 0, ICON_SIZE_PX, ICON_SIZE_PX);
    }
    context.fill();

    context.save();
    context.translate(ICON_SIZE_PX / 2, ICON_SIZE_PX / 2);
    context.rotate(rotation);
    context.scale(scale, scale);
    context.translate(x, y);

    context.fillStyle = LETTER_COLOR;
    context.font = LETTER_FONT;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(LETTER, 0, LETTER_OFFSET_Y_PX);

    context.restore();
}

// Returns each frame as a PNG data URL.
function drawFrames() {
    const canvas = document.createElement('canvas');
    canvas.width = ICON_SIZE_PX;
    canvas.height = ICON_SIZE_PX;
    const context = canvas.getContext('2d');

    return FRAME_TRANSFORMS.map(transform => {
        drawFrame(context, transform);
        return canvas.toDataURL('image/png');
    });
}

// The frames are PNG images, unlike the static icon they replace.
function showFrame(favicon, frame) {
    if (favicon.type !== 'image/png') favicon.type = 'image/png';
    favicon.href = frame;
}

// The loop is suspended while the tab is hidden.
function cycleFrames(favicon, frames) {
    let currentFrame = 0;
    let timer = null;

    const showNextFrame = () => {
        showFrame(favicon, frames[currentFrame]);
        currentFrame = (currentFrame + 1) % frames.length;
    };
    const start = () => {
        if (timer === null) timer = setInterval(showNextFrame, FRAME_INTERVAL_MS);
    };
    const stop = () => {
        clearInterval(timer);
        timer = null;
    };

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') start();
        else stop();
    });
    if (document.visibilityState === 'visible') start();
}

/** Draws the frames once the display font is ready, then cycles them. */
export function initFavicon() {
    const favicon = document.getElementById('favicon');
    if (!favicon) return;

    // The letter is drawn with the display font, which must be loaded.
    document.fonts.ready.then(() => {
        const frames = drawFrames();
        // A single still frame when reduced motion is requested.
        if (prefersReducedMotion()) showFrame(favicon, frames[0]);
        else cycleFrames(favicon, frames);
    });
}
