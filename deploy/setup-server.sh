#!/usr/bin/env bash
# ============================================================
# OBM SYSTEM — Server bootstrap script (run ONCE on Hetzner)
# Tested on Ubuntu 22.04 / 24.04
# Usage:
#   chmod +x setup-server.sh && ./setup-server.sh
# ============================================================
set -euo pipefail

DOMAIN="obm-system.com"
EMAIL="Admin@obm-system.com"
WEB_ROOT="/var/www/obm-system/public"

echo "==> Updating system"
apt-get update -y
apt-get upgrade -y

echo "==> Installing nginx, certbot, ufw, git"
apt-get install -y nginx certbot python3-certbot-nginx ufw git

echo "==> Adding application/manifest+json MIME type for .webmanifest"
if ! grep -q "webmanifest" /etc/nginx/mime.types; then
  sed -i '/^types {/a\    application/manifest+json              webmanifest;' /etc/nginx/mime.types
fi

echo "==> Configuring firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Creating web root"
mkdir -p "$WEB_ROOT"
chown -R www-data:www-data /var/www/obm-system
chmod -R 755 /var/www/obm-system

echo "==> Placeholder index"
cat > "$WEB_ROOT/index.html" <<'HTML'
<!DOCTYPE html><html><head><meta charset="utf-8"><title>OBM SYSTEM</title></head>
<body style="font-family:sans-serif;text-align:center;padding:40px">
<h1>OBM SYSTEM</h1><p>Site en cours de déploiement.</p>
</body></html>
HTML

echo "==> Installing nginx config (HTTP only — TLS added after certbot)"
cat > /etc/nginx/sites-available/${DOMAIN} <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${WEB_ROOT};
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
}
NGINX

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> Requesting Let's Encrypt certificate"
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} \
  --non-interactive --agree-tos -m ${EMAIL} --redirect || {
    echo "Certbot failed — DNS may not be propagated yet."
    echo "Once DNS points to this server, re-run: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
}

echo "==> Replacing nginx config with production version"
echo "    (upload deploy/nginx.conf to /etc/nginx/sites-available/${DOMAIN} after TLS is issued)"

echo "==> Done."
echo "    Web root:       ${WEB_ROOT}"
echo "    Nginx config:   /etc/nginx/sites-available/${DOMAIN}"
echo "    Server IP:      \$(curl -s ifconfig.me)"
