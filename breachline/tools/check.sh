#!/bin/sh
# Quick balance check for a new or changed card or deck, using every core of this Mac.
#
#   tools/check.sh card <card id> [games] [patch.js ...]   default 10000 games: lift good to about ±1.5 to 2
#   tools/check.sh deck <deck id> [games] [patch.js ...]   default 1400 games: win rate good to about ±3
#
# 2000 games is enough to tell whether a card is broken or dead (±3, about 20 seconds). Patch files are plain
# JavaScript loaded after the engine, for trying a change without editing it, e.g. Engine.CARDS.vow.hpBonus = 2;
# Set the variables COPIES or REF to change what a card check swaps in (see quickcheck.js). FAST=1 uses the plain bot,
# without its lookahead: about 7 times quicker, good for a first pass, but it plays lasting effects less well.
set -e
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
DIR=$(cd "$(dirname "$0")/.." && pwd)
MODE=$1; ID=$2; shift 2
if [ "$MODE" != card ] && [ "$MODE" != deck ]; then echo "usage: tools/check.sh card|deck <id> [games] [patch.js ...]"; exit 1; fi
GAMES=$([ "$MODE" = card ] && echo 10000 || echo 1400)
case "$1" in ''|*[!0-9]*) ;; *) GAMES=$1; shift ;; esac
CORES=$(sysctl -n hw.ncpu 2>/dev/null || echo 4)
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
EACH=$(( (GAMES + CORES - 1) / CORES )); [ "$MODE" = card ] && EACH=$(( (EACH + 1) / 2 * 2 ))
i=1
while [ $i -le $CORES ]; do
  echo "var MODE='$MODE', ID='$ID', GAMES=$EACH, BASE=$((i * 1000003));${COPIES:+ var COPIES=$COPIES;}${REF:+ var REF='$REF';}${FAST:+ var FAST=1;}" > "$TMP/cfg$i.js"
  "$JSC" "$DIR/engine.js" "$DIR/rarity.js" "$DIR/bot.js" "$DIR/decks.js" "$@" "$TMP/cfg$i.js" "$DIR/tools/quickcheck.js" > "$TMP/out$i.json" &
  i=$((i + 1))
done
wait
"$JSC" "$DIR/engine.js" "$DIR/rarity.js" "$@" "$DIR/tools/report.js" -- "$TMP"/out*.json
