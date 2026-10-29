# ============================================================
# OBM SYSTEM — Deploy from Windows to Hetzner
# Usage:
#   .\deploy\deploy.ps1 -ServerIp "X.X.X.X" -User "root"
#   .\deploy\deploy.ps1 -ServerIp "X.X.X.X" -User "root" -KeyPath "$HOME\.ssh\id_ed25519"
# ============================================================
param(
  [Parameter(Mandatory=$true)] [string]$ServerIp,
  [string]$User = "root",
  [string]$KeyPath = $null,
  [string]$RemotePath = "/var/www/obm-system/public"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==> Deploying OBM SYSTEM to $User@$ServerIp" -ForegroundColor Cyan
Write-Host "    Project root : $ProjectRoot"
Write-Host "    Remote path  : $RemotePath"

$sshArgs = @()
$scpArgs = @()
if ($KeyPath) {
  $sshArgs += "-i"; $sshArgs += $KeyPath
  $scpArgs += "-i"; $scpArgs += $KeyPath
}

# Ensure remote dir exists
Write-Host "==> Ensuring remote directory exists..."
& ssh @sshArgs "$User@$ServerIp" "mkdir -p $RemotePath && chown -R www-data:www-data /var/www/obm-system"

# Upload site files (exclude deploy/ and .git/)
Write-Host "==> Uploading site files..."
$files = @("index.html", "robots.txt", "sitemap.xml", "manifest.webmanifest", "llms.txt", "llms-full.txt", "humans.txt", ".gitignore", "README.md")
foreach ($f in $files) {
  $path = Join-Path $ProjectRoot $f
  if (Test-Path $path) {
    & scp @scpArgs $path "$User@${ServerIp}:$RemotePath/"
  }
}

# Upload assets directory
Write-Host "==> Uploading assets/ ..."
& scp @scpArgs -r (Join-Path $ProjectRoot "assets") "$User@${ServerIp}:$RemotePath/"

# Upload hand-written pages (blog/ and cas-clients/ are generated on the server by the admin)
foreach ($d in @("site-reseaux", "services", "methode", "contact")) {
  Write-Host "==> Uploading $d/ ..."
  & scp @scpArgs -r (Join-Path $ProjectRoot $d) "$User@${ServerIp}:$RemotePath/"
}

# nginx : la config active est /etc/nginx/sites-enabled/obm-system.com (fichier réel).
# deploy/nginx.conf en est une copie de référence ; elle n'est pas envoyée automatiquement.

Write-Host ""
Write-Host "==> Deployment complete." -ForegroundColor Green
Write-Host "    https://obm-system.com"
