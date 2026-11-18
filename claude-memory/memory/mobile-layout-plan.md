---
name: mobile-layout-plan
description: "Breachline mobile layout (upright = layout A, sideways = layout B), built in phone.css on 2026-11-12"
metadata:
  node_type: memory
  type: project
  originSessionId: 40e2a450-cdd5-46bc-aa19-726a580be4d8
  modified: 2026-11-12T15:56:34.423Z
---

On 2026-11-12 the user picked a mobile battle layout from the mockup canvas https://claude.ai/artifact/2nVwRftEPFELeDfMwB5AmS.
- **Upright:** layout A.
- **Sideways:** layout B.

The two are aligned on purpose:
- the enemy sits top-left and the menu top-right;
- upright, the order top to bottom is: enemy bar, board, your row (life, mana, Play/Command, End turn seal), then the hand at the bottom;
- sideways, you sit bottom-left and the round bronze End turn seal bottom-right;
- there is no help text, turn strip or picked-card text panel, and no Cancel button (2026-11-12).

The hand is a held fan in both orientations, with less than half a card of overlap. Tapping a card does what hover does in the desktop hand (polish.css `#hand .card:hover .cslot`: straighten, scale 1.45, rise; the user found 30–40% too high, so it rises about 0.12 × card width + 4px) and brings it to the front with a slight highlight; it lights its tiles and is playable from there (2026-11-12). The other cards don't dim. Holding a card brings it up large on the left side of the screen; that is the only way to read a card on mobile. The user rejected a spread-out "your hand" overlay (2026-11-12).

Cards on mobile are the same cards as desktop: the same frameHtml frame, just smaller in the fan and larger when held. The user assumes players know their own cards, so small unreadable rules text in the fan is fine. The board may differ between layouts.

**Why:** the user's brother found the phone layout crowded and hard to use. End turn ended up on the left, the hand was below the fold, and landscape showed only one board row.

**How to apply:** it was built on 2026-11-12 in `breachline/phone.css`, with the hold view and phone menu buttons in ui.js (commit d4f27e3). Change the phone layout there and keep it matching the canvas and DESIGN_NOTES. Related: [[ui-polish-integrates-last]], [[breachline-project]].
