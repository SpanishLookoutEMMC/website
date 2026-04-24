import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

const layout = readFileSync('src/layout.html', 'utf8');
const DATA = JSON.parse(readFileSync('src/data.json', 'utf8'));

function applyData(str) {
  let out = str;
  for (const [k, v] of Object.entries(DATA)) out = out.replaceAll(`{{${k}}}`, v);
  return out;
}

const NAV = [
  { key: 'church',  href: 'church.html',  label: 'The Church' },
  { key: 'team',    href: 'team.html',    label: 'The Team'   },
  { key: 'sermons', href: 'sermons.html', label: 'Sermons'    },
  { key: 'faith',   href: 'faith.html',   label: 'Our Faith'  },
  { key: 'events',  href: 'events.html',  label: 'Events'     },
  { key: 'news',    href: 'news.html',    label: 'News'       },
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
    return meta;
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
    <a class="event-row" href="#">
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

    writeFileSync(join('news', `${a.slug}.html`), html);
    console.log(`built news/${a.slug}.html`);
  }
}

// ---------------------------------------------------------------------------
// Run

const eventsListHtml = buildEventsList();
const newsListHtml = buildNewsList();
buildNewsArticles();

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
      .replace('{{events-list}}', eventsListHtml)
      .replace('{{news-list}}', newsListHtml),
  });

  writeFileSync(file, html);
  console.log(`built ${file}`);
}
