/**
 * Site model, motion: the turn of the model and the descent of the site view onto it.
 *
 * The turn never stops: a slow turn of its own, a drag of the mouse or finger that turns it as
 * fast as the hand goes, and a fling that keeps it spinning, then slows back to the slow turn,
 * in the direction of the fling (Even, 25/10/2026: smooth, fast if the mouse is fast).
 * The descent is a value from 0 (site view out of sight above) to 1 (landed on the model),
 * driven by the arrow on the right; the last stretch slows down to a soft stop on the model.
 */

const AUTO_DEG_PER_S = 6;
const FRICTION_S = 1.1;
const MAX_DEG_PER_S = 900;
const DEG_PER_WIDTH = 300;
const HOLD_MS = 80;
const KEY_STEP_DEG = 30;

/** The turn. `reducedMotion`: no turn of its own, the drag still works. */
export function createTurn(reducedMotion) {
    const turn = { angle: 0, velocity: reducedMotion ? 0 : AUTO_DEG_PER_S, direction: 1 };
    let dragging = false;
    let sample = 0;
    let lastX = 0;
    let lastTime = 0;
    const autoSpeed = () => (reducedMotion ? 0 : AUTO_DEG_PER_S * turn.direction);
    return {
        get angle() { return turn.angle; },
        get dragging() { return dragging; },
        step(dt) {
            if (!dragging) {
                const target = autoSpeed();
                turn.velocity = target + (turn.velocity - target) * Math.exp(-dt / FRICTION_S);
                turn.angle += turn.velocity * dt;
            }
        },
        grab(x, time) {
            dragging = true;
            sample = 0;
            lastX = x;
            lastTime = time;
        },
        drag(x, time, width) {
            const delta = (x - lastX) / Math.max(1, width) * DEG_PER_WIDTH;
            const dt = Math.max(1, time - lastTime) / 1000;
            turn.angle += delta;
            sample = 0.65 * (delta / dt) + 0.35 * sample;
            lastX = x;
            lastTime = time;
        },
        release(time) {
            dragging = false;
            const held = time - lastTime > HOLD_MS;
            turn.velocity = held ? 0 : Math.max(-MAX_DEG_PER_S, Math.min(MAX_DEG_PER_S, sample));
            if (Math.abs(turn.velocity) > AUTO_DEG_PER_S) turn.direction = Math.sign(turn.velocity);
        },
        /** Keyboard: a push of about KEY_STEP_DEG in the given direction. */
        nudge(sign) {
            turn.direction = sign;
            turn.velocity += sign * KEY_STEP_DEG / FRICTION_S;
        },
    };
}

const DESCENT_MS = 1100;
const LIFT_CURVE = 1.6;

// Starts gently, lands softly: the last part of the way slows down to a stop, with no bounce. The
// bounce used to sink the site view under the wooden sides, which then stuck out around it.
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The descent of the site view. */
export function createDescent(reducedMotion) {
    let value = 0;
    let tween = null;
    return {
        get value() { return value; },
        get moving() { return tween !== null; },
        /** Direct control while the arrow is dragged. */
        set(next) {
            tween = null;
            value = Math.max(0, Math.min(1, next));
        },
        animateTo(target, now) {
            if (reducedMotion) {
                value = target;
                return;
            }
            tween = { from: value, to: target, start: now, duration: DESCENT_MS * Math.max(0.35, Math.abs(target - value)) };
        },
        /** Lift of the sheet above its place, as a share of the lift range (0 once landed). */
        step(now) {
            if (tween) {
                const t = Math.min(1, (now - tween.start) / tween.duration);
                value = tween.from + (tween.to - tween.from) * easeInOut(t);
                if (t >= 1) tween = null;
            }
            return Math.pow(1 - value, LIFT_CURVE);
        },
    };
}
