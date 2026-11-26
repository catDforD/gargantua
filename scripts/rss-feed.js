const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const XML_INVALID_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

function stripInvalidXml(value) {
  return String(value || '').replace(XML_INVALID_CHARS, '');
}

function escapeXml(value) {
  return stripInvalidXml(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value) {
  return `<![CDATA[${stripInvalidXml(value).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function stripHtml(html) {
  return stripInvalidXml(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function toDate(value, fallback = new Date()) {
  if (!value) return fallback;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : fallback;
  if (typeof value.toDate === 'function') {
    const converted = value.toDate();
    return Number.isFinite(converted.getTime()) ? converted : fallback;
  }
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

function getSiteOrigin(config) {
  return String(config.url || 'https://catdfd.com').replace(/\/+$/, '');
}

function toAbsoluteUrl(rawUrl, siteOrigin, pageUrl) {
  const value = String(rawUrl || '').trim();
  if (!value || /^(?:https?:|mailto:|tel:|data:|#)/i.test(value)) {
    return value;
  }
  if (value.startsWith('//')) {
    return `https:${value}`;
  }
  if (/^(?:\.\.\/)+img\//i.test(value)) {
    return `${siteOrigin}/${value.replace(/^(?:\.\.\/)+/, '')}`;
  }
  try {
    return new URL(value, value.startsWith('/') ? `${siteOrigin}/` : pageUrl).href;
  } catch {
    return value;
  }
}

function normalizeFeedHtml(html, siteOrigin, pageUrl) {
  if (!html) return '';

  return stripInvalidXml(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<a\b[^>]*\bclass=["'][^"']*\bheaderlink\b[^"']*["'][^>]*>\s*<\/a>/gi, '')
    .replace(/<img\b[^>]*>/gi, (imgTag) => {
      let cleaned = imgTag
        .replace(/\s+srcset=(["'])[^"']*loading\.gif[^"']*\1/gi, '')
        .replace(/\s+lazyload(?:=(["'])[^"']*\1)?/gi, '');

      cleaned = cleaned.replace(/\bsrc=(["'])([^"']+)\1/i, (_, quote, src) => {
        const abs = toAbsoluteUrl(src, siteOrigin, pageUrl);
        return `src=${quote}${escapeXml(abs)}${quote}`;
      });
      return cleaned;
    })
    .replace(/\b(href|poster)=(["'])([^"']+)\2/gi, (full, attr, quote, url) => {
      const abs = toAbsoluteUrl(url, siteOrigin, pageUrl);
      if (abs === url) return full;
      return `${attr}=${quote}${escapeXml(abs)}${quote}`;
    });
}

function buildPostSummary(post) {
  if (post.description) return stripHtml(post.description);
  if (post.excerpt) return stripHtml(post.excerpt);
  const plain = stripHtml(post.content || '');
  return plain.length > 180 ? `${plain.slice(0, 180)}…` : plain;
}

function renderAtomFeed({ title, subtitle, siteUrl, feedUrl, author, iconUrl, entries }) {
  const updated = entries.length ? entries[0].updated : new Date();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeXml(title)}</title>`,
    subtitle ? `  <subtitle>${escapeXml(subtitle)}</subtitle>` : '',
    `  <id>${escapeXml(feedUrl)}</id>`,
    `  <link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml"/>`,
    `  <link href="${escapeXml(siteUrl)}" rel="alternate" type="text/html"/>`,
    iconUrl ? `  <icon>${escapeXml(iconUrl)}</icon>` : '',
    `  <updated>${updated.toISOString()}</updated>`,
    '  <author>',
    `    <name>${escapeXml(author)}</name>`,
    `    <uri>${escapeXml(siteUrl)}</uri>`,
    '  </author>',
    '  <generator>Hexo</generator>',
  ].filter(Boolean);

  for (const entry of entries) {
    lines.push('  <entry>');
    lines.push(`    <title>${escapeXml(entry.title)}</title>`);
    lines.push(`    <id>${escapeXml(entry.id)}</id>`);
    lines.push(`    <link href="${escapeXml(entry.link)}" rel="alternate" type="text/html"/>`);
    lines.push(`    <published>${entry.published.toISOString()}</published>`);
    lines.push(`    <updated>${entry.updated.toISOString()}</updated>`);
    lines.push('    <author>');
    lines.push(`      <name>${escapeXml(entry.author || author)}</name>`);
    lines.push('    </author>');
    for (const tag of entry.tags || []) {
      lines.push(`    <category term="${escapeXml(tag)}"/>`);
    }
    if (entry.summary) {
      lines.push(`    <summary type="text">${escapeXml(entry.summary)}</summary>`);
    }
    lines.push(`    <content type="html">${cdata(entry.content)}</content>`);
    lines.push('  </entry>');
  }

  lines.push('</feed>');
  return `${lines.join('\n')}\n`;
}

function renderRss2Feed({ title, subtitle, siteUrl, feedUrl, language, entries }) {
  const lastBuildDate = entries.length ? entries[0].updated : new Date();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(siteUrl)}</link>`,
    `    <description>${escapeXml(subtitle || title)}</description>`,
    `    <language>${escapeXml(language || 'zh-CN')}</language>`,
    `    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    '    <generator>Hexo</generator>',
  ];

  for (const entry of entries) {
    lines.push('    <item>');
    lines.push(`      <title>${escapeXml(entry.title)}</title>`);
    lines.push(`      <link>${escapeXml(entry.link)}</link>`);
    lines.push(`      <guid isPermaLink="true">${escapeXml(entry.id)}</guid>`);
    lines.push(`      <pubDate>${entry.published.toUTCString()}</pubDate>`);
    for (const tag of entry.tags || []) {
      lines.push(`      <category>${escapeXml(tag)}</category>`);
    }
    lines.push(`      <description>${cdata(entry.summary || entry.title)}</description>`);
    lines.push(`      <content:encoded>${cdata(entry.content)}</content:encoded>`);
    lines.push('    </item>');
  }

  lines.push('  </channel>');
  lines.push('</rss>');
  return `${lines.join('\n')}\n`;
}

function parseMomentTimestamp(value, fallback) {
  const text = String(value || fallback).trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const normalized = hasTimezone ? text : `${text.replace(' ', 'T')}+08:00`;
  const ts = Date.parse(normalized);
  return Number.isFinite(ts) ? new Date(ts) : new Date(0);
}

function loadMomentEntries(siteOrigin, author) {
  const momentsDir = path.join(hexo.base_dir, 'moments');
  if (!fs.existsSync(momentsDir)) return [];

  const momentsPageUrl = `${siteOrigin}/moments/`;

  return fs.readdirSync(momentsDir)
    .filter((fileName) => fileName.endsWith('.md') && fileName !== 'README.md')
    .map((fileName) => {
      const source = fs.readFileSync(path.join(momentsDir, fileName), 'utf8');
      const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
      if (!match) return null;

      const metadata = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {};
      if (metadata.published === false || metadata.draft === true) return null;

      const id = String(metadata.id || fileName.replace(/\.md$/, ''));
      const dateStr = String(metadata.date || id);
      const published = parseMomentTimestamp(dateStr, id);
      const body = match[2].trim();
      const bodyHtml = body
        ? normalizeFeedHtml(hexo.render.renderSync({ text: body, engine: 'md' }).trim(), siteOrigin, momentsPageUrl)
        : '';

      const rawImages = Array.isArray(metadata.images)
        ? metadata.images
        : metadata.images ? [metadata.images] : [];
      const imagesHtml = rawImages
        .map((item) => {
          const src = typeof item === 'string' ? item : item && item.src ? String(item.src) : '';
          if (!src) return '';
          const alt = typeof item === 'object' && item && item.alt ? String(item.alt) : '';
          const absSrc = toAbsoluteUrl(src, siteOrigin, momentsPageUrl);
          return `<p><img src="${escapeXml(absSrc)}" alt="${escapeXml(alt)}"/></p>`;
        })
        .filter(Boolean)
        .join('\n');

      const location = metadata.location ? String(metadata.location) : '';
      const mood = metadata.mood ? String(metadata.mood) : '';
      const plainText = stripHtml(bodyHtml);
      const dateLabel = dateStr.slice(0, 10);
      const titleParts = [dateLabel];
      if (location) titleParts.push(location);
      if (mood) titleParts.push(mood);
      if (!location && !mood && plainText) {
        titleParts.push(plainText.length > 24 ? `${plainText.slice(0, 24)}…` : plainText);
      }

      const metaLine = [location, mood].filter(Boolean).join(' · ');
      const metaHtml = metaLine ? `<p><em>${escapeXml(metaLine)}</em></p>\n` : '';
      const content = `${metaHtml}${bodyHtml}${imagesHtml ? `\n${imagesHtml}` : ''}`.trim();
      const summary = plainText
        ? (plainText.length > 140 ? `${plainText.slice(0, 140)}…` : plainText)
        : (rawImages.length ? `分享了 ${rawImages.length} 张图片` : titleParts.join(' · '));

      const link = `${momentsPageUrl}#${encodeURIComponent(id)}`;
      return {
        title: titleParts.join(' · '),
        id: link,
        link,
        published,
        updated: published,
        author,
        tags: location ? [location] : [],
        summary,
        content,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.published.getTime() - a.published.getTime());
}

function buildFeedXsl() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>
          <xsl:choose>
            <xsl:when test="atom:feed"><xsl:value-of select="atom:feed/atom:title"/> · RSS 订阅</xsl:when>
            <xsl:otherwise><xsl:value-of select="rss/channel/title"/> · RSS 订阅</xsl:otherwise>
          </xsl:choose>
        </title>
        <style>
          :root {
            --bg: #f8fafc;
            --card: #ffffff;
            --text: #2c3e50;
            --muted: #64748b;
            --line: #e2e8f0;
            --accent: #49b8a6;
            --accent-hover: #3ca392;
            --accent-soft: rgba(73, 184, 166, 0.12);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #181c27;
              --card: #222836;
              --text: #e2e8f0;
              --muted: #94a3b8;
              --line: #334155;
              --accent: #56c9b7;
              --accent-hover: #6ad4c4;
              --accent-soft: rgba(86, 201, 183, 0.16);
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 2.5rem 1.25rem 4rem;
            background: var(--bg);
            color: var(--text);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
            line-height: 1.7;
          }
          .wrap {
            max-width: 760px;
            margin: 0 auto;
          }
          .hero {
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 18px;
            padding: 1.75rem 1.85rem;
            margin-bottom: 1.75rem;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
          }
          .badge {
            display: inline-block;
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            color: var(--accent);
            background: var(--accent-soft);
            padding: 0.2rem 0.65rem;
            border-radius: 999px;
            margin-bottom: 0.75rem;
          }
          h1 {
            margin: 0 0 0.45rem;
            font-size: 1.65rem;
            line-height: 1.3;
          }
          .desc {
            margin: 0 0 1rem;
            color: var(--muted);
            font-size: 0.96rem;
          }
          .hint {
            margin: 0 0 1rem;
            font-size: 0.9rem;
            color: var(--muted);
          }
          .copy-row {
            display: flex;
            gap: 0.6rem;
            flex-wrap: wrap;
            align-items: center;
          }
          .feed-url {
            flex: 1 1 260px;
            padding: 0.55rem 0.85rem;
            border: 1px solid var(--line);
            border-radius: 10px;
            background: var(--bg);
            color: var(--text);
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: 0.86rem;
            word-break: break-all;
          }
          .copy-btn {
            padding: 0.55rem 1rem;
            border: none;
            border-radius: 10px;
            background: var(--accent);
            color: #fff;
            font-size: 0.88rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s ease;
          }
          .copy-btn:hover { background: var(--accent-hover); }
          .nav-links {
            display: flex;
            flex-wrap: wrap;
            gap: 0.65rem;
            margin-top: 1.15rem;
            padding-top: 1rem;
            border-top: 1px solid var(--line);
            font-size: 0.86rem;
          }
          .nav-links a {
            color: var(--accent);
            text-decoration: none;
            padding: 0.2rem 0.55rem;
            border-radius: 8px;
            background: var(--accent-soft);
          }
          .nav-links a:hover { text-decoration: underline; }
          .list-title {
            margin: 0 0 0.9rem 0.25rem;
            font-size: 1.05rem;
            color: var(--muted);
            font-weight: 600;
          }
          .entry {
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 14px;
            padding: 1.15rem 1.35rem;
            margin-bottom: 0.9rem;
          }
          .entry h2 {
            margin: 0 0 0.35rem;
            font-size: 1.12rem;
            line-height: 1.45;
          }
          .entry h2 a {
            color: var(--text);
            text-decoration: none;
          }
          .entry h2 a:hover { color: var(--accent); }
          .meta {
            font-size: 0.82rem;
            color: var(--muted);
            margin-bottom: 0.45rem;
          }
          .summary {
            margin: 0;
            font-size: 0.92rem;
            color: var(--muted);
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <section class="hero">
            <span class="badge">RSS / ATOM FEED</span>
            <h1>
              <xsl:choose>
                <xsl:when test="atom:feed"><xsl:value-of select="atom:feed/atom:title"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="rss/channel/title"/></xsl:otherwise>
              </xsl:choose>
            </h1>
            <p class="desc">
              <xsl:choose>
                <xsl:when test="atom:feed"><xsl:value-of select="atom:feed/atom:subtitle"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="rss/channel/description"/></xsl:otherwise>
              </xsl:choose>
            </p>
            <p class="hint">这是一个标准的 RSS / Atom 订阅源。复制下方链接并粘贴到 Folo、NetNewsWire、Inoreader、Reeder 等阅读器即可自动接收更新。</p>
            <div class="copy-row">
              <code class="feed-url" id="feed-url">
                <xsl:choose>
                  <xsl:when test="atom:feed"><xsl:value-of select="atom:feed/atom:link[@rel='self']/@href"/></xsl:when>
                  <xsl:otherwise><xsl:value-of select="rss/channel/atom:link[@rel='self']/@href"/></xsl:otherwise>
                </xsl:choose>
              </code>
              <button type="button" class="copy-btn" id="copy-btn">复制订阅地址</button>
            </div>
            <nav class="nav-links">
              <a href="/">← 返回博客首页</a>
              <a href="/atom.xml">文章订阅 (Atom)</a>
              <a href="/rss.xml">文章订阅 (RSS 2.0)</a>
              <a href="/moments/atom.xml">动态订阅 (Atom)</a>
            </nav>
          </section>

          <p class="list-title">最近更新</p>
          <xsl:choose>
            <xsl:when test="atom:feed">
              <xsl:for-each select="atom:feed/atom:entry">
                <article class="entry">
                  <h2>
                    <a href="{atom:link[@rel='alternate']/@href}">
                      <xsl:value-of select="atom:title"/>
                    </a>
                  </h2>
                  <div class="meta">
                    <xsl:value-of select="substring(atom:published, 1, 10)"/>
                  </div>
                  <xsl:if test="atom:summary">
                    <p class="summary"><xsl:value-of select="atom:summary"/></p>
                  </xsl:if>
                </article>
              </xsl:for-each>
            </xsl:when>
            <xsl:otherwise>
              <xsl:for-each select="rss/channel/item">
                <article class="entry">
                  <h2>
                    <a href="{link}">
                      <xsl:value-of select="title"/>
                    </a>
                  </h2>
                  <div class="meta">
                    <xsl:value-of select="pubDate"/>
                  </div>
                  <xsl:if test="description">
                    <p class="summary"><xsl:value-of select="description"/></p>
                  </xsl:if>
                </article>
              </xsl:for-each>
            </xsl:otherwise>
          </xsl:choose>
        </div>
        <script>
          (function () {
            var btn = document.getElementById('copy-btn');
            var urlEl = document.getElementById('feed-url');
            if (!btn || !urlEl) return;
            btn.addEventListener('click', function () {
              var text = (urlEl.textContent || window.location.href).trim();
              if (navigator.clipboard &amp;&amp; navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                  btn.textContent = '已复制';
                  setTimeout(function () { btn.textContent = '复制订阅地址'; }, 1800);
                });
              }
            });
          })();
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;
}

hexo.extend.generator.register('rss-feed', function(locals) {
  const siteOrigin = getSiteOrigin(this.config);
  const siteUrl = `${siteOrigin}/`;
  const title = this.theme.config.navbar?.blog_title || this.config.title || "Gargantua's Blog";
  const subtitle = this.config.description || this.theme.config.about?.intro || '';
  const author = this.config.author || 'Gargantua';
  const favicon = this.theme.config.favicon;
  const iconUrl = favicon ? toAbsoluteUrl(favicon, siteOrigin, siteUrl) : '';

  const posts = locals.posts
    .sort('-date')
    .filter((post) => post.published !== false)
    .toArray();

  const postEntries = posts.map((post) => {
    const link = `${siteOrigin}/${String(post.path || '').replace(/^\/+/, '')}`;
    const published = toDate(post.date);
    const updated = toDate(post.updated || post.date, published);
    const tags = post.tags && typeof post.tags.map === 'function'
      ? post.tags.map((tag) => tag.name)
      : [];

    return {
      title: post.title || 'Untitled',
      id: link,
      link,
      published,
      updated,
      author: post.author || author,
      tags,
      summary: buildPostSummary(post),
      content: normalizeFeedHtml(post.content || '', siteOrigin, link),
    };
  });

  const momentEntries = loadMomentEntries(siteOrigin, author);

  return [
    {
      path: 'atom.xml',
      data: renderAtomFeed({
        title,
        subtitle,
        siteUrl,
        feedUrl: `${siteOrigin}/atom.xml`,
        author,
        iconUrl,
        entries: postEntries,
      }),
    },
    {
      path: 'rss.xml',
      data: renderRss2Feed({
        title,
        subtitle,
        siteUrl,
        feedUrl: `${siteOrigin}/rss.xml`,
        language: this.config.language || 'zh-CN',
        entries: postEntries,
      }),
    },
    {
      path: 'moments/atom.xml',
      data: renderAtomFeed({
        title: `${title} · 动态`,
        subtitle: '日常随记与旅行照片流',
        siteUrl: `${siteOrigin}/moments/`,
        feedUrl: `${siteOrigin}/moments/atom.xml`,
        author,
        iconUrl,
        entries: momentEntries,
      }),
    },
    {
      path: 'feed.xsl',
      data: buildFeedXsl(),
    },
  ];
});

hexo.extend.filter.register('after_render:html', function(html, data) {
  if (!html || !html.includes('</head>')) return html;

  const root = this.config.root || '/';
  const title = this.theme.config.navbar?.blog_title || this.config.title || "Gargantua's Blog";
  const safeTitle = escapeXml(title);
  const links = [
    `<link rel="alternate" type="application/atom+xml" title="${safeTitle}" href="${root}atom.xml">`,
    `<link rel="alternate" type="application/rss+xml" title="${safeTitle} (RSS 2.0)" href="${root}rss.xml">`,
  ];

  if (data && data.path === 'moments/index.html') {
    links.push(`<link rel="alternate" type="application/atom+xml" title="${safeTitle} · 动态" href="${root}moments/atom.xml">`);
  }

  return html.replace('</head>', `  ${links.join('\n  ')}\n</head>`);
});
