# Sermon transcripts

Tools for turning a sermon recording into a clean text transcript, so the
sermons can serve as a reference for what the church actually teaches.

This is deliberately **not** an automated pipeline. It is four separate steps
meant to be driven by a person or a coding agent, because the interesting part —
deciding where the sermon starts and ends — needs judgement. A Sunday recording
runs ~80 minutes, of which the sermon is maybe 30–40. The rest is singing,
announcements, greetings and prayer.

**Only the sermon is saved.** Singing is cut, not transcribed into the output —
we care about the preaching, and song lyrics have no place in these files.

## Setup

Already done, but to recreate it:

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python faster-whisper yt-dlp
```

`ffmpeg` comes from the system. `yt-dlp` must be the venv's copy and reasonably
fresh — YouTube breaks extractors constantly. When downloads start failing:

```bash
uv pip install --python .venv/bin/python -U yt-dlp
```

## The four steps

### 1. Get the audio

```bash
./fetch_audio.sh SX7BiXFb5uw
```

Writes `work/<videoId>.wav` (16 kHz mono). Skips if already there.

If it 403s, just run it again — YouTube rate-limits repeated requests and a
retry a minute later usually works.

### 2. Transcribe

```bash
./.venv/bin/python transcribe.py SX7BiXFb5uw --model small
```

Writes `work/<videoId>.segments.json` — every segment with timestamps, nothing
removed. This machine is a 4-core Alder Lake-N with no NVIDIA GPU, so it runs on
CPU; budget roughly the length of the recording for `small`.

Benchmark a model on a few minutes before a full run:

```bash
./.venv/bin/python transcribe.py SX7BiXFb5uw --model small --range 1800-2100
```

### 3. Find the sermon

This is the step that needs eyes on it.

```bash
./.venv/bin/python outline.py SX7BiXFb5uw                    # 1-min-per-line map of the service
./.venv/bin/python outline.py SX7BiXFb5uw --gaps             # long silences — usually part boundaries
./.venv/bin/python outline.py SX7BiXFb5uw --grep "turn with me|open your Bible|let us pray"
./.venv/bin/python outline.py SX7BiXFb5uw --range 1450-1550  # every segment, to pin the exact second
```

Read the map to see the shape of the service, then zoom in with `--range` to
find the exact second the preaching starts and ends.

What to look for:

- **Sermon start** — a scripture reading, "turn with me to…", or the speaker
  being introduced, right after a song ends.
- **Sermon end** — a closing prayer, an invitation, or a song starting again.
- **Songs mid-sermon** — note the range and pass it as `--cut`.

### 4. Write the transcript

```bash
./.venv/bin/python extract.py SX7BiXFb5uw --start 1512 --end 3702 --dry-run
./.venv/bin/python extract.py SX7BiXFb5uw --start 1512 --end 3702
```

Writes `../../src/transcripts/<date>-<videoId>.md` with front matter (speaker,
date, video id, boundaries) and a YouTube link that jumps to the sermon's start.
Title, speaker and date come from `src/sermons.json`; override with `--title` /
`--speaker`. Use `--cut 2400-2460` (repeatable) to drop a stretch inside the
sermon, and `--note` to record an editing decision in the file itself.

Always `--dry-run` first and read the start and end of the output — that is the
check that the boundaries are right.

## What is committed

- `src/transcripts/*.md` — the finished sermon transcripts.
- These scripts.

`work/` and `.venv/` are gitignored: the WAVs are ~70 MB each and the raw
segment JSON can be regenerated.

## Caveats

Whisper output is good but not perfect. Proper nouns, Mennonite/Plautdietsch
terms and place names get mangled, and scripture references are worth checking
against the recording. Every file says so in its header, and every file links to
the video at the right timestamp so anything questionable can be verified.
