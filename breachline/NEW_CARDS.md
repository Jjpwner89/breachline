# New card proposals

All of these cards are in the prototype as of 2026-11-05, and the numbers will change after playtesting. Each deck now has 24 cards, 8 of them lands. Lines are the ones saved in `FLAVOUR.md`, and they are on the cards as of 2026-11-05.

Stats are attack / health, after the small-number audit in `CARD_AUDIT.md`. "Wants" is how many lands of the card's colour it wants; each missing land adds 1 to the cost.

Flying now also means moving 2 tiles, because a 1-tile flier couldn't actually cross over anything. The Elder dragon no longer needs Swift as a result.

## New keywords

| Keyword | Meaning |
| --- | --- |
| Stand together | +1 attack while next to an ally |
| Guard | Adjacent allies take 1 less damage from attacks |
| Frenzy | +2 attack on its first attack |
| Decoy | Adjacent enemies must attack this first; it's removed after one hit |
| Drain | Heals this unit for the damage it deals |
| Overrun | Damage beyond what kills a target hits the enemy behind it |
| Grows | +1 / +2 at the start of your turn, up to three times |
| Regrow | Recovers 1 health at the start of your turn |

## Vigil (white)

| Card | Type | Cost | Wants | Stats | Rules | Line |
| --- | --- | --- | --- | --- | --- | --- |
| Water carrier | Unit | 1 | 1 | 1 / 2 | Ability: heal an adjacent ally for 1 | The wounded remember who brought the water. |
| Pride cub | Unit | 1 | 1 | 1 / 2 | Stand together | Every cub learns to roar before learning why. |
| Oath sentinel | Unit | 3 | 1 | 2 / 6 | Guard | |
| Saint Maren of the Long Watch | Unit, Velunn | 6 | 3 | 4 / 12 | Ability: heal all adjacent allies for 2 | |

## Fervor (red)

| Card | Type | Cost | Wants | Stats | Rules | Line |
| --- | --- | --- | --- | --- | --- | --- |
| Cinder Clan raiders | Unit | 2 | 1 | 3 / 2 | Swift | Last one over the wall buys the drinks. |
| Cinder berserker | Unit | 3 | 1 | 4 / 3 | Frenzy | Nobody has ever told her to stop twice. |
| Mercenary captain | Unit | 4 | 2 | 4 / 5 | Ability: an adjacent ally that already moved can move again | We chose him at dawn. We can choose again by dusk. |
| Ember drake | Unit | 4 | 2 | 4 / 3 | Flying | |

## Gnosis (blue)

| Card | Type | Cost | Wants | Stats | Rules | Line |
| --- | --- | --- | --- | --- | --- | --- |
| Cloistered scholar | Unit | 2 | 1 | 1 / 2 | Instead of moving or attacking: draw a card | She asked for one more candle. That was in the spring. |
| Illusory decoy | Unit | 1 | 1 | 0 / 1 | Decoy | Your aim was perfect. |
| Lantern arcanist | Unit | 3 | 1 | 3 / 3 | Ranged | |
| Brass chorister | Unit, construct | 4 | 2 | 3 / 7 | Ability: push an adjacent enemy 1 tile | |
| Displacement | Instant | 2 | 1 | | When your unit is attacked: move it 1 tile, and the attack misses | |
| Binding glyph | Enchantment | 2 | 1 | | Enchant an enemy unit: it can't move | |

## Dominion (black)

| Card | Type | Cost | Wants | Stats | Rules | Line |
| --- | --- | --- | --- | --- | --- | --- |
| Gravebound thrall | Unit | 1 | 1 | 2 / 2 | | |
| Bone harvester | Unit | 2 | 1 | 2 / 3 | Ability: destroy an adjacent ally; this unit gets +3 attack | |
| Ashen Court noble | Unit | 3 | 1 | 3 / 4 | Drain | She has never raised her voice. No one has needed her to. |
| Vashkar, Who Counts the Dead | Unit, Velunn | 6 | 3 | 7 / 9 | Drain. When summoned, you lose 2 life | |
| Raise the dead | Spell (new type) | 3 | 1 | | Return a unit costing 3 or less from your discard pile to your back row. It lands on the free tile nearest the centre and waits a turn | Get up. You're still useful. |
| Death warrant | Enchantment | 5 | 2 | | Enchant an enemy unit: destroy it at the end of your next turn | |

## Genesis (green)

| Card | Type | Cost | Wants | Stats | Rules | Line |
| --- | --- | --- | --- | --- | --- | --- |
| Walking sapling | Unit | 2 | 1 | 1 / 3 | Grows | |
| Thornwarden saboteur | Unit | 2 | 1 | 2 / 3 | Regrow | |
| Great owl | Unit | 3 | 1 | 2 / 3 | Flying. Goes against Genesis's tendency, so it costs 1 extra | |
| Wayfinder druid | Unit | 3 | 1 | 2 / 4 | When summoned: you may play an extra land this turn | |
| Elder Herd bull | Unit | 5 | 2 | 6 / 9 | Overrun | The herd doesn't go around. |
| Shifting forest | Instant | 1 | 1 | | At the end of the enemy turn: push an enemy unit 1 tile back toward its side | The path was here yesterday. |

## Neutral

| Card | Type | Cost | Wants | Stats | Rules | Line |
| --- | --- | --- | --- | --- | --- | --- |
| Young summoner | Unit | 2 | 0 | 2 / 3 | | She has worn long sleeves since she was nine. |

## Cards made from concept art

These use paintings from `art/concepts/`, which remain concept pieces and don't add to the setting's canon.

| Card | Art | Alignment | Type | Cost | Wants | Stats | Rules |
| --- | --- | --- | --- | --- | --- | --- | --- |
| The Still Flame | `the-still-flame.png` | Vigil | Enchantment | 2 | 1 | | Enchant one of your units: it recovers 2 health at the start of your turn |
| Ambrel lampwright | `light-without-an-answer.png` | Gnosis | Unit | 3 | 1 | 2 / 4 | Ability: an adjacent ally can attack up to 2 tiles away this turn |
| Across the silence | `across-the-silence.png` | Neutral | Spell | 4 | 0 | | Draw two cards |

## Second concept art batch

These cards use paintings from `art/concepts/`, and they're in the prototype as of 2026-11-05. They have no flavour text yet. Using a painting on a card doesn't add its creature to the setting's canon. The numbers are untested beyond bot simulations.

| Card | Art | Alignment | Type | Cost | Wants | Stats | Rules | Starter deck |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Winter shelter | `alderkin-winter-shelter.png` | Vigil | Enchantment | 2 | 1 | | Enchant one of your units: it takes 2 less damage from attacks. Doesn't stack with itself | Oath of the Sunmane |
| Dawnsails over the harvest | `dawnsails-over-the-harvest.png` | Vigil | Spell | 1 | 1 | | You may play an extra land this turn | Oath of the Sunmane |
| Mending the sail | `spindlejack-mending-the-sail.png` | Gnosis | Spell | 2 | 1 | | Heal one of your units 2 | The Lantern Conclave |
| Dawnsail passage | `dawnsail-passage.png` | Neutral | Spell | 3 | 0 | | Move one of your units to any free tile. It can't attack this turn. A unit under Binding glyph can't be moved | The Warhorde |
| Coalback forager | `coalback-forager.png` | Fervor | Unit | 2 | 1 | 1 / 3 | Instead of moving or attacking: you have 1 extra mana next turn | The Warhorde |
| Slateprowler | `slateprowler-on-the-descent.png` | Dominion | Unit | 3 | 1 | 3 / 3 | Hunt: +2 attack against a damaged unit | The Ashen Court |
| Through the marble | `overgrown-ruin-vignette.png` | Genesis | Enchantment | 3 | 1 | | Enchant one of your units: +1 attack and +2 health at the start of your turn, up to three times | None yet |
| Raincup at first light | `raincup-at-first-light.png` | Genesis | Spell | 1 | 1 | | Remove all enchantments from a unit | None yet |
| Clearing the channel | `alderkin-waterkeeper.png` | Genesis | Spell | 4 | 2 | | Each of your units permanently gets +2 health | None yet |
| Reedcrown grazer | `reedcrown-grazer.png` | Genesis | Unit | 2 | 1 | 1 / 4 | Instead of moving or attacking: draw a card, then put a card on the bottom of your deck | None yet |

To make room, the starter decks lost Militia spearman and Pride cub (Sunmane), Goblin cutter and Sellsword (Warhorde), one Illusory decoy (Conclave) and one Ashen Court noble (Ashen Court).

Set aside until a painting suits it: Sifting the shallows (Gnosis spell, cost 1, wants 1: draw a card, then put a card from your hand on the bottom of your deck). Hunted, also set aside here at first, is now in `CARD_PROPOSALS.md`.

Left out on purpose: `opaline-window-mender.png` (the Opaline Kin are excluded from the lore), `stonehorn-bridgekeeper.png` (the least liked design, still developing) and `tidevault-at-the-old-harbour.png` (the creature is painted too large).

## New lands

| Land | Alignment | Line |
| --- | --- | --- |
| Ashen barrows | Dominion | |
| Overgrown ruin | Genesis | Something green is growing through the throne room floor. |

## Open questions

1. Should Withering hex move from Fervor to Dominion? Its curse and its line about losing hope fit Dominion better.
2. Is a new play-phase spell type acceptable for Raise the dead, or should it be redesigned as a unit ability?
3. Are the Velunn names Saint Maren and Vashkar right?
