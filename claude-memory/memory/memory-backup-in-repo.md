---
name: memory-backup-in-repo
description: "Claude's Breachline memory is backed up in the repo's claude-memory/ folder; re-run its sync script after changing memory"
metadata:
  node_type: memory
  type: project
  originSessionId: 4959694c-5890-4645-90c6-6cbb8cc8ac9c
  modified: 2026-11-18T12:43:37.644Z
---

On 2026-11-18 the creator might lose access to this computer soon, so they asked for the memory notes and everything else needed to carry on to be pushed to GitHub. The backup is `claude-memory/` at the repo root: a copy of this memory folder, the restore guide, the Codex art-watcher setup and the claude.ai page links.

**Why:** they called it very important. Memory lives outside the repo, so without the backup a new computer starts with none of these notes.

**How to apply:** after adding or changing a memory, run `claude-memory/sync.sh` from a checkout, then commit and push `claude-memory/` along with the work. On a new computer, `claude-memory/restore.sh` puts the notes back. The repo is public, so never put keys, passwords or private details in memory or the backup. Related: [[breachline-project]], [[breachline-large-pushes]].
