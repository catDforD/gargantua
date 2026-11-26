<?xml version="1.0" encoding="UTF-8"?>
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
