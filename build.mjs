import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

const layout = readFileSync('src/layout.html', 'utf8');
const DATA = JSON.parse(readFileSync('src/data.json', 'utf8'));

let SERMONS = [];
try { SERMONS = JSON.parse(readFileSync('src/sermons.json', 'utf8')); } catch { /* no file yet */ }

function applyData(str) {
  let out = str;
  for (const [k, v] of Object.entries(DATA)) out = out.replaceAll(`{{${k}}}`, v);
  return out;
}

const NAV = [
  { key: 'church',  href: 'church.html',  label: 'The Church' },
  { key: 'team',    href: 'team.html',    label: 'The Team'   },
  { key: 'sermons', href: 'sermons.html', label: 'Sermons'    },
  { key: 'faith',       href: 'faith.html',       label: 'Our Mission'       },
  { key: 'confession',  href: 'confession.html',  label: 'Confession of Faith' },
  { key: 'events',  href: 'events.html',  label: 'Events'     },
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

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(dateStr) {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Events

function buildEventsList() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const files = readdirSync('src/events').filter(f => f.endsWith('.md'));
  const events = files.map(f => {
    const { meta } = parseFrontmatter(readFileSync(join('src/events', f), 'utf8'));
    return { ...meta, slug: f.replace('.md', '') };
  });

  events.sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = events.filter(e => parseDate(e.endDate || e.date) >= today);

  const thisWeek = upcoming.filter(e => parseDate(e.date) < nextWeek);
  const comingUp = upcoming.filter(e => parseDate(e.date) >= nextWeek);

  function renderRow(e) {
    const start = parseDate(e.date);
    const mon = start.toLocaleDateString('en-US', { month: 'short' });
    const day = start.getDate();
    const dow = start.toLocaleDateString('en-US', { weekday: 'short' });

    let dayHtml, dowText;
    if (e.endDate) {
      const endD = parseDate(e.endDate);
      dayHtml = `${day}<span style="font-size:22px; color:var(--muted);">–${endD.getDate()}</span>`;
      dowText = `${dow}–${endD.toLocaleDateString('en-US', { weekday: 'short' })}`;
    } else {
      dayHtml = `${day}`;
      dowText = dow;
    }

    let timeText;
    if (e.time) {
      const dayName = start.toLocaleDateString('en-US', { weekday: 'long' });
      timeText = `${dayName} <span class="dot">·</span> ${formatTime(e.time)}`;
    } else if (e.endDate) {
      const endD = parseDate(e.endDate);
      const startName = start.toLocaleDateString('en-US', { weekday: 'long' });
      const endName = endD.toLocaleDateString('en-US', { weekday: 'long' });
      timeText = `${startName} through ${endName} <span class="dot">·</span> multi-day`;
    } else {
      timeText = start.toLocaleDateString('en-US', { weekday: 'long' });
    }

    return `
    <a class="event-row" href="events/${esc(e.slug)}.html">
      <div class="event-date">
        <div class="mon">${esc(mon)}</div>
        <div class="day">${dayHtml}</div>
        <div class="dow">${esc(dowText)}</div>
      </div>
      <div>
        <h3>${esc(e.title)}</h3>
        <div class="time">${timeText}</div>
      </div>
      <div class="arrow">→</div>
    </a>`;
  }

  if (!upcoming.length) {
    return `    <p style="color:var(--muted); padding: 32px 0;">No upcoming events at this time.</p>`;
  }

  let html = '';
  if (thisWeek.length) {
    html += `    <div class="label">This week</div>\n    <hr class="hr" style="margin-top:8px;">\n`;
    html += thisWeek.map(renderRow).join('\n');
  }
  if (comingUp.length) {
    const topMargin = thisWeek.length ? ' style="margin-top:48px;"' : '';
    html += `\n    <div class="label"${topMargin}>Coming up</div>\n    <hr class="hr" style="margin-top:8px;">\n`;
    html += comingUp.map(renderRow).join('\n');
  }
  return html;
}

// ---------------------------------------------------------------------------
// Event detail pages

function buildEventPages() {
  const files = readdirSync('src/events').filter(f => f.endsWith('.md'));
  const events = files.map(f => {
    const src = readFileSync(join('src/events', f), 'utf8');
    const { meta, body } = parseFrontmatter(src);
    return { ...meta, slug: f.replace('.md', ''), body };
  });
  events.sort((a, b) => a.date.localeCompare(b.date));

  for (const e of events) {
    const start = parseDate(e.date);
    let dateTimeHtml = formatDate(e.date);
    if (e.endDate) {
      dateTimeHtml += ` – ${formatDate(e.endDate)}`;
    }
    if (e.time) dateTimeHtml += ` <span class="dot">·</span> ${formatTime(e.time)}`;

    const eventBody = `<section class="page-hero">
  <div class="wrap">
    <div class="trail"><a href="../events.html" style="color:inherit; text-decoration:none;">Events</a> · ${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
    <h1>${esc(e.title)}</h1>
    <p class="sub">${dateTimeHtml}</p>
  </div>
</section>
<section style="padding-bottom: 96px;">
  <div class="wrap">
    <div class="prose">
      ${marked.parse(e.body || '').trim()}
    </div>
    <div style="max-width: 700px; margin: 56px auto 0;">
      <hr class="hr">
      <div style="padding-top: 20px; font-size: 13px;">
        <a href="../events.html" class="tlink">← All events</a>
      </div>
    </div>
  </div>
</section>`;

    const html = applyLayout({
      title: `${e.title} — Spanish Lookout EMMC`,
      description: e.body ? e.body.split('\n')[0].trim() : '',
      base: '../',
      current: 'events',
      body: eventBody.trimEnd(),
    });

    writeFileSync(join('dist', 'events', `${e.slug}.html`), html);
    console.log(`built dist/events/${e.slug}.html`);
  }
}

// ---------------------------------------------------------------------------
// Upcoming events strip (home page)

function buildUpcomingEventsStrip() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const files = readdirSync('src/events').filter(f => f.endsWith('.md'));
  const events = files.map(f => {
    const { meta } = parseFrontmatter(readFileSync(join('src/events', f), 'utf8'));
    return { ...meta, slug: f.replace('.md', '') };
  });
  events.sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = events.filter(e => parseDate(e.endDate || e.date) >= today).slice(0, 3);

  if (!upcoming.length) return '';

  const cards = upcoming.map(e => {
    const start = parseDate(e.date);
    const dateLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    let meta = dateLabel;
    if (e.time) meta += ` · ${formatTime(e.time)}`;
    return `
      <div>
        <h4 class="h-4" style="margin-top:8px">
          <a href="events/${esc(e.slug)}.html" style="color:inherit; text-decoration:none;">${esc(e.title)}</a>
        </h4>
        <div style="font-size:12.5px; color:var(--muted); margin-top:6px;">${esc(meta)}</div>
        <hr class="hr" style="margin-top:18px; opacity:.5">
      </div>`;
  }).join('\n');

  return `
<!-- Upcoming events -->
<section style="padding-bottom: 96px;">
  <div class="wrap">
    <div class="label">Upcoming events</div>
    <hr class="hr" style="margin-top:8px">
    <div class="grid grid-3" style="margin-top:24px">
      ${cards.trimStart()}
    </div>
    <div style="margin-top:32px;">
      <a href="events.html" class="tlink">All events →</a>
    </div>
  </div>
</section>`.trimStart();
}

// ---------------------------------------------------------------------------
// News index

function buildNewsList() {
  const files = readdirSync('src/news').filter(f => f.endsWith('.md'));
  const articles = files.map(f => {
    const { meta } = parseFrontmatter(readFileSync(join('src/news', f), 'utf8'));
    return { ...meta, slug: f.replace('.md', '') };
  });
  articles.sort((a, b) => b.date.localeCompare(a.date));

  return articles.map(a => `    <a class="news-row" href="news/${a.slug}.html">
      <div class="date">${formatDate(a.date)}</div>
      <div>
        <h3>${esc(a.title)}</h3>
        <div class="blurb">${esc(a.blurb || '')}</div>
      </div>
      <div class="arrow">→</div>
    </a>`).join('\n');
}

// ---------------------------------------------------------------------------
// News strip (latest article with a link)

function buildNewsStrip() {
  const files = readdirSync('src/news').filter(f => f.endsWith('.md'));
  const articles = files.map(f => {
    const { meta } = parseFrontmatter(readFileSync(join('src/news', f), 'utf8'));
    return { ...meta, slug: f.replace('.md', '') };
  });
  articles.sort((a, b) => b.date.localeCompare(a.date));
  const latest = articles[0];
  if (!latest) return '';
  return `<!-- News strip -->
<aside class="news-strip">
  <div class="inner">
    <div class="label cream">Latest news</div>
    <a href="news/${esc(latest.slug)}.html" class="title" style="text-decoration:none; color:inherit;">${esc(latest.title)} <span class="date">${formatDate(latest.date)}</span></a>
    <a href="news.html" class="tlink light">All news →</a>
  </div>
</aside>`;
}

// ---------------------------------------------------------------------------
// News article pages

function buildNewsArticles() {
  const files = readdirSync('src/news').filter(f => f.endsWith('.md'));
  const articles = files.map(f => {
    const src = readFileSync(join('src/news', f), 'utf8');
    const { meta, body } = parseFrontmatter(src);
    return { ...meta, slug: f.replace('.md', ''), body };
  });
  articles.sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const older = i > 0 ? articles[i - 1] : null;

    const imageHtml = a.image ? `
<section class="sec-pad-s">
  <div class="wrap">
    <div style="height: 460px; background-image: url('../images/${a.image}'); background-size: cover; background-position: center 30%;"></div>
  </div>
</section>` : '';

    const olderLink = older
      ? `<a href="${older.slug}.html" class="tlink">Previous: ${esc(older.title)} →</a>`
      : '';

    const articleBody = `<section class="page-hero">
  <div class="wrap">
    <div class="trail"><a href="../news.html" style="color:inherit; text-decoration:none;">News</a> · ${formatDate(a.date)}</div>
    <h1>${esc(a.title)}</h1>
    <p class="sub">${esc(a.blurb || '')}</p>
  </div>
</section>
${imageHtml}
<section style="padding-bottom: 96px;">
  <div class="wrap">
    <div class="prose">
      ${marked.parse(a.body || '').trim()}
    </div>
    <div style="max-width: 700px; margin: 56px auto 0;">
      <hr class="hr">
      <div style="display:flex; justify-content:space-between; padding-top: 20px; font-size: 13px;">
        <a href="../news.html" class="tlink">← All news</a>
        ${olderLink}
      </div>
    </div>
  </div>
</section>`;

    const html = applyLayout({
      title: `${a.title} — Spanish Lookout EMMC`,
      description: a.description || a.blurb || '',
      base: '../',
      current: 'news',
      body: articleBody.trimEnd(),
    });

    writeFileSync(join('dist', 'news', `${a.slug}.html`), html);
    console.log(`built dist/news/${a.slug}.html`);
  }
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
    <div class="grid grid-bias-right" style="margin-top:36px;">
      <div class="video-frame">
        ${sermonIframe(s)}
      </div>
      <div>
        <div class="label">Watch</div>
        <hr class="hr" style="margin-top:8px;">
        <div style="margin-top:18px;">
          <a href="${sermonVideoUrl(s)}" class="tlink">Watch on YouTube →</a>
        </div>
      </div>
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

function buildUpcomingEventsSection() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const files = readdirSync('src/events').filter(f => f.endsWith('.md'));
  const events = files.map(f => {
    const { meta } = parseFrontmatter(readFileSync(join('src/events', f), 'utf8'));
    return meta;
  });

  events.sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = events.filter(e => parseDate(e.endDate || e.date) >= today).slice(0, 3);

  function renderEventCard(e) {
    const start = parseDate(e.date);
    const mon = start.toLocaleDateString('en-US', { month: 'short' });
    const day = start.getDate();
    const dow = start.toLocaleDateString('en-US', { weekday: 'short' });

    let dayHtml, dowText;
    if (e.endDate) {
      const endD = parseDate(e.endDate);
      dayHtml = `${day}<span style="font-size:22px; color:var(--muted);">–${endD.getDate()}</span>`;
      dowText = `${dow}–${endD.toLocaleDateString('en-US', { weekday: 'short' })}`;
    } else {
      dayHtml = `${day}`;
      dowText = dow;
    }

    let timeText;
    if (e.time) {
      const dayName = start.toLocaleDateString('en-US', { weekday: 'long' });
      timeText = `${dayName} <span class="dot">·</span> ${formatTime(e.time)}`;
    } else if (e.endDate) {
      const endD = parseDate(e.endDate);
      const startName = start.toLocaleDateString('en-US', { weekday: 'long' });
      const endName = endD.toLocaleDateString('en-US', { weekday: 'long' });
      timeText = `${startName} through ${endName} <span class="dot">·</span> multi-day`;
    } else {
      timeText = start.toLocaleDateString('en-US', { weekday: 'long' });
    }

    return `
    <a class="event-row" href="events.html">
      <div class="event-date">
        <div class="mon">${esc(mon)}</div>
        <div class="day">${dayHtml}</div>
        <div class="dow">${esc(dowText)}</div>
      </div>
      <div>
        <h3>${esc(e.title)}</h3>
        <div class="time">${timeText}</div>
      </div>
      <div class="arrow">→</div>
    </a>`;
  }

  const rows = upcoming.length
    ? upcoming.map(renderEventCard).join('\n')
    : `    <p style="color:var(--muted); padding: 32px 0;">No upcoming events at this time.</p>`;

  return `
<!-- Upcoming events -->
<section style="padding-bottom: 96px;">
  <div class="wrap">
    <div class="label">Upcoming events</div>
    <hr class="hr" style="margin-top:8px">
    <div style="margin-top:24px;">
      ${rows.trimStart()}
    </div>
    <div style="margin-top:24px;">
      <a href="events.html" class="tlink">All events →</a>
    </div>
  </div>
</section>`.trimStart();
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
// Run

mkdirSync('dist/news', { recursive: true });
mkdirSync('dist/events', { recursive: true });
cpSync('src/assets', 'dist/assets', { recursive: true });
cpSync('src/images', 'dist/images', { recursive: true });

const eventsListHtml      = buildEventsList();
const newsListHtml        = buildNewsList();
const newsStripHtml       = buildNewsStrip();
const latestSermonHero    = buildLatestSermonHero();
const sermonsList         = buildSermonsList();
const latestSermonCard    = buildLatestSermonCard();
const recentSermons       = buildRecentSermons();
const upcomingEventsHtml  = buildUpcomingEventsStrip();
buildNewsArticles();
buildEventPages();

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
      .replace('{{events-list}}',        eventsListHtml)
      .replace('{{news-list}}',          newsListHtml)
      .replace('{{news-strip}}',         newsStripHtml)
      .replace('{{latest-sermon-hero}}', latestSermonHero)
      .replace('{{sermons-list}}',       sermonsList)
      .replace('{{latest-sermon-card}}', latestSermonCard)
      .replace('{{recent-sermons}}',     recentSermons)
      .replace('{{upcoming-events}}',    upcomingEventsHtml),
  });

  writeFileSync(join('dist', file), html);
  console.log(`built dist/${file}`);
}
