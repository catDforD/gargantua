#!/usr/bin/env python3
"""Merge recommendation fragments into source/_data/recommendations.yml.

Replaces the four placeholder sections (books / movies / anime / music) with the
finished fragments from REC_FRAG_DIR, then validates the merged data:
section counts, per-item required fields and cover file existence.

Usage: python3 tools/rec_work/merge_recommendations.py [--write]
"""
import os
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "source/_data/recommendations.yml"
FRAG_DIR = Path(os.environ.get("REC_FRAG_DIR", "/home/gargantua/rec_assets"))
ORDER = ["books", "movies", "anime", "music"]
BYLINE = {"books": "author", "movies": "director", "anime": "studio", "music": "artist"}
EXPECTED = {"books": 4, "movies": 13, "anime": 22, "music": 6}


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def main():
    write = "--write" in sys.argv
    fragments = {}
    for key in ORDER:
        path = FRAG_DIR / f"{key}.yml"
        if not path.exists():
            fail(f"missing fragment {path}")
        fragments[key] = path.read_text(encoding="utf-8").strip("\n")

    raw = DATA.read_text(encoding="utf-8")
    marker = "recommendations:\n"
    idx = raw.find(marker)
    if idx < 0:
        fail("`recommendations:` root key not found")
    head = raw[: idx + len(marker)]
    merged = head + "\n".join(fragments[key] for key in ORDER) + "\n"

    data = yaml.safe_load(merged)
    sections = data.get("recommendations") or []
    got_keys = [s.get("key") for s in sections]
    if got_keys != ORDER:
        fail(f"section keys {got_keys} != {ORDER}")

    problems = []
    total = 0
    for section in sections:
        key = section["key"]
        items = section.get("items") or []
        total += len(items)
        if len(items) != EXPECTED[key]:
            problems.append(f"{key}: {len(items)} items, expected {EXPECTED[key]}")
        seen = set()
        for item in items:
            title = item.get("title") or "<untitled>"
            if title in seen:
                problems.append(f"{key}: duplicate title {title}")
            seen.add(title)
            for field in ("title", "cover", "intro", BYLINE[key]):
                value = item.get(field)
                if value in (None, "", []):
                    problems.append(f"{key}/{title}: missing `{field}`")
            cover = item.get("cover") or ""
            if cover:
                file = ROOT / "source" / cover.lstrip("/")
                if not file.exists():
                    problems.append(f"{key}/{title}: cover file missing: {file}")
                elif file.stat().st_size < 5_000:
                    problems.append(f"{key}/{title}: cover suspiciously small ({file.stat().st_size} B)")

    if total != sum(EXPECTED.values()):
        problems.append(f"total {total} items, expected {sum(EXPECTED.values())}")

    if problems:
        print("\n".join(f"FAIL: {p}" for p in problems))
        sys.exit(1)

    print(f"validated: {len(sections)} sections, {total} items, all covers present")
    for section in sections:
        print(f"  {section['key']:8s} {len(section['items']):2d} items")

    if write:
        DATA.write_text(merged, encoding="utf-8")
        print(f"wrote {DATA}")
    else:
        print("dry run (pass --write to update the data file)")


if __name__ == "__main__":
    main()
