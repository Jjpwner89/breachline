#!/bin/sh
# Rebuilds the game-sized images in web/ from the full PNGs. Rerun after replacing any card art.
cd "$(dirname "$0")" && mkdir -p web
for f in *.png concepts/*.png; do
  sips -Z 768 "$f" --setProperty format jpeg --setProperty formatOptions 80 --out "web/$(basename "$f" .png).jpg" >/dev/null
done
# Campaign maps fill a wide panel, so they keep their full size.
mkdir -p web/maps
for f in maps/*.png; do
  sips --setProperty format jpeg --setProperty formatOptions 78 "$f" --out "web/maps/$(basename "$f" .png).jpg" >/dev/null
done
