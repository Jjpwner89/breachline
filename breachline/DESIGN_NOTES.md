# Breachline design notes

The one home for Breachline's rules, design decisions and ways of working. "The creator" is the person making the game, and "Claude" is the assistant helping. Claude's own memory stays on the computer it was written on, so on a new computer ask Claude to read this file first.

Each topic has one home:
- **The world:** `SETTING.md`
- **Art:** the `art-direction` skill in `.claude/skills/`
- **Flavour text:** the `flavor-text` skill, with lines in `FLAVOUR.md`
- **Campaign:** `CAMPAIGN.md`
- **Progression:** `PROGRESSION.md`, for rarity, packs, the collection, currency and saving
- **Cards:** `NEW_CARDS.md`, `CARD_AUDIT.md` and `CARD_PROPOSALS.md`

Keep only current decisions. When one changes, edit or delete the old text instead of adding a correction. Record feedback at the size it was given, so a comment on one card or one batch doesn't become a rule for everything.

## Setting update (2026-11-10)

The creator clarified attunement, learned magic, personal energy and overexertion, magical industry, rare portals, healing, revival and spirits, and Ambrel's surviving university. Further clarifications cover routes of magical learning, the connection to a non-physical magical plane, enchanted possessions as a luxury, enforcement of harmful magic, ordinary imperial remnants and dragon communication. The current account and remaining uncertainties are in [SETTING.md](SETTING.md#magic); consult it for new cards and art. The Mountain's Lung burns stored mana from stones to provide energy; the stones are permanently spent afterward. Training increases magical capacity and efficiency; portals require unusual talent and difficult learned technique. Stored energy in the setting does not change the gameplay decision against buildings or a player mana bank.

## What the game is

An original fantasy card game on a grid, unique to the creator and not a rebuild of Card Wars, Magic or anything else. It started from remembering the Adventure Time card game and its mix of deck building and a board. Breachline is Claude's working title, and the creator doesn't like it much (2026-11-10), so a new one is welcome.

- **What the creator loves in Magic:** the fantastical settings and epic art, especially the generic but detailed fantasy of red, the optimistic feel of white and the urban settings of blue. Favourite images include blue's mages deep in study and red's goblins, orcs and dragons.
- **Slay the Spire:** a further inspiration, but the creator prefers having multiple characters to one.
- **Games worth a look:** Duelyst for grid tactics and Faeria for building a board during play, both suggested by Claude.
- **The goal:** an AI opponent that plays from the rules and general strategies, with a small chat line showing what it professes to think.

## Rules

From the creator:
- An unseen summoner and one life total per player, starting at 15.
- Decks are 40 cards, built before play (creator, 2026-11-11, replacing 30). Ideally a game ends before a deck runs out. A deck that does run out reshuffles its discards.
- 7-card opening hands (creator, 2026-11-10, replacing 5). Redraws use a London-style mulligan: a new full hand, then one card per redraw goes on the bottom.
- One draw per turn, and the hand is hidden.
- Units sit on a grid and move 1 tile unless a keyword says otherwise. There's no diagonal movement, though Swift can reach a diagonal tile in two steps. Units can't move onto or through an occupied tile.
- New units appear only in the back row and wait a turn.
- A unit moves, then attacks or uses an ability. The attacker picks the target, and targets strike back.
- Damage stays until healed.
- Whole turns, with limited instant responses that are weaker than Magic's.
- Instants can be played whenever, on your own turn as well as the opponent's (decided 2026-11-10). On your own turn they're cast like spells. Instants that answer an event, such as an attack or a move, still wait for it, so they only come up on the enemy turn.
- Enchantments attach to a unit on either side and go when their host is destroyed.
- Keywords plus short text, some random effects, and 10 to 20 minute matches.
- The summoners and land rows sit outside the grid, above and below it.

Claude's assumptions, not yet confirmed by the creator:
- A 6 by 5 grid: 6 columns, and 5 rows between the two players (creator, 2026-11-10, replacing 5 by 4).
- The summoner can be hit only from the enemy back row.
- Only surviving targets strike back.
- The play phase comes before the command phase, and the first player skips their first draw.
- Two response windows with no stack, and a limit of 2 redraws.
- In the deck builder: exactly 40 cards, at most 3 copies of any non-land card whatever its rarity, and unlimited lands (creator, 2026-11-11). Limits by rarity were tried and felt too contrived. A legendary that proves too strong gets a higher cost, not a lower limit; legendaries are hard to unlock, so few players can stack them, and a deck full of expensive cards limits itself through mana. The starter, theme and campaign enemy decks are all 40. A campaign deck stays at 40: rewards go to a reserve that can be swapped in between battles.
- The card-to-faction list in `engine.js`.

## Board mechanics

Decided by the creator on 2026-11-09, to make more of the board. All of these are built, with the Set 6 cards in `CARD_PROPOSALS.md`.

- **Summoning units:** a card can summon other units straight onto the board. You pick empty tiles in your back row. If the back row is full, the rest go to your second row, starting from a side column and filling toward the middle unless you choose. Summoned units wait a turn like any new unit.
- **Errant summons:** a rarer, weaker kind of summoner. Its units always land on a random tile in your back row. The Young summoner summons its Camp follower once, when it arrives (2026-11-11); a repeating summon made it the strongest card for its cost.
- **Adding cards to your hand:** a card can add cards to your hand. They look exactly like a normal draw and are played for their mana cost, so you play a card to get another card.
- **Ambush:** enters on an empty tile next to one of your units, beside or behind it but never in front. It can match your furthest-forward unit, never get ahead of it.
- **Flanking:** +1 attack when an ally stands on the far side of the target.
- **Holding ground:** an enemy that moves next to this unit must stop there, so it can't slip past.
- **Death triggers:** effects that happen when a unit dies. Sworn is the first.
- **Tile effects:** an effect that sits on a tile for a turn or two, like fire or frozen ground. These are temporary, unlike the permanent terrain set aside below. Rules:
  - An effect lasts a set number of its owner's turns, usually 1 to 3, and shows on the tile with a counter. Keep durations short, since the board has only 30 tiles.
  - One effect per tile, and a new one replaces the old one.
  - Effects such as fire and thorns hurt your own units too, unless a unit is exempt. Alderkin aren't affected by thorns.
  - A unit is affected when it moves onto the tile, and again if it starts its owner's turn there. A flier passing over isn't affected, but one that stops on the tile is.
  - Nothing on the board is hidden, so snares and traps are visible to both players.
  - Only the tile a unit ends its move on counts. Tiles it walks through don't.
  - Summoning a unit onto a tile doesn't trigger it. The unit is affected if it starts its owner's turn there.
  - A snare stops the first enemy to enter it, and it can't move on its next turn. Thorns and snares also block walking through. Fliers ignore both.
  - Spells aimed at a tile hit a Veiled unit standing there, since they target the tile, not the unit.
  - Art: each effect has a painting for an empty tile, a narrower border round a unit's card, and a counter emblem with the turns left. Briefs are in `art/TILE_ART_BRIEFS.md`; Codex painted them on 2026-11-10 and they're in the game, waiting for the creator's review.
- **Spells aimed at a tile:** the creator's idea. Some spells target a tile instead of a unit, with an arrow drawn from the card to the tile.
- **Conjured cards:** summoned units and added cards vanish instead of going to the discard pile, so they never enter the deck or feed discard-pile effects. Confirmed on 2026-11-09. Summons and added cards copy existing cheap cards wherever possible.
- **Equipment:** an enchantment that is an object. Equipment can also give its bearer a keyword, as the Redglass falchion gives Hunt. Armed units get +1 / +1 while they carry any equipment. Built on 2026-11-10.
- **Relics:** a card type that stays in play beside its summoner, off the grid, with an ongoing effect. Some can be used once on each of your turns. Return to loam, Shatter the chain and Unmake the pattern break them. Approved and built on 2026-11-10.
- **Cards 104 to 191:** their new rules, such as Lit, Devotion, Rootfed, spells that hit the summoner, borrowing and charming units, stasis, responses to a move, and row and square spells, are in `CARD_PROPOSALS.md`. Built on 2026-11-10.
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
- Lands are about a third of a deck: 13 of 40, or 15 in a ramping green deck. Don't argue for more lands unless playtesting raises it.
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
- **Ways to win (creator, 2026-11-10):** varied abilities and ways to win are crucial, so a deck can be built around one plan. Examples: getting one big creature across the board, with the price and time spent upgrading it as the risk; flooding the board with weak units and summons, which leaves you exposed to area attacks and strong creatures; and spells that hit the summoner directly, mainly in Fervor and Dominion (Dominion drains). Those spells can also hit units, at lower damage per mana than unit-only spells. Area spells never reach the summoner. Area shapes can be squares, crosses, rows and columns, and sweepers are wanted.
- **Keywords:** a keyword that is a core capability should be on at least three cards. Spread it to existing cards first, with the creator approving each, then fill gaps with new cards.
- **Keyword decisions (creator, 2026-11-10):** Regrow is gone as too strong. Longshot (3 tiles) works only if the unit hasn't moved that turn; after moving it fights in melee. Resonance hits the target and the enemy directly behind it. Gathered and Sworn became one keyword, Carrion: +1 attack whenever another unit dies on either side. Fireproof can be innate or come from a spell, an enchantment or equipment, but never from lightning, and no current card grants it. Fire spells come in two kinds: some damage only enemies and some damage every unit, balanced by cost and damage. Vigil gets one tile-clearing card for now. Rootfed counts only Genesis lands. Relics are approved as a new card type. Chain, Throng and Intercept were turned down. Armed belongs on units that look armoured or are putting armour on, in any colour. Veiled stays rare. The full table is in `CARD_PROPOSALS.md`.
- **Frenzy (creator, 2026-11-11):** +2 attack on the unit's first attack, then it's spent for good, like a berserker's charge. It counts whether that attack hits a unit or the summoner, and a miss still spends it. Strike-backs never get it and don't spend it. It replaced +2 attack while damaged, which most units never used.
- **Brass chorister (creator, 2026-11-11):** 3 / 5, down from 3 / 7, which got Push for free against the cost curve. The blue starter swapped a Cloistered scholar and a Street conjurer for a Harmonic wardwright and a Brass siege-walker, and Winter glyphs swapped its Frostbreak and a Winterdoor keeper for a Brass siege-walker and a second Conclave examiner. In 5,400 simulated games they win 49% and 46%, close to before.
- **Walking sapling (creator, 2026-11-11):** Grows only twice, so it stops at 3 / 6. At 4 / 8 it was a 5-mana body for 2 mana and carried The Elder Herd to 61%; now it wins 53%. The Thornwardens swapped a saboteur and a Sudden canopy for a second Bronze-harness alderkin and a second Grove tender, which keeps them at 47%. Other Grows cards still grow three times.
- **Sunmane lancer and Young summoner (creator, 2026-11-11):** the lancer is 4 / 5, down from 5 / 6, and the Young summoner's Camp follower comes once, when it's summoned, instead of every turn. In random decks the lancer's lift fell from 13.5 to 8.7 points and the Young summoner's from 11.1 to 3.1. Oath of the Sunmane went from 56% to 53%; The armed road, which leaned on the lancer, from 43% to 38%. The tutorial's last enemy now has 4 life, so the lancer still finishes it.
- **Guns** stay rare. A rifle makes sense only as a focus for magical energy (creator, 2026-11-10).
- **Not wanted for now:** effects for reaching the enemy back row (hitting the summoner is already the reward, and more would snowball), Velunn bargains (too hard to balance), and a special champion mechanic.
- The Velunn are the game's rarest, biggest cards. Dominion can bargain with them, and they can be good too.
- Vampires can belong to Dominion or Fervor, and stay subtle and rare.
- The Tithebound could become a black and white hybrid later.
- Spindlejacks and Dawnsails don't fight. Alderkin can.
- Constructs are ordinary cards, with no rules of their own for being constructs. Most are neutral or Gnosis, with some Dominion. Fervor's would be elemental, such as a body of rock and magma (creator, 2026-11-10).

## Modes

- **Campaign** is the main way to play. Its picks, Claude's assumptions and balance are in `CAMPAIGN.md`. Cutscenes are wanted later, so don't build them until asked.
- **Exhibition** uses a deck builder with any card. Saved decks persist and sync to the viewer's account on the published page, mixing is free across factions, and the builder filters by owned or every card, colour, type and faction, in that order (creator, 2026-11-12). The filter panel starts folded and each of its rows folds too; folded, they say what is picked. The test table can hand the top side to the scripted bot instead of having you play both. In the deck list each deck is a card (creator, 2026-11-12): its painting, name, alignments and card count on the front. Selecting it turns it over to show its plan and what can be done with it: Edit, Copy and Delete for your own decks, and View and Copy for starter and theme decks. View lists a fixed deck card by card. Only one deck is turned over at a time; selecting it again, another deck, an empty spot or Escape turns it back.
- **Multiplayer (2026-11-12):** online only, two people on their own pages (creator). One starts a match and sends its five-character code; the other enters it. Each brings a deck, and any deck needs the cards they own, the same as in Exhibition (creator, 2026-11-12: "multiplayer should not give access to all cards, should still rely on your actual unlocks"). Open decks are the exception (below). A win pays like beating Claude on Hard (`Progress.VS.human`, ×1.5), and each seat is paid once under its own key. `net.js` holds it. Both pages run the same engine from the host's seed, so only the setup and the moves travel, as each page's absolute state: its deck, the host's setup, the moves the other page hasn't applied yet and how many it has applied. A fingerprint after every move catches two games that drift apart, and a build id turns away a page on a different version. The match is saved per player after every move, so a reload or a republish picks it up again under Multiplayer, and resigning from the battle menu ends it. The guest sees the board turned round, so their side is at the bottom. The state travels by a transport with four calls (say, hear, status, leave). Inside Claude it's room presence, sent to the match's named room and the lobby both. In testing on 2026-11-12, though, Claude rooms never connected two pages, not even two of the owner's own, and an invited guest on a free account was refused. So online play is meant for the copy hosted outside Claude (creator): GitHub Pages serving this repository, with a root `index.html` that sends visitors to `breachline/`. There the `peer` transport connects the two browsers directly over WebRTC, through PeerJS 1.5.4 from cdnjs and its free public server. The first page in a match takes the hub id `breachline-bl-<code>-hub` and the other connects to it; if the hub page goes, whoever claims the id next takes over. A few strict networks block the direct connection. `?net=local`, `?net=peer` or `?net=claude` picks a transport; local is a broadcast channel between tabs of one browser, for testing. Outside Claude, progress and decks follow a player through an account (below). Both pages hold the whole battle, so a determined player could read the other's hand. That's fine between friends; a public version would need a server that deals the cards.
- **Accounts outside Claude (2026-11-12):** on the hosted copy a player can sign in with a name and a password, so progress and decks follow them to other devices (creator: "does not have to be very secure", but a browser should remember it). `accounts.js` signs in through Firebase Authentication (project `breachline-baa15`, config in `firebase-config.js`, SDK 13.1.0 from gstatic) with the name as the local part of a made-up `@breachline.game` address, so there's no email and no password reset. Firestore stands in for the Claude page's database behind the same few calls, at the same `data/users/<id>/` paths, so progress.js and decks.js sync the same way in both places; the database rules let each signed-in player read and write only their own folder. Firebase loads only once someone has signed in on that browser. Signing in reloads the page: an account that already has progress replaces the browser's copy, and a new one takes the browser's progress with it. Signing out clears the browser's copy, so two people can share a computer. Progress made inside Claude moves across with the save file (Collection, Save and unlock).
- **Claude opponents outside Claude (2026-11-12):** on the hosted copy Claude plays on the owner's Anthropic key (creator: "i will pay for it, it's fine"). `ownkey.js` gives ui.js a function shaped like the Claude page's `sample`, so ai.js and the opponent code are unchanged. It calls the Messages API through the official SDK (`@anthropic-ai/sdk` 1.3.0 from jsdelivr, with its browser opt-in), streaming each answer at low effort, through the proxy below. The player must be signed in, and picks Opus 5.5 (the default) or Sonnet 5.5 (Haiku was dropped: the creator didn't want it); the start screen shows an estimate of what this browser has spent, from each answer's token counts. Players could at first add their own API key, which the creator removed the same day ("remove the option to upload an API key in game"); a key left in a browser from then is cleared on load. Inside Claude the page's own `sample` is used as before.
- **Shared key through a proxy (2026-11-12):** so people can play Claude without a key of their own, a signed-in account uses the owner's key (creator: "i will pay for it, it's fine"). The key can't sit in the page, since the repository is public, so it lives in a Cloudflare Worker (`proxy/worker.js`, deployed by hand as `breachline-claude` on workers.dev) as the secret `ANTHROPIC_API_KEY`. The SDK points its base URL at the Worker and sends the player's Firebase ID token in `x-breachline-token`. The Worker checks the token's signature against Google's keys, then the optional `ALLOWED_NAMES` list, then that the request comes from the game's page and has the game's own shape (one prompt of at most 60,000 characters, Opus 5.5 or Sonnet 5.5, at most 16,000 tokens, low or medium effort), and only then forwards it, streaming the answer straight back. A refused token shows as `sign_in_needed` and a name off the list as `not_invited`; both hand the game to the scripted bot. Tested 2026-11-12: a mulligan and a turn on Opus cost about $0.02. The owner's Anthropic spend limit is the cap.
- **Open decks (2026-11-12):** a theme deck marked `open` in decks.js can be played by anyone in Exhibition and Multiplayer, whatever they own, but playing it doesn't add its cards to their collection, so they can't build with them (creator: "everyone should be able to play that deck, buuuut that does not mean they should have those cards"). Sun and cinder, built for the creator's brother, is the only one. `Decks.yours(d)` is the one check: open, or no cards missing. Its tile says it's open, and Multiplayer lists it under its own heading.
- **How to play (2026-11-11):** a tutorial in `tutorial.js` and `tutorial.css`. Part 1 tours the battle table; part 2 is a set battle on turn 3 where the player plays a land, summons a Temple cleric, attacks, moves the Sunmane lancer, ends the turn, and strikes the summoner to win. Each step allows only the move it teaches, and the enemy's one turn is scripted. It never pays gold or saves. New players see it first on the main menu and as a link on the starter pick; once finished or left, it moves down the menu. Whether it's been seen is kept in the browser, per viewer.
- **New-player help (2026-11-12):** the creator's brother couldn't tell what each deck did or what the table showed, so `help.js` and `help.css` explain both. Each starter and theme deck has a one-sentence plan, shown on its tile in Exhibition, on the back of its card in the deck builder, on the first-deck pick and in the campaign setup. Each alignment has a line on its strengths and weakness, shown beside the chosen deck and under the builder's filters when one colour is picked. Each faction has an in-world line, shown in the builder's close-up and under the filters (the lines are in `FLAVOUR.md`). A **Help** button on the battle table, the Exhibition screen and the deck builder turns help mode on and off: while it's on, pointing at anything shows a short tip, or on a phone a press and hold does, and a tap on a plain label shows its tip too. A tip never blocks a move. Both back rows get a small tag on the map's edge, and the Rules drawer has a short legend of the table. Keyword tips are read from the cards' own rules text, so new keywords need no extra work unless their text lacks a "Keyword: meaning" sentence. New starter or theme decks need a sentence in `Help.DECKS`; `tests.html` checks for it.
- **Progression:** a free starter, packs, a collection with counts, crafting and prestige replays, decided on 2026-11-10 and waiting for the new board. Cards picked in a campaign carry over only if you win it. All of it is in `PROGRESSION.md`.
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
- **Layout:** laptop first. Phones get their own one-screen battle in `phone.css` (2026-11-12, from the mockup canvas the creator picked): upright, the enemy bar, the board, your row (life, mana, phase, End turn) and then your hand at the bottom; sideways, the plates and hand on the left, the board in the middle, and the menu, phase and End turn on the right. The help text under the board is left out on phones. Upright, buttons such as Command units float over the top of the hand so the board never gives up height to them; sideways, the plates sit on the table without boxes. The hand is the same card as on desktop, held as a fan. A tap lifts a card the way hovering does on desktop, a little lower, and lights where it can go; another tap puts it back. Holding anything with a card behind it shows that card large on the left until you let go, which is how you read a card on a phone. A unit's tile on a phone is mostly its art: no name bar, with small attack and health in the bottom corners. Rules and sound move into the phone's menu.
- **The old layout is gone:** keep new UI in the war table style.
- **Card frame:** title and cost at the top, as the creator asked. The first frame is in `card.html`.
- **Same layout on every card (2026-11-10):** the creator chose this from three mockups. The name is always one line and shrinks to fit, the cost coin sits on the painting's top-left corner, and a band in the alignment colour runs under the art with the type and alignment. On units, Attack and Health sit at the band's ends. Every card has the same art, band and text box sizes.

### UI refresh

The creator found the old UI dull: a flat background, and card borders, textures and colours that weren't good enough. On 2026-11-09 they chose these from the proposal page linked below:
- **Home screen:** the gold strand at dusk over a battlefield. A still painting, with the strand glinting and smoke and light moving slowly in code.
- **Table:** a weathered field-oak camp table under one warm light.
- **Board:** a linen war map, with the grid inked over it in code.
- **Card frames:** blackened iron with gold trim.
- **Title bars:** crimson on every card, as in `card.html`. The game still colours them by alignment until the card frame phase.
- **Buttons:** carved wood with a brass edge, the main action gilded. Every button label is set in Cormorant SC, chosen from eight fonts on 2026-11-09 after the creator disliked the first lettering. Titles, headings, card names, stats and numbers then moved to it too (`--display`, sizes up 12% because it sets small), so the lettering matches throughout; body and rules text stay in Alegreya.
- **Extras:** a card back, table props and painted attack and health plaques.
- **Order:** the table, then the home screen, card frames, buttons and panels, then the extras.

Asset briefs are in `art/UI_ART_BRIEFS.md`. All 16 paintings were made on 2026-11-09 and are in the game, waiting for the creator's review. The home screen drops the old fan of three cards so the scene shows. `card.html` still has the first frame design.

**Polish pass, 2026-11-11.** The second pass (briefs in `art/UI_POLISH_BRIEFS.md`) is in the game. It lives in `polish.css`, `polish.js` and `sfx.js` on top of the earlier layers. The creator's picks:
- **Buttons:** parchment and wax.
- **Life:** a wax seal holding the number, with a rail of nails that are pulled as life is lost.
- **End turn:** the bronze press.
- **Status letters:** code-drawn enamel shields, not the painted grounds.
- **Dominion emblem:** the iron crown.
- **Screen changes:** a lamp dim.
- **Deck editor:** mockup I, with copy pips, art-strip rows and a growing curve.
- **Units:** the full painting on the board.

Earlier approvals:
- **Battle layout 1A:** portrait medallions, a bigger board and a fanned hand of up to seven that lifts on hover. The Chronicle is a drawer.
- **Feedback:** painted strike, death, heal and summon effects, with the blow type taken from the unit. The summoner hit goes straight up.
- **Rewards and map:** reward cards are dealt face down and turned over. The army marches along the campaign road.
- **Victory and defeat:** the crest drops and the payout is stamped line by line, with coins flying into the purse.

Sounds are in `sfx/`, credited in `sfx/CREDITS.md`. There is a mute toggle. On 2026-11-11 the creator picked spell and effect sounds from a sound board: Vigil spells get a healing impact (the tubular bell was dropped later the same day), Gnosis spells a low wine glass (its damaging spells later moved to lightning), with ice impact 3 for the cold spells and fire staff 20 for lightning; Fervor spells fire impact 3; Dominion spells a catching flame pitched down; Genesis spells a leaf rustle. Enchantments on your units get a pitched-down finger cymbal, enchantments on enemies (curses) ice impact 5, equipment healing 3, heals healing 9, damage hit 1, and a blocked blow anvil 2. The same day: footstep 6 when a unit moves, a card touch for hovering a card and card slide 6 for drawing one, a wood knock when a greyed-out card is clicked, a timpani for end turn, a full gong for victory, sad ending 1 for losing a campaign battle and sad ending 3, quiet, for losing any other, and the Old Tower Inn and King's Feast tunes taking turns as quiet background music. The mute button stops it all.

**Thrown spells, 2026-11-11.** Every spell or instant aimed at a tile, a unit or a summoner is thrown there before it resolves: it charges at the card for 0.6 seconds, launches, flies in an arc and lands. A tile spell with its own tile effect keeps that look; any other takes its element's look (fire, frost, storm for the lightning spells, holy, blight, thorns, and a new sea-blue arcane look with a turning sigil for Gnosis). A spell on one of the caster's own units settles gently, without the stop and shake of a hit. Enchantments and equipment still settle on their unit without a throw. Each stage has sound the creator picked on the spell sound board, layered and overlapping: a shared air layer (wind drawn in, a heavy whoosh, a torch whoosh) under the element's own (fire crackle, freeze, electric build-up, mana drain, tree creak; catching fire, ice shard, spark crack, hand chime, drain release, leaf burst; fireball roar, freezing hiss, spark crack, shimmering chime, crystal hum, power drain, rustling leaves). No charge fitted Vigil or Gnosis and no launch Gnosis, so those play the air alone. Some of these are CC-BY and credited in `sfx/CREDITS.md`. A thrown spell's own sound plays the moment it hits, not when the board catches up.

**Impacts, combat and rewards, 2026-11-11.** From the impact sound board the creator layered a weightier landing under three elements: fireball impact 1 under fire, a spark crack a quarter second after lightning as a crackle to finish, and earth impact 1 under Genesis. Ranged casters (street conjurer, lantern arcanist, Ilvane, harmonic wardwright, rimecaller) and the focus-rifle marksman shoot with a heavy shot; bow units keep a bow shot. Sword and claw attacks are a dagger swing, spears a quick thrust, a summoner hit a heavy impact, heals a healing chime, a ward or Guard block a magic shield, equipment a blade ring, a unit arriving spell 2, gold paid out gold 1, a unit moving dirt step 2, and a won and lost battle a win and a lose jingle (sad ending 1 still ends a campaign run). Damage on a unit, curses, enchantments and the heavy crush stay as they were; no new crush fitted. The achievement jingle (Little Robot Sound Factory, Jingle_Achievement_00) is reserved for level-ups: it is in `sfx/` as `level-up`, ready for `Sfx.play('level-up')` when those are added.

## Balance

Latest numbers, 2026-11-11, after the move to 40-card decks with 3 copies of any card and the card changes reviewed that day (card by card in `BALANCE_AUDIT.md` and `CARD_PROPOSALS.md`). A round robin of all 15 decks, the five starters and ten theme decks, played about 1,000 games per deck (each within about 1.6 points), with the scripted bot on both sides:

| Deck | Kind | Win rate |
| --- | --- | --- |
| Hearth and vow | Devotion theme | 58% |
| Winter glyphs | Freezing theme | 57% |
| Rootfed herd | Rootfed theme | 56% |
| The armed road | Equipment theme | 54% |
| Oath of the Sunmane | Vigil starter | 53% |
| The Elder Herd | Genesis starter | 52% |
| The court's favour | Charm theme | 50% |
| Cinder and slag | Lit theme | 50% |
| Long sights | Longshot theme | 49% |
| The Warhorde | Fervor starter | 48% |
| The Ashen Court | Dominion starter | 46% |
| The Thornwardens | Thorns theme | 45% |
| The Lantern Conclave | Gnosis starter | 45% |
| The long throw | Burn theme | 44% |
| The barrow feast | Carrion theme | 44% |

- **The field is much tighter:** 14 points from best to worst, down from 34 when the decks first went to 40 cards.
- **The starters are one colour each**, chosen for steady draws. Each shows as many of its colour's mechanics as stay on theme and keeps plenty of plain commons. Green, black and blue were retuned on paired tests against the other 14 decks.
- **Theme decks were moved toward the middle without leaving their plan.** Hearth and vow and The armed road swapped the Pride matriarch for commons; The barrow feast added a Barrow colossus, a retainer and a barrow priest; and The long throw went mono-red with Cinderfall, more raiders and berserkers, keeping 9 burn spells. Decks don't have to be the strongest possible, and every one keeps some simple commons.
- **Greedy decks** (15 lands and every rare and legendary at 3 copies) win about 61%. The creator judged that acceptable, so expensive decks are left to limit themselves through mana.
- **Devotion** counts any heal, even at full health (creator, 2026-11-10). **Frost and White morning** deal damage as they freeze (creator, 2026-11-10).
- Campaign numbers are in `CAMPAIGN.md`.

- **Spell-heavy first drafts lose badly:** 6% to 19% for winter, burn, fire and Devotion with 6 to 8 units. Every theme deck now plays 11 to 15 units.

Draft decks built around focuses, 2026-11-10, each 24 cards and tested against the starters and each other: the Sunmane levy (going wide), the Thornwardens, an Artificers' workshop, a Mountain's Lung ramp deck and a Cinder Clans armoury all win 54% to 66%. Burning ground, freezing control, Still Flame healing and Gravebound sacrifice win 29% to 39%, because they have the setup cards but almost no payoffs. Cards 104 to 117 in `CARD_PROPOSALS.md` are aimed at that. The drafts aren't in the game yet.

Approved plan for balance work, 2026-11-09:
- Play every starter deck against every other, from both seats, aiming for 45% to 55% each.
- Track a win rate for each card, from games where it was played.
- Write a cost guide that prices each keyword and ability in mana, like the stat curve.
- Improve the bot so tokens, positioning and sacrifices aren't judged by how badly it plays them.

Worth playtesting:
- **Cloistered scholar:** a card every turn from a 2-mana unit could be very strong.
- **Older red cards:** the creator said red looked a little unbalanced, and Elder dragon hasn't been touched.
- **Strike-backs:** a target that fails to strike back, with no battle log line explaining why, is a real bug. An earlier report of this was never diagnosed.
- **Stalled games:** reshuffling means nobody runs out of cards, so a late-game rule that damages both players may be needed.
- **The board size (creator, 2026-11-10):** Standard is now 6 by 5 with a 7-card hand and 15 life, after the creator played it and found 7 by 5 a little too big; 6 by 5 felt connected. The creator then settled on it and the Rules picker was removed. Long war (7 by 5, 7-card hand, 20 life) was dropped because it could leave a player losing for a long time. The old 5 by 4 rules are gone too, so a game saved mid-battle before the change won't load properly; the creator accepted that. The fifth row favoured the decks that build up, so Devotion was capped, three big green units cost more and the three strongest decks lost a few of their best cards; see the card proposals for the numbers. In bot games the player who hits the enemy summoner first still wins about 71%, and The long throw is still the weakest deck at 39%.
- **Worn-down defenders:** with persistent damage, defenders can be ground down with no way back. One fix is that a unit that neither moves nor attacks recovers a little health.

## Open questions for the creator

- **Touchstones:** books, films, games or paintings with the feeling you want.
- **Older red cards:** should they come down too?
- **Worn-down defenders:** is the resting-unit fix wanted?
- **Campaign map:** Claude drew a fixed route without asking whether you want branching paths.
- **Cards:** the open questions in `NEW_CARDS.md`.
- **Campaign:** draft lines and assumptions in `CAMPAIGN.md`.
- **Commit name:** commits show as `DP User`, from the Mac account.

## Parked for later

Card features, keywords and gameplay ideas waiting for a future expansion are in `FUTURE_FEATURES.md`. Check it when designing new cards, and add none of them without the creator's approval.

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
- **Publishing:** publish `breachline/index.html` with `breachline` as the root, and include the scripts and stylesheets (`tutorial.js`, `tutorial.css`, `help.js` and `help.css` among them), `campaign.js` and the `art/web/` images. Leave out the full-size art. Other sessions publish to the same page, so read the live version first. Keep `sample`, `db`, `user` and `downloads` in its capabilities, and always publish to the same page: players' collections live in that page's database.
- **New art:** run `art/build-web.sh` after adding or replacing a painting, then republish. `art/CARD_ART_FINAL.json` is the definitive selection of card art.
- **Interface art:** the paintings live in `art/ui/`. Run `swift art/build-ui.swift` after replacing one; it crops, tiles and resizes them into `art/web/ui/`, which the game uses. Publish `art/web/ui/` with the rest of `art/web/`.

## Art direction handoff

The creator's 2026-11-08 and 2026-11-09 direction is incorporated in the [art-direction skill](../.claude/skills/art-direction/SKILL.md), the card and interface brief entry points, prompt defaults and the [reference guide](art/reference-library-2026-11-06/README.txt). Consult the current defaults before preparing art; original generation prompts remain provenance.

All seventeen round-07 revisions are accepted, bringing that reference folder to 26 paintings across 25 subjects, including both cedar-roof variants. The accepted revisions demonstrate varied ordinary faces, predominantly male aggressive frontline casting, naturally diffuse skin and cloth, selective reflections, measured brushwork and quieter secondary detail, mixed cultural design influences and more abstract functional constructs. Keep vivid colour, varied magic and continued invention beyond the references.

This approval concerns round 07 only. Other batches retain their own review statuses. Individual visual approvals do not automatically establish lore, gameplay or a universal faction style.
