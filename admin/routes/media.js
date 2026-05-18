// ============================================================
// Media library — list, upload, delete images
// Uploads go to /var/www/obm-system/public/assets/uploads/
// served at https://obm-system.com/assets/uploads/<filename>
// ============================================================
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/obm-system/public/assets/uploads';
const SITE_URL = (process.env.SITE_URL || 'https://obm-system.com').replace(/\/$/, '');

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdir(UPLOADS_DIR, { recursive: true }).then(() => cb(null, UPLOADS_DIR)).catch(cb);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return cb(new Error('Type de fichier non autorisé.'));
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image';
    const stamp = Date.now().toString(36);
    cb(null, `${base}-${stamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXT.has(ext)) return cb(null, true);
    cb(new Error('Type non autorisé. Formats acceptés : ' + [...ALLOWED_EXT].join(', ')));
  }
});

const router = express.Router();

// Listing page
router.get('/', async (req, res, next) => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const files = await fs.readdir(UPLOADS_DIR);
    const items = [];
    for (const f of files) {
      try {
        const stat = await fs.stat(path.join(UPLOADS_DIR, f));
        if (stat.isFile()) {
          items.push({
            name: f,
            url: `${SITE_URL}/assets/uploads/${f}`,
            size: stat.size,
            mtime: stat.mtime,
          });
        }
      } catch {}
    }
    items.sort((a, b) => b.mtime - a.mtime);
    res.render('media', {
      user: req.session.user,
      items,
      error: req.query.error || null,
      flash: req.query.flash || null,
    });
  } catch (e) { next(e); }
});

// Upload
router.post('/upload', upload.array('files', 10), (req, res) => {
  const count = (req.files || []).length;
  res.redirect('/admin/media?flash=' + encodeURIComponent(`${count} fichier(s) téléversé(s).`));
});

// Delete
router.post('/:name/delete', async (req, res, next) => {
  try {
    const safeName = path.basename(req.params.name);
    await fs.unlink(path.join(UPLOADS_DIR, safeName));
    res.redirect('/admin/media?flash=' + encodeURIComponent('Fichier supprimé.'));
  } catch (e) {
    if (e.code === 'ENOENT') return res.redirect('/admin/media?error=' + encodeURIComponent('Fichier introuvable.'));
    next(e);
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err) {
    return res.redirect('/admin/media?error=' + encodeURIComponent(err.message || 'Erreur upload.'));
  }
  next();
});

module.exports = router;
