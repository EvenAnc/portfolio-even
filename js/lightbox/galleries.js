/**
 * Galleries: the ordered lists of drawings and plans that the viewer can browse.
 */

// ─────────────────────────────────────
// CONFIGURATION ET RENDU PDF.JS DESSINS
// ─────────────────────────────────────
export const allDrawings = [
    {
        url: "dessin/opt/cartographie@2x.webp",
        altKey: "alt_draw_carto",
        title: "CARTOGRAPHIE",
        desc: "Dessin technique & Relief — A4",
        orient: "portrait"
    },
    {
        url: "dessin/opt/a-la-maniere-de@2x.webp",
        altKey: "alt_draw_style",
        title: "À LA MANIÈRE DE...",
        desc: "Étude de style & Graphite — A4",
        orient: "landscape"
    },
    {
        url: "dessin/opt/noir-et-blanc@2x.webp",
        altKey: "alt_draw_nb",
        title: "NOIR ET BLANC",
        desc: "Encre de Chine & Graphisme — A4",
        orient: "portrait"
    },
    {
        url: "dessin/opt/bd-page-1@2x.webp",
        altKey: "alt_bd_1",
        title: "BANDE DESSINÉE — Page 1",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/opt/bd-page-2@2x.webp",
        altKey: "alt_bd_2",
        title: "BANDE DESSINÉE — Page 2",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/opt/bd-page-3@2x.webp",
        altKey: "alt_bd_3",
        title: "BANDE DESSINÉE — Page 3",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/opt/bd-page-4@2x.webp",
        altKey: "alt_bd_4",
        title: "BANDE DESSINÉE — Page 4",
        desc: "A4 — Portrait",
        orient: "portrait"
    }
];

export const diplomePlans = [
    { url: 'PDF/plan-rmoins1.pdf', title: 'Plan R-1', altKey: 'alt_plan_rm1' },
    { url: 'PDF/plan-rdc.pdf', title: 'Plan RDC', altKey: 'alt_plan_rdc' },
    { url: 'PDF/plan-r1.pdf', title: 'Plan R+1', altKey: 'alt_plan_r1' },
    { url: 'PDF/plan-station.pdf', title: 'Zoom Station', altKey: 'alt_zoom_station' },
    { url: 'PDF/plan-resto.pdf', title: 'Zoom Resto', altKey: 'alt_zoom_resto' },
    { url: 'PDF/plan-garage.pdf', title: 'Zoom Garage', altKey: 'alt_zoom_garage' },
    { url: 'PDF/plan-expo.pdf', title: 'Zoom Expo', altKey: 'alt_zoom_expo' }
];

export const diplomeCoupes = [
    { url: 'PDF/coupe-nord-loingtaine.pdf', title: 'Coupe Lointaine', altKey: 'alt_coupe_lointaine' },
    { url: 'PDF/coupe-nord-texture.pdf', title: 'Coupe Nord', altKey: 'alt_coupe_nord' },
    { url: 'PDF/coupe-ouest-texture.pdf', title: 'Coupe Ouest', altKey: 'alt_coupe_ouest' },
    { url: 'PDF/coupe-sud-texture.pdf', title: 'Coupe Sud', altKey: 'alt_coupe_sud' }
];

export const diplomeAnalyses = [
    { url: 'PDF/plan-masse.pdf', title: 'Plan Masse', altKey: 'alt_plan_masse' },
    { url: 'PDF/trame.pdf', title: 'Trame', altKey: 'alt_trame' },
    { url: 'PDF/zooning-batiment.pdf', title: 'Zoning Bâtiment', altKey: 'alt_zoning_building' },
    { url: 'PDF/zooning-circulation.pdf', title: 'Zoning Circulations', altKey: 'alt_zoning_circulation' }
];

/**
 * Finds the plan gallery that holds a given sheet.
 * @param {string} url
 * @returns {{gallery: Array, index: number}|null}
 */
export function findGalleryByUrl(url) {
    for (const gallery of [diplomePlans, diplomeCoupes, diplomeAnalyses]) {
        const index = gallery.findIndex(item => item.url === url);
        if (index !== -1) return { gallery, index };
    }
    return null;
}
