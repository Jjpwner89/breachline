#!/bin/sh
# Put Claude's Breachline memory back on a new computer, and relink Codex's Breachline skills.
# Run it once after cloning the repo: sh claude-memory/restore.sh
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
MAIN=$(cd "$(git -C "$HERE" rev-parse --git-common-dir)/.." && pwd)
DEST="$HOME/.claude/projects/$(printf '%s' "$MAIN" | sed 's#[/.]#-#g')/memory"
mkdir -p "$DEST"
for f in "$HERE"/memory/*.md; do
  n=$(basename "$f")
  if [ -e "$DEST/$n" ] && ! cmp -s "$f" "$DEST/$n"; then echo "Kept the existing $n (it differs from the backup)"; else cp "$f" "$DEST/$n"; fi
done
echo "Memory is in $DEST"

# Codex finds the Breachline art skills through links in ~/.codex/skills.
if [ -d "$HOME/.codex" ]; then
  mkdir -p "$HOME/.codex/skills"
  for s in breachline-allure breachline-animal-art; do
    [ -e "$HOME/.codex/skills/$s" ] || ln -s "$MAIN/.claude/skills/$s" "$HOME/.codex/skills/$s"
  done
  echo "Codex skill links are in ~/.codex/skills"
fi
