// Renders the recommendation shelf page (books / movies / anime / music)
// from front matter. Enable with `recommendations_page: true`.

const crypto = require('crypto');

const SECTION_DEFAULTS = {
  books: { name: '书籍', en: 'Books', title: '书架' },
  movies: { name: '电影', en: 'Films', title: '放映厅' },
  anime: { name: '漫剧', en: 'Anime', title: '漫剧' },
  music: { name: '音乐', en: 'Music', title: '曲目单' }
};

// Detail rows shown in the modal, in display order.
const META_FIELDS = {
  books: [['author', '作者'], ['translator', '译者'], ['publisher', '出版'], ['year', '年份'], ['pages', '页数']],
  movies: [['director', '导演'], ['cast', '主演'], ['region', '地区'], ['year', '年份'], ['duration', '片长']],
  anime: [['studio', '制作'], ['director', '监督'], ['episodes', '集数'], ['year', '年份']],
  music: [['artist', '艺人'], ['type', '类型'], ['genre', '流派'], ['year', '年份']]
};

// The secondary line under a card title.
const BYLINE_FIELD = {
  books: 'author',
  movies: 'director',
  anime: 'studio',
  music: 'artist'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stableHash(input) {
  let hash = 2166136261;
  const value = String(input);

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function toList(value) {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function renderMarkdown(text) {
  if (!text) return '';
  return hexo.render.renderSync({ text: String(text), engine: 'markdown' }).trim();
}

function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  if (!value) return '';

  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    const state = value >= i ? 'is-full' : value >= i - 0.5 ? 'is-half' : '';
    stars.push(`<i class="${state}" aria-hidden="true">★</i>`);
  }

  return `<span class="rec-stars" role="img" aria-label="推荐指数 ${value} / 5">${stars.join('')}</span>`;
}

function renderCover(type, item, hue) {
  const byline = item[BYLINE_FIELD[type]];

  if (item.cover) {
    const position = item.cover_position ? ` style="object-position:${escapeHtml(item.cover_position)}"` : '';
    return [
      `<span class="rec-cover rec-cover--${type}">`,
      `<img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)} 封面" loading="lazy"${position}>`,
      '</span>'
    ].join('');
  }

  // No cover image yet: draw a typographic placeholder in the style of the medium.
  // Latin characters are roughly half the width of CJK ones.
  const titleWidth = [...String(item.title)].reduce((sum, ch) => sum + (/[\x00-\xff]/.test(ch) ? 0.5 : 1), 0);
  const longClass = titleWidth > 8 ? ' is-long' : '';
  return [
    `<span class="rec-cover rec-cover--${type} rec-cover--generated${longClass}" style="--hue:${hue}" aria-hidden="true">`,
    item.year ? `<span class="rec-cover__year">${escapeHtml(item.year)}</span>` : '',
    `<span class="rec-cover__title">${escapeHtml(item.title)}</span>`,
    item.original ? `<span class="rec-cover__original">${escapeHtml(item.original)}</span>` : '',
    byline ? `<span class="rec-cover__byline">${escapeHtml(toList(byline).join(' / '))}</span>` : '',
    '</span>'
  ].join('');
}

function renderDetail(section, item, cover) {
  const type = section.key;
  const metaRows = (META_FIELDS[type] || [])
    .filter(([field]) => item[field] != null && item[field] !== '')
    .map(([field, label]) => `<div><dt>${label}</dt><dd>${escapeHtml(toList(item[field]).join(' / '))}</dd></div>`);
  const tags = toList(item.tags);
  const tracks = toList(item.tracks);
  const kicker = [section.name, item.year].filter(Boolean).join(' · ');
  // Music keeps its listening widget in the left rail, right under the cover,
  // instead of breaking up the text column.
  const stream = resolveStream(item);
  const streamInRail = Boolean(stream && type === 'music');

  return [
    `<div class="rec-detail rec-detail--${type}">`,
    `<div class="rec-detail__cover">${cover}${streamInRail ? renderPlayer(stream) : ''}</div>`,
    '<div class="rec-detail__body">',
    `<p class="rec-detail__kicker">${escapeHtml(kicker)}</p>`,
    `<h3 class="rec-detail__title">${escapeHtml(item.title)}</h3>`,
    item.original ? `<p class="rec-detail__original">${escapeHtml(item.original)}</p>` : '',
    renderStars(item.rating),
    metaRows.length ? `<dl class="rec-detail__meta">${metaRows.join('')}</dl>` : '',
    tags.length ? `<ul class="rec-tags">${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>` : '',
    item.intro ? `<section class="rec-detail__section rec-detail__section--intro"><h4>简介</h4>${renderMarkdown(item.intro)}</section>` : '',
    stream && !streamInRail ? renderPlayer(stream) : '',
    item.embed && !stream ? renderEmbed(item) : '',
    tracks.length
      ? `<section class="rec-detail__section"><h4>推荐曲目</h4><ol class="rec-tracks">${tracks.map((track) => `<li>${escapeHtml(track)}</li>`).join('')}</ol></section>`
      : '',
    item.comment ? `<blockquote class="rec-detail__comment">${renderMarkdown(item.comment)}</blockquote>` : '',
    item.link
      ? `<a class="rec-detail__link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">${escapeHtml(item.link_text || '查看更多')}<span aria-hidden="true"> &#8599;&#xfe0e;</span></a>`
      : '',
    '</div>',
    '</div>'
  ].join('');
}

// The netease outer url redirects straight to their CDN and answers range
// requests, so seeking works and the site can drive the stream with its own
// player controls instead of the unscalable outchain iframe. Tracks that need
// a login or a VIP account answer with a 404: the player then shows 无法播放,
// which the item can explain through `embed_note`.
function neteaseStream(id) {
  return `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(id)}.mp3`;
}

// Official video embeds stay as platform iframes in the detail body.
const EMBED_PROVIDERS = {
  bilibili: (id) => ({
    src: `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(id)}&autoplay=0&danmaku=0`,
    frameTitle: '哔哩哔哩播放器'
  })
};

// What the detail page plays, and where the audio comes from.
function resolveStream(item) {
  if (item.audio) {
    return { src: item.audio, note: item.audio_note };
  }

  const netease = item.embed && item.embed.netease;
  if (netease) {
    return { src: neteaseStream(netease), note: item.embed_note };
  }

  return null;
}

function renderEmbed(item) {
  const embed = item.embed || {};
  const providerKey = Object.keys(EMBED_PROVIDERS).find((key) => embed[key]);
  if (!providerKey) return '';

  const provider = EMBED_PROVIDERS[providerKey](embed[providerKey]);
  return [
    `<section class="rec-detail__section rec-detail__section--embed rec-embed rec-embed--${providerKey}">`,
    `<iframe class="rec-embed__frame" src="${escapeHtml(provider.src)}" title="${escapeHtml(provider.frameTitle)}：《${escapeHtml(item.title)}》" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allow="autoplay; encrypted-media" scrolling="no"></iframe>`,
    item.embed_note ? `<p class="rec-embed__note">${escapeHtml(item.embed_note)}</p>` : '',
    '</section>'
  ].join('');
}

// Player widgets share one markup shape: a self-hosted file (tools/rec_work/audio.py)
// or a platform stream handed over by resolveStream().
function renderPlayer(stream) {
  return [
    '<section class="rec-detail__section rec-detail__section--audio">',
    '<div class="rec-audio" data-rec-audio>',
    `<audio class="rec-audio__el" preload="metadata" src="${escapeHtml(stream.src)}"></audio>`,
    '<button class="rec-audio__toggle" type="button" aria-label="播放试听"><span aria-hidden="true"></span></button>',
    '<div class="rec-audio__progress">',
    '<span class="rec-audio__fill" style="width:0%"></span>',
    '<input class="rec-audio__seek" type="range" min="0" max="1000" step="1" value="0" aria-label="播放进度">',
    '</div>',
    '<span class="rec-audio__clock"><span class="rec-audio__now">0:00</span><span class="rec-audio__slash" aria-hidden="true">/</span><span class="rec-audio__dur">--:--</span></span>',
    '</div>',
    stream.note ? `<p class="rec-audio__note">${escapeHtml(stream.note)}</p>` : '',
    '</section>'
  ].join('');
}

function renderCard(section, item, index) {
  const type = section.key;
  const id = `rec-${type}-${index}`;
  const hue = item.hue ?? stableHash(`${type}:${item.title}`) % 360;
  const cover = renderCover(type, item, hue);
  const byline = toList(item[BYLINE_FIELD[type]]).join(' / ');
  const caption = [
    `<span class="rec-caption"><strong>${escapeHtml(item.title)}</strong>`,
    byline || item.year ? `<em>${escapeHtml([byline, item.year].filter(Boolean).join(' · '))}</em>` : '',
    '</span>'
  ].join('');
  const open = `<button class="rec-card rec-card--${type}" type="button" data-rec-open="${id}" style="--hue:${hue}" aria-label="查看《${escapeHtml(item.title)}》详情">`;
  const detail = `<template id="${id}">${renderDetail(section, item, cover)}</template>`;

  if (type === 'books') {
    return `${open}<span class="rec-book"><span class="rec-book__object">${cover}</span></span>${caption}</button>${detail}`;
  }

  if (type === 'movies') {
    return [
      open,
      '<span class="rec-poster">',
      cover,
      item.rating ? `<span class="rec-poster__badge">${renderStars(item.rating)}</span>` : '',
      item.comment ? `<span class="rec-poster__hover">${escapeHtml(String(item.comment).trim())}</span>` : '',
      '</span>',
      caption,
      '</button>',
      detail
    ].join('');
  }

  if (type === 'anime') {
    const chips = [item.episodes ? `${item.episodes} 集` : '', item.year].filter(Boolean);
    return [
      open,
      `<span class="rec-anime__cover">${cover}</span>`,
      '<span class="rec-anime__body">',
      chips.length ? `<span class="rec-anime__chips">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('')}</span>` : '',
      `<strong class="rec-anime__title">${escapeHtml(item.title)}</strong>`,
      item.original ? `<span class="rec-anime__original">${escapeHtml(item.original)}</span>` : '',
      item.comment ? `<span class="rec-anime__comment">${escapeHtml(String(item.comment).trim())}</span>` : '',
      `<span class="rec-anime__footer">${byline ? `<span>${escapeHtml(byline)}</span>` : '<span></span>'}${renderStars(item.rating)}</span>`,
      '</span>',
      '</button>',
      detail
    ].join('');
  }

  // music
  return `${open}<span class="rec-album"><span class="rec-album__disc" aria-hidden="true"></span><span class="rec-album__sleeve">${cover}</span></span>${caption}</button>${detail}`;
}

function normalizeSection(raw) {
  const key = raw.key;
  return {
    ...SECTION_DEFAULTS[key],
    ...raw,
    items: toList(raw.items)
  };
}

function resolvePageData(data) {
  if (!data.recommendations_data) return data;

  const dataFiles = hexo.locals && hexo.locals.get ? hexo.locals.get('data') : {};
  const external = dataFiles && dataFiles[data.recommendations_data];
  if (!external) {
    hexo.log.warn(`Recommendations data file not found: ${data.recommendations_data}`);
    return data;
  }

  return { ...data, ...external };
}

// Fingerprint of the data a page is rendered from. It is embedded into the
// generated HTML so the cache invalidation hook at the bottom can tell whether
// the copy cached in db.json is still up to date.
function recommendationsFingerprint(name) {
  const dataFiles = hexo.locals && hexo.locals.get ? hexo.locals.get('data') : {};
  const external = dataFiles && dataFiles[name];
  if (!external) return '';

  return crypto.createHash('sha1').update(JSON.stringify(external)).digest('hex').slice(0, 16);
}

function renderPage(data) {
  const pageData = resolvePageData(data);
  const fingerprint = recommendationsFingerprint(pageData.recommendations_data || 'recommendations');
  const sections = toList(pageData.recommendations)
    .filter((section) => section && SECTION_DEFAULTS[section.key])
    .map(normalizeSection);
  const header = pageData.recommendations_deck || pageData.recommendations_intro
    ? [
      '<header class="rec-header">',
      pageData.recommendations_deck ? `<p class="rec-header__kicker">${escapeHtml(pageData.recommendations_deck)}</p>` : '',
      pageData.recommendations_intro ? `<p class="rec-header__intro">${escapeHtml(pageData.recommendations_intro)}</p>` : '',
      '</header>'
    ].join('')
    : '';

  const tabs = sections.map((section, index) => [
    `<button class="rec-tab rec-tab--${section.key}" type="button" role="tab" id="rec-tab-${section.key}"`,
    ` aria-controls="rec-panel-${section.key}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-rec-tab="${section.key}">`,
    `<span class="rec-tab__en">${escapeHtml(section.en)}</span>`,
    `<span class="rec-tab__name">${escapeHtml(section.name)}</span>`,
    `<span class="rec-tab__count">${String(section.items.length).padStart(2, '0')}</span>`,
    '</button>'
  ].join(''));

  const panels = sections.map((section, index) => [
    `<section class="rec-panel rec-panel--${section.key}" role="tabpanel" id="rec-panel-${section.key}" aria-labelledby="rec-tab-${section.key}"${index === 0 ? '' : ' hidden'}>`,
    '<header class="rec-panel__head">',
    `<h2>${escapeHtml(section.title)}</h2>`,
    section.intro ? `<p>${escapeHtml(section.intro)}</p>` : '',
    '</header>',
    section.items.length
      ? `<div class="rec-grid rec-grid--${section.key}">${section.items.map((item, i) => renderCard(section, item, i)).join('')}</div>`
      : '<p class="rec-empty">这里还空着，慢慢填。</p>',
    '</section>'
  ].join(''));

  return [
    `<div class="rec-layout"${fingerprint ? ` data-rec-data="${fingerprint}"` : ''}>`,
    header,
    `<nav class="rec-tabs" role="tablist" aria-label="推荐分类">${tabs.join('')}</nav>`,
    panels.join(''),
    '</div>'
  ].join('\n');
}

hexo.extend.filter.register('before_post_render', function beforePostRender(data) {
  if (!data.recommendations_page) {
    return data;
  }

  // Wrap in raw so user text containing `{{` / `{%` is not parsed as Nunjucks.
  data.content = `{% raw %}${renderPage(data)}{% endraw %}`;
  return data;
});

// Hexo caches a page's rendered HTML in db.json keyed on the page file alone,
// so edits under `source/_data` keep serving the previous shelf until a
// `hexo clean` - in `hexo server` as well as in `hexo generate`. The rendered
// page carries a fingerprint of the data it was built from; when that no
// longer matches, drop the cached content so the page renders again.
hexo.extend.filter.register('before_generate', function invalidateRecommendationsCache() {
  const page = this.model('Page').findOne({ source: 'recommendations/index.md' });
  if (!page || page.content == null) return;

  const fingerprint = recommendationsFingerprint(page.recommendations_data || 'recommendations');
  if (!fingerprint || page.content.includes(`data-rec-data="${fingerprint}"`)) return;

  this.log.debug('Recommendations data changed, re-rendering %s', page.source);
  // Drop the rendered HTML the way Hexo's own processors do: `replace` stores
  // the document without `content`, which marks it as needing a render again.
  const data = page.toObject();
  delete data.content;
  return page.replace(data);
}, 5);
