# Card proposals: the gap-filling batch

Cards 1 to 30 were drafted on 2026-11-06 to fill the gaps in `CARD_AUDIT.md`. The creator approved all 30 as written on 2026-11-08, and they're in the game, tested only by bot simulations so far. Cards 31 onward, from the reference library, are still proposals. Numbers are small-scale and will move in playtesting.

The starter and campaign decks are unchanged, so cards 1 to 30 show up in the deck builder and in campaign rewards. Their art is in `art/ART_BRIEFS_SET4.md`. Flavour lines are next.

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

## Abilities for existing cards

Three of the four plain units costing 3 or more get an ability and keep their stats. Sellsword stays plain, moves to neutral and drops to 3 / 4.

| # | Card | Stats | New passive | Why | New code |
| --- | --- | --- | --- | --- | --- |
| 27 | Oath knight | 3 / 5 | Steadfast: +1 attack if she hasn't moved this turn | Fits "No one ordered her to stay" | Small |
| 28 | Sellsword | 3 / 4, down from 4 / 4 | None. Moves from Fervor to neutral, so it wants no lands and leaves the Warhorde | At your request. Fits "Every side owes him" | None |
| 29 | Orc warchief | 5 / 5 | Warband: adjacent allies get +1 attack | Stops Sunmane lancer outclassing it | Small |
| 30 | Hill giant | 5 / 8 | Stomp: its attacks also deal 1 to enemies next to the target | Stops Elder Herd bull outclassing it | Small |

## Cards from the reference library

Added on 2026-11-08. You voted on every reference sheet and chose these to become cards, then set their numbers and rules in discussion. Each one depicts the character or item from its accepted sheet. Art briefs are in `art/ART_BRIEFS_SET5.md`, and nothing has been generated yet.

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
| 42 | Stoneward colossus |  | Unit | 6 | 0 | 5 / 8 | Guard. Can't move and can't be pushed | Round 04 study 06 | Small |

Choices made in discussion:

- **Conclave field scholar:** drawing a card was too strong. Zap deals less than her normal attack of 2.
- **Harmonic wardwright:** Conclave examiner already has its own painting, so the wardwright gets his own cards. He's an attacker. Resonance works the same way as Hill giant's proposed Stomp. Brightlance shows him casting, with a moving blue-violet lance of light.
- **Woven ward:** raised from 2 to 3.
- **Rime drake:** blue.
- **Bronze-harness alderkin:** Genesis, with no ability. Reach was too far and Set spear was cut.
- **Banked flame blade:** the card is the blade. Equipment plays exactly like an enchantment under a different label, so it needs no new rules. You like the bearer, so he could get his own card later.
- **Enchanter's quench:** the card is the enchantment.
- **Stoneward colossus:** raised to 5 / 8. Whether it keeps "can't move" is still open.

This batch adds 6 Gnosis cards, 2 each to Genesis and Dominion, 1 to Fervor and 1 neutral, so the pool below would reach 94. Vigil gets none, and Fervor gets only the blade.

## What the pool looks like if all of it is approved

| Alignment | Cards now | Added | Total | Units by cost now | Units by cost after |
| --- | --- | --- | --- | --- | --- |
| Vigil (white) | 14 | 3 | 17 | 1: 3, 2: 1, 3: 2, 4: 1, 6: 2 | 1: 3, 2: 3, 3: 2, 4: 1, 5: 1, 6: 2 |
| Gnosis (blue) | 9 | 6 | 15 | 1: 1, 2: 2, 3: 2, 4: 1 | 1: 1, 2: 3, 3: 3, 4: 2, 5: 1, 6: 1 |
| Dominion (black) | 7 | 7 | 14 | 1: 1, 2: 1, 3: 2, 6: 1 | 1: 3, 2: 1, 3: 2, 4: 2, 5: 1, 6: 1 |
| Fervor (red) | 13 | 3, minus Sellsword | 15 | 1: 1, 2: 3, 3: 2, 4: 3, 5: 1, 7: 1 | 1: 1, 2: 4, 3: 1, 4: 3, 5: 1, 6: 1, 7: 1 |
| Genesis (green) | 10 | 5 | 15 | 2: 3, 3: 2, 5: 1 | 1: 1, 2: 3, 3: 3, 4: 1, 5: 1, 6: 1, 7: 1 |
| Neutral | 3 | 2, plus Sellsword | 6 | 2: 1 | 1: 1, 2: 1, 3: 1, 4: 1 |
| Total | 56 | 26 | 82 | | |

At 14 lands, a 40-card deck needs 26 non-lands, or at least 9 different cards at 3 copies each. Every alignment would clear that with cards to spare, so one-colour decks would have real choices.

These two changes opened small gaps: Dominion is back to one 2-cost unit, and Fervor has only one 3-cost unit.

## New mechanics to approve

Each of these appears on only one or two cards, so saying no to one touches little else.

| Mechanic | Card | Note |
| --- | --- | --- |
| Longshot, reach of 3 tiles | Brass siege-walker | Reaches most of a 4-row board |
| Skip a turn | Conclave examiner | Stronger than Binding glyph, but only lasts one turn |
| Swap places | Threshold adept | |
| Grows with your discard pile | Barrow colossus | |
| Destroy at instant speed | Called debt | Needs a damaged target, and costs life |
| Attack boost against one target | Hunted | Each attacker gets it, so it rewards ganging up |
| Permanent growth for an ally | Grove tender | |
| Effect when summoned | Goblin firepot, Scarred summoner | Already exists for land drops and life cost |
| Zap, a ranged ability weaker than the unit's attack | Conclave field scholar | |
| Splash damage on attack | Harmonic wardwright, Hill giant | Shared by Resonance and Stomp |
| Direct damage in Gnosis | Brightlance, Conclave field scholar | Direct damage has been a Fervor thing. Push keeps Brightlance feeling like the Conclave |
| Ignore the next set amount of damage | Woven ward | |
| Ignore Guard and damage reduction | Enchanter's quench | |
| Freeze, Binding glyph's rule for one turn | Rime drake | |
| Grows when your units die | Porcelain-visored retainer | The game's first "when a unit dies" trigger |
| Veiled, untargetable until it attacks | Veil adept | Strong at 4 attack. The 2 health keeps it fair |
| Equipment, a label for enchantments that are objects | Banked flame blade | No new rules |
| Can't move or be pushed | Stoneward colossus | |

## Questions

1. **Velunn names:** Ilvane and Orrowen are placeholders, in the style of Saint Maren and Vashkar. Rename or cut them freely. None of the new names has been checked against existing games or books.
2. **A vampire:** the Ashen Court envoy is a place for one, kept subtle and shown as a court official. Should it be one, or stay human?
3. **Stoneward colossus:** keep "can't move", or let it walk as a large neutral unit?
4. **The next cards:** Vigil and Fervor need the most. Candidates are a Fervor card using lightning, a card that keeps the Cinder-cant drummer's look, and two or three Vigil cards.
