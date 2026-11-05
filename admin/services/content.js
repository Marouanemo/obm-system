// ============================================================
// Content service — read/write Markdown files with YAML frontmatter
// ============================================================
const fs = require('fs/promises');
const path = require('path');
const matter = require('gray-matter');
const slugify = require('slugify');

const CONTENT_DIR = process.env.CONTENT_DIR || path.join(__dirname, '..', 'content');

function dirFor(type) {
  return path.join(CONTENT_DIR, type);
}

function fileFor(type, slug) {
  return path.join(dirFor(type), `${slug}.md`);
}

function makeSlug(title) {
  return slugify(String(title || ''), {
    lower: true,
    strict: true,
    locale: 'fr',
  }).slice(0, 80);
}

async function list(type) {
  const dir = dirFor(type);
  await fs.mkdir(dir, { recursive: true });
  const files = await fs.readdir(dir);
  const items = [];
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(dir, f), 'utf8');
    const { data, content } = matter(raw);
    items.push({
      slug: f.replace(/\.md$/, ''),
      title: data.title || '(sans titre)',
      date: data.date || '',
      category: data.category || '',
      published: data.published !== false,
      order: data.order || 0,
      excerpt: data.excerpt || '',
      readTime: data.readTime || '',
      updatedAt: data.updatedAt || data.date || '',
      location: data.location || '',
      image: data.image || '',
      mobileImage: data.mobileImage || '',
      site: data.site || '',
      type,
    });
  }
  // newest first
  items.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.order - b.order);
  return items;
}

async function read(type, slug) {
  const file = fileFor(type, slug);
  try {
    const raw = await fs.readFile(file, 'utf8');
    const { data, content } = matter(raw);
    return { data, content, slug };
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

async function readRaw(file) {
  try { return matter(await fs.readFile(file, 'utf8')); } catch { return null; }
}

// Compare deux frontmatters, sans updatedAt ni les champs vides absents d'un côté
function same(a, b) {
  const val = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);
  const clean = (o) => JSON.stringify(Object.keys(o)
    .filter((k) => k !== 'updatedAt' && o[k] !== '' && o[k] != null && o[k] !== false && !(Array.isArray(o[k]) && !o[k].length))
    .sort().map((k) => [k, val(o[k])]));
  return clean(a) === clean(b);
}

async function write(type, slug, data, content) {
  const dir = dirFor(type);
  await fs.mkdir(dir, { recursive: true });
  const file = fileFor(type, slug);

  // Les champs absents du formulaire (décisions, services, site, ordre…) sont conservés.
  // La date de mise à jour ne change que si quelque chose change.
  const before = await readRaw(file);
  const next = { ...(before ? before.data : {}), ...data };
  const unchanged = before && same(before.data, next) && before.content.replace(/\r\n/g, '\n').trim() === String(content || '').replace(/\r\n/g, '\n').trim();
  const merged = { ...next, updatedAt: unchanged ? before.data.updatedAt : new Date().toISOString().slice(0, 10) };

  const md = matter.stringify(content || '', merged);
  await fs.writeFile(file, md, 'utf8');
  return { slug, data: merged, content };
}

async function remove(type, slug) {
  const file = fileFor(type, slug);
  try {
    await fs.unlink(file);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    throw e;
  }
}

async function rename(type, oldSlug, newSlug) {
  if (oldSlug === newSlug) return;
  const oldFile = fileFor(type, oldSlug);
  const newFile = fileFor(type, newSlug);
  // Avoid overwrite
  try {
    await fs.access(newFile);
    throw new Error('Un contenu avec ce slug existe déjà.');
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  await fs.rename(oldFile, newFile);
}

module.exports = { list, read, write, remove, rename, makeSlug };
