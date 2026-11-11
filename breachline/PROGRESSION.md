# Breachline progression

How players collect cards and move through the game. Nothing here is built yet. The creator wants the new board finalised first (2026-11-10), because the campaign retune depends on it; everything below is ready to build once it is.

## From the creator (2026-11-10)

- **Rarity:** four tiers: common, uncommon, rare and legendary, at about 45%, 30%, 20% and 5% of the 221 non-land cards. The Velunn are legendary. Rarity follows complexity and how much a card shapes a deck, more than raw power, though a rare shouldn't be weak.
- **Collection:** the game stores which cards you own and how many. The number matters. Cards you don't own show in the collection and deck builder, greyed out.
- **Copies above 3:** kept at their true count, though a deck holds 3. Nothing converts automatically: you choose which duplicates to break down and which cards to craft.
- **Lands:** free and unlimited, never in packs.
- **Starter deck:** on first starting the game, you pick one of the five starters and get it free and whole, rare cards included.
- **Campaign unlocks:** beating a campaign unlocks that campaign's starter deck. Any campaign can be played first.
- **Campaign cards:** you keep the cards you picked during a campaign only if you win it. Card rewards come only until you first beat a campaign; replays after that pay boosted currency instead.
- **Packs:** about 8 cards. Packs come in tiers, and the mix of commons and better cards varies by tier. Alignment-specific packs exist and cost more than mixed packs.
- **Pack opening:** a short reveal that builds to the rarest card, in the same weighty style as the battle summary.
- **Currency:** finishing a battle earns some, winning earns more, and completing a campaign earns more again. It buys packs.
- **Battle summary:** at the end of every battle, a summary with the currency earned and the key facts: units, spells and lands played, with nominal points for them. It should feel weighty.
- **Match history:** your record with each deck, built from the battle summaries.
- **Crafting:** duplicates break down into shards, which craft the cards you choose.
- **Collection milestones:** completing a faction's set earns a card back or a title.
- **Exhibition:** your decks are built from cards you own. The opponent can use any deck, or a random one.
- **Prestige difficulty:** harder replays of a campaign you've cleared.
- **Lore codex:** wanted.
- **Sealed mode:** wanted later.
- **Save file:** you can save your whole progress to a file and load it back.
- **Unlock everything:** a password sets an "everything unlocked" flag rather than adding cards, so it can be switched off without touching your real counts. The creator knows the password; the code stores only its SHA-256 hash, `ddacf85d8604913b6b0fed3a41a18bb2a84858b58c9a0c2b1b7295692a9e6408`.

## Claude's proposals, not yet confirmed

- **Campaign decks:** each campaign is played with its own starter, lent for the run, so a big collection can't make it easy and the campaign balance holds. Beating the campaign of the starter you already own adds a second copy of its cards.
- **Card mastery:** playing a card enough times unlocks its alternate art. The unchosen paintings in `archive/` could supply some.

## Saving progress

The collection is the one thing a player can't afford to lose. The save file is the creator's call; the rest is Claude's proposal.

- **The account copy:** the published page keeps progress in the viewer's private part of the page's database, as saved decks already do. Only that viewer can read it; not even the creator can. It survives republishes of the same page, so **the game must keep publishing to the same URL**: a new URL starts with an empty database.
- **The local copy:** progress saves in the browser first and syncs when it can, so the game keeps working without a connection.
- **A ledger, not just counts:** every grant and spend (a pack opened, a reward, a craft) is an entry with its own id, and the counts are worked out from them. Two tabs or two devices then merge without losing cards, and a reward tied to its battle's id can't be paid twice after a reload.
- **Campaign runs:** these save to this browser only today. Once a run can grant cards, it saves to the account too.
- **Renamed or removed cards:** owned cards with an id the game no longer knows are kept, not deleted, and a rename maps the old id to the new one. The campaign code currently drops unknown cards, which is fine for a run but not for a collection.
- **The save file:** saving goes through the page's `downloads` capability, and loading reads a file you choose. Loading merges the file's ledger with what's already there rather than replacing it, so an old file can't wipe out newer cards.
- **Signed out or outside Claude:** progress is local only, and the game says so, as the deck builder does now.
