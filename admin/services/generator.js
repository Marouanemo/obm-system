// ============================================================
// Static HTML generator
// Reads markdown content + frontmatter, renders pages into /public/.
// Also regenerates the blog/cas-clients index pages and sitemap.xml.
// Gabarit commun : ./layout.js
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
  const schemas = [].concat(schema || [], crumbs ? [L.breadcrumbSchema(crumbs)] : [], [L.orgNode()]);
  const headHtml = L.head({ ...head, schema: schemas });
  return L.page({ headHtml, current, main: main(crumbs ? L.breadcrumbHtml(crumbs) : '') });
}

const AUTHOR_HTML = `<div class="byline">Par <a href="/a-propos/#oualid" rel="author">Oualid Benamara</a>, fondateur d’OBM System</div>`;
const AUTHOR_BOX = `<aside class="author" aria-label="Auteur">
          <p class="author__name">Oualid Benamara</p>
          <p>Fondateur d’OBM System, agence de conseil 360° à Rabat. Il pilote chaque projet, du diagnostic de croissance au pilotage des résultats.</p>
          <p><a class="link" href="https://www.linkedin.com/in/oualidbenamara/" target="_blank" rel="noopener">Profil LinkedIn</a></p>
        </aside>`;

// Liens du cocon sémantique vers les 7 pages services (texte de la v8)
const SERVICES_BLOG = `<section class="section section--rule" aria-labelledby="j7-t">
      <div class="wrap narrow prose">
        <h2 class="h2" id="j7-t" style="margin-bottom:1.5rem">Les sept services derrière ces articles</h2>
        <ul class="checklist"><li><a href="/services/creation-site-web/">un site codé sur mesure</a> : Sites vitrines, e-commerce et plateformes codés sur mesure, livrés avec un back-office simple.</li><li><a href="/services/e-commerce/">vendre en ligne au Maroc</a> : Catalogue, paiement en ligne ou à la livraison, retrait en magasin et suivi des ventes.</li><li><a href="/services/publicite-meta-google-ads/">la publicité en ligne reliée aux ventes</a> : Campagnes Facebook, Instagram et Google pilotées par les demandes et les ventes réelles.</li><li><a href="/services/tracking-server-side/">GA4 et API Conversions bien configurés</a> : GTM, GA4 et API Conversions de Meta, avec un serveur de mesure sur votre domaine.</li><li><a href="/services/seo-aeo/">votre visibilité sur Google et les IA</a> : Pages par intention de recherche, fiche Google, données structurées et présence dans les moteurs IA.</li><li><a href="/services/reseaux-sociaux/">l’animation de vos réseaux</a> : Ligne éditoriale, création de contenus, publication et modération, reliées à vos objectifs.</li><li><a href="/services/ia-automatisation/">le suivi automatique des demandes</a> : Relances WhatsApp, CRM connecté et assistants IA, pour qu’aucune demande ne reste sans suite.</li></ul>
      </div>
    </section>`;
const SERVICES_CASES = `<section class="section section--rule" aria-labelledby="c7-t">
      <div class="wrap narrow prose">
        <h2 class="h2" id="c7-t" style="margin-bottom:1.5rem">Les sept services mobilisés dans ces projets</h2>
        <ul class="checklist"><li><a href="/services/creation-site-web/">nos créations de sites web</a> : Sites vitrines, e-commerce et plateformes codés sur mesure, livrés avec un back-office simple.</li><li><a href="/services/e-commerce/">nos boutiques en ligne</a> : Catalogue, paiement en ligne ou à la livraison, retrait en magasin et suivi des ventes.</li><li><a href="/services/publicite-meta-google-ads/">nos campagnes publicitaires</a> : Campagnes Facebook, Instagram et Google pilotées par les demandes et les ventes réelles.</li><li><a href="/services/tracking-server-side/">le suivi des conversions côté serveur</a> : GTM, GA4 et API Conversions de Meta, avec un serveur de mesure sur votre domaine.</li><li><a href="/services/seo-aeo/">le référencement de votre site</a> : Pages par intention de recherche, fiche Google, données structurées et présence dans les moteurs IA.</li><li><a href="/services/reseaux-sociaux/">nos community managers</a> : Ligne éditoriale, création de contenus, publication et modération, reliées à vos objectifs.</li><li><a href="/services/ia-automatisation/">nos automatisations WhatsApp et CRM</a> : Relances WhatsApp, CRM connecté et assistants IA, pour qu’aucune demande ne reste sans suite.</li></ul>
      </div>
    </section>`;

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
      ogImageType: data.image ? 'image/jpeg' : '',
      ogImageAlt: data.image ? `${data.title} · Journal OBM System` : '',
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
        ${marked.parse(content || '').replace('<p><strong>En bref.', '<p class="tldr"><strong>En bref.')}
        ${sources.length ? `<aside class="sources"><h2>Sources</h2><ul>${sources.map(s => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a></li>`).join('')}</ul></aside>` : ''}
        ${AUTHOR_BOX}
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
  const key = caseKey(data.image);
  const image = data.ogImage || (key ? `/assets/img/og/og-${key}.jpg` : L.OG_DEFAULT);
  const services = Array.isArray(data.services) ? data.services : [];
  const decisions = Array.isArray(data.decisions) ? data.decisions : [];
  const host = hostOf(data.site);
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
    dateModified: (data.updatedAt || data.date) ? new Date(data.updatedAt || data.date).toISOString().slice(0, 10) : undefined,
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
        <div class="case-shot">${key ? L.shot({ key, host, alt: `Site ${data.title}`, phone: !!data.mobileImage, lazy: false, priority: true, sizes: '(max-width: 900px) 92vw, 1000px' }) : ''}</div>
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
        <h1 class="h1">Journal : mesure, publicité, référencement et sites web</h1>
        <p class="lead">Mesure, acquisition, visibilité : ce que nous appliquons, expliqué avec précision.</p>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <h2 class="sr-only">Tous les articles</h2>
      <div class="wrap posts">
${cards}
      </div>
    </section>
    ${SERVICES_BLOG}
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
        <h1 class="h1">Réalisations : l’anatomie de nos projets</h1>
        <p class="lead">Un site se juge aux décisions qui le font vendre. Pour chaque projet, nous montrons les choix de conception et ce qu’ils apportent au business.</p>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="wrap list-grid">
${cards}
      </div>
    </section>
    ${SERVICES_CASES}
    ${L.ctaBand({ loc: 'cases-band' })}
`,
  });
}

// ------------------------------------------------------------
// Sitemap et flux RSS
// ------------------------------------------------------------
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const latest = (dates) => dates.filter(Boolean).sort().pop() || '';

async function fileDate(urlPath) {
  try {
    const st = await fs.stat(path.join(PUBLIC_DIR, urlPath, 'index.html'));
    return day(st.mtime);
  } catch { return ''; }
}

async function regenerateSitemap() {
  const posts = (await list('blog')).filter(p => p.published);
  const cases = (await list('cases')).filter(c => c.published);
  const postDate = (p) => day(p.updatedAt || p.date);

  const staticUrls = [];
  for (const p of L.STATIC_PAGES) {
    const file = await fileDate(p.path);
    staticUrls.push({
      loc: `${SITE_URL}${p.path}`,
      lastmod: p.path === '/' ? latest([file, ...posts.map(x => day(x.date))]) : file,
      image: p.path === '/' ? absUrl(L.OG_DEFAULT) : '',
    });
  }

  const urls = [
    ...staticUrls,
    { loc: `${SITE_URL}/cas-clients/`, lastmod: latest(cases.map(postDate)) },
    ...cases.map(c => {
      const key = caseKey(c.image);
      return { loc: `${SITE_URL}/cas-clients/${c.slug}/`, lastmod: postDate(c), image: key ? absUrl(`/assets/img/og/og-${key}.jpg`) : '' };
    }),
    { loc: `${SITE_URL}/blog/`, lastmod: latest(posts.map(postDate)) },
    ...posts.map(p => ({ loc: `${SITE_URL}/blog/${p.slug}/`, lastmod: postDate(p), image: p.image ? absUrl(p.image) : '' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    ${u.image ? `<image:image><image:loc>${u.image}</image:loc></image:image>` : ''}
  </url>`).join('\n')}
</urlset>
`;
  await fs.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
}

async function regenerateFeed() {
  const posts = (await list('blog')).filter(p => p.published);
  const rfc = (d) => new Date(d).toUTCString().replace('GMT', '+0000');
  const items = posts.map(p => `<item>
<title>${escapeHtml(p.title)}</title>
<link>${SITE_URL}/blog/${p.slug}/</link>
<guid isPermaLink="true">${SITE_URL}/blog/${p.slug}/</guid>
<pubDate>${rfc(p.date)}</pubDate>
<description>${escapeHtml(p.excerpt)}</description>
</item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Journal · OBM System</title>
<link>${SITE_URL}/blog/</link>
<description>Analyses mesure, acquisition et visibilité, par OBM System, agence de conseil 360° à Rabat.</description>
<language>fr</language>
<atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
<lastBuildDate>${posts.length ? rfc(posts[0].date) : rfc(Date.now())}</lastBuildDate>
${items}
</channel>
</rss>
`;
  await fs.mkdir(path.join(PUBLIC_DIR, 'blog'), { recursive: true });
  await fs.writeFile(path.join(PUBLIC_DIR, 'blog', 'feed.xml'), xml, 'utf8');
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
  await regenerateFeed();
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
