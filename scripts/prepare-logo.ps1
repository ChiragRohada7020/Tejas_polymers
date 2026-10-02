<#
.SYNOPSIS
  Prepares the supplied brand logo for use on both light and dark surfaces.

.DESCRIPTION
  The source JPEG is a large canvas (1278x756) with wide white margins and a
  flat white background. Dropping it straight into the 64px header would render
  it tiny inside its own padding, and on the dark footer it would read as a
  white box.

  This script:
    1. Flood-fills inward from the border to find the outer white background.
       A flood fill is used rather than a global colour-key because the logo
       contains white artwork of its own (the plant inside the droplet) that a
       naive "white -> transparent" pass would punch holes through.
    2. Writes a PNG with that background made transparent.
    3. Auto-crops to the artwork bounding box plus a small even margin, so the
       file carries no dead space and lines up predictably in the layout.

  JPEG compression rings slightly around hard edges, so a pixel only counts as
  background when all three channels are >= -BackgroundLevel.

.PARAMETER Source
  Path to the original logo. The source file is never modified.
#>
[CmdletBinding()]
param(
  [string]$Source  = '',
  [string]$OutDir  = '',
  [int]$Height     = 40,
  [int]$MarkHeight = 32,
  [int]$BackgroundLevel = 238,
  [int]$Padding    = 6
)

$ErrorActionPreference = 'Stop'

# $PSScriptRoot is not populated inside param() defaults, so resolve here.
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Source) { $Source = Join-Path $root '..\public\images\logo1.jpeg' }
if (-not $OutDir) { $OutDir = Join-Path $root '..\public\images\brand' }
$Source = [System.IO.Path]::GetFullPath($Source)
$OutDir  = [System.IO.Path]::GetFullPath($OutDir)

if (-not (Test-Path -LiteralPath $Source)) { throw "Source logo not found: $Source" }

Add-Type -AssemblyName System.Drawing
# Add-Type -Path does not pull in System.Drawing on its own, so the reference
# has to be named explicitly or the compile fails on the using directives.
# The guard keeps the script re-runnable inside one PowerShell session, where
# the type is already loaded from a previous run.
if (-not ('Krusheebindoo.LogoPrep' -as [type])) {
  Add-Type -Path (Join-Path $root 'logo-prep\LogoPrep.cs') `
    -ReferencedAssemblies @('System.dll', 'System.Core.dll', 'System.Drawing.dll')
}

$r = [Krusheebindoo.LogoPrep]::Run($Source, $OutDir, $Height, $MarkHeight, $BackgroundLevel, $Padding)

Write-Output "artwork bbox : $($r.MinX),$($r.MinY) .. $($r.MaxX),$($r.MaxY)"
Write-Output "cropped to   : $($r.CropWidth)x$($r.CropHeight)"
Write-Output "aspect ratio : $([math]::Round($r.Aspect, 3))"
Write-Output "lockup       : $($r.LockupPath) ($($r.LockupWidth) x $($r.LockupHeight))"
Write-Output "mark         : $($r.MarkPath) ($($r.MarkSize) x $($r.MarkSize))"
