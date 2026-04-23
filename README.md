# Spanish Lookout EMMC · Website

The website for Spanish Lookout EMMC, a Mennonite congregation in the Cayo District of Belize.

## What this is

Plain static HTML, CSS, and JS. No build step, no framework, no database. Every page is a real `.html` file you can open locally by double-clicking it.

## Structure

```
index.html          Homepage (Psalm 100:4 hero, latest sermon, mission, news)
church.html         About the church + photo gallery
sermons.html        Latest sermon + archive
faith.html          Encourage · Equip · Send (our mission)
events.html         Upcoming events
news.html           News index
membership.html     About congregational membership
team.html           Pastor & leaders
contact.html        Pastor contact, leaders, visit info
explorations.html   Original 3 homepage design directions (kept for reference)

assets/
  site.css          One stylesheet for the whole site
  site.js           Small nav helpers

images/             Photos, logos

news/               One .html file per article
events/             One .md file per event (frontmatter: date, time, title)
```

## Editing content

- **News:** add a new `news/YYYY-MM-DD-slug.html` using an existing article as a template, then add a row to `news.html`.
- **Events:** add a new `.md` file in `events/` with frontmatter (date, time, title). The `events.html` page is currently hand-synced — when you want automation, add a tiny build step that regenerates it from the folder.
- **Sermons:** swap the YouTube video ID in the `<iframe>` placeholders on `index.html` and `sermons.html`.
- **Contacts:** phone numbers, emails, and leader names live in `contact.html`, `membership.html`, `team.html`, and in each page's footer.

## Deploying

Because this is a pure static site, it can go anywhere that serves files:

**Cloudflare Pages or Netlify** — drop the folder in, get a URL. Both support private previews and Git integration.

**GitHub Pages** — push to `main`, then Settings → Pages → deploy from `main` branch, `/ (root)`. Requires the repo to be public (or a paid plan for private).

Sundays · 10 AM · Spanish Lookout, Belize
