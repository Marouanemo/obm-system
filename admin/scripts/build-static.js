#!/usr/bin/env node
// Construit les pages statiques du site (accueil, diagnostic, services, méthode,
// contact, à propos, offre, pages légales, 404) à partir de admin/static/*.js
// et du gabarit commun services/layout.js.
//
// Usage : PUBLIC_DIR=.. node scripts/build-static.js
const fs = require('fs');
const path = require('path');
const L = require('../services/layout');

const PUBLIC_DIR = process.env.PUBLIC_DIR || '/var/www/obm-system/public';
const pages = ['home', 'diagnostic', 'services', 'pages']
  .flatMap((m) => require(`../static/${m}`)(L));

for (const p of pages) {
  const crumbs = p.crumbs || null;
  const schemas = [].concat(p.schema || [], crumbs ? [L.breadcrumbSchema(crumbs)] : []);
  const headHtml = L.head({ ...p.head, path: p.path, schema: schemas });
  const crumbHtml = crumbs ? L.breadcrumbHtml(crumbs) : '';
  const main = typeof p.main === 'function' ? p.main(crumbHtml) : p.main;
  const html = L.page({ headHtml, current: p.current, main });
  const file = p.path.endsWith('.html')
    ? path.join(PUBLIC_DIR, p.path)
    : path.join(PUBLIC_DIR, p.path, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
  console.log('écrit', p.path);
}
