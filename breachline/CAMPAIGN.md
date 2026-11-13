# Breachline campaign

All five campaigns can be played. The story lines live in `campaign.js`, and every line below is a draft waiting for the creator's verdict.

## From the creator (2026-11-05)

- A loss ends the run, and the next run starts over from the starter deck.
- Battles come in a fixed order.
- The campaign has a map.
- Each campaign gets its own region of the world, rather than one shared region (2026-11-06).
- The player chooses who plays the enemies when a run starts.
- Any campaign can be played first (2026-11-10).
- Cards picked during a run are kept after it only if you win the campaign. The rest of progression is in `PROGRESSION.md`.
- Cutscenes are wanted later. They aren't built yet.

## Claude's assumptions, not yet confirmed

- **Length:** 6 battles, so about 1 to 2 hours at 10 to 20 minutes a battle.
- **Summoner life:** back to 15 at the start of each battle. Life doesn't carry over.
- **Rewards:** after each win except the last, choose one of three cards (creator, 2026-11-13). The first comes from the campaign's Doubles down list, the second from its New direction list, the third from the enemy you just beat. Each of the first two slots instead goes to any card of your colour 30% of the time, so about three slots in four come from the lists. Neutral cards are never offered. Rare and legendary cards grow more likely each chapter. The lists are in `campaign.js` (`REWARDS`) and below. You can take a land or nothing instead. The card goes to your reserve, and between battles you can swap any reserve card into your deck for one of its cards, which goes to the reserve in turn. The deck stays at 30 (creator, 2026-11-10).
- **Left out of rewards:** Velunn, because they should stay rare, and cards whose cost plus wanted lands is over 7.
- **Your deck:** no deck building during a run. The deck only grows.
- **Enemies:** the same rules and 15 life as you. Later enemies are harder only because their decks are stronger, which goes beyond the same-rules difficulty idea for the Claude levels. That idea still applies inside each battle.
- **A draw:** the same battle is fought again.
- **Saving:** after every move, in this browser only. Runs don't follow the account the way saved decks do.
- **Preset enemy units:** built for prestige only (creator, 2026-11-13); see Prestige below. The unit starts in the enemy's back row, isn't drawn from its deck, acts from the enemy's first turn, and is gone when it dies.

## Reward lists (creator, 2026-11-13)

Doubles down makes the starter's own plan stronger. New direction opens a side the starter already hints at, so no reward needs a mechanic the deck can't use. A card is offered only while the run holds fewer than 3 copies.

| Campaign | Doubles down | New direction |
| --- | --- | --- |
| Vigil | Hold the line: Shieldline sergeant, Stand as one, Muster the levy, Oath-road squire, Stormglass glaive, Oath bell, Ribbonvane | The Still Flame, hinted by the cleric and pilgrim: Water carrier, Still Flame chaplain, Hearth-sworn penitent, Pilgrim reliquary, Consecrated ground, Line of dawn, Vowkeeper of the long road |
| Gnosis | Strike from afar: Conclave field scholar, Cobalt rapier, Conclave rimecaller, Harmonic wardwright, Brightlance, Held between moments, Harmonic burst | Deep winter, hinted by Rimebolt, White morning and the Winterdoor keeper: Unwind the step, Leaden step, Glyphwright, Frost, Frostbreak, Rime drake |
| Dominion | Debts called in: Withering hex, Court informant, Ledger of debts, Debt Collector's blade, Tithe-keeper, Siphon vigor, Hostess of the late hour | The barrow feast, hinted by the harvester, Raise the dead and the Carrion units: Barrow tender, Barrow mark, Sepulchral scale, Mothwake mourner, Gravecaller, Barrow priest, Ossuary engine |
| Fervor | Charge them down: Goblin firepot, Cinder-cant drummer, Cinderhook axe, Redglass falchion, Orc pack-hunter, Goblin rabble-rouser, Mercenary captain | Burning ground, hinted by Scorch, the torch-runner, the martyr and the firebrand: Emberward, Anoint with embers, Ember salamander, Untaught firecaller, Cinderwake, Kindle the line, Cinderfall |
| Genesis | The herd grows: Ridge wolves, Reedcrown grazer, Spring melt, Seedheart vessel, Bronze-harness alderkin, Clearing the channel, Through the marble | Thornwardens, hinted by the trapper and Shifting forest: Thornwarden goblin scout, Sudden canopy, Thornbrake, The stone opens, Overgrowth, Seedfall, Ironbark sentinel |

## Prestige (creator, 2026-11-13)

Built as drafted. Prestige opens for a campaign once you've beaten it, and every run of that campaign picks **Normal** or **Prestige** on the campaign screen.

- **Stronger enemies:** in chapters 1 to 5 the enemy swaps two to ten of its weaker cards for stronger ones in its own colours: Barrow rats for Shutter-window assassins, Militia spearmen for Oath outriders, and so on. The decks stay 40 cards. The swaps are `PRESTIGE` in `campaign.js`.
- **Units on the field:** chapters 4 and 5 start with one cheap enemy unit in the enemy back row, and chapter 6 with two and no swaps. The chapter's panel on the map names them before you fight. They have to be cheap: a unit ready on turn 1 is worth far more than its cost. In testing, one Brass chorister alone cost the starter 40 points in chapter 4, while that chapter's six card swaps cost under 10.
- **Gold:** prestige battles pay double, against half again for a normal replay, and a prestige clear pays 600 gold instead of 300.
- **Badge:** a prestige clear puts a gold ring round the campaign's emblem on the main menu and a gold gem by its name on the campaign screen.
- **Rewards:** both list slots draw from all of the campaign's colour rather than its reward lists, and rare and legendary cards come up more often.
- **One tier for now.** Stacking tiers (Prestige I, II, III) are parked in `FUTURE_FEATURES.md`.

Balance (2026-11-13): the bot with the starter deck and no rewards, 400 games a chapter, normal → prestige. Every chapter is 8 to 20 points harder, 13 on average; Saint Maren's chapter is the hardest at 20, since even a single extra unit beside her costs 7.

| Campaign | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 | Ch6 | One-try clear |
|---|---|---|---|---|---|---|---|
| Vigil | 81 → 66 | 74 → 60 | 68 → 57 | 62 → 46 | 56 → 44 | 56 → 41 | 8% → 1.9% |
| Gnosis | 79 → 68 | 78 → 66 | 72 → 62 | 64 → 53 | 66 → 50 | 53 → 33 | 10% → 2.5% |
| Dominion | 80 → 65 | 71 → 60 | 69 → 53 | 58 → 48 | 55 → 43 | 56 → 48 | 7% → 2.1% |
| Fervor | 77 → 62 | 68 → 56 | 64 → 52 | 59 → 46 | 57 → 43 | 59 → 42 | 7% → 1.6% |
| Genesis | 80 → 68 | 70 → 56 | 66 → 55 | 62 → 50 | 60 → 43 | 60 → 43 | 8% → 1.9% |

A real player on prestige has already beaten the campaign and carries the cards they pick on the way, so they fare far better than these bare-starter numbers.

## Draft lines, for verdicts

Every story, place and event below is **Proposed**, and none of it adds to canon until approved. No ending says what is really happening to the gods. Each campaign's enemies come from the factions already in `SETTING.md`, and their rivalries are story only.

### Vigil: The Shrine Road

You start with Oath of the Sunmane. The shepherd and the shrine are proposals, and the ending deliberately doesn't say what answered.

1. **Premise:** A shepherd came down from the high country with a story. At the old shrine, after a hundred and fifty years, something answered her. The Oath has heard stories before. It sends you anyway.
2. **The ford** (Cinder Clan raiders): Cinder Clan raiders hold the ford. They took a vote on you before you arrived.
3. **The closed road** (The Thornwardens): The old road goes through the forest, or did. The Thornwardens have spent three generations making sure of it.
4. **The pass** (The Warhorde): The hill bands don't care what answered her. They care that you're carrying grain through their pass.
5. **The lower gate** (The Lantern Conclave): The Conclave got here first. They've brought instruments.
6. **The fallow field** (The Gravebound): Nobody has farmed the field below the shrine. Tonight, it stands up.
7. **The shrine steps** (Vashkar, Who Counts the Dead): Vashkar, Who Counts the Dead, is waiting on the shrine steps. He has already counted you.
8. **Ending:** The shrine is one small room with a cold lamp. You light it and wait. Near dawn, with no wind, the flame leans toward you. It might be nothing. You send word anyway.
9. **Defeat:** The Oath will send someone else. The road is still there.

### Gnosis: The Long Survey

You start with The Lantern Conclave.

1. **Premise:** The Conclave has found an Old Empire survey that ends at an observatory nobody has opened in a hundred and fifty years. They want to know what it was measuring. You're the one they can spare.
2. **Ambrel** (Dockside sellswords): Someone sold the survey's instruments on the docks before dawn. The buyers are still there, and they've grown attached.
3. **The waterworks** (The Thornwardens): The Thornwardens have opened every sluice. The lower ward is flooding, and they're waiting to see who comes.
4. **The hill farms** (Ashen Court collectors): The new channels watered the hill farms for the first time in years. The Ashen Court has come to collect for the water.
5. **The checkpoint** (The Sunmane Oath): The Oath has built a gate across the only road into the high country. They've heard what the Conclave studies.
6. **The dry canal** (The Gravebound): The canal has been dry for a hundred and fifty years. The Gravebound have been using it as a road for nearly as long.
7. **The silent observatory** (Saint Maren of the Long Watch): Saint Maren of the Long Watch is sitting at the observatory door. She believes some doors stay shut for a reason.
8. **Ending:** The great lens still points at the same empty patch of sky. You take the measurements anyway. They make no sense yet. They will.
9. **Defeat:** The Conclave will send another surveyor. The instruments are still waiting in the harbour.

### Dominion: The Quiet Order

You start with The Ashen Court.

1. **Premise:** The court of still water has stood empty since the Silence. The Ashen Court means to sit in it again, and every village on the way owes something.
2. **The tithe village** (Cinder Clan raiders): The tithe village has hired Cinder Clan raiders to say no on its behalf.
3. **The barrows** (The Gravebound): The Gravebound tend these barrows, and they don't want them counted.
4. **The salt causeway** (The Thornwardens): The Thornwardens have cut the causeway in three places. The marsh was theirs first.
5. **The bone orchard** (The Lantern Conclave): Conclave scholars are taking cuttings from the bone orchard. They haven't asked.
6. **The silent town** (The Still Flame): Someone has lit a lamp in the silent town. The Still Flame has come to keep it lit.
7. **The court of still water** (The elder dragon): An elder dragon has slept on the island for longer than anyone has kept records. It doesn't recognise the Court.
8. **Ending:** The court is cold and very quiet. By spring the villages are paying on time. Nobody can say exactly when they stopped arguing.
9. **Defeat:** The Court has waited a hundred and fifty years. It can wait for another summoner.

### Fervor: No Throne

You start with The Warhorde.

1. **Premise:** Someone is rebuilding the high seat. The moot voted, and it was close, but nobody wants a king.
2. **The moot** (The losing bands): Not every band voted the same way. The ones who lost would like a rematch.
3. **The moving market** (The Artificers): The market has new guards with brass on their gloves. Someone paid the Artificers well.
4. **The salt pan** (The Ashen Court): The salt was free last year. The Ashen Court has put a price on it.
5. **The red gorge** (The Elder Herd): The herd crosses the gorge every autumn. It doesn't stop for bridges, or for you.
6. **The toll wall** (The Sunmane Oath): The new kingdom built its wall with Oath money. Oath knights stand on it.
7. **The high seat** (The claimant's host): The claimant sits on the high seat in borrowed armour. He has promised everyone something.
8. **Ending:** You take the seat apart stone by stone, and every band carries one home. Next year someone will try again. Next year you'll vote again.
9. **Defeat:** For now, the seat has a king. The bands will argue about it all winter.

### Genesis: The Green Return

You start with The Elder Herd.

1. **Premise:** Something upstream has slowed the river. The fish are late, the reeds are dying, and the herd has started walking.
2. **The mother grove** (Sellswords): Sellswords have camped in the mother grove for the firewood. They've started on the old trees.
3. **The reedways** (Conclave surveyors): Conclave surveyors are mapping the reedways. Everything they map, someone builds on.
4. **The herd's crossing** (The Warhorde): The Warhorde follows the herd for meat. This year they've brought giants.
5. **The cut line** (The Sunmane Oath): The timber goes to the Oath's new fortress. The Oath sent knights to guard it.
6. **The dam** (The Artificers): The dam is the finest thing anyone has built in a century. The Artificers won't let you near it.
7. **The green city** (The Ashen Court): The Ashen Court has claimed the old city below the dam. It means to drain the ground and build.
8. **Ending:** The dam gave way slowly, then all at once. By summer the river runs through the old city's halls, and the first families are planting in them.
9. **Defeat:** The river stays slow this year. The forest is patient. You'll have to be too.

## Balance so far

Retuned for 40-card decks on 2026-11-11 and checked again on 2026-11-13, from 400 simulated games per chapter with the scripted bot on both sides. Each chapter was fought with the campaign's starter deck alone, so rewards aren't counted. The targets climb from 80% in chapter 1 to 55% in chapter 6, 5 points a chapter, as the creator asked: each campaign climbs steadily and all five end up with similar clear rates. Each figure is good to about 2 to 3 points either way.

| Campaign | 1 | 2 | 3 | 4 | 5 | 6 | One-try clear |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vigil | 81% | 74% | 68% | 62% | 56% | 56% | 8% |
| Gnosis | 79% | 78% | 72% | 64% | 66% | 53% | 10% |
| Dominion | 80% | 71% | 69% | 58% | 55% | 56% | 7% |
| Fervor | 77% | 68% | 64% | 59% | 57% | 59% | 7% |
| Genesis | 80% | 70% | 66% | 62% | 60% | 60% | 8% |

The 2026-11-13 check followed free-order turns, the end-of-turn tile damage and Withering hex moving to Dominion. Fervor had drifted harder (5% one-try clear, chapter 6 at 48%) and Gnosis chapter 2 easier (84%), so four enemies changed:
- **Fervor 1, The losing bands:** one Goblin firepot, one Banked flame blade and two Firebolts in place of 3, 3 and 3, with an extra cutter, two Cinder martyrs and 18 lands.
- **Fervor 6, The claimant's host:** one Binding glyph, one Shield of dawn and one Blessed banner in place of 2, 3 and 2, and 14 plains.
- **Gnosis 2, The Thornwardens:** two pathguards, a Thornbrake and a trapper in place of three Reedcrown grazers, and one land fewer.
- **Vigil 3, The Warhorde:** three Orc raiders in place of the Clan outriders it got when the hex left red.

- **The one-try clear** is every chapter won in a row with no retries, so it understates a real run. Before the retune it ran from under 1% (Genesis) to 13% (Vigil).
- **Dominion's third chapter** (the salt causeway) is 8 points under its target and a little harder than its fourth.
- **A person beats the bot by a wide margin.** The creator cleared Fervor on the old 30-card setup without the enemy ever damaging their summoner. The scripted bot trades on the board and rarely pushes through to the summoner, so these numbers compare chapters and campaigns rather than predict a person's results. It also rarely uses sacrifices well.

## Maps

Painted by Codex from `art/CAMPAIGN_MAP_BRIEFS.md`. The creator accepted them on 2026-11-13; everyone who has played loves them. Each campaign keeps its fixed route, with no branching paths (creator, 2026-11-13). The full-size paintings are in `art/maps/` and the game loads `art/web/maps/`, which `art/build-web.sh` makes. Each campaign's road is traced over its painting, so the walked route follows it.

## Where things plug in

- **Another campaign:** add a story to `STORIES` and its id to `ORDER` in `campaign.js`, with chapters, enemy decks and a `road` traced over its map.
- **Cutscenes:** each chapter's text is plain data, so a cutscene can play from the same place before a battle.
