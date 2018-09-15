magick convert trident.svg -size 180x180 apple-touch-icon.png
magick convert trident.svg -size 72x72 favicon72.ico
magick convert trident.svg -size 36x36 favicon36.ico
magick convert trident.svg -size 16x16 favicon16.ico

xcopy favicon72.ico ..\favicon.ico
xcopy apple-touch-icon.png ..\apple-touch-icon.png