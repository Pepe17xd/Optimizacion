Add-Type -AssemblyName System.Drawing
$files=Get-ChildItem visual-tests\[0-9][0-9].png | Sort-Object Name
$img=New-Object System.Drawing.Bitmap 1200, 1600
$g=[System.Drawing.Graphics]::FromImage($img)
for($i=0;$i -lt $files.Count;$i++){ $im=[System.Drawing.Image]::FromFile($files[$i].FullName);$x=($i%4)*300;$y=[math]::Floor($i/4)*200;$g.DrawImage($im,$x,$y,300,169);$g.DrawString($files[$i].BaseName,(New-Object System.Drawing.Font('Arial',12)),[System.Drawing.Brushes]::White,$x,$y+170);$im.Dispose() }
$img.Save((Join-Path (Get-Location) 'visual-tests\contact.png'));$g.Dispose();$img.Dispose()
