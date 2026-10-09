// Renders the LeetCode practice page (source/leetcode/index.md) from
// `source/_data/leetcode.yml`. Enable with `leetcode_page: true`.

const crypto = require('crypto');
const fs = require('fs');

// 渲染代码本身也计入指纹：否则改了本文件、数据又没变时，`hexo generate` 会继续
// 复用 db.json 里的旧 HTML。（`hexo server` 还需要重启才会重新加载本文件。）
const RENDER_STAMP = crypto.createHash('sha1').update(fs.readFileSync(__filename, 'utf8')).digest('hex').slice(0, 8);

const DIFFICULTIES = [
  { name: '简单', key: 'easy' },
  { name: '中等', key: 'medium' },
  { name: '困难', key: 'hard' }
];

const DIFFICULTY_KEYS = new Map(DIFFICULTIES.map((item) => [item.name, item.key]));

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toList(value) {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeProblem(raw, index) {
  const tags = toList(raw.tags).map(String).filter(Boolean);
  return {
    id: String(raw.id == null ? index + 1 : raw.id),
    title: String(raw.title || '').trim(),
    slug: String(raw.slug || '').trim(),
    difficulty: DIFFICULTY_KEYS.has(raw.difficulty) ? raw.difficulty : '简单',
    tags,
    date: formatDate(raw.date),
    submissions: Number(raw.submissions) > 0 ? Number(raw.submissions) : 1,
    status: String(raw.status || 'passed'),
    link: String(raw.link || '').trim(),
    note: String(raw.note || '').trim()
  };
}

// YAML parses bare `2026-10-09` into a Date; render it back as the local
// calendar day so the page shows the same date that was written in the file.
function formatDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const pad = (part) => String(part).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  return String(value || '').trim();
}

function resolvePageData(data) {
  if (!data.leetcode_data) return data;

  const dataFiles = hexo.locals && hexo.locals.get ? hexo.locals.get('data') : {};
  const external = dataFiles && dataFiles[data.leetcode_data];
  if (!external) {
    hexo.log.warn(`LeetCode data file not found: ${data.leetcode_data}`);
    return data;
  }

  return { ...data, ...external };
}

// Fingerprint of the data a page was rendered from, embedded into the HTML so
// the cache invalidation hook below can tell whether db.json is stale.
function leetcodeFingerprint(name) {
  const dataFiles = hexo.locals && hexo.locals.get ? hexo.locals.get('data') : {};
  const external = dataFiles && dataFiles[name];
  if (!external) return '';

  return crypto.createHash('sha1').update(`${RENDER_STAMP}:${JSON.stringify(external)}`).digest('hex').slice(0, 16);
}

function renderStats(problems) {
  const counts = new Map(DIFFICULTIES.map((item) => [item.name, 0]));
  problems.forEach((problem) => counts.set(problem.difficulty, (counts.get(problem.difficulty) || 0) + 1));
  const submissions = problems.reduce((total, problem) => total + problem.submissions, 0);

  const cells = [
    { key: 'total', name: '总题数', value: problems.length, difficulty: 'all' },
    ...DIFFICULTIES.map((item) => ({
      key: item.key,
      name: item.name,
      value: counts.get(item.name) || 0,
      difficulty: item.key
    })),
    { key: 'submissions', name: '总提交', value: submissions, difficulty: '' }
  ];

  // 难度筛选就做在统计卡上：总题数 = 全部，三张难度卡各自过滤，总提交只展示数字。
  const cards = cells
    .map((cell) => {
      const inner = [
        `<span class="lc-stat__value">${escapeHtml(cell.value)}</span>`,
        `<span class="lc-stat__label">${escapeHtml(cell.name)}</span>`
      ].join('');
      const classes = `lc-stat lc-stat--${cell.key}${cell.difficulty === 'all' ? ' is-active' : ''}`;

      if (!cell.difficulty) return `<div class="${classes}">${inner}</div>`;

      const hint = cell.difficulty === 'all' ? '显示全部题目' : `只看${cell.name}题`;
      return [
        `<button class="${classes}" type="button" data-lc-difficulty="${cell.difficulty}"`,
        ` aria-pressed="${cell.difficulty === 'all'}" title="${escapeHtml(hint)}">${inner}</button>`
      ].join('');
    })
    .join('');

  return `<section class="lc-stats">${cards}</section>`;
}

function renderFilters(problems) {
  const tagCounts = new Map();
  problems.forEach((problem) => {
    problem.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
  });
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN'));

  return [
    '<div class="lc-toolbar">',
    tags.length
      ? [
        '<div class="lc-tags" role="group" aria-label="按标签筛选">',
        '<button class="lc-tag-chip is-active" type="button" data-lc-tag="" aria-pressed="true">全部标签</button>',
        tags
          .map(([tag, count]) => [
            `<button class="lc-tag-chip" type="button" data-lc-tag="${escapeHtml(tag)}" aria-pressed="false">`,
            `${escapeHtml(tag)} <em>${count}</em></button>`
          ].join('')).join(''),
        '</div>'
      ].join('')
      : '',
    '<label class="lc-search">',
    '<span class="lc-search__icon" aria-hidden="true">⌕</span>',
    '<input type="search" data-lc-search placeholder="搜索题号 / 题目 / 标签" aria-label="搜索题目">',
    '</label>',
    '</div>'
  ].join('\n');
}

function renderProblem(problem) {
  const badge = `<span class="lc-badge lc-badge--${DIFFICULTY_KEYS.get(problem.difficulty)}">${escapeHtml(problem.difficulty)}</span>`;
  const title = problem.link
    ? `<a class="lc-item__title" href="${escapeHtml(problem.link)}" target="_blank" rel="noreferrer">${escapeHtml(problem.title)}</a>`
    : `<span class="lc-item__title">${escapeHtml(problem.title)}</span>`;
  const searchKey = [problem.id, problem.title, problem.slug, problem.difficulty, ...problem.tags].join(' ');
  const tags = problem.tags.map((tag) => `<span class="lc-tag">${escapeHtml(tag)}</span>`).join('');

  return [
    '<li class="lc-item" data-lc-item',
    ` data-lc-difficulty="${DIFFICULTY_KEYS.get(problem.difficulty)}"`,
    ` data-lc-tags="${escapeHtml(problem.tags.join(' '))}"`,
    ` data-lc-search="${escapeHtml(searchKey.toLowerCase())}">`,
    `<span class="lc-item__id">${escapeHtml(problem.id)}</span>`,
    '<div class="lc-item__main">',
    '<div class="lc-item__head">',
    '<span class="lc-item__check" aria-hidden="true">✓</span>',
    title,
    badge,
    '</div>',
    tags ? `<div class="lc-item__tags">${tags}</div>` : '',
    problem.note ? `<p class="lc-item__note">${escapeHtml(problem.note)}</p>` : '',
    '</div>',
    '<div class="lc-item__side">',
    problem.date ? `<time class="lc-item__date" datetime="${escapeHtml(problem.date)}">${escapeHtml(problem.date)}</time>` : '',
    `<span class="lc-item__submissions">提交 ${escapeHtml(problem.submissions)} 次</span>`,
    '</div>',
    '</li>'
  ].join('\n');
}

function renderPage(data) {
  const pageData = resolvePageData(data);
  const fingerprint = leetcodeFingerprint(pageData.leetcode_data || 'leetcode');
  // `source/_data/leetcode.yml` is exposed under its file name, so the page
  // data lives at `pageData.leetcode` (same shape as the recommendations page).
  const payload = pageData.leetcode || {};
  const problems = toList(payload.problems)
    .map(normalizeProblem)
    .filter((problem) => problem.title)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.id.localeCompare(a.id, 'en', { numeric: true }));

  const header = payload.deck || payload.intro
    ? [
      '<header class="lc-header">',
      payload.deck ? `<p class="lc-header__kicker">${escapeHtml(payload.deck)}</p>` : '',
      payload.intro ? `<p class="lc-header__intro">${escapeHtml(payload.intro)}</p>` : '',
      '</header>'
    ].join('')
    : '';

  return [
    `<div class="lc-layout"${fingerprint ? ` data-lc-data="${fingerprint}"` : ''}>`,
    header,
    renderStats(problems),
    renderFilters(problems),
    problems.length
      ? `<ol class="lc-list">${problems.map(renderProblem).join('\n')}</ol>`
      : '<p class="lc-empty">还没有记录，先去刷一道。</p>',
    `<p class="lc-empty" data-lc-empty hidden>没有匹配的题目，换个条件试试。</p>`,
    `<p class="lc-count">共 <span data-lc-count>${problems.length}</span> / ${problems.length} 道</p>`,
    '</div>'
  ].join('\n');
}

hexo.extend.filter.register('before_post_render', function beforePostRender(data) {
  if (!data.leetcode_page) return data;

  // Wrap in raw so notes containing `{{` / `{%` are not parsed as Nunjucks.
  data.content = `{% raw %}${renderPage(data)}{% endraw %}`;
  return data;
});

// Same rationale as scripts/recommendations.js: Hexo caches rendered page HTML
// in db.json, so edits under `source/_data` would otherwise keep serving the old
// list. The rendered page stamps a fingerprint of its source data; when that no
// longer matches, drop the cached content so the page renders again.
hexo.extend.filter.register('before_generate', function invalidateLeetcodeCache() {
  const page = this.model('Page').findOne({ source: 'leetcode/index.md' });
  if (!page || page.content == null) return;

  const fingerprint = leetcodeFingerprint(page.leetcode_data || 'leetcode');
  if (!fingerprint || page.content.includes(`data-lc-data="${fingerprint}"`)) return;

  this.log.debug('LeetCode data changed, re-rendering %s', page.source);
  const data = page.toObject();
  delete data.content;
  return page.replace(data);
}, 5);
