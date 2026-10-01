/**
 * Language: resolves, applies and switches the interface language, and keeps the page title and description in step.
 */

import { state } from '../core/state.js';
import { readStored, writeStored } from '../core/env.js';
import { i18n, META_PAGES } from './dictionary.js';

// Looks a key up in the dictionary of the current language.
export function t(key) {
    return i18n[state.lang][key];
}

// Priorite : l'adresse (un lien partage impose sa langue), puis le
// choix precedent du visiteur, puis la langue de son navigateur.
export function resolveInitialLanguage() {
    const langueDemandee = new URLSearchParams(location.search).get('lang');
    const saved = readStored('lang');
    return (langueDemandee === 'fr' || langueDemandee === 'en') ? langueDemandee
        : (saved === 'fr' || saved === 'en') ? saved
        : (navigator.language || '').startsWith('fr') ? 'fr' : 'en';
}

export function majMetaPage(pageId) {
    const table = META_PAGES[state.lang] || META_PAGES.fr;
    const paire = table[pageId] || table['home'];
    document.title = paire[0];
    const balise = document.querySelector('meta[name="description"]');
    if (balise) balise.content = paire[1];
}

export function applyLang(lang) {
    state.lang = lang;
    writeStored('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    majMetaPage(state.page);

    // La langue vit dans l'adresse : c'est ce qui permet d'envoyer un lien
    // qui s'ouvrira en anglais, et ce qui donne un sens aux balises
    // hreflang. Le francais reste l'adresse nue.
    const adresse = new URL(location.href);
    if (lang === 'en') adresse.searchParams.set('lang', 'en');
    else adresse.searchParams.delete('lang');
    if (adresse.href !== location.href) history.replaceState(history.state, '', adresse.href);

    // The canonical address names the language version on display, in line
    // with the hreflang alternates declared in the head.
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        const base = canonical.href.split('?')[0];
        canonical.href = lang === 'en' ? base + '?lang=en' : base;
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key] !== undefined) el.textContent = i18n[lang][key];
    });

    // Text that lives in attributes (accessible names, image descriptions)
    // is translated the same way, through a sibling data attribute.
    [['data-i18n-aria', 'aria-label'], ['data-i18n-alt', 'alt']].forEach(([source, target]) => {
        document.querySelectorAll('[' + source + ']').forEach(el => {
            const text = i18n[lang][el.getAttribute(source)];
            if (text !== undefined) el.setAttribute(target, text);
        });
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

export function initLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.lang !== state.lang) applyLang(btn.dataset.lang);
        });
    });
}
