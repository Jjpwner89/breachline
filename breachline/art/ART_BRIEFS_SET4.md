# Breachline card art briefs: set 4

26 images for the new cards in `../CARD_PROPOSALS.md`, written on 2026-11-06 and revised the same day against the reference library and the creator's Set 3 and campaign reviews. **Status: all 26 illustrations generated on 2026-11-06, with 1536 x 1024 PNGs and 768 x 512 JPEGs; creator review applied through 2026-11-08: the first huntress is restored, the squire and adept reworks are liked, and the latest shieldbearer and giant corrections await feedback.** See [the complete gallery](SET4_GALLERY.html), [prompts and selected files](ART_PROMPTS_SET4.json), and [file validation](SET4_VALIDATION.json). The cards themselves are proposals, so names and rules may still change. Nothing here adds to canon until the creator approves it.

Sellsword, Oath knight, Orc warchief and Hill giant already have paintings, so they have no briefs here. Add finished images to `CARD_ART_FINAL.json` once approved, since that file is the definitive selection of card art.

## Instructions for the image generator

1. If you have access to the project, read `.claude/skills/art-direction/SKILL.md` first, along with the peoples catalogue in `breachline/SETTING.md` and `reference-library-2026-11-06/README.txt`. The creator's latest feedback overrides these briefs. That skill's "avoid red capes", "rain only when briefed" and "Repetition to watch" notes are not rules for this set: the creator confirmed on 2026-11-06 that they never asked for them. A brief's pose or staging can change to serve the direction, but keep its subject and its gameplay idea.
2. Generate one image per heading, using the shared direction below plus that card's brief. Attach only the reference sheets listed for that card, with paths relative to this `art/` folder. Original generation prompts and subsequent creator-requested revision prompts are in `ART_PROMPTS_SET4.json`; current briefs and feedback override historical prompts.
3. Save a 1536 x 1024 landscape PNG in the `art/` folder under the name in the heading, and a 768 x 512 JPEG of the same name in `art/web/`.
4. For initial generation, skip existing files. The creator's later revision requests authorize replacing the specifically reviewed images; preserve all unrelated art and keep one selected PNG/JPEG pair per card.
5. Use `sunmane-lancer.png` for painted material quality only, not its pose, framing, sky or colour.
6. If you can't generate images, stop and say so. Don't substitute placeholders or images from the web.

When finished, list the files you created and any cards you couldn't complete.

## Shared direction

Apply this to every image:

```text
Use case: stylized-concept.
Create one original Breachline high-fantasy card ILLUSTRATION ONLY, landscape PNG 1536 x 1024, 3:2. No card frame, lettering, border, logo, watermark or signature.

ART DIRECTION: traditional oil and acrylic fantasy painting, with creative silhouettes, believable weight and materials, and beautiful motivated light. Confident visible brushwork with varied scale; broad coherent light and shadow masses, selective crisp focal accents, softer lost edges and atmospheric glazing. Faces are somewhat more attractive than real life on average, with individual proportions, age, fatigue and lived character, not uniform model faces. Natural simple hands, with no uncanny pores, etched veins, individual teeth, every hair, uniform microtexture or glossy 3D. Not a photograph, anime, cartoon, vector art, item icon or character sheet.

Tell one specific small story through attention, movement, an object's use, or an unmistakable magical change. People and creatures have motivated gestures and lightly dynamic poses. Keep ordinary subjects ordinary: a subject looks only as powerful as the brief says. Combat is generally lateral and nothing is aimed at the viewer. Enemies may be on screen occasionally, but remain secondary to the principal action or magical effect. Supporting figures remain few and loosely painted. Keep important anatomy and objects comfortably inside the frame, with one main idea that reads at card size.

Use a scene-specific limited palette with lively warm and cool interplay. Imply the place through a few useful shapes rather than fully realizing it. Follow the facing and framing in the brief, and vary lighting and backdrops from scene to scene.

REFERENCE USE: any sheets attached are starting points for species anatomy, painted treatment, material and construction, not a fixed cast or wardrobe. Develop a NEW individual with a distinct face, build, silhouette and practical belongings suited to this scene. Designs absent from the sheets are welcome. Keep established species traits and clear construction, with fewer, justified layers. Don't copy a sheet's pose, neutral clothes or plain background, or an old painting's setting. Use fresh staging, camera and light.

SETTING: high fantasy, about 150 years after the Old Empire collapsed and the gods went silent. Ordinary life and generally stable new kingdoms continue. Vigil values oaths, protection and the gods. Gnosis studies magic as a science, and its Artificers make ingenious mechanisms. Dominion seeks control or ruin and pays for power, and its world is harsh and oppressive rather than tidy. Fervor prizes passion and freedom, with personal, unmatched gear. Genesis lives in and defends the wild. Societies are specific and local, not uniformly cosmopolitan.
```

## Alignment palettes

Alignment can be clear without being heavy-handed, and emblems don't need to appear on everything. The black and green rows are still proposals.

| Alignment | Palette and light |
| --- | --- |
| Vigil | Gold, ivory, sky blue; warm light |
| Gnosis | Deep blue, teal, brass, amber; lamplight |
| Dominion | Ash grey, bone, tarnished silver, deep violet; cold light. Patient, pitiful or ceremonious, rather than defaulting to gore, fangs or gothic castles |
| Fervor | Ember orange, iron, soot, blood red; firelight and hard sun |
| Genesis | Moss, bark, deep green, amber; dappled light. Distinct natural silhouettes, not humanoids dressed in leaves |

## Vigil

### Oath shieldbearer: oath-shieldbearer.png

*Unit, cost 2. Guard: adjacent allies take less damage.*

**References:** `reference-library-2026-11-06/people/01-humans.png` (anatomy and painted treatment); `reference-library-2026-11-06/equipment/09-vigil-equipment.png` (how padded Still Flame gear is constructed)

An ordinary white woman of about twenty-five, broad-faced and sunburnt with a crooked nose, in a plain padded ivory jerkin and scuffed boots, supports a limping soldier as they move together along a dusty road. His nearer arm lies across her shoulders and her right arm supports his waist; her left arm carries a tall plain wooden shield on the outer side of the pair, with one spent arrow in its rim. Use a simple shared walking step, coherent hip and shoulder alignment and a natural head turn. Both figures have two arms and two legs; avoid a backward belt reach, twisted spine or reversed knees. The soldier is secondary and loosely painted. Warm pale dust, ivory, clean blue sky and a single low roadside bank. Her ordinary protective action is the subject. Her shield-carrying hand grips an unseen rear handle and is completely occluded by the wooden shield; no fingers or thumb wrap around its visible edge. Preserve the separate supporting hand at the soldier's waist.

### Pride huntress: pride-huntress.png

*Unit, cost 2. Stand together: stronger next to an ally.*

**References:** `reference-library-2026-11-06/people/02-lion-folk.png` (feline skull, mane, hands and build)

Use the FIRST Set 4 Pride Huntress painting, which the creator prefers: a closer crouching lion folk huntress in ochre dawn grass, with a dignified lion head, braided full mane, simple linen tunic, one leather forearm guard, a low level spear and an open signaling hand. A second hunter remains loosely painted in the distant grass. Preserve this closer composition and golden/violet painted treatment. Reject the subsequent wide revision with an extra leg. Exactly two legs, with a coherent crouch; do not force another wider framing solely to satisfy the older brief.

### Pride matriarch: pride-matriarch.png

*Unit, cost 5. Guard and Stand together.*

**References:** `reference-library-2026-11-06/people/02-lion-folk.png` (feline anatomy, with its grey-maned head as a starting point for age)

An old lion folk matriarch, tall and upright with a full mane gone grey and cream, stands knee-deep in the middle of a river ford, seen full-body from a low viewpoint on the water. She faces the far bank off-screen RIGHT, watching it steadily. One arm holds a long plain ash staff planted in the riverbed, and the other rests against a small lion cub pressed to her hip. Behind her, a few loosely painted lion folk wade across with bundles, sheltered by where she has chosen to stand. Her robe is undyed ivory and pale blue, with no ornate armour. Teal water throws moving gold light up onto her. Calm, immense authority, earned by age.

## Gnosis

### Sifting the shallows: sifting-the-shallows.png

*Spell, cost 1. Draw a card, then put a card on the bottom of your deck.*

**References:** none needed

A close, low view of a pair of pale, weathered forearms, physically connected beyond the crop, holding a flat brass-rimmed sieving pan just under the surface of ankle-deep water at dusk. Grey silt pours slowly through the mesh. Among it lie a few small shards of clear glass, each holding a tiny point of light. One shard has risen a finger's width above the pan by itself, while the others sink back into the water. A single amber lantern stands on the bank, soft and out of focus. Luminous cyan and teal water against one warm light. The whole idea is one small thing answering. No face, beam, runes or lettering.

### Conclave phantasm: conclave-phantasm.png

*Unit, cost 2. Decoy that can also hit.*

**References:** `reference-library-2026-11-06/equipment/10-gnosis-equipment.png` (the thrusting sword only)

A narrow city lane at blue hour. A slim duellist made of lamplight lunges side-on toward the LEFT, full-body, with a light sword aimed at someone off-screen, never at the viewer. The figure looks like a reflection seen in a shop window: faintly transparent, so the lit doorways behind show through its chest, with one trailing edge dissolving into soft brushstrokes. It has no distinct face. Far to the right, a small, ordinary student sits on a doorstep working it, attentive, and painted loosely. Amber and teal only. Avoid gemstone, opal or iridescent skin, and avoid a ghost's wail. It is clever rather than frightening.

### Threshold adept: threshold-adept.png

*Unit, cost 3. Ability: swap places with one of your units.*

**References:** `reference-library-2026-11-06/people/01-humans.png` (painted treatment of ordinary people)

Rebuild the entire scene as a grounded traditional fantasy painting. The creator rejects its animated-film appearance across staging, lighting, palette and rendering, not merely the adept's face. Use an oblique, asymmetrical view of a sparsely implied closing market with a lean young adult man in a faded teal waistcoat moving diagonally away, his attention turned to a displaced crate-carrying porter several paces behind. Each has brought the other's light along: muted amber indoor light lies in a soft patch on the adept and pavement, while cool slate-blue dusk crosses the porter and crate. Light belongs to surfaces rather than glowing body outlines. Restrained slate, umber, desaturated teal and small amber passages; irregular expressive oil brushwork, lost edges, natural proportions and weight. No jaunty two-person stage pose, toy-like scenery, glossy gradients, neon auras, portals or runes.

### Conclave examiner: conclave-examiner.png

*Unit, cost 4. Ability: an enemy unit cannot move or attack on its next turn.*

**References:** `reference-library-2026-11-06/people/08-humans-additional-faces.png` (range of ordinary older faces)

A South Asian woman in her sixties with heavy-lidded eyes and a strong nose, in a long slate-blue coat with her grey hair pinned up, sits on a small folding stool in an empty paved square, in full profile facing LEFT. She holds a pair of brass callipers out at arm's length, one eye narrowed, measuring something off-screen as if it were a specimen. Just in front of her, a narrow band of the air has gone perfectly still: a falling leaf and a thrown-up curl of dust hang motionless in it, while dust elsewhere drifts naturally. She's absorbed and unhurried, with no hostility at all. Quiet greys and teal, with brass as the only warm note. Keep the background to a single pale wall.

### Brass siege-walker: brass-siege-walker.png

*Unit, a construct, cost 5. Longshot: attacks up to 3 tiles away.*

**References:** `reference-library-2026-11-06/equipment/10-gnosis-equipment.png` (the mechanical crossbow, for brass fittings and winding gear)

A strange working machine, shown complete in a wide view: a tall, narrow brass frame on three long jointed legs, picking its way across a dry quarry floor. Its entire body is built around one long wooden throwing arm, drawn back and sighted far off-screen RIGHT, past the edge of the image. Its anatomy comes from that job, with no human head or torso, so it reads as a precise instrument that happens to walk. A small artificer sits in a sling seat, loosely painted, adjusting a sighting ring. Leave open gaps through the frame. It stands about two storeys tall. Sparse teal enamel, no organ pipes or smoke. Wide empty sky gives it room.

### Ilvane, Who Asks Twice: ilvane.png

*Unit, a Velunn: a lesser divine being, cost 6. Ranged. Draws a card when it destroys a unit.*

**References:** none needed

A very tall, thin being with deep brown skin and a long neck, in layered blue-black robes, bends down from a great height in a dim stone colonnade, shown full-body and leaning to the RIGHT. It is listening to a small kneeling scholar, loosely painted, who is mid-answer. Its head is tilted, and one too-long finger is lifted as if about to ask the same question again. Its eyes are pale and gentle, and unnerving because of how closely they attend. A small amber lamp hanging from its other hand lights them both. It is plainly more than human, with no halo, wings, crown or glowing display. Dark, quiet space above it shows its height.

## Dominion

### Barrow rats: barrow-rats.png

*Unit, cost 1. Hunt: stronger against a damaged unit.*

**References:** none needed

An extremely low viewpoint at ground level on grey ash under cold moonlight. Three lean, ordinary rats move in a line toward the LEFT, noses down, following a long uneven drag mark that continues off-screen. The lead rat has paused with its head raised and whiskers forward, sure of what it's following. They are ordinary animals with no mutation, glowing eyes or exposed bone. There is no blood or body in frame. The unease comes from their patience and the mark's direction. Deep violet and bone grey with soft edges, and one pale leaning stone out of focus. Keep all three rats fully in frame, and let them read clearly at small size.

### Indebted squire: indebted-squire.png

*Unit, cost 1. When summoned, you lose 1 life.*

**References:** `reference-library-2026-11-06/people/08-humans-additional-faces.png` (an ordinary young adult, as a starting point only)

A gangly white young man about nineteen with ginger curls, freckles and an ordinary youthful face has another violet knotted cord tied around his wrist by a grey-gloved clerk. His armour is poor and ill-fitting: a faded padded jack, one small dented iron shoulder plate and a little worn mail, with a plain scuffed belt. No polished engraved breastplate or expensive matched armour. He holds a sword awkwardly and looks toward the wrist with apprehension, slightly hunched shoulders, knitted brows and a tense uncertain mouth. He is visibly more scared, not admiring the bargain. A few thin older squires wait loosely painted against a plain oppressive courtyard wall. Cold grey daylight with violet accents; natural simple hands and economical facial detail.

### Hunted: hunted.png

*Enchantment, cost 2. Units attacking the enchanted unit get +1 attack.*

**References:** none needed

A high, wide view of a pale ash-covered moor at dusk, with a low sun at the far RIGHT of the image. One tiny, lone figure hurries LEFT across the open ground. A dozen bare thorn trees stand scattered around them at different distances, and every tree's long shadow bends across the ground to point at the figure, whichever way the sun should have thrown it. That is the only wrong thing in the painting. No pursuer, eyes, glowing marks or monsters are visible. Broad, quiet shapes with a limited palette of bone white, cold violet and one strip of dull gold. Restrained abstraction is welcome here. Dread comes from how calm the landscape looks.

### Called debt: called-debt.png

*Instant, cost 2. Lose 2 life and destroy a damaged enemy unit.*

**References:** none needed

A close view of a single gloved hand, physically connected beyond the crop at the lower left, closing around a dark knotted cord that runs taut across the whole image and off-screen to the RIGHT, toward someone we can't see. The cord is parting at the instant shown: one strand has already snapped and is curling back, and a thin thread of deep violet smoke leaves the break. The glove has slipped at the wrist, and the bare skin there has just gone grey, as though the price landed at the same moment. No blood, wounds or lettering. Muted ash and charcoal with one saturated violet. It should feel sudden, and read as a bargain coming due.

### Ashen Court envoy: ashen-court-envoy.png

*Unit, cost 4. Drain.*

**References:** `reference-library-2026-11-06/people/08-humans-additional-faces.png` (the handsome option, for level of attractiveness only); `reference-library-2026-11-06/equipment/17-dominion-personal-kits.png` (tailored cut, as one character's option)

A snowbound border post at a pale blue dawn. A composed, strikingly handsome Black man in his forties, in an immaculate charcoal travelling coat with a thin violet lining and tarnished silver clasps, is seen full-body from behind and to one side, walking LEFT toward two border guards. He holds out a sealed letter without any visible lettering. The guards are loosely painted, thin and wary, and their breath shows in the cold, as does his horse's. His doesn't. Nothing else is said about him: no fangs, no pallor, no high collar, no cape and no sinister smile. He's courteous, unhurried and a little too comfortable. An empty iron cage hangs from the post's one timber gate, surrounded by a lot of open snow.

### Barrow priest: barrow-priest.png

*Unit, cost 4. Ability: return a cheap unit from your discard pile to your back row.*

**References:** `reference-library-2026-11-06/people/01-humans.png` (anatomy and painted treatment)

An elderly white priest in a plain grey cassock with one dull violet stole kneels on a low burial mound at evening, side-on and facing LEFT. Very gently, he helps a long-dead soldier sit up out of the loose earth, with one arm behind its shoulders and the other steadying its rusted wrist, the way someone helps a frail relative rise from bed. A shallow bowl of bones sits beside him on the ground. The soldier's helmeted head hangs forward, with old bone and dried skin but no gore. The priest's face shows patience and real tenderness, which makes it unsettling. No glowing magic, skulls on staffs or black robes with flames. Ash grey and bone, under a long strip of pale sky.

### Barrow colossus: barrow-colossus.png

*Unit, cost 5. Gathered: stronger for each unit in your discard pile.*

**References:** none needed

A faceless, heavy-shouldered earthen colossus about three adult human heights stands in a quiet fallow field, fitting another ordinary helmet into its shoulder. Human equipment must retain human scale: helmets about 28 cm tall, roughly one twentieth of the colossus's height; human shields about 60 cm across and long bones about 45 cm. The held helmet is small between its broad fingers. Packed earth dominates its body, with small, partly buried pieces at varied depths; no enormous helmets forming shoulder plates. An ordinary crow and a human-sized spade near its foot establish scale on the same ground plane. Medium-wide rear/side view, simple low horizon, rust, bone and grey-brown earth, broad painting and quiet overcast light.

## Fervor

### Goblin firepot: goblin-firepot.png

*Unit, cost 2. When summoned, deals 1 damage to an enemy unit.*

**References:** `reference-library-2026-11-06/people/03-goblins.png` (ears, nose, build and skin); `reference-library-2026-11-06/equipment/14-raiders-and-berserker.png` (scavenged, personal approach to gear, not a kit to copy)

A small, wiry goblin with long pointed ears and a long nose stands on a rock on a scrubby hillside under hard noon sun and a clear blue sky, seen full-body from a low angle. He's winding up to lob a smoking clay pot underarm toward someone off-screen RIGHT, with his weight on his back foot, tongue at the corner of his mouth and eyes fixed on his target. Orange glows through a crack in the pot. A second pot hangs from a strap at his hip, wick unlit. He wears a scorched leather smith's apron, clearly made for someone bigger, over bare olive arms, with a coil of spare wick at his belt. He looks eager and a bit reckless, more an enthusiast than a champion. Simple, readable face without many teeth. The blue sky contrasts with the orange.

### Cinderfall: cinderfall.png

*Spell, cost 4. 3 damage to an enemy unit and 1 to each enemy next to it.*

**References:** none needed

A high view down into a narrow valley at deep indigo dusk. A single slow column of embers falls from above onto one point on an old road, and where it lands, a bright ring of orange light has opened in the ground. Smaller scatters of sparks are falling on either side of it. A handful of tiny soldiers, only a few strokes each, are spreading away from the ring with raised shields, with no bodies or gore. It's local and human in scale, not a volcano, and not the end of the world. The event is the subject and no caster is visible. Rich indigo and ember orange, with one line of cold river in the valley.

### Giant chieftain: giant-chieftain.png

*Unit, cost 6. Frenzy: stronger while damaged.*

**References:** `reference-library-2026-11-06/people/05-giants.png` (species anatomy only; use a new composition, never the rejected spear-pulling painting)

Use the creator-preferred full-body composition: an older, thickset female giant with a broad weathered face and one grey braid drives uphill toward an off-screen enemy to the right, roaring a rallying cry. She wears a short practical ivory tunic, loose charcoal trousers, worn boots and a patchwork rust-red cloak. A lightly stained upper-arm wrap, small brow cut and torn sleeve convey injury secondarily. No embedded spear, bloody stick or wound-pulling action. Show a coherent side-on three-quarter stance with aligned torso and hips: the leading leg is clearly connected from hip to planted boot on a low stone ledge, and the trailing leg pushes from lower ground; both feet point uphill. Keep the legs separated and both feet fully in frame. Preserve the creator-preferred pose and both arm positions. Her anatomical right hand, the near hand low beside her hip at image-left, holds a slender young tree trunk fashioned into a spear. Its front is shaved into a rough pale wooden point, with retained bark, a few short snapped branch nubs and subtle exposed roots at the butt. No metal spearhead or decoration. Keep the spear below the other raised fist, which remains visible in its original pose. Only adjust the gripping fingers locally; do not change the body, stance, legs, arms or other hand. A low human-built dry-stone breastwork breaks under her step; wind, dust, falling stones and a few distant arrows imply battle. No supporting figures in this new design. Warm light on ivory cloth and face against cool slate shadow, muted olive-grey ground and a small blue sky opening. Broad economical paint, selective detail, natural hands and a clear silhouette. The prior painting and all its local hand/spear corrections are rejected and must not be used as the composition reference.

## Genesis

### Thicket boar: thicket-boar.png

*Unit, cost 1.*

**References:** none needed

An ordinary, stocky wild boar is rooting in a fern thicket, shown full-body and side-on, facing LEFT. It has just lifted its head mid-dig with a clod of dark earth still on its snout, ears up, looking at something off-screen with mild suspicion. Coarse bristled hair is simplified into broad painted shapes. No huge tusks, moss armour or glowing eyes: this is a common animal of believable size. Dappled light falls across its back, with deep green and warm brown, and a single patch of yellow leaves as an accent. Keep the forest as soft, implied shapes behind. It should feel solid and a little comic in its attention, without being cartoonish.

### Grove tender: grove-tender-set4.png

*Unit, cost 3. Ability: an adjacent ally permanently grows.*

**References:** `reference-library-2026-11-06/people/06-alderkin.png` (lean braided anatomy and head); `web/walking-sapling.jpg` (the walking sapling's design, not its setting)

An alderkin, a lean living tree person about three metres tall, fights in a churned forest clearing, shown full-body in a wide stance and facing LEFT. Its braided, asymmetrical trunk is braced on two long rootlike legs, and one very long branch arm is sweeping sideways toward an enemy off-screen LEFT, with scattered bark and leaves showing the force of the swing. Its other arm stays low behind it, with a few root-fingers resting on a small walking sapling at its side. Under that touch, the sapling's limbs are visibly thickening and throwing out new pale green growth. A head grows naturally from the upper trunk under a spray of leaves, with quiet knot-like eyes and no carved human face. It wears nothing: no clothes, armour or weapons. It's protective and dangerous, with no humans in the scene. Hard shafts of light and deep green shadow.

### Mossback bear: mossback-bear.png

*Unit, cost 4. Regrow: recovers health at the start of your turn.*

**References:** none needed

A big, believable brown bear, about the size of a horse, wades out of a cold stream at evening toward the RIGHT, seen in a full-body three-quarter view from behind, with water running from its coat. Thick moss and a few small ferns grow along its back and over long-healed scars on its shoulder, as though the wounds had grown over instead of closing. It looks back over its shoulder, unbothered, at something off-screen LEFT. It is not charging, rearing or roaring. Golden light on wet fur, with deep green and cool grey stones, and one bright rim of water. A forest edge is only implied. Believable anatomy, with broad painted fur rather than individual hairs.

### Herd mother: herd-mother.png

*Unit, cost 6. Overrun: excess damage carries through.*

**References:** `web/elder-herd-bull.jpg` (the same kind of animal, not its pose or setting)

A very wide view of open uplands on a clear frost morning. An ancient, shaggy cow of the same kind as the Elder Herd bull, large as a barn, walks steadily away to the LEFT, seen in three-quarter view from behind. Her vast, sweeping horns are worn, and one has an old broken tip. A young calf walks in her shadow, and a few distant shapes of the herd follow. On a far ridge, two tiny people have stopped and stand watching her, plainly in awe, because this is not something anyone sees often. Her breath shows in the cold. White frost, russet coat and pale blue sky, with a lot of open space. She's unhurried, and nothing is being trampled.

### Orrowen, Who Was Here First: orrowen.png

*Unit, a Velunn: a lesser divine being, cost 7. Grows and Overrun.*

**References:** none needed

An old paved road curves widely, for no apparent reason, around a long, low green mound in rolling country at deep golden hour. The mound has just lifted its head. It's a very long, quiet face of living wood and stone with a great branching crown like antlers, and its amber eyes are half open, looking toward the RIGHT. Most of its body remains hillside, and it's hard to say where one ends and the other begins. A small traveller with a pack has stopped on the bend of the road, one hand slowly lowering, painted loosely. It is plainly more than an animal and has no ruin, city or building on its back. Deep greens and warm gold, with long shadows and a sense of great age.

## Neutral

### Camp follower: camp-follower.png

*Unit, cost 1.*

**References:** `reference-library-2026-11-06/people/08-humans-additional-faces.png` (range of ordinary faces)

A broad-faced Black woman in her thirties, a cook and laundress travelling with an army's camp, walks along its edge at low sun, shown full-body and heading RIGHT. A bundle of firewood rests on one shoulder and a dented kettle swings from her other hand. She has glanced back over her shoulder at someone calling from the tents, which are only a few loose shapes. Plain, patched dun clothes, an apron and sturdy boots, with no weapon and no alignment emblem. She's capable and wry, an ordinary person with a long day behind her. Warm dust and dove grey, and long evening shadows. No romance, no glamour, and no battlefield in view.

### Scarred summoner: scarred-summoner.png

*Unit, cost 4. When summoned, draws a card.*

**References:** `reference-library-2026-11-06/people/01-humans.png` (painted treatment of ordinary people)

A long-faced, strong-jawed white woman of about fifty-five sits on an upturned bucket beside a small campfire at night, in a medium view turned three-quarters to the LEFT. Her long sleeves are rolled above the elbow without any concern, and she's rinsing her forearm in a dented basin. Along that arm and up her neck runs a golden, scar-like mark, softly glowing, which lights the water and the underside of her chin. She has lived with it for a very long time. Her expression is tired, plain and at peace, and she's looking at nothing in particular. She wears a faded ochre wool shirt. She doesn't hide the mark and doesn't display it. Warm firelight, cool blue night and one line of gold.

## Choices to check

- **Grove tender:** this is an alderkin in a fight, as the creator confirmed alderkin can fight. It has its own file name because `grove-tender.png` is now the finished Grove Wanderer painting. Whether walking saplings are young alderkin is still undecided, so the brief doesn't say.
- **Barrow priest:** the finished Barrow Tender painting, an old man raking ash by a mound, has a similar role. Using it for this card instead would save a generation, though it wouldn't show the card's effect.
- **Lion folk:** only the two Pride cards use them, each among their own people, following the note to reduce lion repetition.
- **Ashen Court envoy:** the creator hasn't said yet whether this card is a vampire. The brief leaves it open with one small detail: everyone's breath shows in the cold but his. Remove that detail if he stays human. His striking looks are an intentional casting choice.
- **Barrow colossus, Mossback bear and Ilvane and Orrowen's appearances:** these are new subjects, so they're proposals, as are the placeholder Velunn names.
- **Scarred summoner:** she's meant to echo Young summoner, who keeps her mark hidden, without being the same person.
- **Indebted squire and Called debt:** both use a knotted cord, so the two cards quietly answer each other.

## Variety across the batch

These were checked against recent art. The adept moved off a quay, because the Conclave Courier is already on one, and outfits were changed where they echoed existing cards. Any generator should still compare results against recent paintings for repeated faces, outfits and weapons.

| Facing | Cards |
| --- | --- |
| Left | 12 |
| Right | 11 |
| Lateral | 1 |
| Down | 1 |
| Overhead | 1 |

| Card | Framing | Light |
| --- | --- | --- |
| Oath shieldbearer | Full body, natural shared supporting step | Flat noon sun on pale dust |
| Pride huntress | Preferred first closer crouch, secondary hunter behind | Low dawn light through dry grass |
| Pride matriarch | Full body, low viewpoint | Late afternoon sun reflected off moving water |
| Sifting the shallows | Close, hands and forearms only | Single amber lantern against cool dusk water |
| Conclave phantasm | Full body, side-on, with small figure behind | Shop window lamplight at blue hour |
| Threshold adept | Oblique diagonal view, irregular painted staging | Muted amber and slate-blue patches displaced between figures |
| Conclave examiner | Seated full figure, profile | Clear neutral morning daylight |
| Brass siege-walker | Wide, complete machine with small operator | Clear dry late-day sky |
| Ilvane, Who Asks Twice | Full body, very tall, wide negative space | Small hanging lamp in a dim colonnade |
| Barrow rats | Very low close view, several small animals | Cold moonlight |
| Indebted squire | Three-quarter figure, cropped at mid-thigh | Flat silver overcast in an open courtyard |
| Hunted | Grand landscape, tiny figure, high viewpoint | Low sun behind the figure, with impossible shadows |
| Called debt | Close, one hand and a taut cord crossing the frame | Dim neutral light with one violet accent |
| Ashen Court envoy | Full body, rear three-quarter, small party | Pale blue winter dawn over snow |
| Barrow priest | Full bodies side-on, kneeling | Low tarnished evening light |
| Barrow colossus | Wide, full body, rear three-quarter | Flat overcast light on a fallow field |
| Goblin firepot | Full body, low angle | Hard noon sun and a clear blue sky |
| Cinderfall | Grand landscape from a high viewpoint | Deep indigo dusk lit by falling embers |
| Giant chieftain | Preferred full-body uphill pose; held tree spear; no supporting figures | Warm sunlight against cool slate storm shadow |
| Thicket boar | Full body, side-on, close to the ground | Dappled late morning forest light |
| Grove tender | Full body, wide stance, two figures | Hard shafts of light through a torn canopy |
| Mossback bear | Full body, three-quarter from behind | Golden evening light on a cold stream |
| Herd mother | Very wide, rear three-quarter, tiny observers | Clear frost morning |
| Orrowen, Who Was Here First | Grand landscape, small observer | Deep golden hour under a clearing sky |
| Camp follower | Full body, walking | Warm low sun at the edge of a camp |
| Scarred summoner | Seated, medium view | A low campfire against a cool night, with the mark as second light |
