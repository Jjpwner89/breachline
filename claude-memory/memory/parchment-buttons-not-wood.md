---
name: parchment-buttons-not-wood
description: "Breachline UI should use the parchment ribbon buttons, never the wooden button.png / button-main.png frames"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 40e2a450-cdd5-46bc-aa19-726a580be4d8
  modified: 2026-11-14T00:55:18.602Z
---

The creator dislikes the wooden-frame buttons (`art/web/ui/button.png`, `button-main.png`). Use the parchment ribbons (`btn-quiet.png`, `btn-main.png` with the wax seal), resized for small header buttons; a darkened parchment ribbon is fine for the account chip. (2026-11-13)

**Why:** said twice in the home/Exhibition mockup review: "I do not like those wooden buttons."

**How to apply:** slice the ribbons with fixed top/bottom rims (`30 84 fill` for quiet, `36 150 58 194 fill` for main) so the gold rim never stretches with two-line text; stretching the rim was why campaign who-plays text spilled out of its border. Related: [[ui-polish-integrates-last]], [[mobile-layout-plan]].
