/**
 * Sketches of the drawings page: a compact grid where the sheet under the
 * mouse grows (drawings.css). The layer that grows lets the mouse through,
 * so the sheet under the pointer is always the one whose cell it is in: a
 * neighbour stays within reach even when a grown sheet covers it. This
 * script follows the pointer from cell to cell, marks the sheet to grow,
 * picks the corner it grows from, so that a sheet on an edge of the grid or
 * of the screen stays in view, and puts it above the one shrinking back.
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
let zoomed = null;

// Layout boxes, not getBoundingClientRect: a sheet still shrinking back
// would report its grown size. Returns the point it grows from, in pixels
// of its cell.
function growFrom(item, grid) {
    const left = item.offsetLeft;
    const right = grid.clientWidth - (left + item.offsetWidth);
    const top = grid.getBoundingClientRect().top + item.offsetTop;
    const bottom = window.innerHeight - (top + item.offsetHeight);

    let x = item.offsetWidth / 2;
    if (left < grid.clientWidth * EDGE_SHARE) x = 0;
    else if (right < grid.clientWidth * EDGE_SHARE) x = item.offsetWidth;

    let y = item.offsetHeight / 2;
    if (top < EDGE_PX) y = 0;
    else if (bottom < EDGE_PX) y = item.offsetHeight;

    return { x, y };
}

function zoom(item, grid) {
    if (item === zoomed) return;
    if (zoomed) zoomed.classList.remove('is-zoomed');
    zoomed = item;
    if (!item) return;

    // The caption hangs below the cell: it grows from the same point, seen
    // from its own box.
    const { x, y } = growFrom(item, grid);
    const caption = item.querySelector('.sketch-caption');
    item.style.setProperty('--zoom-x', `${x}px`);
    item.style.setProperty('--zoom-y', `${y}px`);
    item.style.setProperty('--zoom-cap-y', `${y - (caption ? caption.offsetTop : item.offsetHeight)}px`);
    layer = layer >= LAST_LAYER ? FIRST_LAYER : layer + 1;
    item.style.zIndex = String(layer);
    item.classList.add('is-zoomed');
}

/** Wires the sheets of the sketches grid. */
export function initSketchbook() {
    const grid = document.querySelector('.sketchbook-grid');
    if (!grid) return;
    const canZoom = window.matchMedia(ZOOM_QUERY);

    // Between two cells, or out of the grid, nothing grows.
    grid.addEventListener('pointermove', event => {
        if (!canZoom.matches || event.pointerType === 'touch') return;
        zoom(event.target.closest('.sketch-item'), grid);
    });
    grid.addEventListener('pointerleave', () => zoom(null, grid));

    // A sheet reached with the keyboard grows the same way. A focus the
    // viewer gives back after a mouse click does not: only a visible focus
    // counts.
    grid.addEventListener('focusin', event => {
        if (!canZoom.matches || !event.target.matches(':focus-visible')) return;
        zoom(event.target.closest('.sketch-item'), grid);
    });
    grid.addEventListener('focusout', event => {
        if (zoomed && !zoomed.contains(event.relatedTarget)) zoom(null, grid);
    });
}
