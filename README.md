# gargantua

Hexo source repository for `catdfd.com`.

## Local development

```bash
npm install
npx hexo server
```

## Write content

```bash
npx hexo new "post title"
```

Posts are stored in `source/_posts/`.

## Write moments

Keep each short update in its own Markdown file under `moments/`. The YAML
front matter stores the time and optional location, mood, and image list; the
body is regular Markdown. See [`moments/README.md`](moments/README.md) for the
format.

## Build

```bash
npx hexo clean
npx hexo generate

 npm run build
```

Generated output is written to `public/` and is not committed.

## Deployment

Pushes to `main` trigger GitHub Actions, which builds the site and publishes
`public/` to the `gh-pages` branch for GitHub Pages.
