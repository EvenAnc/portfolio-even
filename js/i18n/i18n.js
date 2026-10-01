/**
 * Language: resolves, applies and switches the interface language, and
 * keeps the page title and description in step.
 */

import { state } from '../core/state.js';
import { readStored, writeStored } from '../core/env.js';
import { TRANSLATIONS, PAGE_META } from './dictionary.js';

/**
 * Looks a key up in the dictionary of the current language.
 * @param {string} key
 * @returns {string|undefined}
 */
export function t(key) {
    return TRANSLATIONS[state.lang][key];
}

/**
 * Priority: the address (a shared link imposes its language), then the
 * visitor's previous choice, then the browser language.
 * @returns {'fr'|'en'}
 */
export function resolveInitialLanguage() {
    const requestedLang = new URLSearchParams(location.search).get('lang');
    const storedLang = readStored('lang');
    return (requestedLang === 'fr' || requestedLang === 'en') ? requestedLang
        : (storedLang === 'fr' || storedLang === 'en') ? storedLang
        : (navigator.language || '').startsWith('fr') ? 'fr' : 'en';
}

export function updatePageMeta(pageId) {
    const metaByPage = PAGE_META[state.lang] || PAGE_META.fr;
    const entry = metaByPage[pageId] || metaByPage['home'];
    document.title = entry[0];
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.content = entry[1];
}

export function applyLanguage(lang) {
    state.lang = lang;
    writeStored('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    updatePageMeta(state.page);

    // The language lives in the address, which makes a link open in the
    // language it was shared in and gives the hreflang tags a meaning.
    // French is the bare address.
    const url = new URL(location.href);
    if (lang === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    if (url.href !== location.href) history.replaceState(history.state, '', url.href);

    // The canonical address names the language version on display, in line
    // with the hreflang alternates declared in the head.
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        const base = canonical.href.split('?')[0];
        canonical.href = lang === 'en' ? base + '?lang=en' : base;
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang][key] !== undefined) el.textContent = TRANSLATIONS[lang][key];
    });

    // Text that lives in attributes (accessible names, image descriptions)
    // is translated the same way, through a sibling data attribute.
    [['data-i18n-aria', 'aria-label'], ['data-i18n-alt', 'alt']].forEach(([source, target]) => {
        document.querySelectorAll('[' + source + ']').forEach(el => {
            const text = TRANSLATIONS[lang][el.getAttribute(source)];
            if (text !== undefined) el.setAttribute(target, text);
        });
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

export function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.lang !== state.lang) applyLanguage(btn.dataset.lang);
        });
    });
}
