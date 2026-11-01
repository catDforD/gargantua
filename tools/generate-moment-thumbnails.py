#!/usr/bin/env python3
"""Generate display-sized WebP previews for images used by moments."""

import argparse
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'source'
THUMBNAILS = SOURCE / 'img' / 'moment-thumbs'


def generate(path):
    path = path.resolve()
    try:
        relative = path.relative_to(SOURCE.resolve())
    except ValueError:
        raise ValueError(f'Image must be inside {SOURCE}: {path}') from None
    if not path.is_file():
        raise ValueError(f'Image not found: {path}')

    target = THUMBNAILS / (relative.as_posix() + '.webp')
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original)
        image.thumbnail((960, 960), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=82, method=6)
    print(f'{relative} -> {target.relative_to(SOURCE)} ({target.stat().st_size} bytes)')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('images', nargs='+', type=Path, help='image paths inside source/')
    args = parser.parse_args()
    for image in args.images:
        generate(image)


if __name__ == '__main__':
    main()
