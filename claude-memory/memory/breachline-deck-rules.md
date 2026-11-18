---
name: breachline-deck-rules
description: "Breachline deck size and copy limit as decided on 2026-11-11 — 40 cards, flat 3 copies of any non-land card"
metadata:
  node_type: memory
  type: project
  originSessionId: 6469f0be-da82-4af2-bde9-3be528f128b5
  modified: 2026-11-12T02:15:24.690Z
---

**Decision (2026-11-11):** decks are 40 cards. Every non-land card is limited to 3 copies, whatever its rarity, and lands are unlimited. This replaces the 30-card rule in DESIGN_NOTES until those notes are updated.

**Why:**
- The creator picked flat 3 as the simplest rule, after a test of 4/3/2/1, 3/3/2/1 and flat 3.
- A legendary that proves too strong gets a higher cost rather than a lower copy limit.
- Legendaries are hard to unlock, so few players can stack them.

**How to apply:**
- Every starter, theme and campaign enemy deck is 40 cards with at most 3 copies of each card.
- Boss decks may run 3 of their legendary.
- The deck builder enforces 40 cards and 3 copies.
- **Legendary band (2026-11-14):** the creator raised it to +2 to +5 lift, so legendaries clearly beat rares (c −1.5 to +0.5, u −1 to +1, r −0.5 to +2 unchanged). Nerf a legendary only when it measures above +5; drop any nerf aimed at one already under +5. The council page uses this band; `breachline/tools/report.js` still says +1 to +3.5 until the port.
- Related: [[breachline-deck-goals]], [[breachline-project]].
