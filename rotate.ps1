Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\evena\Desktop\SITE WEB\dessin\Cartographie-1.png")
$img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone)
$img.Save("c:\Users\evena\Desktop\SITE WEB\dessin\Cartographie-1-rot.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
