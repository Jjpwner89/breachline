# Breachline progression

How players collect cards and move through the game. Nothing here is built yet. The creator wants the new board finalised first (2026-11-10), because the campaign retune depends on it.

## From the creator (2026-11-10)

- **Rarity:** every card has a rarity. Cards you don't own show in the collection and deck builder, greyed out.
- **Collection:** the game stores which cards you own and how many. The number matters.
- **Starter deck:** on first starting the game, you pick one of the five starters and get it free.
- **Campaign unlocks:** beating a campaign unlocks that campaign's starter deck. Any campaign can be played first; Vigil no longer has to come first.
- **Campaign cards:** you keep the cards you picked during a campaign only if you win the campaign.
- **Packs:** about 8 cards. Packs come in tiers, and the mix of commons and better cards varies by tier. Alignment-specific packs exist and cost more than mixed packs.
- **Currency:** finishing a battle earns some, winning earns more, and completing a campaign earns more again. It buys packs.
- **Battle summary:** at the end of every battle, a summary with the currency earned and the key facts: units, spells and lands played, with nominal points for them. It should feel weighty.
- **Crafting:** duplicates can be turned into cards you choose.
- **Prestige difficulty:** harder replays of a campaign you've cleared.
- **Lore codex:** wanted.
- **Sealed mode:** wanted later.
- **Unlock everything:** a password unlocks every card. The creator knows it; the code stores only its SHA-256 hash, `ddacf85d8604913b6b0fed3a41a18bb2a84858b58c9a0c2b1b7295692a9e6408`.

## Claude's proposals, not yet confirmed

- **Rarity tiers:** common, uncommon, rare and legendary, at about 45%, 30%, 20% and 5% of the 221 non-land cards. The Velunn are legendary. Rarity follows complexity and how much a card shapes a deck, more than raw power, though a rare shouldn't be weak.
- **Lands:** free and unlimited, never in packs.
- **Starters:** given whole, rare cards included.
- **Campaign decks:** each campaign is played with its own starter, lent for the run, so a big collection can't make it easy and the campaign balance holds. Beating the campaign of the starter you already own adds a second copy of its cards.
- **Copies above 3:** kept at their true count, though a deck holds 3. Crafting turns them into shards.
- **Exhibition:** your decks are built from cards you own. The opponent can use any deck.
- **The password:** sets an "everything unlocked" flag rather than adding cards, so it can be switched off without touching your real counts.

## Saving progress

Proposed by Claude. The collection is the one thing a player can't afford to lose.

- **The account copy:** the published page keeps progress in the viewer's private part of the page's database, as saved decks already do. Only that viewer can read it; not even the creator can. It survives republishes of the same page, so **the game must keep publishing to the same URL**: a new URL starts with an empty database.
- **The local copy:** progress saves in the browser first and syncs when it can, so the game keeps working without a connection.
- **A ledger, not just counts:** every grant and spend (a pack opened, a reward, a craft) is an entry with its own id, and the counts are worked out from them. Two tabs or two devices then merge without losing cards, and a reward tied to its battle's id can't be paid twice after a reload.
- **Campaign runs:** these save to this browser only today. Once a run can grant cards, it saves to the account too.
- **Renamed or removed cards:** owned cards with an id the game no longer knows are kept, not deleted, and a rename maps the old id to the new one. The campaign code currently drops unknown cards, which is fine for a run but not for a collection.
- **Backup file:** an export and import of the whole save, through the page's `downloads` capability, as insurance against a cleared browser or a lost account.
- **Signed out or outside Claude:** progress is local only, and the game says so, as the deck builder does now.

## Other ideas, for verdicts

- **Rivals:** beating an enemy deck in a campaign makes it an exhibition opponent.
- **First clears:** a bigger reward the first time you beat each chapter.
- **Collection milestones:** completing a faction's set earns a card back or a title.
- **Card mastery:** playing a card enough times unlocks its alternate art. The unchosen paintings in `archive/` could supply some.
- **Pack opening:** a short reveal that builds to the rarest card, in the same weighty style as the battle summary.
- **Match history:** your record with each deck, built from the battle summaries.
