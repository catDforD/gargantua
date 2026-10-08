#!/usr/bin/env python3
"""Fetch a recommendation cover image.

Keeps the downloaded master locally (git-ignored) and writes the published
``.webp`` twin next to it. Prints a JSON summary on stdout.

Usage:
    python3 tools/rec_work/cover.py --url URL --slug SLUG [--referer R]
                                    [--max-edge 1400] [--quality 80] [--force]
"""

import argparse
import io
import json
import math
import os
import subprocess
import sys
import time
import urllib.request

from PIL import Image, ImageChops, ImageStat

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_DIR = os.path.join(REPO, "source", "img", "recommendations")
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
EXT_BY_FORMAT = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp", "GIF": "gif", "BMP": "bmp"}


def log(message):
    print(message, file=sys.stderr)


def download(url, referer):
    # Some CDNs (e.g. doubanio) answer python-urllib with an anti-bot HTML page
    # while serving real images to curl, so prefer curl and fall back to urllib.
    command = ["curl", "-sS", "-L", "--max-time", "90", "-A", UA, "-o", "-"]
    if referer:
        command += ["-H", "Referer: " + referer]
    command.append(url)

    errors = []
    for attempt in range(3):
        try:
            result = subprocess.run(command, capture_output=True)
            if result.returncode == 0 and result.stdout:
                with Image.open(io.BytesIO(result.stdout)) as probe:
                    probe.load()
                return result.stdout
            errors.append("curl exit %s" % result.returncode)
        except Exception as error:  # noqa: BLE001 -收集后统一报错
            errors.append(str(error))

        try:
            request = urllib.request.Request(url, headers={"User-Agent": UA})
            if referer:
                request.add_header("Referer", referer)
            with urllib.request.urlopen(request, timeout=60) as response:
                data = response.read()
            with Image.open(io.BytesIO(data)) as probe:
                probe.load()
            return data
        except Exception as error:  # noqa: BLE001
            errors.append(str(error))
        time.sleep(2 * (attempt + 1))

    raise SystemExit("download failed: " + " | ".join(errors[-2:]))


def psnr(reference, candidate):
    diff = ImageChops.difference(reference.convert("RGB"), candidate.convert("RGB"))
    stat = ImageStat.Stat(diff)
    mse = sum(band * band for band in stat.rms) / len(stat.rms)
    if mse == 0:
        return 100.0
    return 10 * math.log10(255 * 255 / mse)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--slug", required=True)
    parser.add_argument("--referer", default=None)
    parser.add_argument("--max-edge", type=int, default=1400)
    parser.add_argument("--quality", type=int, default=92)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    webp_path = os.path.join(OUT_DIR, args.slug + ".webp")
    if os.path.exists(webp_path) and not args.force:
        log("webp already exists, use --force to overwrite: " + webp_path)
        return 1

    raw = download(args.url, args.referer)
    image = Image.open(io.BytesIO(raw))
    image.load()

    fmt = (image.format or "").upper()
    ext = EXT_BY_FORMAT.get(fmt)
    if not ext:
        raise SystemExit("unsupported image format: " + str(fmt))

    master_path = os.path.join(OUT_DIR, args.slug + "." + ext)
    if os.path.exists(master_path) and not args.force:
        log("master already exists, use --force to overwrite: " + master_path)
        return 1
    with open(master_path, "wb") as handle:
        handle.write(raw)

    has_alpha = image.mode in ("RGBA", "LA", "PA") or (
        image.mode == "P" and "transparency" in image.info
    )
    converted = image.convert("RGBA" if has_alpha else "RGB")
    width, height = converted.size
    long_edge = max(width, height)
    if long_edge > args.max_edge:
        scale = args.max_edge / long_edge
        converted = converted.resize(
            (max(1, round(width * scale)), max(1, round(height * scale))),
            Image.LANCZOS,
        )
    converted.save(webp_path, "WEBP", quality=args.quality, method=6)

    with Image.open(webp_path) as check:
        check.load()
        score = psnr(converted, check)
        webp_size = check.size

    result = {
        "slug": args.slug,
        "cover": "/img/recommendations/%s.webp" % args.slug,
        "source_url": args.url,
        "master": os.path.relpath(master_path, REPO),
        "master_format": fmt,
        "master_size": list(image.size),
        "master_bytes": len(raw),
        "webp": os.path.relpath(webp_path, REPO),
        "webp_size": list(webp_size),
        "webp_bytes": os.path.getsize(webp_path),
        "psnr_db": round(score, 2),
    }
    if score < 40:
        log("WARNING: PSNR below 40 dB, consider a higher quality setting")
    if max(webp_size) < 600:
        log("WARNING: cover is small (long edge %d px)" % max(webp_size))
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
