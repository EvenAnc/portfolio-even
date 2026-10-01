/**
 * Header: logo visibility and the back button shown on project pages.
 */

// ─────────────────────────────────────
// LOGO BANDEAU — APPARAÎT AU SCROLL SUR HOME
// ─────────────────────────────────────
export function updateHeaderLogo(pageId) {
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

export function updateBackButton(pageId) {
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        const surProjet = pageId.startsWith('project-');
        backBtn.style.display = surProjet ? 'flex' : 'none';
        // Sur telephone le bouton retour et le logo centre se chevauchent
        // (mesure : 74px de recouvrement sur un ecran de 412px). La CSS
        // s'appuie sur cette classe pour masquer le logo dans ce cas.
        document.body.classList.toggle('a-bouton-retour', surProjet);
    }
}
