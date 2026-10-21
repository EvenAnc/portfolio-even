/**
 * Red sketch frames: five hand-drawn takes of the same rectangle, dealt out
 * across the site in document order, so that two neighbouring frames never
 * draw the same line. The frames stay hidden until hovered or touched, and
 * the paths are dealt once at start: nothing runs afterwards.
 */

// Drawn in the 400 x 300 box of the frames, which stretches to each frame
// (preserveAspectRatio none). Every take stays shorter than the 1800-unit
// dash that draws it on hover (frame.css), and inside the box.
const FRAME_PATHS = [
    // The original: straight sides, bevelled corners.
    'M12 8 L388 5 L395 12 L392 288 L385 295 L14 292 L6 286 L9 14 Z',
    // Softened corners; the stroke runs a little past its start.
    'M18 10 C110 6, 270 4, 380 7 Q392 8 393 20 C395 110, 391 200, 391 280 Q391 292 379 292 C270 295, 140 296, 20 291 Q8 290 8 278 C6 190, 9 100, 9 22 Q9 9 24 8',
    // Chipped: small breaks along the sides, an overshoot along the top.
    'M10 10 L118 7 L123 10 L258 6 L386 8 L392 16 L390 94 L394 99 L392 206 L389 288 L380 293 L272 291 L267 295 L138 292 L16 290 L7 283 L9 182 L5 177 L8 62 L10 12 L58 9',
    // Tilted: the top climbs to the right, the corners are rounded.
    'M8 16 Q200 4 386 6 Q395 7 394 17 L390 283 Q389 293 379 293 Q200 297 18 290 Q8 289 8 279 L9 26 Q9 15 26 14',
    // Loose: bowed sides, a wide overshoot at the top left.
    'M26 6 C150 11, 300 3, 380 8 C391 9, 395 15, 394 27 C390 120, 396 210, 391 278 C390 289, 384 293, 371 293 C260 290, 140 297, 25 291 C13 290, 7 285, 7 272 C9 190, 5 100, 9 25 C10 14, 16 8, 32 6',
];

/** Gives each frame of the document its take of the red rectangle. */
export function initSketchFrames() {
    document.querySelectorAll('svg.sketch-rect-svg[viewBox="0 0 400 300"] .sketch-rect-path').forEach((path, index) => {
        path.setAttribute('d', FRAME_PATHS[index % FRAME_PATHS.length]);
    });
}
