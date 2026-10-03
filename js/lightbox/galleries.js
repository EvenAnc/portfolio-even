/**
 * Galleries: the ordered lists of drawings and plans that the viewer can
 * browse.
 */

// In the order of the drawings page: the viewer maps the position of a
// clicked drawing onto this list.
export const DRAWINGS = [
    { url: 'dessin/opt/cartographie@2x.webp', altKey: 'alt_drawing_map' },
    { url: 'dessin/opt/a-la-maniere-de@2x.webp', altKey: 'alt_drawing_style' },
    { url: 'dessin/opt/noir-et-blanc@2x.webp', altKey: 'alt_drawing_ink' },
    { url: 'dessin/opt/bd-page-1@2x.webp', altKey: 'alt_comic_1' },
    { url: 'dessin/opt/bd-page-2@2x.webp', altKey: 'alt_comic_2' },
    { url: 'dessin/opt/bd-page-3@2x.webp', altKey: 'alt_comic_3' },
    { url: 'dessin/opt/bd-page-4@2x.webp', altKey: 'alt_comic_4' },
];

export const DIPLOMA_PLANS = [
    { url: 'PDF/plan-rmoins1.pdf', altKey: 'alt_plan_lower_level' },
    { url: 'PDF/plan-rdc.pdf', altKey: 'alt_plan_ground_floor' },
    { url: 'PDF/plan-r1.pdf', altKey: 'alt_plan_upper_level' },
    { url: 'PDF/plan-station.pdf', altKey: 'alt_zoom_station' },
    { url: 'PDF/plan-resto.pdf', altKey: 'alt_zoom_restaurant' },
    { url: 'PDF/plan-garage.pdf', altKey: 'alt_zoom_garage' },
    { url: 'PDF/plan-expo.pdf', altKey: 'alt_zoom_exhibition' },
];

// In the order of the data-section-index attributes of the page.
export const DIPLOMA_SECTIONS = [
    { url: 'PDF/coupe-nord-loingtaine.pdf', altKey: 'alt_section_north_distant' },
    { url: 'PDF/coupe-nord-texture.pdf', altKey: 'alt_section_north' },
    { url: 'PDF/coupe-ouest-texture.pdf', altKey: 'alt_section_west' },
    { url: 'PDF/coupe-sud-texture.pdf', altKey: 'alt_section_south' },
];

export const DIPLOMA_ANALYSES = [
    { url: 'PDF/plan-masse.pdf', altKey: 'alt_site_plan' },
    { url: 'PDF/trame.pdf', altKey: 'alt_structural_grid' },
    { url: 'PDF/zooning-batiment.pdf', altKey: 'alt_zoning_building' },
    { url: 'PDF/zooning-circulation.pdf', altKey: 'alt_zoning_circulation' },
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
