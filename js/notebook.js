/**
 * Notebook section: hand-ruled lines, and a cached rendering of the
 * torn-paper sheet for Safari.
 */

const DEFAULT_PAPER_COLOR = '#f2f0eb';
const LINE_SPACING_PX = 34;
const FIRST_LINE_TOP_PX = 10;
const MIN_SHEET_HEIGHT_PX = 800;
// Lines added past the measured height.
const EXTRA_LINES = 2;
const REDRAW_DEBOUNCE_MS = 200;
const FALLBACK_DRAW_DELAY_MS = 200;

// The two rules of the red margin (::before and ::after) are read back
// from the stylesheet: they move on small screens.
function marginRect(sheet, pseudo, height) {
    const style = getComputedStyle(sheet, pseudo);
    if (style.content === 'none') return '';
    return `<rect x="${parseFloat(style.left)}" y="0" width="${parseFloat(style.width)}" `
        + `height="${height}" fill="${style.backgroundColor}"/>`;
}

function paperSvg(width, height, background, margins, filterMarkup) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" `
        + `viewBox="0 0 ${width} ${height}"><defs>${filterMarkup}</defs>`
        + `<g filter="url(#paper-tear)"><rect width="${width}" height="${height}" `
        + `fill="${background}"/>${margins}</g></svg>`;
}

/**
 * The sheet carries an feTurbulence filter over the whole section. Safari
 * recomputes it on the CPU on every frame as soon as anything animates
 * elsewhere on the page, which makes the home page crawl. On WebKit only,
 * the same sheet is painted once into an SVG image (same filter, same
 * coordinates, same seed), which the browser caches like any other image.
 *
 * -webkit-hyphens is only recognised by WebKit: other engines return here
 * and keep the live filter.
 */
export function initSafariPaperCache() {
    if (!CSS.supports('-webkit-hyphens', 'none')) return;
    const sheet = document.querySelector('#notebook-section .notebook-bg-sheet');
    const filterEl = document.getElementById('paper-tear');
    if (!sheet || !filterEl) return;

    const filterMarkup = new XMLSerializer().serializeToString(filterEl);
    let lastSignature = '';

    function paint() {
        const width = sheet.offsetWidth;
        const height = sheet.offsetHeight;
        if (!width || !height) return;
        const background = getComputedStyle(sheet).getPropertyValue('--notebook-bg').trim() || DEFAULT_PAPER_COLOR;
        const margins = marginRect(sheet, '::before', height) + marginRect(sheet, '::after', height);
        const signature = `${width}x${height}|${background}|${margins}`;
        if (signature === lastSignature) return;
        lastSignature = signature;
        const svg = paperSvg(width, height, background, margins, filterMarkup);
        sheet.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
        sheet.classList.add('papier-precalcule');
    }

    // Repainted when the sheet changes size (rotation, a language switch
    // that lengthens the text, fonts loading).
    new ResizeObserver(paint).observe(sheet);
    paint();
}

// Each line starts, ends and fades a little differently, as if drawn by
// hand.
function createLine(index) {
    const line = document.createElement('div');
    line.className = 'nb-line';

    const leftOffset = 4 + Math.random() * 20;
    const rightOffset = 6 + Math.random() * 35;
    const opacity = 0.18 + Math.random() * 0.12;

    line.style.left = `${leftOffset}px`;
    line.style.right = `${rightOffset}px`;
    line.style.top = `${FIRST_LINE_TOP_PX + index * LINE_SPACING_PX}px`;
    line.style.opacity = opacity;
    return line;
}

// Callers that redraw after a change of layout empty the container first,
// so that the old lines do not count in the height measured here.
function renderLines(container) {
    const sheet = container.parentElement;
    const height = Math.max(sheet.scrollHeight, sheet.offsetHeight, MIN_SHEET_HEIGHT_PX);
    container.innerHTML = '';

    const lineCount = Math.ceil(height / LINE_SPACING_PX) + EXTRA_LINES;
    for (let index = 0; index < lineCount; index++) {
        container.appendChild(createLine(index));
    }
}

/** Draws the ruled lines of the notebook and keeps them in step with the sheet. */
export function initNotebookLines() {
    const container = document.getElementById('notebook-lines');
    if (!container) return;
    const sheet = container.parentElement;

    // The first notification draws the lines. Later ones redraw them only
    // when the width has changed (window resize, device rotation): the text
    // then reflows and the sheet needs a different number of lines. Height
    // alone is ignored, since the lines themselves and late-loading content
    // would otherwise trigger needless redraws.
    let drawnWidth = null;
    let drawnHeight = null;
    let redrawTimer = null;

    const draw = () => {
        renderLines(container);
        drawnHeight = sheet.offsetHeight;
    };
    const redraw = () => {
        container.innerHTML = '';
        draw();
    };

    new ResizeObserver(entries => {
        const width = Math.round(entries[0].contentRect.width);
        if (drawnWidth === null) {
            drawnWidth = width;
            draw();
            return;
        }
        if (width === drawnWidth) return;
        clearTimeout(redrawTimer);
        redrawTimer = setTimeout(() => {
            drawnWidth = width;
            redraw();
        }, REDRAW_DEBOUNCE_MS);
    }).observe(sheet);

    // Fonts that arrive after the first draw change the height of the sheet
    // without changing its width, which the observer above ignores.
    document.fonts.addEventListener('loadingdone', () => {
        if (drawnHeight !== null && sheet.offsetHeight !== drawnHeight) redraw();
    });

    // Drawn once regardless, in case the observer is slow to report.
    setTimeout(draw, FALLBACK_DRAW_DELAY_MS);
}
