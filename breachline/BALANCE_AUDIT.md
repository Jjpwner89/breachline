# Balance audit, 2026-11-11

Run after the Frenzy, Brass chorister and Walking sapling changes. All numbers come from the scripted bot playing both sides on the 6 by 5 board. The bot is weaker with spells and situational cards than a person or Claude, so treat those cards' numbers as a floor.

## Update, later the same day

The creator made the Sunmane lancer 4 / 5 and the Young summoner's Camp follower a one-off when it's summoned. Both audits were run again on the new cards: 150,000 random-deck games and 13,500 fixed-deck games.

| Card | Lift before | Lift now |
| --- | --- | --- |
| Sunmane lancer | +13.5 | +8.7 |
| Young summoner | +11.1 | +3.1 |

The strongest cards now are Ilvane (+17.0), Brass siege-walker (+11.0), Hill giant (+10.4), Elder dragon (+9.5), Harmonic wardwright (+8.8) and the lancer (+8.7). The weakest is still Vow of keeping (-6.9).

Hour of collection was reworked into an immediate sweeper of enemy units with 3 or less health. On 2026-11-13 it lifts its games by +2.4 ± 1.1 over 3,000 paired games, at the top of the Rare band, and is played in 60% of the games it's drawn in. It does best against blue and red and nothing against white.

Deck win rates moved from a range of 40% to 56% to a range of 38% to 56%. Oath of the Sunmane fell from 56% to 53%. The armed road fell from 43% to 38%, since the lancer was the only card carrying it, and it's now the weakest deck. Hearth and vow (56%) and The barrow feast (56%) lead.

## Land count experiment

Every starter and theme deck was moved to 11 lands, then to 12, and all 15 played each other again (13,500 games each). Nothing in the game was changed.

The extra lands replaced each deck's cheapest cards in one run and its lowest-lift cards in another. Another run left the two low-curve decks, The armed road and The long throw, at 10 lands. The three ways of choosing gave almost the same results.

| | 10 lands (today) | 11 lands | 12 lands |
| --- | --- | --- | --- |
| Mana screw: 2 or fewer lands at the start of your 5th turn | 21% | 15% | 10% |
| Flood: at your 8th turn, 3 lands in hand or nothing else to play | 4% | 6 to 7% | 9 to 11% |
| 7-mana cards played when drawn | 54% | 59 to 61% | 70 to 73% |
| 5- and 6-mana cards played when drawn | 80% | 86 to 87% | 91 to 92% |
| Turns per player | 12.8 | 13.0 | 13.1 |
| The first to hit the summoner wins | 70% | 69 to 70% | 69 to 70% |
| The winner was behind at some point | 37% | 37% | 34 to 38% |
| Spread of deck win rates (standard deviation) | 5.0 | 6.8 to 6.9 | 7.3 to 8.1 |
| Weakest and strongest deck | 38% to 56% | 31 to 35% to 57 to 59% | 30 to 32% to 58% |

What it means:

1. **More lands make games smoother, not longer.** Screw falls by a quarter at 11 lands and by half at 12, and the big cards get cast. Games last the same number of turns, and the first hit matters as much as before.
2. **The gain each deck saw alone mostly disappears when every deck changes.** Alone, one deck with 2 more lands gained 7 points on average. That came largely from beating opponents that stumbled on mana.
3. **Aggressive decks lose.** The armed road and The long throw drop 3 to 9 points, and they drop as much when they keep 10 lands themselves. Their edge was opponents who missed land drops. Raising lands widens the gap between decks unless those two get help.
4. **12 lands floods too often.** One player in ten is flooded by turn 8, and the gain over 11 against screw is small for that cost.

Recommendation: 11 lands for the midrange and big decks, with The armed road and The long throw strengthened in the same change rather than given more lands.

## How it was measured

- **Fixed decks:** all 15 starter and theme decks against each other, 13,500 games.
- **Random decks:** 150,000 games between random one-colour decks, 11 lands and 19 cards each. Every card appears in at least 11,600 decks. A card's **lift** is the win rate of decks holding it minus the average for its colour, so it measures the card rather than the deck it happens to be in.
- **Best decks:** eight hill-climbs, each starting from an existing deck. A climb tries one card swap at a time and keeps it only if the deck then beats the 15 decks more often on the same fresh games. 300 tries each, then a final check on 600 new games.

## The main findings

1. **Young summoner is the strongest card in the game for its cost.** It's an uncommon 2-mana neutral 1 / 3 whose ability summons a Camp follower every turn. Six of the eight best decks found run it, five of them three copies. Taking it out of a best deck costs 4 to 16 points, 9 on average. In random decks it lifts wins by 11 points.
2. **Every deck runs too few lands.** All 15 decks have 10 lands, except Rootfed herd with 11. Swapping the two cheapest spells for lands raised every deck, by 7 points on average and up to 12. The best decks found settled on 11 to 13.
3. **Big units decide games, and most spells don't.** In random decks, units lift wins by 1.6 points on average while spells, enchantments, instants and relics drag them down by 2 to 3. By cost, 5-mana units lift the most (6.7), and 1- and 2-mana units slightly lower wins. The cost curve of 2.5 stat points per mana undervalues big bodies, or cheap units are too weak.
4. **The existing decks are a long way from their best.** Every climb rose from about 50% to between 72% and 86% against the 15 decks. In a round robin the eight best decks are fairly even with each other, 66% to 77%, and come from every colour, so no colour dominates once the decks are tuned.
5. **Blue is the weakest colour and green the strongest.** In random one-colour decks: green 58.5%, black 56.4%, red 50.2%, white 48.2%, blue 36.6%.
6. **The first hit still matters most.** Whoever hits the summoner first wins 71% of decided games. The eventual winner was behind on life at some point in 36% of games, and behind by 5 or more in 12%.

## Decks that stand out today

| Deck | Win rate | Why |
| --- | --- | --- |
| Oath of the Sunmane | 56.2% | Sunmane lancer, Saint Maren, Pride warden and Pride matriarch each lift its games by 10 to 11 points |
| Hearth and vow | 55.3% | Saint Maren and Pride matriarch, lifting by 14 and 13 points |
| The barrow feast | 54.3% | No single card; Hostess of the late hour and Barrow colossus lead |
| Winter glyphs | 46.0% | Fine when its 4- and 5-mana units land; its spells are weak |
| The armed road | 42.6% | Only the Sunmane lancer pulls weight; Oath bell and the 1-mana units drag it down |
| The long throw | 40.2% | No card helps it much. It loses to green, red and the Thornwardens |

## Cards too strong for their cost or rarity

Lift is from the random-deck run.

| Card | Rarity, cost | Lift | Note |
| --- | --- | --- | --- |
| Ilvane, Who Asks Twice | Legendary, 6 | +16.5 | The strongest card overall. Expected for a legendary, but well clear of the others |
| Sunmane lancer | Rare, 4 | +13.5 | 5 / 6 with Swift and Lance through is 11 stat points plus two abilities on a 4-mana budget of 10. Taking it out of a best deck costs 6 to 9 points |
| Young summoner | Uncommon, 2 | +11.1 | A new unit every turn. See finding 1 |
| Brass siege-walker | Rare, 5 | +10.7 | Longshot keeps it out of reach. It's now in two blue decks |
| Hill giant | Rare, 5 | +10.3 | 5 / 8 with Stomp is 13 points on a budget of 12.5 |
| Waystone golem | Uncommon, 5 | +8.0 | A neutral 5 / 7 with no text. Neutral cards are meant to be weaker; five of the eight best decks run it |
| Scarred summoner | Rare, 4 | +5.7 | A neutral 3 / 5 that draws a card. Three best decks run it |

**Commons playing above their rarity:** Cloistered scholar (+7.6), Muster the levy (+7.0), Orc warchief (+6.8), Lantern arcanist (+6.8), Walking sapling (+5.1), Oath knight (+4.9), Bronze-harness alderkin (+4.4) and Brass chorister (+4.2). Scholar, arcanist and chorister are blue, the weakest colour, so moving them up a rarity suits better than weakening them.

## Cards too weak for their rarity

| Card | Rarity, cost | Lift |
| --- | --- | --- |
| Vow of keeping | Rare, 2 | -7.2, the weakest card in the game |
| Sanctuary threshold | Rare, 2 | -5.0 |
| Folded observatory | Legendary, 3 | -4.6 |
| Oath bell | Rare, 3 | -4.5 |
| Cinder rain | Rare, 4 | -4.0 |
| Wildfire | Rare, 6 | -2.6 |
| Borrowed will | Rare, 4 | -2.5 |

The weakest cards of any rarity are mostly cheap enchantments, relics and spells: Dawnsail passage (-6.6), Warband drum (-5.5), Sifting the shallows (-5.4), Emberward (-5.3), Unmake the pattern (-5.1), Grave soil (-5.0) and Held between moments (-4.8).

## Cards rarely played when drawn

The share of games a card was played in, out of games it was drawn in. Most cards are played over 85% of the time. These need a narrow situation, or the bot doesn't see when to use them.

| Card | Played when drawn |
| --- | --- |
| Sudden canopy | 21% |
| Humbling light | 39% |
| Called debt | 43% |
| Return to loam | 43% |
| Mending the sail | 44% |
| Raincup at first light | 48% |
| Wildfire | 51% |
| The Mountain's Lung | 52% |
| Shatter the chain | 52% |
| Dawnsails over the harvest | 53% |

The 7-mana units (Elder dragon, Herd mother, Alderkin elder, Orrowen) are played about 65% of the time, simply because games often end before 7 mana. That is another sign decks want more lands.

## The best decks found

Win rate against the 15 existing decks, before and after the climb.

| Started from | Before | After | Key cards it settled on |
| --- | --- | --- | --- |
| Oath of the Sunmane | 57% | 86% | 13 lands, 2 Young summoner, 2 Sunmane lancer, 3 Waystone golem, 2 Saint Maren |
| The court's favour | 49% | 86% | 12 lands, 3 Young summoner, 2 Waystone golem, 2 Hostess of the late hour, Bought allegiance |
| Rootfed herd | 59% | 81% | 13 lands, 3 Young summoner, 3 Mossback bear, Herd mother, Orrowen, Alderkin elder |
| Hearth and vow | 52% | 81% | 12 lands, 3 Young summoner, 2 Scarred summoner, 2 Pride matriarch, Sunmane lancer |
| The Warhorde | 52% | 79% | Turned red and blue. 3 Young summoner, 2 Waystone golem, 2 Orc warchief, Elder dragon |
| The Lantern Conclave | 52% | 78% | 13 lands, 3 Harmonic wardwright, 2 Sunmane lancer, Ilvane |
| The Elder Herd | 53% | 77% | 13 lands, 2 Young summoner, 2 Slagheart hulk, Alderkin elder |
| The Ashen Court | 50% | 72% | Turned black and red. 3 Barrow colossus, Elder dragon |

The full lists are in the simulation output, not in the game.

## Suggested fixes, in order

1. **Young summoner:** make the Camp follower a one-off when it's summoned, or limit the ability to once every other turn. Done: a one-off.
2. **Lands:** move the starter and theme decks to 11 or 12 lands, cutting their weakest cheap cards. See the land count experiment above: 11, with help for the aggressive decks.
3. **Sunmane lancer:** 4 / 5, or keep 5 / 6 at 5 mana. Done: 4 / 5.
4. **Waystone golem:** 4 / 6, so the neutral stays below coloured units.
5. **Rarity:** move the strong commons up to uncommon, and the weak rares and the Folded observatory down, or strengthen them.
6. **Weak cheap spells and enchantments:** a strengthening pass, starting with Vow of keeping and Dawnsail passage.
7. **Blue:** look again once the above is done, since several of its strongest cards are commons.
