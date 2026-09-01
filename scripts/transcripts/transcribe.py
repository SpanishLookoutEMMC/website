#!/usr/bin/env python
"""Step 2 — run Whisper over a downloaded sermon.

    ./.venv/bin/python transcribe.py <videoId> [--model small] [--range 600-1200]

Writes work/<videoId>.segments.json: every segment Whisper produced, with
timestamps, kept raw and uncut. Nothing is filtered here — deciding what is
sermon and what is not happens later, in outline.py / extract.py, where a human
or an agent can actually see what is being dropped.

--range transcribes only part of the audio (seconds). Useful for benchmarking a
model on a few minutes before committing to a full 80-minute run; the result is
written to a separate file so it never overwrites a full transcript.

This machine has no NVIDIA GPU, so it runs on CPU with int8 quantization.
Expect roughly real-time with `small`, ~3x faster with `base`.
"""

import argparse
import json
import sys
import time
from pathlib import Path

DIR = Path(__file__).resolve().parent


def parse_range(value):
    if not value:
        return None
    try:
        start, end = value.split("-")
        return float(start), float(end)
    except ValueError:
        raise argparse.ArgumentTypeError("--range must look like START-END, in seconds (e.g. 600-1200)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video_id")
    ap.add_argument("--model", default="small",
                    help="Whisper model: tiny, base, small, medium, large-v3 (default: small)")
    ap.add_argument("--range", type=parse_range, default=None,
                    help="only transcribe START-END seconds (for benchmarking)")
    ap.add_argument("--language", default="en")
    args = ap.parse_args()

    audio = DIR / "work" / f"{args.video_id}.wav"
    if not audio.exists():
        sys.exit(f"No audio at {audio} — run ./fetch_audio.sh {args.video_id} first.")

    if args.range:
        out = DIR / "work" / f"{args.video_id}.{args.model}.{int(args.range[0])}-{int(args.range[1])}.segments.json"
    else:
        out = DIR / "work" / f"{args.video_id}.segments.json"

    from faster_whisper import WhisperModel

    print(f"Loading Whisper '{args.model}' (CPU, int8)...", file=sys.stderr)
    model = WhisperModel(args.model, device="cpu", compute_type="int8")

    clip_offset = 0.0
    audio_arg = str(audio)
    if args.range:
        # faster-whisper has no seek argument, so cut the window out with ffmpeg first.
        import subprocess
        start, end = args.range
        clip = DIR / "work" / f"{args.video_id}.clip.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(audio),
             "-ss", str(start), "-to", str(end), str(clip)],
            check=True,
        )
        audio_arg = str(clip)
        clip_offset = start

    print(f"Transcribing {audio.name}...", file=sys.stderr)
    started = time.time()

    # vad_filter drops silence and, usefully here, a lot of pure instrumental
    # stretches — but it is only a speed/noise measure. Real sermon boundaries
    # are still decided by hand in the next step.
    segments, info = model.transcribe(
        audio_arg,
        language=args.language,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 1000},
        condition_on_previous_text=False,  # long recordings drift into repetition loops with this on
    )

    collected = []
    for seg in segments:
        collected.append({
            "i": len(collected),
            "start": round(seg.start + clip_offset, 2),
            "end": round(seg.end + clip_offset, 2),
            "text": seg.text.strip(),
        })
        if len(collected) % 25 == 0:
            # Measure against audio actually processed, not the absolute timestamp —
            # with --range the offset would otherwise inflate the speed figure.
            done = seg.end
            elapsed = time.time() - started
            speed = done / elapsed if elapsed else 0
            print(f"  {int((seg.end + clip_offset) // 60):>3}m mark | {len(collected):>5} segments "
                  f"| {elapsed / 60:.1f}m elapsed | {speed:.1f}x realtime", file=sys.stderr)

    elapsed = time.time() - started
    payload = {
        "videoId": args.video_id,
        "url": f"https://www.youtube.com/watch?v={args.video_id}",
        "model": args.model,
        "language": info.language,
        "audioDuration": round(info.duration, 2),
        "range": list(args.range) if args.range else None,
        "transcribedInSeconds": round(elapsed, 1),
        "segments": collected,
    }
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

    print(f"\nWrote {len(collected)} segments to {out} in {elapsed / 60:.1f} minutes.", file=sys.stderr)


if __name__ == "__main__":
    main()
