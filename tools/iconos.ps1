# Genera los iconos de la app (PNG) con System.Drawing. Uso: powershell -File tools/iconos.ps1
Add-Type -AssemblyName System.Drawing
$salida = Join-Path (Split-Path $PSScriptRoot -Parent) 'public\icons'
New-Item -ItemType Directory -Force $salida | Out-Null

function Nuevo-Icono([int]$tam, [double]$escala, [string]$archivo) {
  $bmp = New-Object System.Drawing.Bitmap $tam, $tam
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.PixelOffsetMode = 'HighQuality'
  $rect = New-Object System.Drawing.Rectangle 0, 0, $tam, $tam
  $c1 = [System.Drawing.Color]::FromArgb(255, 196, 124, 62)
  $c2 = [System.Drawing.Color]::FromArgb(255, 74, 42, 24)
  $fondo = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 60.0
  $g.FillRectangle($fondo, $rect)

  $u = $tam * $escala
  $x0 = ($tam - $u) / 2
  $y0 = ($tam - $u) / 2
  function P([double]$x, [double]$y) { New-Object System.Drawing.PointF ([single]($x0 + $x * $u)), ([single]($y0 + $y * $u)) }

  $blanco = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 248, 238))
  $grosor = [single]($u * 0.065)
  $lapiz = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 255, 248, 238)), $grosor
  $lapiz.StartCap = 'Round'; $lapiz.EndCap = 'Round'; $lapiz.LineJoin = 'Round'

  # Taza: cuerpo redondeado abajo
  $taza = New-Object System.Drawing.Drawing2D.GraphicsPath
  $a = P 0.20 0.44; $b = P 0.68 0.44
  $taza.AddLine($a, $b)
  $taza.AddBezier((P 0.68 0.44), (P 0.68 0.72), (P 0.58 0.82), (P 0.44 0.82))
  $taza.AddBezier((P 0.44 0.82), (P 0.30 0.82), (P 0.20 0.72), (P 0.20 0.44))
  $taza.CloseFigure()
  $g.FillPath($blanco, $taza)
  # Asa
  $asa = New-Object System.Drawing.Drawing2D.GraphicsPath
  $asa.AddBezier((P 0.67 0.50), (P 0.84 0.48), (P 0.86 0.66), (P 0.64 0.70))
  $g.DrawPath($lapiz, $asa)
  # Plato
  $g.DrawLine($lapiz, (P 0.16 0.90), (P 0.72 0.90))
  # Vapor
  $vapor = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(220, 255, 248, 238)), ([single]($u * 0.05))
  $vapor.StartCap = 'Round'; $vapor.EndCap = 'Round'
  foreach ($dx in @(0.33, 0.47)) {
    $v = New-Object System.Drawing.Drawing2D.GraphicsPath
    $v.AddBezier((P $dx 0.36), (P ($dx - 0.05) 0.29), (P ($dx + 0.05) 0.24), (P $dx 0.15))
    $g.DrawPath($vapor, $v)
  }

  $bmp.Save((Join-Path $salida $archivo), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

Nuevo-Icono 180 0.78 'apple-touch-icon.png'
Nuevo-Icono 192 0.78 'icon-192.png'
Nuevo-Icono 512 0.78 'icon-512.png'
Nuevo-Icono 512 0.60 'icon-maskable-512.png'
Get-ChildItem $salida | Select-Object Name, Length
