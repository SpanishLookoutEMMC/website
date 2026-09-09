#!/usr/bin/env python
"""Step 3 — read the raw transcript to find where the sermon actually starts and ends.

A Sunday recording is ~80 minutes of which maybe 35 are the sermon. The rest is
singing, announcements, greetings and prayer. This tool exists so an agent can
*see* the shape of the recording before cutting anything, rather than guessing
at boundaries.

    ./.venv/bin/python outline.py <videoId>                # 1-minute map of the whole service
    ./.venv/bin/python outline.py <videoId> --range 1500-2100   # every segment, verbatim
    ./.venv/bin/python outline.py <videoId> --gaps         # long silences — usually part boundaries
    ./.venv/bin/python outline.py <videoId> --grep "pray|turn with me|open your Bible"

Typical use: run the map, spot roughly where the preaching begins, then --range
around that area to pin the exact second, and pass it to extract.py.
"""

import argparse
import json
import re
import sys
from pathlib import Path

DIR = Path(__file__).resolve().parent


def hhmmss(seconds):
    seconds = int(seconds)
    return f"{seconds // 3600}:{(seconds % 3600) // 60:02d}:{seconds % 60:02d}"


def load(video_id):
    path = DIR / "work" / f"{video_id}.segments.json"
    if not path.exists():
        sys.exit(f"No transcript at {path} — run transcribe.py {video_id} first.")
    return json.loads(path.read_text())


def show_map(segments, bucket_seconds, width):
    """One line per bucket: timestamp + the text spoken in it, truncated."""
    if not segments:
        return
    bucket = []
    bucket_start = segments[0]["start"] // bucket_seconds * bucket_seconds
    for seg in segments:
        which = seg["start"] // bucket_seconds * bucket_seconds
        if which != bucket_start:
            if bucket:
                text = " ".join(bucket)
                print(f"{hhmmss(bucket_start):>8}  {text[:width]}")
            bucket, bucket_start = [], which
        bucket.append(seg["text"])
    if bucket:
        print(f"{hhmmss(bucket_start):>8}  {' '.join(bucket)[:width]}")


def show_range(segments, start, end):
    for seg in segments:
        if seg["end"] < start or seg["start"] > end:
            continue
        print(f"[{seg['i']:>5}] {hhmmss(seg['start']):>8}-{hhmmss(seg['end']):<8} {seg['text']}")


def show_gaps(segments, threshold):
    print(f"Silences longer than {threshold}s (often a boundary between parts of the service):\n")
    for prev, seg in zip(segments, segments[1:]):
        gap = seg["start"] - prev["end"]
        if gap >= threshold:
            print(f"{hhmmss(prev['end']):>8} → {hhmmss(seg['start']):<8} ({gap:5.1f}s silence)")
            print(f"          before: ...{prev['text'][-70:]}")
            print(f"          after:  {seg['text'][:70]}...\n")


def show_grep(segments, pattern):
    rx = re.compile(pattern, re.I)
    for seg in segments:
        if rx.search(seg["text"]):
            print(f"[{seg['i']:>5}] {hhmmss(seg['start']):>8}  {seg['text']}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video_id")
    ap.add_argument("--range", help="show every segment between START-END seconds, verbatim")
    ap.add_argument("--gaps", action="store_true", help="list long silences")
    ap.add_argument("--gap-threshold", type=float, default=5.0)
    ap.add_argument("--grep", help="show segments matching a regex")
    ap.add_argument("--bucket", type=int, default=60, help="map bucket size in seconds (default 60)")
    ap.add_argument("--width", type=int, default=140, help="map line width")
    args = ap.parse_args()

    data = load(args.video_id)
    segments = data["segments"]

    header = (f"{data['videoId']} · {hhmmss(data['audioDuration'])} long · "
              f"{len(segments)} segments · model={data['model']}")
    print(header)
    print("-" * len(header))

    if args.range:
        start, end = (float(x) for x in args.range.split("-"))
        show_range(segments, start, end)
    elif args.gaps:
        show_gaps(segments, args.gap_threshold)
    elif args.grep:
        show_grep(segments, args.grep)
    else:
        show_map(segments, args.bucket, args.width)


if __name__ == "__main__":
    main()
