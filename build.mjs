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

// Top-level order: About (submenu), Sermons, Events, Contact
const NAV = [
  {
    key: 'about',
    href: 'about.html',
    label: 'About',
    children: [
      { key: 'church',     href: 'church.html',     label: 'The Church' },
      { key: 'faith',      href: 'faith.html',      label: 'Our Mission' },
      { key: 'confession', href: 'confession.html', label: 'Confession of Faith' },
      { key: 'history',    href: 'history.html',    label: 'Our History' },
      { key: 'team',       href: 'team.html',       label: 'Staff &amp; Board' },
    ],
  },
  { key: 'sermons', href: 'sermons.html', label: 'Sermons' },
  { key: 'events',  href: 'events.html',  label: 'Events' },
  { key: 'contact', href: 'contact.html', label: 'Contact' },
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

function navItemIsCurrent(item, current) {
  if (item.key === current) return true;
  if (item.children) return item.children.some((c) => c.key === current);
  return false;
}

function buildNav(current, base = '') {
  return NAV.map((item) => {
    if (item.children && item.children.length) {
      const groupActive = navItemIsCurrent(item, current);
      const parentCls = [
        'nav-parent',
        groupActive ? 'current' : '',
      ].filter(Boolean).join(' ');
      const childLinks = item.children.map((c) => {
        const cls = c.key === current ? ' class="current"' : '';
        return `          <a href="${base}${c.href}"${cls}>${c.label}</a>`;
      }).join('\n');
      return `      <div class="nav-item has-submenu${groupActive ? ' is-current' : ''}">
        <a href="${base}${item.href}" class="${parentCls}">${item.label}</a>
        <div class="nav-submenu" role="group" aria-label="${item.label}">
${childLinks}
        </div>
      </div>`;
    }
    const cls = item.key === current ? ' class="current"' : '';
    return `      <a href="${base}${item.href}"${cls}>${item.label}</a>`;
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

function timelineYear(dateStr) {
  const m = String(dateStr || '').match(/\d{4}/);
  return m ? m[0] : '';
}

function buildTimeline() {
  if (!TIMELINE.length) return '';

  let prevYear = '';
  const items = TIMELINE.map((e, i) => {
    const year = timelineYear(e.date);
    const showYear = year && year !== prevYear;
    if (year) prevYear = year;
    const detail = e.detail
      ? `<p class="tl-detail">${esc(e.detail)}</p>`
      : '';
    const imgAttr = e.image ? ` data-image="images/timeline/${esc(e.image)}"` : '';
    const photoIcon = e.image
      ? `<span class="tl-photo-icon" title="Has photo" aria-label="Has photo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <circle cx="12" cy="12" r="3.25"/>
            <circle cx="17.5" cy="8.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </span>`
      : '';
    const yearHtml = showYear
      ? `<span class="tl-year">${esc(year)}</span>`
      : `<span class="tl-year tl-year--spacer" aria-hidden="true"></span>`;
    return `
      <article class="tl-event" data-tl-event${imgAttr} data-title="${esc(e.title)}">
        <div class="tl-rail" aria-hidden="true">
          ${yearHtml}
          <span class="tl-dot"></span>
        </div>
        <div class="tl-branch" aria-hidden="true"></div>
        <div class="tl-block">
          ${photoIcon}
          <div class="tl-date">${esc(e.date)}</div>
          <h3 class="tl-title">${esc(e.title)}</h3>
          ${detail}
        </div>
      </article>`;
  }).join('\n');

  return `
<!-- History timeline -->
<section class="sec-pad tl-section" id="history">
  <div class="wrap">
    <div class="label">Our history</div>
    <h2 class="display h-1" style="margin-top:14px; max-width:720px;">Important events in our history</h2>
    <p class="lead" style="margin-top:20px; max-width:640px;">From the first worship service in 1995 to the life of the church today — a timeline of Spanish Lookout EMMC.</p>
  </div>
  <div class="tl-layout wrap" data-tl>
    <div class="tl-stream">
      <div class="tl-axis-line" aria-hidden="true"></div>
      ${items.trimStart()}
    </div>
    <aside class="tl-figure" data-tl-figure aria-live="polite">
      <div class="tl-figure-frame">
        <img data-tl-figure-img alt="" width="800" height="600">
      </div>
    </aside>
    <!-- Viewport-fixed L-path from active event to image (drawn in JS) -->
    <svg class="tl-connector" data-tl-connector aria-hidden="true">
      <path data-tl-connector-path fill="none"></path>
    </svg>
  </div>
  <p class="tl-note wrap">Not all pictures or dates are guaranteed to be correct.</p>
</section>`.trimStart();
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
const historyTimeline     = buildTimeline();

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
      .replace('{{history-timeline}}',   historyTimeline),
  });

  writeFileSync(join('dist', file), html);
  console.log(`built dist/${file}`);
}
