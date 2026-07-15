import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';

const layout = readFileSync('src/layout.html', 'utf8');
const DATA = JSON.parse(readFileSync('src/data.json', 'utf8'));

let SERMONS = [];
try { SERMONS = JSON.parse(readFileSync('src/sermons.json', 'utf8')); } catch { /* no file yet */ }

let TIMELINE = [];
try { TIMELINE = JSON.parse(readFileSync('src/timeline.json', 'utf8')); } catch { /* no file yet */ }

function applyData(str) {
  let out = str;
  for (const [k, v] of Object.entries(DATA)) out = out.replaceAll(`{{${k}}}`, v);
  return out;
}

const NAV = [
  { key: 'church',  href: 'church.html',  label: 'The Church' },
  { key: 'team',    href: 'team.html',    label: 'Staff &amp; Board'   },
  { key: 'sermons', href: 'sermons.html', label: 'Sermons'    },
  { key: 'faith',       href: 'faith.html',       label: 'Our Mission'       },
  { key: 'confession',  href: 'confession.html',  label: 'Confession of Faith' },
  { key: 'contact', href: 'contact.html', label: 'Contact'    },
];

function parseFrontmatter(src) {
  const lines = src.split('\n');
  if (lines[0].trim() !== '---') return { meta: {}, body: src };
  const end = lines.indexOf('---', 1);
  if (end === -1) return { meta: {}, body: src };
  const meta = {};
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([\w-]+):\s*(.+)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta, body: lines.slice(end + 1).join('\n').trimStart() };
}

function buildNav(current, base = '') {
  return NAV.map(({ key, href, label }) => {
    const cls = key === current ? ' class="current"' : '';
    return `      <a href="${base}${href}"${cls}>${label}</a>`;
  }).join('\n');
}

function applyLayout({ title, description, extraHead = '', headerClass = '', base = '', current = '', body }) {
  const html = layout
    .replaceAll('{{base}}', base)
    .replace('{{title}}', title)
    .replace('{{description}}', description)
    .replace('{{extra-head}}', extraHead ? extraHead + '\n' : '')
    .replace('{{header-class}}', headerClass ? ` ${headerClass}` : '')
    .replace('{{nav}}', buildNav(current, base))
    .replace('{{body}}', body);
  return applyData(html);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Sermons (from src/sermons.json, populated by scripts/fetch-sermons.mjs)

function sermonVideoUrl(s) { return `https://www.youtube.com/watch?v=${esc(s.videoId)}`; }
function sermonEmbedUrl(s) { return `https://www.youtube.com/embed/${esc(s.videoId)}`; }
function sermonIframe(s, extra = '') {
  return `<iframe width="560" height="315" src="${sermonEmbedUrl(s)}" title="${esc(s.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"${extra}></iframe>`;
}
function sermonMeta(s)     { return [s.speaker, s.dateStr].filter(Boolean).join(' · '); }

function buildLatestSermonHero() {
  const s = SERMONS[0];
  if (!s) return '';
  return `
<!-- Latest sermon -->
<section class="sec-pad-s">
  <div class="wrap">
    <div class="label">Latest sermon</div>
    <h2 class="display h-1" style="margin-top:8px; max-width:820px;">${esc(s.title)}</h2>
    <div style="font-size:14px; color:var(--muted); margin-top:10px;">${esc(sermonMeta(s))}</div>
    <div class="video-frame" style="margin-top:36px; max-width:920px;">
      ${sermonIframe(s)}
    </div>
  </div>
</section>`.trimStart();
}

function buildSermonsList() {
  const rest = SERMONS.slice(1);
  if (!rest.length) return `    <p style="color:var(--muted); padding:24px 0;">No previous sermons available.</p>`;
  return rest.map(s => `
    <a class="sermon-row" href="${sermonVideoUrl(s)}">
      <div class="date">${esc(s.dateStr)}</div>
      <div>
        <h3>${esc(s.title)}</h3>
        ${s.speaker ? `<div class="who">${esc(s.speaker)}</div>` : ''}
      </div>
      <div class="arrow">→</div>
    </a>`).join('\n');
}

function buildLatestSermonCard() {
  const s = SERMONS[0];
  if (!s) return '';
  return `
        <div class="label">Latest sermon</div>
        <h3 class="display h-2" style="margin-top:6px">${esc(s.title)}</h3>
        <div style="font-size:13px; color:var(--muted); margin-top:4px;">${esc(sermonMeta(s))}</div>
        <div class="video-frame" style="margin-top:18px">
          ${sermonIframe(s)}
        </div>
        <div style="margin-top:14px; display:flex; gap:22px; flex-wrap:wrap;">
          <a href="${sermonVideoUrl(s)}" class="tlink">Watch on YouTube →</a>
          <a href="sermons.html" class="tlink">Sermon archive →</a>
        </div>`.trimStart();
}

function buildRecentSermons() {
  const recent = SERMONS.slice(1, 4);
  if (!recent.length) return '';
  const cards = recent.map(s => `
      <div>
        <h4 class="h-4" style="margin-top:8px">
          <a href="${sermonVideoUrl(s)}" style="color:inherit; text-decoration:none;">${esc(s.title)}</a>
        </h4>
        <div style="font-size:12.5px; color:var(--muted); margin-top:6px;">${esc(sermonMeta(s))}</div>
        <hr class="hr" style="margin-top:18px; opacity:.5">
      </div>`).join('\n');
  return `
<!-- Recent messages -->
<section style="padding-bottom: 96px;">
  <div class="wrap">
    <div class="label">Recent messages</div>
    <hr class="hr" style="margin-top:8px">
    <div class="grid grid-3" style="margin-top:24px">
      ${cards.trimStart()}
    </div>
  </div>
</section>`.trimStart();
}

// ---------------------------------------------------------------------------
// Church history timeline (from src/timeline.json)

function buildTimeline() {
  if (!TIMELINE.length) return '';
  const items = TIMELINE.map((e, i) => {
    const side = i % 2 === 0 ? 'left' : 'right';
    const img = e.image
      ? `<div class="timeline-photo"><img src="images/timeline/${esc(e.image)}" alt="${esc(e.title)}" width="600" height="400" loading="lazy" decoding="async"></div>`
      : '';
    const detail = e.detail
      ? `<p class="timeline-detail">${esc(e.detail)}</p>`
      : '';
    return `
      <article class="timeline-item timeline-${side}" data-timeline-item>
        <div class="timeline-marker" aria-hidden="true"></div>
        <div class="timeline-card">
          ${img}
          <div class="timeline-date">${esc(e.date)}</div>
          <h3 class="timeline-title">${esc(e.title)}</h3>
          ${detail}
        </div>
      </article>`;
  }).join('\n');

  return `
<!-- History timeline -->
<section class="sec-pad timeline-section" id="history">
  <div class="wrap">
    <div class="label">Our history</div>
    <h2 class="display h-1" style="margin-top:14px; max-width:720px;">Thirty years of God’s faithfulness.</h2>
    <p class="lead" style="margin-top:20px; max-width:640px;">From the first worship service in 1995 to the life of the church today — a timeline of Spanish Lookout EMMC.</p>
    <p style="margin-top:20px;"><a href="history.html" class="btn">Explore the interactive timeline →</a></p>
    <div class="timeline" data-timeline>
      <div class="timeline-line" aria-hidden="true"></div>
      ${items.trimStart()}
    </div>
    <p class="timeline-note">Not all pictures or dates are guaranteed to be correct.</p>
  </div>
</section>`.trimStart();
}

// ---------------------------------------------------------------------------
// History page — GSAP scrollable + draggable horizontal timeline
// Pattern: https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/

function buildHistoryGsap() {
  if (!TIMELINE.length) return '';

  const navItems = TIMELINE.map((e, i) => {
    const id = `event-${i}`;
    return `
          <li>
            <a href="#${id}" class="history-nav__link" data-link><span>${esc(e.date)}</span></a>
          </li>`;
  }).join('');

  const sections = TIMELINE.map((e, i) => {
    const id = `event-${i}`;
    const img = e.image
      ? `<figure class="history-section__image">
            <img src="images/timeline/${esc(e.image)}" alt="${esc(e.title)}" width="900" height="600" loading="lazy" decoding="async">
          </figure>`
      : '';
    const detail = e.detail
      ? `<p class="history-section__detail">${esc(e.detail)}</p>`
      : '';
    const textOnly = e.image ? '' : ' history-section--text-only';
    return `
    <section class="history-section${textOnly}" id="${id}" data-history-section style="--i: ${i}">
      <div class="history-section__inner">
        <div class="history-section__content">
          <p class="history-section__date">${esc(e.date)}</p>
          <h2 class="history-section__heading">${esc(e.title)}</h2>
          ${detail}
        </div>
        ${img}
      </div>
    </section>`;
  }).join('\n');

  return `
<div class="history-page">
  <nav class="history-nav" aria-label="Timeline navigation">
    <div class="history-nav__marker" aria-hidden="true"></div>
    <div class="history-nav__track" data-draggable>
      <ul class="history-nav__list">
${navItems}
      </ul>
    </div>
  </nav>

  <header class="history-intro">
    <div class="label">Our history</div>
    <h1 class="display h-1" style="margin-top:12px;">Thirty years of God’s faithfulness.</h1>
    <p class="lead">Scroll the page, drag the timeline, or click a date to move through the story of Spanish Lookout EMMC.</p>
    <a href="church.html" class="tlink">← Back to The Church</a>
  </header>

  <main class="history-main">
${sections}
  </main>

  <p class="history-footer-note">Not all pictures or dates are guaranteed to be correct.</p>
</div>`.trimStart();
}

// ---------------------------------------------------------------------------
// Run

mkdirSync('dist', { recursive: true });
cpSync('src/assets', 'dist/assets', { recursive: true });
cpSync('src/images', 'dist/images', { recursive: true });

const latestSermonHero    = buildLatestSermonHero();
const sermonsList         = buildSermonsList();
const latestSermonCard    = buildLatestSermonCard();
const recentSermons       = buildRecentSermons();
const churchTimeline      = buildTimeline();
const historyGsap         = buildHistoryGsap();

const pages = readdirSync('src/pages').filter(f => f.endsWith('.html'));

for (const file of pages) {
  const src = readFileSync(join('src/pages', file), 'utf8');
  const { meta, body } = parseFrontmatter(src);

  let extraHead = '';
  let pageBody = body;
  const styleMatch = body.match(/^(<style[\s\S]*?<\/style>)\n*/);
  if (styleMatch) {
    extraHead = styleMatch[1];
    pageBody = body.slice(styleMatch[0].length);
  }

  const html = applyLayout({
    title: meta.title || 'Spanish Lookout EMMC',
    description: meta.description || '',
    extraHead,
    headerClass: meta['header-class'] || '',
    current: meta.current || '',
    body: pageBody.trimEnd()
      .replace('{{latest-sermon-hero}}', latestSermonHero)
      .replace('{{sermons-list}}',       sermonsList)
      .replace('{{latest-sermon-card}}', latestSermonCard)
      .replace('{{recent-sermons}}',     recentSermons)
      .replace('{{church-timeline}}',    churchTimeline)
      .replace('{{history-gsap}}',       historyGsap),
  });

  writeFileSync(join('dist', file), html);
  console.log(`built dist/${file}`);
}
