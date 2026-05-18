# OBM SYSTEM — Guide de configuration GTM + GA4

> Référence de configuration analytics pour `obm-system.com`.
> **Container GTM** : `GTM-TTPCSLV9` (pour Meta Pixel, Google Ads, autres pixels)
> **GA4 Measurement ID** : `G-JGDV0VS9B9` (installé en direct via gtag.js)

## 🏗️ Architecture choisie

Le site utilise une **architecture hybride** :

```
                    ┌────────────────────┐
                    │  Site (browser)    │
                    │  dataLayer.push()  │
                    └─────────┬──────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌───────────────┐         ┌──────────────────┐
        │     GTM       │         │   gtag.js        │
        │ GTM-TTPCSLV9  │         │  G-JGDV0VS9B9    │
        │               │         │                  │
        │ Triggers →    │         │ → GA4 direct     │
        │ Meta Pixel,   │         │ (pageviews +     │
        │ Google Ads,   │         │  events bridged) │
        │ autres pixels │         │                  │
        └───────────────┘         └──────────────────┘
```

**Pourquoi cette archi :**
- ✅ GA4 reçoit les events DIRECTEMENT via gtag (pas besoin de tags GA4 dans GTM)
- ✅ Pas de duplication
- ✅ GTM reste utile pour Meta Pixel, Google Ads conversion, etc.
- ⚠️ **NE PAS créer de tag "GA4 Configuration" ni "GA4 Event" dans GTM** — ça causerait des doublons

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

### `calendly_opened`
**Quand** : clic sur un bouton Calendly (CTA, success messages) — la popup s'ouvre
**Paramètres** :
| Nom | Type | Valeurs |
|-----|------|---------|
| `source` | string | Label du bouton ou data-source (ex: `CTA - Réserver créneau`, `Diagnostic success - Calendly`) |

### `calendly_slot_selected`
**Quand** : l'utilisateur choisit une date+heure dans la popup Calendly
**Paramètres** : aucun
**Usage** : indique une intention forte de booking (étape avant la complétion)

### `calendly_booking_completed` ⭐ CONVERSION ULTRA-FORTE
**Quand** : l'utilisateur valide définitivement son rendez-vous Calendly (postMessage `calendly.event_scheduled`)
**Paramètres** :
| Nom | Type | Valeurs |
|-----|------|---------|
| `event_uri` | string | URI Calendly de l'événement (ex: `https://api.calendly.com/scheduled_events/XXX`) |
| `invitee_uri` | string | URI Calendly de l'invité (peut être utilisé pour récupérer email via API Calendly) |

**Usage** : **conversion la plus qualifiée du site** — la personne a non seulement laissé ses infos, elle s'est engagée sur un créneau précis. À utiliser comme **valeur de conversion principale** dans Google Ads / Meta Ads. À marquer comme conversion dans GA4 (poids supérieur à `form_submitted`).

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

### Étape C — Tags dans GTM

**🚫 NE PAS créer de tags GA4** (Configuration ni Event) dans GTM. GA4 reçoit déjà les events directement via gtag.js installé en `<head>`. Créer des tags GA4 dans GTM causerait des **doublons** dans tes rapports.

GTM te sert maintenant à connecter **d'autres pixels** :

#### Exemples de tags utiles à créer dans GTM

**Meta Pixel — Lead** (si tu lances des Meta Ads)
- Type : Custom HTML ou Meta Pixel template
- Trigger : `T - Lead Acquired (New Only)`
- Code : `fbq('track', 'Lead');`

**Google Ads Conversion — Lead**
- Type : Google Ads Conversion Tracking
- ID de conversion + Étiquette : ceux de ton compte Google Ads
- Trigger : `T - Lead Acquired (New Only)`
- Valeur de conversion : `{{DLV - score}}` (optionnel, pour valoriser les leads à fort score)

**LinkedIn Insight Tag — Lead** (B2B)
- Type : LinkedIn Insight (Custom HTML)
- Trigger : `T - Lead Acquired (New Only)`

**TikTok Pixel** (si pertinent)
- Trigger : `T - Lead Acquired (New Only)`
- Event : `CompletePayment` ou `SubmitForm`

### Étape D — Publier le container

1. Cliquer **Submit** en haut à droite
2. Nom de version : ex. `v1 - GTM setup initial`
3. Publier

---

## 3. Configuration GA4

✅ **GA4 est déjà installé** sur le site via gtag.js (Measurement ID : `G-JGDV0VS9B9`). Les pageviews et tous les events du dataLayer (diagnostic_*, form_submitted, whatsapp_clicked, etc.) arrivent directement dans GA4 sans aucune config supplémentaire.

### Étape A — Marquer les événements de conversion

Attendre 24-48h que les événements apparaissent dans GA4 (Admin → Événements).

Puis dans **GA4 → Admin → Événements** → activer le toggle "Marquer comme conversion" pour :

- ✅ `form_submitted` (conversion business principale)
- ✅ `diagnostic_completed` (soft conversion qualifiée)
- ⬜ `whatsapp_clicked` (soft conversion, optionnel)
- ⬜ `phone_clicked` (soft conversion, optionnel)

### Étape B — Créer les dimensions personnalisées

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
