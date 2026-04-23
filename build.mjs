import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const layout = readFileSync('src/layout.html', 'utf8');

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

function buildNav(current) {
  return NAV.map(({ key, href, label }) => {
    const cls = key === current ? ' class="current"' : '';
    return `      <a href="${href}"${cls}>${label}</a>`;
  }).join('\n');
}

const files = readdirSync('src/pages').filter(f => f.endsWith('.html'));

for (const file of files) {
  const src = readFileSync(join('src/pages', file), 'utf8');
  const { meta, body } = parseFrontmatter(src);

  // A leading <style> block gets lifted into <head>
  let extraHead = '';
  let pageBody = body;
  const styleMatch = body.match(/^(<style[\s\S]*?<\/style>)\n*/);
  if (styleMatch) {
    extraHead = styleMatch[1] + '\n';
    pageBody = body.slice(styleMatch[0].length);
  }

  const html = layout
    .replace('{{title}}', meta.title || 'Spanish Lookout EMMC')
    .replace('{{description}}', meta.description || '')
    .replace('{{extra-head}}', extraHead)
    .replace('{{header-class}}', meta['header-class'] ? ` ${meta['header-class']}` : '')
    .replace('{{nav}}', buildNav(meta.current || ''))
    .replace('{{body}}', pageBody.trimEnd());

  writeFileSync(file, html);
  console.log(`built ${file}`);
}
