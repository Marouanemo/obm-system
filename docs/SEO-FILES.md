# OBM SYSTEM — Fichiers SEO & Référencement

Inventaire et description de tous les fichiers de référencement du site.

---

## 📄 Fichiers à la racine

### `sitemap.xml`
**URL** : https://obm-system.com/sitemap.xml
**MIME** : `text/xml`
**Usage** : Plan du site pour les moteurs de recherche (Google, Bing, etc.)
**Contenu** : URL principale + image sitemap (og-cover.svg)
**Mettre à jour** : à chaque ajout/modification de page importante (changer `<lastmod>`)

### `robots.txt`
**URL** : https://obm-system.com/robots.txt
**MIME** : `text/plain`
**Usage** : Règles d'accès pour les crawlers
**Détails** :
- Tous les crawlers : accès autorisé (sauf `/docs/` et `/deploy/`)
- **Crawlers IA autorisés** (pour visibilité dans ChatGPT, Claude, Perplexity, etc.) :
  - GPTBot, ChatGPT-User, OAI-SearchBot (OpenAI)
  - ClaudeBot, Claude-Web, anthropic-ai (Anthropic)
  - PerplexityBot, Perplexity-User (Perplexity)
  - Google-Extended (Google AI / Gemini)
  - Applebot-Extended (Apple Intelligence)
  - cohere-ai, Meta-ExternalAgent
- **Bloqués** : Bytespider (scraping agressif)
- **Crawl-delay 10s** : SemrushBot, AhrefsBot, MJ12bot

### `manifest.webmanifest`
**URL** : https://obm-system.com/manifest.webmanifest
**MIME** : `application/manifest+json`
**Usage** : PWA manifest — permet l'installation de l'app sur mobile/desktop ("Ajouter à l'écran d'accueil")
**Détails** :
- Nom complet + court (`OBM SYSTEM`)
- Theme color : navy `#0B1E3F`
- Background color : navy-950 `#050B1F`
- Display : standalone (apparence d'app native)
- Lang : `fr-MA`
- Catégories : business, medical, marketing, productivity
- **Shortcuts** (raccourcis longue-pression sur l'icône) :
  - Diagnostic interactif → `/#diagnostic`
  - Contact rapide → `/#contact`
- Icônes : favicon.svg + apple-touch-icon.svg

### `llms.txt`
**URL** : https://obm-system.com/llms.txt
**MIME** : `text/plain`
**Usage** : **Standard émergent** pour les crawlers IA (proposé par Jeremy Howard, fast.ai). Fournit une vue structurée du contenu du site optimisée pour l'ingestion par les LLM.
**Format** : Markdown avec sections claires
**Lu par** : ChatGPT, Claude, Perplexity, Cursor, etc. quand ils analysent le site
**Contenu** : Description courte + liens principaux + service détaillé + traitements ciblés + contact

### `llms-full.txt`
**URL** : https://obm-system.com/llms-full.txt
**MIME** : `text/plain`
**Usage** : Version étendue de `llms.txt` avec le contenu complet de la landing
**Lu par** : LLM qui veulent une compréhension profonde du site (pour répondre à des questions précises sur OBM SYSTEM)

### `humans.txt`
**URL** : https://obm-system.com/humans.txt
**MIME** : `text/plain`
**Usage** : Crédits humains derrière le site (standard https://humanstxt.org/)
**Référencé** : par certains outils de découverte de stack tech

### `.well-known/security.txt`
**URL** : https://obm-system.com/.well-known/security.txt
**MIME** : `text/plain`
**Usage** : RFC 9116 — point de contact pour les chercheurs en sécurité qui découvrent une vulnérabilité
**Conformité** : standard requis par certains bug bounty et obligatoire pour certaines certifications
**Expire** : 2027-12-31 (à mettre à jour avant cette date)

---

## 🖼️ Assets visuels

### `assets/img/favicon.svg`
**Usage** : Icône onglet navigateur, scalable
**Référencé** : `<link rel="icon" type="image/svg+xml">`

### `assets/img/apple-touch-icon.svg`
**Usage** : Icône iOS quand l'utilisateur ajoute le site à l'écran d'accueil
**Taille** : 180×180
**⚠️ Note** : iOS ancien (≤ 13) ne supporte pas SVG. Si tu veux la compatibilité 100%, génère une version PNG :
```bash
# Avec Inkscape installé
inkscape apple-touch-icon.svg -w 180 -h 180 -o apple-touch-icon.png
# OU via service en ligne : https://cloudconvert.com/svg-to-png
```

### `assets/img/og-cover.svg`
**URL** : https://obm-system.com/assets/img/og-cover.svg
**Usage** : Image de prévisualisation Open Graph (partages WhatsApp, Facebook, X, LinkedIn, etc.)
**Taille** : 1200×630 (ratio standard OG)
**⚠️ IMPORTANT** : Facebook, X et LinkedIn **ne rendent PAS le SVG en preview** social. Pour avoir une vraie image sur les partages :

**Option 1 — Conversion locale (recommandé)** :
```bash
# Avec Inkscape
inkscape og-cover.svg -w 1200 -h 630 -o og-cover.png
# Puis upload sur le serveur :
scp og-cover.png root@89.167.92.61:/var/www/obm-system/public/assets/img/
```
Puis dans `index.html`, changer :
```html
<meta property="og:image" content="https://obm-system.com/assets/img/og-cover.png" />
```

**Option 2 — Service en ligne** :
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com

**Option 3 — Capture manuelle** :
- Ouvrir le SVG dans Chrome, F12, capturer en 1200×630

---

## 🏷️ Schema.org JSON-LD (dans `index.html`)

Le bloc `<script type="application/ld+json">` contient un graphe Schema.org avec :

1. **Organization** — Métadonnées de l'agence
   - Nom, logo, contact, langues, zones d'intervention (Casablanca, Rabat, Marrakech)
2. **WebSite** — Le site lui-même
   - Référence l'Organization
3. **ProfessionalService** — Le service principal
   - Provider = Organization
   - **OfferCatalog** avec les 6 traitements ciblés
4. **FAQPage** — Les 7 questions de la FAQ
   - Permet à Google de **afficher la FAQ en rich snippet dans les SERP** (très visible)

**Tester le rich snippet** :
- https://search.google.com/test/rich-results → coller l'URL → voir si les FAQs sont détectées

---

## 📡 Méta tags dans `<head>`

### Open Graph
- `og:type` : website
- `og:locale` : `fr_MA`
- `og:url`, `og:title`, `og:description`
- `og:image` (avec width 1200, height 630, alt)
- `og:site_name` : OBM SYSTEM

### Twitter Card
- `twitter:card` : `summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image`

### Icons & Manifest
- `icon` SVG (favicon)
- `apple-touch-icon` SVG (180×180)
- `manifest` → `manifest.webmanifest`

### LLM-friendly links
- `alternate` text/plain → `/llms.txt`
- `alternate` text/plain → `/llms-full.txt`

---

## 🔍 Outils de test

### Validation générale
- https://www.google.com/search-console — soumettre sitemap, suivre indexation
- https://www.bing.com/webmasters — équivalent Bing
- https://search.google.com/test/rich-results — test Schema.org rich snippets
- https://validator.schema.org — validation JSON-LD pure

### Tests sociaux
- **Facebook** : https://developers.facebook.com/tools/debug → coller l'URL → voir le preview
- **X/Twitter** : https://cards-dev.twitter.com/validator
- **LinkedIn** : https://www.linkedin.com/post-inspector/
- **WhatsApp** : envoyer le lien sur WhatsApp Web → voir le preview

### PWA / Manifest
- https://pwabuilder.com → tester la manifest, voir les améliorations possibles
- Chrome DevTools → onglet Application → Manifest → vérifier que tout est valide

### Robots.txt
- https://www.google.com/webmasters/tools/robots-testing-tool

---

## ✅ Checklist à faire (côté toi)

- [ ] **Soumettre sitemap.xml** à Google Search Console
- [ ] **Soumettre sitemap.xml** à Bing Webmaster
- [ ] **Générer og-cover.png** (1200×630) à partir du SVG, l'uploader, et changer la balise `og:image`
- [ ] **Tester rich results FAQ** sur https://search.google.com/test/rich-results
- [ ] **Tester preview social** sur Facebook Debug et LinkedIn Post Inspector
- [ ] **Vérifier indexation** : taper `site:obm-system.com` dans Google après 7-14 jours

---

© OBM SYSTEM
