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
$files = @("index.html", "robots.txt", "sitemap.xml", ".gitignore", "README.md")
foreach ($f in $files) {
  $path = Join-Path $ProjectRoot $f
  if (Test-Path $path) {
    & scp @scpArgs $path "$User@${ServerIp}:$RemotePath/"
  }
}

# Upload assets directory
Write-Host "==> Uploading assets/ ..."
& scp @scpArgs -r (Join-Path $ProjectRoot "assets") "$User@${ServerIp}:$RemotePath/"

# Upload nginx config
Write-Host "==> Uploading nginx config..."
& scp @scpArgs (Join-Path $PSScriptRoot "nginx.conf") "$User@${ServerIp}:/etc/nginx/sites-available/obm-system.com"

# Reload nginx
Write-Host "==> Reloading nginx..."
& ssh @sshArgs "$User@$ServerIp" "ln -sf /etc/nginx/sites-available/obm-system.com /etc/nginx/sites-enabled/obm-system.com && nginx -t && systemctl reload nginx"

Write-Host ""
Write-Host "==> Deployment complete." -ForegroundColor Green
Write-Host "    https://obm-system.com"
