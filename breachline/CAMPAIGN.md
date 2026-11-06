# Breachline campaign

First version: Vigil only. The story lines live in `campaign.js`, and every line below is a draft waiting for the creator's verdict.

## From the creator (2026-11-05)

- A loss ends the run, and the next run starts over from the starter deck.
- Battles come in a fixed order.
- The campaign has a map.
- The player chooses who plays the enemies when a run starts.
- Vigil comes first.
- Cutscenes are wanted later. They aren't built yet.

## Claude's assumptions, not yet confirmed

- **Length:** 6 battles, so about 1 to 2 hours at 10 to 20 minutes a battle.
- **Summoner life:** back to 150 at the start of each battle. Life doesn't carry over.
- **Rewards:** after each win except the last, choose one of three cards: two from your own side or neutral, one from the enemy you just beat. You can take a land or nothing instead.
- **Left out of rewards:** Velunn, because they should stay rare, and cards whose cost plus wanted lands is over 7.
- **Your deck:** no deck building during a run. The deck only grows.
- **Enemies:** the same rules and 150 life as you. Later enemies are harder only because their decks are stronger, which goes beyond the same-rules difficulty idea for the Claude levels. That idea still applies inside each battle.
- **A draw:** the same battle is fought again.
- **Saving:** after every move, in this browser only. Runs don't follow the account the way saved decks do.

## Draft lines, for verdicts

The story, the shepherd and the shrine are all **Proposed**, and none of it adds to canon until approved. The ending deliberately doesn't say what answered.

**Campaign title:** The Shrine Road

1. **Premise:** A shepherd came down from the high country with a story. At the old shrine, after a hundred and fifty years, something answered her. The Oath has heard stories before. It sends you anyway.
2. **The ford** (Cinder Clan raiders): Cinder Clan raiders hold the ford. They took a vote on you before you arrived.
3. **The closed road** (The Thornwardens): The old road goes through the forest, or did. The Thornwardens have spent three generations making sure of it.
4. **The pass** (The Warhorde): The hill bands don't care what answered her. They care that you're carrying grain through their pass.
5. **The lower gate** (The Lantern Conclave): The Conclave got here first. They've brought instruments.
6. **The fallow field** (The Gravebound): Nobody has farmed the field below the shrine. Tonight, it stands up.
7. **The shrine steps** (Vashkar, Who Counts the Dead): Vashkar, Who Counts the Dead, is waiting on the shrine steps. He has already counted you.
8. **Ending:** The shrine is one small room with a cold lamp. You light it and wait. Near dawn, with no wind, the flame leans toward you. It might be nothing. You send word anyway.
9. **Defeat:** The Oath will send someone else. The road is still there.

## Balance so far

From 400 simulated runs with the scripted bot on both sides, picking rewards at random. Each chapter was fought with the deck so far, whatever happened in earlier chapters, so each one got a full sample.

| Chapter | Bot on your side wins | Average turns |
| --- | --- | --- |
| The ford | 69% | 20.0 |
| The closed road | 59% | 20.7 |
| The pass | 46% | 20.7 |
| The lower gate | 58% | 25.0 |
| The fallow field | 46% | 20.3 |
| The shrine steps | 24% | 20.9 |

Only 7 of the 400 runs won every battle. No person has played a full run yet, and the bot plays the Vigil deck weakly, so these numbers only compare the chapters. The lower gate is easier than the pass before it, and the bot rarely uses sacrifices well, which makes both Dominion chapters easier than they would be under Claude. Claude opponents haven't been tried in a run, only the fallback to the bot.

## Still to do

- **`SETTING.md`:** its Map line still says a map may stay unbuilt. Change it to say the creator wants one, and that the campaign has a route map for now, with place details kept loose. It was left out of this merge because another chat had uncommitted edits to that file.

## Where things plug in

- **Another alignment's campaign:** add a story to `STORIES` in `campaign.js`. The setup screen is still hard-wired to Vigil, and the map's terrain in `screens.js` is drawn for this route.
- **Cutscenes:** each chapter's text is plain data, so a cutscene can play from the same place before a battle.
