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
    // Sketches, after the comic: the order of the drawings page.
    { url: 'dessin/opt/croquis-01@2x.webp', altKey: 'alt_croquis_01' },
    { url: 'dessin/opt/croquis-02@2x.webp', altKey: 'alt_croquis_02' },
    { url: 'dessin/opt/croquis-03@2x.webp', altKey: 'alt_croquis_03' },
    { url: 'dessin/opt/croquis-04@2x.webp', altKey: 'alt_croquis_04' },
    { url: 'dessin/opt/croquis-05@2x.webp', altKey: 'alt_croquis_05' },
    { url: 'dessin/opt/croquis-06@2x.webp', altKey: 'alt_croquis_06' },
    { url: 'dessin/opt/croquis-07@2x.webp', altKey: 'alt_croquis_07' },
    { url: 'dessin/opt/croquis-08@2x.webp', altKey: 'alt_croquis_08' },
    { url: 'dessin/opt/croquis-09@2x.webp', altKey: 'alt_croquis_09' },
    { url: 'dessin/opt/croquis-10@2x.webp', altKey: 'alt_croquis_10' },
    { url: 'dessin/opt/croquis-11@2x.webp', altKey: 'alt_croquis_11' },
    { url: 'dessin/opt/croquis-12@2x.webp', altKey: 'alt_croquis_12' },
    { url: 'dessin/opt/croquis-13@2x.webp', altKey: 'alt_croquis_13' },
    { url: 'dessin/opt/croquis-14@2x.webp', altKey: 'alt_croquis_14' },
    { url: 'dessin/opt/croquis-15@2x.webp', altKey: 'alt_croquis_15' },
    { url: 'dessin/opt/croquis-16@2x.webp', altKey: 'alt_croquis_16' },
    { url: 'dessin/opt/croquis-17@2x.webp', altKey: 'alt_croquis_17' },
    { url: 'dessin/opt/croquis-18@2x.webp', altKey: 'alt_croquis_18' },
    { url: 'dessin/opt/croquis-19@2x.webp', altKey: 'alt_croquis_19' },
    { url: 'dessin/opt/croquis-20@2x.webp', altKey: 'alt_croquis_20' },
    { url: 'dessin/opt/croquis-21@2x.webp', altKey: 'alt_croquis_21' },
    { url: 'dessin/opt/croquis-22@2x.webp', altKey: 'alt_croquis_22' },
    { url: 'dessin/opt/croquis-23@2x.webp', altKey: 'alt_croquis_23' },
    { url: 'dessin/opt/croquis-24@2x.webp', altKey: 'alt_croquis_24' },
    { url: 'dessin/opt/croquis-25@2x.webp', altKey: 'alt_croquis_25' },
    { url: 'dessin/opt/croquis-26@2x.webp', altKey: 'alt_croquis_26' },
    { url: 'dessin/opt/croquis-27@2x.webp', altKey: 'alt_croquis_27' },
    { url: 'dessin/opt/croquis-28@2x.webp', altKey: 'alt_croquis_28' },
    { url: 'dessin/opt/croquis-29@2x.webp', altKey: 'alt_croquis_29' },
    { url: 'dessin/opt/croquis-30@2x.webp', altKey: 'alt_croquis_30' },
    { url: 'dessin/opt/croquis-31@2x.webp', altKey: 'alt_croquis_31' },
    { url: 'dessin/opt/croquis-32@2x.webp', altKey: 'alt_croquis_32' },
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
