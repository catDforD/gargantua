const BLOG_CONFIG = {
    contentDir: 'contents/blog/',
    articlesFile: 'articles.yml'
};

let allArticles = [];
let filteredArticles = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadArticlesIndex();
        renderCategoryFilter();
        renderArticles();
        bindEvents();
        handleRoute();
    } catch (error) {
        console.error('博客加载失败:', error);
        document.getElementById('articles-container').innerHTML =
            '<div class="col-12"><div class="alert alert-danger">加载文章失败，请稍后重试。</div></div>';
    }
});

// 路由处理
function handleRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#article/')) {
        const articleId = hash.replace('#article/', '');
        showArticleDetail(articleId);
    } else {
        showArticleList();
    }
}

// 监听 hash 变化
window.addEventListener('hashchange', handleRoute);

// 显示文章列表
function showArticleList() {
    document.getElementById('article-list-view').classList.remove('d-none');
    document.getElementById('article-detail-view').classList.add('d-none');
    window.scrollTo(0, 0);
}

// 显示文章详情
async function showArticleDetail(articleId) {
    const article = allArticles.find(a => a.id === articleId);
    if (!article) {
        window.location.hash = '';
        return;
    }

    try {
        // 隐藏列表，显示详情
        document.getElementById('article-list-view').classList.add('d-none');
        document.getElementById('article-detail-view').classList.remove('d-none');

        // 更新面包屑
        document.getElementById('breadcrumb-category').textContent = article.category;
        document.getElementById('breadcrumb-title').textContent = article.title;

        // 更新文章信息
        document.getElementById('detail-title').textContent = article.title;
        document.getElementById('detail-category').innerHTML = `<i class="bi bi-folder"></i> ${article.category}`;
        document.getElementById('detail-date').innerHTML = `<i class="bi bi-calendar3"></i> ${formatDate(article.date)}`;

        // 渲染标签
        const tagsContainer = document.getElementById('detail-tags');
        tagsContainer.innerHTML = article.tags.map(tag =>
            `<span class="article-tag">${tag}</span>`
        ).join('');

        // 加载文章内容
        const response = await fetch(BLOG_CONFIG.contentDir + article.file);
        const markdown = await response.text();
        const html = marked.parse(markdown);
        document.getElementById('detail-content').innerHTML = html;

        // 渲染数学公式
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
    updateHeaderStats();
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

    if (filteredArticles.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info">没有找到匹配的文章。</div></div>';
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
                    <span class="read-more">阅读全文 <i class="bi bi-arrow-right"></i></span>
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
    return date.toLocaleDateString('zh-CN', {
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

    filteredArticles.sort((a, b) => {
        switch (sortOrder) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'title':
                return a.title.localeCompare(b.title, 'zh-CN');
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
