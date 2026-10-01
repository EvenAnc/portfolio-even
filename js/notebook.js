/**
 * Notebook section: hand-ruled lines, and a cached rendering of the
 * torn-paper sheet for Safari.
 */

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
    if (!(window.CSS && CSS.supports('-webkit-hyphens', 'none'))) return;
    const sheet = document.querySelector('#notebook-section .notebook-bg-sheet');
    const filterEl  = document.getElementById('paper-tear');
    if (!sheet || !filterEl || typeof ResizeObserver === 'undefined' || typeof XMLSerializer === 'undefined') return;

    const filterMarkup = new XMLSerializer().serializeToString(filterEl);
    let lastSignature = '';

    // The two rules of the red margin (::before and ::after) are read back
    // from the stylesheet: they move on small screens.
    function marginRect(pseudo, h) {
        const s = getComputedStyle(sheet, pseudo);
        if (s.content === 'none') return '';
        return '<rect x="' + parseFloat(s.left) + '" y="0" width="' + parseFloat(s.width) +
               '" height="' + h + '" fill="' + s.backgroundColor + '"/>';
    }

    function paint() {
        const w = sheet.offsetWidth, h = sheet.offsetHeight;
        if (!w || !h) return;
        const background  = getComputedStyle(sheet).getPropertyValue('--notebook-bg').trim() || '#f2f0eb';
        const margins = marginRect('::before', h) + marginRect('::after', h);
        const signature = w + 'x' + h + '|' + background + '|' + margins;
        if (signature === lastSignature) return;  // nothing changed
        lastSignature = signature;
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h +
                    '" viewBox="0 0 ' + w + ' ' + h + '"><defs>' + filterMarkup + '</defs>' +
                    '<g filter="url(#paper-tear)"><rect width="' + w + '" height="' + h +
                    '" fill="' + background + '"/>' + margins + '</g></svg>';
        sheet.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
        sheet.classList.add('papier-precalcule');
    }

    // Repainted when the sheet changes size (rotation, a language switch
    // that lengthens the text, fonts loading).
    new ResizeObserver(paint).observe(sheet);
    paint();
}

/** Draws the ruled lines of the notebook and keeps them in step with the sheet. */
export function initNotebookLines() {
    const container = document.getElementById('notebook-lines');
    if (!container) return;

    // The first notification draws the lines. Later ones redraw them only
    // when the width has changed (window resize, device rotation): the text
    // then reflows and the sheet needs a different number of lines. Height
    // alone is ignored, since the lines themselves and late-loading content
    // would otherwise trigger needless redraws.
    let drawnWidth = null;
    let drawnHeight = null;
    const draw = () => {
        renderLines(container);
        drawnHeight = container.parentElement.offsetHeight;
    };
    let redrawTimer = null;
    const observer = new ResizeObserver(entries => {
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
            // Emptied first so that the old lines do not count in the
            // height the new ones are measured against.
            container.innerHTML = '';
            draw();
        }, 200);
    });
    observer.observe(container.parentElement);

    // Fonts that arrive after the first draw change the height of the sheet
    // without changing its width, which the observer above ignores.
    if (document.fonts && document.fonts.addEventListener) {
        document.fonts.addEventListener('loadingdone', () => {
            if (drawnHeight === null || container.parentElement.offsetHeight === drawnHeight) return;
            container.innerHTML = '';
            draw();
        });
    }

    // Drawn once regardless, in case the observer is slow to report.
    setTimeout(() => draw(), 200);
}

function renderLines(container) {
    const parent = container.parentElement;
    if (!parent) return;
    const h = Math.max(parent.scrollHeight, parent.offsetHeight, 800);
    container.innerHTML = '';

    const spacing = 34;
    const numLines = Math.ceil(h / spacing) + 2;

    for (let i = 0; i < numLines; i++) {
        const line = document.createElement('div');
        line.className = 'nb-line';

        // Each line starts, ends and fades a little differently, as if drawn
        // by hand.
        const leftOffset  = 4 + Math.random() * 20;
        const rightOffset = 6 + Math.random() * 35;
        const opacity     = 0.18 + Math.random() * 0.12;

        line.style.left    = leftOffset + 'px';
        line.style.right   = rightOffset + 'px';
        line.style.top     = (10 + i * spacing) + 'px';
        line.style.opacity = opacity;

        container.appendChild(line);
    }
}
