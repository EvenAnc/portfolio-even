/**
 * Site model, sun: the sun on its arc over the model, moved by the visitor (Even, 25/10/2026:
 * hold the click on it and move the light, high or low, to see the shadows of the terrain).
 *
 * The arc goes from the left horizon to the right one, overhead in the middle. The sun stays
 * where it is put while the model turns under it, like the sun over the real site.
 */

// Not down to the horizon (the wood went dark and the shadow ran off the view), and the dotted arc
// stops exactly where the sun does: it showed further than the sun could go (Even, 26/10/2026).
const MIN_DEG = window.matchMedia('(max-width: 768px)').matches ? 22 : 10; // a phone: clear of the rail
const MAX_DEG = 170;
// Rather low at first (about 35 degrees above the table), like the lamp of the photos: the chisel marks
// stand out from the start (Even, 26/10/2026). On a phone the arc is tighter and the sun would sit
// on the edge of the block: a little higher there.
export const SUN_START_DEG = window.matchMedia('(max-width: 768px)').matches ? 152 : 142;
const KEY_STEP_DEG = 8;

const clamp = degrees => Math.max(MIN_DEG, Math.min(MAX_DEG, degrees));

function arcOf(stage) {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    // On a phone the arc is shifted a little to the left: it stops short of the column of controls
    // on the right, and the sun starts beside the block rather than on its corner.
    // The top of the arc stays under the compass (review, 27/10/2026: the sun at its highest ran
    // into it).
    const phone = width < 600;
    return { width, height, cx: width * (phone ? 0.44 : 0.5), cy: height * 0.7, r: Math.min(width * (phone ? 0.43 : 0.44), height * 0.58) };
}

/**
 * Wires the sun handle. `apply(degrees)` moves the light: 0 at the right horizon, 90 overhead.
 * @returns {{ resize: () => void }}
 */
export function createSun(stage, handle, path, apply) {
    let angle = SUN_START_DEG;
    let arc = arcOf(stage);
    let grabbed = false;
    const place = () => {
        const a = angle * Math.PI / 180;
        handle.style.transform = `translate3d(${(arc.cx + arc.r * Math.cos(a)).toFixed(1)}px, ${(arc.cy - arc.r * Math.sin(a)).toFixed(1)}px, 0)`;
        handle.setAttribute('aria-valuenow', String(Math.round(angle)));
    };
    const set = degrees => {
        angle = clamp(degrees);
        apply(angle);
        place();
    };
    const follow = event => {
        const box = stage.getBoundingClientRect();
        const x = event.clientX - box.left - arc.cx;
        const y = arc.cy - (event.clientY - box.top);
        // Under the horizon line, the sun stays at the end of its arc on that side.
        set(y < 0 ? (x < 0 ? MAX_DEG : MIN_DEG) : Math.atan2(y, x) * 180 / Math.PI);
    };
    handle.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        event.stopPropagation();
        handle.setPointerCapture(event.pointerId);
        grabbed = true;
        stage.classList.add('is-moving-sun');
    });
    handle.addEventListener('pointermove', event => {
        if (grabbed) follow(event);
    });
    const release = () => {
        grabbed = false;
        stage.classList.remove('is-moving-sun');
    };
    handle.addEventListener('pointerup', release);
    handle.addEventListener('pointercancel', release);
    handle.addEventListener('keydown', event => {
        const towardsTop = angle < 90 ? KEY_STEP_DEG : -KEY_STEP_DEG;
        const step = { ArrowLeft: KEY_STEP_DEG, ArrowRight: -KEY_STEP_DEG, ArrowUp: towardsTop, ArrowDown: -towardsTop }[event.key];
        if (step === undefined) return;
        event.preventDefault();
        event.stopPropagation();
        set(angle + step);
    });
    const resize = () => {
        arc = arcOf(stage);
        path.ownerSVGElement.setAttribute('viewBox', `0 0 ${arc.width} ${arc.height}`);
        const end = degrees => {
            const a = degrees * Math.PI / 180;
            return `${(arc.cx + arc.r * Math.cos(a)).toFixed(1)} ${(arc.cy - arc.r * Math.sin(a)).toFixed(1)}`;
        };
        path.setAttribute('d', `M ${end(MAX_DEG)} A ${arc.r} ${arc.r} 0 0 1 ${end(MIN_DEG)}`);
        place();
    };
    set(angle);
    resize();
    return { resize };
}
