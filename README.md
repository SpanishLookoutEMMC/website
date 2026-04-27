# Spanish Lookout EMMC · Website

The website for Spanish Lookout EMMC, a Mennonite congregation in the Cayo District of Belize.

## What this is

A static site with a Node.js build step. Source files live in `src/`; the build writes final `.html` files to the repo root. No framework, no database.

## Structure

```
src/
  layout.html         Shared page shell (head, header, footer, nav)
  pages/              One .html file per page (frontmatter + body fragment)
  events/             One .md file per event (frontmatter only)
  news/               One .md file per news article (frontmatter + markdown body)

build.mjs             Build script — reads src/, writes output .html files
serve.mjs             Dev server on http://localhost:3000

assets/
  site.css            One stylesheet for the whole site
  site.js             Small nav helpers

images/               Photos, logos
news/                 Built news article pages (generated — do not edit directly)
*.html                Built top-level pages (generated — do not edit directly)
```

## Build

```bash
npm run build   # one-off build
npm run dev     # build + watch mode + dev server at http://localhost:3000
```

The build script (`build.mjs`):

1. Reads `src/layout.html` as the shared shell.
2. Reads all `src/events/*.md` files, sorts them, and injects upcoming events into `events.html`.
3. Reads all `src/news/*.md` files, builds the news index list, and generates individual article pages under `news/`.
4. Reads all `src/pages/*.html` files, wraps each in the layout, and writes them to the root.

## Editing content

- **Events:** add a new `.md` file in `src/events/` with frontmatter fields `date`, `title`, and optionally `time` and `endDate` (for multi-day events). Re-run the build.
- **News:** add a new `YYYY-MM-DD-slug.md` file in `src/news/` with frontmatter (`date`, `title`, `blurb`, optionally `image` and `description`) followed by a markdown body. Re-run the build.
- **Pages:** edit the corresponding `.html` file in `src/pages/`. Use `{{events-list}}` or `{{news-list}}` as placeholders where the generated lists should appear.
- **Layout/nav:** edit `src/layout.html` or the `NAV` array in `build.mjs`.
- **Sermons:** swap the YouTube video ID in the `<iframe>` placeholders in `src/pages/index.html` and `src/pages/sermons.html`.

## Deploying

The build writes the final site into `dist/`. Serve that directory.

**Cloudflare Pages** — the included `.github/workflows/deploy.yml` handles deployments automatically. Add three repository settings:
- **Secret** `CLOUDFLARE_API_TOKEN` – API token with *Cloudflare Pages: Edit* permission
- **Secret** `CLOUDFLARE_ACCOUNT_ID` – your Cloudflare account ID
- **Variable** `CLOUDFLARE_PROJECT_NAME` – name of your Cloudflare Pages project

Every push to `main` becomes the production deployment. Every other branch gets a preview URL, and pull requests receive an automatic comment with the preview link.

**Netlify** — connect the repo, set build command to `npm run build`, publish directory to `dist`.

**GitHub Pages** — run `npm run build`, then configure Pages to serve from the `dist` folder (requires GitHub Actions deployment or a `gh-pages` branch).

Sundays · 10 AM · Spanish Lookout, Belize
