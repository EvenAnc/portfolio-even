/**
 * Site model, overlay: the compass above the model and the Lambesc pin.
 *
 * The compass works like the one at the top of the screen in a game, kept sober: a strip of
 * small vertical ticks, one letter in view at a time, which slides as the model turns. It
 * shows where the visitor is looking: when the south slides away to the left, the west comes
 * in from the right. The pin is the one of the Toulouse map on the drawings page, planted
 * where Even's red pin stands on the wooden model, with the name and postcode of the town.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const PX_PER_DEG = 2.4;
const STRIP_DEGREES = 1080; // three turns, so the window never runs out
const LETTERS = { fr: ['N', 'E', 'S', 'O'], en: ['N', 'E', 'S', 'W'] };

function svgElement(name, attributes) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
}

/** Draws the strip: a tick every 10 degrees, a longer one every 45, the letters every 90. */
function drawStrip(svg, lang) {
    svg.replaceChildren();
    const letters = LETTERS[lang] || LETTERS.fr;
    const width = STRIP_DEGREES * PX_PER_DEG;
    svg.setAttribute('viewBox', `0 0 ${width} 40`);
    svg.setAttribute('width', width);
    for (let degree = 0; degree <= STRIP_DEGREES; degree += 10) {
        const x = degree * PX_PER_DEG;
        const bearing = degree % 360;
        if (bearing % 90 === 0) {
            const text = svgElement('text', { x, y: 27, 'text-anchor': 'middle', class: 'site-model-compass-letter' });
            text.textContent = letters[bearing / 90];
            svg.appendChild(text);
        } else {
            const tall = bearing % 45 === 0;
            svg.appendChild(svgElement('line', { x1: x, x2: x, y1: tall ? 13 : 16, y2: tall ? 28 : 25, class: 'site-model-compass-tick' }));
        }
    }
}

/** The compass. `update(heading)`: heading in degrees, 0 when looking north, 90 east. */
export function createCompass(container, lang) {
    const svg = svgElement('svg', { class: 'site-model-compass-strip', 'aria-hidden': 'true' });
    container.appendChild(svg);
    drawStrip(svg, lang);
    let lastOffset = null;
    return {
        setLanguage(next) {
            drawStrip(svg, next);
            lastOffset = null;
        },
        update(heading) {
            const offset = container.clientWidth / 2 - (heading + 360) * PX_PER_DEG;
            if (lastOffset !== null && Math.abs(offset - lastOffset) < 0.05) return;
            svg.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
            lastOffset = offset;
        },
    };
}

/** Heading the visitor looks towards, from the turn of the model and its north. */
export function headingOf(angleDeg, north) {
    const a = angleDeg * Math.PI / 180;
    const fx = Math.sin(a);
    const fz = -Math.cos(a);
    const [nx, nz] = north;
    const along = fx * nx + fz * nz;
    const across = fx * -nz + fz * nx;
    const degrees = Math.atan2(across, along) * 180 / Math.PI;
    return (degrees + 360) % 360;
}

/** Places the pin over its point of the model, or hides it. */
export function createPin(element) {
    let shown = false;
    return {
        update(x, y, visible) {
            if (visible !== shown) {
                element.classList.toggle('is-shown', visible);
                shown = visible;
            }
            if (visible) element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        },
    };
}
