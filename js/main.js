import { loadComponents } from './utils/component-loader.js?v=7';
import { i18n } from './i18n/engine.js?v=7';
import './components/navbar.js?v=7';

const initApp = async () => {
    console.log('Initializing Mashzavod Architecture...');
    try {
        await i18n.init();
    } catch (error) {
        console.warn('Silent failure in i18n.', error);
    }

    // Load initial global components first (Navbar, Footer, etc.)
    try {
        await loadComponents(document);
    } catch (e) {
        console.error('Failure in global component load:', e);
    }

    // Hash Router
    const handleHashRouter = async () => {
        const hash = window.location.hash || '#/pages/home.html';
        const targetFile = hash.slice(1);
        const appRoot = document.getElementById('app-root');

        if (appRoot) {
            appRoot.innerHTML = `<div data-include="${targetFile}"></div>`;
            await loadComponents(appRoot);
            i18n.translateDOM(appRoot);
            window.scrollTo(0, 0);
        }
    };

    window.addEventListener('hashchange', handleHashRouter);
    await handleHashRouter();

    console.log('All components and routes loaded.');
    document.dispatchEvent(new Event('componentsLoaded'));
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

document.addEventListener('componentsLoaded', () => {
    i18n.translateDOM(document);
    i18n.bindSwitchers();
});
