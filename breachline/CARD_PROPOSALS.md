# Card proposals

Cards 1 to 30 were drafted on 2026-11-06 to fill the gaps in `CARD_AUDIT.md`. The creator approved all 30 as written on 2026-11-08, and they're in the game, tested only by bot simulations so far.

Cards 31 to 42, from the reference library, were made final on 2026-11-09 and are in the game, tested only by bot simulations so far. Cards 43 to 91 are approved designs that aren't built yet. Numbers that were cut in discussion are skipped: 45, 50, 57, 72, 74 and 76 to 81. The mechanics they use are described in `DESIGN_NOTES.md`. Numbers are small-scale and will move in playtesting.

The starter and campaign decks are unchanged, so cards 1 to 42 show up in the deck builder and in campaign rewards. Their art is in `art/ART_BRIEFS_SET4.md` and `art/ART_BRIEFS_SET5.md`. Flavour lines are next.

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
| 13 | Called debt | Ashen Court | Instant | 2 | 1 |  | On the enemy turn: lose 2 life and destroy a damaged enemy unit | First Dominion instant, destroying and paying | Small |
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

Added on 2026-11-09. This is the first batch for the tile-effects focus, chosen after the focus audit in `CARD_AUDIT.md`. The rules for tile effects are in `DESIGN_NOTES.md`. Numbers 45 and 50 were cut in discussion, so they're skipped here. No art briefs have been written yet.

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

Added on 2026-11-09, to give the other new mechanics in `DESIGN_NOTES.md` their first cards. Summoned units and added cards are conjured, and they're copies of existing cheap cards wherever possible, so players already know them and they already have art. New conjured cards (Spark, War-chant and Cursed coin) are described in the rules. No art briefs have been written yet.

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

## What's left to build

28 new cards and 10 changes to existing cards.

| Alignment | New cards |
| --- | --- |
| Vigil (white) | 7 |
| Gnosis (blue) | 4 |
| Dominion (black) | 5 |
| Fervor (red) | 8 |
| Genesis (green) | 4 |

Most need engine work first: tile effects and aimed spells, summoning and conjured cards, Loyal, Ambush, Flanking, and death triggers other than Sworn. Holding ground is built.

## Smaller mechanics to approve

The main new mechanics are approved in `DESIGN_NOTES.md`. These smaller ones each appear on only one or two proposed cards, so saying no to one touches little else.

| Mechanic | Card | Note |
| --- | --- | --- |
| A card that hurts the player holding it | Tithe-keeper's Cursed coin | The first card put into the enemy's hand |

## Questions

1. **Velunn names:** Ilvane and Orrowen are placeholders, in the style of Saint Maren and Vashkar. Rename or cut them freely. None of the new names has been checked against existing games or books.
2. **A vampire:** the Ashen Court envoy is a place for one, kept subtle and shown as a court official. Should it be one, or stay human?
3. **Muster the levy:** with Loyal on Militia spearman, it summons two 3 / 3s for 3 mana. Raise it to 4?
4. **Art and flavour:** cards 43 onward have no art briefs or flavour lines yet.
