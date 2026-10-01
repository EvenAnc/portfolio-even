/**
 * Shared state and a minimal event bus, so that modules can react to each
 * other without importing each other.
 */

export const state = {
    lang: 'fr',
    page: 'home',
};

const handlers = new Map();

/**
 * @param {string} eventName
 * @param {(detail: object) => void} handler
 */
export function on(eventName, handler) {
    if (!handlers.has(eventName)) handlers.set(eventName, []);
    handlers.get(eventName).push(handler);
}

/**
 * @param {string} eventName
 * @param {object} [detail]
 */
export function emit(eventName, detail) {
    (handlers.get(eventName) || []).forEach(handler => handler(detail));
}
