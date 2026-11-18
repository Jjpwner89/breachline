---
name: rts-project
description: "The user's RTS/grand-strategy game lives in Games/RTS as its own git repo (github Jjpwner89/RTS), separate from Breachline; read its DESIGN_NOTES.md first"
metadata:
  node_type: memory
  type: project
  originSessionId: 4181bbe4-3b02-4212-8922-467accb77c48
  modified: 2026-11-18T20:00:40.127Z
---

Started 2026-11-18. The RTS is a separate git repo at `/Users/dpuser/Documents/Claude/Games/RTS`, with remote `https://github.com/Jjpwner89/RTS.git`. Breachline's repo ignores it through `.git/info/exclude` (`/RTS/`). Goals, decisions and open questions live in `RTS/DESIGN_NOTES.md`, so read that first and edit it, not memory, when decisions change.

**Why:** the user wants their own game in the Total War / Crusader Kings / Stellaris vein (real time, rising from lord to emperor, combat at every scale) kept apart from Breachline. A simpler War of Dots–style strategy game is a parallel side project; the deeper game takes precedence.

**How to apply:**
- Worktree sessions of the Breachline repo can't write into `Games/RTS` (a hook blocks the main checkout). Either work in a nested clone inside the worktree, then `git -C Games/RTS pull <that clone> main`, or start the session with `Games/RTS` as its folder.
- Python can't serve files from Documents (macOS privacy), so preview from an rsync copy in the scratchpad, like Breachline.
- On 2026-11-18 a push to the RTS remote got a 403: the saved GitHub token only covered the breachline repo. Check whether the user has fixed that before pushing.
- The setting may become Breachline's world; the user will decide later. See [[breachline-project]].
