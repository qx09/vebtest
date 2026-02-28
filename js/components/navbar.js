// Mobile menu toggle logic
const initNavbar = () => {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const linksMenu = document.getElementById('navbar-links-menu');

    if (toggleBtn && linksMenu) {
        if (!toggleBtn.dataset.bound) {
            toggleBtn.addEventListener('click', () => {
                linksMenu.classList.toggle('is-open');
            });
            toggleBtn.dataset.bound = "true";
        }
    }

    // Auto-close menu on hash change
    window.addEventListener('hashchange', () => {
        if (linksMenu) linksMenu.classList.remove('is-open');
    });
};

initNavbar();
document.addEventListener('componentsLoaded', initNavbar);
