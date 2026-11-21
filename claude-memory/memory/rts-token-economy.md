---
name: rts-token-economy
description: "The creator is on a Pro plan (with credits) — run routine RTS sessions on Sonnet, restart bloated sessions fresh, message only at batch end"
metadata:
  node_type: memory
  type: feedback
  originSessionId: ef6fad51-ab65-46d9-9d31-d37b489e718c
  modified: 2026-11-21T07:03:17.599Z
---

On 2026-11-21 about 15 Opus RTS sessions with 300K+ contexts used 15% of the 5-hour limit in about 8 minutes. The creator said to be more dynamic with model choice: run several sessions on Sonnet and flip one to Opus only if it is really failing. Restart bloated sessions fresh, and stay aware of the token economy. The goals stay the same. Usage credits are on.

**Why:** every tool call re-reads a session's whole context, so many big sessions plus chatty cross-session messages burn the plan fast.

**How to apply:**
- Use Sonnet for QC, playtesting, asset scouting and fix-and-polish builders. Keep Opus for the Manager, design-heavy work and hard code (rendering, animation, battles).
- When a session passes about 250K context, have it write a short handoff note and clear itself, then resume it from the note.
- Sessions message only at batch end or when blocked. The Manager sends a digest every 1–2 hours. No acknowledgement-only messages.
- Take screenshots at scale 0.5 or zoomed to a region.
- Don't relay every small update to the creator; batch them.
- Check usage with get_usage.

Current orchestrator state: `/Users/dpuser/Documents/Claude/Games/.claude/worktrees/question-thread-4a510c/ORCHESTRATOR_HANDOFF.md`. Related: [[rts-orchestrator]], [[rts-north-star]].
