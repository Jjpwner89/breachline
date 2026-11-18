---
name: browser-checks-silent
description: "When Claude checks Breachline in the built-in browser, mute the game first and close the tab after"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6469f0be-da82-4af2-bde9-3be528f128b5
  modified: 2026-11-12T13:47:52.753Z
---

When checking the live or local Breachline page in the built-in browser, turn the game's sound off before clicking anything, and close the tab when done.

**Why:** the first click starts the tavern music, and it played out loud on the user's computer while Claude was developing (2026-11-12).

**How to apply:** prefer headless checks (jsc tests, sims) where they cover the change. If a browser check is needed, press the speaker button first, or read the page without clicking. Close the tab with tabs_close at the end. Related: [[breachline-project]].
