Add-Type -AssemblyName System.Drawing

$dir = "$env:TEMP\lect"
$out = "$env:TEMP\lect-crops"
New-Item -ItemType Directory -Force -Path $out | Out-Null

# lecturer file -> object-position fraction (y)
$jobs = @{
  "akomeah.jpg" = 0.00
  "marfo.jpg"   = 0.08
  "adjaho.jpg"  = 0.14
  "boateng.jpg" = 0.14
  "otoo.jpg"    = 0.14
}

foreach ($name in $jobs.Keys) {
  $path = Join-Path $dir $name
  $img = [System.Drawing.Image]::FromFile($path)
  $w = $img.Width
  $h = $img.Height
  $cropH = [int]($w / 0.8)          # 4:5 box, covered by width
  if ($cropH -gt $h) { $cropH = $h }
  $offset = [int](([math]::Max(0, $h - $cropH)) * $jobs[$name])
  $rect = New-Object System.Drawing.Rectangle(0, $offset, $w, $cropH)
  $bmp = New-Object System.Drawing.Bitmap($w, $cropH)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $w, $cropH)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $target = Join-Path $out $name
  $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $bmp.Dispose()
  $img.Dispose()
  "{0,-14} source {1}x{2}  crop y={3} h={4}" -f $name, $w, $h, $offset, $cropH
}
