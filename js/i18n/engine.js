/**
 * I18n Translation Engine
 * Loads JSON dictionaries and translates all elements with `data-i18n`
 */
export class TranslationEngine {
    constructor(defaultLang = 'en') {
        let storedLang = null;
        try {
            storedLang = localStorage.getItem('site_lang');
        } catch (e) {
            console.warn('localStorage is blocked or unavailable.');
        }
        this.currentLang = storedLang || defaultLang;
        this.dictionary = {};
    }

    async init() {
        await this.loadDictionary(this.currentLang);
        this.translateDOM();
        this.bindSwitchers();
        this.updateSwitcherUI();
    }

    async loadDictionary(lang) {
        try {
            const response = await fetch(`/locales/${lang}.json?t=${Date.now()}`);
            if (response.ok) {
                this.dictionary = await response.json();
                this.currentLang = lang;
                try {
                    localStorage.setItem('site_lang', lang);
                } catch (e) { }
                document.documentElement.lang = lang;
            } else {
                console.error(`Missing dictionary for ${lang}`);
            }
        } catch (e) {
            console.error(`Error loading dictionary:`, e);
        }
    }

    translateDOM(container = document) {
        const elements = container.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.dictionary[key]) {
                // If it's an input/textarea with a placeholder
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = this.dictionary[key];
                } else {
                    el.textContent = this.dictionary[key];
                }
            }
        });

        // Translate component loading logic if necessary, though it primarily works on injected DOM
    }

    bindSwitchers() {
        const options = document.querySelectorAll('.lang-switch__option');
        options.forEach(option => {
            // Remove old listener to avoid duplicates on re-render
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);

            newOption.addEventListener('click', async (e) => {
                const lang = newOption.getAttribute('data-lang');
                if (lang !== this.currentLang) {
                    await this.loadDictionary(lang);
                    this.translateDOM();
                    this.updateSwitcherUI();
                }

                // Close dropdown via CSS hack or logic if needed
                const btn = newOption.closest('.lang-switch').querySelector('.lang-switch__btn');
                btn.focus();
                btn.blur();
            });
        });
    }

    updateSwitcherUI() {
        const currentFlags = document.querySelectorAll('.lang-switch__current');
        currentFlags.forEach(el => {
            el.textContent = this.currentLang.toUpperCase();
        });
    }
}

// Create a singleton instance
export const i18n = new TranslationEngine();
