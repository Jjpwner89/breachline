# Breachline UI polish briefs

<!-- CODEX_UI_POLISH_HANDOFF_2026_11_11 -->
**Generation handoff — 2026-11-11:** All core assets, every Group 2 option and all six Group 3 assets are generated: **35 source sheets** including the Dominion comparison. See [gallery](ui/UI_POLISH_GALLERY.html), [Claude handoff](ui/UI_POLISH_README.txt), [UI manifest](ui/UI_POLISH_MANIFEST.json), [FX manifest](fx/FX_POLISH_MANIFEST.json) and [selected emblem crops](ui/UI_POLISH_SELECTIONS.json). The creator approved five original alignment emblems and selected the **iron crown** from the separate Dominion options sheet; the original crescent-and-ring is rejected. Other choices remain available for testing. This dated handoff supersedes older generation-status wording below.

24 images for the second interface pass, from Claude's audit on the [polish pass page](https://claude.ai/artifact/WhNJqiYHKZM63JVuwWYfBF). Written on 2026-11-10 and revised on 2026-11-11 after the creator's first review. **Status:** group 1 (13 images) was generated on 2026-11-11. For group 2 (5 images) the creator asked for every option to be painted, so they can be compared in the mockups before choosing; save each option as its own file, such as `ui-end-turn-a.png`. Group 3 (6 images), added later the same day, covers collecting and gold for the progression work. The first review dropped three briefs: the keyword studs (replaced by status letters), the brass turn seal (replaced by a heavier end-turn piece) and the campaign medals (replaced by alignment emblems).

Like the [UI briefs](UI_ART_BRIEFS.md) and [tile briefs](TILE_ART_BRIEFS.md), these are materials for the interface, not card art, so card rules about subjects, poses and stories don't apply. Keywords are shown as their first letter on a painted ground, so a new keyword needs no new art.

## The creator's decisions so far (2026-11-11)

From the first review of the polish page. These guide the briefs below; the game code hasn't changed yet.

- **Approved:** the battle layout with portrait medallions and a larger board (now 6 x 5), the fanned hand that lifts, the combat feedback, the card-draw animation, the reward card flip, the campaign map and the new home screen.
- **Changed:** the battle log stays hidden until clicked, so the table feels like the world. Life and the end-turn control need visible weight. Status letters stay, in a new look. Hitting a summoner goes straight up the board. Victory pays out currency from battle stats, line by line, with stamps and falling coins; the progression work sets the real amounts.
- **Dropped:** the ink-wash transition, the carved wooden buttons, the flat life seals, and the campaign seals on the home screen, which become alignment emblems.
- **Added:** sound throughout, using CC0 libraries; more transitions; an emblem for each alignment.

## Instructions for the image generator

1. If you have access to the project, read `.claude/skills/art-direction/SKILL.md` first. Its painting style applies here; its card composition rules don't.
2. Generate one image per heading, using the shared direction plus that image's brief. Do group 1 first, in order. In group 2, generate only the briefs the creator has marked as picked.
3. Save each as a PNG under the name in the heading: the `ui-` images in `art/ui/` and the `fx-` sheets in `art/fx/`, at 1536 x 1024. Claude prepares the game-sized versions, so don't make `web/` copies.
4. Every image is a **cut-out**: a transparent background, with soft edges, smoke, light and ember partly transparent rather than painted onto a solid colour. If your generator can't make transparent images, stop and say so; a grey background won't work for these.
5. Attach the references named in each brief. `art/ui/ui-table-linen-map.png` and `art/ui/ui-table-oak.png` show the table everything sits on; don't paint them.
6. Skip any image whose file already exists, and never overwrite existing art.
7. If you can't generate images, stop and say so. Don't substitute placeholders or images from the web.

When finished, list the files you created and any you couldn't complete, and add them to a manifest beside the images with the exact prompts, as for the tile art.

## Shared direction

Apply this to every image:

```text
Create one original interface asset for Breachline, a high-fantasy card game played on a linen war map stretched over a weathered oak camp table, lit by one warm lamp. The interface is made of real objects a field commander would have on that table: blackened iron, worn brass, gold leaf, wax, silk, parchment and ink.

Paint it in the same hand as the game's traditional oil and acrylic fantasy paintings: visible but quiet brushwork, believable materials, precise rather than noisy detail. Never a photograph, 3D render, vector art, flat icon, emoji or cartoon. Evenly lit from the upper left.

Transparent background. Paint only the object or effect itself: no table, cloth, map, hands or scenery unless the brief asks for them. No text, letters, numbers, runes, logos, watermarks or signatures. Where a brief asks for a blank area, leave it plain and smooth so the game can write on it.
```

## Sheet layout

Add this to every sheet with several pieces:

```text
A sprite sheet of separate pieces on one transparent image, arranged in the grid the brief gives, every piece centred in its own equal cell with clear empty space around it. No piece may touch or cross its cell's edge; leave at least a tenth of the cell clear all round. All pieces share the same scale, light and finish, so they read as one set. No borders, frames or dividing lines between cells.
```

Effect sheets use the frame layout from `EFFECT_SPRITE_BRIEFS.md` instead (six 512 x 512 frames in two rows of three), quoted again in each effect brief below.

## Group 1: needed whatever the picks

### ui-medallion-rings.png

1536 x 1024, cut-out, 2 pieces side by side. The portrait frames for the two summoners. The game places a card painting inside each ring.

```text
Two round portrait rings, each a thick band of blackened iron with a fine gold inner edge and small gold studs at the four quarters. The centre of each ring is completely empty and transparent.
Left: the player's ring, its gold edge bright and warm.
Right: the enemy's ring, with a thin band of deep crimson enamel inside the gold edge.
```

Attach `art/ui/ui-medallion-iron.png` for the existing iron.

### fx-slash.png, fx-pierce.png and fx-crush.png

1536 x 1024 each, cut-out. One impact sheet per kind of attack, played on the struck unit for about a third of a second. The game turns each sheet to face along the attack, adds the lunge, shake, flash and damage number, and picks the sheet from the attacker's weapon.

Add this frame layout to each:

```text
A sprite sheet of six square animation frames, each 512 x 512, in two rows of three with no gaps, borders or dividing lines. Read the frames left to right along the top row, then the bottom row. They are six moments of one continuous impact at the centre of each frame, from first contact, through the moment of greatest force in frame 2, to the last faint traces in frame 6. Keep the effect centred, at the same scale and in the same light in every frame, so the frames play as one smooth motion. Nothing may touch a frame's edge.
```

- **fx-slash.png:** "A blade strike. A bright curved arc of cut air sweeps from the left of the frame to the right, with a scatter of steel sparks and a few torn threads of cloth flung along its path. Warm white at the arc's edge, pale gold sparks, no blood."
- **fx-pierce.png:** "A thrust from a spear or arrow, travelling toward the top of the frame. A tight cone of splinters, dust and sparks bursts away from a single point, with a thin streak of light behind it. Narrow and fast, pale gold and grey, no blood."
- **fx-crush.png:** "A heavy blow from above. A ring of cracked shockwave and thrown dust spreads from the centre, with chips of stone and a dull orange flash at the core. Heavy and blunt, earth brown, grey and dull orange, no blood."

### fx-death.png

1536 x 1024, cut-out, the same six-frame layout. The game dissolves the unit's own painting from the bottom up; this sheet plays over it.

```text
A card burning away. A ragged edge of glowing orange ember rises up through the frame as if eating upward through a sheet of paper, throwing up curling grey ash flakes and a few bright sparks, then thinning to drifting ash in the last frames. Seen straight on. Warm orange, grey ash and black char; quiet and final rather than explosive.
```

Attach `art/ui/ui-tile-burn.png` for the char and ember.

### fx-summon.png

1536 x 1024, cut-out, the same six-frame layout. Plays on the tile as a unit arrives, before its card appears.

```text
A summoning circle drawn in ink on the war map. A single ring of dark sepia ink spreads outward from the centre as if poured, with fine splatters and a faint warm glow catching inside it, then the ink sinks into the cloth and fades in the last frames. Seen from directly above. Sepia, dark brown and a little gold light; no symbols or runes inside the ring.
```

Attach `art/ui/ui-table-linen-map.png` for the cloth the ink sinks into (don't paint the cloth).

### fx-heal.png

1536 x 1024, cut-out, the same six-frame layout. Plays when a unit is healed or strengthened.

```text
Soft warm motes of light drawn inward from all around the frame, spiralling gently into a small glow at the centre, which brightens and then settles into a few drifting motes. Warm gold and soft white, gentle and calm. No petals, candles or wax, so it doesn't repeat consecrated ground.
```

### ui-victory-crest.png

1536 x 1024, cut-out. Drops in at the top of the victory screen. The game writes "Victory" on the ribbon.

```text
A victory crest: a broad, softly folded ribbon of cream silk with swallowtail ends stretched across the middle, its face blank and smooth. Behind it, a wreath of gilded laurel leaves and two crossed spears with small crimson pennons. Fine, ceremonial and warm, as if just lifted from a commander's chest.
```

### ui-defeat-crest.png

1536 x 1024, cut-out. The same crest after a loss. The game writes "Defeat" on the ribbon.

```text
The same crest as the victory crest, fallen: the cream silk ribbon is torn through one end and stained with soot, its face still blank and readable; the laurel is scorched and missing leaves; one spear is snapped and its pennon burnt. Tilted slightly, as if it has dropped onto the table. Muted and sombre, not gory.
```

Attach `ui-victory-crest.png` once it exists, so the two match.

### ui-spoils-ribbon.png

1536 x 1024, cut-out. Marks the reward card taken from the beaten enemy, draped over its top corner.

```text
A length of deep crimson silk ribbon draped diagonally, as if tied round the corner of a card, with a small tag of red wax pressed on it where the ends cross. The wax is blank and smooth. Rich and slightly worn.
```

### ui-map-seals.png

1536 x 1024, cut-out, 4 pieces in a row. The battle markers on the campaign map. The game writes the chapter number or a tick on each.

```text
Four round wax seals pressed onto a map, each with a slightly irregular edge and a smooth, blank pressed face, seen from directly above.
1. Not yet reached: dull, cool grey-brown wax, slightly dusty.
2. The next battle: fresh, glossy crimson wax.
3. Won: crimson wax covered in worn gold leaf.
4. The final battle: a larger seal of black wax with a thin crimson rim.
```

Attach a campaign map from `art/maps/` for the scale of the map they sit on.

### ui-army-figures.png

1536 x 1024, cut-out, 5 pieces in a row. A small painted miniature of the player's army that walks the road between battles. Seen from slightly above and in front, about 60 pixels tall in the game.

```text
Five small tabletop miniatures, each a single figure on a round brass base, cast in brass and pewter and lightly painted at the edges, like pieces on a general's campaign map. Each is a clear silhouette standing still, facing the viewer.
1. a knight carrying a tall pennon;
2. a robed scholar holding up a lantern;
3. a cloaked court bailiff with a tall staff of office;
4. a broad orc warrior carrying a war banner, coarse and clearly not human;
5. a great shaggy bison.
```

They stand for the five starting armies in order: Oath of the Sunmane, The Lantern Conclave, The Ashen Court, The Warhorde and The Elder Herd. Attach each army's leading card painting from `art/web/` for its look.

### ui-gilt-ornaments.png

1536 x 1024, cut-out, a grid of 3 columns by 2 rows. Gold-leaf ornaments for headings and panels across every screen.

```text
Six ornaments in raised, slightly worn gold leaf, fine and restrained:
1. a long horizontal divider, a thin line with a small leaf flourish at the centre;
2. a short horizontal divider;
3. a corner flourish for the top-left corner of a panel, filling only the corner;
4. a small flourish to sit under a heading;
5. a small diamond bullet;
6. a closing mark for the end of a section.
```

## Group 2: wait for the creator's round-2 picks

Each heading lists the options from the page. Generate only the one the creator picks; Claude will mark it here.

### ui-life-wax.png (life)

1536 x 1024, cut-out. The life counter beside each summoner's portrait. The game writes the number on the seal. The creator asked for weight: these must read as heavy, thick objects resting on the table, not flat stickers.

**Option A, seal and nail rail (recommended):** 4 pieces in a row.

```text
1. A large, thick crimson wax seal, like a seal on a royal letter but deeper: a raised, rolled rim, a smooth blank pressed face slightly sunk below the rim, one fat drip of wax spilling over the lower right edge, and a visible thickness at its side, with a soft cast shadow beneath it;
2. one round brass nail head driven into wood, polished and catching the light;
3. the empty hole left where such a nail was pulled out, dark, with a little splintered wood round it;
4. a short straight length of dark oak rail, its top face flat, made to be repeated end to end.
```

**Option B, seal in a brass cup:** 3 pieces in a row: the same thick crimson seal set into a heavy round brass bezel like a signet; a polished upright brass notch; the same notch filed down and blackened.

### ui-end-turn.png (end turn)

1536 x 1024, cut-out. Replaces the End turn button. The game writes "End turn" on it where there's a blank face, adds the glow and the press, and plays the sound. The creator asked for weight.

**Option A, bronze press (recommended):** 2 pieces side by side.

```text
A heavy bronze seal-press seen from directly above, like the top of a great desk seal: a thick disc of cast bronze with a deep bevelled edge, a raised outer ring with a band of small rivets, and a smooth, flat, blank centre where words will be written. Its thickness shows at the lower edge, and it rests on the table with a soft shadow.
Left: the player's turn, warm bronze with bright worn highlights on the raised ring.
Right: the enemy's turn, the same press dark and tarnished, with the light gone dull.
```

**Option B, hourglass:** one tall brass-framed hourglass with turned posts and clear glass, seen from the front, with the sand painted separately on a second piece (a top heap and a bottom heap) so the game can run it.

**Option C, camp bell:** one brass hand bell hanging from a short dark iron bracket, seen from the front.

### ui-status-grounds.png (status letters)

1536 x 1024, cut-out. Small grounds the game writes a keyword's first letter on, shown at about 18 pixels on a unit. Three colours stand for kinds of keyword: blue for movement and reach, red for attack, green for growth and healing.

**Option 1, illuminated initials (recommended):** 3 pieces in a row.

```text
Three small square grounds for an illuminated capital letter, as at the start of a chapter in a medieval manuscript: each a square of deep colour framed by a fine raised gold border, with a delicate gold vine curling into each corner. The centre of each square is plain and blank. The colours are deep ultramarine blue, deep vermilion red and deep green.
```

**Option 2, enamel shields:** 3 small heater shields with gold rims and blank fields of blue, red and green enamel.

**Option 3, engraved brass bar:** one horizontal brass plate with rounded ends, brushed and blank, plus its two end caps as separate pieces so the game can stretch it.

**Option 4, wax tabs:** 3 small thick wax drops with blank pressed faces, in blue, red and green wax.

### ui-buttons.png (buttons)

1536 x 1024, cut-out, 3 pieces in a column. Replaces the carved wooden buttons everywhere. The game writes the label, stretches the middle and adds the hover glint and press. The middle of each plate must be plain and even so it can be stretched sideways.

```text
In the material the creator chose: 1. a wide main button plate, about five times as wide as it is tall, with its strongest finish and trim; 2. the same shape in a quieter version for ordinary actions; 3. a small round button the same height, for icons. Each face is plain and blank across its middle.
```

The materials, with the creator's pick still to come (option 1 is recommended):
1. **Blackened iron, gold inlay:** forged dark iron with a fine inlaid gold line round the edge and a small gold rivet at each end; the quieter version has a bronze line.
2. **Crimson lacquer:** glossy deep red enamel with a gold rim; the quieter version is dark lacquer with a gold rim.
3. **Engraved brass:** brushed brass with a bevelled edge; the quieter version is pewter.
4. **Tooled leather:** dark tooled leather with a stitched border and small brass corner caps; the quieter version is darker and plainer.
5. **Parchment and wax:** a stiff parchment label with a pressed edge and a crimson wax seal at its left end; the quieter version has no seal.

### ui-alignment-emblems.png (alignment emblems)

1536 x 1024, cut-out, a grid of 3 columns by 2 rows. Replaces the small alignment symbols everywhere: card bands, mana, deck tiles, filters, and the home screen, where an emblem lights up when that alignment's campaign is cleared. Each must still read as one bold silhouette at 18 pixels. The motifs are Claude's proposals and wait for the creator's verdict.

```text
Six round heraldic emblems, each a thick struck-metal disc with a raised rim, bearing one simple raised device:
1. Vigil, ivory and gold: a sun half risen over a straight horizon line;
2. Gnosis, deep blue and silver: an open eye inside a thin measuring ring marked with fine ticks, like an astrolabe;
3. Dominion, black iron and violet: a crescent moon closing round a plain iron shackle ring;
4. Fervor, red and dark gold: a flame rising through a broken crown;
5. Genesis, green and bronze: a broad leaf whose stem turns into roots wrapped round a seed;
6. Neutral, grey stone and iron: a single rough uncut stone.
```

## Group 3: collecting and gold

Added on 2026-11-11 for the progression work: gold from battles, packs, shards from duplicates and four rarities. "Gold" and "shards" are placeholder names, but the objects work whatever they end up called. These replace the shapes the game draws in code for now. Generate them after group 2.

### ui-currency.png

1536 x 1024, cut-out, 5 pieces in a row. Gold pays for packs; shards come from breaking down spare cards and craft new ones. The coin also flies into the purse in the battle payout and sits beside every price, down to 18 pixels, so it must read as a coin at that size.

```text
1. A single thick gold coin seen straight on, worn and slightly uneven, its face struck with a plain raised ring and a small rayed sun at the centre;
2. a small loose heap of the same coins;
3. a leather drawstring purse, open at the top, plump with the same coins;
4. a single shard: a long, narrow splinter of pale blue crystal with a broken end, faintly glowing from inside;
5. a small heap of the same shards.
```

### ui-pack-wrappers.png

1536 x 1024, cut-out, 3 pieces in a row, closed. The three packs you buy. Each carries a blank round wax seal on its front where the game places an alignment emblem. Seen from the front and slightly above, standing upright.

```text
1. Field pack: a bundle of oilcloth folded like a parcel, tied with rough twine, plain and well travelled, with a round blank wax seal over the knot;
2. Strongbox: a small wooden strongbox bound with dark iron bands and corner plates, a heavy iron hasp at the front, and a round blank wax seal over the hasp;
3. War chest: a rich chest of dark red lacquer with gilded corners, gilt bands and small gilt feet, and a large round blank wax seal over its gold clasp.
```

### ui-pack-open.png

1536 x 1024, cut-out, 3 pieces in a row: the same three packs opened, for the moment the cards come out. Seen from the same angle as ui-pack-wrappers.png, so one can replace the other.

```text
1. The Field pack with its twine cut and the oilcloth falling open, a warm glow rising from inside;
2. the Strongbox with its lid thrown back and the hasp hanging loose, warm light spilling up from inside;
3. the War chest with its lid thrown back, golden light pouring out and a few motes of gold rising.
No cards are visible inside; the game deals them out.
```

### ui-rarity-gems.png

1536 x 1024, cut-out, 4 pieces in a row. Shown on every card at about 12 to 16 pixels, and larger in the collection. Each is a small faceted gem in a plain gold bezel, seen straight on, so they must differ by colour and brightness at a glance.

```text
1. Common: a dull grey-brown stone, polished but plain, in a dark iron bezel;
2. uncommon: a clear pale silver-white crystal in a silver bezel;
3. rare: a bright golden topaz in a gold bezel, catching the light;
4. legendary: a blazing gem shading from fiery orange to deep violet in a rich gold bezel, glowing faintly.
```

### fx-rare-burst.png and fx-legendary-burst.png

Effect sheets in the frame layout from `EFFECT_SPRITE_BRIEFS.md`: six 512 x 512 frames in two rows of three, read left to right, top row first, on one transparent 1536 x 1024 image. They play behind a card as it turns over in a pack, so the centre of each frame stays clear where the card covers it.

```text
fx-rare-burst: a ring of warm golden light bursting outward from behind a card-sized space, throwing fine gold sparks, then fading to a few drifting motes.
fx-legendary-burst: a stronger burst of fire-orange light with deep violet at its edges, long rays reaching to the frame edges, sparks and embers, then a slow fade to a violet glow.
```
