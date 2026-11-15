# Claude playtests

Sonnet testers play one deck against the lookahead bot through `tools/playtest/play.sh`. After each game, the tester is asked what they think of the deck and to judge the out-of-band cards they saw. Out-of-band means outside the band in the latest bot audit, and the tester isn't told which way the audit points. The creator thinks Claude is especially well placed to judge spells, so the spell reads carry the most weight here.

Many out-of-band cards only work through a mechanic, so they add value to a theme deck rather than on their own. Some are fodder, not meant to be a body at all. Testers name each card's role (stands alone, enabler or fodder) and judge it in that role. Each game is one sample: read these as impressions beside the bot numbers, not as verdicts.

## 2026-11-15: deck series, cards as of the voting-page changes

Eight games, one per matchup, played before the Exhumation and blue starter buffs. Out-of-band cards and lifts come from the 2026-11-14 audit (flankPack, 200,000 games).

Bad luck with the seeds: six of the eight testers were dealt a one-land opening hand. Over 1,000 seeds, opening land counts match the expected spread, so this was chance, not a bug. Several bots also stalled on lands, which made some wins easy. Next time, pick seeds whose opening hands hold 2 to 4 lands.

| Game | Tester's deck | Bot's deck | Result |
|---|---|---|---|
| pt1 | Blue starter | Sun and cinder | Stopped at turn 30, behind 5 life to 15 |
| pt2 | Blue starter | Red starter | Won turn 23, untouched; the bot sat on 1 land until turn 8 |
| pt3 | The barrow feast | Blue starter | Lost turn 29; the tester was stuck on 3 lands |
| pt4 | Sun and cinder | Giants' road | Stopped at turn 30, ahead 15 to 11 |
| pt5 | First blood | Hearth and vow | Stopped at turn 30, ahead 13 to 11, bot board wiped |
| pt6 | Over the wall | The Thornwardens | Won turn 21 at 15 life; the bot was slow to develop |
| pt7 | The long throw | The barrow feast | Won turn 14 at 15 life; the bot was stuck on 2 lands |
| pt8 | The Thornwardens | First blood | Won turn 27 at 15 life |

### The decks

- **Blue starter (pt1, pt2).**
  - Both testers liked the plan: shoot from outside strike-back range, then finish with cheap bodies.
  - Against fast melee it was simple and fun; one tester thought a new player would enjoy it. Against Sun and cinder it was "fragile and slow": every ranged unit is 2 / 3, burn killed seven of them, and 2-damage chip can't kill 5-health tanks.
  - Strong: Brass siege-walker and Lantern arcanist. Dead in hand: Conclave examiner, Cloistered scholar and Brass chorister. Ambrel lampwright rated 1 and 2, but the bot used it well against pt3.
  - Both reads support a fix that adds bigger damage, not more bodies.
- **The barrow feast (pt3).**
  - The plan felt clunky: small, fragile pieces, and payoffs at 5 mana.
  - Gravecaller was a good engine.
  - The tester noticed the list has no Reap or return-from-discard cards. Exhumation and the other Set 16 black cards are in the Gravebound pool but not in this theme deck.
  - The tester wanted to cut Barrow tender. It is an enabler that's meant to die beside Carrion units, so that isn't a reason to change it.
- **Sun and cinder (pt4).**
  - Powerful, but through cheap first strikes, not its front line: the Cinder berserker's 6-damage opener, Stormstrike and the Sunmane lancer killed every big unit without a strike-back. The tester said it "mostly" plays itself.
  - The Oath sentinel and the Oath knight never mattered; the tester suggested a buff, not a cut (sentinel +1 attack, a stronger Holding ground).
- **First blood (pt5).**
  - It wins on the board: Warband and Frenzy trade up early, and Venom kills the grown Devotion units.
  - Court assassin was the best card and the only clean answer to a 4 / 6 Devotion unit.
  - The 2-health bodies (Goblin cutter, drummer, rabble-rouser) die to everything a healing deck has.
- **Over the wall (pt6).**
  - Every turn had a real choice about where to put each unit, and the Ember drakes were the stars.
  - Nearly every unit has 2 health, so thorns and 1-damage spells kill them before they act.
  - The Elder dragon (7 mana) was never reached; the tester suggested a cheaper evasive card in its place.
- **The long throw (pt7).**
  - Cheap red aggro that felt good and easy to sequence.
  - The unit-only Firebolt sat dead in hand against 3-health bodies.
  - Summoner burn finished the game but never had to close it alone.
- **The Thornwardens (pt8).**
  - Won on efficient bodies (Walking saplings, Vaultstalker). Thorns acted as removal once.
  - Holding ground never changed a decision here. With the Oath knight in pt4, that makes two games where it did nothing.

### Out-of-band cards

Bands: common −1.5 to +0.5, uncommon −1 to +1, rare −0.5 to +2. Every card here is below its band in the bot audit.

| Card | Type, rarity | Bot lift | Role | Playtests | Reading |
|---|---|---|---|---|---|
| Cinder-cant drummer | R unit, u | −3.7 | Enabler | Seen in 3 games: about right, or slightly strong ×2 | The clearest case of the bot understating a card. Its War-chant adds 4–5 damage to a summoner hit and sets up kills with no strike-back. |
| Water carrier | W unit, c | −2.7 | Enabler | Seen once: about right | It feeds Devotion; dying is its job. |
| Reedbank forager | G unit, c | −2.6 | Enabler | Seen once: about right | Its extra land never mattered in that game. |
| Vigil-keeper | W unit, c | −2.5 | Fodder | Seen ×3: too weak | Died to one hit each time and gained about 3 life in all. The only card all the reads call weak. |
| Lantern apprentice | U unit, c | −2.3 | Stands alone | Seen in 3 games: about right ×3, slightly strong ×2 | The free Spark finished several kills. The bot understates it. |
| Consecrated ground | W spell, u | −2.1 | Stands alone | Cast once: about right, but slow and easy to walk around | Needs healers in the zone. The tester blamed the bot's use of it, not the card. |
| Firebolt | R instant, c | −1.8 | Stands alone | Seen in 3 games: about right ×2, slightly weak ×1 | Good against 2-health decks, dead against 3-health bodies. |
| Prism bracer | U enchantment, u | −1.7 | Enabler | Cast twice: slightly weak, and slightly strong | On a Longshot siege-walker it gives range 4 and "an unanswerable removal engine for 2 mana". On anything else it is modest, and burn on the carrier loses both cards. |
| White morning | U spell, c | −1.6 | Stands alone | Cast once: too strong; judged from text twice: too weak, about right | Cast into a full back row, it froze 4 units and lost the tester two of them. A spell the bot can't aim well, and a human could. |
| Cinder Clan raiders | R unit, c | −1.6 | Stands alone | Seen ×3: slightly weak, about right ×2 | Dies before attacking against ranged decks and thorns. One tester suggested 3 health. |
| Banked flame blade | R enchantment, c | −1.6 | Enabler | Seen once: slightly weak | The carrier died before acting. |
| Still Flame acolyte | W unit, c | −1.6 | Fodder | Seen once: about right to slightly strong | 2 / 4 Loyal for 2 killed the drummer. |
| Gravecaller | B unit, u | −1.4 | Enabler | Played once: about right | Made 3 thralls and kept the board going. |
| Copperlane torch-runner | R unit, u | −1.3 | Stands alone | Seen ×2: slightly weak | A 2 / 2 Swift whose burn trail never mattered. |
| Court assassin | B unit, u | −1.2 | Stands alone | Seen ×2: about right, best card in pt5 | Strong when it gets to strike from Ambush. The bot walks it in from its back row and loses it. |
| Wayfinder druid | G unit, u | −1.2 | Enabler | Seen once, late: about right | An extra land at 8 lands is dead. |
| Cinderfall | R spell, r | −0.6 | Stands alone | Cast once: slightly weak; judged from text twice: about right to strong | Cast on Herd mother, it dealt 3 for 4 mana, Stormstrike's damage for one more mana. The burning tile did nothing because she walked off it. Suggestion: cost 3. |

### Spells

- **Best:**
  - Stormstrike (pt1 and pt4): cheap, 3 damage that sets up a finisher, and it killed two arcanists in one cast.
  - War-chant (pt5, pt6, pt8): free tempo and real reach.
  - Thornbrake (pt6, pt8).
  - The sky falls in (pt7).
  - Spark (pt2).
- **Worst:**
  - The Mountain's Lung: the bot cast it with 1 card in hand and wasted the mana.
  - Hurled brand: 3 mana for 2 to the face.
  - Rimebolt against 5-health tanks. It is set-up removal, not a finisher.
  - Binding glyph: dead against a lone unit (pt2), but the best defensive answer in pt1.

### Rules and harness confusion

- Redrawing an opening hand puts a card on the bottom. Four testers said RULES.md doesn't say this.
- Thorns damage units standing on them at the end of the turn, which surprised two testers. Thorns also hurt your own units.
- Moving a Charge unit even one tile spends its Charge.
- Identical moves are listed separately: two Firebolts, ten "cast Seedfall", three "summon rabble-rouser". `do` then refuses or fires the wrong one.
- The tiles "cha" and "bur" are cryptic. Thornbrake's aim anchor is the top-left tile, which the harness doesn't say.
- Attack lines already include Frenzy's bonus, which looked like a stat mismatch.

### What followed

- **Blue starter:** two Second working (3 damage to an enemy unit, cheaper after another spell) replaced the two Riverfolk specimen-keepers. Its win rate against the other 21 decks went from 43.3% to 46.2% (± 2.7, 1,400 games each).
- **Exhumation:** cut from 3 mana to 2. Lift −1.1 ± 2.0, at the bottom edge of the uncommon band. It is an enabler: two copies in place of Barrow rats lift The barrow feast from 43.1% to 44.8% (± 2.7). They went into that list the same day.

## 2026-11-15: card series, test cards in the starters

Fifteen games. Each put the cards on test into the starter of their colour, three copies in place of cards of about the same cost, with one test card in the opening hand. Where the starter had nothing at that cost, the nearest cost went out: Sent home (1) for 2-mana cards, Veilwing (6) for the 5-mana siege-walkers, Gathered host (6) for a 5 and a 4. The briefs asked for each card's role, a rating and a change, plus the game's worst moments and the testers' top improvements. The d09 and d13 briefs let slip which way the bot test points for Mourning veil, Hunted and The stone opens. d08 was lost to land screw by turn 12 and rerun as d08b.

Testers redrew any hand with fewer than 2 lands this time. The bot doesn't: it keeps any hand with at least one land (see below), which explains most of its stalls in both batches.

| Game | Starter and cards on test | Bot | Result |
|---|---|---|---|
| d01 | White: Oath veteran, Held spears | Blue | Lost turn 21 (flooded) |
| d02 | White: Still Flame duelist, The Still Flame | First blood | Stopped at turn 30, ahead |
| d03 | Blue: Frost latch, Sent home | Red | Won turn 28 at 15 life |
| d04 | Blue: Veilwing, Held between moments, Counted words | Sun and cinder | Stopped at turn 30, behind 9 to 15 (2 lands until turn 13) |
| d05 | Blue: White morning, Prism bracer | Green | Lost turn 25 (flooded) |
| d06 | Black: Writ of seizure, Confiscator | Blue | Stopped at turn 30, 13 to 15 (both short of lands) |
| d07 | Black: Gathered host, Ashborn gleaner | White | Stopped at turn 30, ahead on board |
| d08b | Black: Pit digger, Exhumation, Bone-picker | Red | Won turn 26 at 9 life |
| d09 | Black: Mourning veil, Hunted | Green | Won turn 18 at 15 life |
| d10 | Red: Rising squall, Thrown boulder | Blue | Won turn 20 (bot stuck on 2 lands) |
| d11 | Red: Streak raider, Pack-hunter, Cinderfall | Hearth and vow | Lost turn 28 (flooded) |
| d12 | Green: Gravelmouth, Salt-flat migrant | Black | Stopped at turn 30, ahead 12 to 7 |
| d13 | Green: Ploughback, Foldstride, The stone opens | Carrion | Won turn 15 at 15 life (bot stuck on 2 lands) |
| d14 | White: Hired shieldman, Hired company, Caravan guard | Red | Won turn 20 at 15 life |

### The cards

Bot lift is from the 2026-11-15 recheck where one exists. "Not drawn" means no reading: with three copies in 40 cards and about 15 cards seen, a tester misses every copy about a quarter of the time.

| Card | Role | Bot lift | Playtest | Reading |
|---|---|---|---|---|
| Hired shieldman (N rare, 3) | Stands alone | — | Played ×3: **5/5, too strong** | A 4/4 for 3 killed every red 2- and 3-drop without dying, and the upkeep never pinched. Suggested: cost 4, or Hired 2. One game, but the clearest call in the batch. |
| Counted words (U stratagem, c) | Enabler | — | Set ×3, sprang ×3: 5/5, about right to slightly strong | Drew 6 cards for 3 mana against Sun and cinder. Untested against a deck with few spells. |
| Frost latch (U stratagem, u) | Stands alone | — | Set ×2: 4/5, about right, slightly strong | Killed a 4-mana warchief as it landed; the bot summons into it. Dead against an empty hand. |
| Exhumation (B spell, u, now 2) | Enabler | −1.1 | Cast once with 3 units in the discard: 4/5, about right at 2 | A clean 2-for-1, held six turns for it. Weak early, strong after trades, as expected. |
| Pit digger (B unit, u) | Enabler | −0.2 | Played ×2: 4/5, about right | "Any card" is the better design: it fetched a Retainer, and best of all an Exhumation. |
| Salt-flat migrant (G unit, u) | Stands alone | — | Empowered once: 4/5, about right | A good late mana sink, not oppressive. |
| Gravebound bone-picker (B unit, c) | Enabler | −0.9 | Played once: 3/5, slightly weak | Loops with Exhumation, but the black starter has almost no other spells, so it is often a plain 2/3. Suggested: also return enchantments, or 2/4. |
| Held between moments (U spell, u) | Stands alone | −0.1 | Cast ×3: 3/5, about right | A plain 2 damage most of the time; the lock rarely mattered. Suggested: 3 damage, or "can't strike back". |
| Cinderfall (R spell, r) | Stands alone | −0.6 | Cast ×3: 3/5, about right, slightly weak | Killed a 3/3 and a 2/3; healing erased its hit on a 4/6. The 1 splash and the burning tile rarely mattered. Second batch in a row to call it slightly weak at 4. Suggested: 2 to adjacent enemies, or cost 3 (pt4). |
| Gathered host (B unit, r) | Stands alone | — | Played ×3, Offering once: 3/5, about right | Offering is only a choice when you are mana-short, and late it adds 6–8 noise lines to the move list. Suggested: Offering also gives +1/+1. |
| Gravelmouth (G unit, r) | Stands alone | +0.8 | Played once at X=2: 3/5, about right | Never cast at X=0. |
| Ploughback (G unit, c) | Stands alone | — | Played once: 3/5, about right | Grew on the 5th land as intended. Suggested: 4 lands, or a step at 4. |
| Orc pack-hunter (R unit, c) | Stands alone | — | Played once: 3/5, about right | A fine plain common. |
| Mourning veil (B equipment, u) | Stands alone | +2.3 | Played once: 3/5, about right | Its carrier attacked freely for two turns and was never touched. Thin: the bot barely attacked. The tester would watch it on a Vashkar. |
| Held spears (W stratagem, c) | Stands alone | — | Set once: 3/5, about right | A clean 1-for-1 on a conjurer; the bot held back while it was set. Suggested: a rider, such as "can't attack again this turn". |
| Still Flame duelist (W unit, u) | Stands alone | +1.2 | Played ×2: 3/5, slightly weak | Drain barely fired, because the bot wouldn't attack into it. Best with Roadwarden's shield. Suggested: 3/4. |
| Prism bracer (U equipment, u) | Enabler | (−1.7) | Played once: 2/5, slightly weak | Range 3 on an arcanist did nothing; it paid off later on a 1/2 scholar. Suggested: +1 attack too, or cost 1. |
| The stone opens (G spell, c) | Enabler | −0.1 | Cast once: 2/5, too weak | Saved a turn of walking. The "missed lethal" the tester blamed on it was a turn they hadn't cast it; the log confirms. |
| The Still Flame (W enchantment, c) | Stands alone | — | Played once: 2/5, too weak | Healed 0 every turn and died with its unit, a 2-for-1. The heal comes at your turn start, so it never saves a unit from burst. Suggested: recover 3, or +1 health too. |
| Writ of seizure (B spell, u) | Stands alone | — | Cast once: 2/5, too weak | Took 2 cards the bot couldn't cast anyway. The bot hoarded 13 cards on 2 lands, which is the worst case for Ransack. Suggested: cost 2, or draw a card too. |
| Ashen Court confiscator (B unit, r) | Stands alone | — | Played once: 2/5, too weak | The 1/2 body died next turn. Suggested: 2/3. |
| Ashborn gleaner (B unit, r) | Enabler | — | Played once, reaped 1: 2/5, too weak | Lands before the discard fills, and giving up discard cards costs nothing in the black starter. Suggested: 3/4 base. |
| Sent home (U spell, c) | Stands alone | — | Held all game: 2/5, probably weak | Nothing was worth bouncing. Suggested: draw a card when you recall your own unit. |
| Rising squall, Thrown boulder (R spells, u) | Stand alone | — | Drawn but never cast | The tester read Thrown boulder as better than Firebolt, and suggested Empower 2. A `do` mix-up cost the one cast; that is fixed. |
| Oath veteran, Veilwing, White morning, Hunted, Streak raider, Foldstride, Hired company, Caravan guard | | | Not drawn, or cast only at the end | No reading. Veilwing was drawn but never cast, stuck at 5 lands. |

### What the testers found frustrating

1. **Land screw and flood, and nothing to do about it.** Nearly every tester raised this. They suggested a land-for-a-card trade, a mana sink, and smoothing such as a floor on redraws. Part of it was the bot's mulligan: it keeps one-land hands.
2. **A passive bot.**
   - It walks units in one at a time.
   - It hoards cards on few lands, and seldom attacks a summoner.
   - It heals full-health units "for 0" (Temple cleric).
   - It spends removal on the wrong targets.
   - Several wins came from this, not from the cards.
3. **Hidden information.**
   - Tiles under units can't be seen, so a lampwright died to fire nobody could see.
   - It's unclear when a Veiled unit can be targeted.
   - There's no view of where enemies can reach.
   - Damage on a unit has no history.
   - Testers wanted the expected kill or survive shown on each attack, and the reason a move isn't offered.
4. **Rules that frustrated testers. These are worth a look; none of them is a bug.**
   - Nothing can block an enemy standing on your back row, so a big unit there just hits the summoner (d08, d09, d11).
   - Ranged units hit and step back out of melee reach (d01).
   - Movement is slow enough that units can't gang up on a big one (d12).
   - Devotion healing erases burn between turns (d11).
   - Several decks have no answer to one huge unit, such as Vashkar or a 5/7 penitent (d09, d11, d12).
   - It's unclear whether a Drain unit's strike-back heals.

### Fixed in the test tool and rules sheet during the batch

- Testers redraw hands with fewer than 2 lands.
- A test card stays in the opening hand after a redraw.
- Identical moves are listed once, and `do` picks one instead of refusing.
- `show` lists your discard pile.
- RULES.md explains the ground tiles, Charge and enemy reach.
- RULES.md no longer says moving a unit ends the play step. The game has allowed any order since `freeTurn`, and the old line cost testers mana (d04).

Still to do: collapse the 30 Scorch aim lines to tiles that matter, and show Offering only when it changes what you can afford.

## 2026-11-15: full card audit

88 Claude games covered all 275 non-land cards: 66 with audit decks that forced under-tested cards into the opening hand, and 22 with the real starter and theme decks. Every card has at least one verdict and was seen in play. The full results, with every tester's note, are on the audit page (https://claude.ai/artifact/AUqejGUMrDj4s84uR2vrpb).

Works differently from its text (checked in engine.js):
- Any blighted tile raises a thrall when a unit dies on it, so Pall of ash and Ash-sower raise thralls. Only Grave soil says so.
- Drain heals the attacker before the strike-back lands, so a full-health drainer heals nothing from its own attack.
- Thorns also hurt a unit that ends its own turn on them. Thornbrake's text only mentions entering.
- Return to loam can't be cast without an equipment card or relic to destroy, so its extra land never comes.

Too strong: Oath bell (no cap), Mourning veil (the wearer can't be targeted even while it attacks), Pride matriarch and Vashkar (cost +1 under the legendary rule).

Weakest: Return to loam, The stone opens, Still Flame ash-sweeper, Rain-reader, Cloistered scholar, Reedbank forager, Scatter the line and Untaught firecaller. The audit page gives a buff for each. Reedbank forager, Wayfinder druid and Return to loam get the draw-a-card fallback.

Decks: the aggressive red decks, First blood, Funeral, Devotion, Armed, Levy, Thorns and blue longshot all worked. The white starter, Elder Herd, Rootfed, Carrion and Winter lost early pressure while waiting on lands or their engine. Each deck played one game, so treat these as places to look.

Fix round: 18 more games used a scratch copy of the engine with 27 of the proposed changes, never the real files.
- Fixed: Pride matriarch at 6, the draw fallback on Reedbank forager, Wayfinder druid and Return to loam, The stone opens, Scatter the line, Frostbreak, Barrow priest, Moot elder, Sluice diver, Guild improver, Tideglass engine, Shifting forest and Oath-road squire. Drain now heals after the strike-back.
- Oath bell capped at +3 is still strong when the bot has it; +2 is the next step.
- Seedheart vessel starting with 1 growth was too strong; cost 2 instead.
- Untested: the ash-sweeper (its ability needs offering when a neighbour is hurt), Rain-reader, Conclave field scholar, the tortoise and Vigil-keeper.
- Side findings: Mercenary captain can order an ally summoned this turn, wasting the order. Drain prints no heal line in the log.

The creator then reviewed the audit, and its settled changes went into the real game the same day (rules in DESIGN_NOTES.md, Balance). Quick checks afterwards, 2000 paired games each with the plain bot unless noted:

- **Above their band:** Reedbank forager +4.3 (+2.7 with the lookahead bot; drawing 1 instead of 2 gives +2.1), Ashen Court envoy +3.0 (Drain now heals after the strike-back), Guild improver +2.5. Probably above: Rust-hinged warden +2.3, Mercenary captain +2.2, Wayfinder druid +1.6, Conclave field scholar +1.4, Moot elder +1.3, Oath sentinel +0.8.
- **Probably below:** Mourning veil −2.1, Barrow tender −1.7, Pride matriarch +1.3 at cost 6 (legendary band +2 to +5), Shell-mountain tortoise −0.9.
- **In band:** Oath bell, Vashkar at cost 7, Longhouse hospitality, Still Flame duelist, Ashen Court noble, Scatter the line, Frostbreak, Shifting forest, Return to loam, Sluice diver.
- **Starters, lookahead bot, 1400 games:** The Elder Herd 62.2% (57.6% with foraging turned off), Oath of the Sunmane 48.4%. Plain bot: The Ashen Court 50.7%.
- **Follow-up, creator's call:** Reedbank forager became an uncommon costing 3 (+1.0, in its band) and Pride matriarch a 5-mana 5/6 (+3.8, in its band). The Elder Herd still wins 62.0% and Oath of the Sunmane 50.6%, both with the lookahead bot.
