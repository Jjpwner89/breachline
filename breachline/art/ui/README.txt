BREACHLINE UI ART — 2026-11-09

Completed: all 16 source PNGs requested in ../UI_ART_BRIEFS.md.
Status: generated and visually checked; awaiting creator review and UI preparation.
Generation: built-in image_gen. Original source pixels and alpha were preserved.

Open UI_GALLERY.html to view the collection. Dark, light and checkerboard backgrounds help inspect the cutouts. The combined home preview is illustrative CSS layering; it does not alter either source image.

FILES

The table
  ui-table-oak.png — 1536 x 1024 — opaque
  ui-table-linen-map.png — 1536 x 1024 — opaque

The home screen
  ui-home-battlefield.png — 1672 x 941 — opaque
  ui-home-strand.png — 1536 x 1024 — opaque

Card materials
  ui-frame-iron.png — 1024 x 1536 — transparent
  ui-card-paper.png — 1254 x 1254 — opaque
  ui-titlebar-crimson.png — 2172 x 724 — opaque
  ui-cost-coin.png — 1254 x 1254 — transparent

Buttons & panels
  ui-buttons-wood.png — 1536 x 1024 — transparent
  ui-panel-parchment.png — 1536 x 1024 — transparent
  ui-medallion-iron.png — 1254 x 1254 — transparent
  ui-mana-gems.png — 1536 x 1024 — transparent
  ui-turn-banner.png — 2172 x 724 — transparent

The finishing pieces
  ui-table-props.png — 1536 x 1024 — transparent
  ui-stat-plaques.png — 1536 x 1024 — transparent
  ui-card-back.png — 1024 x 1536 — opaque

PREPARATION FOR THE UI
- These are full-resolution source assets. No web/ derivatives were created.
- Oak and paper still need the seamless preparation described in the briefs.
- Crimson enamel is a 2172 x 724 source sheet; crop a shallow horizontal strip for title bars.
- Preserve alpha when cropping the buttons, gems, props and plaques. Suggested content bounds (alpha > 8/255) are recorded in UI_ASSET_MANIFEST.json; add a small padding when cutting sprites.
- Composite the strand with screen/additive blending. Its canvas has a black background by design. Position it within the sky rather than across the foreground.
- Use the card frame in the Sunmane lancer preview first, as directed by the briefs. Card-frame approval and game-wide rollout remain separate steps.
- Table props and the strand card-back motif remain proposals for review.
- The frame opening is transparent. Each cutout has real alpha, with corner opacity at most 1/255.
- Source dimensions reflect the largest shapes returned by the generator; no upscaling was applied.

RECORDS
UI_ASSET_MANIFEST.json contains filenames, exact prompts, revision prompts, source provenance, dimensions, checksums, and suggested sprite bounds.
UI_VALIDATION.json records all 16 completed files, image integrity and alpha checks.

REVISIONS
The table props were corrected to a true vertical overhead view. The card back was corrected to remove white exterior corner wedges. Neither discarded version was copied into this folder.

INTEGRATION STATUS
This task created the art pack. Runtime game files were not changed. No existing paintings were overwritten.
