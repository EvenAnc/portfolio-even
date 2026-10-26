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
const MAX_DEG_PER_S = 360; // a quick fling makes it turn, not spin like a top (review, 27/10/2026)
const DEG_PER_WIDTH = 300;
const HOLD_MS = 80;
const KEY_STEP_DEG = 30;

// Starts gently, ends softly, with no bounce (turns to a photo, descent of the site view).
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Signed turn from one angle to another, the short way or in the given direction (1 or -1). */
function turnDelta(from, to, direction) {
    const delta = ((to - from) % 360 + 540) % 360 - 180;
    return direction && delta * direction < 0 ? delta + direction * 360 : delta;
}

/** One step of a turn to an angle; returns the turn, or null once it has arrived. */
function stepTween(tween, turn, dt) {
    const next = { ...tween, t: Math.min(1, tween.t + dt / tween.duration) };
    turn.angle = next.from + next.delta * easeInOut(next.t);
    turn.velocity = 0;
    return next.t >= 1 ? null : next;
}

/** The turn. `reducedMotion`: no turn of its own, the drag still works. */
export function createTurn(reducedMotion) {
    const turn = { angle: 0, velocity: reducedMotion ? 0 : AUTO_DEG_PER_S, direction: 1 };
    let dragging = false;
    let tween = null; // a turn to a given angle (a photo of the polaroid)
    let hold = false; // after such a turn the model stays on that side, until it is grabbed
    let paused = reducedMotion; // the slow turn of its own, stopped by the pause button
    const drag = { sample: 0, x: 0, time: 0 }; // last pointer sample and the fling speed
    const free = () => { tween = null; hold = false; };
    const autoSpeed = () => (paused || hold ? 0 : AUTO_DEG_PER_S * turn.direction);
    return {
        get angle() { return turn.angle; },
        get turning() { return !paused; },
        /** The pause button: stops or starts again the slow turn of its own. */
        setTurning(on) {
            paused = !on;
            if (on) hold = false;
            else if (Math.abs(turn.velocity) <= AUTO_DEG_PER_S * 1.5) turn.velocity = 0; // stops at once
        },
        get dragging() { return dragging; },
        step(dt) {
            if (tween) {
                tween = stepTween(tween, turn, dt);
                return;
            }
            if (!dragging) {
                const target = autoSpeed();
                turn.velocity = target + (turn.velocity - target) * Math.exp(-dt / FRICTION_S);
                turn.angle += turn.velocity * dt;
            }
        },
        grab(x, time) {
            free();
            dragging = true;
            Object.assign(drag, { sample: 0, x, time });
        },
        drag(x, time, width) {
            const delta = (x - drag.x) / Math.max(1, width) * DEG_PER_WIDTH;
            const dt = Math.max(1, time - drag.time) / 1000;
            turn.angle += delta;
            Object.assign(drag, { sample: 0.65 * (delta / dt) + 0.35 * drag.sample, x, time });
        },
        release(time) {
            dragging = false;
            const held = time - drag.time > HOLD_MS;
            turn.velocity = held ? 0 : Math.max(-MAX_DEG_PER_S, Math.min(MAX_DEG_PER_S, drag.sample));
            if (Math.abs(turn.velocity) > AUTO_DEG_PER_S) turn.direction = Math.sign(turn.velocity);
        },
        /** Keyboard: a push of about KEY_STEP_DEG in the given direction. */
        nudge(sign) {
            free();
            turn.direction = sign;
            turn.velocity += sign * KEY_STEP_DEG / FRICTION_S;
        },
        /**
         * Turns the model to an angle (degrees), in the given direction (1 or -1), then holds it
         * there: the photo of the polaroid and the 3D show the same side.
         */
        turnTo(target, direction) {
            const delta = turnDelta(turn.angle, target, direction);
            tween = { from: turn.angle, delta, t: 0, duration: reducedMotion ? 0.001 : 0.7 + Math.abs(delta) / 180 * 0.5 };
            hold = true;
            if (direction) turn.direction = direction;
        },
    };
}

const DESCENT_MS = 1100;
const LIFT_CURVE = 1.6;

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
