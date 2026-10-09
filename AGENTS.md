# 仓库开发规范

## 项目结构与模块组织
本仓库是 `catdfd.com` 的 Hexo 源码。文章写在 `source/_posts/`，页面内容写在 `source/about/` 或 `source/` 下的其他子目录，可复用模板放在 `scaffolds/`。站点全局配置在 [`_config.yml`](_config.yml)，主题覆盖配置在 [`_config.fluid.yml`](_config.fluid.yml)。构建产物输出到 `public/`，不要提交到仓库。

脚本目录的分工如下，放错位置会导致构建失败：

- `scripts/`：**Hexo 插件脚本目录**，Hexo 在构建和启动服务时会自动加载其中每个 `.js` 文件。只放 Hexo 插件（如 `moments-feed.js`、`recommendations.js`、`leetcode.js`），不要放非 JavaScript 文件。
- `tools/`：通用辅助脚本，不属于 Hexo 插件（如 `build-knowledge-map.sh`、`generate-knowledge-map-data.js`、`optimize_bg_images.py`）。
- `rsync_scripts/`：本地相册同步到服务器（`sync_photos.sh`）。

## 构建、测试与开发命令
- `npm install`：安装 Hexo 与主题依赖。
- `npm run server`：启动本地开发服务器。
- `npx hexo new "Post Title"`：在 `source/_posts/` 下创建新草稿。
- `npm run clean`：清理缓存与构建产物。
- `npm run build`：生成静态站点到 `public/`。
- `bash rsync_scripts/sync_photos.sh --dry-run`：预览相册同步改动，确认后再上传。

## 代码风格与命名约定
文章和页面使用带 YAML front matter 的 Markdown。每篇文章至少声明 `title`、`date` 和 `tags`，并遵循 `source/_posts/*.md` 中已有的写法。标题保持简短；文件名要有描述性且尽量固定，因为 Hexo 新建文章时按 `:title.md` 命名。YAML 和 JSON 使用 2 空格缩进。Shell 脚本尽量保持 POSIX 兼容，并保留 `set -euo pipefail`。

## 测试指南
本仓库没有独立的自动化测试套件。必需的验证步骤是一次干净的站点构建：开 PR 前运行 `npm run clean && npm run build`。改动页面、文章、主题配置或资源时，还要运行 `npm run server` 并在本地抽查受影响的路径。

## 提交与 Pull Request 规范
近期历史中既有简洁的内容提交，也有 `ci:`、`chore:` 这类约定式前缀。沿用这个习惯：基础设施和配置类改动使用 `ci:` 或 `chore:`，内容更新使用简短的祈使句摘要。PR 需要说明改了什么、列出本地验证命令、关联相关 issue；涉及视觉或布局变更时附上截图。

## 安全与部署说明
站点部署由 GitHub Actions 完成：push 到 `main` 后由 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 构建并发布到 `gh-pages` 分支。不要提交密钥、服务器凭据、`public/`、`db.json` 或本地相册数据。相册同步脚本通过 `REMOTE_HOST` 和 `REMOTE_DIR` 环境变量指定目标服务器，涉及部署的配置优先使用环境变量而非硬编码。

## 图片处理说明
凡是要传上 github 仓库的图片都尽可能在不影响画质的情况下使用 webp 格式以压缩大小，原图留在本地即可。
用户可能会直接放其它大格式图片在目录下，后续会被提交到远程，如果满足不影响画质的条件，则请自动帮用户将图片处理成 webp 格式并使用 webp 格式图片。

执行约定：

- 转换前先比较体积与画质（可用 PSNR ≥ 40dB 作为「画质不变」的下限）：若同画质下 WebP 没有更小（常见于已压过的照片 JPEG），保留原格式和原文件。
- 原图（master）只留在本地，不进仓库：在 `.gitignore` 按目录加规则，并用 `git rm --cached` 取消跟踪（磁盘文件保留）。`_config.yml` 的 `exclude` 只对「目录里全是原图」的情况加通配规则（如 `img/bg/*.png`），让本地构建也不产出原图；同一目录里仍有图片要按原格式发布时不做排除。
- 新增图片的流程：放原图 → 用 Pillow 生成同目录同名 `.webp`（照片 `quality≈80`，截图 `≈82`，动图 `save_all=True` 保留帧时长）→ 更新引用后跑 `npm run clean && npm run build` 校验。
