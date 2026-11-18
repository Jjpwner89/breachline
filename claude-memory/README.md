# Claude memory and setup backup

Everything Claude and Codex need to carry on with Breachline on a new computer, besides the repo itself. It was made on 2026-11-18, when the creator expected to lose access to their computer.

The repo is public, so nothing secret is kept here. Keys and passwords stay with you; see "Not in this backup" below.

## What's here

| Path | What it is |
| --- | --- |
| `memory/` | Claude's memory notes for Breachline: your decisions and how you like Claude to work. `memory/MEMORY.md` is the index Claude reads at the start of every session. |
| `restore.sh` | Puts the memory back on a new computer and relinks Codex's two Breachline art skills. |
| `sync.sh` | Copies the current memory into `memory/` so it can be committed. Run it after memory changes. |
| `codex/watch-breachline-art-briefs.toml` | Codex's automation that looked for new art briefs every 25 minutes. It was **paused** when backed up. |
| `settings/claude-settings.json` | Claude Code's user settings (dark theme, Opus auto-compact window, the Vercel plugin). |

The game's own rules, world, art direction and skills are already in the repo: `CLAUDE.md`, `AGENTS.md`, `.claude/skills/`, `breachline/DESIGN_NOTES.md` and `breachline/SETTING.md`. They aren't copied here.

## Setting up a new computer

1. Install git, Claude (the desktop app or Claude Code) and, for art, ChatGPT's Codex.
2. Clone the repo. Keeping the same folder layout means fewer paths to fix:

   ```bash
   git clone https://github.com/Jjpwner89/breachline.git ~/Documents/Claude/Games
   ```

3. Restore the memory and Codex skill links:

   ```bash
   sh ~/Documents/Claude/Games/claude-memory/restore.sh
   ```

   Claude files memory under the folder's full path, so the script works out where to put it from wherever you cloned the repo. Run it again if you move the folder.

4. Open the folder in Claude. Its first session will read `CLAUDE.md` and the restored memory.
5. **Codex:** open the same folder and trust it. Codex reads `AGENTS.md` in the repo. If you want the art-brief watcher back, recreate it from `codex/watch-breachline-art-briefs.toml`. Its prompt names `/Users/dpuser/...` paths, so change those if your user name or folder differs. Codex last ran on model `gpt-6-astra` at `xhigh` reasoning.
6. **Pushing:** set up GitHub sign-in for HTTPS. Big art pushes need HTTP/1.1, which is explained in `memory/breachline-large-pushes.md`:

   ```bash
   git -c http.version=HTTP/1.1 -c http.postBuffer=1048576000 push origin main
   ```

## Not in this backup

- **The fal API key** (`.env.fal`) is a secret, so it never goes into a public repo. Keep it in a password manager. The Python setup for the fal tools (`.venv-fal`) can be reinstalled.
- **The reference-library zips** (`breachline/art/*.zip`, `breachline/archive/`) are ignored by git. The library folders they were made from are in the repo.
- **Claude's chat transcripts** stay on the old computer. Memory and the repo docs hold what matters from them.
- **Memory for your other projects** (housing economics, the RFP and Valkai folders) isn't game material, so it isn't in this public repo.

## Where things stand (2026-11-18)

- **Live game:** https://jjpwner89.github.io/breachline/ is built from `main`, and your siblings play it there. Guard their saves.
- **Cards waiting on art:**
  - Mauldrin (`foldstride`) and Talloch (`saltmigrant`): briefs are ready in `breachline/art/ART_BRIEFS_SET16.md`, for Codex to paint.
  - Exhumation and Gravebound bone-picker (proposals 247 and 248) have no briefs yet.
  - Spark, War-chant, Cursed coin and Illusory decoy have never had art.
- **Old worktrees** under `.claude/worktrees/` held nothing that isn't already on `main`.

## Your claude.ai pages

These live on claude.ai, not on this computer, so you keep them with your account.

| Page | Link |
| --- | --- |
| Set 16 card art review | https://claude.ai/artifact/QaMJvTD7BGLEv9j5eR8bJP |
| Breachline | https://claude.ai/artifact/Hr5bV3HfqseB5HwCu6xemH |
| Card audit | https://claude.ai/artifact/AUqejGUMrDj4s84uR2vrpb |
| Balance council (your mechanic and card votes) | https://claude.ai/artifact/G3QMDBcFuaVHWhChcf4M1E |
| First paintings review | https://claude.ai/artifact/4CeQEHyMzrMBeT3vXMMyhc |
| Campaign music | https://claude.ai/artifact/PJa3MFnGdJUb5fiAqDiZkd |
| Creature cards | https://claude.ai/artifact/W74RmLoLy2TT6v1tb99q77 |
| Menu and Exhibition mockups | https://claude.ai/artifact/Vq9wwjuHU58bhLaxxEuU6D |
| Lore codex sound board | https://claude.ai/artifact/DeKDdobLBLTSSjUFNtARPZ |
| Music board | https://claude.ai/artifact/ThmAHGQjRmV2fzR9x4HUdL |
| Campaign reward lists | https://claude.ai/artifact/CFeZPE7S3CCw2HUgFhAnGq |
| Art review | https://claude.ai/artifact/Gmhq1cH9erAyW2AoNRVbNK |
| Mobile layouts (the chosen A and B) | https://claude.ai/artifact/2nVwRftEPFELeDfMwB5AmS |
| Band review | https://claude.ai/artifact/F4VwcwdvFqarcpUifPHNVn |
| Card balance | https://claude.ai/artifact/GFmdYhnuVtRNq8KV5HHoYU |
| Impact sound board | https://claude.ai/artifact/5jXihECSmu6VfKyZpvtmWK |
| Spell sound board | https://claude.ai/artifact/WjVt199fidQ8x6R2c7Asxx |
| Sound board | https://claude.ai/artifact/6WGdikfHHr35SNHUgnVuPt |
| Polish pass | https://claude.ai/artifact/WhNJqiYHKZM63JVuwWYfBF |
| UI refresh | https://claude.ai/artifact/WmUf7MW4bpvcirLrs9RpvJ |
| Card candidates | https://claude.ai/artifact/TLq854dvJKyUuUHK2hb2zj |
| Sunmane lancer card | https://claude.ai/artifact/Mev6cqP5wfCbnUGvic1Jsu |
| Card art briefs | https://claude.ai/artifact/K4CyZKihSijWBNGoY2YW7y |

## Keeping it current

After a session changes Claude's memory, run `sh claude-memory/sync.sh` and commit `claude-memory/`. Claude's memory includes a note telling it to do this.
