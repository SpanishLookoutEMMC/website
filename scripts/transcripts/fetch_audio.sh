#!/usr/bin/env bash
# Step 1 — download a sermon's audio as 16 kHz mono WAV (what Whisper wants).
#
#   ./fetch_audio.sh <videoId>
#
# Writes work/<videoId>.wav. Skips the download if that file already exists,
# so re-running is cheap.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <videoId>" >&2
  exit 2
fi

VIDEO_ID="$1"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$DIR/work/$VIDEO_ID.wav"

mkdir -p "$DIR/work"

if [ -f "$OUT" ]; then
  echo "Already downloaded: $OUT ($(du -h "$OUT" | cut -f1))"
  exit 0
fi

# Use the venv's yt-dlp, not the system one. YouTube breaks extractors
# constantly, so this needs to stay current: uv pip install -U yt-dlp
YTDLP="$DIR/.venv/bin/yt-dlp"
[ -x "$YTDLP" ] || YTDLP="yt-dlp"

# --js-runtimes node is required: YouTube's signature/"n" challenge has to be
# solved in a real JS engine, and yt-dlp only auto-enables Deno, which isn't
# installed here. Without it every media URL comes back 403.
# Don't add --download-sections either — that hands the URL to ffmpeg, which
# fetches without yt-dlp's headers and also 403s.
"$YTDLP" --js-runtimes node --no-progress \
  -f bestaudio -x --audio-format wav \
  --postprocessor-args "-ar 16000 -ac 1" \
  -o "$DIR/work/$VIDEO_ID.%(ext)s" \
  "https://www.youtube.com/watch?v=$VIDEO_ID"

echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))"
