#!/bin/sh
# Copy Claude's Breachline memory from this computer into claude-memory/memory/, ready to commit.
# Run it from any checkout of the repo after memory changes.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
# Memory belongs to the main checkout's folder, even when working in a worktree.
MAIN=$(cd "$(git -C "$HERE" rev-parse --git-common-dir)/.." && pwd)
SRC="$HOME/.claude/projects/$(printf '%s' "$MAIN" | sed 's#[/.]#-#g')/memory"
[ -d "$SRC" ] || { echo "No memory folder at $SRC" >&2; exit 1; }
rm -rf "$HERE/memory" && mkdir -p "$HERE/memory"
cp "$SRC"/*.md "$HERE/memory/"
echo "Copied $(ls "$HERE/memory" | wc -l | tr -d ' ') files from $SRC"
