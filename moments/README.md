# 动态

每条动态单独保存为一个 Markdown 文件，例如：

```text
moments/2026-09-26-evening-walk.md
```

文件使用 YAML front matter 保存元数据，正文使用 Markdown：

```markdown
---
date: 2026-09-26 20:30:00
mood: 轻松
location: 杭州
images:
  - /img/moments/evening-walk.jpg
---

今天沿江走了一会儿，风很舒服。
```

可选字段：`mood`、`location`、`images`。临时不想发布时，可以设置 `draft: true`；构建时会跳过它。

`images` 支持字符串或对象；对象可额外指定 `alt`、`position`（等同 CSS `object-position`，调整裁剪取景）与 `height`（该图的显示高度，只按需给个别图设置）：

```markdown
images:
  - /img/moments/a.webp
  - src: /img/moments/b.webp
    alt: 西湖远眺
    position: center 75%
    height: 340px
```

图片放在 `source/img/moments/`，动态里使用以 `/img/moments/` 开头的网站路径。少量图片可以直接提交到 GitHub；大量相册图片再考虑对象存储或独立图片服务器。
