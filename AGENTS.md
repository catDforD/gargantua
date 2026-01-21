# AGENTS.md - 智能体操作指南

本文档为在此代码库中工作的 AI 智能体提供指导。

## 项目概述

这是一个基于 GitHub Pages 的静态个人网站模板，采用纯前端架构，无需构建过程。内容通过 Markdown 文件管理，使用 Bootstrap 5 进行样式布局。

## 常用命令

### 本地预览

由于网站使用 `fetch` API 加载内容，直接打开 `index.html` 会因 CORS 限制无法加载资源：

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```

访问 `http://localhost:8000` 预览效果。

### 部署

```bash
git add .
git commit -m "描述更新内容"
git push
```

GitHub Pages 会自动部署。

## 代码风格规范

### JavaScript (`static/js/scripts.js`)

- **变量命名**：使用 camelCase，如 `content_dir`、`section_names`
- **常量命名**：使用全大写下划线分隔，如 `content_dir`、`config_file`
- **事件监听**：使用 `addEventListener`，优先使用箭头函数
- **错误处理**：所有 fetch 操作必须添加 `.catch(error => console.log(error))`
- **DOM 操作**：使用 `document.querySelector` 和 `document.getElementById`
- **数组方法**：优先使用 `forEach`、`map` 等函数式方法

示例：
```javascript
const content_dir = 'contents/';
const section_names = ['home', 'awards', 'experience', 'publications'];

window.addEventListener('DOMContentLoaded', event => {
    // 初始化逻辑
});
```

### CSS (`static/css/main.css`)

- **变量**：使用 CSS 自定义属性（`:root`），前缀加厂商前缀如 `--h-title-color`
- **选择器**：使用类选择器为主，ID 选择器用于唯一元素
- **响应式**：使用媒体查询 `@media screen and (max-width: 991px)`
- **单位**：rem 用于字体大小，px 用于边框和阴影，calc() 用于动态计算
- **颜色**：优先使用 CSS 变量，便于主题切换

示例：
```css
:root {
    --h-title-color: #3948d2;
}

.header {
    border-bottom: solid 2px var(--bs-blue);
    z-index: 10000;
}
```

### HTML (`index.html`)

- **属性顺序**：`id` > `class` > `data-*` > `href/src` > 其他属性
- **语义化标签**：使用 `<nav>`、`<section>`、`<header>`、`<footer>`
- **图标**：使用 Bootstrap Icons（`<i class="bi-xxx"></i>`）

### Markdown (`contents/*.md`)

- 支持标准 Markdown 语法
- 支持 LaTeX 数学公式（`$...$` 或 `$$...$$`）
- 无需额外配置，直接编辑即可

## 添加新板块流程

若需添加新板块（如 "Projects"），需同步修改三个位置：

1. **`index.html`**：在导航栏添加链接，在 `<body>` 中添加 `<section>` 元素
2. **`static/js/scripts.js`**：在 `section_names` 数组中添加名称
3. **`contents/`**：创建对应的 `.md` 文件

## 技术栈参考

- **Bootstrap 5**：CDN 加载，样式类使用 `.navbar-*`、`.container-*` 等
- **Marked.js**：Markdown 解析，配置 `marked.use({ mangle: false, headerIds: false })`
- **js-yaml**：YAML 配置解析，使用 `jsyaml.load(text)`
- **MathJax 3**：数学公式渲染，配置 `MathJax.typeset()`

## 重要注意事项

- **不要修改** `static/js/` 目录下的第三方库文件（`*.min.js`）
- **不要修改** `static/css/styles.css`（Bootstrap 源码）
- 图片路径始终相对于 `index.html`，使用 `static/` 前缀
- 修改内容后刷新浏览器查看效果（可能需要 Ctrl+Shift+R 清除缓存）
- 查阅 CLAUDE.md 获取更详细的项目文档

## Github Pages 部署注意事项
- 请使用中文规范编写commit message
- 部署前确保所有文件已提交到 Git 仓库
- 确保 `index.html` 位于仓库根目录
- 仓库设置中启用 GitHub Pages，选择 `main` 分支
- 部署后访问 `https://catdford.github.io/gargantua/`