const express = require('express');
const { list } = require('../services/content');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [posts, cases] = await Promise.all([list('blog'), list('cases')]);
    res.render('dashboard', {
      user: req.session.user,
      posts,
      cases,
      flash: req.query.flash || null,
    });
  } catch (e) { next(e); }
});

module.exports = router;
