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
  - The made people are visibly shaped.

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
  - No elves and no dwarves as peoples. The accepted dwarf sheet stays a visual reference only.
  - Animal-headed peoples are allowed. Don't mention head type to the image model either way.
  - A profession or alignment shown in one image does not define a whole people.
- **Accepted peoples:**
  - **Riverfolk:** fin ears, neck gills, subdued scales. They work in waterworks and live in small settlements. They're generally less privileged, and they never dive for mana-stones.
  - **Saltreach:** a human coastal culture, with rugged, weathered, mildly sunburnt skin, oiled wool and practical sea gear.

  Both live in `breachline/art/reference-library-2026-11-06/peoples-round-12-2026-11-13/`, with short descriptions.
- **The made people:** always Dominion, whole and alive, and not undead. Their joins healed long ago: no thread stitches, bolts, rot or lab clichés. They need a clearly made silhouette. Their look and name are still open.
- **Rejected people concepts:** don't restore these without a new request.
  - Scions (too human)
  - Graftkin and both made-people tests
  - Glimmerfolk, Kitefolk and Cairnfold
  - Mourncaps and Lichenkin
  - ravenfolk, badgerfolk, mothfolk, the mineral tripod and rhinoceros folk
  - Opaline Kin (style reference only, never a people)

  Stonehorn is the least-liked included design. Keep it as an option to revisit, not a template.

## Creatures

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

These are established palette options, not uniforms.

| Alignment | Peoples and subjects | Palette and light | Emblem |
| --- | --- | --- | --- |
| Vigil (white) | Lion folk, knights, clerics, soldiers | Gold, ivory, sky blue; warm light | Sun |
| Fervor (red) | Goblins, orcs, giants, dragons, sellswords | Ember orange, iron, soot, blood red; firelight, lightning and storm light | Three spikes |
| Gnosis (blue) | Scholars, city mages, brass constructs | Deep blue, teal, brass, amber; lamplight | Lantern star |
| Dominion (black) | Nobles, undead, bound devils, made people | Ash grey, bone, tarnished silver, deep violet; cold, overcast light | Iron crown (interface emblem) |
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

## Open work (2026-11-13)

**Creature regen, next round.** Use the creature rules above and lineup sheets first. Approved ideas:
1. **Moltwalker, cleaner:** a crab-like creature, with the new soft one beside its old shell. Villagers collect the shells.
2. **Lampkeepers, Genesis:** glowing larvae kept in woven baskets in a tree village, not Ambrel.
3. **Ploughback:** a pig-sized digger with a spade snout. No tail limb, and not used by farmers; it simply lives in its niche.
4. **Hooktail:** an otter-like canal animal with a hooked, grasping tail.
5. **Shieldhound:** a dog-sized animal with a bony collar it raises like a shield.

Round 13's 16 rejects may come back once this approach works.

**Made people:**
- Run a lineup sheet next.
- Lessons so far: Scions were too human, while G4 (four arms) and G5 (beast parts) were closer but not right.

**Older studies still marked pending in HISTORY.md:** these may be stale; ask the creator before relying on them.
- Black Enamel, Open Road
- the Wardsteel cuirass
- the rolling mill
- Saltwake diviner and The second shadow
- the Lacquer tideguard
- the Starwell, Dawnward cavalier, Crownroot hart, Foundry strider and Spellglass sentinel revisions
- the steam walking crane
