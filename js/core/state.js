/**
 * Shared state and a minimal event bus, so that modules can react to each
 * other without importing each other.
 */

export const state = {
    lang: 'fr',
    page: 'home',
    // Smooth-scroll instance of the page on display, or null.
    scroll: null,
};

/** Every event of the bus, with the detail its handlers receive. */
export const EVENTS = {
    /** A navigation starts. Detail: `{ from: string, to: string }`, page ids. */
    PAGE_CHANGE: 'page-change',
    /** The requested page has just become the active one. Detail: `{ page: string }`. */
    PAGE_SHOWN: 'page-shown',
    /** Back, Forward or a fragment typed by hand. Detail: `{ from: string, to: string|null }`. */
    HISTORY_NAVIGATION: 'history-navigation',
};

const handlers = new Map();

/**
 * Subscribes to an event.
 * @param {string} eventName one of EVENTS
 * @param {(detail: object) => void} handler
 */
export function on(eventName, handler) {
    if (!handlers.has(eventName)) handlers.set(eventName, []);
    handlers.get(eventName).push(handler);
}

/**
 * Removes a subscription made with `on`.
 * @param {string} eventName one of EVENTS
 * @param {(detail: object) => void} handler
 */
export function off(eventName, handler) {
    const list = handlers.get(eventName) || [];
    const index = list.indexOf(handler);
    if (index !== -1) list.splice(index, 1);
}

/**
 * Calls every handler of an event, in subscription order.
 * @param {string} eventName one of EVENTS
 * @param {object} [detail]
 */
export function emit(eventName, detail) {
    [...(handlers.get(eventName) || [])].forEach(handler => {
        // A failing subscriber must not interrupt the emitter half-way.
        try {
            handler(detail);
        } catch (error) {
            console.error(`[portfolio] handler of "${eventName}" failed:`, error);
        }
    });
}
