#!/usr/bin/env python3
"""Prepare a recommendation audio preview.

Downloads (or copies) the source, keeps the master outside the repo, then
loudness-normalises and encodes an AAC/.m4a file for the site. Prints a JSON
summary on stdout.

Usage:
    python3 tools/rec_work/audio.py --url URL --slug SLUG [--start 0] [--duration 90]
                                    [--bitrate 128k] [--force]
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_DIR = os.path.join(REPO, "source", "audio", "recommendations")
MASTERS_DIR = os.environ.get("REC_AUDIO_MASTERS", "/home/gargantua/rec_assets/audio_masters")
FFMPEG = None
LOUDNORM = "I=-16:TP=-1.5:LRA=11"


def log(message):
    print(message, file=sys.stderr)


def find_ffmpeg():
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:  # noqa: BLE001 - fall back to a system binary
        for name in ("ffmpeg", "avconv"):
            path = shutil.which(name)
            if path:
                return path
    raise SystemExit("ffmpeg not found (pip install imageio-ffmpeg)")


def run(args, capture=False):
    result = subprocess.run(args, capture_output=capture, text=True)
    if result.returncode != 0:
        if capture:
            log((result.stderr or "").strip()[-800:])
        raise SystemExit("command failed: " + " ".join(args[:6]) + " ...")
    return result.stdout if capture else ""


def probe(path):
    """Return (duration_seconds, stream_summary) by parsing `ffmpeg -i` output."""
    result = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True)
    text = result.stderr or ""

    duration = None
    match = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", text)
    if match:
        hours, minutes, seconds = match.groups()
        duration = int(hours) * 3600 + int(minutes) * 60 + float(seconds)

    stream = None
    match = re.search(r"Stream #\d+:\d+.*?: Audio: ([^,]+), (\d+) Hz, ([^,]+)(?:, [^,]+)?, (\d+) kb/s", text)
    if match:
        codec, rate, layout, bitrate = match.groups()
        stream = "%s %sHz %s %skbps" % (codec.strip(), rate, layout.strip(), bitrate)

    return duration, stream


def download(url, target):
    command = ["curl", "-sS", "-L", "--max-time", "600", "--retry", "2", "-o", target, url]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0 or not os.path.exists(target) or os.path.getsize(target) < 1024:
        raise SystemExit("download failed: " + (result.stderr or "").strip()[-300:])


def measure_loudness(path, start, duration):
    args = [FFMPEG, "-hide_banner", "-nostats"]
    if start:
        args += ["-ss", str(start)]
    args += ["-i", path]
    if duration:
        args += ["-t", str(duration)]
    args += ["-af", "loudnorm=%s:print_format=json" % LOUDNORM, "-f", "null", "-"]
    result = subprocess.run(args, capture_output=True, text=True)
    stderr = result.stderr or ""
    if result.returncode != 0:
        log(stderr.strip()[-500:])
        raise SystemExit("loudness analysis failed")
    payload = stderr[stderr.rindex("{"):stderr.rindex("}") + 1]
    return json.loads(payload)


def main():
    global FFMPEG
    parser = argparse.ArgumentParser()
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--url")
    source.add_argument("--file")
    parser.add_argument("--slug", required=True)
    parser.add_argument("--out-dir", default=OUT_DIR)
    parser.add_argument("--masters-dir", default=MASTERS_DIR)
    parser.add_argument("--bitrate", default="128k")
    parser.add_argument("--start", type=float, default=None, help="trim start (seconds)")
    parser.add_argument("--duration", type=float, default=None, help="trim length (seconds)")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    FFMPEG = find_ffmpeg()
    os.makedirs(args.out_dir, exist_ok=True)
    os.makedirs(args.masters_dir, exist_ok=True)

    target = os.path.join(args.out_dir, args.slug + ".m4a")
    if os.path.exists(target) and not args.force:
        log("output already exists, use --force to overwrite: " + target)
        return 1

    if args.file:
        ext = os.path.splitext(args.file)[1] or ".bin"
        master = os.path.join(args.masters_dir, args.slug + ext)
        if not os.path.exists(master) or args.force:
            shutil.copy2(args.file, master)
    else:
        ext = os.path.splitext(args.url.split("?")[0])[1] or ".bin"
        master = os.path.join(args.masters_dir, args.slug + ext)
        if not os.path.exists(master) or args.force:
            log("downloading %s" % args.url)
            download(args.url, master)

    master_bytes = os.path.getsize(master)
    master_duration, master_stream = probe(master)

    measurements = measure_loudness(master, args.start, args.duration)
    log("loudness: I=%s TP=%s LRA=%s" % (
        measurements.get("input_i"), measurements.get("input_tp"), measurements.get("input_lra")))

    trim = []
    if args.start:
        trim += ["-ss", str(args.start)]
    if args.duration:
        trim += ["-t", str(args.duration)]

    loudnorm = (
        "loudnorm=%s:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true"
        % (LOUDNORM, measurements["input_i"], measurements["input_tp"], measurements["input_lra"],
           measurements["input_thresh"], measurements["target_offset"])
    )
    run([FFMPEG, "-hide_banner", "-nostats", "-y"] + trim + [
        "-i", master,
        "-af", loudnorm,
        "-c:a", "aac", "-b:a", args.bitrate, "-ar", "48000",
        "-movflags", "+faststart",
        "-map_metadata", "-1", "-metadata", "title=" + args.slug,
        target,
    ])

    out_duration, out_stream = probe(target)
    out_bytes = os.path.getsize(target)
    result = {
        "slug": args.slug,
        "audio": "/audio/recommendations/%s.m4a" % args.slug,
        "master": master,
        "master_bytes": master_bytes,
        "master_duration_s": round(master_duration or 0, 1),
        "master_stream": master_stream,
        "output_bytes": out_bytes,
        "output_duration_s": round(out_duration or 0, 1),
        "output_stream": out_stream,
        "bitrate_target": args.bitrate,
        "loudness_lufs": -16.0,
    }
    print(json.dumps(result, ensure_ascii=False))
    if out_bytes > 6 * 1024 * 1024:
        log("WARNING: output larger than 6 MB, consider --bitrate 96k or a shorter excerpt")
    return 0


if __name__ == "__main__":
    sys.exit(main())
