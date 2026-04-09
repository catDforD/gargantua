const fs = require('node:fs');
const path = require('node:path');

const SITE_ROOT = hexo.base_dir;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stableHash(input) {
  let hash = 2166136261;
  const value = String(input);

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function resolveLocalImagePath(src) {
  if (!src || /^https?:\/\//i.test(src)) {
    return null;
  }

  const normalized = decodeURIComponent(src);

  if (normalized.startsWith('/photos/')) {
    return path.join(SITE_ROOT, 'photos', normalized.slice('/photos/'.length));
  }

  if (normalized.startsWith('/img/')) {
    return path.join(SITE_ROOT, 'source', normalized.slice(1));
  }

  if (normalized.startsWith('photos/')) {
    return path.join(SITE_ROOT, normalized);
  }

  if (normalized.startsWith('img/')) {
    return path.join(SITE_ROOT, 'source', normalized);
  }

  return path.join(SITE_ROOT, normalized.replace(/^\.\//, ''));
}

function parsePng(buffer) {
  if (buffer.length < 24) {
    return null;
  }

  const signature = buffer.toString('hex', 0, 8);
  if (signature !== '89504e470d0a1a0a') {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function parseJpeg(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;

    if (marker === 0xd8 || marker === 0xd9) {
      continue;
    }

    if (offset + 2 > buffer.length) {
      break;
    }

    const blockLength = buffer.readUInt16BE(offset);
    if (blockLength < 2 || offset + blockLength > buffer.length) {
      break;
    }

    const isSofMarker =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSofMarker && offset + 7 < buffer.length) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5)
      };
    }

    offset += blockLength;
  }

  return null;
}

function parseWebp(buffer) {
  if (buffer.length < 30) {
    return null;
  }

  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }

  const chunkType = buffer.toString('ascii', 12, 16);

  if (chunkType === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3)
    };
  }

  if (chunkType === 'VP8 ') {
    if (buffer.toString('hex', 23, 26) !== '9d012a') {
      return null;
    }

    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff
    };
  }

  if (chunkType === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    };
  }

  return null;
}

function readImageDimensions(src) {
  const filePath = resolveLocalImagePath(src);
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.png') {
    return parsePng(buffer);
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    return parseJpeg(buffer);
  }

  if (ext === '.webp') {
    return parseWebp(buffer);
  }

  return null;
}

function classifyShape(width, height, fallback = 'landscape') {
  if (!width || !height) {
    return fallback;
  }

  const ratio = width / height;

  if (ratio >= 2.1) {
    return 'panorama';
  }

  if (ratio >= 1.25) {
    return 'landscape';
  }

  if (ratio <= 0.78) {
    return 'portrait';
  }

  return 'square';
}

function pickVariant(shape, hash) {
  const variants = {
    panorama: ['is-panorama', 'is-panorama-emphasis'],
    landscape: ['is-landscape', 'is-landscape-tall', 'is-landscape-wide'],
    portrait: ['is-portrait', 'is-portrait-tall', 'is-portrait-lean'],
    square: ['is-square', 'is-square-large']
  };

  const choices = variants[shape] || variants.landscape;
  return choices[hash % choices.length];
}

function pickTilt(hash) {
  const tilts = ['tilt-flat', 'tilt-left', 'tilt-right'];
  return tilts[(hash >>> 0) % tilts.length];
}

function renderItem(item, index) {
  const src = item.src || item.image;
  if (!src) {
    return '';
  }

  const dims = readImageDimensions(src);
  const hash = stableHash(`${src}:${index}`);
  const shape = classifyShape(dims?.width, dims?.height, item.shape);
  const variant = pickVariant(shape, hash);
  const tilt = pickTilt(hash >>> 3);
  const href = item.href || item.link || src;
  const target = item.target || (href === src ? '_blank' : '_self');
  const title = item.title || '';
  const note = item.note || item.caption || '';
  const alt = item.alt || title || note || `photo-${index + 1}`;
  const width = dims?.width || '';
  const height = dims?.height || '';

  return [
    `<a class="photography-item ${variant} ${tilt}" href="${escapeHtml(href)}"`,
    `   style="--photo-order:${index + 1}" target="${target}"`,
    '   rel="noopener">',
    `  <span class="photography-frame">`,
    `    <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="${index < 4 ? 'eager' : 'lazy'}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}>`,
    '  </span>',
    title || note
      ? `  <span class="photography-meta"><strong>${escapeHtml(title)}</strong>${note ? `<em>${escapeHtml(note)}</em>` : ''}</span>`
      : '',
    '</a>'
  ].filter(Boolean).join('\n');
}

function renderGallery(data) {
  const intro = data.gallery_intro || '';
  const deck = data.gallery_deck || '';
  const items = Array.isArray(data.gallery) ? data.gallery : [];

  return [
    '<div class="photography-layout">',
    '  <header class="photography-header">',
    `    ${deck ? `<p class="photography-kicker">${escapeHtml(deck)}</p>` : ''}`,
    `    ${intro ? `<p class="photography-subtitle">${escapeHtml(intro)}</p>` : ''}`,
    '  </header>',
    '  <section class="photography-grid">',
    items.map((item, index) => renderItem(item, index)).join('\n'),
    '  </section>',
    '</div>'
  ].filter(Boolean).join('\n');
}

hexo.extend.filter.register('before_post_render', function beforePostRender(data) {
  if (!data.photography_gallery) {
    return data;
  }

  data.content = renderGallery(data);
  return data;
});
