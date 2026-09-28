/* Generates the 1200x630 social sharing image (og-image). */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const outDir = path.join("public", "images", "og");
fs.mkdirSync(outDir, { recursive: true });

// Minimal uncompressed-ish PNG is not practical; generate a solid brand card
// via System.Drawing (PowerShell) which is available on Windows.
const ps = `
Add-Type -AssemblyName System.Drawing
$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  (New-Object System.Drawing.Point 0,0),
  (New-Object System.Drawing.Point $W,$H),
  [System.Drawing.Color]::FromArgb(255,26,74,58),
  [System.Drawing.Color]::FromArgb(255,16,44,34)
)
$g.FillRectangle($bg, 0, 0, $W, $H)

$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255,255,255,255))
$accent = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255,132,204,22))
$muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(210,255,255,255))

$title = New-Object System.Drawing.Font "Segoe UI", 78, ([System.Drawing.FontStyle]::Bold)
$tag = New-Object System.Drawing.Font "Segoe UI", 30, ([System.Drawing.FontStyle]::Regular)
$small = New-Object System.Drawing.Font "Segoe UI", 24, ([System.Drawing.FontStyle]::Regular)

$g.FillRectangle($accent, 80, 140, 90, 10)
$g.DrawString("Tejas Polymers", $title, $white, 80, 190)
$g.DrawString("Irrigation Equipment Supplier", $tag, $accent, 84, 330)
$g.DrawString("Pachora  |  Jalgaon Road  |  Maharashtra 424201", $small, $muted, 84, 410)
$g.DrawString("Drip systems  -  Sprayers  -  Tillers  -  Harvesters  -  Pumps  -  Spare parts", $small, $muted, 84, 460)

$g.Dispose()
$bmp.Save("${path.join(outDir, "tejas-polymers.jpg").replace(/\\/g, "\\\\")}", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()
Write-Output "written"
`;

execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps], {
  stdio: "inherit",
});
console.log("OG image generated at public/images/og/tejas-polymers.jpg");
