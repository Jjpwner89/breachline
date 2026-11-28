# The creator's playtest, 2026-11-23, build d49e666 on :8792 (mild winter)

The creator's rule: **build nothing until the playtest is done.** These are notes and first diagnoses only. Screenshots are in this folder (shot-1 … shot-8).

## Their verdict so far (minute 22)
- **"So far, pace feels good."** At minute 20 they made their first medium-scale expansion, building a whole neighbourhood at once because they were rich. At minute 22 they were scouting villages around them for a first attack.
- **20 armed levy swordsmen** crushed the second raid and lost no one ("very effective"). The first raid cost 6 villagers.
- **Hauling:** they were impatient early ("my haulers got to it and the village is growing, I was being impatient"). Their first storehouse was going up at minute 3.5.

## Notes, each with a first diagnosis
1. **Spring looks like winter at the start.** Snow thaws over spring's first 40 s, so a new game opens snowy. A new game shouldn't show the thaw: start with no snow, or skip the thaw in the first spring. (Fidelity, look.js SEASON.uSnow.)
2. **The Newcomers and Stores lines are too busy** (shots 1, 3, 4, 8). The creator: "will need a new design… too busy… more intuitive. If I hover I should get the reason, but all this text is distracting." Make them compact, perhaps an icon and a number or a small bar, with the reason on hover. (UI, townhud.js; Places owns larderForecast.)
3. **"Newcomers: none (the village is unhappy)" while the village shows Content (69)** (shot 8). This is a bug in the wording.
   - economy.js `settlers()` names a block only for no room, under attack, or food === 0. Otherwise townhud.js:335 falls back to "the village is unhappy".
   - In shot 8 the larder is 1.1 min, so food = (1.1−1)/3 ≈ 0.03, and the rate is under 0.05 because food is thin, not because of mood. The label lies.
   - Fix: name the real limit, i.e. the smallest of food, mood and repute.
4. **"Stores: 41 meals" while the food stock reads 101 ▲42** (shots 3 and 4: 123 against 179). The forecast counts only food in stores, not food still in the farm yards. So it reads "1.2 min" while food is piling at the farms. Either count food in yards, or say "41 in stores, 60 at the farms". It is part of item 2's redesign.
5. **Notices overlap** (shot 2): the "Building is held up…" notice sat over the autumn herald card, so neither could be read. Stack or queue them. (UI.)
6. **Wall elements need icons** in the Walls build tab, like every other building. (UI or Art: 2D icons, Codex brief if none are free.)
7. **Missing icons** (shots 5 and 6): blank goods in the stock panel's MADE and ARMS rows and the bottom chips, and in the weaponsmith's OFF recipes (inputs and outputs with no icon). Find which goods lack an icon. (UI or Art.)
8. **Torches flicker** when units move. Paused, only one torch is lit at a time and it looks good; playing, they alternate on and off. This is likely a point-light budget reassigned to the nearest torches each frame. Keep the lights steady: a fixed assignment with hysteresis, or emissive glow for the far ones. (Fidelity.)
9. **After the second raid, everyone crowded at the keep** (shot 7) instead of going back to work. Speeding up time didn't clear it; save and reload did. This is a state bug that a reload clears: villagers left in shelter or muster state after the alarm or levy disbanding. (Places or economy.)
10. **"localhost refused to connect" on save and quit.** The :8792 server process was found restarted (PID 14308 → 59277), so the server was down at that moment. It was our local serve, not the game's quit, which goes to index.html. The orchestrator will watch the server.
11. **Return to work about 25% faster.** Stood-down villagers run at 3 m/s. The creator: "they look like they are kind of hustling, could they go like 25% faster on return to work? dont want the same run as when mustered". So about 3.75 m/s. (Places, CALL settings.)
12. **"I want to be able to start rebuilding"** after losing 6 villagers to the first raid. It resolved once the haulers caught up and newcomers resumed. Worth asking whether they wanted something more: a "rebuild" ask, or faster regrowth after a raid.

## Second batch (minutes 26 to 46)

### Verdict: the midgame lands
- **Growth:** at minute 26 population stalled with 100 food at the farms, and the haulers cleared it again (the same pattern as item 4). By minute 30 the village was "starting to grow pretty fast". At minute 34 the population "started to explode", when their farm growth came in and they started on happiness buildings.
- **Uncrewed buildings:** at minute 30 several were uncrewed because "I built too many buildings maybe". They called it "interesting". This is the see-saw working, not a complaint.
- **First town:** taken at about minute 42 to 46, which "felt like a good fight". The next step is to "turn this into a growth engine".
- **Combat and march pace (setting F, march C): LANDED.**
  - "Combat is a bit slower which really raises the tension."
  - "Same with army movement on the big map, I like that it takes time. It feels like my units are coming back from campaign."
  - "It also raises the cost of war in an interesting way: they can't contribute to the economy for a bit longer, so that is really cool."
  - **Protect this:** soldiers away from work are the cost of war.

### New notes, each with a first diagnosis
13. **Buildings still have the glowing orb.** This is the torch glow they disliked earlier ("the glowing orb looks kind of weird"), and it is still showing. Take it with item 8's torch flicker: the same lights, so one Fidelity pass covers both.
14. **A long run of chimes, about 30 of the same sound in a row**, played in order. It happens especially after they log back on. It is "really annoying".
    - audio.js `chimeLog()` plays a chime for every new line in the world log. The only limit is the notify/alert gap of 1.2–1.5 s, measured on the audio clock.
    - **Likely cause:** news that arrives while the tab is away, or while the audio clock is stalled or resuming, gets queued and then released one after another.
    - **Fix:** one chime per batch of news. Lines that arrive on load, while the tab is hidden, or in a catch-up burst don't chime. Perhaps also a cap of a few chimes a minute. (UI or audio.)

**Item 14 FIXED in c22449b (2026-11-24), at the creator's ask: "max 5".** The real cause was news.js, not chimeLog: a "New" line with no clear spot re-raised its unlock chime on every reshow. Now each one chimes once, and all chimes are capped at 5 a minute. 8792 is serving it.

## Third batch (minute 48)
- **Second town taken without a fight:** they came with 128 men and the town yielded. Their army was two units of arrière-ban plus a decent army from the capital.
- **First declared war, on House Dunmore.** "Let's see if it works out!" Watch for how the house war feels: the league and coalition answer, threat awareness and relief, and whether marches C keep it tense.

## Fourth batch (after minute 48): the Dunmore war
- **Took Dunmore's weak market town without a fight, then asked for peace, and Dunmore accepted.** Dunmore is "about my match". Its 100 men sat in a double-walled city against the creator's 128 (weak arrière-ban). "Nice job, that feels like good scaling!" They would likely have lost, so now they'll build a siege workshop ("which is great!").
15. **Peace came too easily** (to look at after the playtest). "If we are that close in power and I just took their place, then they should be mad at me and not that eager to make peace."
    - The current rule, in diplomacy.js `act('peace')`: a house accepts your offer if the war score is 25 or more, OR you are 1.6× stronger, OR its opinion of you is above 5, OR the war has run over 25 minutes (a coin flip).
    - Taking a place is +25 score at once, so one capture always qualifies. It also costs only −8 opinion.
    - **The creator approved this direction (2026-11-24): "your suggestion on diplomacy is good". Build it after the playtest, not now.** A fresh loss at even strength should make a house want the place back, not peace. Weigh strength and the grudge ('took' already sets wantsBack). Perhaps it asks for the place back or for gold, or only accepts once its counter-attack fails.
16. **Send the arrière-ban home early,** so you restart its timer on your own schedule. Today it serves 800 s, then rests 300 s, and can't be dismissed.
17. **Call the ban from one village, or from all at once,** so you can rotate bans or raise one big force. Today one call raises every place you hold, to one destination, and shares one timer (arriere.js).
- **The creator's question, answered in chat:** how opportunistic are the houses (Varn beside their stripped side)? See the reply of 2026-11-24.

- **Verdict, after the Dunmore peace:** "it is going really well though. pace feels really good so far."

- **Merc ladder landed (minute 50):** sellswords are now affordable, but they would take most of what the capital earns and two thirds of all their gold. "Which is great. Feels more balanced." Keep the 21-a-man price and the cap.
18. **Ironman should also save as you exit** (after the playtest).
    - Today ironman only autosaves every 45 s of game time (campaign.js autosave). Quit doesn't save, so up to 45 s are lost.
    - The menu doesn't warn either: menu.js plan() treats ironman as "saves itself", so there's no prompt.
    - Fix: on Quit, and on pagehide or tab close, ironman saves first when it can.
    - During a battle (saving waits for it to end), leaving should still warn, as it does now. Otherwise quitting mid-battle could become an escape hatch, which ironman exists to prevent.

## Fifth batch (2026-11-28, back in after a break)
- **Dunmore sued for peace again after the creator took Rookdale,** but only once the creator had grown a good deal stronger. Better than the first peace, and it fits item 15's direction.
- **Fending off Dunmore's raid:** they hired a mercenary band and household guards. The notice that Dunmore was gathering a host came through and worked.
- They accepted Dunmore's peace because they need to build siege equipment.
19. **Raiders kept attacking after peace** (implement later). When the creator accepted, Dunmore's raiders already in their village fought on. They should retreat on their own the moment peace is made. That covers raiders in a village fight, armies on the march to the other side's places, and any siege under way. Check makePeace for whether it recalls armies already engaged: the village battle in town mode, plus field and world armies.
20. **Lots of goods stuck in a newly taken town's keep, which gets in the way of barracks training** (look later; the creator is letting it resolve). They suggest "maybe troop training should count stores in the keep?"
    - First read: economy.js `trainCheck` already counts the whole village's stock, keep included, via `this.free(g)`. So the snag is likely one of two things:
      - **Hands:** a new town's small population leaves too few haulers to carry kit between the keep and the barracks, and the keep has only 2 jobs.
      - **A rule:** veterans or drill (a new town has no veterans).
    - Next time, note the barracks button's greyed reason to tell which.
    - Possible fix: a captured town's keep goods count for training at once, or the barracks draws kit straight from the keep with no hauling.
21. **An army arriving in your village is stacked on itself** (shot 9). At night on a road, five regiments overlap in one clump: heavy cavalry, Fenn's lances, two levy swordsmen and levy archers, with their torches all in one knot. "It should not be stacked on itself like this."
    - Likely cause: every regiment of an arriving army is placed at the same entry point (the road edge) and only spreads out when moved.
    - Fix: arrive as a column along the road, or set each regiment out side by side in formation on arrival, so none overlap. Check both: marching into your own village, and coming home from campaign.
22. **No marching through other houses' lands by default** (a design change, for later). A large Varn host marched through the creator's lands, and the creator wanted to declare war over it. Other factions' armies should not pass through your lands, or a third house's, by default.
    - **Today:** world.js `roadOf(side)` lets an army march through places it owns and through those of anyone it is not at war with. Peace means free passage.
    - **What it would need:**
      - a right of passage: asked for in diplomacy, granted to allies, vassals and the sworn, and perhaps sold;
      - routing that goes around the lands of houses without it;
      - a plan for houses boxed in with no road out: ask for passage, or treat a trespass as a cause for war;
      - an "X's host is trespassing in your lands" notice, perhaps with a demand that they leave, and a grudge if they refuse.
    - **Watch:** it changes how every house reaches its wars, so the AI routing and sims need a pass afterwards.
23. **Arrows shouldn't count toward the full number of arms.** A village with few weapons can show about 300 arms because arrows are counted man-for-man. Count them as a quiver's worth (for example, 24 arrows equal one archer's arms), or list them apart from the arms total.
24. **Default recipes for each village** (a request; the creator thought of Count-level production focuses first, then preferred this).
    - The problem: too much leather armour and too little leather. To stop the tanneries making armour, they have to track down every tannery.
    - Wanted: set each village's default recipe for a kind of workshop once (all tanneries: leather only), and every building of that kind follows it unless set by hand. Perhaps one switch for the whole realm too.
    - **Default change:** workshops should not make their derived goods unless asked. A carpenter makes no shields and a tanner no leather armour until you switch that on.
    - **The creator's verdict: the supply chain is working very well.** "This is an example of the supply chain concept working very well though tbf. The fact that I have to put in this thought is good. I am doing all of this so I can get more advanced troops." Keep the thinking; cut the busywork of tracking buildings down.
25. **Recurring shipments, or a single-good run with an exact amount** (a design for later; the creator's own sketch). Raw goods pile up in some villages while others are tied into industry, e.g. iron ore from a mining village to a smithing town.
    - **Today** (world/supply.js sendRun): a one-off wagon run takes a group of goods (everything but arms, food, building, crafting, or arms). It carries half of each good's stock, up to a per-good cap times the wagon size. Each village has one wagon on the road at a time (two with great wagons, at Count).
    - **The creator's design:**
      - pick ONE good, set the exact amount, and make it a standing (recurring) route;
      - an enforced caravan limit: pay more to send more, or queue several caravans;
      - while that route runs it takes the village's wagon, so you can't send other goods from that place at the same time. That's the trade-off.
    - **Fit:** the per-village wagon slot (`runsFrom(w, p) >= wagonsOf(0).out`) is already the "one at a time" limit. A standing route could hold that slot and resend when the wagon gets home. Great wagons (two slots) would allow one route plus one-off runs.
26. **"I also need to know how many veterans I have."**
    - Today the count only appears in the note on a selected barracks or knights' hall: "Veterans (N in the village)" (townhud.js:493 and 499).
    - Show it where you plan: in the village's people line or stock panel, and per village on the Realm screen, with the realm total. Perhaps flag it on the barracks button too.
27. **Varn bent the knee a little early.** The creator had raised a large army and was stronger overall. They were strong near Varn's capital, though Varn outnumbered them in one part. They were about to crush Varn and "kind of wanted to play out that series but didn't get to". They'd have accepted anyway. Look at when a house offers to become a vassal: maybe only once its field host is beaten, or once it has lost places, not on the strength ratio alone. Related to item 15 (peace too eager).
- **Verdict at the end of the playtest:** after Varn submitted, the creator is "way stronger than everyone on the map", and "almost there" on Duke on a legit playthrough. "Have really been enjoying it. Interesting issues to solve throughout and had some fun with the war mechanics." Ready for the changes and a new playthrough. **PLAYTEST DONE** (2026-11-28).

## The creator's corrections to the list (2026-11-28)
- **Item 7, missing icons, is a BUG, not art.** The same goods showed their icons before and after; they go missing only sometimes. Look for an icon lookup or load race, not a missing file.
- **Item 20, the keep and training:** the creator means "combine the barracks and keep inventories when deciding if you can train troops or knights".
  - Code read: trainCheck → `free(g)` = `stock[g]` (every active holder in THAT village: keep, storehouses and barracks, plus crates in hand) minus `owed(g)` to building sites. So the keep is already counted within one village.
  - Likely real causes:
    - the goods sit in one village's keep while the barracks is in another village;
    - goods owed to building sites in the newly taken town are held back;
    - the reason was veterans or gold.
  - Get the greyed reason, or reproduce in a test before changing anything.
- **Correction to item 20: the creator was right and the orchestrator's first read was wrong.** Two paths:
  - Drilling veterans (trainCheck) counts the whole village's stock.
  - **Raising a levy** (levyCheck and raise, economy.js:1026–1049; spearmen, archers, swordsmen, cavalry, light cavalry) counts **only this barracks' own racks**: "Kit is taken from this barracks' own racks, so it has to be carried there first."
  - So 35 horses in the keep raise no cavalry until haulers carry them to the barracks.
  - **The creator's fix:** count the barracks plus the keep and storehouses when raising. Take from the racks first, then from the stores.
- **Item 25 DECIDED (2026-11-28): custom shipments, not a standing route.** The creator: "if you can send as many of a good as you want, then you don't need to send multiple trips on a schedule… I don't think I will be building a complex supply chain over multiple villages."
  - The design: ONE good per shipment, any amount ("300 iron ore, Millbrook → Ashford").
  - The village's wagon carries a wagon-load per trip and shuttles until all of it is delivered, then stops. Nothing else ships from that village meanwhile; great wagons give a second slot.
  - Better wagons mean bigger loads and fewer trips. Every trip is a wagon raiders can take.
  - No cap per order. The existing group runs stay for mixed loads.
