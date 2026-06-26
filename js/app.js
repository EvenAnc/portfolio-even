/**
 * Portfolio ANICET EVEN — app.js V3
 * SPA + Logo Bandeau Scroll + Contact = scroll bas accueil
 * Rectangle SVG dessiné main + Menu habillé + Carrousel inertie
 */

// ─────────────────────────────────────
// TRADUCTIONS FR / EN
// ─────────────────────────────────────
const i18n = {
    fr: {
        meta_title:          "ANICET EVEN — Architecte d'intérieur",
        meta_desc:           "Portfolio d'Anicet Even, architecte d'intérieur diplômé de MJM Graphic Design Toulouse.",
        home_subtitle:       "Architecte d'intérieur",
        home_scroll:         "Défilez",
        menu_01: "ACCUEIL",  menu_02: "PROJETS", menu_03: "PHOTOS",
        menu_04: "DESSINS",  menu_05: "DIPLÔME", menu_06: "CONTACT",
        menu_deco_01: "bienvenue",
        menu_deco_02: "mes réalisations",
        menu_deco_03: "lumière & matière",
        menu_deco_04: "à main levée",
        menu_deco_05: "MJM Toulouse",
        menu_deco_06: "parlons-en",
        nav_next:            "suivant",
        showcase_sub:        "Rendu 3D — 2025",
        showcase_btn:        "voir les projets",
        shortcut_sub:        "Aperçu",
        shortcut_main:       "MES PROJETS",
        click_hint:          "cliquez !",
        about_title:         "Qui suis-je ?",
        about_p1:            "Passionné d'architecture d'intérieur depuis toujours, je suis étudiant en dernière année à MJM Graphic Design Toulouse. Mon approche allie l'esquisse traditionnelle au rendu 3D numérique pour créer des espaces qui racontent une histoire.",
        about_p2:            "Je m'intéresse particulièrement aux volumes bruts, aux matériaux nobles et à la lumière naturelle. Chaque projet est une exploration entre fonctionnalité et esthétique.",
        about_annotation:    "→ toujours en quête du détail juste",
        projects_intro:      "Conception d'espaces minimalistes et modélisations techniques 3D.",
        proj_cat_3d:         "Rendu 3D & Intérieur",
        proj_cat_plan:       "Plan & Aménagement",
        proj_cat_sketch:     "Esquisse & Concept",
        photos_intro:        "Détails de textures, matières et jeux d'ombres.",
        drawings_intro:      "Esquisses architecturales à main levée sur papier A4.",
        study_degree:        "Diplôme d'Architecte d'Intérieur",
        study_focus:         "Spécialisations",
        study_focus_desc:    "Modélisation 3D, plans de coupe, design mobilier et gestion d'espace.",
        study_address:       "Adresse",
        study_school_status: "Statut de l'établissement",
        study_school_status_desc: "Enseignement supérieur privé technique, enregistré auprès de l'Académie de Toulouse.",
        diploma_cert_title: "CERTIFICATION RNCP",
        diploma_cert_subtitle: "Designer en architecture d'intérieur - Niveau 6",
        diploma_cert_rncp: "STATUT RÉGLEMENTAIRE",
        diploma_cert_rncp_val: "Titre de niveau 6 (Bac+3 / Licence) inscrit au RNCP, certifiant l'aptitude à concevoir des espaces intérieurs, élaborer des dossiers techniques et superviser des chantiers.",
        diploma_cert_credits: "CRÉDENTIALS ACADÉMIQUES",
        diploma_cert_credits_val: "Équivalence de 180 crédits ECTS (Niveau 6 Européen EQF). Équivalence Suisse : Bachelor of Arts (BA) HES en architecture d'intérieur. Formation éligible au CPF.",
        diploma_cert_competences: "COMPÉTENCES CLÉS ACCRÉDITÉES",
        diploma_cert_c1: "Diagnostic technique, spatial et réglementaire de l'existant.",
        diploma_cert_c2: "Création de concepts esthétiques, plans de coupe et modélisations 3D.",
        diploma_cert_c3: "Prescription technique des matériaux, devis et cahiers des charges.",
        diploma_cert_c4: "Planification des interventions et coordination de la maîtrise d'œuvre.",
        diploma_cert_footer: "Enregistré par France Compétences",
        diploma_scan_title: "Scan du diplôme officiel",
        diploma_scan_placeholder_title: "Scan du diplôme (A4 Paysage) à intégrer ici",
        diploma_scan_placeholder_sub: "Espace réservé pour le document officiel de fin de cycle (A4 Paysage)",
        contact_intro:       "Discutons de votre projet d'aménagement intérieur.",
        form_name: "NOM", form_email: "EMAIL",
        form_message: "MESSAGE", form_send: "ENVOYER",
        contact_direct:   "CONTACT DIRECT",
        contact_social:   "RÉSEAUX",
        contact_location: "LOCALISATION",
        drawing_title_carto: "CARTOGRAPHIE",
        drawing_desc_carto:  "Dessin technique & Relief — A4",
        drawing_title_nb:    "NOIR ET BLANC",
        drawing_desc_nb:     "Encre de Chine & Graphisme — A4",
        drawing_title_style: "À LA MANIÈRE DE...",
        drawing_desc_style:  "Étude de style & Graphite — A4",
        bd_title:            "BANDE DESSINÉE",
        legal_copyright:  "Toutes les œuvres présentées sur ce site (rendus 3D, esquisses, photographies, dessins) sont la propriété exclusive d'Anicet Even. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est strictement interdite.",
        legal_cert:       "Je certifie être l'auteur de l'ensemble des travaux et productions présentés sur ce portfolio. Les images et créations sont protégées par le droit d'auteur conformément au Code de la Propriété Intellectuelle français (articles L.111-1 et suivants).",
        legal_mentions:   "Mentions légales",
        legal_rights:     "Tous droits réservés",
    },
    en: {
        meta_title:          "ANICET EVEN — Interior Architect",
        meta_desc:           "Portfolio of Anicet Even, interior architect from MJM Graphic Design Toulouse.",
        home_subtitle:       "Interior Architect",
        home_scroll:         "Scroll",
        menu_01: "HOME",     menu_02: "PROJECTS", menu_03: "PHOTOS",
        menu_04: "DRAWINGS", menu_05: "DIPLOMA",  menu_06: "CONTACT",
        menu_deco_01: "welcome",
        menu_deco_02: "my work",
        menu_deco_03: "light & texture",
        menu_deco_04: "freehand",
        menu_deco_05: "MJM Toulouse",
        menu_deco_06: "let's talk",
        nav_next:            "next",
        showcase_sub:        "3D Render — 2025",
        showcase_btn:        "view projects",
        shortcut_sub:        "sneak peek",
        shortcut_main:       "MY PROJECTS",
        click_hint:          "click here !",
        about_title:         "About me",
        about_p1:            "Passionate about interior architecture, I am a final-year student at MJM Graphic Design Toulouse. My approach combines traditional sketching with digital 3D rendering to create spaces that tell a story.",
        about_p2:            "I am particularly drawn to raw volumes, noble materials and natural light. Each project is an exploration between functionality and aesthetics.",
        about_annotation:    "→ always chasing the perfect detail",
        projects_intro:      "Minimalist space design and 3D technical modelling.",
        proj_cat_3d:         "3D Render & Interior",
        proj_cat_plan:       "Technical Plan & Layout",
        proj_cat_sketch:     "Pencil Sketch & Concept",
        photos_intro:        "Textures, materials and interplay of light.",
        drawings_intro:      "Freehand architectural sketches on A4 paper.",
        study_degree:        "Interior Design & Architecture Degree",
        study_focus:         "Core Modules",
        study_focus_desc:    "3D CAD modelling, drafting plans, custom furniture and spatial management.",
        study_address:       "Address",
        study_school_status: "Institution Status",
        study_school_status_desc: "Private technical higher education institution, registered with the Academy of Toulouse.",
        diploma_cert_title: "RNCP CERTIFICATION",
        diploma_cert_subtitle: "Interior Architecture Designer - Level 6",
        diploma_cert_rncp: "REGULATORY STATUS",
        diploma_cert_rncp_val: "State-certified level 6 qualification (Bachelor's degree equivalent) registered at the RNCP, certifying professional skills in spatial design, technical drafts, and site supervision.",
        diploma_cert_credits: "ACADEMIC CREDENTIALS",
        diploma_cert_credits_val: "Equivalency of 180 ECTS credits (European EQF Level 6). Swiss Equivalence: Bachelor of Arts (BA) HES in Interior Architecture. Course eligible for CPF.",
        diploma_cert_competences: "KEY ACCREDITED SKILLS",
        diploma_cert_c1: "Technical, spatial, and regulatory auditing of existing spaces.",
        diploma_cert_c2: "Creation of aesthetic concepts, technical drawing section plans, and 3D renders.",
        diploma_cert_c3: "Technical specification of materials, cost estimation, and construction specifications.",
        diploma_cert_c4: "Project scheduling, execution management, and contractor coordination.",
        diploma_cert_footer: "Registered by France Compétences",
        diploma_scan_title: "Official Diploma Scan",
        diploma_scan_placeholder_title: "Official diploma scan (A4 Landscape) placeholder",
        diploma_scan_placeholder_sub: "Reserved space for the official graduation document (A4 Landscape)",
        contact_intro:       "Let's discuss your interior design project.",
        form_name: "NAME", form_email: "EMAIL",
        form_message: "MESSAGE", form_send: "SEND",
        contact_direct:   "DIRECT CONTACT",
        contact_social:   "SOCIALS",
        contact_location: "LOCATION",
        drawing_title_carto: "CARTOGRAPHY",
        drawing_desc_carto:  "Technical Drawing & Relief — A4",
        drawing_title_nb:    "BLACK & WHITE",
        drawing_desc_nb:     "Indian Ink & Graphic — A4",
        drawing_title_style: "IN THE STYLE OF...",
        drawing_desc_style:  "Style Study & Graphite — A4",
        bd_title:            "COMIC BOOK (BD)",
        legal_copyright:  "All works presented on this website (3D renders, sketches, photographs, drawings) are the exclusive property of Anicet Even. Any reproduction, distribution or use without prior written authorisation is strictly prohibited.",
        legal_cert:       "I certify that I am the sole author of all works and productions presented in this portfolio. All images and creations are protected by copyright in accordance with French Intellectual Property Code (articles L.111-1 et seq.).",
        legal_mentions:   "Legal notice",
        legal_rights:     "All rights reserved",
    }
};

let currentLang = 'fr';
let currentPage = 'home';
let isMenuOpen  = false;
let lenis       = null;

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    const saved = localStorage.getItem('lang');
    currentLang = (saved === 'fr' || saved === 'en')
        ? saved
        : (navigator.language || '').startsWith('fr') ? 'fr' : 'en';

    applyLang(currentLang);
    initLangSwitcher();
    initMenu();
    initSPA();
    initCarousel();
    initNotebookLines();
    initNextPageLinks();
    initContactAnimation();
    initBDCarousel();

    initDrawingLightbox();

    // Animations au scroll pour les appareils tactiles (mobile)
    // Appelé APRÈS showPage pour que is-active soit bien présent
    initScrollAnimationsMobile();

    // Révéler la page home avec animation d'entrée
    showPage('home', false);

    // Animation d'entrée du hero
    requestAnimationFrame(() => {
        const heroWrap = document.getElementById('hero-logo-wrap');
        const scrollInv = document.getElementById('scroll-invite');
        if (heroWrap) {
            gsap.fromTo(heroWrap,
                { opacity: 0, y: 40, scale: 0.92 },
                { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.15 }
            );
        }
        if (scrollInv) {
            gsap.fromTo(scrollInv,
                { opacity: 0 },
                { opacity: 0.45, duration: 0.8, delay: 1.4 }
            );
        }
    });
});

// ─────────────────────────────────────
// LANGUE
// ─────────────────────────────────────
function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.title = i18n[lang].meta_title;

    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = i18n[lang].meta_desc;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key] !== undefined) el.textContent = i18n[lang][key];
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function initLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.lang !== currentLang) applyLang(btn.dataset.lang);
        });
    });
}

// ─────────────────────────────────────
// MENU OVERLAY
// ─────────────────────────────────────
function initMenu() {
    const burger = document.getElementById('burger-btn');
    burger.addEventListener('click', toggleMenu);

    // Clic sur item du menu
    document.querySelectorAll('.menu-nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const page = item.dataset.page;
            closeMenu();

            if (page === 'contact') {
                // CONTACT → aller sur la page accueil puis scroller vers le bas
                const wasOnHome = currentPage === 'home';
                setTimeout(() => {
                    if (!wasOnHome) {
                        showPage('home', true);
                    }
                    // Attendre la transition puis scroller dans le conteneur de la page
                    const delay = wasOnHome ? 100 : 700;
                    setTimeout(() => {
                        const homeEl = document.getElementById('page-home');
                        const contactEl = document.getElementById('home-contact');
                        if (homeEl && contactEl) {
                            const targetY = contactEl.offsetTop - 40;
                            homeEl.scrollTo({ top: targetY, behavior: 'smooth' });
                        }
                    }, delay);
                }, 420);
            } else {
                setTimeout(() => showPage(page), 420);
            }
        });
    });

    // Logo header → retour accueil
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
        headerLogo.addEventListener('click', e => {
            e.preventDefault();
            if (currentPage !== 'home') showPage('home');
        });
    }

    // Clic sur l'arrière-plan du menu (partie grise) pour revenir en arrière
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
        menuOverlay.addEventListener('click', e => {
            if (!e.target.closest('a') && !e.target.closest('button')) {
                closeMenu();
            }
        });
    }
}

function toggleMenu() {
    isMenuOpen ? closeMenu() : openMenu();
}

function openMenu() {
    isMenuOpen = true;
    document.body.classList.add('menu-open');
    // BUG-12 FIX : mettre à jour aria-hidden pour les screen readers
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) menuOverlay.setAttribute('aria-hidden', 'false');

    // Animation d'entrée des items avec décalage vertical
    const items = document.querySelectorAll('.menu-nav-item');
    gsap.fromTo(items, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1,
        duration: 0.55, stagger: 0.065,
        ease: 'power3.out',
        delay: 0.12
    });

    // Animer le logo du menu
    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
        gsap.fromTo(menuLogo,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.05 }
        );
    }

    // Animer le scribble
    const scribble = document.querySelector('.menu-scribble');
    if (scribble) {
        gsap.fromTo(scribble,
            { opacity: 0, rotate: -15 },
            { opacity: 0.35, rotate: -8, duration: 0.5, delay: 0.5 }
        );
    }
}

function closeMenu() {
    isMenuOpen = false;
    document.body.classList.remove('menu-open');
    // BUG-12 FIX : mettre à jour aria-hidden pour les screen readers
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) menuOverlay.setAttribute('aria-hidden', 'true');
}

// ─────────────────────────────────────
// SPA — GESTION DES PAGES
// ─────────────────────────────────────
function initSPA() {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('is-active');
    });
}

function showPage(pageId, animate = true) {
    if (pageId === currentPage && animate) return;

    const outEl = document.getElementById(`page-${currentPage}`);
    const inEl  = document.getElementById(`page-${pageId}`);
    if (!inEl) return;

    currentPage = pageId;

    // Détruire le Lenis de l'ancienne page
    if (lenis) { lenis.destroy(); lenis = null; }

    if (!animate || !outEl) {
        if (outEl) {
            outEl.classList.remove('is-active');
            outEl.setAttribute('aria-hidden', 'true');
        }
        inEl.classList.add('is-active');
        inEl.setAttribute('aria-hidden', 'false');
        inEl.scrollTop = 0;
        resetHomeHero(pageId);
        initPageLenis(inEl);
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        updateHeaderLogo(pageId);
        return;
    }

    // Transition GSAP
    gsap.to(outEl, {
        opacity: 0, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
            outEl.classList.remove('is-active');
            outEl.setAttribute('aria-hidden', 'true');
            outEl.style.opacity = '';

            inEl.classList.add('is-active');
            inEl.setAttribute('aria-hidden', 'false');
            inEl.scrollTop = 0;
            resetHomeHero(pageId);

            gsap.fromTo(inEl,
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
            );

            initPageLenis(inEl);
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            updateHeaderLogo(pageId);
        }
    });
}

// Quand on revient sur la page home, remettre le hero logo en état initial
function resetHomeHero(pageId) {
    if (pageId !== 'home') return;
    const heroLogoWrap = document.getElementById('hero-logo-wrap');
    const scrollInvite = document.getElementById('scroll-invite');
    if (heroLogoWrap) {
        gsap.set(heroLogoWrap, { y: 0, opacity: 1 });
    }
    if (scrollInvite) {
        gsap.set(scrollInvite, { opacity: 0.45 });
    }
}

// ─────────────────────────────────────
// LOGO BANDEAU — APPARAÎT AU SCROLL SUR HOME
// ─────────────────────────────────────
function updateHeaderLogo(pageId) {
    const headerLogo = document.getElementById('header-logo');
    if (!headerLogo) return;

    if (pageId === 'home') {
        // Sur la page home, masquer le logo header (le hero logo est visible)
        headerLogo.classList.remove('is-visible');
    } else {
        // Sur les autres pages, afficher le logo header
        headerLogo.classList.add('is-visible');
    }
}

// ─────────────────────────────────────
// LENIS SCROLL PAR PAGE
// ─────────────────────────────────────
function initPageLenis(scrollContainer) {
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
        wrapper: scrollContainer,
        content: scrollContainer,
        duration: 1.15,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        mouseMultiplier: 0.95,
        smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // BUG-04 FIX : stocker la référence du ticker pour pouvoir le supprimer plus tard
    // et éviter l'accumulation de tickers à chaque navigation entre pages.
    if (window._lenisTickerFn) {
        gsap.ticker.remove(window._lenisTickerFn);
    }
    window._lenisTickerFn = time => lenis.raf(time * 1000);
    gsap.ticker.add(window._lenisTickerFn);
    gsap.ticker.lagSmoothing(0);

    // Sur la page home : animer le logo vers le header au scroll
    if (currentPage === 'home') {
        const heroLogoWrap = document.getElementById('hero-logo-wrap');
        const headerLogo   = document.getElementById('header-logo');
        const scrollInvite = document.getElementById('scroll-invite');

        let logoInHeader = false;

        lenis.on('scroll', ({ scroll }) => {
            const threshold = 120;

            if (scroll > threshold && !logoInHeader) {
                logoInHeader = true;

                // Hero logo disparaît vers le haut
                gsap.to(heroLogoWrap, {
                    y: -50, opacity: 0,
                    duration: 0.5, ease: 'power3.in',
                    onComplete: () => {
                        headerLogo.classList.add('is-visible');
                    }
                });

                gsap.to(scrollInvite, { opacity: 0, duration: 0.3 });

            } else if (scroll <= threshold && logoInHeader) {
                logoInHeader = false;

                headerLogo.classList.remove('is-visible');
                gsap.to(heroLogoWrap, {
                    y: 0, opacity: 1,
                    duration: 0.5, ease: 'power3.out', delay: 0.1
                });
                gsap.to(scrollInvite, { opacity: 0.45, duration: 0.4 });
            }
        });
    }

    window._lenis = lenis;
}

// ─────────────────────────────────────
// CARROUSEL HORIZONTAL (PHOTOS)
// ─────────────────────────────────────
function initCarousel() {
    // Carousel is now static wrapped grid layout, no-op
}

// ─────────────────────────────────────
// LIGNES DE CAHIER ALÉATOIRES
// ─────────────────────────────────────
function initNotebookLines() {
    const container = document.getElementById('notebook-lines');
    if (!container) return;

    // Attendre que la section soit visible pour mesurer
    const observer = new ResizeObserver(() => {
        generateLines(container);
        observer.disconnect();
    });
    observer.observe(container.parentElement);

    // Génération immédiate aussi
    setTimeout(() => generateLines(container), 200);
}

function generateLines(container) {
    const parent = container.parentElement;
    if (!parent) return;
    const h = Math.max(parent.scrollHeight, parent.offsetHeight, 800);
    container.innerHTML = '';

    const spacing = 34;
    const numLines = Math.ceil(h / spacing) + 2;

    for (let i = 0; i < numLines; i++) {
        const line = document.createElement('div');
        line.className = 'nb-line';

        // Longueurs aléatoires : début et fin varient
        const leftOffset  = 4 + Math.random() * 20;   // 4-24px
        const rightOffset = 6 + Math.random() * 35;   // 6-41px
        const opacity     = 0.18 + Math.random() * 0.12; // 0.18-0.30

        line.style.left    = leftOffset + 'px';
        line.style.right   = rightOffset + 'px';
        line.style.top     = (10 + i * spacing) + 'px';
        line.style.opacity = opacity;

        container.appendChild(line);
    }
}

// ─────────────────────────────────────
// FLÈCHES "SUIVANT" → PAGE SUIVANTE
// ─────────────────────────────────────
function initNextPageLinks() {
    document.querySelectorAll('.page-next, .showcase-projects-btn').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const nextPage = link.dataset.next;
            if (nextPage) showPage(nextPage);
        });
    });
}

function initContactAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const homeContact = document.getElementById('home-contact');
    const homePage = document.getElementById('page-home');
    if (!homeContact || !homePage) return;

    const heading = homeContact.querySelector('.page-heading');
    const intro = homeContact.querySelector('.page-intro');
    const formGroups = homeContact.querySelectorAll('.fg');
    const submitBtn = homeContact.querySelector('.btn-wrap');
    const infoBlocks = homeContact.querySelectorAll('.ci-block');

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: homeContact,
            scroller: "#page-home",
            start: "top 85%",
            toggleActions: "play none none none"
        }
    });

    tl.fromTo(heading, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    
    tl.fromTo(intro,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
    );

    const formElements = [...formGroups, submitBtn];
    tl.fromTo(formElements,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
        "-=0.5"
    );

    tl.fromTo(infoBlocks,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
        "-=0.6"
    );

    // BUG-07 FIX : Validation formulaire contact avec feedback visuel
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameEl  = document.getElementById('fn');
        const emailEl = document.getElementById('fe');
        const msgEl   = document.getElementById('fm');

        const name  = nameEl.value.trim();
        const email = emailEl.value.trim();
        const msg   = msgEl.value.trim();

        // Nettoyage des erreurs précédentes
        [nameEl, emailEl, msgEl].forEach(el => el.classList.remove('fi-error'));
        feedback.className = 'form-feedback';
        feedback.textContent = '';

        // Validation
        let hasError = false;
        if (!name) { nameEl.classList.add('fi-error'); hasError = true; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailEl.classList.add('fi-error'); hasError = true;
        }
        if (!msg) { msgEl.classList.add('fi-error'); hasError = true; }

        if (hasError) {
            const errMsg = currentLang === 'fr'
                ? 'Merci de remplir tous les champs correctement.'
                : 'Please fill in all fields correctly.';
            feedback.textContent = errMsg;
            feedback.classList.add('form-feedback--error');
            gsap.fromTo(feedback, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35 });
            return;
        }

        // Simulation d'envoi (le site est statique, pas de backend)
        const submitSpan = form.querySelector('[data-i18n="form_send"]');
        if (submitSpan) submitSpan.textContent = currentLang === 'fr' ? 'Envoi...' : 'Sending...';

        setTimeout(() => {
            const successMsg = currentLang === 'fr'
                ? '✓ Message envoyé ! Je vous répondrai rapidement.'
                : '✓ Message sent! I will reply shortly.';
            feedback.textContent = successMsg;
            feedback.classList.add('form-feedback--success');
            gsap.fromTo(feedback, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4 });
            form.reset();
            if (submitSpan) submitSpan.textContent = currentLang === 'fr' ? 'ENVOYER' : 'SEND';
        }, 600);
    });
}


// ─────────────────────────────────────
// CARROUSEL BANDE DESSINÉE (BD)
// ─────────────────────────────────────
function initBDCarousel() {
    const container = document.querySelector('.bd-carousel-section');
    if (!container) return;

    const slides = container.querySelectorAll('.bd-slide');
    const dots = container.querySelectorAll('.bd-dot');
    const prevBtn = container.querySelector('.prev-btn');
    const nextBtn = container.querySelector('.next-btn');
    const playPauseBtn = container.querySelector('.bd-play-pause-btn');
    const iconPause = playPauseBtn.querySelector('.icon-pause');
    const iconPlay = playPauseBtn.querySelector('.icon-play');
    const progressBar = container.querySelector('.bd-progress-bar');
    const indicator = container.querySelector('.bd-page-indicator');

    let currentIndex = 0;
    let isPlaying = true;
    let autoplayTimeout = null;
    let progressAnimFrame = null;
    const slideDuration = 5000; // 5 secondes par page
    let progressStart = 0;

    function updateCarousel(index) {
        // Boucler sur les limites
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        currentIndex = index;

        // Activer la slide
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });

        // Activer le dot
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });

        // Indicateur textuel
        if (indicator) {
            indicator.textContent = `${currentIndex + 1} / ${slides.length}`;
        }

        // Relancer l'autoplay si actif
        if (isPlaying) {
            startAutoplay();
        } else {
            progressBar.style.width = '0%';
        }
    }

    function nextSlide() {
        updateCarousel(currentIndex + 1);
    }

    function prevSlide() {
        updateCarousel(currentIndex - 1);
    }

    function startAutoplay() {
        stopAutoplay();
        
        progressStart = performance.now();
        autoplayTimeout = setTimeout(nextSlide, slideDuration);
        
        function drawProgress(time) {
            if (!isPlaying) return;
            const elapsed = time - progressStart;
            const percent = Math.min((elapsed / slideDuration) * 100, 100);
            progressBar.style.width = `${percent}%`;
            
            if (elapsed < slideDuration) {
                progressAnimFrame = requestAnimationFrame(drawProgress);
            }
        }
        progressAnimFrame = requestAnimationFrame(drawProgress);
    }

    function stopAutoplay() {
        if (autoplayTimeout) clearTimeout(autoplayTimeout);
        if (progressAnimFrame) cancelAnimationFrame(progressAnimFrame);
        progressBar.style.width = '0%';
    }

    function togglePlayPause() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            iconPause.style.display = 'block';
            iconPlay.style.display = 'none';
            startAutoplay();
        } else {
            iconPause.style.display = 'none';
            iconPlay.style.display = 'block';
            stopAutoplay();
        }
    }

    // Navigation
    prevBtn.addEventListener('click', () => {
        prevSlide();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
    });

    // Bouton Play/Pause
    playPauseBtn.addEventListener('click', () => {
        togglePlayPause();
    });

    // Clic sur les points indicateurs
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            updateCarousel(i);
        });
    });

    // ── Lancement
    startAutoplay();

    // BUG-03 FIX : Pause l'autoplay quand la page dessins n'est pas visible
    // pour éviter des timeouts et RAF qui tournent inutilement en arrière-plan.
    const drawingsPage = document.getElementById('page-drawings');
    if (drawingsPage) {
        const pageObserver = new MutationObserver(() => {
            const isPageActive = drawingsPage.classList.contains('is-active');
            if (!isPageActive && isPlaying) {
                stopAutoplay();
            } else if (isPageActive && isPlaying) {
                startAutoplay();
            }
        });
        pageObserver.observe(drawingsPage, { attributes: true, attributeFilter: ['class'] });
    }

    // BUG-09 FIX : Support du swipe tactile sur le carousel BD
    let bdTouchStartX = 0;
    const bdViewport = container.querySelector('.bd-carousel-viewport');
    if (bdViewport) {
        bdViewport.addEventListener('touchstart', e => {
            bdTouchStartX = e.changedTouches[0].clientX;
        }, { passive: true });
        bdViewport.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - bdTouchStartX;
            if (Math.abs(dx) > 40) {
                if (dx < 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });
    }
}

// ─────────────────────────────────────
// CONFIGURATION ET RENDU PDF.JS DESSINS
// ─────────────────────────────────────
const allDrawings = [
    {
        url: "dessin/Cartographie-1.png",
        title: "CARTOGRAPHIE",
        desc: "Dessin technique & Relief — A4",
        orient: "portrait"
    },
    {
        url: "dessin/A la manière de-1.png",
        title: "À LA MANIÈRE DE...",
        desc: "Étude de style & Graphite — A4",
        orient: "landscape"
    },
    {
        url: "dessin/NOIR ET BLANC Even-1.png",
        title: "NOIR ET BLANC",
        desc: "Encre de Chine & Graphisme — A4",
        orient: "portrait"
    },
    {
        url: "dessin/BD page 1-1.png",
        title: "BANDE DESSINÉE — Page 1",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/BD page 2-1.png",
        title: "BANDE DESSINÉE — Page 2",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/BD page 3-1.png",
        title: "BANDE DESSINÉE — Page 3",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/BD page 4-1.png",
        title: "BANDE DESSINÉE — Page 4",
        desc: "A4 — Portrait",
        orient: "portrait"
    }
];

// Removed PDF.js rendering logic

// ─────────────────────────────────────
// LIGHTBOX ULTRA-ÉPURÉE (STYLE FORTICHE)
// ─────────────────────────────────────
function initDrawingLightbox() {
    const lightbox = document.getElementById('drawing-lightbox');
    if (!lightbox) return;

    const canvasWrap = document.getElementById('lb-canvas-wrap');
    const counterEl  = lightbox.querySelector('.lb-counter');
    const closeBtn   = lightbox.querySelector('.lb-close');
    const prevBtn    = lightbox.querySelector('.lb-prev');
    const nextBtn    = lightbox.querySelector('.lb-next');
    const loader     = document.getElementById('lb-loader');
    const dotsWrap   = lightbox.querySelector('.lb-dots');
    const zoomBtn    = lightbox.querySelector('.lb-zoom-btn');
    const fullBtn    = lightbox.querySelector('.lb-fullscreen-btn');
    const zoomRange  = lightbox.querySelector('#lb-zoom-range');
    const sliderRedPath = lightbox.querySelector('#lb-slider-red-path');

    let current = 0;
    let hideTimer = null;
    let isZoomed = false;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;
    let initialTx, initialTy;

    function updateTransform() {
        const img = canvasWrap.querySelector('img');
        if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        
        if (sliderRedPath && zoomRange) {
            const percent = (scale - zoomRange.min) / (zoomRange.max - zoomRange.min);
            sliderRedPath.style.strokeDashoffset = 100 - (percent * 100);
        }
    }

    // ── Créer les points indicateurs ──
    allDrawings.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'lb-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            showDrawing(i);
        });
        dotsWrap.appendChild(dot);
    });

    function updateDots() {
        dotsWrap.querySelectorAll('.lb-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    // ── Auto-masquage des contrôles ──
    function showControls() {
        lightbox.classList.remove('controls-hidden');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            lightbox.classList.add('controls-hidden');
        }, 2500);
    }

    lightbox.addEventListener('mousemove', showControls);
    lightbox.addEventListener('touchstart', showControls);

    // ── Afficher un dessin ──
    async function showDrawing(index) {
        current = index;
        isZoomed = false;
        scale = 1;
        translateX = 0;
        translateY = 0;
        if (zoomRange) zoomRange.value = 1;
        updateTransform();
        lightbox.classList.remove('zoomed');

        // Mettre à jour le compteur
        if (counterEl) {
            counterEl.textContent = `${index + 1} / ${allDrawings.length}`;
        }

        updateDots();

        // Préparer l'image
        if (canvasWrap) canvasWrap.innerHTML = '';
        if (loader) loader.classList.add('active');

        const drawing = allDrawings[index];
        const img = document.createElement('img');
        img.src = drawing.url;
        img.alt = drawing.title;
        img.onload = () => {
            if (loader) loader.classList.remove('active');
        };
        img.onerror = () => {
            if (loader) loader.classList.remove('active');
            console.error('Erreur lors du chargement de l\'image:', drawing.url);
        };
        
        if (canvasWrap) canvasWrap.appendChild(img);

        showControls();
    }

    // ── Ouvrir / Fermer ──
    function openLightbox(index) {
        lightbox.setAttribute('aria-hidden', 'false');
        if (window._lenis) window._lenis.stop();
        document.body.style.overflow = 'hidden';
        showDrawing(index);
    }

    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        isZoomed = false;
        scale = 1;
        translateX = 0;
        translateY = 0;
        if (zoomRange) zoomRange.value = 1;
        updateTransform();
        lightbox.classList.remove('zoomed');
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(()=>{});
        }
        clearTimeout(hideTimer);
        setTimeout(() => {
            if (canvasWrap) canvasWrap.innerHTML = '';
        }, 350);
        if (window._lenis) window._lenis.start();
        document.body.style.overflow = '';
    }

    // ── Clic sur les dessins de la galerie et les slides BD ──
    document.querySelectorAll('.drawing-item .frame-wrap, .bd-slide .drawing-sheet-wrap').forEach((item) => {
        // Ne PAS appliquer le curseur ici en JS : il est géré en CSS uniquement
        // quand la page parente est active (.page.is-active), ce qui évite que
        // le curseur "zoom" déborde sur d'autres pages ou sur le menu.
        item.addEventListener('click', () => {
            const parentItem = item.closest('.drawing-item, .bd-slide');
            if (!parentItem) return;

            // Vérifier que la page contenant cet élément est bien la page active
            const parentPage = item.closest('.page');
            if (parentPage && !parentPage.classList.contains('is-active')) return;

            if (parentItem.classList.contains('bd-slide') && !parentItem.classList.contains('active')) return;

            const allElements = Array.from(document.querySelectorAll('.drawing-item, .bd-slide'));
            const idx = allElements.indexOf(parentItem);
            if (idx !== -1) openLightbox(idx);
        });
    });

    // ── Fermeture ──
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

    // ── Outils (Zoom & Fullscreen) ──
    function toggleZoom() {
        isZoomed = !isZoomed;
        lightbox.classList.toggle('zoomed', isZoomed);
        if (isZoomed) {
            scale = 2;
        } else {
            scale = 1;
            translateX = 0;
            translateY = 0;
        }
        if (zoomRange) zoomRange.value = scale;
        updateTransform();
    }
    if (zoomBtn) zoomBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleZoom(); });

    if (zoomRange) {
        zoomRange.addEventListener('input', (e) => {
            scale = parseFloat(e.target.value);
            if (scale > 1 && !isZoomed) {
                isZoomed = true;
                lightbox.classList.add('zoomed');
            } else if (scale === 1 && isZoomed) {
                translateX = 0;
                translateY = 0;
                // On ne retire pas la classe .zoomed ici pour éviter que 
                // la barre ne disparaisse sous le clic de l'utilisateur, ce qui 
                // déclencherait un clic sur le fond et fermerait la fenêtre.
            }
            updateTransform();
        });

        // L'événement 'change' se déclenche quand on relâche le clic sur la barre
        zoomRange.addEventListener('change', (e) => {
            if (scale <= 1 && isZoomed) {
                isZoomed = false;
                lightbox.classList.remove('zoomed');
                translateX = 0;
                translateY = 0;
                updateTransform();
            }
        });

        // Click on slider wrapper shouldn't close lightbox
        zoomRange.parentNode.addEventListener('click', e => e.stopPropagation());
    }

    if (fullBtn) fullBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            lightbox.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen().catch(()=>{});
        }
    });

    // Clic en dehors de l'image = fermer, clic sur l'image = zoom (si non zoomé)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lb-canvas-wrap')) {
            closeLightbox();
        } else if (e.target.tagName.toLowerCase() === 'img') {
            if (!isZoomed) toggleZoom();
        }
    });

    // ── Pan & Zoom Pointer Events ──
    if (canvasWrap) {
        canvasWrap.addEventListener('pointerdown', (e) => {
            if (!isZoomed || e.target.tagName.toLowerCase() !== 'img') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialTx = translateX;
            initialTy = translateY;
            e.target.classList.add('dragging');
            e.target.setPointerCapture(e.pointerId);
        });

        canvasWrap.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            translateX = initialTx + (e.clientX - startX);
            translateY = initialTy + (e.clientY - startY);
            updateTransform();
        });

        canvasWrap.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            e.target.classList.remove('dragging');
            e.target.releasePointerCapture(e.pointerId);
        });

        canvasWrap.addEventListener('wheel', (e) => {
            if (lightbox.getAttribute('aria-hidden') === 'true') return;
            if (!isZoomed && e.deltaY > 0) return;
            e.preventDefault();
            const zoomSpeed = 0.15;
            scale += e.deltaY < 0 ? zoomSpeed : -zoomSpeed;
            
            if (zoomRange) {
                scale = Math.max(parseFloat(zoomRange.min), Math.min(parseFloat(zoomRange.max), scale));
                zoomRange.value = scale;
            }
            
            if (scale <= 1) {
                scale = 1;
                isZoomed = false;
                lightbox.classList.remove('zoomed');
                translateX = 0;
                translateY = 0;
            } else if (!isZoomed) {
                isZoomed = true;
                lightbox.classList.add('zoomed');
            }
            updateTransform();
        }, { passive: false });
    }

    // ── Clavier ──
    window.addEventListener('keydown', (e) => {
        if (lightbox.getAttribute('aria-hidden') !== 'false') return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowRight') showDrawing((current + 1) % allDrawings.length);
        else if (e.key === 'ArrowLeft') showDrawing((current - 1 + allDrawings.length) % allDrawings.length);
    });

    // ── Flèches ──
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDrawing((current - 1 + allDrawings.length) % allDrawings.length);
    });
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDrawing((current + 1) % allDrawings.length);
    });

    // BUG-10 FIX : Swipe tactile sur la lightbox pour naviguer entre les images
    let lbTouchStartX = 0;
    let lbTouchStartY = 0;
    lightbox.addEventListener('touchstart', (e) => {
        lbTouchStartX = e.changedTouches[0].clientX;
        lbTouchStartY = e.changedTouches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
        if (isZoomed) return; // Ne pas swiper si on est en zoom
        const dx = e.changedTouches[0].clientX - lbTouchStartX;
        const dy = e.changedTouches[0].clientY - lbTouchStartY;
        // Seuil : au moins 50px horizontaux, et plus horizontal que vertical
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) showDrawing((current + 1) % allDrawings.length);
            else showDrawing((current - 1 + allDrawings.length) % allDrawings.length);
        }
    }, { passive: true });
}

// ─────────────────────────────────────
// ─────────────────────────────────────
// ANIMATIONS AU SCROLL — MOBILE TOUCH
// Remplace les effets de survol sur les appareils tactiles
// ─────────────────────────────────────
function initScrollAnimationsMobile() {
    // Uniquement sur les appareils sans hover (mobile, tablette tactile)
    if (!window.matchMedia('(hover: none)').matches) return;

    // Sélecteurs à observer — même liste que les éléments animés en CSS
    const SELECTORS = [
        '.frame-wrap',
        '.btn-wrap',
        '.drawing-item',
        '.project-item',
        '.hc-item',
        '.ci-block',
        '.fg',
        '.home-projects-shortcut',
    ].join(', ');

    // BUG ANDROID FIX : Le scroll se fait à l'intérieur des éléments .page
    // (overflow-y: auto), pas dans le viewport du navigateur.
    // Il faut donc créer un IntersectionObserver PAR PAGE avec root = la page,
    // sinon le navigateur considère que tout est "dans le viewport" car .page
    // couvre tout l'écran en position: absolute.
    const pageObservers = new Map(); // page element → IntersectionObserver

    function createObserverForPage(page) {
        if (pageObservers.has(page)) return pageObservers.get(page);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-inview');
                    // Désobserver après déclenchement pour optimiser les perfs
                    // L'élément garde sa classe .is-inview définitivement
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: page,           // ← clé du fix : la page elle-même est le root
            threshold: 0.15,      // déclenche quand 15% de l'élément est visible
            rootMargin: '0px 0px -8% 0px'
        });

        pageObservers.set(page, observer);
        return observer;
    }

    // Observer tous les éléments d'une page donnée
    function observeInPage(page) {
        const observer = createObserverForPage(page);
        page.querySelectorAll(SELECTORS).forEach(el => {
            if (!el.dataset.mobileObserved) {
                el.dataset.mobileObserved = '1';
                observer.observe(el);
            }
        });
    }

    // Lancement initial sur la page home (déjà active au moment de l'appel)
    const homePage = document.getElementById('page-home');
    if (homePage) {
        // Léger délai pour s'assurer que showPage() a bien ajouté is-active
        // et que le layout est statisé
        setTimeout(() => observeInPage(homePage), 300);
    }

    // Pour chaque autre page : observer dès qu'elle devient active (navigation SPA)
    document.querySelectorAll('.page').forEach(page => {
        if (page.id === 'page-home') return; // déjà géré ci-dessus

        const mutObserver = new MutationObserver(() => {
            if (page.classList.contains('is-active')) {
                // Délai pour laisser la transition de page se terminer
                setTimeout(() => observeInPage(page), 450);
            }
        });
        mutObserver.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
}
