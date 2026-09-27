#!/usr/bin/env python3
"""Convert banner background PNGs to WebP.

The banner images are the heaviest assets on the site: they are full-viewport
CSS backgrounds, so they are neither lazy-loaded nor discovered early by the
preload scanner. Shipping them as multi-megabyte PNGs directly delays first
paint on every page.

Run after adding a new banner to source/img/bg/:

    python3 tools/optimize_bg_images.py --dry-run
    python3 tools/optimize_bg_images.py

Lives in tools/ rather than scripts/ because Hexo auto-loads every file in
scripts/ as a plugin and chokes on non-JavaScript.

Originals are left untouched; the PNGs are kept in the repo but excluded from
the build via `exclude` in _config.yml.
"""

import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

BG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "source", "img", "bg")
MAX_WIDTH = 2560
QUALITY = 82


def convert(path, max_width, quality, dry_run):
    src_size = os.path.getsize(path)
    dst = os.path.splitext(path)[0] + ".webp"

    with Image.open(path) as im:
        orig_size = im.size
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")
        width = min(im.width, max_width)
        if width < im.width:
            height = round(im.height * width / im.width)
            im = im.resize((width, height), Image.LANCZOS)
        if dry_run:
            print(f"  would convert {os.path.basename(path)}: {orig_size[0]}x{orig_size[1]} -> {im.width}x{im.height}")
            return None
        im.save(dst, "WEBP", quality=quality, method=6)

    dst_size = os.path.getsize(dst)
    ratio = src_size / dst_size if dst_size else 0
    print(
        f"  {os.path.basename(path):16s} {src_size / 1048576:6.2f} MB -> {dst_size / 1024:7.1f} KB"
        f"  ({ratio:4.1f}x smaller, {im.width}x{im.height})"
    )
    return dst_size


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="show what would be converted without writing")
    parser.add_argument("--max-width", type=int, default=MAX_WIDTH, help=f"maximum width in pixels (default: {MAX_WIDTH})")
    parser.add_argument("--quality", type=int, default=QUALITY, help=f"WebP quality 0-100 (default: {QUALITY})")
    args = parser.parse_args()

    if not os.path.isdir(BG_DIR):
        sys.exit(f"banner directory not found: {BG_DIR}")

    pngs = sorted(f for f in os.listdir(BG_DIR) if f.lower().endswith(".png"))
    if not pngs:
        sys.exit(f"no PNG files in {BG_DIR}")

    total_before = total_after = 0
    for name in pngs:
        path = os.path.join(BG_DIR, name)
        total_before += os.path.getsize(path)
        result = convert(path, args.max_width, args.quality, args.dry_run)
        if result:
            total_after += result

    if not args.dry_run:
        print(f"\n  total: {total_before / 1048576:.2f} MB -> {total_after / 1048576:.2f} MB")


if __name__ == "__main__":
    main()
