#!/usr/bin/env node
/**
 * Reads emmc-logo-small.png (RGB, white background) and writes
 * src/images/favicon.png (RGBA, transparent background).
 */
import { readFileSync, writeFileSync } from 'fs';
import zlib from 'zlib';

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

// CRC32
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c >>> 0;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = (crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Parse PNG chunks
const src = readFileSync('src/images/emmc-logo-small.png');
let offset = 8; // skip signature
const chunks = [];
while (offset < src.length) {
  const len = src.readUInt32BE(offset);
  const type = src.toString('ascii', offset + 4, offset + 8);
  const data = src.subarray(offset + 8, offset + 8 + len);
  chunks.push({ type, data });
  offset += 12 + len;
}

const ihdrData = Buffer.from(chunks.find(c => c.type === 'IHDR').data);
const width  = ihdrData.readUInt32BE(0);
const height = ihdrData.readUInt32BE(4);
console.log(`Source: ${width}x${height}`);

// Decompress IDAT
const compressed = Buffer.concat(chunks.filter(c => c.type === 'IDAT').map(c => c.data));
const raw = zlib.inflateSync(compressed);

// Reconstruct RGB pixels from filtered scanlines
const bpp = 3;
const scanlineLen = 1 + width * bpp;
const recon = Buffer.alloc(width * height * bpp);

for (let y = 0; y < height; y++) {
  const f = raw[y * scanlineLen];
  for (let x = 0; x < width; x++) {
    for (let ch = 0; ch < bpp; ch++) {
      const filt = raw[y * scanlineLen + 1 + x * bpp + ch];
      const a  = x > 0          ? recon[(y * width + x - 1) * bpp + ch] : 0;
      const b  = y > 0          ? recon[((y - 1) * width + x) * bpp + ch] : 0;
      const c  = (x > 0 && y > 0) ? recon[((y - 1) * width + x - 1) * bpp + ch] : 0;
      let v;
      switch (f) {
        case 0: v = filt; break;
        case 1: v = (filt + a) & 0xFF; break;
        case 2: v = (filt + b) & 0xFF; break;
        case 3: v = (filt + Math.floor((a + b) / 2)) & 0xFF; break;
        case 4: v = (filt + paeth(a, b, c)) & 0xFF; break;
        default: throw new Error(`Unknown PNG filter: ${f}`);
      }
      recon[(y * width + x) * bpp + ch] = v;
    }
  }
}

// Sample background from top-left corner
const bgR = recon[0], bgG = recon[1], bgB = recon[2];
console.log(`Background colour: rgb(${bgR}, ${bgG}, ${bgB})`);

// Build RGBA — pixels close to the background colour become transparent
const THRESHOLD = 40;
const rgba = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  const r = recon[i * 3], g = recon[i * 3 + 1], b = recon[i * 3 + 2];
  const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
  rgba[i * 4]     = r;
  rgba[i * 4 + 1] = g;
  rgba[i * 4 + 2] = b;
  rgba[i * 4 + 3] = dist < THRESHOLD ? 0 : 255;
}

// Write RGBA PNG (filter None for all rows)
const outScanline = 1 + width * 4;
const outRaw = Buffer.alloc(height * outScanline);
for (let y = 0; y < height; y++) {
  outRaw[y * outScanline] = 0; // filter None
  rgba.copy(outRaw, y * outScanline + 1, y * width * 4, (y + 1) * width * 4);
}
const outCompressed = zlib.deflateSync(outRaw, { level: 6 });

ihdrData[9] = 6; // change colour type to RGBA
const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const out = Buffer.concat([
  sig,
  makeChunk('IHDR', ihdrData),
  makeChunk('IDAT', outCompressed),
  makeChunk('IEND', Buffer.alloc(0)),
]);

writeFileSync('src/images/favicon.png', out);
console.log(`Written src/images/favicon.png (${(out.length / 1024).toFixed(1)} KB)`);
