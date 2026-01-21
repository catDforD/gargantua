const BLOG_CONFIG = {
    contentDir: 'contents/blog/',
    articlesFile: 'articles.yml'
};

// Language configuration
const LANGUAGE = {
    current: 'en',
    available: ['en', 'zh'],
    paramName: 'lang'
};

// Blog UI translations
const BLOG_I18N = {
    en: {
        blogTitle: 'Blog',
        blogSubtitle: 'Technical Notes · Thoughts · Share',
        articlesCount: 'articles',
        tagsCount: 'tags',
        filterTitle: 'Filter',
        categoryLabel: 'Category',
        categoryAll: 'All categories',
        tagSearchLabel: 'Tag search',
        tagSearchPlaceholder: 'Enter tag name...',
        sortLabel: 'Sort by',
        sortDateDesc: 'Date (newest first)',
        sortDateAsc: 'Date (oldest first)',
        sortTitle: 'Title',
        noArticles: 'No articles found.',
        loading: 'Loading articles...',
        readMore: 'Read more',
        breadcrumbHome: 'Home',
        backToList: 'Back to article list',
        loadFailed: 'Failed to load articles. Please try again.'
    },
    zh: {
        blogTitle: '博客',
        blogSubtitle: '技术笔记 · 生活随笔 · 思考与分享',
        articlesCount: '篇文章',
        tagsCount: '个标签',
        filterTitle: '筛选',
        categoryLabel: '分类',
        categoryAll: '所有分类',
        tagSearchLabel: '标签搜索',
        tagSearchPlaceholder: '输入标签名称...',
        sortLabel: '排序方式',
        sortDateDesc: '按日期（最新优先）',
        sortDateAsc: '按日期（最早优先）',
        sortTitle: '按标题',
        noArticles: '没有找到匹配的文章。',
        loading: '加载文章中...',
        readMore: '阅读全文',
        breadcrumbHome: '首页',
        backToList: '返回文章列表',
        loadFailed: '加载文章失败，请稍后重试。'
    }
};

let allArticles = [];
let filteredArticles = [];

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
    renderBlogUI();
}

// Render language switcher button
function renderLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
        const currentLang = LANGUAGE.current;
        const otherLang = currentLang === 'en' ? 'zh' : 'en';
        const currentFlag = currentLang === 'en' ? '🇺🇸' : '🇨🇳';

        switcher.innerHTML = `
            <button class="btn btn-outline-light btn-sm language-btn" onclick="setLanguage('${otherLang}')">
                ${currentFlag} ${currentLang.toUpperCase()}
            </button>
        `;
    }
}

// Translate blog UI
function translateBlogUI() {
    const lang = LANGUAGE.current;
    const t = BLOG_I18N[lang];

    // Blog header
    const blogTitle = document.querySelector('.blog-header-content h1');
    if (blogTitle) blogTitle.textContent = t.blogTitle;

    const blogSubtitle = document.querySelector('.blog-header-content p');
    if (blogSubtitle) blogSubtitle.textContent = t.blogSubtitle;

    // Stats badges
    const articleCount = document.querySelector('#article-count');
    const tagCount = document.querySelector('#tag-count');
    if (articleCount) articleCount.textContent = allArticles.length;
    if (tagCount) {
        const allTags = [...new Set(allArticles.flatMap(a => a.tags))];
        tagCount.textContent = allTags.length;
    }

    // Sidebar
    const filterTitle = document.querySelector('.card-title');
    if (filterTitle) filterTitle.textContent = t.filterTitle;

    const categoryLabel = document.querySelector('#category-filter + label');
    if (categoryLabel) categoryLabel.textContent = t.categoryLabel;

    const categoryOptions = document.querySelectorAll('#category-filter option');
    categoryOptions[0].textContent = t.categoryAll;

    const tagSearchLabel = document.querySelector('#tag-search + label');
    if (tagSearchLabel) tagSearchLabel.textContent = t.tagSearchLabel;
    document.getElementById('tag-search').placeholder = t.tagSearchPlaceholder;

    const sortLabel = document.querySelector('#sort-order + label');
    if (sortLabel) sortLabel.textContent = t.sortLabel;

    const sortOptions = document.querySelectorAll('#sort-order option');
    sortOptions[0].textContent = t.sortDateDesc;
    sortOptions[1].textContent = t.sortDateAsc;
    sortOptions[2].textContent = t.sortTitle;

    // Loading state
    const loadingText = document.querySelector('.spinner-border + p');
    if (loadingText) loadingText.textContent = t.loading;

    // Back button
    const backBtn = document.querySelector('.article-footer-nav .btn');
    if (backBtn) {
        backBtn.innerHTML = `<i class="bi bi-arrow-left"></i> ${t.backToList}`;
    }
}

// Render blog UI elements
function renderBlogUI() {
    updateHeaderStats();
    translateBlogUI();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize language
    LANGUAGE.current = getLanguage();

    // Render language switcher
    renderLanguageSwitcher();

    try {
        await loadArticlesIndex();
        renderCategoryFilter();
        renderArticles();
        bindEvents();
        handleRoute();
        renderBlogUI();
    } catch (error) {
        console.error('博客加载失败:', error);
        document.getElementById('articles-container').innerHTML =
            `<div class="col-12"><div class="alert alert-danger">${BLOG_I18N[LANGUAGE.current].loadFailed}</div></div>`;
    }
});

// Routing
function handleRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#article/')) {
        const articleId = hash.replace('#article/', '');
        showArticleDetail(articleId);
    } else {
        showArticleList();
    }
}

// Listen for hash changes
window.addEventListener('hashchange', handleRoute);

// Show article list
function showArticleList() {
    document.getElementById('article-list-view').classList.remove('d-none');
    document.getElementById('article-detail-view').classList.add('d-none');
    window.scrollTo(0, 0);
}

// Show article detail
async function showArticleDetail(articleId) {
    const article = allArticles.find(a => a.id === articleId);
    if (!article) {
        window.location.hash = '';
        return;
    }

    const lang = LANGUAGE.current;
    const t = BLOG_I18N[lang];

    try {
        // Hide list, show detail
        document.getElementById('article-list-view').classList.add('d-none');
        document.getElementById('article-detail-view').classList.remove('d-none');

        // Update breadcrumb
        document.querySelector('.breadcrumb-item a').innerHTML = `<i class="bi bi-house"></i> ${t.breadcrumbHome}`;
        document.getElementById('breadcrumb-category').textContent = article.category;
        document.getElementById('breadcrumb-title').textContent = article.title;

        // Update article info
        document.getElementById('detail-title').textContent = article.title;
        document.getElementById('detail-category').innerHTML = `<i class="bi bi-folder"></i> ${article.category}`;
        document.getElementById('detail-date').innerHTML = `<i class="bi bi-calendar3"></i> ${formatDate(article.date)}`;

        // Render tags
        const tagsContainer = document.getElementById('detail-tags');
        tagsContainer.innerHTML = article.tags.map(tag =>
            `<span class="article-tag">${tag}</span>`
        ).join('');

        // Load article content
        const response = await fetch(BLOG_CONFIG.contentDir + article.file);
        const markdown = await response.text();
        const html = marked.parse(markdown);
        document.getElementById('detail-content').innerHTML = html;

        // Render math formulas
        setTimeout(() => {
            MathJax.typeset();
        }, 100);

        window.scrollTo(0, 0);

    } catch (error) {
        console.error('加载文章失败:', error);
        window.location.hash = '';
    }
}

async function loadArticlesIndex() {
    const response = await fetch(BLOG_CONFIG.contentDir + BLOG_CONFIG.articlesFile);
    const text = await response.text();
    const data = jsyaml.load(text);
    allArticles = data.articles;
    filteredArticles = [...allArticles];
}

function updateHeaderStats() {
    const articleCount = allArticles.length;
    const allTags = [...new Set(allArticles.flatMap(a => a.tags))];
    const tagCount = allTags.length;

    const articleCountEl = document.getElementById('article-count');
    const tagCountEl = document.getElementById('tag-count');

    if (articleCountEl) articleCountEl.textContent = articleCount;
    if (tagCountEl) tagCountEl.textContent = tagCount;
}

function renderCategoryFilter() {
    const categories = [...new Set(allArticles.map(a => a.category))];
    const select = document.getElementById('category-filter');

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function renderArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    const t = BLOG_I18N[LANGUAGE.current];

    if (filteredArticles.length === 0) {
        container.innerHTML = `<div class="col-12"><div class="alert alert-info">${t.noArticles}</div></div>`;
        return;
    }

    filteredArticles.forEach(article => {
        const card = createArticleCard(article);
        container.appendChild(card);
    });
}

function createArticleCard(article) {
    const col = document.createElement('div');
    col.className = 'col-12 mb-4';
    const t = BLOG_I18N[LANGUAGE.current];

    col.innerHTML = `
        <div class="card blog-card h-100 shadow-sm" onclick="viewArticle('${article.id}')">
            <div class="card-body">
                <div class="article-card-meta mb-2">
                    <span class="article-card-category">${article.category}</span>
                    <span class="article-card-date">${formatDate(article.date)}</span>
                </div>
                <h5 class="card-title text-primary">${article.title}</h5>
                <p class="card-text text-secondary">${article.summary}</p>
                <div class="article-card-tags">
                    ${article.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
                <div class="text-end mt-3">
                    <span class="read-more">${t.readMore} <i class="bi bi-arrow-right"></i></span>
                </div>
            </div>
        </div>
    `;

    return col;
}

function viewArticle(articleId) {
    window.location.hash = `article/${articleId}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const lang = LANGUAGE.current;
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function filterAndSearch() {
    const category = document.getElementById('category-filter').value;
    const tagSearch = document.getElementById('tag-search').value.toLowerCase();

    filteredArticles = allArticles.filter(article => {
        if (category && article.category !== category) return false;

        if (tagSearch) {
            const tagsMatch = article.tags.some(tag =>
                tag.toLowerCase().includes(tagSearch)
            );
            if (!tagsMatch) return false;
        }

        return true;
    });

    sortArticles();
    renderArticles();
}

function sortArticles() {
    const sortOrder = document.getElementById('sort-order').value;
    const lang = LANGUAGE.current;

    filteredArticles.sort((a, b) => {
        switch (sortOrder) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'title':
                return a.title.localeCompare(b.title, lang === 'zh' ? 'zh-CN' : 'en');
            default:
                return 0;
        }
    });
}

function bindEvents() {
    document.getElementById('category-filter').addEventListener('change', filterAndSearch);
    document.getElementById('tag-search').addEventListener('input', filterAndSearch);
    document.getElementById('sort-order').addEventListener('change', () => {
        sortArticles();
        renderArticles();
    });
}

// Make setLanguage available globally
window.setLanguage = setLanguage;
