---
name: rts-fable-push
description: "The Fable push on the RTS (2026-11-28): what the creator approved, the evidence behind it, and where the specs and reports live"
metadata:
  type: project
---

On 2026-11-28 the creator switched the RTS orchestrator seat to Fable to be a creative design partner: "press me to make a better game… chunky satisfying play is key… tradeoffs real and exciting… consistently engaging… tension remains and the next thing to do feels fun." They want additions and cuts considered, and delight without bloat.

**Approved in one go** ("I like this all! let's do it"), all in `IDEAS_2026-11-28.md` in the RTS repo, with specs in `specs/`:
- Wars with a shape: a visible war score spent on terms (tribute, a place, the knee only when the seat is threatened). `specs/WARS.md`.
- The Muster: one sheet, one host that stays an army, the ban per place with its clock on arrival. `specs/MUSTER.md`.
- Houses that pounce on an empty border, with a warning first.
- Outlaws as one system in three sizes: bands, hideouts that grow in unpatrolled country, and an outlaw king when hideouts are left alone (the creator asked for Bannerlord-style hideouts).
- The crown costs deeds: press your claim, each house names a deed, the rest league into one great host, hold Kingsbridge.
- The north as one named host per wave on a fixed rising schedule, with a goal on screen.
- Each rank takes the old chores away (the steward answers small things from Count).
- Delight: a charter at each rank, regiments that earn a name, the homecoming, the winter page of the chronicle.
- The economy list: default recipes per village, no derived goods by default, custom shipments (one good, any amount), levies count the keep, fallow winter as the default.
- An early raider in the first campaign, even on Gentle.

**The key evidence:** the creator's real save at minute 77 (`~/rts-work/creator-save/creator-77min.json`) shows every rival house bankrupt and hollow (gold 0 to 16, more soldiers than people). Fix how the houses decide (never cheats) before building the crown and league designs.

**Why:** the creator trusts the design lead to propose and push; they decide quickly when shown a clear recommendation.

**How to apply:** Fable designs and writes exact specs; Sonnet sessions build and scout (Opus only if a build needs it); each works in its own clone under `~/rts-work/`; QC before the creator's game on :8792 is refreshed. Villagers with names and all V2/V3 work stay parked until V1 ships. Related: [[rts-north-star]], [[rts-token-economy]], [[rts-roadmap]], [[rts-parked-features]].
