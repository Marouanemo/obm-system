// ============================================================
// System pages SEO — landing, blog index, cases index
// Settings stored as JSON in content/pages/<id>.json
// ============================================================
const fs = require('fs/promises');
const path = require('path');

const CONTENT_DIR = process.env.CONTENT_DIR || path.join(__dirname, '..', 'content');
const PAGES_DIR = path.join(CONTENT_DIR, 'pages');

const PAGES = {
  landing: {
    id: 'landing',
    label: 'Landing page',
    url: '/',
    description: "Page d'accueil du site (https://obm-system.com/)",
    canonical: 'https://obm-system.com/',
    defaults: {
      title: 'OBM System · Croissance digitale à Rabat, Maroc',
      description: 'Agence de conseil 360° : stratégie, sites sur mesure, e-commerce, Meta, Google & TikTok Ads, tracking, SEO & AEO, contenu, CRM et IA. Réservez votre diagnostic.',
      keywords: '',
      ogTitle: 'OBM System · Ingénierie et précision. L’exécution chirurgicale des ventes.',
      ogDescription: 'Sites web, boutiques en ligne, publicité Meta et Google, référencement et réseaux sociaux. Une seule équipe à Rabat.',
      ogImage: "/assets/img/og-obm-system.png",
      twitterTitle: 'OBM System · Ingénierie et précision. L’exécution chirurgicale des ventes.',
      twitterDescription: 'Sites web, publicité, référencement et réseaux sociaux. Une seule équipe à Rabat.',
      twitterImage: '/assets/img/og-obm-system.png',
      noindex: false,
      nofollow: false,
    },
  },
  'blog-index': {
    id: 'blog-index',
    label: 'Index du blog',
    url: '/blog/',
    description: 'Page liste des articles (https://obm-system.com/blog/)',
    canonical: 'https://obm-system.com/blog/',
    defaults: {
      title: 'Journal : analyses mesure, acquisition, SEO · OBM System',
      description: 'Tracking, publicité Meta et Google, référencement et IA : des analyses techniques, sourcées et applicables.',
      keywords: 'conseils site web, publicité Facebook Maroc, référencement Google, réseaux sociaux entreprise, WhatsApp Business',
      ogTitle: 'Le journal d’OBM System',
      ogDescription: 'Des articles pratiques sur les sites web, la publicité, le référencement et les réseaux sociaux.',
      ogImage: "/assets/img/og-obm-system.png",
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      noindex: false,
      nofollow: false,
    },
  },
  'cases-index': {
    id: 'cases-index',
    label: 'Index des réalisations',
    url: '/cas-clients/',
    description: 'Page liste des réalisations (https://obm-system.com/cas-clients/)',
    canonical: 'https://obm-system.com/cas-clients/',
    defaults: {
      title: 'Réalisations : anatomie d’un système · OBM System',
      description: 'Plateformes, e-commerce et sites livrés au Maroc et au Canada, décortiqués décision par décision.',
      keywords: '',
      ogTitle: 'Réalisations OBM System',
      ogDescription: 'Boutiques en ligne, plateforme, sites vitrines, réseaux sociaux et publicité, au Maroc et au Canada.',
      ogImage: "/assets/img/og-obm-system.png",
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      noindex: false,
      nofollow: false,
    },
  },
};

async function ensureDir() {
  await fs.mkdir(PAGES_DIR, { recursive: true });
}

function fileFor(id) {
  return path.join(PAGES_DIR, `${id}.json`);
}

function meta(id) {
  return PAGES[id];
}

function list() {
  return Object.values(PAGES);
}

async function read(id) {
  if (!PAGES[id]) return null;
  await ensureDir();
  try {
    const raw = await fs.readFile(fileFor(id), 'utf8');
    return { ...PAGES[id], data: { ...PAGES[id].defaults, ...JSON.parse(raw) } };
  } catch (e) {
    if (e.code === 'ENOENT') {
      // Auto-create with defaults
      await write(id, PAGES[id].defaults);
      return { ...PAGES[id], data: { ...PAGES[id].defaults } };
    }
    throw e;
  }
}

async function write(id, data) {
  if (!PAGES[id]) throw new Error('Page inconnue');
  await ensureDir();
  const merged = {
    ...PAGES[id].defaults,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(fileFor(id), JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

module.exports = { list, read, write, meta, PAGES };
