#!/bin/sh
# Text Breachline for a Claude playtester: you are player 0, the lookahead bot is player 1. See RULES.md.
#
#   tools/playtest/play.sh decks                                     starter and theme deck ids
#   tools/playtest/play.sh GAME new DECK [SEED] [BOTDECK] [patch.js ...]
#   tools/playtest/play.sh GAME show | cards | autoturn | move N | do "text"
#
# DECK and BOTDECK are a starter (red), a theme deck (winter or theme-winter), or either with swaps added after a slash:
# red/goblin>flameblade:2 moves two copies of goblin to flameblade (card ids), and winter/+rimebolt starts with a
# Rimebolt in the opening hand. BOTDECK defaults to a starter picked by the seed.
# Patch files are plain JavaScript loaded after the engine, as in tools/check.sh; a game keeps the patches it began with.
# Games live in $PLAYTEST_GAMES (default $TMPDIR/breachline-playtest), never in the repo or a player's saved game.
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
HERE=$(cd "$(dirname "$0")" && pwd); DIR=$(cd "$HERE/../.." && pwd)
GAMES=${PLAYTEST_GAMES:-${TMPDIR:-/tmp}/breachline-playtest}; mkdir -p "$GAMES"
if [ "$1" = decks ]; then G=_decks; CMD=decks; else G=$1; CMD=$2; fi
case "$G" in ''|*[!A-Za-z0-9_-]*) echo "usage: play.sh decks | play.sh GAME new DECK [SEED] [BOTDECK] [patch.js ...] | play.sh GAME show|cards|autoturn|move N|do TEXT  (GAME is letters, digits, - and _)"; exit 1 ;; esac
F=$GAMES/$G.json; CFG=$GAMES/$G.cfg.js; ARG=$GAMES/$G.arg
if [ "$CMD" = new ]; then
  [ -n "$3" ] || { echo "play.sh $G new DECK [SEED] [BOTDECK] [patch.js ...]"; exit 1; }
  DECK0=$3; SEED=${4:-$(( $(date +%s) % 100000 ))}; DECK1=${5:-}; if [ $# -ge 5 ]; then shift 5; else shift $#; fi
  case "$DECK0$DECK1" in *[!A-Za-z0-9_/:\>+-]*) echo "deck specs use letters, digits, - _ / > : and + only"; exit 1 ;; esac
  case "$SEED" in *[!0-9]*) echo "SEED is a whole number"; exit 1 ;; esac
  : > "$GAMES/$G.patches"; for p in "$@"; do (cd "$(dirname "$p")" && echo "$(pwd)/$(basename "$p")") >> "$GAMES/$G.patches"; done
  rm -f "$F" "$GAMES/$G.log"
  echo "var CMD='new', ARG='', STATE_IN='', DECK0='$DECK0', DECK1='$DECK1', SEED=$SEED;" > "$CFG"
elif [ "$CMD" = decks ]; then echo "var CMD='decks', ARG='', STATE_IN='', DECK0='', DECK1='', SEED=0;" > "$CFG"
else
  case "$CMD" in show|cards|autoturn|move|do) ;; *) echo "unknown command $CMD: use new, show, cards, autoturn, move N or do TEXT"; exit 1 ;; esac
  [ -f "$F" ] || { echo "no game $G (start one with: play.sh $G new DECK)"; exit 1; }
  printf '%s' "$3" > "$ARG"
  echo "var CMD='$CMD', ARG=read('$ARG'), STATE_IN=read('$F'), DECK0='', DECK1='', SEED=0;" > "$CFG"
fi
PATCHES=; [ -f "$GAMES/$G.patches" ] && PATCHES=$(cat "$GAMES/$G.patches")
# shellcheck disable=SC2086
"$JSC" "$DIR/engine.js" "$DIR/rarity.js" "$DIR/bot.js" "$DIR/decks.js" $PATCHES "$CFG" "$HERE/play.js" > "$GAMES/$G.out" 2>&1
grep '^STATE:' "$GAMES/$G.out" | cut -c7- > "$F.new" && [ -s "$F.new" ] && mv "$F.new" "$F"; rm -f "$F.new"
grep -v '^STATE:' "$GAMES/$G.out" | tee -a "$GAMES/$G.log"
