---
name: claude-playtests-for-spells
description: "Breachline Claude-vs-bot playtests: how the creator wants them run (test cards swapped into starters, redraw rule, ask about deck, out-of-band cards and frustrations) and why"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4959694c-5890-4645-90c6-6cbb8cc8ac9c
  modified: 2026-11-15T15:20:10.413Z
---

The creator sees playing against Claude as the ideal way to play Breachline, and thinks bot testing alone is limited. Claude is especially good for testing spells: the bot casts them often enough, but a Claude tester is better placed to judge them (2026-11-15).

How to run them (tools/playtest/play.sh, Sonnet testers):
- **Test cards go into a starter deck, temporarily for that test.** Swap them in for cards of the same cost. If a card's effect needs supporting cards (fodder for Offering, things to die for discard pull), add those too.
- **Testers redraw any opening hand with fewer than 2 lands**, as the creator always does. Two lands plus cheap cards is a keep. RULES.md says so.
- **Ask about the deck and the out-of-band cards**, with each card's role (stands alone, enabler, fodder), without saying which way the bot test points.
- **Ask for the game as a whole too:** key frustrations, where the game misses most, and suggested improvements.
- Record the results in breachline/PLAYTESTS.md.

The creator's session limits are comfortable, and they offered about $100 of API credits for bigger series. A batch of 14 games is fine when asked for.

**Why:** the creator's play experience and Claude's reads catch what random-deck bot lift misses.

Related: [[quick-balance-check]], [[prefer-buffs]], [[mechanic-verdicts]].
