import { readFileSync, writeFileSync } from 'fs';

const { channelId } = JSON.parse(readFileSync('src/data.json', 'utf8'));
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

function decode(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function xmlTag(block, name) {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`));
  return m ? decode(m[1].trim()) : '';
}

function xmlAttr(block, name, attr) {
  const m = block.match(new RegExp(`<${name}[^>]*\\s${attr}="([^"]*)"`));
  return m ? m[1] : '';
}

function parseTitle(raw) {
  const parts = raw.split(' - ');
  if (parts.length < 2) return { dateStr: raw, title: '', speaker: '' };
  const dateStr = parts[0].trim();
  if (parts.length >= 3) {
    return { dateStr, title: parts.slice(1, -1).join(' - ').trim(), speaker: parts[parts.length - 1].trim() };
  }
  return { dateStr, title: parts[1].trim(), speaker: '' };
}

let xml;
try {
  const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'curl/8.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  xml = await res.text();
} catch (e) {
  console.error(`Could not fetch YouTube RSS: ${e.message}. Keeping existing src/sermons.json.`);
  process.exit(0);
}

const sermons = [];
const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
let m;
while ((m = entryRe.exec(xml)) !== null) {
  const block = m[1];
  const videoId   = xmlTag(block, 'yt:videoId');
  const rawTitle  = xmlTag(block, 'title');
  const date      = xmlTag(block, 'published').slice(0, 10);
  const thumbnail = xmlAttr(block, 'media:thumbnail', 'url');
  const description = xmlTag(block, 'media:description');
  const { dateStr, title, speaker } = parseTitle(rawTitle);
  sermons.push({ videoId, title, dateStr, date, speaker, thumbnail, description });
}

writeFileSync('src/sermons.json', JSON.stringify(sermons, null, 2) + '\n');
console.log(`Wrote ${sermons.length} sermons to src/sermons.json`);
