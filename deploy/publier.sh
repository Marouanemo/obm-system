#!/usr/bin/env bash
# ============================================================
# OBM System : mise en ligne des fichiers du site et du back-office
#
# Usage (Git Bash, depuis la racine du dépôt) :
#   bash deploy/publier.sh            # hôte SSH par défaut : hetzner (voir ~/.ssh/config)
#   bash deploy/publier.sh mon-hote
#
# Garde-fous :
#   - les articles et réglages du back-office (content/blog, content/pages) ne sont pas écrasés,
#     sauf import explicite (IMPORT_CONTENUS=1) : ils sont édités en ligne.
#     Pour les récupérer : bash deploy/recuperer-contenus.sh
#   - aucune suppression dans la racine web, /assets/uploads/ n'est pas touché
#   - la config nginx n'est pas modifiée ici (voir deploy/nginx.conf)
# ============================================================
set -euo pipefail

HOST="${1:-hetzner}"
PUBLIC=/var/www/obm-system/public
ADMIN=/var/www/obm-admin
STAMP=$(date +%Y%m%d-%H%M%S)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Serveur : $HOST"
read -r -p "Publier sur obm-system.com ? (oui/non) " ok
[ "$ok" = "oui" ] || { echo "Annulé."; exit 1; }

echo "==> 1/4 Sauvegarde : /root/backup-obm-$STAMP.tgz"
ssh "$HOST" "tar czf /root/backup-obm-$STAMP.tgz --exclude=assets/uploads $PUBLIC $ADMIN/content $ADMIN/services $ADMIN/views /etc/nginx/sites-enabled/obm-system.com 2>/dev/null; ls -lh /root/backup-obm-$STAMP.tgz"

echo "==> 2/4 Site statique (sans suppression)"
tar czf - index.html 404.html favicon.ico e48c30133e89edf66822bbebc5640e7b.txt site-reseaux services methode contact \
  agence-marketing-digital-casablanca diagnostic-de-croissance a-propos mentions-legales confidentialite assets .well-known robots.txt \
  manifest.webmanifest llms.txt llms-full.txt humans.txt \
  | ssh "$HOST" "tar xzf - -C $PUBLIC"

echo "==> 3/4 Back-office"
scp -q admin/services/layout.js admin/services/org.json admin/services/generator.js admin/services/content.js admin/services/pages.js admin/services/landing-seo.js "$HOST:$ADMIN/services/"
scp -q admin/views/*.ejs "$HOST:$ADMIN/views/"
scp -q content-seed/cases/*.md "$HOST:$ADMIN/content/cases/"
if [ "${IMPORT_CONTENUS:-0}" = 1 ]; then
  # Import exceptionnel (nouvelle version du site) : remplace les articles et réglages du serveur par content-seed/.
  # Ne jamais l'utiliser sans avoir lancé deploy/recuperer-contenus.sh juste avant.
  echo "    Import des articles et réglages de content-seed/"
  scp -q content-seed/blog/*.md "$HOST:$ADMIN/content/blog/"
  scp -q content-seed/pages/*.json "$HOST:$ADMIN/content/pages/"
fi

echo "==> 4/4 Génération (articles, réalisations, sitemap, flux RSS)"
CACHE_V=$(grep -o "CACHE_V || '[^']*'" admin/services/layout.js | cut -d"'" -f2)
echo "    CACHE_V=$CACHE_V"
ssh "$HOST" "cd $ADMIN && cp .env .env.bak-$STAMP && (grep -q '^CACHE_V=' .env && sed -i 's/^CACHE_V=.*/CACHE_V=$CACHE_V/' .env || echo 'CACHE_V=$CACHE_V' >> .env) && pm2 restart obm-admin --update-env >/dev/null && npm run --silent generate && chown -R www-data:www-data $PUBLIC"

echo ""
echo "==> Terminé. Vérifications :"
for u in / /site-reseaux/ /blog/ /blog/feed.xml /cas-clients/ /cas-clients/pharmacie-gare-hay-riad/ /diagnostic-de-croissance/; do
  printf "  %-48s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' "https://obm-system.com$u")"
done
echo "Sauvegarde : $HOST:/root/backup-obm-$STAMP.tgz"
