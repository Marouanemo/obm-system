#!/usr/bin/env bash
# Récupère dans content-seed/ les articles et réglages édités dans le back-office en ligne.
# À lancer avant tout travail sur les contenus. Usage : bash deploy/recuperer-contenus.sh [hôte]
set -euo pipefail
HOST="${1:-hetzner}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
ssh "$HOST" "cd /var/www/obm-admin/content && tar czf - blog cases pages" | tar xzf - -C content-seed
git status --short content-seed
