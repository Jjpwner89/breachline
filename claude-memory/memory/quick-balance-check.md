---
name: quick-balance-check
description: "Every new Breachline card or deck gets a quick balance check before it's done; big audits are for broad rebalances"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6469f0be-da82-4af2-bde9-3be528f128b5
  modified: 2026-11-11T17:57:38.421Z
---

The creator wants a quick balance check run whenever a card or deck is added: a new card against a same-cost reference card in paired random decks, a new deck against a fixed set of benchmark decks. The report should say whether the card lands in its rarity's expected band. Save the hour-long 100k+ game audits for large rebalances.

**Why:** they want to iterate faster, test their own theories, and confirm new cards "come in where we expect and deliver true to value". They also care about variance (one-card reliance, matchup spread), not just the average win rate.

**How to apply:** asked for on 2026-11-11, to be built after that day's balance pass. Once the check exists in the repo, run it before calling any new card or deck finished, and include its numbers in the report. Until it exists, note that the check is still to be built. Rarity bands are an idea the creator is considering: rarer cards usually cost more and are stronger, with some cheap efficient rares. See [[breachline-project]].
