---
name: browser-checks-silent
description: "Browser checks of Breachline or the RTS: mute first, use a fresh tab (never one the creator may be playing in), close it after"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6469f0be-da82-4af2-bde9-3be528f128b5
  modified: 2026-11-12T13:47:52.753Z
---

When checking the live or local Breachline page in the built-in browser, turn the game's sound off before clicking anything, and close the tab when done.

**Why:** the first click starts the tavern music, and it played out loud on the user's computer while Claude was developing (2026-11-12).

**How to apply:** prefer headless checks (jsc tests, sims) where they cover the change. If a browser check is needed, press the speaker button first, or read the page without clicking. Close the tab with tabs_close at the end. Never reuse a tab the creator may be playing in: on 2026-11-21 an orchestrator reloaded the seed tab of its own Browser pane and wiped the creator's in-progress siege battle (98 clicks). Check tabs_context and the tab notes first, then open a fresh tab (tabs_create) for checks and close only that one. Related: [[breachline-project]], [[rts-project]].
