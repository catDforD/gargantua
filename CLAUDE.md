# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 GitHub Pages 的静态个人网站模板，适用于学术和求职场景。项目采用**纯前端架构**，无需构建过程，内容通过 Markdown 文件管理。

## 网站架构

### 核心设计模式

网站采用**内容驱动** 的架构：

1. **内容层** (`contents/`)：所有文本内容存储为 Markdown 文件
2. **配置层** (`contents/config.yml`)：网站全局配置
3. **展示层** (`static/`)：静态资源（CSS、JS、图片）
4. **入口** (`index.html`)：单页面应用，通过 JavaScript 动态加载内容

### 动态加载机制

`static/js/scripts.js` 在页面加载时执行以下操作：

1. 读取 `contents/config.yml`，将配置项注入到对应 `id` 的 HTML 元素中
2. 遍历 `section_names` 数组，读取对应的 `.md` 文件
3. 使用 `marked.min.js` 将 Markdown 转换为 HTML
4. 使用 `MathJax` 渲染数学公式

**重要**：若要添加新的页面板块，需要同时修改：
- `scripts.js` 中的 `section_names` 数组
- `index.html` 中对应的 `<section>` 元素

## 常用命令

### 本地预览

由于网站通过 `fetch` API 加载内容文件，直接打开 `index.html` 会因 CORS 限制无法加载资源。需使用本地服务器：

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (需要安装 http-server)
npx http-server
```

访问 `http://localhost:8000` 预览网站。

### 部署到 GitHub Pages

```bash
git add .
git commit -m "描述更新内容"
git push
```

GitHub Pages 会自动部署。仓库应命名为 `<username>.github.io`，访问地址为 `https://<username>.github.io`。

## 文件结构说明

```
gargantua/
├── contents/              # 内容目录
│   ├── config.yml        # 全局配置（标题、版权信息等）
│   ├── home.md           # 主页内容
│   ├── awards.md         # 荣誉奖项
│   ├── experience.md     # 工作经历
│   └── publications.md   # 发表论文
├── static/
│   ├── assets/
│   │   ├── img/
│   │   │   ├── background.jpeg  # 顶部背景图
│   │   │   └── photo.png        # 个人头像
│   │   └── favicon.ico          # 网站图标
│   ├── css/
│   │   ├── styles.css           # Bootstrap 样式
│   │   └── main.css             # 自定义样式
│   └── js/
│       ├── scripts.js           # 核心逻辑（内容加载）
│       ├── marked.min.js        # Markdown 解析器
│       └── js-yaml.min.js       # YAML 解析器
└── index.html            # 网站入口
```

## 编辑内容指南

### 修改网站配置

编辑 `contents/config.yml`：

```yaml
title: 网站标题
page-top-title: 导航栏显示名称
top-section-bg-text: 顶部背景文字
home-subtitle: 主页副标题
copyright-text: 版权信息
```

### 修改板块内容

直接编辑 `contents/` 目录下对应的 `.md` 文件，支持标准 Markdown 语法和 LaTeX 数学公式。

### 替换图片

- 头像：`static/assets/img/photo.png`
- 背景图：`static/assets/img/background.jpeg`
- 图标：`static/assets/favicon.ico`

## 添加新板块

若需添加新板块（如 "Projects"），需修改三个文件：

1. **`index.html`**：添加导航链接和对应的 `<section>` 元素
2. **`static/js/scripts.js`**：在 `section_names` 数组中添加新板块名称
3. **`contents/`**：创建对应的 `.md` 文件

## 技术栈

- **前端框架**：Bootstrap 5
- **Markdown 解析**：Marked.js
- **YAML 解析**：js-yaml
- **数学公式**：MathJax 3
- **字体**：Google Fonts (Newsreader, Mulish, Kanit)
- **图标**：Bootstrap Icons

## 注意事项

- 网站使用 CDN 加载 Bootstrap 和 Google Fonts，需要网络连接
- 图片路径应相对于 `index.html`，使用 `static/` 前缀
- 修改内容后需刷新浏览器查看效果（清除缓存可能需要 Ctrl+Shift+R）
