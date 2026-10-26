/**
 * Site model, the site view: a finer grid than the wooden top, built here from the model's own
 * relief, on which the trees and buildings of the real site stand with their height (IGN LiDAR
 * HD, height above the ground), raised a little to read on screen (Even, 25/10/2026: real
 * height, a little more if needed). The grid is computed in the browser from a small grey image:
 * nothing heavy to download, and the trees get their own light and shadows.
 *
 * Coordinates are those of the model (not the 0..1 box). Rows run from -Z to +Z, columns from
 * -X to +X, like the wooden top; uv1 is the one of the site photo.
 */

const SHEET_THICKNESS = 0.006; // of the model width: a thin card, the edge in the colour of the wooden sides
const SHEET_INSET = 0.003;

function bilinear(values, width, height, x, y) {
    const x0 = Math.min(width - 2, Math.max(0, Math.floor(x)));
    const y0 = Math.min(height - 2, Math.max(0, Math.floor(y)));
    const fx = Math.min(1, Math.max(0, x - x0));
    const fy = Math.min(1, Math.max(0, y - y0));
    const i = y0 * width + x0;
    return values[i] * (1 - fx) * (1 - fy) + values[i + 1] * fx * (1 - fy) +
        values[i + width] * (1 - fx) * fy + values[i + width + 1] * fx * fy;
}

/** Heights of the wooden top, in model units, read from the model's own grid. */
function topHeights(desc, geometry) {
    const [rows, cols] = desc.grid;
    const position = geometry.getAttribute('position');
    const y0 = desc.boundsMin[1];
    const sy = desc.boundsMax[1] - desc.boundsMin[1];
    const heights = new Float32Array(rows * cols);
    for (let i = 0; i < heights.length; i++) heights[i] = y0 + position.getY(i) * sy;
    return { heights, rows, cols };
}

/** The surface: relief of the model plus the vegetation, normals computed from both. */
function surfaceGeometry(THREE, model, cols) {
    const { desc, geometry, vegetation } = model;
    const top = topHeights(desc, geometry);
    const [x0, , z0] = desc.boundsMin;
    const [x1, , z1] = desc.boundsMax;
    const rows = Math.max(2, Math.round(cols * (z1 - z0) / (x1 - x0)));
    const veg = desc.vegetation || {};
    const perLevel = (veg.metresPerLevel || 0) * (veg.unitsPerMetre || 0) * (veg.exaggeration || 1);
    const positions = new Float32Array(rows * cols * 3);
    const uvs = new Float32Array(rows * cols * 2);
    for (let r = 0; r < rows; r++) {
        const t = r / (rows - 1);
        for (let c = 0; c < cols; c++) {
            const u = c / (cols - 1);
            const i = r * cols + c;
            let y = bilinear(top.heights, top.cols, top.rows, u * (top.cols - 1), t * (top.rows - 1));
            if (vegetation) y += perLevel * bilinear(vegetation.levels, vegetation.width, vegetation.height, u * (vegetation.width - 1), t * (vegetation.height - 1));
            positions.set([x0 + u * (x1 - x0), y, z0 + t * (z1 - z0)], i * 3);
            uvs.set([u, 1 - t], i * 2);
        }
    }
    const index = new Uint32Array((rows - 1) * (cols - 1) * 6);
    let k = 0;
    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
            const a = r * cols + c;
            const b = a + 1;
            const d = a + cols;
            index.set([a, d, b, b, d, d + 1], k);
            k += 6;
        }
    }
    const surface = new THREE.BufferGeometry();
    surface.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    surface.setAttribute('uv1', new THREE.BufferAttribute(uvs, 2));
    surface.setIndex(new THREE.BufferAttribute(index, 1));
    surface.computeVertexNormals();
    surface.computeBoundingSphere();
    return { surface, positions, rows, cols };
}

/** Boundary of a grid, in order around it: row 0, last column, last row, column 0. */
function gridBoundary(rows, cols) {
    const loop = [];
    for (let c = 0; c < cols; c++) loop.push(c);
    for (let r = 1; r < rows; r++) loop.push(r * cols + cols - 1);
    for (let c = cols - 2; c >= 0; c--) loop.push((rows - 1) * cols + c);
    for (let r = rows - 2; r > 0; r--) loop.push(r * cols);
    loop.push(0);
    return loop;
}

/**
 * The edge of the card: a band from the edge of the surface down by SHEET_THICKNESS, slanting a
 * little inwards so that, once landed, it sits inside the wooden sides and is hidden by them.
 */
function skirtGeometry(THREE, positions, rows, cols, width) {
    const drop = SHEET_THICKNESS * width;
    const inset = SHEET_INSET * width;
    const loop = gridBoundary(rows, cols);
    const vertices = [];
    const normals = [];
    const point = i => [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
    for (let k = 0; k < loop.length - 1; k++) {
        const a = point(loop[k]);
        const b = point(loop[k + 1]);
        const nx = b[2] - a[2];
        const nz = a[0] - b[0];
        const length = Math.hypot(nx, nz) || 1;
        const ox = -nx / length * inset;
        const oz = -nz / length * inset;
        const aLow = [a[0] + ox, a[1] - drop, a[2] + oz];
        const bLow = [b[0] + ox, b[1] - drop, b[2] + oz];
        [a, b, aLow, b, bLow, aLow].forEach(v => { // faces turned outwards
            vertices.push(v[0], v[1], v[2]);
            normals.push(nx / length, 0, nz / length);
        });
    }
    const skirt = new THREE.BufferGeometry();
    skirt.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    skirt.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return skirt;
}

/** The site view, hidden until the arrow brings it down. */
export function buildSheet(THREE, model, cols, skirtColour) {
    const width = model.desc.boundsMax[0] - model.desc.boundsMin[0];
    const { surface, positions, rows } = surfaceGeometry(THREE, model, cols);
    const material = new THREE.MeshStandardMaterial({
        map: model.textures.site, roughness: 0.97, metalness: 0, side: THREE.DoubleSide,
        emissive: 0xffffff, emissiveMap: model.textures.site, emissiveIntensity: 0.32,
    });
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(surface, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    const skirt = new THREE.Mesh(skirtGeometry(THREE, positions, rows, cols, width), new THREE.MeshStandardMaterial({ color: skirtColour, roughness: 0.9 }));
    skirt.castShadow = true;
    group.add(skirt);
    group.visible = false;
    return group;
}
