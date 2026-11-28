---
name: rts-north-star
description: "The creator's RTS vision and overnight mandate (2026-11-21) — Mount & Blade / Prophesy of Pendor climb from very low to very high; clear UI that enables depth; full freedom to add or cut"
metadata:
  node_type: memory
  type: project
  originSessionId: ef6fad51-ab65-46d9-9d31-d37b489e718c
  modified: 2026-11-24T06:09:07.711Z
---

On 2026-11-21 the creator gave the orchestrator a standing mandate to "create the best damn strategy game from this skeleton", running overnight with wide autonomy.

The vision, in their words and gist:
- Like Mount & Blade and its best mods (Prophesy of Pendor): you start low and climb very high, gaining new mechanics as you rise and escaping loops that plagued you earlier. PoP was more brutal early and more exciting at the end.
- Depth should run from as low as possible to as high as possible; **improving that journey is the key**.
- Visual fidelity and a clear, easy interface that *enables* depth rather than suffering from it.
- Priority is even across all areas: fix whatever is weakest. **Looking and feeling really good is key too**: interface, graphical fidelity and animation (creator, 2026-11-21).
- Finding more free assets ourselves is encouraged (still never paid). Codex checks for art briefs every 20 minutes overnight, so briefs for what can't be found free get picked up quickly. **Don't rely on Codex for 3D assets or animation** (creator, 2026-11-21): find free 3D models and clips, or build them ourselves (rig tools, bakes, code); Codex is for 2D pictures and icons.
- All RTS sessions run in auto mode; keep them running overnight.

- **Scale goal** (creator, 2026-11-21): battles of 1200+ men at the count and duke stages, with army sizes growing toward that. **Performance is settled** (creator, 2026-11-22): spend no time on optimisation; the work is the mechanics that grow armies for rivals, the player and the player's vassals alike.

- **Floor of the climb** (creator, 2026-11-21): the game starts you as a village's lord; there is no opening before the village.
- **Downloads** (creator, 2026-11-21): sessions may download free (CC0 or equally free) assets themselves, including from itch and Freesound pages. They must read each licence first, and never pay or create an account.

- **Rivals play by the player's rules** (creator, 2026-11-21): NPC houses choose between economy and war the same way the player does. A soldier is a worker taken from work, kit comes from the same production chain, and armies cost upkeep. No abstract pools that let the AI skip the trade-off, and no AI-only caps or throttles either: if it swings too hard, fix the economics.

- **The first conquest is home-grown** (creator, 2026-11-21): no hired shortcut before Lord. The household guard unlocks at Lord, costs more plus a running wage, and can't be disbanded into villagers (like mercenaries), so bought soldiers drain the economy and never turn into free people.

- **What lands, protect it** (creator playtest, 2026-11-21): "i really liked becoming a lord and placing a lot of town templates and starting to accelerate my growth as i expanded ashford" (160 people against 300 homes in about 80 minutes). The field AI's house habits and orderly withdrawal also landed ("battles feel pretty good"). Balance work must not slow the Lord step, town templates or that growth acceleration. Also landing: paying off a threatening house; the early raids ("satisfying"); getting the barracks up just in time for the second raid; and the economy see-saw ("go too hard in crafting, then focus food, then weapons, then you realise you're missing some component so you monitor that for a bit, then your econ is good, then attack a weak nearby village"). Keep that see-saw: shortages should be readable and fixable, never removed.
- **Taxes come from development, CK2-style** (creator, 2026-11-22): early gold was too lucrative (the starter village made 24 a minute and nearly paid a household guard). A bare place pays little, built-up places pay well, and markets pay more through actual trade, not passively.
- **Gold now right; the midgame lands** (creator, 2026-11-22): after the CK2 tax, "if you want to support mercenaries and a large army you need to build up that portion of your economy". Minutes 15–45 are "really fun", not a drag. They reached Count at about minute 90 (one big town first). The orchestrator's pace target: Lord 25–40, Count 60–90 by style, Duke 2–3 hours.
- **Day and night** (creator, 2026-11-22): a longer day, with night, dusk and dawn kept the same length.
- **Plane playtest lands** (creator, 2026-11-22): the arrière-ban answer to a raid ("oh shit → I have a response → we won → now I can get them back… incredible loop"); leaving a battle to the captain; Norhold reinforcing a camp with 1,331 men so they had to run ("very Pendor-esque… scale getting injected"). Mercenary-bought snowballing "felt like I cheated" until Norhold answered it. Combat wish: slower, more spread, units locked in, tanky elites. They want sandbox battles to compare settings before picking. **Picked sandbox setting E** (2026-11-23: damage −50%, at most two men on a foe, softer chain-breaks) because "there is time to see the tide turning… you win the battle in seconds not minutes, which doesn't feel quite right"; wants soldiers to stay roughly in formation in contact (without awkward hanging back), and archers not left too weak. **Final pick: setting F** (E plus ranks held in contact, arrows at full), 2026-11-23. The creator likes the mercenary company cap by rank (Lord 1, Count 2, Duke 3). **The cap is the anti-rush lever; price is a quality ladder** (creator, 2026-11-23): about 12 a man for hired bandits up to 40 or more for knights. "if you save up a lot of money you can get a big bonus, but you really feel it, but not all mercs are super expensive."
- **March pace: setting C plus a 30 s raid break-off** (creator, 2026-11-23). Slower marches between villages, with an army going at its slowest unit's pace: foot about 83 s a place, horse 33 s, engines 125 s. Cavalry is the rapid-response force. Raiders get real time to plunder before foot relief arrives ("this way raiders would have some time to plunder"). **It landed in the playtest** (2026-11-23), along with setting F's slower combat: "combat is a bit slower which really raises the tension"; marches feel "like my units are coming back from campaign"; and "it also raises the cost of war... they can't contribute to the economy for a bit longer". Soldiers away from work are the cost of war, so don't speed marches or battles back up. Minutes 26–46 landed too: the first town was "a good fight", and too many buildings left uncrewed was "interesting".
- **Right trade-offs must pay off** (creator, 2026-11-22): the fun is a continuous run of economy trade-offs (wood vs farms vs houses, when to go to mines and quarries, foundation vs expansion). A player who made the right call must get the boon. Food starving at the farms while 500 meals sit in yards is the wrong kind of friction; too few storehouses biting is the right kind. Haul order: building sites (the player's own action), then food, then workshops, then the barracks. **The player manages their own goods**: no hidden reserves like "saving planks for building" ("If I run out of planks, I run out of planks"). Show rival strength in words ("slightly stronger", "badly outmatched"), not numbers.
- **Seasons approved** (creator, 2026-11-23: "i like seasons - put em in"), as in the seasons plan:
  - the harvest rhythm: **no fallow winter**. The season is just a modifier on farm yield (roughly spring 0.9, summer 1.1, autumn 1.3, winter 0.5), and the AI prepares for winter (creator, 2026-11-23: "basically the season is just a modifier on farm yield");
  - **the houses' campaigning season is PARKED** (creator, 2026-11-23: "i don't really like campaigning season at the moment, let's park that in favor of the simplified seasons"): no season term in the AI's war choices, and Norhold's winterRaids is unchanged;
  - heralds and a season ring;
  - armies abroad eat ×1.5 in winter;
  - snow.
  The creator feels "we are getting there on pacing".
  - **After the playtest (2026-11-28) the creator leans to the fallow winter as the default**: the mild winter "affected me early on, but eventually i built a good reserve of food then it wasn't an issue"; "im leaning towards fallow winters bc that way i would feel it even if i was prepared". Fallow becomes the default in the next build, with mild behind a switch.
- **Vassals come in at about five places** (creator, 2026-11-28): they ran five places by hand, Varn's submission took them to about ten, and "i was at the point where i would start needing vassals". The game's own weight pushes delegation at Count; no hard limit on ruling by hand is needed yet.
- **War by the odds** (creator, 2026-11-21): houses declare when they expect to win or the odds are about even; aggressive tempers sometimes go in at worse odds; rarely suicidal; a cornered house may make a desperate war and call for allies.

**Why:** the creator trusts that the orchestrator gets the core appeal and wants it to act like an owner, not a ticket-taker.

**How to apply:** anything goes — add features, cut what isn't working, even new setting elements (magic was their example of how free, not a directive). Go wide (10+ sessions). No sacred guardrails were set, but the build process still holds (verify before calling done; see [[rts-build-process]]). Log reasoning for big calls so the creator can follow in the morning. Related: [[rts-orchestrator]], [[rts-project]].
