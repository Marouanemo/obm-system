# OBM SYSTEM — Guide de configuration GTM + GA4

> Référence de configuration analytics pour `obm-system.com`.
> Container GTM : `GTM-TTPCSLV9`

---

## 1. Événements `dataLayer` (déjà actifs sur le site)

Les événements sont automatiquement poussés par `assets/js/script.js`. Tu n'as RIEN à coder côté site — il faut juste configurer GTM pour les consommer.

### `diagnostic_started`
**Quand** : l'utilisateur clique sur "Commencer maintenant" dans le hero
**Paramètres** : aucun
**Usage** : soft conversion, top-of-funnel engagement, audience retargeting

### `diagnostic_question_answered`
**Quand** : chaque clic d'option dans les 7 questions
**Paramètres** :
| Nom | Type | Valeurs |
|-----|------|---------|
| `question` | number | 1 à 7 |
| `value` | number | 1 à 4 (score de l'option) |

**Usage** : analyse de drop entre les questions du funnel diagnostic

### `diagnostic_completed`
**Quand** : le score s'affiche en fin de quiz
**Paramètres** :
| Nom | Type | Valeurs |
|-----|------|---------|
| `score` | number | 0 à 100 |
| `score_band` | string | `Embryonnaire` \| `En construction` \| `Avancé` \| `Mature` |
| `total_points` | number | 0 à 28 (somme brute) |

**Usage** : soft conversion qualifiée, segmentation audience par maturité

### `form_submitted` ⭐ CONVERSION PRINCIPALE
**Quand** : lead créé avec succès dans LeadFlow
**Paramètres** :
| Nom | Type | Valeurs |
|-----|------|---------|
| `form_source` | string | `main_audit` \| `diagnostic` |
| `duplicate` | boolean | `true` si lead déjà existant |
| `lead_id` | string | ID LeadFlow (ex: `cmp1l9j206e7...`) |
| `has_email` | boolean | email rempli ou non |
| `has_ville` | boolean | ville remplie ou non |
| `score` | number | présent uniquement si `form_source = diagnostic` |
| `score_band` | string | présent uniquement si `form_source = diagnostic` |

**Usage** : **conversion business** — c'est l'événement à compter comme lead acquis

### `whatsapp_clicked`
**Quand** : clic sur n'importe quel lien WhatsApp (FAB, hero, CTA, footer)
**Paramètres** :
| Nom | Type | Valeurs |
|-----|------|---------|
| `source` | string | Label du bouton (ex: `Discuter sur WhatsApp`, `Ou passer directement sur WhatsApp`) |

### `phone_clicked`
**Quand** : clic sur n'importe quel lien `tel:`
**Paramètres** :
| Nom | Type |
|-----|------|
| `number` | string (ex: `+212712348034`) |
| `source` | string |

### `email_clicked`
**Quand** : clic sur n'importe quel lien `mailto:`
**Paramètres** :
| Nom | Type |
|-----|------|
| `address` | string |
| `source` | string |

---

## 2. Configuration GTM

### Étape A — Créer les variables de dataLayer

Dans GTM : **Variables → Variables définies par l'utilisateur → Nouvelle**

Pour chaque variable :
- **Type** : Variable de couche de données
- **Nom de la variable** (champ "Nom de la variable de couche de données") : voir colonne 2 du tableau
- **Version de la couche de données** : Version 2

| Nom GTM (libellé) | Nom de la variable dataLayer |
|-------------------|-------------------------------|
| `DLV - score` | `score` |
| `DLV - score_band` | `score_band` |
| `DLV - total_points` | `total_points` |
| `DLV - form_source` | `form_source` |
| `DLV - duplicate` | `duplicate` |
| `DLV - lead_id` | `lead_id` |
| `DLV - has_email` | `has_email` |
| `DLV - has_ville` | `has_ville` |
| `DLV - question` | `question` |
| `DLV - value` | `value` |
| `DLV - source` | `source` |
| `DLV - number` | `number` |
| `DLV - address` | `address` |

### Étape B — Créer les triggers (déclencheurs)

Dans GTM : **Triggers → Nouveau**

Pour chaque trigger :
- **Type de trigger** : Événement personnalisé
- **Nom de l'événement** : copier-coller exact depuis la colonne 2
- **Le trigger se déclenche sur** : Tous les événements personnalisés (sauf indication contraire)

| Nom du trigger | Nom de l'événement | Condition supplémentaire |
|----------------|---------------------|--------------------------|
| `T - Diagnostic Started` | `diagnostic_started` | — |
| `T - Diagnostic Question Answered` | `diagnostic_question_answered` | — |
| `T - Diagnostic Completed` | `diagnostic_completed` | — |
| `T - Form Submitted (All)` | `form_submitted` | — |
| `T - Form Submitted (Main Audit)` | `form_submitted` | `DLV - form_source` égal à `main_audit` |
| `T - Form Submitted (Diagnostic)` | `form_submitted` | `DLV - form_source` égal à `diagnostic` |
| `T - Lead Acquired (New Only)` | `form_submitted` | `DLV - duplicate` égal à `false` |
| `T - WhatsApp Clicked` | `whatsapp_clicked` | — |
| `T - Phone Clicked` | `phone_clicked` | — |
| `T - Email Clicked` | `email_clicked` | — |

### Étape C — Créer les tags GA4 (après avoir créé la propriété GA4)

#### C.1 — Tag GA4 Configuration (un seul)

- **Type de tag** : Google Tag (ou GA4 Configuration selon ta version GTM)
- **ID de balise** : `G-XXXXXXXXXX` (ton Measurement ID GA4)
- **Trigger** : All Pages — Initialization
- **Nom** : `GA4 - Config`

#### C.2 — Tags GA4 Event (un par événement)

Pour chacun, **Type de tag** : `Google Analytics: GA4 Event`
**Configuration Tag** : sélectionner `GA4 - Config`

| Nom du tag | Event Name | Trigger | Paramètres d'événement |
|------------|-----------|---------|------------------------|
| `GA4 - Diagnostic Started` | `diagnostic_started` | `T - Diagnostic Started` | — |
| `GA4 - Diagnostic Completed` | `diagnostic_completed` | `T - Diagnostic Completed` | `score: {{DLV - score}}`, `score_band: {{DLV - score_band}}`, `total_points: {{DLV - total_points}}` |
| `GA4 - Lead Submitted` | `lead_submitted` | `T - Lead Acquired (New Only)` | `form_source: {{DLV - form_source}}`, `score: {{DLV - score}}`, `score_band: {{DLV - score_band}}`, `has_email: {{DLV - has_email}}`, `has_ville: {{DLV - has_ville}}` |
| `GA4 - WhatsApp Click` | `whatsapp_click` | `T - WhatsApp Clicked` | `source: {{DLV - source}}` |
| `GA4 - Phone Click` | `phone_click` | `T - Phone Clicked` | `number: {{DLV - number}}`, `source: {{DLV - source}}` |
| `GA4 - Email Click` | `email_click` | `T - Email Clicked` | `address: {{DLV - address}}`, `source: {{DLV - source}}` |

### Étape D — Publier le container

1. Cliquer **Submit** en haut à droite
2. Nom de version : ex. `v1 - GTM setup initial`
3. Publier

---

## 3. Configuration GA4

### Étape A — Créer la propriété (si pas déjà fait)

1. Aller sur https://analytics.google.com → **Admin** → **Créer une propriété**
2. Nom de la propriété : `OBM SYSTEM`
3. Fuseau horaire : `(GMT+01:00) Casablanca`
4. Devise : `MAD - Dirham marocain` (ou EUR si tu factures en euros)
5. Catégorie : `Business and industrial markets`
6. Taille : `Small`
7. **Configurer un flux de données** :
   - Plateforme : `Web`
   - URL : `https://obm-system.com`
   - Nom du flux : `OBM SYSTEM Web`
   - **Mesure améliorée** : laisser activée par défaut
8. Récupérer le **Measurement ID** (format `G-XXXXXXXXXX`) — c'est lui à mettre dans le tag GA4 Config de GTM

### Étape B — Marquer les événements de conversion

Après la publication GTM, attendre 24-48h que les événements apparaissent dans GA4.

Puis dans **GA4 → Admin → Événements** → activer le toggle "Marquer comme conversion" pour :

- ✅ `lead_submitted` (conversion principale)
- ✅ `diagnostic_completed` (soft conversion qualifiée)
- ⬜ `whatsapp_click` (soft conversion, optionnel)
- ⬜ `phone_click` (soft conversion, optionnel)

### Étape C — Créer les dimensions personnalisées

Dans **GA4 → Admin → Définitions personnalisées → Créer dimensions personnalisées** :

| Nom de dimension | Étendue | Paramètre dans l'événement |
|------------------|---------|----------------------------|
| Score Maturité | Événement | `score` |
| Bande Maturité | Événement | `score_band` |
| Source formulaire | Événement | `form_source` |
| Email fourni | Événement | `has_email` |
| Ville fournie | Événement | `has_ville` |
| Source clic | Événement | `source` |

---

## 4. Audiences recommandées (pour remarketing Meta/Google Ads)

Dans **GA4 → Admin → Audiences → Nouvelle audience** :

### A1 — Diagnostic abandonné
**Inclure** : `diagnostic_started` dans les 30 derniers jours
**Exclure** : `lead_submitted` dans les 30 derniers jours
→ Cible pour remarketing "Vous avez commencé un diagnostic..."

### A2 — Cabinets matures (haute valeur)
**Inclure** : `diagnostic_completed` avec `score_band` = `Mature` (30 derniers jours)
→ Audience premium pour campagnes haut de gamme

### A3 — Cabinets en construction (opportunité)
**Inclure** : `diagnostic_completed` avec `score_band` = `En construction` OU `Embryonnaire`
→ Audience grand potentiel de transformation

### A4 — Engagé mais pas converti
**Inclure** : 2+ sessions ET `whatsapp_click` OU `phone_click`
**Exclure** : `lead_submitted`
→ Pour remarketing aggressif avec offre limitée

---

## 5. Vérification — Mode aperçu GTM

1. Dans GTM, cliquer **Preview** en haut à droite
2. Une fenêtre Tag Assistant s'ouvre
3. Coller `https://obm-system.com` et cliquer Connect
4. Sur la page ouverte, faire :
   - Clic sur "Commencer maintenant" → vérifier `diagnostic_started` dans Tag Assistant
   - Répondre aux 7 questions → vérifier 7× `diagnostic_question_answered`
   - Vérifier `diagnostic_completed` à la fin avec score
   - Remplir le formulaire et soumettre → vérifier `form_submitted` avec `lead_id`
   - Clic sur le FAB WhatsApp → vérifier `whatsapp_clicked`

5. Si tous les events apparaissent : **Submit & Publish** le container

---

## 6. Inspection rapide du dataLayer dans la console

Sur n'importe quelle page d'`obm-system.com`, ouvrir la console (F12) et taper :

```js
dataLayer
```

→ Tu vois le tableau complet des events poussés depuis le chargement de la page.

Pour suivre en temps réel les nouveaux events :

```js
const _origPush = dataLayer.push;
dataLayer.push = function(...args) { console.log('📡', ...args); return _origPush.apply(this, args); };
```

Puis interagir avec la page : chaque push s'affiche dans la console.

---

© OBM SYSTEM — Réf : `GTM-TTPCSLV9`
