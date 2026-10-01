/**
 * Notebook section: hand-ruled lines, and a cached rendering of the torn-paper sheet for Safari.
 */

// ─────────────────────────────────────
// SAFARI : LE PAPIER DECHIRE CALCULE UNE SEULE FOIS
// ─────────────────────────────────────
// La feuille du cahier porte filter:url(#paper-tear), un bruit
// feTurbulence a 3 octaves sur toute la section. Chrome le garde en
// memoire. Safari le recalcule sur le processeur a chaque image des
// qu'une animation bouge ailleurs sur la page (logo qui tremble...).
// Mesure dans WebKit : 2,5 images par seconde au repos sur l'accueil,
// c'etait le lag du Mac.
//
// Sur Safari seulement, on dessine la meme feuille UNE fois dans une
// image SVG : meme filtre, memes coordonnees, meme graine, donc memes
// dechirures et meme marge rouge ondulee. Safari la garde en cache
// comme n'importe quelle image : 40 images par seconde au repos.
//
// -webkit-hyphens n'est reconnu que par WebKit (Safari Mac, iPhone,
// iPad). Chrome ne passe jamais ici : son rendu ne change pas d'un pixel.
export function initPapierSafari() {
    if (!(window.CSS && CSS.supports('-webkit-hyphens', 'none'))) return;
    const feuille = document.querySelector('#notebook-section .notebook-bg-sheet');
    const filtre  = document.getElementById('paper-tear');
    if (!feuille || !filtre || typeof ResizeObserver === 'undefined' || typeof XMLSerializer === 'undefined') return;

    const definition = new XMLSerializer().serializeToString(filtre);
    let empreinte = '';

    // Les deux traits de la marge rouge (::before et ::after) sont relus
    // dans la feuille de style : ils changent de place sur mobile.
    function trait(pseudo, h) {
        const s = getComputedStyle(feuille, pseudo);
        if (s.content === 'none') return '';
        return '<rect x="' + parseFloat(s.left) + '" y="0" width="' + parseFloat(s.width) +
               '" height="' + h + '" fill="' + s.backgroundColor + '"/>';
    }

    function peindre() {
        const w = feuille.offsetWidth, h = feuille.offsetHeight;
        if (!w || !h) return;
        const fond  = getComputedStyle(feuille).getPropertyValue('--notebook-bg').trim() || '#f2f0eb';
        const marge = trait('::before', h) + trait('::after', h);
        const cle = w + 'x' + h + '|' + fond + '|' + marge;
        if (cle === empreinte) return;   // meme taille, rien a redessiner
        empreinte = cle;
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h +
                    '" viewBox="0 0 ' + w + ' ' + h + '"><defs>' + definition + '</defs>' +
                    '<g filter="url(#paper-tear)"><rect width="' + w + '" height="' + h +
                    '" fill="' + fond + '"/>' + marge + '</g></svg>';
        feuille.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
        feuille.classList.add('papier-precalcule');
    }

    // Redessine si la feuille change de taille (rotation, changement de
    // langue qui rallonge le texte, chargement des polices).
    new ResizeObserver(peindre).observe(feuille);
    peindre();
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
        generateLines(container);
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

function generateLines(container) {
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
