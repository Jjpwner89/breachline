---
name: rts-building-picks
description: RTS art decisions (2026-11-18) — soldiers are Quaternius modular people with fitted armour; Fantasy RTS buildings; town centre and Wonder castle lines separate; economy RTS + Village mix
metadata:
  node_type: memory
  type: project
  originSessionId: 51969946-6ca2-4365-90c5-592f529ba206
  modified: 2026-11-19T03:56:18.630Z
---

The user's building picks for the RTS on 2026-11-18, made from the "RTS Model Lineup" artifact. All of it is in the game (assets/models.glb, rebuilt with tools/models).

- **Soldiers:** Quaternius modular people (Male_Adventurer, Female_Medieval, Male_Farmer, Male_King), chosen over the 2018 knight after seeing full regiments. They wear refitted knight helmets and shoulder pads, Quaternius weapons pack gear, and body armour grown as a shell over the torso (steel plate, mail for cavalry, leather for archers). Team colour comes from a team surcoat shell over the armour, painted shield faces and dark team-shade archer hoods. Each figure (about 11k tris) has a light version simplified with meshoptimizer to about 1,500 tris; drawing full detail only near the camera ran 1,000 soldiers at about 13 ms per frame and 4,000 at about 19 ms on the user's Mac.
- **Base pack:** Quaternius Ultimate Fantasy RTS, for buildings, keeps and castles.
- **Keep:** the user first liked the Fantasy RTS TownCenter, then found in play that its models read as a fort or a town square, not a keep (2026-11-18/19). The village keep is now a hall that grows: TowerHouse_FirstAge, TowerHouse_SecondAge, Barracks_SecondAge_Level3 (great hall with towers), then the stone castle and fortress Wonders. Wonder_FirstAge_Level1 is the fort for forts and camps.
- **Castles:** the Wonder models form a separate line: Fort → Castle → Stone Castle → Fortress (Wonder_FirstAge_Level2/3, Wonder_SecondAge_Level2/3).
- **Houses:** pick one of the three Fantasy RTS house styles at random for each house, and keep the pack's level and age progression.
- **Economy:** the mixed version. The RTS pack provides gathering. Where it fits, a Quaternius Medieval Village Pack building is the upgrade of the RTS one, for example RTS storage becomes the Village Sawmill for planks; Village Blacksmith and Stable likewise.
- **Liked:** storage, market, port, farm, walls and gates, and the weapons and props.
- **Undecided:** archery range versus barracks.

**Why:** they want finished-looking, complete models with visible upgrades.

Codex art briefs (lord portraits, heraldry, map style, UI kit) are in RTS/assets/art/BRIEFS.md; the lords' names and house colours are fixed in src/world/realm.js.

**How to apply:** build toward these picks when the art goes into the game; ask before swapping any of them. See [[rts-art-preferences]] and [[rts-project]].
