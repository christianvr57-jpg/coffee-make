# Genera los iconos de la app (PNG) con System.Drawing. Uso: powershell -File tools/iconos.ps1
Add-Type -AssemblyName System.Drawing
$salida = Join-Path (Split-Path $PSScriptRoot -Parent) 'icons'
New-Item -ItemType Directory -Force $salida | Out-Null

function Nuevo-Icono([int]$tam, [double]$escala, [string]$archivo) {
  $bmp = New-Object System.Drawing.Bitmap $tam, $tam
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.PixelOffsetMode = 'HighQuality'
  $rect = New-Object System.Drawing.Rectangle 0, 0, $tam, $tam
  $c1 = [System.Drawing.Color]::FromArgb(255, 74, 200, 176)
  $c2 = [System.Drawing.Color]::FromArgb(255, 30, 120, 230)
  $fondo = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 55.0
  $g.FillRectangle($fondo, $rect)

  # Casa (coordenadas en 0..1 alrededor del centro, escaladas)
  $p = { param($x, $y) New-Object System.Drawing.PointF ([single](($tam / 2) + ($x - 0.5) * $tam * $escala)), ([single](($tam / 2) + ($y - 0.5) * $tam * $escala)) }
  $casa = @(
    (& $p 0.50 0.17), (& $p 0.86 0.47), (& $p 0.77 0.47), (& $p 0.77 0.83),
    (& $p 0.23 0.83), (& $p 0.23 0.47), (& $p 0.14 0.47)
  )
  $blanco = [System.Drawing.Brushes]::White
  $lapiz = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ([single]($tam * 0.035 * $escala))
  $lapiz.LineJoin = 'Round'
  $g.FillPolygon($blanco, [System.Drawing.PointF[]]$casa)
  $g.DrawPolygon($lapiz, [System.Drawing.PointF[]]$casa)

  # Marca de verificación en el color del fondo
  $marca = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 40, 150, 210)), ([single]($tam * 0.065 * $escala))
  $marca.StartCap = 'Round'; $marca.EndCap = 'Round'; $marca.LineJoin = 'Round'
  $g.DrawLines($marca, [System.Drawing.PointF[]]@((& $p 0.385 0.635), (& $p 0.47 0.72), (& $p 0.625 0.53)))

  $bmp.Save((Join-Path $salida $archivo), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

Nuevo-Icono 180 1.0 'apple-touch-icon.png'
Nuevo-Icono 192 1.0 'icon-192.png'
Nuevo-Icono 512 1.0 'icon-512.png'
Nuevo-Icono 512 0.74 'icon-maskable-512.png'
Get-ChildItem $salida | Select-Object Name, Length
