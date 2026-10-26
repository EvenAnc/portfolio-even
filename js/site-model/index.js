/**
 * Site model: Even's site model, a log of solid wood he carved with a wood chisel, in 3D on the
 * diploma project page (Even, 25/10/2026).
 *
 * Seen from 40 degrees above, it turns slowly on its own, and turns under the mouse or the
 * finger, as fast as the hand goes. The compass above follows the turn. The arrow on the right
 * brings the view of the real site down onto it: an IGN aerial photo laid on the very relief of
 * the model, which turns with it and, once landed, takes the place of the wooden top while the
 * wooden sides stay. A sun on its arc lights it: the visitor drags it high or low to see the
 * shadows of the terrain.
 *
 * Nothing is loaded before the panel comes near the screen; nothing is drawn while it is out
 * of sight. Without WebGL, or if loading fails, the photo of the model stays in place.
 */

import { on, EVENTS, state } from '../core/state.js';
import { prefersReducedMotion } from '../core/env.js';
import { loadModel } from './loader.js';
import { buildScene } from './scene.js';
import { createTurn, createDescent } from './motion.js';
import { createCompass, createPin, headingOf } from './overlay.js';
import { createSun } from './sun.js';
import { createPolaroid } from './polaroid.js';
import { openGallery } from '../lightbox/lightbox.js';

const THREE_URL = new URL('../../vendor/three-0.186.1/three.module.js', import.meta.url).href;
const LOAD_MARGIN = '700px 0px';
// Closer than this, the wooden top gives way to the site view. No extra darkening of the wood on
// the way down: the real shadow of the site view is enough, and the darkened wood showed as a
// dark band in the gap (Even, 26/10/2026: the landing looked buggy).
const TOUCH_GAP = 0.002;
const SHEET_FADE_FROM = 0.15; // the site view fades in between these two shares of the descent:
const SHEET_FADE_TO = 0.7; // nearly transparent, it read as a dark veil (review, 27/10/2026)
const ARIA_EVERY_MS = 400;

/** Turns the model with the mouse, the finger and the arrow keys. */
function wireTurn(stage, turn, root) {
    stage.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        stage.setPointerCapture(event.pointerId);
        turn.grab(event.clientX, event.timeStamp);
        root.classList.add('is-dragging', 'has-turned');
    });
    stage.addEventListener('pointermove', event => {
        if (turn.dragging) turn.drag(event.clientX, event.timeStamp, stage.clientWidth);
    });
    const end = event => {
        if (!turn.dragging) return;
        turn.release(event.timeStamp);
        root.classList.remove('is-dragging');
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('keydown', event => {
        const sign = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
        if (!sign) return;
        event.preventDefault();
        turn.nudge(sign);
        root.classList.add('has-turned');
    });
}

/** Moves the site view with the arrow on the right: drag it, click it, or use the keys. */
function wireDescent(handle, rail, descent) {
    let grab = null;
    handle.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        handle.setPointerCapture(event.pointerId);
        grab = { y: event.clientY, value: descent.value, moved: false };
        event.stopPropagation();
    });
    handle.addEventListener('pointermove', event => {
        if (!grab) return;
        const dy = event.clientY - grab.y;
        if (Math.abs(dy) > 4) grab.moved = true;
        if (grab.moved) descent.set(grab.value + dy / Math.max(1, railTravel(rail, handle)));
    });
    const end = event => {
        if (!grab) return;
        const now = performance.now();
        const { value } = descent;
        if (!grab.moved) descent.animateTo(value < 0.5 ? 1 : 0, now);
        else if (value > 0.78 && value < 1) descent.animateTo(1, now);
        else if (value < 0.12) descent.animateTo(0, now);
        grab = null;
        event.stopPropagation();
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', event => {
        const target = { ArrowDown: 1, End: 1, Enter: descent.value < 0.5 ? 1 : 0, ' ': descent.value < 0.5 ? 1 : 0, ArrowUp: 0, Home: 0 }[event.key];
        if (target === undefined) return;
        event.preventDefault();
        descent.animateTo(target, performance.now());
    });
}

/** Applies the turn and the descent to the scene, then draws it. */
function drawFrame(THREE, view, model, parts, now, dt) {
    const { turn, descent } = parts;
    turn.step(dt);
    const lift = descent.step(now) * view.liftMax;
    const width = model.desc.boundsMax[0] - model.desc.boundsMin[0];
    view.pivot.rotation.y = turn.angle * Math.PI / 180;
    view.sheet.visible = descent.value > SHEET_FADE_FROM;
    view.sheet.position.y = lift;
    const touching = view.sheet.visible && lift < TOUCH_GAP * width;
    view.wood.top.visible = !touching;
    const fade = Math.min(1, Math.max(0, (descent.value - SHEET_FADE_FROM) / (SHEET_FADE_TO - SHEET_FADE_FROM)));
    fadeSheet(view.sheet, fade * fade * (3 - 2 * fade), touching);
    view.renderer.render(view.scene, view.camera);
    return { touching, settled: !descent.moving && (descent.value === 0 || descent.value === 1) };
}

/**
 * The site view fades in as it comes down: it no longer appears cut by the top edge of the view.
 * It casts its shadow only once landed: on the way, its shadow floated by the arrow and darkened
 * the wood in a band (second blind review, 27/10/2026).
 */
function fadeSheet(sheet, opacity, landed) {
    sheet.children.forEach(part => {
        const { material } = part;
        const transparent = opacity < 1;
        if (material.transparent !== transparent) {
            material.transparent = transparent;
            material.needsUpdate = true;
        }
        material.opacity = opacity;
        part.castShadow = landed;
    });
}

/**
 * How far the arrow slides: down to just above the small polaroid at the bottom of the rail, which
 * it used to cover once the site view had landed (review, 27/10/2026).
 */
function railTravel(rail, handle) {
    const photo = rail.querySelector('.site-model-rail-photo');
    const reserve = photo ? photo.offsetHeight + 6 : 0;
    return rail.clientHeight - handle.offsetHeight - reserve;
}

/** Compass, pin, arrow position and the values read by screen readers. */
function drawOverlay(view, model, parts, frame, now) {
    const { compass, pin, stage, handle, rail, descent, turn } = parts;
    const heading = headingOf(turn.angle, model.desc.north);
    compass.update(heading);
    parts.pinPoint.set(...model.desc.pin);
    view.pivot.localToWorld(parts.pinPoint).project(view.camera);
    const showPin = frame.settled && (descent.value === 0 || frame.touching);
    pin.update((parts.pinPoint.x + 1) / 2 * stage.clientWidth, (1 - parts.pinPoint.y) / 2 * stage.clientHeight, showPin);
    rail.classList.toggle('is-down', descent.value > 0.02);
    rail.classList.toggle('is-landed', frame.touching);
    const travel = railTravel(rail, handle);
    handle.style.transform = `translate3d(0, ${(descent.value * travel).toFixed(1)}px, 0)`;
    if (now - parts.ariaTime > ARIA_EVERY_MS) {
        parts.ariaTime = now;
        stage.setAttribute('aria-valuenow', String(Math.round(heading)));
        handle.setAttribute('aria-valuenow', String(Math.round(descent.value * 100)));
    }
}

/** The eye: hides the name and the drawn marker, and shows the real pin of the model in 3D. */
function wireEye(root, view) {
    const eye = root.querySelector('.site-model-eye');
    if (!eye) return;
    eye.addEventListener('click', () => {
        const showReal = eye.getAttribute('aria-pressed') !== 'true';
        eye.setAttribute('aria-pressed', String(showReal));
        root.classList.toggle('is-real-pin', showReal);
        view.realPin.visible = showReal;
    });
}

/** The pause button between the heads of the 360 degree arrow: stops or starts the slow turn. */
function wireAutoTurn(root, turn) {
    const button = root.querySelector('.site-model-autoturn');
    if (!button) return;
    button.setAttribute('aria-pressed', String(turn.turning));
    button.addEventListener('click', () => {
        turn.setTurning(!turn.turning);
        button.setAttribute('aria-pressed', String(turn.turning));
    });
}

/** Runs the drawing loop while the model is on screen and the tab is visible. */
function runLoop(THREE, view, model, parts, root) {
    let frameId = 0;
    let last = 0;
    let onScreen = false;
    const tick = now => {
        frameId = requestAnimationFrame(tick);
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        const frame = drawFrame(THREE, view, model, parts, now, dt);
        drawOverlay(view, model, parts, frame, now);
        if (!root.classList.contains('is-ready')) root.classList.add('is-ready');
    };
    const update = () => {
        const run = onScreen && !document.hidden;
        if (run && !frameId) {
            last = 0;
            frameId = requestAnimationFrame(tick);
        } else if (!run && frameId) {
            cancelAnimationFrame(frameId);
            frameId = 0;
        }
    };
    new IntersectionObserver(entries => {
        onScreen = entries[entries.length - 1].isIntersecting;
        update();
    }).observe(parts.stage);
    document.addEventListener('visibilitychange', update);
}

async function start(root, link) {
    root.classList.add('is-loading');
    const THREE = await import(THREE_URL);
    const stage = root.querySelector('.site-model-stage');
    const canvas = root.querySelector('.site-model-canvas');
    const anisotropy = 8;
    const model = await loadModel(THREE, root.dataset.siteModel, anisotropy);
    const view = buildScene(THREE, canvas, model);
    const sun = createSun(stage, root.querySelector('.site-model-sun'), root.querySelector('.site-model-sun-arc path'), view.setSun);
    const resize = () => {
        view.resize(stage.clientWidth, stage.clientHeight);
        sun.resize();
    };
    resize();
    new ResizeObserver(resize).observe(stage);
    const reduced = prefersReducedMotion();
    const parts = {
        stage,
        handle: root.querySelector('.site-model-drop'),
        rail: root.querySelector('.site-model-rail'),
        turn: createTurn(reduced),
        descent: createDescent(reduced),
        compass: createCompass(root.querySelector('.site-model-compass'), state.lang),
        pin: createPin(root.querySelector('.site-model-pin')),
        pinPoint: new THREE.Vector3(),
        ariaTime: 0,
    };
    on(EVENTS.LANGUAGE_CHANGE, ({ lang }) => parts.compass.setLanguage(lang));
    wireTurn(stage, parts.turn, root);
    link.turn = parts.turn;
    wireDescent(parts.handle, parts.rail, parts.descent);
    wireEye(root, view);
    wireAutoTurn(root, parts.turn);
    canvas.addEventListener('webglcontextlost', () => root.classList.add('is-unavailable'));
    root.classList.remove('is-loading');
    runLoop(THREE, view, model, parts, root);
}

/**
 * On a phone the polaroid moves from above the text to just above the 3D: touching it turns the
 * model, which then stays in view (Even, 27/10/2026: full phone friendly). It goes back to its
 * place if the screen widens.
 */
function placePolaroid(wrap, root) {
    const home = document.createComment('polaroid');
    wrap.before(home);
    const phone = window.matchMedia('(max-width: 768px)');
    const place = () => {
        if (phone.matches) root.before(wrap);
        else home.after(wrap);
    };
    place();
    phone.addEventListener('change', place);
}

/** Starts each site model on the page when it comes near the screen. */
export function initSiteModel() {
    document.querySelectorAll('[data-site-model]').forEach(root => {
        // The polaroid of the real model turns the 3D once it is loaded.
        const link = { turn: null };
        const polaroid = root.closest('.panel')?.querySelector('.site-model-polaroid');
        if (polaroid) {
            placePolaroid(polaroid.parentElement, root);
            createPolaroid(polaroid, (angle, direction) => link.turn?.turnTo(angle, direction), (photos, index) => {
                openGallery(photos.map(photo => ({ url: photo.dataset.full, altKey: 'alt_model_photo' })), index);
            });
        }
        const observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            observer.disconnect();
            start(root, link).catch(error => {
                root.classList.remove('is-loading');
                root.classList.add('is-unavailable');
                console.warn('Site model unavailable:', error);
            });
        }, { rootMargin: LOAD_MARGIN });
        observer.observe(root);
    });
}
