BREACHLINE UI POLISH — COMPLETE SOURCE-ART HANDOFF
11 November 2026

35 PNG sheets: 13 core, all 15 control/alignment options, 1 Dominion comparison sheet, and all 6 newly added progression sheets.
All 35 are 1536 x 1024 RGBA PNGs, generated with the built-in image_gen tool.
Full exact prompts, references, generation corrections, hashes and measured crop rectangles are in UI_POLISH_MANIFEST.json and ../fx/FX_POLISH_MANIFEST.json.
Open UI_POLISH_GALLERY.html for full sheets, individual pieces, live effect playback, background switches and the selected alignment lineup at 18 pixels.

CREATOR DECISIONS
- All Group 2 options were explicitly requested so Claude can implement and compare them.
- Vigil, Gnosis, Fervor, Genesis and Neutral emblems are approved unchanged.
- The original Dominion crescent-and-ring was rejected.
- The creator selected the LEFT IRON CROWN in ui-alignment-dominion-options.png.
- UI_POLISH_SELECTIONS.json supplies the six selected emblem source rectangles.
- Hand-and-chain and gate remain unselected alternatives, not new lore.
- Other sheets are generated for review and testing; no blanket art approval is inferred.

IMPLEMENTATION
- These are source paintings. Game code and web/ derivatives were not edited.
- Use the explicit sprites[].source_rect_xyxy in the manifests for static pieces. Several paintings are offset from a mathematically equal grid, so cutting static sheets into equal cells would clip some pieces. Rectangles include 12px around visible alpha>8 content.
- Do not hard-code a black background from a preview. PNG alpha is real; RGB values under transparent pixels include colored glow which is invisible when composited normally.
- Original generated pixels and alpha are preserved. Low-alpha edge haze/noise remains; if runtime filtering exposes seams, pad extracted sprites in Claude's build step rather than cropping painted content.
- Effects use EXACT 512 x 512 frames, 3 across by 2 down, top row first. Do not individually trim/recentre them. Preview defaults to about 0.39 seconds plus a quiet loop interval; tune timing, fade, glow and impact strength in-game.
- The rare and legendary reveal effects go BEHIND the card. Their central spaces have faint residual alpha; the overlaid card covers it. Keep the centre masked by the card during reveal.
- Align the closed/open packs by the container bases, not by the bounding box of the raised lid or hanging hasp.
- The hourglass is supplied as an empty frame plus separate upper/lower sand pieces. Scale and clip sand to the glass interior when animating.
- Main and secondary buttons have stretchable blank centres and separate round icon pieces. Preserve end ornaments when stretching.
- Currency and rarity order follows the current brief. Gold and shards remain placeholder names, not text painted into the art.
- Nothing was committed or published.

FILES AND OPTIONS
ui/ui-medallion-rings.png — core — 2 pieces/frames
ui/ui-victory-crest.png — core — 1 pieces/frames
ui/ui-defeat-crest.png — core — 1 pieces/frames
ui/ui-spoils-ribbon.png — core — 1 pieces/frames
ui/ui-map-seals.png — core — 4 pieces/frames
ui/ui-army-figures.png — core — 5 pieces/frames
ui/ui-gilt-ornaments.png — core — 6 pieces/frames
ui/ui-life-wax.png — life / A / seal and nail rail — 4 pieces/frames
ui/ui-life-wax-brass-cup.png — life / B / brass cup — 3 pieces/frames
ui/ui-end-turn.png — end turn / A / bronze press — 2 pieces/frames
ui/ui-end-turn-hourglass.png — end turn / B / hourglass — 3 pieces/frames
ui/ui-end-turn-camp-bell.png — end turn / C / camp bell — 1 pieces/frames
ui/ui-status-grounds.png — status / 1 / illuminated initials — 3 pieces/frames
ui/ui-status-grounds-enamel-shields.png — status / 2 / enamel shields — 3 pieces/frames
ui/ui-status-grounds-brass-bar.png — status / 3 / brass bar — 3 pieces/frames
ui/ui-status-grounds-wax-tabs.png — status / 4 / wax tabs — 3 pieces/frames
ui/ui-buttons.png — buttons / 1 / blackened iron and gold — 3 pieces/frames
ui/ui-buttons-crimson-lacquer.png — buttons / 2 / crimson lacquer — 3 pieces/frames
ui/ui-buttons-engraved-brass.png — buttons / 3 / engraved brass — 3 pieces/frames
ui/ui-buttons-tooled-leather.png — buttons / 4 / tooled leather — 3 pieces/frames
ui/ui-buttons-parchment-wax.png — buttons / 5 / parchment and wax — 3 pieces/frames
ui/ui-alignment-emblems.png — alignment / proposed motifs — 6 pieces/frames
ui/ui-alignment-dominion-options.png — Dominion replacement / three proposals — 3 pieces/frames
ui/ui-currency.png — progression — 5 pieces/frames
ui/ui-pack-wrappers.png — progression — 3 pieces/frames
ui/ui-pack-open.png — progression — 3 pieces/frames
ui/ui-rarity-gems.png — progression — 4 pieces/frames
fx/fx-slash.png — core — 6 pieces/frames
fx/fx-pierce.png — core — 6 pieces/frames
fx/fx-crush.png — core — 6 pieces/frames
fx/fx-death.png — core — 6 pieces/frames
fx/fx-summon.png — core — 6 pieces/frames
fx/fx-heal.png — core — 6 pieces/frames
fx/fx-rare-burst.png — progression — 6 pieces/frames
fx/fx-legendary-burst.png — progression — 6 pieces/frames
