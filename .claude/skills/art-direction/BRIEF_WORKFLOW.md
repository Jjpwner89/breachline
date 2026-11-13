# Breachline: briefs to paintings

Shared workflow for Claude and Codex. Confirmed by the creator on 2026-11-13. Use it whenever asked to “make art briefs”, prepare new cards for art, or make paintings from briefs. The roles below describe the work, not a restriction on which assistant can do it.

## Read the current sources

- [Art direction](SKILL.md): the one source for painting, light, materials, casting, alignment and review rules. Read the current rules before every batch; history is only for a specific unresolved decision.
- [Setting](../../../breachline/SETTING.md): current names, habitats, climate, cultures, equipment and magic. Read the relevant passages, not just an old brief's summary.
- [Card proposals](../../../breachline/CARD_PROPOSALS.md) and the applicable live card definition: card identity and mechanics. Distinguish proposals from implemented cards.
- [Reference guide](../../../breachline/art/reference-library-2026-11-06/README.txt), relevant selection manifests and, when present, `breachline/art/art-review/selection-guide.json`: exact accepted designs and exclusions. Follow the latest specific selection over an older overview. The [final peoples manifest](../../../breachline/art/reference-library-2026-11-06/peoples-final-2026-11-13/prompts-and-manifest.json) identifies the seven finalized people designs. For animals, follow the current art direction's animal-reference links.

The creator's latest explicit instruction wins. Preserve approved identity and lore; separate an optional scene suggestion from a creator-required feature. Older briefs and saved prompts are records, not competing art rules. Do not import their duplicated “shared painting direction” blocks into a new batch.

## Brief writer — normally Claude

1. Find the requested additions and compare them with existing briefs and generation/review records. Brief only the intended new or revised work. Do not assume the highest numbered set is unfinished.
2. Supply enough world context for a good painting: who or what this is, where it belongs, what should feel compelling, and the few things that must remain true. Mechanics alone are not an art brief.
3. Keep each brief compact: a short subject paragraph plus essential constraints and references is usually enough. Give one useful visual or emotional idea. A suggested scene is optional and may be re-staged by the artist. If the card is new, label invented names, customs, biology or story as proposals.
4. Put game role and mechanics in a separate **Design context — not for the image prompt** field, preferably linking the authoritative card entry. Do not translate range, cost, damage, targeting or keywords into compulsory objects, poses, spectacle or victim counts. A meaningful connection to the card is welcome; a literal diagram is not required.
5. Do not prescribe a separate rendering style for each alignment or paste lighting/brushwork boilerplate into each brief. Alignment informs subject and world context; the shared art direction governs the painting. Specific creator-approved presentation choices remain binding and should be attributed.
6. Name essential references with exact paths and their purpose: identity, anatomy, signature kit, or a selected cell in a mixed sheet. Distinguish required continuity from optional inspiration. Verify files exist and the chosen variant is current. Do not turn one person's clothing, job or location into a species-wide rule.
7. Save a new card batch as `breachline/art/ART_BRIEFS_SET<N>.md`, using the next unused number after checking existing files. Concept/reference batches use `breachline/art/work-in-progress/<batch>/BRIEFS.md`. Preserve existing IDs and filenames when revising an active batch; increment its revision and record the change. Do not rewrite completed batches to match this template.
8. At the top, link this workflow and the current art direction; state the source additions, date/revision, intended output stage, exact scope and proposed WIP folder. Use statuses such as ready, generated, under review and final, with links to the actual generation/review records. “Ready” means ready for the requested image pass, not accepted art or lore. New peoples/creatures use lineup → selected reference → scene unless the creator has explicitly directed otherwise.

### Compact brief format

Paths in each saved brief must be resolvable from that file; state the path base if using repository-relative paths.

```text
## <stable code / card ID> — <name>
Type / alignment / faction if established:
Source and status: <card/lore source; brief revision; image status>
Output: <lineup, reference sheet or painting; proposed filename>

Subject and setting:
<Identity, relevant habitat/social context, and what is established vs proposed.>

What makes it worth painting:
<One concise idea about character, atmosphere, silhouette or a moment.
An optional scene suggestion, not a camera/lighting script.>

Must keep:
<Only essential identity/anatomy/equipment or explicit creator constraints.
Attribute any required staging or experimental treatment.>

References:
<Exact path + selected take/crop if relevant + purpose; required or optional.>

Design context — not for the image prompt:
<Card's game role and link to authoritative mechanics; separate from the picture.
For non-card concepts, say “not a card”.>
```

Leave an inapplicable field brief or omit it; do not invent facts just to fill the template. Asking for briefs means deliver briefs, not silently generate images or implement cards.

## Art agent — normally Codex

1. When asked to use the latest briefs, locate the newest requested, unhandled items by their status and records, not date or set number alone. Read the current sources above, the brief and its local feedback. Identify the batch and scope in a short update, then do the authorized work without asking for the same approval again.
2. Separate fixed facts from artistic choices. Keep accepted anatomy, identity, signature equipment and relevant setting facts. Change optional staging when it makes the painting better. If a genuine unresolved identity or lore conflict blocks the work, ask a focused question and continue independent items.
3. Choose composition, viewpoint, pose, lighting and painted treatment. Write a fresh image prompt from the subject and current art direction; do not concatenate the whole brief or its design-context field. Do not add “more epic”, more effects or forced action merely to distinguish it from a scene painting. A card painting can be quiet, strange, intimate or expansive.
4. Use one coherent lighting idea with readable subjects, lively colour where appropriate, matte material response and varied painted detail. Carry the successful Dominion qualities across alignments without copying its darkness or palette. Gaze, gesture, contact and setting should make sense when an action is shown; a compelling still presence needs no invented task. Follow the current skill for the full rules and any explicitly scoped experiment.
5. Inspect and attach the approved sheets needed for identity/anatomy/kit continuity. Do not attach finished paintings just as style samples. Describe their useful qualities in words. For an edit of an approved painting, use that painting as the edit source and preserve the requested unchanged parts.
6. Generate into the batch's WIP folder, using the current image-generation workflow and the requested format. Preserve previous selected versions during revision. Record exact final prompts, attached reference paths and selected cells, brief revision, output filenames and review status in `prompts-and-manifest.json`; retain old prompts as history.
7. Inspect the actual images before presenting them. Check setting and identity, anatomy, hands/feet, gaze and tool contacts, equipment scale, readable lighting, and selective brushwork. Check the picture without its title: does it have appeal and, if depicting an event, does that event make sense? Correct clear generation defects within scope. Do not call your own quality check creator approval.
8. Present a gallery with large stable codes and a two-to-three-sentence description per concept. Say what is shown and what is proposed; do not invent card rules. Include original/revision comparisons only where useful.

## Review and handoff

- Record feedback against exact image codes and versions. A lower rank is not rejection; a liked composition is not automatically a canonical custom, ability or habitat.
- Put reusable feedback into the relevant section of the art direction, and specific selections into the batch manifest and handoff. Keep scope and date. Do not promote a local correction into a universal formula.
- Follow the current art direction for accepted-image storage and rejection cleanup. Keep textual prompts/decisions and update all active links when files move. Mixed sheets with retained selections need their selected/excluded cells recorded.
- Record image approval, lore approval and live-card installation separately unless the creator explicitly covers them together. Carry out requested publishing or implementation without asking again; do not infer either from liking an image.
- The next fresh batch is the test: judge world fit, readable coherent light, colour, painted variation and visual appeal across alignments. If something fails, distinguish a brief/context problem from staging, prompt expansion or an image-generation defect before changing a shared rule.

## Worked example — format only, not a new art task

**110 — Still Flame chaplain. Unit / Vigil / Still Flame.** Source: [set 11](../../../breachline/art/ART_BRIEFS_SET11.md) and card 110 in CARD_PROPOSALS.md. Existing painting final; do not regenerate.

**Subject and setting:** A middle-aged woman chaplain supporting soldiers near their line. Keep the accepted character and the Still Flame's established context.

**What makes it worth painting:** Quiet resolve and warmth reaching people who need it. The existing wall-and-censer staging is a successful example, not a universal healer composition.

**Must keep:** Preserve the accepted identity if revisiting this card. Any new staging is a proposal, not a change to Still Flame practice.

**References:** `breachline/art/reference-library-2026-11-06/magic-and-craft-2026-11-08/06-still-flame-censer-healer.png` (repository-relative; censer/kit reference). Resolve the final card image from its selection record if editing it.

**Design context — not for the image prompt:** A support unit that heals an ally at range; exact mechanics remain in card 110. Do not put tile distances, healing amounts or a required demonstration into the prompt.
