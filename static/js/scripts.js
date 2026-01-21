const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'news', 'awards', 'experience', 'publications'];

// Language configuration
const LANGUAGE = {
    current: 'en',
    available: ['en', 'zh'],
    paramName: 'lang'
};

// Navigation items translations
const NAV_I18N = {
    en: {
        home: 'HOME',
        blog: 'BLOG',
        news: 'NEWS',
        awards: 'AWARDS',
        experience: 'EXPERIENCE',
        publications: 'PUBLICATIONS'
    },
    zh: {
        home: '首页',
        blog: '博客',
        news: '新闻',
        awards: '荣誉',
        experience: '经历',
        publications: '发表论文'
    }
};

// Get language from URL, localStorage, or browser
function getLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(LANGUAGE.paramName)) {
        const lang = urlParams.get(LANGUAGE.paramName);
        if (LANGUAGE.available.includes(lang)) {
            return lang;
        }
    }

    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && LANGUAGE.available.includes(savedLang)) {
        return savedLang;
    }

    const browserLang = navigator.language.slice(0, 2);
    if (LANGUAGE.available.includes(browserLang)) {
        return browserLang;
    }

    return 'en';
}

// Set language and update URL
function setLanguage(lang) {
    LANGUAGE.current = lang;
    localStorage.setItem('preferredLanguage', lang);

    const url = new URL(window.location);
    url.searchParams.set(LANGUAGE.paramName, lang);
    window.history.replaceState({}, '', url);

    renderLanguageSwitcher();
    loadContent();
}

// Render language switcher button
function renderLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
        const currentLang = LANGUAGE.current;
        const otherLang = currentLang === 'en' ? 'zh' : 'en';
        const currentFlag = currentLang === 'en' ? '🇺🇸' : '🇨🇳';
        const otherFlag = otherLang === 'en' ? '🇺🇸' : '🇨🇳';

        switcher.innerHTML = `
            <button class="btn btn-outline-light btn-sm language-btn" onclick="setLanguage('${otherLang}')">
                ${currentFlag} ${currentLang.toUpperCase()}
            </button>
        `;
    }
}

// Translate navigation items
function translateNavigation() {
    const lang = LANGUAGE.current;
    const navItems = document.querySelectorAll('#navbarResponsive .nav-link');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        const sectionId = href.replace('#', '').replace('.html', '');

        if (NAV_I18N[lang][sectionId]) {
            item.textContent = NAV_I18N[lang][sectionId];
        }
    });

    // Update menu button text
    const menuBtn = document.querySelector('.navbar-toggler');
    if (menuBtn) {
        const menuText = menuBtn.childNodes[0];
        if (menuText.nodeType === Node.TEXT_NODE) {
            menuText.textContent = lang === 'zh' ? '菜单' : 'MENU';
        }
    }
}

// Translate section titles
function translateSectionTitles() {
    const lang = LANGUAGE.current;
    const sectionTitles = {
        'news': { en: 'NEWS', zh: '新闻' },
        'awards': { en: 'AWARDS', zh: '荣誉' },
        'experience': { en: 'EXPERIENCE', zh: '经历' },
        'publications': { en: 'PUBLICATIONS', zh: '发表论文' }
    };

    Object.keys(sectionTitles).forEach(section => {
        const subtitle = document.getElementById(`${section}-subtitle`);
        if (subtitle) {
            const icon = subtitle.querySelector('i');
            const iconClass = icon ? icon.className : '';
            const iconHtml = iconClass ? `<i class="${iconClass}"></i>` : '';

            subtitle.innerHTML = `${iconHtml} ${sectionTitles[section][lang]}`;
        }
    });
}

window.addEventListener('DOMContentLoaded', event => {

    // Initialize language
    LANGUAGE.current = getLanguage();
    setLanguage(LANGUAGE.current);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

// Load content based on current language
function loadContent() {
    const lang = LANGUAGE.current;
    const langContentDir = content_dir + lang + '/';

    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    const value = yml[key];
                    // Handle multi-language values
                    if (typeof value === 'object' && value[lang]) {
                        document.getElementById(key).innerHTML = value[lang];
                    } else if (typeof value === 'string') {
                        document.getElementById(key).innerHTML = value;
                    }
                } catch {
                    console.log("Unknown id and value: " + key);
                }
            });
        })
        .catch(error => console.log(error));

    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(langContentDir + name + '.md')
            .then(response => {
                if (!response.ok) {
                    console.log(`Failed to load ${langContentDir}${name}.md`);
                    return '';
                }
                return response.text();
            })
            .then(markdown => {
                if (markdown) {
                    const html = marked.parse(markdown);
                    document.getElementById(name + '-md').innerHTML = html;
                }
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    });

    // Translate UI elements
    translateNavigation();
    translateSectionTitles();
}

// Make setLanguage available globally
window.setLanguage = setLanguage;
