# Breachline chat snapshot

Taken on 2026-11-05 from the two Breachline chats, plus the backup chat. It holds only what isn't already in the project's files, so read it alongside `DESIGN_NOTES.md`, `SETTING.md`, `FLAVOUR.md`, `NEW_CARDS.md` and the `art-direction` and `flavor-text` skills.

Each item says whose it is:
- **You decided:** the creator chose or approved it.
- **You liked:** the creator reacted warmly, but the details weren't confirmed.
- **Claude proposed:** a suggestion with no clear answer yet. It isn't a decision.

## Where things stand

The last thing in progress was the next card batch. You asked for new cards in each colour and gave changes on Claude's first draft in `NEW_CARDS.md`. Claude then wrote briefs for all 29 new images in `art/ART_BRIEFS_SET2.md`. The Setting and Flavor chat was still running when this snapshot was taken, so its latest work may be newer than this.

**Waiting on you:**
1. Generate the 29 images from the set 2 briefs. Claude suggested starting with Cloistered scholar, Elder Herd bull and Death warrant as a sample.
2. Answer the three questions at the bottom of `NEW_CARDS.md`.
3. Confirm or reject the "Repetition to watch" list in the `art-direction` skill.
4. Give verdicts on the three flavour lines still waiting in `FLAVOUR.md`.
5. Name some touchstones: books, films, games or paintings with the feeling you want. Claude has asked more than once and you haven't answered yet.

**Not started:** the model-driven AI and its chat panel, the exhibition deck builder, the campaign, a playable town and fortifications, faction buildings in the engine, new cards in the engine, and flavour text on cards.

**Outdated on purpose:** the style block in `art/ART_BRIEFS.md` and the shared art briefs doc still use old wording and ask for too much drama. `ART_BRIEFS.md` now carries a warning, but the shared doc doesn't, so don't reuse it for new briefs.

**Told your Codex art thread:** you'd come back with faction backgrounds and world detail for further art.

## Links

The three claude.ai pages are private to the Claude account that made them. None of these links are saved anywhere else in the project.

| What | Link |
| --- | --- |
| Playable game | https://claude.ai/artifact/Hr5bV3HfqseB5HwCu6xemH |
| Sunmane lancer card | https://claude.ai/artifact/Mev6cqP5wfCbnUGvic1Jsu |
| Art briefs doc (old wording) | https://claude.ai/artifact/K4CyZKihSijWBNGoY2YW7y |
| GitHub repo (private) | https://github.com/Jjpwner89/breachline |

If that Claude account is a work account, you could lose these pages if you leave. The game, card and briefs also exist as files in the repo, so you could publish them again from another account.

## What drew you to this

- **Origin:** it started from remembering the Adventure Time card game (Card Wars) and its mix of deck building and a board. You decided early on not to rebuild it and to make something unique to you instead.
- **What you love in Magic:** the fantastical settings and epic art, especially the generic but detailed fantasy of red, the optimistic feel of white, and the urban settings of blue. Your favourite images were white's lion people, blue's mages deep in study, and red's goblins, orcs and dragons.
- **Slay the Spire:** a further inspiration, but you prefer having multiple characters rather than one.
- **Games worth a look:** Claude suggested Duelyst for real grid tactics and Faeria for building a board during play, from memory.

## Alignment identities

**You liked:** you said you "really like" the peoples, the beliefs and the strengths and weaknesses, as a start to expand later. The names are updated to your final picks. You asked for these to be strong tendencies and not absolutes, so "very few fliers" replaces Claude's original "no fliers", and "very little" replaces its "almost no" for Fervor.

| Alignment | What it believes | Peoples | Strengths | Weaknesses |
| --- | --- | --- | --- | --- |
| Vigil (white) | We protect one another, and duty comes before self | Lion folk, knights, clerics, righteous soldiers | Healing, protecting allies, bonuses for standing together | Lower damage, slow to reach the summoner |
| Gnosis (blue) | Everything can be understood, whatever it costs | City mages, scholars, constructs | Ranged attacks, moving units, drawing cards, illusions and decoys, disabling enemies | Small, fragile units |
| Dominion (black) | Power is the only truth, and any price can be paid | Necromancers, undead, bound demons, ruthless nobles | Life drain, destroying units outright, sacrificing units for power, returning units from the discard pile | Pays with its own life and units, little true healing |
| Fervor (red) | Feeling and freedom come first, and no chain holds | Orcs, goblins, giants, sellswords, dragons | High attack with low health, direct damage, speed, giants and fliers | Very little defence or healing |
| Genesis (green) | Life grows and endures, and it outlasts every kingdom | Forest peoples, druids, great beasts, living trees | Very large units, units that grow over time, extra lands, recovering health | Few instants, very few fliers, exposed to fliers and ranged attacks |

- **Going against a tendency:** you approved the higher cost. Claude's starting number is about 1 extra mana, so a Genesis flier with a typical 3-mana flier's stats would cost 4.
- **Factions sharing an alignment (you liked the idea):** two factions in one alignment share mana but compete for your limited town lots. Example building: a Warhorde card wants its War forge, not just any Fervor building.
- **Velunn on cards (you liked):** you said "yes that's great" to Claude's idea that they're the game's rarest, biggest cards and that Dominion could bargain with them, adding that they can be good too.
- **Vampires (you decided):** Dominion can have vampires, and red could too, but they should be a subtle part of the world, in the shadows and somewhat rare. This changes your earlier dislike of the look. The set 2 Dominion briefs were written before this and rule that look out.

**Claude proposed:**
- No counterspells in Gnosis, because disabling enemies does a similar job on the grid.
- No board wipes at first, because they're hard to balance and hard for the AI.
- Finish white and red first, then add one alignment at a time. The new card batch spans all five anyway, so this is unsettled.
- Start Gnosis with ranged attacks, moving units and drawing cards, since illusions and decoys are hardest for the AI.

## Rules drafted for when the town opens

The town and fortifications aren't playable yet, so none of this has been tested. **Claude proposed** all of it unless marked otherwise, and you haven't objected.

**Town**
- A town has 4 lots with more possible buildings than lots, so you can't build everything. Your rule is 3 to 4 slots.
- It holds three kinds of building: bank, producer and boost. Examples drawn so far are a Pride hall, a Bank and a War forge.
- A faction card names one specific building, with about 3 buildings per faction.
- A raw neutral card beats an unboosted faction card and loses to a boosted one.
- If a bank is destroyed, the mana stored in it is lost.
- **You decided:** destroying a building also stops its boost on units already in play. This replaced Claude's idea of locking the boost in.
- The town wall has its own upgrade spot and doesn't use a lot. It has about 25 health and must be broken before any building can be hit.
- **Reaching the town:** a unit attacks it from the grid tile next to it, so a raider on that edge can reach the town from the enemy front row, one step before it could reach the summoner. An earlier draft allowed attacks only from the enemy back row.
- **Still open:** should both towns sit on the same side? Both on the right could make that edge the main battleground, while opposite sides would spread the fighting out.

**Fortifications**
- They go on your front row only, which keeps your back row free for new units.
- Attacks hit the fortification first, and a garrisoned unit can still attack and strike back.
- A wall has about 25 health, which adds one hit against most units. A really good one has 50 or more.
- **Your reasoning:** a wall usually isn't a great play unless you're attacking elsewhere and can spend on it later to counter an attack.

**Other rules**
- Enchantments attach to a unit or building on either side and go when their host is destroyed.
- Units can't move onto or through an occupied tile.
- Buildings don't strike back unless a keyword says so.

**Risks Claude flagged**
- **Stalled games:** a line of walls could block every route, and reshuffling means nobody runs out of cards. A late-game rule that damages both players may be needed.
- **Worn-down defenders:** with persistent damage, defenders can be ground down with no way back. One fix is that a unit that neither moves nor attacks recovers a little health, and garrisoned units recover more. You haven't answered this.

**Board layout from the diagrams:** the summoners and land rows sit outside the grid, above and below it, and the towns sit beside it. The diagrams and clickable town mock-up exist only in the first chat.

## The AI opponent

- **How it plays (Claude proposed):** the engine lists the legal moves and the model picks one at a time, so it can't break the rules and doesn't have to work them out. That's what makes a small model plausible.
- **The chat panel:** the model returns its move plus one short in-character line. That's a statement written for you and not its real reasoning, so it could even bluff.
- **Responses:** the engine asks about a response only when one is actually possible, which cuts down decisions.
- **Haiku or Sonnet:** only testing can settle it. Have both play many games against the scripted bot and compare win rates. Claude treats Sonnet as the safer assumption, because movement, the grid and instants all add difficulty.
- **Hard for the AI:** illusions, decoys and heavy card draw.

## Modes

**Claude proposed:**
- Build exhibition before the campaign, because it needs only the rules, some cards and a deck builder. That also makes it the best place to test balance and the AI.
- Make every card available in exhibition at first. Whether campaign unlocks carry over is undecided.

## Balance notes

- **Land share:** 45% at 40 cards would be 18 lands. At 10 lands in 20 cards, about a third of players had no spells in hand by their 10th turn, which is why Claude stopped at 9.
- **Going first:** Claude's suggested first fix for the first player's 40% win rate is to remove the skipped first draw. It hasn't been tried.
- **White's lead:** it may not be real, since the bot doesn't use the Warhorde's instants or positioning cleverly.
- **Summoner life:** Claude tried 200 first, then 150 because 200 looked too long for 10 to 20 minutes.
- **Cloistered scholar:** you had it draw a card instead of moving or attacking, with no health cost. Claude warned that a card every turn from a 2-mana unit could be very strong, so playtest it first.
- **Red damage:** you said it looked a little unbalanced, so Claude lowered three new Fervor cards. Existing red cards such as the Orc warchief and Elder dragon haven't been touched, and Claude asked if you meant those too.
- **Strike-backs:** if a target ever fails to strike back with no battle log line explaining it, that's a real bug. Your earlier report of a unit not hitting back was never diagnosed, because Claude couldn't see that game.

## Setting ideas not in the draft

**Claude proposed**, with no answer yet:
- **Each alignment is partly right and doesn't know it.** Vigil is right that the gods are out there but may never reach them. Gnosis is right that magic follows rules but doesn't know what it's studying. Dominion could learn the most from the evil entities in the chaos. Fervor may be closest to the chaos itself. Each campaign could reveal a different piece of the truth.
- **A combined answer to what snapped.** The Empire's forbidden research let cultists reach a primordial entity, another god helped them, and the main god gave himself up to keep the world from breaking. Almost every side shares some blame, and Vigil's suspicion of Gnosis becomes partly justified.
- **Linked cards.** The Oath knight's stone bridge could be the spearman's Sallow Bridge, quietly connecting the two.

**Your earlier leaning:** the gods are alive but the cost to restore them "may be too much to bear". You later said they're diminished only by distance. The cost survives only in Vigil's proposed ending, so decide whether it's still part of the truth.

**Still open:**
- Does "nobody remembers the Empire" include very long-lived beings such as dragons or the Velunn?
- Should flavour text ever cite an in-world source, such as a named book? You've accepted crediting a role, but this question went unanswered.

**Tone:** your form said 2 out of 5 for hope, while you also said the world can definitely be saved. Claude read that as hard times now, with each alignment defining "saved" differently, and you didn't object.

## Ideas already tried, so you don't redo them

**Game design**
- A party of three heroes on four lanes, with cards locked to a living hero. You chose an unseen summoner.
- Terrain on the grid, which you replaced with buildings only.
- Equipment and relics, dropped to keep buildings and enchantments.
- Lands or mana buildings on the grid, dropped in favour of the safe land row.
- Counting faction lands or buildings to lock cards. You want cards always playable.
- A free land from swapping, then discard and draw, then no swap at all.
- Diagonal movement for all units, which you passed on. A diagonal-stepping "Skirmisher" keyword was also offered and not picked.

**Setting premises:** The Breach, The Empty Throne, The Fading Sun and The Buried Gods, all set aside for your own premise. The Breach would have explained the title.

**Names passed over**
- **Alignments:** Covenant and Root you disliked. Inquiry and Fury you liked before picking Gnosis and Fervor. Ardor, Zeal, Furor, Frenzy and Rapture were red's other options.
- **Lesser gods:** the Orethim and the Sethari.
- **Summoners:** "the Gilded" was left out only because you didn't mention it.
- **Empire and history:** the longer formal names, because "the Empire" or "the Old Empire" works. "The Silence" moved from the Cataclysm to the dark age after it.

**Not name-checked**
- Claude hasn't checked the invented names against existing games or books.
- Firebolt, Hill giant and Elder dragon may overlap with Magic. Check them before any public release.

## Legal notes from the first chat

- **Card Wars isn't gone:** its physical line is still sold, with a 2026 Kickstarter. A game going defunct wouldn't remove its protection anyway.
- **What to avoid:** copyright generally protects a game's expression, such as names, art and card text, and not its mechanics. Use your own, and avoid "Card Wars" and "Floop".
- **Not legal advice:** Claude isn't a lawyer and didn't check patents or trademarks, so get advice before selling the game.

## How you like to work

- **Numbered batches:** flavour text finally improved when Claude offered numbered lines and you gave quick verdicts. Your cuts taught more than any written guideline.
- **Forms with a notes box:** these worked well for big decisions, and you often override the options in the notes.
- **Parallel chats:** you run separate chats for separate workstreams in one folder.

## Working on the project

- **Backup:** nothing reaches GitHub until it's committed and pushed. Push before leaving a computer, and pull before starting on another.
- **Work computer:** your sign-in token is saved in this Mac's Keychain, so delete the token on GitHub when you stop using this computer. Check your employment agreement and company rules on personal work made on company equipment.
- **Commit name:** commits show as `DP User`, taken from the Mac account. Claude offered to change it and you haven't said.
- **Node isn't installed on this Mac:** engine tests ran under `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc`, or in the browser.
- **Preview:** Python's web server couldn't serve directly from the Documents folder, so previews ran from a temporary copy with a doctype added to `index.html`. `.claude/launch.json` still points to those temporary folders and needs redoing.
- **Publishing the game:** publish `breachline/index.html` with `breachline` as the root, and include the scripts and `art/web/` images. Leave out the full-size art.
