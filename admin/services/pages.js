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
      title: "OBM SYSTEM — Système d'acquisition pour cabinets dentaires au Maroc",
      description: "OBM SYSTEM construit l'infrastructure complète des cabinets dentaires ambitieux au Maroc : acquisition, CRM, automation WhatsApp et intelligence. Transformez chaque dirham publicitaire en patients réels.",
      keywords: "agence marketing cabinet dentaire Maroc, acquisition patients dentiste, publicité Meta Ads dentiste Casablanca, CRM dentiste, automation WhatsApp dentiste, leads implants facettes Invisalign Maroc",
      ogTitle: "OBM SYSTEM — Diagnostic d'acquisition pour cabinets dentaires",
      ogDescription: "Évaluez votre maturité d'acquisition en 90 secondes. Score sur 100, verdict, 3 leviers prioritaires — gratuit, instantané.",
      ogImage: "/assets/img/og-cover.svg",
      twitterTitle: "OBM SYSTEM — Diagnostic d'acquisition cabinets dentaires",
      twitterDescription: "Évaluez votre maturité d'acquisition en 90 secondes. Le diagnostic exclusif pour cabinets dentaires ambitieux.",
      twitterImage: "/assets/img/og-cover.svg",
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
      title: "Journal — Articles sur l'acquisition de patients dentaires | OBM SYSTEM",
      description: "Le journal d'OBM SYSTEM : articles tactiques sur l'acquisition de patients dentaires, l'automation WhatsApp, les campagnes Meta Ads, et la croissance des cabinets dentaires au Maroc.",
      keywords: "blog marketing dentaire, acquisition patients, automation cabinet dentaire, Meta Ads dentiste, WhatsApp dentiste",
      ogTitle: "Journal OBM SYSTEM — Acquisition patients dentaires",
      ogDescription: "Articles tactiques sur l'acquisition, l'automation et la croissance des cabinets dentaires.",
      ogImage: "/assets/img/og-cover.svg",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      noindex: false,
      nofollow: false,
    },
  },
  'cases-index': {
    id: 'cases-index',
    label: 'Index des cas clients',
    url: '/cas-clients/',
    description: 'Page liste des études de cas (https://obm-system.com/cas-clients/)',
    canonical: 'https://obm-system.com/cas-clients/',
    defaults: {
      title: "Cas clients — Cabinets dentaires transformés | OBM SYSTEM",
      description: "Études de cas anonymisées de cabinets dentaires marocains ayant déployé l'infrastructure OBM SYSTEM. Données réelles, résultats mesurés, méthodes détaillées.",
      keywords: "cas clients OBM, étude de cas cabinet dentaire, résultats acquisition dentaire",
      ogTitle: "Cas clients OBM SYSTEM — Cabinets dentaires transformés",
      ogDescription: "Études de cas anonymisées avec données réelles et résultats mesurés.",
      ogImage: "/assets/img/og-cover.svg",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
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
