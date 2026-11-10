BREACHLINE — TILE EFFECTS AND AFFECTED-UNIT BORDERS
10 November 2026

Completed: 15 source PNGs, all 1536 x 1024 RGBA.
Generated with the built-in image_gen tool. Integrated into the game in commit cd5b7d4; pending creator review.

FILES
Burning
  ui-tile-burn.png — empty-tile effect with sparse inward details.
  ui-unit-border-burn.png — narrow border-only companion for landscape board unit cards.
Frozen
  ui-tile-frost.png — empty-tile effect with sparse inward details.
  ui-unit-border-frost.png — narrow border-only companion for landscape board unit cards.
Thorns
  ui-tile-thorns.png — empty-tile effect with sparse inward details.
  ui-unit-border-thorns.png — narrow border-only companion for landscape board unit cards.
Blighted
  ui-tile-blight.png — empty-tile effect with sparse inward details.
  ui-unit-border-blight.png — narrow border-only companion for landscape board unit cards.
Consecrated
  ui-tile-holy.png — empty-tile effect with sparse inward details.
  ui-unit-border-holy.png — narrow border-only companion for landscape board unit cards.
Snare
  ui-tile-snare.png — empty-tile effect with sparse inward details.
  ui-unit-border-snare.png — narrow border-only companion for landscape board unit cards.
Charged
  ui-tile-charge.png — empty-tile effect with sparse inward details.
  ui-unit-border-charge.png — narrow border-only companion for landscape board unit cards.
Emblems
  ui-tile-emblems.png — seven emblems in one row.

USAGE
- Open TILE_GALLERY.html to compare each tile overlay over linen and each border over the Sunmane lancer. The gallery also shows 145 x 97-pixel board-size samples and 20-pixel emblems.
- Both effect and border files contain only painted effects; the linen and unit painting are separate. Use ordinary alpha compositing, not a black-removal blend.
- Use ui-tile-*.png on empty tiles and ui-unit-border-*.png when a unit occupies an affected tile. The borders are landscape 3:2 companions for the current board cards, not portrait card frames.
- Preserve the PNG alpha channel during resizing. Let the game add any motion, glow, shadows, labels and turn counters.
- Display effects according to existing rules, including ownership and immunities. These assets do not introduce persistent status effects or change gameplay.
- Border centers are clear: the central 60% area is at least 99.9998% transparent or near-transparent (alpha <= 1/255). Antialiased perimeter pixels are deliberately preserved.
- Emblem order: burn, frost, thorns, blight, holy, snare, charge. Cut the source into seven equal-width columns, then trim each column to its content and add padding. Suggested content rectangles are recorded in the manifest.
- Game-sized derivatives are in art/web/ui/ and were committed with runtime integration in cd5b7d4. Rebuild them with swift art/build-ui.swift after replacing a source painting.

RECORDS
TILE_ASSET_MANIFEST.json: exact prompts, references, generated-source paths, dimensions, hashes, transparency statistics and emblem bounds.
TILE_VALIDATION.json: all fifteen PNGs verified; source hashes match; all have real alpha and clear effect centers.

REVISION
The initial frost tile had a milky fill. It was corrected through image generation before saving the final source in this folder. The rejected version was not added to the project.

SCOPE
Eight assets follow ../TILE_ART_BRIEFS.md. Seven additional border-only variants fulfill the creator’s request for borders on affected units. Existing art was preserved. This pack contains the full-resolution source artwork and review records; runtime integration and game-sized images were committed separately in cd5b7d4.

The emblem sheet was also revised to keep every silhouette inside its equal-width column. The earlier spacing attempt is preserved outside the active collection at ../work-in-progress/ui-effects-2026-11-10/ui-tile-emblems-spacing-v1.png. The gallery and manifest use the corrected sheet.
