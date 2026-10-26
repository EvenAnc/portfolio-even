/**
 * Site model, scene: the wood model, the view of the real site that comes down onto it, the
 * camera seen from 40 degrees above, and the lights.
 *
 * The lights stay still while the model turns, so the chisel marks catch the light as they
 * pass, as they would on a turntable in a room. The sun is the visitor's (Even, 25/10/2026):
 * dragged along its arc, high it gives short shadows, low and warmer it draws long shadows that
 * bring out every slope; shadows are real (shadow map), so the site view coming down also
 * casts its shadow on the wood. The view of the real site has exactly the
 * shape of the model's top (same vertices): once it has landed, it takes the place of the
 * wooden top and the wooden sides stay.
 */

import { buildSheet } from './sheet.js';

const ELEVATION_DEG = 40;
const FIELD_DEG = 24;
const FRAME_MARGIN = 1.14; // air around the block for the sun, the arc and the arrows
const SKIRT_COLOUR = 0xb88f7c; // the edge of the site view while it comes down reads as wood, like the sides
// The site view's grid: finer than the wooden top, lighter on phones.
const SHEET_COLUMNS = window.matchMedia('(max-width: 768px)').matches ? 360 : 600;

function makeRenderer(THREE, canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    // At least 1.5 pixels per screen pixel: smoother edges on ordinary screens, never above 2.
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap is gone since three.js r18x
    return renderer;
}

const SUN_HIGH = 0xfffaf4; // near white: the wood keeps the pink of the photos (Even, 26/10/2026)
const SUN_LOW = 0xffad66;
const SUN_TOWARDS_VIEWER = 0.35; // the arc leans a little towards the visitor: the front stays lit
const SHADOW_SIZE = window.matchMedia('(max-width: 768px)').matches ? 2048 : 4096;

function addLights(THREE, scene, span) {
    const sky = new THREE.HemisphereLight(0xfffbf6, 0x2a2420, 0.8);
    scene.add(sky);
    const sun = new THREE.DirectionalLight(SUN_HIGH, 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(SHADOW_SIZE, SHADOW_SIZE);
    // Wide enough for the block's shadow on the table and for the site view while it comes down:
    // a narrower box cut the shadow with a hard straight edge.
    const reach = span * 2.4;
    Object.assign(sun.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 0.05, far: span * 8 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = span * 0.006;
    sun.shadow.radius = 3; // a soft edge, as under a real sun
    scene.add(sun, sun.target);
    const rim = new THREE.DirectionalLight(0xfffaf4, 0.28);
    rim.position.set(1.6, 1.0, -1.3);
    scene.add(rim);
    const high = new THREE.Color(SUN_HIGH);
    const low = new THREE.Color(SUN_LOW);
    return {
        /** Sun on its arc: 0 degrees at the right horizon, 90 overhead, 180 at the left horizon. */
        setSun(arcDeg) {
            const a = radians(arcDeg);
            const direction = new THREE.Vector3(Math.cos(a), Math.sin(a), SUN_TOWARDS_VIEWER).normalize();
            sun.position.copy(direction).multiplyScalar(span * 3);
            const height = Math.max(0, direction.y);
            const warm = 1 - Math.min(1, Math.max(0, (height - 0.15) / 0.55));
            sun.color.copy(high).lerp(low, warm * 0.5);
            // Low sun: more direct light, less ambient, so the shadows draw the relief.
            sun.intensity = 3.1 - 0.2 * height; // a low sun lights less of each square: stronger, so the wood stays light
            sky.intensity = 0.28 + 0.62 * height;
        },
    };
}

/** Puts a mesh made in the 0..1 box back to the size of the model. */
function placeInBounds(mesh, desc) {
    const [x0, y0, z0] = desc.boundsMin;
    const [x1, y1, z1] = desc.boundsMax;
    mesh.position.set(x0, y0, z0);
    mesh.scale.set(x1 - x0, y1 - y0, z1 - z0);
}

function buildWood(THREE, model) {
    const { desc, geometry, textures } = model;
    // The normal map carries the chisel marks measured on the photos (photometric stereo): at
    // full strength, the sun brings them out as the real lamp did. The raw wood has a soft sheen:
    // the light catches the ridges between two chisel cuts, as on the photos.
    const top = new THREE.MeshStandardMaterial({ map: textures.wood, normalMap: textures.woodNormal, roughness: 0.8, metalness: 0 });
    const side = new THREE.MeshStandardMaterial({ map: textures.woodSide || textures.wood, roughness: 0.95, metalness: 0 });
    const mesh = new THREE.Mesh(geometry, [top, side]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    placeInBounds(mesh, desc);
    return { mesh, top, topColour: top.color.clone() };
}

/**
 * The real pin of the model, in 3D (Even, 26/10/2026: the eye shows it instead of the drawn
 * marker): a red plastic push pin shaped like a spool, rounded cap, thin stem, wide rounded base,
 * and the steel needle showing a little above the wood. Its size comes from the photos: the red
 * head, found on the 21 photos, sits 0.083 above the wood at its base.
 */
function buildRealPin(THREE, desc) {
    const profile = [
        [0, 0.0315], [0.018, 0.0325], [0.027, 0.037], [0.029, 0.043], [0.026, 0.05], [0.014, 0.055],
        [0.0095, 0.06], [0.0085, 0.08], [0.0095, 0.098], [0.016, 0.102], [0.023, 0.105],
        [0.0245, 0.112], [0.022, 0.119], [0.012, 0.1225], [0, 0.123],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const plastic = new THREE.MeshPhysicalMaterial({ color: 0xe0201b, roughness: 0.3, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.25 });
    const steel = new THREE.MeshStandardMaterial({ color: 0xc9c9c9, roughness: 0.35, metalness: 0.6 });
    const head = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), plastic);
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0018, 0.06, 12), steel);
    needle.position.y = 0.0015; // half of it in the wood
    const pin = new THREE.Group();
    pin.add(head, needle);
    pin.traverse(part => { part.castShadow = true; });
    pin.position.set(desc.pin[0], desc.pin[1] - 0.003, desc.pin[2]);
    pin.visible = false;
    return pin;
}

/** Frames the model: camera 40 degrees above, at the distance where it fills the view. */
function frameCamera(camera, desc, width, height) {
    const span = desc.boundsMax.map((v, i) => v - desc.boundsMin[i]);
    // The model turns: its footprint sweeps a circle of this radius. Seen from 40 degrees above,
    // that circle and the height of the block take this much room on screen.
    const footprint = 0.5 * Math.hypot(span[0], span[2]);
    const elevation = radians(ELEVATION_DEG);
    const halfWide = footprint;
    const halfHigh = 0.5 * (2 * footprint * Math.sin(elevation) + span[1] * Math.cos(elevation));
    camera.aspect = width / Math.max(1, height);
    const vertical = radians(camera.fov);
    const tanV = Math.tan(vertical / 2);
    const tanH = tanV * camera.aspect;
    // Distance to the centre, plus the near half of the circle, which comes closer.
    const distance = Math.max(halfHigh / tanV, halfWide / tanH) * FRAME_MARGIN + footprint * Math.cos(elevation) * 0.5;
    const centreY = desc.boundsMin[1] + span[1] * 0.45;
    camera.position.set(0, centreY + distance * Math.sin(elevation), distance * Math.cos(elevation));
    camera.lookAt(0, centreY, 0);
    camera.updateProjectionMatrix();
}

function radians(degrees) {
    return degrees * Math.PI / 180;
}

/** Builds everything the viewer draws. */
export function buildScene(THREE, canvas, model) {
    const renderer = makeRenderer(THREE, canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FIELD_DEG, 1, 0.01, 100);
    const modelWidth = model.desc.boundsMax[0] - model.desc.boundsMin[0];
    const lights = addLights(THREE, scene, modelWidth);
    const pivot = new THREE.Group();
    scene.add(pivot);
    // Wide enough for the longest shadow (sun 14 degrees high), and a shadow that darkens without
    // turning into a hole in the page.
    const table = new THREE.Mesh(new THREE.PlaneGeometry(modelWidth * 14, modelWidth * 14), new THREE.ShadowMaterial({ opacity: 0.34 }));
    table.rotation.x = -Math.PI / 2;
    table.position.y = model.desc.boundsMin[1] - 0.001;
    table.receiveShadow = true;
    scene.add(table);
    const wood = buildWood(THREE, model);
    pivot.add(wood.mesh);
    const sheet = buildSheet(THREE, model, SHEET_COLUMNS, SKIRT_COLOUR);
    pivot.add(sheet);
    const realPin = buildRealPin(THREE, model.desc);
    pivot.add(realPin);
    return {
        renderer, scene, camera, pivot, wood, sheet, realPin,
        setSun: lights.setSun,
        liftMax: modelWidth * 1.6,
        resize(width, height) {
            renderer.setSize(width, height, false);
            frameCamera(camera, model.desc, width, height);
        },
    };
}
