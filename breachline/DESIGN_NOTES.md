# Breachline design notes

The one home for Breachline's rules, design decisions and ways of working. "The creator" is the person making the game, and "Claude" is the assistant helping. Claude's own memory stays on the computer it was written on, so on a new computer ask Claude to read this file first.

Each topic has one home:
- **The world:** `SETTING.md`
- **Art:** the `art-direction` skill in `.claude/skills/`
- **Flavour text:** the `flavor-text` skill, with lines in `FLAVOUR.md`
- **Campaign:** `CAMPAIGN.md`
- **Cards:** `NEW_CARDS.md`, `CARD_AUDIT.md` and `CARD_PROPOSALS.md`

Keep only current decisions. When one changes, edit or delete the old text instead of adding a correction. Record feedback at the size it was given, so a comment on one card or one batch doesn't become a rule for everything.

## What the game is

An original fantasy card game on a grid, unique to the creator and not a rebuild of Card Wars, Magic or anything else. It started from remembering the Adventure Time card game and its mix of deck building and a board. Breachline is Claude's working title.

- **What the creator loves in Magic:** the fantastical settings and epic art, especially the generic but detailed fantasy of red, the optimistic feel of white and the urban settings of blue. Favourite images include blue's mages deep in study and red's goblins, orcs and dragons.
- **Slay the Spire:** a further inspiration, but the creator prefers having multiple characters to one.
- **Games worth a look:** Duelyst for grid tactics and Faeria for building a board during play, both suggested by Claude.
- **The goal:** an AI opponent that plays from the rules and general strategies, with a small chat line showing what it professes to think.

## Rules

From the creator:
- An unseen summoner and one life total per player, starting at 15.
- Decks target 40 cards, built before play. Ideally a game ends before a deck runs out. A deck that does run out reshuffles its discards.
- 5-card opening hands. Redraws use a London-style mulligan: a new full hand, then one card per redraw goes on the bottom.
- One draw per turn, and the hand is hidden.
- Units sit on a grid and move 1 tile unless a keyword says otherwise. There's no diagonal movement, though Swift can reach a diagonal tile in two steps. Units can't move onto or through an occupied tile.
- New units appear only in the back row and wait a turn.
- A unit moves, then attacks or uses an ability. The attacker picks the target, and targets strike back.
- Damage stays until healed.
- Whole turns, with limited instant responses that are weaker than Magic's.
- Enchantments attach to a unit on either side and go when their host is destroyed.
- Keywords plus short text, some random effects, and 10 to 20 minute matches.
- The summoners and land rows sit outside the grid, above and below it.

Claude's assumptions, not yet confirmed by the creator:
- A 5 by 4 grid, and the summoner can be hit only from the enemy back row.
- Only surviving targets strike back.
- The play phase comes before the command phase, and the first player skips their first draw.
- Two response windows with no stack, and a limit of 2 redraws.
- In the deck builder: decks of 24 to 40 cards, 3 copies of a non-land card and unlimited lands. The starter decks have 24 cards, below the 40-card target.
- The card-to-faction list in `engine.js`.

## Mechanics in development

Decided by the creator on 2026-11-09, to make more of the board. Holding ground and Sworn are built. The rest aren't yet.

- **Summoning units:** a card can summon other units straight onto the board. You pick empty tiles in your back row. If the back row is full, the rest go to your second row, starting from a side column and filling toward the middle unless you choose. Summoned units wait a turn like any new unit.
- **Errant summons:** a rarer, weaker kind of summoner. Its units always land on a random tile in your back row.
- **Adding cards to your hand:** a card can add cards to your hand. They look exactly like a normal draw and are played for their mana cost, so you play a card to get another card.
- **Ambush:** enters on an empty tile next to one of your units, beside or behind it but never in front. It can match your furthest-forward unit, never get ahead of it.
- **Flanking:** +1 attack when an ally stands on the far side of the target.
- **Holding ground:** an enemy that moves next to this unit must stop there, so it can't slip past.
- **Death triggers:** effects that happen when a unit dies. Sworn is the first.
- **Tile effects:** an effect that sits on a tile for a turn or two, like fire or frozen ground. These are temporary, unlike the permanent terrain set aside below. Rules:
  - An effect lasts a set number of its owner's turns, usually 1 to 3, and shows on the tile with a counter. Keep durations short, since the board has only 20 tiles.
  - One effect per tile, and a new one replaces the old one.
  - Effects such as fire and thorns hurt your own units too, unless a unit is exempt. Alderkin aren't affected by thorns.
  - A unit is affected when it moves onto the tile, and again if it starts its owner's turn there. A flier passing over isn't affected, but one that stops on the tile is.
  - Nothing on the board is hidden, so snares and traps are visible to both players.
- **Spells aimed at a tile:** the creator's idea. Some spells target a tile instead of a unit, with an arrow drawn from the card to the tile.
- **Conjured cards:** summoned units and added cards vanish instead of going to the discard pile, so they never enter the deck or feed discard-pile effects. Confirmed on 2026-11-09. Summons and added cards copy existing cheap cards wherever possible.
- **Loyal:** +1 attack and +1 health while you have another unit of the same sub-faction on the board, such as Sunmane Oath or Cinder Clans. A few cards get +2 / +2 instead. Loyal is only ever a stat bonus, never a keyword such as Ranged. This is the rule for the faction loyalty focus. Confirmed on 2026-11-09.

## Stats

- Small numbers: stats like 5 / 6, and summoner life 15. Each card's numbers came from a card-by-card audit in `CARD_AUDIT.md`.
- Equal attack and health is fine, because bigger attackers one-shot most units anyway. A unit takes 1.5 to 2.5 hits to kill on average. Strong units can one-shot, and weak spearmen chew each other up quickly.
- Abilities should play a large role, and they can be passive or active. Most cards should have one, but cards costing 1 or 2 can be plain.
- Some cards can be weaker, as the goblin is. Sunmane lancer should be a strong unit with good, usable abilities.
- Balance can break during a card build-out. Catalogue the gaps, and fill them with new cards.
- New cards don't have to go into decks right away. Building a card and putting it in a deck are separate steps.

## Mana and lands

- Soft coloured mana: lands have colours, each card wants a number of lands of its colour, and each missing land adds 1 to its cost, so a card is never locked out.
- Lands are 35% of a deck: 14 of 40, and 8 in the 24-card starters. Don't argue for more lands unless playtesting raises it.
- Lands sit off-grid below the board and can't be taken or destroyed.
- No per-turn card swap. It was far too powerful and made lands too easy.
- Abilities that generate mana are welcome. The creator likes the idea of decks that build up mana to cast big cards.
- **Buildings are cut, and the creator is 100% on this:** no town, town buildings, bank, stored mana, fortifications or walls. Total mana cost and land requirements already do that job. Don't spend screen space or compute on them, and don't propose them again.

## Alignments

Five colours sit above factions as alignments, with several factions inside each. The colour words are shorthand, and in-world names go on cards. Magic's five colours are the starting point, adjusted through discussion.

| Alignment | Peoples | Strengths | Weaknesses |
| --- | --- | --- | --- |
| Vigil (white) | Lion folk, knights, clerics, righteous soldiers | Healing, protecting allies, bonuses for standing together | Lower damage, slow to reach the summoner |
| Gnosis (blue) | City mages, scholars, constructs | Ranged attacks, moving units, drawing cards, illusions and decoys, disabling enemies | Small, fragile units |
| Dominion (black) | Necromancers, undead, bound demons, ruthless nobles | Life drain, destroying units outright, sacrificing units for power, returning units from the discard pile | Pays with its own life and units, little true healing |
| Fervor (red) | Orcs, goblins, giants, sellswords, dragons | High attack with low health, direct damage, speed, giants and fliers | Very little defence or healing |
| Genesis (green) | Forest peoples, druids, great beasts, living trees | Very large units, units that grow over time, extra lands, recovering health | Few instants, very few fliers, exposed to fliers and ranged attacks |

- Strengths and weaknesses are strong tendencies, never absolutes. About 1 card in 10 can go against its alignment's tendency, at about 1 extra mana, and stay usable and reasonably efficient.
- Decks are built around focuses, such as tokens, equipment or healing, not around colour pairs. Each colour leans toward several focuses, and each focus spans several colours, so white could be tokens, equipment, standing together, its factions or healing. Some mechanics stay within certain colours. Every focus needs at least one viable deck.
- Decks are a main colour plus a splash. Rivalries are story only. Lands and mana belong to alignments.
- Factions matter less to the creator than alignments. Faction identity should come through card mechanics and art.
- Humans appear in every alignment. Orcs are never Vigil.
- Neutral cards stay weaker but reliable.
- The Velunn are the game's rarest, biggest cards. Dominion can bargain with them, and they can be good too.
- Vampires can belong to Dominion or Fervor, and stay subtle and rare.
- The Tithebound could become a black and white hybrid later.
- Spindlejacks and Dawnsails don't fight. Alderkin can.

## Modes

- **Campaign** is the main way to play. Its picks, Claude's assumptions and balance are in `CAMPAIGN.md`. Cutscenes are wanted later, so don't build them until asked.
- **Exhibition** uses a deck builder with any card. Saved decks persist and sync to the viewer's account on the published page, mixing is free across factions, and the builder filters by type, colour and faction.
- **Multiplayer** would get cards from packs. It isn't built.
- **Unlocks:** the campaign unlocks cards gradually by winning, picking one of several in the style of Slay the Spire. Whether those unlocks carry over to other modes is undecided.
- New modes add a card pool in `Decks.pool` in `decks.js` rather than changing the builder.

## The Claude opponent

The creator wanted a real model opponent that faces the same limits they do.

- **How it plays:** the engine lists the legal moves and the model picks from them, so it can't break the rules. One call per AI turn returns a planned list of moves, and opening hands and responses take one call each. Any failure hands that decision to the scripted bot.
- **Where it runs:** on the published page through the `sample` capability, on the viewer's own usage, with no API key. It works only when the page runs inside Claude. Anywhere else, only the scripted bot is offered.
- **Difficulty, the creator's idea:** every level gets the same rules and information plus a different strategy guide in `guides.js`. Easy doesn't know the strategies, and Hard knows them all.
- **The chat line:** a short in-character statement written for the player, not its real reasoning, so it could even bluff.
- **Debug mode:** shows what the model was sent, its plan, the tier that answered and an explanation it was asked to write. That explanation can differ from what actually drove the move, and the page never returns hidden thinking.
- **Build rules:** build anything that plays for a side from `Engine.viewFor`, and keep typed text such as deck names out of prompts. The engine asks for a response only when one is possible.
- **Not proven yet:** real game speed, rate limits over a full game, and whether Easy actually plays weaker. Illusions, decoys and heavy card draw are hardest for the AI. If Easy is too strong, the next knobs are thinking effort or the model tier in `AI.CALLS`.

The creator's first full game against it was dynamic, and they said it was clearly trying to win.

## Look and feel

- **The war table:** a no-scroll battle screen with paintings filling the tiles and a large hand along the bottom.
- **Layout:** laptop first, with phones on a simpler stacked layout.
- **The old layout is gone:** keep new UI in the war table style.
- **Card frame:** title and cost at the top, as the creator asked. The first frame is in `card.html`.

### UI refresh

The creator found the old UI dull: a flat background, and card borders, textures and colours that weren't good enough. On 2026-11-09 they chose these from the proposal page linked below:
- **Home screen:** the gold strand at dusk over a battlefield. A still painting, with the strand glinting and smoke and light moving slowly in code.
- **Table:** a weathered field-oak camp table under one warm light.
- **Board:** a linen war map, with the grid inked over it in code.
- **Card frames:** blackened iron with gold trim.
- **Title bars:** crimson on every card, as in `card.html`. The game still colours them by alignment until the card frame phase.
- **Buttons:** carved wood with a brass edge, the main action gilded. Every button label is set in Cormorant SC (the `--button` font), chosen from eight fonts on 2026-11-09 after the creator disliked the first lettering.
- **Extras:** a card back, table props and painted attack and health plaques.
- **Order:** the table, then the home screen, card frames, buttons and panels, then the extras.

Asset briefs are in `art/UI_ART_BRIEFS.md`. All 16 paintings were made on 2026-11-09 and are in the game, waiting for the creator's review. The home screen drops the old fan of three cards so the scene shows. `card.html` still has the first frame design.

## Balance

Latest numbers, from 800 bot-only games on 2026-11-06: the first player wins 43%. By deck, Vigil wins 41%, Fervor 52%, Gnosis 53%, Dominion 39% and Genesis 65%. The scripted bot rarely uses sacrifices well, which hurts Dominion. Campaign numbers are in `CAMPAIGN.md`.

Approved plan for balance work, 2026-11-09:
- Play every starter deck against every other, from both seats, aiming for 45% to 55% each.
- Track a win rate for each card, from games where it was played.
- Write a cost guide that prices each keyword and ability in mana, like the stat curve.
- Improve the bot so tokens, positioning and sacrifices aren't judged by how badly it plays them.

Worth playtesting:
- **Cloistered scholar:** a card every turn from a 2-mana unit could be very strong.
- **Older red cards:** the creator said red looked a little unbalanced, and Elder dragon hasn't been touched.
- **Starter balance after Set 4:** in 320 bot games on 2026-11-08 the green starter won 87 and lost 41, up from 78 and 50, and black fell from 53 and 75 to 49 and 79. Hill giant's Stomp and the weaker Sellsword are the likely causes.
- **Strike-backs:** a target that fails to strike back, with no battle log line explaining why, is a real bug. An earlier report of this was never diagnosed.
- **Stalled games:** reshuffling means nobody runs out of cards, so a late-game rule that damages both players may be needed.
- **A bigger board:** test expanding beyond 5 by 4, since tokens and tile effects both need room on the board.
- **Worn-down defenders:** with persistent damage, defenders can be ground down with no way back. One fix is that a unit that neither moves nor attacks recovers a little health.

## Open questions for the creator

- **Touchstones:** books, films, games or paintings with the feeling you want.
- **Older red cards:** should they come down too?
- **Worn-down defenders:** is the resting-unit fix wanted?
- **Unlocks:** do campaign unlocks carry over?
- **Campaign map:** Claude drew a fixed route without asking whether you want branching paths.
- **Cards:** the open questions in `NEW_CARDS.md`.
- **Campaign:** draft lines and assumptions in `CAMPAIGN.md`.
- **Commit name:** commits show as `DP User`, from the Mac account.

## Tried and set aside

- A party of three heroes on four lanes, with cards locked to a living hero. The creator chose an unseen summoner.
- Permanent terrain on the grid, and relics. Temporary tile effects are now wanted, and equipment is a label for enchantments that are objects.
- Charge, damage from pushing a unit into another, and bonuses for standing in a particular row, all set aside on 2026-11-09.
- Lands or mana buildings on the grid, dropped for the safe land row.
- Counting faction lands or buildings to lock cards. Cards should always be playable.
- A free land from swapping, then discard and draw, then no swap at all.
- Diagonal movement for all units, and a diagonal-stepping "Skirmisher" keyword.

## Before any public release

- Claude hasn't checked the invented names against existing games or books. Firebolt, Hill giant and Elder dragon may overlap with Magic.
- Card Wars is still sold, with a 2026 Kickstarter. Copyright generally protects a game's expression, such as names, art and card text, and not its mechanics. Avoid "Card Wars" and "Floop".
- Claude isn't a lawyer and didn't check patents or trademarks, so get advice before selling the game.

## How the creator likes to work

- **Numbered batches:** flavour text improved once Claude offered numbered lines and the creator gave quick verdicts. Their cuts teach more than any written guideline.
- **Forms with a notes box:** these work well for big decisions, and the creator often overrides the options in the notes.
- **Sessions:** one active dev session and one active story session at a time, plus as many art threads as the creator likes. The art threads include Codex working directly in the main checkout.

## Working on the project

| What | Where |
| --- | --- |
| Playable game | https://claude.ai/artifact/Hr5bV3HfqseB5HwCu6xemH |
| Sunmane lancer card | https://claude.ai/artifact/Mev6cqP5wfCbnUGvic1Jsu |
| UI refresh proposal and the creator's picks | https://claude.ai/artifact/WmUf7MW4bpvcirLrs9RpvJ |
| Early art briefs doc, with wording since replaced by the `art-direction` skill | https://claude.ai/artifact/K4CyZKihSijWBNGoY2YW7y |
| GitHub repo (private) | https://github.com/Jjpwner89/breachline |

The claude.ai pages are private to the Claude account that made them. The game, card and briefs also exist as files here, so they can be published again from another account.

- **Backup:** nothing reaches GitHub until it's committed and pushed. Push before leaving a computer, and pull before starting on another.
- **Work computer:** the GitHub sign-in token is saved in this Mac's Keychain, so delete it on GitHub when you stop using this computer. Check your employment agreement and company rules on personal work made on company equipment.
- **Branches:** Claude sessions work in worktrees under `.claude/worktrees/`, each on its own branch. Merge finished work into `main` promptly so the others stay current.
- **Testing:** Node isn't installed on this Mac. Run engine simulations with `/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc`, and open `tests.html` in a browser for the checks.
- **Preview:** Python's web server can't serve directly from the Documents folder, so previews run from a temporary copy. The entries in `.claude/launch.json` point to old temporary folders.
- **Publishing:** publish `breachline/index.html` with `breachline` as the root, and include the scripts, `campaign.js` and the `art/web/` images. Leave out the full-size art. Other sessions publish to the same page, so read the live version first. Keep `sample`, `db` and `user` in its capabilities.
- **New art:** run `art/build-web.sh` after adding or replacing a painting, then republish. `art/CARD_ART_FINAL.json` is the definitive selection of card art.
- **Interface art:** the paintings live in `art/ui/`. Run `swift art/build-ui.swift` after replacing one; it crops, tiles and resizes them into `art/web/ui/`, which the game uses. Publish `art/web/ui/` with the rest of `art/web/`.

## Waiting to apply

Art direction changes from the creator's 2026-11-08 verdicts. These wait until Codex finishes its current art work, then go into the `art-direction` skill, and this section is deleted:
- **Detail versus resolution:** fine brushwork and a painted look are wanted, but a face rendered at much higher resolution than the brushwork around it looks AI-made. A Monet is detailed and precise without being high resolution. Replace the general "rich detail" wording and the "simplify into broader shapes" wording with this.
- **Repetition:** delete "avoid red capes", "rain only when briefed", the list of stone, ivy, rain and grey haze in the backgrounds section, and the "Repetition to watch" list. Keep one line: vary weather, clothing and backgrounds across a batch.
- **Attacks at the viewer:** replace each "don't aim attacks at the viewer" with: keep poses varied, and only rarely aim an attack at the viewer.
- **Orcs:** the coarse, visibly nonhuman look applies to all orcs, not just the pathguard.
- **Lion folk:** keep "generally keep to themselves" and the note that they appeared too often.
- **Correction trails:** keep only current rules. Remove lines about what an earlier rule was, and replace the per-item "don't generalize this" guards with one line: feedback applies to the image or batch it was about unless the creator says otherwise.
- **The alignment table:** black and green have art now, so their rows are no longer only proposals.
- **Interface art:** add a short section pointing to `art/UI_ART_BRIEFS.md`. Interface art uses the card painting style, kept quiet and low in contrast so cards stay the clearest thing on screen, and the card composition rules don't apply to it.
