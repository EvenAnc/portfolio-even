/**
 * Header: logo visibility and the back button shown on project pages.
 */

/**
 * On the home page the hero shows the logo, so the header one stays hidden
 * until the hero scrolls away.
 * @param {string} pageId
 */
export function updateHeaderLogo(pageId) {
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) headerLogo.classList.toggle('is-visible', pageId !== 'home');
}

/**
 * Shows the back button on project pages only.
 * @param {string} pageId
 */
export function updateBackButton(pageId) {
    // The stylesheet shows the button on this class and, on phones, hides
    // the centred logo it would overlap.
    document.body.classList.toggle('has-back-button', pageId.startsWith('project-'));
}
