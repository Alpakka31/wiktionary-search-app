# Note to myself on: How to create the icon files

The original icon is licensed under GPLv3.

The original icon can be found here:

* [https://www.freeicons.org/icons/iconsax](https://www.freeicons.org/icons/iconsax)
* [https://github.com/Vuesax/iconsax](https://github.com/Vuesax/iconsax)
* [https://www.svgrepo.com/svg/497606/translate](https://www.svgrepo.com/svg/497606/translate)
* [Iconsax](https://iconsax.io/)

I modified it to have a white background color and the corners are half rounded. That was done with: [https://redketchup.io/icon-converter](https://redketchup.io/icon-converter)

## First steps

Download the original .png icon file from here and pick the 512x512 option: [https://www.svgrepo.com/svg/497606/translate](https://www.svgrepo.com/svg/497606/translate  )

## Windows (icon.ico)

Open the site: [https://redketchup.io/icon-converter](https://redketchup.io/icon-converter)

Pick the original .png icon file and convert it to .ico file with a white background color and half roundness. Remember to pick all the sizes, that includes 512x512 which isn't picked by default.

Download the .ico file as icon.ico

## macOS (icon.icns)

For my method you need to use both Windows and macOS to create this file.

This is the most annoying icon to create as this requires so much additional work.

You need the icon.ico file that was created in the Windows step to convert it back to multiple .png images with all the correct sizes, because we need to create an iconset of them before we can create an icon.icns file.

Download Image Converter from the Windows Store: [https://apps.microsoft.com/detail/9pgn31qtzq26?hl=en-US&gl=US](https://apps.microsoft.com/detail/9pgn31qtzq26?hl=en-US&gl=US)

Open it and add the icon.ico file and set the output directory to an empty iconset folder that contains all the icons, then select PNG as the output format and click: Convert All Images button.

Now before the next step, you need to install ImageMagick for Windows from here: [ImageMagick – Download](https://imagemagick.org/script/download.php)

After installing ImageMagick, you need to create this PowerShell script and name it as 'bulk_rename_icons.ps1':

```powershell
# The path where the iconset folder exists
# Remember to set this directory!
$directory = "path/to/the/iconset/folder"

# Get all the .png images
$files = Get-ChildItem -Path $directory -Filter *.png

# Go through the .png files
foreach ($file in $files) {
    # Get the correct resolution of the current .png image
    $size = magick identify -format "%wx%h" $file.FullName

    # Create the correct naming scheme for the current .png image
    $newName = "icon_" + $size + ".png"

    # Rename the file with the correct naming scheme
    Rename-Item -Path $file.FullName -NewName $newName
}

```

Run the script from a Windows PowerShell session with the command: `.\bulk_rename_icons.ps1`  

After renaming the image files correctly, you need to create a few additional variants of some of the image files.

You need to run these commands from a Windows PowerShell session:

```powershell
cd path/to/the/iconset/folder

magick convert icon_16x16.png -scale 200% icon_16x16@2x.png
magick convert icon_32x32.png -scale 200% icon_32x32@2x.png
magick convert icon_128x128.png -scale 200% icon_128x128@2x.png
magick convert icon_256x256.png -scale 200% icon_256x256@2x.png
magick convert icon_512x512.png -scale 200% icon_512x512@2x.png
```

Now the iconset is almost done, just rename the folder where the icons exist to: icon.iconset

To create the icon.icns icon file from the iconset we created, you need to copy the folder to your macOS system and run the following command: `iconutil -c icns icon.iconset`

If no errors occured, there should be the icon.icns file created.

## Linux (icon.png)

For Linux you can use the 'icon_512x512.png' icon file created earlier in the macOS section by just renaming it to: icon.png  

Note: You need to only do that section up to the point where you have renamed the icons. So this can be done just by using Windows.
