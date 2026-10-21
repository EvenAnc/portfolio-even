/**
 * Language: resolves, applies and switches the interface language, and
 * keeps the page title and description in step.
 */

import { state, emit, EVENTS } from '../core/state.js';
import { readStored, writeStored, prefersReducedMotion } from '../core/env.js';
import { TRANSLATIONS, PAGE_META } from './dictionary.js';

const LANGUAGES = ['fr', 'en'];
const DEFAULT_LANGUAGE = 'fr';

// Text that lives in attributes (accessible names, image descriptions,
// tooltips) is translated like text content, through a sibling data attribute.
const TRANSLATED_ATTRIBUTES = [
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-title', 'title'],
];

function dictionaryFor(lang) {
    return TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE];
}

/**
 * Looks a key up in the dictionary of the current language.
 * @param {string} key
 * @returns {string|undefined}
 */
export function t(key) {
    return dictionaryFor(state.lang)[key];
}

/**
 * Priority: the address (a shared link imposes its language), then the
 * visitor's previous choice, then the browser language.
 * @returns {'fr'|'en'}
 */
export function resolveInitialLanguage() {
    const requestedLang = new URLSearchParams(location.search).get('lang');
    if (LANGUAGES.includes(requestedLang)) return requestedLang;
    const storedLang = readStored('lang');
    if (LANGUAGES.includes(storedLang)) return storedLang;
    return (navigator.language || '').startsWith('fr') ? 'fr' : 'en';
}

/**
 * Sets the tab title and the meta description of a page.
 * @param {string} pageId
 */
export function updatePageMeta(pageId) {
    const metaByPage = PAGE_META[state.lang] || PAGE_META[DEFAULT_LANGUAGE];
    const [title, description] = metaByPage[pageId] || metaByPage.home;
    document.title = title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.content = description;
}

// The language lives in the address, which makes a link open in the
// language it was shared in and gives the hreflang tags a meaning. French
// is the bare address.
function syncLanguageInUrl(lang) {
    const url = new URL(location.href);
    if (lang === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    if (url.href !== location.href) history.replaceState(history.state, '', url.href);

    // The canonical address names the language version on display, in line
    // with the hreflang alternates declared in the head.
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        const base = canonical.href.split('?')[0];
        canonical.href = lang === 'en' ? `${base}?lang=en` : base;
    }
}

function translateDocument(lang) {
    const dictionary = dictionaryFor(lang);

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const text = dictionary[element.getAttribute('data-i18n')];
        if (text !== undefined) element.textContent = text;
    });

    TRANSLATED_ATTRIBUTES.forEach(([source, target]) => {
        document.querySelectorAll(`[${source}]`).forEach(element => {
            const text = dictionary[element.getAttribute(source)];
            if (text !== undefined) element.setAttribute(target, text);
        });
    });
}

/**
 * Switches the whole interface to a language and remembers the choice.
 * @param {'fr'|'en'} lang
 */
export function applyLanguage(lang) {
    state.lang = lang;
    writeStored('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    updatePageMeta(state.page);
    syncLanguageInUrl(lang);
    translateDocument(lang);

    document.querySelectorAll('.lang-btn').forEach(button => {
        button.classList.toggle('is-active', button.dataset.lang === lang);
    });
    emit(EVENTS.LANGUAGE_CHANGE, { lang });
}

// The old page tears away and uncovers the page in the other language
// (base.css, "Language switch"). The texts change inside a view transition;
// the strip of torn paper and the shadow it casts are two layers, invisible
// in the old state and shown in the new one, so each becomes a transition of
// its own, slid along with the edge. They are added before the transition:
// Safari leaves out a layer that only appears in the new state. The class scopes the animation to this switch, so the
// viewer keeps its own. Without view transitions, or under reduced motion,
// the texts simply change.
function addTearLayers() {
    return ['shadow', 'rim'].map(kind => {
        const layer = document.createElement('div');
        layer.className = `lang-tear lang-tear--${kind} is-waiting`;
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
        return layer;
    });
}

function switchLanguage(lang) {
    if (!document.startViewTransition || prefersReducedMotion()) {
        applyLanguage(lang);
        return;
    }
    const root = document.documentElement;
    const layers = addTearLayers();
    root.classList.add('is-switching-language');
    const transition = document.startViewTransition(() => {
        applyLanguage(lang);
        layers.forEach(layer => layer.classList.remove('is-waiting'));
    });
    transition.finished.catch(() => {}).finally(() => {
        layers.forEach(layer => layer.remove());
        root.classList.remove('is-switching-language');
    });
}

// The three drawings of the tear, fetched while the page is idle: a mask
// image still loading would hide its layer during the first switch.
const TEAR_MASKS = ['assets/ui/tear-old.svg', 'assets/ui/tear-rim.svg', 'assets/ui/tear-shadow.svg'];
const MASK_PRELOAD_DELAY_MS = 3000;

function preloadTearMasks() {
    TEAR_MASKS.forEach(url => {
        const image = new Image();
        image.src = url;
    });
}

/** Wires the language buttons. */
export function initLanguageSwitcher() {
    if (document.startViewTransition) setTimeout(preloadTearMasks, MASK_PRELOAD_DELAY_MS);
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.lang !== state.lang) switchLanguage(button.dataset.lang);
        });
    });
}
