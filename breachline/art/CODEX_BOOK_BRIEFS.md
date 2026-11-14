# Breachline lore codex book briefs

Six interface paintings for the lore codex book, written by Claude on 2026-11-13, revision 1. Follow the [briefs-to-paintings workflow](../../.claude/skills/art-direction/BRIEF_WORKFLOW.md) and the [art direction](../../.claude/skills/art-direction/SKILL.md). How the book moves and what each piece is for is in [CODEX_BOOK.md](../CODEX_BOOK.md).

**Status:** CB1–CB6 generated and technically/visually checked on 2026-11-13; creator review pending. [Review gallery](work-in-progress/codex-book-2026-11-13/index.html) · [Integration handoff](work-in-progress/codex-book-2026-11-13/HANDOFF.txt). Use the six production-sized PNGs in the batch's `ready/` folder. **Output folder:** `art/work-in-progress/codex-book-2026-11-13/`; accepted pieces move to `art/ui/` and Claude makes the `web/` sizes. Paths below are relative to `breachline/`.

These are materials for the interface, not card art, so the card rules about subjects, poses and stories don't apply. The book stays still in every painting. The game does all of its moving: the drop, the open, the page turns and the close are the code moving these pieces in 3D, so each piece must be flat and exact enough to be cut out and turned.

## Instructions for the image generator

1. Read the art direction first. Its painting style applies here; its card composition rules don't.
2. Generate one image per heading, in order. **CB1 comes first and is the master:** attach the chosen CB1 to CB2 and CB4, so the leather, gold and wear match.
3. Every image is a **cut-out**: a transparent background, with dust and soft edges partly transparent rather than painted onto a solid colour. If your generator can't make transparent images, stop and say so.
4. **Seen from directly above,** flat, with no perspective, no tilt and no cast shadows. The game adds the shadows and the lamp's shading as the pieces move, so painted shadows would end up in the wrong place.
5. Never overwrite existing art. Save the exact prompts, references and takes in `prompts-and-manifest.json` in the output folder, and show the results in a small gallery.

## Shared direction

Apply this to every image:

```text
Create one original interface asset for Breachline, a high-fantasy card game played on an oak camp table under one warm lamp. This asset is part of a scholar's book: a lore codex written by a historian of the Lantern Conclave, a society of scholars of magic in the city of Ambrel. It is a fine book that has been carried and used for years, not a museum piece and not a magic tome.

Paint it in the same hand as the game's traditional oil and acrylic fantasy paintings: visible but quiet brushwork, believable materials, precise rather than noisy detail. Never a photograph, 3D render, vector art, flat icon or cartoon.

Seen from directly above, perfectly flat, with no perspective and no cast shadow. Soft, even light. Transparent background. Paint only the piece itself: no table, hands or scenery. No text, letters, numbers, runes, logos, watermarks or signatures. Where the brief asks for a blank area, leave it plain and smooth so the game can write on it.
```

Add this to the two sheets with several pieces (CB4 and CB5):

```text
A sprite sheet of separate pieces on one transparent image, arranged as the brief gives, each piece clear of its neighbours with empty space all round. No piece may touch the edge of the image. All pieces share the same scale, light and finish, so they read as one set. No borders or dividing lines.
```

## CB1 — codex-cover.png

Output: 1024 x 1536, cut-out. The front cover of the closed book.

**Subject:** the book's front cover, filling the full width of the image. The cover is three units wide by four tall, centred, with transparent space above and below. Deep blue-teal leather over boards, worn smooth, a little darker where hands hold it and rubbed paler along the edges and corners. A blind-tooled double border with a fine gold line inside it, simple worn brass caps on the four corners, and the lantern star in gold at the centre. Above the star, a plain recessed title panel of paler leather, completely blank: the game writes the title there in gold. Down the left edge, the shallow groove of the hinge where the cover bends at the spine.

**What makes it worth painting:** it should look heavy and loved, the book of someone who carries it everywhere. Restraint: one star and a few gold lines, not a carved relic.

**Must keep:** straight top-down view, a clean rectangular outline, the hinge on the left, a blank title panel, no clasp, no shadow.

**References:** `art/web/ui/emblem-U.png`, required, for the lantern star's design. `art/ui/ui-gilt-ornaments.png`, optional, for the gold leaf's finish.

**Design context, not for the image prompt:** the book drops onto the table showing this face, then the cover swings open on the left edge. The game draws the page edges and the back board around it.

## CB2 — codex-cover-inside.png

Output: 1024 x 1536, cut-out. The inside of the same front cover.

**Subject:** the inside of CB1's cover, the same size and outline, with the hinge now down the **right** edge. The blue-teal leather folds over the board's edges as a border about a twentieth of the width, finished with a fine gold line. Inside it, a marbled endpaper in quiet teal, amber and cream. In the upper middle, a pasted paper bookplate: a small rectangle with an engraved border and a completely blank centre.

**What makes it worth painting:** the first thing seen when the book opens. The marbling should be lovely but low in contrast, so the bookplate reads at once.

**Must keep:** same size, leather and wear as CB1; hinge on the right; the bookplate's centre blank.

**References:** the chosen CB1, required.

**Design context, not for the image prompt:** shows on the back of the cover as it turns, then lies on the left of the first spread, facing the title page. The game writes one short line on the bookplate.

## CB3 — codex-page.png

Output: 1024 x 1536, cut-out. One blank right-hand page.

**Subject:** a single page of good paper, three units wide by four tall, filling the width as in CB1. Warm ivory, with faint laid lines, a little foxing and handling near the outer edge, and a soft darkening down the left edge where the paper curves into the binding. Completely blank: no text, no ruled lines, no ornaments.

**What makes it worth painting:** it's under every word in the codex, so it has to be quiet. It should look like paper, not parchment or a texture filter. Even tone across the middle so text reads anywhere on it.

**Must keep:** blank, even in the middle, binding shade on the left, a clean outline, no shadow.

**References:** `art/ui/ui-panel-parchment.png`, optional, for the game's paper colour.

**Design context, not for the image prompt:** every page in the book is this painting with text laid on it; the game mirrors it for left-hand pages. Turning pages and the flutter are made of it too.

## CB4 — codex-strips.png

Output: 1536 x 1024, cut-out sheet, three long pieces laid horizontally, one above the other.

**Subject:**
- **Top:** the edges of the book's pages, seen side on as a long strip: hundreds of fine cream layers, a little uneven, slightly darker with handling.
- **Middle:** the edge of the board, as a long strip: the blue-teal leather wrapped round the board's edge, rubbed paler along its length.
- **Bottom:** a silk ribbon bookmark, long and narrow, in deep amber, cut straight at the left end and in a frayed V at the right.

**What makes it worth painting:** these sell the book's thickness and weight while it falls and opens.

**Must keep:** each strip straight and even along its length so the game can stretch it; the leather matches CB1.

**References:** the chosen CB1, required.

**Design context, not for the image prompt:** the strips form the sides of the closed book and the stacks of pages either side of the open spread, which grow and shrink as you read. The ribbon hangs from the foot of the book and takes you back to the contents.

## CB5 — codex-ornaments.png

Output: 1536 x 1024, cut-out sheet, six pieces in two rows of three.

**Subject:** printer's ornaments for the pages, each printed in a single dark sepia ink, as if from engraved blocks; the paper is not painted, only the ink.
1. A printer's device for the title page: the lantern star in a small wreath or roundel.
2. A headpiece: a narrow horizontal band of fine scrollwork, for above an entry's title.
3. A tailpiece: a small closing ornament, for the end of an entry.
4. A plate frame: a rectangle of double ruled lines with a small flourish at each corner, its centre completely empty.
5. A drop-capital frame: a small square of fine vine and star work, its centre completely empty.
6. A wax seal in deep blue wax, pressed with the lantern star. This one is an object, painted in colour, not ink.

**What makes it worth painting:** they make the page look printed by a careful press. Fine, crisp lines; elegant, not ornate.

**Must keep:** one ink colour for pieces 1 to 5, so the game can tint some of them blue; the frames' centres empty.

**References:** `art/web/ui/emblem-U.png`, required, for the lantern star. `art/ui/ui-buttons-parchment-wax.png`, optional, for the wax.

**Design context, not for the image prompt:** the game places these around the real text: the device on the title page, headpieces and tailpieces on entries, the frame round each art plate, the frame behind each drop capital. The seal marks an entry not yet unlocked, if unlocking is built.

## CB6 — fx-book-dust.png

Output: 1536 x 1024, cut-out, six frames of 512 x 512 in two rows of three, played left to right along the top row and then the bottom row.

**Subject:** a puff of fine dust and a few flecks of ash pushed out from under the edge of a heavy book as it lands on a table, seen from directly above. In every frame, the book's edge is a straight line along the bottom of the frame (not painted) and the dust blows upwards and outwards from it. Frame 1, a thin bright line of dust just escaping; frames 2 and 3, it billows out; frames 4 to 6, it spreads, thins and fades to nothing.

**What makes it worth painting:** it's what makes the thud land. Pale, warm dust caught in lamplight, soft and partly transparent.

**Must keep:** the source edge along the bottom of every frame, nothing touching the frame's edges, frame 6 almost empty.

**References:** none needed. The game's other effect sheets follow the same frame layout.

**Design context, not for the image prompt:** played along the book's long edges when it drops and when it closes, cross-faded between frames for smoothness.
