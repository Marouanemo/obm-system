#!/usr/bin/env bash
# ============================================================
# OBM SYSTEM — Deploy from Linux/Mac/WSL to Hetzner
# Usage:
#   ./deploy/deploy.sh user@server-ip
#   SSH_KEY=~/.ssh/id_ed25519 ./deploy/deploy.sh root@1.2.3.4
# ============================================================
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 user@server-ip"
  exit 1
fi

TARGET="$1"
REMOTE_PATH="${REMOTE_PATH:-/var/www/obm-system/public}"
SSH_KEY="${SSH_KEY:-}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SSH_OPTS=()
[ -n "$SSH_KEY" ] && SSH_OPTS+=("-i" "$SSH_KEY")

echo "==> Deploying OBM SYSTEM to $TARGET"
echo "    Project root : $PROJECT_ROOT"
echo "    Remote path  : $REMOTE_PATH"

ssh "${SSH_OPTS[@]}" "$TARGET" "mkdir -p $REMOTE_PATH"

if command -v rsync &>/dev/null; then
  rsync -avz --delete \
    --exclude '.git/' --exclude '.claude/' --exclude 'deploy/' --exclude '.gitignore' \
    -e "ssh ${SSH_OPTS[*]}" \
    "$PROJECT_ROOT/" "$TARGET:$REMOTE_PATH/"
else
  scp "${SSH_OPTS[@]}" -r \
    "$PROJECT_ROOT/index.html" \
    "$PROJECT_ROOT/robots.txt" \
    "$PROJECT_ROOT/sitemap.xml" \
    "$PROJECT_ROOT/assets" \
    "$TARGET:$REMOTE_PATH/"
fi

scp "${SSH_OPTS[@]}" "$PROJECT_ROOT/deploy/nginx.conf" "$TARGET:/etc/nginx/sites-available/obm-system.com"

ssh "${SSH_OPTS[@]}" "$TARGET" "
  chown -R www-data:www-data /var/www/obm-system &&
  ln -sf /etc/nginx/sites-available/obm-system.com /etc/nginx/sites-enabled/obm-system.com &&
  nginx -t &&
  systemctl reload nginx
"

echo "==> Deployment complete."
echo "    https://obm-system.com"
