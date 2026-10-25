#!/usr/bin/env python
"""Step 4 — cut the sermon out of the raw transcript and write the final file.

    ./.venv/bin/python extract.py <videoId> --start 1512 --end 3702
    ./.venv/bin/python extract.py <videoId> --start 1512 --end 3702 --cut 2400-2460

--start/--end are the sermon boundaries in seconds, found with outline.py.
--cut removes a stretch inside those boundaries (a song in the middle of the
message, a long interruption); repeat it as needed.

Everything outside the boundaries — worship, announcements, greetings — is
dropped, so the saved file is the preaching and nothing else. Metadata (title,
speaker, date) comes from src/sermons.json, and the YouTube link is written with
a &t= that jumps straight to where the sermon begins.

Writes src/transcripts/<date>-<videoId>.md. Use --dry-run to preview first.
"""

import argparse
import json
import sys
from pathlib import Path

DIR = Path(__file__).resolve().parent
REPO = DIR.parent.parent

# Whisper segments are single sentences, far too small to be paragraphs, and its
# VAD output is nearly gapless — a 40-minute sermon has only ~20 pauses over
# 0.3s, so pauses alone can't carry the paragraphing. So: break at a sentence
# end once the paragraph is long enough, and treat a real pause as a good enough
# reason to break a little early.
PARAGRAPH_TARGET_WORDS = 130
PARAGRAPH_PAUSE = 0.3
PARAGRAPH_PAUSE_MIN_WORDS = 60
SENTENCE_END = (".", "?", "!", '."', '?"', '!"')


def hhmmss(seconds):
    seconds = int(seconds)
    return f"{seconds // 3600}:{(seconds % 3600) // 60:02d}:{seconds % 60:02d}"


def parse_cut(value):
    try:
        start, end = value.split("-")
        return float(start), float(end)
    except ValueError:
        raise argparse.ArgumentTypeError(f"--cut must look like START-END in seconds, got {value!r}")


def sermon_metadata(video_id):
    """Title/speaker/date for this video, from the file the website already builds from."""
    path = REPO / "src" / "sermons.json"
    try:
        for entry in json.loads(path.read_text()):
            if entry["videoId"] == video_id:
                return entry
    except FileNotFoundError:
        pass
    return {}


def build_paragraphs(segments):
    paragraphs, current, words = [], [], 0

    for i, seg in enumerate(segments):
        current.append(seg["text"])
        words += len(seg["text"].split())

        # Only ever break after a finished sentence, so paragraphs don't start
        # mid-clause. Whisper punctuates reliably enough for this.
        if not seg["text"].endswith(SENTENCE_END):
            continue

        nxt = segments[i + 1] if i + 1 < len(segments) else None
        gap_after = (nxt["start"] - seg["end"]) if nxt else 0.0

        long_enough = words >= PARAGRAPH_TARGET_WORDS
        natural_pause = gap_after >= PARAGRAPH_PAUSE and words >= PARAGRAPH_PAUSE_MIN_WORDS
        if long_enough or natural_pause:
            paragraphs.append(" ".join(current))
            current, words = [], 0

    if current:
        paragraphs.append(" ".join(current))
    return paragraphs


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video_id")
    ap.add_argument("--start", type=float, required=True, help="sermon start, in seconds")
    ap.add_argument("--end", type=float, required=True, help="sermon end, in seconds")
    ap.add_argument("--cut", type=parse_cut, action="append", default=[],
                    help="drop START-END inside the sermon (repeatable)")
    ap.add_argument("--title", help="override the title from src/sermons.json")
    ap.add_argument("--speaker", help="override the speaker from src/sermons.json")
    ap.add_argument("--note", help="a line recorded in the file about editing decisions")
    ap.add_argument("--dry-run", action="store_true", help="print to stdout instead of writing")
    args = ap.parse_args()

    raw_path = DIR / "work" / f"{args.video_id}.segments.json"
    if not raw_path.exists():
        sys.exit(f"No transcript at {raw_path} — run transcribe.py {args.video_id} first.")
    data = json.loads(raw_path.read_text())

    kept = [s for s in data["segments"] if s["start"] >= args.start and s["end"] <= args.end]
    for cut_start, cut_end in args.cut:
        kept = [s for s in kept if not (s["start"] >= cut_start and s["end"] <= cut_end)]
    if not kept:
        sys.exit("Nothing left after --start/--end/--cut. Check the boundaries with outline.py.")

    meta = sermon_metadata(args.video_id)
    title = args.title or meta.get("title") or args.video_id
    speaker = args.speaker or meta.get("speaker") or meta.get("title") or ""
    date = meta.get("date", "")
    date_str = meta.get("dateStr", "")

    paragraphs = build_paragraphs(kept)
    words = sum(len(p.split()) for p in paragraphs)
    url = f"https://www.youtube.com/watch?v={args.video_id}"

    lines = [
        "---",
        f"videoId: {args.video_id}",
        f"date: {date}",
        f"speaker: {speaker}",
        f"title: {title}",
        f"youtube: {url}",
        f"sermonStart: {hhmmss(args.start)}",
        f"sermonEnd: {hhmmss(args.end)}",
        f"words: {words}",
        f"transcribedWith: whisper-{data['model']}",
        "---",
        "",
        f"# {title}",
        "",
        f"**{speaker}** · {date_str or date}",
        "",
        f"[Watch on YouTube (jumps to the sermon)]({url}&t={int(args.start)}s)",
        "",
        f"> Machine transcription (Whisper {data['model']}) of the sermon only — "
        f"{hhmmss(args.start)}–{hhmmss(args.end)} of the recording. Singing, announcements "
        f"and the rest of the service are not included. Wording may be imperfect; "
        f"the recording is authoritative.",
    ]
    if args.note:
        lines += ["", f"> Note: {args.note}"]
    lines += [""] + [p + "\n" for p in paragraphs]

    document = "\n".join(lines)

    if args.dry_run:
        print(document)
        return

    out_dir = REPO / "src" / "transcripts"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{date or 'undated'}-{args.video_id}.md"
    out.write_text(document)

    dropped = len(data["segments"]) - len(kept)
    print(f"Wrote {out.relative_to(REPO)}")
    print(f"  {words} words in {len(paragraphs)} paragraphs, "
          f"{hhmmss(args.end - args.start)} of sermon "
          f"({dropped} of {len(data['segments'])} segments dropped as non-sermon).")


if __name__ == "__main__":
    main()
