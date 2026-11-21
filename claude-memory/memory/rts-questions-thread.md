---
name: rts-questions-thread
description: "RTS roles: the question thread is the orchestrator (vision, QC sign-off, talks to the creator); the main RTS session runs dev; log fun-either-way tradeoffs there and keep building"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4181bbe4-3b02-4212-8922-467accb77c48
  modified: 2026-11-20T18:00:00.000Z
---

When an RTS feature has two options that both seem fun, or the creator would likely want a say, log the question to the thread the creator started for that purpose (another Claude session named "Orchestrator", formerly "Question thread"; find it with ListAgents) instead of stopping. Keep developing on a sensible default, and adjust when they answer.

Roles from 2026-11-20: the creator made that thread the RTS **orchestrator**. It owns vision, the roadmap, HOW_WE_BUILD/GENRE_BASICS, questions to the creator and the final hand check. The main RTS dev session ("RTS game exploration and design") owns day-to-day dev: assigning tasks, holding sessions to HOW_WE_BUILD, tying map/town/rivals/saves together, and handing finished batches to rts-qc. Flow: a session builds → dev session reviews → rts-qc plays it → orchestrator looks and runs checks() → only then the creator hears. Send the orchestrator creator questions (with the default in use), "batch passed QC" notes with commits, and roadmap drift.

**Why:** the creator (2026-11-19/20) wants input on real tradeoffs without blocking the build, and wants nothing called ready until it has been played by someone other than its author.
**How to apply:** pick a default, note it in the question, carry on; never report work to the creator as ready yourself. Related: [[rts-project]].
