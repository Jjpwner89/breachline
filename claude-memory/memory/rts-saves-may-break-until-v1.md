---
name: rts-saves-may-break-until-v1
description: "Until V1 is declared done, RTS saves may break between builds; don't contort designs or block work to keep old saves loading (creator, 2026-11-23)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 24c3b7bf-f5d4-49d0-bd6c-0fe586374566
  modified: 2026-11-23T15:11:00.151Z
---

The creator, 2026-11-23: "its okay for saves to die while we're developing. until we say v1 is done that's okay".

**Why:** V1 is still changing fast, and keeping every old save loading costs design freedom and build time. The real protection matters once the creator's sister plays the shipped V1.

**How to apply:**
- A save-format change may bump VERSION. The load-failure card from the UI save work says so and keeps the data; no migrate() step is needed before V1.
- The old-save checks (816063a~1 and 431e424) may be retired or replaced when a format change breaks them. Don't bend a design to keep them passing.
- Refreshing the creator's port 8792 doesn't need to wait on save compatibility. Still say so when a refresh will end their campaign.
- Still never touch the creator's live save by hand, and use ?test= saves for checks.
- Once V1 is declared done this flips: migrations and the old-save checks become required. See [[rts-roadmap]] and [[rts-build-process]].

**Confirmed 2026-11-28:** "destroying my save is not a problem". After the big playtest the creator plans a new playthrough on the changed game, so their current campaign doesn't need to survive the Fable push.
