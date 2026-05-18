// ============================================================
// Case studies CRUD routes
// ============================================================
const express = require('express');
const { list, read, write, remove, rename, makeSlug } = require('../services/content');
const { generateCase, deleteGenerated, regenerateCasesIndex } = require('../services/generator');

const router = express.Router();

function parseSubMetrics(body) {
  const labels = [].concat(body.subMetricsLabel || []);
  const values = [].concat(body.subMetricsValue || []);
  const units  = [].concat(body.subMetricsUnit  || []);
  const out = [];
  for (let i = 0; i < Math.max(labels.length, values.length); i++) {
    const label = (labels[i] || '').trim();
    const value = (values[i] || '').trim();
    const unit  = (units[i]  || '').trim();
    if (label || value) out.push({ label, value, unit });
  }
  return out;
}

router.get('/new', (req, res) => {
  res.render('editor', {
    user: req.session.user,
    type: 'cases',
    item: null,
    isNew: true,
    error: null,
  });
});

router.get('/:slug/edit', async (req, res, next) => {
  try {
    const item = await read('cases', req.params.slug);
    if (!item) return res.redirect('/admin/dashboard?flash=' + encodeURIComponent('Cas client introuvable.'));
    res.render('editor', {
      user: req.session.user,
      type: 'cases',
      item,
      isNew: false,
      error: null,
    });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const title = (body.title || '').trim();
    if (!title) {
      return res.status(400).render('editor', {
        user: req.session.user, type: 'cases', item: null, isNew: true,
        error: 'Le titre est requis.',
      });
    }
    const slug = (body.slug && body.slug.trim()) || makeSlug(title);
    const existing = await read('cases', slug);
    if (existing) {
      return res.status(409).render('editor', {
        user: req.session.user, type: 'cases', item: null, isNew: true,
        error: 'Ce slug existe déjà. Modifiez-le.',
      });
    }
    const data = buildCaseData(body);
    await write('cases', slug, data, body.content || '');
    await generateCase(slug);
    res.redirect(`/admin/cases/${slug}/edit?flash=` + encodeURIComponent('Cas client créé.'));
  } catch (e) { next(e); }
});

router.post('/:slug', async (req, res, next) => {
  try {
    const oldSlug = req.params.slug;
    const body = req.body || {};
    const title = (body.title || '').trim();
    if (!title) {
      const item = await read('cases', oldSlug);
      return res.status(400).render('editor', {
        user: req.session.user, type: 'cases', item, isNew: false,
        error: 'Le titre est requis.',
      });
    }
    const newSlug = (body.slug && body.slug.trim()) || oldSlug;

    if (newSlug !== oldSlug) {
      const existing = await read('cases', newSlug);
      if (existing) {
        const item = await read('cases', oldSlug);
        return res.status(409).render('editor', {
          user: req.session.user, type: 'cases', item, isNew: false,
          error: 'Le nouveau slug existe déjà.',
        });
      }
      await rename('cases', oldSlug, newSlug);
      await deleteGenerated('cases', oldSlug);
    }

    const data = buildCaseData(body);
    await write('cases', newSlug, data, body.content || '');
    await generateCase(newSlug);
    res.redirect(`/admin/cases/${newSlug}/edit?flash=` + encodeURIComponent('Cas client enregistré.'));
  } catch (e) { next(e); }
});

router.post('/:slug/delete', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    await remove('cases', slug);
    await deleteGenerated('cases', slug);
    res.redirect('/admin/dashboard?flash=' + encodeURIComponent('Cas client supprimé.'));
  } catch (e) { next(e); }
});

function buildCaseData(body) {
  return {
    title: (body.title || '').trim(),
    date: body.date || new Date().toISOString().slice(0, 10),
    category: (body.category || '').trim(),
    location: (body.location || '').trim(),
    duration: (body.duration || '').trim(),
    excerpt: (body.excerpt || '').trim(),
    bigMetricValue: (body.bigMetricValue || '').trim(),
    bigMetricUnit:  (body.bigMetricUnit  || '').trim(),
    bigMetricLabel: (body.bigMetricLabel || '').trim(),
    subMetrics: parseSubMetrics(body),
    image: (body.image || '').trim(),
    metaTitle: (body.metaTitle || '').trim(),
    tag: (body.tag || '').trim(),
    published: body.published === 'on' || body.published === true,
  };
}

module.exports = router;
