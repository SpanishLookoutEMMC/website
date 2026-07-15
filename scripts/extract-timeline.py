#!/usr/bin/env python3
"""Re-extract src/timeline.json from the Keynote PDF using layout rules:

  [image]
  date
  event description
  (optional smaller detail)

Captions sit on or just under each photo's bottom edge, in the same column.
Text-only events (no photo) are kept with image: null.

Usage:
  python3 scripts/extract-timeline.py ~/Downloads/1995-2025\\ Timeline.pdf
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF required: pip install pymupdf")

MONTHS = r"January|February|March|April|May|June|July|August|September|Sept|October|November|December"
DATE_RE = re.compile(
    rf"^(?:"
    rf"(?:{MONTHS})\s+\d{{1,2}}(?:\s*[-–]\s*\d{{1,2}})?,?\s+\d{{4}}"
    rf"|(?:{MONTHS})\s+\d{{4}}"
    rf"|Approx\.?\s+\d{{4}}\s*[-–]\s*\d{{4}}"
    rf"|\d{{4}}\s*[&/–-]\s*\d{{2,4}}"
    rf"|June\s*[-–]\s*November\s+\d{{4}}"
    rf"|\d{{4}}"
    rf")",
    re.I,
)
MONTH_MAP = {
    m.lower(): i
    for i, m in enumerate(
        "January February March April May June July August September October November December".split(),
        1,
    )
}
MONTH_MAP["sept"] = 9


def parse_date_prefix(text: str):
    m = DATE_RE.match(text.strip())
    if not m:
        return None, text
    return m.group(0).strip(), text[m.end() :].strip(" -–|,")


def is_noise(t):
    if t["text"].startswith("TIMELINE OF") or t["text"].startswith("*Not all"):
        return True
    if re.fullmatch(r"19\d{2}|20\d{2}", t["text"]) and t["y0"] > 1580:
        return True
    if "|" in t["text"] and all(
        p.strip() in {"1995", "2000", "2005", "2010", "2015", "2020", "2025"}
        for p in t["text"].split("|")
    ):
        return True
    if t["size"] > 40:
        return True
    return False


def text_under_image(im, l, y_slack_up=100, y_slack_down=140):
    if l["y0"] < im["y1"] - y_slack_up:
        return False
    if l["y0"] > im["y1"] + y_slack_down:
        return False
    pad = min(30, im["w"] * 0.12)
    return im["x0"] - pad <= l["cx"] <= im["x1"] + pad


def collect_caption(nearby):
    candidates = [l for l in nearby if not l["used"]]
    candidates.sort(key=lambda l: l["y0"])
    date_line = next((l for l in candidates if l["is_date"]), None)
    if not date_line:
        return None
    d, rest = parse_date_prefix(date_line["text"])
    title_parts = [rest] if rest else []
    detail_parts = []
    claimed = [date_line]
    col_half = max(date_line["x1"] - date_line["x0"], 60) * 0.8
    for l in candidates:
        if l is date_line:
            continue
        if l["y0"] < date_line["y1"] - 2:
            continue
        if l["y0"] > date_line["y1"] + 150:
            break
        if abs(l["cx"] - date_line["cx"]) > max(col_half, 90):
            continue
        if l["is_date"]:
            break
        (title_parts if l["size"] >= 18 else detail_parts).append(l["text"])
        claimed.append(l)
    return {
        "date": d,
        "title": " ".join(title_parts).strip() or None,
        "detail": " ".join(detail_parts).strip() or None,
        "claimed": claimed,
        "date_x": date_line["cx"],
        "date_y": date_line["cy"],
    }


def clean(s):
    if not s:
        return s
    s = s.replace("Oﬃce", "Office").replace("oﬃce", "office")
    s = s.replace("diﬀerent", "different")
    return re.sub(r"\s+", " ", s).strip()


def sort_key(e):
    d = e["date"] or ""
    m = re.search(
        rf"({MONTHS})\s+(\d{{1,2}})(?:\s*[-–]\s*\d{{1,2}})?,?\s+(\d{{4}})", d, re.I
    )
    if m:
        return (int(m.group(3)), MONTH_MAP[m.group(1).lower()], int(m.group(2)))
    m = re.search(rf"({MONTHS})\s+(\d{{4}})", d, re.I)
    if m:
        return (int(m.group(2)), MONTH_MAP[m.group(1).lower()], 15)
    m = re.search(r"Approx\.?\s*(\d{4})", d, re.I)
    if m:
        return (int(m.group(1)), 6, 1)
    m = re.search(r"June\s*[-–]\s*November\s+(\d{4})", d, re.I)
    if m:
        return (int(m.group(1)), 6, 1)
    m = re.search(r"(\d{4})\s*[&/–-]\s*(\d{2,4})", d)
    if m:
        return (int(m.group(1)), 6, 1)
    m = re.search(r"(\d{4})", d)
    if m:
        return (int(m.group(1)), 6, 1)
    return (9999, 1, 1)


def extract(pdf_path: Path):
    doc = fitz.open(pdf_path)
    page = doc[0]
    xrefs = [img[0] for img in page.get_images(full=True)]
    xref_to_idx = {xref: i for i, xref in enumerate(xrefs)}
    images = []
    for im in page.get_image_info(xrefs=True):
        idx = xref_to_idx.get(im.get("xref"))
        if idx is None:
            continue
        bb = im["bbox"]
        images.append(
            {
                "file": f"img-{idx:03d}.jpg",
                "x0": bb[0],
                "y0": bb[1],
                "x1": bb[2],
                "y1": bb[3],
                "cx": (bb[0] + bb[2]) / 2,
                "cy": (bb[1] + bb[3]) / 2,
                "w": bb[2] - bb[0],
                "h": bb[3] - bb[1],
            }
        )

    lines = []
    for b in page.get_text("dict")["blocks"]:
        if b.get("type") != 0:
            continue
        for line in b.get("lines", []):
            spans = line.get("spans", [])
            if not spans:
                continue
            text = re.sub(r"\s+", " ", "".join(s["text"] for s in spans)).strip()
            if not text:
                continue
            size = max(s["size"] for s in spans)
            x0 = min(s["bbox"][0] for s in spans)
            y0 = min(s["bbox"][1] for s in spans)
            x1 = max(s["bbox"][2] for s in spans)
            y1 = max(s["bbox"][3] for s in spans)
            lines.append(
                {
                    "text": text,
                    "size": round(size, 1),
                    "x0": x0,
                    "y0": y0,
                    "x1": x1,
                    "y1": y1,
                    "cx": (x0 + x1) / 2,
                    "cy": (y0 + y1) / 2,
                    "used": False,
                }
            )
    lines = [l for l in lines if not is_noise(l)]
    for l in lines:
        l["is_date"] = parse_date_prefix(l["text"])[0] is not None

    events = []
    for im in sorted(images, key=lambda im: (im["cx"], im["y1"])):
        nearby = [l for l in lines if not l["used"] and text_under_image(im, l)]
        if not nearby:
            nearby = [
                l
                for l in lines
                if not l["used"] and text_under_image(im, l, 130, 200)
            ]
        if not nearby:
            continue
        cap = collect_caption(nearby)
        if not cap:
            continue
        for l in cap["claimed"]:
            l["used"] = True
        events.append(
            {
                "date": cap["date"],
                "title": cap["title"],
                "detail": cap["detail"],
                "image": im["file"],
                "date_x": cap["date_x"],
            }
        )

    for l in sorted(lines, key=lambda x: (x["cx"], x["y0"])):
        if l["used"] or not l["is_date"]:
            continue
        col = [x for x in lines if not x["used"] and abs(x["cx"] - l["cx"]) < 130]
        cap = collect_caption(col)
        if not cap:
            continue
        for c in cap["claimed"]:
            c["used"] = True
        events.append(
            {
                "date": cap["date"],
                "title": cap["title"],
                "detail": cap["detail"],
                "image": None,
                "date_x": cap["date_x"],
            }
        )

    for e in events:
        e["date"] = clean(e["date"])
        e["title"] = clean(e["title"]) or e["date"]
        e["detail"] = clean(e["detail"])

    # Manual overrides for known layout ambiguities
    for e in events:
        t = (e["title"] or "").lower()
        if "child born" in t or "roxy" in t:
            e["image"] = "img-004.jpg"
        if e["date"] == "October 20, 1996" and "communion" in t and e["image"] == "img-004.jpg":
            e["image"] = None
        if "Project Macedonia" in (e["title"] or "") and "Walter" in (e["title"] or ""):
            e["title"] = "Hosted EMMC Project Macedonia team"
        if e["date"] == "August 2005" and e["title"] == "August 2005":
            e["title"] = "Walter & Betty sent to SBC"

    # unique images
    seen_img = set()
    for e in events:
        if e["image"]:
            if e["image"] in seen_img:
                e["image"] = None
            else:
                seen_img.add(e["image"])

    events.sort(key=lambda e: (sort_key(e), e.get("date_x") or 0))
    seen = set()
    out = []
    for e in events:
        key = (e["date"], e["title"])
        if key in seen:
            continue
        seen.add(key)
        sk = sort_key(e)
        out.append(
            {
                "date": e["date"],
                "title": e["title"],
                "detail": e["detail"],
                "image": e["image"],
                "sort": f"{sk[0]:04d}{sk[1]:02d}{sk[2]:02d}",
            }
        )
    return out


def main():
    pdf = Path(sys.argv[1] if len(sys.argv) > 1 else Path.home() / "Downloads/1995-2025 Timeline.pdf")
    out_path = Path(__file__).resolve().parents[1] / "src/timeline.json"
    events = extract(pdf)
    out_path.write_text(json.dumps(events, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(events)} events to {out_path}")


if __name__ == "__main__":
    main()
