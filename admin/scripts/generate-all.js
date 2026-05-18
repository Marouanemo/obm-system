#!/usr/bin/env node
// Regenerate all static HTML pages from the content/ directory.
// Useful after a manual edit of .md files, or to rebuild the site.
require('dotenv').config();
const { regenerateAll, regenerateBlogIndex, regenerateCasesIndex, regenerateSitemap } = require('../services/generator');

(async () => {
  console.log('Regenerating blog posts + case studies + indexes + sitemap…');
  await regenerateAll();
  await regenerateBlogIndex();
  await regenerateCasesIndex();
  await regenerateSitemap();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
