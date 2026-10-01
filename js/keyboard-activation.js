/**
 * Keyboard activation: makes click-only elements focusable and operable from the keyboard.
 */

// Click-only elements (cards, sheets, dots) become reachable and operable
// from the keyboard without touching their markup or their look: focusable,
// announced as buttons, activated by Enter or Space.
function makeKeyboardActivable(el, label) {
    if (el.closest('a[href], button')) return;
    el.setAttribute('role', 'button');
    // Sheets of a carousel that are not on display stay out of the tab order.
    el.setAttribute('tabindex', el.closest('.bd-slide:not(.active)') ? '-1' : '0');
    if (label) el.setAttribute('aria-label', label);
    el.addEventListener('keydown', e => {
        if (e.target !== el || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        el.click();
    });
}

export function initKeyboardActivation() {
    const activable = [
        '.polaroid-card',
        '#page-drawings .drawing-item .frame-wrap',
        '.bd-slide .drawing-sheet-wrap',
        '[data-coupe-gallery] .stack-item[data-coupe-index]',
        '.single-lightbox-trigger',
    ].join(', ');
    document.querySelectorAll(activable).forEach(el => makeKeyboardActivable(el));
    // "Page" reads the same in both languages, so this name needs no
    // dictionary entry.
    document.querySelectorAll('.bd-dot').forEach(dot => {
        makeKeyboardActivable(dot, 'Page ' + (Number(dot.dataset.goto) + 1));
    });
}
