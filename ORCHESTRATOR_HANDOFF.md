# RTS orchestrator handoff (2026-11-21, about 07:00 UTC)

This session (the question thread) is the RTS **orchestrator**. Read the memory notes rts-orchestrator, rts-north-star, rts-build-process and rts-token-economy first.

## Mandate
The creator's overnight mandate: make "the best damn strategy game from this skeleton", like Mount & Blade and Prophesy of Pendor.
- The climb runs from very low to very high, and improving that journey is the key.
- Look and feel are key: interface, fidelity, animation.
- Free to add or cut.
- Free assets are encouraged, and paid assets are never allowed. Codex does 2D only (it checks assets/art/BRIEFS.md every 20 minutes). 3D and animation are ours to find or make.
- All sessions run in auto mode. Credits are on, but watch the token economy.

## Shared notes folder
The linked sessions' shared notes (qc-handoff.md, manager-handoff.md, the player summaries) are in `/Users/dpuser/Library/Application Support/Claude/side-session-notes/local_277754a1-820d-4804-a7d0-4255e39b0778/`. That's under Library, so a plain `find` over Documents misses it.

## How the work flows
A session builds a batch, then the **Manager** (local_ae8b4fa1-9cc7-44ca-873c-4367b6fa3dc5) reviews it, then **rts-qc** plays it, then I do a hand look plus checks(), and only then does the creator hear about it.

Verify by unpacking main with `git -C ~/Documents/Claude/Games/RTS fetch && git archive origin/main | tar -x -C <scratchpad>/rts-serve`, then serve with preview "rts-latest" (port 8792). Never commit in Games/RTS. Mute (localStorage rts.audio master 0), restore the sound after, and close the tab.

## Sessions
- **Opus:** Manager, rts-climb (local_4bc7ecb5), rts-fidelity (local_32e12038), Art (local_a8838fef), animations (local_fe2ccecc), Battles (local_67778a96).
- **Sonnet:** rts-qc (local_65c8956f), playtester (local_4874314d), rts-assets (local_13b8a5ef), rts-feel (local_d928e5db), rts-ui (local_fe70d310), rts-places (local_b9cb3a6b), militia (local_256ff60d), vassals (local_a9ad58fa), audio (local_2b001e78).
- If a Sonnet session keeps failing, flip it back to Opus.
- I started rts-qc, rts-places, the playtester, rts-ui, rts-fidelity, rts-feel, rts-assets and rts-climb, so I can clear them and change their model.

## Pending as of the handoff
- **Fresh starts (07:10 UTC):** QC and fidelity cleared and were told to resume (fidelity's note: its old scratchpad 450cb6dc…/fidelity-handoff.md). The Manager hadn't cleared yet (135K, fine). The creator confirmed: keep clearing bloated sessions with handoff notes. When telling a cleared session to resume, give the note's full path, since it can't remember where it put it.
- **Audio:** the 3 sound names pass checks() with stand-ins (1b8be55); real CC0 sounds and sound for the new features are next. It clears once its sound-search agent reports. Resume it with its note at /private/tmp/claude-502/-Users-dpuser-Documents-Claude-Games--claude-worktrees-recursing-northcutt-e53550/098812a5-24fd-4d3e-9eac-9a9cad094767/scratchpad/HANDOFF.md
- **Playtester:** Round 2 is done (player-round2-summary.md in the shared notes), and its 11 priorities went to the Manager, worst first. Worst item: hand-storming a palisaded village is a meat grinder, while auto-resolve wins it easily and "Storm it" is the blue default. It has cleared. Resume it for Round 3 on fresh main with the count save, using its note at /private/tmp/claude-502/-Users-dpuser-Documents-Claude-Games--claude-worktrees-happy-tereshkova-5eb405/d8fcc0df-d537-4136-a8d2-d0f78ced4ed3/scratchpad/handoff.md. Its Browser pane must be visible, because when hidden the game clock crawls and screenshots fail. Held until the creator answers about pace.
- **Chapel freeze:** fixed. It's guarded in places.js (af9699a), and the vassals session fixed the source and added save repair plus a checks() row (50f186c). QC and my own look still need to confirm it: grant a build petition, then save and reload.
- **New on main by 07:12 UTC:** the look batch 1 (21415cf), Pace B walk and run (fea68d3), the shared picture setting (8d924d6, dc8a23c), the ram-loss storm fix (7058c38), world-map panels (e0f6c73), UI sounds (9533255) and animation libraries (2a0afb6). None of it is checked by hand yet; the browser pane was hidden.
- **Since the handoff:** rts-feel pushed dcc5229 and fd749e3, and checks() fails until Audio adds 3 sound names; Audio has been briefed. rts-places pushed war camps and mountain gates (4fa91d6).
- **Pace B (walk, run on order):** Art sets the speeds, Battles adds the Run order, and the Manager retunes the economy. QC measures foot slide afterwards.
- **Weapon fixes, with animations:**
  - the bow is reversed
  - the spear goes through the shield
  - the crossbow span looks like an aim pose
  - the javelin crown
  - the villager's sledgehammer
  - shooters glide when ordered off mid-reload
- **Battles:**
  - Coldden inner-wall stall (15eb6ec)
  - ram stall
  - the 1-in-8 step stop from the slot rule
  - the schiltron sliding sideways
  - the Swimming card state
- **Places:** awaiting the Manager's review, then QC: Normoor, re-laying old memories, the burgh, and abbeys and mines on the map (7f0d6bf, 78868a4).
- **Viewer batch 2** (the Places tab) has QC next.

## Rulings in force (also in DESIGN_NOTES)
- Rivers: the 70 m swim rule.
- Pace B.
- Titles at a sharper price.
- Muster costs kept, with clearer warnings.
- Call the banners never strips your armies.
- Sack, Occupy or Spare after a storm.
- Old place memories are re-laid.

## Things I've verified by hand
- the templates batch
- places (Kingsbridge and Ashley)
- the Realm and vassals batch

## Open for the creator
Nothing is blocking. Prepare a morning report: what changed, what I played, screenshots, and the questions I decided.

## Overnight (the creator went to bed about 02:55 local, 2026-11-21)
- The creator said keep working at full speed: credits are fine and the fleet runs on.
- This session runs a check-in cron at :13 and :43, and a one-shot morning report at 08:47 local. Both are session-only, so if this chat is cleared, set them up again.
- New creator goal: 1200+ man battles at the count and duke stages. The Manager is having Battles and fidelity bench 300/600/1200 men, aiming for 30 fps on Medium. It's in memory under rts-north-star.
- Creator bugs from a fort storm played by hand: men can't path through broken walls, and some dead men stay standing. Both are with the Manager.

## For the morning report
- The graphics batch (light, sky, textures, water, trees, picture setting), Pace B walk and run, war camps and mountain gates, and greyed buttons that say why.
- QC batch: new campaign fine to 17 min, Coldden inner gate fixed. Broken: the village orders bar overflows, the silent "Waiting at Coldden", a stuck Dunmore spearmen check, a notice over Begin battle, crossbow and catch-up foot slide.
- Playtest round 2: the palisade hand-storm is a meat grinder (the worst item); loot payoffs are the best part.
- Fidelity fps: battle 22 on Medium, 16 on High. Told to reach Medium 30+ before vegetation.
- The network dropped around 07:40 UTC; all sessions were restarted.
- Playtest round 3 interim (state checks only): the worked-out workers fix (aacbeb7) is confirmed. The ram-loss storm fix (7058c38) is NOT fixed: a new mine is always being dug, so the axes never come out. That's with Battles via the Manager. The playtester was offered headless Chrome over CDP, since the pane stays hidden overnight.
- For the creator, things only a person can fetch (from the Manager): (1) the KayKit Character Animations free zip from itch (fishing, hammering, sawing, digging); (2) Ankers Low Poly Medieval Weapons (CC0 siege engines), a browser download (Kenney Castle Kit 2.0 turned out to be in the game already, 87a8fb7); (4) Freesound CC0 catapult, ram, volley and dog-bark candidates (IDs in assets/scout/sounds README), where someone must read each page's licence. Also (5) licence reads for the Devil's Work.shop snowy trees and the CMU mocap falls. There are no free clips for winch cranking, rope hauling, siege loading, scything or carrying a sack, so those stay in code.
- Asset batch 5 (acc28f8): 33 CC0 sounds for Audio to wire. The interface round 2 fixes (eee7f7b) and the order hints (9fb9e65: engines against walls, and a peaceful place waits for a war declaration).
- Routing: QC's fails on 71a580f and 94d2756 went to militia (retinue and militia don't engage outlaws; the attack order on band 2) and to climb (opening warning, band sizes, raid result lines, herald portrait). The economy retune passed.
- QC passed vassals 9ef5ca9 by hand (worked-out deposits, Find a deposit, checks() 52/0). Weak: the toast hides behind the stock panel, and a worked-out quarry still offers an upgrade.
- The asset scout finished its 3 priorities (animations, textures and skies, 33 sounds). It's now on death and fall clips per look (for the standing dead), vegetation for 1200-man battles, and re-checking the siege engine leads.
- QC played Battles' f8c0f01: walled places now default to Auto-resolve, moves inside the walls break one shared gate first, and the AI turns to axes after two lost mines (the ram stall is fixed). Still weak: storming Brackdale by hand cost 57 of 107 men, and the terms card went unseen. That's with Battles; it's the creator's worst-felt item.
- QC rechecked the Interface fixes and the tournament (win and lose cards, purse changes) at 527×549: all pass. The stuck-buildings line has moved under the keep (be4639f).
- Playtest round 3 (seed 77, played by hand in headless Chrome to 38:50): Lord at 35:11 by taking unwalled Bradford. Frustrations: wood at 0 for minutes 3–20, food crunches, events repeating (5+ modals), 22 of 38 people idle, an outlaw raid over in 6 s at 4x with no auto-slow, the "No workers" flood after a capture, the goals panel lagging, and 1 minute of muster food beyond your lands. My call: early-game pacing is now the climb session's top item (sent to the Manager).
- The headless Chrome driver (cdp.py in the playtester's scratchpad) solves the hidden pane overnight; shared with QC and the Manager.
- QC played climb round 3 (35e2d5b). Passing: the "March on Coldden?" prompt with Declare war and march, peace or stay, which fixes the silent wait; Call the banners on Count. Fail: the Count save's knights' hall has no kit, so nothing can be trained. Weak: "hearths are cold: needs firewood" shows with 243 wood in store, which ties into the wood-flow item.
- Vegetation (329a740): 129 Kenney Nature Kit models plus dead trees, for fidelity. The death and fall clip search is still running.
- QC cleared again and was resumed from its note in the shared notes folder.
- The Manager gave early-game pacing to the vassals session (it knows the town code; climb's queue is long). I accepted that. Muster food: the carts didn't count bread, fixed in c054b35. Full carts last 4 minutes, about 1,400 units of road beyond your lands, so the playtester's 1 minute came from an empty larder. Climb still fails the goals check on the Lord save. The interface leftovers are on main (259cc23).
- **The usage limit stopped every session at about 03:20 EST; it reset at 06:50.** About 3.5 hours were lost. Extra usage now shows as OFF ($37.46 of $200 spent), so this window is the budget until about 11:50 EST. At 06:52 I restarted the Manager (which restarts its own sessions), QC, climb, fidelity and UI. I held the playtester (hand play is costly; round 3 is final in player-round3-summary.md, and the palisade click-log storm, the count tools and the duke save are still open).
- Since the last report, on main: death, hit and fall clips (f7c11b5), the war dogs on the wolf skeleton (1d14314), an attack on your village dropping the game to 1x (ec67e4c), the bread carts fix (c054b35), home soldiers driving raiders off (21463d5), and building pins thinned (d3aad0f: a captured village went from 35 pins to 0).
- Playtest round 3 final: a knights' hall at Cranholm Castle stalled at "Materials on the way" 0% for 570 s. That's with the Manager.
- The cron check-ins queued up while blocked and fired together; that was harmless.
- UI and fidelity handed off; I cleared both and resumed them. UI's note: shared notes/ui-handoff-2026-11-22.md. Fidelity's note: its old scratchpad 450cb6dc…/fidelity-handoff.md.
- **Scale finding (for the morning report):** battles are limited by the graphics card, not the game logic. With 1276 men on Medium a frame takes about 40 ms (about 25 fps). The game logic takes about 5 ms; the men take 15–20 ms, because every one is a 1.2k–2.4k triangle mesh drawn twice (shadow and main pass). The fix in progress is a far LOD at about 25% triangles plus MSAA 2 on Medium. The 300/600/1200 bench (prof.html?men=N) is built and runs next. So 1200 men already run at about 25 fps, and 30 is in reach.
- Check-in at 06:55: the linked sessions are all running again. The Manager's builders were still idle since 03:20, so I nudged the Manager to restart them, in priority order: vassals pacing, Battles storm and pathing, animations death clips, Audio sounds.
- 07:00: the Manager restarted vassals (economy, events and the stalled hall), Battles (storm losses, then broken-wall pathing), animations (death clips, then the far LOD), Audio (the 33 sounds) and fidelity. Militia's queue is empty. UI and fidelity are running fresh from their notes.
- **App behaviour to know:** the app pauses a session's outgoing messages after 10 in a row with no user message. That's why the Manager went quiet from 03:20. Overnight, relays can stall; check transcripts rather than wait.
- Scale numbers: 1276 men take 39–45 ms a frame, 25 ms without men, and a quarter of the triangles gives 26 ms. So the far LOD should reach about 38 fps at 1276 men.
- The knights' hall stall is a real bug: it reproduces on d3aad0f, with a builder standing 5 m short of the site holding 20 stone in 'deliver' for 590 s. It's with the Manager and vassals. The 'No workers' flood is already folded on current main, so it's not an open item. The playtester has stopped; round 3 is complete.
- **Scale bench (for the morning report), before the far LOD, measured in headless Chrome on the real M1 Pro GPU:** Medium draws 300, 600 and 1276 men in 18.1, 21.8 and 25.7 ms. That's about 7.8 ms per 1000 men on top of a 16 ms field, so **1276 men run at about 39 fps on an idle GPU** (about 29 fps while other sessions share it). High is a flat 47 ms at every count: its problem is fixed costs (dpr 2, 4096 shadows, AO), and it's fidelity's next target. The CPU is small (sim 2–2.5 ms). The far LOD, no shadows on far men, and MSAA 2 on Medium are in progress.
- Climb rounds 1–4 are on main (90a3aad). It handed off; I cleared it and resumed it from shared notes/climb-handoff-2026-11-21.md, starting the Duke batch.
- Playtest round 3b (main 2e81eaa, seed 91, 19 game minutes): the early-game fixes work. Wood stays at 50–130 all game, houses get built, cards show food and room, ruins clear in about 3 minutes, and the outlaw warnings read well. Still open: soldiers go out only 90 s into a raid, an unanswered raid costs 161 food and 116 gold, and the carpenter site waited 6 minutes with no builders because every villager had a job. Notes: player-round3b-economy-check.md.
- QC checked militia, raid speed, climb round 4 and interface batches 4 and 5: nothing broke, with four small findings (GENRE_BASICS ac678b2). Still unchecked: tribute, the spy label, the weak captain, the Pace B leftovers and war camps.
- UI finished its queue items 1–4: the Goals panel, news strips and march notice (75a6693), battle cards (ea308c3), the Realm frame (baea265), parchment menus, credits and muster (e7e955a), and why() on the wagon and Gather buttons (d5fa14a). Next: hand play at the Duke and Lord ranks at 1024 px. The checks() fail on ?test=duke and the villager idle in the hall are with the Manager.
- **Battles round 4 (2871574, 2e81eaa) answers the creator's storm items; on main, with QC for hand play:**
  - The Brackdale hand-storm now loses 22–28 of 107 men (it was 76), against auto-resolve's 24.
  - Half the villagers survive a capture (it was 6 of 36).
  - The AI's storm draws off when the gate won't fall.
  - Breaches open along the whole broken stretch, and men re-route to the nearest one.
  - Dead men without a death clip now topple, with a new checks() row.
  - Battles is now on the 1200-man bench.
- Interface batch 7 (c38febd) passed QC, along with the Realm screen, the parchment pages and the audio credit audit. Sound still needs the creator's ear: no session can listen.
- 07:25 hand look on main a448a4a: battle.html?mode=siege checks() passed 14 with 0 fails and 2 warns (the stuck-for-a-minute check needs game time; models). The new "every dead man lies down within 2 s" row passes. No screenshot: it was a background tab. **Mistake:** I reloaded the creator's own siege battle in the seed tab (they had been playing in it, with 98 clicks) when I meant to load a fresh one. Their sound settings are unchanged. Rule: when the pane is displayed, check tabs_context and the tab notes first, and use a new tab, never the seed tab.
- **The 1200-man target is met on Medium:** the far level plus MSAA 2 (2730ca4; profiler f2355fc) brings Medium at 1276 men to 11.2 ms, from 16.4 under the same load. The 25% far mesh from animations should take it to about 10.2 ms. (The earlier 25.7 ms was inflated by other sessions' GPU use.) High is 20–30 ms; its fixed costs are next after vegetation. My call: vegetation first, with Medium at 1276 men kept under 20 ms and regiments kept readable.
- UI's queue is empty after c38febd; the Manager has it on rank-growing UI by the worst GENRE_BASICS rows. QC passed interface batch 6, 37f9f4d and the audio wiring (by ear is still unchecked).
- The climb's Duke batch (459f2db, dd5ad41): a league host marches on your best place, a coronation card (largesse, a tournament or pardons), gold sinks (peace scaled to your purse, the 4,000-gold palace), and the goals "Become a duke" and "Take Kingsbridge". checks() passes on the Lord, Count and Duke saves. Open: nobody has beaten the host in a real fight yet, and a rival storm of Ashley Castle stalls off-screen (with battle and places).
- My call for climb's next queue: (1) rank caps that grow toward 1200 men, now that the bench holds; (2) beat the league host by hand; (3) King depth (factions and claims).
- **A question for the creator, morning report:** the game starts you as a village's lord. Pendor and M&B start you lower, as a lone wanderer with a few men. Do they want a "before the village" opening (mercenary or outlaw-hunter, then granted or winning a village), or is the village start the floor?
- Vassal marriages (33a28d1): a vassal can wed into a great house, which pays half the dowry, the vassal owes a favour, and the house warms to you. **My ruling** on how hard the match binds him (the creator can override): sharper but never a surprise. He refuses calls to arms against his in-laws, the marriage prompt and the banners preview both say so, and he rises with them only if his opinion of you is already low.
- 07:33: QC hit its context limit (325K), not the account's. QC's unstarted queue is battles round 4, the far LOD, animations 430b4c1, climb Duke, marriages, militia ×2 and the rest of interface batch 8; I'll clear and resume it once its note is ready. Account: 48% of the window used in about 40 minutes (extra usage off, resets 11:50). At this pace it runs out around 08:15, so no new sessions, highest-value items first. QC passed builder borrowing (1c1abab), the greyed Gather reason, the caravan notice, the Realm screen at 1280, and the villager-in-hall fix (4ce1083).
- Army caps by rank are on main (cb1f1de): Reeve 150, Lord 300, Count 600, Duke 1000, King 1200 men an army. But a duke can raise only about 400 (397 village people). **My ruling: rural levies (the arrière-ban):** each place raises 30 (Lord) to 60 (Duke) men from its countryside, costing gold to call and food to keep, home after about 10 minutes, no villagers taken. They're poorer troops; rivals can use it too. That gives a duke about 1,060 men. The climb builds it next, then King depth (?test=king save 9057fbb). Climb's note: shared notes/climb-handoff-2026-11-21b.md; I'll clear and resume it once its turn ends.
- QC can't be cleared: the creator has it open on screen and its self-clear was blocked. It's waiting; the creator can clear it, or close it so I can.
- Vassals pushed factions demanding a different king (e3c3107). Give way, and the members keep their villages on light dues and the claimant house becomes your ally; refuse, and they rise and their villages go over to that house. **My ruling** on the cost of giving way: add a one-time gold gift of about 15% of your purse, and no place lost. Climb was told to drop factions (vassals built them) and do great vassals with claims after the arrière-ban. Vassals is building the marriage-bind ruling.
- New trees (8a91427): Quaternius Ultimate Nature oaks, pines and birches up close, Kenney shapes far off, with bark in its own colour. Medium at 1276 men is about 14 ms (under the 20 ms budget), and regiments read as before. Bushes are next, then High. Climb was cleared and resumed on the arrière-ban. QC's clear is still blocked (it's open on the creator's screen, and the permission classifier denied it).
- Vegetation is done (8a91427, fed80d7). Medium at 1276 men is about 9 ms on the GPU, with a median of 60 fps. Bushes are unchanged: both scouted packs looked worse, and the next candidate is Quaternius Nature Pack Vol. 3. Fidelity is on High's fixed costs next. UI's c0081a4 (big orders into a walled place share one gate) is confirmed with Battles.
