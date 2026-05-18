// ============================================================
// Landing SEO patcher — surgically updates the SEO meta tags
// in /var/www/obm-system/public/index.html based on settings
// stored in content/pages/landing.json.
//
// We use targeted regex replaces on specific tags so the rest of
// the (hand-written) HTML stays untouched.
// ============================================================
const fs = require('fs/promises');
const path = require('path');

const PUBLIC_DIR = process.env.PUBLIC_DIR || '/var/www/obm-system/public';
const SITE_URL = (process.env.SITE_URL || 'https://obm-system.com').replace(/\/$/, '');

function escAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escText(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function absUrl(u) {
  if (!u) return '';
  if (/^https?:\/\//.test(u)) return u;
  return SITE_URL + (u.startsWith('/') ? u : '/' + u);
}

function replaceTitleTag(html, value) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escText(value)}</title>`);
}

function replaceMetaName(html, name, value) {
  // Matches <meta name="NAME" content="..." />
  const rx = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`, 'i');
  if (rx.test(html)) {
    return html.replace(rx, `<meta name="${name}" content="${escAttr(value)}" />`);
  }
  // Insert before </head> if missing
  return html.replace('</head>', `  <meta name="${name}" content="${escAttr(value)}" />\n</head>`);
}

function replaceMetaProperty(html, prop, value) {
  const rx = new RegExp(`<meta\\s+property="${prop}"\\s+content="[^"]*"\\s*/?>`, 'i');
  if (rx.test(html)) {
    return html.replace(rx, `<meta property="${prop}" content="${escAttr(value)}" />`);
  }
  return html.replace('</head>', `  <meta property="${prop}" content="${escAttr(value)}" />\n</head>`);
}

function applySeoToHtml(html, seo) {
  const description = seo.description || '';
  const robotsParts = [];
  robotsParts.push(seo.noindex ? 'noindex' : 'index');
  robotsParts.push(seo.nofollow ? 'nofollow' : 'follow');
  if (!seo.noindex) robotsParts.push('max-image-preview:large');
  const robots = robotsParts.join(', ');

  const ogTitle = seo.ogTitle || seo.title;
  const ogDescription = seo.ogDescription || description;
  const ogImage = absUrl(seo.ogImage || '/assets/img/og-cover.svg');

  const twTitle = seo.twitterTitle || ogTitle;
  const twDesc = seo.twitterDescription || ogDescription;
  const twImage = absUrl(seo.twitterImage || ogImage);

  let out = html;
  out = replaceTitleTag(out, seo.title);
  out = replaceMetaName(out, 'description', description);
  out = replaceMetaName(out, 'keywords', seo.keywords || '');
  out = replaceMetaName(out, 'robots', robots);

  out = replaceMetaProperty(out, 'og:title', ogTitle);
  out = replaceMetaProperty(out, 'og:description', ogDescription);
  out = replaceMetaProperty(out, 'og:image', ogImage);

  out = replaceMetaName(out, 'twitter:title', twTitle);
  out = replaceMetaName(out, 'twitter:description', twDesc);
  out = replaceMetaName(out, 'twitter:image', twImage);

  return out;
}

async function patchLanding(seo) {
  const file = path.join(PUBLIC_DIR, 'index.html');
  const html = await fs.readFile(file, 'utf8');
  const patched = applySeoToHtml(html, seo);
  if (patched === html) return false;
  await fs.writeFile(file, patched, 'utf8');
  return true;
}

module.exports = { patchLanding, applySeoToHtml };
