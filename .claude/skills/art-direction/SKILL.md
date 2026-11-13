---
name: art-direction
description: Holds the art direction and accumulated art feedback for Breachline cards. Use this whenever card art is written, briefed, generated, reviewed or discussed, including art briefs for ChatGPT or Codex, image prompts, new cards that will need art, and any feedback on existing images, even if art direction isn't mentioned by name. Add new feedback from the creator to this file.
---

# Breachline art direction

These are the current rules, rewritten on 2026-11-13. Every earlier review, card decision and round record is kept word for word in [HISTORY.md](HISTORY.md). Read that file only when you need the details of a particular card, set or round. When the history and this file disagree, this file wins.

**Adding feedback:**
- Put general feedback from the creator into the right section of the current rules.
- Put feedback on a specific card, image or round into the open-work section, or into HISTORY.md once it's settled.
- Keep a one-off choice one-off. Don't turn it into a general rule unless the creator makes it general.

Read [SETTING.md](../../../breachline/SETTING.md) for the world behind the images. These rules and the saved prompt records are the handoff for another account or assistant; don't rely on access to this chat.

## How briefs and feedback work

- The creator's latest feedback overrides every brief, old prompt and earlier rule. A brief is a starting point:
  - If its pose, framing or staging works against the direction here, redesign the presentation.
  - Keep the subject, identity and lore.
- Feedback applies at the scope the creator gives it: one image, one batch, or everything.
- New paintings, peoples, creatures, places and customs are proposals until the creator accepts them. Liking a painting doesn't make its subject canon or settle its biology, culture, alignment or rules.
- **New creatures and peoples follow lineup → reference → scene:**
  1. A lineup sheet of about six quite different takes on one page.
  2. A reference sheet of the take the creator picks.
  3. Scenes, only after that.

  The creator finds lineups really helpful (2026-11-13). In follow-ups they may mix and match between takes, for example one take's body with another's head or colouring. A combined pick becomes the next reference sheet, or a smaller follow-up lineup if the combination needs testing.
- Every concept gets a two-to-three-sentence write-up for whoever implements it later. The write-up says what is shown and what it proposes, and keeps accepted traits separate from proposed jobs, customs and places.
- **Staging and review:**
  - Stage new work in `breachline/art/work-in-progress/`.
  - Move accepted images into `breachline/art/reference-library-2026-11-06/`.
  - Delete rejected images along with their generated-source copies, but keep the prompts and decisions as text so nothing gets restored by accident.
  - Review galleries show each image's code large, so the creator can give thumbs by code.
- Before selecting references for a new batch, read `breachline/art/art-review/selection-guide.json` if it exists, and honour its exclusions. Losing a comparison doesn't make an image excluded, and heavy use doesn't make it approved.

## What the paintings are for

- **The feeling to aim for:** the creator fell in love with Magic: The Gathering's painted fantasy art. Be creative and beautiful without copying any existing game's characters, symbols or images.
- **Appeal first.** Each painting should be one the creator loves and that belongs in this world. Judge it by silhouette, light, colour, material, atmosphere, character and imagination. Appeal can be quiet, severe, eerie, beautiful or forceful.
- **Card rules are not a composition brief.** Keep costs, keywords and effects out of image prompts. A unit needn't demonstrate its ability, and a spell needn't diagram its effect. Choose what makes the best painting.
- **Test without the title:** look at the image without its name or rules and ask what makes it worth looking at. If a prop or extra figure exists only to explain an ability, cut it or give it a better reason to be there.
- **Concept art can roam.** Concept art can explore new characters, creatures, places, equipment and strange events. It doesn't have to follow the current worldbuilding discussion. Tie each image to a setting or story idea, and label invented things as proposals.
- **Scale and abstraction:**
  - A grand landscape can hold a small figure for scale and stakes.
  - Some abstraction is welcome now and then, for mystery or enormous scale.
- **Humour is welcome** where it fits; the creator found the mercenary captain funny.
- **Keep power believable.** Don't inflate an ordinary person into a champion or every animal into a giant. A card's cost doesn't set how dramatic its painting is.
- **Format:** landscape, about 3:2 (1536 × 1024). One clear subject that reads at small size, with important details away from the edges. No text, letters, borders, logos, watermarks or signatures.

## Painting

- **Medium:**
  - A traditional oil and acrylic fantasy painting with measured, visible brushwork.
  - Never a photograph, 3D render, anime, comic or flat vector art.
  - Never glossy animated-film staging or rounded toy-like forms. That look comes from the whole scene, so a face-only fix won't cure it.
- **Painted attention:**
  - Vary detail on purpose. The focal feature can be precise, while secondary people and distant places get fewer marks, quieter edges and less contrast.
  - Brush size, edge sharpness and detail should agree locally.
  - Don't render everything equally sharp, and don't pair coarse strokes with hairline detail everywhere.
  - Backgrounds are implied with a few large value shapes rather than fully built. A landscape spell can make the place itself the subject.
- **Materials:**
  - Skin, wool, wood and stone are naturally matte.
  - Keep stronger reflections for metal, glass and water. Convincing reflections there are welcome, as in the Cobalt rapier and the Black enamel kit.
  - Avoid waxy faces, uniform shine and habitual red cheeks, especially on heavyset women.
  - Don't fix artificial skin with pores, wrinkles or surface noise. Simplify the forms instead.
- **Colour and light:**
  - Use vibrant colour and light that organises the scene and links its subjects, with one lighting idea and a limited palette per scene.
  - Pervasive purple, abundant flowers and idyllic storybook brightness should be unusual.
  - Don't overcorrect into grey or bleak.
- **Variety within a batch:** vary camera distance, facing direction, gesture, silhouette, mood, weather, time of day, architecture and dominant colour.

### Experiment: some camera blur (creator, 2026-11-13; easy to reverse)

The creator wants to try some camera blur, with noticeably less background detail. It applies only to briefs that say they're part of this experiment:
- Subjects stay sharp and painted, and backgrounds soften.
- Keep it moderate.
- For those briefs, this overrides the "no camera blur, no tunnel focus" wording in the painting rules above and in older records.

To undo it, delete this subsection.

## Faces, people and casting

- **Faces:**
  - Use the human and species face sheets to invent varied skulls, noses, jaws, ages and asymmetries. Use specific sheet faces when correcting casting.
  - Faces are generally appealing, with occasional exceptional beauty.
  - Avoid repeated model faces, compulsory ugliness and uncanny skin detail.
- **Faces follow the life.** "Generally appealing" is the default for ordinary casting. A people or person with a hard life gets the face of that life:
  - Saltreach fishers are rugged, a little sunburnt and weathered.
  - The Ashborn (the made people) visibly look returned from death.

  Paint that roughness through matte colour and form, not pore noise.
- **Casting:**
  - Highly aggressive frontline fighters are mostly men, with occasional women soldiers.
  - Women are welcome as mages, archers, workers, scholars, civilians and anything else.
  - Keep approved identities unless the creator changes them.
- **Local populations:**
  - A settlement has its own local population. Don't fill every crowd with one of every people.
  - The world is varied, but a single town isn't cosmopolitan by default.
- **Peoples in this world:**
  - Humans appear in every alignment.
  - **Orcs** have coarse, visibly nonhuman anatomy: heavy brow, broad blunt nose, projecting jaw, irregular tusks. Female orcs are not attractive green humans. Orcs are never Vigil.
  - **Lion folk** are tall, upright and noble, with lion heads and full manes, and never cartoonish. They keep to themselves, so they are rare outside contexts that suit them.
  - **Alderkin** have their own lives and motives. They don't exist to help humans or tend plants, and no more irrigation scenes. They can fight.
  - **Summoners** have a golden scar-like mark, the goldmark. Someone hiding it really hides it; never show a hidden mark glowing through.
- **Defining traits read clearly.** "Understated" is for magic and drama, not for the trait that makes a people look like itself. That trait should read at card size:
  - Scions failed because the shaping was too subtle.
  - The Glimmerfolk freckles were too faint.
- **New peoples:**
  - **Variety without a repeated motif (creator, 2026-11-13):** the creator liked Cairnfold because it was different and unique, not because of folds or any particular anatomy. Do not make anatomical folds, flutes or fan-like skin a recurring recipe for new peoples. Keep unusual bodies, but avoid a stereotypical sci-fi alien feel. Facial structures can still be exaggerated: ease them only a little—just a tad—to fit the setting, rather than normalizing them into ordinary human faces.
  - No elves and no dwarves as peoples. The accepted dwarf sheet stays a visual reference only.
  - Animal-headed peoples are allowed. Don't mention head type to the image model either way.
  - A profession or alignment shown in one image does not define a whole people.
- **Accepted peoples:**
  - **Kitefolk:** KR1 is the final visual design: slender finger-braced gliders with mottled membranes, an extreme angular face and long pointed nose.
  - **Glimmerfolk:** GR1 is the final visual design: long neck, broad ear-fans, blue face glimmers and dotted arm lines spreading toward the hands.
  - **Moor folk:** PL7 is the final visual range: long limbs and hands, furred neck/shoulder ruffs and strongly shaped faces, with all six variations retained. The original sheet is preserved unchanged; no single individual was selected.
  - **Made people:** PL3D is the final visual range, before the stronger-scarring revision. Preserve its cold pallor, ordinary scale, diminished gaze and restrained old scars; Dominion allegiance is already established.
  - The new peoples' homes, alignments and lore are in `breachline/SETTING.md` (2026-11-13). The creator's names: the made people are the **Ashborn**, the salt–silt folk are the **Banded folk**, and the Coast folk (CO1) are the **Greyhides**. Older records keep the old names.
  - Paint to that lore. For example:
    - Kitefolk glide but don't fly.
    - Glimmerfolk glimmers brighten with mood and flare when they cast, and their undercity is developed and decent, not caves.
    - Greyhides are large but easygoing.
  - Their final reference sheets and short handoffs live in `breachline/art/reference-library-2026-11-06/peoples-final-2026-11-13/`. These accept the designs, not universal jobs, cultures or allegiance.
  - **Riverfolk:** fin ears, neck gills, subdued scales. They work in waterworks and live in small settlements. They're generally less privileged, and they never dive for mana-stones.
  - **Saltreach:** a human coastal culture, with rugged, weathered, mildly sunburnt skin, oiled wool and practical sea gear.

  Riverfolk and Saltreach live in `breachline/art/reference-library-2026-11-06/peoples-round-12-2026-11-13/`, with short descriptions.
- **The made people:** PL3D is the final visual design, explicitly finalized on 2026-11-13. Preserve its ordinary adult scale, lean or average bodies, cold pallor, hollow facial planes, diminished gaze and restrained old scars unchanged. PL3E’s stronger scarring went too far and is rejected. They are always Dominion, with a raised-from-death appearance informed by the cost of diminished revival. Lore (creator, 2026-11-13): they are the **Ashborn**, Dominion's raised dead with fully repaired bodies and a weak soul, made rather than born; see SETTING.md. No thread stitches, bolts or laboratory clichés.
- **Rejected people concepts:** don't restore these without a new request.
  - Scions (too human)
  - Graftkin and both made-people tests
  - Cairnfold
  - the old round 12 Glimmerfolk and Kitefolk paintings (superseded by final KR1 and GR1 visual references)
  - OG1 ogre study; do not continue its design
  - PL3E made-people scarring revision; too much scarring, superseded by final PL3D
  - PL11 and PL12 new-people explorations
  - PL9.1, PL9.2, PL9.3, PL9.5 and PL9.6; only PL9.4 continues
  - Mourncaps and Lichenkin
  - ravenfolk, badgerfolk, mothfolk, the mineral tripod and rhinoceros folk
  - Opaline Kin (style reference only, never a people)

  Stonehorn is the least-liked included design. Keep it as an option to revisit, not a template.

## Creatures

- **Successful larger animals; avoid repeated throat combs (creator, 2026-11-13):** LG1–4/5/6 work because recognisable honey-badger, anteater/armadillo and kangaroo corollaries have clear unfamiliar anatomical differences. Preserve that balance. Jaw frills and filter-feeder-like throat combs are overused and disliked; stop using them as a recurring novelty. A symbiosis must make sense in the animal's design; the bugs-under-scales idea in LG2–6 failed. This does not ban all symbiosis or all unsettling anatomy.

- **Ecological invention renewed (creator, 2026-11-13):** move closer again to the Scavengers Reign inspiration through integrated anatomy, interdependence, life cycles, surprising feeding and habitat relationships, beauty with danger, and tactility. Develop new original creatures; do not copy its designs or name the show in image prompts. The creator welcomes varied, creative experiments around the edges of their suggestions, clearly distinguished from accepted designs. Do not reduce the work to familiar animal faces with changed coats. Next scale exploration is slightly larger wildlife, not a universal jump to giants.
- **Preserve picks; develop new creatures (creator clarification, 2026-11-13):** broader head variety is a direction for NEW creature generations, not an instruction to replace faces on already liked designs. A face must make sense with its creature's skull, neck, feeding method and covering. Develop the animal as a whole; do not treat faces as interchangeable masks. Keep explicit selections intact unless the creator requests a change.
- **Head variety without a ban (creator, 2026-11-13):** the BP exploration leans too heavily on lizard-like heads. Vary skull mass, muzzle length, jaw depth, nose, eye placement and ears, including mammalian and other structures. Reptilian and snake-like faces remain welcome among a wider mix. Interesting combinations of body plan, head and covering are the aim; Needlehip's liked lizard face, fur and whip tail are one successful combination, not a template for everything. Keep the changes restrained and anatomically coherent.
- **Further body-plan and surface variety (creator, 2026-11-13):** recent open exploration was too close to known Earth animals. Vary the whole body plan further, alongside skin texture, fur, feathers and scales. A recognizable ecological role and coherent animal biology are the anchors; the final silhouette need not identify a familiar Earth species. Covering should contribute to anatomy and silhouette, not merely decorate it. RF1–RF4 are liked exceptions to preserve, not templates for every new creature.
- **Range: recognisable biology with a twist or two around one core.** Start from a familiar kind of animal and its niche, then change up to two things around that core:
  - its body shape, keeping the same role
  - its head or mouth
  - its life cycle
  - a distinct new feature
  - a surprising symbiosis
  - another twist that does something

  Not a known animal recoloured, and not wholly alien: no flying garlic.
- **The models:**
  - The Slateprowler is the model: new anatomy, but recognisably a predator built for its purpose.
  - Ribbonvane marks the far edge of strangeness, not the centre.
  - Shieldhound is a good example of a combination: two recognisable animal features joined in a surprising way.
- **Most animals just live.** Many creatures simply fill an ordinary niche: grazing, hunting, scavenging, burrowing. Some have a surprising use to people, but a use is not required, and making every creature a tool is a misread.
- **Normal animals are fine too.** Deer, bears, boars and other ordinary animals belong in the world and can appear in art. They just aren't unique to it, so creature *exploration* should mostly look beyond them.
- **Variety in a batch:**
  - Limit fliers and plant hybrids.
  - Don't let one liked creature's body plan, vanes, membranes or shell repeat across a batch.
- **Scale:**
  - Truly enormous animals are rare and stop people in awe.
  - Most wildlife is ordinary or moderately large at believable scale.
  - Tidevault should be smaller than its first painting.
  - The giant sea creature is only a rumour far out at sea.
- **Liked creatures:**
  - Dawnsail (use the first painting, `breachline/art/concepts/dawnsail-passage.png`, for anatomy)
  - Coalback
  - Roof glider
  - Spindlejack
  - Slateprowler
  - Ribbonvane
  - Ashwing's skeletal familiar
  - from round 13: Moltwalker (the idea), Lampkeepers, Mendergrubs and Ashlicks
- **Dragons** are intelligent but primal. Talking with one takes a magical connection and is difficult. Not every drake shares that intelligence.
- **Constructs:**
  - Follow narrow instructions; adaptability is rare.
  - Can have personality without consciousness.
  - Their anatomy can be abstract, asymmetric and functional rather than an armoured human knight.
  - Heads should look like worked metal, not futuristic.

## Pose, energy and work

- **Lightly dynamic by default**, not over the top and not static. Match intensity to the subject: a berserker can roar, and a scholar can simply be absorbed in work.
- **Purposeful gaze and gesture:** give them a reason in the scene. Don't raise a hand without cause.
- **A still presence is enough when it's compelling.** Don't invent a task or a bystander to justify a character.
- **Vary poses and facing.** Not everyone faces right, and flipping a familiar pose isn't variety.
- **Enemies:** they may appear on screen occasionally, secondary to the main action. Aim an attack at the viewer only rarely.
- **Work scenes look like work.** Ordinary labour gets tired, practical expressions and plain staging, never heroic faces or theatrical lighting. That was the R1 lesson.
- **Physical checks:**
  - Check connected anatomy before selecting an image: trace hips to feet and shoulders to hands, and count limbs and fingers.
  - Grips, shields and supports must make physical sense.
  - Scale stays consistent through helmets, weapons and people on a shared ground plane.
- **Local edits:**
  - Keep the approved pose and untouched parts.
  - Name each limb by anatomical side and screen position.
  - If the underlying composition is rejected, replace it rather than stacking fixes.

## Magic

- **Usually understated and assumed in the world.** The creator loves Rain gathering because the magic "looks assumed in the world because it is". Large dramatic magic is welcome where it suits, as in Cinderfall.
- **Everyday magic the creator liked:**
  - levitation as part of a locksmith's job
  - light arriving from different directions in the barracks
  - the garden construct's charmingly impractical magic

  Magic doesn't have to be economically useful.
- **Varied kinds of magic are good.** Direct personal and creature magic, imbued objects and industrial uses can coexist:
  - Not every effect needs equipment, a visible power feed or a person supplying it.
  - Don't default to luminous threads, strings or ribbons; the field loom, the censer-healer and the gold strand of the Unmeasured Distance are accepted exceptions.
  - Magic shouldn't be mainly scrolls.
- **No hovering magitech vessels.** Aerial travel is by creatures or direct magic. Grounded steam machinery is fine, and magic can power the steam.
- **By alignment:**
  - **Gnosis** is scholarly high fantasy plus steam-era craft, not an optics uniform. Sound is at most one Gnosis card in eight, and preferably fewer. No new sound-focused Gnosis cards until the roster reaches 250 distinct cards; at that point this block expires, but the one-in-eight ceiling stays.
  - **Vigil** leans toward oaths, healing and protection.
  - **Fervor** leans toward forceful, instinctive magic: fire, lightning and storm.
- **Setting rules to respect.** See SETTING.md for scope:
  - Skilled magic needs learning and aptitude; crowds don't routinely cast.
  - Overuse is exhausting and can kill.
  - Failed spells usually fizzle.
  - Personal enchanted items are a luxury.
  - The Mountain's Lung burns mana-stones, which stay permanently spent.
  - Portals are rare.
  - Rare places can hold an enchantment for years with no caster present.
  - Soul leaks after death, so late revival leaves lasting changes. Revival has no required visual form.
  - Spirits are generally weak, distant or diffuse. The neutral graveside listener is one liked way to show them, not the only one.

## World and tone

- **The world is emerging from a dark time.** Communities have real hope with visible hardship, and aren't uniformly prosperous or harmonious.
- **Uneven capability:**
  - Ambrel's surviving university concentrates learned magic, taught as a practical trade.
  - Imperial remains are mostly ordinary roads and buildings; callbacks to the old Empire are liked.
  - Great cities and small places both exist.
- **Dominion life is harsh and oppressive.** Never tidy civic benevolence. The Price of Morning captures the feeling.
- **Genesis has societies:** villages, tree homes and households, not only wilderness.
- **Guns are rare.** The Focus-rifle's rifle is a focus for magic, not gunpowder.
- **Vampires are rare and subtle**, even when glamorous.
- **Architecture connects physically.** Routes, stairs and bridges make spatial sense. Modest curved eaves are a valid option.
- **Equipment:**
  - Simple, recognisable garments and armour, with clear seams, closures and load-bearing straps. No piles of layers without purpose.
  - Selected Asian armour details can blend into the established kit.
  - Fervor gear is varied and personally repaired, not issued.
  - A Dominion black kit is one character's option, not a uniform.
  - Units described as Armed look armoured, or are putting armour on.
- **Maps:** both earlier campaign maps were rejected for scale. The map is on hold.

## Alignments

Every alignment uses the same painting and material rules above. These are established palette and lighting options, not uniforms or separate rendering styles.

| Alignment | Peoples and subjects | Palette and light | Emblem |
| --- | --- | --- | --- |
| Vigil (white) | Lion folk, knights, clerics, soldiers | Gold, ivory, sky blue; warm light | Sun |
| Fervor (red) | Goblins, orcs, giants, dragons, sellswords | Ember orange, iron, soot, blood red; firelight, lightning and storm light | Three spikes |
| Gnosis (blue) | Scholars, city mages, brass constructs | Deep blue, teal, brass, amber; lamplight | Lantern star |
| Dominion (black) | Nobles, undead, bound devils, Ashborn | Ash grey, bone, tarnished silver, deep violet; cold, overcast light | Iron crown (interface emblem) |
| Genesis (green) | Forest peoples, druids, great beasts | Moss, bark, deep green, amber; dappled light | None yet |

## References

- **The library is a starting point, not a catalogue:** `breachline/art/reference-library-2026-11-06/` and its README.
  - Invent new faces, clothes, kit and places beyond it.
  - Reuse an exact face or item only for continuity or on request.
  - Recolouring the same kit isn't variety.
- **Attached images get copied.** An image model treats an attached image as a design to repeat, whatever the text says:
  - Attach reference sheets when you want their anatomy, identity or kit carried over. That's what they're for.
  - Don't attach finished paintings just for quality or movement. Describe those qualities in words.
- **Sheet presentation:** reference sheets use neutral light, plain backgrounds and simple clothes on purpose. Finished art needs a real presentation.
- **Strongly liked touchstones:**
  - **Older favourites:** Cinderfall, Brass siege-walker, Goblin firepot thrower, Court Informant, Unmake the Pattern, the Sunmane lancer (for material quality), Across the Silence, The Still Flame and Light Without an Answer.
  - **Recent rounds:** Underbridge vaporwright, Rain gathering, Roof glider, Cobalt rapier, Black enamel field kit, The Rain That Rises, The Rootbound Quarter, and the R5 and R6 Riverfolk scenes.
  - **How to use them:** carry their qualities forward, not their compositions.
- **Card selections:** a specific card's chosen image or variant is recorded in `breachline/art/CARD_ART_FINAL.json` and in HISTORY.md. For example, A Door into Snow uses its first in-scene character variant.
- **Interface art:** follows `breachline/art/UI_ART_BRIEFS.md`, at quieter contrast so cards and text stay clear.

## Open work

**Great-animal selections and final exploration (creator, 2026-11-13; latest):**
- G1–1 Cragwool is liked with a slightly more predatory, less stub-nosed face. Keep the body, plates and wool; no exaggerated aggression.
- G1–2 Reedstrider is liked. Extend its copper mohawk-like fibrous covering across the body, not just the back ridge. This is a local covering edit, not a new motif for every animal.
- Cut G1–3 Shellshoulder, G1–4 Mast forager, G1–5 Burrow listener and G1–6 Cliff scavenger. Make only ONE additional new large-animal proposal.
- G2–3 Gravelmouth, G2–4 Woodland breaker and G2–5 Salt-flat migrant are liked unchanged. Reject G2–1 Bankheaver, G2–2 Crownreach and G2–6 Estuary pursuer.
- G3–2 Undertow may continue: combine its two middle lobes on each side into one broader continuous fin with less outward projection and flatter outer edges. Preserve the small rear triangular feature. Reject G3–1 Longvault and G3–3/4/5/6.
- Make fresh massive proposals with substantially more imaginative whole-body plans. The world can support much less Earth-like distributions of mass and movement; keep coherent anatomy and purposeful coverings. Do not merely enlarge familiar skeletons or switch faces.
- ER1–ER6 refinements are approved. ER7–1, the reachable underslung pouch, is specifically selected. ER7–2 is unselected, not explicitly rejected.
- Keep rejected source cells crossed out and excluded from references, preserving composites needed for the liked cells and the creator’s review history.
- Stage the new FR1–FR3 edits, LN1 large proposal and MN1 six-animal massive lineup in `breachline/art/work-in-progress/animal-final-exploration-2026-11-13/`. All NEW artwork still needs review.
- After this design pass, organise all created animals by ecology, distinguishing selected animals, open proposals and rejected attempts. Do not turn tentative habitat or diet into settled lore.

 (2026-11-13)

**Ecological selections and larger size exploration (creator, 2026-11-13; latest):**
- E1–B is the chosen burrower, with the dorsal sack removed. E1–A was not selected, not explicitly rejected.
- E2–A and E2–B are rejected. Keep them crossed out in the requested review gallery and excluded from future references; the creator's earlier request to preserve review visibility with X overlays takes precedence over deleting the source files.
- E3–A and E3–B are both liked. E3–B should glide on its existing small membranes; preserve the strongly liked face/body and nursery relationship.
- E4–A Cradle thief is liked; make only a slight coat-pattern change to distinguish it from E3–B. E4–B is strongly liked and wanted as a normal bird, NOT a cradle thief/brood parasite; remove the stolen egg/host-brood staging and role.
- E5–A: keep the larger aquatic body and make its face rounded like the smaller swimming inset. This interpretation was explicitly confirmed. Aquatic life is wanted; the previous parasite role is not automatically settled.
- E5–B's translucent parasite is liked. Its fish-eating shore hunter is ALSO selected as a separate animal. Never make the parasite grow or transform into the hunter; the animal identities remain separate.
- E6–A: the ant-like workers, warrior forms and nuts stored inside the body are liked. E6–B becomes a small herd with varied responsibilities, NOT a hive. The dorsal pouch is disliked and inaccessible; compare an accessible underslung pouch and no pouch.
- Next exploration explicitly spans LARGE, EXTRA-LARGE and MASSIVE creatures. This replaces the earlier “slightly larger only” limit for this batch, while truly enormous wildlife remains rare in the world. Prepare six new options per band, with coherent weight, movement, anatomy and varied ecological roles; no copying accepted creatures at a larger size.
- New revisions and size studies remain pending review before the animal set is finalized. Stage: `breachline/art/work-in-progress/great-animals-and-ecology-refinements-2026-11-13/`.
- Completed for review: G1/G2/G3 each contain six new animals (18 total), plus ER1–ER7 refinement plates (ER7 has reachable-pouch and no-pouch alternatives). Review: http://127.0.0.1:8780/. Four unchanged selected originals E3–A/B, E5–B and E6–A are preserved in `reference-library-2026-11-06/ecological-selections-2026-11-13/`; the accepted gallery now has 45 animal visuals. New views are not automatically approved.


**In-game comparison feedback and fresh-painting follow-up (creator, 2026-11-13; latest):**
- Use the creator's spoken/written comments for preference decisions in this work. Do not use pairwise comparison losses as a substitute for dislike; the creator actually likes several pieces in the low-ranked set.
- IG1 Oath Sentinel remains undecided. IG2 Harmonic Burst needs a new concept: a random freestanding bell in a courtyard, causing people to fall, does not make contextual sense. This supersedes its earlier acceptance as the final artistic direction; a replacement is being developed.
- IG3 Cinder Firebrand's revised light direction is liked, but the figure must be easier to see. Keep that direction and brighten readable midtones. Better lighting must not hide faces and bodies.
- Preserve original Anoint with Embers (strongly liked), Sanctuary Threshold (its particular brightness is liked; the revision feels too crisp/detailed), and Hurled Brand (revision too dark). This does not establish a universal bright or dark palette.
- IG7 Alderkin Elder: retain the improved distant background with original stonework. IG8 Emberward: the revision is preferred.
- Keep Veyr's Dominion character. The woman described as rising from a chair is interpreted as C6 Another Service; preserve her design too. Other individual cast designs need not carry forward, while established species designs still do. Unmentioned art is not automatically rejected.
- Develop fresh scenes and a new card painting for each alignment. Do not keep extrapolating from edits of the same old scenes. The creator confirmed two scenes per people: the completed follow-up stages 14 scenes, 5 new card paintings, 2 targeted edits and 1 replacement concept. All are pending review. Full feedback and this round's records: `breachline/art/work-in-progress/peoples-fresh-scenes-2026-11-13/`. Fresh paintings remain proposals until reviewed.



**Ecological niches in paired approaches (creator, 2026-11-13; latest):**
- Fill each of the six identified ecological gaps in TWO independent requests: A follows the proposed design description; B receives only the niche plus current world/art goals and invents its own creature.
- Keep art direction and presentation comparable. Do not give B the proposed anatomy, palette, name, reference images or the A output. No image references are needed for this new-creature batch.
- The six niches are dung/seed burial, understone microbial-film grazing, plant-grown gall nurseries, brood parasitism, multi-host aquatic/land life cycles, and differentiated colony castes/nest economies.
- This batch is twelve exploratory plates arranged as six A/B pairs, following the creator's requested comparison. They are new proposals, not final references or canon.
- Completed E1–A/B through E6–A/B: twelve plates pending creator review, with exact initial and cleanup prompts, descriptions, image hashes and review controls. Compare at http://127.0.0.1:8779/. E2–B removes a mouth fringe; E5–B brings the parasite forward. These corrections use only each B output, never its A counterpart.
- Stage and exact requests: `breachline/art/work-in-progress/ecological-niche-pairs-2026-11-13/`.


**Coilneck working name (2026-11-13; latest):** the creator requested a new name for Sporewarden after removing the fungus. Use **Coilneck** provisionally for LG2–5 / LR6, referring to its flexible looping neck. This replacement was proposed by the assistant and is not a final creator-approved name. Preserve Sporewarden as the historical alias and keep the original prompt/image filenames for provenance.


**Five-alignment scene follow-up and Oren backlight (creator, 2026-11-13; latest):**
- The creator likes dynamic colour as well as consistent light. **S5-L1 is definitely preferred over original S5**; S6 still fails, partly because touching the stone does not communicate a meaningful action. Neither blanket desaturation nor soft overcast light is established as a general solution.
- Oren's individual appeal is uncertain. For original S1, try light coming from behind and transmitting through the membranes while the face stays in shadow. This is a lighting correction, not a reversal of final KR1 species approval.
- **C8:** Korr's face/body do not feel interesting or fitting, and the lightning spectacle is dramatic in the wrong way. Drama remains welcome. **C10:** the thorn action, distant gaze and village do not form a convincing scene. **C9:** a woman defending her own town makes sense; the setting supports the moment.
- The creator requests **one new painting per alignment**, using some existing characters, and asks how their art direction differs. All five share the painting/material rules; the palette and light table supplies options, which earlier prompts sometimes amplified too strongly.
- Completed proposals: **A1 Vigil / Brann — The Last Step; A2 Fervor / Tavra — Beside the Cart; A3 Gnosis / Ilyra — The Cut Stone; A4 Dominion / Veyr — The Watch Continues; A5 Genesis / Hessa — Before the Gate Closes.** A separate **S1-L2** tests the requested directional backlight.
- Use clear gaze, tool/contact, effort and physical setting where an action is shown. A still portrait remains valid when presence carries the image. Retain colour, coherent lighting and appropriate drama across all alignments.
- New paintings and character situations remain proposals; originals are retained for comparison. No new art is committed or finalized.
- Review and exact prompts: `breachline/art/work-in-progress/peoples-alignment-paintings-2026-11-13/`.

**Larger creature selections and refinements (creator, 2026-11-13; latest):**
- LG1–4 Vaultstalker is strongly liked: a larger honey-badger impression with scales. Preserve its original face, body and coverings.
- LG1–5 Pithbreaker and LG1–6 Mantlebrood are liked. Pithbreaker's size should clearly read a little larger than a small armadillo; exact dimensions remain open. The earlier black-bear-mass brief is not a fixed size. Preserve Mantlebrood's corrected small furred pouch.
- LG1 overall is decent, but LG1–1/2/3 were not individually selected. Throat combs/jaw frills are specifically disliked as an overused feature; this is not an explicit rejection of every animal that has one.
- LG2–4 Barkdrummer is liked for the head plate and feather-scale combination, with a noted overlap with number 5 (likely Pithbreaker; comparison not explicitly named). Keep identities separate.
- LG2–1 Pollenferry's transition from thick leathery skin into feather/fur is liked; preserve that material relationship. A clean-jaw reference tests the broader no-repeated-combs note.
- LG2–6 Scalelease is rejected: bugs beneath its scales do not make sense to the creator. Exclude that cell as a reference; the composite must remain because it contains liked designs.
- LG2–5 Sporewarden's animal is liked despite some grossness; test it without fungus. The fungal growth and symbiosis are not accepted. Keep the body/face, remove fungus and its growth beds; final revised design and name remain open.
- LR1–LR6 in `breachline/art/work-in-progress/larger-creature-references-2026-11-13/` are complete for review. Pithbreaker has a scale comparison; Sporewarden has intact fungus-free flanks and six legs. All new views and corrections still need review; original accepted cells remain intact.


**Consistent-lighting test for S1, S5 and S6 (creator, 2026-11-13; latest):**
- The creator suggests lighting may explain Dominion's stronger results: illumination is more consistent and the differences are smaller. They asked to fix **S1, S5 and S6** on that basis.
- Produce close edits with one coherent soft daylight treatment, smaller lit–shadow and warm–cool differences, subdued golden highlights, and the existing characters, poses, equipment, local colours and compositions preserved.
- Completed **S1-L1, S5-L1 and S6-L1** are pending comparison. This is a scoped lighting experiment; it does not establish overcast light or low contrast as a universal requirement.
- Originals remain unchanged. Scene/card approvals and final species sheets are unaffected; the catalogue and these revisions remain uncommitted.
- Compare: `breachline/art/work-in-progress/peoples-in-the-world-2026-11-13/lighting-review.html`. Exact edit prompts and source records: `lighting-prompts-and-manifest.json` in that folder.

**Peoples catalogue ranking and painted-quality investigation (creator, 2026-11-13; latest):**
- General scenes, favourite to least: **S4, S2, S3, S5, S7, S6, S1**. The creator prefers these general scene designs to the card art, especially in this set.
- Preferred cards in the given order: **C5, C6, C7, C9**. C10 has a little appeal, but the creator does not like it or the remaining cards very much.
- The creator reports that Dominion art repeatedly feels more painted and likes that its colours are less overstated. Investigate how to carry that quality into other alignments.
- **Working observations, not new creator rules:** S4/C5/C6 combine restrained related colours, selective highlights, worn materials and contained staging. S2 is a highly ranked colourful exception; C7 is a liked bright action image. C8 is relatively muted but disliked. Neither desaturation nor stillness alone explains the preferences.
- **Prompt audit:** all card prompts required a “clearly different dramatic composition.” Several also elevated golden light, magic effects or a demonstrated ability, while the Dominion briefs specified ordinary scale, restrained reflections and quiet coercion. Test these as possible causes; do not present them as proven.
- Preserve the rankings as comparative feedback. This review does not finalize or delete images, reject species designs, or authorize a commit of the catalogue.
- Exact feedback, visual observations and a proposed controlled comparison: `breachline/art/work-in-progress/peoples-in-the-world-2026-11-13/creator-feedback-2026-11-13.json`.

**Peoples scenes and card catalogue commissioned (creator, 2026-11-13):**
- The creator requested scenes first, then card art using the current peoples and characters, with appropriate equipment, proposed alignments and optional faction ties. This authorizes scene and card exploration from the current designs without making pending references final.
- Completed catalogue: seven scenes S1–S7, followed by ten card paintings C1–C10: five units, four spells and one instant, two card ideas per alignment.
- Final anatomy stays KR1 Kitefolk, GR1 Glimmerfolk, PL7 Moor folk and PL3D made people. Salt–silt PL8B, Crest folk CR3 and Coast folk CO1 remain visual proposals. Made people use the original restrained scarring and remain Dominion.
- New cast names, jobs, places, individual alignments, faction associations and all card mechanics are proposals; no live-game cards or final-art selections are changed. The catalogue does not establish a weak or absent soul for the made people.
- Catalogue, exact prompts, source hashes and review controls: `breachline/art/work-in-progress/peoples-in-the-world-2026-11-13/catalogue.html`.

**Made people final and Crest folk clarification (creator, 2026-11-13; latest):**
- **Made people:** finalize the original PL3D sheet unchanged. PL3E went too far on scarring and is rejected; remove its image and generated-source copies while retaining prompt and decision records. No single PL3D individual was chosen. Name, origin and weak/absent soul remain unresolved.
- **Crest folk:** the creator meant trying crest structures on the arms and body. CR2’s head/neck-only interpretation did not answer that request. CR3 uses the selected CR1 identity and tests modest actual crests on shoulders, upper chest, upper arms and forearms; the additions remain proposals.
- Latest feedback: `breachline/art/work-in-progress/peoples-lineups-2026-11-13/creator-feedback-round6-2026-11-13.json`.

**Accepted animal gallery, larger wildlife and ecological gaps (creator, 2026-11-13; latest):**
- Newly accepted: NC1–2 Tasselstride, NC1–3 Cleftpelt, NC1–5 Spindlebur, NC1–6 Quillheel, and NC2–4 Coppernape. Other NC cells have no new rejection unless explicitly recorded elsewhere.
- Preserve the earlier exact choices: original BP designs for HV1–HV6 and HV8; HV7–1 for Purlrunner. RF1–RF4 remain accepted.
- The creator requests one gallery of all accepted animals, with Xs covering rejected designs where they share images. Keep original artwork unchanged; gallery overlays may also hide unselected alternatives, labelled accurately.
- The creator then requests slightly larger animals, followed by an audit of ALL made animal concepts to identify clear underexplored ecological niches. Include rejected attempts in the audit so they are not falsely called untouched.
- Move somewhat closer again to the Scavengers Reign inspiration. The creator explicitly invites varied, creative experiments near the edges of their suggestions while preserving their vision.
- Consolidated gallery: `breachline/art/accepted-animals-2026-11-13/`. New studies: `breachline/art/work-in-progress/larger-creatures-2026-11-13/`.
- Current collection: 41 accepted animal designs and four separate companions/constructs after the LG review above. LR1–LR6 are new pending reference studies. The ecological audit and six next-niche briefs remain proposals, not canon.

**Earlier made people and Crest folk refinements (historical; superseded by clarification above):**
- **Made people:** PL3D’s direction is liked. Add more visible scarring while preserving ordinary scale, faces and the raised-from-death appearance. PL3E is the targeted revision; no individual or final design has been selected. Weak or absent soul remains tentative.
- **Crest folk:** integrate the sweep more into the overall design. CR2 develops continuity through brow, temples, skull and upper neck, retaining the selected PL9.4/CR1 identity and body. This interpretation is for review, not new settled biology or a general instruction to put folds on other peoples.
- Retain PL3D and CR1 as comparison bases. Other final selections and open sheets are unchanged.
- Latest feedback: `breachline/art/work-in-progress/peoples-lineups-2026-11-13/creator-feedback-round5-2026-11-13.json`.

**Earlier peoples selection and revival direction (historical; latest decisions above):**
- **Moor folk:** PL7 is final. Preserve the existing six-variation sheet unchanged as the accepted visual reference; no individual take was singled out. It joins final KR1 Kitefolk and GR1 Glimmerfolk in `breachline/art/reference-library-2026-11-06/peoples-final-2026-11-13/`.
- **Salt and silt folk:** one species with two variants, not two separate species. Pull their designs slightly toward each other and review the new PL8B lineup. The relationship is selected; revised anatomy and names remain open.
- **PL9.4:** selected for development as a species, continued in CR1. Cut PL9.1, PL9.2, PL9.3, PL9.5 and PL9.6 from further exploration. The original mixed sheet is retained only as source provenance for PL9.4, outside the active review; its other takes must not be reused.
- **PL10.1:** liked; CO1 develops its reference sheet. Preserve its rounded proportions and tail-free design. Other PL10 takes receive no new decision.
- **Made people:** push beyond merely tired or pale living people toward bodies visibly returned from death. Dominion raises people despite the cost and accepts a diminished return. No soul or a weak soul is a tentative possibility; do not canonize either. PL3D explores this at ordinary scale. Earlier insistence on fully living bodies is superseded for this exploration.
- **PL11 and PL12:** the last two broad new-people explorations are rejected. Remove their images and generated-source copies; retain prompts and decisions.
- New PL8B, CR1, CO1 and PL3D images still require review. Earlier PL4 remains neither finalized nor rejected; keep exaggerated faces, easing them only a tad to fit the setting.
- Latest feedback and exact prompt records: `breachline/art/work-in-progress/peoples-lineups-2026-11-13/`.

**Creature selections and new-generation clarification (creator, 2026-11-13; latest):**
- The creator clarified that the previous request meant new creatures guided by the variety note, not head replacements for the liked creatures. Faces still have to make anatomical sense.
- Keep the ORIGINAL BP designs for HV1 Foldstride (BP1–1), HV2 Loomstep (BP1–2), HV3 Shelfback (BP1–3), HV4 Needlehip (BP1–5), HV5 Ribhide (BP2–4), HV6 Scaleskein (BP2–5), and HV8 Gullied swimmer (BP3–4).
- Purlrunner uses HV7–1, the left option of its head study, with the matching body. This is the one selected head variation.
- The other HV variants are not the selected designs. Do not substitute their heads in future continuity work. Existing mixed sheets remain available as comparison records; accepted cells and their locations are explicitly indexed.
- These selections settle the chosen visual options; proposed ecology, abilities and lore are not automatically canon.
- Accepted selection index: `breachline/art/reference-library-2026-11-06/creature-selections-2026-11-13/selected-creatures.json`.
- Make NEW creature lineups with varied but integrated heads, body plans and coverings. Mammalian and other faces belong in the range; reptilian/snake-like faces are still allowed. Stage new work in `breachline/art/work-in-progress/creature-new-combinations-2026-11-13/`.

**Earlier peoples final selections and exploration (historical; latest selection above supersedes it):**
- **Final visual designs:** KR1 Kitefolk and GR1 Glimmerfolk are final and strongly liked. Preserve their accepted anatomy and faces; do not regenerate them as part of further exploration. Final reference files and handoffs are in `breachline/art/reference-library-2026-11-06/peoples-final-2026-11-13/`.
- **Ogre:** OG1 is rejected. Do not continue the ogre direction from PL3.6 without a new request.
- **Made people:** PL3B went too big and bulky. Continue at ordinary adult scale with lean or average builds and a restrained undead-like appearance, while remaining whole and alive. The made-people look is still open.
- **PL5.4:** closer to the setting; develop a focused lineup of related variations.
- **PL5.1 and PL5.2:** interesting and explicitly retained. Give them a combined follow-up lineup; PL5.1's head shape and body stripes are liked but need a slight reduction in excess.
- **PL5.6:** promising; remove the tail. Keep its simpler, less folded anatomy.
- **PL6.1:** the overall design is not liked, but the scale treatment on the nose is useful to explore separately.
- **PL6.2:** promising unusual anatomy and broad, somewhat froggy face; remove the ankle coils/wraps.
- **PL6.3:** too much like a prototypical alien; do not continue that design.
- **PL6.4:** looks really cool; explore the crest direction.
- **PL6.6:** could look cool but overlaps with existing Riverfolk; do not prioritize it.
- Continue fresh people exploration. Keep the unusual bodies and exaggerated faces; reduce the sci-fi feel and repetitive folds, with only a slight easing of facial exaggeration.
- Earlier PL4 remains open, neither finalized nor rejected. Mixed sheets stay for comparison where they contain retained or useful takes.
- Current records and next lineups: `breachline/art/work-in-progress/peoples-lineups-2026-11-13/`.

**Earlier creature head-variation exercise (superseded by the clarification above):**
- The BP exploration is getting closer, but is not final. BP1–2 Loomstep is strongly liked. BP1–1 Foldstride, BP1–3 Shelfback and BP1–5 Needlehip are liked; keep Needlehip's successful reptilian face/fur/whip-tail combination available.
- BP2–4 Ribhide is liked; BP2–5 Scaleskein is interesting. BP3–4 Gullied swimmer is liked; BP3–3 Purlrunner is tentatively liked. The assistant explored all eight in head-variation studies; the creator later clarified this was not the intended direction.
- BP1–4 Siltdrum is rejected for its fat, ugly appearance. BP2–1, BP2–2, BP2–3 and BP2–6 are not interesting to the creator and are not selected for this follow-up. Unmentioned takes have no new decision.
- Reduce repeated lizard-like heads by varying skull, jaw, nose and ear structures, including mammalian options. This is explicitly not a ban on snake or lizard faces, not permission to overdo the changes, and not a demand for Needlehip's combination on every creature.
- Preserve the selected bodies, silhouettes and coverings. The completed studies compared head options; the latest selection above determines which designs to use. No new head or implied biology is automatically canon.
- Mixed source sheets contain both liked and disliked cells: retain the composite files to preserve the liked work, and exclude BP1–4 from future references. No separate rejected Siltdrum image exists in this batch.
- Selections and notes are recorded with the BP batch; next studies are staged in `breachline/art/work-in-progress/creature-head-variations-2026-11-13/`.

**Creature body-plan feedback (creator, 2026-11-13; latest):**
- RF1–RF4 are very good: Lampkeeper, Moltwalker, Ploughback and Hooktail. The creator explicitly confirmed these sheet IDs. Preserve these four designs as visual references; this does not automatically make every proposed anatomical or ecological detail canon.
- Further open exploration is too close to Earth animals the creator already knows. Push the whole body plan further, and vary skin texture, fur, feathers and scales. Do not solve this only by attaching an extra feature to a familiar species.
- Keep recognizable animal biology and coherent movement/feeding, but allow less familiar proportions, body masses, limb arrangements and head structures. Covering should help define the silhouette and function, not be a recolour or surface filter.
- This feedback revises the exploration direction; it is not an instruction to alter RF1–RF4 or automatically delete all earlier exploration.
- Accepted visual sheets: `breachline/art/reference-library-2026-11-06/creature-references-2026-11-13/`.
- Next exploration staging: `breachline/art/work-in-progress/creature-body-plans-2026-11-13/`.

**Earlier Peoples follow-up (historical context; final selections above supersede it):**
- Kitefolk: PL1.3 is the best take. Keep its body and finger-supported membranes; make the face more extreme in the next reference sheet.
- Glimmerfolk: PL2.6 is the best take. Keep its proportions, broad ear-fans and dotted lines along the arms; add denser glimmers like PL2.4. Preserve the lines up the arm, spreading into broader clusters toward the lower forearms, wrists and hands.
- Ogre exploration: PL3.6 can start an ogre. Make it less human while keeping the body proportions. This is an exploratory ogre direction, not a made-person selection or established allegiance.
- Made people: none of PL3 fits. The creator asks for a slightly undead-looking appearance. They remain whole and living under the established setting; their next lineup may use pallor, hollow facial planes and a deathly quality without rot, stitches or laboratory clichés.
- New peoples: PL4 is interesting but neither finalized nor rejected. Keep all six open and make two additional exploration sheets. Do not promote or delete those studies.
- Follow-up images remain proposals for review; selected bases are not automatic approval of revised anatomy, culture or lore.
- Staging and full feedback: `breachline/art/work-in-progress/peoples-lineups-2026-11-13/`.

**Creature lineup selections and follow-up (creator, 2026-11-13):**
- Lampkeeper: CL2–5, the low oval leaf-limpet larva, selected for a reference sheet.
- Moltwalker: CL1–2, the elevated ridged walker, selected for a reference sheet.
- Ploughback: combine CL3–2's long low body and pointed trowel snout with CL3–3's overlapping scales. Keep the ordinary tail and wild rooting niche.
- Hooktail: CL4–4, with the entire tail covered in fur; remove all tail scales. Preserve the spotted otter-like body and grasping tail.
- Shieldhound: the ordinary dog fur and dog body read too literally; the shield does not fit the anatomy. Explore new body coverings and integrate the shield into the skull/neck/shoulder structure. This is Shieldhound-specific feedback, not a ban on fur elsewhere.
- Open exploration: CL6–1, the sieve-muzzle grazer, liked with a smaller, less extreme mouth structure (identity confirmed by the creator). Develop its reference sheet.
- Make further open exploration that pushes the boundaries a little, while keeping recognizable biology and coherent function. Selected takes can become references; the resulting new sheets still need review before scene work or canonical promotion.
- Follow-up staging: `breachline/art/work-in-progress/creature-reference-and-exploration-2026-11-13/`.

**Lineup briefs written (2026-11-13):** these are the first step for the items below.
- `breachline/art/work-in-progress/peoples-lineups-2026-11-13/BRIEFS.md`: Kitefolk, Glimmerfolk, the made people, and a sheet of six brand-new peoples.
- `breachline/art/work-in-progress/creature-lineups-2026-11-13/BRIEFS.md`: the five approved creatures, an open exploration sheet, and six round 13 rejects rebuilt under the new rules.
- The creator asked for new variety alongside the retries. Each retry sheet keeps four takes close to what was liked and makes two fresh departures.

The earlier round-12 retries have now led to final KR1 Kitefolk and GR1 Glimmerfolk reference sheets.

**Creature regen, next round.** Use the creature rules above and lineup sheets first. Approved ideas:
1. **Moltwalker, cleaner:** a crab-like creature, with the new soft one beside its old shell. Villagers collect the shells.
2. **Lampkeepers, Genesis:** glowing larvae kept in woven baskets in a tree village, not Ambrel.
3. **Ploughback:** a pig-sized digger with a spade snout. No tail limb, and not used by farmers; it simply lives in its niche.
4. **Hooktail:** an otter-like canal animal with a hooked, grasping tail.
5. **Shieldhound:** a dog-sized animal with a bony collar it raises like a shield.

Round 13's 16 rejects may come back once this approach works.

**Made people:**
- PL3D is final: preserve the original six-variation sheet unchanged. The stronger-scarring PL3E revision is rejected.
- Dominion allegiance is established; the name, origin and possible weak or absent soul remain open.

**Older studies still marked pending in HISTORY.md:** these may be stale; ask the creator before relying on them.
- Black Enamel, Open Road
- the Wardsteel cuirass
- the rolling mill
- Saltwake diviner and The second shadow
- the Lacquer tideguard
- the Starwell, Dawnward cavalier, Crownroot hart, Foundry strider and Spellglass sentinel revisions
- the steam walking crane
