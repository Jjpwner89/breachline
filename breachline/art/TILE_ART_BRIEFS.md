# Breachline tile effect art briefs

8 images for the tile effects, written on 2026-11-10. **Status: all 8 briefed source PNGs generated on 2026-11-10, plus 7 affected-unit border companions requested by the creator, and all 15 built into the game; waiting for the creator's review.** See [the review gallery](ui/TILE_GALLERY.html), [file list and handoff](ui/TILE_README.txt), and [prompts and manifest](ui/TILE_ASSET_MANIFEST.json). To replace one, save the new painting under the same name and run `swift art/build-ui.swift`. The rules for tile effects are in the "Tile effects" entry of `../DESIGN_NOTES.md`. Like the [UI briefs](UI_ART_BRIEFS.md), these are materials for the interface, not card art, so card rules about subjects, poses and stories don't apply.

## How the game uses them

- Each tile is a square of the linen war map, about 3:2 and roughly 145 x 95 pixels on a laptop, smaller on a phone.
- On an empty tile the whole effect painting shows. When a unit stands on the tile, its card painting covers the middle and the matching unit border (below) frames it, with a thin line in the effect's colour inside the owner's gold or crimson edge. So the effect has to live mostly in a band round the edges, with the middle nearly clear.
- The game adds the glow, the motion (flicker, glint, crackle), shadows and the turns-left counter in code, so the paintings carry none of these.
- The counter shows a small emblem from the emblem sheet with the turns left, at about 20 pixels, so the emblems must read at a tiny size.

| Effect | Painting | Made by | What it does |
|---|---|---|---|
| Burning | `ui-tile-burn.png` | Scorch, Cinderfall, Cinderwake, the Copperlane torch-runner's trail, the Cinder martyr's death | 1 damage to any unit that ends a move or starts its turn there, unless it's Fireproof |
| Frozen | `ui-tile-frost.png` | Frost, the Winterdoor keeper | Units there can't move |
| Thorns | `ui-tile-thorns.png` | Thornbrake | A unit that enters stops there and takes 1 damage; blocks walking through; alderkin are unharmed |
| Blighted | `ui-tile-blight.png` | Grave soil, the Ash-sower | Units there have -1 attack; a unit that dies there rises as a Gravebound thrall |
| Consecrated | `ui-tile-holy.png` | Consecrated ground | The owner's unit there takes 1 less damage and recovers 1 health each turn |
| Snare | `ui-tile-snare.png` | The Glyphwright | The first enemy to enter stops there and can't move on its next turn |
| Charged | `ui-tile-charge.png` | Stormstrike | The next unit to enter takes 2 damage |

## Instructions for the image generator

1. If you have access to the project, read `.claude/skills/art-direction/SKILL.md` first. Its painting style applies here; its card composition rules don't.
2. Generate one image per heading, using the shared direction and tile layout below plus that image's brief.
3. Save each as a PNG in `art/ui/` under the name in the heading, at 1536 x 1024. Claude prepares the game-sized versions, so don't make `web/` copies.
4. Every image is a **cut-out**: use a transparent background, and keep soft edges, char, frost and light partly transparent rather than painting them onto a solid colour. If your generator can't make transparent images, stop and say so; a grey background won't work for these.
5. Attach `art/ui/ui-table-linen-map.png` as a reference for every image, to show the cloth the effects sit on. Don't paint the cloth itself.
6. Skip any image whose file already exists, and never overwrite existing art.
7. If you can't generate images, stop and say so. Don't substitute placeholders or images from the web.

When finished, list the files you created and any you couldn't complete.

## Shared direction

Apply this to every image:

```text
Create one original asset for Breachline, a high-fantasy card game whose board is a linen war map stretched over a weathered oak camp table, seen from directly above. Units are small card paintings standing on the map's grid of squares. This asset shows a magical condition on one square of that map, as if the battlefield's fire, frost or spellwork had broken through onto the commander's map itself.

Paint it in the same hand as the game's traditional oil and acrylic fantasy paintings: visible but quiet brushwork, believable materials, precise rather than noisy detail. Never a photograph, 3D render, vector art, flat icon or particle effect.

Transparent background. Paint only the effect itself: no cloth, table, grid lines or square outline. Seen from directly above and evenly lit from the upper left, with no perspective, no cast shadow and no glow haze beyond the effect's own light; the game adds glow and motion. No text, letters, numbers, runes, sigils, logos, watermarks or signatures.
```

## Tile layout

Add this to each of the seven tile paintings:

```text
The image is one whole square of the map. The effect forms a band round all four edges, about one tenth of the image's height deep, strongest at the four corners and thinning to a few sparse touches toward the middle. The middle 60% stays almost entirely clear, because a unit's card painting will sit there. Keep each side of the band even, with no single large feature in the middle of an edge, so the sides can be stretched to fit squares of different shapes. The four corners can differ a little from one another but should carry the same weight.
```

## The tiles

### ui-tile-burn.png

1536 x 1024, cut-out.

```text
Burning ground. The square's edges are singed: a band of brown-black char, as if the map had been scorched from beneath, with thin cracks of glowing orange ember running through it and a few low tongues of flame curling up at the corners. A few flecks of grey ash and one or two tiny embers drift toward the middle. Hot orange and deep red against black char. No smoke clouds and no bright white.
```

### ui-tile-frost.png

1536 x 1024, cut-out.

```text
Frozen ground. Feathery hoarfrost and fine ice crystals grow inward from all four edges, packed thickest at the corners in a crust of white and pale blue, with fern-like frost patterns reaching a little way in. A thin, nearly invisible veil of rime crosses the middle. Cold white, pale blue and a touch of steel grey; crisp and delicate. No snowdrifts or icicles.
```

### ui-tile-thorns.png

1536 x 1024, cut-out.

```text
A thornbrake. Dark, woody bramble stems with long sharp thorns weave along all four edges and knot into a dense tangle at each corner, with a few small dark leaves and one or two thin shoots creeping toward the middle. Deep green, bark brown and the pale tips of the thorns; living and hostile but not monstrous. No flowers, berries or faces in the wood.
```

### ui-tile-blight.png

1536 x 1024, cut-out.

```text
Blighted ground. A damp, dark stain of grave soil and rot seeps in from all four edges: crumbling black-brown earth, threads of grey-violet mould, and fine pale root hairs reaching inward, heaviest at the corners. A few loose crumbs of soil lie toward the middle. Black, bruised violet and ashen grey; quietly wrong rather than gory. No bones, skulls, insects or faces.
```

### ui-tile-holy.png

1536 x 1024, cut-out.

```text
Consecrated ground. A fine line of pale gold leaf runs round the square just inside its edges, softly catching the light, with small pools of white candle wax and scattered white petals gathered at the four corners. A faint warm sheen lies inside the gold line, with two or three single petals toward the middle. Warm gold, ivory and white; calm, reverent and simple. No symbols, halos, crosses or sun shapes.
```

### ui-tile-snare.png

1536 x 1024, cut-out.

```text
A spellwright's snare. A single fine thread of pale blue light, ruled as straight and exact as a draughtsman's line, is stretched taut round the square just inside its edges. At each corner it is held by a small dark iron map pin pushed into the map, looping once round the pin. A fainter second line runs parallel just inside the first. Pale blue-white light and dark iron; precise, quiet and slightly menacing. No letters, runes, diagrams or knots of rope.
```

Also attach `art/web/glyphwright.jpg`, the card whose unit sets snares, for the precise, hand-drawn quality of its glowing line. Use a cool blue instead of its warm light, so the snare can't be confused with consecrated ground.

### ui-tile-charge.png

1536 x 1024, cut-out.

```text
A charged square. Fine branching filaments of violet-white lightning crawl along all four edges and gather into small bright knots at the corners, leaving thin scorched traces behind them. One or two faint filaments reach toward the middle. Violet, white and storm blue against dark scorch lines; tense, like the moment before a strike. No clouds, rain or bolt from above.
```

Also attach `art/web/stormstrike.jpg`, the card that charges a tile, as the reference for the lightning's colour and branching.

## The counter emblems

### ui-tile-emblems.png

1536 x 1024, cut-out. Seven emblems on one sheet. The tile layout doesn't apply to this one.

```text
Seven small painted emblems on one sheet, in a single row from left to right, evenly spaced with plenty of empty space between them and all the same size. Each is one simple, bold silhouette that still reads when shrunk to the size of a fingernail, painted in the same hand as the tiles, with soft light from the upper left:
1. a tongue of orange flame rising from a glowing coal;
2. a six-armed ice crystal in white and pale blue;
3. a short curved bramble sprig with three sharp thorns;
4. a withered black-violet leaf curling at its tip;
5. a short white candle with a small, still gold flame;
6. a dark iron map pin with a pale blue thread looped round it;
7. a jagged violet-white spark.
No discs, frames, badges or background behind them.
```

The order matters: Claude cuts the sheet into seven equal columns in this order.

## Affected-unit border companions — 2026-11-10

The creator additionally requested card borders for affected units. Seven narrow transparent overlays were generated for the current landscape board cards at 1536 x 1024. They match the tile effects while leaving the middle clear. These are source art for review; implementation should follow the existing ownership and immunity rules.

| Effect | Border file |
|---|---|
| Burning | `ui-unit-border-burn.png` |
| Frozen | `ui-unit-border-frost.png` |
| Thorns | `ui-unit-border-thorns.png` |
| Blighted | `ui-unit-border-blight.png` |
| Consecrated | `ui-unit-border-holy.png` |
| Snare | `ui-unit-border-snare.png` |
| Charged | `ui-unit-border-charge.png` |
