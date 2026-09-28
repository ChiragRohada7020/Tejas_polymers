# ============================================================
#  AgriGrid Industries - Demo Launcher
#  Starts the website + a public Cloudflare tunnel, then shows
#  the shareable demo URL.
#
#  Usage: right-click -> "Run with PowerShell"
#         or: powershell -ExecutionPolicy Bypass -File start-demo.ps1
# ============================================================

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# --- 1. Build if needed ---
if (-not (Test-Path ".next")) {
    Write-Host "First run: building the site (2-3 minutes)..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Host "Build failed." -ForegroundColor Red; exit 1 }
}

# --- 2. Start the website server (hidden) ---
Write-Host "Starting website on http://localhost:3000 ..." -ForegroundColor Green
$server = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm start > demo-server.log 2>&1" `
    -WindowStyle Hidden -PassThru

Start-Sleep -Seconds 5

# --- 3. Start the Cloudflare tunnel (hidden) ---
Write-Host "Starting Cloudflare tunnel ..." -ForegroundColor Green
$tunnel = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "cloudflared\cloudflared.exe tunnel --url http://127.0.0.1:3000 > demo-tunnel.log 2>&1" `
    -WindowStyle Hidden -PassThru

# --- 4. Wait for the public URL ---
Write-Host "Waiting for public URL (up to 40 seconds) ..." -ForegroundColor Green
$demoUrl = $null
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Path "demo-tunnel.log") {
        $m = Select-String -Path "demo-tunnel.log" -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" |
             Select-Object -First 1
        if ($m) { $demoUrl = $m.Matches[0].Value; break }
    }
}

if ($demoUrl) {
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "  DEMO IS READY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Share this link:  $demoUrl" -ForegroundColor Yellow
    Write-Host "  Admin panel:      $demoUrl/admin" -ForegroundColor Yellow
    Write-Host "  Admin password:   (your ADMIN_PASSWORD, default admin123)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  NOTE: link is valid while this window is open." -ForegroundColor Gray
    Write-Host "=============================================" -ForegroundColor Cyan
} else {
    Write-Host "Could not get a URL. Check demo-tunnel.log" -ForegroundColor Red
    Get-Content "demo-tunnel.log" -Tail 15 -ErrorAction SilentlyContinue
}

# --- 5. Wait for the user, then stop everything ---
Write-Host ""
Write-Host "Press any key to STOP the demo..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

taskkill /PID $tunnel.Id /T /F 2>$null
taskkill /PID $server.Id /T /F 2>$null
Write-Host "Demo stopped." -ForegroundColor Yellow
