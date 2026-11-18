---
name: breachline-session-limits
description: "The user keeps one active Breachline dev session and one active story session; art threads are theirs to run and don't count"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6469f0be-da82-4af2-bde9-3be528f128b5
  modified: 2026-11-08T21:49:46.060Z
---

The user keeps one active dev session and one active story session for Breachline. Art threads, including Codex working in the main checkout, are theirs to run as they like, and don't count toward that.

**Why:** on 2026-11-06 parallel sessions with uncommitted work had left the art direction, campaign and stat refactor out of step. On 2026-11-08 the user said they have multiple art lines open and that's fine.

**How to apply:** before starting another dev or story session, check what's running and suggest fitting the work into the existing one. Don't count art threads or suggest closing them. Merge finished work to `main` promptly. See [[breachline-project]].
