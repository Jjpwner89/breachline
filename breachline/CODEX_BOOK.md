# The lore codex book

How the lore codex looks, moves and sounds. The creator's brief is from 2026-11-13; the rest is Claude's proposal, waiting for the creator's verdicts. The entries themselves are written in `LORE_CODEX.md`; the paintings for the book are briefed in `art/CODEX_BOOK_BRIEFS.md`.

## From the creator (2026-11-13)

- Choosing the codex sends the rest of the interface floating away, except a back arrow.
- A book drops onto the table with a thud, then opens, with a second sound when the cover lands.
- Turning a page has its own sound, possibly different for forward and back. Skipping to a chapter is a page flutter with its own sound. Closing the book has its own sound.
- The book opens on a title, then turns to a table of contents. Choosing a chapter flutters to it, and from there you click through its entries.
- The animations should be decently high fidelity. Codex paints the book; the code smooths the motion, so we need as few paintings as possible: blank pages and the book's art.

**After the first proposal (2026-11-13):**
- **Approved:** the book is six still paintings moved in code. Codex is painting them from `art/CODEX_BOOK_BRIEFS.md`; until they arrive, the code uses stand-ins.
- **The button** stays in the Collection screen.
- **The title** is Latin, along the lines of *Codex Orbis*. Final wording to pick.
- **The bookplate** doesn't carry the player's name.
- **Forward and back turns** sound the same, as real pages do.

## The idea in one line

Codex paints **six still pieces**: the cover, its inside, a blank page, a sheet of edges and the ribbon, a sheet of ink ornaments and a dust puff. Everything that moves is the code moving those paintings in 3D, so the motion is smooth at any frame rate and no frame-by-frame painting has to match the one before it. The text is real text laid on the painted paper, so entries can change without new art.

## What happens, beat by beat

| Beat | What you see | Sound | Time |
| --- | --- | --- | --- |
| 1. Clear the table | Every menu element drifts away from the centre of the screen, rising a little, fading and softening, the nearest first. The back arrow fades in at the top left. The table darkens at its edges, leaving a warm pool of lamplight in the middle. The tavern music drops to about half. | A soft cloth whoosh (optional) | 0.42 s |
| 2. The drop | The book falls into the light from just above the camera: it starts larger, tilted and a few degrees askew, with a faint wide shadow, and falls faster as it goes. The shadow tightens and darkens as it arrives. | — | 0.48 s |
| 3. The thud | On contact the book squashes very slightly and springs back, the screen shakes about 4 px and settles, dust puffs out from under its long edges and the drifting ash is pushed outwards. | **Book drop** | 0.25 s |
| 4. Settle | The book rests for a moment, and straightens itself. | **Book open** begins: a hand on the cover | 0.55 s |
| 5. The open | The cover lifts from the right-hand edge and swings over on the spine, slowly at first, quickly through upright, then drops onto the table. The book glides right as it opens, so the open spread ends up centred. The cover darkens as it turns away from the lamp and its shadow sweeps across the first page. The first loose page lifts a little with the cover and falls back. | **Book open** carries on through the lift and ends in the cover's thump; **cover lands** is layered under that thump, with a 1.5 px shake | 1.0 s |
| 6. Title | The first spread: inside the cover on the left, the title page on the right. | — | holds 0.9 s |
| 7. To the contents | The title page turns by itself to the contents. Any click skips ahead. | **Page turn** | 0.68 s |
| 8. Reading | Click the right page (or press right, or swipe) to turn forward; the left page to turn back. A page corner lifts a little under the pointer. | **Page turn**, either way | 0.68 s each |
| 9. Jumping | Choosing a chapter in the contents, or pulling the ribbon, riffles a run of blank pages across and lands on the chosen spread. | **Flutter**, whose last slap lands with the last page | 0.6 to 1.5 s |
| 10. Closing | The back arrow or Escape. The whole left side of the book, cover and pages read, swings back over onto the right in one motion, from any page. The book glides back to centre and lands shut, with a puff of dust. | **Book close** and a 3 px shake | 0.65 s |
| 11. Lift away | The book rises towards the camera, its shadow spreading and fading, and the menu floats back in the reverse of how it left. The lamplight widens and the music comes back up. | — | 0.8 s |

Any click during beats 2 to 7 hurries the book straight to the contents, so a player who has seen it all before isn't kept waiting. The full opening takes about 4.3 s; hurried, about 0.8 s.

## The book's pages

| Spread | Left page | Right page |
| --- | --- | --- |
| 0 | Inside the front cover, with a library bookplate | Title page |
| 1 | L0, a note from the compiler | Contents |
| 2 | Chapter opener: chapter title, chapter plate and the chapter's own list of entries | The chapter's first entry |
| ... | Entries flow on, one after another | |
| Last | Colophon | Inside the back cover |

Each chapter starts on a left page, so a chapter always opens as a spread. If the chapter before ends on a left page, the right page facing it gets a small ink tailpiece and is otherwise left blank, as printed books do.

**Proposed, for verdicts:**
- The title page carries the Latin title (working title *Codex Orbis*, "the book of the world"), with an English line under it: *an account of the world as it stands*, set down by Edra Moyle, reader in histories, Lantern Conclave, Ambrel, "in the hundred and fiftieth year after the Cataclysm". The English line borrows L0's phrase. The Latin title is also lettered in gold on the cover's title panel.
- The bookplate reads "From the library of the Lantern Conclave", and nothing more.
- The colophon is a line or two from Edra Moyle about where the book was finished.

## Page layout

Pages are 3 wide by 4 tall. Measurements are given as a share of the page's width, so the layout holds at any size.

- **Margins:** 11% at the spine, 9% at the outer edge, 9% at the top and 12% at the bottom, the classic proportions that make a page look printed rather than boxed.
- **Running head:** small capitals over a thin ink rule. The chapter's name on left pages, the entry's name on right pages.
- **Page number:** centred at the foot in old-style numerals.
- **Entry title:** a display serif, centred, under a small ink headpiece.
- **Art plate:** when an entry has art, a plate sits at the top of its first page, the full width of the text, up to about a third of the page's height, cropped to fill. It is tipped in: set inside a ruled ink frame, turned a fraction of a degree and lifted with a hairline shadow, as if pasted in. The art is the game's existing concept and card paintings, as `LORE_CODEX.md` allows.
- **Body:** a book serif, justified and hyphenated, in dark brown ink that lets the paper show through. The first paragraph opens with a three-line drop capital.
- **Rubrication:** drop capitals, entry titles and the chapter openers are inked in deep Conclave blue; everything else is brown. It's the one touch of the compiler's colour in the book.
- **Quotes:** set in from both sides, in italic, with the credit on its own line in small capitals, after a dash.
- **Subheads** (as in L7's four beliefs): small capitals, run into the paragraph.
- **The end of an entry:** a small tailpiece if there is room. Each entry starts on a new page, and a long one runs on to the next.

The **contents** page lists the chapters with dotted leaders to their page numbers. Under each chapter, one italic line names its first few entries. A chapter's name darkens and gets a fine underline under the pointer, and choosing it flutters to its opener. The **chapter opener** repeats the idea one level down: a large chapter title, a plate, and the chapter's entries with page numbers, each of which turns straight to its page.

The **ribbon** hangs out of the foot of the book at all times and is kept at the contents. Pulling it, or pressing Home, flutters back there.

**If entries unlock as you play** (not decided yet, per `LORE_CODEX.md`): a locked entry is listed as a faint pencilled line with no page number. Its page shows a small blank wax seal and the words "Not yet set down."

## How the motion is built

The book is a small 3D object made of flat painted pieces, drawn with CSS 3D transforms on a fixed layer over the table.

- **The closed book** is a box: the cover painting on top, a back board under it, and the page edges painted as strips down the sides. The sides only show during the tilted drop, but they're what make it read as a heavy thing rather than a card.
- **The cover** is two faces back to back: the outside, and the inside with its bookplate. It turns on the spine. A shading gradient darkens it as it turns away from the lamp and a highlight runs along its edge as it passes upright. Its shadow is drawn on the pages beneath and slides as it turns.
- **A turning page** is one leaf made of three hinged strips, each turned a little more than the one nearer the spine. The outer edge leads at the start and trails at the end, so the paper bends instead of swinging like a door. A highlight follows the bend, the page underneath darkens under its shadow and then clears. Both faces are live text on the blank-page painting, so a turning page shows its words.
- **Blank leaves for the flutter:** between 4 and 12 of them, depending on the distance, each a fast two-strip turn, overlapping, with a little random variation in bend and angle, a slight blur, and no text. Only the page that lands carries words. The stacks of page edges at either side shift in thickness to show how far through the book you are.
- **Turning quickly:** a turn asked for during a turn starts when the first is two-fifths done, and each one in a row is quicker, down to 0.3 s. Four or more waiting become a flutter.
- **Dust** is the one frame-by-frame effect: six painted frames, cross-faded into each other so the puff reads as smooth, placed along the book's edges on the drop and the close.
- **The camera** is straight down, as on the board. The only perspective is the drop's tilt and the cover's turn, which keeps the painted pieces sharp.

Why not paint the opening as a run of frames: an image generator can't keep a book identical from frame to frame, and twelve frames that don't quite match flicker. Six still pieces moved in code don't, and they can be timed and tuned without asking Codex again. A true page curl in WebGL would be the step beyond this, but it needs the text drawn into an image first, so it waits until the hinged-strip turn has been tried.

**Reduced motion:** when the player's system asks for less motion, the menu fades instead of floating, the book fades in already open, and pages cross-fade. The sounds still play.

**For everyone:** the text is real text, so it can be selected and read aloud. Arrow keys turn pages, Home goes to the contents, Escape closes, and each new spread is announced to screen readers.

**Loading:** the six paintings, in their web sizes, start loading when the pointer reaches the codex button, so the book never drops half-drawn.

## Phones

- **Upright:** the book drops and opens the same way, scaled to the screen. Once open, it zooms to a single page. "Next" on a left page glides across to the right page; "next" on a right page turns the leaf, still zoomed in. Swipes do the same.
- **Sideways:** the whole spread fits the screen's height.
- **Both:** the book paginates as it opens, for the size it has, keeping body text at least 14 px tall. A phone's book therefore has more pages, with their own numbers, which nobody will notice.

## Sounds

Picked by the creator on the [sound board](https://claude.ai/artifact/DeKDdobLBLTSSjUFNtARPZ) on 2026-11-13. All seven are CC0, in `sfx/` and credited in `sfx/CREDITS.md`. Three are from one recording session of the same huge hardback, so the open, the page and the close sound like one book. Each file is trimmed to its take and levelled to the same loudness; the game sets their volumes.

| File | Moment | Length | Where it hits |
| --- | --- | --- | --- |
| `codex-whoosh.wav` | The menu clears | 0.53 s | 0.15 s in |
| `codex-drop.wav` | The drop | 0.47 s | 0.06 s in |
| `codex-open.wav` | Settle and open: a hand on the cover, the lift, and the cover's thump | 1.70 s | the thump at 1.58 s |
| `codex-cover-land.wav` | Layered under the cover's thump | 0.60 s | 0.37 s in |
| `codex-page.wav` | Every page turn, either way | 1.15 s | the page laid flat at 0.68 s |
| `codex-flutter.wav` | Jumps | 1.76 s | the last slap at 1.56 s |
| `codex-close.wav` | The close | 0.46 s | 0.23 s in |

### Layering

Each sound starts early by its "where it hits" time, so its loudest moment falls on the frame where something touches down. The motion is timed to the recordings, not the other way round.

| When (s) | What lands | Sounds |
| --- | --- | --- |
| 0 | The menu starts to clear | `codex-whoosh` starts |
| 0.90 | The book hits the table | `codex-drop` starts at 0.84 |
| 1.10 | The book settles | `codex-open` starts; its first half-second of small handling noises plays under the settle |
| 1.65 | The cover starts to lift | (the same recording's lift) |
| 2.68 | The cover lands | `codex-open`'s thump, with `codex-cover-land` started at 2.31 underneath it |
| 3.58 | The title page starts to turn | `codex-page` starts with it |
| 4.26 | The page lands on the contents | (its own landing) |

- **Turning pages quickly:** a turn shorter than 0.68 s starts `codex-page` part-way in, so the page still lands on its loudest moment; very fast turns skip the lift and keep only the landing. At most two page sounds play at once: a third fades out the oldest.
- **Variety from one take:** each page turn plays at a slightly different pitch (4% either way) and volume, so a run of turns doesn't repeat. The creator picked one take. If it still sounds repetitive in play, Joao_Janz recorded eleven more turns of the same book.
- **Flutters:** a jump lasts from 0.6 s for a few pages to 1.5 s for a big one. `codex-flutter` starts part-way in for shorter jumps, so its last slap always lands with the final page. No extra page sound follows it.
- **Closing:** the close takes 0.65 s and the book shuts at its end, so `codex-close` starts 0.42 s into the close. The dust and shake come on the same frame.
- **Hurrying:** a click that hurries the opening fades whatever codex sound is playing over 80 ms, then plays only the page turn onto the contents.
- **The mix (starting points, to tune in the prototype):** drop 0.75, open 0.6, cover land 0.4, page 0.5, flutter 0.5, close 0.7, whoosh 0.25. The tavern music drops to half while the book is open.

## Where it plugs in

- **The button:** in the Collection screen (creator, 2026-11-13), which is already on the oak table the book drops onto.
- **Code:** a new `codex.js` and `codex.css`, with the approved entries as data in a `codex-entries.js`, generated from `LORE_CODEX.md`. The sounds go through `Sfx` like the rest.
- **The UI polish thread** lands last and may restyle the button and the back arrow.

## Build order

Built on 2026-11-13 with Codex's paintings and the picked sounds, straight past the stand-in stage: `codex.js`, `codex.css`, and `codex-entries.js` made from LORE_CODEX.md by `tools/build-codex.py`. Checked in the browser: the drop, the opening, page turns, the flutter to a chapter, the ribbon back to the contents, closing, and the upright phone view. Still to check: the sounds by ear in the game, and reduced motion on a device set to it.

Each chapter opener shows the chapter's last painting, so it doesn't repeat the painting on the facing page.

## Open questions

- The book's Latin title.
- Whether the title page turns to the contents by itself, as proposed, or waits for a click.
- Whether entries unlock as you play.
