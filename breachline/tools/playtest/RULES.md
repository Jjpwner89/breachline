# Breachline in brief (for playtesters)

## Your opening hand: redraw anything with fewer than 2 lands
You start with 7 cards and choose "keep this opening hand" or "redraw your opening hand". A redraw shuffles and deals 7 new cards, then you put one card on the bottom of your deck for each redraw so far (after one redraw you keep 6, after two you keep 5). Lands are what let you play anything, so:
- **Redraw a hand with 0 or 1 lands.** Redraw a second hand with 0 or 1 lands too. Keep the third hand whatever it is: you can't go lower.
- Keep a hand with 2 lands and some cheap cards (cost 1 to 3). Keep 3 or 4 lands happily.
- When you bottom a card after a redraw, bottom an expensive card you can't cast soon, never one of your only lands, and keep the cards on test if you can.

- Two summoners, 15 life each. Bring the enemy summoner to 0 to win. The board is 5 rows × 6 columns; row 4 is your back row, row 0 is the bot's.
- Each turn: draw a card (not on turn 1), play one land, then spend your mana on spells and units and command your units (each can move, then attack or use its ability), in any order. Unspent mana can pay for instants on the enemy's turn.
- Mana: each land gives 1 a turn. A card needs lands of its colour; each one short adds 1 to its cost (the hand shows the real cost).
- Units are summoned onto your back row (Ambush units can enter further forward). A unit can't move or attack on the turn it's summoned, unless it says otherwise.
- Attacking: a unit hits an enemy within its range (1 for melee). A melee target that survives strikes back. Only a unit standing on the enemy back row (row 0) can attack the enemy summoner, and the first summoner hit often decides the game.
- Damage on a unit stays until it heals; it doesn't wear off at the end of the turn.
- Adjacent means the 4 orthogonal neighbours, not diagonals. Swift units move 2 tiles instead of 1.
- You can play cards and command units in any order during your turn: summon, move, attack, then cast more if you have mana. (The game once ended the play step when a unit moved; it no longer does.)
- Costs shown before you have lands look high because of the colour-short rule above; they drop as lands arrive.
- The turn counter counts both players' turns, so turn 16 is your eighth turn.
- When the deck runs out, the discard pile is shuffled back in.
- Ground tiles on the board: `bur` is fire (1 damage), `tho` is thorns (1 damage; alderkin are immune), `cha` is a charge (2 damage, once), `hol` is consecrated ground (heals its owner's units at the start of their turn), `fro` and `bli` are frost and blight. Fire, thorns and charges hurt either side. A unit is hit when it moves onto the tile and again if it ends its own turn there, so step off first.
- Moving a Charge unit, even one tile, uses up its Charge for that turn: attack first if you want the Charge.
- An enemy melee unit can move 1 tile and then attack, so a tile 2 away from it isn't safe. Swift units threaten 3 away.
- Attack lines in the move list already include bonuses such as Frenzy, so "would deal" can differ from the printed attack.
- Board legend: [Y3/4] is your unit with 3 attack and 4 health; [B2/2] is the bot's. Every unit is listed under the board with its keywords.

## Commands
Your brief gives you the full path to `play.sh` and your GAME name; the examples below write it as `play.sh`.
- `sh play.sh GAME show` — the board, your hand and numbered legal moves.
- `sh play.sh GAME do "text"` — make the one legal move whose description contains that text (safest, since numbers shift). If several match, it lists them.
- `sh play.sh GAME move N` — make legal move N. The bot then plays until it's your decision again; you see what happened.
- `sh play.sh GAME cards` — the rules text of every card in the game (yours and the bot's).
- `sh play.sh GAME autoturn` — let the bot finish your current turn for you. Use it only for routine turns, so most of your decisions are your own.
Move numbers change after every move, so always read the newest list.

## What's on test
Your brief names the cards or mechanics on test. Each card's rules text in `cards` says exactly what it does; if a rule seems to work differently from its text, that is worth reporting.
