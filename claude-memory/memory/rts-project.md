---
name: rts-project
description: "The user's RTS/grand-strategy game lives in Games/RTS as its own git repo (github Jjpwner89/RTS), separate from Breachline; read its DESIGN_NOTES.md first"
metadata:
  node_type: memory
  type: project
  originSessionId: 4181bbe4-3b02-4212-8922-467accb77c48
  modified: 2026-11-18T20:04:26.021Z
---

Started 2026-11-18. The RTS is a separate git repo at `/Users/dpuser/Documents/Claude/Games/RTS`, with remote `https://github.com/Jjpwner89/RTS.git`. Breachline's repo ignores it through `.git/info/exclude` (`/RTS/`). Goals, decisions and open questions live in `RTS/DESIGN_NOTES.md`, so read that first and edit it, not memory, when decisions change.

**Why:** the user wants their own game in the Total War / Crusader Kings / Stellaris vein (real time, rising from lord to emperor, combat at every scale) kept apart from Breachline. A simpler War of Dots–style strategy game is a parallel side project; the deeper game takes precedence.

**How to apply:**
- Worktree sessions of the Breachline repo can't write into `Games/RTS` (a hook blocks the main checkout). Work in a nested clone inside the worktree and push to GitHub from it (rebase on origin/main first).
- Never pull, merge or commit in `Games/RTS` itself (creator's rule, 2026-11-20): it diverged from GitHub with Codex's unpushed animation commits and uncommitted art files from Codex working there.
- Python can't serve files from Documents (macOS privacy), so preview from an rsync copy in the scratchpad, like Breachline.
- The saved GitHub token covers the RTS repo (granted 2026-11-18): push from your own clone with `GIT_TERMINAL_PROMPT=0 git push origin HEAD:main`.
- The setting may become Breachline's world; the user will decide later. See [[breachline-project]].
