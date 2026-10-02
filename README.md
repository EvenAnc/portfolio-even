# Even Anicet, portfolio

Source of the portfolio of Even Anicet, interior architect: https://even-anc.com

The site is bilingual (French and English) and shows projects, drawings, a diploma page and a contact form. It is plain static files served as they are.

## Stack

- Vanilla HTML and CSS, JavaScript as native ES modules. No framework and no build step: what is in the repository is what is served.
- GSAP and ScrollTrigger (3.12.5), Lenis (1.0.42) and PDF.js (3.11.174), vendored in `vendor/` with their licences. The scripts are loaded with Subresource Integrity hashes.
- A service worker (`sw.js`) for long-lived caching.

## Project structure

```
index.html            the single page: every section lives in this file
404.html              error page
sw.js                 service worker
css/                  one stylesheet per component, loaded in this order from index.html
  base.css            tokens, font, reset, utilities, focus ring
  layout.css          header, page containers, footer, next-page link
  menu.css            full-screen navigation
  frame.css           shared media primitives: torn frame, red rectangle, sheet
  home.css            hero, showcase, projects shortcut, notebook
  contact.css         contact form and contact details
  projects-hub.css    patchwork of polaroid cards
  project-detail.css  project page: board, panels, section stack
  carousel.css        sheet carousel and its comic heading
  drawings.css        drawings gallery
  quote-band.css      closing quote animated on scroll
  diploma.css         diploma page
  lightbox.css        viewer for drawings and plans
  reduced-motion.css  prefers-reduced-motion overrides, loaded last
js/
  main.js             entry point, starts every feature in a fixed order
  router.js           page display and history from URL fragments
  page-scroll.js      one Lenis smooth-scroll instance per page, scrollbar width
  i18n/               language resolution (i18n.js) and texts (dictionary.js)
  lightbox/           viewer: galleries, gestures, triggers, PDF rendering
  core/               shared state, environment checks, GSAP fallback
  header.js, menu.js, hero.js, carousel.js, contact.js, notebook.js,
  favicon.js, preload.js, touch-reveal.js, keyboard-activation.js
vendor/               GSAP, Lenis, PDF.js, with their licences
PDF/                  plan and section PDFs; opt/ holds their WebP previews
dessin/opt/           optimised drawings (WebP, 1x and 2x)
photo/opt/            optimised photograph
assets/               images and illustrations
fonts/                the display font (woff, woff2)
defaultsite/          stale-redirect catch-up page (noindex), kept for visitors who cached an old 301
.well-known/          security.txt
CNAME, .nojekyll      GitHub Pages configuration
robots.txt, sitemap.xml, og-card-v3.*, apple-touch-icon.png, favicon_1.svg
eslint.config.js, .stylelintrc.json, .htmlvalidate.json, .editorconfig
```

## Running locally

Any static server works. From the repository root:

```
python -m http.server 8000
```

or

```
npx serve
```

Then open the address it prints (http://localhost:8000 for the first one). The page must be served over HTTP: ES modules and the service worker do not run from `file://`.

## Linting

The linters are the only dependencies and are development-only. Install them once with `npm install` (a recent Node.js, 18.18 or later, is needed by ESLint 9), then:

```
npm run lint        # the three checks below
npm run lint:js     # ESLint
npm run lint:css    # Stylelint on css/**/*.css
npm run lint:html   # html-validate on index.html and 404.html
```

`vendor/` is excluded from linting. The ESLint config targets ECMAScript 2021, so syntax too recent for Safari 15 is reported.

html-validate runs its recommended preset with no rule turned off. Stylelint runs `stylelint-config-standard` with no rule turned off either; `.stylelintrc.json` only adds or tunes five rules:

| Rule | Setting | Why |
|---|---|---|
| `selector-class-pattern` | kebab-case with an optional `--modifier` | the standard pattern has no syntax for modifiers |
| `selector-max-id` | `0` | ids are hooks for scripts and anchors, never for styling |
| `declaration-no-important` | on | the two exceptions (inactive pages, reduced motion) carry a disable comment with their reason |
| `media-feature-range-notation` | `prefix` | the range notation, `(width <= 768px)`, needs Safari 16.4 |
| `property-no-vendor-prefix` | allows `-webkit-` on `backdrop-filter`, `mask-*`, `user-select`, `appearance`, `clip-path` | WebKit still needs these prefixes, or needed them in Safari 15 |

## Architecture notes

- Single-page application driven by URL fragments (`#projets`, `#contact`, ...). `router.js` reads the hash, shows the matching `.page` section and uses `pushState` or `replaceState` for history.
- Every page is its own scroll container (`overflow-y: auto` on `.page`), not the document.
- Internationalisation by dictionary: `js/i18n/dictionary.js` holds the French and English texts, applied to elements carrying `data-i18n`. The language comes from `?lang=`, then the stored choice, then the browser language, and is kept in the URL (`hreflang` alternates are declared in the head).
- Service worker caching, by kind of file: media (images, plans, fonts, PDF) stale-while-revalidate; vendored libraries cache first, since their path carries the version; site code (HTML, CSS, JS) network first, so modules are never served in mixed versions. Caches not listed in `sw.js` are deleted on activation; bump `VERSION` to force a full refresh.
- The viewer opens drawings and plans in a lightbox. PDF.js is injected on first use, with its integrity hash, and draws the first page of the PDF to a canvas under a pixel budget (lower on touch devices).
- `prefers-reduced-motion` is honoured in CSS and in JavaScript (`core/env.js`), for example the favicon animation falls back to a still frame.
- Targets Safari 15 and later: the code avoids syntax newer than ES2021 and has fallbacks for missing APIs (for example a canvas `roundRect` check in `favicon.js`, and Safari-specific handling of the paper filter in `notebook.js`).

## Conventions

- Indentation is four spaces, UTF-8, LF line endings, with a final newline (see `.editorconfig`).
- JavaScript style and bug rules are in `eslint.config.js`; functions are capped at 60 lines.
- CSS: one file per component, each opening with a one-line statement of what it covers. Class names are English kebab-case with the component as prefix (`carousel-arrow`), `--modifier` for variants (`carousel-arrow--next`), `is-` and `has-` for states set by script (`is-active`, `has-back-button`), and `js-` for hooks that carry no style. Repeated values are custom properties declared in `css/base.css`. No `@layer`, no nesting and no `:has()`, which Safari 15.0 lacks.
- Files in `vendor/` are never converted or reformatted (`.gitattributes` marks them as binary for line endings), because the scripts are checked against integrity hashes.

## Deployment

The site is published with GitHub Pages from the `main` branch, at the root of the repository. The `CNAME` file sets the custom domain `even-anc.com` and `.nojekyll` disables Jekyll processing. The host caps HTTP caching at ten minutes, which is why the service worker keeps media on the visitor's device.

## License

The source code (HTML, CSS, JavaScript and configuration files) is released under the MIT License. The content (drawings, plans, photographs, images, PDF documents and texts, in `PDF/`, `dessin/`, `photo/`, `assets/` and the other media files) is copyright Even Anicet, all rights reserved. Vendored libraries and the font keep their own licences. See [LICENSE](LICENSE).