import { readFileSync, writeFileSync } from 'fs';

const { channelId } = JSON.parse(readFileSync('src/data.json', 'utf8'));
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

// InnerTube params for the Live/Streams tab (where Sunday services are posted as live streams)
const INNERTUBE_STREAMS_PARAMS = 'EgdzdHJlYW1z8gYECgJ6AA%3D%3D';

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
  // No separator → treat the whole string as the title, not a date
  if (parts.length < 2) return { dateStr: '', title: raw, speaker: '' };
  const dateStr = parts[0].trim();
  if (parts.length >= 3) {
    return { dateStr, title: parts.slice(1, -1).join(' - ').trim(), speaker: parts[parts.length - 1].trim() };
  }
  return { dateStr, title: parts[1].trim(), speaker: '' };
}

/** Parse a human date string like "May 24, 2026" → "2026-05-24", or return '' */
function parseDateStr(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/** Format an ISO date string "2026-05-22" → "May 22, 2026" */
function formatIsoDate(isoDate) {
  const d = new Date(isoDate + 'T12:00:00Z'); // noon UTC avoids timezone day-shifts
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Fetch via YouTube's InnerTube browse API (the Live/Streams tab).
 * The church posts services as live streams, so recent content lives there.
 */
async function fetchViaInnerTube(channelId) {
  const res = await fetch(`https://www.youtube.com/youtubei/v1/browse?prettyPrint=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({
      context: { client: { clientName: 'WEB', clientVersion: '2.20240101' } },
      browseId: channelId,
      params: INNERTUBE_STREAMS_PARAMS,
    }),
  });
  if (!res.ok) throw new Error(`InnerTube HTTP ${res.status}`);
  const data = await res.json();

  // Find the selected tab (should be Live/Streams)
  const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs ?? [];
  const selectedTab = tabs.find(t => t?.tabRenderer?.selected) ?? tabs.find(t => t?.tabRenderer?.title === 'Live');
  const items = selectedTab?.tabRenderer?.content?.richGridRenderer?.contents ?? [];

  if (items.length === 0) throw new Error('InnerTube returned no stream videos');

  const sermons = [];
  for (const item of items) {
    const vm = item?.richItemRenderer?.content?.lockupViewModel;
    if (!vm) continue;

    // videoId is embedded in the watch endpoint inside rendererContext
    const ctxStr = JSON.stringify(vm?.rendererContext ?? {});
    const videoIdMatch = ctxStr.match(/"watchEndpoint":\{"videoId":"([^"]+)"/);
    if (!videoIdMatch) continue;
    const videoId = videoIdMatch[1];

    const rawTitle = vm?.metadata?.lockupMetadataViewModel?.title?.content ?? '';
    // Use the highest-resolution clean thumbnail (strip tracking params)
    const thumbSrc = vm?.contentImage?.thumbnailViewModel?.image?.sources?.slice(-1)[0]?.url ?? '';
    const thumbnail = thumbSrc.replace(/\?.*$/, ''); // strip query string noise

    const { dateStr, title, speaker } = parseTitle(rawTitle);
    const date = parseDateStr(dateStr);
    sermons.push({ videoId, title, dateStr, date, speaker, thumbnail, description: '' });
  }

  if (sermons.length === 0) throw new Error('InnerTube: no valid videos extracted');
  return sermons;
}

// --- Try RSS first, fall back to InnerTube ---

let sermons = null;

try {
  const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'curl/8.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();

  sermons = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const videoId   = xmlTag(block, 'yt:videoId');
    const rawTitle  = xmlTag(block, 'title');
    const date      = xmlTag(block, 'published').slice(0, 10);
    const thumbnail = xmlAttr(block, 'media:thumbnail', 'url');
    const description = xmlTag(block, 'media:description');
    const parsed = parseTitle(rawTitle);
    // If the title didn't contain a date, fall back to the RSS published date
    const dateStr = parsed.dateStr || formatIsoDate(date);
    const { title, speaker } = parsed;
    sermons.push({ videoId, title, dateStr, date, speaker, thumbnail, description });
  }
  console.log(`Fetched ${sermons.length} sermons via RSS.`);
} catch (e) {
  console.warn(`YouTube RSS unavailable (${e.message}), trying InnerTube fallback...`);
  try {
    sermons = await fetchViaInnerTube(channelId);
    console.log(`Fetched ${sermons.length} sermons via InnerTube fallback.`);
  } catch (e2) {
    console.error(`InnerTube fallback also failed: ${e2.message}. Keeping existing src/sermons.json.`);
    process.exit(0);
  }
}

// --- Merge with the existing archive instead of overwriting it ---
// The feed only returns the most recent ~15 videos. Writing that list out
// verbatim silently shrinks the archive on every run, and an empty/partial
// feed response would wipe it entirely. Instead, keep every sermon we already
// know about and just prepend videos we haven't seen before (feed order is
// newest-first, so new sermons land at the top in the right order).
let existing = [];
try {
  existing = JSON.parse(readFileSync('src/sermons.json', 'utf8'));
} catch {
  existing = [];
}

const existingIds = new Set(existing.map(s => s.videoId));
const brandNew = sermons.filter(s => !existingIds.has(s.videoId));
const merged = [...brandNew, ...existing];

writeFileSync('src/sermons.json', JSON.stringify(merged, null, 2) + '\n');
console.log(
  `Wrote ${merged.length} sermons to src/sermons.json ` +
  `(${brandNew.length} new, ${existing.length} kept from archive).`
);
