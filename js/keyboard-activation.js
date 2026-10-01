/**
 * Keyboard activation: makes click-only elements focusable and operable
 * from the keyboard.
 */

import { t } from './i18n/i18n.js';
import { SECTION_TRIGGER_SELECTOR } from './lightbox/triggers.js';

const ACTIVATABLE_SELECTOR = [
    '.polaroid-card',
    '#page-drawings .drawing-item .frame-wrap',
    '.bd-slide .drawing-sheet-wrap',
    SECTION_TRIGGER_SELECTOR,
    '.single-lightbox-trigger',
].join(', ');

// The element keeps its markup and its look: it becomes focusable, is
// announced as a button and is activated by Enter or Space.
function makeKeyboardActivatable(element, label) {
    if (element.closest('a[href], button')) return;
    element.setAttribute('role', 'button');
    // Sheets of a carousel that are not on display stay out of the tab order.
    element.setAttribute('tabindex', element.closest('.bd-slide:not(.active)') ? '-1' : '0');
    if (label) element.setAttribute('aria-label', label);
    element.addEventListener('keydown', event => {
        if (event.target !== element || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        element.click();
    });
}

/** Gives a button role, a tab stop and key handling to every click-only element. */
export function initKeyboardActivation() {
    document.querySelectorAll(ACTIVATABLE_SELECTOR).forEach(element => makeKeyboardActivatable(element));
    document.querySelectorAll('.bd-dot').forEach(dot => {
        makeKeyboardActivatable(dot, `${t('carousel_page')} ${Number(dot.dataset.goto) + 1}`);
    });
}
