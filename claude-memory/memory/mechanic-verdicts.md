---
name: mechanic-verdicts
description: "The creator's verdicts on the 38 proposed Breachline mechanics (2026-11-14), and why life-keyed mechanics fail"
metadata:
  node_type: memory
  type: project
  originSessionId: 4959694c-5890-4645-90c6-6cbb8cc8ac9c
  modified: 2026-11-15T00:10:40.214Z
---

On 2026-11-14 the creator reviewed the 38 mechanic ideas (council page, scratch mechanics.json) and asked for new cards built on the liked ones, tested with the bot, across alignments and factions.

- **Liked:** Momentum, Eager, Hired (upkeep must be automatic so nobody loses a unit by forgetting), Seasoned, Grace, Deep roots, Empower, Surge (Magic-style: a flat cost plus X), Recall, Offering, Reap (needs more cards that fill or use the discard pile), Cadence, Ransack, Stratagem (the opponent sees a card was set, not what it is), Battlefield conditions, Overreach (framed as paying more for accuracy), Trade in, Renown.
- **Lukewarm:** Tolled (okay, but the first test was far too strong). Waylay is liked, but acting on the enemy's turn would stall the interface; it needs a different timing.
- **Rejected:** Raid, Spearhead, Bequest, Dormant, Spotter, Skirmish, Shieldwall (a worse Guard), Learned, Last stand and every comeback/pacing rule, Hidden traps, Masked (face-down units), Shrines, Bounty (only played right before a kill), Blood price.

**Why:** summoner life rarely matters, because the first summoner hit so often decides the game. Anything keyed to summoner damage or a life threshold almost never comes up.

**Outcome (2026-11-14):** after bot tests and ten Sonnet playtests, 13 mechanics were kept and Eager, Striker, Trade in and Overreach parked. 22 cards (#225–246) are in breachline/CARD_PROPOSALS.md and Set 16 briefs. The creator votes on the council page, https://claude.ai/artifact/G3QMDBcFuaVHWhChcf4M1E (db collection `votes`); read the votes before porting cards into the game.

**Votes (2026-11-15):** Ransack is good and stays (Writ of seizure, confiscator). Reap stays, with cards that pull from the discard pile. Grace was rejected, and a unit must never turn its own Drain into a ward; if Grace returns, it belongs on healing that is given (overhealing becomes a ward), not on the unit receiving it. Flanking is removed from every card. Surge needs an easy X picker, such as a scroll wheel like the iPhone alarm setter.

**How to apply:** build new mechanics from the liked list. Don't propose life-threshold or summoner-damage triggers without a fix for that. Faction packs (instead of alignment packs) were floated as a separate question. Related: [[future-features-tracker]], [[breachline-project]].
