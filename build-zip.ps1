# ============================================================
# Tripnaari - cPanel Deployment Script
# Usage: npm run build:zip
# ============================================================

# Step 1: Build
Write-Host "`nStep 1: Running next build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBuild failed! Fix the errors above before deploying." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Define paths
$standalonePath = ".next\standalone"
$publicPath     = "public"
$staticPath     = ".next\static"
$zipPath        = "deploy.zip"

Write-Host "`nStep 2: Preparing standalone folder assets..." -ForegroundColor Cyan

# Clean stale assets inside standalone
if (Test-Path "$standalonePath\public")       { Remove-Item -Recurse -Force "$standalonePath\public" }
if (Test-Path "$standalonePath\.next\static") { Remove-Item -Recurse -Force "$standalonePath\.next\static" }

# Copy public/ to standalone/public/
if (Test-Path $publicPath) {
    Copy-Item -Path $publicPath -Destination "$standalonePath\public" -Recurse -Force
    Write-Host "  [OK] Copied public/ folder" -ForegroundColor Gray
} else {
    Write-Host "  [WARN] public/ folder not found, skipping." -ForegroundColor Yellow
}

# Copy .next/static/ to standalone/.next/static/
if (Test-Path $staticPath) {
    New-Item -ItemType Directory -Path "$standalonePath\.next\static" -Force | Out-Null
    Copy-Item -Path "$staticPath\*" -Destination "$standalonePath\.next\static" -Recurse -Force
    Write-Host "  [OK] Copied .next\static\ folder" -ForegroundColor Gray
} else {
    Write-Host "  [WARN] .next\static\ folder not found, skipping." -ForegroundColor Yellow
}

# Step 3: Create ZIP using .NET for reliable hidden-file support (handles .env etc.)
Write-Host "`nStep 3: Creating $zipPath..." -ForegroundColor Cyan
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$fullStandalonePath = (Resolve-Path $standalonePath).Path
$fullZipPath        = Join-Path (Get-Location) $zipPath

[System.IO.Compression.ZipFile]::CreateFromDirectory($fullStandalonePath, $fullZipPath)

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "`nSuccess! '$zipPath' created ($sizeMB MB)." -ForegroundColor Green
Write-Host "Upload this file to cPanel File Manager under your tripnaari.com folder and extract it." -ForegroundColor Green
Write-Host "Then set Application startup file to: server.js" -ForegroundColor Green
