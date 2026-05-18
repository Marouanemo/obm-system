#!/usr/bin/env node
// One-shot migration: convert the existing hand-written blog & case study
// pages into Markdown files inside content/ so the admin can manage them.
//
// This is meant to be run ONCE on the server after deploying the admin app.
// It is safe to re-run — existing content files will be SKIPPED, not overwritten.
//
// Usage: node scripts/migrate.js

require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = process.env.CONTENT_DIR || path.join(__dirname, '..', 'content');

const seed = [
  {
    type: 'cases',
    slug: 'cabinet-implants-casablanca',
    data: {
      title: "Cabinet d'implantologie à Casablanca : +247% de leads en 90 jours",
      date: '2026-04-22',
      category: 'Implantologie',
      location: 'Casablanca',
      duration: '6 mois',
      excerpt: "Comment un cabinet d'implantologie premium, jusque-là dépendant exclusivement du bouche-à-oreille, est passé de 3 à 11 nouveaux patients implants par mois en six mois, sans augmenter ses effectifs.",
      bigMetricValue: '+247',
      bigMetricUnit: '%',
      bigMetricLabel: 'de leads qualifiés en 90 jours',
      subMetrics: [
        { label: 'Coût par lead',           value: '−65', unit: '%' },
        { label: 'Taux de RDV',              value: '32 → 58', unit: '%' },
        { label: 'Patients implants / mois', value: '3 → 11', unit: '' },
      ],
      published: true,
    },
    content: `## Le contexte avant

Le cabinet, situé dans le centre de Casablanca, est établi depuis huit ans. Le praticien est un implantologue reconnu, formé à l'étranger, avec une clientèle fidèle mais vieillissante. Pas de site web fonctionnel, pas de présence Meta Ads, aucune campagne d'acquisition. **Tout repose sur la recommandation patient à patient.**

Le problème : le volume stagne depuis trois ans. Le planning est rempli à 60% — pas assez pour absorber les coûts fixes du plateau technique.

## Le diagnostic OBM SYSTEM

Audit du cabinet (une semaine). Trois constats majeurs :

- **Acquisition digitale inexistante** — le cabinet n'a pas de présence sur les canaux où ses patients-cibles cherchent leurs solutions.
- **Aucun suivi commercial** — 40 à 60% des demandes annuelles sont perdues sans suivi.
- **Pas de qualification financière** — chaque demande implant est traitée de la même façon.

## Ce qu'on a déployé

### Campagnes Meta Ads ciblées
Audiences "lookalike" construites à partir de la base patient existante. Vidéos courtes du Dr présentant un cas implant avant/après.

### Lead funnel avec qualification
Page de destination dédiée avec formulaire en 4 étapes. La 3e étape qualifie le budget patient — éliminant à la source 35% des demandes non-qualifiées.

### Relance automatique WhatsApp
- Confirmation immédiate (sous 5 minutes)
- Relance J+1 avec témoignage patient
- Relance J+3 avec lien Calendly

### CRM dentaire spécialisé
Lead scoring automatique selon : tranche budget déclarée, vitesse de réponse, source.

### Command center quotidien
Tableau de bord journalier : leads chauds, RDV confirmés, leads à risque, coût d'acquisition moyen.

## Les résultats à 90 jours

- **+247%** de leads qualifiés
- **−65%** de coût par lead
- Taux de RDV : **32 → 58%**
- Patients implants/mois : **3 → 11**
- CA additionnel/mois : **~+180k dh**
- ROAS Meta Ads : **×8,4**

## Ce qui a fait la différence

**Pas la publicité.** N'importe quel community manager aurait pu lancer des Meta Ads. La différence :

- La qualification financière en amont
- La relance automatique dans la première heure
- Le scoring pour prioriser

> En 6 mois, on a réorganisé toute la machine commerciale. Mon équipe ne traite plus les leads dans l'ordre d'arrivée — elle traite ceux qui ont la plus forte probabilité de devenir patients.
`,
  },
  {
    type: 'cases',
    slug: 'cabinet-facettes-rabat',
    data: {
      title: "Cabinet esthétique à Rabat : transformer 18 000 followers en patients facettes",
      date: '2026-05-02',
      category: 'Esthétique & facettes',
      location: 'Rabat',
      duration: '4 mois',
      excerpt: "Un cabinet jeune, fort sur Instagram, mais avec une conversion en RDV très faible. Comment on a transformé une audience engagée en pipeline commercial concret.",
      bigMetricValue: '×6,2',
      bigMetricUnit: '',
      bigMetricLabel: 'de ROAS Meta Ads en moyenne',
      subMetrics: [
        { label: 'Demandes facettes / mois', value: '+312', unit: '%' },
        { label: 'Taux de no-show',          value: '24 → 8', unit: '%' },
        { label: 'Relances en automation',   value: '78', unit: '%' },
      ],
      published: true,
    },
    content: `## Le contexte

Cabinet d'esthétique dentaire à Rabat, ouvert il y a deux ans. Positionnement clair : facettes premium, blanchiment haut de gamme. **Le paradoxe :** 18 000 abonnés Instagram, engagement très élevé, reels qui dépassent les 100 000 vues. Pourtant, le planning facettes reste à moitié vide.

## Le diagnostic

- **L'audience est curieuse, pas convertie** — 60-70% de drop entre engagement et RDV
- **Aucun canal direct mesurable** — pas de site, pas de formulaire
- **Pas de relance** — un DM qui reste sans réponse 4h est perdu

> **Hypothèse :** l'audience est déjà chaude. Il manque juste un système commercial pour la convertir.

## Ce qu'on a déployé

- **Funnel facettes dédié** avec qualification budget en 3 niveaux
- **Meta Ads** avec creative Instagram-native (reels recyclés)
- **WhatsApp Business + 3 séquences automatiques**
- **CRM avec scoring esthétique**
- **Réduction du no-show** via confirmations J-1 / H-2

## Résultats à 4 mois

- Demandes facettes/mois : **+312%**
- Taux RDV pris : **×2,4**
- No-show : **24% → 8%**
- ROAS Meta Ads : **×6,2**
- Budget pub mensuel : ~12k dh
- CA additionnel sur 4 mois : ~250k dh

## Ce qu'il faut retenir

**Le bouche-à-oreille social ne convertit pas tout seul.** Une audience Instagram engagée n'est pas un pipeline commercial. C'est juste un signal.

> Je pensais qu'il me fallait plus de followers. En fait il me fallait juste un système pour parler à ceux que j'avais déjà.
`,
  },
  {
    type: 'blog',
    slug: 'meta-ads-cabinets-dentaires-erreurs',
    data: {
      title: "5 raisons pour lesquelles vos campagnes Meta Ads dentaires échouent",
      date: '2026-05-15',
      category: 'Acquisition',
      readTime: '8 min de lecture',
      excerpt: "Vos coûts par lead grimpent, la qualité chute, votre taux de RDV stagne. Voici les 5 erreurs structurelles qu'on retrouve dans 90% des comptes Meta Ads de cabinets — et comment les corriger en moins d'une semaine.",
      tag: 'Meta Ads',
      published: true,
    },
    content: `## Erreur n°1 — Vous ciblez "intérêts dentaires" au lieu d'audiences comportementales

Personne ne s'inscrit sur Facebook en cliquant "j'aime les implants dentaires". Ces intérêts sont des proxies très faibles.

**Ce qui marche :** lookalike (1%) construites à partir de patients existants + retargeting site sur 7-30 jours.

## Erreur n°2 — Vos publicités vendent au lieu d'éduquer

"Implants dentaires à partir de 5 000 dh" — personne ne décide d'investir 20 000 dh sur une promo vue dans un feed.

**Ce qui marche :** 80% de contenu éducatif, 20% conversion. Vidéos du praticien, témoignages, "5 questions à poser".

## Erreur n°3 — Vos leads tombent dans un trou noir

La probabilité de convertir un lead chute de **21×** après une heure sans réponse.

**Ce qui marche :** relance WhatsApp automatique sous 60 secondes.

## Erreur n°4 — Vous mesurez les "leads" au lieu des "patients"

Coût par lead : 89 dh. Mais sur 37 leads → 4 RDV → 2 devis → 1 patient. **Vrai coût par patient : 3 293 dh.**

**Ce qui marche :** Meta Conversion API + signal CRM → patient. L'algo apprend à filtrer.

## Erreur n°5 — Vous n'optimisez jamais sur l'attribution post-clic

Le cycle dentaire est long. Une annonce peut générer un patient 3 semaines après le premier clic.

**Ce qui marche :**
- Fenêtre 7-day click + 1-day view
- Audit hebdo, décisions hebdo
- Rotation creatives toutes les 2-3 semaines
- A/B sur les hooks (3 premières secondes = 70% du résultat)

## Ce qu'il faut retenir

Une publicité performante sans système de capture-qualification-relance derrière, c'est de l'argent qui s'évapore.
`,
  },
  {
    type: 'blog',
    slug: 'whatsapp-automation-cabinets-dentaires',
    data: {
      title: "WhatsApp automation pour cabinets dentaires : le guide complet 2026",
      date: '2026-05-08',
      category: 'Automation',
      readTime: '12 min de lecture',
      excerpt: "WhatsApp est le canal numéro un au Maroc — et celui où 90% des cabinets laissent fuir leurs patients. Les 4 séquences essentielles, le setup technique, et les erreurs à éviter.",
      tag: 'WhatsApp',
      published: true,
    },
    content: `## Pourquoi WhatsApp et pas autre chose

- **27,2 millions** d'utilisateurs WhatsApp au Maroc
- **92%** des utilisateurs internet actifs
- **Taux d'ouverture** : 98%
- **Temps moyen de réponse** : 90 secondes

WhatsApp n'est pas une option — c'est **le canal principal** pour joindre les prospects au Maroc.

## Les 4 séquences essentielles

### 1. Confirmation immédiate de lead
Sous 60 secondes après le formulaire. Coupe l'anxiété, montre que c'est sérieux. **+180%** de taux de réponse au premier appel.

### 2. Relance no-response (3 messages)
J+1 (témoignage), J+3 (lever objection), J+7 (dernière main tendue). Après J+7, **on arrête.**

### 3. Confirmation et rappel RDV
- Immédiate après prise de RDV
- J-1 à 18h
- H-2 le jour J

Cette séquence seule fait passer le no-show de **22-28% → 6-10%**.

### 4. Réactivation des leads dormants
1 message tous les 3 mois max, sur des leads de 60+ jours. Convertit **8-15%** des dormants.

## Setup technique

### WhatsApp Business App vs API

- **App** : gratuit, jusqu'à 50 conversations actives, **pas d'automation réelle**
- **API** : payant, obligatoire pour automation + multi-utilisateur + CRM

### Fournisseurs API recommandés

- **Twilio** : enterprise, fiable, facturation par message
- **WATI** : interface no-code excellente, ~40$/mois
- **360dialog** : fournisseur officiel européen

### Templates Meta — la règle

Tout message initié par le cabinet doit passer par un **template pré-approuvé** par Meta. Approbation sous 7 jours. Pas de contenu purement promotionnel.

## Métriques à suivre

- Taux de livraison : >95%
- Taux d'ouverture : >90%
- Taux de réponse : ~15-30% pour relances
- Taux de désabonnement : <2%

## Les 5 erreurs à éviter

1. **Sur-cadencer** — max 3 relances
2. **Vouloir tout automatiser** — le premier appel humain reste critique
3. **Personnaliser superficiellement** — "Bonjour [Prénom]" + générique = pire
4. **Oublier les heures** — pas entre 21h et 8h, attention au Ramadan
5. **Ne pas mesurer le désabonnement** — Meta peut suspendre l'API au-delà de 2-3%

## Ce qu'il faut retenir

WhatsApp automation, c'est **10% d'outil et 90% de méthode.** Ordre optimal :

1. Confirmations + rappels RDV (gain immédiat)
2. Confirmation lead immédiate
3. Relances no-response
4. Réactivation dormants

Compter 4-6 semaines pour avoir l'ensemble opérationnel.
`,
  },
];

async function run() {
  let created = 0, skipped = 0;
  for (const item of seed) {
    const dir = path.join(CONTENT_DIR, item.type);
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${item.slug}.md`);
    try {
      await fs.access(file);
      console.log(`  SKIP   ${item.type}/${item.slug}.md (exists)`);
      skipped++;
      continue;
    } catch {}
    const md = matter.stringify(item.content, item.data);
    await fs.writeFile(file, md, 'utf8');
    console.log(`  CREATE ${item.type}/${item.slug}.md`);
    created++;
  }
  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
