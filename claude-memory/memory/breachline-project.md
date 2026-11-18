---
name: breachline-project
description: "Breachline, the user's original fantasy grid card game: where its decisions live in the repo and how to work in this folder"
metadata:
  node_type: memory
  type: project
  originSessionId: 6469f0be-da82-4af2-bde9-3be528f128b5
  modified: 2026-11-08T21:49:43.530Z
---

Breachline is the user's original fantasy card game on a grid, in the `breachline` folder of the Games repo. Its rules, decisions, open questions and ways of working live in `breachline/DESIGN_NOTES.md`, so read that first. It also lists the one home for each topic: `SETTING.md` for the world, the `art-direction` and `flavor-text` skills, `CAMPAIGN.md` and the card docs. These memory notes don't repeat what's in the repo.

**Why:** on 2026-11-08 the user found facts copied across memory and several docs had drifted out of step, and chose one home per topic.

**How to apply:**
- Edit the repo docs, not memory, when a game decision changes.
- `DESIGN_NOTES.md` has a "Waiting to apply" section of art-direction changes. Apply them once Codex has finished its current art work, which it does directly in the main checkout.
- The Write tool is blocked on the main checkout. Edit in a worktree, commit, then fast-forward `main` with `git -C /Users/dpuser/Documents/Claude/Games merge --ff-only <branch>`.
- Push with `GIT_TERMINAL_PROMPT=0 git push origin refs/heads/main:refs/heads/main`.
- `sync_with_base_branch` refuses here because the origin isn't pinned, so merge locally.
- The shell is zsh, so use arrays for lists of paths.

See [[notes-resolve-by-deleting]] and [[breachline-session-limits]].
