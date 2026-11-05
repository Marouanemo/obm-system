// ============================================================
// Gabarit commun du site : <head>, menu, fil d'Ariane, bloc d'appel,
// pied de page, bandeau de consentement, données structurées.
// Utilisé par le générateur du back-office (journal, réalisations)
// et par scripts/build-static.js (pages statiques).
// ============================================================

const ORG_DATA = require('./org.json');

const SITE_URL = (process.env.SITE_URL || 'https://obm-system.com').replace(/\/$/, '');
const CACHE_V = process.env.CACHE_V || 'v=7';

const BRAND = {
  name: 'OBM System',
  descriptor: 'Agence de conseil 360°',
  slogan: 'Ingénierie et précision. L’exécution chirurgicale des ventes.',
  trade: 'Stratégie digitale. Conception. Développement.',
  email: 'admin@obm-system.com',
  phone: '+212712348034',
  phoneLabel: '+212\u00a07\u00a012\u00a034\u00a080\u00a034',
  calendly: 'https://calendly.com/admin-obm-system/30min',
  diagnostic: '/diagnostic-de-croissance/',
  whatsapp: 'https://wa.me/212712348034',
  social: [
    ['Instagram', 'https://www.instagram.com/obm_system/'],
    ['Facebook', 'https://www.facebook.com/obmsystem'],
    ['TikTok', 'https://www.tiktok.com/@obm_system'],
    ['LinkedIn', 'https://www.linkedin.com/company/obm-system/'],
  ],
};

const WA_TEXT = 'Bonjour%2C%20je%20souhaite%20%C3%A9changer%20avec%20OBM%20System.';
const OG_DEFAULT = '/assets/img/og-obm-system.png';

// Pages statiques (construites par scripts/build-static.js) : pour le sitemap
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/diagnostic-de-croissance/', priority: '0.9', changefreq: 'monthly' },
  { path: '/services/', priority: '0.9', changefreq: 'monthly' },
  { path: '/services/creation-site-web/', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/e-commerce/', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/creation-site-web/casablanca/', priority: '0.7', changefreq: 'monthly' },
  { path: '/services/publicite-meta-google-ads/', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/google-ads/', priority: '0.7', changefreq: 'monthly' },
  { path: '/services/tracking-server-side/', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/seo-aeo/', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/reseaux-sociaux/', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/ia-automatisation/', priority: '0.8', changefreq: 'monthly' },
  { path: '/site-reseaux/', priority: '0.7', changefreq: 'monthly' },
  { path: '/agence-marketing-digital-casablanca/', priority: '0.7', changefreq: 'monthly' },
  { path: '/methode/', priority: '0.7', changefreq: 'monthly' },
  { path: '/a-propos/', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact/', priority: '0.6', changefreq: 'monthly' },
  { path: '/mentions-legales/', priority: '0.2', changefreq: 'yearly' },
  { path: '/confidentialite/', priority: '0.2', changefreq: 'yearly' },
];

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function formatDateFr(d) {
  const dt = new Date(d);
  if (Number.isNaN(+dt)) return d;
  const day = dt.getDate() === 1 ? '1er' : dt.getDate();
  return `${day} ${MONTHS_FR[dt.getMonth()]} ${dt.getFullYear()}`;
}

// Typographie française, sur le texte uniquement (balises, script, style, code intacts)
const NNBSP = '\u202f';
const NBSP = '\u00a0';
const TYPO_SKIP = /(<(script|style|pre|code|textarea)\b[\s\S]*?<\/\2\s*>|<!--[\s\S]*?-->|<[^>]+>)/gi;

function typoText(t) {
  return t
    .replace(/[ \u00a0\u202f]+([;!?])/g, `${NNBSP}$1`)
    .replace(/[ \u00a0\u202f]+:(?=\s|$)/g, `${NBSP}:`)
    .replace(/«[ \u00a0\u202f]*/g, `«${NNBSP}`)
    .replace(/[ \u00a0\u202f]*»/g, `${NNBSP}»`)
    .replace(/[ \u00a0]+·[ \u00a0]+/g, `${NBSP}· `);
}

function typoFr(html) {
  let out = '';
  let pos = 0;
  for (const m of html.matchAll(TYPO_SKIP)) {
    out += typoText(html.slice(pos, m.index)) + m[0];
    pos = m.index + m[0].length;
  }
  return out + typoText(html.slice(pos));
}

function absUrl(url) {
  if (!url) return SITE_URL + OG_DEFAULT;
  if (/^https?:\/\//.test(url)) return url;
  return SITE_URL + (url.startsWith('/') ? url : '/' + url);
}

// ------------------------------------------------------------
// Données structurées
// ------------------------------------------------------------
const ORG_ID = `${SITE_URL}/#org`;
const PERSON_ID = `${SITE_URL}/a-propos/#oualid`;

function orgNode() {
  return { '@context': 'https://schema.org', ...ORG_DATA.org };
}

function personNode() {
  return { ...ORG_DATA.person };
}

// items : [['Accueil', '/'], ['Services', '/services/'], ['Tracking', null]]
function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, href], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      ...(href ? { item: absUrl(href) } : {}),
    })),
  };
}

function breadcrumbHtml(items) {
  const parts = items.map(([name, href], i) => (href && i < items.length - 1
    ? `<a href="${href}">${escapeHtml(name)}</a>`
    : `<span aria-current="page">${escapeHtml(name)}</span>`));
  return `<nav class="crumbs" aria-label="Fil d’Ariane">${parts.join('<span aria-hidden="true">/</span>')}</nav>`;
}

// ------------------------------------------------------------
// <head>
// ------------------------------------------------------------
function head(o) {
  const canonical = o.canonical || absUrl(o.path || '/');
  const title = o.title;
  const description = o.description || '';
  const ogImage = absUrl(o.ogImage || OG_DEFAULT);
  const ogTitle = o.ogTitle || title;
  const ogDescription = o.ogDescription || description;
  const robots = o.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  const schemas = (Array.isArray(o.schema) ? o.schema : [o.schema]).filter(Boolean);
  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#F3F1EC" />

  <!-- Consent Mode v2 : tout refusé par défaut, avant GTM -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted',
      wait_for_update: 500
    });
    try {
      if (localStorage.getItem('obm_consent') === 'granted') gtag('consent', 'update', {
        ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted'
      });
    } catch (e) {}
  </script>

  <!-- Google tag (gtag.js) : GA4, chargé une seule fois -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JGDV0VS9B9"></script>
  <script>
    gtag('js', new Date());
    gtag('config', 'G-JGDV0VS9B9');
  </script>
  <!-- End Google tag -->

  <script>document.documentElement.classList.add('js');</script>

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="${BRAND.name}" />
  <meta name="robots" content="${robots}" />
  ${o.noindex && !o.canonical ? '' : `<link rel="canonical" href="${canonical}" />`}

  <meta property="og:type" content="${o.type || 'website'}" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  <meta property="og:site_name" content="${BRAND.name}" />
  <meta property="og:image" content="${ogImage}" />
  ${o.ogImageType ? `<meta property="og:image:type" content="${o.ogImageType}" />` : ''}
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  ${o.ogImageAlt ? `<meta property="og:image:alt" content="${escapeHtml(o.ogImageAlt)}" />` : ''}
  ${o.publishedTime ? `<meta property="article:published_time" content="${o.publishedTime}" />` : ''}
  ${o.section ? `<meta property="article:section" content="${escapeHtml(o.section)}" />` : ''}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(o.twitterTitle || ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(o.twitterDescription || ogDescription)}" />
  <meta name="twitter:image" content="${absUrl(o.twitterImage || ogImage)}" />

  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16.png" />
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="alternate" type="text/plain" title="LLM-friendly content" href="/llms.txt" />
  <link rel="alternate" type="application/rss+xml" title="Journal OBM System" href="https://obm-system.com/blog/feed.xml" />

  <link rel="preload" href="/assets/fonts/switzer-600.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/switzer-400.woff2" as="font" type="font/woff2" crossorigin />
  ${o.preload || ''}
  <link rel="stylesheet" href="/assets/css/site.css?${CACHE_V}" />
  ${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ')}
  ${o.extraHead || ''}`;
}

// ------------------------------------------------------------
// Menu
// ------------------------------------------------------------
const NAV_ITEMS = [
  ['services', '/services/', 'Services'],
  ['cases', '/cas-clients/', 'Réalisations'],
  ['methode', '/methode/', 'Méthode'],
  ['blog', '/blog/', 'Journal'],
  ['apropos', '/a-propos/', 'À propos'],
];

const LOGO_IMG = (size = 44) => `<img src="/assets/img/logo-obm-system-88.webp" srcset="/assets/img/logo-obm-system-88.webp 88w, /assets/img/logo-obm-system-176.webp 176w" sizes="${size}px" width="${size}" height="${size}" alt="" />`;

function nav(current) {
  const links = NAV_ITEMS.map(([k, h, l]) => `<a href="${h}"${k === current ? ' aria-current="page"' : ''}>${l}</a>`).join('\n        ');
  const mlinks = NAV_ITEMS.map(([, h, l]) => `<a href="${h}">${l}</a>`).join('\n    ');
  return `<header class="nav" id="nav">
    <div class="wrap nav__in">
      <a class="brandmark" href="/">${LOGO_IMG(44)}<span>OBM System</span></a>
      <nav class="nav__links" aria-label="Navigation principale">
        ${links}
      </nav>
      <a class="btn nav__cta" href="${BRAND.diagnostic}" data-loc="nav">Réserver mon diagnostic</a>
      <button class="nav__burger" type="button" aria-expanded="false" aria-controls="mnav">Menu</button>
    </div>
  </header>
  <nav class="mnav" id="mnav" hidden aria-label="Menu mobile">
    ${mlinks}
    <a href="/contact/">Contact</a>
    <a class="btn" href="${BRAND.diagnostic}" data-loc="nav-mobile">Réserver mon diagnostic (30 min)</a>
    <a href="tel:${BRAND.phone}" data-loc="nav-mobile">Appeler le ${BRAND.phoneLabel}</a>
    <a href="${BRAND.whatsapp}" target="_blank" rel="noopener" data-loc="nav-mobile">Écrire sur WhatsApp</a>
  </nav>`;
}

// ------------------------------------------------------------
// Bloc d'appel commun (fin de page)
// ------------------------------------------------------------
function ctaBand(o = {}) {
  const title = o.title || 'Parlons de votre croissance';
  const text = o.text || 'Un diagnostic de croissance de 30 minutes pour lire votre dispositif actuel et identifier vos leviers prioritaires. Si le projet s’y prête, vous recevez ensuite une proposition écrite avec le périmètre, le délai et le prix.';
  const loc = escapeHtml(o.loc || 'band');
  return `<section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="ctaband" data-reveal>
          <div>
            <h2 class="h2">${escapeHtml(title)}</h2>
            <p class="lead">${escapeHtml(text)}</p>
          </div>
          <div class="actions">
            <a class="btn" href="${BRAND.diagnostic}" data-loc="${loc}">Réserver mon diagnostic (30 min)</a>
            <a class="btn btn--line" href="${BRAND.whatsapp}?text=${WA_TEXT}" target="_blank" rel="noopener" data-loc="${loc}">Écrire sur WhatsApp</a>
          </div>
        </div>
      </div>
    </section>`;
}

// ------------------------------------------------------------
// Pied de page, bouton WhatsApp, bandeau de consentement, script
// ------------------------------------------------------------
function footer() {
  const social = BRAND.social.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join(' · ');
  return `<footer class="footer">
    <div class="wrap">
      <div class="footer__grid">
        <div>
          <a class="brandmark brandmark--footer" href="/">${LOGO_IMG(48)}<span>OBM System</span></a>
          <p>${BRAND.descriptor} · Rabat, Maroc &amp; international. Stratégie &amp; audit, sites sur mesure, e-commerce, Meta, Google &amp; TikTok Ads, tracking server-side, SEO &amp; AEO, community management, contenu, CRM et IA.</p>
        </div>
        <div>
          <p class="footer-title">Services</p>
          <ul>
            <li><a href="${BRAND.diagnostic}">Stratégie &amp; audit</a></li>
            <li><a href="/services/creation-site-web/">Création de sites</a></li>
            <li><a href="/services/e-commerce/">E-commerce</a></li>
            <li><a href="/services/publicite-meta-google-ads/">Publicité</a></li>
            <li><a href="/services/tracking-server-side/">Tracking</a></li>
            <li><a href="/services/seo-aeo/">SEO &amp; AEO</a></li>
            <li><a href="/services/reseaux-sociaux/">Réseaux sociaux</a></li>
            <li><a href="/services/ia-automatisation/">IA &amp; automatisation</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">L’agence</p>
          <ul>
            <li><a href="/cas-clients/">Réalisations</a></li>
            <li><a href="/methode/">Méthode</a></li>
            <li><a href="/a-propos/">À propos</a></li>
            <li><a href="/blog/">Journal</a></li>
            <li><a href="/site-reseaux/">Offre Site + Réseaux</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">Contact</p>
          <ul>
            <li><a href="${BRAND.diagnostic}">Réserver mon diagnostic</a></li>
            <li><a href="tel:${BRAND.phone}" data-loc="footer">${BRAND.phoneLabel}</a></li>
            <li><a href="mailto:${BRAND.email}">${BRAND.email}</a></li>
            <li><a href="/contact/">Formulaire de contact</a></li>
            <li>Rabat, Maroc</li>
            <li class="footer__social">${social}</li>
          </ul>
        </div>
      </div>
      <div class="footer__legal">
        <span>© ${new Date().getFullYear()} OBM System · <a href="/mentions-legales/">Mentions légales</a> · <a href="/confidentialite/">Confidentialité</a> · <a href="#" data-open-consent>Gestion des cookies</a></span>
        <a href="https://webotic.ma" target="_blank" rel="noopener">Designed &amp; Engineered by Webotic</a>
      </div>
    </div>
  </footer>

  <nav class="mbar" aria-label="Contact rapide">
    <a class="mbar__main" href="${BRAND.diagnostic}" data-loc="mbar">Réserver mon diagnostic</a>
    <a href="${BRAND.whatsapp}" target="_blank" rel="noopener" data-loc="mbar" aria-label="Écrire à OBM System sur WhatsApp">WhatsApp</a>
    <a href="tel:${BRAND.phone}" data-loc="mbar" aria-label="Appeler OBM System">Appeler</a>
  </nav>

  <a class="wa" href="${BRAND.whatsapp}?text=${WA_TEXT}" target="_blank" rel="noopener" aria-label="Écrire à OBM System sur WhatsApp" data-loc="float">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.8-.2 1.4z"/></svg>
    <span aria-hidden="true">WhatsApp</span>
  </a>

  <div class="consent" id="consent" hidden role="region" aria-label="Cookies">
    <p>Nous utilisons des cookies de mesure et de publicité pour améliorer le site et nos campagnes. <a href="/confidentialite/#cookies">En savoir plus</a></p>
    <div class="consent__actions">
      <button type="button" class="btn btn--line" data-consent="denied">Refuser</button>
      <button type="button" class="btn btn--line" data-consent="granted">Accepter</button>
    </div>
  </div>

  <script src="/assets/js/site.js?${CACHE_V}" defer></script>`;
}

function page({ headHtml, current, main }) {
  return typoFr(`<!DOCTYPE html>
<html lang="fr-MA">
<head>
  ${headHtml}
</head>
<body>
  <a class="skip" href="#main">Aller au contenu</a>

  ${nav(current)}

  <main id="main">${main}</main>

  ${footer()}
</body>
</html>
`);
}

// Capture encadrée (desktop, avec téléphone en option)
function shot({ key, host, alt, phone = false, lazy = true, priority = false, sizes = '(max-width: 900px) 92vw, 380px' }) {
  const lz = lazy ? ' loading="lazy" decoding="async"' : '';
  const pr = priority ? ' fetchpriority="high"' : '';
  const mob = phone ? `<div class="shot__mobile"><img src="/assets/img/realisations/${key}-mobile-260.webp" srcset="/assets/img/realisations/${key}-mobile-260.webp 260w, /assets/img/realisations/${key}-mobile.webp 520w" sizes="(max-width: 600px) 26vw, 180px" width="520" height="1125"${lz} alt="" /></div>` : '';
  return `<figure class="shot${phone ? ' shot--phone' : ''}">
              <div class="shot__frame">
                <div class="shot__bar"><i></i><i></i><i></i><span>${escapeHtml(host)}</span></div>
                <img src="/assets/img/realisations/${key}-desktop.webp" srcset="/assets/img/realisations/${key}-desktop-600.webp 600w, /assets/img/realisations/${key}-desktop-900.webp 900w, /assets/img/realisations/${key}-desktop.webp 1200w" sizes="${sizes}" width="1200" height="750"${lz}${pr} alt="${escapeHtml(alt)}" />
              </div>${mob}
            </figure>`;
}

module.exports = {
  SITE_URL, CACHE_V, BRAND, WA_TEXT, OG_DEFAULT, STATIC_PAGES, ORG_ID, PERSON_ID,
  escapeHtml, formatDateFr, typoFr, absUrl, orgNode, personNode, breadcrumbSchema, breadcrumbHtml,
  head, nav, ctaBand, footer, page, shot,
};
