/**
 * Galleries: the ordered lists of drawings and plans that the viewer can
 * browse.
 */

// In the order of the drawings page: the viewer maps the position of a
// clicked drawing onto this list.
export const DRAWINGS = [
    {
        url: 'dessin/opt/cartographie@2x.webp',
        altKey: 'alt_drawing_map',
        title: 'CARTOGRAPHIE',
    },
    {
        url: 'dessin/opt/a-la-maniere-de@2x.webp',
        altKey: 'alt_drawing_style',
        title: 'À LA MANIÈRE DE...',
    },
    {
        url: 'dessin/opt/noir-et-blanc@2x.webp',
        altKey: 'alt_drawing_ink',
        title: 'NOIR ET BLANC',
    },
    {
        url: 'dessin/opt/bd-page-1@2x.webp',
        altKey: 'alt_comic_1',
        title: 'BANDE DESSINÉE — Page 1',
    },
    {
        url: 'dessin/opt/bd-page-2@2x.webp',
        altKey: 'alt_comic_2',
        title: 'BANDE DESSINÉE — Page 2',
    },
    {
        url: 'dessin/opt/bd-page-3@2x.webp',
        altKey: 'alt_comic_3',
        title: 'BANDE DESSINÉE — Page 3',
    },
    {
        url: 'dessin/opt/bd-page-4@2x.webp',
        altKey: 'alt_comic_4',
        title: 'BANDE DESSINÉE — Page 4',
    },
];

export const DIPLOMA_PLANS = [
    { url: 'PDF/plan-rmoins1.pdf', title: 'Plan R-1', altKey: 'alt_plan_lower_level' },
    { url: 'PDF/plan-rdc.pdf', title: 'Plan RDC', altKey: 'alt_plan_ground_floor' },
    { url: 'PDF/plan-r1.pdf', title: 'Plan R+1', altKey: 'alt_plan_upper_level' },
    { url: 'PDF/plan-station.pdf', title: 'Zoom Station', altKey: 'alt_zoom_station' },
    { url: 'PDF/plan-resto.pdf', title: 'Zoom Resto', altKey: 'alt_zoom_restaurant' },
    { url: 'PDF/plan-garage.pdf', title: 'Zoom Garage', altKey: 'alt_zoom_garage' },
    { url: 'PDF/plan-expo.pdf', title: 'Zoom Expo', altKey: 'alt_zoom_exhibition' },
];

// In the order of the data-section-index attributes of the page.
export const DIPLOMA_SECTIONS = [
    { url: 'PDF/coupe-nord-loingtaine.pdf', title: 'Coupe Lointaine', altKey: 'alt_section_north_distant' },
    { url: 'PDF/coupe-nord-texture.pdf', title: 'Coupe Nord', altKey: 'alt_section_north' },
    { url: 'PDF/coupe-ouest-texture.pdf', title: 'Coupe Ouest', altKey: 'alt_section_west' },
    { url: 'PDF/coupe-sud-texture.pdf', title: 'Coupe Sud', altKey: 'alt_section_south' },
];

export const DIPLOMA_ANALYSES = [
    { url: 'PDF/plan-masse.pdf', title: 'Plan Masse', altKey: 'alt_site_plan' },
    { url: 'PDF/trame.pdf', title: 'Trame', altKey: 'alt_structural_grid' },
    { url: 'PDF/zooning-batiment.pdf', title: 'Zoning Bâtiment', altKey: 'alt_zoning_building' },
    { url: 'PDF/zooning-circulation.pdf', title: 'Zoning Circulations', altKey: 'alt_zoning_circulation' },
];

/**
 * Finds the plan gallery that holds a given sheet.
 * @param {string} url
 * @returns {{gallery: Array, index: number}|null}
 */
export function findGalleryByUrl(url) {
    for (const gallery of [DIPLOMA_PLANS, DIPLOMA_SECTIONS, DIPLOMA_ANALYSES]) {
        const index = gallery.findIndex(item => item.url === url);
        if (index !== -1) return { gallery, index };
    }
    return null;
}
