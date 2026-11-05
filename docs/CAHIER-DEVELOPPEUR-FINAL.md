# obm-system.com : cahier des travaux final pour le développeur

**Version finale, 2 novembre 2026.** Ce fichier remplace tous les documents précédents (audit v1, fichier de correctifs v2, LISEZMOI de la v6). Il contient **tout ce qui reste à faire**, dans l'ordre, avec les commandes, les spécifications et les critères d'acceptation. L'audit détaillé d'origine figure en annexe D, pour référence.

**Destinataire** : le développeur qui gère le serveur et le back-office d'obm-system.com, ou Claude Code travaillant pour lui.
**Paquet associé** : `obm-system-site-v7.zip`. Ce fichier figure à sa racine sous le nom `00-CAHIER-DEVELOPPEUR-FINAL.md`. Le paquet contient aussi :
- le site corrigé (`site/`) ;
- la configuration nginx ;
- le script de mise en ligne ;
- le script de contrôle ;
- la fiche DNS.

## Mode d'emploi

**Statuts**

| Symbole | Sens |
|---|---|
| ✅ | **Fait et en ligne.** Ne rien refaire. |
| 📦 | **Prêt dans le paquet v7.** En ligne après la phase 1. |
| 🔧 | **À faire par le développeur.** |
| 👤 | **À faire ou à fournir par Oualid.** Accès, contenus, décisions. |
| 🔎 | **À vérifier** avant d'agir. |

**Règles de la maison** (non négociables) :

1. **Aucune donnée inventée** : chiffres clients, avis, résultats, certifications. Une information non confirmée par écrit ne se publie pas.
2. **Ne jamais enregistrer une étude de cas dans `/admin`** tant que la phase 2.3 n'est pas terminée. L'enregistrement efface les blocs faits à la main.
3. **Ne jamais vider la racine web** ni utiliser `rsync --delete`. `/assets/uploads/` contient la médiathèque du back-office, dont les images de partage des articles.
4. **Aucun secret dans le code ou le dépôt.** Clé LeadFlow, jeton API Conversions Meta et configuration sGTM restent côté serveur.
5. Ne pas présenter OBM System comme « en partenariat » avec une autre agence. Le pied de page affiche « Conçu et développé par OBM System ».
6. Le logo OBM ne se redessine pas. Les déclinaisons (favicon, version claire) se font à partir des fichiers fournis par Oualid.

---

## 1. Où en est le site au 2 novembre 2026

| Indicateur | Avant l'audit | Aujourd'hui | Après la phase 1 |
|---|---|---|---|
| Pages indexées par Google | 6 sur 32, dont 3 dentaires | Sitemap lu (32 URL), 11 pages demandées, 2 suppressions | Indexation progressive (3 à 6 semaines) |
| E-mail du domaine | Pas de SPF ni DMARC, DKIM mal placé | ✅ SPF, DKIM et DMARC en place | — |
| Clé API LeadFlow | Publique dans `site.js` | Toujours publique | 📦 Retirée et 🔧 révoquée |
| JavaScript Google | 480 Ko, GA4 chargé 2 fois, GTM vide | Inchangé | 📦 GA4 chargé une fois, GTM vide retiré |
| Lighthouse mobile (accueil) | 65, TBT 1 790 ms | Inchangé | 71, TBT 460 à 530 ms (mesure locale, sans compression) ; objectif ≥ 90 en phase 4 |
| Accessibilité (axe, Lighthouse) | Contrastes, focus, libellés et cibles tactiles en défaut | Inchangé | 📦 Lighthouse 100, aucune violation sérieuse (axe) |
| Articles du Journal | Structure inégale, temps de lecture × 2 | ✅ Harmonisés (« En bref », sources vérifiées, temps exacts) | — |

### 1.1 Déjà fait en ligne (ne pas refaire)

- **Search Console**
  - Sitemap renvoyé : 32 pages découvertes.
  - 11 demandes d'indexation (accueil, Réalisations, Journal, Diagnostic, Services et 6 pages services) ; la suite se fait chaque jour selon le quota.
  - Suppression temporaire des deux anciennes études de cas dentaires.
- **GA4** (propriété `G-JGDV0VS9B9`)
  - Conservation des données : 14 mois.
  - `formsubmit.co` et `calendly.com` déclarés en référents indésirables.
  - `whatsapp_click` déclaré comme événement clé.
  - 7 dimensions personnalisées : `page_type`, `cta_label`, `location`, `case`, `form_source`, `besoin`, `demarrage`.
  - Association avec la Search Console.
- **DNS (Genious) et Google Admin**
  - SPF `v=spf1 include:_spf.google.com ~all`.
  - DKIM sur `google._domainkey`, avec la signature activée dans Google Admin.
  - DMARC `p=none`.
  - Suppression de l'ancien DKIM placé à la racine.
- **Back-office**
  - **9 articles** : titres SEO, descriptions, typographie française, « En bref », sources vérifiées, temps de lecture exacts (200 mots/min), « À lire ensuite » et image de partage propre à chaque article.
  - **Accueil** : title et balises de partage.
  - **Index du Journal** : title, description et balises de partage alignés sur son contenu réel.
- **Fiche Google OBM System** : lien du site avec UTM (`?utm_source=google&utm_medium=organic&utm_campaign=gbp`).

### 1.2 Prêt dans le paquet v7

**Sécurité et serveur**
- `site.js` sans clé API, formulaires via `/api/lead`.
- nginx :
  - proxy LeadFlow ;
  - 410 sur les anciens cas dentaires ;
  - 301 de `/index.html` et des doubles barres obliques ;
  - `charset` des fichiers texte ;
  - CSP.

**Mesure**
- GA4 chargé une seule fois, conteneur GTM vide retiré.
- `track()` sans doublon.
- Liens WhatsApp avec référence de page.

**Conversion**
- Barre d'actions mobile, avec appel et WhatsApp dans le menu.
- Bandeau cookies compact.
- CTA du hero visible sur mobile.
- Calendly avec indicateur de chargement et lien de secours.
- Formulaires : formats de téléphone acceptés, champs obligatoires signalés.
- Page 404 avec liens utiles.
- Bouton pause sur la vidéo.

**Design**
- H1 de l'accueil en deux lignes, hero rééquilibré.
- Signature des articles corrigée, boîte auteur, encadré « En bref ».
- Tailles de texte minimales relevées, pied de page mobile, `text-wrap: pretty`.

**Accessibilité**
- Contrastes, focus visible, alternatives textuelles, ordre des titres, cibles tactiles.

**SEO**
- Titles, descriptions et H1 orientés intention.
- Organisation présente dans les données structurées de chaque page.
- Images de partage 1 200 × 630 pour les cas.
- `og:locale` en `fr_FR`, flux RSS, `llms.txt` à jour, IndexNow.

**Contenu**
- Typographie française sur les 33 pages.
- Chiffres clients corrigés.
- Sections d'expertise et FAQ ajoutées aux 7 pages services et au Diagnostic.
- Téléphone insécable.

**Légal**
- Phrase « seront publiées » retirée des mentions légales.
- Crédit de pied de page remplacé.

### 1.3 Ce qui reste, en un coup d'œil

| Phase | Contenu | Qui | Effort |
|---|---|---|---|
| **1** | Mise en ligne de la v7 : clé LeadFlow, nginx, fichiers, contrôles | 🔧 | ½ journée |
| **2** | Fiabiliser le back-office : gabarits, sitemap, gabarit « étude de cas », chaîne de build | 🔧 | 2 à 3 jours |
| **3** | Mesure complète sur obm-system.com : sGTM sur le même serveur, Pixel et API Conversions Meta, remontée CRM | 🔧 + 👤 accès Meta | 2 à 3 jours |
| **4** | Performance mobile ≥ 90, serveur (HTTP/3, IPv6), Calendly à la demande | 🔧 | 1 à 2 jours |
| **5** | Identité et preuves : favicon et logo clair, gabarit unique des cas, preuves sociales, schémas maison | 🔧 + 👤 fichiers et contenus | 1 à 2 semaines |
| **6** | Contenu et croissance : pages services de 900 à 1 200 mots, page Casablanca, versions EN/AR | 👤 + 🔧 | continu |

---

## 2. Plan d'exécution

### Phase 1 · Mise en ligne de la v7 (jour J, environ une demi-journée)

**Prérequis** : accès root au serveur Hetzner (`89.167.92.61`), accès au compte LeadFlow, paquet `obm-system-site-v7.zip` décompressé sur le serveur.

| # | Action | Qui | Acceptation |
|---|---|---|---|
| 1.1 | Dans LeadFlow, **révoquer l'ancienne clé API** (préfixe `1b5bb9…`, publique depuis la mise en ligne) et en créer une nouvelle. | 🔧 | L'ancienne clé renvoie 401. |
| 1.2 | Créer `/etc/nginx/secrets/leadflow.conf` (droits `600`, propriétaire `root`) contenant une seule ligne : `set $leadflow_key "NOUVELLE_CLE";` | 🔧 | `ls -l` affiche `-rw-------`. |
| 1.3 | Fusionner `serveur/nginx-obm-system.conf` (texte complet en annexe A) dans la configuration du site :<br>• `limit_req_zone` dans `http {}` ;<br>• le reste dans le `server {}` d'`obm-system.com` ;<br>• supprimer les deux 301 actuelles des anciens cas dentaires et la directive `expires` en double ;<br>• **CSP en `Content-Security-Policy-Report-Only` pendant 48 h**. | 🔧 | `nginx -t` OK, puis `systemctl reload nginx`. |
| 1.4 | Depuis `obm-system-v7/`, lancer `sudo sh serveur/deployer-v7.sh /chemin/racine` (texte en annexe B). Le script :<br>• sauvegarde la racine dans `/root/obm-backups/` ;<br>• copie la v7 sans rien supprimer, sans toucher à `/assets/uploads/` ;<br>• contrôle les pages clés ;<br>• notifie IndexNow. | 🔧 | Le script affiche « Mise en ligne terminée ». |
| 1.5 | Lancer `python3 serveur/verifier-en-ligne.py` (54 contrôles : pages, fichiers, nginx, DNS). | 🔧 | **54/54 OK**, sauf le contrôle « CSP active » pendant les 48 h en Report-Only (étape 1.7). |
| 1.6 | Tests manuels :<br>• formulaire de `/contact/` envoyé avec `+212 6 12 34 56 78`, lead reçu dans LeadFlow avec les accents intacts ;<br>• Calendly visible sur `/diagnostic-de-croissance/` ;<br>• iPhone réel : barre d'actions, bandeau compact, CTA du hero visible. | 🔧 | Lead reçu, aucun message d'erreur. |
| 1.7 | Après 48 h sans erreur CSP dans la console (accueil, contact, diagnostic), passer l'en-tête en `Content-Security-Policy`. | 🔧 | En-tête bloquant présent, aucune erreur console. |
| 1.8 | Prévenir Oualid. Il relance alors la Search Console (demandes d'indexation des pages modifiées) et le contrôle complet. | 👤 | — |

**Retour arrière** : `tar -xzf /root/obm-backups/obm-system-avant-v7-<date>.tgz -C /chemin/racine` (commande exacte affichée par le script).

### Phase 2 · Fiabiliser le back-office (semaine 1, 2 à 3 jours)

Le back-office (`/admin`, application Node derrière nginx) **réécrit** à chaque enregistrement :
- les 9 articles et l'index du Journal ;
- l'index des réalisations et les 5 études de cas ;
- l'accueil ;
- le `sitemap.xml`.

Il les réécrit avec **ses propres gabarits**, qui n'ont aucune correction de la v7. Tant que cette phase n'est pas faite, chaque enregistrement efface une partie de la v7.

| # | Action | Qui | Acceptation |
|---|---|---|---|
| 2.1 | **Reporter la v7 dans les gabarits** (spécification complète en 3.1). | 🔧 | Réenregistrer un article sans le modifier, puis `diff` entre la page générée et `site/blog/<article>/index.html` du paquet : **aucune différence hors date de mise à jour**. Même test pour l'index du Journal, l'index des réalisations et l'accueil. |
| 2.2 | **Générateur de sitemap** : vraies dates `lastmod` (spécification en 3.2). | 🔧 | Une page non modifiée garde sa date après un enregistrement. |
| 2.3 | **Gabarit « étude de cas »** : ajouter les champs qui manquent pour que le back-office reproduise les pages actuelles (spécification en 3.3), puis saisir le contenu des 5 cas dans ces champs. | 🔧 | Réenregistrer Cerafas : page identique à `site/cas-clients/cerafas-logistics/index.html`. **Seulement ensuite**, la règle n° 2 est levée. |
| 2.4 | **Chaîne de build** (CODE-1, détail en 3.7) :<br>• noms de fichiers hachés pour CSS et JS ;<br>• minification ;<br>• typographie française au rendu ;<br>• contrôles automatiques. | 🔧 | `site.<hash>.css` servi en `immutable`, aucun `?v=`. |

### Phase 3 · Mesure complète sur obm-system.com (semaines 2 et 3, 2 à 3 jours)

OBM vend le tracking server-side ; son propre site doit l'appliquer (TRK-1, option A). La v7 a retiré le conteneur GTM **vide**. Cette phase réintroduit GTM **avec ses balises**, ajoute le conteneur serveur sur le même serveur et la mesure Meta. Spécification complète en 3.4.

| # | Action | Qui | Acceptation |
|---|---|---|---|
| 3.0 | **Fournir les accès** :<br>• GTM (compte `GTM-TTPCSLV9` ou nouveau conteneur web + serveur) ;<br>• Meta Business : Pixel (dataset) et jeton API Conversions ;<br>• adresse(s) IP du bureau pour le trafic interne. | 👤 | Accès reçus. |
| 3.1 | Conteneur **GTM serveur** en Docker sur le serveur du site, servi sous `https://obm-system.com/metrics/`. | 🔧 | `/metrics/healthz` → 200. |
| 3.2 | Conteneur **GTM web** publié avec les balises (plan de marquage en 3.4), puis snippet GTM remis dans les gabarits, **après** le bloc Consent Mode. | 🔧 | Un seul `gtag/js` dans l'onglet Réseau, hits GA4 vers `/metrics/g/collect`. |
| 3.3 | **Pixel Meta + API Conversions** dédoublonnés par `event_id`. | 🔧 | Gestionnaire d'événements : « Navigateur et serveur », taux de dédoublonnage > 90 %, qualité de correspondance affichée. |
| 3.4 | `site.js` : `track()` pousse dans `dataLayer` avec `event_id` (code en 3.4). | 🔧 | Un seul événement par clic dans DebugView. |
| 3.5 | **GA4** :<br>• déclarer `booking_completed`, `form_submitted` et `phone_click` en événements clés dès leur premier déclenchement ;<br>• activer le filtre de trafic interne ;<br>• 🔎 vérifier la devise (MAD) et le fuseau (Africa/Casablanca). | 🔧 / 👤 | Les 4 événements clés apparaissent dans les rapports. |
| 3.6 | **CSP** mise à jour pour Meta et GTM (liste en 3.4). | 🔧 | Aucune erreur CSP. |
| 3.7 | **Remontée CRM vers Meta** : LeadFlow envoie les étapes du lead (qualifié, client) via l'API Conversions, comme expliqué dans l'article du Journal. | 🔧 | Événements `event_source = crm` visibles dans le Gestionnaire d'événements. |
| 3.8 | Mettre à jour la page Confidentialité : mesure Meta, serveur de mesure, durée des cookies. | 🔧 + 👤 validation | Texte publié. |

### Phase 4 · Performance et serveur (semaines 2 et 3, 1 à 2 jours)

**D'abord mesurer en ligne** après la phase 1 : PageSpeed Insights, mobile, sur `/`, `/services/creation-site-web/`, `/diagnostic-de-croissance/` et `/site-reseaux/`. Spécification en 3.5 et 3.6.

| # | Action | Qui | Acceptation |
|---|---|---|---|
| 4.1 | Images : **AVIF** avec repli WebP (`<picture>`) pour les captures. | 🔧 | Poids des captures −20 % ou plus. |
| 4.2 | Polices : JetBrains Mono remplacée par `ui-monospace`, Switzer sous-ensemblée (latin, latin-1), police de repli à métriques ajustées. | 🔧 | 3 polices au lieu de 4, CLS = 0. |
| 4.3 | CSS : minification et suppression des règles mortes (32 % des règles servent sur l'accueil). | 🔧 | `site.css` < 20 Ko. |
| 4.4 | **Calendly à la demande** : façade « Afficher les créneaux » qui charge le widget au clic (CONV-1 et TRK-4). | 🔧 | Diagnostic < 800 Ko au chargement, aucun cookie Calendly avant le clic. |
| 4.5 | Serveur : HTTP/3, IPv6 (AAAA chez Genious), 🔎 TTFB depuis le Maroc (CDN si > 400 ms), HSTS. | 🔧 | `alt-svc: h3` présent, AAAA résolu. |
| 4.6 | CAA `0 issue "letsencrypt.org"` : l'interface Genious ne le propose pas, demande au support. | 👤 | Enregistrement CAA résolu. |

**Acceptation globale** : Lighthouse mobile ≥ 90 sur l'accueil et les pages services, LCP < 2,5 s, TBT < 200 ms, CLS < 0,1.

### Phase 5 · Identité et preuves (semaines 3 à 5)

| # | Action | Qui | Acceptation |
|---|---|---|---|
| 5.1 | **Favicon simplifié et logo clair** pour l'en-tête sur fond crème (DES-2), à partir des fichiers de la marque. Favicon SVG + repli PNG. | 👤 fichiers · 🔧 intégration | « OBM » lisible à 16 px. |
| 5.2 | **L'orange de la marque**, rare mais visible : puces des décisions, chiffre-clé d'une preuve, indicateur de section active. Jamais en texte sur fond crème (contraste 2,87:1). | 🔧 | Contraste ≥ 3:1 pour les éléments graphiques. |
| 5.3 | **Gabarit unique des études de cas** (DES-3), voir 3.3 :<br>• captures annotées ;<br>• bloc Résultats ;<br>• citation client ;<br>• cas précédent et suivant ;<br>• captures refaites sur des états intemporels. | 🔧 + 👤 résultats et citations **confirmés par écrit** | Les 5 cas sur le même gabarit. |
| 5.4 | **Preuves sociales** (CONV-6) :<br>• avis Google dès qu'il y en a ;<br>• une citation par cas ;<br>• ligne d'engagements sous les CTA. | 👤 contenus · 🔧 blocs | Visibles à côté des CTA. |
| 5.5 | **Accueil** : Pharmacie Gare Hay Riad en premier dans « Anatomie d'un système », puis Éléganza et Cerafas (CONV-7). | 🔧 | Ordre en ligne. |
| 5.6 | **Schéma du système en 6 couches** sur l'accueil et `/services/`, plus un schéma par page service (DES-6). | 🔧 + 👤 validation | Schémas en SVG accessibles (`<title>`, texte équivalent). |
| 5.7 | **À propos** : parcours depuis 2018, domaines d'expertise, certifications réellement obtenues, sans puce isolée (DES-7, SEO-7). | 👤 contenu · 🔧 | Section auteur reliée depuis chaque article. |
| 5.8 | **Gabarit article** :<br>• sommaire repliable ;<br>• encart « Le service lié » à mi-parcours ;<br>• partage LinkedIn ;<br>• un schéma par article (DES-5, DES-10). | 🔧 | Sur les 9 articles. |

### Phase 6 · Contenu et croissance (mois 2 et suivants)

| # | Action | Qui |
|---|---|---|
| 6.1 | **Pages services de 900 à 1 200 mots** (SEO-3). La v7 les porte de 400 à 640 mots ; il manque un exemple réel par page, avec des chiffres confirmés par le client. | 👤 données · 🔧 intégration |
| 6.2 | **Page Casablanca** (SEO-4), avec un contenu réel : projets de la ville, déplacements, cas. Pas de pages satellites dupliquées. | 👤 + 🔧 |
| 6.3 | **Maillage** : chaque étude de cas renvoie vers l'article et le service liés (IDX-6). | 🔧 |
| 6.4 | **Calendrier éditorial** : un article toutes les deux semaines, dates étalées, même structure (« En bref », sources, « À lire ensuite », image de partage). | 👤 |
| 6.5 | **Versions EN et AR** des pages clés, avec `hreflang` (OPP). | Décision 👤 |
| 6.6 | **Outils gratuits** générateurs de leads, par exemple un testeur de dédoublonnage Pixel et API Conversions (OPP). | Décision 👤 |

### Actions d'Oualid hors code

| Quand | Action |
|---|---|
| Dès maintenant | Créer le compte **Bing Webmaster Tools** et importer le site depuis la Search Console (IDX-4). |
| Dès maintenant | Obtenir les premiers **avis Google** auprès des clients satisfaits (IDX-5, CONV-6) : lien direct envoyé sur WhatsApp. |
| Dès maintenant | Transmettre au développeur le **lien de partage de la fiche Google**. Il servira au `sameAs` et au `hasMap` des données structurées (SEO-5). |
| Après la phase 1 | Demandes d'indexation quotidiennes dans la Search Console jusqu'aux 32 pages. |
| Dans 3 à 4 semaines | Si les rapports DMARC sont propres, passer `_dmarc` à `v=DMARC1; p=quarantine; pct=100; rua=mailto:admin@obm-system.com; fo=1`, puis à `p=reject`. |
| Avant la phase 5 | Faire confirmer **par écrit** par chaque client les chiffres et citations publiés (CONT-1). |
| Avant la phase 6 | 🔎 Statut de la déclaration **CNDP** (loi 09-08) et contenu complet des mentions légales (LEG-1, LEG-3), avec un conseil juridique. |

### Décisions attendues d'Oualid

| # | Sujet | État |
|---|---|---|
| 1 | Crédit de pied de page (LEG-2) | Tranché : « Conçu et développé par OBM System » (paquet v7). |
| 2 | TRK-1 : tracking server-side sur le site d'OBM | Option B faite (phrase retirée de l'article). **Option A recommandée** : phase 3. |
| 3 | Direction visuelle (DES-2, DES-6) : version claire du logo, usage de l'orange, schémas maison | À trancher avant la phase 5. |
| 4 | À propos (DES-7) : photo, monogramme ou visuel d'environnement ; certifications à afficher (SEO-7) | À trancher. N'afficher que des certifications réellement obtenues, par exemple les certifications Anthropic d'octobre 2026, si Oualid le souhaite. |
| 5 | Consentement (TRK-4) : garder le mode avancé ou passer au mode basique pour les visiteurs de l'UE | À trancher avant la phase 3. |
| 6 | `priceRange` dans les données structurées (SEO-5) | À trancher. |
| 7 | Versions EN et AR (OPP) | À trancher pour la phase 6. |

---

## 3. Spécifications techniques

### 3.1 Gabarits du back-office (phase 2.1)

**Principe** : le paquet v7 contient la **sortie attendue** de chaque gabarit. La référence est le fichier `site/…/index.html` correspondant. Les écarts à reporter sont listés ci-dessous.

**Commun à toutes les pages générées** (articles, index du Journal, index des réalisations, études de cas, accueil) :

1. **`<head>`**
   - Supprimer le snippet GTM `GTM-TTPCSLV9` : le `<script>` du `<head>` et le `<noscript><iframe>` du `<body>`. Il revient en phase 3, **avec** ses balises.
   - Garder le bloc Consent Mode « refusé par défaut » et **un seul** `gtag.js` (bloc exact : `site/index.html` du paquet).
   - `og:locale` → `fr_FR` (garder `lang="fr-MA"`).
   - Ajouter `<link rel="alternate" type="application/rss+xml" title="Journal OBM System" href="https://obm-system.com/blog/feed.xml" />`.
   - Supprimer `<meta name="keywords" content="" />` quand il est vide.
   - CSS et JS appelés en `?v=7`, puis en noms hachés (phase 2.4).
2. **Données structurées**
   - Le nœud complet `ProfessionalService` (`@id: https://obm-system.com/#org`) doit figurer sur **chaque** page, pas seulement sur l'accueil.
   - `Person.sameAs` limité à `https://www.linkedin.com/in/oualidbenamara/`.
   - Pas de `"International"` dans `areaServed`.
   - `contactPoint` présent.
3. **En-tête et menus**
   - `alt=""` sur le logo (le lien porte déjà le nom).
   - Dans le menu mobile, ajouter « Appeler le +212 7 12 34 80 34 » (`tel:`) et « Écrire sur WhatsApp » (`data-loc="nav-mobile"`).
4. **Barre d'actions mobile** `<nav class="mbar">` (Diagnostic · WhatsApp · Appeler), insérée avant la bulle `.wa`.
5. **Pied de page**
   - « Conçu et développé par OBM System », en texte, sans lien externe.
   - Numéro de téléphone avec espaces insécables.
6. **Bandeau cookies** : `role="region"` au lieu de `role="dialog"`.
7. **Typographie française au rendu**, sur le texte uniquement, jamais dans les balises, attributs, `script`, `style` ni `code` (règles et script en annexe D, CONT-2) :
   - espace fine insécable avant `; ! ?` et à l'intérieur de `« »` ;
   - espace insécable avant `:` et avant le séparateur `·` ;
   - premier jour du mois écrit « 1er ».

**Articles** (`/blog/<article>/`)

- « En bref » : `<p class="tldr"><strong>En bref.</strong> …</p>`.
- Boîte auteur `<aside class="author" aria-label="Auteur">` en fin d'article. Texte exact : voir le paquet.
- Le bloc Sources est rendu en `<section class="sources" aria-label="Sources">` quand le contenu en contient un.
- `og:image:type` (`image/jpeg`) et `og:image:alt` (« titre de l'article · Journal OBM System ») quand le champ `image` est rempli.
- Date visible « 1er novembre 2026 », et « Mis à jour le … » quand `dateModified` est différent de `datePublished`.

**Index du Journal** (`/blog/`)

- H1 « Journal : mesure, publicité, référencement et sites web ».
- `<h2 class="sr-only">Tous les articles</h2>` avant la grille.
- `data-stagger` sur `.posts`.

**Index des réalisations** (`/cas-clients/`)

- H1 « Réalisations : l'anatomie de nos projets ».
- `srcset` 600, 900 et 1 200 px sur les captures desktop, avec `sizes="(max-width: 900px) 92vw, 380px"`.
- Éléganza : « près de 4 000 produits ». La version en ligne affiche encore « plus de 10 000 », contredit par le site du client.

**Études de cas** (`/cas-clients/<cas>/`)

- `og:image` et `twitter:image` → `/assets/img/og/og-<cas>.jpg` (1 200 × 630). Ne plus utiliser `*-desktop.webp`.
- JSON-LD `Article` : `image` en 1 200 × 630 et `dateModified`.
- Descriptions : celles du paquet.
- `srcset` sur la capture desktop.
- `height="1125"` sur les captures mobiles.
- Blocs faits à la main à reproduire : voir 3.3.

**Accueil** (`/`)

- H1 `<span>Ingénierie et précision.</span> <span>L’exécution chirurgicale des ventes.</span>`.
- Supprimer le `<link rel="preload" as="image">` et le `fetchpriority="high"` de la capture Pharmacie : le LCP est du texte.
- `loading="lazy"` sur les captures 3 à 5 de la bande du hero.
- `data-stagger` sur `.layers`, `.proofs` et `.posts`.

**Acceptation** : après avoir réenregistré chaque type de page sans modification, le test suivant ne montre aucune différence, hormis la date de mise à jour.

```bash
cd obm-system-v7
for u in blog/ga4-6-reglages/ blog/ cas-clients/ ''; do
  diff <(curl -s "https://obm-system.com/$u" | sed 's/></>\n</g') <(sed 's/></>\n</g' "site/${u}index.html") >/dev/null \
    && echo "OK  /$u" || echo "DIFF /$u"
done
```

### 3.2 Générateur du sitemap (phase 2.2)

| Type d'URL | `lastmod` |
|---|---|
| Article | `dateModified` de l'article (sinon `datePublished`) |
| Étude de cas | `dateModified` du cas |
| `/blog/`, `/cas-clients/` | Le plus récent des `lastmod` de leurs éléments |
| Accueil | Le plus récent entre la date du fichier et le dernier article publié |
| Autres pages | Date de modification réelle du fichier HTML (ou date du dernier commit) |

- Ne lister que des URL canoniques qui répondent 200. Jamais `/admin`, `/404.html` ni les anciens cas dentaires.
- `changefreq` et `priority` sont ignorés par Google : les retirer pour alléger.
- Ajouter `<image:image>` avec l'image de partage de chaque article et de chaque cas.
- Après chaque génération, notifier IndexNow **avec les seules URL modifiées** (clé `e48c30133e89edf66822bbebc5640e7b`, fichier à la racine).

### 3.3 Gabarit « étude de cas » (phases 2.3 et 5.3)

**Problème** : les cartes « décisions de conception » de Cerafas, La7daFan et Nassihacom, les puces de leviers, le tableau Secteur / Lieu / Site et la maquette mobile existent **uniquement** dans le HTML statique. Le contenu du back-office de Cerafas fait 319 caractères. Un enregistrement les efface.

**Modèle de données à ajouter au back-office** :

```json
{
  "sector": "Plateforme logistique",
  "location": "Maroc · Afrique · Europe",
  "site": { "url": "https://cerafas.ma", "label": "cerafas.ma" },
  "levers": [ { "label": "Création de sites sur mesure", "href": "/services/creation-site-web/" } ],
  "lead": "Une plateforme qui relie chargeurs et transporteurs vérifiés…",
  "captures": { "desktop": "/assets/img/realisations/cerafas-desktop.webp", "mobile": "/assets/img/realisations/cerafas-mobile.webp" },
  "decisions": [ { "n": "01", "label": "Confiance", "title": "…", "text": "…", "spec": ["RC · Licence · Assurance : 3/3"] } ],
  "results": [ { "value": "…", "label": "…", "source": "…", "verified": false } ],
  "quote": { "text": "…", "author": "…", "role": "…", "approved": false },
  "related": { "article": "/blog/…/", "service": "/services/…/" },
  "prev": "/cas-clients/…/", "next": "/cas-clients/…/"
}
```

- Un résultat ou une citation ne s'affiche que si `verified` ou `approved` vaut `true`, ce qui suppose l'accord écrit du client (règle n° 1).
- **Migration** : recopier dans ces champs le contenu actuel des 5 pages (source : `site/cas-clients/<cas>/index.html` du paquet).
- **Phase 5.3, gabarit unique pour les 5 cas** :
  - en-tête (secteur, lieu, site, leviers) ;
  - capture **annotée**, avec repères numérotés reliés aux décisions ;
  - décisions en grille 2 × 2 à côté de la capture sur desktop ;
  - Résultats, sinon « Ce que le client peut faire seul aujourd'hui » ;
  - citation, leviers, puis cas précédent et suivant.
- Le corps est aligné sur la grille de l'en-tête (`.wrap`). Captures refaites sur des états intemporels, sans promotion datée (Éléganza, Pharmacie).

### 3.4 Mesure server-side sur obm-system.com (phase 3)

**Architecture cible**

```
Navigateur ──► obm-system.com (nginx)
   │  GTM web (consent mode v2)        ├─► /           site statique
   │  Pixel Meta (eventID)             ├─► /api/lead   proxy LeadFlow (clé côté serveur)
   └─ hits GA4 ─► /metrics/ ───────────┴─► 127.0.0.1:8080  conteneur GTM serveur (Docker)
                                                   ├─► GA4
                                                   └─► Meta API Conversions (event_id partagé)
LeadFlow (CRM) ──────────────────────────────────────► Meta API Conversions (étapes du lead, event_source=crm)
```

Le serveur de mesure tourne **sur la même machine et la même IP** que le site. C'est la condition expliquée dans l'article Safari ITP : les cookies posés par `/metrics/` sont alors de première partie et durables.

**Conteneur serveur**

```bash
docker run -d --name sgtm --restart unless-stopped -p 127.0.0.1:8080:8080 \
  -e CONTAINER_CONFIG='<configuration copiée depuis GTM serveur>' \
  gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable
# Prévisualisation : seconde instance avec -e RUN_AS_PREVIEW_SERVER=true, exposée sur un sous-domaine dédié
#   et déclarée dans PREVIEW_SERVER_URL de l'instance principale.
# Maintenance mensuelle : docker pull gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable && docker restart sgtm
```

```nginx
location /metrics/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**GTM web**

- Balise Google `G-JGDV0VS9B9` avec `server_container_url = https://obm-system.com/metrics`.
- Supprimer alors le `gtag.js` codé en dur dans les gabarits. Garder le bloc Consent Mode, placé **avant** le snippet GTM.

**Plan de marquage**

| Événement (`dataLayer`) | Déclencheur | GA4 | Meta (Pixel + API Conversions) | Paramètres |
|---|---|---|---|---|
| `page_view` | chaque page | `page_view` | `PageView` | `page_type` |
| `whatsapp_click` | clic `wa.me` | événement clé | `Contact` | `location`, `cta_label`, `page_type` |
| `phone_click` | clic `tel:` | événement clé | `Contact` | idem |
| `booking_click` | clic vers le diagnostic ou Calendly | événement | — | idem |
| `booking_view` | widget Calendly affiché | événement | — | `tool` |
| `booking_completed` | `calendly.event_scheduled` | événement clé | `Schedule` | `tool`, `offer` |
| `form_submitted` | envoi du formulaire confirmé | événement clé | `Lead` | `form_source`, `besoin`, `demarrage` |
| `case_click` | clic sur une carte de cas | événement | — | `case` |

**Consentement**

- Balises GA4 soumises à `analytics_storage`.
- Pixel et API Conversions soumis à `ad_storage` et `ad_user_data`.
- Mode avancé ou basique : décision n° 5.

**Dédoublonnage et correspondance**

- Le même `event_id` est envoyé au Pixel (`eventID`) et au serveur (paramètre `event_id` du hit GA4, repris par la balise API Conversions).
- Pour `form_submitted`, l'e-mail et le téléphone sont normalisés puis transmis au conteneur serveur, qui les hache en SHA-256, uniquement si `ad_user_data` est accordé.
- `fbp` et `fbc` sont lus ou posés par le conteneur serveur.
- Jeton API Conversions stocké **uniquement** dans GTM serveur.

**`site.js`** : remplacer `track()` par :

```js
function track(name, params) {
  const p = Object.assign({ page_type: PAGE_TYPE, event_id: crypto.randomUUID() }, params || {});
  try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, p)); } catch (e) {}
}
```

**CSP de la phase 3**

- Ajouter `https://connect.facebook.net` à `script-src`.
- Ajouter `https://www.facebook.com` à `img-src` et à `connect-src`.
- `connect-src 'self'` couvre déjà `/metrics/`.

**Remontée CRM (3.7)**

- LeadFlow envoie à l'API Conversions les étapes `Lead`, puis « qualifié » et « client » (événements personnalisés de l'intégration CRM de Meta), avec `event_source = crm` et l'identifiant du lead Meta quand il existe.
- Documentation : `developers.facebook.com/documentation/ads-commerce/conversions-api/conversion-leads-integration`.

**Acceptation**

- `curl -s -o /dev/null -w "%{http_code}" https://obm-system.com/metrics/healthz` → `200`.
- Onglet Réseau : hits vers `obm-system.com/metrics/g/collect`, plus aucun vers `google-analytics.com` depuis le navigateur. Cookie `FPID` posé par une réponse HTTP (`Set-Cookie`).
- GA4 DebugView : un seul événement par action, les 4 événements clés reçus.
- Gestionnaire d'événements Meta : « Navigateur et serveur » sur `PageView`, `Contact`, `Lead` et `Schedule`, dédoublonnage > 90 %.
- Page Confidentialité à jour.

### 3.5 Performance (phase 4)

| Action | Détail | Gain attendu |
|---|---|---|
| AVIF | Générer `*.avif` (qualité 50 à 60) à côté des `*.webp`, servis via `<picture>` | −20 à −30 % sur les captures |
| Polices | `ui-monospace` à la place de JetBrains Mono. Sous-ensemble latin et latin-1 de Switzer (🔎 vérifier que la licence de Switzer l'autorise). Repli avec `size-adjust` et `ascent-override` | −1 requête, aucun décalage |
| CSS | Minification et purge des règles mortes ; garder les classes ajoutées par JS (`is-in`, `is-open`, `data-loading`…) | 33 Ko → moins de 20 Ko |
| Calendly à la demande | Bouton « Afficher les créneaux » qui injecte `widget.js` et l'iframe au clic. Lien direct de secours gardé | −3 Mo au chargement, aucun cookie tiers avant le clic |
| Vidéo `/site-reseaux/` | `preload="none"` et affiche (`poster`) en AVIF | Poids initial réduit |

**Acceptation** : PageSpeed Insights mobile ≥ 90 sur `/` et les 7 pages services, LCP < 2,5 s, TBT < 200 ms, CLS < 0,1.

### 3.6 Serveur (phases 1 et 4)

- **Certificat TLS** : il expire le 08/12/2026 (Let's Encrypt). Vérifier le renouvellement automatique avec `systemctl list-timers | grep -i certbot` et `certbot renew --dry-run`.
- **HTTP/3** (nginx ≥ 1.25 compilé avec QUIC) : `listen 443 quic reuseport;` et `add_header Alt-Svc 'h3=":443"; ma=86400' always;`. Ouvrir l'UDP 443 dans le pare-feu Hetzner.
- **IPv6** :
  - vérifier l'adresse avec `ip -6 addr show scope global` ;
  - ajouter `listen [::]:443 ssl;` et `listen [::]:80;` ;
  - créer l'enregistrement **AAAA** chez Genious pour `@` et `www`.
- **HSTS** : ajouter `includeSubDomains` seulement si tous les sous-domaines sont en HTTPS.
- **Fichiers cachés** : vérifier qu'aucun dossier `.git` n'est présent dans la racine web. `/.git/HEAD` et `/.env` répondent déjà 403.
- **`security.txt`** : renouveler avant le 29/10/2027.
- **TTFB** : 🔎 mesurer depuis le Maroc (WebPageTest). Au-delà de 400 ms, mettre un CDN avec un point de présence proche. Le cache des fichiers statiques et `/assets/uploads/` doit rester cohérent.

### 3.7 Chaîne de build (phase 2.4)

À exécuter **à chaque enregistrement dans le back-office et à chaque déploiement** :

1. Génération des pages (gabarits 3.1).
2. Typographie française (script en annexe D, CONT-2).
3. Minification CSS et JS (`lightningcss`, `esbuild`), noms hachés (`site.3f9a1c.css`) et réécriture des références. Supprimer les `?v=`.
4. `sitemap.xml` (3.2) et `blog/feed.xml`.
5. Contrôles bloquants :
   - `html-validate` ;
   - `grep -ri apikey` sur les fichiers servis (résultat attendu : 0) ;
   - liens internes en 200 ;
   - JSON-LD valide.
6. IndexNow pour les URL modifiées.

---

## 4. Recette finale

**Commandes**

```bash
cd obm-system-v7
python3 serveur/verifier-en-ligne.py              # 54 contrôles : attendu 54/54 OK
curl -s https://obm-system.com/assets/js/site.js | grep -ci apikey                                   # 0
curl -s -o /dev/null -w "%{http_code}\n" https://obm-system.com/cas-clients/cabinet-facettes-rabat/  # 410
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://obm-system.com/services/index.html  # 301 https://obm-system.com/services/
curl -sI https://obm-system.com/ | grep -ci '^cache-control'                                         # 1
curl -sI https://obm-system.com/llms.txt | grep -i 'charset=utf-8'                                   # présent
curl -s -o /dev/null -w "%{http_code}\n" https://obm-system.com/metrics/healthz                      # 200 (phase 3)
```

**Contrôles manuels**

- [ ] Formulaire `/contact/` : `+212 6 12 34 56 78` accepté, lead reçu dans LeadFlow, accents intacts, besoin « Non précisé » par défaut.
- [ ] iPhone réel :
  - bandeau cookies compact ;
  - CTA du hero visible ;
  - barre d'actions ;
  - Calendly avec indicateur de chargement, puis créneaux visibles.
- [ ] GA4 DebugView : un `page_view` par page, un événement par clic.
- [ ] Meta Events Manager (phase 3) : navigateur et serveur, dédoublonnés.
- [ ] E-mail de `admin@` vers Gmail : SPF, DKIM et DMARC en PASS.
- [ ] Search Console : 3 semaines après la phase 1, au moins 28 pages indexées et plus aucun extrait « dentaire ».
- [ ] Bing Webmaster Tools : sitemap traité, pages visibles avec `site:obm-system.com`.
- [ ] Partage d'un article dans le Post Inspector de LinkedIn : image propre à l'article.
- [ ] PageSpeed mobile ≥ 90 (phase 4). axe-core sans violation.

## 5. Ce qu'il ne faut pas casser

- Redirections 301 `http → https`, `www → apex` et ajout de la barre oblique finale. Vraie 404 en `noindex`.
- Brotli ; fichiers statiques en `immutable` (changer le hash à chaque modification).
- `canonical` sur toutes les pages, `robots.txt` qui autorise les robots IA, `llms.txt`, `security.txt`, propriété Search Console de type domaine (TXT `google-site-verification` à conserver chez Genious).
- Consent Mode v2 « refusé par défaut » **avant** tout script Google ou Meta. Boutons Refuser et Accepter à égalité.
- Jamais de conteneur GTM publié sans balises (cause de TRK-2).
- Aucun défilement horizontal à 390 px, CLS de 0, `width`, `height` et `alt` sur toutes les images, `:focus-visible`, lien d'évitement.
- `/assets/uploads/` (médiathèque du back-office) intact à chaque déploiement.
- Enregistrements DNS e-mail (SPF, DKIM `google._domainkey`, DMARC) et MX Google Workspace.

---

## Annexe A · Configuration nginx (`serveur/nginx-obm-system.conf`)

```nginx
# ============================================================
# obm-system.com : directives à ajouter (version 7, 02/11/2026)
# À fusionner dans la configuration nginx existante, puis : nginx -t && systemctl reload nginx
# ============================================================

# --- bloc http {} -------------------------------------------
limit_req_zone $binary_remote_addr zone=leads:10m rate=6r/m;

# --- bloc server {} de obm-system.com ------------------------

# 1. Encodage des fichiers texte (llms.txt, robots.txt, humans.txt, flux RSS, manifest)
charset utf-8;
charset_types text/plain text/xml text/css application/javascript application/manifest+json application/rss+xml;

# 2. Cache : supprimer la directive « expires » partout où « add_header Cache-Control » est déjà défini
#    (sinon l'en-tête Cache-Control est envoyé deux fois)

# 3. URL en double : /index.html et doubles barres obliques -> URL propre
if ($request_uri ~ "^(.*/)index\.html(\?.*)?$") { return 301 $1$2; }
if ($request_uri ~ "^([^?]*?)//+(.*)$") { return 301 $1/$2; }

# 4. Anciennes études de cas dentaires : retirées définitivement (remplace les 301 actuelles vers /cas-clients/)
location ~ ^/cas-clients/cabinet-(facettes-rabat|implants-casablanca)/?$ { return 410; }
error_page 410 /404.html;

# 5. Formulaires : la clé LeadFlow reste côté serveur (le navigateur appelle /api/lead)
location = /api/lead {
    limit_except POST { deny all; }
    limit_req zone=leads burst=3 nodelay;
    if ($http_origin !~* ^https://obm-system\.com$) { return 403; }
    include /etc/nginx/secrets/leadflow.conf;   # contient une seule ligne : set $leadflow_key "NOUVELLE_CLE_LEADFLOW";
    proxy_set_header x-api-key $leadflow_key;
    proxy_set_header Host leadflow-production-d68a.up.railway.app;
    proxy_ssl_server_name on;
    proxy_pass https://leadflow-production-d68a.up.railway.app/web-leads;
}

# 6. Sécurité : la CSP passe en mode bloquant (GTM retiré, formulaires via /api/lead)
#    Remplacer l'en-tête Content-Security-Policy-Report-Only actuel par la ligne ci-dessous.
#    Prudence : la garder 48 h en « Content-Security-Policy-Report-Only » après la mise en ligne,
#    tester l'accueil, /contact/ (envoi) et /diagnostic-de-croissance/ (Calendly) sans erreur CSP
#    dans la console, puis passer en « Content-Security-Policy ».
#    Rappel nginx : un add_header placé dans un bloc location annule ceux du bloc server pour ce location.
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://assets.calendly.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://formsubmit.co; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://assets.calendly.com; font-src 'self'; frame-src https://calendly.com; form-action 'self' https://formsubmit.co; frame-ancestors 'self'; base-uri 'self'; object-src 'none'" always;
```

## Annexe B · Scripts du paquet

**`serveur/deployer-v7.sh`** : mise en ligne des fichiers en une commande.

```sh
#!/bin/sh
# ============================================================
# obm-system.com : mise en ligne de la version 7 (fichiers du site uniquement)
# Usage :  sudo sh serveur/deployer-v7.sh /chemin/de/la/racine/web
# Exemple : sudo sh serveur/deployer-v7.sh /var/www/obm-system.com
#
# Ce que fait le script :
#   1. sauvegarde complète de la racine actuelle dans /root/obm-backups/ ;
#   2. copie du dossier site/ par-dessus, SANS rien supprimer (pas de --delete) ;
#      /assets/uploads/ (médiathèque du back-office) n'est jamais touché ;
#      les nouveaux fichiers prennent le propriétaire de l'index.html actuel ;
#   3. contrôles HTTP de base, puis notification IndexNow.
# Il ne modifie PAS nginx : voir serveur/nginx-obm-system.conf et 00-CAHIER-DEVELOPPEUR-FINAL.md (phase 1).
# Retour arrière : la commande exacte est affichée à la fin.
# ============================================================
set -eu

ROOT="${1:-}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$HERE/site"

if [ -z "$ROOT" ]; then
  echo "Indiquez la racine web du site. Piste :"
  nginx -T 2>/dev/null | grep -E '^\s*(server_name|root) ' | grep -A1 'obm-system' | head -4 || true
  exit 1
fi
[ "$(id -u)" -eq 0 ] || { echo "À lancer avec sudo."; exit 1; }
[ -f "$ROOT/index.html" ] || { echo "Pas d'index.html dans $ROOT : mauvaise racine ?"; exit 1; }
[ -f "$SRC/index.html" ] || { echo "Dossier site/ introuvable à côté de serveur/."; exit 1; }
command -v rsync >/dev/null || { echo "rsync manquant : apt-get install -y rsync"; exit 1; }

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="/root/obm-backups/obm-system-avant-v7-$STAMP.tgz"
OWNER="$(stat -c %u:%g "$ROOT/index.html")"

echo "1/3 Sauvegarde de $ROOT -> $BACKUP"
mkdir -p /root/obm-backups
tar -czf "$BACKUP" -C "$ROOT" .

echo "2/3 Copie de la version 7 (propriétaire $OWNER, sans suppression, uploads exclus)"
rsync -a --chown="$OWNER" --exclude 'assets/uploads/' "$SRC/" "$ROOT/"

echo "3/3 Contrôles"
fail=0
check() { # url code_attendu
  code="$(curl -s -o /dev/null -w '%{http_code}' "$1")"
  if [ "$code" = "$2" ]; then echo "  OK  $code  $1"; else echo "  !!  $code (attendu $2)  $1"; fail=1; fi
}
check "https://obm-system.com/" 200
check "https://obm-system.com/services/seo-aeo/" 200
check "https://obm-system.com/diagnostic-de-croissance/" 200
check "https://obm-system.com/blog/feed.xml" 200
check "https://obm-system.com/e48c30133e89edf66822bbebc5640e7b.txt" 200
check "https://obm-system.com/assets/uploads/og-ga4-6-reglages-mvzabpln.jpg" 200
if curl -s "https://obm-system.com/" | grep -q 'site.css?v=7'; then echo "  OK  version 7 servie"; else echo "  !!  la page d'accueil ne sert pas encore la v7 (cache ?)"; fail=1; fi
if curl -s "https://obm-system.com/assets/js/site.js?v=7" | grep -qi 'apikey'; then echo "  !!  une clé API est encore présente dans site.js"; fail=1; else echo "  OK  aucune clé API dans site.js"; fi

if [ "$fail" -eq 0 ]; then
  sh "$HERE/serveur/indexnow.sh" || true
fi

echo
echo "Retour arrière si besoin :  tar -xzf $BACKUP -C $ROOT"
[ "$fail" -eq 0 ] && echo "Mise en ligne terminée." || { echo "Contrôles en échec : vérifier avant de continuer."; exit 2; }
```

**`serveur/indexnow.sh`** : notification de Bing et des autres moteurs (déjà appelé par `deployer-v7.sh`).

```sh
#!/bin/sh
# Notifie Bing, Yandex, Seznam et Naver de toutes les URL du sitemap (à lancer après chaque mise en ligne)
KEY=e48c30133e89edf66822bbebc5640e7b
curl -s https://obm-system.com/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' | grep -v '\.png$' \
 | python3 -c "import sys,json; u=[l.strip() for l in sys.stdin]; print(json.dumps({'host':'obm-system.com','key':'$KEY','keyLocation':'https://obm-system.com/$KEY.txt','urlList':u}))" \
 | curl -s -o /dev/null -w "IndexNow : %{http_code}\n" -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json; charset=utf-8' -d @-
```

**`serveur/verifier-en-ligne.py`** : 54 contrôles du site en ligne par rapport au paquet. Il couvre :
- les pages ;
- les fichiers annexes ;
- l'absence de clé API ;
- les images de partage ;
- les 410 ;
- les en-têtes ;
- la CSP ;
- le proxy `/api/lead` ;
- les DNS e-mail.

Lancement : `python3 serveur/verifier-en-ligne.py` depuis `obm-system-v7/`.

## Annexe C · DNS et e-mail (`dns/enregistrements-dns.txt`)

```text
obm-system.com : authentification des e-mails (zone DNS hébergée chez Genious)
==============================================================================
État au 2 novembre 2026. Zone : clients.genious.net > Domaines > obm-system.com > Gestion DNS > Manage TXT Records.

1. SPF (autorise Google Workspace à envoyer pour le domaine) ............ FAIT le 02/11/2026
   Hôte : @ (obm-system.com)      Type : TXT
   Valeur : v=spf1 include:_spf.google.com ~all
   Si un autre outil envoie un jour des e-mails « de » @obm-system.com (CRM, outil d'e-mailing),
   ajouter son include ici, sans jamais créer un second enregistrement v=spf1.

2. DKIM (signature des e-mails) ......................................... FAIT le 02/11/2026
   Hôte : google._domainkey      Type : TXT      Valeur : clé publique 2048 bits générée dans Google Admin
   L'ancien TXT « v=DKIM1;k=rsa;p=... » publié par erreur sur @ est à supprimer (il ne sert à rien à cet endroit).
   Dernière étape : Google Admin > Applications > Google Workspace > Gmail > Authentifier les e-mails
   > « Démarrer l'authentification » (une fois l'enregistrement visible dans le DNS public).

3. DMARC (politique et rapports) ........................................ FAIT le 02/11/2026
   Hôte : _dmarc      Type : TXT
   Valeur : v=DMARC1; p=none; rua=mailto:admin@obm-system.com; fo=1
   - p=none : observation, aucun e-mail bloqué. Les rapports XML quotidiens arrivent sur admin@.
   - Après 3 à 4 semaines de rapports propres (100 % des envois légitimes alignés) :
     v=DMARC1; p=quarantine; pct=100; rua=mailto:admin@obm-system.com; fo=1
     puis p=reject.
   - Alignement laissé en mode « relaxed » (par défaut) : plus tolérant si un outil tiers envoie
     depuis un sous-domaine.

4. CAA (facultatif) : l'interface Genious ne propose pas ce type d'enregistrement. À demander au
   support Genious si souhaité : obm-system.com  CAA  0 issue "letsencrypt.org"

5. Ne pas toucher : A (@ et www → 89.167.92.61), MX Google Workspace, NS, TXT google-site-verification
   (validation Search Console).

Contrôle :
- https://dns.google/query?name=google._domainkey.obm-system.com&rr_type=TXT (idem pour obm-system.com et _dmarc.obm-system.com)
- Envoyer un e-mail de admin@obm-system.com vers une adresse Gmail > « Afficher l'original » :
  SPF, DKIM et DMARC doivent être PASS.
```

## Annexe D · Audit détaillé d'origine (référence)

> Ces fiches décrivent les **constats d'origine**, avec leurs preuves, leurs correctifs et leurs critères d'acceptation. Leur champ « Statut » indique la fiabilité du constat (VÉRIFIÉ, À VÉRIFIER, DÉCISION), **pas** l'avancement. L'avancement fait foi dans les parties 1 et 2.
> Note sur TRK-2 : la v7 a choisi de **retirer** le conteneur GTM vide et de garder GA4 en direct, plutôt que de publier des balises dans GTM. La mesure complète par GTM web et serveur est l'objet de la phase 3 (3.4).

### D.A · Indexation et visibilité

#### IDX-1 · Les anciennes pages dentaires sont toujours indexées et affichées par Google

- **Statut** : VÉRIFIÉ · **Priorité** : P0 · **Effort** : S
- **Preuves** :
  - Search Console, rapport « Pages indexées » du 23/10/2026 : **6 pages indexées**, dont 3 anciennes :
    - `/cas-clients/cabinet-implants-casablanca/` (exploré le 21/10)
    - `/cas-clients/cabinet-facettes-rabat/` (14/10)
    - `/blog/whatsapp-automation-cabinets-dentaires/` (15/10)
  - Une 4e page est connue, en « Détectée, actuellement non indexée » : `/blog/meta-ads-cabinets-dentaires-erreurs/`.
  - Google affiche ces pages le 02/11 avec leurs anciens titres : « Cabinet esthétique à Rabat — ROAS Meta ×6,2 | OBM SYSTEM », « Cabinet d'implantologie à Casablanca — +247 % de leads », « WhatsApp automation pour cabinets dentaires ».
  - Réponses actuelles du serveur :

| Ancienne URL | Réponse actuelle | Problème |
|---|---|---|
| `/cas-clients/cabinet-facettes-rabat/` | 301 vers `/cas-clients/` | Redirection vers une page non équivalente : Google la traite comme une soft 404 et peut garder l'ancien extrait longtemps |
| `/cas-clients/cabinet-implants-casablanca/` | 301 vers `/cas-clients/` | Idem |
| `/blog/whatsapp-automation-cabinets-dentaires/` | 301 vers `/blog/relances-whatsapp-guide/` | Correct (contenu équivalent) |
| `/blog/meta-ads-cabinets-dentaires-erreurs/` | 301 vers `/blog/erreurs-meta-ads/` | Correct |

- **Impact** : un prospect qui cherche « OBM System » tombe sur des études de cas dentaires chiffrées (ROAS ×6,2, +247 %) qui contredisent le positionnement actuel et la règle « un chiffre uniquement s'il est vérifié ».
- **Correctif** :
  1. Remplacer les deux redirections des anciens cas par un **410 Gone**, qui accélère la sortie de l'index :

```nginx
# retirer d'abord les règles 301 existantes pour ces deux URL
location ~ ^/cas-clients/cabinet-(facettes-rabat|implants-casablanca)/?$ {
    return 410;
}
error_page 410 /404.html;   # page « n'existe plus » en noindex, déjà existante
```

  2. Garder les deux 301 d'articles, qui sont légitimes.
  3. Dans Search Console, ouvrir **Suppressions**, puis « Nouvelle demande » et « Supprimer cette URL uniquement » pour les deux anciens cas. La suppression est temporaire (environ 6 mois) ; le 410 rend la sortie définitive entre-temps.
  4. Dans Search Console, ouvrir **Inspection de l'URL** pour `/blog/relances-whatsapp-guide/` et `/blog/erreurs-meta-ads/`, puis « Demander une indexation », afin que Google traite les redirections.
- **Acceptation** : `curl -I` sur les deux anciens cas renvoie `410`. Sous 2 à 4 semaines, `site:obm-system.com dentaire` ne renvoie plus rien.

#### IDX-2 · Google affiche les anciens titres et descriptions

- **Statut** : VÉRIFIÉ · **Priorité** : P0 · **Effort** : S
- **Preuves** (`site:obm-system.com`, 02/11) :

| URL | Ce que Google affiche | Ce que dit le site aujourd'hui |
|---|---|---|
| `/` | « OBM System \| Agence digitale à Rabat : sites web, publicité… » | « OBM System · Croissance digitale à Rabat, Maroc » (« agence digitale » est un descripteur rejeté) |
| `/blog/` | « Journal — Articles sur l'acquisition de patients dentaires » (15 mai 2026) | « Journal : analyses mesure, acquisition, SEO » |
| `/cas-clients/` | « Cas clients — Cabinets dentaires transformés… Études de cas anonymisées de cabinets dentaires marocains » | « Réalisations : anatomie d'un système » |
| `/methode/` | « Appel de cadrage, proposition écrite… » | Diagnostic de croissance… |
| `/contact/` | « Contact : parlons de votre projet… Instagram@obm_system » | « Contact · OBM System, Rabat » |

- **Cause** : les dernières explorations Google datent du 13/09 au 21/10, avant la refonte du 29/10 au 01/11. Google n'a pas revu ces pages.
- **Correctif** (action dans Search Console, à faire par Oualid ou par quelqu'un qui a l'accès) : **Inspection de l'URL**, puis « Demander une indexation », dans cet ordre de priorité (le quota est d'environ 10 demandes par jour, donc à étaler sur 3 à 4 jours) :
  1. `/`, `/cas-clients/`, `/blog/`, `/diagnostic-de-croissance/`, `/services/`
  2. Les 7 pages services, `/site-reseaux/`, `/a-propos/`, `/methode/`, `/contact/`
  3. Les 5 études de cas, puis les 9 articles
- **Acceptation** : sous 7 à 14 jours, plus aucun extrait « dentaire » ni « agence digitale » dans `site:obm-system.com`.
- **Avancement au 02/11/2026** : **11 demandes d'indexation faites**, puis le quota du jour a été atteint (message « Quota dépassé »). Pages traitées : `/`, `/cas-clients/`, `/blog/`, `/diagnostic-de-croissance/`, `/services/`, et `/services/` `creation-site-web/`, `e-commerce/`, `publicite-meta-google-ads/`, `tracking-server-side/`, `seo-aeo/`, `reseaux-sociaux/`.
  - L'inspection confirme que **Google ne connaissait même pas** `/diagnostic-de-croissance/` ni les 6 pages services : « Google ne reconnaît pas cette URL », « Aucun sitemap référent détecté ».
  - **Reste à faire, à partir du 03/11** :
    1. `/services/ia-automatisation/`, `/blog/relances-whatsapp-guide/`, `/blog/erreurs-meta-ads/`, `/site-reseaux/`, `/a-propos/`, `/methode/`, `/contact/`
    2. Les 5 études de cas
    3. Les 7 autres articles

#### IDX-3 · Couverture : 6 pages indexées sur 32, sitemap lu avec seulement 17 URL

- **Statut** : VÉRIFIÉ · **Priorité** : P0 · **Effort** : S
- **Preuves** :
  - Rapport Sitemaps : `sitemap.xml` envoyé le **18 mai 2026**, dernière lecture le **30/10/2026**, **17 pages découvertes**. Le sitemap actuel en contient 32.
  - Requêtes `site:` du 02/11, une par URL : **aucune des 7 pages services** n'apparaît (seul `/services/` est indexé). `/diagnostic-de-croissance/`, `/a-propos/` et `/cas-clients/cerafas-logistics/` renvoient aussi 0 résultat.
  - Core Web Vitals : « Aucune donnée » (trafic insuffisant). Seule amélioration reconnue : « Fils d'Ariane », 3 pages valides.
- **Correctif** :
  1. Search Console, rubrique Sitemaps : **renvoyer** `https://obm-system.com/sitemap.xml`. Ça déclenche une nouvelle lecture.
  2. Mettre dans le sitemap des `lastmod` **réels par page** (voir IDX-9), pour que Google repère ce qui a changé.
  3. Faire les demandes d'indexation de IDX-2.
  4. Renforcer les liens internes vers les pages services et le diagnostic (voir IDX-6) : une page profonde mais isolée est explorée lentement.
  5. Faire un suivi hebdomadaire du rapport « Pages », en notant chaque lundi le nombre de pages indexées et les motifs d'exclusion.
- **Acceptation** : sous 3 à 4 semaines, au moins 28 URL sur 32 indexées (les mentions légales et la confidentialité peuvent rester hors index), dont les 7 pages services et le diagnostic.

#### IDX-4 · Le site est absent de Bing, donc de ChatGPT Search, de Copilot et de DuckDuckGo

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Preuves** : `site:obm-system.com` et `"obm-system.com"` sur Bing (02/11) ne renvoient **aucun résultat du site**, seulement des résultats sans rapport.
- **Impact** : l'index de Bing alimente ChatGPT Search, Copilot, DuckDuckGo, Yahoo et Ecosia. OBM vend de l'**AEO** (visibilité dans les moteurs IA) alors que son propre site n'y est pas.
- **Correctif** :
  1. Bing Webmaster Tools, « Importer depuis Google Search Console » (compte Microsoft d'Oualid). Le domaine est validé automatiquement et le sitemap repris.
  2. Activer **IndexNow**, qui notifie Bing, Yandex, Seznam et Naver à chaque mise en ligne :

```bash
# 1. générer une clé et la publier à la racine
KEY=$(openssl rand -hex 16); echo -n "$KEY" > /var/www/obm-system.com/$KEY.txt
# 2. après chaque déploiement : notifier toutes les URL du sitemap
curl -s https://obm-system.com/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' | grep -v '\.png$' \
 | python3 -c "import sys,json; u=[l.strip() for l in sys.stdin]; print(json.dumps({'host':'obm-system.com','key':'$KEY','keyLocation':'https://obm-system.com/$KEY.txt','urlList':u}))" \
 | curl -s -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json; charset=utf-8' -d @-
```

- **Acceptation** : Bing Webmaster Tools affiche le sitemap traité, et `site:obm-system.com` sur Bing renvoie les pages du site.

#### IDX-5 · Entité de marque faible : collision avec « OBM Centre », fiche Google sans avis

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : M
- **Preuves** :
  - Search Console : la requête « obm system » est en **position moyenne 2,6** (83 impressions, 11 clics). Les requêtes « obm », « obm services », « obm solutions » ramènent d'autres entreprises.
  - La recherche Google « OBM System Rabat agence » affiche le **panneau de connaissance d'« OBM Centre »**, un centre d'appels de Rabat (note 3,4, 20 avis). OBM System n'a pas de panneau.
  - La fiche Google Maps « OBM System » existe : catégorie « Agence de marketing », **aucun avis**, pas d'adresse affichée (zone desservie), fermeture à 17 h, liens vers obm-system.com et Calendly.
  - Le site n'annonce aucun horaire et le JSON-LD ne relie pas la fiche Google.
- **Correctif** :
  1. **Avis** : demander un avis Google à chaque client livré (Pharmacie, Cerafas, Nassihacom, La7daFan, Éléganza), avec le lien direct de la fiche. C'est le levier n° 1 du panneau de marque et du pack local.
  2. **JSON-LD** (voir SEO-5) : ajouter dans `sameAs` l'URL de la fiche (bouton « Partager » de Maps, de la forme `https://maps.app.goo.gl/…` ou `https://www.google.com/maps?cid=…`, **À VÉRIFIER**), `hasMap`, et `openingHoursSpecification` aligné sur la fiche (lundi au vendredi, fermeture à 17 h, **À VÉRIFIER**).
  3. **Lien du site sur la fiche** : utiliser `https://obm-system.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp` pour mesurer le trafic venu de la fiche (la balise `canonical` neutralise le paramètre pour le SEO).
  4. Utiliser **un seul nom partout** : « OBM System » (le site écrivait « OBM SYSTEM » avant la refonte). Vérifier aussi que la page LinkedIn entreprise `/company/obm-system/` est publiée et complète : elle n'a pas pu être chargée pendant l'audit (**À VÉRIFIER**).
- **Acceptation** : « OBM System » à la position 1 en continu dans Search Console. La fiche affiche des avis.

#### IDX-6 · Maillage interne : articles et études de cas peu reliés

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : M
- **Preuves** (liens entrants uniques, crawl du 02/11) :

| Page | Pages qui y mènent |
|---|---|
| `/blog/ga4-6-reglages/`, `/blog/erreurs-meta-ads/`, `/blog/fiche-google-6-reglages/` | **2** (l'index du Journal et un seul autre) |
| `/blog/meta-ga4-caisse-…`, `/blog/safari-itp-…`, `/blog/relances-whatsapp-guide/` | 3 |
| `/cas-clients/la7dafan/` | 4 |
| `/cas-clients/eleganza/`, `/cas-clients/nassihacom/`, `/cas-clients/cerafas-logistics/` | 5 à 6 |
| Pages services | 31, presque uniquement via le menu, le pied de page et les cartes de l'accueil. Liens contextuels : 3 vers Tracking, 1 à 2 vers les autres, aucun vers IA & automatisation |

  - Les cartes entières sont des liens : leur texte d'ancre est le contenu complet de la carte (« 00 · StratégieStratégieAudit du dispositif… »). C'est du bruit pour Google comme pour les lecteurs d'écran.
- **Correctif** :
  1. En bas de chaque article, un bloc « **À lire ensuite** » (2 articles du même thème) et un encart « **Le service lié** », avec une ancre descriptive (« tracking server-side », « création de site e-commerce »…).
  2. Dans chaque étude de cas, des liens vers les services mobilisés (déjà fait pour Cerafas, La7daFan et Nassihacom ; à ajouter pour Pharmacie et Éléganza) et vers un article lié.
  3. Dans chaque page service, plus de liens contextuels **dans le texte** vers les articles et les cas (pas seulement les blocs « Réalisation liée » et « À lire »).
  4. Pour les cartes-liens, appliquer le motif du « lien étiré » : seul le titre est un `<a>`, et un pseudo-élément rend toute la carte cliquable.

```css
.card { position: relative; }
.card h3 a::after { content: ""; position: absolute; inset: 0; }   /* toute la carte reste cliquable */
```

- **Acceptation** : chaque article reçoit au moins 4 liens internes contextuels, chaque cas au moins 6. Les ancres sont de vrais textes.

#### IDX-7 · URL en double

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- **Preuves** : ces URL répondent **200** au lieu d'une redirection :
  - `/index.html`
  - `/services/index.html`, `/services/creation-site-web/index.html`
  - `/services//creation-site-web/` (double barre oblique)

  Les balises `canonical` limitent le dégât, mais ces doublons consomment de l'exploration.
- **Correctif** :

```nginx
if ($request_uri ~ "^(.*/)index\.html(\?.*)?$") { return 301 $1$2; }
# nginx fusionne déjà les « // » pour servir la page (merge_slashes), d'où le 200 : il faut tester $request_uri, l'URI brute
if ($request_uri ~ "^([^?]*?)//+(.*)$") { return 301 $1/$2; }
```

#### IDX-8 · Fichiers texte servis sans `charset` : `llms.txt` mal décodé par les robots

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- **Preuve** : `llms.txt`, `robots.txt`, `humans.txt` et `security.txt` sont servis en `Content-Type: text/plain` **sans `charset`**. Pour un client HTTP, un `text/*` sans `charset` se décode par défaut en ISO-8859-1 (c'est le cas de la bibliothèque `requests` de Python, très utilisée par les robots IA). Les accents de `llms.txt` deviennent alors « Ã© ». C'est un problème d'AEO, sur le fichier précisément destiné aux IA.
- **Correctif** :

```nginx
charset utf-8;
charset_types text/plain text/xml text/css application/javascript application/manifest+json;
```

- **Acceptation** : `curl -sI https://obm-system.com/llms.txt` renvoie `content-type: text/plain; charset=utf-8`.

#### IDX-9 · Sitemap figé et pas de flux RSS

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- Les 32 `lastmod` valent tous `2026-11-01`. Il faut générer la **vraie date de modification** de chaque fichier au moment de la build (date du dernier commit ou du fichier), et pour les articles, la date de publication ou de mise à jour.
- **Mise à jour du 02/11** : le sitemap est **généré par le back-office** à chaque enregistrement (le fichier du paquet sera donc remplacé). Les études de cas portent leur propre date ; toutes les autres pages reçoivent la date du jour de génération, y compris celles qui n'ont pas changé. Google ignore les `lastmod` quand ils ne sont pas fiables. **Correctif dans le générateur** : articles et cas → `dateModified` de l'article ; autres pages → date de modification réelle du fichier. Le sitemap a été relu par Google le 02/11 (32 pages découvertes).
- `/blog/feed.xml`, `/rss.xml` et `/feed/` répondent 404. Un flux RSS 2.0 ou Atom du Journal sert aux agrégateurs, à LinkedIn (outils de veille) et aux moteurs IA. L'annoncer dans le `<head>` : `<link rel="alternate" type="application/rss+xml" title="Journal OBM System" href="/blog/feed.xml">`.

---

### D.B · Mesure et tracking

#### TRK-1 · Le site affirme appliquer le tracking server-side à lui-même : c'est faux

- **Statut** : VÉRIFIÉ · **Priorité** : P0 · **Effort** : M (retirer la phrase) ou L (mettre en place sGTM)
- **Où** :
  - `/blog/safari-itp-tracking-server-side/` : « C'est l'architecture que nous appliquons, y compris pour notre propre site. »
  - `/services/tracking-server-side/` : spécifications « first-party /metrics », « GTM web + server », « Meta CAPI », « event_id dedup ».
- **Preuves** :
  - `/metrics/` et `/metrics/g/collect` répondent **404**.
  - Les hits GA4 partent directement vers `www.google-analytics.com`.
  - Le conteneur `GTM-TTPCSLV9` est publié **vide** (`"tags":[]`).
  - Aucun Pixel Meta, aucune requête CAPI.
- **Impact** : c'est le risque le plus fort pour la crédibilité. La vérification prend 10 secondes dans l'onglet « Réseau ».
- **Correctif, option B (immédiate)** : retirer la phrase de l'article et les spécifications « first-party /metrics », « GTM web + server » et « Meta CAPI » de la page service, jusqu'à la mise en production de l'option A.
- **Correctif, option A (recommandée : faire ce qu'on vend)** :
  1. GTM **serveur** sur le **même serveur** que le site (même IP, conformément à la règle ITP expliquée dans l'article) :

```bash
docker run -d --name sgtm --restart unless-stopped -p 127.0.0.1:8080:8080 \
  -e CONTAINER_CONFIG='<config copiée depuis GTM serveur>' \
  -e PREVIEW_SERVER_URL='https://<sous-domaine-preview>' \
  gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable
# Preview : 2e instance avec -e RUN_AS_PREVIEW_SERVER=true, sur un sous-domaine dédié (le preview n'a pas besoin d'être first-party)
```

```nginx
location /metrics/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

  2. Dans GTM web, sur la balise Google, définir `server_container_url` à `https://obm-system.com/metrics`.
  3. Dans GTM serveur : client GA4, balise GA4, balise **Meta Conversions API** (modèle officiel), `event_id` partagé avec le Pixel (voir TRK-2).
- **Acceptation** : `/metrics/healthz` renvoie 200. `/metrics/g/collect` renvoie 200 ou 204. Le cookie d'identification est posé par la réponse HTTP (`Set-Cookie` sur `obm-system.com`). Le Gestionnaire d'événements Meta reçoit les événements « Navigateur et serveur », dédoublonnés.

#### TRK-2 · GTM vide, GA4 chargé deux fois, événements doublés, aucune mesure Meta

- **Statut** : VÉRIFIÉ · **Priorité** : P0 · **Effort** : M
- **Preuves** :
  - `gtag/js?id=G-JGDV0VS9B9` est chargé **2 fois** (181 Ko chacun) : une fois par le script codé en dur, une fois par GTM (`&cx=c`), qui intercepte la commande `gtag('config')`.
  - `gtm.js` (119 Ko) est chargé pour un conteneur vide. Au total, environ **480 Ko** de JavaScript Google. Lighthouse mobile mesure **1 470 ms de blocage par du code tiers**.
  - `site.js > track()` envoie chaque événement **deux fois** (un `dataLayer.push({event})` et un `gtag('event')`).
  - La page Confidentialité annonce une mesure Meta qui n'existe pas.
- **Correctif** :
  1. **Garder** le bloc Consent Mode du `<head>` (`function gtag(){dataLayer.push(arguments);}` et `gtag('consent','default',…)`).
  2. **Supprimer** sur toutes les pages, 404 comprise, le `<script async src=…gtag/js?id=G-JGDV0VS9B9>` et les lignes `gtag('js')` / `gtag('config')`.
  3. Remplacer `track()` dans `site.js` :

```js
function track(name, params) {
  const p = Object.assign({ page_type: PAGE_TYPE, event_id: crypto.randomUUID() }, params || {});
  try { window.dataLayer.push(Object.assign({ event: name }, p)); } catch (e) {}
}
```

  4. Dans GTM web, publier :
     - la balise Google `G-JGDV0VS9B9` (avec `server_container_url` si TRK-1 option A) ;
     - des balises d'événement GA4 sur `whatsapp_click`, `booking_click`, `booking_view`, `booking_completed`, `phone_click`, `form_submitted`, `case_click`, `consent_update` (paramètres `location`, `cta_label`, `page_type`, `case`, `form_source`) ;
     - le Pixel Meta : PageView ; Lead sur `form_submitted` ; Schedule sur `booking_completed` ; Contact sur `whatsapp_click` et `phone_click`. Avec `eventID = {{DLV - event_id}}` et un déclenchement soumis à `ad_storage`.
  5. Dans GA4 (**À VÉRIFIER**, je n'avais pas accès à la propriété) :
     - événements clés `booking_completed`, `form_submitted`, `whatsapp_click`, `phone_click` ;
     - conservation des données 14 mois, filtre de trafic interne actif ;
     - référent indésirable `calendly.com` ;
     - devise MAD, fuseau Casablanca, export BigQuery ;
     - association avec Search Console.
- **Acceptation** : un seul `gtag/js` dans l'onglet Réseau. Un `page_view` par page dans DebugView. Un seul événement par clic. Meta Events Manager reçoit PageView et Lead.

#### TRK-3 · Les leads WhatsApp ne sont pas attribuables

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Constat** : tous les boutons WhatsApp (bulle flottante, bandeau CTA, contact) préremplissent **le même message** (« Bonjour, je souhaite échanger avec OBM System. »), sauf celui de `/site-reseaux/`. Quand un prospect écrit, on ne sait ni de quelle page il vient, ni de quelle campagne.
- **Correctif** : générer le lien côté JS avec une **référence courte** par page et source, visible dans le message. Le code est à placer dans l'IIFE de `site.js`, où `PAGE_TYPE` est défini :

```js
document.querySelectorAll('a[href^="https://wa.me/"]').forEach((a) => {
  const ref = (PAGE_TYPE + '-' + (location.pathname.split('/').filter(Boolean).pop() || 'accueil')).slice(0, 40);
  const src = new URLSearchParams(location.search).get('utm_source');
  const txt = `Bonjour, je souhaite échanger avec OBM System. (Réf. ${ref}${src ? ' · ' + src : ''})`;
  a.href = 'https://wa.me/212712348034?text=' + encodeURIComponent(txt);
});
```

  - Côté CRM, reporter la référence dans la fiche du lead.
- **Acceptation** : un message reçu depuis `/services/e-commerce/` contient « Réf. pillar-e-commerce ».

#### TRK-4 · Consentement : pings avant accord, cookies Calendly

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S · **DÉCISION** pour l'arbitrage
- Le Consent Mode est en mode **avancé** : GA4 se charge et envoie des pings sans cookie avant tout choix. C'est admis au Maroc, mais contesté pour les visiteurs européens (CNIL). Option : passer en mode **basique** (aucune balise chargée avant l'accord) pour l'UE.
- Calendly est intégré avec `hide_gdpr_banner=1` alors que l'iframe pose **3 cookies tiers** (Lighthouse). Option : une façade « Afficher les créneaux » qui charge Calendly au clic (voir CONV-1). Elle règle à la fois le consentement et le poids de la page.

---

### D.C · Sécurité, serveur, DNS et e-mail

#### SEC-1 · La clé API LeadFlow est publique

- **Statut** : VÉRIFIÉ · **Priorité** : P0 · **Effort** : S
- **Où** : `/assets/js/site.js`, objet `LEADFLOW` (`apiKey: '1b5bb9…'`, 64 caractères en clair, envoyés dans l'en-tête `x-api-key`). Le captcha FormSubmit est aussi désactivé (`_captcha=false`).
- **Impact** : n'importe qui peut injecter des milliers de faux leads dans le CRM, ou pire, selon les droits de la clé.
- **Correctif** :
  1. Révoquer la clé dans LeadFlow et en générer une nouvelle.
  2. Mettre un proxy nginx : la clé reste côté serveur.

```nginx
# bloc http {}
limit_req_zone $binary_remote_addr zone=leads:10m rate=6r/m;
# bloc server {}
location = /api/lead {
    limit_except POST { deny all; }
    limit_req zone=leads burst=3 nodelay;
    if ($http_origin !~* ^https://obm-system\.com$) { return 403; }
    include /etc/nginx/secrets/leadflow.conf;   # set $leadflow_key "NOUVELLE_CLE";
    proxy_set_header x-api-key $leadflow_key;
    proxy_set_header Host leadflow-production-d68a.up.railway.app;
    proxy_ssl_server_name on;
    proxy_pass https://leadflow-production-d68a.up.railway.app/web-leads;
}
```

  3. Dans `site.js`, utiliser `endpoint: '/api/lead'`, supprimer `apiKey` et l'en-tête `x-api-key`.
  4. Ajouter **Cloudflare Turnstile** (gratuit) sur les deux formulaires, avec vérification du jeton dans le proxy ou dans LeadFlow.
- **Acceptation** : `grep -ci apikey site.js` renvoie 0. L'ancienne clé renvoie 401. Un `POST` sans `Origin` correct renvoie 403. Un envoi réel crée bien un lead.

#### MAIL-1 · Les e-mails du domaine ne sont pas authentifiés

- **Statut** : ✅ **FAIT le 02/11/2026** (zone Genious modifiée, DKIM activé dans Google Admin, contrôlé sur `dns.google`) · **Priorité** : P0 · **Effort** : S
- **Reste** : passer DMARC en `p=quarantine; pct=100` après 3 à 4 semaines de rapports propres, puis `p=reject`. Le détail est dans `dns/enregistrements-dns.txt` du paquet.
- **Preuves (état avant correction)** :
  - Les MX pointent vers Google Workspace (`smtp.google.com`).
  - TXT de `obm-system.com` : `google-site-verification=…` et **une clé `v=DKIM1;k=rsa;p=…` publiée à la racine du domaine**, ce qui est une erreur : un DKIM se publie sur `<sélecteur>._domainkey`.
  - **Aucun enregistrement SPF** (`v=spf1`).
  - **Aucun DMARC** sur `_dmarc.obm-system.com`.
  - `google._domainkey.obm-system.com` : vide.
- **Impact** : les propositions, devis et réponses aux leads envoyés depuis `admin@obm-system.com` ont de fortes chances d'arriver **en spam**. Gmail et Yahoo exigent SPF, DKIM et DMARC depuis 2024. Le domaine peut aussi être **usurpé** (faux e-mails « OBM System » envoyés à des prospects).
- **Correctif** (chez l'hébergeur DNS Genious) :

| Hôte | Type | Valeur |
|---|---|---|
| `obm-system.com` | TXT | `v=spf1 include:_spf.google.com ~all` |
| `google._domainkey.obm-system.com` | TXT | la clé générée dans Google Admin, « Applications > Gmail > Authentifier les e-mails ». Le sélecteur affiché par Google fait foi. |
| `_dmarc.obm-system.com` | TXT | `v=DMARC1; p=none; rua=mailto:admin@obm-system.com; fo=1` (alignement « relaxed » par défaut, plus tolérant si un outil tiers envoie un jour depuis un sous-domaine) |
| `obm-system.com` | TXT | **supprimer** l'enregistrement `v=DKIM1…` mal placé |

  - Dans Google Admin, cliquer sur « Démarrer l'authentification ».
  - Après 2 à 4 semaines de rapports DMARC propres, passer à `p=quarantine`, puis `p=reject`.
  - Si un autre service envoie avec ce domaine (CRM, Calendly avec domaine personnalisé…), l'ajouter au SPF.
- **Acceptation** : un e-mail envoyé de `admin@` vers Gmail affiche, dans « Afficher l'original », **SPF PASS, DKIM PASS, DMARC PASS**.

#### SEC-2 · En-têtes et configuration serveur

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
1. **`Cache-Control` envoyé deux fois** sur toutes les réponses (directive `expires` combinée à `add_header`). Supprimer `expires`.
2. **CSP en `Report-Only` sans `report-uri` ni `report-to`** : elle ne protège rien et ne rapporte rien.
   - Après SEC-1 et TRK-1, mettre `connect-src` à `'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://formsubmit.co`.
   - Ajouter `https://connect.facebook.net` en `script-src`, et `https://www.facebook.com` en `img-src` et `connect-src`.
   - Ajouter `report-to`, collecter une semaine de rapports, puis passer en `Content-Security-Policy`.
3. **Pas de HTTP/3** (aucun en-tête `alt-svc`), **pas d'IPv6** (aucun enregistrement AAAA), **pas de CAA**. Ce sont des optimisations P3 : HTTP/3 aide sur les réseaux mobiles marocains ; un enregistrement CAA `0 issue "letsencrypt.org"` limite les émetteurs de certificats.
4. `/.git/HEAD` et `/.env` répondent 403 : une règle bloque les fichiers cachés, c'est bien. **À VÉRIFIER** : qu'aucun dossier `.git` ne soit déployé dans la racine web.
5. HSTS : ajouter `includeSubDomains` seulement si tous les sous-domaines sont en HTTPS.

---

### D.D · Performance

#### PERF-1 · Mobile 65/100 : blocage JavaScript et rendu retardé

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : M

| Page | Mobile | LCP | TBT | Poids | Desktop |
|---|---|---|---|---|---|
| `/` | **65** | 3,0 s | 1 790 ms | 830 Ko | 80 (LCP 1,6 s, TBT 260 ms) |
| `/diagnostic-de-croissance/` | 76 | 3,2 s | 630 ms | **3,8 Mo** | n. m. |
| `/services/creation-site-web/` | 84 | 2,2 s | 530 ms | 510 Ko | n. m. |
| `/site-reseaux/` | 75 | 2,5 s | 930 ms | 1,1 Mo | n. m. |

- **Diagnostic** : sur mobile, le LCP est du **texte** (`p.lead`), avec un **retard de rendu de 2,37 s**. La cause est le JavaScript Google qui bloque le thread principal, pas une image. Le correctif principal est donc TRK-2.
- **Acceptation** : mobile ≥ 90 sur `/` et sur les pages services, LCP < 2,5 s, TBT < 200 ms.

#### PERF-2 · Images

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
1. **Préchargement inutile** : `<link rel="preload" as="image" … pharmacie-mobile-260.webp fetchpriority="high">` et `fetchpriority="high"` sur cette image, alors que le LCP est du texte. Cette image prend de la bande passante aux polices et au CSS. Supprimer les deux.
2. **Pas de `srcset`** sur les captures `*-desktop.webp` (1 200 px) affichées en 350 à 370 px (cartes de l'accueil, des pages services et des cas). Générer des variantes de 600 et 900 px et ajouter `srcset` + `sizes="(max-width: 900px) 92vw, 370px"`. Gain estimé : 150 Ko sur l'accueil.
3. **Bande du hero sur mobile** : les cartes 3 à 5 sont hors écran mais chargées immédiatement. Ajouter `loading="lazy"` à partir de la 3e (gain estimé : 121 Ko).
4. Servir de l'**AVIF** (avec repli WebP via `<picture>`) : 20 à 30 % de gain supplémentaire sur les captures.
5. Les captures mobiles font 1 125 px de haut alors que le HTML déclare `height="1126"`. Mineur, à aligner.

#### PERF-3 · Polices, CSS, Calendly, serveur

- **Statut** : VÉRIFIÉ / À VÉRIFIER · **Priorité** : P2 · **Effort** : S
- **Polices** : 4 fichiers WOFF2 (Switzer 400, 500, 600/700 et JetBrains Mono). JetBrains Mono ne sert qu'aux petites étiquettes : la remplacer par `ui-monospace`. Sous-ensembler Switzer (latin et latin-1) et ajouter une police de repli dont les métriques sont ajustées (`size-adjust`, `ascent-override`) pour éviter tout décalage au chargement.
- **CSS** : `site.css` fait 33 Ko, n'est **pas minifié** (commentaires, espaces) et seulement **32 % des règles servent sur l'accueil**. Minifier à la build ; supprimer les règles mortes (voir CODE-1).
- **Calendly** : 3,8 Mo chargés dès l'arrivée sur `/diagnostic-de-croissance/` (voir CONV-1).
- **TTFB** : 0,66 s mesuré depuis le datacenter de test (serveur Hetzner en Allemagne, RTT 210 ms). **À VÉRIFIER** depuis le Maroc (WebPageTest, localisation la plus proche). Au-delà de 400 ms, mettre un CDN avec un point de présence proche.

---

### D.E · Conversion et UX

#### CONV-1 · Calendly : la page de conversion reste vide plus de 10 secondes

- **Statut** : VÉRIFIÉ (Chrome réel et navigateur headless) · **Priorité** : P0 · **Effort** : S
- **Constat** :
  - Le cadre de `/diagnostic-de-croissance/#creneau` reste **blanc pendant plus de 10 s**. Le spinner Calendly existe dans le DOM mais reste invisible, car `widget.css` n'est pas chargé.
  - La page pèse 3,8 Mo (Calendly, Stripe, reCAPTCHA, Datadog).
  - Une fois chargé, le widget réaffiche la description de l'événement, qui duplique la page. Sur mobile, cette description repousse le calendrier en bas de l'iframe de 760 px.
- **Correctif** :

```html
<link rel="preconnect" href="https://calendly.com">
<link rel="preconnect" href="https://assets.calendly.com">
<link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css">
<!-- conserver les paramètres actuels et AJOUTER hide_event_type_details=1 -->
<div class="calendly-inline-widget" id="calendly" data-url="https://calendly.com/admin-obm-system/30min?<paramètres actuels>&hide_event_type_details=1"></div>
```

```css
.calendly-inline-widget { min-height: 700px; background: var(--card); }
@media (max-width: 760px) { .calendly-inline-widget { min-height: 980px; } }
/* + squelette « Chargement des créneaux… » retiré à la réception de calendly.event_type_viewed */
```

  - Mettre le lien « Ouvrir la page de réservation » **au-dessus** du widget.
  - Raccourcir la description de l'événement dans Calendly.
- **Acceptation** : un indicateur de chargement est visible immédiatement. Sur un iPhone de 390 px, les jours sont visibles sans défiler dans l'iframe.

#### CONV-2 · Le bandeau cookies masque le CTA principal sur mobile

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Constat** : `.consent` est positionné à `bottom: 4.6rem` et mesure environ 160 px. Il recouvre « Réserver mon diagnostic » (accueil) et « Choisir mon créneau » (contact) pour tous les nouveaux visiteurs mobiles.
- **Correctif** : barre compacte collée en bas, avec les deux boutons à égalité.

```css
@media (max-width: 760px) {
  .consent { left: 0; right: 0; bottom: 0; max-width: none; border-radius: 12px 12px 0 0;
             padding: .7rem 1rem; display: flex; gap: .75rem; align-items: center; font-size: .85rem; }
  .consent p { margin: 0; flex: 1; }
  .consent__actions .btn { padding: .55rem .8rem; }
}
```

- **Acceptation** : à 390 × 844, bandeau ouvert, le bouton du hero reste visible et cliquable.

#### CONV-3 · Aucun CTA ni bouton d'appel sous 1 000 px

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Constat** :
  - Sous 1 000 px, l'en-tête ne montre que le logo et « Menu », car `.nav__cta` est masqué.
  - Il n'y a **aucun bouton d'appel**. Le menu mobile ne propose ni téléphone ni WhatsApp.
  - Le site promet pourtant à ses clients « Appel, WhatsApp et formulaire accessibles depuis chaque écran ».
- **Correctif** : barre d'actions fixe en bas sur mobile, qui remplace la bulle `.wa`.

```html
<nav class="mbar" aria-label="Contact rapide">
  <a class="mbar__main" href="/diagnostic-de-croissance/" data-loc="mbar">Réserver mon diagnostic</a>
  <a href="https://wa.me/212712348034" target="_blank" rel="noopener" data-loc="mbar" aria-label="Écrire sur WhatsApp">WhatsApp</a>
  <a href="tel:+212712348034" data-loc="mbar" aria-label="Appeler OBM System">Appeler</a>
</nav>
```

```css
.mbar { display: none; }
@media (max-width: 1000px) {
  .mbar { display: grid; grid-template-columns: 1fr auto auto; gap: .5rem; position: fixed; inset: auto 0 0 0; z-index: 50;
          padding: .6rem .75rem calc(.6rem + env(safe-area-inset-bottom)); background: var(--card); border-top: 1px solid var(--line); }
  .mbar a { display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 .9rem; border-radius: 8px;
            font-weight: 600; text-decoration: none; border: 1px solid var(--ink); color: var(--ink); }
  .mbar .mbar__main { background: var(--violet); border-color: var(--violet); color: #fff; }
  .wa { display: none; }  body { padding-bottom: 76px; }  .consent { bottom: 76px; }
}
```

  - Ajouter aussi « Appeler » et « WhatsApp » en bas du menu mobile `#mnav`.
- **Acceptation** : à 390 et 820 px, les trois actions restent visibles sur toutes les pages, et GA4 reçoit `location = mbar`.

#### CONV-4 · Hero mobile : le CTA est hors du premier écran

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Constat** : à 390 × 844, l'ordre est H1, sous-titre, paragraphe de 60 mots, puis le bouton. Le bouton n'apparaît pas sans défiler.
- **Correctif** :

```css
@media (max-width: 760px) {
  .hero__row > div:last-child { display: flex; flex-direction: column; }
  .hero .actions { order: -1; margin: 1.25rem 0; }
}
```

  - Option complémentaire : sur mobile, raccourcir le paragraphe à une phrase (le détail des leviers figure juste en dessous).

#### CONV-5 · Formulaires

- **Statut** : VÉRIFIÉ (code lu et `pattern` testé dans Chromium ; aucun envoi réel) · **Priorité** : P1 · **Effort** : S
1. **Le téléphone refuse des formats courants** : `pattern="[0-9 +]{8,16}"` rejette `+212 6 12 34 56 78`, `06-12-34-56-78` et `(+212) 6 12 34 56 78`.
   - Remplacer par `pattern="[0-9 +\(\)\.\-]{8,22}"`. Les caractères sont échappés parce que les navigateurs compilent `pattern` avec le drapeau `v`. Testé : les 5 formats sont acceptés, `abc12345` est refusé.
   - Normaliser ensuite le numéro côté serveur.
2. **« Votre besoin » n'a pas d'option vide** : chaque lead arrive avec « Création de site » si le visiteur ne touche pas au champ, ce qui fausse le CRM et GA4. Ajouter `<option value="">Non précisé</option>` en premier.
3. **Champs obligatoires non signalés** : Nom et Téléphone n'ont ni astérisque ni mention. Ajouter « (obligatoire) » ou « (facultatif) » dans les libellés, avec `aria-required`.
4. **8 champs sur `/contact/`** (Nom, Entreprise, Téléphone, E-mail, Besoin, Démarrage, Ville, Message) : trop pour un premier contact. Passer à 5 (Nom, Téléphone ou WhatsApp, E-mail facultatif, Besoin, Message) et déduire la ville de l'échange.
5. **Le secours FormSubmit expose l'adresse** (`action="https://formsubmit.co/admin@obm-system.com"`), ce qui attire le spam. Utiliser l'alias aléatoire fourni par FormSubmit.
6. **Accents supprimés** (`stripAccents` sur `ville` et `message`) : corriger l'UTF-8 côté LeadFlow, puis retirer la fonction.
7. Après un envoi réussi, `ok.focus()` suppose `tabindex="-1"` sur `#leadOk` et sur son équivalent de la page Site + Réseaux : vérifier ou ajouter.

#### CONV-6 · Aucune preuve sociale

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : M · **DÉCISION** sur le contenu
- **Constat** : le site n'affiche aucun avis, aucun témoignage, aucun résultat chiffré, aucune garantie et aucune note Google. La seule preuve est la capture des sites livrés. Pour un « cabinet de conseil » qui facture des prestations à forte valeur, c'est le principal frein après la vitesse.
- **Correctif** :
  - Bloc d'avis Google (dès que la fiche en a, voir IDX-5).
  - **Une citation client par étude de cas**, avec l'accord du client.
  - **Résultats vérifiés** quand ils existent, conformément à la règle de la maison : aucun chiffre inventé.
  - Ligne d'engagements sous le CTA (« Proposition écrite avant tout engagement · Tout vous appartient · Réponse sous 24 h ouvrées »).
  - Placer ces éléments **à côté des CTA**, pas seulement en bas de page.

#### CONV-7 · Les cas 360° ne sont pas mis en avant sur l'accueil

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- Le bloc « Anatomie d'un système » de l'accueil montre Cerafas, Nassihacom et La7daFan, soit **trois projets « site »**. Les deux projets qui prouvent le positionnement 360° (Pharmacie : site, réseaux, fiche Google, publicité ; Éléganza : boutique, contenu, CM, publicité, SEO) n'y figurent pas. Mettre la Pharmacie en premier, puis Éléganza et Cerafas.

#### CONV-8 · Menu mobile, page 404, ancres

- **Statut** : VÉRIFIÉ · **Priorité** : P3 · **Effort** : S
- **Page 404** : elle ne propose qu'un CTA et « Retour à l'accueil ». Ajouter les liens Services, Réalisations, Journal et Contact. Des visiteurs y arriveront depuis d'anciennes URL dentaires.
- **Ancres** (`#creneau`, `#faq`, `#contact`, `#cookies`) : l'en-tête collant (70 px) peut masquer le titre ciblé. Ajouter `html { scroll-padding-top: 86px; }`. Le défilement fluide est déjà neutralisé avec `prefers-reduced-motion` : rien à changer de ce côté.

---

### D.F · Design et identité

#### DES-1 · Le H1 de l'accueil se coupe mal et le hero est déséquilibré

- **Statut** : VÉRIFIÉ (390, 820, 1 024, 1 100 et 1 440 px) · **Priorité** : P1 · **Effort** : S
- **Constat** :
  - Le H1 se coupe ainsi à toutes les largeurs : « Ingénierie et / précision. L'exécution / chirurgicale / des ventes. ». « chirurgicale » se retrouve seul sur sa ligne et la phrase est cassée au milieu. La cause : `max-width: 17ch` combiné à `text-wrap: balance`.
  - Deux définitions concurrentes de `.hero h1` existent (le bloc principal et « Retouches kit v3 »), plus un `--text-hero` inutilisé.
  - Entre 1 000 et 1 440 px, `align-items: end` crée un vide d'environ 120 px au-dessus du H1, alors que le paragraphe de droite démarre plus haut.
- **Correctif** (le slogan reste le H1, conformément à la décision du 30/10) :

```html
<h1><span>Ingénierie et précision.</span> <span>L’exécution chirurgicale des ventes.</span></h1>
```

```css
.hero h1 { max-width: none; font-size: var(--text-hero); }   /* une seule définition */
.hero h1 span { display: block; }
.hero__row { align-items: start; }
```

#### DES-2 · Identité : l'orange est absent, le favicon illisible, le logo inadapté au fond clair

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : M
- **Constat** :
  - **L'orange de la marque n'apparaît nulle part.** Le token `--orange` n'est utilisé que par la classe `.logo s`, qui n'existe dans aucune page. Le logo (dégradé violet vers orange) n'a donc aucun écho dans l'interface : le site est crème et violet, le logo est noir et néon.
  - **Favicon** (`favicon-16.png`, `favicon-32.png`) : c'est le logo complet réduit. À 16 et 32 px, « OBM » est flou et « SYSTEM » ainsi que l'éclair deviennent du bruit. Il n'existe pas de favicon SVG.
  - **Logo de l'en-tête** (44 px) : la mention « SYSTEM » est illisible et le disque noir fait l'effet d'une pastille collée sur le fond crème.
- **Correctif** :
  1. Créer une **version simplifiée du logo** pour les petites tailles (« OBM » seul, sans « SYSTEM » ni éclair), en SVG : `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, avec un repli PNG.
  2. Utiliser une **version claire du logo** pour l'en-tête sur fond crème (lettrage noir et violet, cercle au trait), et garder la version néon pour le pied de page sombre.
  3. Utiliser l'orange **rarement mais visiblement**, conformément à la charte validée (« orange rare ») : par exemple la puce des « points de décision » des études de cas, le chiffre-clé d'une preuve ou l'indicateur de section active.
  4. **Attention au contraste** : orange `#E8692B` sur crème = **2,87:1**, insuffisant pour du texte. Le réserver aux éléments graphiques ou aux fonds sombres (5,8:1 sur `--night`).

#### DES-3 · Études de cas : deux gabarits, grille cassée, captures datées, aucun résultat

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : M
- **Constat** :
  - **Deux gabarits différents** : Cerafas, La7daFan et Nassihacom utilisent les cartes « décisions de conception » avec spécifications ; Pharmacie et Éléganza utilisent de la prose (« Le projet / Ce que nous avons fait / Les choix qui comptent »). La promesse « Anatomie d'un système » n'est tenue que sur trois cas sur cinq.
  - **Grille cassée** : l'en-tête du cas est aligné à gauche (x = 103 px à 1 440), puis le corps passe dans une colonne centrée de 465 px (x = 271 px). Le décalage est visible, la colonne paraît étroite, et les 4 ou 5 cartes empilées allongent la page.
  - **Captures datées** : celle d'Éléganza montre « Kenra est là ! … jusqu'au 8 novembre », celle de la Pharmacie une mise en avant Novexpert. Dans une semaine, ces études de cas auront l'air abandonnées.
  - **Aucun bloc résultat, citation client ou chronologie.**
- **Correctif** :
  1. **Un gabarit unique** : en-tête (secteur, lieu, site, leviers), capture **annotée** (repères numérotés posés sur la capture, reliés aux décisions), décisions en grille 2 × 2 à côté de la capture sur desktop, puis bloc « Résultats » (vérifiés, sinon « Ce que le client peut faire seul aujourd'hui »), citation client, leviers mobilisés, puis cas précédent et cas suivant.
  2. Aligner le corps sur la grille de l'en-tête (`.wrap`) ou centrer aussi l'en-tête.
  3. Refaire les captures sur des états **intemporels**, sans promotion datée.

#### DES-4 · Bug de signature dans les 9 articles

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Constat** : « Par **Oualid Benamara** , fondateur d'OBM System » : un espace visible apparaît avant la virgule. `.byline { display: flex; gap: .7rem }` transforme les nœuds de texte en éléments flex séparés de 0,7 rem.
- **Correctif** : `.byline { display: block; }`, ou envelopper le texte dans un `<span>` unique.

#### DES-5 · Le gabarit article est pauvre pour un contenu « expert »

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : M
- **Manques** :
  - Pas de **boîte auteur** (photo ou monogramme, fonction, lien LinkedIn).
  - Pas de **sommaire** pour les articles de 7 à 9 minutes.
  - **Aucun visuel** : l'article Safari ITP gagnerait un schéma site, sous-domaine, IP et cookie ; l'article CRM vers Meta, un schéma du pipeline.
  - « En bref » n'est pas mis en valeur comme encadré.
  - Pas d'**articles liés** ni d'**encart service** (voir IDX-6), pas de bouton de partage LinkedIn, pas de date de mise à jour visible.
  - Le seul CTA est en fin d'article.
- **Correctif** : un gabarit avec sommaire repliable sur mobile, encadré « En bref » (fond `--card`, filet violet), figure ou schéma par article, boîte auteur, encart « Le service lié » à mi-parcours, puis « À lire ensuite ».

#### DES-6 · Toutes les sections suivent le même gabarit, sans visuel propre

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : L
- **Constat** : presque toutes les sections de toutes les pages répètent la même structure : petite étiquette, H2 à gauche, paragraphe à droite, puis grille de cartes. Ce rythme est monotone. Surtout, le site ne contient **aucun visuel conçu par OBM** : pas de schéma, de diagramme, d'annotation ou de visualisation de données. Les seules images sont les captures des sites clients. Pour une marque dont le slogan est « Ingénierie et précision », c'est le décalage principal entre le discours et la forme.
- **Correctif** (à cadrer avec Oualid) :
  - Un **schéma du système en 6 couches** (Stratégie, Conception, Acquisition, Mesure, Visibilité, Activation), interactif ou animé sobrement, sur l'accueil et sur `/services/`.
  - Des **captures annotées** dans les cas (DES-3).
  - Un **schéma par page service** : flux de mesure, parcours d'achat, séquence WhatsApp.
  - Varier les compositions : une section pleine largeur, une section sombre, une section avec visuel dominant.

#### DES-7 · Page À propos

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : M
- Le **H1 est identique à celui de l'accueil** (voir SEO-2).
- Les cartes « Fondateur » et « OBM System » contiennent une liste à puce **d'un seul élément** (le lien LinkedIn) : retirer la puce.
- Pas de repères ni d'historique depuis 2018, pas de visuel. La présence d'une photo du fondateur est une **DÉCISION** (la ligne éditoriale actuelle exclut les visages ; un monogramme ou une photo d'environnement de travail sont des alternatives).

#### DES-8 · Micro-typographie

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- **Tailles trop petites** : `.74rem`, `.76rem` et `.78rem` (11,8 à 12,5 px) pour les étiquettes mono et les puces de spécification. Prévoir 13 px minimum sur mobile.
- `text-wrap: balance` ne s'applique qu'aux titres. Ajouter `p, li { text-wrap: pretty; }` pour éviter les mots isolés en fin de paragraphe.
- La ponctuation qui passe en début de ligne est traitée dans CONT-2.

#### DES-9 · Pied de page mobile

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- Les liens font **18 px de haut** (cibles tactiles trop petites, voir A11Y-4).
- L'adresse e-mail se coupe en « admin@obm- / system.com » : ajouter `overflow-wrap: anywhere` ou raccourcir le libellé en « Écrire un e-mail ».
- Le séparateur « · » des réseaux passe en début de ligne (voir CONT-2).

#### DES-10 · Journal

- **Statut** : VÉRIFIÉ · **Priorité** : P3 · **Effort** : S
- Le H1 de l'index est « Analyses » : trop vague (voir SEO-2).
- Les cartes sont uniquement textuelles : ajouter un visuel ou un schéma par article, réutilisé comme image OG.
- Quatre articles sont datés du même jour (1er novembre) : étaler les dates de publication à l'avenir.

---

### D.G · Accessibilité

axe-core ne relève que 4 règles en échec. Le contrôle manuel en ajoute d'autres.

#### A11Y-1 · Bordures de champs invisibles et focus invisible sur fond sombre

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Bordure des champs** : `--line` `#D9D6CE` sur blanc = **1,45:1**. WCAG 1.4.11 exige 3:1 pour la limite d'un champ. Utiliser `#85828F` (3,76:1) pour les champs uniquement.
- **Focus dans les sections sombres et le pied de page** : contour violet `#5B43C9` sur `#121117` = **2,76:1** (< 3:1). Ajouter `.section--night :focus-visible, .footer :focus-visible { outline-color: var(--violet-soft); }` (6,21:1).
- **Focus des champs** : `outline: none` remplacé par une bordure de 1 px et une ombre `#E6E0FB` presque invisible. Utiliser `box-shadow: 0 0 0 2px var(--violet)`.

#### A11Y-2 · Contraste, alternatives textuelles, titres

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
1. **Bouton WhatsApp** : `#1F8F4E` sur blanc = 4,12:1. Remplacer par `#1A7F45` (5,04:1).
2. **Logo** : `alt="OBM System"` répété à côté du texte « OBM System » dans le même lien (64 occurrences). Passer à `alt=""`.
3. **Ordre des titres** : sur `/methode/` et `/blog/`, on passe d'un H1 à des H3. Ajouter des H2.
4. **Sources** : `<aside class="sources">` est imbriqué dans `<article>`. Utiliser `<section aria-label="Sources">`.
5. `<noscript><iframe>` de GTM : ajouter `title="Google Tag Manager"`.

#### A11Y-3 · Vidéo, menu, bandeau

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- **Vidéo `/site-reseaux/`** : `autoplay loop` sans bouton pause (WCAG 2.2.2). Ajouter lecture/pause et désactiver la lecture automatique avec `prefers-reduced-motion`.
- **Menu mobile** : le focus reste sur le bouton « Menu ». À l'ouverture, placer le focus sur le premier lien, le piéger dans le menu, puis le rendre au bouton à la fermeture (Échap fonctionne déjà).
- **Bandeau cookies** : `role="dialog"` sans gestion du focus. Soit lui donner le focus, soit utiliser `role="region"` avec `aria-label`.

#### A11Y-4 · Cibles tactiles, champs obligatoires, cartes-liens

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- **Cibles tactiles** : les liens du pied de page font 18 px de haut à 390 px (WCAG 2.5.8 demande 24 px minimum, l'usage recommande 44 px). Mettre `padding-block` sur `.footer li a` pour atteindre 40 px de hauteur utile.
- **Champs obligatoires** non signalés (voir CONV-5).
- **Cartes entièrement cliquables** : le nom accessible du lien est le texte complet de la carte. Appliquer le motif du lien étiré (IDX-6).

---

### D.H · SEO on-page et contenu

#### SEO-1 · Titles et descriptions

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Accueil** : remplacer « OBM System · Croissance digitale à Rabat, Maroc » par `OBM System · Agence de conseil 360° à Rabat, Maroc` (50 caractères, descripteur validé).
- **Titles de plus de 60 caractères ou descriptions de plus de 160** (tronqués dans Google) :

| URL | Title | Description |
|---|---|---|
| `/diagnostic-de-croissance/` | 53 | **183** |
| `/services/creation-site-web/` | 52 | **176** |
| `/services/publicite-meta-google-ads/` | 51 | **177** |
| `/services/tracking-server-side/` | **62** | **176** |
| `/services/reseaux-sociaux/` | **67** | 155 |
| `/services/ia-automatisation/` | **73** | 158 |
| `/site-reseaux/` | **63** | **172** |
| `/cas-clients/pharmacie-gare-hay-riad/` | 60 | **168** |
| `/cas-clients/cerafas-logistics/` | 54 | **209** |
| `/cas-clients/la7dafan/` | 45 | **167** |
| `/cas-clients/nassihacom/` | 47 | **203** |
| `/blog/crm-meta-api-conversions/` | **81** | **246** |
| `/blog/ga4-6-reglages/` | **71** | **177** |
| `/blog/meta-ga4-caisse-quel-chiffre-piloter/` | 58 | **236** |
| `/blog/safari-itp-tracking-server-side/` | **73** | **275** |
| `/blog/erreurs-meta-ads/` | **73** | **211** |
| `/blog/site-vitrine-ecommerce-plateforme/` | **75** | 146 |
| `/blog/relances-whatsapp-guide/` | **71** | **237** |
| `/blog/fiche-google-6-reglages/` | **74** | 135 |
| `/blog/refonte-site-5-questions/` | **68** | **165** |

- **Propositions de titles** (≤ 56 caractères) :
  - `Automatisation WhatsApp, CRM et IA au Maroc · OBM System`
  - `Community manager à Rabat · OBM System`
  - `Tracking server-side, GA4 et CAPI Meta · OBM System`
  - `Offre Site + Réseaux à Rabat · OBM System`
  - `CRM → Meta : l’API Conversions par étape · OBM System`
  - `GA4 : 6 réglages à contrôler · OBM System`
  - `Safari ITP et tracking server-side · OBM System`
  - `Meta Ads : 5 erreurs qui coûtent cher · OBM System`
  - `Site vitrine, e-commerce ou plateforme ? · OBM System`
  - `Relances WhatsApp au Maroc : le guide · OBM System`
  - `Fiche Google : 6 réglages oubliés · OBM System`
  - `Refonte de site : 5 questions à se poser · OBM System`
- Ramener chaque description à 140–155 caractères.

#### SEO-2 · H1 sans intention de recherche, H1 dupliqué

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **H1 dupliqué** : `/a-propos/` reprend mot pour mot le H1 de l'accueil. Proposition : « OBM System, agence de conseil 360° à Rabat depuis 2018 ».
- **H1 des pages services sans mot-clé ni ville** (le title porte le mot-clé, le H1 non) :

| Page | H1 actuel | H1 proposé (même ton, avec l'intention) |
|---|---|---|
| `/services/seo-aeo/` | « Être trouvé sur Google, et cité par les moteurs IA » | « Référencement Google et AEO : être trouvé, et cité par les moteurs IA » |
| `/services/reseaux-sociaux/` | « Des réseaux sociaux qui nourrissent votre site » | « Community management à Rabat : des réseaux qui nourrissent votre site » |
| `/services/creation-site-web/` | « Sites web sur mesure, conçus pour convertir » | « Création de sites web sur mesure à Rabat, conçus pour convertir » |
| `/services/ia-automatisation/` | « WhatsApp, CRM et IA : chaque demande suivie jusqu'à la vente » | « Automatisation WhatsApp, CRM et IA : chaque demande suivie jusqu'à la vente » |
| `/cas-clients/` | « Anatomie d'un système » | « Réalisations : l'anatomie de nos projets » |
| `/blog/` | « Analyses » | « Journal : analyses mesure, acquisition et visibilité » |

- Le H1 de l'accueil reste le slogan (décision du 30/10). Le title et l'étiquette « Agence de conseil 360° · Rabat » portent l'intention.

#### SEO-3 · Contenu trop mince sur les pages qui vendent

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : L
- **Constat** :

| Page | Nombre de mots |
|---|---|
| `/diagnostic-de-croissance/` | 172 |
| `/services/` | 252 |
| `/services/reseaux-sociaux/` | 262 |
| `/services/ia-automatisation/` | 269 |
| `/services/publicite-meta-google-ads/` | 330 |
| `/services/e-commerce/` | 339 |
| `/services/seo-aeo/` | 348 |
| `/services/tracking-server-side/` | 405 |
| `/services/creation-site-web/` | 416 |
| études de cas | 245 à 328 |

  Les réponses des FAQ existent dans le HTML (balises `<details>`), mais restent très courtes.

  **Avancement (version 7)** : chaque page service gagne une section d'expertise sans redite et deux questions fréquentes (HTML et FAQPage). Nombre de mots après correction : Diagnostic 267, Réseaux sociaux 398, IA et automatisation 409, E-commerce 438, SEO 467, Publicité 489, Tracking 533, Création de site 641. L'objectif de 900 à 1 200 mots reste valable, avec un exemple chiffré tiré d'un cas réel par page, à rédiger avec Oualid. Aucun chiffre n'a été inventé.
- **Correctif** : passer chaque page pilier à **900 à 1 200 mots utiles**, avec :
  - le problème du dirigeant et le résultat visé ;
  - les livrables précis ;
  - les choix techniques et leur raison ;
  - un exemple concret tiré d'un cas réel ;
  - les objections (prix, délai, propriété) ;
  - une FAQ de 6 à 8 vraies questions ;
  - le lien vers le cas et l'article liés.

  Aucun chiffre non vérifié.

#### SEO-4 · Carte mots-clés et pages ville

- **Statut** : DÉCISION · **Priorité** : P2 · **Effort** : L
- **Carte cible** (volumes à valider dans Google Ads Keyword Planner ou Search Console : aucune donnée de volume n'a été inventée ici) :

| Intention | Page cible |
|---|---|
| agence de conseil / marketing digital Rabat | `/` |
| création site web Rabat, site sur mesure Maroc | `/services/creation-site-web/` |
| création site e-commerce Maroc | `/services/e-commerce/` |
| agence Meta Ads / Google Ads Maroc | `/services/publicite-meta-google-ads/` |
| tracking server-side, API Conversions Meta | `/services/tracking-server-side/` |
| agence SEO Rabat, référencement Google Maroc | `/services/seo-aeo/` |
| community manager Rabat | `/services/reseaux-sociaux/` |
| automatisation WhatsApp Maroc (requête déjà vue dans Search Console, position 8) | `/services/ia-automatisation/` |

- **Pages ville** : la page SEO promet « une page par service et par ville », mais le site n'en a aucune. Commencer par **Casablanca** (clients existants), avec un contenu réel : projets de la ville, déplacements, cas. Éviter les pages satellites dupliquées.

#### SEO-5 · Données structurées

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
1. **L'organisation `#org` n'est définie que sur l'accueil**, alors que les 31 autres pages y font référence. Google lit chaque page isolément : inclure le nœud complet dans un include commun.
2. **`Person.sameAs`** liste aussi les comptes de l'entreprise : ne garder que `https://www.linkedin.com/in/oualidbenamara/` (URL vérifiée, elle ouvre bien le profil d'Oualid).
3. **`areaServed`** contient la chaîne `"International"`, qui n'est pas un lieu : la retirer.
4. Ajouter :
   - `sameAs` vers la fiche Google (IDX-5), `hasMap` ;
   - `openingHoursSpecification` aligné sur la fiche (**À VÉRIFIER**) ;
   - `contactPoint` (`telephone`, `contactType: "sales"`, `availableLanguage: ["fr","ar","en"]`) ;
   - `priceRange` (DÉCISION).
5. `FAQPage` ne produit plus de résultats enrichis pour ce type de site : on peut le garder, sans en attendre de gain.
6. Études de cas : `Article` sans `dateModified` ; utiliser plutôt `CreativeWork` avec `about` vers le client (déjà présent) et `image` en 1 200 × 630.

#### SEO-6 · Images de partage et `og:locale`

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- **Études de cas** : `og:image` pointe vers `*-desktop.webp` en **1 200 × 750**, alors que le HTML déclare `og:image:height = 630`. LinkedIn n'affiche pas le WebP. Générer `og-<cas>.jpg` en 1 200 × 630.
- **Articles** : les 9 utilisaient l'image générique. ✅ **Fait le 02/11** : une image par article, posée dans le back-office (voir l'avancement). Le gabarit du back-office doit encore ajouter `og:image:type` et `og:image:alt` (présents dans le paquet v7).
- **`og:locale`** : `fr_MA` n'est pas reconnu par Facebook. Utiliser `fr_FR` et garder `lang="fr-MA"`.

#### SEO-7 · E-E-A-T (expérience, expertise, autorité, fiabilité)

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : M
- La page auteur se limite à une ancre (`/a-propos/#oualid`) avec deux lignes. Créer une vraie section auteur :
  - parcours ;
  - domaines d'expertise ;
  - **certifications réelles** (**À VÉRIFIER** : lesquelles mettre en avant ; ne rien ajouter qui ne soit pas obtenu) ;
  - articles signés ;
  - lien LinkedIn.
- Afficher « Mis à jour le … » sur les articles. L'article « 5 erreurs Meta » n'a pas de bloc Sources : l'ajouter.
- ✅ **Fait le 02/11 dans le back-office (les 9 articles ont désormais la même structure)** :
  - encadré « En bref » en tête des 5 articles qui n'en avaient pas : résumé de l'article, sans nouvelle affirmation ;
  - bloc « Sources » ajouté sur 4 articles : Meta, WhatsApp, Google Business Profile, Google Search Central. Tous les liens ont été testés (200). L'article « Site vitrine, e-commerce ou plateforme » n'en a pas besoin : il ne cite aucune donnée de plateforme ;
  - liens Meta mis à jour vers la nouvelle documentation (`developers.facebook.com/documentation/ads-commerce/conversions-api`), sans redirection ;
  - **temps de lecture corrigés** : ils étaient environ deux fois trop longs (par exemple « 9 min » pour 825 mots). Ils sont maintenant calculés sur 200 mots par minute, de 3 à 5 min ;
  - article WhatsApp : le passage sur les modèles a été réécrit d'après la documentation Meta en vigueur. L'ancienne phrase « les modèles promotionnels sont souvent refusés » était inexacte. Le texte couvre maintenant les catégories utilitaire, marketing et authentification, la limite de messages marketing par personne, la fenêtre de 24 heures et l'accord préalable du client.
- ✅ **Index du Journal** : title, description et balises de partage harmonisés. L'ancienne description de partage annonçait des articles sur les réseaux sociaux qui n'existent pas.

---

### D.I · Contenu et exactitude

#### CONT-1 · Chiffres clients contredits par les sites des clients

- **Statut** : À VÉRIFIER avec les clients · **Priorité** : P0 · **Effort** : S

| Donnée publiée | Où | Ce que montre le site du client (02/11) | Action |
|---|---|---|---|
| Éléganza : « plus de 10 000 produits » | `/cas-clients/` ; `/cas-clients/eleganza/` (texte, meta description, JSON-LD) ; `/services/e-commerce/` ; `/services/publicite-meta-google-ads/`. Également **affiché par Google** dans l'extrait. | Sitemap Shopify : **≈ 4 006 fiches produit** (FR et EN identiques). L'audit d'Oualid donnait ≈ 3 894. | « près de 4 000 produits », ou « plus de 10 000 références » si le chiffre désigne les variantes |
| Pharmacie : « près de 700 produits » | page du cas, 3 pages services, `/site-reseaux/` | **967 fiches produit** dans le sitemap | Confirmer le nombre de produits **actifs** |
| Pharmacie : « plus de 100 marques » | page du cas (et extrait Google) | 84 pages marque dans le sitemap, mais le menu du site affiche « Marques de A à Z (114) » | ✅ conforme au site du client : on garde |
| Pharmacie : « 15 rayons » | page du cas | **16 pages catégorie** | Confirmer |
| Pharmacie : « Une pharmacienne répond sur WhatsApp » | page du cas, article site vitrine / e-commerce | Organisation convenue : un **agent au comptoir** | Confirmer la formulation |
| Pharmacie : « livraison à Rabat » | 4 pages | Le site du client annonce « Livraison Hay Riad en 2 h » | Aligner |
| La7daFan : « 6 collections, plus de 130 œuvres » | page du cas | 6 collections, 136 œuvres | ✅ exact |
| Cerafas : `/fr/corridors/casablanca-tanger` | page du cas | Répond 200 | ✅ exact |

#### CONT-2 · Typographie française : 337 espaces fautives

- **Statut** : VÉRIFIÉ · **Priorité** : P1 · **Effort** : S
- **Constat** : aucune espace insécable devant la ponctuation sur tout le site. On compte **337** espaces normales avant `: ; ? !` et **29** paires `« »` avec espaces normales. Sur mobile, la ponctuation passe à la ligne : « croissance mesurable / : sites sur mesure », « Meta, GA4, la caisse / : quel chiffre piloter ? », « 360° / · Rabat », « TikTok / · LinkedIn ».
- **Correctif** : script testé sur une copie des 32 pages. Aucune balise ni aucun script n'est modifié ; il reste 3 cas, dans des blocs `<code>`, ce qui est voulu. À intégrer à la build (voir CODE-1).

```python
#!/usr/bin/env python3
"""Typographie française : espaces insécables dans le TEXTE des pages (balises, attributs, <script>, <style>, <pre>, <code>, <textarea> intacts).
Usage : python3 fix_typo_fr.py dossier_du_site/   (modifie en place : committer avant)"""
import re, sys, pathlib
NNBSP, NBSP = ' ', ' '
SKIP = re.compile(r'(<(script|style|pre|code|textarea)\b.*?</\2\s*>|<!--.*?-->|<[^>]+>)', re.S | re.I)

def fix_text(t):
    t = re.sub(r'[   ]+([;!?])', NNBSP + r'\1', t)    # fine insécable avant ; ! ?
    t = re.sub(r'[   ]+:(?=\s|$)', NBSP + ':', t)      # insécable avant : (épargne 18:00 et https:)
    t = re.sub(r'«[   ]*', '«' + NNBSP, t)
    t = re.sub(r'[   ]*»', NNBSP + '»', t)
    t = re.sub(r'[  ]+·[  ]+', NBSP + '· ', t)          # séparateur « · » jamais en début de ligne
    return t

def fix_html(h):
    out, pos = [], 0
    for m in SKIP.finditer(h):
        out += [fix_text(h[pos:m.start()]), m.group(0)]; pos = m.end()
    return ''.join(out + [fix_text(h[pos:])])

for f in sorted(pathlib.Path(sys.argv[1]).rglob('*.html')):
    s = f.read_text(encoding='utf-8'); d = fix_html(s)
    if d != s: f.write_text(d, encoding='utf-8'); print('corrigé :', f)
```

  - Les numéros affichés (`+212 7 12 34 80 34`) doivent aussi utiliser des espaces insécables.

#### CONT-3 · Corrections de texte

| Où | Actuel | Correction | Statut |
|---|---|---|---|
| `/blog/` et les 4 articles du 1er novembre | « 1 novembre 2026 » | « 1er novembre 2026 » | VÉRIFIÉ |
| `/blog/erreurs-meta-ads/` | « que l'on peut **retoucher** selon les pages » | « **recibler** » | VÉRIFIÉ |
| `/cas-clients/` vs `/cas-clients/eleganza/` | « distributeur » d'un côté, « détaillant » de l'autre | un seul terme | VÉRIFIÉ |
| `/blog/erreurs-meta-ads/` | seul article sans bloc « Sources » | ajouter les sources | VÉRIFIÉ |
| Pharmacie, `/site-reseaux/`, article Fiche Google | « construits en même temps » | « conçus ensemble, par la même équipe » : les réseaux ont démarré en septembre, la boutique a été mise en ligne fin octobre | À VÉRIFIER |
| `/services/` | « Les 6 couches » numérotées de 00 à 05 ; la méthode, de 01 à 06 | harmoniser la numérotation | VÉRIFIÉ |

---

### D.J · Légal

#### LEG-1 · Mentions légales : une phrase de chantier publiée

- **Statut** : DÉCISION · **Priorité** : P1 · **Effort** : S
- **Texte affiché** : « Les informations d'immatriculation (forme juridique, capital, siège social, RC, ICE, IF) seront publiées sur cette page. »
- **Options** : (a) retirer la phrase et garder l'éditeur, le directeur de la publication et l'hébergeur ; (b) la remplacer par les informations exactes de l'entité qui édite le site. Ne rien inventer : le développeur attend le texte d'Oualid.

#### LEG-2 · Crédit « Designed & Engineered by Webotic »

- **Statut** : DÉCISION · **Priorité** : P1 · **Effort** : S
- Ce crédit figure en pied de page des 32 pages. Il contredit « Une seule équipe… un seul interlocuteur » (À propos) et le fait que le site vend la conception de sites. Si Oualid valide : le supprimer, ou écrire « Conçu et développé par OBM System ».

#### LEG-3 · Loi 09-08 : déclaration CNDP

- **Statut** : À VÉRIFIER · **Priorité** : P2 · **Effort** : S
- La page Confidentialité cite la loi 09-08, mais aucun numéro de récépissé de la **CNDP**. Si une déclaration a été faite, afficher son numéro ; sinon, voir avec un conseil juridique. Je ne suis pas juriste : c'est un point à faire valider.

---

### D.K · Code et chaîne de build

#### CODE-1 · Dette technique et build

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : M
1. **`site.css`** :
   - 32 media queries sur 10 seuils différents (560 à 1 000 px) ; consolider en 3 (600, 900, 1 200 px) ;
   - règles redéfinies plus bas (« Retouches kit v3 ») ; fusionner ;
   - **code mort** : classe `.logo` et ses règles (seul usage de `--orange`) ;
   - `--text-hero` déclaré mais contourné ;
   - fichier non minifié.
2. **`site.js`** :
   - `data-stagger` est géré mais présent sur aucun conteneur : l'ajouter à `.layers`, `.proofs` et `.posts`, ou retirer le code ;
   - `track()` est à corriger (TRK-2) ;
   - la clé LeadFlow est à retirer (SEC-1).
3. **Versionnement manuel** (`?v=5`) : passer à des noms hachés (`site.3f9a1c.css`) générés à la build, pour ne jamais servir un ancien fichier mis en cache 30 jours.
4. **Une étape de build** à chaque déploiement :
   - typographie (CONT-2) ;
   - minification CSS et JS ;
   - génération du `sitemap.xml` avec les vrais `lastmod` (IDX-9) et du flux RSS ;
   - notification IndexNow (IDX-4) ;
   - contrôles automatiques : html-validate, recherche de « apikey », liens cassés.
5. Validation HTML : rien de bloquant (balises vides auto-fermantes `<meta />`, iframe `noscript` sans `title`).

#### CODE-2 · Fichiers annexes

- **Statut** : VÉRIFIÉ · **Priorité** : P2 · **Effort** : S
- **`/humans.txt` obsolète** : « Last update 2026-05-18 », « Motion One 10 (CDN) », « Clash Display … via Fontshare » ne correspondent plus au site, et « Admin@ » prend une majuscule. Le mettre à jour ou le supprimer. Il remercie « Anthropic — Claude » : à garder ou retirer, **DÉCISION**.
- **`manifest.webmanifest`** :
  - le raccourci « Contact rapide » reprend la description du diagnostic ;
  - il n'y a **aucun service worker**, donc le manifest ne rend pas le site installable. Soit simplifier le manifest (nom, icônes, couleurs), soit ajouter un service worker minimal (P3).
- **`security.txt`** : correct, expire le 29/10/2027. Penser à le renouveler.

---

### D.L · Opportunités (P3, DÉCISION)

1. **Version anglaise** (`/en/`) des pages accueil, services et cas, avec `hreflang`. Le site annonce « Maroc & international » et vend des sites FR, AR et EN, mais il n'existe qu'en français.
2. **Version arabe** des pages clés, pour démontrer le savoir-faire RTL vendu sur la page « Création de sites ».
3. **Contenus piliers** et outils gratuits qui génèrent des liens et des leads, par exemple un **testeur de tracking** (« votre Pixel et votre CAPI sont-ils dédoublonnés ? ») ou un **check-up de fiche Google**.
4. **Adresse de contact** `contact@obm-system.com` en alias de `admin@`, plus naturelle pour un prospect.
5. **Suivi mensuel** : Search Console (pages indexées, requêtes hors marque), Bing Webmaster Tools, GA4 (événements clés par source), avis Google.

## Annexe E · Méthode et limites

- **Audit** : crawl des 32 URL du sitemap (desktop 1 440 px, mobile 390 px, contrôles à 820, 1 024 et 1 100 px), Lighthouse 12.6, axe-core 4.10, html-validate, en-têtes HTTP, DNS publics, Search Console, recherches Google, Bing et Maps, contrôle des chiffres clients sur leurs propres sites.
- **Actions réalisées en ligne le 02/11/2026**, avec l'accord d'Oualid et ses connexions :
  - Search Console, GA4 et Google Admin ;
  - DNS chez Genious ;
  - back-office `/admin` (articles, accueil, index du Journal, médiathèque) ;
  - fiche Google.
  Aucun mot de passe n'a été saisi par l'assistant. Aucune étude de cas n'a été enregistrée.
- **Pas d'accès** au serveur, au dépôt du site ni à LeadFlow. Les correctifs serveur sont fournis prêts à intégrer et doivent être adaptés à la configuration réelle (`nginx -t` avant tout rechargement).
- **Mesures de performance** : réalisées depuis un datacenter et en local, sans compression. Les valeurs de référence sont celles de PageSpeed Insights après la phase 1.
- **Contenus** : aucun chiffre, avis ni résultat n'a été inventé. Les sources ajoutées aux articles renvoient à la documentation officielle (Meta, WhatsApp, Google) et ont été testées le 02/11/2026.
