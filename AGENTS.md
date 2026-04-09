# Repository Guidelines

## Project Structure & Module Organization
This repository contains the Hexo source for `catdfd.com`. Write posts in `source/_posts/`, page content in `source/about/` or other subdirectories under `source/`, and reusable templates in `scaffolds/`. Global site settings live in [`_config.yml`](/home/gargantua/projects/gargantua/_config.yml) and theme overrides in [`_config.fluid.yml`](/home/gargantua/projects/gargantua/_config.fluid.yml). Helper scripts belong in `scripts/`; `scripts/sync_photos.sh` syncs local albums from `photos/`. Generated output goes to `public/` and should stay uncommitted.

## Build, Test, and Development Commands
- `npm install`: install Hexo and theme dependencies.
- `npm run server`: start the local dev server.
- `npx hexo new "Post Title"`: create a new draft in `source/_posts/`.
- `npm run clean`: remove cached/generated files.
- `npm run build`: generate the static site into `public/`.
- `bash scripts/sync_photos.sh --dry-run`: preview photo sync changes before uploading.

## Coding Style & Naming Conventions
Use Markdown with YAML front matter for posts and pages. Every post should declare at least `title`, `date`, and `tags`; follow the existing style in `source/_posts/*.md`. Keep headings concise and prefer permanent, descriptive filenames because Hexo uses `:title.md` when creating new posts. Use 2-space indentation in YAML and JSON. Shell scripts should remain POSIX-friendly where practical and keep `set -euo pipefail`.

## Testing Guidelines
There is no separate automated test suite in this repository. The required validation step is a clean site build: run `npm run clean && npm run build` before opening a PR. When changing pages, posts, theme config, or assets, also run `npm run server` and spot-check the affected routes locally.

## Commit & Pull Request Guidelines
Recent history mixes concise content commits with conventional prefixes such as `ci:` and `chore:`. Follow that pattern: use `ci:` or `chore:` for infrastructure/config work, and short imperative summaries for content updates. PRs should state what changed, list local validation commands, link any related issue, and include screenshots for visual/layout changes.

## Security & Deployment Notes
Deployment is handled by GitHub Actions on pushes to `main` via `.github/workflows/deploy.yml`. Do not commit secrets, server credentials, `public/`, `db.json`, or local album data. Prefer environment variables such as `REMOTE_HOST`, `REMOTE_DIR`, and the GitHub Actions secret `DEPLOY_SSH_KEY` for anything deployment-related.
