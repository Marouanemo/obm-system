# OBM SYSTEM — Landing Page

> Système d'acquisition et d'automatisation conçu pour les cabinets dentaires ambitieux au Maroc.

Landing page premium, statique, optimisée pour la conversion. Construite sans framework — HTML/CSS/JS pur — pour un chargement quasi-instantané et une maintenance simple.

**Live :** https://obm-system.com

---

## 🏗️ Stack

- **HTML5** sémantique avec balisage SEO + Schema.org
- **CSS3** bespoke (variables, clamp, grid, container queries)
- **Vanilla JS** (IntersectionObserver, requestAnimationFrame)
- **Fonts** : Clash Display + Switzer + JetBrains Mono (via Fontshare)
- **Hébergement** : Nginx sur Hetzner Cloud
- **TLS** : Let's Encrypt (renouvellement auto via certbot)

Aucune dépendance npm, aucun build step. Tout fonctionne en ouvrant `index.html`.

---

## 📁 Structure

```
obm-system/
├── index.html              # Page principale
├── robots.txt              # SEO crawl rules
├── sitemap.xml             # SEO sitemap
├── assets/
│   ├── css/styles.css      # Stylesheet bespoke
│   ├── js/script.js        # Animations + interactions
│   └── img/                # Logos, favicon, OG image
└── deploy/
    ├── nginx.conf          # Config nginx production
    ├── setup-server.sh     # Bootstrap initial du serveur (à exécuter UNE fois)
    ├── deploy.sh           # Déploiement Linux/Mac/WSL
    └── deploy.ps1          # Déploiement Windows PowerShell
```

---

## 🚀 Déploiement

### 1. Première fois — bootstrap du serveur Hetzner

```bash
# Sur ton serveur Hetzner (SSH root)
scp deploy/setup-server.sh root@<IP>:/root/
ssh root@<IP>
chmod +x setup-server.sh && ./setup-server.sh
```

Ce script installe nginx, certbot, ufw, crée le webroot et configure le pare-feu.

### 2. Pointer le DNS

Voir section **DNS** ci-dessous.

### 3. Déployer les fichiers

**Depuis Windows :**
```powershell
.\deploy\deploy.ps1 -ServerIp "<IP>" -User "root"
```

**Depuis Linux/Mac/WSL :**
```bash
./deploy/deploy.sh root@<IP>
```

---

## 🌐 DNS — pointages

Chez le registrar de `obm-system.com`, configurer :

| Type  | Nom (Host) | Valeur            | TTL  |
|-------|------------|-------------------|------|
| A     | @          | `<IP Hetzner>`    | 3600 |
| A     | www        | `<IP Hetzner>`    | 3600 |
| CAA   | @          | `0 issue "letsencrypt.org"` | 3600 |

**Propagation** : 5 min à 24h selon le registrar. Vérifier avec :
```bash
dig +short obm-system.com
dig +short www.obm-system.com
```

---

## ✏️ Modifier le contenu

Tout est dans `index.html`. Pour modifier :
- **Téléphone** : chercher `07 12 34 80 34` et `212712348034`
- **Email** : chercher `Admin@obm-system.com`
- **Textes** : sections clairement délimitées par des commentaires HTML

Re-déployer après modification :
```bash
./deploy/deploy.sh root@<IP>
```

---

## 📊 Performance & SEO

- ✅ Mobile-first responsive
- ✅ Lighthouse score visé : 95+ Performance, 100 Accessibility, 100 SEO
- ✅ Open Graph + Twitter Card
- ✅ Schema.org ProfessionalService
- ✅ Sitemap + robots.txt
- ✅ `prefers-reduced-motion` respecté
- ✅ HTTPS + HSTS + security headers
- ✅ Compression gzip + cache long terme sur assets

---

## 🎨 Charte

- **Navy** `#0B1E3F` — confiance, premium
- **Silver** `#C8CCD4` — modernité, technologie
- **Gold** `#C9A961` — croissance, prestige, ROI

---

© OBM SYSTEM — Tous droits réservés.
