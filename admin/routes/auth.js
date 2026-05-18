// ============================================================
// Auth routes — login / logout
// ============================================================
const express = require('express');
const { checkPassword } = require('../services/auth');

module.exports = (loginLimiter) => {
  const router = express.Router();

  router.get('/login', (req, res) => {
    if (req.session && req.session.user) return res.redirect('/admin/dashboard');
    res.render('login', { error: null, next: req.query.next || '' });
  });

  router.post('/login', loginLimiter, (req, res) => {
    const { username, password } = req.body || {};
    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    if (!username || !password) {
      return res.status(400).render('login', { error: 'Identifiant et mot de passe requis.', next: req.body.next || '' });
    }
    if (username !== expectedUsername || !checkPassword(password)) {
      return res.status(401).render('login', { error: 'Identifiants invalides.', next: req.body.next || '' });
    }
    req.session.user = { username, loggedAt: Date.now() };
    const next = req.body.next && String(req.body.next).startsWith('/admin') ? req.body.next : '/admin/dashboard';
    res.redirect(next);
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('obm.sid');
      res.redirect('/admin/login');
    });
  });

  return router;
};
