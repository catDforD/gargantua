# gargantua

[catdfd.com](https://catdfd.com) 的 Hexo 源码仓库：文章、动态、推荐页、作品和知识图谱都在这里维护，push 到 `main` 后由 GitHub Actions 构建并发布到 GitHub Pages。

- 站点框架：Hexo 8 + Fluid 主题
- 站点配置：[`_config.yml`](_config.yml)，主题覆盖：[`_config.fluid.yml`](_config.fluid.yml)
- 仓库约定：[`AGENTS.md`](AGENTS.md)

## 快速开始

需要 Node.js 20+ 和 npm；构建知识图谱时会自动调用 pnpm（未安装则回退到 `npx pnpm@10.30.3`）。

```bash
npm install
npm run server   # 本地预览：http://localhost:4000
```

| 命令 | 说明 |
| --- | --- |
| `npm run server` | 启动本地开发服务器 |
| `npm run build` | 构建知识图谱 + 生成站点到 `public/` |
| `npm run build:knowledge-map` | 只重新构建知识图谱资源 |
| `npm run clean` | 清理渲染缓存 `db.json` 与 `public/` |
| `npx hexo new "Post Title"` | 按 `scaffolds/` 模板新建内容 |

`public/`、`db.json` 和图片原图都不提交到仓库。

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `source/_posts/` | 文章 |
| `moments/` | 动态内容，每条一个 Markdown 文件 |
| `source/moments/` | 动态页面，内容由 `scripts/moments-feed.js` 注入 |
| `source/_data/recommendations.yml` | 推荐页数据，页面壳在 `source/recommendations/` |
| `source/_data/leetcode.yml` | 刷题记录，页面壳在 `source/leetcode/`，由 `scripts/leetcode.js` 渲染 |
| `knowledge_map/` | 知识图谱前端源码（Vite + React + d3），节点笔记在 `knowledge_map/Nodes/` |
| `source/graph/` | 知识图谱页面与构建产物 `source/graph/assets/` |
| `projects/` | 独立作品工程源码 |
| `source/works/` | 作品页面与静态产物，按 `_config.yml` 的 `skip_render` 原样发布 |
| `source/img/` | 站点图片（`bg` / `doc` / `head` / `moments` / `photo` / `recommendations`） |
| `source/css/`、`source/js/` | 自定义样式与脚本，在 `_config.fluid.yml` 的 `custom_css` / `custom_js` 中注册 |
| `scripts/` | Hexo 插件脚本，只放 `.js`，构建时自动加载 |
| `tools/` | 辅助脚本：知识图谱构建、图片优化、推荐素材处理 |
| `rsync_scripts/` | 相册同步脚本 |
| `scaffolds/` | Hexo 内容模板 |

## 内容维护

### 文章

放在 `source/_posts/`，front matter 至少写 `title`、`date`、`tags`。图片统一放 `source/img/` 下的分类目录，文章里用相对路径（如 `../img/doc/example.webp`）或站点路径引用。

### 动态

每条动态一个 Markdown 文件放在 `moments/` 下，front matter 支持 `date`、`mood`、`location`、`images`，暂时不想发布可以加 `draft: true`。图片放 `source/img/moments/`，字段细节见 [`moments/README.md`](moments/README.md)。

### 推荐页

内容统一写在 `source/_data/recommendations.yml`，`source/recommendations/index.md` 只负责页面外壳（front matter 的 `recommendations_page`、`recommendations_data`）。

- 栏目：`books`、`movies`、`anime`、`music`；每项必填 `title`，常用字段有 `year`、`original`、`cover`、`cover_position`、`rating`、`tags`、`intro`、`comment`、`link`。
- 栏目专属字段：书籍 `author` / `translator` / `publisher` / `pages`，电影 `director` / `cast` / `region` / `duration`，漫剧 `studio` / `episodes`，音乐 `artist` / `type` / `genre` / `tracks`。
- 封面放 `source/img/recommendations/`，不填 `cover` 时自动生成文字封面。
- 试听与播放：`embed: { netease: '歌曲ID' }` 用站内播放器播放网易云外链音源（会员曲目匿名访问会显示“无法播放”，可用 `embed_note` 说明）；`embed: { bilibili: 'BV号' }` 走官方视频嵌入；自有版权音频可以自托管 `audio: /audio/recommendations/<slug>.m4a`。
- 素材工具在 `tools/rec_work/`：`cover.py` 抓封面并转 WebP，`audio.py` 生成试听音频，`merge_recommendations.py` 合并数据片段。
- 数据改动会被插件自动识别并重新渲染（比对页面里的 `data-rec-data` 指纹），改完直接 `npm run build`，不需要先 `hexo clean`。

### 知识图谱

节点笔记写在 `knowledge_map/Nodes/*.md` 的 YAML front matter 里，`tools/generate-knowledge-map-data.js` 把它们生成 `knowledge_map/src/data/graph-data.ts`，再由 `npm run build:knowledge-map` 构建到 `source/graph/assets/`。调试前端：

算法题用 `domain: algorithm` 归到「算法」分类，主题节点（如 `数组`、`双指针`）当枢纽，题目节点用 `instantiates` 挂上去。

```bash
pnpm --dir knowledge_map dev   # http://localhost:3015
```

### 刷题

刷题记录统一写在 `source/_data/leetcode.yml`，`source/leetcode/index.md` 只负责页面外壳（front matter 的 `leetcode_page`、`leetcode_data`），由 `scripts/leetcode.js` 渲染成带统计、难度/标签筛选和搜索的列表。

- 每题字段：`id`（题号）、`title`、`slug`（英文题名）、`difficulty`（`简单` / `中等` / `困难`）、`tags`、`date`（最近一次提交）、`submissions`（总提交数）、`link`、`note`（一句话心得，可选）；文件顶部的 `deck` / `intro` 是页面标题与导语。
- 数据改动会被插件自动识别并重新渲染（比对页面里的 `data-lc-data` 指纹），改完直接 `npm run build`，不必先 `hexo clean`。
- 更新方式：把力扣「我的题目」截图交给 Codex，由 skill `leetcode-journal`（`~/.codex/skills/leetcode-journal/`）补全题号 / 标题 / 难度 / 标签、换算提交日期并跑构建校验。
- 想在图谱里展开的题目，在 `knowledge_map/Nodes/` 下写一个 `domain: algorithm` 的节点，用 `instantiates: [[数组]]`、`[[双指针]]` 之类挂到算法主题上。

### 作品

独立工程源码放 `projects/`（如 `projects/hailmary/`），构建产物同步到 `source/works/<name>/` 后原样发布，`npm run build` 不会重新编译它们。

## 图片规范

- 进仓库的图片尽量用 WebP：照片 `quality≈80`，截图 `≈82`，动图保留帧时长；转换前先比较体积，若同画质下 WebP 没有更小（常见于已压过的 JPEG）就保留原格式。
- 原图只留在本地：`.gitignore` 忽略各目录的原图，`_config.yml` 的 `exclude` 保证本地构建也不产出原图，站点只发布 `.webp`。
- banner 原图可以用 `python3 tools/optimize_bg_images.py` 批量转换。

## 相册

相册原图放本地 `photos/`（已在 `.gitignore` 中），用 rsync 同步到服务器：

```bash
bash rsync_scripts/sync_photos.sh --dry-run   # 预览改动
bash rsync_scripts/sync_photos.sh             # 实际同步
```

目标服务器用 `REMOTE_HOST`、`REMOTE_DIR` 环境变量指定，页面里按 `https://catdfd.com/photos/...` 引用，说明见 [`rsync_scripts/readme.md`](rsync_scripts/readme.md)。

## 部署

push 到 `main` 会触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：安装依赖、构建知识图谱与站点，然后把 `public/` 发布到 `gh-pages` 分支；`source/CNAME` 负责绑定 `catdfd.com`。
