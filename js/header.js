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
    const backBtn = document.getElementById('header-back-btn');
    if (!backBtn) return;
    const isProjectPage = pageId.startsWith('project-');
    backBtn.style.display = isProjectPage ? 'flex' : 'none';
    // On phones the back button and the centred logo overlap: the
    // stylesheet hides the logo when this class is set.
    document.body.classList.toggle('has-back-button', isProjectPage);
}
