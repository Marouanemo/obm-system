// ============================================================
// OBM SYSTEM — Admin Server
// ============================================================
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const blogRoutes = require('./routes/blog');
const casesRoutes = require('./routes/cases');
const mediaRoutes = require('./routes/media');
const pagesRoutes = require('./routes/pages');

const { requireAuth } = require('./services/auth');

const app = express();
const PORT = process.env.PORT || 3201;

// Trust the nginx reverse proxy so secure cookies + real IPs work
app.set('trust proxy', 1);

// Ensure required directories exist
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(__dirname, 'content');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../obm-system/public/assets/uploads');
['blog', 'cases'].forEach((sub) => {
  const dir = path.join(CONTENT_DIR, sub);
  fs.mkdirSync(dir, { recursive: true });
});
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Security & perf middleware
app.use(helmet({
  contentSecurityPolicy: false, // we use inline scripts in admin views, simpler
}));
app.use(compression());
app.use(cookieParser());

// Body parsing — small limits for security
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

// Sessions — single-instance, in-memory store is fine for solo admin
app.use(session({
  name: 'obm.sid',
  secret: process.env.SESSION_SECRET || 'change-me-immediately',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8, // 8h sliding window
    path: '/admin',
  },
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// All admin routes mounted under /admin (nginx strips nothing — same path on both sides)
const admin = express.Router();

// Rate limit auth attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

// Static assets for the admin UI itself (CSS, etc.)
admin.use('/_static', express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
}));

// Auth routes (some require login, login itself doesn't)
admin.use('/', authRoutes(loginLimiter));

// All routes below this line require authentication
admin.use(requireAuth);

admin.get('/', (req, res) => res.redirect('/admin/dashboard'));
admin.use('/dashboard', dashboardRoutes);
admin.use('/blog', blogRoutes);
admin.use('/cases', casesRoutes);
admin.use('/media', mediaRoutes);
admin.use('/pages', pagesRoutes);

// Mount under /admin
app.use('/admin', admin);

// Health check (unauthenticated, used by systemd/uptime)
app.get('/healthz', (req, res) => res.json({ ok: true, ts: Date.now() }));

// 404 handler for admin
app.use('/admin/*', (req, res) => {
  res.status(404).render('error', {
    code: 404,
    message: 'Page introuvable',
    user: req.session?.user || null,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[admin] error:', err);
  if (res.headersSent) return next(err);
  res.status(500);
  try {
    res.render('error', {
      code: 500,
      message: err.message || 'Erreur serveur',
      user: req.session?.user || null,
    });
  } catch {
    res.send('Internal Server Error');
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[admin] OBM SYSTEM admin listening on http://127.0.0.1:${PORT}`);
  console.log(`[admin] Content dir : ${CONTENT_DIR}`);
  console.log(`[admin] Uploads dir : ${UPLOADS_DIR}`);
});
