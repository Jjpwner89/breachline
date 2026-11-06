#!/bin/sh
# Rebuilds the game-sized images in web/ from the full PNGs. Rerun after replacing any card art.
cd "$(dirname "$0")" && mkdir -p web
for f in *.png concepts/*.png; do
  sips -Z 768 "$f" --setProperty format jpeg --setProperty formatOptions 80 --out "web/$(basename "$f" .png).jpg" >/dev/null
done
