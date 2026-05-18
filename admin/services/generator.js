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
const CACHE_V = process.env.CACHE_V || 'v=17';

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
  <meta name="theme-color" content="#0B1E3F" />

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
  <meta property="og:site_name" content="OBM SYSTEM" />
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

  <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
  <link rel="preconnect" href="https://cdn.fontshare.com" crossorigin />
  <link href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=switzer@400,500,600,700&f[]=jetbrains-mono@400,500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/css/styles.css?${CACHE_V}" />

  <script src="https://cdn.jsdelivr.net/npm/motion@10.18.0/dist/motion.min.js" defer></script>
  <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
  <script src="https://assets.calendly.com/assets/external/widget.js" async></script>`;
}

function absUrl(url) {
  if (!url) return SITE_URL + '/assets/img/og-cover.svg';
  if (/^https?:\/\//.test(url)) return url;
  return SITE_URL + (url.startsWith('/') ? url : '/' + url);
}

const NAV_HTML = `<header class="nav is-scrolled" id="nav">
    <div class="nav__inner">
      <a href="/" class="nav__logo">
        <span class="nav__logo-mark" aria-hidden="true">
          <svg viewBox="0 0 64 32" width="48" height="24" fill="none">
            <text x="0" y="22" font-family="Clash Display, sans-serif" font-weight="700" font-size="22" fill="currentColor">O</text>
            <text x="16" y="22" font-family="Clash Display, sans-serif" font-weight="700" font-size="22" fill="#C8CCD4">B</text>
            <text x="32" y="22" font-family="Clash Display, sans-serif" font-weight="700" font-size="22" fill="currentColor">M</text>
            <path d="M48 22 L58 8 L54 8 M58 8 L58 12" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="nav__logo-text">
          <span class="nav__logo-name">OBM <em>System</em></span>
          <span class="nav__logo-tag">Digital Agency</span>
        </span>
      </a>
      <nav class="nav__links" aria-label="Navigation principale">
        <a href="/#problemes">Problème</a>
        <a href="/#systeme">Système</a>
        <a href="/cas-clients/">Cas clients</a>
        <a href="/blog/">Journal</a>
        <a href="/#faq">FAQ</a>
      </nav>
      <a href="/#diagnostic" class="nav__cta btn btn--gold" data-magnetic>
        <span>Diagnostic gratuit</span>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
      </a>
      <button class="nav__burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav__mobile" id="mobile-menu" hidden>
      <a href="/#problemes">Problème</a>
      <a href="/#systeme">Système</a>
      <a href="/cas-clients/">Cas clients</a>
      <a href="/blog/">Journal</a>
      <a href="/#faq">FAQ</a>
      <a href="/#diagnostic" class="btn btn--gold btn--full">Diagnostic gratuit</a>
    </div>
  </header>`;

function footerHtml() {
  return `<footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <div class="footer__logo">
          <svg viewBox="0 0 64 32" width="56" height="28" fill="none">
            <text x="0" y="22" font-family="Clash Display, sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">O</text>
            <text x="16" y="22" font-family="Clash Display, sans-serif" font-weight="700" font-size="22" fill="#C8CCD4">B</text>
            <text x="32" y="22" font-family="Clash Display, sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">M</text>
            <path d="M48 22 L58 8 L54 8 M58 8 L58 12" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>System · Digital Agency</span>
        </div>
        <p>L'infrastructure d'acquisition et d'automatisation pour les cabinets dentaires ambitieux au Maroc.</p>
      </div>
      <div class="footer__col">
        <h4>Système</h4>
        <a href="/#systeme">Les 4 piliers</a>
        <a href="/#engine">Le moteur</a>
        <a href="/#treatments">Traitements ciblés</a>
        <a href="/#process">Process</a>
      </div>
      <div class="footer__col">
        <h4>Ressources</h4>
        <a href="/cas-clients/">Cas clients</a>
        <a href="/blog/">Journal</a>
        <a href="/#faq">FAQ</a>
      </div>
      <div class="footer__col">
        <h4>Contact</h4>
        <a href="tel:+212712348034">07 12 34 80 34</a>
        <a href="mailto:Admin@obm-system.com">Admin@obm-system.com</a>
        <a href="https://wa.me/212712348034" target="_blank" rel="noopener">WhatsApp direct</a>
        <a href="https://share.google/I2s3UekyS6e7W7Lnh" target="_blank" rel="noopener">Voir sur Google Maps ↗</a>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <span>© <span id="year"></span> OBM SYSTEM — Tous droits réservés.</span>
        <span>Acquisition · Automation · Conversion · Growth</span>
      </div>
    </div>
  </footer>

  <a href="https://wa.me/212712348034" class="fab" target="_blank" rel="noopener" aria-label="Discuter sur WhatsApp">
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .2.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.3L2 22l4.8-1.5c1.5.8 3.3 1.3 5.2 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
    </svg>
  </a>

  <script src="/assets/js/script.js?${CACHE_V}" defer></script>`;
}

function endCtaHtml(label = "Votre cabinet a un potentiel similaire ?", sub = "Lancez le diagnostic interactif en 90 secondes — ou réservez un audit direct.", sourceLabel = "Article CTA") {
  return `<aside class="article__end-cta">
          <h2>${label}</h2>
          <p>${sub}</p>
          <div class="article__end-cta-actions">
            <a href="/#diagnostic" class="btn btn--gold btn--lg">
              <span>Faire le diagnostic</span>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </a>
            <a href="https://calendly.com/admin-obm-system/30min?primary_color=c9a961" data-calendly data-source="${escapeHtml(sourceLabel)}" target="_blank" rel="noopener" class="btn btn--ghost-light btn--lg">
              <span>Réserver un appel</span>
            </a>
          </div>
        </aside>`;
}

function bodyShell(headInner, mainHtml) {
  return `<!DOCTYPE html>
<html lang="fr-MA">
<head>
  ${headInner}
</head>
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TTPCSLV9" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <a class="skip-link" href="#main">Aller au contenu</a>
  <div class="cursor" aria-hidden="true"><div class="cursor__ring"></div></div>

  ${NAV_HTML}

  <main id="main">${mainHtml}</main>

  ${footerHtml()}
</body>
</html>
`;
}

// ------------------------------------------------------------
// Blog post page generation
// ------------------------------------------------------------
function renderBlogPostHtml({ slug, data, content }) {
  const canonical = data.canonical || `${SITE_URL}/blog/${slug}/`;
  const ogImage = data.image || `${SITE_URL}/assets/img/og-cover.svg`;
  const renderedBody = marked.parse(content || '');

  const head = headTags({
    title: `${data.title} | OBM SYSTEM`,
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
    image: ogImage,
    datePublished: data.date ? new Date(data.date).toISOString() : undefined,
    dateModified: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
    author: { '@type': 'Organization', name: 'OBM SYSTEM', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'OBM SYSTEM',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/img/favicon.svg` },
    },
    mainEntityOfPage: canonical,
  };

  const main = `
    <article class="article">
      <div class="container">
        <a href="/blog/" class="article__back">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg>
          <span>Tous les articles</span>
        </a>
        <header class="article__head">
          <div class="article__meta">
            ${data.category ? `<span class="article__category">${escapeHtml(data.category)}</span>` : ''}
            ${data.date ? `<span class="article__date"><time datetime="${data.date}">${formatDateFr(data.date)}</time></span>` : ''}
            ${data.readTime ? `<span class="article__read">${escapeHtml(data.readTime)}</span>` : ''}
          </div>
          <h1 class="article__title">${escapeHtml(data.title)}</h1>
          ${data.excerpt ? `<p class="article__lead">${escapeHtml(data.excerpt)}</p>` : ''}
        </header>
        <div class="article__body">${renderedBody}</div>
        ${endCtaHtml(undefined, undefined, `Article CTA - ${data.title}`)}
      </div>
    </article>`;

  const headWithSchema = `${head}\n<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return bodyShell(headWithSchema, main);
}

// ------------------------------------------------------------
// Case study page generation
// ------------------------------------------------------------
function renderCasePageHtml({ slug, data, content }) {
  const canonical = data.canonical || `${SITE_URL}/cas-clients/${slug}/`;
  const ogImage = data.image || `${SITE_URL}/assets/img/og-cover.svg`;
  const renderedBody = marked.parse(content || '');

  const head = headTags({
    title: `${data.title} | OBM SYSTEM`,
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
    '@type': 'Article',
    headline: data.title,
    image: ogImage,
    datePublished: data.date ? new Date(data.date).toISOString() : undefined,
    dateModified: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
    author: { '@type': 'Organization', name: 'OBM SYSTEM', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'OBM SYSTEM',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/img/favicon.svg` },
    },
    mainEntityOfPage: canonical,
  };

  const main = `
    <article class="article">
      <div class="container">
        <a href="/cas-clients/" class="article__back">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg>
          <span>Tous les cas clients</span>
        </a>
        <header class="article__head">
          <div class="article__meta">
            ${data.category ? `<span class="article__category">${escapeHtml(data.category)}</span>` : ''}
            ${data.date ? `<span class="article__date"><time datetime="${data.date}">${formatDateFr(data.date)}</time></span>` : ''}
            ${data.location ? `<span class="article__read">${escapeHtml(data.location)}${data.duration ? ' · ' + escapeHtml(data.duration) : ''}</span>` : ''}
          </div>
          <h1 class="article__title">${escapeHtml(data.title)}</h1>
          ${data.excerpt ? `<p class="article__lead">${escapeHtml(data.excerpt)}</p>` : ''}
        </header>
        <div class="article__body">${renderedBody}</div>
        ${endCtaHtml("Votre cabinet a un potentiel similaire ?", undefined, `Article CTA - ${data.title}`)}
      </div>
    </article>`;

  const headWithSchema = `${head}\n<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return bodyShell(headWithSchema, main);
}

// ------------------------------------------------------------
// Index pages (list of all blog posts / case studies)
// ------------------------------------------------------------
function renderBlogIndexHtml(posts, pageSeo) {
  const canonical = `${SITE_URL}/blog/`;
  const seo = pageSeo || {};
  const head = headTags({
    title: seo.title || 'Journal — Articles sur l\'acquisition de patients dentaires | OBM SYSTEM',
    description: seo.description || 'Le journal d\'OBM SYSTEM : articles tactiques sur l\'acquisition de patients dentaires, l\'automation WhatsApp, les campagnes Meta Ads, et la croissance des cabinets dentaires au Maroc.',
    canonical,
    ogImage: seo.ogImage || `${SITE_URL}/assets/img/og-cover.svg`,
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
          <article class="post">
            <header class="post__meta">
              ${p.category ? `<span class="post__category">${escapeHtml(p.category)}</span>` : ''}
              ${p.date ? `<span class="post__date"><time datetime="${p.date}">${formatDateFr(p.date)}</time></span>` : ''}
            </header>
            <h3 class="post__title">
              <a href="/blog/${p.slug}/">${escapeHtml(p.title)}</a>
            </h3>
            ${p.excerpt ? `<p class="post__excerpt">${escapeHtml(p.excerpt)}</p>` : ''}
            <a href="/blog/${p.slug}/" class="post__link">
              ${p.readTime ? `<span class="post__read">${escapeHtml(p.readTime)}</span>` : '<span></span>'}
              <span class="post__cta">Lire l'article
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </span>
            </a>
          </article>`).join('\n');

  const main = `
    <section class="list-page">
      <div class="container">
        <a href="/" class="list-page__back">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg>
          <span>Retour à l'accueil</span>
        </a>
        <header class="list-page__intro">
          <span class="eyebrow">Journal · OBM SYSTEM</span>
          <h1 class="section__title">
            Données, méthodes,
            <em>leçons du terrain.</em>
          </h1>
          <p class="section__lead">
            Articles tactiques sur l'acquisition de patients dentaires au Maroc — campagnes publicitaires, automation, CRM, conversion. Écrits par l'équipe qui déploie ces systèmes au quotidien.
          </p>
        </header>
        <div class="blog__grid">
${cards}
        </div>
      </div>
    </section>`;

  return bodyShell(head, main);
}

function renderCasesIndexHtml(cases, pageSeo) {
  const canonical = `${SITE_URL}/cas-clients/`;
  const seo = pageSeo || {};
  const head = headTags({
    title: seo.title || 'Cas clients — Cabinets dentaires transformés | OBM SYSTEM',
    description: seo.description || 'Études de cas anonymisées de cabinets dentaires marocains ayant déployé l\'infrastructure OBM SYSTEM. Données réelles, résultats mesurés, méthodes détaillées.',
    canonical,
    ogImage: seo.ogImage || `${SITE_URL}/assets/img/og-cover.svg`,
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
          <article class="case">
            <header class="case__head">
              ${c.category ? `<span class="case__tag">${escapeHtml(c.category)}</span>` : ''}
              ${c.location ? `<span class="case__meta">${escapeHtml(c.location)}${c.duration ? ' · ' + escapeHtml(c.duration) : ''}</span>` : ''}
            </header>
            <h3 class="case__title">${escapeHtml(c.title)}</h3>
            ${c.bigMetricValue ? `<div class="case__hero-metric">
              <span class="case__big">${escapeHtml(c.bigMetricValue)}${c.bigMetricUnit ? `<span class="case__big-unit">${escapeHtml(c.bigMetricUnit)}</span>` : ''}</span>
              <span class="case__big-label">${escapeHtml(c.bigMetricLabel || '')}</span>
            </div>` : ''}
            ${c.excerpt ? `<p class="case__context">${escapeHtml(c.excerpt)}</p>` : ''}
            ${renderSubMetrics(c.subMetrics)}
            <a href="/cas-clients/${c.slug}/" class="case__link">
              <span>Lire l'étude complète</span>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </a>
          </article>`).join('\n');

  const main = `
    <section class="list-page">
      <div class="container">
        <a href="/" class="list-page__back">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg>
          <span>Retour à l'accueil</span>
        </a>
        <header class="list-page__intro">
          <span class="eyebrow">Cas clients · anonymisés</span>
          <h1 class="section__title">
            Ce que le système
            <em>a produit.</em>
          </h1>
          <p class="section__lead">
            Études de cas anonymisées de cabinets dentaires marocains ayant déployé l'infrastructure OBM SYSTEM. Toutes les données sont réelles — seuls les noms et identifiants sont changés pour préserver la confidentialité.
          </p>
        </header>
        <div class="cases__grid">
${cards}
        </div>
      </div>
    </section>`;

  return bodyShell(head, main);
}

function renderSubMetrics(subMetrics) {
  if (!subMetrics || !Array.isArray(subMetrics) || subMetrics.length === 0) return '';
  return `<dl class="case__metrics">
              ${subMetrics.map(m => `<div><dt>${escapeHtml(m.label || '')}</dt><dd>${escapeHtml(m.value || '')}${m.unit ? `<span>${escapeHtml(m.unit)}</span>` : ''}</dd></div>`).join('')}
            </dl>`;
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
      image: `${SITE_URL}/assets/img/og-cover.svg`,
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
