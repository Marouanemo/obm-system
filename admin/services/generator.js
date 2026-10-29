// ============================================================
// Static HTML generator
// Reads markdown content + frontmatter, renders pages into /public/.
// Also regenerates the blog/cas-clients index pages and sitemap.xml.
// ============================================================
const fs = require('fs/promises');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const { list, read } = require('./content');

const PUBLIC_DIR = process.env.PUBLIC_DIR || '/var/www/obm-system/public';
const SITE_URL = (process.env.SITE_URL || 'https://obm-system.com').replace(/\/$/, '');
const CACHE_V = process.env.CACHE_V || 'v=2';

// Configure marked: GitHub-flavored, no XSS-encoded inputs trusted
marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
  smartLists: true,
});

// ------------------------------------------------------------
// Shared partials (head, nav, footer) — kept inline for simplicity
// ------------------------------------------------------------
function headTags(opts) {
  // Compute SEO fields with sensible fallbacks
  const title = opts.title;
  const description = opts.description;
  const canonical = opts.canonical;
  const ogImage = opts.ogImage;
  const type = opts.type || 'article';
  const publishedTime = opts.publishedTime || null;
  const category = opts.category || '';
  const tag = opts.tag || '';

  const metaTitle = opts.metaTitle || title;
  const seoDescription = opts.seoDescription || description;
  const ogTitle = opts.ogTitle || metaTitle;
  const ogDescription = opts.ogDescription || seoDescription;
  const twitterTitle = opts.twitterTitle || ogTitle;
  const twitterDescription = opts.twitterDescription || ogDescription;
  const twitterImage = opts.twitterImage || ogImage;
  const keywords = opts.keywords || '';

  const noindex = !!opts.noindex;
  const nofollow = !!opts.nofollow;
  const robotsParts = [];
  robotsParts.push(noindex ? 'noindex' : 'index');
  robotsParts.push(nofollow ? 'nofollow' : 'follow');
  if (!noindex) robotsParts.push('max-image-preview:large');
  const robotsContent = robotsParts.join(', ');

  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#F3F1EC" />

  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-TTPCSLV9');</script>

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JGDV0VS9B9"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-JGDV0VS9B9');
  </script>

  <title>${escapeHtml(metaTitle)}</title>
  <meta name="description" content="${escapeHtml(seoDescription)}" />
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ''}
  <meta name="robots" content="${robotsContent}" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="${type}" />
  <meta property="og:locale" content="fr_MA" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  <meta property="og:site_name" content="OBM System" />
  <meta property="og:image" content="${absUrl(ogImage)}" />
  ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ''}
  ${category ? `<meta property="article:section" content="${escapeHtml(category)}" />` : ''}
  ${tag ? `<meta property="article:tag" content="${escapeHtml(tag)}" />` : ''}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(twitterTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(twitterDescription)}" />
  <meta name="twitter:image" content="${absUrl(twitterImage)}" />

  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.svg" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="preload" href="/assets/fonts/switzer-600.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/switzer-400.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/css/site.css?${CACHE_V}" />
  <script>document.documentElement.classList.add('js');</script>`;
}

function absUrl(url) {
  if (!url) return SITE_URL + '/assets/img/og-cover.png';
  if (/^https?:\/\//.test(url)) return url;
  return SITE_URL + (url.startsWith('/') ? url : '/' + url);
}

const LOGO_HTML = `<a class="logo" href="/" aria-label="OBM System, accueil"><span>O<b>B</b>M</span><i>System</i><s>.</s></a>`;

function navHtml(current) {
  const link = (href, label, key) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  const links = [
    link('/#services', 'Services', 'services'),
    link('/cas-clients/', 'Réalisations', 'cases'),
    link('/site-reseaux/', 'Offre Site + Réseaux', 'offre'),
    link('/#methode', 'Méthode', 'methode'),
    link('/blog/', 'Journal', 'blog'),
  ].join('\n        ');
  return `<header class="nav" id="nav">
    <div class="wrap nav__in">
      ${LOGO_HTML}
      <nav class="nav__links" aria-label="Navigation principale">
        ${links}
      </nav>
      <a class="btn nav__cta" href="/#contact">Prendre rendez-vous</a>
      <button class="nav__burger" type="button" aria-expanded="false" aria-controls="mnav">Menu</button>
    </div>
  </header>
  <nav class="mnav" id="mnav" hidden aria-label="Menu mobile">
    <a href="/#services">Services</a>
    <a href="/cas-clients/">Réalisations</a>
    <a href="/site-reseaux/">Offre Site + Réseaux</a>
    <a href="/#methode">Méthode</a>
    <a href="/blog/">Journal</a>
    <a class="btn" href="/#contact">Prendre rendez-vous</a>
  </nav>`;
}

function footerHtml() {
  return `<footer class="footer">
    <div class="wrap">
      <div class="footer__grid">
        <div>
          ${LOGO_HTML}
          <p>Agence digitale à Rabat. Sites web, boutiques en ligne, publicité, référencement et réseaux sociaux.</p>
        </div>
        <div>
          <h4>Services</h4>
          <ul><li><a href="/#services">Sites web</a></li><li><a href="/#services">Publicité</a></li><li><a href="/#services">Référencement</a></li><li><a href="/site-reseaux/">Site + Réseaux</a></li></ul>
        </div>
        <div>
          <h4>L’agence</h4>
          <ul><li><a href="/cas-clients/">Réalisations</a></li><li><a href="/#methode">Méthode</a></li><li><a href="/blog/">Journal</a></li><li><a href="/#faq">Questions fréquentes</a></li></ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul><li>Rabat, Maroc</li><li><a href="tel:+212712348034">+212 7 12 34 80 34</a></li><li><a href="mailto:Admin@obm-system.com">Admin@obm-system.com</a></li><li><a href="https://www.instagram.com/obm_system/" target="_blank" rel="noopener">Instagram</a></li></ul>
        </div>
      </div>
      <div class="footer__legal">
        <span>© <span id="year">${new Date().getFullYear()}</span> OBM System. Tous droits réservés.</span>
        <a href="https://webotic.ma" target="_blank" rel="noopener">Designed &amp; Engineered by Webotic</a>
      </div>
    </div>
  </footer>

  <a class="wa" href="https://wa.me/212712348034?text=Bonjour%2C%20je%20souhaite%20parler%20d%27un%20projet%20avec%20OBM%20System." target="_blank" rel="noopener" data-loc="float">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.8-.2 1.4z"/></svg>
    <span>WhatsApp</span>
  </a>

  <script src="/assets/js/site.js?${CACHE_V}" defer></script>`;
}

function endCtaHtml(label = 'Un projet en tête ?', sub = 'Un appel de 30 minutes pour en parler. Ensuite, nous vous envoyons une proposition écrite avec le périmètre, le délai et le prix.', sourceLabel = 'Article CTA') {
  return `<aside class="endcta">
          <h2>${escapeHtml(label)}</h2>
          <p>${escapeHtml(sub)}</p>
          <div class="actions">
            <a class="btn" href="https://calendly.com/admin-obm-system/30min?primary_color=5b43c9" target="_blank" rel="noopener" data-loc="${escapeHtml(sourceLabel)}">Prendre rendez-vous</a>
            <a class="link" href="https://wa.me/212712348034" target="_blank" rel="noopener" data-loc="${escapeHtml(sourceLabel)}">Écrire sur WhatsApp</a>
          </div>
        </aside>`;
}

function bodyShell(headInner, mainHtml, current) {
  return `<!DOCTYPE html>
<html lang="fr-MA">
<head>
  ${headInner}
</head>
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TTPCSLV9" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <a class="skip" href="#main">Aller au contenu</a>

  ${navHtml(current)}

  <main id="main">${mainHtml}</main>

  ${footerHtml()}
</body>
</html>
`;
}

// Capture d'écran encadrée (page de réalisation et liste des réalisations)
function shotHtml(data, { lazy = false } = {}) {
  if (!data.image) return '';
  const host = data.site ? data.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '') : '';
  const loading = lazy ? ' loading="lazy"' : '';
  return `<figure class="shot${data.mobileImage ? ' shot--phone' : ''}">
            <div class="shot__frame">
              <div class="shot__bar"><i></i><i></i><i></i>${host ? `<span>${escapeHtml(host)}</span>` : ''}</div>
              <img src="${escapeHtml(data.image)}" width="1200" height="750"${loading} alt="${escapeHtml(`Site ${data.title}`)}" />
            </div>
            ${data.mobileImage ? `<div class="shot__mobile"><img src="${escapeHtml(data.mobileImage)}" width="520" height="1126"${loading} alt="" /></div>` : ''}
          </figure>`;
}

// ------------------------------------------------------------
// Blog post page generation
// ------------------------------------------------------------
function renderBlogPostHtml({ slug, data, content }) {
  const canonical = data.canonical || `${SITE_URL}/blog/${slug}/`;
  const ogImage = data.image || `${SITE_URL}/assets/img/og-cover.png`;
  const renderedBody = marked.parse(content || '');

  const head = headTags({
    title: `${data.title} | OBM System`,
    description: data.excerpt || data.title,
    canonical,
    ogImage,
    type: 'article',
    publishedTime: data.date ? new Date(data.date).toISOString() : null,
    category: data.category,
    tag: data.tag,
    metaTitle: data.metaTitle,
    seoDescription: data.seoDescription,
    keywords: data.keywords,
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    twitterTitle: data.twitterTitle,
    twitterDescription: data.twitterDescription,
    twitterImage: data.twitterImage,
    noindex: data.noindex,
    nofollow: data.nofollow,
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    image: absUrl(ogImage),
    datePublished: data.date ? new Date(data.date).toISOString() : undefined,
    dateModified: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
    author: { '@type': 'Organization', name: 'OBM System', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'OBM System',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/img/apple-touch-icon.svg` },
    },
    mainEntityOfPage: canonical,
  };

  const main = `
    <article>
      <header class="page-head">
        <div class="wrap narrow">
          <a class="back" href="/blog/">← Tous les articles</a>
          <div class="meta">
            ${data.category ? `<b>${escapeHtml(data.category)}</b>` : ''}
            ${data.date ? `<time datetime="${data.date}">${formatDateFr(data.date)}</time>` : ''}
            ${data.readTime ? `<span>${escapeHtml(data.readTime)}</span>` : ''}
          </div>
          <h1 class="h1">${escapeHtml(data.title)}</h1>
          ${data.excerpt ? `<p class="lead">${escapeHtml(data.excerpt)}</p>` : ''}
        </div>
      </header>
      <div class="wrap narrow prose">
        ${renderedBody}
        ${endCtaHtml(undefined, undefined, `Article - ${data.title}`)}
      </div>
    </article>`;

  const headWithSchema = `${head}\n<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return bodyShell(headWithSchema, main, 'blog');
}

// ------------------------------------------------------------
// Case study page generation
// ------------------------------------------------------------
function renderCasePageHtml({ slug, data, content }) {
  const canonical = data.canonical || `${SITE_URL}/cas-clients/${slug}/`;
  const ogImage = data.ogImage || data.image || `${SITE_URL}/assets/img/og-cover.png`;
  const renderedBody = marked.parse(content || '');

  const head = headTags({
    title: `${data.title}${data.category ? ', ' + data.category.toLowerCase() : ''} | Réalisation OBM System`,
    description: data.excerpt || data.title,
    canonical,
    ogImage,
    type: 'article',
    publishedTime: data.date ? new Date(data.date).toISOString() : null,
    category: data.category,
    tag: data.tag,
    metaTitle: data.metaTitle,
    seoDescription: data.seoDescription,
    keywords: data.keywords,
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    twitterTitle: data.twitterTitle,
    twitterDescription: data.twitterDescription,
    twitterImage: data.twitterImage,
    noindex: data.noindex,
    nofollow: data.nofollow,
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.title,
    headline: data.title,
    description: data.excerpt,
    image: absUrl(ogImage),
    url: canonical,
    datePublished: data.date ? new Date(data.date).toISOString() : undefined,
    creator: { '@type': 'Organization', name: 'OBM System', url: SITE_URL },
    ...(data.site ? { sameAs: data.site } : {}),
  };

  const services = Array.isArray(data.services) ? data.services : [];
  const facts = [
    data.category && ['Secteur', data.category],
    data.location && ['Lieu', data.location],
    data.duration && ['Durée', data.duration],
    data.site && ['Site', `<a class="link" href="${escapeHtml(data.site)}" target="_blank" rel="noopener" data-case="${escapeHtml(slug)}">${escapeHtml(data.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>`],
  ].filter(Boolean);

  const main = `
    <article>
      <header class="page-head">
        <div class="wrap">
          <a class="back" href="/cas-clients/">← Toutes les réalisations</a>
          <div class="narrow" style="padding:0">
            <h1 class="h1">${escapeHtml(data.title)}</h1>
            ${data.excerpt ? `<p class="lead">${escapeHtml(data.excerpt)}</p>` : ''}
          </div>
          <dl class="facts">
            ${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${k === 'Site' ? v : escapeHtml(v)}</dd></div>`).join('')}
          </dl>
        </div>
      </header>
      <div class="wrap">
        <div class="case-shot">${shotHtml(data)}</div>
      </div>
      <div class="wrap narrow prose">
        ${services.length ? `<h2>Notre périmètre</h2>\n        <div class="tags">${services.map(s => `<span>${escapeHtml(s)}</span>`).join('')}</div>` : ''}
        ${renderedBody}
        ${endCtaHtml('Un projet comparable ?', undefined, `Réalisation - ${data.title}`)}
      </div>
    </article>`;

  const headWithSchema = `${head}\n<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return bodyShell(headWithSchema, main, 'cases');
}

// ------------------------------------------------------------
// Index pages (list of all blog posts / case studies)
// ------------------------------------------------------------
function renderBlogIndexHtml(posts, pageSeo) {
  const canonical = `${SITE_URL}/blog/`;
  const seo = pageSeo || {};
  const head = headTags({
    title: seo.title || 'Journal : conseils sites web, publicité et réseaux sociaux | OBM System',
    description: seo.description || 'Le journal d’OBM System, agence digitale à Rabat : des articles pratiques sur les sites web, la publicité Facebook et Google, le référencement et les réseaux sociaux.',
    canonical,
    ogImage: seo.ogImage || `${SITE_URL}/assets/img/og-cover.png`,
    type: 'website',
    keywords: seo.keywords,
    ogTitle: seo.ogTitle,
    ogDescription: seo.ogDescription,
    twitterTitle: seo.twitterTitle,
    twitterDescription: seo.twitterDescription,
    twitterImage: seo.twitterImage,
    noindex: seo.noindex,
    nofollow: seo.nofollow,
  });

  const cards = posts.filter(p => p.published).map(p => `
          <a class="post" href="/blog/${p.slug}/">
            <small>${[p.category, p.date ? formatDateFr(p.date) : ''].filter(Boolean).map(escapeHtml).join(' · ')}</small>
            <h3>${escapeHtml(p.title)}</h3>
            ${p.excerpt ? `<p>${escapeHtml(p.excerpt)}</p>` : ''}
            <span>Lire l’article${p.readTime ? ` (${escapeHtml(p.readTime.replace(/ de lecture$/, ''))})` : ''}</span>
          </a>`).join('\n');

  const main = `
    <section class="page-head">
      <div class="wrap">
        <span class="kicker">Journal</span>
        <h1 class="h1">Nos conseils, en clair</h1>
        <p class="lead">Des articles pratiques sur les sites web, la publicité, le référencement et les réseaux sociaux, écrits à partir de ce que nous voyons chez nos clients.</p>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="wrap posts">
${cards}
      </div>
    </section>`;

  return bodyShell(head, main, 'blog');
}

function renderCasesIndexHtml(cases, pageSeo) {
  const canonical = `${SITE_URL}/cas-clients/`;
  const seo = pageSeo || {};
  const head = headTags({
    title: seo.title || 'Réalisations : sites web, e-commerce et réseaux sociaux | OBM System',
    description: seo.description || 'Les projets livrés par OBM System, agence digitale à Rabat : boutiques en ligne, plateformes, sites vitrines, réseaux sociaux et publicité, au Maroc et au Canada.',
    canonical,
    ogImage: seo.ogImage || `${SITE_URL}/assets/img/og-cover.png`,
    type: 'website',
    keywords: seo.keywords,
    ogTitle: seo.ogTitle,
    ogDescription: seo.ogDescription,
    twitterTitle: seo.twitterTitle,
    twitterDescription: seo.twitterDescription,
    twitterImage: seo.twitterImage,
    noindex: seo.noindex,
    nofollow: seo.nofollow,
  });

  const cards = cases.filter(c => c.published).map(c => `
          <a class="list-card" href="/cas-clients/${c.slug}/">
            ${shotHtml({ ...c, mobileImage: "" }, { lazy: true })}
            <p class="muted">${[c.category, c.location].filter(Boolean).map(escapeHtml).join(', ')}</p>
            <h2>${escapeHtml(c.title)}</h2>
            ${c.excerpt ? `<p>${escapeHtml(c.excerpt)}</p>` : ''}
          </a>`).join('\n');

  const main = `
    <section class="page-head">
      <div class="wrap">
        <span class="kicker">Réalisations</span>
        <h1 class="h1">Les projets que nous avons livrés</h1>
        <p class="lead">Boutiques en ligne, plateforme, sites vitrines, réseaux sociaux et publicité. Pour chaque projet : l’objectif de départ, ce que nous avons fait et les choix qui comptent.</p>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="wrap list-grid">
${cards}
      </div>
    </section>`;

  return bodyShell(head, main, 'cases');
}

// ------------------------------------------------------------
// Sitemap regeneration
// ------------------------------------------------------------
async function regenerateSitemap() {
  const posts = (await list('blog')).filter(p => p.published);
  const cases = (await list('cases')).filter(c => c.published);

  const urls = [
    {
      loc: `${SITE_URL}/`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: 'weekly',
      priority: '1.0',
      image: `${SITE_URL}/assets/img/og-cover.png`,
    },
    {
      loc: `${SITE_URL}/site-reseaux/`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: 'monthly',
      priority: '0.9',
      image: `${SITE_URL}/assets/img/og-site-reseaux.png`,
    },
    {
      loc: `${SITE_URL}/cas-clients/`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: 'monthly',
      priority: '0.8',
    },
    ...cases.map(c => ({
      loc: `${SITE_URL}/cas-clients/${c.slug}/`,
      lastmod: c.updatedAt || c.date || '',
      changefreq: 'yearly',
      priority: '0.7',
    })),
    {
      loc: `${SITE_URL}/blog/`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    },
    ...posts.map(p => ({
      loc: `${SITE_URL}/blog/${p.slug}/`,
      lastmod: p.updatedAt || p.date || '',
      changefreq: 'monthly',
      priority: '0.7',
    })),
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
async function generateBlogPost(slug) {
  const item = await read('blog', slug);
  if (!item) return false;
  const html = renderBlogPostHtml(item);
  const dir = path.join(PUBLIC_DIR, 'blog', slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8');
  await regenerateBlogIndex();
  await regenerateSitemap();
  return true;
}

async function generateCase(slug) {
  const item = await read('cases', slug);
  if (!item) return false;
  const html = renderCasePageHtml(item);
  const dir = path.join(PUBLIC_DIR, 'cas-clients', slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8');
  await regenerateCasesIndex();
  await regenerateSitemap();
  return true;
}

async function regenerateBlogIndex() {
  const posts = await list('blog');
  // Try to read SEO settings for /blog/ from system pages
  let pageSeo = null;
  try {
    const pages = require('./pages');
    const page = await pages.read('blog-index');
    if (page) pageSeo = page.data;
  } catch {}
  const html = renderBlogIndexHtml(posts, pageSeo);
  const dir = path.join(PUBLIC_DIR, 'blog');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8');
}

async function regenerateCasesIndex() {
  const cases = await list('cases');
  let pageSeo = null;
  try {
    const pages = require('./pages');
    const page = await pages.read('cases-index');
    if (page) pageSeo = page.data;
  } catch {}
  const html = renderCasesIndexHtml(cases, pageSeo);
  const dir = path.join(PUBLIC_DIR, 'cas-clients');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8');
}

async function deleteGenerated(type, slug) {
  const map = { blog: 'blog', cases: 'cas-clients' };
  const dir = path.join(PUBLIC_DIR, map[type], slug);
  await fs.rm(dir, { recursive: true, force: true });
  if (type === 'blog') await regenerateBlogIndex();
  else await regenerateCasesIndex();
  await regenerateSitemap();
}

async function regenerateAll() {
  const posts = await list('blog');
  for (const p of posts) await generateBlogPost(p.slug);
  const cases = await list('cases');
  for (const c of cases) await generateCase(c.slug);
}

// ------------------------------------------------------------
// Utility
// ------------------------------------------------------------
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function formatDateFr(d) {
  const dt = new Date(d);
  if (Number.isNaN(+dt)) return d;
  return `${dt.getDate()} ${MONTHS_FR[dt.getMonth()]} ${dt.getFullYear()}`;
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
