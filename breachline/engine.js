// Rules engine. Pure state in, state out, with no DOM, so the UI, the scripted
// bot and a future model-driven player all go through legalMoves and applyMove.
var Engine = (function () {
  // 6 by 5 with a 7-card hand since 2026-11-10 (creator), replacing 5 by 4 with 5 cards.
  var ROWS = 5, COLS = 6, START_LIFE = 15, OPENING_HAND = 7, MAX_REDRAWS = 2, TURN_LIMIT = 60, DEVOTION_MAX = 3;

  function land(id, colour, name) { return { id: id, name: name, type: 'land', colour: colour, cost: 0, wants: 0 }; }
  function unit(id, name, colour, cost, wants, atk, hp, extra) {
    var c = { id: id, name: name, type: 'unit', colour: colour, cost: cost, wants: wants, atk: atk, hp: hp, keywords: [], ability: null, text: '' };
    for (var k in (extra || {})) c[k] = extra[k];
    return c;
  }

  var CARDS = {};
  [
    land('land_w', 'W', 'Sunlit plains'), land('land_r', 'R', 'Cinder peaks'), land('land_u', 'U', 'Lantern quarter'), land('land_b', 'B', 'Ashen barrows'), land('land_g', 'G', 'Overgrown ruin'),
    unit('spearman', 'Militia spearman', 'W', 1, 1, 2, 2),
    unit('cleric', 'Temple cleric', 'W', 2, 1, 1, 4, { ability: { key: 'heal', label: 'Heal', amount: 3 }, text: 'Ability: heal an adjacent ally 3.' }),
    unit('knight', 'Oath knight', 'W', 3, 1, 3, 5, { keywords: ['Steadfast'], text: "Steadfast: +1 attack if she hasn't moved this turn." }),
    unit('lancer', 'Sunmane lancer', 'W', 4, 2, 5, 6, { keywords: ['Swift'], ability: { key: 'lance', label: 'Lance through' }, text: 'Swift. Ability: hit an adjacent enemy and the enemy directly behind it.' }),
    unit('warden', 'Pride warden', 'W', 6, 3, 6, 10, { ability: { key: 'rally', label: 'Rally', amount: 1 }, text: 'Ability: adjacent allies get +1 attack this turn.' }),
    { id: 'shield', name: 'Shield of dawn', type: 'instant', colour: 'W', cost: 1, wants: 1, prevent: 3, text: 'When your unit is attacked: prevent 3 of that damage.' },
    { id: 'banner', name: 'Blessed banner', type: 'enchant', colour: 'W', cost: 2, wants: 1, atkBonus: 1, hpBonus: 2, text: 'Enchant a unit: +1 attack and +2 health.' },
    unit('goblin', 'Goblin cutter', 'R', 1, 1, 2, 1),
    unit('raider', 'Orc raider', 'R', 2, 1, 4, 2, { keywords: ['Frenzy'], text: 'Frenzy: +2 attack on its first attack.' }),
    unit('conjurer', 'Street conjurer', 'U', 2, 1, 2, 2, { keywords: ['Ranged'], text: 'Ranged: attacks up to 2 tiles away.' }),
    unit('sellsword', 'Sellsword', 'N', 3, 0, 3, 4),
    unit('warchief', 'Orc warchief', 'R', 4, 2, 5, 5, { keywords: ['Warband'], text: 'Warband: adjacent allies get +1 attack.' }),
    unit('giant', 'Hill giant', 'R', 5, 2, 5, 8, { keywords: ['Stomp'], text: 'Stomp: its attacks also deal 1 damage to enemies next to the target.' }),
    unit('dragon', 'Elder dragon', 'R', 7, 3, 9, 10, { keywords: ['Flying', 'Fireproof'], text: "Flying: moves 2 tiles, over other units. Fireproof: burning tiles don't hurt it." }),
    { id: 'firebolt', name: 'Firebolt', type: 'instant', colour: 'R', cost: 2, wants: 1, damage: 2, text: '2 damage to an enemy unit.' },
    { id: 'hex', name: 'Withering hex', type: 'enchant', colour: 'R', cost: 2, wants: 1, atkBonus: -2, hpBonus: 0, text: 'Enchant a unit: -2 attack.' },
    unit('carrier', 'Water carrier', 'W', 1, 1, 1, 2, { ability: { key: 'heal', label: 'Heal', amount: 1 }, text: 'Ability: heal an adjacent ally 1.' }),
    unit('cub', 'Pride cub', 'W', 1, 1, 1, 2, { keywords: ['Stand together'], text: 'Stand together: +1 attack while next to an ally.' }),
    unit('sentinel', 'Oath sentinel', 'W', 3, 1, 2, 6, { keywords: ['Guard'], text: 'Guard: adjacent allies take 1 less damage from attacks.' }),
    unit('maren', 'Saint Maren of the Long Watch', 'W', 6, 3, 4, 12, { sub: 'Velunn', ability: { key: 'healall', label: 'Heal all', amount: 2 }, text: 'Ability: heal all adjacent allies 2.' }),
    unit('clanraiders', 'Cinder Clan raiders', 'R', 2, 1, 3, 2, { keywords: ['Swift'], text: 'Swift: moves 2 tiles.' }),
    unit('berserker', 'Cinder berserker', 'R', 3, 1, 4, 3, { keywords: ['Frenzy'], text: 'Frenzy: +2 attack on its first attack.' }),
    unit('captain', 'Mercenary captain', 'R', 4, 2, 4, 5, { ability: { key: 'orders', label: 'Orders' }, text: 'Ability: an adjacent ally that already moved can move again.' }),
    unit('drake', 'Ember drake', 'R', 4, 2, 4, 3, { keywords: ['Flying', 'Fireproof'], text: 'Flying: moves 2 tiles, over other units.' }),
    unit('decoy', 'Illusory decoy', 'U', 1, 1, 0, 1, { keywords: ['Decoy'], text: 'Decoy: adjacent enemies must attack this first. Removed after one hit.' }),
    unit('scholar', 'Cloistered scholar', 'U', 2, 1, 1, 2, { ability: { key: 'study', label: 'Study' }, text: 'Instead of moving or attacking: draw a card.' }),
    unit('arcanist', 'Lantern arcanist', 'U', 3, 1, 3, 3, { keywords: ['Ranged'], text: 'Ranged: attacks up to 2 tiles away.' }),
    unit('chorister', 'Brass chorister', 'U', 4, 2, 3, 5, { sub: 'Construct', ability: { key: 'push', label: 'Push' }, text: 'Ability: push an adjacent enemy 1 tile.' }),
    { id: 'displacement', name: 'Displacement', type: 'instant', colour: 'U', cost: 2, wants: 1, dodge: true, text: 'When your unit is attacked: move it 1 tile, and the attack misses.' },
    { id: 'glyph', name: 'Binding glyph', type: 'enchant', colour: 'U', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, enemyOnly: true, bind: true, text: "Enchant an enemy unit: it can't move." },
    unit('thrall', 'Gravebound thrall', 'B', 1, 1, 2, 2),
    unit('harvester', 'Bone harvester', 'B', 2, 1, 2, 3, { ability: { key: 'harvest', label: 'Harvest', amount: 3 }, text: 'Ability: destroy an adjacent ally. This unit gets +3 attack.' }),
    unit('noble', 'Ashen Court noble', 'B', 3, 1, 3, 4, { keywords: ['Drain'], text: 'Drain: heals this unit for the damage it deals.' }),
    unit('vashkar', 'Vashkar, Who Counts the Dead', 'B', 6, 3, 7, 9, { sub: 'Velunn', keywords: ['Drain'], lifeCost: 2, text: 'Drain: heals for the damage it deals. When summoned, you lose 2 life.' }),
    { id: 'raise', name: 'Raise the dead', type: 'spell', colour: 'B', cost: 3, wants: 1, raise: 3, text: 'Return a unit costing 3 or less from your discard pile to your back row.' },
    { id: 'warrant', name: 'Death warrant', type: 'enchant', colour: 'B', cost: 4, wants: 2, atkBonus: 0, hpBonus: 0, enemyOnly: true, warrant: 2, text: 'Enchant an enemy unit: destroy it at the end of your next turn.' },
    unit('sapling', 'Walking sapling', 'G', 2, 1, 1, 2, { keywords: ['Grows'], text: 'Grows: +1 attack and +2 health at the start of your turn, up to three times.' }),
    unit('saboteur', 'Thornwarden saboteur', 'G', 2, 1, 2, 3),
    unit('owl', 'Great owl', 'G', 3, 1, 2, 3, { keywords: ['Flying'], text: 'Flying: moves 2 tiles, over other units.' }),
    unit('wayfinder', 'Wayfinder druid', 'G', 3, 1, 2, 4, { extraLand: true, text: 'When summoned: you may play an extra land this turn.' }),
    unit('bull', 'Elder Herd bull', 'G', 5, 2, 6, 8, { keywords: ['Overrun'], text: 'Overrun: damage beyond what kills a target hits the enemy behind it.' }),
    { id: 'shifting', name: 'Shifting forest', type: 'instant', colour: 'G', cost: 1, wants: 1, shove: true, text: 'Push an enemy unit 1 tile back toward its side.' },
    unit('youngsummoner', 'Young summoner', 'N', 2, 0, 2, 3),
    { id: 'stillflame', name: 'The Still Flame', type: 'enchant', colour: 'W', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, regrow: 2, text: 'Enchant one of your units: it recovers 2 health at the start of your turn.' },
    unit('lampwright', 'Ambrel lampwright', 'U', 3, 1, 2, 4, { ability: { key: 'lens', label: 'Lens' }, text: 'Ability: an adjacent ally can attack up to 2 tiles away this turn.' }),
    { id: 'across', name: 'Across the silence', type: 'spell', colour: 'N', cost: 4, wants: 0, draw: 2, text: 'Draw two cards.' },
    { id: 'shelter', name: 'Winter shelter', type: 'enchant', colour: 'W', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, shelter: 2, text: 'Enchant one of your units: it takes 2 less damage from attacks.' },
    { id: 'marble', name: 'Through the marble', type: 'enchant', colour: 'G', cost: 3, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, grows: true, text: 'Enchant one of your units: +1 attack and +2 health at the start of your turn, up to three times.' },
    { id: 'dawnsails', name: 'Dawnsails over the harvest', type: 'spell', colour: 'W', cost: 1, wants: 1, extraLand: true, text: 'You may play an extra land this turn.' },
    { id: 'raincup', name: 'Raincup at first light', type: 'spell', colour: 'G', cost: 1, wants: 1, cleanse: true, text: 'Remove all enchantments from a unit.' },
    { id: 'mending', name: 'Mending the sail', type: 'spell', colour: 'U', cost: 2, wants: 1, mend: 2, text: 'Heal one of your units 2.' },
    { id: 'channel', name: 'Clearing the channel', type: 'spell', colour: 'G', cost: 4, wants: 2, fortify: 2, text: 'Each of your units permanently gets +2 health.' },
    { id: 'passage', name: 'Dawnsail passage', type: 'spell', colour: 'N', cost: 3, wants: 0, passage: true, text: "Move one of your units to any free tile. It can't attack this turn." },
    unit('slateprowler', 'Slateprowler', 'B', 3, 1, 3, 3, { keywords: ['Hunt'], text: 'Hunt: +2 attack against a damaged unit.' }),
    unit('reedcrown', 'Reedcrown grazer', 'G', 2, 1, 1, 4, { ability: { key: 'sift', label: 'Sift' }, text: 'Instead of moving or attacking: draw a card, then put a card on the bottom of your deck.' }),
    unit('coalback', 'Coalback forager', 'R', 2, 1, 1, 3, { ability: { key: 'forage', label: 'Forage' }, text: 'Instead of moving or attacking: you have 1 extra mana next turn.' }),
    // Set 4, from CARD_PROPOSALS.md.
    unit('shieldbearer', 'Oath shieldbearer', 'W', 2, 1, 1, 4, { keywords: ['Guard'], text: 'Guard: adjacent allies take 1 less damage from attacks.' }),
    unit('huntress', 'Pride huntress', 'W', 2, 1, 2, 3, { keywords: ['Stand together'], text: 'Stand together: +1 attack while next to an ally.' }),
    unit('matriarch', 'Pride matriarch', 'W', 5, 2, 4, 8, { keywords: ['Guard', 'Stand together'], text: 'Guard: adjacent allies take 1 less damage from attacks. Stand together: +1 attack while next to an ally.' }),
    { id: 'sifting', name: 'Sifting the shallows', type: 'spell', colour: 'U', cost: 1, wants: 1, sift: true, text: 'Draw a card, then put a card from your hand on the bottom of your deck.' },
    unit('phantasm', 'Conclave phantasm', 'U', 2, 1, 2, 1, { keywords: ['Decoy'], text: 'Decoy: adjacent enemies must attack this first. Removed after one hit.' }),
    unit('adept', 'Threshold adept', 'U', 3, 1, 2, 3, { ability: { key: 'swap', label: 'Swap' }, text: 'Ability: swap places with one of your units within 2 tiles.' }),
    unit('examiner', 'Conclave examiner', 'U', 4, 2, 2, 4, { ability: { key: 'hold', label: 'Hold' }, text: "Ability: an enemy unit within 2 tiles can't move or attack on its next turn." }),
    unit('siegewalker', 'Brass siege-walker', 'U', 5, 2, 4, 5, { sub: 'Construct', keywords: ['Longshot'], text: "Longshot: attacks up to 3 tiles away if it hasn't moved this turn." }),
    unit('ilvane', 'Ilvane, Who Asks Twice', 'U', 6, 3, 5, 8, { sub: 'Velunn', keywords: ['Longshot'], drawOnKill: true, text: "Longshot: attacks up to 3 tiles away if it hasn't moved this turn. Draw a card when this destroys a unit." }),
    unit('rats', 'Barrow rats', 'B', 1, 1, 1, 2, { keywords: ['Hunt'], text: 'Hunt: +2 attack against a damaged unit.' }),
    unit('squire', 'Indebted squire', 'B', 1, 1, 3, 3, { lifeCost: 1, text: 'When summoned, you lose 1 life.' }),
    { id: 'hunted', name: 'Hunted', type: 'enchant', colour: 'B', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, enemyOnly: true, hunted: 1, text: 'Enchant an enemy unit: units attacking it get +1 attack.' },
    { id: 'calleddebt', name: 'Called debt', type: 'instant', colour: 'B', cost: 2, wants: 1, debt: 2, text: 'Lose 2 life and destroy a damaged enemy unit.' },
    unit('envoy', 'Ashen Court envoy', 'B', 4, 2, 4, 5, { keywords: ['Drain'], text: 'Drain: heals this unit for the damage it deals.' }),
    unit('barrowpriest', 'Barrow priest', 'B', 4, 2, 2, 4, { ability: { key: 'exhume', label: 'Exhume', amount: 2 }, text: 'Ability: return a unit costing 2 or less from your discard pile to your back row.' }),
    unit('colossus', 'Barrow colossus', 'B', 5, 2, 4, 7, { keywords: ['Carrion'], text: "Carrion: permanently +1 attack whenever another unit dies, yours or the enemy's, up to +3." }),
    unit('firepot', 'Goblin firepot', 'R', 2, 1, 2, 1, { zap: 1, text: 'When summoned: 1 damage to an enemy unit.' }),
    { id: 'cinderfall', name: 'Cinderfall', type: 'spell', colour: 'R', cost: 4, wants: 2, blast: 3, splash: 1, text: '3 damage to an enemy unit, and 1 to each enemy next to it.' },
    unit('chieftain', 'Giant chieftain', 'R', 6, 3, 7, 8, { keywords: ['Warband', 'Stomp'], text: 'Warband: adjacent allies get +1 attack. Stomp: its attacks also deal 1 damage to enemies next to the target.' }),
    unit('boar', 'Thicket boar', 'G', 1, 1, 1, 3),
    unit('grovetender', 'Grove tender', 'G', 3, 1, 1, 4, { ability: { key: 'tend', label: 'Tend' }, text: 'Ability: an adjacent ally permanently gets +1 attack and +1 health.' }),
    unit('mossback', 'Mossback bear', 'G', 4, 2, 4, 6, { keywords: ['Frenzy'], text: 'Frenzy: +2 attack on its first attack.' }),
    unit('herdmother', 'Herd mother', 'G', 7, 3, 7, 11, { keywords: ['Overrun'], text: 'Overrun: damage beyond what kills a target hits the enemy behind it.' }),
    unit('orrowen', 'Orrowen, Who Was Here First', 'G', 7, 3, 6, 12, { sub: 'Velunn', keywords: ['Grows', 'Overrun'], text: 'Grows: +1 attack and +2 health at the start of your turn, up to three times. Overrun: damage beyond what kills a target hits the enemy behind it.' }),
    unit('follower', 'Camp follower', 'N', 1, 0, 1, 2),
    unit('scarred', 'Scarred summoner', 'N', 4, 0, 3, 5, { drawOnSummon: 1, text: 'When summoned: draw a card.' }),
    // Set 5, cards 31 to 42 in CARD_PROPOSALS.md.
    unit('fieldscholar', 'Conclave field scholar', 'U', 3, 1, 2, 3, { ability: { key: 'zap', label: 'Zap', amount: 1 }, text: 'Ability, instead of attacking: 1 damage to an enemy unit up to 2 tiles away.' }),
    unit('wardwright', 'Harmonic wardwright', 'U', 4, 2, 3, 4, { keywords: ['Ranged', 'Resonance'], text: 'Ranged. Resonance: its attacks also hit the enemy directly behind the target.' }),
    { id: 'brightlance', name: 'Brightlance', type: 'spell', colour: 'U', cost: 3, wants: 1, blast: 2, knock: true, text: '2 damage to an enemy unit, then push it 1 tile back toward its side.' },
    { id: 'wovenward', name: 'Woven ward', type: 'enchant', colour: 'U', cost: 3, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, ward: 4, text: 'Enchant one of your units: it ignores the next 4 damage, then the ward is used up.' },
    { id: 'quench', name: "Enchanter's quench", type: 'enchant', colour: 'U', cost: 2, wants: 1, atkBonus: 1, hpBonus: 0, allyOnly: true, pierce: true, text: 'Enchant one of your units: +1 attack, and its attacks ignore Guard and Winter shelter.' },
    unit('rimedrake', 'Rime drake', 'U', 4, 2, 3, 4, { keywords: ['Flying', 'Freeze'], text: "Flying: moves 2 tiles, over other units. Freeze: the unit it attacks can't move on its next turn." }),
    unit('goblinscout', 'Thornwarden goblin scout', 'G', 1, 1, 1, 1, { keywords: ['Ranged'], text: 'Ranged: attacks up to 2 tiles away.' }),
    unit('alderkin', 'Bronze-harness alderkin', 'G', 4, 2, 4, 6, { sub: 'Alderkin' }),
    unit('retainer', 'Porcelain-visored retainer', 'B', 3, 1, 2, 5, { keywords: ['Guard', 'Carrion'], text: "Guard. Carrion: permanently +1 attack whenever another unit dies, yours or the enemy's, up to +3." }),
    unit('veiladept', 'Veil adept', 'B', 3, 1, 4, 2, { keywords: ['Veiled'], text: "Veiled: can't be attacked or targeted by enemy cards until it attacks." }),
    { id: 'flameblade', name: 'Banked flame blade', type: 'enchant', equipment: true, colour: 'R', cost: 2, wants: 1, atkBonus: 2, hpBonus: 0, allyOnly: true, text: 'Equip one of your units: +2 attack.' },
    unit('stoneward', 'Stoneward colossus', 'N', 6, 0, 4, 8, { keywords: ['Guard', 'Holding ground'], text: 'Guard. Holding ground: enemies that move next to it must stop.' }),
    // Set 6, cards 43 to 75 in CARD_PROPOSALS.md. aim makes a spell target a tile, and its effect sits there for a number of the caster's turns.
    { id: 'scorch', name: 'Scorch', type: 'spell', colour: 'R', cost: 2, wants: 1, aim: { hit: 2, tile: 'burn', turns: 2 }, text: 'Aim at a tile: 2 damage to a unit there, and the tile burns for 2 turns.' },
    { id: 'stormstrike', name: 'Stormstrike', type: 'spell', colour: 'R', cost: 3, wants: 1, aim: { hit: 3, splash: 1, splashAll: true, tile: 'charge' }, text: 'Aim at a tile: 3 damage to a unit there and 1 to every unit next to it, yours included. The tile stays charged until your next turn, and the next unit to enter it takes 2.' },
    unit('salamander', 'Ember salamander', 'R', 3, 1, 3, 3, { keywords: ['Fireproof'], emberAtk: 2, text: "Fireproof: burning tiles don't hurt it. +2 attack while it stands on a burning tile." }),
    { id: 'frost', name: 'Frost', type: 'spell', colour: 'U', cost: 3, wants: 1, aim: { tile: 'frost', turns: 2, spread: true, foes: 1 }, text: "Aim at a tile: it and the tiles next to it freeze until the end of your next turn, and each enemy there takes 1 damage. Units on frozen tiles can't move." },
    unit('glyphwright', 'Glyphwright', 'U', 3, 1, 2, 3, { ability: { key: 'snare', label: 'Snare', turns: 3 }, text: "Ability: put a snare on an empty tile within 2 tiles, for 3 turns. The first enemy to enter it stops there and can't move on its next turn." }),
    { id: 'thornbrake', name: 'Thornbrake', type: 'spell', colour: 'G', cost: 2, wants: 1, aim: { tile: 'thorns', turns: 3 }, text: "Aim at a tile: thorns for 3 turns. A unit that enters must stop there and takes 1 damage. Alderkin aren't affected." },
    { id: 'gravesoil', name: 'Grave soil', type: 'spell', colour: 'B', cost: 2, wants: 1, aim: { tile: 'blight', turns: 3 }, text: 'Aim at a tile: blighted for 3 turns. Units there have -1 attack. When a unit dies on it, you summon a Gravebound thrall on that tile.' },
    unit('ashsower', 'Ash-sower', 'B', 3, 1, 3, 3, { ability: { key: 'blight', label: 'Blight', turns: 3 }, text: 'Ability: blight a tile next to it for 3 turns. Units there have -1 attack.' }),
    { id: 'consecrate', name: 'Consecrated ground', type: 'spell', colour: 'W', cost: 2, wants: 1, aim: { tile: 'holy', turns: 3 }, text: 'Aim at a tile: for 3 turns, your unit there takes 1 less damage from attacks and recovers 1 health at the start of your turn.' },
    { id: 'muster', name: 'Muster the levy', type: 'spell', colour: 'W', cost: 3, wants: 1, summons: ['spearman', 'spearman'], text: 'Summon two Militia spearmen.' },
    unit('lioness', 'Pride lioness', 'W', 4, 2, 3, 5, { summons: ['cub'], text: 'When summoned: summon a Pride cub.' }),
    unit('rabblerouser', 'Goblin rabble-rouser', 'R', 3, 1, 2, 2, { summons: ['goblin'], text: 'When summoned: summon a Goblin cutter.' }),
    { id: 'seedfall', name: 'Seedfall', type: 'spell', colour: 'G', cost: 4, wants: 2, summons: ['sapling', 'sapling'], text: 'Summon two Walking saplings.' },
    unit('gravecaller', 'Gravecaller', 'B', 4, 2, 2, 4, { gravecall: true, text: 'When an ally next to it dies, summon a Gravebound thrall.' }),
    unit('apprentice', 'Lantern apprentice', 'U', 2, 1, 1, 2, { adds: ['spark'], text: 'When summoned: add a Spark to your hand. Spark costs 1: 1 damage to an enemy unit.' }),
    unit('drummer', 'Cinder-cant drummer', 'R', 2, 1, 1, 2, { keywords: ['Warband'], adds: ['warchant', 'warchant'], text: 'Warband: adjacent allies get +1 attack. When summoned: add two War-chants to your hand. War-chant costs 1: one of your units gets +2 attack this turn.' }),
    unit('tithekeeper', 'Tithe-keeper', 'B', 3, 1, 2, 3, { curse: 'coin', text: "When summoned: put a Cursed coin in the enemy's hand. While it's there, they lose 1 life at the end of each of their turns. Playing it costs them 1 mana and does nothing." }),
    unit('assassin', 'Court assassin', 'B', 4, 2, 5, 2, { keywords: ['Ambush', 'Hunt'], text: 'Ambush. Hunt: +2 attack against a damaged unit.' }),
    unit('skirmisher', 'Cinder skirmisher', 'R', 3, 1, 3, 2, { keywords: ['Ambush'], text: 'Ambush: can enter on an empty tile beside or behind one of your units.' }),
    unit('packhunter', 'Orc pack-hunter', 'R', 3, 1, 3, 3, { keywords: ['Flanking'], text: 'Flanking: +1 attack when one of your units stands on the far side of the target.' }),
    unit('ridgewolves', 'Ridge wolves', 'G', 2, 1, 2, 2, { keywords: ['Flanking'], text: 'Flanking: +1 attack when one of your units stands on the far side of the target.' }),
    unit('outrider', 'Oath outrider', 'W', 3, 1, 3, 3, { keywords: ['Flanking'], text: 'Flanking: +1 attack when one of your units stands on the far side of the target.' }),
    unit('sergeant', 'Shieldline sergeant', 'W', 3, 1, 2, 5, { keywords: ['Holding ground'], text: 'Holding ground: enemies that move next to it must stop.' }),
    unit('ironbark', 'Ironbark sentinel', 'G', 5, 2, 3, 9, { sub: 'Alderkin', keywords: ['Holding ground'], text: 'Holding ground: enemies that move next to it must stop.' }),
    unit('martyr', 'Cinder martyr', 'R', 2, 1, 2, 1, { deathBurn: 'around', text: 'When it dies: each tile next to it burns for 2 turns.' }),
    unit('vigilkeeper', 'Vigil-keeper', 'W', 2, 1, 1, 3, { keeperLife: 1, text: 'When another of your units dies, you gain 1 life.' }),
    unit('acolyte', 'Still Flame acolyte', 'W', 2, 1, 1, 3, { loyal: 2, text: 'Loyal: +2 attack and +2 health while you have another Still Flame unit.' }),
    unit('journeyman', "Artificer's journeyman", 'U', 2, 1, 1, 3, { loyal: 2, text: "Loyal: +2 attack and +2 health while you have another Artificers unit." }),
    // Cards from the selected paintings, 92 to 103 in CARD_PROPOSALS.md.
    unit('veteran', 'Cinderline veteran', 'R', 3, 1, 3, 4, { keywords: ['Armed'], armed: 1, text: 'Armed: +1 attack and +1 health while it carries equipment.' }),
    { id: 'falchion', name: 'Redglass falchion', type: 'enchant', equipment: true, colour: 'R', cost: 2, wants: 1, atkBonus: 1, hpBonus: 0, allyOnly: true, grants: ['Hunt'], text: 'Equip one of your units: +1 attack and Hunt (+2 attack against a damaged unit).' },
    unit('rainreader', 'Rain-reader', 'U', 2, 1, 1, 3, { ability: { key: 'rain', label: 'Clear' }, text: 'Ability: clear the effect from a tile within 2 tiles, and your unit there recovers 1 health.' }),
    { id: 'mountainlung', name: "The Mountain's Lung", type: 'spell', colour: 'N', cost: 2, wants: 0, bonusNext: 3, text: 'You have 3 extra mana next turn.' },
    { id: 'cinderwake', name: 'Cinderwake', type: 'spell', colour: 'R', cost: 3, wants: 1, aim: { wave: 2, tile: 'burn', turns: 2 }, text: "Aim at a tile: a wave of fire rolls from it toward the enemy's side, dealing 2 damage to each enemy in its path. Every tile it crosses burns for 2 turns." },
    { id: 'stoneopens', name: 'The stone opens', type: 'spell', colour: 'G', cost: 3, wants: 1, stride: 1, text: 'Each of your units can move 1 extra tile this turn.' },
    unit('torchrunner', 'Copperlane torch-runner', 'R', 2, 1, 2, 1, { keywords: ['Swift', 'Fireproof'], trail: true, text: "Swift. Fireproof: burning tiles don't hurt it. When it moves, the tile it leaves burns until your next turn." }),
    unit('lanner', 'Ash-white lanner', 'R', 3, 1, 2, 3, { keywords: ['Flying', 'Hunt'], text: 'Flying: moves 2 tiles, over other units. Hunt: +2 attack against a damaged unit.' }),
    unit('winterdoor', 'Winterdoor keeper', 'U', 3, 1, 2, 3, { keywords: ['Freeze'], ability: { key: 'winterdoor', label: 'Open the door', turns: 2 }, text: "Freeze: the unit it attacks can't move on its next turn. Ability: an enemy's tile within 2 tiles freezes until the end of your next turn. Units on frozen tiles can't move." }),
    unit('mourner', 'Mothwake mourner', 'B', 3, 1, 2, 3, { mournLife: 1, text: 'When another of your units dies, the enemy loses 1 life.' }),
    { id: 'rapier', name: 'Cobalt rapier', type: 'enchant', equipment: true, colour: 'U', cost: 3, wants: 1, atkBonus: 1, hpBonus: 0, allyOnly: true, grants: ['Ranged'], text: 'Equip one of your units: +1 attack and Ranged (attacks up to 2 tiles away).' },
    unit('corewright', 'Corewright', 'U', 3, 1, 2, 3, { equipDiscount: 1, text: 'Your equipment costs 1 less.' }),
    // The 2026-11-10 roster, cards 104 to 191 in CARD_PROPOSALS.md. Relics stay in play beside the summoner, off the grid.
    // Vigil.
    unit('pilgrim', 'Devoted pilgrim', 'W', 2, 1, 1, 3, { keywords: ['Devotion'], text: 'Devotion: when it or an ally next to it is healed, it gets +1 / +1 for good, up to +3.' }),
    { id: 'vow', name: 'Vow of keeping', type: 'enchant', colour: 'W', cost: 2, wants: 1, atkBonus: -1, hpBonus: 0, allyOnly: true, vow: true, text: "Enchant one of your units: -1 attack. The first time it would die, it's left at 1 health instead, and the vow ends." },
    unit('chaplain', 'Still Flame chaplain', 'W', 3, 1, 1, 4, { ability: { key: 'farheal', label: 'Heal', amount: 2 }, text: 'Ability: an ally within 2 tiles recovers 2 health.' }),
    unit('ribbonvane', 'Ribbonvane', 'W', 4, 2, 3, 4, { keywords: ['Flying', 'Guard'], text: 'Flying: moves 2 tiles, over other units. Guard: adjacent allies take 1 less damage from attacks.' }),
    { id: 'lineofdawn', name: 'Line of dawn', type: 'spell', colour: 'W', cost: 3, wants: 1, aim: { column: true, foes: 1, mend: 2 }, text: 'Aim at a column: each enemy in it takes 1 damage, and each of your units in it recovers 2 health.' },
    { id: 'glaive', name: 'Stormglass glaive', type: 'enchant', equipment: true, colour: 'W', cost: 3, wants: 1, atkBonus: 1, hpBonus: 0, allyOnly: true, grants: ['Resonance'], text: 'Equip one of your units: +1 attack and Resonance (its attacks also hit the enemy directly behind the target).' },
    { id: 'roadshield', name: "Roadwarden's shield", type: 'enchant', equipment: true, colour: 'W', cost: 2, wants: 1, atkBonus: 0, hpBonus: 2, allyOnly: true, grants: ['Guard'], text: 'Equip one of your units: +2 health and Guard (adjacent allies take 1 less damage from attacks).' },
    { id: 'sunthread', name: 'Sunthread mantle', type: 'enchant', equipment: true, colour: 'W', cost: 1, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, shelter: 1, text: 'Equip one of your units: it takes 1 less damage from attacks.' },
    unit('roadsquire', 'Oath-road squire', 'W', 1, 1, 1, 2, { ability: { key: 'refit', label: 'Refit' }, text: 'Ability: move an equipment card from an ally next to it to another ally next to it, or to itself.' }),
    { id: 'standasone', name: 'Stand as one', type: 'instant', colour: 'W', cost: 2, wants: 1, brace: 2, text: 'When an enemy attacks one of your units: it and each ally next to it take 2 less damage from attacks this turn.' },
    { id: 'sanctuary', name: 'Sanctuary threshold', type: 'enchant', colour: 'W', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, sanctuary: 3, text: "Enchant one of your units for 3 turns: it can't be attacked from more than 1 tile away or targeted by enemy spells." },
    unit('penitent', 'Hearth-sworn penitent', 'W', 3, 1, 2, 4, { keywords: ['Devotion'], text: 'Devotion: when it or an ally next to it is healed, it gets +1 / +1 for good, up to +3.' }),
    unit('vowkeeper', 'Vowkeeper of the long road', 'W', 5, 2, 3, 7, { keywords: ['Guard', 'Devotion'], text: 'Guard. Devotion: when it or an ally next to it is healed, it gets +1 / +1 for good, up to +3.' }),
    { id: 'humbling', name: 'Humbling light', type: 'spell', colour: 'W', cost: 4, wants: 2, humble: { atk: 5, hit: 3 }, text: 'Each unit with 5 or more attack takes 3 damage, yours included.' },
    unit('ashsweeper', 'Still Flame ash-sweeper', 'W', 2, 1, 1, 3, { ability: { key: 'sweep', label: 'Sweep' }, text: 'Ability: clear every tile effect on its tile and the tiles next to it.' }),
    { id: 'oathbell', name: 'Oath bell', type: 'relic', colour: 'W', cost: 3, wants: 1, relic: 'bell', text: 'Once on each of your turns, pay 1: each of your units next to an ally gets +1 attack this turn.' },
    { id: 'reliquary', name: 'Pilgrim reliquary', type: 'relic', colour: 'W', cost: 2, wants: 1, relic: 'reliquary', text: 'At the start of your turn, your most damaged unit recovers 1 health.' },
    // Gnosis.
    { id: 'rimebolt', name: 'Rimebolt', type: 'spell', colour: 'U', cost: 3, wants: 1, blast: 2, chill: true, text: "2 damage to an enemy unit, and it can't move on its next turn." },
    unit('rimecaller', 'Conclave rimecaller', 'U', 3, 1, 2, 2, { keywords: ['Ranged', 'Freeze'], text: "Ranged: attacks up to 2 tiles away. Freeze: the unit it attacks can't move on its next turn." }),
    { id: 'borrowedwill', name: 'Borrowed will', type: 'spell', colour: 'U', cost: 4, wants: 2, borrow: true, text: "Take control of an enemy unit until the end of this turn. It can move and attack, even if it already has, but it can't attack a summoner." },
    { id: 'heldmoments', name: 'Held between moments', type: 'spell', colour: 'U', cost: 3, wants: 1, stasis: true, text: "Until the end of your next turn, an enemy unit can't move, attack or use abilities, and it can't be attacked." },
    { id: 'leaden', name: 'Leaden step', type: 'enchant', colour: 'U', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, enemyOnly: true, leaden: true, text: "Enchant an enemy unit: it loses Swift and Flying, and it can't move and attack in the same turn." },
    { id: 'unwind', name: 'Unwind the step', type: 'instant', colour: 'U', cost: 2, wants: 1, unwind: true, text: "When an enemy unit moves: it goes back to where it started and can't move again this turn." },
    unit('marksman', 'Focus-rifle marksman', 'U', 4, 2, 3, 3, { keywords: ['Longshot'], text: "Longshot: attacks up to 3 tiles away if it hasn't moved this turn." }),
    unit('fieldplate', 'Field-plate artificer', 'U', 3, 1, 2, 4, { keywords: ['Armed'], armed: 1, text: 'Armed: +1 attack and +1 health while it carries equipment.' }),
    { id: 'glimmer', name: 'Glimmer double', type: 'spell', colour: 'U', cost: 1, wants: 0, place: 'decoy', text: 'Summon an Illusory decoy on any empty tile outside the back rows. It vanishes at the start of your next turn.' },
    { id: 'whitemorning', name: 'White morning', type: 'spell', colour: 'U', cost: 3, wants: 1, aim: { row: true, chill: true, foes: 1 }, text: "Aim at a row: each enemy in it takes 1 damage and can't move on its next turn." },
    { id: 'harmonic', name: 'Harmonic burst', type: 'spell', colour: 'U', cost: 3, wants: 1, aim: { hit: 1, splash: 1, splashAll: true, push: true }, text: 'Aim at a tile: 1 damage to every unit there and next to it, yours included. Each enemy hit beside it is pushed 1 tile away.' },
    { id: 'frostbreak', name: 'Frostbreak', type: 'spell', colour: 'U', cost: 3, wants: 1, blast: 1, iceBlast: 3, text: '3 damage to an enemy unit that is frozen or stands on frozen ground. Otherwise 1.' },
    { id: 'prism', name: 'Prism bracer', type: 'enchant', equipment: true, colour: 'U', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, reach: 1, text: 'Equip one of your units: it attacks 1 tile further.' },
    unit('courier', 'Conclave courier', 'U', 2, 1, 1, 2, { keywords: ['Swift'], ability: { key: 'ferry', label: 'Carry' }, text: 'Swift. Ability: move an ally next to it 1 tile.' }),
    { id: 'unmake', name: 'Unmake the pattern', type: 'spell', colour: 'U', cost: 2, wants: 1, aim: { spread: true, unmake: true }, unrelic: true, text: 'Aim at a tile: remove every enchantment, equipment and tile effect there and next to it. Or destroy a relic.' },
    { id: 'tideglass', name: 'Tideglass engine', type: 'relic', colour: 'U', cost: 2, wants: 1, relic: 'tide', text: 'At the end of your turn, 1 unspent mana is stored in it, up to 3. On your turn, release it all as extra mana.' },
    { id: 'observatory', name: 'Folded observatory', type: 'relic', colour: 'U', cost: 3, wants: 1, relic: 'stars', text: 'You can see the top 2 cards of your deck. Once on each of your turns, you may swap them.' },
    // Dominion.
    { id: 'barrowmark', name: 'Barrow mark', type: 'enchant', colour: 'B', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, enemyOnly: true, mark: 'thrall', text: 'Enchant an enemy unit: when it dies, you summon a Gravebound thrall on its tile.' },
    unit('hostess', 'Hostess of the late hour', 'B', 5, 2, 4, 5, { keywords: ['Drain', 'Carrion'], text: 'Drain: heals for the damage it deals. Carrion: +1 attack for good whenever another unit dies, up to +3.' }),
    { id: 'debtblade', name: "Debt Collector's blade", type: 'enchant', equipment: true, colour: 'B', cost: 2, wants: 1, atkBonus: 1, hpBonus: 0, allyOnly: true, grants: ['Drain'], text: 'Equip one of your units: +1 attack and Drain (heals the bearer for the damage it deals).' },
    { id: 'ledger', name: 'Ledger of debts', type: 'spell', colour: 'B', cost: 2, wants: 1, selfLife: 2, draw: 2, text: 'Lose 2 life. Draw two cards.' },
    { id: 'siphon', name: 'Siphon vigor', type: 'spell', colour: 'B', cost: 4, wants: 1, bolt: 2, leech: true, text: '2 damage to an enemy unit or the enemy summoner. If it hits the summoner, you gain 2 life.' },
    { id: 'tithe', name: 'Collect the tithe', type: 'spell', colour: 'B', cost: 6, wants: 2, bolt: 3, leech: true, text: '3 damage to an enemy unit or the enemy summoner. If it hits the summoner, you gain 3 life.' },
    { id: 'pallofash', name: 'Pall of ash', type: 'spell', colour: 'B', cost: 4, wants: 2, aim: { square: true, all: 1, tile: 'blight', turns: 2 }, text: 'Aim at a tile: 1 damage to every unit in the square around it, yours included, and those tiles are blighted for 2 turns.' },
    { id: 'bought', name: 'Bought allegiance', type: 'spell', colour: 'B', cost: 6, wants: 2, buy: 4, text: "Take control of an enemy unit costing 4 or less for good. Loyal units refuse. It stays where it is and can act from your next turn." },
    { id: 'hour', name: 'Hour of collection', type: 'spell', colour: 'B', cost: 5, wants: 2, hour: 2, text: 'At the end of your next turn, every unit with 2 or less health is destroyed, yours included.' },
    unit('shutterassassin', 'Shutter-window assassin', 'B', 4, 2, 3, 2, { keywords: ['Longshot', 'Hunt'], text: "Longshot: reaches 3 tiles if it hasn't moved this turn. Hunt: +2 attack against a damaged unit." }),
    unit('mortuary', 'Mortuary priest', 'B', 3, 1, 2, 4, { keywords: ['Carrion'], text: "Carrion: permanently +1 attack whenever another unit dies, yours or the enemy's, up to +3." }),
    unit('temptress', 'Gilt-hall temptress', 'B', 4, 2, 2, 3, { ability: { key: 'charm', label: 'Charm', amount: 3 }, text: 'Ability, instead of attacking: charm an enemy unit costing 3 or less within 2 tiles. It is yours while she lives. Loyal units refuse.' }),
    unit('lynx', 'Halfshade lynx', 'B', 3, 1, 3, 2, { keywords: ['Veiled'], text: "Veiled: can't be attacked or targeted by enemy cards until it attacks." }),
    { id: 'gallows', name: 'Lots for the gallows', type: 'spell', colour: 'B', cost: 5, wants: 2, aim: { square: true, lots: true }, text: 'Aim at a tile: one random unit in the square around it is destroyed, yours included.' },
    unit('informant', 'Court informant', 'B', 2, 1, 1, 2, { tax: 1, text: "When summoned: a random card in the enemy's hand costs 1 more until it's played." }),
    unit('bailiff', 'Ashen Court bailiff', 'B', 3, 1, 2, 4, { ability: { key: 'sap', label: 'Restrain', amount: 2 }, text: 'Ability: an enemy next to it has -2 attack until the end of its next turn.' }),
    unit('tender', 'Barrow tender', 'B', 2, 1, 1, 3, { tender: 1, text: 'Once each turn, when another of your units dies next to it: you have 1 extra mana next turn.' }),
    { id: 'mourningveil', name: 'Mourning veil', type: 'enchant', equipment: true, colour: 'B', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, veil: true, text: "Equip one of your units: it's Veiled, and attacking doesn't end that. Each time it attacks, you lose 1 life." },
    unit('ossuary', 'Ossuary engine', 'B', 4, 2, 3, 5, { sub: 'Construct', keywords: ['Carrion'], text: "Carrion: permanently +1 attack whenever another unit dies, yours or the enemy's, up to +3." }),
    { id: 'scale', name: 'Sepulchral scale', type: 'relic', colour: 'B', cost: 2, wants: 1, relic: 'scale', text: 'Once each turn, when one of your units dies: lose 1 life and draw a card, unless you have 2 life or less.' },
    // Fervor.
    { id: 'kindle', name: 'Kindle the line', type: 'spell', colour: 'R', cost: 4, wants: 2, aim: { spread: true, foes: 1, light: true, tile: 'burn', turns: 2 }, text: 'Aim at a tile: it and the tiles next to it burn for 2 turns. Each enemy there takes 1 damage, and each of your units there becomes Lit.' },
    unit('slagheart', 'Slagheart hulk', 'R', 5, 2, 4, 7, { keywords: ['Lit'], text: "Lit: Fireproof. When it dies, it explodes: 2 damage to each unit next to it that isn't Fireproof, and the ground around it burns for 2 turns." }),
    unit('firebrand', 'Cinder firebrand', 'R', 3, 1, 3, 4, { burnHunt: 2, text: '+2 attack against a unit on a burning tile.' }),
    { id: 'hurledbrand', name: 'Hurled brand', type: 'spell', colour: 'R', cost: 3, wants: 1, bolt: 2, text: '2 damage to an enemy unit or the enemy summoner.' },
    { id: 'skyfalls', name: 'The sky falls in', type: 'spell', colour: 'R', cost: 5, wants: 2, bolt: 4, text: '4 damage to an enemy unit or the enemy summoner.' },
    { id: 'scatter', name: 'Scatter the line', type: 'instant', colour: 'R', cost: 3, wants: 1, aim: { row: true, foes: 1, back: true, fx: 'gale' }, text: 'Aim at a row: each enemy in it takes 1 damage and is pushed 1 tile back toward its side.' },
    { id: 'wildfire', name: 'Wildfire', type: 'spell', colour: 'R', cost: 6, wants: 2, sweep: 2, text: '2 damage to every unit, yours included. Lit and Fireproof units are unhurt.' },
    unit('firecaller', 'Untaught firecaller', 'R', 3, 1, 2, 3, { ability: { key: 'wildcast', label: 'Call fire', amount: 3, turns: 2 }, text: 'Ability: pick a tile within 3. Fire lands there or on a tile next to it, at random: 3 damage, and it burns for 2 turns.' }),
    { id: 'cinderhook', name: 'Cinderhook axe', type: 'enchant', equipment: true, colour: 'R', cost: 2, wants: 1, atkBonus: 2, hpBonus: 0, allyOnly: true, pierce: 'guard', text: 'Equip one of your units: +2 attack, and its attacks ignore Guard.' },
    { id: 'cinderrain', name: 'Cinder rain', type: 'spell', colour: 'R', cost: 4, wants: 2, aim: { square: true, embers: 3, ember: 2, tile: 'burn', turns: 1 }, text: 'Aim at a tile: three embers land on random tiles in the square around it. Each deals 2 damage to any unit there and burns the tile for 1 turn. Lit and Fireproof units are unhurt.' },
    unit('clanoutrider', 'Clan outrider', 'R', 2, 1, 2, 1, { keywords: ['Swift'], zap: 1, zapRange: 2, text: 'Swift. When summoned: 1 damage to an enemy unit within 2 tiles.' }),
    { id: 'shatter', name: 'Shatter the chain', type: 'spell', colour: 'R', cost: 2, wants: 1, unchain: 2, unrelic: true, text: 'Remove the last enchantment or equipment put on a unit, or destroy a relic. If it was on an enemy unit, that unit takes 2 damage.' },
    { id: 'anoint', name: 'Anoint with embers', type: 'spell', colour: 'R', cost: 2, wants: 1, light: true, text: "One of your units becomes Lit: fire doesn't hurt it, and when it dies it explodes for 2 damage around it." },
    { id: 'emberward', name: 'Emberward', type: 'enchant', colour: 'R', cost: 1, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, grants: ['Fireproof'], text: "Enchant one of your units: Fireproof (fire doesn't hurt it)." },
    { id: 'salmantle', name: 'Salamander-hide mantle', type: 'enchant', equipment: true, colour: 'R', cost: 2, wants: 1, atkBonus: 0, hpBonus: 1, allyOnly: true, grants: ['Fireproof'], text: "Equip one of your units: +1 health and Fireproof (fire doesn't hurt it)." },
    { id: 'warbanddrum', name: 'Warband drum', type: 'relic', colour: 'R', cost: 3, wants: 1, relic: 'drum', text: 'Once on each of your turns, pay 1: each of your units can move 1 extra tile this turn.' },
    // Genesis.
    { id: 'springmelt', name: 'Spring melt', type: 'spell', colour: 'G', cost: 2, wants: 1, mend: 4, temper: 1, text: 'One of your units recovers 4 health and permanently gets +1 attack.' },
    unit('alderelder', 'Alderkin elder', 'G', 7, 3, 5, 8, { sub: 'Alderkin', keywords: ['Grows'], text: 'Grows: +1 attack and +2 health at the start of your turn, up to three times.' }),
    unit('reedbank', 'Reedbank forager', 'G', 2, 1, 1, 3, { ability: { key: 'reed', label: 'Forage' }, text: 'Instead of moving or attacking: you may play an extra land next turn.' }),
    { id: 'overgrowth', name: 'Overgrowth', type: 'spell', colour: 'G', cost: 4, wants: 2, aim: { square: true, tile: 'thorns', turns: 2 }, text: 'Aim at a tile: the square around it fills with thorns for 2 turns.' },
    unit('pathguard', 'Thornwarden pathguard', 'G', 3, 1, 3, 4, { keywords: ['Holding ground'], text: 'Holding ground: enemies that move next to it must stop.' }),
    { id: 'canopy', name: 'Sudden canopy', type: 'instant', colour: 'G', cost: 2, wants: 1, canopy: true, text: 'When an enemy attacks one of your units from 2 or more tiles away: prevent all of that damage.' },
    { id: 'returnloam', name: 'Return to loam', type: 'spell', colour: 'G', cost: 2, wants: 1, loam: true, unrelic: true, text: 'Destroy an equipment card or a relic. You may play an extra land this turn.' },
    unit('trapper', 'Thornwarden trapper', 'G', 2, 1, 2, 2, { ability: { key: 'trap', label: 'Thorns', turns: 2 }, text: 'Ability: an empty tile next to it fills with thorns for 2 turns.' }),
    unit('mosshorn', 'Mosshorn grazer', 'G', 2, 1, 1, 3, { keywords: ['Rootfed'], text: 'Rootfed: permanently +1 attack and +1 health whenever you play an Overgrown ruin, up to +3.' }),
    unit('earthspeaker', 'Earthspeaker', 'G', 4, 2, 2, 5, { keywords: ['Rootfed'], extraLand: true, text: 'Rootfed: permanently +1 / +1 whenever you play an Overgrown ruin, up to +3. When summoned: you may play an extra land this turn.' }),
    unit('stag', 'Elderwood stag', 'G', 5, 2, 4, 6, { keywords: ['Swift', 'Rootfed'], text: 'Swift. Rootfed: permanently +1 attack and +1 health whenever you play an Overgrown ruin, up to +3.' }),
    unit('tortoise', 'Shell-mountain tortoise', 'G', 6, 2, 2, 12, { keywords: ['Guard'], text: 'Guard: adjacent allies take 1 less damage from attacks.' }),
    { id: 'seedheart', name: 'Seedheart vessel', type: 'relic', colour: 'G', cost: 3, wants: 1, relic: 'seed', text: 'Each land you play stores 1 growth in it, up to 3. On your turn, release it: one of your units permanently gets +1 / +1 for each.' },
    // Neutral.
    unit('recruit', 'Buckling recruit', 'N', 2, 0, 2, 2, { keywords: ['Armed'], armed: 1, text: 'Armed: +1 attack and +1 health while it carries equipment.' }),
    unit('rusthinged', 'Rust-hinged warden', 'N', 3, 0, 1, 6, { sub: 'Construct', keywords: ['Guard'], text: 'Guard: adjacent allies take 1 less damage from attacks.' }),
    unit('hound', 'Copper hound', 'N', 2, 0, 2, 2, { sub: 'Construct', keywords: ['Swift'], text: 'Swift: moves 2 tiles.' }),
    unit('waystone', 'Waystone golem', 'N', 5, 0, 5, 7, { sub: 'Construct' }),
    // Cards only ever added to a hand by another card. They're conjured, and never go in a deck.
    { id: 'spark', name: 'Spark', type: 'spell', colour: 'U', cost: 1, wants: 0, blast: 1, token: true, text: '1 damage to an enemy unit.' },
    { id: 'warchant', name: 'War-chant', type: 'spell', colour: 'R', cost: 1, wants: 0, chant: 2, token: true, text: 'One of your units gets +2 attack this turn.' },
    { id: 'coin', name: 'Cursed coin', type: 'spell', colour: 'N', cost: 1, wants: 0, coin: true, token: true, text: 'While this is in your hand, you lose 1 life at the end of each of your turns. Playing it does nothing.' }
  ].forEach(function (c) { CARDS[c.id] = c; });

  // Changes to existing cards, 82 to 91 in CARD_PROPOSALS.md.
  (function (set) { for (var id in set) for (var k in set[id]) CARDS[id][k] = set[id][k]; })({
    thrall: { atk: 1, hp: 1, loyal: 1, text: 'Loyal: +1 attack and +1 health while you have another Gravebound unit.' },
    youngsummoner: { atk: 1, hp: 3, keywords: ['Errant'], ability: { key: 'errant', label: 'Summon', summon: 'follower' }, text: 'Errant. Ability: summon a Camp follower on a random tile in your back row.' },
    slateprowler: { keywords: ['Hunt', 'Ambush'], text: 'Hunt: +2 attack against a damaged unit. Ambush: can enter beside or behind one of your units.' },
    saboteur: { keywords: ['Ambush'], text: 'Ambush: can enter on an empty tile beside or behind one of your units.' },
    cinderfall: { blast: 0, splash: 0, aim: { hit: 3, splash: 1, tile: 'burn', turns: 2 }, text: 'Aim at a tile: 3 damage to a unit there and 1 to each enemy next to it, and the tile burns for 2 turns.' },
    spearman: { loyal: 1, text: 'Loyal: +1 attack and +1 health while you have another Sunmane Oath unit.' },
    goblin: { loyal: 1, text: 'Loyal: +1 attack and +1 health while you have another Warhorde unit.' },
    knight: { keywords: ['Holding ground'], text: 'Holding ground: enemies that move next to it must stop.' },
    follower: { deathDraw: 1, text: 'When it dies: draw a card.' },
    drake: { deathBurn: 'self', text: "Flying: moves 2 tiles, over other units. Fireproof: burning tiles don't hurt it. When it dies: its tile burns for 2 turns." }
  });

  var DECKS = {
    white: { name: 'Oath of the Sunmane', colours: ['W'], list: [['land_w', 10], ['matriarch', 1], ['stillflame', 1], ['lioness', 1], ['outrider', 1], ['shelter', 1], ['cleric', 3], ['sentinel', 3], ['knight', 2], ['lancer', 1], ['huntress', 1], ['warden', 1], ['maren', 1], ['shield', 1], ['banner', 1], ['across', 1]] },
    red: { name: 'The Warhorde', colours: ['R', 'U'], list: [['land_r', 9], ['land_u', 1], ['coalback', 1], ['clanraiders', 3], ['raider', 3], ['conjurer', 1], ['berserker', 2], ['passage', 1], ['captain', 1], ['warchief', 2], ['drake', 1], ['giant', 1], ['dragon', 1], ['firebolt', 2], ['hex', 1]] },
    blue: { name: 'The Lantern Conclave', colours: ['U', 'W'], list: [['land_u', 9], ['land_w', 1], ['decoy', 1], ['mending', 1], ['conjurer', 2], ['lampwright', 3], ['scholar', 2], ['arcanist', 3], ['chorister', 3], ['wardwright', 1], ['siegewalker', 1], ['displacement', 1], ['glyph', 1], ['cleric', 1]] },
    black: { name: 'The Ashen Court', colours: ['B', 'R'], list: [['land_b', 8], ['land_r', 2], ['thrall', 2], ['harvester', 2], ['noble', 2], ['envoy', 2], ['retainer', 2], ['squire', 2], ['slateprowler', 2], ['vashkar', 1], ['raise', 2], ['warrant', 1], ['colossus', 1], ['firebolt', 1]] },
    green: { name: 'The Elder Herd', colours: ['G', 'R'], list: [['land_g', 8], ['land_r', 2], ['sapling', 3], ['saboteur', 3], ['owl', 3], ['wayfinder', 3], ['bull', 3], ['shifting', 2], ['youngsummoner', 1], ['giant', 1], ['raider', 1]] }
  };

  // Draft assignments, from the faction table in SETTING.md and the art briefs. A card that isn't listed has no faction.
  var FACTIONS = [
    { id: 'sunmane', name: 'The Sunmane Oath', colour: 'W', cards: ['spearman', 'cub', 'knight', 'sentinel', 'lancer', 'warden', 'shield', 'banner', 'shieldbearer', 'huntress', 'matriarch', 'lioness', 'outrider', 'sergeant', 'muster', 'roadshield', 'glaive', 'roadsquire', 'standasone', 'oathbell'] },
    { id: 'stillflame', name: 'The Still Flame', colour: 'W', cards: ['carrier', 'cleric', 'stillflame', 'vigilkeeper', 'acolyte', 'consecrate', 'pilgrim', 'vow', 'chaplain', 'lineofdawn', 'sunthread', 'sanctuary', 'penitent', 'vowkeeper', 'humbling', 'ashsweeper', 'reliquary'] },
    { id: 'conclave', name: 'The Lantern Conclave', colour: 'U', cards: ['decoy', 'conjurer', 'scholar', 'arcanist', 'displacement', 'glyph', 'sifting', 'phantasm', 'adept', 'examiner', 'fieldscholar', 'wardwright', 'brightlance', 'glyphwright', 'apprentice', 'frost', 'rainreader', 'winterdoor', 'rimebolt', 'rimecaller', 'borrowedwill', 'heldmoments', 'leaden', 'unwind', 'glimmer', 'whitemorning', 'harmonic', 'frostbreak', 'courier', 'unmake', 'observatory'] },
    { id: 'artificers', name: 'The Artificers', colour: 'U', cards: ['lampwright', 'chorister', 'mending', 'siegewalker', 'wovenward', 'quench', 'journeyman', 'rapier', 'corewright', 'marksman', 'fieldplate', 'prism', 'tideglass'] },
    { id: 'ashen', name: 'The Ashen Court', colour: 'B', cards: ['noble', 'warrant', 'squire', 'calleddebt', 'envoy', 'retainer', 'veiladept', 'tithekeeper', 'assassin', 'hostess', 'debtblade', 'ledger', 'siphon', 'tithe', 'bought', 'hour', 'shutterassassin', 'temptress', 'gallows', 'informant', 'bailiff', 'mourningveil'] },
    { id: 'gravebound', name: 'The Gravebound', colour: 'B', cards: ['thrall', 'harvester', 'raise', 'rats', 'barrowpriest', 'colossus', 'gravecaller', 'gravesoil', 'ashsower', 'mourner', 'barrowmark', 'pallofash', 'mortuary', 'tender', 'ossuary', 'scale'] },
    { id: 'warhorde', name: 'The Warhorde', colour: 'R', cards: ['goblin', 'raider', 'warchief', 'drake', 'giant', 'dragon', 'firebolt', 'hex', 'firepot', 'chieftain', 'rabblerouser', 'packhunter', 'stormstrike', 'torchrunner', 'skyfalls', 'firecaller', 'cinderhook', 'warbanddrum'] },
    { id: 'cinder', name: 'The Cinder Clans', colour: 'R', cards: ['clanraiders', 'berserker', 'captain', 'cinderfall', 'flameblade', 'drummer', 'skirmisher', 'martyr', 'scorch', 'salamander', 'veteran', 'falchion', 'cinderwake', 'kindle', 'firebrand', 'hurledbrand', 'scatter', 'wildfire', 'cinderrain', 'clanoutrider', 'shatter', 'anoint', 'emberward', 'salmantle'] },
    { id: 'thornwardens', name: 'The Thornwardens', colour: 'G', cards: ['sapling', 'saboteur', 'wayfinder', 'shifting', 'grovetender', 'goblinscout', 'ironbark', 'thornbrake', 'seedfall', 'stoneopens', 'overgrowth', 'pathguard', 'canopy', 'trapper', 'earthspeaker', 'seedheart'] },
    { id: 'herd', name: 'The Elder Herd', colour: 'G', cards: ['owl', 'bull', 'boar', 'mossback', 'herdmother', 'ridgewolves', 'reedbank', 'mosshorn', 'stag', 'tortoise'] }
  ];
  FACTIONS.forEach(function (f) { f.cards.forEach(function (id) { CARDS[id].faction = f.id; }); });

  // Every deck is 30 cards. A player sees about half of it in a game, so copies matter without every game playing the same.
  var DECK_MIN = 30, DECK_MAX = 30, MAX_COPIES = 3;
  function maxCopies(id) { return CARDS[id].type === 'land' ? Infinity : MAX_COPIES; }
  function deckSize(list) { return list.reduce(function (n, e) { return n + e[1]; }, 0); }
  function deckProblems(list) {
    var size = deckSize(list), out = [];
    if (size < DECK_MIN) out.push('Needs ' + (DECK_MIN - size) + ' more card' + (DECK_MIN - size === 1 ? '' : 's'));
    if (size > DECK_MAX) out.push('Has ' + (size - DECK_MAX) + ' too many');
    list.forEach(function (e) { if (e[1] > maxCopies(e[0])) out.push('Too many copies of ' + CARDS[e[0]].name); });
    return out;
  }

  // Most-used colour first, with neutral only leading a deck that has nothing else.
  function deckColours(list) {
    var n = {};
    list.forEach(function (e) { var c = CARDS[e[0]].colour; n[c] = (n[c] || 0) + e[1]; });
    return Object.keys(n).sort(function (a, b) { return (a === 'N') - (b === 'N') || n[b] - n[a]; });
  }

  function rand(s) {
    s.seed = (s.seed + 0x6D2B79F5) | 0;
    var t = Math.imul(s.seed ^ (s.seed >>> 15), 1 | s.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function shuffle(s, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand(s) * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
  }

  function backRow(p) { return p === 0 ? ROWS - 1 : 0; }
  function card(i) { return CARDS[i.c]; }
  function unitAt(s, r, c) { for (var i = 0; i < s.units.length; i++) if (s.units[i].r === r && s.units[i].c === c) return s.units[i]; return null; }
  function unitById(s, uid) { for (var i = 0; i < s.units.length; i++) if (s.units[i].uid === uid) return s.units[i]; return null; }
  // Equipment such as the Redglass falchion can grant a keyword to the unit carrying it.
  // A Lit unit is Fireproof, and Leaden step takes away Swift and Flying.
  function hasKw(u, k) {
    if ((k === 'Swift' || k === 'Flying') && gear(u, 'leaden')) return false;
    if (k === 'Fireproof' && u.lit) return true;
    return CARDS[u.cardId].keywords.indexOf(k) >= 0 || (u.enchants || []).some(function (e) { return (CARDS[e.c].grants || []).indexOf(k) >= 0; });
  }
  // The first enchantment or equipment on a unit with the given rule, or null.
  function gear(u, k) { return (u.enchants || []).filter(function (e) { return CARDS[e.c][k]; })[0] || null; }
  function speed(u) { return (hasKw(u, 'Swift') || hasKw(u, 'Flying') ? 2 : 1) + (u.stride || 0); }
  // Longshot fires only from a standstill. Once it has moved on its own turn it fights in melee. A Prism bracer adds a tile to either.
  function range(u) {
    var far = (u.enchants || []).reduce(function (n, e) { return n + (CARDS[e.c].reach || 0); }, 0);
    if (hasKw(u, 'Longshot')) return (u.walked ? 1 : 3) + far;
    return (hasKw(u, 'Ranged') || u.tempRange ? 2 : 1) + far;
  }
  function dist(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }

  function nextToAlly(s, u) { return s.units.some(function (o) { return o !== u && o.owner === u.owner && dist(o, u) === 1; }); }
  function onBoard(r, c) { return r >= 0 && c >= 0 && r < ROWS && c < COLS; }
  var STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // Tile effects sit in s.tiles under 'r,c' as { kind, owner, until }, and go at the start of the first turn after until.
  // One effect per tile, and a new one replaces the old.
  function tileAt(s, r, c) { return (s.tiles && s.tiles[r + ',' + c]) || null; }
  function tileKind(s, u) { var t = tileAt(s, u.r, u.c); return t ? t.kind : null; }
  // turns counts the owner's turns, starting with the current one if it's theirs. A charge lasts until its owner's next turn.
  function setTile(s, r, c, kind, owner, turns) {
    if (!onBoard(r, c)) return;
    if (!s.tiles) s.tiles = {};
    var until = kind === 'charge' ? s.turn + 1 : s.turn + 2 * turns - (s.active === owner ? 2 : 1);
    s.tiles[r + ',' + c] = { kind: kind, owner: owner, until: until };
  }
  // Fire, thorns and charges hurt either side. Fireproof units ignore fire, and alderkin ignore thorns.
  function harms(u, kind) {
    if (kind === 'burn') return hasKw(u, 'Fireproof') ? 0 : 1;
    if (kind === 'thorns') return CARDS[u.cardId].sub === 'Alderkin' ? 0 : 1;
    return kind === 'charge' ? 2 : 0;
  }
  var TILE_SAY = { burn: 'The fire burns ', thorns: 'The thorns cut ', charge: 'The charge strikes ' };
  // Moving onto a tile triggers it, and so does starting the owner's turn there. A charge goes off only on entering, then is spent.
  function tileHits(s, u, entering) {
    var t = tileAt(s, u.r, u.c);
    if (!t) return;
    if (t.kind === 'holy' && !entering && u.owner === t.owner && u.hp < u.maxHp) heal(s, u, 1);
    if (t.kind === 'snare' && entering && u.owner !== t.owner) {
      u.frozen = s.turn + 2;
      delete s.tiles[u.r + ',' + u.c];
      say(s, CARDS[u.cardId].name + " is caught in a snare: it can't move on its next turn.");
    }
    if (t.kind === 'charge' && !entering) return;
    var amt = harms(u, t.kind);
    if (!amt) return;
    if (t.kind === 'charge') delete s.tiles[u.r + ',' + u.c];
    say(s, TILE_SAY[t.kind] + CARDS[u.cardId].name + ' for ' + damage(s, u, amt) + '.');
    if (u.hp <= 0) kill(s, u);
  }

  // back is true for a strike-back, which never gets Frenzy.
  function attackOf(s, u, back) {
    var a = CARDS[u.cardId].atk + u.tempAtk + (u.boost || 0) + (u.growth || 0) + (u.carrion || 0) + (u.loyal || 0);
    var spot = tileKind(s, u);
    if (spot === 'blight') a -= 1;
    // The Ashen Court bailiff's restraint lasts until the end of the unit's next turn.
    if (u.sapped >= s.turn) a -= 2;
    if (spot === 'burn') a += CARDS[u.cardId].emberAtk || 0;
    u.enchants.forEach(function (e) { a += CARDS[e.c].atkBonus + (e.growth || 0); });
    if (hasKw(u, 'Stand together') && nextToAlly(s, u)) a += 1;
    // Frenzy is a charge: +2 on the unit's first attack, at a unit or a summoner, then it's spent for good.
    if (hasKw(u, 'Frenzy') && !u.frenzySpent && !back) a += 2;
    if (hasKw(u, 'Steadfast') && !(u.owner === s.active && u.walked)) a += 1;
    // Warband doesn't stack with itself.
    if (s.units.some(function (o) { return o !== u && o.owner === u.owner && dist(o, u) === 1 && hasKw(o, 'Warband'); })) a += 1;
    return Math.max(0, a);
  }
  // attackOf plus anything that depends on who is being hit. Hunted adds to attacks only, never to strike-backs, and doesn't stack with itself.
  // Flanking, like Hunted, adds to attacks only.
  function attackAgainst(s, u, t, back) {
    var hunted = !back && t.enchants.some(function (e) { return CARDS[e.c].hunted; }) ? 1 : 0;
    var kindling = tileKind(s, t) === 'burn' ? CARDS[u.cardId].burnHunt || 0 : 0;
    return attackOf(s, u, back) + (hasKw(u, 'Hunt') && t.hp < t.maxHp ? 2 : 0) + hunted + (!back && flanked(s, u, t) ? 1 : 0) + kindling;
  }
  // The far side is one tile on from the target, away from the attacker. A diagonal shot counts along the row, as with Overrun.
  function beyond(a, t) {
    var dr = t.r === a.r ? 0 : t.r > a.r ? 1 : -1, dc = dr ? 0 : t.c > a.c ? 1 : -1;
    return { r: t.r + dr, c: t.c + dc };
  }
  function flanked(s, u, t) {
    if (!hasKw(u, 'Flanking')) return false;
    var f = beyond(u, t), o = unitAt(s, f.r, f.c);
    return !!o && o.owner === u.owner;
  }

  // Guard takes 1 off attack and strike-back damage, and Winter shelter takes off 2 more, or the Sunthread mantle 1. Neither stacks
  // with itself, and only the larger cover counts. Stand as one takes 2 off for the rest of the turn.
  // pierce is true for the attacks of a unit with Enchanter's quench, which ignore Guard and cover, and 'guard' for the Cinderhook axe, which ignores only Guard.
  function guarded(s, u, amt, pierce) {
    if (pierce === true) return amt;
    var safe = pierce !== 'guard' && s.units.some(function (o) { return o !== u && o.owner === u.owner && dist(o, u) === 1 && hasKw(o, 'Guard'); });
    var cover = u.enchants.reduce(function (n, e) { return Math.max(n, CARDS[e.c].shelter || 0); }, 0);
    var spot = tileAt(s, u.r, u.c), holy = spot && spot.kind === 'holy' && spot.owner === u.owner ? 1 : 0;
    return Math.max(0, amt - cover - (safe ? 1 : 0) - holy - (u.braced === s.turn ? 2 : 0));
  }

  // What an attack would actually take off a target, after Guard, Winter shelter and any instant that prevents damage.
  // back is true for a strike-back.
  function hitOn(s, a, t, prevent, back) { return guarded(s, t, Math.max(0, attackAgainst(s, a, t, back) - (prevent || 0)), !back && pierces(a)); }
  function pierces(u) {
    var p = false;
    u.enchants.forEach(function (e) { var k = CARDS[e.c].pierce; if (k && p !== true) p = k; });
    return p;
  }

  // Soft coloured mana: each land short of what the card wants adds 1 to its cost. inst is the card in hand, which a Court informant can tax.
  function costOf(s, p, c, inst) {
    var have = s.players[p].lands.filter(function (l) { return l.colour === c.colour; }).length;
    var cheaper = c.equipment && s.units.some(function (o) { return o.owner === p && CARDS[o.cardId].equipDiscount; }) ? 1 : 0;
    return Math.max(0, c.cost + Math.max(0, c.wants - have) - cheaper + (inst && inst.tax || 0));
  }

  function newGame(opts) {
    var s = {
      seed: (opts.seed === undefined ? 1 : opts.seed) | 0, turn: 0, active: opts.first || 0, phase: 'play',
      winner: null, pending: null, nextId: 1, units: [], tiles: {}, log: [], logMarked: true, fx: [],
      players: [mkPlayer(opts.decks[0]), mkPlayer(opts.decks[1])]
    };
    s.players.forEach(function (p, idx) {
      deckOf(opts.decks[idx]).list.forEach(function (e) {
        for (var i = 0; i < e[1]; i++) p.deck.push({ id: s.nextId++, c: e[0] });
      });
      shuffle(s, p.deck);
      for (var i = 0; i < OPENING_HAND; i++) p.hand.push(p.deck.pop());
      p.index = idx;
    });
    s.firstPlayer = s.active;
    s.phase = 'opening';
    return s;
  }
  // A deck is a key into DECKS or a built deck: { name, list }.
  function deckOf(d) { return typeof d === 'string' ? DECKS[d] : d; }
  function mkPlayer(d) { return { deckKey: typeof d === 'string' ? d : null, name: deckOf(d).name, colour: (deckOf(d).colours || deckColours(deckOf(d).list))[0] || 'N', deck: [], hand: [], discard: [], lands: [], mana: 0, life: START_LIFE, landDropped: false, extraLands: 0, extraNext: 0, redraws: 0, toBottom: 0, bonusMana: 0, kept: false, relics: [] }; }

  // A player's name goes into the log marked, so a prompt can swap it reliably even if a deck is named after a card or both decks match.
  function mark(s, p) { return '\u0001' + s.players.indexOf(p) + '\u0002'; }
  function say(s, text) {
    var entry = { turn: s.turn, text: text.replace(/\u0001(\d)\u0002/g, function (x, i) { return s.players[+i].name; }) };
    if (entry.text !== text) entry.marked = text;
    s.log.push(entry);
  }

  // Each player keeps or redraws in turn, first player first, then turn 1 begins.
  function finishOpening(s) {
    var p = s.players[s.active];
    p.kept = true;
    say(s, mark(s, p) + ' keeps ' + p.hand.length + ' cards.');
    if (!s.players[1 - s.active].kept) { s.active = 1 - s.active; return; }
    s.active = 1 - s.firstPlayer;
    startTurn(s);
  }

  function startTurn(s) {
    s.turn += 1;
    s.active = 1 - s.active;
    s.pending = null;
    s.phase = 'play';
    if (s.turn > TURN_LIMIT) {
      var a = s.players[0].life, b = s.players[1].life;
      s.winner = a === b ? 'draw' : (a > b ? 0 : 1);
      say(s, 'Turn limit reached.');
      return;
    }
    var p = s.players[s.active];
    p.mana = p.lands.length + (p.bonusMana || 0);
    p.bonusMana = 0;
    p.landDropped = false;
    p.extraLands = p.extraNext || 0;
    p.extraNext = 0;
    // A Glimmer double's decoy fades as its caster's next turn begins. It's gone rather than destroyed.
    s.units.filter(function (u) { return u.fleeting && u.owner === s.active; }).forEach(function (u) {
      s.units.splice(s.units.indexOf(u), 1);
      say(s, 'The glimmer double fades.');
    });
    // Sanctuary threshold lasts 3 of its caster's turns.
    s.units.forEach(function (u) {
      u.enchants.filter(function (e) { return e.until < s.turn; }).forEach(function (e) {
        u.enchants.splice(u.enchants.indexOf(e), 1);
        s.players[e.owner].discard.push({ id: e.id, c: e.c });
        say(s, CARDS[e.c].name + ' on ' + CARDS[u.cardId].name + ' ends.');
      });
    });
    s.units.forEach(function (u) {
      // Walking only counts on the turn it happens, so a Longshot unit that moved last turn can strike back at full range.
      u.walked = false;
      if (u.owner !== s.active) return;
      u.moved = false; u.acted = false;
      if (hasKw(u, 'Grows') && (u.growth || 0) < 3) {
        u.growth = (u.growth || 0) + 1; u.maxHp += 2; u.hp += 2;
        s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+2', good: true });
      }
      u.enchants.forEach(function (e) {
        if (CARDS[e.c].regrow && u.hp < u.maxHp) heal(s, u, CARDS[e.c].regrow);
        if (CARDS[e.c].grows && (e.growth || 0) < 3) {
          e.growth = (e.growth || 0) + 1; u.maxHp += 2; u.hp += 2;
          s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+2', good: true });
        }
      });
    });
    for (var key in s.tiles || {}) if (s.tiles[key].until < s.turn) delete s.tiles[key];
    s.units.filter(function (u) { return u.owner === s.active; }).forEach(function (u) { if (s.units.indexOf(u) >= 0) tileHits(s, u, false); });
    if (s.winner !== null) return;
    // The Pilgrim reliquary mends whichever of your units is missing the most health.
    p.relics.forEach(function (r) {
      if (CARDS[r.c].relic !== 'reliquary') return;
      var worst = null;
      s.units.forEach(function (u) { if (u.owner === s.active && u.hp < u.maxHp && (!worst || u.maxHp - u.hp > worst.maxHp - worst.hp)) worst = u; });
      if (worst && heal(s, worst, 1)) say(s, CARDS[r.c].name + ' mends ' + CARDS[worst.cardId].name + '.');
    });
    if (s.turn > 1) draw(s, s.active);
  }

  function draw(s, pi) {
    var p = s.players[pi];
    if (!p.deck.length && p.discard.length) {
      p.deck = p.discard; p.discard = [];
      shuffle(s, p.deck);
      say(s, mark(s, p) + ' reshuffled their discards.');
    }
    if (p.deck.length) p.hand.push(p.deck.pop());
  }

  function bound(u) { return u.enchants.some(function (e) { return CARDS[e.c].bind; }); }
  // Bound by a glyph, held this turn by a Conclave examiner, frozen this turn by a Rime drake or a snare, standing on frozen ground,
  // held between moments, or sent back by Unwind the step.
  function stuck(s, u) { return bound(u) || u.held === s.turn || u.frozen === s.turn || tileKind(s, u) === 'frost' || stilled(s, u) || u.unwound === s.turn; }
  // Held between moments: the unit can't act and can't be attacked until the end of its caster's next turn.
  function stilled(s, u) { return u.stasis >= s.turn; }
  // Sanctuary threshold: no attacks from more than 1 tile away, and no enemy spells.
  function sheltered(u) { return !!gear(u, 'sanctuary'); }
  function spellTarget(s, pi, u) { return open(pi, u) && (u.owner === pi || !sheltered(u)); }
  // Holding ground: a tile next to an enemy that has it ends the move, so nothing passes through it, fliers included.
  // Thorns and an enemy snare also end a walker's move. A flier passes over them.
  function reachable(s, u) {
    if (stuck(s, u)) return [];
    var seen = {}, out = [], frontier = [{ r: u.r, c: u.c }], fly = hasKw(u, 'Flying');
    var holders = s.units.filter(function (o) { return o.owner !== u.owner && hasKw(o, 'Holding ground'); });
    var held = function (r, c) {
      var t = tileAt(s, r, c);
      if (!fly && t && ((t.kind === 'thorns' && harms(u, 'thorns')) || (t.kind === 'snare' && t.owner !== u.owner))) return true;
      return holders.some(function (h) { return Math.abs(h.r - r) + Math.abs(h.c - c) === 1; });
    };
    seen[u.r + ',' + u.c] = true;
    for (var step = 0; step < speed(u); step++) {
      var next = [];
      frontier.forEach(function (f) {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var r = f.r + d[0], c = f.c + d[1], key = r + ',' + c;
          if (r < 0 || c < 0 || r >= ROWS || c >= COLS || seen[key]) return;
          var occ = unitAt(s, r, c);
          if (occ && !fly) return;
          seen[key] = true;
          if (!held(r, c)) next.push({ r: r, c: c });
          if (!occ) out.push({ r: r, c: c });
        });
      });
      frontier = next;
    }
    return out;
  }

  // Veiled: an enemy unit that hasn't attacked yet can't be attacked or targeted. Splash damage still reaches it.
  function open(pi, u) { return u.owner === pi || !u.veiled; }
  function emptyTile(s, r, c) { return r >= 0 && c >= 0 && r < ROWS && c < COLS && !unitAt(s, r, c); }
  function shoveRow(u) { return u.r + (u.owner === 0 ? 1 : -1); }
  // Whether healing t would grow a Devotion unit: t itself, or an ally next to it.
  function devoNear(s, t) { return s.units.some(function (o) { return o.owner === t.owner && (o === t || dist(o, t) === 1) && hasKw(o, 'Devotion') && (o.devotion || 0) < DEVOTION_MAX; }); }
  function heal(s, u, amt) {
    var healed = Math.min(amt, u.maxHp - u.hp);
    u.hp += healed;
    if (amt <= 0) return 0;
    if (healed > 0) s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+' + healed, good: true });
    // Devotion grows when it, or an ally next to it, is healed, even at full health (creator, 2026-11-10), up to +3.
    s.units.forEach(function (o) {
      if (o.owner !== u.owner || (o !== u && dist(o, u) !== 1) || !hasKw(o, 'Devotion') || (o.devotion || 0) >= DEVOTION_MAX) return;
      o.devotion = (o.devotion || 0) + 1; o.boost = (o.boost || 0) + 1; o.maxHp += 1; o.hp += 1;
      s.fx.push({ uid: o.uid, r: o.r, c: o.c, text: '+1', good: true });
      say(s, CARDS[o.cardId].name + "'s devotion grows.");
    });
    return healed;
  }

  // Where an instant can go, as partial moves. kind is the window: 'attack', 'move' or 'end' on the enemy turn, or 'own' on your own turn.
  // Instants that answer an event wait for it. The rest can be cast in any window, or on your own turn like a spell.
  function instantTargets(s, pi, c, kind, attack) {
    var p = s.players[pi], foe = 1 - pi, out = [];
    // A move gives a window only to Unwind the step, so other instants don't interrupt every step.
    if ((kind === 'move') !== !!c.unwind) return out;
    if (c.unwind) {
      if (unitById(s, attack.uid)) out.push({ target: attack.uid });
    } else if (c.brace || c.canopy) {
      if (kind !== 'attack' || !attack || attack.summoner !== undefined) return out;
      var hit = unitById(s, attack.targetUid), from = unitById(s, attack.attacker);
      if (hit && (c.brace || (from && dist(from, hit) >= 2))) out.push({ target: hit.uid });
    } else if (c.prevent) {
      if (kind !== 'attack' || !attack) return out;
      [attack.targetUid, attack.secondaryUid].forEach(function (uid) { if (uid && unitById(s, uid)) out.push({ target: uid }); });
    } else if (c.dodge) {
      if (kind !== 'attack' || !attack) return out;
      [attack.targetUid, attack.secondaryUid].forEach(function (uid) {
        var dodger = uid ? unitById(s, uid) : null;
        if (!dodger) return;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          if (emptyTile(s, dodger.r + d[0], dodger.c + d[1])) out.push({ target: uid, r: dodger.r + d[0], c: dodger.c + d[1] });
        });
      });
    } else if (c.aim) {
      // Scatter the line: any tile of a row that holds an enemy.
      for (var row = 0; row < ROWS; row++) {
        if (s.units.some(function (u) { return u.owner === foe && u.r === row; })) for (var col = 0; col < COLS; col++) out.push({ r: row, c: col });
      }
    } else if (c.damage) {
      s.units.forEach(function (u) { if (u.owner === foe && spellTarget(s, pi, u)) out.push({ target: u.uid }); });
    } else if (c.debt) {
      if (p.life <= c.debt) return out;
      s.units.forEach(function (u) { if (u.owner === foe && spellTarget(s, pi, u) && u.hp < u.maxHp) out.push({ target: u.uid }); });
    } else if (c.shove) {
      s.units.forEach(function (u) { if (u.owner === foe && spellTarget(s, pi, u) && emptyTile(s, shoveRow(u), u.c)) out.push({ target: u.uid }); });
    }
    return out;
  }

  // The responder's instants, one move per card and target.
  function responses(s, kind, attack) {
    var pi = 1 - s.active, p = s.players[pi], out = [], seen = {};
    p.hand.forEach(function (i) {
      var c = card(i);
      if (c.type !== 'instant' || costOf(s, pi, c, i) > p.mana) return;
      instantTargets(s, pi, c, kind, attack).forEach(function (t) {
        var key = i.c + ':' + t.target + ':' + t.r + ',' + t.c;
        if (seen[key]) return;
        seen[key] = 1;
        out.push(withField(withField(withField({ type: 'respond', card: i.id }, 'target', t.target), 'r', t.r), 'c', t.c));
      });
    });
    return out.map(function (m) { var o = {}; for (var k in m) if (m[k] !== undefined) o[k] = m[k]; return o; });
  }

  // Instants on your own turn are cast like spells.
  function ownInstants(s, pi) {
    var p = s.players[pi], out = [];
    p.hand.forEach(function (i) {
      var c = card(i);
      if (c.type !== 'instant' || costOf(s, pi, c, i) > p.mana) return;
      instantTargets(s, pi, c, 'own').forEach(function (t) {
        var m = { type: 'cast', card: i.id };
        if (t.target !== undefined) m.target = t.target;
        if (t.r !== undefined) { m.r = t.r; m.c = t.c; }
        out.push(m);
      });
    });
    return out;
  }

  // dedupe lists one copy of each identical card, which keeps the list short for players that aren't clicking a specific copy.
  function legalMoves(s, opts) {
    var dedupe = opts && opts.dedupe, out = [];
    if (s.winner !== null) return out;
    if (s.pending) {
      out = responses(s, s.pending.kind, s.pending.attack || s.pending.step);
      out.push({ type: 'pass' });
      return out;
    }
    var pi = s.active, p = s.players[pi];
    if (p.toBottom) return p.hand.map(function (i) { return { type: 'bottomCard', card: i.id }; });
    if (s.phase === 'opening') {
      out.push({ type: 'keepHand' });
      if (p.redraws < MAX_REDRAWS) out.push({ type: 'redraw' });
      return out;
    }
    if (s.phase === 'play') {
      var hand = p.hand;
      if (dedupe) {
        var names = {};
        hand = hand.filter(function (i) { if (names[i.c]) return false; names[i.c] = 1; return true; });
      }
      hand.forEach(function (i) {
        var c = card(i);
        if ((!p.landDropped || p.extraLands > 0) && c.type === 'land') out.push({ type: 'playLand', card: i.id });
        // Instants come from ownInstants, which aims them only where they can matter.
        if (c.type !== 'land' && c.type !== 'instant' && costOf(s, pi, c, i) <= p.mana) {
          if (c.type === 'unit') {
            var foes = c.zap ? s.units.filter(function (e) { return e.owner !== pi && !e.veiled; }) : [];
            entryTiles(s, pi, c).forEach(function (t) {
              // The Clan outrider's throw reaches only 2 tiles from where it enters.
              var near = foes.filter(function (e) { return !c.zapRange || dist(e, t) <= c.zapRange; });
              picks(s, pi, (c.summons || []).length, t).forEach(function (at) {
                var base = { type: 'summon', card: i.id, r: t.r, c: t.c };
                if (at) base.at = at;
                if (!near.length) out.push(base);
                near.forEach(function (e) { out.push(withField(base, 'target', e.uid)); });
              });
            });
          } else if (c.type === 'enchant') {
            s.units.forEach(function (u) { if ((!c.enemyOnly || u.owner !== pi) && (!c.allyOnly || u.owner === pi) && spellTarget(s, pi, u)) out.push({ type: 'enchant', card: i.id, target: u.uid }); });
          } else if (c.type === 'relic') {
            out.push({ type: 'cast', card: i.id });
          } else if (c.aim) {
            for (var ar = 0; ar < ROWS; ar++) for (var ac = 0; ac < COLS; ac++) out.push({ type: 'cast', card: i.id, r: ar, c: ac });
          } else if (c.bolt) {
            s.units.forEach(function (e) { if (e.owner !== pi && spellTarget(s, pi, e)) out.push({ type: 'cast', card: i.id, target: e.uid }); });
            out.push({ type: 'cast', card: i.id, summoner: 1 - pi });
          } else if (c.unchain || c.loam) {
            s.units.forEach(function (u) { if (spellTarget(s, pi, u) && lastGear(u, c.loam)) out.push({ type: 'cast', card: i.id, target: u.uid }); });
          } else if (c.borrow || c.stasis || c.buy) {
            s.units.forEach(function (e) {
              if (e.owner === pi || !spellTarget(s, pi, e)) return;
              if (c.buy && (CARDS[e.cardId].cost > c.buy || CARDS[e.cardId].loyal)) return;
              out.push({ type: 'cast', card: i.id, target: e.uid });
            });
          } else if (c.place) {
            for (var gr = 1; gr < ROWS - 1; gr++) for (var gc = 0; gc < COLS; gc++) if (emptyTile(s, gr, gc)) out.push({ type: 'cast', card: i.id, r: gr, c: gc });
          } else if (c.light) {
            s.units.forEach(function (a) { if (a.owner === pi && !a.lit) out.push({ type: 'cast', card: i.id, target: a.uid }); });
          } else if (c.selfLife) {
            if (p.life > c.selfLife) out.push({ type: 'cast', card: i.id });
          } else if (c.sweep || c.humble || c.hour) {
            out.push({ type: 'cast', card: i.id });
          } else if (c.summons) {
            if (landing(s, pi).length) picks(s, pi, c.summons.length, null).forEach(function (at) { out.push({ type: 'cast', card: i.id, at: at }); });
          } else if (c.chant) {
            s.units.forEach(function (a) { if (a.owner === pi) out.push({ type: 'cast', card: i.id, target: a.uid }); });
          } else if (c.draw || c.extraLand || c.sift || c.coin || c.bonusNext) {
            out.push({ type: 'cast', card: i.id });
          } else if (c.raise) {
            if (backTile(s, pi) !== null) p.discard.forEach(function (d) {
              var dc = CARDS[d.c];
              if (dc.type === 'unit' && dc.cost <= c.raise) out.push({ type: 'cast', card: i.id, raise: d.id });
            });
          } else if (c.cleanse) {
            s.units.forEach(function (a) { if (a.enchants.length && open(pi, a)) out.push({ type: 'cast', card: i.id, target: a.uid }); });
          } else if (c.mend) {
            // Spring melt also gives attack, so it can go on an unhurt unit, and so can any heal that grows Devotion.
            s.units.forEach(function (a) { if (a.owner === pi && (a.hp < a.maxHp || c.temper || devoNear(s, a))) out.push({ type: 'cast', card: i.id, target: a.uid }); });
          } else if (c.blast) {
            s.units.forEach(function (e) { if (e.owner !== pi && spellTarget(s, pi, e)) out.push({ type: 'cast', card: i.id, target: e.uid }); });
          } else if (c.fortify || c.stride) {
            if (s.units.some(function (a) { return a.owner === pi; })) out.push({ type: 'cast', card: i.id });
          } else if (c.passage) {
            s.units.forEach(function (a) {
              if (a.owner !== pi || stuck(s, a)) return;
              for (var pr = 0; pr < ROWS; pr++) for (var pc = 0; pc < COLS; pc++) if (emptyTile(s, pr, pc)) out.push({ type: 'cast', card: i.id, target: a.uid, r: pr, c: pc });
            });
          }
          // Unmake the pattern, Shatter the chain and Return to loam can each destroy a relic instead.
          if (c.unrelic) s.players.forEach(function (o) { o.relics.forEach(function (r) { out.push({ type: 'cast', card: i.id, relic: r.id }); }); });
        }
      });
      out = out.concat(relicMoves(s, pi), ownInstants(s, pi));
      out.push({ type: 'toCommand' });
      return out;
    }
    out = out.concat(relicMoves(s, pi), ownInstants(s, pi));
    s.units.forEach(function (u) {
      if (u.owner !== pi || u.summonedTurn === s.turn || u.acted || stilled(s, u)) return;
      // Leaden step: a unit that has moved can't attack this turn.
      var held = u.held === s.turn || (u.moved && !!gear(u, 'leaden'));
      if (!u.moved) reachable(s, u).forEach(function (t) { out.push({ type: 'move', unit: u.uid, r: t.r, c: t.c }); });
      // An adjacent decoy has to be dealt with before anything else can be attacked.
      var pinned = s.units.some(function (e) { return e.owner !== pi && dist(u, e) === 1 && hasKw(e, 'Decoy'); });
      var mayHit = function (e) { return (!pinned || (dist(u, e) === 1 && hasKw(e, 'Decoy'))) && !stilled(s, e) && (dist(u, e) === 1 || !sheltered(e)); };
      var strength = u.noAttack || held ? 0 : attackOf(s, u);
      if (strength > 0) {
        s.units.forEach(function (e) {
          if (e.owner !== pi && !e.veiled && dist(u, e) <= range(u) && mayHit(e)) out.push({ type: 'attack', unit: u.uid, target: e.uid });
        });
        // A unit under Borrowed will can't attack a summoner.
        if (u.r === backRow(1 - pi) && !pinned && u.borrowed === undefined) out.push({ type: 'attackSummoner', unit: u.uid });
      }
      var ab = CARDS[u.cardId].ability;
      if (!ab) return;
      if (ab.key === 'heal') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1 && (a.hp < a.maxHp || devoNear(s, a))) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'rally') {
        if (s.units.some(function (a) { return a.owner === pi && a !== u && dist(u, a) === 1; })) out.push({ type: 'ability', unit: u.uid });
      } else if (ab.key === 'lance') {
        if (!u.noAttack && !held) s.units.forEach(function (e) {
          if (e.owner !== pi && !e.veiled && dist(u, e) === 1 && mayHit(e)) {
            var b = unitAt(s, e.r + (e.r - u.r), e.c + (e.c - u.c));
            if (b && b.owner !== pi && !b.veiled) out.push({ type: 'ability', unit: u.uid, target: e.uid });
          }
        });
      } else if (ab.key === 'lens') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1 && !a.acted && !a.tempRange && range(a) === 1) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'healall') {
        if (s.units.some(function (a) { return a.owner === pi && a !== u && dist(u, a) === 1 && (a.hp < a.maxHp || devoNear(s, a)); })) out.push({ type: 'ability', unit: u.uid });
      } else if (ab.key === 'orders') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1 && a.moved && !a.acted && reachable(s, a).length) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'study' || ab.key === 'sift' || ab.key === 'forage') {
        if (!u.moved) out.push({ type: 'ability', unit: u.uid });
      } else if (ab.key === 'push') {
        s.units.forEach(function (e) { if (e.owner !== pi && !e.veiled && dist(u, e) === 1 && emptyTile(s, e.r + (e.r - u.r), e.c + (e.c - u.c))) out.push({ type: 'ability', unit: u.uid, target: e.uid }); });
      } else if (ab.key === 'harvest' || ab.key === 'tend') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'swap') {
        if (!stuck(s, u)) s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) <= 2 && !stuck(s, a)) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'hold') {
        s.units.forEach(function (e) { if (e.owner !== pi && !e.veiled && dist(u, e) <= 2) out.push({ type: 'ability', unit: u.uid, target: e.uid }); });
      } else if (ab.key === 'zap') {
        if (!u.noAttack && !held) s.units.forEach(function (e) { if (e.owner !== pi && !e.veiled && dist(u, e) <= 2) out.push({ type: 'ability', unit: u.uid, target: e.uid }); });
      } else if (ab.key === 'exhume') {
        if (backTile(s, pi) !== null) p.discard.forEach(function (d) {
          var dc = CARDS[d.c];
          if (dc.type === 'unit' && dc.cost <= ab.amount) out.push({ type: 'ability', unit: u.uid, raise: d.id });
        });
      } else if (ab.key === 'snare') {
        for (var sr = 0; sr < ROWS; sr++) for (var sc = 0; sc < COLS; sc++) {
          if (emptyTile(s, sr, sc) && dist(u, { r: sr, c: sc }) <= 2) out.push({ type: 'ability', unit: u.uid, r: sr, c: sc });
        }
      } else if (ab.key === 'blight') {
        STEPS.forEach(function (d) { if (onBoard(u.r + d[0], u.c + d[1])) out.push({ type: 'ability', unit: u.uid, r: u.r + d[0], c: u.c + d[1] }); });
      } else if (ab.key === 'errant') {
        if (backTile(s, pi) !== null) out.push({ type: 'ability', unit: u.uid });
      } else if (ab.key === 'rain') {
        for (var wr = 0; wr < ROWS; wr++) for (var wc = 0; wc < COLS; wc++) {
          var wet = unitAt(s, wr, wc);
          if (dist(u, { r: wr, c: wc }) <= 2 && (tileAt(s, wr, wc) || (wet && wet.owner === pi && wet.hp < wet.maxHp))) out.push({ type: 'ability', unit: u.uid, r: wr, c: wc });
        }
      } else if (ab.key === 'winterdoor') {
        s.units.forEach(function (e) { if (e.owner !== pi && !e.veiled && dist(u, e) <= 2) out.push({ type: 'ability', unit: u.uid, r: e.r, c: e.c }); });
      } else if (ab.key === 'farheal') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) <= 2 && (a.hp < a.maxHp || devoNear(s, a))) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'refit') {
        // From an ally next to the squire, to another ally next to it or to the squire itself.
        s.units.forEach(function (from) {
          if (from.owner !== pi || from === u || dist(u, from) !== 1 || !lastGear(from, true)) return;
          s.units.forEach(function (to) { if (to.owner === pi && to !== from && (to === u || dist(u, to) === 1)) out.push({ type: 'ability', unit: u.uid, target: from.uid, r: to.r, c: to.c }); });
        });
      } else if (ab.key === 'ferry') {
        s.units.forEach(function (a) {
          if (a.owner !== pi || a === u || dist(u, a) !== 1 || stuck(s, a)) return;
          STEPS.forEach(function (d) { if (emptyTile(s, a.r + d[0], a.c + d[1])) out.push({ type: 'ability', unit: u.uid, target: a.uid, r: a.r + d[0], c: a.c + d[1] }); });
        });
      } else if (ab.key === 'sweep') {
        if ([[0, 0]].concat(STEPS).some(function (d) { return tileAt(s, u.r + d[0], u.c + d[1]); })) out.push({ type: 'ability', unit: u.uid });
      } else if (ab.key === 'trap') {
        STEPS.forEach(function (d) { if (emptyTile(s, u.r + d[0], u.c + d[1])) out.push({ type: 'ability', unit: u.uid, r: u.r + d[0], c: u.c + d[1] }); });
      } else if (ab.key === 'wildcast') {
        if (!u.noAttack && !held) for (var fr = 0; fr < ROWS; fr++) for (var fc = 0; fc < COLS; fc++) {
          if (dist(u, { r: fr, c: fc }) <= 3) out.push({ type: 'ability', unit: u.uid, r: fr, c: fc });
        }
      } else if (ab.key === 'charm') {
        // She holds one charm at a time.
        if (!u.noAttack && !held && !s.units.some(function (o) { return o.charmedBy === u.uid; })) s.units.forEach(function (e) {
          if (e.owner !== pi && !e.veiled && dist(u, e) <= 2 && CARDS[e.cardId].cost <= ab.amount && !CARDS[e.cardId].loyal) out.push({ type: 'ability', unit: u.uid, target: e.uid });
        });
      } else if (ab.key === 'sap') {
        s.units.forEach(function (e) { if (e.owner !== pi && !e.veiled && dist(u, e) === 1) out.push({ type: 'ability', unit: u.uid, target: e.uid }); });
      } else if (ab.key === 'reed') {
        if (!u.moved) out.push({ type: 'ability', unit: u.uid });
      }
    });
    out.push({ type: 'endTurn' });
    return out;
  }

  // The newest piece on a unit: any enchantment or equipment, or with onlyGear, equipment only.
  function lastGear(u, onlyGear) {
    for (var n = u.enchants.length - 1; n >= 0; n--) if (!onlyGear || CARDS[u.enchants[n].c].equipment) return u.enchants[n];
    return null;
  }

  // A relic is used from the plate beside the summoner. Each works once on each of its owner's turns.
  function relicMoves(s, pi) {
    var p = s.players[pi], out = [], mine = s.units.filter(function (u) { return u.owner === pi; });
    p.relics.forEach(function (r) {
      var k = CARDS[r.c].relic;
      if (r.used === s.turn) return;
      if ((k === 'bell' || k === 'drum') && p.mana >= 1 && mine.length) out.push({ type: 'relic', relic: r.id });
      if (k === 'tide' && r.store) out.push({ type: 'relic', relic: r.id });
      if (k === 'seed' && r.store) mine.forEach(function (u) { out.push({ type: 'relic', relic: r.id, target: u.uid }); });
      if (k === 'stars' && (p.deck.length || p.deckCount || 0) >= 2) out.push({ type: 'relic', relic: r.id });
    });
    return out;
  }

  function withField(m, k, v) { var o = {}; for (var f in m) o[f] = m[f]; o[k] = v; return o; }

  // Where a unit from the hand can enter: a free back-row tile, or with Ambush, an empty tile beside or behind one of your units.
  function entryTiles(s, pi, c) {
    var out = [], seen = {}, back = backRow(pi) === ROWS - 1 ? 1 : -1;
    function add(r, col) { if (emptyTile(s, r, col) && !seen[r + ',' + col]) { seen[r + ',' + col] = 1; out.push({ r: r, c: col }); } }
    for (var col = 0; col < COLS; col++) add(backRow(pi), col);
    if (c.keywords.indexOf('Ambush') >= 0) s.units.forEach(function (a) {
      if (a.owner === pi) [[0, 1], [0, -1], [back, 0]].forEach(function (d) { add(a.r + d[0], a.c + d[1]); });
    });
    return out;
  }
  // Summoned units go to back-row tiles the player picks. Once the back row is full, the rest land in the second row,
  // from a side column toward the middle.
  var OVERFLOW = [0, 4, 1, 3, 2];
  function landing(s, pi) {
    var out = [], second = backRow(pi) === ROWS - 1 ? ROWS - 2 : 1;
    for (var col = 0; col < COLS; col++) if (emptyTile(s, backRow(pi), col)) out.push([backRow(pi), col]);
    OVERFLOW.forEach(function (col) { if (emptyTile(s, second, col)) out.push([second, col]); });
    return out;
  }
  // Every choice of back-row tiles for n summons, leaving out a tile already taken. Returns [null] when nothing is summoned.
  function picks(s, pi, n, taken) {
    if (!n) return [null];
    var free = [];
    for (var col = 0; col < COLS; col++) if (emptyTile(s, backRow(pi), col) && !(taken && taken.r === backRow(pi) && taken.c === col)) free.push([backRow(pi), col]);
    var k = Math.min(n, free.length), out = [];
    (function grow(start, chosen) {
      if (chosen.length === k) { out.push(chosen); return; }
      for (var j = start; j < free.length; j++) grow(j + 1, chosen.concat([free[j]]));
    })(0, []);
    return out;
  }
  // Conjured units vanish when they die, so they never reach a discard pile.
  function conjure(s, pi, id, r, c, by) {
    var nu = newUnit(s, null, id, pi, r, c);
    nu.conjured = true;
    s.units.push(nu);
    say(s, (by ? by + ' summons ' : mark(s, s.players[pi]) + ' summons ') + CARDS[id].name + '.');
    return nu;
  }
  // Places summons on the picked tiles, then anywhere landing allows.
  function summonAll(s, pi, ids, at, by) {
    ids.forEach(function (id, n) {
      var spot = at && at[n] && emptyTile(s, at[n][0], at[n][1]) ? at[n] : landing(s, pi)[0];
      if (spot) conjure(s, pi, id, spot[0], spot[1], by);
    });
  }
  function addToHand(s, pi, id) { s.players[pi].hand.push({ id: s.nextId++, c: id, conjured: true }); }
  // For the test table: a unit placed straight onto the board, ready to act this turn. It vanishes when it dies, like a summon.
  function placeUnit(s, pi, id, r, c) {
    var nu = newUnit(s, null, id, pi, r, c);
    nu.conjured = true;
    nu.summonedTurn = s.turn - 1;
    s.units.push(nu);
    return nu;
  }

  // Raised units land on the free back-row tile nearest the centre.
  function backTile(s, pi) {
    var best = null;
    for (var col = 0; col < COLS; col++) if (!unitAt(s, backRow(pi), col) && (best === null || Math.abs(col - (COLS - 1) / 2) < Math.abs(best - (COLS - 1) / 2))) best = col;
    return best;
  }
  function newUnit(s, inst, id, pi, r, c) {
    var d = CARDS[id];
    return { uid: s.nextId++, inst: inst, cardId: id, owner: pi, r: r, c: c, hp: d.hp, maxHp: d.hp, tempAtk: 0, boost: 0, growth: 0, enchants: [], moved: false, acted: false, summonedTurn: s.turn, veiled: d.keywords.indexOf('Veiled') >= 0, lit: d.keywords.indexOf('Lit') >= 0 };
  }
  // Borrowed, charmed and bought units fight for a new side. The first two remember whose they are, for the discard pile and their return.
  function release(s, u) {
    u.owner = u.from;
    delete u.from; delete u.borrowed; delete u.charmedBy;
    say(s, CARDS[u.cardId].name + ' returns to ' + mark(s, s.players[u.owner]) + '.');
  }

  // Takes enchantments off a unit, back to their owners' discard piles. Health they gave goes with them, and damage already taken stays.
  function strip(s, u, list) {
    list.forEach(function (e) {
      u.enchants.splice(u.enchants.indexOf(e), 1);
      u.maxHp -= CARDS[e.c].hpBonus + (e.growth || 0) * 2;
      s.players[e.owner].discard.push({ id: e.id, c: e.c });
      // Without its Mourning veil, a unit is veiled only if it was born veiled and hasn't attacked.
      if (CARDS[e.c].veil) u.veiled = CARDS[u.cardId].keywords.indexOf('Veiled') >= 0 && !u.unveiled;
    });
    u.hp = Math.min(u.hp, u.maxHp);
  }

  function takeFromHand(p, id) {
    for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === id) return p.hand.splice(i, 1)[0];
    throw new Error('Card not in hand: ' + id);
  }

  function kill(s, u) {
    var d = CARDS[u.cardId], spot = tileAt(s, u.r, u.c), pl = s.players[u.owner];
    // Vow of keeping: the first death is refused, and the vow ends.
    var vow = gear(u, 'vow');
    if (vow) {
      strip(s, u, [vow]);
      u.hp = 1;
      say(s, 'The vow holds, and ' + d.name + ' is left at 1 health.');
      return;
    }
    s.units.splice(s.units.indexOf(u), 1);
    if (!u.conjured) s.players[u.from !== undefined ? u.from : u.owner].discard.push({ id: u.inst, c: u.cardId });
    u.enchants.forEach(function (e) { s.players[e.owner].discard.push({ id: e.id, c: e.c }); });
    say(s, d.name + (u.conjured ? ' is destroyed and vanishes.' : ' is destroyed.'));
    // A charmed unit goes home when the temptress who charmed it dies.
    s.units.forEach(function (o) { if (o.charmedBy === u.uid) release(s, o); });
    // Death triggers. Carrion counts every other unit destroyed on either side, however it happens. The
    // Vigil-keeper, the Barrow tender and, for a unit next to it, the Gravecaller count only their own side's.
    var callers = [];
    s.units.forEach(function (o) {
      var od = CARDS[o.cardId];
      if (o !== u && hasKw(o, 'Carrion') && (o.carrion || 0) < 3) {
        o.carrion = (o.carrion || 0) + 1;
        s.fx.push({ uid: o.uid, r: o.r, c: o.c, text: '+1', good: true });
        say(s, od.name + ' gets +1 attack.');
      }
      if (o.owner !== u.owner) return;
      if (od.keeperLife) {
        pl.life += od.keeperLife;
        s.fx.push({ summoner: u.owner, text: '+' + od.keeperLife, good: true });
        say(s, od.name + ' keeps the vigil, and ' + mark(s, pl) + ' gains ' + od.keeperLife + ' life.');
      }
      if (od.gravecall && dist(o, u) === 1) callers.push(o);
      if (od.tender && dist(o, u) === 1 && o.tended !== s.turn) {
        o.tended = s.turn;
        pl.bonusMana = (pl.bonusMana || 0) + od.tender;
        say(s, od.name + ' tends the dead, and ' + mark(s, pl) + ' will have 1 extra mana next turn.');
      }
      if (od.mournLife && s.winner === null) {
        var foe = s.players[1 - u.owner];
        foe.life -= od.mournLife;
        s.fx.push({ summoner: 1 - u.owner, text: '-' + od.mournLife });
        say(s, od.name + ' mourns, and ' + mark(s, foe) + ' loses ' + od.mournLife + ' life.');
        if (foe.life <= 0) { foe.life = 0; s.winner = u.owner; say(s, mark(s, pl) + ' wins.'); }
      }
    });
    if (d.deathDraw) {
      draw(s, u.owner);
      say(s, mark(s, pl) + ' draws a card.');
    }
    if (d.deathBurn === 'self') setTile(s, u.r, u.c, 'burn', u.owner, 2);
    if (d.deathBurn === 'around') STEPS.forEach(function (st) { setTile(s, u.r + st[0], u.c + st[1], 'burn', u.owner, 2); });
    if (d.deathBurn) say(s, 'Fire spreads where ' + d.name + ' fell.');
    // The Sepulchral scale pays out once a turn, and never takes its owner's last 2 life.
    pl.relics.forEach(function (r) {
      if (CARDS[r.c].relic !== 'scale' || r.used === s.turn || pl.life <= 2 || s.winner !== null) return;
      r.used = s.turn;
      pl.life -= 1;
      s.fx.push({ summoner: u.owner, text: '-1' });
      draw(s, u.owner);
      say(s, mark(s, pl) + ' pays 1 life to the ' + CARDS[r.c].name + ' and draws a card.');
    });
    callers.forEach(function (o) { summonAll(s, u.owner, ['thrall'], null, CARDS[o.cardId].name); });
    // Barrow mark and Grave soil raise a thrall on the unit's own tile, the exceptions to where summons land.
    u.enchants.forEach(function (e) {
      if (CARDS[e.c].mark && emptyTile(s, u.r, u.c)) conjure(s, e.owner, CARDS[e.c].mark, u.r, u.c, 'The barrow mark');
    });
    if (spot && spot.kind === 'blight' && emptyTile(s, u.r, u.c)) conjure(s, spot.owner, 'thrall', u.r, u.c, 'The grave soil');
    // A Lit unit explodes: 2 damage to each unit next to it that isn't Fireproof, either side's, and the ground around it burns.
    if (u.lit) {
      say(s, d.name + ' explodes.');
      [[0, 0]].concat(STEPS).forEach(function (st) { setTile(s, u.r + st[0], u.c + st[1], 'burn', u.owner, 2); });
      var blasted = s.units.filter(function (o) { return dist(o, u) === 1 && !hasKw(o, 'Fireproof'); });
      blasted.forEach(function (o) { say(s, 'The blast hits ' + CARDS[o.cardId].name + ' for ' + damage(s, o, 2) + '.'); });
      blasted.forEach(function (o) { if (o.hp <= 0 && s.units.indexOf(o) >= 0) kill(s, o); });
    }
  }

  // Loyal: a stat bonus while another unit of the same faction is on your side. Armed works the same way while the unit carries equipment. Health comes and goes with it,
  // so a damaged unit can die when it loses the bonus.
  function syncLoyal(s) {
    for (var pass = 0; pass < 4; pass++) {
      var changed = false;
      s.units.slice().forEach(function (u) {
        var d = CARDS[u.cardId];
        if ((!d.loyal && !d.armed) || s.units.indexOf(u) < 0) return;
        var on = d.armed ? (u.enchants.some(function (e) { return CARDS[e.c].equipment; }) ? d.armed : 0)
          : d.faction && s.units.some(function (o) { return o !== u && o.owner === u.owner && CARDS[o.cardId].faction === d.faction; }) ? d.loyal : 0;
        var was = u.loyal || 0;
        if (on === was) return;
        changed = true;
        u.loyal = on; u.maxHp += on - was; u.hp += on - was;
        s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: (on > was ? '+' : '') + (on - was), good: on > was });
        if (u.hp <= 0) kill(s, u);
      });
      if (!changed) return;
    }
  }

  // Takes damage off a unit and returns how much landed. Woven ward soaks damage of every kind until it is used up.
  function damage(s, u, amt) {
    var w = u.enchants.filter(function (e) { return e.left > 0; })[0];
    if (w && amt > 0) {
      var soak = Math.min(amt, w.left);
      w.left -= soak; amt -= soak;
      say(s, CARDS[w.c].name + ' takes ' + soak + ' damage for ' + CARDS[u.cardId].name + '.');
      if (!w.left) {
        u.enchants.splice(u.enchants.indexOf(w), 1);
        s.players[w.owner].discard.push({ id: w.id, c: w.c });
        say(s, CARDS[w.c].name + ' is used up.');
      }
    }
    u.hp -= amt;
    s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '-' + amt });
    return amt;
  }

  function drain(s, u, dealt) { if (hasKw(u, 'Drain')) heal(s, u, dealt); }

  function resolveAttack(s, att) {
    var a = unitById(s, att.attacker);
    if (!a) { say(s, 'The attack fizzles.'); return; }
    var name = CARDS[a.cardId].name;
    if (att.missed) { say(s, name + ' misses.'); a.frenzySpent = true; return; }
    var amt = attackOf(s, a);
    if (att.summoner !== undefined) {
      a.frenzySpent = true;
      var def = s.players[att.summoner];
      def.life -= amt;
      s.fx.push({ summoner: att.summoner, text: '-' + amt });
      say(s, name + ' hits ' + mark(s, def) + ' for ' + amt + '.');
      drain(s, a, amt);
      if (def.life <= 0) { def.life = 0; s.winner = a.owner; say(s, mark(s, s.players[a.owner]) + ' wins.'); }
      return;
    }
    var t = unitById(s, att.targetUid), b = att.secondaryUid ? unitById(s, att.secondaryUid) : null, over = null;
    function strike(u, verb) {
      var before = u.hp, hit = damage(s, u, hitOn(s, a, u, att.shield === u.uid ? att.prevent : 0));
      say(s, verb + CARDS[u.cardId].name + ' for ' + hit + '.');
      drain(s, a, Math.min(hit, before));
    }
    if (t) {
      strike(t, name + ' hits ');
      if (t.hp > 0 && hasKw(a, 'Freeze')) {
        t.frozen = s.turn + 1;
        say(s, CARDS[t.cardId].name + " is frozen: it can't move on its next turn.");
      }
      if (t.hp < 0 && hasKw(a, 'Overrun')) {
        // Behind means one tile on from the target, whatever the range. A diagonal shot counts along the row.
        var dr = t.r === a.r ? 0 : t.r > a.r ? 1 : -1, dc = dr ? 0 : t.c > a.c ? 1 : -1;
        over = unitAt(s, t.r + dr, t.c + dc);
        if (over && over.owner !== a.owner) {
          var excess = damage(s, over, guarded(s, over, -t.hp, pierces(a)));
          say(s, name + ' overruns ' + CARDS[over.cardId].name + ' for ' + excess + '.');
          drain(s, a, excess);
        } else over = null;
      }
    }
    if (b) strike(b, 'The lance also hits ');
    var stomped = [];
    if (t && hasKw(a, 'Stomp')) s.units.forEach(function (o) {
      if (o === t || o.owner === a.owner || dist(o, t) !== 1) return;
      var hit = damage(s, o, guarded(s, o, 1, pierces(a)));
      say(s, name + ' stomps ' + CARDS[o.cardId].name + ' for ' + hit + '.');
      stomped.push(o);
    });
    // Resonance carries the full attack on to the enemy directly behind the target, measured as for Overrun. That enemy doesn't strike back.
    if (t && hasKw(a, 'Resonance')) {
      var rr = t.r === a.r ? 0 : t.r > a.r ? 1 : -1, rc = rr ? 0 : t.c > a.c ? 1 : -1, rung = unitAt(s, t.r + rr, t.c + rc);
      if (rung && rung.owner !== a.owner && rung !== b && rung !== over) { strike(rung, name + "'s resonance also hits "); stomped.push(rung); }
    }
    // Every hit of this attack has had the Frenzy bonus, so it's spent now.
    a.frenzySpent = true;
    // Only a survivor strikes back, and only if the attacker is within its range. A decoy strikes back before it vanishes.
    var vanish = t && t.hp > 0 && hasKw(t, 'Decoy');
    if (t && t.hp > 0 && !(vanish && attackOf(s, t) === 0)) {
      if (dist(a, t) <= range(t)) {
        var had = a.hp, back = damage(s, a, hitOn(s, t, a, 0, true));
        say(s, CARDS[t.cardId].name + ' strikes back for ' + back + '.');
        drain(s, t, Math.min(back, had));
      } else say(s, CARDS[t.cardId].name + " can't strike back: " + name + ' is out of reach.');
    }
    if (vanish) { t.hp = 0; say(s, 'The decoy vanishes.'); }
    if (b && b.hp > 0) {
      if (hasKw(b, 'Decoy')) { b.hp = 0; say(s, 'The decoy vanishes.'); }
      else say(s, CARDS[b.cardId].name + " can't strike back: only the lance's main target does.");
    }
    // Ilvane draws for each unit she destroys, whether attacking or striking back. A vanished decoy counts.
    var takers = [];
    [t, b, over].concat(stomped).forEach(function (u) { if (u && u.hp <= 0) takers.push(a); });
    if (t && a.hp <= 0) takers.push(t);
    [t, b, over, a].concat(stomped).forEach(function (u) { if (u && u.hp <= 0 && s.units.indexOf(u) >= 0) kill(s, u); });
    takers.forEach(function (k) {
      if (!CARDS[k.cardId].drawOnKill) return;
      draw(s, k.owner);
      say(s, CARDS[k.cardId].name + ' destroys a unit, and ' + mark(s, s.players[k.owner]) + ' draws a card.');
    });
  }

  function beginAttack(s, att) {
    if (responses(s, 'attack', att).length) {
      s.pending = { kind: 'attack', attack: att, responder: 1 - s.active };
    } else resolveAttack(s, att);
  }

  function finishTurn(s) {
    s.units.forEach(function (u) { u.tempAtk = 0; u.tempRange = false; u.noAttack = false; u.stride = 0; });
    var p = s.players[s.active], coins = p.hand.filter(function (i) { return CARDS[i.c].coin; }).length;
    if (coins) {
      p.life -= coins;
      s.fx.push({ summoner: s.active, text: '-' + coins });
      say(s, mark(s, p) + ' loses ' + coins + ' life to the ' + CARDS.coin.name + (coins > 1 ? 's' : '') + '.');
      if (p.life <= 0) { p.life = 0; s.winner = 1 - s.active; say(s, mark(s, s.players[1 - s.active]) + ' wins.'); return; }
    }
    s.units.filter(function (u) { return u.enchants.some(function (e) { return e.expires === s.turn; }); }).forEach(function (u) {
      say(s, 'The warrant on ' + CARDS[u.cardId].name + ' comes due.');
      kill(s, u);
    });
    // Hour of collection comes due at the end of its caster's next turn.
    (s.hours || []).filter(function (h) { return h.turn === s.turn; }).forEach(function () {
      say(s, 'The hour of collection strikes.');
      s.units.filter(function (u) { return u.hp <= 2; }).forEach(function (u) { if (s.units.indexOf(u) >= 0) kill(s, u); });
    });
    s.hours = (s.hours || []).filter(function (h) { return h.turn > s.turn; });
    // A unit under Borrowed will goes back at the end of the turn.
    s.units.filter(function (u) { return u.borrowed === s.turn; }).forEach(function (u) { release(s, u); });
    // The Tideglass engine banks 1 mana its owner didn't spend.
    p.relics.forEach(function (r) {
      if (CARDS[r.c].relic !== 'tide' || p.mana < 1 || (r.store || 0) >= 3) return;
      r.store = (r.store || 0) + 1;
      p.mana -= 1;
      say(s, mark(s, p) + ' stores 1 mana in the ' + CARDS[r.c].name + '.');
    });
    if (s.winner !== null) return;
    startTurn(s);
  }

  function applyMove(prev, m) {
    var s = JSON.parse(JSON.stringify(prev));
    s.fx = [];
    var pi = s.active, p = s.players[pi], i, c, u;
    switch (m.type) {
      case 'playLand':
        i = takeFromHand(p, m.card); c = card(i);
        p.lands.push({ colour: c.colour, id: i.id, c: i.c }); p.mana += 1;
        if (p.landDropped) p.extraLands -= 1; else p.landDropped = true;
        say(s, mark(s, p) + ' plays ' + c.name + '.');
        // Rootfed feeds on Genesis lands only.
        if (c.colour === 'G') s.units.forEach(function (o) {
          if (o.owner !== pi || !hasKw(o, 'Rootfed') || (o.rootfed || 0) >= 3) return;
          o.rootfed = (o.rootfed || 0) + 1; o.boost = (o.boost || 0) + 1; o.maxHp += 1; o.hp += 1;
          s.fx.push({ uid: o.uid, r: o.r, c: o.c, text: '+1', good: true });
          say(s, CARDS[o.cardId].name + ' feeds on the land.');
        });
        p.relics.forEach(function (r) { if (CARDS[r.c].relic === 'seed' && (r.store || 0) < 3) r.store = (r.store || 0) + 1; });
        break;
      // Opening hands work like a London mulligan: every redraw is a full new hand, then one card goes to the bottom on keeping.
      case 'redraw':
        p.redraws += 1;
        p.deck = p.deck.concat(p.hand);
        p.hand = [];
        shuffle(s, p.deck);
        for (var d = 0; d < OPENING_HAND; d++) p.hand.push(p.deck.pop());
        say(s, mark(s, p) + ' redraws their opening hand.');
        break;
      case 'keepHand':
        p.toBottom = p.redraws;
        if (!p.toBottom) finishOpening(s);
        break;
      case 'bottomCard':
        i = takeFromHand(p, m.card);
        if (!i.conjured) p.deck.unshift(i);
        p.toBottom -= 1;
        if (!p.toBottom && s.phase === 'opening') finishOpening(s);
        break;
      case 'summon':
        i = takeFromHand(p, m.card); c = card(i);
        p.mana -= costOf(s, pi, c, i);
        s.units.push(newUnit(s, i.id, i.c, pi, m.r, m.c));
        say(s, mark(s, p) + ' summons ' + c.name + (m.r !== backRow(pi) ? ' from ambush.' : '.'));
        if (c.summons) summonAll(s, pi, c.summons, m.at, c.name);
        if (c.adds) {
          c.adds.forEach(function (id) { addToHand(s, pi, id); });
          say(s, mark(s, p) + ' adds ' + (c.adds.length > 1 ? c.adds.length + ' ' + CARDS[c.adds[0]].name + 's' : 'a ' + CARDS[c.adds[0]].name) + ' to their hand.');
        }
        if (c.curse) {
          addToHand(s, 1 - pi, c.curse);
          say(s, mark(s, p) + ' puts a ' + CARDS[c.curse].name + " in their enemy's hand.");
        }
        // The Court informant's tax sits on one card in the enemy's hand until it's played.
        if (c.tax) {
          var taxable = s.players[1 - pi].hand.filter(function (h) { return CARDS[h.c].type !== 'land'; });
          if (taxable.length) {
            var taxed = taxable[Math.floor(rand(s) * taxable.length)];
            taxed.tax = (taxed.tax || 0) + c.tax;
            say(s, c.name + " reports, and a card in the enemy's hand costs " + c.tax + ' more.');
          }
        }
        if (c.extraLand) p.extraLands += 1;
        if (c.drawOnSummon) {
          draw(s, pi);
          say(s, mark(s, p) + ' draws a card.');
        }
        if (c.zap && m.target) {
          u = unitById(s, m.target);
          say(s, c.name + ' hits ' + CARDS[u.cardId].name + ' for ' + damage(s, u, c.zap) + '.');
          if (u.hp <= 0) kill(s, u);
        }
        if (c.lifeCost) {
          p.life -= c.lifeCost;
          s.fx.push({ summoner: pi, text: '-' + c.lifeCost });
          say(s, mark(s, p) + ' pays ' + c.lifeCost + ' life.');
          if (p.life <= 0) { p.life = 0; s.winner = 1 - pi; say(s, mark(s, s.players[1 - pi]) + ' wins.'); }
        }
        break;
      case 'enchant':
        i = takeFromHand(p, m.card); c = card(i); u = unitById(s, m.target);
        p.mana -= costOf(s, pi, c, i);
        var ench = { id: i.id, c: i.c, owner: pi };
        if (c.warrant) ench.expires = s.turn + c.warrant;
        if (c.ward) ench.left = c.ward;
        // Lasts this many of its caster's turns, counting this one, and goes as the next one begins.
        if (c.sanctuary) ench.until = s.turn + 2 * c.sanctuary - 2;
        if (c.veil) u.veiled = true;
        u.enchants.push(ench);
        u.maxHp += c.hpBonus; u.hp += c.hpBonus;
        say(s, mark(s, p) + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + '.');
        break;
      case 'cast':
        i = takeFromHand(p, m.card); c = card(i);
        p.mana -= costOf(s, pi, c, i);
        delete i.tax;
        if (c.type === 'relic') {
          p.relics.push({ id: i.id, c: i.c, store: 0 });
          say(s, mark(s, p) + ' sets out the ' + c.name + '.');
          break;
        }
        if (!i.conjured) p.discard.push(i);
        if (c.type === 'instant') {
          var aimed = unitById(s, m.target);
          say(s, mark(s, p) + ' casts ' + c.name + (aimed ? ' on ' + CARDS[aimed.cardId].name : '') + '.');
          instantEffect(s, pi, c, m, aimed);
          break;
        }
        if (m.relic) {
          breakRelic(s, m.relic, c);
          if (c.loam) p.extraLands += 1;
          break;
        }
        if (c.aim) castAt(s, pi, c, m.r, m.c);
        if (c.bolt) {
          if (m.summoner !== undefined) {
            var hitP = s.players[m.summoner];
            hitP.life -= c.bolt;
            s.fx.push({ summoner: m.summoner, text: '-' + c.bolt });
            say(s, mark(s, p) + ' casts ' + c.name + ' at ' + mark(s, hitP) + ' for ' + c.bolt + '.');
            if (c.leech) {
              p.life += c.bolt;
              s.fx.push({ summoner: pi, text: '+' + c.bolt, good: true });
              say(s, mark(s, p) + ' gains ' + c.bolt + ' life.');
            }
            if (hitP.life <= 0) { hitP.life = 0; s.winner = pi; say(s, mark(s, p) + ' wins.'); }
          } else {
            u = unitById(s, m.target);
            say(s, mark(s, p) + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + ' for ' + damage(s, u, c.bolt) + '.');
            if (u.hp <= 0) kill(s, u);
          }
        }
        if (c.selfLife) {
          p.life -= c.selfLife;
          s.fx.push({ summoner: pi, text: '-' + c.selfLife });
          say(s, mark(s, p) + ' pays ' + c.selfLife + ' life.');
        }
        if (c.sweep) {
          say(s, mark(s, p) + ' casts ' + c.name + '.');
          var swept = s.units.filter(function (o) { return !hasKw(o, 'Fireproof'); });
          swept.forEach(function (o) { say(s, c.name + ' burns ' + CARDS[o.cardId].name + ' for ' + damage(s, o, c.sweep) + '.'); });
          swept.forEach(function (o) { if (o.hp <= 0 && s.units.indexOf(o) >= 0) kill(s, o); });
        }
        if (c.humble) {
          say(s, mark(s, p) + ' casts ' + c.name + '.');
          var proud = s.units.filter(function (o) { return attackOf(s, o) >= c.humble.atk; });
          proud.forEach(function (o) { say(s, c.name + ' strikes ' + CARDS[o.cardId].name + ' for ' + damage(s, o, c.humble.hit) + '.'); });
          proud.forEach(function (o) { if (o.hp <= 0 && s.units.indexOf(o) >= 0) kill(s, o); });
        }
        if (c.hour) {
          if (!s.hours) s.hours = [];
          s.hours.push({ turn: s.turn + c.hour, owner: pi });
          say(s, mark(s, p) + ' casts ' + c.name + '. At the end of their next turn, every unit with 2 or less health is destroyed.');
        }
        if (c.borrow) {
          u = unitById(s, m.target);
          if (u.from === undefined) u.from = u.owner;
          u.owner = pi; u.borrowed = s.turn; u.moved = false; u.acted = false; u.summonedTurn = s.turn - 1;
          say(s, mark(s, p) + ' casts ' + c.name + ' and takes control of ' + CARDS[u.cardId].name + ' for this turn.');
        }
        if (c.buy) {
          u = unitById(s, m.target);
          u.owner = pi; u.moved = true; u.acted = true; u.summonedTurn = s.turn;
          delete u.from; delete u.borrowed; delete u.charmedBy;
          say(s, mark(s, p) + ' casts ' + c.name + ', and ' + CARDS[u.cardId].name + ' changes sides for good.');
        }
        if (c.stasis) {
          u = unitById(s, m.target);
          u.stasis = s.turn + 2;
          say(s, mark(s, p) + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + '.');
        }
        if (c.place) {
          var ghost = conjure(s, pi, c.place, m.r, m.c, c.name);
          ghost.fleeting = true;
        }
        if (c.light) {
          u = unitById(s, m.target);
          u.lit = true;
          say(s, mark(s, p) + ' casts ' + c.name + ', and ' + CARDS[u.cardId].name + ' is Lit.');
        }
        if (c.unchain || c.loam) {
          u = unitById(s, m.target);
          var piece = lastGear(u, c.loam);
          strip(s, u, [piece]);
          say(s, mark(s, p) + ' casts ' + c.name + ' and removes ' + CARDS[piece.c].name + ' from ' + CARDS[u.cardId].name + '.');
          if (c.unchain && u.owner !== pi) {
            say(s, CARDS[u.cardId].name + ' takes ' + damage(s, u, c.unchain) + '.');
            if (u.hp <= 0) kill(s, u);
          }
          if (c.loam) p.extraLands += 1;
        }
        if (c.summons) {
          say(s, mark(s, p) + ' casts ' + c.name + '.');
          summonAll(s, pi, c.summons, m.at);
        }
        if (c.chant) {
          u = unitById(s, m.target);
          u.tempAtk += c.chant;
          s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+' + c.chant, good: true });
          say(s, mark(s, p) + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + '.');
        }
        if (c.coin) say(s, mark(s, p) + ' plays ' + c.name + ', and it vanishes.');
        if (c.draw) {
          for (var dn = 0; dn < c.draw; dn++) draw(s, pi);
          say(s, mark(s, p) + ' casts ' + c.name + ' and draws ' + c.draw + ' cards.');
        }
        if (c.bonusNext) {
          p.bonusMana = (p.bonusMana || 0) + c.bonusNext;
          say(s, mark(s, p) + ' casts ' + c.name + ' and will have ' + c.bonusNext + ' extra mana next turn.');
        }
        if (c.stride) {
          s.units.forEach(function (a) { if (a.owner === pi) a.stride = c.stride; });
          say(s, mark(s, p) + ' casts ' + c.name + ', and their units can move further this turn.');
        }
        if (c.extraLand) {
          p.extraLands += 1;
          say(s, mark(s, p) + ' casts ' + c.name + ' and may play an extra land.');
        }
        if (c.sift) {
          draw(s, pi);
          if (p.hand.length) p.toBottom = 1;
          say(s, mark(s, p) + ' casts ' + c.name + ', draws a card and puts one on the bottom of their deck.');
        }
        if (c.blast) {
          u = unitById(s, m.target);
          var burnt = [u], cold = u.frozen >= s.turn || tileKind(s, u) === 'frost';
          say(s, mark(s, p) + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + ' for ' + damage(s, u, c.iceBlast && cold ? c.iceBlast : c.blast) + '.');
          // Rimebolt: a survivor can't move on its next turn.
          if (c.chill && u.hp > 0) {
            u.frozen = s.turn + 1;
            say(s, CARDS[u.cardId].name + " is frozen: it can't move on its next turn.");
          }
          // Brightlance pushes a survivor back toward its owner's side, if that tile is free.
          if (c.knock && u.hp > 0 && emptyTile(s, shoveRow(u), u.c)) {
            u.r = shoveRow(u);
            say(s, CARDS[u.cardId].name + ' is pushed back.');
          }
          if (c.splash) s.units.forEach(function (o) {
            if (o.owner === pi || o === u || dist(o, u) !== 1) return;
            say(s, 'The fire also hits ' + CARDS[o.cardId].name + ' for ' + damage(s, o, c.splash) + '.');
            burnt.push(o);
          });
          burnt.forEach(function (o) { if (o.hp <= 0) kill(s, o); });
        }
        if (c.cleanse) {
          u = unitById(s, m.target);
          strip(s, u, u.enchants.slice());
          say(s, mark(s, p) + ' casts ' + c.name + ' and clears the enchantments from ' + CARDS[u.cardId].name + '.');
        }
        if (c.mend) {
          u = unitById(s, m.target);
          say(s, mark(s, p) + ' casts ' + c.name + ' and heals ' + CARDS[u.cardId].name + ' for ' + heal(s, u, c.mend) + '.');
          if (c.temper) {
            u.boost = (u.boost || 0) + c.temper;
            s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+' + c.temper, good: true });
          }
        }
        if (c.fortify) {
          s.units.forEach(function (o) {
            if (o.owner !== pi) return;
            o.maxHp += c.fortify; o.hp += c.fortify;
            s.fx.push({ uid: o.uid, r: o.r, c: o.c, text: '+' + c.fortify, good: true });
          });
          say(s, mark(s, p) + ' casts ' + c.name + '.');
        }
        if (c.passage) {
          u = unitById(s, m.target);
          u.r = m.r; u.c = m.c; u.noAttack = true; u.walked = true;
          say(s, mark(s, p) + ' casts ' + c.name + ' and moves ' + CARDS[u.cardId].name + '.');
        }
        for (var di = 0; m.raise && di < p.discard.length; di++) {
          if (p.discard[di].id === m.raise) {
            var back = p.discard.splice(di, 1)[0];
            s.units.push(newUnit(s, back.id, back.c, pi, backRow(pi), backTile(s, pi)));
            say(s, mark(s, p) + ' casts ' + c.name + ' and returns ' + CARDS[back.c].name + '.');
            break;
          }
        }
        break;
      case 'toCommand':
        s.phase = 'command';
        break;
      case 'move':
        u = unitById(s, m.unit);
        var left = { r: u.r, c: u.c };
        u.r = m.r; u.c = m.c; u.moved = true; u.walked = true;
        say(s, CARDS[u.cardId].name + ' moves.');
        // The torch-runner's trail burns until its owner's next turn, so it lasts through the enemy's turn.
        if (CARDS[u.cardId].trail) {
          setTile(s, left.r, left.c, 'burn', pi, 1);
          s.tiles[left.r + ',' + left.c].until = s.turn + 1;
        }
        tileHits(s, u, true);
        // Unwind the step can answer a move.
        var step = { uid: u.uid, r: left.r, c: left.c };
        if (s.units.indexOf(u) >= 0 && responses(s, 'move', step).length) s.pending = { kind: 'move', step: step, responder: 1 - pi };
        break;
      case 'attack':
        u = unitById(s, m.unit); u.acted = true; unveil(s, u);
        if (s.winner === null) beginAttack(s, { attacker: u.uid, targetUid: m.target });
        break;
      case 'attackSummoner':
        u = unitById(s, m.unit); u.acted = true; unveil(s, u);
        if (s.winner === null) beginAttack(s, { attacker: u.uid, summoner: 1 - pi });
        break;
      case 'relic':
        var rel = p.relics.filter(function (r) { return r.id === m.relic; })[0], rk = CARDS[rel.c].relic;
        rel.used = s.turn;
        if (rk === 'bell') {
          p.mana -= 1;
          s.units.forEach(function (o) { if (o.owner === pi && nextToAlly(s, o)) { o.tempAtk += 1; s.fx.push({ uid: o.uid, r: o.r, c: o.c, text: '+1', good: true }); } });
          say(s, mark(s, p) + ' rings the ' + CARDS[rel.c].name + '.');
        } else if (rk === 'drum') {
          p.mana -= 1;
          s.units.forEach(function (o) { if (o.owner === pi) o.stride = (o.stride || 0) + 1; });
          say(s, mark(s, p) + ' beats the ' + CARDS[rel.c].name + ', and their units can move further this turn.');
        } else if (rk === 'tide') {
          p.mana += rel.store;
          say(s, mark(s, p) + ' releases ' + rel.store + ' mana from the ' + CARDS[rel.c].name + '.');
          rel.store = 0;
        } else if (rk === 'seed') {
          u = unitById(s, m.target);
          u.boost = (u.boost || 0) + rel.store; u.maxHp += rel.store; u.hp += rel.store;
          s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+' + rel.store, good: true });
          say(s, mark(s, p) + ' releases the ' + CARDS[rel.c].name + ' into ' + CARDS[u.cardId].name + '.');
          rel.store = 0;
        } else if (rk === 'stars') {
          var top = p.deck.length - 1, was = p.deck[top];
          p.deck[top] = p.deck[top - 1]; p.deck[top - 1] = was;
          say(s, mark(s, p) + ' turns the ' + CARDS[rel.c].name + ' and swaps the top two cards of their deck.');
        }
        break;
      case 'ability':
        u = unitById(s, m.unit); u.acted = true;
        var ab = CARDS[u.cardId].ability;
        if (ab.key === 'heal') {
          var a = unitById(s, m.target), healed = heal(s, a, ab.amount);
          say(s, CARDS[u.cardId].name + ' heals ' + CARDS[a.cardId].name + ' for ' + healed + '.');
        } else if (ab.key === 'rally') {
          s.units.forEach(function (o) { if (o.owner === pi && o !== u && dist(u, o) === 1) o.tempAtk += ab.amount; });
          say(s, CARDS[u.cardId].name + ' rallies nearby allies.');
        } else if (ab.key === 'lance') {
          var e = unitById(s, m.target), behind = unitAt(s, e.r + (e.r - u.r), e.c + (e.c - u.c));
          beginAttack(s, { attacker: u.uid, targetUid: e.uid, secondaryUid: behind ? behind.uid : null });
        } else if (ab.key === 'lens') {
          var lit = unitById(s, m.target);
          lit.tempRange = true;
          say(s, CARDS[u.cardId].name + ' extends the reach of ' + CARDS[lit.cardId].name + '.');
        } else if (ab.key === 'healall') {
          s.units.forEach(function (o) { if (o.owner === pi && o !== u && dist(u, o) === 1) heal(s, o, ab.amount); });
          say(s, CARDS[u.cardId].name + ' heals nearby allies.');
        } else if (ab.key === 'orders') {
          var ally = unitById(s, m.target);
          ally.moved = false;
          say(s, CARDS[u.cardId].name + ' orders ' + CARDS[ally.cardId].name + ' to move again.');
        } else if (ab.key === 'study') {
          u.moved = true;
          draw(s, pi);
          say(s, CARDS[u.cardId].name + ' studies, and ' + mark(s, p) + ' draws a card.');
        } else if (ab.key === 'sift') {
          u.moved = true;
          draw(s, pi);
          if (p.hand.length) p.toBottom = 1;
          say(s, CARDS[u.cardId].name + ' sifts, and ' + mark(s, p) + ' draws a card and puts one on the bottom of their deck.');
        } else if (ab.key === 'forage') {
          u.moved = true;
          p.bonusMana = (p.bonusMana || 0) + 1;
          say(s, CARDS[u.cardId].name + ' forages, and ' + mark(s, p) + ' will have 1 extra mana next turn.');
        } else if (ab.key === 'push') {
          var pushed = unitById(s, m.target), pr = pushed.r + (pushed.r - u.r), pc = pushed.c + (pushed.c - u.c);
          pushed.r = pr; pushed.c = pc;
          say(s, CARDS[u.cardId].name + ' pushes ' + CARDS[pushed.cardId].name + ' back.');
        } else if (ab.key === 'harvest') {
          var fed = unitById(s, m.target);
          say(s, CARDS[u.cardId].name + ' harvests ' + CARDS[fed.cardId].name + '.');
          kill(s, fed);
          u.boost = (u.boost || 0) + ab.amount;
        } else if (ab.key === 'tend') {
          var tended = unitById(s, m.target);
          tended.boost = (tended.boost || 0) + 1; tended.maxHp += 1; tended.hp += 1;
          s.fx.push({ uid: tended.uid, r: tended.r, c: tended.c, text: '+1', good: true });
          say(s, CARDS[u.cardId].name + ' tends ' + CARDS[tended.cardId].name + '.');
        } else if (ab.key === 'swap') {
          var other = unitById(s, m.target), ur = u.r, uc = u.c;
          u.r = other.r; u.c = other.c; other.r = ur; other.c = uc;
          say(s, CARDS[u.cardId].name + ' swaps places with ' + CARDS[other.cardId].name + '.');
        } else if (ab.key === 'zap') {
          var zapped = unitById(s, m.target);
          say(s, CARDS[u.cardId].name + ' hits ' + CARDS[zapped.cardId].name + ' for ' + damage(s, zapped, ab.amount) + '.');
          if (zapped.hp <= 0) kill(s, zapped);
        } else if (ab.key === 'hold') {
          var held = unitById(s, m.target);
          held.held = s.turn + 1;
          say(s, CARDS[u.cardId].name + ' holds ' + CARDS[held.cardId].name + " in place: it can't move or attack next turn.");
        } else if (ab.key === 'exhume') {
          for (var xi = 0; xi < p.discard.length; xi++) {
            if (p.discard[xi].id !== m.raise) continue;
            var dug = p.discard.splice(xi, 1)[0];
            s.units.push(newUnit(s, dug.id, dug.c, pi, backRow(pi), backTile(s, pi)));
            say(s, CARDS[u.cardId].name + ' returns ' + CARDS[dug.c].name + '.');
            break;
          }
        } else if (ab.key === 'snare' || ab.key === 'blight') {
          setTile(s, m.r, m.c, ab.key, pi, ab.turns);
          say(s, CARDS[u.cardId].name + (ab.key === 'snare' ? ' sets a snare.' : ' blights the ground.'));
        } else if (ab.key === 'rain') {
          var dry = tileAt(s, m.r, m.c), wet = unitAt(s, m.r, m.c);
          if (dry) delete s.tiles[m.r + ',' + m.c];
          say(s, CARDS[u.cardId].name + (dry ? ' washes the tile clean.' : ' calls the rain.'));
          if (wet && wet.owner === pi && wet.hp < wet.maxHp) heal(s, wet, 1);
        } else if (ab.key === 'winterdoor') {
          setTile(s, m.r, m.c, 'frost', pi, ab.turns);
          say(s, CARDS[u.cardId].name + ' opens a door to winter.');
        } else if (ab.key === 'farheal') {
          var near = unitById(s, m.target);
          say(s, CARDS[u.cardId].name + ' heals ' + CARDS[near.cardId].name + ' for ' + heal(s, near, ab.amount) + '.');
        } else if (ab.key === 'refit') {
          // The equipment moves with its health, and Armed follows it through syncLoyal.
          var giver = unitById(s, m.target), taker = unitAt(s, m.r, m.c), kit = lastGear(giver, true), kc = CARDS[kit.c];
          giver.enchants.splice(giver.enchants.indexOf(kit), 1);
          giver.maxHp -= kc.hpBonus; giver.hp = Math.min(giver.hp, giver.maxHp);
          if (kc.veil) giver.veiled = CARDS[giver.cardId].keywords.indexOf('Veiled') >= 0 && !giver.unveiled;
          taker.enchants.push(kit);
          taker.maxHp += kc.hpBonus; taker.hp += kc.hpBonus;
          if (kc.veil) taker.veiled = true;
          say(s, CARDS[u.cardId].name + ' passes ' + kc.name + ' from ' + CARDS[giver.cardId].name + ' to ' + CARDS[taker.cardId].name + '.');
        } else if (ab.key === 'ferry') {
          var carried = unitById(s, m.target);
          carried.r = m.r; carried.c = m.c;
          say(s, CARDS[u.cardId].name + ' moves ' + CARDS[carried.cardId].name + '.');
          tileHits(s, carried, true);
        } else if (ab.key === 'sweep') {
          [[0, 0]].concat(STEPS).forEach(function (d) { delete s.tiles[(u.r + d[0]) + ',' + (u.c + d[1])]; });
          say(s, CARDS[u.cardId].name + ' sweeps the ground clean.');
        } else if (ab.key === 'trap') {
          setTile(s, m.r, m.c, 'thorns', pi, ab.turns);
          say(s, CARDS[u.cardId].name + ' sets thorns.');
        } else if (ab.key === 'wildcast') {
          // The fire goes roughly where it's aimed: the picked tile or one next to it, at random.
          var landings = [[0, 0]].concat(STEPS).map(function (d) { return { r: m.r + d[0], c: m.c + d[1] }; }).filter(function (t) { return onBoard(t.r, t.c); });
          var fell = landings[Math.floor(rand(s) * landings.length)], scorched = unitAt(s, fell.r, fell.c);
          say(s, CARDS[u.cardId].name + "'s fire lands at row " + fell.r + ', column ' + fell.c + '.');
          setTile(s, fell.r, fell.c, 'burn', pi, ab.turns);
          if (scorched) {
            say(s, 'The fire hits ' + CARDS[scorched.cardId].name + ' for ' + damage(s, scorched, ab.amount) + '.');
            if (scorched.hp <= 0) kill(s, scorched);
          }
        } else if (ab.key === 'charm') {
          var charmed = unitById(s, m.target);
          if (charmed.from === undefined) charmed.from = charmed.owner;
          charmed.owner = pi; charmed.charmedBy = u.uid; charmed.moved = true; charmed.acted = true; charmed.summonedTurn = s.turn;
          delete charmed.borrowed;
          say(s, CARDS[u.cardId].name + ' charms ' + CARDS[charmed.cardId].name + '.');
        } else if (ab.key === 'sap') {
          var sapped = unitById(s, m.target);
          sapped.sapped = s.turn + 1;
          say(s, CARDS[u.cardId].name + ' restrains ' + CARDS[sapped.cardId].name + ': -' + ab.amount + ' attack until the end of its next turn.');
        } else if (ab.key === 'reed') {
          u.moved = true;
          p.extraNext = (p.extraNext || 0) + 1;
          say(s, CARDS[u.cardId].name + ' forages, and ' + mark(s, p) + ' may play an extra land next turn.');
        } else if (ab.key === 'errant') {
          // Errant: the summon lands on a random free tile of the back row.
          var freeCols = [];
          for (var ec = 0; ec < COLS; ec++) if (emptyTile(s, backRow(pi), ec)) freeCols.push(ec);
          conjure(s, pi, ab.summon, backRow(pi), freeCols[Math.floor(rand(s) * freeCols.length)], CARDS[u.cardId].name);
        }
        break;
      case 'respond':
        var rp = s.players[1 - pi];
        i = takeFromHand(rp, m.card); c = card(i);
        rp.mana -= costOf(s, 1 - pi, c, i);
        rp.discard.push(i);
        var target = unitById(s, m.target);
        say(s, mark(s, rp) + ' responds with ' + c.name + (target ? ' on ' + CARDS[target.cardId].name : '') + '.');
        var pend = s.pending;
        s.pending = null;
        if (c.prevent) { pend.attack.shield = target.uid; pend.attack.prevent = c.prevent; }
        if (c.canopy) { pend.attack.shield = target.uid; pend.attack.prevent = 99; }
        // Stand as one covers the unit and its neighbours for the rest of the turn.
        if (c.brace) s.units.forEach(function (o) { if (o.owner === target.owner && dist(o, target) <= 1) o.braced = s.turn; });
        if (c.unwind) {
          target.r = pend.step.r; target.c = pend.step.c; target.unwound = s.turn;
          say(s, CARDS[target.cardId].name + ' is unwound to where it started.');
        }
        // Dodging the lance's second target clears only that hit. Dodging the main target misses the whole attack.
        if (c.dodge) {
          target.r = m.r; target.c = m.c;
          if (pend.attack.secondaryUid === target.uid) pend.attack.secondaryUid = null;
          else pend.attack.missed = true;
        }
        instantEffect(s, 1 - pi, c, m, target);
        if (pend.kind === 'attack') resolveAttack(s, pend.attack);
        else if (pend.kind === 'end') finishTurn(s);
        break;
      case 'pass':
        var pd = s.pending;
        s.pending = null;
        if (pd.kind === 'attack') resolveAttack(s, pd.attack);
        else if (pd.kind === 'end') finishTurn(s);
        break;
      case 'endTurn':
        if (responses(s, 'end').length) s.pending = { kind: 'end', responder: 1 - pi };
        else finishTurn(s);
        break;
      default:
        throw new Error('Unknown move: ' + m.type);
    }
    syncLoyal(s);
    return s;
  }

  // Attacking ends Veiled, except under a Mourning veil, whose wearer's owner pays 1 life instead.
  // What an instant that needs no trigger does, on either turn. pi is the caster.
  function instantEffect(s, pi, c, m, target) {
    var p = s.players[pi];
    if (c.aim) castAt(s, pi, c, m.r, m.c);
    if (c.shove) target.r = shoveRow(target);
    if (c.damage) {
      damage(s, target, c.damage);
      if (target.hp <= 0) kill(s, target);
    }
    if (c.debt) {
      p.life -= c.debt;
      s.fx.push({ summoner: pi, text: '-' + c.debt });
      say(s, mark(s, p) + ' pays ' + c.debt + ' life.');
      kill(s, target);
    }
  }

  function unveil(s, u) {
    if (!gear(u, 'veil')) { u.veiled = false; u.unveiled = true; return; }
    var p = s.players[u.owner];
    p.life -= 1;
    s.fx.push({ summoner: u.owner, text: '-1' });
    say(s, mark(s, p) + ' pays 1 life for the ' + CARDS[gear(u, 'veil').c].name + '.');
    if (p.life <= 0) { p.life = 0; s.winner = 1 - u.owner; say(s, mark(s, s.players[1 - u.owner]) + ' wins.'); }
  }

  // A destroyed relic goes to its owner's discard pile.
  function breakRelic(s, id, c) {
    s.players.forEach(function (o) {
      o.relics.filter(function (r) { return r.id === id; }).forEach(function (r) {
        o.relics.splice(o.relics.indexOf(r), 1);
        o.discard.push({ id: r.id, c: r.c });
        say(s, c.name + ' destroys the ' + CARDS[r.c].name + '.');
      });
    });
  }

  // The tiles a spell aimed at (r, c) covers, the aimed tile first. A cross is the tile and the 4 next to it, a square adds the
  // 4 corners, a row or a column is the whole line, and a wave runs from the tile to the enemy's back row. None reach past the grid.
  function aimArea(a, pi, r, c) {
    var out = [{ r: r, c: c }], dr, dc;
    if (a.row) for (dc = 0; dc < COLS; dc++) { if (dc !== c) out.push({ r: r, c: dc }); }
    else if (a.column) for (dr = 0; dr < ROWS; dr++) { if (dr !== r) out.push({ r: dr, c: c }); }
    else if (a.wave) for (dr = r + (pi === 0 ? -1 : 1); dr >= 0 && dr < ROWS; dr += pi === 0 ? -1 : 1) out.push({ r: dr, c: c });
    else if (a.square || a.spread || a.splash) for (dr = -1; dr <= 1; dr++) for (dc = -1; dc <= 1; dc++) {
      if ((dr || dc) && (a.square || !dr || !dc) && onBoard(r + dr, c + dc)) out.push({ r: r + dr, c: c + dc });
    }
    return out;
  }

  // A spell aimed at a tile hits whatever stands there, even a veiled unit, since it targets the ground rather than the unit.
  function castAt(s, pi, c, r, col) {
    var a = c.aim, here = unitAt(s, r, col), hurt = [], area = aimArea(a, pi, r, col);
    var inArea = area.map(function (t) { return unitAt(s, t.r, t.c); }).filter(Boolean);
    say(s, mark(s, s.players[pi]) + ' casts ' + c.name + ' at row ' + r + ', column ' + col + '.');
    // Lots for the gallows: one unit in the square, chosen at random, is destroyed.
    if (a.lots) {
      if (!inArea.length) { say(s, 'The lots fall on empty ground.'); return; }
      var doomed = inArea[Math.floor(rand(s) * inArea.length)];
      say(s, 'The lot falls on ' + CARDS[doomed.cardId].name + '.');
      kill(s, doomed);
      return;
    }
    // Cinder rain: each ember lands on a random tile of the square, and two can land on the same tile.
    if (a.embers) {
      for (var n = 0; n < a.embers; n++) {
        var spot = area[Math.floor(rand(s) * area.length)], struck = unitAt(s, spot.r, spot.c);
        setTile(s, spot.r, spot.c, a.tile, pi, a.turns);
        if (struck && !hasKw(struck, 'Fireproof')) {
          say(s, 'An ember hits ' + CARDS[struck.cardId].name + ' for ' + damage(s, struck, a.ember) + '.');
          if (struck.hp <= 0) kill(s, struck);
        } else say(s, 'An ember lands at row ' + spot.r + ', column ' + spot.c + '.');
      }
      return;
    }
    // Kindle the line lights your units before the fire takes the rest.
    if (a.light) inArea.forEach(function (o) {
      if (o.owner !== pi || o.lit) return;
      o.lit = true;
      say(s, CARDS[o.cardId].name + ' is Lit.');
    });
    // Cinderwake rolls from the tile toward the enemy's back row, hitting each enemy on the way and setting every tile it crosses alight.
    if (a.wave) {
      var dir = pi === 0 ? -1 : 1;
      for (var wr = r; wr >= 0 && wr < ROWS; wr += dir) {
        var o = unitAt(s, wr, col);
        if (o && o.owner !== pi) {
          say(s, c.name + ' hits ' + CARDS[o.cardId].name + ' for ' + damage(s, o, a.wave) + '.');
          hurt.push(o);
        }
        setTile(s, wr, col, a.tile, pi, a.turns);
      }
      hurt.forEach(function (o) { if (o.hp <= 0 && s.units.indexOf(o) >= 0) kill(s, o); });
      return;
    }
    if (here && a.hit) {
      say(s, c.name + ' hits ' + CARDS[here.cardId].name + ' for ' + damage(s, here, a.hit) + '.');
      hurt.push(here);
    }
    if (a.splash) s.units.forEach(function (o) {
      if (o === here || dist(o, { r: r, c: col }) !== 1 || (!a.splashAll && o.owner === pi)) return;
      say(s, c.name + ' also hits ' + CARDS[o.cardId].name + ' for ' + damage(s, o, a.splash) + '.');
      hurt.push(o);
    });
    // Every unit in the area: all hits either side, foes and chill only enemies, and mend heals your own.
    inArea.forEach(function (o) {
      var amt = a.all || (o.owner !== pi && a.foes);
      if (amt) {
        say(s, c.name + ' hits ' + CARDS[o.cardId].name + ' for ' + damage(s, o, amt) + '.');
        hurt.push(o);
      }
      if (a.mend && o.owner === pi && o.hp > 0) heal(s, o, a.mend);
      if (a.chill && o.owner !== pi) {
        o.frozen = s.turn + 1;
        say(s, CARDS[o.cardId].name + " is frozen: it can't move on its next turn.");
      }
    });
    // Scatter the line: the enemies in the row move back together, so none blocks another.
    if (a.back) inArea.forEach(function (o) {
      if (o.owner === pi || o.hp <= 0) return;
      if (emptyTile(s, shoveRow(o), o.c)) { o.r = shoveRow(o); say(s, CARDS[o.cardId].name + ' is pushed back.'); }
    });
    // Harmonic burst pushes each enemy it hit beside the centre 1 tile further out, if that tile is free.
    if (a.push) hurt.forEach(function (o) {
      if (o.owner === pi || o.hp <= 0 || o === here) return;
      var to = { r: o.r + (o.r - r), c: o.c + (o.c - col) };
      if (emptyTile(s, to.r, to.c)) { o.r = to.r; o.c = to.c; say(s, CARDS[o.cardId].name + ' is pushed away.'); }
    });
    // Unmake the pattern clears enchantments, equipment and tile effects from the whole cross.
    if (a.unmake) area.forEach(function (t) {
      var o = unitAt(s, t.r, t.c);
      if (s.tiles) delete s.tiles[t.r + ',' + t.c];
      if (o && o.enchants.length) { strip(s, o, o.enchants.slice()); say(s, c.name + ' unmakes the enchantments on ' + CARDS[o.cardId].name + '.'); }
    });
    // Splash spells mark only the aimed tile. Spreading ones mark their whole area.
    if (a.tile) (a.spread || a.square || a.row || a.column ? area : [area[0]]).forEach(function (t) { setTile(s, t.r, t.c, a.tile, pi, a.turns); });
    hurt.forEach(function (o) { if (o.hp <= 0 && s.units.indexOf(o) >= 0) kill(s, o); });
  }

  // What one player is allowed to know: no shuffle seed, no deck order and no enemy hand, only their sizes.
  // Anything that plays on a player's behalf starts from this, never from the full state.
  function viewFor(prev, pi) {
    var v = JSON.parse(JSON.stringify(prev));
    delete v.seed;
    v.viewer = pi;
    v.players.forEach(function (p, idx) {
      p.deckCount = p.deck.length;
      p.handCount = p.hand.length;
      // A Folded observatory shows its owner the top 2 cards of their deck, top card first.
      if (idx === pi && p.relics.some(function (r) { return CARDS[r.c].relic === 'stars'; })) p.top = p.deck.slice(-2).reverse().map(function (i) { return i.c; });
      p.deck = [];
      if (idx !== pi) p.hand = [];
    });
    return v;
  }

  return {
    ROWS: ROWS, COLS: COLS, START_LIFE: START_LIFE, CARDS: CARDS, DECKS: DECKS, FACTIONS: FACTIONS, viewFor: viewFor,
    DECK_MIN: DECK_MIN, DECK_MAX: DECK_MAX, maxCopies: maxCopies, deckSize: deckSize, deckProblems: deckProblems, deckColours: deckColours,
    newGame: newGame, legalMoves: legalMoves, applyMove: applyMove,
    tileAt: tileAt, attackOf: attackOf, attackAgainst: attackAgainst, hitOn: hitOn, costOf: costOf, backRow: backRow, range: range, speed: speed, hasKw: hasKw,
    placeUnit: placeUnit, aimArea: aimArea, gear: gear
  };
})();
if (typeof module !== 'undefined') module.exports = Engine;
