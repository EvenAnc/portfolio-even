/**
 * Site model, the polaroid: the first eight photos of the real model, taken one every 45 degrees
 * around it (Even, 26/10/2026). A click, Enter or Space brings the next photo on top (the arrow
 * keys go either way), and the 3D turns to show the model from the same side: eight photos, a
 * full turn. The photos are framed on the centre of the model, at the same size, so that going
 * through them, the model turns on itself.
 *
 * Each photo carries in data-angle the angle of the 3D that shows the same side
 * (.claude/maquette-site/polaroids.py). The polaroid works before the 3D is loaded: the photos
 * change, and the model turns once it is there.
 */

const NEXT_DIRECTION = -1; // the photos were taken turning that way round the model

/**
 * @param {HTMLElement} root the polaroid button
 * @param {(angle: number, direction: number) => void} onShow called with the angle of the photo shown
 */
export function createPolaroid(root, onShow) {
    const photos = [...root.querySelectorAll('.site-model-polaroid-photo')];
    const count = root.querySelector('.site-model-polaroid-count');
    if (photos.length === 0) return;
    let index = 0;
    const show = (next, direction) => {
        index = (next + photos.length) % photos.length;
        photos.forEach((photo, i) => {
            photo.classList.toggle('is-active', i === index);
            if (i === index) photo.loading = 'eager';
        });
        if (count) count.textContent = `${index + 1} / ${photos.length}`;
        // The shuffle starts again on each click, even a quick one.
        root.classList.remove('is-shuffling');
        requestAnimationFrame(() => root.classList.add('is-shuffling'));
        onShow(Number(photos[index].dataset.angle), direction);
    };
    // The next photo is fetched ahead, so that it is there when it comes on top.
    const prefetch = () => { photos[(index + 1) % photos.length].loading = 'eager'; };
    root.addEventListener('click', () => {
        show(index + 1, NEXT_DIRECTION);
        prefetch();
    });
    root.addEventListener('pointerenter', prefetch, { once: true });
    root.addEventListener('keydown', event => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!step) return;
        event.preventDefault();
        show(index + step, step * NEXT_DIRECTION);
        prefetch();
    });
    root.addEventListener('animationend', () => root.classList.remove('is-shuffling'));
}
