// ============================================================
// Static HTML generator
// Reads markdown content + frontmatter, renders pages into /public/.
// Also regenerates the blog/cas-clients index pages and sitemap.xml.
// Gabarit commun : ./layout.js (aussi utilisé par scripts/build-static.js)
// ============================================================
const fs = require('fs/promises');
const path = require('path');
const { marked } = require('marked');
const { list, read } = require('./content');
const L = require('./layout');

const PUBLIC_DIR = process.env.PUBLIC_DIR || '/var/www/obm-system/public';
const { SITE_URL, escapeHtml, formatDateFr, absUrl } = L;

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
  smartLists: true,
});

// Champs SEO surchargeables depuis l'admin (frontmatter ou pages système)
function seoHead(data, base) {
  return {
    ...base,
    title: data.metaTitle || base.title,
    description: data.seoDescription || base.description,
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    twitterTitle: data.twitterTitle,
    twitterDescription: data.twitterDescription,
    twitterImage: data.twitterImage,
    ogImage: data.ogImage || base.ogImage,
    noindex: !!data.noindex,
  };
}

function render({ head, schema, crumbs, current, main }) {
  const schemas = [].concat(schema || [], crumbs ? [L.breadcrumbSchema(crumbs)] : []);
  const headHtml = L.head({ ...head, schema: schemas });
  return L.page({ headHtml, current, main: main(crumbs ? L.breadcrumbHtml(crumbs) : '') });
}

const AUTHOR_HTML = `<div class="byline">Par <a href="/a-propos/#oualid" rel="author">Oualid Benamara</a>, fondateur d’OBM System</div>`;

// ------------------------------------------------------------
// Article du Journal
// ------------------------------------------------------------
function renderBlogPostHtml({ slug, data, content }) {
  const url = `/blog/${slug}/`;
  const image = data.image || L.OG_DEFAULT;
  const sources = Array.isArray(data.sources) ? data.sources : [];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.excerpt || undefined,
    image: absUrl(image),
    datePublished: data.date ? new Date(data.date).toISOString().slice(0, 10) : undefined,
    dateModified: (data.updatedAt || data.date) ? new Date(data.updatedAt || data.date).toISOString().slice(0, 10) : undefined,
    author: { '@id': L.PERSON_ID },
    publisher: { '@id': L.ORG_ID },
    mainEntityOfPage: `${SITE_URL}${url}`,
    inLanguage: 'fr-MA',
  };
  return render({
    head: seoHead(data, {
      path: url,
      title: `${data.title} · OBM System`,
      description: data.excerpt || data.title,
      ogImage: image,
      type: 'article',
      publishedTime: data.date ? new Date(data.date).toISOString() : null,
      section: data.category,
    }),
    schema: [schema, L.personNode()],
    crumbs: [['Accueil', '/'], ['Journal', '/blog/'], [data.title, null]],
    current: 'blog',
    main: (crumbs) => `
    <article>
      <header class="page-head">
        <div class="wrap narrow">
          ${crumbs}
          <div class="meta">
            ${data.category ? `<b>${escapeHtml(data.category)}</b>` : ''}
            ${data.date ? `<time datetime="${data.date}">${formatDateFr(data.date)}</time>` : ''}
            ${data.updatedAt && data.updatedAt !== data.date ? `<span>Mis à jour le ${formatDateFr(data.updatedAt)}</span>` : ''}
            ${data.readTime ? `<span>${escapeHtml(data.readTime)}</span>` : ''}
          </div>
          <h1 class="h1">${escapeHtml(data.title)}</h1>
          ${data.excerpt ? `<p class="lead">${escapeHtml(data.excerpt)}</p>` : ''}
          ${AUTHOR_HTML}
        </div>
      </header>
      <div class="wrap narrow prose">
        ${marked.parse(content || '')}
        ${sources.length ? `<aside class="sources"><h2>Sources</h2><ul>${sources.map(s => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a></li>`).join('')}</ul></aside>` : ''}
      </div>
    </article>
    ${L.ctaBand({ loc: `article-${slug}` })}
`,
  });
}

// ------------------------------------------------------------
// Réalisation : « Anatomie d'un système »
// ------------------------------------------------------------
function caseKey(image) {
  return (image || '').replace(/^.*\/([a-z0-9]+)-desktop\.webp$/, '$1');
}
function hostOf(site) {
  return site ? site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '') : '';
}

function renderCasePageHtml({ slug, data, content }) {
  const url = `/cas-clients/${slug}/`;
  const image = data.image || L.OG_DEFAULT;
  const services = Array.isArray(data.services) ? data.services : [];
  const decisions = Array.isArray(data.decisions) ? data.decisions : [];
  const host = hostOf(data.site);
  const key = caseKey(data.image);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline || `${data.title} : anatomie d’un système`,
    description: data.excerpt || undefined,
    about: { '@type': 'Organization', name: data.title, ...(data.site ? { url: data.site } : {}) },
    author: { '@id': L.PERSON_ID },
    publisher: { '@id': L.ORG_ID },
    image: absUrl(image),
    datePublished: data.date ? new Date(data.date).toISOString().slice(0, 10) : undefined,
    mainEntityOfPage: `${SITE_URL}${url}`,
    inLanguage: 'fr-MA',
  };
  const facts = [
    data.category && ['Secteur', escapeHtml(data.category)],
    data.location && ['Lieu', escapeHtml(data.location)],
    data.site && ['Site', `<a class="link" href="${escapeHtml(data.site)}" target="_blank" rel="noopener" data-case="${escapeHtml(slug)}">${escapeHtml(host)}</a>`],
  ].filter(Boolean);

  return render({
    head: seoHead(data, {
      path: url,
      title: `${data.title} : anatomie d’un système · OBM System`,
      description: data.excerpt || data.title,
      ogImage: image,
      type: 'article',
      preload: key ? `<link rel="preload" as="image" href="/assets/img/realisations/${key}-desktop.webp" fetchpriority="high" />` : '',
    }),
    schema: [schema, L.personNode()],
    crumbs: [['Accueil', '/'], ['Réalisations', '/cas-clients/'], [data.title, null]],
    current: 'cases',
    main: (crumbs) => `
    <article>
      <header class="page-head">
        <div class="wrap">
          ${crumbs}
          <span class="kicker">Anatomie d’un système</span>
          <div class="narrow" style="padding:0">
            <h1 class="h1">${escapeHtml(data.title)}</h1>
            ${data.excerpt ? `<p class="lead">${escapeHtml(data.excerpt)}</p>` : ''}
          </div>
          <dl class="facts">
            ${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
          </dl>
          ${services.length ? `<div class="spec" style="margin-top:1rem">${services.map(s => `<span>${escapeHtml(s)}</span>`).join('')}</div>` : ''}
        </div>
      </header>
      <div class="wrap">
        <div class="case-shot">${key ? L.shot({ key, host, alt: `Site ${data.title}`, phone: !!data.mobileImage, lazy: false, priority: true }) : ''}</div>
      </div>
      <div class="wrap narrow prose">
        ${decisions.length ? `<h2>${decisions.length} décisions de conception</h2>
        <div class="decisions">
          ${decisions.map((d, i) => `<section class="decision">
            <span class="decision__n">${String(i + 1).padStart(2, '0')} · ${escapeHtml(d.fonction)}</span>
            <h3>${escapeHtml(d.titre)}</h3>
            <p>${escapeHtml(d.texte)}</p>
            ${d.spec ? `<div class="spec"><code>${escapeHtml(d.spec)}</code></div>` : ''}
          </section>`).join('\n          ')}
        </div>` : ''}
        ${marked.parse(content || '')}
        ${data.next ? `<p style="margin-top:2.5rem"><a class="btn btn--line" href="/cas-clients/${escapeHtml(data.next.slug)}/">Réalisation suivante : ${escapeHtml(data.next.title)}</a></p>` : ''}
      </div>
    </article>
    ${L.ctaBand({ loc: `case-${slug}` })}
`,
  });
}

// ------------------------------------------------------------
// Pages de liste
// ------------------------------------------------------------
function renderBlogIndexHtml(posts, pageSeo) {
  const seo = pageSeo || {};
  const cards = posts.filter(p => p.published).map(p => `
          <a class="post" href="/blog/${p.slug}/">
            <small>${[p.category, p.date ? formatDateFr(p.date) : ''].filter(Boolean).map(escapeHtml).join(' · ')}</small>
            <h3>${escapeHtml(p.title)}</h3>
            ${p.excerpt ? `<p>${escapeHtml(p.excerpt)}</p>` : ''}
            <span>Lire l’analyse${p.readTime ? ` (${escapeHtml(p.readTime.replace(/ de lecture$/, ''))})` : ''}</span>
          </a>`).join('\n');

  return render({
    head: {
      path: '/blog/',
      title: seo.title || 'Journal : analyses mesure, acquisition, SEO · OBM System',
      description: seo.description || 'Tracking, publicité Meta et Google, référencement et IA : des analyses techniques, sourcées et applicables.',
      ogTitle: seo.ogTitle, ogDescription: seo.ogDescription, ogImage: seo.ogImage,
      noindex: seo.noindex,
    },
    crumbs: [['Accueil', '/'], ['Journal', null]],
    current: 'blog',
    main: (crumbs) => `
    <section class="page-head">
      <div class="wrap">
        ${crumbs}
        <span class="kicker">Journal</span>
        <h1 class="h1">Analyses</h1>
        <p class="lead">Mesure, acquisition, visibilité : ce que nous appliquons, expliqué avec précision.</p>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="wrap posts">
${cards}
      </div>
    </section>
    ${L.ctaBand({ loc: 'blog-band' })}
`,
  });
}

function renderCasesIndexHtml(cases, pageSeo) {
  const seo = pageSeo || {};
  const cards = cases.filter(c => c.published).map(c => {
    const key = caseKey(c.image);
    return `
          <a class="list-card" href="/cas-clients/${c.slug}/" data-case="${escapeHtml(c.slug)}">
            ${key ? L.shot({ key, host: hostOf(c.site), alt: `Site ${c.title}` }) : ''}
            <p class="muted">${[c.category, c.location].filter(Boolean).map(escapeHtml).join(', ')}</p>
            <h2>${escapeHtml(c.title)}</h2>
            ${c.excerpt ? `<p>${escapeHtml(c.excerpt)}</p>` : ''}
          </a>`;
  }).join('\n');

  return render({
    head: {
      path: '/cas-clients/',
      title: seo.title || 'Réalisations : anatomie d’un système · OBM System',
      description: seo.description || 'Plateformes, e-commerce et sites livrés au Maroc et au Canada, décortiqués décision par décision.',
      ogTitle: seo.ogTitle, ogDescription: seo.ogDescription, ogImage: seo.ogImage,
      noindex: seo.noindex,
    },
    crumbs: [['Accueil', '/'], ['Réalisations', null]],
    current: 'cases',
    main: (crumbs) => `
    <section class="page-head">
      <div class="wrap">
        ${crumbs}
        <span class="kicker">Réalisations</span>
        <h1 class="h1">Anatomie d’un système</h1>
        <p class="lead">Un site se juge aux décisions qui le font vendre. Pour chaque projet, nous montrons les choix de conception et ce qu’ils apportent au business.</p>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="wrap list-grid">
${cards}
      </div>
    </section>
    ${L.ctaBand({ loc: 'cases-band' })}
`,
  });
}

// ------------------------------------------------------------
// Sitemap
// ------------------------------------------------------------
async function regenerateSitemap() {
  const posts = (await list('blog')).filter(p => p.published);
  const cases = (await list('cases')).filter(c => c.published);
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    ...L.STATIC_PAGES.map(p => ({
      loc: `${SITE_URL}${p.path}`,
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
      image: p.path === '/' ? absUrl(L.OG_DEFAULT) : '',
    })),
    { loc: `${SITE_URL}/cas-clients/`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
    ...cases.map(c => ({ loc: `${SITE_URL}/cas-clients/${c.slug}/`, lastmod: c.updatedAt || c.date || '', changefreq: 'yearly', priority: '0.7', image: c.image ? absUrl(c.image) : '' })),
    { loc: `${SITE_URL}/blog/`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    ...posts.map(p => ({ loc: `${SITE_URL}/blog/${p.slug}/`, lastmod: p.updatedAt || p.date || '', changefreq: 'monthly', priority: '0.7' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.image ? `<image:image><image:loc>${u.image}</image:loc></image:image>` : ''}
  </url>`).join('\n')}
</urlset>
`;
  await fs.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
}

// ------------------------------------------------------------
// Entry points used by the routes
// ------------------------------------------------------------
async function writePage(dirParts, html) {
  const dir = path.join(PUBLIC_DIR, ...dirParts);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8');
}

async function generateBlogPost(slug) {
  const item = await read('blog', slug);
  if (!item) return false;
  await writePage(['blog', slug], renderBlogPostHtml(item));
  await regenerateBlogIndex();
  await regenerateSitemap();
  return true;
}

async function generateCase(slug) {
  const item = await read('cases', slug);
  if (!item) return false;
  await writePage(['cas-clients', slug], renderCasePageHtml(item));
  await regenerateCasesIndex();
  await regenerateSitemap();
  return true;
}

async function pageSeo(id) {
  try {
    const pages = require('./pages');
    const page = await pages.read(id);
    return page ? page.data : null;
  } catch { return null; }
}

async function regenerateBlogIndex() {
  await writePage(['blog'], renderBlogIndexHtml(await list('blog'), await pageSeo('blog-index')));
}

async function regenerateCasesIndex() {
  await writePage(['cas-clients'], renderCasesIndexHtml(await list('cases'), await pageSeo('cases-index')));
}

async function deleteGenerated(type, slug) {
  const map = { blog: 'blog', cases: 'cas-clients' };
  await fs.rm(path.join(PUBLIC_DIR, map[type], slug), { recursive: true, force: true });
  if (type === 'blog') await regenerateBlogIndex();
  else await regenerateCasesIndex();
  await regenerateSitemap();
}

async function regenerateAll() {
  for (const p of await list('blog')) await generateBlogPost(p.slug);
  for (const c of await list('cases')) await generateCase(c.slug);
}

module.exports = {
  generateBlogPost,
  generateCase,
  regenerateBlogIndex,
  regenerateCasesIndex,
  regenerateSitemap,
  regenerateAll,
  deleteGenerated,
};
