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

## Build

```bash
npx hexo clean
npx hexo generate
```

Generated output is written to `public/` and is not committed.

## Deployment

Pushes to `main` trigger GitHub Actions, which builds the site and syncs `public/`
to the production server at `catdfd.com`.
