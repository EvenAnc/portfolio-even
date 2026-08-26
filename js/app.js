/**
 * Portfolio Even ANICET — app.js V3
 * SPA + Logo Bandeau Scroll + Contact = scroll bas accueil
 * Rectangle SVG dessiné main + Menu habillé + Carrousel inertie
 */

// Un appareil est considere tactile s'il n'a pas de survol OU si son
// pointeur est grossier (doigt). Le second critere rattrape les tablettes
// et PC tactiles qui se declarent a tort comme ayant un survol : sans lui
// ils n'avaient NI le survol reel, NI l'equivalent tactile.
const REQUETE_TACTILE = '(hover: none), (pointer: coarse)';

// Au doigt, un appui ouvre la visionneuse instantanement : le rectangle
// rouge n'a pas le temps de se dessiner, et Even ne voit jamais
// l'animation qu'il voit pourtant a la souris. On retient donc
// l'ouverture juste assez pour la laisser se jouer en entier.
//
// 1,5 s (la duree du trace a la souris) serait insupportable sur un
// appui. Le trace est donc accelere a 0,40 s cote CSS, et l'ouverture
// attend 0,46 s : l'animation se termine, puis la visionneuse s'ouvre.
// En dessous de ~0,3 s on ne percoit rien ; au-dela de ~0,5 s l'appui
// commence a sembler ignore.
const TACTILE_TRACE = 460;

// Joue le trace du cadre rouge, puis execute l'action. A la souris —
// ou si l'element n'a pas de cadre a dessiner — rien n'est retarde.
function tracerPuis(element, action) {
    if (!window.matchMedia(REQUETE_TACTILE).matches) { action(); return; }

    const cadre = element.closest('.frame-wrap');
    if (!cadre || !cadre.querySelector('.sketch-rect-svg')) { action(); return; }

    // Un second appui pendant l'animation ne doit pas ouvrir deux fois.
    if (cadre.dataset.traceEnCours) return;
    cadre.dataset.traceEnCours = '1';
    cadre.classList.add('trace-tactile');

    setTimeout(() => {
        cadre.classList.remove('trace-tactile');
        delete cadre.dataset.traceEnCours;
        action();
    }, TACTILE_TRACE);
}

// ─────────────────────────────────────
// TRADUCTIONS FR / EN
// ─────────────────────────────────────
const i18n = {
    fr: {
        meta_title:          "Even ANICET — Architecte d'intérieur",
        meta_desc:           "Portfolio d'Even ANICET, architecte d'intérieur diplômé de MJM Graphic Design Toulouse.",
        home_subtitle:       "Architecte d'intérieur",
        home_seeking:        "Recherche un contrat en Suisse romande",
        home_scroll:         "Défilez",
        menu_01: "ACCUEIL",  menu_02: "PROJETS", menu_03: "DESSINS",
        menu_04: "DIPLÔME",  menu_05: "HOBBIES", menu_06: "CONTACT",
        menu_deco_01: "bienvenue",
        menu_deco_02: "mes réalisations",
        menu_deco_03: "à main levée",
        menu_deco_04: "MJM Toulouse",
        menu_deco_05: "moto & perso",
        menu_deco_06: "parlons-en",
        nav_next:            "suivant",
        proj_01_title:       "PROJET 01 : DIPLÔME",
        proj_02_title:       "PROJET 02 : PATERR SUISSE",
        proj_03_title:       "PROJET 03 : À SUIVRE...",
        proj_loading:        "en cours...",
        copied:              "copié !",
        video_placeholder:   "une vidéo arrive !",
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
        legal_copyright:  "Toutes les œuvres présentées sur ce site (rendus 3D, esquisses, photographies, dessins) sont la propriété exclusive d'Even ANICET. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est strictement interdite.",
        legal_cert:       "Je certifie être l'auteur de l'ensemble des travaux et productions présentés sur ce portfolio. Les images et créations sont protégées par le droit d'auteur conformément au Code de la Propriété Intellectuelle français (articles L.111-1 et suivants).",
        legal_mentions:   "Mentions légales",
        legal_rights:     "Tous droits réservés",
        // Page Projets
        proj_title:               "PROJET 01 : DIPLÔME",
        proj_desc:                "Conception d’un complexe automobile multifonctionnel inspiré des motels américains des années 60-70. Le projet articule une station essence, un garage moto, un espace d’exposition, un bar/restaurant et un espace de pause autour d’une circulation fluide et d’une toiture servant de signalétique.",
        proj_annotation:          "→ MJM Graphic Design Toulouse — 2025",
        proj_panel_zooning:       "ZOONING ET ANALYSE",
        proj_panel_plans:         "PLANS",
        proj_panel_coupes:        "COUPES ARCHITECTURALES",
        proj_panel_3d:            "3D",
        proj_label_int:           "Intérieur",
        proj_label_immersion:     "Immersion",
        proj_label_far:           "Vue de loin",
    },
    en: {
        meta_title:          "Even ANICET — Interior Architect",
        meta_desc:           "Portfolio of Even ANICET, interior architect from MJM Graphic Design Toulouse.",
        home_subtitle:       "Interior Architect",
        home_seeking:        "Seeking a contract in French-speaking Switzerland",
        home_scroll:         "Scroll",
        menu_01: "HOME",     menu_02: "PROJECTS", menu_03: "DRAWINGS",
        menu_04: "DIPLOMA",  menu_05: "HOBBIES",  menu_06: "CONTACT",
        menu_deco_01: "welcome",
        menu_deco_02: "my work",
        menu_deco_03: "freehand",
        menu_deco_04: "MJM Toulouse",
        menu_deco_05: "moto & personal",
        menu_deco_06: "let's talk",
        nav_next:            "next",
        proj_01_title:       "PROJECT 01: DIPLOMA",
        proj_02_title:       "PROJECT 02: PATERR SUISSE",
        proj_03_title:       "PROJECT 03: COMING SOON...",
        proj_loading:        "loading...",
        copied:              "copied !",
        video_placeholder:   "video coming soon !",
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
        legal_copyright:  "All works presented on this website (3D renders, sketches, photographs, drawings) are the exclusive property of Even ANICET. Any reproduction, distribution or use without prior written authorisation is strictly prohibited.",
        legal_cert:       "I certify that I am the sole author of all works and productions presented in this portfolio. All images and creations are protected by copyright in accordance with French Intellectual Property Code (articles L.111-1 et seq.).",
        legal_mentions:   "Legal notice",
        legal_rights:     "All rights reserved",
        // Projects Page
        proj_title:               "PROJECT 01: DIPLOMA",
        proj_desc:                "Design of a multifunctional automobile complex inspired by American motels of the 60s-70s. The project brings together a petrol station, motorcycle garage, exhibition space, bar/restaurant and rest area around a fluid circulation and a roof serving as signage.",
        proj_annotation:          "→ MJM Graphic Design Toulouse — 2025",
        proj_panel_zooning:       "ZONING & ANALYSIS",
        proj_panel_plans:         "FLOOR PLANS",
        proj_panel_coupes:        "ARCHITECTURAL SECTIONS",
        proj_panel_3d:            "3D RENDERS",
        proj_label_int:           "Interior",
        proj_label_immersion:     "Immersion",
        proj_label_far:           "Wide shot",
    }
};

// ─────────────────────────────────────
// FIX Q-07 — FILET DE SECURITE CDN
// GSAP, ScrollTrigger, Lenis et PDF.js viennent de CDN externes.
// Si l'un d'eux ne repond pas, le premier appel gsap.* levait une
// erreur et TOUT le JavaScript s'arretait : site fige sur le hero,
// menu compris. Ce shim n'est installe QUE si gsap est absent ; il
// applique instantanement l'etat final de chaque animation.
// Resultat : le site reste entierement navigable, simplement sans
// transitions. Quand le CDN repond normalement, ce bloc ne fait rien.
// ─────────────────────────────────────
if (typeof window.gsap === 'undefined') {
    console.warn('[portfolio] GSAP indisponible — mode degrade sans animations.');

    const TWEEN_KEYS = ['duration', 'ease', 'delay', 'onComplete', 'onStart',
                        'onUpdate', 'stagger', 'overwrite', 'repeat', 'yoyo', 'paused'];

    const toElements = (targets) => {
        if (!targets) return [];
        if (typeof targets === 'string') return [...document.querySelectorAll(targets)];
        if (targets instanceof Element) return [targets];
        if (targets.length !== undefined) return [...targets];
        return [];
    };

    const applyVars = (targets, vars) => {
        vars = vars || {};
        toElements(targets).forEach(el => {
            if (!el || !el.style) return;
            const transform = [];
            for (const key in vars) {
                if (TWEEN_KEYS.indexOf(key) !== -1) continue;
                const v = vars[key];
                if (key === 'x')            transform.push('translateX(' + (typeof v === 'number' ? v + 'px' : v) + ')');
                else if (key === 'y')       transform.push('translateY(' + (typeof v === 'number' ? v + 'px' : v) + ')');
                else if (key === 'scale')   transform.push('scale(' + v + ')');
                else if (key === 'rotation')transform.push('rotate(' + v + 'deg)');
                else if (key === 'opacity') el.style.opacity = v;
                else if (key in el.style)   el.style[key] = typeof v === 'number' && key !== 'zIndex' ? v + 'px' : v;
            }
            if (transform.length) el.style.transform = transform.join(' ');
        });
        if (typeof vars.onComplete === 'function') {
            try { vars.onComplete(); } catch (e) { console.error(e); }
        }
        return { kill() {}, pause() {}, play() {}, progress() { return 1; } };
    };

    const chainable = () => {
        const api = {};
        ['to', 'from', 'fromTo', 'set', 'add', 'call', 'pause', 'play', 'kill', 'clear']
            .forEach(m => { api[m] = () => api; });
        return api;
    };

    window.gsap = {
        to:     (t, vars) => applyVars(t, vars),
        set:    (t, vars) => applyVars(t, vars),
        from:   (t, vars) => applyVars(t, {}),
        fromTo: (t, from, to) => applyVars(t, to),
        timeline: chainable,
        ticker: { add() {}, remove() {}, lagSmoothing() {} },
        registerPlugin() {},
        utils: { toArray: toElements }
    };
}

let currentLang = 'fr';
let currentPage = 'home';
let isMenuOpen  = false;
let lenis       = null;
let _historyInitialised = false;

// ───────────────────────────────────
// TITRES ET DESCRIPTIONS PAR PAGE
//
// Le titre d'onglet et la description ne changeaient qu'avec la LANGUE :
// toutes les pages portaient ceux de l'accueil. Quand Even colle
// even-anc.com/#projet-diplome dans une candidature, l'onglet, le favori
// et Google doivent parler de ce projet, pas du site en general.
//
// A savoir : les cartes d'apercu de Discord, LinkedIn ou WhatsApp ne
// changeront pas pour autant. Ces robots ne lisent que le HTML livre,
// sans executer le moindre script. Les faire varier par page demande un
// vrai fichier HTML par page — un autre chantier.
// ───────────────────────────────────
const META_PAGES = {
    fr: {
        'home':            ["Even ANICET — Architecte d'intérieur",
                            "Portfolio d'Even ANICET, architecte d'intérieur diplômé de MJM Graphic Design Toulouse. Recherche un contrat en Suisse romande."],
        'projects':        ["Projets — Even ANICET",
                            "Les projets d'architecture d'intérieur d'Even ANICET : conception d'espaces, plans techniques et perspectives."],
        'project-diploma': ["Projet de diplôme — Even ANICET",
                            "Complexe automobile multifonctionnel : zoning, plans de niveaux, coupes architecturales et matériauthèque. Projet de diplôme, MJM Toulouse."],
        'project-2':       ["Paterr Suisse — Even ANICET",
                            "Projet Paterr Suisse, par Even ANICET, architecte d'intérieur."],
        'project-3':       ["Projet 03 — Even ANICET",
                            "Troisième projet d'architecture d'intérieur d'Even ANICET."],
        'drawings':        ["Dessins — Even ANICET",
                            "Dessins à main levée : cartographie, étude de style au graphite, encre de Chine et bande dessinée."],
        'diploma':         ["Diplôme — Even ANICET",
                            "Titre RNCP de niveau 6 en architecture d'intérieur, MJM Graphic Design Toulouse. Équivalence 180 crédits ECTS."],
        'hobbies':         ["Hobbies — Even ANICET",
                            "Moto, projets personnels et travaux hors école d'Even ANICET."]
    },
    en: {
        'home':            ["Even ANICET — Interior Architect",
                            "Portfolio of Even ANICET, interior architect from MJM Graphic Design Toulouse. Seeking a contract in French-speaking Switzerland."],
        'projects':        ["Projects — Even ANICET",
                            "Interior architecture projects by Even ANICET: spatial design, technical drawings and perspectives."],
        'project-diploma': ["Graduation Project — Even ANICET",
                            "Multi-purpose automotive complex: zoning, floor plans, sections and material library. Graduation project, MJM Toulouse."],
        'project-2':       ["Paterr Suisse — Even ANICET",
                            "Paterr Suisse project by Even ANICET, interior architect."],
        'project-3':       ["Project 03 — Even ANICET",
                            "Third interior architecture project by Even ANICET."],
        'drawings':        ["Drawings — Even ANICET",
                            "Freehand drawings: cartography, graphite style study, Indian ink and comic art."],
        'diploma':         ["Diploma — Even ANICET",
                            "French RNCP level 6 qualification in interior architecture, MJM Graphic Design Toulouse. 180 ECTS credits."],
        'hobbies':         ["Hobbies — Even ANICET",
                            "Motorcycling, personal projects and work outside school by Even ANICET."]
    }
};

function majMetaPage(pageId) {
    const table = META_PAGES[currentLang] || META_PAGES.fr;
    const paire = table[pageId] || table['home'];
    document.title = paire[0];
    const balise = document.querySelector('meta[name="description"]');
    if (balise) balise.content = paire[1];
}

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Priorite : l'adresse (un lien partage impose sa langue), puis le
    // choix precedent du visiteur, puis la langue de son navigateur.
    const langueDemandee = new URLSearchParams(location.search).get('lang');
    const saved = localStorage.getItem('lang');
    currentLang = (langueDemandee === 'fr' || langueDemandee === 'en') ? langueDemandee
        : (saved === 'fr' || saved === 'en') ? saved
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
    initCopyEmail();

    // Révéler la page correspondant à l'adresse demandée (accueil par défaut).
    // Un fragment inconnu retombe sur l'accueil plutôt que sur une page blanche.
    const demandee = pageFromHash();
    const pageInitiale = (demandee && demandee !== 'contact') ? demandee : 'home';
    // updateHistory=false pour #contact : showPage remettrait l'adresse a
    // celle de l'accueil et effacerait le fragment, si bien qu'un
    // rafraichissement ne ramenerait plus au bloc contact.
    showPage(pageInitiale, false, demandee !== 'contact');
    if (demandee === 'contact') {
        history.replaceState({ page: 'contact' }, '', '#contact');
    }

    // Fragment inconnu (vieux lien, faute de frappe) : on est retombe sur
    // l'accueil, on nettoie aussi la barre d'adresse pour ne pas laisser
    // une adresse qui a l'air cassee.
    if (demandee === null) {
        history.replaceState({ page: 'home' }, '', location.pathname + location.search);
    }

    // Ouverture directe sur #contact : afficher l'accueil puis descendre.
    if (demandee === 'contact') {
        setTimeout(scrollToContactSection, 600);
    }

    // Boutons Précédent / Suivant du navigateur, et geste de retour sur mobile.
    // updateHistory=false : on suit l'historique, on n'y ajoute rien.
    window.addEventListener('popstate', () => {
        const cible = pageFromHash();
        if (cible === 'contact') {
            if (currentPage !== 'home') showPage('home', true, false);
            setTimeout(scrollToContactSection, currentPage === 'home' ? 100 : 750);
            return;
        }
        showPage(cible || 'home', true, false);
    });

    // Adresse modifiée à la main dans la barre du navigateur.
    window.addEventListener('hashchange', () => {
        const cible = pageFromHash();
        if (cible === null) {
            // adresse inconnue saisie a la main : repli sur l'accueil
            showPage('home', true, false);
            history.replaceState({ page: 'home' }, '', location.pathname + location.search);
            return;
        }
        if (cible !== 'contact' && cible !== currentPage) {
            showPage(cible, true, false);
        }
    });

    // CACHE-01 : cache longue durée via un service worker.
    // GitHub Pages force un cache de 10 minutes seulement, non modifiable :
    // passé ce délai un visiteur qui revient retélécharge tout. Le service
    // worker garde les médias sur son disque et les ressert instantanément.
    // Enregistré après le chargement pour ne pas concurrencer l'affichage.
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(err => {
                // Un échec ici n'a aucune conséquence : le site fonctionne
                // exactement comme avant, simplement sans cache longue durée.
                console.warn('[portfolio] cache longue durée indisponible :', err.message);
            });
        });
    }

    // PERF-04 : préparer les plans en fond, une fois l'accueil installé.
    // 2,5 s de délai pour ne pas concurrencer l'affichage initial.
    setTimeout(demarrerPrechargeFond, 2500);

    // FIX R-01 : mesurer la barre de défilement une fois la page active.
    // ResizeObserver plutôt que l'événement 'resize' seul : la barre peut
    // apparaître ou disparaître sans redimensionnement de fenêtre (contenu
    // qui grandit, images qui se chargent, rotation d'écran sur mobile).
    updateScrollbarWidth();
    if (typeof ResizeObserver !== 'undefined') {
        const sbwObserver = new ResizeObserver(() => updateScrollbarWidth());
        document.querySelectorAll('.page').forEach(pg => sbwObserver.observe(pg));
    }
    let _sbwTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(_sbwTimer);
        _sbwTimer = setTimeout(updateScrollbarWidth, 150);
    }, { passive: true });

    // Animations au scroll pour les appareils tactiles (mobile)
    // Appelé APRÈS showPage pour que is-active soit bien présent
    initScrollAnimationsMobile();

    // Animation d'entrée du hero — décalée pour laisser la page se monter
    requestAnimationFrame(() => {
        const heroWrap  = document.getElementById('hero-logo-wrap');
        const profession = document.querySelector('.hero-profession');
        const scrollInv = document.getElementById('scroll-invite');
        const showcase  = document.querySelector('.home-showcase');
        const shortcut  = document.querySelector('.home-projects-shortcut');

        if (heroWrap) {
            gsap.fromTo(heroWrap,
                { opacity: 0, y: 40, scale: 0.94 },
                { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.1 }
            );
        }
        if (profession) {
            gsap.fromTo(profession,
                { opacity: 0, y: 16, letterSpacing: '0.4em' },
                { opacity: 1, y: 0, letterSpacing: '0.25em', duration: 0.9, ease: 'power2.out', delay: 0.55 }
            );
        }
        const seeking = document.querySelector('.hero-seeking');
        if (seeking) {
            gsap.fromTo(seeking,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.85 }
            );
        }
        if (scrollInv) {
            gsap.fromTo(scrollInv,
                { opacity: 0 },
                { opacity: 0.45, duration: 0.8, delay: 1.5 }
            );
        }
        if (showcase) {
            gsap.fromTo(showcase,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.4 }
            );
        }
        if (shortcut) {
            gsap.fromTo(shortcut,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7 }
            );
        }
    });
});

// ─────────────────────────────────────
// FIX P-01c — REVEIL DES IMAGES A L'OUVERTURE D'UNE PAGE
// Les pages inactives sont en content-visibility:hidden : le navigateur
// saute entierement leur rendu, ce qui est precisement l'effet recherche
// (c'est ce qui fait tomber le chargement initial de 47,5 Mo a 1,5 Mo).
// Corollaire : le declenchement de loading="lazy" repose sur le calcul
// d'intersection, qui n'a pas lieu dans un sous-arbre non rendu. On ne
// laisse donc pas au navigateur le soin de rattraper le coup : a
// l'ouverture d'une page, on bascule explicitement SES images en
// chargement immediat. Chaque page ne charge ainsi que ses propres
// images, et seulement quand on l'ouvre.
// ─────────────────────────────────────
function hydratePageImages(pageEl) {
    if (!pageEl) return;
    pageEl.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'eager';
        // relance le telechargement si le navigateur l'avait mis de cote
        if (!img.complete || img.naturalWidth === 0) {
            const src = img.getAttribute('src');
            if (src) { img.setAttribute('src', src); }
        }
    });
}

// ─────────────────────────────────────
// FIX R-01 — LARGEUR REELLE DE LA BARRE DE DEFILEMENT
// Le footer pleine largeur utilise 100vw, qui INCLUT la barre de
// defilement de .page (4px) : il debordait donc de ~5px sur les 8
// pages, a toutes les tailles d'ecran. On mesure la valeur reelle
// (elle varie : 4px sur Chrome via ::-webkit-scrollbar, autre chose
// sur Firefox « thin », 0px sur les overlay scrollbars de macOS/mobile)
// et la CSS s'en sert via var(--sbw). Valeur de repli : 0px, ce qui
// redonne exactement le comportement d'avant.
// ─────────────────────────────────────
function updateScrollbarWidth() {
    const page = document.querySelector('.page.is-active') || document.querySelector('.page');
    if (!page) return;
    const sbw = Math.max(0, Math.round(page.offsetWidth - page.clientWidth));
    document.documentElement.style.setProperty('--sbw', sbw + 'px');
}

// ─────────────────────────────────────
// LANGUE
// ─────────────────────────────────────
function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    majMetaPage(typeof currentPage === 'string' ? currentPage : 'home');

    // La langue vit dans l'adresse : c'est ce qui permet d'envoyer un lien
    // qui s'ouvrira en anglais, et ce qui donne un sens aux balises
    // hreflang. Le francais reste l'adresse nue.
    const adresse = new URL(location.href);
    if (lang === 'en') adresse.searchParams.set('lang', 'en');
    else adresse.searchParams.delete('lang');
    if (adresse.href !== location.href) history.replaceState(history.state, '', adresse.href);

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

    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showPage('projects');
        });
    }

    // Clic sur item du menu
    document.querySelectorAll('.menu-nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const page = item.dataset.page;
            closeMenu();

            if (page === 'contact') {
                // CONTACT → aller sur la page accueil puis scroller vers le bas
                goToContact(420);
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

// ─────────────────────────────────────
// FIX Q-03 — ADRESSES PARTAGEABLES ET BOUTON RETOUR
// Avant : une seule URL pour tout le site. Le bouton Retour du
// navigateur (et le geste de retour sur mobile, le plus utilise de
// tous) faisait SORTIR du site, impossible d'envoyer un lien vers un
// projet precis, et un rafraichissement ramenait toujours a l'accueil.
//
// Routage par fragment (#dessins) et non par chemin (/dessins) : sur
// un hebergement statique comme GitHub Pages, un chemin exigerait une
// redirection via 404.html, avec un clignotement a chaque ouverture.
// Le fragment fonctionne partout, sans configuration serveur.
//
// La logique est placee DANS showPage() : les points d'appel existants
// (menu, fleches page suivante, logo, bouton retour) en beneficient
// sans etre modifies.
// ─────────────────────────────────────
const PAGE_SLUGS = {
    'home':            '',
    'projects':        'projets',
    'project-diploma': 'projet-diplome',
    'project-2':       'projet-paterr-suisse',
    'project-3':       'projet-03',
    'drawings':        'dessins',
    'diploma':         'diplome',
    'hobbies':         'hobbies',
};
const SLUG_TO_PAGE = Object.fromEntries(
    Object.entries(PAGE_SLUGS).filter(([, slug]) => slug).map(([id, slug]) => [slug, id])
);

// Lit le fragment courant. Renvoie null si l'adresse ne correspond a rien
// de connu, pour qu'un vieux lien casse retombe proprement sur l'accueil.
function pageFromHash() {
    const raw = decodeURIComponent((location.hash || '').replace(/^#/, '')).trim();
    if (!raw) return 'home';
    if (raw === 'contact') return 'contact';
    return SLUG_TO_PAGE[raw] || null;
}

function urlForPage(pageId) {
    const slug = PAGE_SLUGS[pageId];
    // location.search est conserve : sans lui, naviguer depuis /?lang=en
    // ramenait silencieusement le visiteur au francais.
    const base = location.pathname + location.search;
    return slug ? base + '#' + slug : base;
}

// Amene le visiteur au bloc Contact, en bas de la page d'accueil.
// Extrait ici parce que trois chemins y menent : le menu, les fleches
// « page suivante », et desormais l'ouverture directe sur #contact.
function scrollToContactSection() {
    const contactEl = document.getElementById('home-contact');
    if (!contactEl) return;
    if (window._lenis) {
        window._lenis.scrollTo(contactEl, { offset: -40, duration: 1.2 });
    } else {
        const homeEl = document.getElementById('page-home');
        if (homeEl) homeEl.scrollTo({ top: contactEl.offsetTop - 40, behavior: 'smooth' });
    }
}

function goToContact(outerDelay) {
    const wasOnHome = currentPage === 'home';
    setTimeout(() => {
        if (!wasOnHome) showPage('home', true);
        setTimeout(scrollToContactSection, wasOnHome ? 100 : 750);
    }, outerDelay);
    if (location.hash !== '#contact') {
        history.pushState({ page: 'contact' }, '', '#contact');
    }
}

function showPage(pageId, animate = true, updateHistory = true) {
    if (pageId === currentPage && animate) return;

    const outEl = document.getElementById(`page-${currentPage}`);
    const inEl  = document.getElementById(`page-${pageId}`);
    if (!inEl) return;

    const pageAvant = currentPage;
    currentPage = pageId;
    majMetaPage(pageId);

    // Synchronise l'adresse. replaceState au tout premier affichage pour ne
    // pas creer une entree d'historique fantome avant meme la 1re navigation.
    if (updateHistory) {
        const url = urlForPage(pageId);
        const method = _historyInitialised ? 'pushState' : 'replaceState';
        history[method]({ page: pageId }, '', url);
        _historyInitialised = true;
    }

    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        const surProjet = pageId.startsWith('project-');
        backBtn.style.display = surProjet ? 'flex' : 'none';
        // Sur telephone le bouton retour et le logo centre se chevauchent
        // (mesure : 74px de recouvrement sur un ecran de 412px). La CSS
        // s'appuie sur cette classe pour masquer le logo dans ce cas.
        document.body.classList.toggle('a-bouton-retour', surProjet);
    }

    // Détruire le Lenis de l'ancienne page
    if (lenis) { lenis.destroy(); lenis = null; }

    // FIX MEM-01 : libérer les documents PDF en quittant la page qui les porte
    if (pageAvant === 'project-diploma' && pageId !== 'project-diploma') {
        releasePdfCache();
    }

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
        
        hydratePageImages(inEl);
        // FIX P-01d : les 15 canvas PDF sont TOUS sur la page « projet diplome ».
        // Avant, ils etaient rendus depuis le hub « projets », donc pendant que
        // leur propre page etait invisible : 9 Mo telecharges pour une page pas
        // forcement ouverte, et un rendu canvas dans un sous-arbre non affiche.
        // On declenche desormais a l'ouverture reelle de la page concernee :
        // le shimmer de chargement deja prevu prend le relais.
        if (pageId === 'project-diploma') renderInlinePDFs();
        updateScrollbarWidth();
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

            hydratePageImages(inEl);
            if (pageId === 'project-diploma') renderInlinePDFs();  // voir FIX P-01d
            updateScrollbarWidth();
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

    const contentWrapper = scrollContainer.querySelector('.page-inner') || null;

    const lenisOptions = {
        wrapper: scrollContainer,
        eventsTarget: scrollContainer,  // FIX: cible le container de la page, pas le document entier
        duration: 1.0,                  // FIX: réduit de 1.15 → 1.0 pour un scroll plus réactif
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        wheelMultiplier: 1.0,           // FIX: remplace mouseMultiplier (API Lenis v2)
        touchMultiplier: 1.5,
        smoothTouch: false,
        infinite: false,
        orientation: 'vertical',
    };

    // Only set content if we found a specific wrapper
    if (contentWrapper) {
        lenisOptions.content = contentWrapper;
    }

    lenis = new Lenis(lenisOptions);

    // FIX Q-07 : garde — si le CDN GSAP/ScrollTrigger n'a pas repondu,
    // cette ligne levait une erreur et stoppait tout le JS de la page.
    if (typeof ScrollTrigger !== 'undefined') lenis.on('scroll', ScrollTrigger.update);

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
            if (nextPage === 'contact') {
                goToContact(300);
            } else if (nextPage) {
                showPage(nextPage);
            }
        });
    });
}

// Fonction pour copier l'email
function initCopyEmail() {
    document.querySelectorAll('.copy-email').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.dataset.email || this.innerText.trim();
            navigator.clipboard.writeText(email).then(() => {
                const feedback = this.nextElementSibling;
                if (feedback && feedback.classList.contains('copy-feedback')) {
                    feedback.style.opacity = '1';
                    feedback.style.transform = 'translateX(5px)';
                    setTimeout(() => {
                        feedback.style.opacity = '0';
                        feedback.style.transform = 'translateX(-10px)';
                    }, 2000);
                }
            }).catch(err => console.error('Erreur de copie', err));
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

    // FIX: Observer les changements de taille du formulaire (textarea focus) pour Lenis/ScrollTrigger
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            if (window._lenis) window._lenis.resize();
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        });
        ro.observe(form);
    }

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
        
        // Validation basique pour autoriser les emails étranges (ex: sans .com)
        if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) {
            emailEl.classList.add('fi-error'); 
            hasError = true;
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

        // Soumission AJAX à Formspree
        const formData = new FormData(form);
        const submitBtn = document.getElementById('contact-submit');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = currentLang === 'fr' ? 'ENVOI...' : 'SENDING...';
        submitBtn.style.pointerEvents = 'none';

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                const successMsg = currentLang === 'fr'
                    ? '✓ Message envoyé avec succès !'
                    : '✓ Message sent successfully!';
                feedback.textContent = successMsg;
                feedback.classList.add('form-feedback--success');
                gsap.fromTo(feedback, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4 });
                form.reset();
            } else {
                throw new Error('Network response was not ok.');
            }
        }).catch(error => {
            const errorMsg = currentLang === 'fr'
                ? 'Erreur lors de l\'envoi. Veuillez réessayer.'
                : 'Error sending message. Please try again.';
            feedback.textContent = errorMsg;
            feedback.classList.add('form-feedback--error');
            gsap.fromTo(feedback, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35 });
        }).finally(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.pointerEvents = 'auto';
            setTimeout(() => {
                feedback.textContent = '';
                feedback.classList.remove('form-feedback--success', 'form-feedback--error');
            }, 5000);
        });
    });
}


// ─────────────────────────────────────
// CARROUSEL BANDE DESSINÉE (BD)
// ─────────────────────────────────────
function initBDCarousel() {
    const containers = document.querySelectorAll('.bd-carousel-section');
    if (!containers.length) return;

    containers.forEach(container => {
        const slides = container.querySelectorAll('.bd-slide');
        if (!slides.length) return;

        const dots = container.querySelectorAll('.bd-dot');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        const playPauseBtn = container.querySelector('.bd-play-pause-btn');
        const iconPause = playPauseBtn ? playPauseBtn.querySelector('.icon-pause') : null;
        const iconPlay = playPauseBtn ? playPauseBtn.querySelector('.icon-play') : null;
        // Deux carrousels, deux jeux de noms de classes historiques :
        //   pages projet -> .progress-bar        + .bd-carousel-pagination
        //   page dessins -> .bd-progress-bar     + .bd-page-indicator
        // Le code ne connaissait que le premier jeu : sur la page dessins,
        // le compteur restait fige sur « 1 / 4 » et la barre de progression
        // ne bougeait jamais. On accepte les deux noms.
        const progressBar = container.querySelector('.progress-bar, .bd-progress-bar');
        const indicator = container.querySelector('.bd-carousel-pagination, .bd-page-indicator');

        let currentIndex = 0;
        let isPlaying = true;
        let autoplayTimeout = null;
        let progressAnimFrame = null;
        const slideDuration = 5000;
        let progressStart = performance.now();

        function updateCarousel(index) {
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;

            currentIndex = index;

            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentIndex);
            });

            if (dots.length > 0) {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }

            if (indicator) {
                indicator.textContent = `${currentIndex + 1} / ${slides.length}`;
            }

            majAutoplay();
        }


        function nextSlide() { updateCarousel(currentIndex + 1); }
        function prevSlide() { updateCarousel(currentIndex - 1); }

        function startAutoplay() {
            stopAutoplay();
            
            progressStart = performance.now();
            autoplayTimeout = setTimeout(nextSlide, slideDuration);
            
            function drawProgress(time) {
                if (!isPlaying) return;
                const elapsed = time - progressStart;
                const percent = Math.min((elapsed / slideDuration) * 100, 100);
                if (progressBar) progressBar.style.width = `${percent}%`;
                
                if (elapsed < slideDuration) {
                    progressAnimFrame = requestAnimationFrame(drawProgress);
                }
            }
            progressAnimFrame = requestAnimationFrame(drawProgress);
        }

        function stopAutoplay() {
            if (autoplayTimeout) clearTimeout(autoplayTimeout);
            if (progressAnimFrame) cancelAnimationFrame(progressAnimFrame);
            if (progressBar) progressBar.style.width = '0%';
        }

        function togglePlayPause() {
            isPlaying = !isPlaying;
            if (isPlaying) {
                if(iconPause) iconPause.style.display = 'block';
                if(iconPlay) iconPlay.style.display = 'none';
                majAutoplay();
            } else {
                if(iconPause) iconPause.style.display = 'none';
                if(iconPlay) iconPlay.style.display = 'block';
                stopAutoplay();
            }
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); });
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => { togglePlayPause(); });
        
        if (dots.length > 0) {
            dots.forEach((dot, i) => {
                dot.addEventListener('click', () => { stopAutoplay(); updateCarousel(i); });
            });
        }

        // ── Quand le carrousel a-t-il le droit de defiler ? ──────────────
        //
        // Deux conditions, et non plus une seule :
        //   la page doit etre ouverte  ET  le carrousel doit etre a l'ecran.
        //
        // Avant, il suffisait que la page soit ouverte. Le carrousel de la
        // bande dessinee se trouvant tout en bas de la page Dessins, il
        // defilait pendant qu'Even lisait le haut de la page : le temps
        // d'arriver dessus, il en etait deja a la planche 3. Meme chose sur
        // les pages projet, ou les panneaux s'enchainent.
        //
        // Une seule fonction decide desormais, et tout le monde passe par
        // elle — c'est ce qui garantit qu'on ne puisse plus laisser le
        // carrousel dans un etat fige par accident.
        const parentPage = container.closest('.page');
        let pageOuverte = !parentPage || parentPage.classList.contains('is-active');
        let aLEcran = false;

        function majAutoplay() {
            if (isPlaying && pageOuverte && aLEcran) startAutoplay();
            else stopAutoplay();
        }

        if ('IntersectionObserver' in window) {
            let observateurARepondu = false;
            new IntersectionObserver(entrees => {
                observateurARepondu = true;
                aLEcran = entrees[0].isIntersecting;
                majAutoplay();
            }, { threshold: 0.3 }).observe(container);

            // Filet de securite. Un navigateur qui gere IntersectionObserver
            // repond dans la foulee, meme pour dire « pas visible » : le
            // minuteur ne sert alors a rien. Mais si l'API existe sans
            // fonctionner, le carrousel resterait fige pour toujours — et
            // c'est precisement le defaut qu'on est en train de corriger. On
            // repasse donc en marche par defaut au bout de 4 secondes de
            // silence complet.
            setTimeout(() => {
                if (!observateurARepondu) {
                    aLEcran = true;
                    majAutoplay();
                }
            }, 4000);
        } else {
            aLEcran = true;
            majAutoplay();
        }

        if (parentPage) {
            const pageObserver = new MutationObserver(() => {
                const ouverte = parentPage.classList.contains('is-active');
                if (ouverte !== pageOuverte) {
                    pageOuverte = ouverte;
                    majAutoplay();
                }
            });
            pageObserver.observe(parentPage, { attributes: true, attributeFilter: ['class'] });
        }

        let bdTouchStartX = 0;
        const bdViewport = container.querySelector('.bd-carousel-viewport');
        if (bdViewport) {
            bdViewport.addEventListener('touchstart', e => {
                bdTouchStartX = e.changedTouches[0].clientX;
                stopAutoplay();
            }, { passive: true });
            // Le simple fait de poser le doigt coupait le defilement — et
            // rien ne le relancait. Or on pose le doigt sur l'image des qu'on
            // fait defiler la page : le carrousel restait donc fige tant
            // qu'on n'avait pas appuye sur une fleche. On relance apres
            // chaque contact qui n'etait pas un balayage.
            bdViewport.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - bdTouchStartX;
                if (Math.abs(dx) > 40) {
                    if (dx < 0) nextSlide();
                    else prevSlide();
                } else {
                    majAutoplay();
                }
            }, { passive: true });
            bdViewport.addEventListener('touchcancel', () => majAutoplay(), { passive: true });
        }
    });
}

// ─────────────────────────────────────
// RENDU PDF INLINE — LAZY + OPTIMISÉ
// Charge seulement le slide visible en premier, puis les autres en différé
// ─────────────────────────────────────
let _pdfLib = null;
let _pdfCache = {}; // Cache des documents PDF déjà chargés

// FIX MEM-01 : les documents PDF restaient ouverts indéfiniment. Mesure sur
// le site : 3 Mo de mémoire sur l'accueil, 66 Mo après ouverture de la page
// projet diplôme, et toujours 66 Mo après l'avoir quittée. Sur un téléphone
// d'entrée de gamme, c'est le seuil où le système ferme l'onglet.
//
// Les canvas déjà rendus gardent leur image : ce sont des bitmaps, ils ne
// dépendent plus du document PDF. Et comme renderSingleCanvas ignore les
// canvas marqués .pdf-loaded, revenir sur la page ne re-télécharge rien.
function releasePdfCache(essai = 0) {
    const urls = Object.keys(_pdfCache);
    if (!urls.length) return;

    // Garde-fou : si un rendu est encore en cours, detruire son document le
    // ferait echouer, et le gestionnaire d'erreur remplace alors le canvas
    // par un cadre « fichier introuvable » — definitivement. On patiente
    // plutot que de casser un rendu en vol. Au-dela de 10 essais (20 s) on
    // libere quand meme : un rendu bloque ne doit pas retenir la memoire.
    if (document.querySelector('canvas.pdf-inline-render.pdf-loading') && essai < 10) {
        setTimeout(() => releasePdfCache(essai + 1), 2000);
        return;
    }
    urls.forEach(u => {
        try {
            const doc = _pdfCache[u];
            if (doc && typeof doc.destroy === 'function') {
                Promise.resolve(doc.destroy()).catch(() => {});
            }
        } catch (e) { /* document déjà libéré */ }
    });
    _pdfCache = {};
}

async function getPdfLib() {
    if (_pdfLib) return _pdfLib;
    if (typeof pdfjsLib !== 'undefined') _pdfLib = pdfjsLib;
    else if (window.pdfjsLib) _pdfLib = window.pdfjsLib;
    if (!_pdfLib) { console.error('PDF.js non chargé.'); return null; }
    // Toujours utiliser le worker CDN correspondant à la même version que pdf.min.js
    // (version mismatch ou chemin relatif = crash silencieux sur mobile)
    _pdfLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return _pdfLib;
}

// PERF-02 : les rendus partaient tous en parallele. Sur un processeur
// modeste, lancer 4 decodages PDF simultanes sature le thread principal et
// fige la page pendant plusieurs secondes.
//
// Ordonnanceur a 2 rendus simultanes maximum : assez pour occuper la machine
// sans la saturer, et le travail total reste identique.
//
// Deux garde-fous, appris a la dure : une file strictement sequentielle se
// bloque entierement si UN rendu ne se termine jamais (fichier corrompu,
// reseau coupe). D'ou la limite de temps par element, et la reprise de la
// file quoi qu'il arrive.
const RENDUS_SIMULTANES = 2;
const DELAI_MAX_RENDU = 20000;
let _enCours = 0;
const _attente = [];

function mettreEnFile(canvas) {
    // Un canvas en attente n'a encore aucune classe d'etat : sans ce marqueur,
    // chaque balayage le remettait en file. On montait a 57 entrees pour 15
    // plans — autant de travail inutile.
    if (canvas.dataset.pdfEnFile === '1') return Promise.resolve();
    canvas.dataset.pdfEnFile = '1';
    return new Promise(resolve => {
        _attente.push({ canvas, resolve });
        depilerRendus();
    });
}

function depilerRendus() {
    while (_enCours < RENDUS_SIMULTANES && _attente.length) {
        const { canvas, resolve } = _attente.shift();
        _enCours++;
        let fini = false;
        const terminer = () => {
            if (fini) return;
            fini = true;
            _enCours--;
            resolve();
            depilerRendus();
        };
        // si un rendu s'eternise, on libere la place au lieu de bloquer tout
        const secours = setTimeout(terminer, DELAI_MAX_RENDU);
        Promise.resolve()
            .then(() => renderSingleCanvas(canvas))
            .catch(() => {})
            .finally(() => {
                clearTimeout(secours);
                // en cas d'echec, on relache le marqueur : un futur balayage
                // pourra retenter plutot que de laisser un cadre vide.
                if (!canvas.classList.contains('pdf-loaded')) delete canvas.dataset.pdfEnFile;
                terminer();
            });
    }
}

async function renderSingleCanvas(canvas) {
    if (!canvas || canvas.classList.contains('pdf-loaded') || canvas.classList.contains('pdf-loading')) return;
    canvas.classList.add('pdf-loading');

    const url = canvas.dataset.pdfUrl;
    if (!url) return;

    const pdfLib = await getPdfLib();
    if (!pdfLib) return;

    // Montrer le shimmer de chargement
    canvas.parentElement.classList.add('pdf-shimmer');

    try {
        // Utiliser le cache pour éviter de re-télécharger le même fichier
        if (!_pdfCache[url]) {
            // Charger le PDF directement via URL (streaming, compatible mobile)
        // encodeURI pour gérer les espaces et caractères spéciaux dans les noms de fichiers
        _pdfCache[url] = await pdfLib.getDocument(encodeURI(url)).promise;
        }
        const pdf = _pdfCache[url];
        const page = await pdf.getPage(1);

        // PERF-01 : l'echelle etait fixee a 1.8 quelle que soit la taille
        // d'affichage. Un plan montre en 1200px etait rendu en 2142px : 1,8x
        // plus de pixels que ce que l'ecran peut afficher, donc autant de
        // travail jete. On calcule desormais l'echelle a partir de la largeur
        // reellement occupee, multipliee par la densite de l'ecran, avec 25%
        // de marge pour rester net si le visiteur zoome au navigateur.
        // Sur un ecran retina l'echelle monte automatiquement : c'est une
        // adaptation, pas une reduction — le rendu reste net partout.
        // On mesure le CONTENEUR, pas le canvas : tant qu'il n'est pas rendu,
        // le canvas garde sa taille intrinseque par defaut (300px) et donnerait
        // une echelle trop basse. Une fois rendu il occupe 100% du conteneur,
        // c'est donc bien celui-ci qui dicte la taille d'affichage finale.
        const conteneur = canvas.parentElement;
        const largeurAffichee = conteneur ? conteneur.getBoundingClientRect().width : 0;
        const base = page.getViewport({ scale: 1 }).width;
        let thumbScale = 1.8;                       // repli si la mise en page n'est pas encore connue
        if (largeurAffichee > 50 && base > 0) {
            const dpr = window.devicePixelRatio || 1;
            thumbScale = (largeurAffichee * dpr * 1.25) / base;
            thumbScale = Math.max(0.8, Math.min(thumbScale, 3));   // bornes de securite
        }
        const viewport = page.getViewport({ scale: thumbScale });

        const cropTopPercent = parseFloat(canvas.dataset.pdfCropTop || '0');
        const cropTopPx = Math.round(viewport.height * cropTopPercent / 100);

        canvas.width  = viewport.width;
        canvas.height = (viewport.height * 0.96) - cropTopPx;
        canvas.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (cropTopPx > 0) ctx.translate(0, -cropTopPx);

        await page.render({ canvasContext: ctx, viewport, background: 'white' }).promise;

        canvas.classList.remove('pdf-loading');
        canvas.classList.add('pdf-loaded');
        canvas.parentElement.classList.remove('pdf-shimmer');

    } catch (err) {
        console.error('Erreur PDF :', url, err);
        canvas.parentElement.classList.remove('pdf-shimmer');
        canvas.classList.remove('pdf-loading');
        // Afficher un placeholder élégant en cas d'erreur
        canvas.parentElement.innerHTML = `
            <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a1a1a;color:rgba(255,255,255,0.4);font-family:var(--font-body);font-size:0.85rem;gap:8px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>${url.split('/').pop()}</span>
            </div>`;
    }
}

// PERF-03 : les 15 plans etaient tous rendus des l'ouverture de la page,
// alors que 4 seulement se trouvent pres de l'ecran — 17 millions de pixels
// dessines d'un coup, dont les trois quarts pour rien tant qu'on n'a pas
// fait defiler. On ne declenche desormais le rendu qu'a l'approche, avec
// 700px d'avance pour qu'un plan soit pret avant d'etre atteint.
// Aucune perte de qualite : c'est le meme rendu, simplement plus tard.
//
// Choix volontaire de NE PAS utiliser IntersectionObserver : il depend du
// moteur de rendu, ce qui le rend invérifiable sur banc de test et delicat
// a diagnostiquer si un plan ne s'affiche pas. Un calcul de position direct
// fait le meme travail, se teste partout, et n'a aucune dependance.
const MARGE_PRECHARGE = 700;   // px d'avance avant l'entree a l'ecran
let _balayagePdfActif = false;
let _balayageTimer = null;

function canvasProcheEcran(canvas) {
    const r = canvas.getBoundingClientRect();
    if (!r.height && !r.width) return false;
    return r.bottom > -MARGE_PRECHARGE && r.top < window.innerHeight + MARGE_PRECHARGE;
}

function balayerCanvasPdf() {
    const restants = Array.from(document.querySelectorAll(
        'canvas.pdf-inline-render:not(.pdf-loaded):not(.pdf-loading)'));
    if (!restants.length) { arreterBalayagePdf(); return; }
    restants.filter(canvasProcheEcran).forEach(c => {
        mettreEnFile(c).then(() => { if (window._lenis) window._lenis.resize(); });
    });
}

function planifierBalayage() {
    clearTimeout(_balayageTimer);
    _balayageTimer = setTimeout(balayerCanvasPdf, 120);
}

function demarrerBalayagePdf(racine) {
    balayerCanvasPdf();                       // premiere passe immediate
    if (_balayagePdfActif) return;
    _balayagePdfActif = true;
    if (racine) racine.addEventListener('scroll', planifierBalayage, { passive: true });
    window.addEventListener('resize', planifierBalayage, { passive: true });
    if (window._lenis) window._lenis.on('scroll', planifierBalayage);
    // filet : si un evenement de defilement manque a l'appel, on repasse
    // quelques fois pendant les premieres secondes.
    let essais = 0;
    const filet = setInterval(() => {
        balayerCanvasPdf();
        if (++essais >= 6) clearInterval(filet);
    }, 1000);
}

function arreterBalayagePdf() {
    clearTimeout(_balayageTimer);
}

// ─────────────────────────────────────
// PERF-04 — PRECHARGEMENT DE FOND, PENDANT LA VISITE
// Constat d'Even : en arrivant sur la page des plans, les 4 coupes du bas
// ne se dessinaient qu'apres avoir fait defiler, et ca saccadait pendant.
//
// Un visiteur ne fonce pas sur « Projets » en une seconde : il regarde
// l'accueil, cherche la navigation. On met ce temps a profit pour preparer
// les plans en fond, de sorte qu'ils soient deja prets a l'arrivee.
//
// Ordre de priorite :
//   1. les 6 visibles d'emblee (2 diapos actives du carrousel + 4 coupes)
//   2. les 9 diapos masquees, ensuite et sans se presser
//
// Trois regles pour ne JAMAIS faire saccader la page :
//   - on ne travaille que pendant les temps morts du navigateur
//     (requestIdleCallback), donc jamais en concurrence avec le visiteur ;
//   - on ne DEMARRE pas un rendu si le visiteur vient d'interagir
//     (defilement, molette, doigt) — un rendu lance ne peut plus etre
//     interrompu, il faut donc choisir le bon moment pour le lancer ;
//   - un seul rendu a la fois en fond, contre deux a la demande.
// ─────────────────────────────────────
const REPOS_APRES_INTERACTION = 450;   // ms de calme exiges avant de relancer
let _dernierGeste = 0;
let _prechargeDemarree = false;

function marquerGeste() { _dernierGeste = Date.now(); }

function ecouterGestes() {
    ['wheel', 'touchmove', 'pointerdown', 'keydown'].forEach(ev =>
        window.addEventListener(ev, marquerGeste, { passive: true }));
    document.querySelectorAll('.page').forEach(pg =>
        pg.addEventListener('scroll', marquerGeste, { passive: true }));
}

function canvasParPriorite() {
    const tous = Array.from(document.querySelectorAll('.pdf-inline-render'));
    const prioritaire = c => c.closest('.stack-item')
        || (c.closest('.bd-slide') && c.closest('.bd-slide').classList.contains('active'));
    return [...tous.filter(prioritaire), ...tous.filter(c => !prioritaire(c))];
}

function demarrerPrechargeFond() {
    if (_prechargeDemarree) return;
    _prechargeDemarree = true;
    ecouterGestes();

    // Les plans sont desormais de simples images : le prechargement se
    // resume a les demander au reseau. Le navigateur les decode ensuite
    // hors du fil principal, ce qui ne peut plus faire saccader la page.
    const liste = canvasParPriorite()
        .map(el => el.getAttribute('src'))
        .filter(Boolean);
    let i = 0;

    const planifier = (delai) => {
        const lancer = () => etape();
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(lancer, { timeout: 4000 });
        } else {
            setTimeout(lancer, delai || 250);
        }
    };

    const etape = () => {
        if (i >= liste.length) return;                       // tout est en cache
        if (document.visibilityState !== 'visible') return planifier(2000);
        if (Date.now() - _dernierGeste < REPOS_APRES_INTERACTION) return planifier(500);

        const url = liste[i++];
        const img = new Image();
        img.decoding = 'async';
        // on enchaine des que l'image est en cache, succes ou non
        img.onload = img.onerror = () => planifier(80);
        img.src = url;
    };

    planifier();
}

async function renderInlinePDFs() {
    // Trouver tous les canvas non rendus
    const allCanvases = Array.from(document.querySelectorAll('canvas.pdf-inline-render:not(.pdf-loaded):not(.pdf-loading)'));
    if (!allCanvases.length) return;

    demarrerBalayagePdf(document.querySelector('.page.is-active'));
    return;

    // PRIORITÉ 1 : Rendre d'abord les slides actifs/visibles
    const visibleCanvases = allCanvases.filter(c => {
        const slide = c.closest('.bd-slide');
        const stackItem = c.closest('.stack-item');
        // Slide actif = premier du carrousel, ou coupe (toutes visibles)
        return (slide && slide.classList.contains('active')) || stackItem || (!slide && !stackItem);
    });

    const deferredCanvases = allCanvases.filter(c => !visibleCanvases.includes(c));

    // Rendre les visibles en premier (en parallèle limitée)
    await Promise.allSettled(visibleCanvases.map(c => renderSingleCanvas(c)));

    // Rafraîchir Lenis après le premier batch
    if (window._lenis) window._lenis.resize();
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();

    // Rendre les non-visibles en différé (avec délais entre chaque pour ne pas bloquer le thread)
    for (const canvas of deferredCanvases) {
        await renderSingleCanvas(canvas);
        await new Promise(r => setTimeout(r, 80)); // respiration entre chaque
    }

    // Rafraîchir une dernière fois
    if (window._lenis) window._lenis.resize();
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}

// ─────────────────────────────────────
// CONFIGURATION ET RENDU PDF.JS DESSINS
// ─────────────────────────────────────
const allDrawings = [
    {
        url: "dessin/opt/cartographie@2x.webp",
        title: "CARTOGRAPHIE",
        desc: "Dessin technique & Relief — A4",
        orient: "portrait"
    },
    {
        url: "dessin/opt/a-la-maniere-de@2x.webp",
        title: "À LA MANIÈRE DE...",
        desc: "Étude de style & Graphite — A4",
        orient: "landscape"
    },
    {
        url: "dessin/opt/noir-et-blanc@2x.webp",
        title: "NOIR ET BLANC",
        desc: "Encre de Chine & Graphisme — A4",
        orient: "portrait"
    },
    {
        url: "dessin/opt/bd-page-1@2x.webp",
        title: "BANDE DESSINÉE — Page 1",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/opt/bd-page-2@2x.webp",
        title: "BANDE DESSINÉE — Page 2",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/opt/bd-page-3@2x.webp",
        title: "BANDE DESSINÉE — Page 3",
        desc: "A4 — Portrait",
        orient: "portrait"
    },
    {
        url: "dessin/opt/bd-page-4@2x.webp",
        title: "BANDE DESSINÉE — Page 4",
        desc: "A4 — Portrait",
        orient: "portrait"
    }
];

const diplomePlans = [
    { url: 'PDF/plan-rmoins1.pdf', title: 'Plan R-1' },
    { url: 'PDF/plan-rdc.pdf', title: 'Plan RDC' },
    { url: 'PDF/plan-r1.pdf', title: 'Plan R+1' },
    { url: 'PDF/plan-station.pdf', title: 'Zoom Station' },
    { url: 'PDF/plan-resto.pdf', title: 'Zoom Resto' },
    { url: 'PDF/plan-garage.pdf', title: 'Zoom Garage' },
    { url: 'PDF/plan-expo.pdf', title: 'Zoom Expo' }
];

const diplomeCoupes = [
    { url: 'PDF/coupe-nord-loingtaine.pdf', title: 'Coupe Lointaine' },
    { url: 'PDF/coupe-nord-texture.pdf', title: 'Coupe Nord' },
    { url: 'PDF/coupe-ouest-texture.pdf', title: 'Coupe Ouest' },
    { url: 'PDF/coupe-sud-texture.pdf', title: 'Coupe Sud' }
];

const diplomeAnalyses = [
    { url: 'PDF/plan-masse.pdf', title: 'Plan Masse' },
    { url: 'PDF/trame.pdf', title: 'Trame' },
    { url: 'PDF/zooning-batiment.pdf', title: 'Zoning Bâtiment' },
    { url: 'PDF/zooning-circulation.pdf', title: 'Zoning Circulations' }
];

const galleriesMap = {
    'plans': diplomePlans,
    'coupes': diplomeCoupes,
    'analyses': diplomeAnalyses
};

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
    let isSingleMode = false;
    let currentGallery = allDrawings;
    let maxZoom = 4;
    let currentRenderId = 0;

    function updateTransform() {
        const item = canvasWrap.querySelector('img, canvas');
        if (item) item.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        
        if (sliderRedPath && zoomRange) {
            const percent = (scale - zoomRange.min) / (zoomRange.max - zoomRange.min);
            sliderRedPath.style.strokeDashoffset = 100 - (percent * 100);
        }
    }

    // ── Créer les points indicateurs ──
    function generateDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        currentGallery.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'lb-dot' + (i === current ? ' active' : '');
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showDrawing(i);
            });
            dotsWrap.appendChild(dot);
        });
    }

    function updateDots() {
        dotsWrap.querySelectorAll('.lb-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    // ── Auto-masquage des contrôles ──
    function showControls() {
        lightbox.classList.remove('controls-hidden');
        clearTimeout(hideTimer);
        // A la souris, le moindre mouvement rappelle les commandes : les
        // masquer au bout de 2,5s est confortable. Au doigt il n'y a pas de
        // mouvement — la croix de fermeture disparaissait et le visiteur se
        // retrouvait bloque devant l'image. Sur tactile, elles restent.
        if (window.matchMedia(REQUETE_TACTILE).matches) return;
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
            if (isSingleMode) {
                counterEl.style.display = 'none';
            } else {
                counterEl.style.display = '';
                counterEl.textContent = `${index + 1} / ${currentGallery.length}`;
            }
        }

        if (isSingleMode) {
            if (dotsWrap) dotsWrap.style.display = 'none';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (dotsWrap) dotsWrap.style.display = '';
            if (prevBtn) prevBtn.style.display = '';
            if (nextBtn) nextBtn.style.display = '';
            updateDots();
        }

        // Préparer l'image
        if (canvasWrap) canvasWrap.innerHTML = '';
        if (loader) loader.classList.add('active');

        const renderId = ++currentRenderId;

        const url = isSingleMode ? index.url : currentGallery[index].url;
        const altText = isSingleMode ? (index.title || '') : currentGallery[index].title;

        const isPdf = url.toLowerCase().endsWith('.pdf');
        maxZoom = isPdf ? 10 : 4;
        if (zoomRange) {
            zoomRange.max = maxZoom;
        }

        if (isPdf) {
            // Render as PDF on a canvas
            const canvas = document.createElement('canvas');
            canvas.style.backgroundColor = '#ffffff'; // White background for PDF
            
            let pdfLib = null;
            if (window['pdfjs-dist/build/pdf']) {
                pdfLib = window['pdfjs-dist/build/pdf'];
            } else if (window.pdfjsLib) {
                pdfLib = window.pdfjsLib;
            }
            
            if (pdfLib) {
                pdfLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                
                let loadingTaskPromise;
                if (typeof pdfData !== 'undefined' && pdfData[url]) {
                    loadingTaskPromise = fetch("data:application/pdf;base64," + pdfData[url])
                        .then(res => res.arrayBuffer())
                        .then(buffer => pdfLib.getDocument({ data: buffer }).promise);
                } else {
                    loadingTaskPromise = pdfLib.getDocument(encodeURI(url)).promise;
                }
                
                // FIX MEM-02 : le document ouvert ici n'était jamais libéré.
                // On le garde le temps du rendu, puis on le relâche : le canvas
                // conserve son image, le document n'a plus d'utilité.
                let docOuvert = null;
                loadingTaskPromise.then(pdf => {
                    docOuvert = pdf;
                    return pdf.getPage(1);
                }).then(page => {
                    const pixelRatio = window.devicePixelRatio || 1;
                    // Using a higher scale for sharp rendering
                    const viewport = page.getViewport({ scale: 3.0 });
                    
                    canvas.width = viewport.width;
                    // Couper la pagination en bas (95% de la hauteur)
                    canvas.height = viewport.height * 0.95;
                    
                    const context = canvas.getContext('2d');
                    
                    // Fill canvas with white before rendering
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                        background: 'white'
                    };
                    
                    return page.render(renderContext).promise;
                }).then(() => {
                    if (renderId === currentRenderId) {
                        if (canvasWrap) {
                            canvasWrap.innerHTML = '';
                            canvasWrap.appendChild(canvas);
                        }
                        if (loader) loader.classList.remove('active');
                    }
                    if (docOuvert) {
                        Promise.resolve(docOuvert.destroy()).catch(() => {});
                        docOuvert = null;
                    }
                }).catch(err => {
                    if (docOuvert) {
                        Promise.resolve(docOuvert.destroy()).catch(() => {});
                        docOuvert = null;
                    }
                    if (renderId === currentRenderId) {
                        if (loader) loader.classList.remove('active');
                        console.error('Erreur lors du chargement du PDF:', err);
                    }
                });
            } else {
                if (loader) loader.classList.remove('active');
                console.error('pdfLib introuvable');
            }

        } else {
            // Render as standard image
            const img = document.createElement('img');
            img.src = url;
            img.alt = altText;
            img.draggable = false;
            
            img.onload = () => {
                if (renderId === currentRenderId && loader) loader.classList.remove('active');
            };
            img.onerror = () => {
                if (renderId === currentRenderId) {
                    if (loader) loader.classList.remove('active');
                    console.error("Erreur lors du chargement de l'image:", img.src);
                }
            };
            
            if (canvasWrap) {
                canvasWrap.innerHTML = '';
                canvasWrap.appendChild(img);
            }
        }

        showControls();
    }

    // ── Ouvrir / Fermer ──
    function openLightbox(index) {
        isSingleMode = false;
        lightbox.setAttribute('aria-hidden', 'false');
        if (window._lenis) window._lenis.stop();
        document.body.style.overflow = 'hidden';
        generateDots();
        showDrawing(index);
    }

    // ── API globale pour ouvrir avec une galerie spécifique ──
    window._openDrawingGallery = function(gallery, index) {
        currentGallery = gallery;
        openLightbox(index || 0);
    };

    function openSingleImage(url, title) {
        isSingleMode = true;
        lightbox.setAttribute('aria-hidden', 'false');
        if (window._lenis) window._lenis.stop();
        document.body.style.overflow = 'hidden';
        // En mode single, index = { url, title }
        showDrawing({ url, title });
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
    document.querySelectorAll('.drawing-item .frame-wrap, #page-drawings .bd-slide .drawing-sheet-wrap').forEach((item) => {
        item.addEventListener('click', () => {
            const parentItem = item.closest('.drawing-item, .bd-slide');
            if (!parentItem) return;

            const parentPage = item.closest('.page');
            if (parentPage && !parentPage.classList.contains('is-active')) return;

            if (parentItem.classList.contains('bd-slide') && !parentItem.classList.contains('active')) return;

            const allElements = Array.from(document.querySelectorAll('.drawing-item, #page-drawings .bd-slide'));
            const idx = allElements.indexOf(parentItem);
            if (idx !== -1) {
                tracerPuis(item, () => {
                    currentGallery = allDrawings;
                    openLightbox(idx);
                });
            }
        });
    });

    // ✦ ✦ Clic sur les PDF des carrousels Projets ✦ ✦
    document.querySelectorAll('.project-detail-page .bd-slide .drawing-sheet-wrap').forEach((wrap) => {
        wrap.addEventListener('click', () => {
            const parentSlide = wrap.closest('.bd-slide');
            if (parentSlide && !parentSlide.classList.contains('active')) return;

            const parentPage = wrap.closest('.page');
            if (parentPage && !parentPage.classList.contains('is-active')) return;

            // .pdf-inline-render sans prefixe : marche pour l'image comme
            // pour l'ancien canvas, si jamais il en restait un quelque part.
            const canvas = wrap.querySelector('.pdf-inline-render');
            if (canvas) {
                const url = canvas.dataset.pdfUrl;
                
                let foundGallery = null;
                let foundIndex = -1;
                for (const gallery of [diplomePlans, diplomeCoupes, diplomeAnalyses]) {
                    foundIndex = gallery.findIndex(item => item.url === url);
                    if (foundIndex !== -1) {
                        foundGallery = gallery;
                        break;
                    }
                }

                tracerPuis(wrap, () => {
                    if (foundGallery && foundIndex !== -1) {
                        currentGallery = foundGallery;
                        openLightbox(foundIndex);
                    } else {
                        openSingleImage(url, "Plan Architecture");
                    }
                });
            }
        });
    });

    // ── Clic sur le scan du diplôme (Mode image unique) ──
    document.querySelectorAll('.single-lightbox-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const src = trigger.getAttribute('src');
            const alt = trigger.getAttribute('alt');
            if (src) tracerPuis(trigger, () => openSingleImage(src, alt));
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

    // Navigation Clavier
    document.addEventListener('keydown', (e) => {
        if (lightbox.getAttribute('aria-hidden') === 'false') {
            if (e.key === 'Escape') closeLightbox();
            if (!isSingleMode) {
                if (e.key === 'ArrowRight') showDrawing((current + 1) % currentGallery.length);
                else if (e.key === 'ArrowLeft') showDrawing((current - 1 + currentGallery.length) % currentGallery.length);
            }
        }
    });

    // Boutons Suivant / Précédent
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isSingleMode) showDrawing((current - 1 + currentGallery.length) % currentGallery.length);
    });
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isSingleMode) showDrawing((current + 1) % currentGallery.length);
    });

    // Clic en dehors de l'image = fermer, clic sur l'image = zoom (si non zoomé)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lb-canvas-wrap')) {
            closeLightbox();
        } else if (e.target.tagName.toLowerCase() === 'img' || e.target.tagName.toLowerCase() === 'canvas') {
            // Au doigt, un simple appui declenchait ce zoom sans qu'on l'ait
            // demande. Sur tactile le geste naturel est le pincement, et le
            // bouton de zoom reste disponible : on reserve donc le zoom au
            // clic a la souris.
            if (window.matchMedia(REQUETE_TACTILE).matches) return;
            if (!isZoomed) toggleZoom();
        }
    });

    // ── Pan & Zoom Pointer Events ──
    if (canvasWrap) {
        canvasWrap.addEventListener('pointerdown', (e) => {
            if (!isZoomed || (e.target.tagName.toLowerCase() !== 'img' && e.target.tagName.toLowerCase() !== 'canvas')) return;
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
            
            let oldScale = scale;
            let newScale = scale + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed);
            
            if (zoomRange) {
                newScale = Math.max(parseFloat(zoomRange.min), Math.min(parseFloat(zoomRange.max), newScale));
            }
            
            if (newScale === oldScale) return;
            
            // Zoom at pointer logic
            const rect = canvasWrap.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;
            
            translateX = mouseX - (mouseX - translateX) * (newScale / oldScale);
            translateY = mouseY - (mouseY - translateY) * (newScale / oldScale);
            
            scale = newScale;
            if (zoomRange) zoomRange.value = scale;
            
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

    // ── Touch : Pinch-to-zoom et Swipe ──
    let lbTouchStartX = 0;
    let lbTouchStartY = 0;
    let initialPinchDistance = null;
    let initialPinchScale = 1;

    lightbox.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialPinchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            initialPinchScale = scale;
        } else if (e.touches.length === 1) {
            lbTouchStartX = e.touches[0].clientX;
            lbTouchStartY = e.touches[0].clientY;
        }
    }, { passive: false });

    lightbox.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialPinchDistance) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            const delta = dist / initialPinchDistance;
            
            let oldScale = scale;
            let newScale = initialPinchScale * delta;
            
            if (newScale < 1) newScale = 1;
            if (newScale > maxZoom) newScale = maxZoom;
            
            if (newScale === oldScale) return;
            
            const rect = canvasWrap.getBoundingClientRect();
            const mouseX = ((touch1.clientX + touch2.clientX) / 2) - rect.left - rect.width / 2;
            const mouseY = ((touch1.clientY + touch2.clientY) / 2) - rect.top - rect.height / 2;
            
            translateX = mouseX - (mouseX - translateX) * (newScale / oldScale);
            translateY = mouseY - (mouseY - translateY) * (newScale / oldScale);
            
            scale = newScale;
            if (zoomRange) zoomRange.value = scale;
            
            if (scale > 1.05 && !isZoomed) {
                isZoomed = true;
                lightbox.classList.add('zoomed');
            } else if (scale <= 1.05 && isZoomed) {
                isZoomed = false;
                lightbox.classList.remove('zoomed');
                translateX = 0;
                translateY = 0;
            }
            updateTransform();
        }
    }, { passive: false });

    lightbox.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialPinchDistance = null;
        }
        if (e.changedTouches.length === 1 && !initialPinchDistance) {
            const dx = e.changedTouches[0].clientX - lbTouchStartX;
            const dy = e.changedTouches[0].clientY - lbTouchStartY;
            if (!isZoomed && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                if (!isSingleMode) {
                    if (dx < 0) showDrawing((current + 1) % currentGallery.length);
                    else showDrawing((current - 1 + currentGallery.length) % currentGallery.length);
                }
            }
        }
    }, { passive: false });
}

// ─────────────────────────────────────
// ─────────────────────────────────────
// ANIMATIONS AU SCROLL — MOBILE TOUCH
// Remplace les effets de survol sur les appareils tactiles
// ─────────────────────────────────────
// Reglages du declenchement tactile — voir initScrollAnimationsMobile
const TACTILE_SEUIL  = 0.35;   // l'element doit etre franchement a l'ecran
const TACTILE_MARGE  = '0px 0px -12% 0px';
const TACTILE_DELAI  = 160;    // ms : laisse le temps de poser le regard

function initScrollAnimationsMobile() {
    const mq = window.matchMedia(REQUETE_TACTILE);
    if (!mq.matches) {
        // Le mode peut changer en cours de route : tablette dont on detache
        // le clavier, fenetre passee sur un ecran tactile. On reessaie alors
        // au lieu d'abandonner definitivement.
        const relancer = () => {
            if (mq.matches) {
                mq.removeEventListener('change', relancer);
                initScrollAnimationsMobile();
            }
        };
        mq.addEventListener('change', relancer);
        return;
    }

    // Sélecteurs à observer — même liste que les éléments animés en CSS
    const SELECTORS = [
        '.drawing-item',
        '.project-item',
        '.hc-item',
        '.ci-block',
        '.fg',
        '.notebook-section',
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
                const el = entry.target;
                if (entry.isIntersecting) {
                    // Micro-delai avant de declencher : si le visiteur fait
                    // defiler vite, l'animation est annulee plutot que de
                    // clignoter au passage. S'il s'arrete, elle demarre sous
                    // ses yeux — c'est l'equivalent tactile du survol.
                    if (el._minuteurVue) return;
                    el._minuteurVue = setTimeout(() => {
                        el.classList.add('is-inview');
                        el._minuteurVue = null;
                    }, TACTILE_DELAI);
                } else {
                    // Sorti de l'ecran : on annule un declenchement en attente
                    // et on retire l'etat, pour que l'element rejoue son
                    // animation au prochain passage — comme un survol repete.
                    if (el._minuteurVue) {
                        clearTimeout(el._minuteurVue);
                        el._minuteurVue = null;
                    }
                    el.classList.remove('is-inview');
                }
            });
        }, {
            // Seuil releve : a 0,05 l'animation partait alors que l'element
            // affleurait a peine le bas de l'ecran, souvent hors du regard.
            threshold: TACTILE_SEUIL,
            rootMargin: TACTILE_MARGE
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

/* ==========================================================================
   COUPE CLICK → Open in Drawing Lightbox (reuses the same viewer)
   ========================================================================== */
(function initCoupeClicks() {
    const coupeItems = document.querySelectorAll('[data-coupe-gallery] .stack-item[data-coupe-index]');
    if (!coupeItems.length) return;

    coupeItems.forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.getAttribute('data-coupe-index'), 10);
            // Use the drawing lightbox with diplomeCoupes gallery
            if (typeof window._openDrawingGallery === 'function') {
                tracerPuis(item, () => window._openDrawingGallery(diplomeCoupes, idx));
            }
        });
    });
})();

/* --- FAVICON ANIMATION (CANVAS BASED) --- */
(function animateFavicon() {
    const favicon = document.getElementById('favicon');
    if (!favicon) return;
    
    // Attendre que la police soit chargée
    document.fonts.ready.then(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        const frames = [];
        const transforms = [
            { r: -0.01, x: -3, y: -1, s: 1.02 },
            { r: 0.01,  x:  2, y:  1,  s: 0.98 },
            { r: 0,     x: -1, y: 0, s: 1.0 }
        ];

        for (let i = 0; i < 3; i++) {
            ctx.clearRect(0, 0, 100, 100);
            
            // Fond noir arrondi
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(0, 0, 100, 100, 25);
            } else {
                ctx.rect(0, 0, 100, 100); // Fallback
            }
            ctx.fill();
            
            // Texte E
            ctx.save();
            ctx.translate(50, 50);
            ctx.rotate(transforms[i].r);
            ctx.scale(transforms[i].s, transforms[i].s);
            ctx.translate(transforms[i].x, transforms[i].y);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "105px 'Skribblugh', cursive";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("E", 0, 15); // Offset X et Y pour centrer parfaitement la lettre
            
            ctx.restore();
            
            frames.push(canvas.toDataURL('image/png'));
        }

        // FIX Q-02 : la boucle tournait a 8 img/s indefiniment, y compris
        // onglet en arriere-plan (batterie mobile + main thread reveille en
        // permanence). Elle est desormais suspendue des que l'onglet n'est
        // plus visible, et desactivee si l'utilisateur demande moins d'animation.
        // Comportement a l'ecran, onglet au premier plan : strictement identique.
        const reduceMotion = window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let currentFrame = 0;
        let faviconTimer = null;

        const stepFavicon = () => {
            favicon.href = frames[currentFrame];
            currentFrame = (currentFrame + 1) % 3;
        };

        const startFavicon = () => {
            if (faviconTimer !== null || reduceMotion) return;
            faviconTimer = setInterval(stepFavicon, 120);
        };
        const stopFavicon = () => {
            if (faviconTimer === null) return;
            clearInterval(faviconTimer);
            faviconTimer = null;
        };

        document.addEventListener('visibilitychange', () => {
            document.visibilityState === 'visible' ? startFavicon() : stopFavicon();
        });

        if (reduceMotion) {
            favicon.href = frames[0];   // une frame fixe, pas d'animation
        } else if (document.visibilityState === 'visible') {
            startFavicon();
        }
    });
})();
