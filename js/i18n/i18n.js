/**
 * Language: resolves, applies and switches the interface language, and
 * keeps the page title and description in step.
 */

import { state } from '../core/state.js';
import { readStored, writeStored } from '../core/env.js';
import { TRANSLATIONS, PAGE_META } from './dictionary.js';

const LANGUAGES = ['fr', 'en'];
const DEFAULT_LANGUAGE = 'fr';

// Text that lives in attributes (accessible names, image descriptions) is
// translated like text content, through a sibling data attribute.
const TRANSLATED_ATTRIBUTES = [['data-i18n-aria', 'aria-label'], ['data-i18n-alt', 'alt']];

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
        button.classList.toggle('active', button.dataset.lang === lang);
    });
}

/** Wires the language buttons. */
export function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.lang !== state.lang) applyLanguage(button.dataset.lang);
        });
    });
}
