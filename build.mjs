import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';

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

mkdirSync('dist', { recursive: true });
cpSync('src/assets', 'dist/assets', { recursive: true });
cpSync('src/images', 'dist/images', { recursive: true });

const latestSermonHero    = buildLatestSermonHero();
const sermonsList         = buildSermonsList();
const latestSermonCard    = buildLatestSermonCard();
const recentSermons       = buildRecentSermons();

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
      .replace('{{recent-sermons}}',     recentSermons),
  });

  writeFileSync(join('dist', file), html);
  console.log(`built dist/${file}`);
}
