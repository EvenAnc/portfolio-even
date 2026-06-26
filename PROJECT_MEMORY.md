# PROJECT MEMORY - ANTIGRAVITY INSTANCE HANDOVER

## 1. DIRECTION ARTISTIQUE & ADN VISUEL
- **Style Visuel** : "Croquis / Fait main / Crayon à papier". Le portfolio est conçu comme un carnet de croquis organique, brut et interactif.
- **Codes Hexadécimaux** :
  - **Fond Noir ("Feuille Ardoise")** : `#1a1a1a`
  - **Blanc des tracés** : `#FFFFFF`
  - **Rouge d'accentuation ("Marqueur Fallout")** : `#FF364A` (utilisé pour les annotations, cadres de survol, épingles, etc.).
- **Philosophie & Motion Design** :
  - **Refus de la perfection** : Le Web lisse est banni. Les lignes droites sont déformées.
  - **Animation "Flipbook" / Stop-motion** : Les éléments dessinés doivent donner l'illusion d'avoir été gribouillés à la main (effet "boiling line"). Les animations doivent avoir un aspect saccadé (utilisation de `steps()` plutôt que `ease-in-out` fluide).
  - **Micro-interactions physiques** : Les annotations et repères apparaissent de manière abrupte ou avec un rebond sec (comme une épingle qui se plante).

## 2. STACK TECHNIQUE & LOGIQUE DE CODE
- **Core** : HTML / CSS Vanilla / JS pur. Aucun build step, aucun framework, pas de Tailwind.
- **Manipulation CSS Experte** :
  - **Animation 3-Frames** : Codée en CSS pur (ex: les flèches du carrousel BD) en basculant l'opacité de 3 tracés SVG différents (classes `.sketch-f1`, `.sketch-f2`, `.sketch-f3`) en boucle pour créer un effet de redessin permanent.
  - **Positionnement Absolu** : Utilisation intensive de `position: absolute` et `z-index` pour superposer la logique de carnet : le fond, l'œuvre, puis la couche d'annotations / UI par-dessus.
- **Le Secret des SVG Texturés** :
  - Tous les bords (cadre "Polaroid", cadres de dessins) et bordures arrachées utilisent des filtres SVG inline `<feTurbulence>` et `<feDisplacementMap>`.
  - Ces filtres (ex: `#paper-tear`, `#sketch-1`) déforment procéduralement les vecteurs en temps réel pour leur donner un aspect de crayon qui bave ou de papier déchiré, sans alourdir la page avec d'immenses PNG.
- **Arborescence** :
  - `index.html` : Squelette et injection des filtres SVG dans un bloc `<defs>`.
  - `css/style.css` : Moteur principal du design et des animations de survol.
  - `js/app.js` : Logiques d'UI complexes (Lightbox sur-mesure, gestion du carrousel horizontal, curseur custom).
  - `fonts/` : Typographies brutes (`Skribblugh`).

## 3. ANTI-PATTERNS (CE QUE JE REFUSE STRICTEMENT)
- **Le syndrome "Agence Web 2024"** : Interdit de mettre du Material Design, du Flat Design lisse, des ombres douces ou des dégradés.
- **Animations molles** : Pas de `transition: all 0.3s ease` sur des éléments dessinés. Le trait doit être nerveux.
- **La sur-optimisation destructrice** : L'utilisation de `will-change: transform` sur la galerie d'images a causé du flou de rastérisation au survol sur Chrome. Ça a été identifié et banni. La netteté de l'œuvre prime.
- **Code intrusif** : Interdiction absolue de "nettoyer" ou de réécrire une animation fonctionnelle sans mon accord. Exemple : L'animation "3 frames" testée sur la grande ligne de séparation horizontale a été jugée moche et annulée. La ligne de séparation DOIT rester un trait irrégulier **statique**.

## 4. ÉTAT DES LIEUX DU PROJET (INVENTAIRE COMPLET)
**100% Finalisé & Intouchable :**
- **Header & Menu Burger** : Navigation "rough", typographie agressive.
- **Galerie des Projets ("MES PROJETS")** : 
  - Grille fonctionnelle. Au survol, l'œuvre visée s'agrandit (`scale(1.08)`) avec une **netteté parfaite** et passe au premier plan. Les autres œuvres de la grille sont floutées (`blur(4px)`), grisées et estompées.
  - Un cadre rouge dessiné à la main (`.sketch-rect-svg`) s'anime autour du dessin survolé (effet d'écriture via `stroke-dashoffset`).
- **Annotations Spécifiques (Galerie)** :
  - **Cartographie** : Au survol, une épingle rouge dessinée se plante exactement au centre (sur le pont, `top: 42%`) avec un rebond, et l'annotation "TOULOUSE" manuscrite apparaît.
  - **Noir & Blanc** : Au survol, une photo de référence apparaît façon *Polaroid* (image carrée parfaite, bordure blanche épaisse en bas, bords externes arrachés par le filtre SVG) avec une flèche rouge pointant vers l'œuvre.
- **La Lightbox (Galerie Plein Écran)** :
  - UI custom (Logo "EVEN ANICET" en haut, compteur de type "3 / 7").
  - Espacements (padding) sécurisés de 130px en haut de l'écran pour empêcher les dessins au format *Portrait* de venir chevaucher les textes de la Lightbox.
- **Section Bande Dessinée ("Fallout")** :
  - Ligne de séparation au-dessus de la section : *statique*, tracée à la main.
  - Placement du titre FALLOUT décalé vers le haut, laissant la page de bande dessinée au premier plan et non coupée.
  - Flèches de navigation du carrousel (`.bd-nav-btn`) animées en "3 frames" stop-motion, sans aucune bordure numérique.
  - Conteneur de l'animation d'explosion (`.animation-explosion-detail`) prêt et paramétré (positionné à -40px, tourné à 45°, scale(1.15)).

**Chantiers en cours / À faire :**
- L'animation de l'explosion "Fallout" : Le CSS est prêt (`background-position`, `steps()`), on attend que je fournisse ma propre Sprite Sheet dessinée à la main pour l'injecter.
- Poursuite de la construction du portfolio en respectant ce cahier des charges de manière fanatique.

## 5. MODUS OPERANDI (Ma Méthode de Travail)
- **Profil** : Très exigeant, vision esthétique inflexible, très attentif aux détails techniques du front-end.
- **Ton exigé de l'IA** :
  - Droit au but. Zéro blabla, zéro intro mielleuse, zéro brosse à reluire ("C'est une super idée"). Des réponses de développeur front-end senior.
- **Censure Active** : 
  - L'IA a un devoir de conseil technique agressif. Si je propose une idée qui va ralentir le navigateur, rendre le code instable, ou qui va à l'encontre de la charte "fait main" (ex: un effet générique de base), **l'IA doit me contredire immédiatement** et imposer l'alternative puriste.
  - L'IA doit toujours comprendre le "pourquoi" derrière un bout de CSS avant de le toucher.
