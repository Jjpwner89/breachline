# Fable brief: Hearth and Host (the RTS), 2026-11-28

You are taking over the RTS orchestrator seat (this session, the "question thread") for a big push. The creator wants you to **do everything you can to make the game better**, in two stages:

1. **Pure ideation.** Read, play and think. Write your ideas down, building nothing.
2. **Implementation.** Build what came out of stage 1.

**The usage rule for this push:** the creator is spending their Fable allowance on it: "however much it wants to do is fine w/ me so long as it is fable using most of my usage". Run any sessions you start on Fable, not Sonnet. This overrides the usual token-economy memory for this push only.

## What the game is

- **The game:** Hearth and Host is a medieval strategy game in three.js, with no build step, served as static files. You start as a village's lord and climb through Lord, Count and Duke to King. The ladder runs: a village economy, levies and raids, the arrière-ban, mercenaries, rival houses with tempers, sieges, vassals, Kingsbridge, and then Norrhold in the north.
- **The north star:** a Mount & Blade / Prophesy of Pendor climb from very low to very high, with a clear interface that enables depth and real economic trade-offs. Rivals play by the player's rules, with no AI-only caps.
- **Who plays it:** the creator and their sister. She plays on a laptop, so touch is out of V1. V1 ships online when the creator says "V1 done"; Pages publishing waits for that.

## Read first, in this order

1. **Memory** (`~/.claude/projects/-Users-dpuser-Documents-Claude-Games/memory/`). Start with `MEMORY.md`, then every `rts-*.md`. The most important are:
   - `rts-north-star.md`: the vision and everything the creator has said landed (protect it);
   - `rts-keep-it-simple-and-tense.md`;
   - `rts-build-process.md`;
   - `rts-roadmap.md`;
   - `rts-saves-may-break-until-v1.md`;
   - `rts-parked-features.md`;
   - `rts-test-ports.md`.
2. **The latest playtest:** `rts-playtest-2026-11-23/creator-notes.md` in this worktree, with shots 1–9 beside it.
   - It holds the creator's 27 notes and first diagnoses, plus their corrections and decisions at the end. Read to the very bottom: several items were corrected later (items 7, 20, 25).
   - This is the best evidence of what to fix and what to keep.
3. **The RTS repo** at `/Users/dpuser/Documents/Claude/Games/RTS` (GitHub Jjpwner89/RTS, branch `main`). Read these files there:
   - `HOW_WE_BUILD.md`: the process. It is binding.
   - `DESIGN_NOTES.md`: about 1,200 lines of rulings, the design bible.
   - `GENRE_BASICS.md`.
   - `ROADMAP.md`: V1, then V2 "Heroes", then V3 "Heroes and Magic".
   - `PARKED_FEATURES.md`: never build from it without the creator's go.
   - `README.md`.
4. **`ORCHESTRATOR_HANDOFF.md`** in this worktree: a long log of items 1–185.
   - Skim the last 30 or so items for recent state.
   - The early sections are history.

## The code map (RTS/src)

- **Campaign and world map:**
  - `campaign.js`: the main loop and `window.game`.
  - World logic: `world/world.js`, `world/rivals.js` (house AI: stance, war by the odds, plans, raids), `world/diplomacy.js` (peace, grudges, leagues, tribute, vassals).
  - The ban and wagons: `world/arriere.js` (the arrière-ban), `world/supply.js` (wagons and goods runs).
  - The map: `world/march.js`, `world/threat.js` and `world/relief.js`, `world/places.js`.
  - Saving: `world/save.js` and `world/saveslots.js`.
- **The village:**
  - `economy.js`: buildings, recipes, hauling, `levyCheck` (barracks racks only) and `trainCheck` (the village's whole stock).
  - `town.js`, `townhud.js` (village panels), `townview.js`, `townlabels.js`.
- **Battles:** `battle.js`, `ai.js` (the field AI), `view.js`, `fieldview.js`, `siegeview.js`, `walls.js`.
- **Interface:** `hud.js`, `realmscreen.js`, `ui/*` (`news.js` introductions, `menu.js`, `unlocks.js`, `tooltip.js`, `seasonring.js`).
- **Audio and look:** `audio.js`, `look.js` (seasons, snow, light), `fx.js`, `stage.js`.
- **Checks:** `checks.js`. Run `window.checks()` in the console; it returns `{pass, fail, warn, results[]}`.
  - Load the test worlds with `world.html?test=lord|count|duke`. Duke takes 30–75 s to load.
  - Run checks with the browser pane fronted: hidden panes give false fails.

## How to work

- **The shared checkout** at `RTS/` holds someone else's uncommitted art edits. Don't commit from it or switch its branch. Either:
  - work in a worktree or clone; or
  - commit by plumbing: `git hash-object -w` → a temporary `GIT_INDEX_FILE` `read-tree origin/main` → `update-index --cacheinfo` → `write-tree` → `commit-tree -p origin/main` → `git push origin "${C}:refs/heads/main"`. Write `${C}` with braces, because zsh's `$C:r` is a modifier.
- **The creator's game** is served on **:8792** from `~/.rts-serve/site`.
  - Start it with `.claude/launch.json` "rts-latest" (port pinned).
  - Refresh it: `git archive origin/main | tar -x -C ~/.rts-serve/site && git rev-parse --short origin/main > ~/.rts-serve/site/.served-commit`.
  - Refresh it only after a batch is verified. Saves may break before V1, but say so when a refresh would end their campaign.
- **Never touch the creator's save** (`rts.campaign.save` on the :8792 origin). Test on your own port with `?test=` worlds.
  - "rts-sandbox" in launch.json serves `~/.rts-serve/sandbox` on :8872.
  - When you look by hand, mute first: set localStorage `rts.audio` `{master:0, music:0, sfx:0, muted:false}` on your origin. A fresh tab, never the creator's; close it after.
- **"Done"** means played by hand in every view the feature touches, no console errors, checks pass, plus a new check for any bug you fixed. Say plainly what you didn't check.
- **Art:** Codex makes 2D art from briefs. 3D models come from CC0 assets or our own code, never Codex.
- **Write to the creator** in plain, warm English with no jargon. They're a designer, not a programmer.
- **Commits** end with `Co-Authored-By:` and the model line from the system reminder.
- After memory changes, run `bash claude-memory/sync.sh` in THIS worktree, then commit and push.

## Already decided by the creator (build these in stage 2)

From the playtest list in the notes file (numbers as in the notes):

- **Bugs:**
  - 3: "unhappy" names the wrong limit;
  - 9: villagers stuck at the keep after a raid;
  - 19: raiders fight on after peace; they should withdraw;
  - 21: an arriving army stacks on itself;
  - 18: ironman saves on Quit and on close (a battle still warns);
  - 5: notices overlap;
  - 7: missing goods icons come and go (a bug, not art).
- **Clarity:**
  - 2 and 4: compact Newcomers and Stores lines with the reason on hover; count food in the farm yards;
  - 26: veteran counts per village and on the Realm screen;
  - 23: arrows count as a quiver's worth;
  - 6: wall icons.
- **Look:**
  - 1: no snow at the start of spring;
  - 8 and 13: torch flicker and the glowing orb, as one pass;
  - 11: villagers walk back to work about 25% faster.
- **Economy:**
  - 24: default recipes per village, and workshops don't make derived goods by default;
  - 20: raising levies counts the barracks plus the keep and storehouses, taking from the racks first;
  - 25: custom shipments: one good, any amount, shuttled in wagon-loads, holding the village's wagon.
- **The ban:**
  - 16: send it home early;
  - 17: call it from one village or all at once.
- **Diplomacy:**
  - 15: an equal house that just lost a place resists peace (approved);
  - 27: a house bends the knee only once beaten in the field, not on strength alone.
- **Bigger, and the creator still wants to weigh in:**
  - 22: no right of passage through others' lands by default. This changes all AI routing.

**What landed, so protect it:**
- slow combat and slow marches ("raises the tension", "coming back from campaign", the cost of war);
- the merc price ladder (sellswords at minute 50 cost most of the capital's income, "more balanced");
- the supply chain's thinking ("the fact that I have to put in this thought is good");
- yielding towns, double-walled cities scaling, and the gathering-host notice;
- the pace: near Duke at about 2 hours on a legit run, which is on target.

**Also waiting:**
- the parked-features review with the creator;
- Battles' diagnosis note (relief and break-offs, gatherings stalling the climb);
- the pace question from the sims: no bot reaches Count by 150–180 minutes, though the creator did fine.

## Stage 1 output

Write ideas to a file (for example `RTS/IDEAS_2026-11-28.md` or this worktree). Group them by what they improve, with the cost and risk of each. Keep the creator's voice in mind: dead-simple controls, tension kept, no busywork, readable shortages. Then implement in stage 2. The creator said the scope is up to you.
