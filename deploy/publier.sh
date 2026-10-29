#!/usr/bin/env bash
# ============================================================
# OBM System — mise en ligne de la refonte « agence digitale »
#
# Usage (Git Bash, depuis la racine du dépôt) :
#   bash deploy/publier.sh            # hôte SSH par défaut : hetzner (voir ~/.ssh/config)
#   bash deploy/publier.sh mon-hote
#
# Étapes :
#   1. Sauvegarde sur le serveur (site public, contenus du back-office, config nginx)
#   2. Envoi du site statique (accueil, offre, assets, fichiers racine)
#   3. Mise à jour du back-office (générateur, gabarits, réglages SEO par défaut)
#   4. Archivage des anciens contenus dentaires, chargement de content-seed/, régénération
#   La config nginx n'est pas touchée : deploy/nginx.conf est une copie de
#   /etc/nginx/sites-enabled/obm-system.com (fichier réel, pas un lien).
# ============================================================
set -euo pipefail

HOST="${1:-hetzner}"
PUBLIC=/var/www/obm-system/public
ADMIN=/var/www/obm-admin
STAMP=$(date +%Y%m%d-%H%M%S)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Serveur : $HOST"
read -r -p "Publier la refonte sur obm-system.com ? (oui/non) " ok
[ "$ok" = "oui" ] || { echo "Annulé."; exit 1; }

echo "==> 1/4 Sauvegarde : /root/backup-obm-$STAMP.tgz"
ssh "$HOST" "tar czf /root/backup-obm-$STAMP.tgz $PUBLIC $ADMIN/content $ADMIN/services $ADMIN/views /etc/nginx/sites-enabled/obm-system.com 2>/dev/null; ls -lh /root/backup-obm-$STAMP.tgz"

echo "==> 2/4 Site statique"
scp -q -r index.html site-reseaux services methode contact assets robots.txt sitemap.xml manifest.webmanifest llms.txt llms-full.txt humans.txt "$HOST:$PUBLIC/"
ssh "$HOST" "rm -rf $PUBLIC/blog/meta-ads-cabinets-dentaires-erreurs $PUBLIC/blog/whatsapp-automation-cabinets-dentaires $PUBLIC/cas-clients/cabinet-facettes-rabat $PUBLIC/cas-clients/cabinet-implants-casablanca $PUBLIC/assets/css/styles.css $PUBLIC/assets/js/script.js $PUBLIC/assets/img/og-cover.svg"

echo "==> 3/4 Back-office"
scp -q admin/services/generator.js admin/services/content.js admin/services/pages.js admin/services/landing-seo.js "$HOST:$ADMIN/services/"
scp -q admin/views/editor.ejs admin/views/pages-edit.ejs "$HOST:$ADMIN/views/"

echo "==> 4/4 Contenus"
ssh "$HOST" "mkdir -p $ADMIN/content-archive-$STAMP && cd $ADMIN/content && \
  for d in blog cases pages; do [ -d \$d ] && mv \$d $ADMIN/content-archive-$STAMP/ ; done; \
  mkdir -p blog cases pages"
scp -q content-seed/blog/*.md "$HOST:$ADMIN/content/blog/"
scp -q content-seed/cases/*.md "$HOST:$ADMIN/content/cases/"
scp -q content-seed/pages/*.json "$HOST:$ADMIN/content/pages/"
# Version des assets : même valeur que la valeur par défaut du générateur (le .env du serveur prime sinon)
CACHE_V=$(grep -o "CACHE_V || '[^']*'" admin/services/generator.js | cut -d"'" -f2)
echo "    CACHE_V=$CACHE_V"
ssh "$HOST" "cd $ADMIN && cp .env .env.bak-$STAMP && (grep -q '^CACHE_V=' .env && sed -i 's/^CACHE_V=.*/CACHE_V=$CACHE_V/' .env || echo 'CACHE_V=$CACHE_V' >> .env) && pm2 restart obm-admin --update-env >/dev/null && npm run --silent generate && chown -R www-data:www-data $PUBLIC"

echo ""
echo "==> Terminé. Vérifications :"
for u in / /site-reseaux/ /blog/ /cas-clients/ /cas-clients/pharmacie-gare-hay-riad/ /blog/meta-ads-cabinets-dentaires-erreurs/; do
  printf "  %-48s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "https://obm-system.com$u")"
done
echo "Sauvegarde : $HOST:/root/backup-obm-$STAMP.tgz · anciens contenus : $ADMIN/content-archive-$STAMP"
