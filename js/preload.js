/**
 * Background preload: fetches the plan previews while the visitor is still
 * on another page, so that they are ready when the project page opens.
 *
 * Priority goes to the previews visible at once on that page; hidden
 * carousel slides follow. Work only happens during idle time and never
 * right after an interaction, so it cannot make the page stutter.
 */

// Quiet time required after an interaction before the next request.
const IDLE_AFTER_INTERACTION_MS = 450;

let lastInteractionAt = 0;
let preloadStarted = false;

function markInteraction() { lastInteractionAt = Date.now(); }

function listenForInteractions() {
    ['wheel', 'touchmove', 'pointerdown', 'keydown'].forEach(ev =>
        window.addEventListener(ev, markInteraction, { passive: true }));
    document.querySelectorAll('.page').forEach(pg =>
        pg.addEventListener('scroll', markInteraction, { passive: true }));
}

function previewsByPriority() {
    const all = Array.from(document.querySelectorAll('.pdf-inline-render'));
    const isPriority = c => c.closest('.stack-item')
        || (c.closest('.bd-slide') && c.closest('.bd-slide').classList.contains('active'));
    return [...all.filter(isPriority), ...all.filter(c => !isPriority(c))];
}

export function startBackgroundPreload() {
    if (preloadStarted) return;
    preloadStarted = true;

    // Background preloading spends data the visitor did not ask for: skip
    // it when they asked to save data or when the connection is slow.
    // Decided once per visit: it is not retried if the connection improves.
    const connection = navigator.connection;
    if (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''))) return;

    listenForInteractions();

    // The srcset travels with the address so that the preload requests the
    // same candidate the page will display, not a second file.
    const queue = previewsByPriority()
        .map(el => ({ src: el.getAttribute('src'), srcset: el.getAttribute('srcset') }))
        .filter(entry => entry.src);
    let i = 0;

    const schedule = (delay) => {
        const run = () => step();
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(run, { timeout: 4000 });
        } else {
            setTimeout(run, delay || 250);
        }
    };

    const step = () => {
        if (i >= queue.length) return;
        if (document.visibilityState !== 'visible') return schedule(2000);
        if (Date.now() - lastInteractionAt < IDLE_AFTER_INTERACTION_MS) return schedule(500);

        const entry = queue[i++];
        const img = new Image();
        img.decoding = 'async';
        // Move on as soon as this one is settled, whether it loaded or not.
        img.onload = img.onerror = () => schedule(80);
        if (entry.srcset) img.srcset = entry.srcset;
        img.src = entry.src;
    };

    schedule();
}
