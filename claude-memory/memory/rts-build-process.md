---
name: rts-build-process
description: "RTS work follows HOW_WE_BUILD.md — done means played by hand everywhere it shows up, one code path per feature, no silent failures, checks(), a QC session, genre basics; verify before relaying"
metadata:
  node_type: memory
  type: feedback
  originSessionId: ef6fad51-ab65-46d9-9d31-d37b489e718c
  modified: 2026-11-21T04:30:00.770Z
---

On 2026-11-20 the creator adopted `RTS/HOW_WE_BUILD.md` and `RTS/GENRE_BASICS.md` after finding obvious problems in builds reported as done (cities without walls, ugly forts, towns not matching their numbers, units sliding instead of walking — nobody had ever suggested walk animations).

**Why:** sessions tested one path with scripted players, four code paths built the same thing differently, failures were silent, and the relaying session passed reports on without looking.

**How to apply:**
- Never tell the creator something is done from a session's report alone: pull it, open it in the browser, look, run `checks()` in the console (src/checks.js), then relay, saying what wasn't checked.
- Done = played by hand with screenshots in every place the feature appears (village, storm, capture, look-round, world map, saves, rivals, auto-resolve), no console errors.
- One shared code path per feature; no silent give-ups or caps; finish a feature (look, animation, sound, UI, rivals, saves) before widening.
- The standing quality-check session (rts-qc) plays each batch before the creator hears it's ready.
- Proactively check new work against the genre basics players expect (animation, feedback, construction stages, tooltips) and raise gaps unasked.

Related: [[rts-project]], [[rts-questions-thread]].
