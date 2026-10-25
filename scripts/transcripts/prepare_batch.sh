#!/usr/bin/env bash
# Steps 1+2 in bulk — download and transcribe every sermon in src/sermons.json
# that doesn't have a raw transcript yet.
#
#   ./prepare_batch.sh [--model small]
#
# This only does the mechanical half. It deliberately does NOT extract anything:
# finding where each sermon starts and ends is a judgement call, made per
# recording with outline.py and extract.py afterwards.
#
# Safe to re-run — it skips whatever is already done, so a failed download or an
# interrupted run just needs another go.
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$DIR/../.." && pwd)"
MODEL="small"
[ "${1:-}" = "--model" ] && MODEL="$2"

mkdir -p "$DIR/work"
LOG="$DIR/work/batch.log"

ids=$(node -e "
  const s = JSON.parse(require('fs').readFileSync('$REPO/src/sermons.json'));
  console.log(s.map(x => x.videoId).join('\n'));
")

total=$(echo "$ids" | wc -l)
n=0
for id in $ids; do
  n=$((n + 1))
  if [ -f "$DIR/work/$id.segments.json" ]; then
    echo "[$n/$total] $id — already transcribed, skipping" | tee -a "$LOG"
    continue
  fi

  echo "[$n/$total] $id — downloading" | tee -a "$LOG"
  # YouTube rate-limits repeated requests and returns 403 sporadically; a retry
  # a little later almost always works.
  for attempt in 1 2 3; do
    "$DIR/fetch_audio.sh" "$id" >> "$LOG" 2>&1 && break
    echo "         download attempt $attempt failed, waiting 30s" | tee -a "$LOG"
    sleep 30
  done

  if [ ! -f "$DIR/work/$id.wav" ]; then
    echo "         GAVE UP on $id — no audio" | tee -a "$LOG"
    continue
  fi

  echo "[$n/$total] $id — transcribing" | tee -a "$LOG"
  "$DIR/.venv/bin/python" "$DIR/transcribe.py" --model "$MODEL" -- "$id" >> "$LOG" 2>&1 \
    || echo "         TRANSCRIBE FAILED for $id" | tee -a "$LOG"
done

echo "Batch done. Raw transcripts:" | tee -a "$LOG"
ls -1 "$DIR"/work/*.segments.json | wc -l | tee -a "$LOG"
