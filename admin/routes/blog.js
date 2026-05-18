// ============================================================
// Blog CRUD routes
// ============================================================
const express = require('express');
const { list, read, write, remove, rename, makeSlug } = require('../services/content');
const { generateBlogPost, deleteGenerated, regenerateBlogIndex } = require('../services/generator');

const router = express.Router();

// New post (form)
router.get('/new', (req, res) => {
  res.render('editor', {
    user: req.session.user,
    type: 'blog',
    item: null,
    isNew: true,
    error: null,
  });
});

// Edit post (form)
router.get('/:slug/edit', async (req, res, next) => {
  try {
    const item = await read('blog', req.params.slug);
    if (!item) return res.redirect('/admin/dashboard?flash=' + encodeURIComponent('Article introuvable.'));
    res.render('editor', {
      user: req.session.user,
      type: 'blog',
      item,
      isNew: false,
      error: null,
    });
  } catch (e) { next(e); }
});

// Create
router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const title = (body.title || '').trim();
    if (!title) {
      return res.status(400).render('editor', {
        user: req.session.user, type: 'blog', item: null, isNew: true,
        error: 'Le titre est requis.',
      });
    }
    const slug = (body.slug && body.slug.trim()) || makeSlug(title);

    // Refuse if already exists
    const existing = await read('blog', slug);
    if (existing) {
      return res.status(409).render('editor', {
        user: req.session.user, type: 'blog', item: null, isNew: true,
        error: 'Ce slug existe déjà. Modifiez-le.',
      });
    }

    const data = {
      title,
      date: body.date || new Date().toISOString().slice(0, 10),
      category: (body.category || '').trim(),
      excerpt: (body.excerpt || '').trim(),
      readTime: (body.readTime || '').trim(),
      tag: (body.tag || '').trim(),
      image: (body.image || '').trim(),
      metaTitle: (body.metaTitle || '').trim(),
      published: body.published === 'on' || body.published === true,
    };
    await write('blog', slug, data, body.content || '');
    await generateBlogPost(slug);
    res.redirect(`/admin/blog/${slug}/edit?flash=` + encodeURIComponent('Article créé.'));
  } catch (e) { next(e); }
});

// Update
router.post('/:slug', async (req, res, next) => {
  try {
    const oldSlug = req.params.slug;
    const body = req.body || {};
    const title = (body.title || '').trim();
    if (!title) {
      const item = await read('blog', oldSlug);
      return res.status(400).render('editor', {
        user: req.session.user, type: 'blog', item, isNew: false,
        error: 'Le titre est requis.',
      });
    }
    const newSlug = (body.slug && body.slug.trim()) || oldSlug;

    if (newSlug !== oldSlug) {
      // Rename: write under new slug, delete old, delete old generated dir
      const existing = await read('blog', newSlug);
      if (existing) {
        const item = await read('blog', oldSlug);
        return res.status(409).render('editor', {
          user: req.session.user, type: 'blog', item, isNew: false,
          error: 'Le nouveau slug existe déjà.',
        });
      }
      await rename('blog', oldSlug, newSlug);
      await deleteGenerated('blog', oldSlug);
    }

    const data = {
      title,
      date: body.date || new Date().toISOString().slice(0, 10),
      category: (body.category || '').trim(),
      excerpt: (body.excerpt || '').trim(),
      readTime: (body.readTime || '').trim(),
      tag: (body.tag || '').trim(),
      image: (body.image || '').trim(),
      metaTitle: (body.metaTitle || '').trim(),
      published: body.published === 'on' || body.published === true,
    };
    await write('blog', newSlug, data, body.content || '');
    await generateBlogPost(newSlug);
    res.redirect(`/admin/blog/${newSlug}/edit?flash=` + encodeURIComponent('Article enregistré.'));
  } catch (e) { next(e); }
});

// Delete
router.post('/:slug/delete', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    await remove('blog', slug);
    await deleteGenerated('blog', slug);
    res.redirect('/admin/dashboard?flash=' + encodeURIComponent('Article supprimé.'));
  } catch (e) { next(e); }
});

module.exports = router;
