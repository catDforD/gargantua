const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const momentsDirectory = path.join(hexo.base_dir, 'moments');

function parseDate(value, fallback) {
  const text = String(value || fallback).trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const normalized = hasTimezone ? text : `${text.replace(' ', 'T')}+08:00`;
  const timestamp = Date.parse(normalized);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function parseImages(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .map((item) => {
      if (typeof item === 'string') return { src: item, alt: '' };
      if (!item || typeof item !== 'object' || !item.src) return null;
      return { src: String(item.src), alt: String(item.alt || '') };
    })
    .filter(Boolean);
}

function parseMoment(fileName) {
  const filePath = path.join(momentsDirectory, fileName);
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`${fileName}: missing YAML front matter`);
  }

  const metadata = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {};
  if (metadata.published === false || metadata.draft === true) return null;

  const body = match[2].trim();
  const date = String(metadata.date || fileName.replace(/\.md$/, ''));
  const html = body
    ? hexo.render.renderSync({ text: body, engine: 'md' }).trim()
    : '';

  return {
    id: String(metadata.id || fileName.replace(/\.md$/, '')),
    date,
    timestamp: parseDate(date, fileName),
    mood: metadata.mood ? String(metadata.mood) : '',
    location: metadata.location ? String(metadata.location) : '',
    images: parseImages(metadata.images),
    html,
  };
}

hexo.extend.generator.register('moments-feed', () => {
  if (!fs.existsSync(momentsDirectory)) {
    return { path: 'moments/data.json', data: '[]' };
  }

  const entries = fs.readdirSync(momentsDirectory)
    .filter((fileName) => fileName.endsWith('.md') && fileName !== 'README.md')
    .map(parseMoment)
    .filter(Boolean)
    .sort((left, right) => right.timestamp - left.timestamp);

  return {
    path: 'moments/data.json',
    data: JSON.stringify(entries),
  };
});
