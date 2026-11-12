# Card proposals

Cards 1 to 30 were drafted on 2026-11-06 to fill the gaps in `CARD_AUDIT.md`. The creator approved all 30 as written on 2026-11-08, and they're in the game, tested only by bot simulations so far.

Cards 31 to 42, from the reference library, were made final on 2026-11-09 and are in the game, tested only by bot simulations so far. Cards 43 to 91 were built on 2026-11-09, and cards 92 to 103 on 2026-11-10. Both batches were tested by bot simulations and a check in the browser. Numbers that were cut in discussion are skipped: 45, 50, 57, 72, 74 and 76 to 81. The mechanics they use are described in `DESIGN_NOTES.md`. Numbers are small-scale and will move in playtesting.

Cards 104 to 133 were proposed on 2026-11-10, after a balance review, and approved with changes the same day. Cards 134 to 188, which fill out the roster, were proposed later that day. All of 104 to 191 were built on 2026-11-10, after Codex finished their art; see "Cards 104 to 191 are built" below. Keyword changes to existing cards were built the same day, in "Keywords decided on 2026-11-10". The white and black starters were refreshed the same day; the other starters and the campaign enemy decks are unchanged, so most of cards 1 to 103 show up only in the deck builder and in campaign rewards. Their art briefs are in `art/ART_BRIEFS_SET4.md`, `art/ART_BRIEFS_SET5.md` and `art/ART_BRIEFS_SET6.md`. Flavour lines were written and reviewed on 2026-11-10; the kept ones are on the cards, listed in `FLAVOUR.md`.

## Cards 104 to 191 are built

Built on 2026-11-10, with the final art from `art/CARD_ART_FINAL.json` and the Set 7 to 11 files, and checked by 165 rules checks, 600 bot games of random decks weighted to the new cards (every card played, no errors), the browser tests and a look at each card in the browser. None of them are in a starter deck, so the starters play exactly as before. Their flavour lines are in `FLAVOUR.md`.

#113 Stormglass glaive followed later the same day, once you called its round-10 painting final; the painting is now in `art/CARD_ART_FINAL.json`. #176 Bellframe construct was removed entirely. The Grove wanderer painting has no card yet.

Where the build reads a card differently from its proposal. You approved the first four on 2026-11-10:
- **#115** is named Ribbonvane, with the white-flier painting.
- **Reedbank forager:** its land comes on your next turn, since abilities are used after the play phase.
- **Sanctuary threshold:** an enchantment on one of your units for 3 of your turns, rather than a tile, which matches its painting and needs no new tile art.
- **Sepulchral scale:** draws automatically, and skips when you have 2 life or less.
- **Scatter the line:** aimed at a row, like the other aimed spells, by your direction.
- **Folded observatory:** you can always see your top 2 cards, and once a turn you may swap them.
- **Shatter the chain and Return to loam:** remove the most recently added enchantment or equipment from a unit, or break a relic.
- **Unmake the pattern:** can break any relic, yours included.
- **Hurled brand, Siphon vigor, Collect the tithe and The sky falls in:** hit an enemy unit or the enemy summoner.
- **Oath bell and Warband drum:** once on each of your turns.
- **Gilt-hall temptress:** a charmed unit can act from your next turn, and goes back if she dies. She charms one unit at a time.
- **Devotion, Carrion, Longshot and the Untaught firecaller:** shortened so they fit a card in the hand.

Balance changes after the first balance run, 2026-11-10 (numbers in `DESIGN_NOTES.md` under Balance):
- **Cinder firebrand** 3 / 3 to 3 / 4, and **Untaught firecaller** 2 / 2 to 2 / 3. Fire did too little for its cost: in an all-fire deck, burning tiles, explosions and called fire together dealt the enemy about 5 damage a game. With both changes the fire theme deck went from 41% to 47% against the starters.
- **The sky falls in** costs 5, down from 6. It won 33% of the games it was played in, the lowest of red's reach spells.

Changes you asked for after that run, 2026-11-10:
- **Devotion:** any heal counts, even on a unit at full health, so a healer can grow a Devotion unit every turn. It used to trigger about once a game and now about 5 times; the Devotion theme deck went from 35% to 50% against the starters. Card text: "when it or an ally next to it is healed".
- **Frost and White morning** now deal 1 damage to each enemy they freeze, then hold them as before. The freezing theme deck went from 38% to 42%.

## Gnosis sound restriction (creator direction, 2026-11-10)

Sound should account for **at most one in eight Gnosis cards, preferably fewer**. Prefer other, more varied magical mechanisms. **Do not create additional sound-focused Gnosis cards until the total card roster reaches 250 cards across all alignments.** At 250, this temporary blocker expires: remove it from active planning restrictions, while retaining the one-in-eight ceiling and preference for fewer. Count distinct cards in the roster, not image files, variants or the highest proposal number. This concerns sound as a theme or magical mechanism; a rules keyword or name alone does not make a card sound-focused.

Harmonic burst (#124) keeps its finalized suspended-bell painting. It is explicitly not a favorite or a model for further Gnosis cards. The temporary block does not revoke already accepted cards. See the [art direction](../.claude/skills/art-direction/SKILL.md#gnosis-sound-limit-and-harmonic-burst-final-creator-direction-2026-11-10).

## Rules decided while building

- **Steadfast:** a move or Dawnsail passage counts as moving. Being swapped, pushed or shoved doesn't.
- **Warband and Hunted:** neither stacks with itself.
- **Stomp:** Guard and Winter shelter reduce it, as they do any attack damage. Strike-backs don't stomp.
- **Conclave phantasm:** it strikes back before it vanishes. Illusory decoy, with 0 attack, still just vanishes.
- **Goblin firepot:** it must hit an enemy unit if there is one.
- **Called debt:** it can't be cast at 2 life or less.
- **Conclave examiner:** a held unit can't move or attack, but can still use an ability or strike back.
- **Ilvane:** draws one card for each unit it destroys, including with a strike-back.
- **Threshold adept:** neither unit can be bound by a glyph or held.
- **Zap:** it isn't an attack, so Guard doesn't reduce it. A held unit can't zap.
- **Resonance:** works exactly like Stomp.
- **Brightlance:** pushes the target 1 tile back toward its owner's side, if that tile is free.
- **Woven ward:** soaks damage of every kind, after Guard and Winter shelter.
- **Enchanter's quench:** ignores Guard and Winter shelter, including on Stomp and Overrun damage, but not Shield of dawn. Strike-backs aren't attacks, so they don't ignore anything.
- **Freeze:** works like Binding glyph for one turn, so the frozen unit also can't be swapped or sent by Dawnsail passage. It can still attack.
- **Sworn:** counts any of your units destroyed while the retainer is on the board, including by Harvest or a warrant.
- **Veiled:** blocks attacks, spells, enchantments, instants and abilities aimed at it, and being the unit behind a lance. Splash damage such as Stomp, Resonance, Overrun and Cinderfall still reaches it. It veils again if raised from the discard pile.
- **Holding ground:** fliers stop too. A unit that starts next to the holder can move away.
- **Armed:** +1 / +1 once, however many pieces of equipment the unit carries.
- **Corewright:** two corewrights still take off only 1.
- **Copperlane torch-runner:** its trail burns until your next turn, so it lasts through the enemy's turn. Only the tile it starts from burns.
- **Winterdoor keeper:** it can't target a Veiled unit. The frozen unit can still attack.
- **Rain-reader:** it can target any tile within 2 that has an effect, or one of your damaged units.
- **Cinderwake:** it hits only enemies, but every tile it crosses burns, yours included.

## How these were built

- Built on the 56 cards in `main`, including the ten concept art cards.
- Most cards reuse a keyword that was on only one card, so those keywords can start to carry a strategy. "New code" below shows what each card would take to build.
- Cards costing 1 or 2 can be plain. Almost everything at 3 or more does something, and Sellsword is the exception.
- Spindlejacks and Dawnsails stay out of combat, as you chose. Alderkin can fight, and Grove tender is one. Opaline Kin, Stonehorns and Tidevaults aren't used.
- No buildings, walls or stored mana.
- Stats follow the existing curve, about 2.5 stat points per mana, with abilities paid for by lower stats. Genesis runs above that and Gnosis below it, matching their tendencies.

## Vigil (white)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Gap it fills | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Oath shieldbearer | Sunmane Oath | Unit | 2 | 1 | 1 / 4 | Guard | Second 2-cost unit, Guard on a second card | None |
| 2 | Pride huntress | Sunmane Oath | Unit | 2 | 1 | 2 / 3 | Stand together | Second 2-cost unit, a real Stand together deck | None |
| 3 | Pride matriarch | Sunmane Oath | Unit | 5 | 2 | 4 / 8 | Guard. Stand together | The missing 5-cost | None |

## Gnosis (blue)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Gap it fills | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | Sifting the shallows | Lantern Conclave | Spell | 1 | 1 |  | Draw a card, then put a card from your hand on the bottom of your deck | Set-aside design, waiting on a painting | Small |
| 5 | Conclave phantasm | Lantern Conclave | Unit | 2 | 1 | 2 / 1 | Decoy | Decoy on a second card, and this one hits back | None |
| 6 | Threshold adept | Lantern Conclave | Unit | 3 | 1 | 2 / 3 | Ability: swap places with one of your units within 2 tiles | Moving units are a listed strength | Small |
| 7 | Conclave examiner | Lantern Conclave | Unit | 4 | 2 | 2 / 4 | Ability: an enemy unit within 2 tiles can't move or attack on its next turn | Disabling is a listed strength, with only one card now | New |
| 8 | Brass siege-walker | Artificers | Unit | 5 | 2 | 4 / 5 | Longshot: attacks up to 3 tiles away | Finisher, and a third Artificers unit | Small |
| 9 | Ilvane, Who Asks Twice | Velunn | Unit | 6 | 3 | 5 / 8 | Ranged. Draw a card when this destroys a unit | Top-end finisher. Name needs your approval | Small |

## Dominion (black)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Gap it fills | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | Barrow rats | Gravebound | Unit | 1 | 1 | 1 / 2 | Hunt | Second 1-cost unit, Hunt on a second card | None |
| 11 | Indebted squire | Ashen Court | Unit | 1 | 1 | 3 / 3 | When summoned, you lose 1 life | A strong cheap unit, paying with life. Cost lowered from 2 at your request | None |
| 12 | Hunted | Dominion | Enchantment | 2 | 1 |  | Enchant an enemy unit: units attacking it get +1 attack | Set-aside card, redesigned at your request. Applies to attacks, not strike-backs | Small |
| 13 | Called debt | Ashen Court | Instant | 2 | 1 |  | Lose 2 life and destroy a damaged enemy unit | First Dominion instant, destroying and paying | Small |
| 14 | Ashen Court envoy | Ashen Court | Unit | 4 | 2 | 4 / 5 | Drain | The missing 4-cost. A quiet place for a subtle vampire | None |
| 15 | Barrow priest | Gravebound | Unit | 4 | 2 | 2 / 4 | Ability: return a unit costing 2 or less from your discard pile to your back row | Returning units on a body, not only a spell | Small |
| 16 | Barrow colossus | Gravebound | Unit | 5 | 2 | 4 / 7 | Gathered: +1 attack for each unit in your discard pile, up to 4 | The missing 5-cost unit, and a payoff for losses | Small |

## Fervor (red)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Gap it fills | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 17 | Goblin firepot | Warhorde | Unit | 2 | 1 | 2 / 1 | When summoned: 1 damage to an enemy unit | Direct damage on a body | Small |
| 18 | Cinderfall | Cinder Clans | Spell | 4 | 2 |  | 3 damage to an enemy unit, and 1 to each enemy next to it | Second direct damage card. Not a board wipe | Small |
| 19 | Giant chieftain | Warhorde | Unit | 6 | 3 | 7 / 8 | Frenzy | The missing 6-cost, Frenzy on a second card | None |

## Genesis (green)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Gap it fills | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | Thicket boar | Elder Herd | Unit | 1 | 1 | 1 / 3 | None | The missing 1-cost unit. Plain is fine here | None |
| 21 | Grove tender | Thornwardens | Unit | 3 | 1 | 1 / 4 | Ability: an adjacent ally permanently gets +1 health and +1 attack | Growth for other units, not only itself | Small |
| 22 | Mossback bear | Elder Herd | Unit | 4 | 2 | 4 / 6 | Regrow | The missing 4-cost, Regrow on a second card | None |
| 23 | Herd mother | Elder Herd | Unit | 6 | 3 | 7 / 11 | Overrun | Very large units are a listed strength, Overrun on a second card | None |
| 24 | Orrowen, Who Was Here First | Velunn | Unit | 7 | 3 | 6 / 12 | Grows. Overrun | Top of the alignment. Name needs your approval | None |

## Neutral

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Gap it fills | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | Camp follower |  | Unit | 1 | 0 | 1 / 2 | None | Neutral 1-cost. Weak but reliable | None |
| 26 | Scarred summoner |  | Unit | 4 | 0 | 3 / 5 | When summoned: draw a card | Neutral top end, and the summoner theme | Small |

## Changes to existing cards, built

Three of the four plain units costing 3 or more get an ability and keep their stats. Sellsword stays plain, moves to neutral and drops to 3 / 4.

| # | Card | Stats | New passive | Why | New code |
| --- | --- | --- | --- | --- | --- |
| 27 | Oath knight | 3 / 5 | Steadfast: +1 attack if she hasn't moved this turn | Fits "No one ordered her to stay" | Small |
| 28 | Sellsword | 3 / 4, down from 4 / 4 | None. Moves from Fervor to neutral, so it wants no lands and leaves the Warhorde | At your request. Fits "Every side owes him" | None |
| 29 | Orc warchief | 5 / 5 | Warband: adjacent allies get +1 attack | Stops Sunmane lancer outclassing it | Small |
| 30 | Hill giant | 5 / 8 | Stomp: its attacks also deal 1 to enemies next to the target | Stops Elder Herd bull outclassing it | Small |

## Cards from the reference library

Added on 2026-11-08 and made final on 2026-11-09. You voted on every reference sheet and chose these to become cards, then set their numbers and rules in discussion. Each one depicts the character or item from its accepted sheet, and all twelve paintings are final.

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Source sheet | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Conclave field scholar | Lantern Conclave | Unit | 3 | 1 | 2 / 3 | Zap: instead of attacking, deal 1 damage to an enemy up to 2 tiles away | Character kit 03 | Small |
| 32 | Harmonic wardwright | Lantern Conclave | Unit | 4 | 2 | 3 / 4 | Ranged. Resonance: its attacks also deal 1 to each enemy next to the target | Magic and craft 01 | Small |
| 33 | Brightlance | Lantern Conclave | Spell | 3 | 1 |  | Deal 2 damage to an enemy unit, then push it 1 tile | Magic and craft 01, the same wardwright | Small |
| 34 | Woven ward | Artificers | Enchantment | 3 | 1 |  | Enchant one of your units: it ignores the next 4 damage, then the ward is used up | Magic and craft 02 | Small |
| 35 | Enchanter's quench | Artificers | Enchantment | 2 | 1 |  | Enchant one of your units: +1 attack, and its attacks ignore Guard and other damage reduction | Round 04 study 05 | Small |
| 36 | Rime drake | None, a wild creature | Unit | 4 | 2 | 3 / 4 | Flying. Freeze: the unit it attacks can't move on its next turn | Round 04 study 02 | Small |
| 37 | Thornwarden goblin scout | Thornwardens | Unit | 1 | 1 | 1 / 1 | Ranged | Character kit 04 | None |
| 38 | Bronze-harness alderkin | None, its own purposes | Unit | 4 | 2 | 4 / 7 | None | Character kit 07 | None |
| 39 | Porcelain-visored retainer | Ashen Court | Unit | 3 | 1 | 2 / 5 | Guard. Sworn: permanently +1 attack each time another of your units is destroyed, up to +3 | Character kit 06 | Small |
| 40 | Veil adept | Ashen Court | Unit | 3 | 1 | 4 / 2 | Veiled: can't be attacked or targeted by enemy cards until it attacks | Round 04 study 01 | Small |
| 41 | Banked flame blade | Cinder Clans | Equipment | 2 | 1 |  | Equip one of your units: +2 attack | Round 04 study 03 | None |
| 42 | Stoneward colossus |  | Unit | 6 | 0 | 4 / 8 | Guard. Holding ground | Round 04 study 06 | Small |

Choices made in discussion:

- **Conclave field scholar:** drawing a card was too strong. Zap deals less than her normal attack of 2.
- **Harmonic wardwright:** Conclave examiner already has its own painting, so the wardwright gets his own cards. He's an attacker. Resonance works the same way as Hill giant's proposed Stomp. Brightlance shows him casting, with a moving blue-violet lance of light.
- **Woven ward:** raised from 2 to 3.
- **Rime drake:** blue.
- **Bronze-harness alderkin:** Genesis, with no ability. Reach was too far and Set spear was cut.
- **Banked flame blade:** the card is the blade. Equipment plays exactly like an enchantment under a different label, so it needs no new rules. You like the bearer, so he could get his own card later.
- **Enchanter's quench:** the card is the enchantment.
- **Stoneward colossus:** it walks after all. Holding ground replaced "can't move or be pushed", and it dropped to 4 / 8 to make it a bit weaker.

## Tile effects

Added on 2026-11-09. This is the first batch for the tile-effects focus, chosen after the focus audit in `CARD_AUDIT.md`. The rules for tile effects are in `DESIGN_NOTES.md`. Numbers 45 and 50 were cut in discussion, so they're skipped here. Art briefs are in `art/ART_BRIEFS_SET6.md`.

| # | Card | Colour | Type | Cost | Wants | Stats | Rules | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 43 | Scorch | Fervor | Spell | 2 | 1 |  | Aim at a tile: 2 damage to a unit there, and the tile burns for 2 turns. Burning deals 1 damage | New: tile effects and aimed spells |
| 44 | Stormstrike | Fervor | Spell | 3 | 1 |  | Aim at a tile: 3 damage to a unit there and 1 to every unit next to it, yours included. The tile stays charged for 1 turn, and the next unit to enter it takes 2 | Small, once tile effects exist |
| 46 | Ember salamander | Fervor | Unit | 3 | 1 | 3 / 3 | Burning doesn't hurt it. +2 attack while it stands on a burning tile | Small |
| 47 | Frost | Gnosis | Spell | 3 | 1 |  | Aim at a tile: it and the tiles next to it freeze until the end of your next turn. Units on frozen tiles can't move | Small |
| 48 | Glyphwright | Gnosis | Unit | 3 | 1 | 2 / 3 | Ability: put a snare on an empty tile within 2 tiles, lasting 3 turns. The first enemy to enter it stops there and can't move on its next turn. Snares are visible to both players | Small |
| 49 | Thornbrake | Genesis | Spell | 2 | 1 |  | Aim at a tile: thorns for 3 turns. A unit that enters must stop there and takes 1 damage. Alderkin aren't affected | Small |
| 51 | Grave soil | Dominion | Spell | 2 | 1 |  | Aim at a tile: blighted for 3 turns. Units there have -1 attack. When a unit dies on it, you summon a Gravebound thrall on that tile | Small, once summoning exists |
| 52 | Ash-sower | Dominion | Unit | 3 | 1 | 3 / 3 | Ability: blight a tile next to it for 3 turns | Small |
| 53 | Consecrated ground | Vigil | Spell | 2 | 1 |  | Aim at a tile: for 3 turns, your unit there takes 1 less damage from attacks and recovers 1 health at the start of your turn | Small |

Choices made in discussion:

- **Scorch and Frost:** given short names.
- **Stormstrike:** this is the Fervor lightning card you asked for.
- **Cut:** Goblin torch-runner, which felt contrived, and Moss-walker, which repeated the salamander's idea.
- **Grave soil:** its thrall appears where the unit died rather than in the back row. This is the only exception to where summons arrive. It summons the existing Gravebound thrall, to match Gravecaller.

## Summoning, added cards, new keywords and death triggers

Added on 2026-11-09, to give the other new mechanics in `DESIGN_NOTES.md` their first cards. Summoned units and added cards are conjured, and they're copies of existing cheap cards wherever possible, so players already know them and they already have art. New conjured cards (Spark, War-chant and Cursed coin) are described in the rules. Art briefs are in `art/ART_BRIEFS_SET6.md`.

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Mechanic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 54 | Muster the levy | Vigil | Spell | 3 | 1 |  | Summon two Militia spearmen | Summoning |
| 55 | Pride lioness | Sunmane Oath | Unit | 4 | 2 | 3 / 5 | When summoned: summon a Pride cub | Summoning |
| 56 | Goblin rabble-rouser | Warhorde | Unit | 3 | 1 | 2 / 2 | When summoned: summon a Goblin cutter | Summoning |
| 58 | Seedfall | Genesis | Spell | 4 | 2 |  | Summon two Walking saplings | Summoning |
| 59 | Gravecaller | Gravebound | Unit | 4 | 2 | 2 / 4 | When an adjacent ally dies, summon a Gravebound thrall | Summoning, death trigger |
| 60 | Lantern apprentice | Lantern Conclave | Unit | 2 | 1 | 1 / 2 | When summoned: add a Spark to your hand. Spark costs 1: 1 damage to a unit | Added cards |
| 61 | Cinder-cant drummer | Cinder Clans | Unit | 2 | 1 | 1 / 2 | When summoned: add two War-chants to your hand. War-chant costs 1: a unit gets +2 attack this turn | Added cards |
| 62 | Tithe-keeper | Ashen Court | Unit | 3 | 1 | 2 / 3 | When summoned: put a Cursed coin in the enemy's hand. While it's in their hand, they lose 1 life at the end of each of their turns. Playing it costs them 1 mana and does nothing | Added cards |
| 63 | Court assassin | Ashen Court | Unit | 4 | 2 | 5 / 2 | Ambush. Hunt: +2 attack against a damaged unit | Ambush |
| 64 | Cinder skirmisher | Cinder Clans | Unit | 3 | 1 | 3 / 2 | Ambush | Ambush |
| 65 | Orc pack-hunter | Warhorde | Unit | 3 | 1 | 3 / 3 | Flanking | Flanking |
| 66 | Ridge wolves | Elder Herd | Unit | 2 | 1 | 2 / 2 | Flanking | Flanking |
| 67 | Oath outrider | Sunmane Oath | Unit | 3 | 1 | 3 / 3 | Flanking | Flanking |
| 68 | Shieldline sergeant | Sunmane Oath | Unit | 3 | 1 | 2 / 5 | Holding ground | Holding ground |
| 69 | Ironbark sentinel | Thornwardens | Unit | 5 | 2 | 3 / 9 | Holding ground. An alderkin | Holding ground |
| 70 | Cinder martyr | Cinder Clans | Unit | 2 | 1 | 2 / 1 | When it dies: each tile next to it burns for 2 turns | Death trigger, tile effects |
| 71 | Vigil-keeper | Still Flame | Unit | 2 | 1 | 1 / 3 | When another of your units dies, you gain 1 life | Death trigger |

Choices made in discussion:

- **Court assassin:** renamed from Court cutthroat. It costs more than the 2-cost draft, with two keywords and a harder hit.
- **Cinder martyr:** sets the tiles around it burning instead of dealing damage directly.
- **Cinder-cant drummer:** the drummer you liked as a design, now as a card.
- **Hedge summoner (#57):** cut. Young summoner becomes the errant summoner instead (#83).

## Loyal

Added on 2026-11-09. Loyal is +1 / +1 while you have another unit of the same sub-faction on the board, or +2 / +2 on a few cards. The rule is in `DESIGN_NOTES.md`. Eight more cheap Loyal units were drafted and cut, because an existing card already covered each one. These two stayed, because Still Flame and Artificers have few units and nothing like them.

| # | Card | Faction | Type | Cost | Wants | Stats | Rules |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 73 | Still Flame acolyte | Still Flame | Unit | 2 | 1 | 1 / 3 | Loyal: +2 / +2 |
| 75 | Artificer's journeyman | Artificers | Unit | 2 | 1 | 1 / 3 | Loyal: +2 / +2 |

## Changes to existing cards, not yet built

Added on 2026-11-09, after checking the built cards against the new mechanics.

| # | Card | Was | Becomes | Why |
| --- | --- | --- | --- | --- |
| 82 | Gravebound thrall | 2 / 2, no ability | 1 / 1. Loyal: +1 / +1 | The thralls that Grave soil and Gravecaller summon get stronger together |
| 83 | Young summoner | 2 / 3, no ability | 1 / 3. Errant. Ability: summon a Camp follower on a random tile in your back row | An inexperienced summoner, and the errant summoner in place of the cut Hedge summoner. It already has art |
| 84 | Slateprowler | 3 / 3, Hunt | 3 / 3, Hunt and Ambush | A stalking creature, and Dominion's second ambusher |
| 85 | Thornwarden saboteur | 2 / 3, Regrow | 2 / 3, Ambush | Its name says it sneaks in. Ambush replaces Regrow |
| 86 | Cinderfall | 3 damage to an enemy unit and 1 to each enemy next to it | Aim at a tile: 3 damage to a unit there and 1 to each enemy next to it, and the tile burns for 2 turns | Red's area spell joins the fire theme |
| 87 | Militia spearman | 2 / 2, no ability | 2 / 2. Loyal: +1 / +1 | A levy is stronger in numbers |
| 88 | Goblin cutter | 2 / 1, no ability | 2 / 1. Loyal: +1 / +1 | Weak alone, better in a horde |
| 89 | Oath knight | 3 / 5, Steadfast | 3 / 5, Holding ground | Fits "No one ordered her to stay" better than a bonus for standing still |
| 90 | Camp follower | 1 / 2, no ability | 1 / 2. When it dies: draw a card | Gives the weak neutral card a small reason to play it |
| 91 | Ember drake | 4 / 3, Flying | 4 / 3, Flying. When it dies: its tile burns for 2 turns | A dragon's fire, and a reason not to kill it among your own units |

## Set 6 is built

All 28 new cards and the 10 changes are in the game, with their art. The tile rules decided while building are in `DESIGN_NOTES.md`. Summoned units and added cards (Spark, War-chant, Cursed coin) are tokens, so they don't appear in the deck builder or as rewards.

| Alignment | New cards |
| --- | --- |
| Vigil (white) | 7 |
| Gnosis (blue) | 4 |
| Dominion (black) | 5 |
| Fervor (red) | 8 |
| Genesis (green) | 4 |

## Smaller mechanics to approve

The main new mechanics are approved in `DESIGN_NOTES.md`. These smaller ones each appear on only one or two proposed cards, so saying no to one touches little else.

| Mechanic | Card | Note |
| --- | --- | --- |
| A card that hurts the player holding it | Tithe-keeper's Cursed coin | The first card put into the enemy's hand |

## Questions

1. **Velunn names:** Ilvane and Orrowen are placeholders, in the style of Saint Maren and Vashkar. Rename or cut them freely. None of the new names has been checked against existing games or books.
2. **A vampire:** the Ashen Court envoy is a place for one, kept subtle and shown as a court official. Should it be one, or stay human?
3. **Muster the levy:** with Loyal on Militia spearman, it summons two 3 / 3s for 3 mana. Raise it to 4?
4. **Flavour:** none of the Set 6 cards has flavour text yet.

## Cards from the selected paintings

Proposed and built on 2026-11-10, with Cinderwake lowered to 3. You chose these twelve paintings to become cards on 2026-11-10. Each card's painting, game crop and source are recorded in `art/CARD_ART_FINAL.json`. Each card uses the exact painting you chose. The four round-07 paintings had their title strip cropped off for the game, and the full paintings are unchanged.

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Painting | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 92 | Cinderline veteran | Cinder Clans | Unit | 3 | 1 | 3 / 4 | Armed: +1 attack and +1 health while it carries equipment | [06](art/reference-library-2026-11-06/concept-round-08-2026-11-09/06-cinderline-veteran.png) | New: Armed |
| 93 | Redglass falchion | Cinder Clans | Equipment | 2 | 1 |  | Equip one of your units: +1 attack and Hunt (+2 attack against a damaged unit) | [07](art/reference-library-2026-11-06/concept-round-08-2026-11-09/07-redglass-falchion.png) | Small |
| 94 | Rain-reader | Lantern Conclave | Unit | 2 | 1 | 1 / 3 | Ability: clear the effect from a tile within 2 tiles, and your unit there recovers 1 health | [08](art/reference-library-2026-11-06/concept-round-08-2026-11-09/08-weather-at-her-elbow.png) | Small |
| 95 | The Mountain's Lung | Neutral | Spell | 2 | 0 |  | You have 3 extra mana next turn | [11](art/reference-library-2026-11-06/concept-round-08-2026-11-09/11-the-mountains-lung.png) | Small |
| 96 | Cinderwake | Cinder Clans | Spell | 3 | 1 |  | Aim at a tile: a wave of fire rolls from it toward the enemy's side, dealing 2 damage to each enemy in its path. Every tile it crosses burns for 2 turns | [13](art/reference-library-2026-11-06/concept-round-08-2026-11-09/13-cinderwake.png) | Small |
| 97 | The stone opens | Thornwardens | Spell | 3 | 1 |  | Each of your units can move 1 extra tile this turn | [14](art/reference-library-2026-11-06/concept-round-08-2026-11-09/14-the-stone-opens.png) | Small |
| 98 | Copperlane torch-runner | Warhorde | Unit | 2 | 1 | 2 / 1 | Swift. When it moves, the tile it leaves burns until your next turn | [01](art/reference-library-2026-11-06/middle-setting-round-07-2026-11-09/01-copperlane-torch-runner-v2.png) | Small |
| 99 | Ash-white lanner | None, a tamed creature (Fervor) | Unit | 3 | 1 | 2 / 3 | Flying. Hunt: +2 attack against a damaged unit | [21](art/reference-library-2026-11-06/middle-setting-round-07-2026-11-09/21-ash-white-lanner-v2.png) | None |
| 100 | Winterdoor keeper | Lantern Conclave | Unit | 3 | 1 | 2 / 3 | Ability: an enemy's tile within 2 tiles freezes until the end of your next turn | [Door into snow](art/reference-library-2026-11-06/selected-card-variants-2026-11-10/door-into-snow-character.png) | Small |
| 101 | Mothwake mourner | Gravebound | Unit | 3 | 1 | 2 / 3 | When another of your units dies, the enemy loses 1 life | [23](art/reference-library-2026-11-06/middle-setting-round-07-2026-11-09/23-mothwake-mourner-v2.png) | Small |
| 102 | Cobalt rapier | Artificers | Equipment | 3 | 1 |  | Equip one of your units: +1 attack and Ranged (attacks up to 2 tiles away) | [Card art](art/cobalt-rapier.png) | Small |
| 103 | Corewright | Artificers | Unit | 3 | 1 | 2 / 3 | Your equipment costs 1 less | [06](art/reference-library-2026-11-06/middle-setting-round-07-2026-11-09/06-corewrights-bench.png) | New: cost reduction |

Why each card is the way it is:

- **An equipment focus:** the two blades, the veteran and the corewright give equipment its first real cards beyond Banked flame blade. The veteran wants a blade, and the corewright makes blades cheaper. Equipment still plays as an enchantment with a different label.
- **Cinderline veteran:** sturdier than most Fervor units, because he's a survivor, with a reason to carry the falchion or the flame blade.
- **Redglass falchion:** a hunter's blade, so it's better against a wounded target. It costs the same as Banked flame blade with a different job.
- **Rain-reader:** the woman from "The weather at her elbow". Everyday water magic puts out fires and washes away blight, so she's the first answer to tile effects.
- **The Mountain's Lung:** your idea of extra mana. The gameplay effect is a one-turn burst for casting something big a turn early, with no building or player mana bank. It's neutral so any big-card deck can use it. In the setting, the engine burns stored mana from stones, leaving them permanently spent (creator clarification, 2026-11-10).
- **Cinderwake:** separate from Cinderfall. Cinderfall hits one spot hard, while Cinderwake sweeps a whole column. Aiming it near your own side covers more tiles but leaves fire close to your units.
- **The stone opens:** Genesis is slow, so this is its breakout turn: everything moves further at once.
- **Copperlane torch-runner:** the sparks behind him in the painting become a trail of fire. A Goblin torch-runner was cut on 2026-11-09 as contrived. This one comes from your chosen painting, but say if the idea still feels forced.
- **Ash-white lanner:** a raptor that dives on wounded prey. The card is the creature, with the handler as the picture.
- **Winterdoor keeper:** the woman from "A door into snow". Her door lets winter through onto one enemy, using the Frost tile rules.
- **Mothwake mourner:** grief turned outward. It's Dominion's version of Vigil-keeper, draining the enemy instead of healing you.
- **Cobalt rapier:** selected on 2026-11-09 and reused here, not a second entry. Its painting is already finished and in `art/CARD_ART_FINAL.json`. A duellist's reach gives Gnosis an equipment card that fits its ranged strength.
- **Corewright:** the artisan at her bench, not the automaton from the next painting.

Still to do: flavour text. The black-enamel kit now has a [male wearer study](art/work-in-progress/magic-and-industry-round-09-2026-11-10/03-black-enamel-open-road.png), awaiting creator review. It isn't one of these cards.

## Balance changes, built 2026-11-10

Approved after the 2026-11-10 balance review. Starter decks won between 38% and 73% before these changes, and between 43% and 57% after (2,000 bot games).

| Card or deck | Was | Becomes | Why |
| --- | --- | --- | --- |
| Elder Herd bull | 6 / 9 | 6 / 8 | Green won 73% as a starter, and won more than any other colour in random decks |
| Walking sapling | 1 / 3 | 1 / 2, so it reaches 4 / 8 | Same |
| Bronze-harness alderkin | 4 / 7 | 4 / 6 | A plain 4-cost unit that won 69% of the games it was played in |
| Death warrant | 5 mana | 4 mana | Black's weakest card, winning 37% of the games it was played in |
| Oath of the Sunmane starter | 2 Water carrier, Dawnsails over the harvest | Pride lioness, Pride matriarch, Oath outrider | The starter predated the newer Sunmane cards. White's cards were the strongest in random decks while its starter was the weakest |
| The Ashen Court starter | 3 Gravebound thrall, 3 Bone harvester, 2 Raise the dead, Sellsword, Across the silence | 2 thrall, 2 harvester, 1 Raise the dead, plus Ashen Court envoy, Porcelain-visored retainer, 2 Indebted squire and Barrow colossus | Black fell to 30% once white improved. Not part of the approved list, so say if you'd rather undo it |

## Proposals for the 6 by 5 board, 2026-11-10

Built on 2026-11-10, when 6 by 5 with a 7-card hand and 15 life became Standard. In bot games on it, Rootfed herd and Hearth and vow jump from about 52% to 67%, while The long throw drops to 35%. Every card in the two slow decks gains 12 to 19 points of win rate when drawn, so the cause is the deck plans, not one card: the fifth row gives building-up decks more turns before the fighting starts. A fifth row alone does most of it, and the 7-card hand adds a few points.

Each line was tested alone in 3,600 bot games of the 10 theme decks and 5 starters, with Devotion capped first.

| Card or rule | Was | Becomes | Result in bot games |
| --- | --- | --- | --- |
| Devotion | +1 / +1 for good each time, with no limit | Up to +3, like Rootfed and Grows | Hearth and vow 67% to 59%. Nothing else moves more than 1 point |
| Herd mother, Alderkin elder | 6 mana | 7 mana | Rootfed herd 68% to 64%. The gap between the best and worst deck shrinks from 33 to 29 points |
| Shell-mountain tortoise | 5 mana | 6 mana | Tested with the line above |

Tried and not worth it: Herd mother at 7 / 9 or 6 / 10, Alderkin elder at 4 / 7 or 4 / 6, Saint Maren at 4 / 9 or healing 1, Rootfed capped at +2, and Earthspeaker without its extra land. Each moved its deck by 2 points or less. Saint Maren still wins well above her deck, so she's worth watching in play, but the numbers don't single her out once the deck is accounted for.

Then the creator asked to cut back the really good cards in the strongest decks rather than change the cards themselves. Tested over 5,400 games:

| Deck | Was | Becomes | Win rate |
| --- | --- | --- | --- |
| Hearth and vow | 1 Sunmane lancer | 1 Pride huntress | 60% to 54% |
| Rootfed herd | 12 Overgrown ruin, 3 Mosshorn grazer, 2 Elderwood stag | 11 ruin, 2 Mosshorn grazer, 1 stag, plus Thicket boar, Bronze-harness alderkin and Great owl | 63% to 52% |
| Oath of the Sunmane starter | 2 Sunmane lancer | 1 lancer, 1 Pride huntress | 61% to 55% |

The best deck now wins 60% and the worst 39%, a gap of 21 points instead of 28. Cutting Pride matriarch from Hearth and vow as well took it to 47%, too far. For Rootfed herd the twelfth land mattered more than any single beast. The Elder Herd starter is now on top at 60% and is the next to look at.

Still open: the fast decks. The long throw (35%), The Thornwardens (44%) and The armed road (44%) need something that reaches the summoner before a slow deck is ready, such as cheaper burn, more Swift units or Ambush.

## Proposals from the 2026-11-10 balance review

Built on 2026-11-10. Draft decks built around focuses show four that don't win yet: burning ground, freezing, healing and sacrifice. Each has plenty of cards that set up its effect and almost none that turn it into a win. These cards are mostly the payoffs, shaped by your feedback on 2026-11-10. Sacrifice is left open, since you didn't like the first ideas.

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 104 | Kindle the line | Cinder Clans | Spell | 4 | 2 |  | Aim at a tile: it and the tiles next to it burn for 2 turns. Each enemy there takes 1 damage. Your units there aren't hurt; they become Lit instead | New: Lit |
| 105 | Slagheart hulk | None (Fervor) | Unit | 5 | 2 | 4 / 7 | Lit from the moment it's summoned | Small, once Lit exists |
| 106 | Cinder firebrand | Cinder Clans | Unit | 3 | 1 | 3 / 4 | +2 attack against a unit on a burning tile | Small |
| 107 | Rimebolt | Lantern Conclave | Spell | 3 | 1 |  | 2 damage to an enemy unit, and it can't move on its next turn | Small |
| 108 | Conclave rimecaller | Lantern Conclave | Unit | 3 | 1 | 2 / 2 | Ranged. Freeze: the unit it attacks can't move on its next turn | None |
| 109 | Vow of keeping | Still Flame | Enchantment | 2 | 1 |  | Enchant one of your units: -1 attack. The first time it would die, it's left at 1 health instead, and the vow ends | Small |
| 110 | Still Flame chaplain | Still Flame | Unit | 3 | 1 | 1 / 4 | Ability: heal an ally within 2 tiles 2 | Small |
| 111 | Devoted pilgrim | Still Flame | Unit | 2 | 1 | 1 / 3 | Devotion: when it or an adjacent ally recovers health, it permanently gets +1 attack and +1 health | New: Devotion |
| 112 | Debt Collector's Blade | Ashen Court | Equipment | 2 | 1 |  | Equip one of your units: +1 attack and Drain (heals the bearer for the damage it deals) | None |
| 113 | Stormglass glaive | Sunmane Oath | Equipment | 3 | 1 |  | Equip one of your units: +1 attack and Resonance (its attacks also hit the enemy directly behind the target) | None, now that Resonance does this |
| 114 | Ledger of debts | Ashen Court | Spell | 2 | 1 |  | Lose 2 life. Draw two cards | Small |
| 115 | Ribbonvane | None (Vigil) | Unit | 4 | 2 | 3 / 4 | Flying. Guard | None |
| 116 | Untaught firecaller | Warhorde | Unit | 3 | 1 | 2 / 3 | Ability, instead of attacking: pick a tile within 3 tiles. The fire lands on a random tile among it and the tiles next to it: 3 damage to any unit there, yours included, and the tile burns for 2 turns | Small |
| 117 | Reedbank forager | Elder Herd | Unit | 2 | 1 | 1 / 3 | Instead of moving or attacking: you may play an extra land this turn | Small |

**Lit**, the new rule behind 104 and 105:

- A Lit unit has Fireproof, given by the spell: burning tiles and explosions don't hurt it. Explosions are fire, so Fireproof units such as the Ember salamander ignore them too.
- When a Lit unit dies, it explodes: 2 damage to each unit next to it that isn't Lit or Fireproof, yours included. Its tile and the tiles next to it burn for 2 turns.
- A unit stays Lit until it dies.
- Your units caught in the spell become Lit and are immune to it. Your other units take the explosions and burns like anyone else. A deck can set the whole board alight without killing its own side, as long as it lights its units first.

Why each card is the way it is:

- **Kindle the line:** your design. It lights your units and burns the area, and the enemies caught in it take a little damage on the way.
- **Slagheart hulk:** your sturdy fireproof heavy, a body of rock and magma. Fervor's constructs would be elemental, so whether it was made or simply exists is open. It explodes when it finally dies.
- **Cinder firebrand:** your idea of hitting burning enemies harder, and a reason to burn tiles near the enemy rather than your own side.
- **Rimebolt:** your damage-and-freeze card. It costs 1 more than Firebolt for the freeze.
- **Conclave rimecaller:** your ranged freezer. It's fragile, as you said it could be, and uses the Rime drake's Freeze.
- **Vow of keeping:** your enchantment that protects a unit's life at the cost of attack. Say if you meant something different, such as a large health or damage-reduction bonus.
- **Still Flame chaplain:** healing at range, so a healer can stand behind the line.
- **Devoted pilgrim:** your Devotion idea, a unit you build up over the game. Any heal counts, even on a unit at full health (changed from real health only, 2026-11-10). The Still Flame counts, so it may need a limit after playtesting. #139 and #140 make Devotion three cards.
- **Debt Collector's Blade:** the finished painting in `art/CARD_ART_FINAL.json`, whose suggested role was recovering something when damage is dealt. Drain does exactly that.
- **Stormglass glaive:** the accepted round-10 painting, a polearm whose faction was left unassigned. Vigil has no true equipment yet, and a long blade that reaches the second rank suits the Sunmane Oath and its lancer. It could just as well be Gnosis, for the spark trapped in its blade.
- **Ledger of debts:** card draw paid for with life, which you liked for Dominion.
- **The flier:** white's first flier, a new creature unlike anything in the setting so far. Guard keeps it in Vigil's protective role. Three possible looks: a long ribbon-bodied glider with rows of translucent vanes, riding warm air over the grass; a great pale moth-like grazer with soft banded wings; or a kite-shaped animal with one broad wing membrane and long trailing tail streamers. The creator chose the ribbon-bodied glider on 2026-11-10; its name is still to come.
- **Untaught firecaller:** your random landing spot within an area. Raw power with little training, as the setting describes: the fire goes roughly where it's aimed. Round 11's "More Fire Than Hands" could become its art if you accept that painting.
- **Reedbank forager:** green's second card for extra lands, a strength the design notes give Genesis. It uses the finished painting with that name in `art/CARD_ART_FINAL.json`.

Still open:

1. **Sacrifice:** the Gravebound deck still wins only about 38%. It needs a different kind of payoff from the ones you turned down.
2. **Constructs:** these stay ordinary cards, mostly neutral and Gnosis, some Dominion, with Fervor's being elemental. The Slagheart hulk is the first of the elemental kind. A small batch of the others can come next.

## Keywords decided on 2026-11-10

The aim is at least three cards for each keyword that's a core capability. Built in this session unless marked.

| Keyword | What it does now | Cards | Decided |
| --- | --- | --- | --- |
| Warband | Adjacent allies get +1 attack | Orc warchief, Cinder-cant drummer, Giant chieftain | Built. The drummer keeps its War-chants, and the chieftain loses Frenzy |
| Stomp | Its attacks also deal 1 damage to enemies next to the target | Hill giant, Giant chieftain | Built. The alderkin stays plain |
| Resonance | Its attacks also hit the enemy directly behind the target, for the full attack | Harmonic wardwright and #113 Stormglass glaive | Built. It used to splash 1 damage to every side, like Stomp |
| Longshot | Attacks up to 3 tiles away if it hasn't moved this turn. Once it moves, melee only | Brass siege-walker, Ilvane, plus #142 Focus-rifle marksman and #150 Shutter-window assassin | Rule built, and Ilvane changed from Ranged |
| Regrow | Removed as too strong | None | Built. The Mossback bear takes Frenzy instead, the extra Frenzy card you allowed. Say if you'd rather it stayed plain |
| Freeze | The unit it attacks can't move on its next turn | Rime drake, Winterdoor keeper, plus #108 Conclave rimecaller | Built for the keeper. #107, #145 and #146 are freeze spells |
| Frenzy | +2 attack on its first attack | Cinder berserker, Orc raider, Mossback bear | Built. Until 2026-11-11 it was +2 attack while damaged |
| Fireproof | Burning tiles don't hurt it | Ember salamander, Ember drake, Elder dragon, Copperlane torch-runner, and your units lit by #104 Kindle the line or #164 Anoint with embers | Built for the four with it innately. It can also come from a spell, an enchantment (#190) or equipment (#191). No card already in the game gives it, and lightning never does |
| Veiled | Can't be attacked or targeted by enemy cards until it attacks | Veil adept, plus #154 Halfshade lynx | Built |
| Armed | +1 attack and +1 health while it carries equipment | Cinderline veteran, plus #143 Field-plate artificer and #177 Buckling recruit | Built. Armed isn't tied to a colour |
| Decoy | Adjacent enemies must attack it first; removed after one hit | Illusory decoy, Conclave phantasm, plus #144 Glimmer double | Built. The spell places a decoy that lasts until the start of your next turn |
| Errant | The Young summoner's Camp follower appears on a random tile of your back row | Young summoner | Unchanged. It already summons a creature: "land" in the old wording meant where the follower appears |
| Carrion | Permanently +1 attack whenever another unit dies, yours or the enemy's, up to +3 | Barrow colossus, Porcelain-visored retainer, plus #151 Mortuary priest, #152 Hostess of the late hour and #181 Ossuary engine | Built. It replaces Gathered and Sworn, and you chose the name |

## Proposals: hitting the summoner, area spells, control and stasis

Proposed on 2026-11-10 from your notes, and approved the same day with the changes below. Built on 2026-11-10.

- Siphon vigor and Collect the tithe cost 1 more each, and gain life only when they hit the summoner.
- Bought allegiance can't take a Loyal unit.
- Borrowed will's painting: someone's eyes filling with what looks like blue flame, cold, small and flickering, wisping into the eyes.

**Rules for this group:**
- A spell that can hit the summoner is aimed at a unit or at the summoner, and it does less damage per mana than spells that hit only units. Firebolt and Scorch deal 1 damage per mana. These deal about 0.6 to 0.7.
- Area spells never reach the summoner. Their shapes stay on the grid, so nothing hits over the back row.
- Area shapes: a square is a tile and the 8 around it, a cross is a tile and the 4 next to it, and a row or a column is a whole line of the grid. Cinderfall, Stormstrike and Frost already cover the cross, and Cinderwake covers a column.

| # | Card | Faction | Type | Cost | Wants | Rules | Painting | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 118 | Hurled brand | Cinder Clans | Spell | 3 | 1 | 2 damage to a unit or to the enemy summoner |  | New: aiming at the summoner |
| 119 | The sky falls in | Warhorde | Spell | 5 | 2 | 4 damage to a unit or to the enemy summoner |  | Small, after 118 |
| 120 | Siphon vigor | Ashen Court | Spell | 4 | 1 | 2 damage to a unit or to the enemy summoner. If it hits the summoner, you gain 2 life | [Card art](art/siphon-vigor.png) | Small, after 118 |
| 121 | Collect the tithe | Ashen Court | Spell | 6 | 2 | 3 damage to a unit or to the enemy summoner. If it hits the summoner, you gain 3 life |  | Small, after 118 |
| 122 | Scatter the line | Cinder Clans | Instant | 3 | 1 | Aim at a row: each enemy in it takes 1 damage and is pushed 1 tile back toward its side | [Card art](art/scatter-the-line.png) | New: rows |
| 123 | Pall of ash | Gravebound | Spell | 4 | 2 | Aim at a tile: 1 damage to every unit in the square around it, yours included, and those tiles are blighted for 2 turns. Square | | New: squares |
| 124 | Harmonic burst | Lantern Conclave | Spell | 3 | 1 | Aim at a tile: 1 damage to every unit there and next to it, and each enemy hit is pushed 1 tile away from the centre. Cross | | Small |
| 125 | Line of dawn | Still Flame | Spell | 3 | 1 | Aim at a column: each enemy in it takes 1 damage, and each of your units in it recovers 2 health. Column | | Small |
| 126 | Wildfire | Cinder Clans | Spell | 6 | 2 | Sweeper: 2 damage to every unit, yours included. Fireproof and Lit units are unhurt | | Small |
| 127 | Hour of collection | Ashen Court | Spell | 5 | 2 | Sweeper: at the end of your next turn, every unit with 2 or less health is destroyed, yours included | [Card art](art/hour-of-collection.png) | Small |
| 128 | Borrowed will | Lantern Conclave | Spell | 4 | 2 | Take control of an enemy unit until the end of this turn. It can move and attack, even if it has already acted, but it can't attack a summoner. Then it returns | | New: control |
| 129 | Bought allegiance | Ashen Court | Spell | 6 | 2 | Take control of an enemy unit costing 4 or less for good. Loyal units refuse. It stays on its tile and can act from your next turn | | Small, after 128 |
| 130 | Barrow mark | Gravebound | Enchantment | 2 | 1 | Enchant an enemy unit: when it dies, you summon a Gravebound thrall on its tile | | Small |
| 131 | Held between moments | Lantern Conclave | Spell | 3 | 1 | Until the end of your next turn, an enemy unit can't move, attack or use abilities, and it can't be attacked | | Small |
| 132 | Leaden step | Lantern Conclave | Enchantment | 2 | 1 | Enchant an enemy unit: it loses Swift and Flying, and it can't move and attack in the same turn | | Small |
| 133 | Unwind the step | Lantern Conclave | Instant | 2 | 1 | When an enemy unit moves: it goes back to where it started and can't move again this turn | | New: a trigger on enemy moves |

Why each card is the way it is:

- **Hurled brand and The sky falls in:** red's reach. A cheap one to finish a close race and an expensive one that can end a game, both weaker against units than Firebolt or Cinderfall.
- **Siphon vigor and Collect the tithe:** black's version, draining life from the summoner, as you suggested. At 4 and 6 mana they deal 0.5 damage per mana, below red's, since the life gain is worth something. Siphon vigor uses the finished painting with that name, whose suggested role was draining strength.
- **Scatter the line:** a row of enemies knocked back, using the finished painting of that name. It answers a wide line of weak units without wiping it out.
- **Pall of ash:** Dominion's square, hurting its own units too, as Dominion pays with its own side.
- **Harmonic burst:** Gnosis's cross, pushing enemies apart. It's damage and disruption in one.
- **Line of dawn:** white's column, which heals more than it harms, to suit Vigil's low damage.
- **Wildfire:** a true sweeper. A fire deck whose units are Lit or Fireproof can cast it and keep its own board.
- **Hour of collection:** a delayed sweeper that clears small units, with a turn's warning. That fits the painting's countdown. It's the natural counter to flooding the board, and it hits your own small units too.
- **Borrowed will:** Gnosis takes control briefly, turning an enemy unit against its neighbours. It can't strike a summoner, so it can't end a game outright.
- **Bought allegiance:** Dominion takes control for good, at a high price.
- **Barrow mark:** your idea. A cursed enemy comes back as your thrall when it dies.
- **Held between moments:** Gnosis stasis. It stops a unit completely, which can also protect it, so it's a tool both ways.
- **Leaden step:** your idea of slowing a unit down. A fast unit loses its speed, and the unit can't move and attack in the same turn.
- **Unwind the step:** a response that undoes an enemy's move. It's the first instant triggered by a move.

**Champions:** no new mechanic. Paying for a big unit and the turns spent upgrading it are the risk. A unit that turns out too strong gets weaker or more expensive.

## Proposals to fill out the roster

Proposed on 2026-11-10, and built the same day. #176 was removed. With #104–133 they bring the pool from 134 cards to about 220, aiming for roughly 36 to 45 for each colour and a stronger neutral set. Cards marked with a painting use finished art in `art/CARD_ART_FINAL.json` that has no card yet. The rest need art from Codex. "New code" is the engine work each one needs.

Art briefs for the 57 cards from #104 to #191 without a painting are in five sets of 11 or 12, written on 2026-11-10 so they can be generated in parallel: `art/ART_BRIEFS_SET7.md` to `art/ART_BRIEFS_SET11.md`. The white flier (#115) is in set 11, as the ribbon-bodied glider the creator chose.

New rules these cards use:

- **Fire spells come in two kinds** (creator, 2026-11-10): some damage only enemy units and some damage every unit, yours included. Cost and damage balance the two: enemy-only fire costs more or hits less. Of the current cards, Cinderfall and Cinderwake hit only enemies, and Stormstrike, a lightning spell, hits everyone. Burning tiles hurt anyone without Fireproof.

- **Carrion:** the merged Gathered and Sworn keyword above, now built.
- **Rootfed:** permanently +1 attack and +1 health whenever you play an Overgrown ruin (a Genesis land), up to +3. It's a payoff for Genesis's extra lands. Approved 2026-11-10.
- **Charm:** an enemy unit is yours while the unit that charmed it lives, then goes back. A unit can hold one charm at a time. Loyal units refuse, as with Bought allegiance.
- **Random spots in a square:** each spot is picked at random among the 9 tiles, and the same tile can be picked twice.

### Vigil (white)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Painting | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 134 | Roadwarden's shield | Sunmane Oath | Equipment | 2 | 1 |  | Equip one of your units: +2 health and Guard | roadwardens-shield | None |
| 135 | Sunthread mantle | Still Flame | Equipment | 1 | 1 |  | Equip one of your units: it takes 1 less damage from attacks | sunthread-mantle | None |
| 136 | Oath-road squire | Sunmane Oath | Unit | 1 | 1 | 1 / 2 | Ability: move an equipment card from one adjacent ally to another, or to itself | oath-road-squire | Small |
| 137 | Stand as one | Sunmane Oath | Instant | 2 | 1 |  | When an enemy attacks one of your units: it and each ally next to it take 2 less damage this turn | stand-as-one | Small |
| 138 | Sanctuary threshold | Still Flame | Spell | 2 | 1 |  | Aim at a tile: for 3 turns, your unit there can't be attacked from more than 1 tile away or targeted by enemy spells | sanctuary-threshold | Small |
| 139 | Hearth-sworn penitent | Still Flame | Unit | 3 | 1 | 2 / 4 | Devotion |  | After #111 |
| 140 | Vowkeeper of the long road | Still Flame | Unit | 5 | 2 | 3 / 7 | Guard. Devotion |  | After #111 |
| 141 | Humbling light | Still Flame | Spell | 4 | 2 |  | Each unit with 5 or more attack takes 3 damage, yours included |  | Small |

### Gnosis (blue)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Painting | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 142 | Focus-rifle marksman | Artificers | Unit | 4 | 2 | 3 / 3 | Longshot |  | None |
| 143 | Field-plate artificer | Artificers | Unit | 3 | 1 | 2 / 4 | Armed |  | None |
| 144 | Glimmer double | Lantern Conclave | Spell | 1 | 0 |  | Summon an Illusory decoy on any empty tile outside the back rows. It vanishes at the start of your next turn |  | Small |
| 145 | White morning | Lantern Conclave | Spell | 3 | 1 |  | Aim at a row: each enemy in it takes 1 damage and can't move on its next turn. Row |  | Small, after #122 |
| 146 | Frostbreak | Lantern Conclave | Spell | 3 | 1 |  | 3 damage to an enemy unit that is frozen or stands on a frozen tile. Otherwise 1 |  | Small |
| 147 | Prism bracer | Artificers | Equipment | 2 | 1 |  | Equip one of your units: it attacks 1 tile further | prism-bracer | Small |
| 148 | Conclave courier | Lantern Conclave | Unit | 2 | 1 | 1 / 2 | Swift. Ability: move an adjacent ally 1 tile | conclave-courier | Small |
| 149 | Unmake the pattern | Lantern Conclave | Spell | 2 | 1 |  | Aim at a tile: remove every enchantment, equipment and tile effect there and next to it. Cross. Or destroy a relic | unmake-the-pattern | Small |

### Dominion (black)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Painting | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 150 | Shutter-window assassin | Ashen Court | Unit | 4 | 2 | 3 / 2 | Longshot. Hunt |  | None |
| 151 | Mortuary priest | Gravebound | Unit | 3 | 1 | 2 / 4 | Carrion |  | After Carrion |
| 152 | Hostess of the late hour | Ashen Court | Unit | 5 | 2 | 4 / 5 | Drain. Carrion |  | After Carrion |
| 153 | Gilt-hall temptress | Ashen Court | Unit | 4 | 2 | 2 / 3 | Ability, instead of attacking: charm an enemy unit costing 3 or less within 2 tiles |  | New: charm, after #128 |
| 154 | Halfshade lynx | None (Dominion) | Unit | 3 | 1 | 3 / 2 | Veiled |  | None |
| 155 | Lots for the gallows | Ashen Court | Spell | 5 | 2 |  | Aim at a tile: one random unit in the square around it is destroyed, yours included. Square, random |  | Small, after #123 |
| 156 | Court informant | Ashen Court | Unit | 2 | 1 | 1 / 2 | When summoned: a random card in the enemy's hand costs 1 more until it's played | court-informant | Small |
| 157 | Ashen Court bailiff | Ashen Court | Unit | 3 | 1 | 2 / 4 | Ability: an adjacent enemy unit has -2 attack until the end of its next turn | ashen-court-bailiff | Small |
| 158 | Barrow tender | Gravebound | Unit | 2 | 1 | 1 / 3 | Once each turn, when another of your units dies next to it: you have 1 extra mana next turn | barrow-tender | Small |
| 159 | Mourning veil | Ashen Court | Equipment | 2 | 1 |  | Equip one of your units: it becomes Veiled, and attacking doesn't end that. Each time it attacks, you lose 1 life | mourning-veil | Small |

### Fervor (red)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Painting | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 160 | Cinderhook axe | Warhorde | Equipment | 2 | 1 |  | Equip one of your units: +2 attack, and its attacks ignore Guard | cinderhook-axe | Small |
| 161 | Cinder rain | Cinder Clans | Spell | 4 | 2 |  | Aim at a tile: three embers land on random spots in the square around it. Each deals 2 damage to any unit there, yours included, and burns the tile for 1 turn. Lit and Fireproof units are unhurt. Square, random |  | Small, after #123 |
| 162 | Clan outrider | Cinder Clans | Unit | 2 | 1 | 2 / 1 | Swift. When summoned: 1 damage to an enemy unit within 2 tiles | clan-outrider | Small |
| 163 | Shatter the chain | Cinder Clans | Spell | 2 | 1 |  | Remove an enchantment or equipment from any unit, or destroy a relic. If it was on an enemy unit, that unit takes 2 damage | shatter-the-chain | Small |
| 164 | Anoint with embers | Cinder Clans | Spell | 2 | 1 |  | One of your units becomes Lit |  | After #104 |

### Genesis (green)

| # | Card | Faction | Type | Cost | Wants | Stats | Rules | Painting | New code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 165 | Overgrowth | Thornwardens | Spell | 4 | 2 |  | Aim at a tile: the square around it fills with thorns for 2 turns. Square |  | Small, after #123 |
| 166 | Thornwarden pathguard | Thornwardens | Unit | 3 | 1 | 3 / 4 | Holding ground | thornwarden-pathguard | None |
| 167 | Sudden canopy | Thornwardens | Instant | 2 | 1 |  | When an enemy attacks one of your units from 2 or more tiles away: prevent all of that damage | sudden-canopy | Small |
| 168 | Return to loam | None (Genesis) | Spell | 2 | 1 |  | Destroy an equipment card or a relic. You may play an extra land this turn | return-to-loam | Small |
| 169 | Thornwarden trapper | Thornwardens | Unit | 2 | 1 | 2 / 2 | Ability: an adjacent empty tile fills with thorns for 2 turns |  | Small |
| 170 | Mosshorn grazer | Elder Herd | Unit | 2 | 1 | 1 / 3 | Rootfed |  | New: Rootfed |
| 171 | Earthspeaker | Thornwardens | Unit | 4 | 2 | 2 / 5 | Rootfed. When summoned: you may play an extra land this turn |  | After #170 |
| 172 | Elderwood stag | Elder Herd | Unit | 5 | 2 | 4 / 6 | Swift. Rootfed |  | After #170 |
| 173 | Alderkin elder | None (Genesis) | Unit | 6 | 3 | 5 / 8 | Grows |  | None |
| 174 | Shell-mountain tortoise | Elder Herd | Unit | 5 | 2 | 2 / 12 | Guard |  | None |
| 175 | Spring melt | None (Genesis) | Spell | 2 | 1 |  | One of your units recovers 4 health and permanently gets +1 attack |  | Small |
| 189 | Still Flame ash-sweeper | Still Flame | Unit | 2 | 1 | 1 / 3 | Ability: clear every tile effect on its tile and the tiles next to it |  | Small |
| 190 | Emberward | Cinder Clans | Enchantment | 1 | 1 |  | Enchant one of your units: Fireproof |  | None |
| 191 | Salamander-hide mantle | Cinder Clans | Equipment | 2 | 1 |  | Equip one of your units: +1 health and Fireproof |  | None |

The ash-sweeper is Vigil's one tile-clearing card, as asked on 2026-11-10. Emberward and the Salamander-hide mantle let Fireproof come from an enchantment and from equipment as well as being innate or lit by a spell. They're listed here, after the green cards, so the numbers before them stay the same.

### Neutral

| # | Card | Type | Cost | Wants | Stats | Rules | New code |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 177 | Buckling recruit | Unit | 2 | 0 | 2 / 2 | Armed | None |
| 178 | Rust-hinged warden | Unit | 3 | 0 | 1 / 6 | Guard | None |
| 179 | Copper hound | Unit | 2 | 0 | 2 / 2 | Swift | None |
| 180 | Waystone golem | Unit | 5 | 0 | 5 / 7 | None | None |
| 181 | Ossuary engine | Unit, Gravebound (Dominion) | 4 | 2 | 3 / 5 | Carrion | After Carrion |

### Relics

Approved as a new card type on 2026-11-10. A relic stays in play beside your summoner, off the grid, with an ongoing effect. Seven finished paintings were drawn as relics, and this type uses them. Return to loam, Shatter the chain and Unmake the pattern can remove relics as well as equipment.

| # | Card | Faction | Cost | Wants | Rules | Painting |
| --- | --- | --- | --- | --- | --- | --- |
| 182 | Oath bell | Sunmane Oath | 3 | 1 | Pay 1 on your turn: each of your units next to an ally gets +1 attack this turn | oath-bell |
| 183 | Pilgrim reliquary | Still Flame | 2 | 1 | At the start of your turn, your most damaged unit recovers 1 health | pilgrim-reliquary |
| 184 | Tideglass engine | Artificers | 2 | 1 | At the end of your turn, 1 unspent mana is stored in it, up to 3. On your turn, release it all as extra mana | tideglass-engine |
| 185 | Folded observatory | Lantern Conclave | 3 | 1 | At the start of your turn, look at the top 2 cards of your deck and put them back in any order | folded-observatory |
| 186 | Sepulchral scale | Gravebound | 2 | 1 | Once each turn, when one of your units dies: you may lose 1 life to draw a card | sepulchral-scale |
| 187 | Warband drum | Warhorde | 3 | 1 | Pay 1 on your turn: each of your units can move 1 extra tile this turn | warband-drum |
| 188 | Seedheart vessel | Thornwardens | 3 | 1 | Each land you play stores 1 growth in it, up to 3. On your turn, release it: one of your units permanently gets +1 attack and +1 health for each | seedheart-vessel |

Why each card is the way it is:

- **Equipment (134, 135, 147, 159, 160) and the Oath-road squire:** five unused equipment paintings, which also give the three Armed units something to carry. The squire's painting suggested maintaining an ally's equipment, so it hands gear down the line.
- **Stand as one and Sanctuary threshold:** Vigil's protection, and the threshold is its answer to Longshot and ranged units.
- **Penitent and Vowkeeper:** Devotion's second and third cards, so a healing deck has more than one thing to build up.
- **Humbling light:** Vigil's answer to the one-big-creature plan, the counterweight you described.
- **Focus-rifle marksman:** your sniper with a magic rifle. The rifle is a focus for lantern energy rather than a gun, so guns stay rare.
- **Shutter-window assassin:** your Dominion assassin with a crossbow. Longshot and Hunt make it a finisher that has to stay still to work.
- **Glimmer double:** your one-turn decoy placed anywhere. It can pull an attacker off its target or block a lane for a turn.
- **White morning and Frostbreak:** more freeze spells, and a payoff, since the winter deck won only 29% for lack of one.
- **Courier and Unmake the pattern:** Gnosis moving units and removing magic, both from finished paintings, the second one you liked.
- **Mortuary priest and the Hostess of the late hour:** your dark priest and glamorous vampire. She drinks with Drain and grows with Carrion, and stays subtle in the art, as vampires are rare.
- **Gilt-hall temptress:** your seduction card with magic. Charm keeps the enemy unit only while she lives, so the enemy's answer is to kill her.
- **Halfshade lynx:** the animal partly made of shadow, the second Veiled card.
- **Lots for the gallows and Cinder rain:** your random spots in a square. Dominion's destroys one unit outright but might take yours. Fervor's throws three embers.
- **Court informant, bailiff and Barrow tender:** three unused Dominion paintings. The bailiff weakens a unit, as its painting suggested restraint; it no longer chains, since Chain was turned down. The tender turns deaths into mana, the sacrifice payoff you approved.
- **Mourning veil:** the concealment-with-a-cost painting. It can make any unit Veiled, so say if Veiled should stay rarer.
- **Cinderhook axe:** pressing an attack, as its painting suggested. Ignoring Guard is its edge.
- **Clan outrider:** the goblin on a donkey throwing a spear.
- **Shatter the chain:** red breaking restraints. It removes Leaden step, Barrow mark or a Death warrant from your unit, or an enemy's equipment.
- **Anoint with embers:** a cheaper way to light a single unit. Only lighting spells protect your units from your own fire. It replaces the Kindled zealot.
- **Overgrowth and the trapper:** Genesis's square and more thorns, so the thorn deck controls ground.
- **Rootfed (170–172):** a payoff for extra lands, which green has plenty of and no reward for.
- **Alderkin elder and the tortoise:** big Genesis bodies for the one-big-creature plan, one that grows and one that holds the line.
- **Sudden canopy and Return to loam:** unused Genesis paintings. Canopy covers green's weakness to ranged attacks.
- **Emberward and the Salamander-hide mantle:** Fireproof from an enchantment and from equipment, alongside lighting spells and innate Fireproof. Both are cheap, so a fire deck pays a card and a little mana to keep a unit safe from its own all-units fire.
- **Neutral constructs (178–180) and the Ossuary engine:** the construct batch, mostly neutral as you said, with one Dominion construct.
- **Buckling recruit:** a neutral Armed unit, painted mid-buckle.
