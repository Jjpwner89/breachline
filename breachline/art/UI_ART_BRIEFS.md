# Breachline UI art briefs

<!-- CURRENT_ART_DIRECTION_BEGIN -->
**Current direction — confirmed 2026-11-09:** Read the [current art direction](../../.claude/skills/art-direction/SKILL.md) and [accepted-reference guide](reference-library-2026-11-06/README.txt) before using any brief. The following defaults supersede older shared wording; specific approved character identities and explicit local feedback still govern.

CASTING: For new highly aggressive frontline fighters, the vast majority should be men; female soldiers remain occasional. Women remain welcome as mages, archers, civilians and other characters. Preserve specifically approved identities unless the creator requests a change.

FACES: Actively consult the human/species face sheets. Use specific ordinary reference faces for corrective casting, and draw on their varied skulls, noses, jaws, ages and asymmetries when inventing new people. Keep generally appealing faces and occasional exceptional beauty; avoid repeated model faces, compulsory ugliness and uncanny skin detail.

MATERIALS: Skin, wool, wood and stone have naturally diffuse surfaces. Reserve stronger reflections for appropriate metal, glass or water. Avoid waxy faces, uniform surface shine and habitual red cheeks, especially on heavyset women. Keep vibrant color and convincing light.

PAINTED ATTENTION: Match brush size, edge precision and detail locally. Focal features can be precise; secondary people and distant places stay legible with fewer marks and quieter contrast. Do not combine coarse texture with uniformly hairline detail, render everything equally sharply, or substitute camera blur and tunnel focus.

DESIGN RANGE: Constructs may have abstract functional anatomy, asymmetry and open space; they need not resemble armored human knights. Gnosis combines scholarly high fantasy with broader steam-era craft, not an optics uniform. Blend selected Asian armor details into the established kit; modest curved eaves are a valid architectural option. These are examples, not mandatory formulas.

MAGIC AND PRESENTATION: Direct personal and creature magic, imbued objects and industrial applications can coexist without universal equipment, visible power feeds or glowing threads. Keep grounded steam machinery and creature/direct magical flight distinct from the rejected hovering magitech vessels. Choose a compelling image; card rules do not require an ability demonstration.

REFERENCE USE: Accepted references guide anatomy, materials, individual continuity and taste; they do not limit new faces, clothes, kit, settings or magic to a repeating catalog. Preserve accepted content and vary presentation. Feedback applies at the image or batch scope given unless the creator makes it general.
<!-- CURRENT_ART_DIRECTION_END -->

16 images for the UI refresh, written on 2026-11-09 from the creator's picks on the [proposal page](https://claude.ai/artifact/WmUf7MW4bpvcirLrs9RpvJ). **Status: all 16 source PNGs generated on 2026-11-09 in `art/ui/`; prepared and built into the game with `art/build-ui.swift`, awaiting creator review.** Review [the gallery](ui/UI_GALLERY.html), [handoff notes](ui/README.txt) and [exact prompts and dimensions](ui/UI_ASSET_MANIFEST.json). The decisions behind them are in the "UI refresh" part of `../DESIGN_NOTES.md`. These images are materials, a home screen and furniture for the interface, not card art, so card rules about subjects, poses and stories don't apply to them.

The briefs are grouped in the order the creator chose: the table first, then the home screen, card frames, buttons and panels, and the extras. Generate a group whenever it suits; the game uses a stand-in in each place until the painting arrives.

## Instructions for the image generator

1. If you have access to the project, read `.claude/skills/art-direction/SKILL.md` first. Its painting style applies here; its card composition rules don't.
2. Generate one image per heading, using the shared direction below plus that image's brief.
3. Save each as a PNG in `art/ui/` under the name in the heading, at the size the brief gives or the largest your generator offers in that shape. Claude prepares the game-sized versions, so don't make `web/` copies.
4. Where a brief says **cut-out**, use a transparent background if your generator supports it. Otherwise use a flat, even mid-grey with no shadow, gradient or floor beneath the object.
5. Skip any image whose file already exists, and never overwrite existing art.
6. If you can't generate images, stop and say so. Don't substitute placeholders or images from the web.

When finished, list the files you created and any you couldn't complete.

## Shared direction

Apply this to every image:

```text
Create one original asset for the interface of Breachline, a high-fantasy card game whose cards are traditional oil and acrylic fantasy paintings. This asset sits around and behind those paintings, so it must look painted in the same hand: visible but quiet brushwork, broad coherent light, believable materials. Never a photograph, 3D render, game-engine material, vector art or flat graphic.

Apply casting rules only if people appear. Keep the interface calm. Low contrast, a limited palette and no busy detail, because card text, numbers and paintings sit on top of it and must stay the clearest thing on screen. Detail is fine and precise rather than noisy; no uniform microtexture, glossy highlights or sharpened grain.

Include no text, letters, numbers, runes, logos, watermarks or signatures anywhere. Unless the brief says otherwise, show the object straight on, evenly lit from the upper left, with no perspective, vignette or dramatic shadow.
```

## 1. The table

The battle screen becomes a weathered field-oak camp table with a linen war map stretched over it. Claude draws the 5 by 4 grid, the front line and all highlights over the linen in code, so neither image includes a grid.

### ui-table-oak.png

1536 x 1024. Claude makes it tile seamlessly.

```text
A tabletop of weathered field oak seen from directly above, filling the whole image edge to edge with no table edge visible. Long planks running left to right, each about a hand wide, with tight seams between them. Grey-brown oak that has stood outdoors on campaign: silvered grain, faint water rings, a few knife nicks, rubbed patches where hands and maps have slid, the odd dark iron nail head. Even, flat light with no hotspot. Muted and low in contrast, so a lighter linen map laid on top stands clearly off it.
```

### ui-table-linen-map.png

1536 x 1024.

```text
A sheet of unbleached linen stretched flat and tacked down at its edges, seen from directly above, filling the frame with a narrow margin of dark wood showing all round. The linen is a field commander's war map in its blank working state: warm oatmeal cloth with a visible weave, two soft fold creases crossing it, faint water and ink stains, and very faint inked hatching suggesting hills and a river near the edges only. The middle 80% stays plain and calm, because a grid and paintings will be placed there. The edges are turned under and held by small iron tacks at even spacing. No grid, no lines across the middle, no compass, no lettering.
```

## 2. The home screen

The game opens on a quiet battlefield at dusk with the gold strand crossing the sky. The painting stays still while code moves the light: the strand glints slowly along its length, thin smoke drifts, and the view pushes in very gently.

The strand is the creator's canonical image for the surviving connection to the gods (`campaign-2026-11-05/20-experiment-unmeasured-distance.png`). Nobody in the world knows what it is, so the home screen shows no people: it reads as a title image, not an event characters witness.

### ui-home-battlefield.png

The widest landscape your generator offers, ideally 16:9 at 2400 x 1350 or more. 1536 x 1024 also works, and Claude crops it.

```text
A wide, quiet battlefield at dusk, the evening after a battle on open rolling ground. Nobody is in the scene. Broken spears and a few abandoned shields lean in the grass of a low rise in the middle distance; thin smoke rises from a couple of places and thins out; distant hills fade into haze. The battle belongs to no particular side: no banners, emblems or alignment colours. The sky fills the top half and carries the colour: deep blue overhead warming to violet and magenta, with a thin warm glow low on the horizon. Leave a clear, open band of sky running from the lower left up to the upper right, where a single gold strand will later be added; don't paint the strand. Keep the left third of the picture darker and simpler, because the menu sits there. Quiet, melancholy and beautiful rather than grim: aftermath, not carnage, with no bodies.
```

### ui-home-strand.png

1536 x 1024, on pure black, so Claude can lay it over the sky with light.

```text
A single fine gold strand of light on a pure black background, nothing else. It enters low at the lower left and rises in one long, gentle, slightly wavering curve toward the upper right, where it fades out into nothing. It is thin, like a thread seen from far away, with a soft warm glow around it and a few places where it brightens and thins. Echo the strand in the attached reference: delicate and calm, not a lightning bolt, rope or beam. Pure black everywhere else, with no stars, clouds or texture.
```

Attach `campaign-2026-11-05/20-experiment-unmeasured-distance.png` as a reference for the strand only.

## 3. Card frames

Every card's frame becomes blackened iron with gold trim, with crimson title bars on every card. Claude sets the name, cost, text and numbers in code, so every piece here is blank. These go into `card.html` on the Sunmane lancer first for the creator's approval.

### ui-frame-iron.png

1024 x 1536, cut-out.

```text
An empty card frame for a fantasy card game, seen straight on: blackened, hand-forged iron with a soft bevel, gently rounded corners and slight wear at the edges where the black has rubbed back to dark metal. A thin line of gold trim runs just inside the iron border all the way round, catching light on its upper left. Modest, restrained shaping at the four corners, with no faces, creatures, gems or scrollwork. The border is about one fifteenth of the card's width on every side. Everything inside the gold line is a single flat, even mid-grey, to be cut out.
```

### ui-card-paper.png

1024 x 1024. Claude makes it tile.

```text
A flat sheet of warm, slightly uneven handmade paper filling the frame, seen straight on in even light. Pale cream with very faint fibres and the gentlest mottling, no stains, folds, edges or vignette. Quiet enough that small black text printed on it stays perfectly readable.
```

### ui-titlebar-crimson.png

1536 x 256, or a 1536 x 1024 sheet that Claude crops.

```text
A flat strip of deep crimson lacquer or enamel filling the frame, seen straight on. Rich, dark red with gentle depth and a soft horizontal highlight along its upper edge, like a polished enamelled bar. Even from left to right so it can repeat. No border, ornament or texture beyond the lacquer itself.
```

### ui-cost-coin.png

1024 x 1024, cut-out.

```text
A single struck gold coin seen straight on, filling most of the frame. A raised, slightly worn rim and a smooth, blank, gently domed face, where a number will be added later. Warm, slightly aged gold with soft light from the upper left. No emblem, profile, lettering or pattern on the face.
```

## 4. Buttons and panels

Carved wood with a brass edge, and the main action on each screen gilded. Claude adds the labels and the hover and press states in code.

### ui-buttons-wood.png

1536 x 1024, cut-out. One sheet with both buttons.

```text
Two blank buttons for a fantasy game interface on one sheet, seen straight on and spaced well apart, each a wide rounded rectangle about four times as wide as it is tall.
Top: carved dark oak with a shallow bevelled edge and a thin brass rim, the wood grain running lengthwise, matte and worn smooth by hands.
Bottom: the same carved oak shape, but with a gilded rim and a thin gilded inner line, catching warm light, for the most important action.
Both faces are plain and calm, with no carving in the middle where a word will go.
```

### ui-panel-parchment.png

1536 x 1024, cut-out.

```text
A single blank sheet of heavy parchment seen straight on, filling most of the frame, with softly deckled and slightly torn edges and one corner gently curled. Warm cream in the middle, darkening a little toward the edges with age. No writing, seals, folds across the middle or stains in the centre, which must stay plain for text.
```

### ui-medallion-iron.png

1024 x 1024, cut-out.

```text
A round medallion of blackened iron seen straight on, with a raised gold rim and a smooth, slightly recessed, blank centre where an emblem will be added later. Matches a blackened-iron card frame with gold trim. No emblem, face or pattern.
```

### ui-mana-gems.png

1536 x 1024, cut-out. Six gems on one sheet.

```text
Six small cut gemstones on one sheet, arranged in a single row with plenty of space between them, all the same size and the same rounded cushion cut, seen straight on in soft light from the upper left:
1. warm gold topaz, 2. deep sapphire blue, 3. dark violet amethyst, 4. ember red garnet, 5. moss green peridot, 6. smoky grey quartz.
Each has a gentle inner glow and one soft highlight. No settings, metal or background objects.
```

### ui-turn-banner.png

1536 x 512, cut-out.

```text
A long horizontal strip of unbleached linen cloth seen straight on, as if pinned flat across a table: plain in the middle, with frayed, torn ends at left and right and a gentle wave along its length. Warm oatmeal colour matching a linen war map. No writing, emblem or stitching in the middle, where words will go.
```

## 5. Extras

The creator asked for these three extras. Claude's ideas for what goes on the table and the card back are proposals for review.

### ui-table-props.png

1536 x 1024, cut-out. Four items on one sheet, seen from directly above like the table.

```text
Four separate objects for a field commander's map table, seen from directly above as if lying on the table, spaced well apart on one sheet:
1. a heavy round iron map weight with a worn ring handle;
2. a short candle stub in a shallow iron dish, unlit, with old drips of wax;
3. a small squat inkwell of dark glass with a plain cork;
4. a second map weight, a rough wedge of dark stone bound with an iron band.
Each object casts no shadow on the sheet; Claude adds shadows in the game.
```

### ui-stat-plaques.png

1536 x 1024, cut-out. Two plaques on one sheet.

```text
Two small blank plaques for a fantasy card, seen straight on and spaced apart, each a rounded rectangle slightly wider than tall, with a thin raised gold edge:
Left: deep crimson enamel.
Right: dark blackened iron.
Both faces are smooth and blank, where a number will be added later. They match a blackened-iron card frame with gold trim.
```

### ui-card-back.png

1024 x 1536.

```text
The back of a playing card for a high-fantasy card game, seen straight on and filling the frame, symmetrical top to bottom. A blackened iron border with thin gold trim, matching the card fronts. Inside, a deep night field of blue fading to violet, with a single fine gold strand crossing it in a long gentle curve from the lower left to the upper right, faintly glowing. Quiet, elegant and simple enough to read at small size. No lettering, emblems or faces.
```

The gold strand on the card back is Claude's proposal, to tie the back to the home screen.
