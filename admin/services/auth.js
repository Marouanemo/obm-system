// ============================================================
// Auth service — bcrypt password check + session middleware
// ============================================================
const bcrypt = require('bcryptjs');

function checkPassword(plain) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    console.error('[auth] ADMIN_PASSWORD_HASH is not set in env');
    return false;
  }
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  // For browser navigation, redirect; for API, respond JSON
  if (req.accepts('html')) {
    return res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { checkPassword, requireAuth };
