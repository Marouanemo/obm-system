// ============================================================
// System pages SEO routes — landing, blog index, cases index
// ============================================================
const express = require('express');
const pages = require('../services/pages');
const { list: listContent } = require('../services/content');
const { patchLanding } = require('../services/landing-seo');
const { regenerateBlogIndex, regenerateCasesIndex } = require('../services/generator');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [posts, cases] = await Promise.all([listContent('blog'), listContent('cases')]);
    res.render('pages-list', {
      user: req.session.user,
      pages: pages.list(),
      posts,
      cases,
      flash: req.query.flash || null,
    });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const page = await pages.read(req.params.id);
    if (!page) return res.status(404).render('error', { code: 404, message: 'Page inconnue.', user: req.session.user });
    res.render('pages-edit', {
      user: req.session.user,
      page,
      error: null,
      flash: req.query.flash || null,
    });
  } catch (e) { next(e); }
});

router.post('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const meta = pages.meta(id);
    if (!meta) return res.status(404).render('error', { code: 404, message: 'Page inconnue.', user: req.session.user });
    const body = req.body || {};
    const data = {
      title: (body.title || '').trim(),
      description: (body.description || '').trim(),
      keywords: (body.keywords || '').trim(),
      ogTitle: (body.ogTitle || '').trim(),
      ogDescription: (body.ogDescription || '').trim(),
      ogImage: (body.ogImage || '').trim(),
      twitterTitle: (body.twitterTitle || '').trim(),
      twitterDescription: (body.twitterDescription || '').trim(),
      twitterImage: (body.twitterImage || '').trim(),
      noindex: body.noindex === 'on' || body.noindex === true,
      nofollow: body.nofollow === 'on' || body.nofollow === true,
    };
    const saved = await pages.write(id, data);

    // Apply the SEO change to the actual served file
    if (id === 'landing') {
      await patchLanding(saved);
    } else if (id === 'blog-index') {
      await regenerateBlogIndex();
    } else if (id === 'cases-index') {
      await regenerateCasesIndex();
    }

    res.redirect(`/admin/pages/${id}?flash=` + encodeURIComponent('SEO enregistré et appliqué au site.'));
  } catch (e) { next(e); }
});

module.exports = router;
