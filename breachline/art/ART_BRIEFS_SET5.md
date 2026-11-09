# Breachline card art briefs: set 5

12 images for cards 31 to 42 in `../CARD_PROPOSALS.md`, written on 2026-11-08. **Status: briefs only, nothing has been generated.** Each card comes from a reference sheet the creator voted to turn into a card, so every brief keeps that sheet's character or item and gives it a new scene. The cards themselves are proposals, so names and rules may still change. Nothing here adds to canon until the creator approves it.

Add finished images to `CARD_ART_FINAL.json` once approved, since that file is the definitive selection of card art.

## Instructions for the image generator

1. If you have access to the project, read `.claude/skills/art-direction/SKILL.md` first, along with `breachline/SETTING.md` and `reference-library-2026-11-06/README.txt`. The creator's latest feedback overrides these briefs. That skill's "avoid red capes", "rain only when briefed" and "Repetition to watch" notes are not rules: the creator confirmed they never asked for them. A brief's pose or staging can change to serve the direction, but keep its subject, its gameplay idea and the continuity it lists.
2. Generate one image per heading, using the shared direction below plus that card's brief. Attach the reference sheets listed for that card, with paths relative to this `art/` folder. Exact combined prompts are in `ART_PROMPTS_SET5.json`.
3. Save a 1536 x 1024 landscape PNG in the `art/` folder under the name in the heading, and a 768 x 512 JPEG of the same name in `art/web/`.
4. Skip any card whose file already exists, and never overwrite existing art. No file name here matches an existing painting.
5. Use `sunmane-lancer.png` for painted material quality only, not its pose, framing, sky or colour.
6. If you can't generate images, stop and say so. Don't substitute placeholders or images from the web.

When finished, list the files you created and any cards you couldn't complete.

## Shared direction

Apply this to every image:

```text
Use case: stylized-concept.
Create one original Breachline high-fantasy card ILLUSTRATION ONLY, landscape PNG 1536 x 1024, 3:2. No card frame, lettering, border, logo, watermark or signature.

ART DIRECTION: traditional oil and acrylic fantasy painting, with creative silhouettes, believable weight and materials, and beautiful motivated light. Confident visible brushwork with varied scale, a little more visible than in earlier sets; broad coherent light and shadow masses, selective crisp focal accents, softer lost edges and atmospheric glazing. Faces are somewhat more attractive than real life on average, with individual proportions, age, fatigue and lived character, not uniform model faces. Faces are painted at the same resolution as everything around them, never sharper or more photographic. Natural simple hands, with no uncanny pores, etched veins, individual teeth, every hair, uniform microtexture or glossy 3D. Not a photograph, anime, cartoon, vector art, item icon or character sheet.

Tell one specific small story through attention, movement, an object's use, or an unmistakable magical change. People and creatures have motivated gestures and lightly dynamic poses. Keep ordinary subjects ordinary: a subject looks only as powerful as the brief says. Combat is generally lateral and nothing is aimed at the viewer. Enemies may be on screen occasionally, but remain secondary to the principal action or magical effect. Supporting figures remain few and loosely painted. Keep important anatomy and objects comfortably inside the frame, with one main idea that reads at card size.

Magic is restrained, specific and legible, as in the accepted round 04 studies: it can feel assumed in the world rather than overstated. Avoid default luminous threads, ribbons and energy cords except where the brief calls for the field loom's weave.

Use a scene-specific limited palette with lively warm and cool interplay. Imply the place through a few useful shapes rather than fully realizing it. Follow the facing and framing in the brief, and vary lighting and backdrops from scene to scene.

CONTINUITY: each card depicts an established character, creature or item from an accepted reference sheet, which is attached. Preserve the identity and signature equipment listed for that card. Everything else is new: pose, action, camera, light, setting and supporting figures. Don't copy the sheet's standing pose, plain background or neutral presentation.

SETTING: high fantasy, about 150 years after the Old Empire collapsed and the gods went silent. Ordinary life and generally stable new kingdoms continue. Vigil values oaths, protection and the gods. Gnosis studies magic as a science, and its Artificers make ingenious mechanisms. Dominion seeks control or ruin and pays for power, and its world is harsh and oppressive rather than tidy. Fervor prizes passion and freedom, with personal, unmatched gear. Genesis lives in and defends the wild. Societies are specific and local, not uniformly cosmopolitan.
```

## Alignment palettes

Alignment can be clear without being heavy-handed, and emblems don't need to appear on everything. The black and green rows are still proposals.

| Alignment | Palette and light |
| --- | --- |
| Gnosis | Deep blue, teal, brass, amber; lamplight |
| Dominion | Ash grey, bone, tarnished silver, deep violet; cold light. Patient, pitiful or ceremonious, rather than defaulting to gore, fangs or gothic castles |
| Fervor | Ember orange, iron, soot, blood red; firelight and hard sun |
| Genesis | Moss, bark, deep green, amber; dappled light. Distinct natural silhouettes, not humanoids dressed in leaves |
| Neutral | Whatever the scene needs |

## Gnosis

### Conclave field scholar: conclave-field-scholar.png

*Unit, cost 3. Zap: instead of attacking, deal 1 damage to an enemy 2 tiles away.*

**References:** `reference-library-2026-11-06/character-kits-2026-11-08/03-conclave-field-scholar.png` (continuity for this character, her face and her kit)

**Keep:** Her face, long dark braid and build from the sheet. The navy reinforced short coat with its steel side plates and ochre sleeves, the measuring staff with its three-pronged brass head, and the leather folio.

On a high, windswept survey path above a valley, the scholar has stopped mid-measurement, folio tucked under one arm. Without fully looking up from her notes, she has flicked the brass prongs of her measuring staff toward something off-screen RIGHT, and a small, quick snap of blue-white light has just left them, crossing a short gap and fading. The zap is deliberately modest: a bright crackle about the length of a forearm, not a beam. Her expression is mildly irritated at the interruption, not heroic. Wind pulls at her coat and a loose strand of hair. A few survey stakes and a cairn imply the place. Cool blues and slate greys, with the brass and her ochre sleeves as the warm notes.

### Harmonic wardwright: harmonic-wardwright.png

*Unit, cost 4. Ranged. Resonance: its attacks also deal 1 to each enemy next to the target.*

**References:** `reference-library-2026-11-06/magic-and-craft-2026-11-08/01-harmonic-wardwright.png` (continuity for this character, his face, breastplate and gauntlet); `reference-library-2026-11-06/character-kits-2026-11-08/05-gnosis-foot-soldier.png` (the blue-enamel breastplate's construction)

**Keep:** His face, close-cropped hair and beard, and build from the sheet. The blue-enamel breastplate, the long navy coat, and the brass stringed gauntlet on his right forearm.

An offensive moment. The wardwright stands on a low grassy rise, turned to the LEFT, his gauntleted hand thrust forward with its strings visibly vibrating. Down the slope, where his attack has landed, a ring of blue-violet resonance bursts outward through an old drystone field wall, throwing broken stones aside. Three enemy soldiers at the wall, small, loosely painted and secondary, are knocked off their feet in different directions by the same ring: one attack, several people hit. His stance is braced and certain, a scholar who has become a fighter, not a robed mage posing. Warm amber grass and long shadows, with the cool violet burst as the one strong contrast. Nothing is aimed at the viewer.

### Brightlance: brightlance.png

*Spell, cost 3. Deal 2 damage to an enemy unit, then push it 1 tile.*

**References:** `reference-library-2026-11-06/magic-and-craft-2026-11-08/01-harmonic-wardwright.png` (continuity for this character, his face, breastplate and gauntlet)

**Keep:** The same harmonic wardwright as the unit card: his face, beard, blue-enamel breastplate, navy coat and brass stringed gauntlet.

Inside a dark stone gatehouse passage at night, the wardwright drives his open right hand forward, the gauntlet's strings pulled taut. From his palm a narrow, solid-looking lance of blue and violet light TEARS forward to the RIGHT in a fast streak: it is clearly in motion, with a bright leading point, a trail breaking into crackling edges, and the air rippling in its wake. It is a lance of light, not a stone and not a lightning fork. At the right edge of the frame, small and secondary, an enemy's raised shield is being shoved backward by the impact, the figure behind it loosely painted and staggering. The spell's cold light falls across his face, beard and breastplate and throws hard shadows up the arch. Deep blue-black, electric blue and violet, with one warm note from a distant torch.

### Woven ward: woven-ward.png

*Enchantment, cost 3. Enchant one of your units: it ignores the next 4 damage, then the ward is used up.*

**References:** `reference-library-2026-11-06/magic-and-craft-2026-11-08/02-spellwright-field-loom.png` (continuity for the loom and its ward)

**Keep:** The field loom's design: dark wooden frame with brass corner fittings, three spools of blue-violet light, the side crank, the navy cloth cover and the paper pattern strip.

In the trampled yard of a camp at first light, the field loom stands on the lowered tailgate of a cart. A young Artificer, sleeves rolled, turns its crank with real effort, watching the work. A sheet of translucent blue-violet weave has just come off the frame and is settling over the shoulders and back of a soldier in a plain gambeson who has stepped up to receive it, turned to the LEFT toward where the line is forming off-screen. He looks down at the ward on his arm, uncertain and impressed. The weave is soft and faintly patterned, like light-made cloth, and fades at its edges. Muted greys and browns of the camp, a few loosely painted tents, with the ward as the brightest thing in the scene.

### Enchanter's quench: enchanters-quench.png

*Enchantment, cost 2. Enchant one of your units: +1 attack, and its attacks ignore Guard and other damage reduction.*

**References:** `reference-library-2026-11-06/magic-studies-round-04-2026-11-08/05-enchanters-quench.png` (the trough, tongs and the blade's blue light; a new, closer composition)

**Keep:** The rough-hewn stone quenching trough, the smith's iron tongs, and the plain straight blade whose steel takes on a deep blue inner light as it is quenched.

A close, downward view into a stone quenching trough in a dim workshop. A smith's scarred forearms and leather apron enter from the upper left, his tongs plunging a plain straight blade into the dark water. Where the steel meets the water it flares with a deep blue, crystalline inner light that spreads up the blade as it cools, and a column of steam boils up, lit from below. Ripples and bubbles break the surface. His face is only partly in frame at the top edge, intent, loosely painted. The magic stays inside the steel: no beams, threads or runes. Near-black stone and water, warm forge-orange spill from off-screen, and the cold blue of the blade.

### Rime drake: rime-drake.png

*Unit, cost 4. Flying. Freeze: the unit it attacks can't move on its next turn.*

**References:** `reference-library-2026-11-06/magic-studies-round-04-2026-11-08/02-rime-drake.png` (continuity for the drake's anatomy, scales and frost); `web/ember-drake.jpg` (how the existing drake card is painted, not its pose or setting)

**Keep:** The drake's anatomy from the sheet: horse-sized, pale grey and cream scales with darker mottling, backswept horns, frosted wing edges and a lean, long-tailed body.

Over a shallow river ford in deep winter, the rime drake is landing on a snowy bank, wings still half spread, its whole body in frame and its neck stretched LEFT as it exhales a dense, low cloud of freezing breath across the water. Where the breath passes, the ford is freezing solid in a spreading white bloom, locking around the legs of an enemy rider's horse caught mid-crossing. The rider and horse are small, loosely painted and secondary, the horse straining, unhurt but stuck. The drake is a wild animal acting on its own, not anyone's mount. Its breath is condensation, rime and pale crystal, with no glow, apparatus or energy cords. Pale gold sun, blue-white snow and steel-grey water.

## Genesis

### Thornwarden goblin scout: thornwarden-goblin-scout.png

*Unit, cost 1. Ranged.*

**References:** `reference-library-2026-11-06/character-kits-2026-11-08/04-thornwarden-goblin-scout.png` (continuity for this character, his face and his kit); `reference-library-2026-11-06/people/03-goblins.png` (goblin anatomy)

**Keep:** His face, ears and wiry build from the sheet. The quilted felt jack with its rust-red short capelet and hood, the simple self bow, the billhook at his belt and the wicker buckler on his back.

Crouched on a thick oak bough well above the forest floor, the goblin scout has drawn his short bow and leans out to the RIGHT, sighting down at something below and off-screen. One foot is braced against the trunk and his tongue is pressed into his cheek in concentration. The viewpoint looks up at him from below, past ferns and lower branches. He's small, quick and ordinary: a cheap scout, not a champion. Deep greens, mossy bark and patches of warm sunlight, with his rust-red capelet as the one strong colour.

### Bronze-harness alderkin: bronze-harness-alderkin.png

*Unit, cost 4. A strong unit with no ability.*

**References:** `reference-library-2026-11-06/character-kits-2026-11-08/07-bronze-harness-alderkin.png` (continuity for this alderkin, its body, harness and spear); `reference-library-2026-11-06/people/06-alderkin.png` (alderkin anatomy)

**Keep:** Its living-tree anatomy from the sheet: braided root legs, twisting trunk body, branching crown of orange autumn leaves. The fitted bronze chest shell on padded straps, the open bronze forearm guard and the long spear.

At the edge of its own grove of young trees, the bronze-harness alderkin is fighting. It lunges to the LEFT with a long, powerful spear thrust, its root-legs dug into the soil and its whole twisting body behind the blow. Its target is just off-screen; a few torn leaves and a splintered branch fly in the air between. Its face is fierce and focused. It defends its grove for its own reasons, not on anyone's behalf. Make it read as strong and dangerous, but not a champion: one hard-hitting fighter. Amber evening light catches the bronze, and the autumn leaves of its crown burn orange against cool shadow.

## Dominion

### Porcelain-visored retainer: porcelain-visored-retainer.png

*Unit, cost 3. Guard. Sworn: grows stronger each time another of your units is destroyed.*

**References:** `reference-library-2026-11-06/character-kits-2026-11-08/06-porcelain-visored-retainer.png` (continuity for this character's mask, helmet, coat and estoc)

**Keep:** The pale ceramic faceplate with its hairline crack over a steel sallet-like helmet, the dark plum long coat, the half-cuirass and the narrow estoc.

In a long, cold gallery of an Ashen Court house, the porcelain-visored retainer has stepped into the path of someone entering off-screen LEFT, placing itself between them and a seated noble behind it, who is loosely painted in shadow. Its estoc is lowered but ready, and its free gloved hand is held out flat toward the newcomer, a silent order to come no closer. At its feet lies a second porcelain mask, cracked across, dropped by a fellow retainer who is no longer there: the reason it now stands alone. The mask's blank calm makes it unsettling, with no gore and no monster. Ash grey walls, tarnished silver and plum, and a single candle's warmth against tall, cold windows.

### Veil adept: veil-adept.png

*Unit, cost 3. Veiled: can't be attacked or targeted until it attacks.*

**References:** `reference-library-2026-11-06/magic-studies-round-04-2026-11-08/01-veil-adept.png` (continuity for this character and her shadow magic); `world-concepts-2026-11-08/01-the-price-of-morning.png` (the feel of the Dominion city, not its composition)

**Keep:** Her face, short dark curls, angular features and lean build from the sheet. The wine-plum coat, dark shirt and the plain knife at her belt.

In a crowded, oppressive Dominion street of soot-stained tenements and toiling people, the veil adept walks to the RIGHT through the crowd, unhurried. Shadow is folded over half of her: one shoulder, arm and the trailing side of her coat dissolve into soft, smoky darkness. A checkpoint guard looks directly past her at the people behind, and no one in the crowd reacts. Her face is calm and faintly amused, her hand resting near the knife but not drawing it. The shadow is restrained and painterly, with no glow, sparkle or device. Dirty greys, soot and bone, with the deep violet of the shadow and her plum coat as the accents.

## Fervor

### Banked flame blade: banked-flame-blade.png

*Equipment, cost 2. Equip one of your units: +2 attack.*

**References:** `reference-library-2026-11-06/magic-studies-round-04-2026-11-08/03-banked-flame-blade.png` (continuity for the blade and its bearer)

**Keep:** The blade's design: a plain, slightly curved single-edged sabre with a simple guard and dark leather grip, the heat banked inside the steel as a molten line along its edge. The bearer's heavyset build, mail shirt and rust-red undersleeves.

The card is the blade. At night, in falling snow, the heavyset bearer sits on a log with the sabre resting across his knee, and the frame is close on the weapon. The heat banked in the steel glows along its edge in a deep orange line, and snowflakes hiss into tiny puffs of steam as they land on it. His thick fingers loosely hold the grip. His face is mostly out of frame, perhaps the edge of his beard at the top, warmed by the blade's light. The magic belongs to the item: no flames leaping off it and no runes. Blue-black night, grey snow, iron mail, and one warm ember-orange line.

## Neutral

### Stoneward colossus: stoneward-colossus.png

*Unit, cost 6. Guard. Can't move and can't be pushed.*

**References:** `reference-library-2026-11-06/magic-studies-round-04-2026-11-08/06-stoneward-colossus.png` (continuity for the colossus's construction and scale)

**Keep:** The colossus's design: blocky pale stone body about five metres tall, wide bronze bands at the joints, a small narrow head block in a bronze collar, and the arched opening through its chest.

In a narrow mountain pass, the stoneward colossus stands rooted across the road like a gate that chose to be there. Arrows from an unseen force off to the left are snapping and shattering against its stone. In its shadow, three or four ordinary travellers and a soldier crouch tight behind its legs and the arch of its body, sheltering; one peers out through the chest opening. They are small, loosely painted and human-sized, so its five metres read clearly. Nothing shows how it is powered: no glowing core, no engine. Pale ochre stone, aged bronze, and hard noon sun with deep cast shadow.

## Choices to check

- **Harmonic wardwright and Brightlance:** both show the same man, so his face and kit must match across the two cards. The unit card shows his attack landing on several people at once, and Brightlance shows the lance itself. The two use different light, facing and framing.
- **Banked flame blade:** the card is the blade, so the bearer is cropped to his hands, knee and the edge of his beard. He's kept consistent with the sheet in case he gets his own card later.
- **Enchanter's quench:** this is a new close view into the trough rather than the sheet's full workshop scene, so the card reads as the enchantment, not the smith.
- **Woven ward:** this is the only brief in the set with a thread-like effect, since the loom is accepted for exactly this.
- **Stoneward colossus:** the scene shows it standing still while others shelter. That works whether or not it keeps "can't move".
- **Porcelain-visored retainer:** the second cracked mask on the floor hints at Sworn without showing a body.

## Variety across the batch

The cards were checked against each other and against Set 4. Any generator should still compare results with recent paintings for repeated faces, outfits, weapons and compositions.

| Facing | Cards |
| --- | --- |
| Right | 4 |
| Left | 4 |
| Down | 2 |
| Frontal | 2 |

| Card | Facing | Framing | Light |
| --- | --- | --- | --- |
| Conclave field scholar | Right | Full body, three-quarter, figure about two thirds of frame height | Clear, cold upland morning with high thin cloud |
| Harmonic wardwright | Left | Wide, whole figure at mid-size on a rise, effect below | Late afternoon amber, raking long shadows |
| Brightlance | Right | Close three-quarter from slightly below, figure cropped at the thigh, lance crossing most of the frame | Night, lit almost entirely by the spell |
| Woven ward | Left | Medium wide, two figures and the loom, all fully in frame | Soft overcast morning in an open yard |
| Enchanter's quench | Down | Close detail looking down into the trough, hands and tongs entering from the side | Dim workshop, the blade glowing from under the water |
| Rime drake | Left | Wide, drake full-body mid-landing, small figures for scale | Low winter sun, long blue shadows on snow |
| Thornwarden goblin scout | Right | Full body, seen from below, figure smallish in the canopy | Dappled late morning through deep green leaves |
| Bronze-harness alderkin | Left | Full body, wide, low camera at ground level | Autumn evening, amber light and long shadows |
| Porcelain-visored retainer | Frontal three-quarter, facing slightly left | Full figure, mid-distance, a seated figure behind | Cold grey window light with one candle |
| Veil adept | Right | Medium wide, figure in the middle ground of a crowd | Dull overcast late afternoon in a city street |
| Banked flame blade | Down, the blade diagonal across the frame | Close detail on the blade; the bearer's hands, knee and mail cropped | Night snowfall, the blade the only warm light |
| Stoneward colossus | Frontal three-quarter, facing slightly right | Wide, colossus full-body, people small at its feet for scale | Hard, high sun in pale dust |
