/**
 * Notebook section: hand-ruled lines, and a cached rendering of the torn-paper sheet for Safari.
 */

// ─────────────────────────────────────
// SAFARI : LE PAPIER DECHIRE CALCULE UNE SEULE FOIS
// ─────────────────────────────────────
// La sheet du cahier porte filter:url(#paper-tear), un bruit
// feTurbulence a 3 octaves sur toute la section. Chrome le garde en
// memoire. Safari le recalcule sur le processeur a chaque image des
// qu'une animation bouge ailleurs sur la page (logo qui tremble...).
// Mesure dans WebKit : 2,5 images par seconde au repos sur l'accueil,
// c'etait le lag du Mac.
//
// Sur Safari seulement, on dessine la meme sheet UNE fois dans une
// image SVG : meme filterEl, memes coordonnees, meme graine, donc memes
// dechirures et meme margins rouge ondulee. Safari la garde en cache
// comme n'importe quelle image : 40 images par seconde au repos.
//
// -webkit-hyphens n'est reconnu que par WebKit (Safari Mac, iPhone,
// iPad). Chrome ne passe jamais ici : son rendu ne change pas d'un pixel.
export function initSafariPaperCache() {
    if (!(window.CSS && CSS.supports('-webkit-hyphens', 'none'))) return;
    const sheet = document.querySelector('#notebook-section .notebook-bg-sheet');
    const filterEl  = document.getElementById('paper-tear');
    if (!sheet || !filterEl || typeof ResizeObserver === 'undefined' || typeof XMLSerializer === 'undefined') return;

    const filterMarkup = new XMLSerializer().serializeToString(filterEl);
    let lastSignature = '';

    // Les deux traits de la margins rouge (::before et ::after) sont relus
    // dans la sheet de style : ils changent de place sur mobile.
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
        if (signature === lastSignature) return;   // meme taille, rien a redessiner
        lastSignature = signature;
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h +
                    '" viewBox="0 0 ' + w + ' ' + h + '"><defs>' + filterMarkup + '</defs>' +
                    '<g filter="url(#paper-tear)"><rect width="' + w + '" height="' + h +
                    '" fill="' + background + '"/>' + margins + '</g></svg>';
        sheet.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
        sheet.classList.add('papier-precalcule');
    }

    // Redessine si la sheet change de taille (rotation, changement de
    // langue qui rallonge le texte, chargement des polices).
    new ResizeObserver(paint).observe(sheet);
    paint();
}

// ─────────────────────────────────────
// LIGNES DE CAHIER ALÉATOIRES
// ─────────────────────────────────────
export function initNotebookLines() {
    const container = document.getElementById('notebook-lines');
    if (!container) return;

    // Attendre que la section soit visible pour mesurer
    // The first notification draws the lines, as it always did. Later ones
    // redraw them only when the width has changed (window resize, device
    // rotation): the text then reflows and the sheet needs a different
    // number of lines. Height alone is ignored, since the lines themselves
    // and late-loading content would otherwise trigger needless redraws.
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

    // Génération immédiate aussi
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

        // Longueurs aléatoires : début et fin varient
        const leftOffset  = 4 + Math.random() * 20;   // 4-24px
        const rightOffset = 6 + Math.random() * 35;   // 6-41px
        const opacity     = 0.18 + Math.random() * 0.12; // 0.18-0.30

        line.style.left    = leftOffset + 'px';
        line.style.right   = rightOffset + 'px';
        line.style.top     = (10 + i * spacing) + 'px';
        line.style.opacity = opacity;

        container.appendChild(line);
    }
}
