# Breachline art direction room

Open http://127.0.0.1:8767 while the local server is running.

To start or restart, double-click **Open Art Review.command**. Keep its terminal window open while reviewing.

The gallery covers normal art only. The catalogue is built from the current project’s normal-art manifests. Reference counts mean distinct documented artwork uses, including consulted references and retained revision history. They are not exact image-tool attachment counts. Current source paintings are never modified.

- **References:** sort by overall usage or filter by the alignment that used a reference. Upvote to prefer it; downvote to exclude it. Click a painting to edit its organizational alignment label and notes.
- **Pick favorites:** star the paintings that should guide future work.
- **Head to head:** choose between two paintings, tie, or skip. Pieces recur against different opponents. The default pool uses specifically praised work; switch to your favorites or all paintings. Excluded references are removed from all comparison pools.
- **Your ranking:** Elo-style ratings based only on your new comparisons, starting at 1,000 with K=24. Early rankings are provisional. Losing does not exclude a painting. Undo reverses the latest action.
- **Feedback insights:** sourced interpretation and a transparent recent sample. No historical numeric scores were invented.

Votes, favorites, notes, alignment labels and comparison choices are saved in **feedback.json**. **selection-guide.json** is regenerated after every saved choice and is readable by future art sessions. Consult it alongside the art-direction skill; do not use excluded references. No user votes are pre-filled.

Use **Export feedback** for a portable backup. Directly opening index.html uses browser-only storage; the local server is the recommended way to save into the project. Different browser-only origins do not share votes.

Rebuild the catalogue after adding art:
\`/Users/dpuser/Documents/Claude/Games/.venv-fal/bin/python build_catalog.py\`
Run this from this folder, then restart the server. Rebuilding preserves feedback.json. Removed files are not restored; missing references remain only as historical counts.

Data scope: Set 7–11 praise audit contains 56 surviving paintings. Final approval is not the same as explicit praise. No comment is not a negative. Unassigned concepts are not silently counted as Genesis or Gnosis. The title, reference role and assigned alignment remain separate from an artwork’s canon status.

External reference originals can retain provenance paths outside the repository. Their cached previews are included; the review server uses those previews when an original is unavailable on another computer.

The 2026-11-13 review is applied. `path-aliases.json` preserves artwork IDs and saved choices when accepted paintings move into the reference library. Cut images have no cached preview; their records remain only as textual history. The ten keepers are accepted references, while Black Enamel, Open Road is still pending.
