# Breachline spell impact sprite briefs

7 images for the aimed-spell animations, written on 2026-11-10. **Status: briefed, not yet generated.** The creator chose this direction after the animation mockups: the projectiles are mostly fine (storm is the best), but the impacts need painted sprites, and Thornbrake is the weakest, both in flight and on impact, with Grave soil's impact close behind.

## How the game uses them

- When a player aims a spell at a tile, the game draws everything in code: the gold aiming arrow, the charge-up at the card, the projectile's flight, the flash, the screen shake, sparks and smoke, and the wave or splash to the other affected tiles.
- At the moment of impact the game plays one **impact sheet** centred on the struck tile. A sheet is six frames on one image, played left to right along the top row and then the bottom row, in about half a second. Each frame is drawn at roughly 1.7 times a tile's width, about 250 pixels on a laptop.
- The tile effect painting (`ui-tile-*.png`) then remains on the tile. The impact is the moment of arrival, so it should feel like the same magic as that tile, without repeating it.
- The code adds glow, flash, shake and particles over the sheet, so the frames should carry the painted substance of the blast (flame, ice, wood, rot, light) and leave the extra light to the code.

| Family | Sheet | Spells | Matching tile |
|---|---|---|---|
| Fire | `fx-impact-fire.png` | Scorch, Cinderfall, Cinderwake | `ui-tile-burn.png` |
| Storm | `fx-impact-storm.png` | Stormstrike | `ui-tile-charge.png` |
| Frost | `fx-impact-frost.png` | Frost | `ui-tile-frost.png` |
| Thorns | `fx-impact-thorns.png` | Thornbrake | `ui-tile-thorns.png` |
| Blight | `fx-impact-blight.png` | Grave soil | `ui-tile-blight.png` |
| Holy | `fx-impact-holy.png` | Consecrated ground | `ui-tile-holy.png` |

## Instructions for the image generator

1. If you have access to the project, read `.claude/skills/art-direction/SKILL.md` first. Its painting style applies here; its card composition rules don't.
2. Generate one image per heading, using the shared direction plus that image's brief. Do the six impact sheets first; the Thornbrake projectile is last.
3. Save each as a PNG in `art/fx/` under the name in the heading, at the size the brief gives. Claude prepares the game-sized versions, so don't make `web/` copies.
4. Every image is a **cut-out**: transparent background, with soft edges, smoke, frost and light partly transparent rather than painted onto a solid colour. If your generator can't make transparent images, stop and say so; a grey background won't work for these.
5. Attach the matching tile painting from `art/ui/` and the spell's card painting from `art/web/` as references for colour and material, as listed in each brief.
6. Skip any image whose file already exists, and never overwrite existing art.
7. If you can't generate images, stop and say so. Don't substitute placeholders or images from the web.

When finished, list the files you created and any you couldn't complete.

## Shared direction

Apply this to every image:

```text
Create one original animation asset for Breachline, a high-fantasy card game whose board is a linen war map on an oak camp table, seen from directly above. When a spell lands on a square of that map, this asset shows the blast of its arrival.

Paint it in the same hand as the game's traditional oil and acrylic fantasy paintings: visible but quiet brushwork, believable materials, precise rather than noisy detail. Never a photograph, 3D render, vector art, flat icon, cartoon smear or particle-system look. It has weight: the magic hits the ground like something physical.

Transparent background. Paint only the effect: no map, cloth, table, grid lines, people or card. Seen from directly above, lit from the upper left, with no perspective and no cast shadow. No text, letters, numbers, runes, sigils, logos, watermarks or signatures.
```

## Sheet layout

Add this to each of the six impact sheets:

```text
1536 x 1024, a sprite sheet of six square animation frames, each 512 x 512, in two rows of three with no gaps, borders or dividing lines. Read the frames left to right along the top row, then left to right along the bottom row. They are six moments of one continuous impact at the centre of each frame:
1. the instant of contact: a small, very dense core at the centre;
2. the burst at its fullest force, the brightest and most solid frame;
3. the blast spreading outward, its edge rushing out from the centre;
4. the blast at its widest, beginning to break up;
5. the remains collapsing and fading, mostly transparent;
6. the last faint traces, almost gone.
Keep the effect centred in every frame, in the same place, the same scale and the same light, so the frames play as one smooth motion. Nothing may touch or cross a frame's edge; leave at least a tenth of the frame clear all round. The blast spreads outward evenly in all directions, with no single direction of travel.
```

## The impact sheets

### fx-impact-fire.png

1536 x 1024, cut-out. References: `art/ui/ui-tile-burn.png`, `art/web/scorch.jpg`.

```text
A fireball striking the ground. A white-gold core bursts into a ring of rolling orange flame and dark red fire, throwing a crown of embers and a little black soot outward; then the fire sinks into a ring of glowing char and drifting embers that fade away. Hot gold, orange and deep red with black char; heavy, roaring and physical. No white smoke clouds.
```

### fx-impact-storm.png

1536 x 1024, cut-out. References: `art/ui/ui-tile-charge.png`, `art/web/stormstrike.jpg`.

```text
A lightning bolt striking the ground. A blinding violet-white point of contact explodes into fine branching lightning forks that crawl outward across the ground in every direction, with a thin ring of charged air; then the forks break into flickering fragments and thin scorched traces that fade. Violet, white and storm blue with dark scorch lines; sharp, fast and crackling.
```

### fx-impact-frost.png

1536 x 1024, cut-out. References: `art/ui/ui-tile-frost.png`, `art/web/frost.jpg`.

```text
Frost striking the ground. A pale blue-white burst of freezing cold shoots out sharp ice crystals and shards in every direction, and a ring of hoarfrost spreads across the ground; then the shards splinter into glittering fragments and a fine, drifting rime that fades. White, pale blue and a touch of steel grey; crisp, hard and cold. No snowdrifts or icicles.
```

### fx-impact-thorns.png

1536 x 1024, cut-out. References: `art/ui/ui-tile-thorns.png`, `art/web/thornbrake.jpg`.

```text
A thornbrake bursting out of the ground. The earth cracks open at the centre and thick, dark bramble stems with long, sharp, pale-tipped thorns whip violently upward and outward in every direction, flinging clods of dark earth and a few torn leaves; in the later frames the stems settle back into a low, dense, knotted ring of thorns and the earth and leaves fall away. Deep green, bark brown, dark earth and pale thorn tips; violent, woody and alive, not monstrous. No flowers, berries or faces in the wood.
```

### fx-impact-blight.png

1536 x 1024, cut-out. References: `art/ui/ui-tile-blight.png`, `art/web/grave-soil.jpg`.

```text
Grave soil spoiling the ground. A dark clot of rot bursts from the centre without any bright flash: a pool of black-violet decay spreads outward like spilled ink soaking into the earth, sending up slow, heavy wisps of sickly violet vapour and a scatter of dead grey-green motes; then the vapour thins and the pool darkens into a stain that fades. Black, deep violet and sickly grey-green with only a faint violet glow; slow, heavy and wrong, not fiery.
```

### fx-impact-holy.png

1536 x 1024, cut-out. References: `art/ui/ui-tile-holy.png`, `art/web/consecrated-ground.jpg`.

```text
Consecrating light striking the ground. A warm white-gold point lands at the centre and opens into a clean, bright ring of light that spreads outward across the ground, with soft rays and a few floating golden motes rising; then the ring softens into a warm glow and a few last motes that fade. Warm white, pale gold and honey; calm, clean and strong rather than explosive. No halo, wings, figures or sacred symbols.
```

## The Thornbrake projectile

### fx-projectile-thorns.png

1024 x 1024, cut-out. References: `art/web/thornbrake.jpg`, `art/ui/ui-tile-thorns.png`.

The other spells fly as flame, lightning, ice, rot and light drawn in code. Thornbrake flies as a thrown seed of brambles, which code can't paint convincingly. The game spins this image as it flies, so it has no up or down.

```text
A single thrown seed of the thornbrake, seen from directly above: a tight, heavy knot of dark woody bramble stems, about fist-sized, bristling with long sharp pale-tipped thorns pointing outward in every direction, with a few small dark leaves and a little clinging earth. Compact and roughly round, filling the middle two thirds of the image, with nothing near the edges. Deep green, bark brown and pale thorn tips; dense and dangerous, like something that will take root where it lands. No flowers, berries or faces in the wood.
```

## For Claude after generation

- Make the web copies at half size: each sheet to 768 x 512 in `art/web/fx/impact-<family>.png`, and the projectile to 256 x 256 in `art/web/fx/projectile-thorns.png`.
- List each sheet in `IMPACT_SHEETS` in `fx.js`, keyed by family. The code already plays any sheet listed there.
- Make Thornbrake's flight draw the projectile image, spinning, in place of the code-drawn bramble.
- Keep the source files and their exact prompts, as with the tile effects.
