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
// the shadow, the strip of torn paper and the red pencil line are three
// layers, invisible in the old state and shown in the new one, so each
// becomes a transition of its own, slid along with the edge. They are added
// before the transition: Safari leaves out a layer that only appears in the
// new state. The class scopes the animation to this switch, so the viewer
// keeps its own. Without view transitions, or under reduced motion, the
// texts simply change.
function addTearLayers() {
    return ['shadow', 'rim', 'line'].map(kind => {
        const layer = document.createElement('div');
        layer.className = `lang-tear lang-tear--${kind} is-waiting`;
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
        return layer;
    });
}

// The ripple around the edge (index.html, #lang-ripple): its map is drawn
// like the masks, 2.08 screens wide, and slides the same 1.08 screens on the
// same curve; the filter works in pixels, so the numbers follow the screen.
// The wave is a little stronger on large screens.
const RIPPLE_MAP = 'assets/ui/tear2-ripple.png';
const RIPPLE_SIZE = 2.08;
const RIPPLE_TRAVEL = 1.08;
const RIPPLE_STRENGTH = 0.036;
let rippleMapLoaded = false;

// Firefox is left out: its test build never shows the images of a view
// transition, so the filter on them could not be checked there; the tear
// itself still plays.
const RIPPLE_CHECKED = !/\bFirefox\//.test(navigator.userAgent);

/** Sets the ripple for this screen; returns its animations, none until the map is loaded. */
function prepareRipple() {
    const filter = document.getElementById('lang-ripple');
    if (!RIPPLE_CHECKED || !rippleMapLoaded || !filter) return [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    const map = filter.querySelector('feImage');
    const [slideX, slideY] = map.querySelectorAll('animate');
    const wave = filter.querySelector('feDisplacementMap animate');
    const strength = Math.round(Math.min(width, height) * RIPPLE_STRENGTH);
    map.setAttribute('width', width * RIPPLE_SIZE);
    map.setAttribute('height', height * RIPPLE_SIZE);
    slideX.setAttribute('values', `0;${-width * RIPPLE_TRAVEL}`);
    slideY.setAttribute('values', `${-height * RIPPLE_TRAVEL};0`);
    wave.setAttribute('values', `0;${strength};${strength};0`);
    return [slideX, slideY, wave];
}

function switchLanguage(lang) {
    if (!document.startViewTransition || prefersReducedMotion()) {
        applyLanguage(lang);
        return;
    }
    const root = document.documentElement;
    const layers = addTearLayers();
    const ripple = prepareRipple();
    root.classList.add('is-switching-language');
    root.classList.toggle('has-ripple', ripple.length > 0);
    const transition = document.startViewTransition(() => {
        applyLanguage(lang);
        layers.forEach(layer => layer.classList.remove('is-waiting'));
    });
    transition.ready.then(() => ripple.forEach(animation => animation.beginElement())).catch(() => {});
    transition.finished.catch(() => {}).finally(() => {
        layers.forEach(layer => layer.remove());
        root.classList.remove('is-switching-language', 'has-ripple');
    });
}

// The drawings of the tear and the ripple map, fetched while the page is
// idle: a mask image still loading would hide its layer during the first
// switch, and the ripple waits for its map.
const TEAR_MASKS = ['assets/ui/tear2-old.svg', 'assets/ui/tear2-rim.svg', 'assets/ui/tear2-line.svg', 'assets/ui/tear2-shadow.svg'];
const MASK_PRELOAD_DELAY_MS = 3000;

function preloadTearMasks() {
    TEAR_MASKS.forEach(url => {
        const image = new Image();
        image.src = url;
    });
    const map = document.querySelector('#lang-ripple feImage');
    if (!map || !RIPPLE_CHECKED) return;
    const image = new Image();
    image.onload = () => {
        map.setAttribute('href', RIPPLE_MAP);
        rippleMapLoaded = true;
    };
    image.src = RIPPLE_MAP;
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
