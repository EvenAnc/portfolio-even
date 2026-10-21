/**
 * Sketches of the drawings page: a compact grid where the sheet under the
 * mouse grows (drawings.css). The stylesheet does the zoom with a transform
 * alone; this script only picks, as the pointer comes in, the corner it
 * grows from, so that a sheet on an edge of the grid or of the screen stays
 * in view, and puts the newest sheet above the one still shrinking back.
 */

// Same query as the zoom in drawings.css.
const ZOOM_QUERY = '(hover: hover) and (min-width: 769px)';
// A sheet this close to an edge grows away from it, as a share of the grid
// width, and in pixels from the top and bottom of the window.
const EDGE_SHARE = 0.2;
const EDGE_PX = 150;
// Stacking levels handed out to the sheets as they grow; reset long before
// they could reach the header.
const FIRST_LAYER = 10;
const LAST_LAYER = 900;

let layer = FIRST_LAYER;

// Layout boxes, not getBoundingClientRect: a sheet still shrinking back
// would report its zoomed size.
function growFrom(item, grid) {
    const left = item.offsetLeft;
    const right = grid.clientWidth - (left + item.offsetWidth);
    const top = grid.getBoundingClientRect().top + item.offsetTop;
    const bottom = window.innerHeight - (top + item.offsetHeight);

    let x = '50%';
    if (left < grid.clientWidth * EDGE_SHARE) x = '0%';
    else if (right < grid.clientWidth * EDGE_SHARE) x = '100%';

    let y = '50%';
    if (top < EDGE_PX) y = '0%';
    else if (bottom < EDGE_PX) y = '100%';

    return `${x} ${y}`;
}

function prepareZoom(item, grid) {
    item.style.transformOrigin = growFrom(item, grid);
    layer = layer >= LAST_LAYER ? FIRST_LAYER : layer + 1;
    item.style.zIndex = String(layer);
}

/** Wires the sheets of the sketches grid. */
export function initSketchbook() {
    const grid = document.querySelector('.sketchbook-grid');
    if (!grid) return;
    const canZoom = window.matchMedia(ZOOM_QUERY);

    grid.querySelectorAll('.sketch-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (canZoom.matches) prepareZoom(item, grid);
        });
        // A sheet reached with the keyboard grows the same way.
        item.addEventListener('focusin', () => {
            if (canZoom.matches) prepareZoom(item, grid);
        });
    });
}
