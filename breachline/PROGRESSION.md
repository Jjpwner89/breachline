# Breachline progression

How players collect cards and move through the game. Built on 2026-11-10 in `rarity.js`, `progress.js` and `collection.js`, with hooks in the screens, the deck builder and the battle UI.

**Still to do, last, after the balance thread (creator, 2026-11-10):** retune the campaign enemy decks, then prestige difficulty, the lore codex, preset enemy units and saving campaign runs to the account. See "Campaign work left" below.

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

## As built

- **Rarities** are in `rarity.js`: 101 common, 68 uncommon, 43 rare and 9 legendary. They were drawn up from each card's cost and rules text within its colour, with the four Velunn plus Pride matriarch, Elder dragon, The observatory, Bought loyalty and Alderkin elder as legendary. A small gem after the card's type shows it. Adjust any card there.
- **Packs:** Field pack 100 gold (5 common, 2 uncommon, 1 rare with a 1 in 8 chance of legendary), Strongbox 250 (3, 3, 2 rares), War chest 500 (2, 3, 2 rares and a slot that's legendary half the time). An alignment pack costs 1.6 times as much. A pack never repeats a card.
- **Battle gold:** 10 for finishing, 40 more for winning, then 1 per unit, spell and land you played, 2 per enemy unit destroyed and 1 per point of damage to the enemy summoner. Claude Normal pays 1.25 times that and Hard 1.5 times, and battles in a campaign you've beaten pay 1.5 times. A typical win against the scripted bot pays about 95 gold, a loss about 40.
- **Campaign wins:** 300 gold every time. The first win of each campaign also adds its starter deck and the cards picked on the run.
- **Crafting:** spares beyond 3 break down for 5, 15, 50 or 200 shards by rarity; a copy costs 40, 100, 300 or 1,200 shards to craft. Crafting stops at 3 copies.
- **Milestones:** one of every card in a faction pays 150 gold and the title "Keeper of" the faction; three of each pays 400 and "Warden of". The titles are placeholders, and they only show in the collection for now.
- **Gold** and **shards** are placeholder names: nothing in the setting names a currency yet.
- **Publishing:** the page needs the `downloads` capability for the save file, alongside `sample`, `db` and `user`.

## Art wanted

Everything below is drawn in code for now, so it can be tested. Codex paintings can replace it later; briefs aren't written yet.
- Three pack wrappers (Field pack, Strongbox, War chest), plus a seal or band for each alignment.
- A backdrop for opening packs, and a tear or burst for the moment a pack opens.
- The glow or burst when a rare or legendary card turns over.
- Coin and shard icons, and the four rarity gems.
- A stronger frame for the battle summary, if the parchment plaque isn't enough.

## Campaign work left

- Retune the enemy decks so each campaign climbs steadily and the five clear at similar rates (numbers in `CAMPAIGN.md`). Waits for the balance thread.
- Prestige difficulty for campaigns you've beaten, with better gold.
- The lore codex.
- Preset enemy units, the proposal in `CAMPAIGN.md`.
- Saving a campaign run to the account, not just this browser.

## Claude's proposals, not yet confirmed

- **Campaign decks:** each campaign is played with its own starter, lent for the run, so a big collection can't make it easy and the campaign balance holds.
- **Card mastery:** playing a card enough times unlocks its alternate art. The unchosen paintings in `archive/` could supply some.
- **Breaking down:** only copies beyond 3 can be broken down, so a player can't break a deck by mistake.

## Saving progress

The collection is the one thing a player can't afford to lose. The save file is the creator's call; the rest was Claude's proposal, and it's all built.

- **The account copy:** the published page keeps progress in the viewer's private part of the page's database, as saved decks already do. Only that viewer can read it; not even the creator can. It survives republishes of the same page, so **the game must keep publishing to the same URL**: a new URL starts with an empty database.
- **The local copy:** progress saves in the browser first and syncs when it can, so the game keeps working without a connection.
- **A ledger, not just counts:** every grant and spend (a pack opened, a reward, a craft) is an entry with its own id, and the counts are worked out from them. Two tabs or two devices then merge without losing cards, and a reward tied to its battle's id can't be paid twice after a reload.
- **Chunks:** each browser writes its entries in chunks of 400, one database document each, under `data/users/<id>/progress/ledger`. A chunk only grows, so the longer copy always wins a merge, and the database's 256 KB document limit is never reached.
- **Campaign runs:** these save to this browser only today. Once a run can grant cards, it saves to the account too.
- **Renamed or removed cards:** entries naming a card the game no longer knows stay in the ledger and count again if the card comes back. A rename should map the old id to the new one; there's no mapping yet because no card has been renamed.
- **The save file:** saving goes through the page's `downloads` capability, and loading reads a file you choose. Loading merges the file's ledger with what's already there rather than replacing it, so an old file can't wipe out newer cards.
- **Signed out or outside Claude:** progress is local only, and the game says so, as the deck builder does now.
