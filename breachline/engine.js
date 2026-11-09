// Rules engine. Pure state in, state out, with no DOM, so the UI, the scripted
// bot and a future model-driven player all go through legalMoves and applyMove.
var Engine = (function () {
  var ROWS = 4, COLS = 5, START_LIFE = 15, OPENING_HAND = 5, MAX_REDRAWS = 2, TURN_LIMIT = 60;

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
    unit('raider', 'Orc raider', 'R', 2, 1, 4, 2),
    unit('conjurer', 'Street conjurer', 'U', 2, 1, 2, 2, { keywords: ['Ranged'], text: 'Ranged: attacks up to 2 tiles away.' }),
    unit('sellsword', 'Sellsword', 'N', 3, 0, 3, 4),
    unit('warchief', 'Orc warchief', 'R', 4, 2, 5, 5, { keywords: ['Warband'], text: 'Warband: adjacent allies get +1 attack.' }),
    unit('giant', 'Hill giant', 'R', 5, 2, 5, 8, { keywords: ['Stomp'], text: 'Stomp: its attacks also deal 1 damage to enemies next to the target.' }),
    unit('dragon', 'Elder dragon', 'R', 7, 3, 9, 10, { keywords: ['Flying'], text: 'Flying: moves 2 tiles, over other units.' }),
    { id: 'firebolt', name: 'Firebolt', type: 'instant', colour: 'R', cost: 2, wants: 1, damage: 2, text: 'On the enemy turn: 2 damage to an enemy unit.' },
    { id: 'hex', name: 'Withering hex', type: 'enchant', colour: 'R', cost: 2, wants: 1, atkBonus: -2, hpBonus: 0, text: 'Enchant a unit: -2 attack.' },
    unit('carrier', 'Water carrier', 'W', 1, 1, 1, 2, { ability: { key: 'heal', label: 'Heal', amount: 1 }, text: 'Ability: heal an adjacent ally 1.' }),
    unit('cub', 'Pride cub', 'W', 1, 1, 1, 2, { keywords: ['Stand together'], text: 'Stand together: +1 attack while next to an ally.' }),
    unit('sentinel', 'Oath sentinel', 'W', 3, 1, 2, 6, { keywords: ['Guard'], text: 'Guard: adjacent allies take 1 less damage from attacks.' }),
    unit('maren', 'Saint Maren of the Long Watch', 'W', 6, 3, 4, 12, { sub: 'Velunn', ability: { key: 'healall', label: 'Heal all', amount: 2 }, text: 'Ability: heal all adjacent allies 2.' }),
    unit('clanraiders', 'Cinder Clan raiders', 'R', 2, 1, 3, 2, { keywords: ['Swift'], text: 'Swift: moves 2 tiles.' }),
    unit('berserker', 'Cinder berserker', 'R', 3, 1, 4, 3, { keywords: ['Frenzy'], text: 'Frenzy: +2 attack while damaged.' }),
    unit('captain', 'Mercenary captain', 'R', 4, 2, 4, 5, { ability: { key: 'orders', label: 'Orders' }, text: 'Ability: an adjacent ally that already moved can move again.' }),
    unit('drake', 'Ember drake', 'R', 4, 2, 4, 3, { keywords: ['Flying'], text: 'Flying: moves 2 tiles, over other units.' }),
    unit('decoy', 'Illusory decoy', 'U', 1, 1, 0, 1, { keywords: ['Decoy'], text: 'Decoy: adjacent enemies must attack this first. Removed after one hit.' }),
    unit('scholar', 'Cloistered scholar', 'U', 2, 1, 1, 2, { ability: { key: 'study', label: 'Study' }, text: 'Instead of moving or attacking: draw a card.' }),
    unit('arcanist', 'Lantern arcanist', 'U', 3, 1, 3, 3, { keywords: ['Ranged'], text: 'Ranged: attacks up to 2 tiles away.' }),
    unit('chorister', 'Brass chorister', 'U', 4, 2, 3, 7, { sub: 'Construct', ability: { key: 'push', label: 'Push' }, text: 'Ability: push an adjacent enemy 1 tile.' }),
    { id: 'displacement', name: 'Displacement', type: 'instant', colour: 'U', cost: 2, wants: 1, dodge: true, text: 'When your unit is attacked: move it 1 tile, and the attack misses.' },
    { id: 'glyph', name: 'Binding glyph', type: 'enchant', colour: 'U', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, enemyOnly: true, bind: true, text: "Enchant an enemy unit: it can't move." },
    unit('thrall', 'Gravebound thrall', 'B', 1, 1, 2, 2),
    unit('harvester', 'Bone harvester', 'B', 2, 1, 2, 3, { ability: { key: 'harvest', label: 'Harvest', amount: 3 }, text: 'Ability: destroy an adjacent ally. This unit gets +3 attack.' }),
    unit('noble', 'Ashen Court noble', 'B', 3, 1, 3, 4, { keywords: ['Drain'], text: 'Drain: heals this unit for the damage it deals.' }),
    unit('vashkar', 'Vashkar, Who Counts the Dead', 'B', 6, 3, 7, 9, { sub: 'Velunn', keywords: ['Drain'], lifeCost: 2, text: 'Drain: heals for the damage it deals. When summoned, you lose 2 life.' }),
    { id: 'raise', name: 'Raise the dead', type: 'spell', colour: 'B', cost: 3, wants: 1, raise: 3, text: 'Return a unit costing 3 or less from your discard pile to your back row.' },
    { id: 'warrant', name: 'Death warrant', type: 'enchant', colour: 'B', cost: 5, wants: 2, atkBonus: 0, hpBonus: 0, enemyOnly: true, warrant: 2, text: 'Enchant an enemy unit: destroy it at the end of your next turn.' },
    unit('sapling', 'Walking sapling', 'G', 2, 1, 1, 3, { keywords: ['Grows'], text: 'Grows: +1 attack and +2 health at the start of your turn, up to three times.' }),
    unit('saboteur', 'Thornwarden saboteur', 'G', 2, 1, 2, 3, { keywords: ['Regrow'], text: 'Regrow: recovers 1 health at the start of your turn.' }),
    unit('owl', 'Great owl', 'G', 3, 1, 2, 3, { keywords: ['Flying'], text: 'Flying: moves 2 tiles, over other units.' }),
    unit('wayfinder', 'Wayfinder druid', 'G', 3, 1, 2, 4, { extraLand: true, text: 'When summoned: you may play an extra land this turn.' }),
    unit('bull', 'Elder Herd bull', 'G', 5, 2, 6, 9, { keywords: ['Overrun'], text: 'Overrun: damage beyond what kills a target hits the enemy behind it.' }),
    { id: 'shifting', name: 'Shifting forest', type: 'instant', colour: 'G', cost: 1, wants: 1, shove: true, text: 'At the end of the enemy turn: push an enemy unit 1 tile back toward its side.' },
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
    unit('siegewalker', 'Brass siege-walker', 'U', 5, 2, 4, 5, { sub: 'Construct', keywords: ['Longshot'], text: 'Longshot: attacks up to 3 tiles away.' }),
    unit('ilvane', 'Ilvane, Who Asks Twice', 'U', 6, 3, 5, 8, { sub: 'Velunn', keywords: ['Ranged'], drawOnKill: true, text: 'Ranged: attacks up to 2 tiles away. Draw a card when this destroys a unit.' }),
    unit('rats', 'Barrow rats', 'B', 1, 1, 1, 2, { keywords: ['Hunt'], text: 'Hunt: +2 attack against a damaged unit.' }),
    unit('squire', 'Indebted squire', 'B', 1, 1, 3, 3, { lifeCost: 1, text: 'When summoned, you lose 1 life.' }),
    { id: 'hunted', name: 'Hunted', type: 'enchant', colour: 'B', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, enemyOnly: true, hunted: 1, text: 'Enchant an enemy unit: units attacking it get +1 attack.' },
    { id: 'calleddebt', name: 'Called debt', type: 'instant', colour: 'B', cost: 2, wants: 1, debt: 2, text: 'On the enemy turn: lose 2 life and destroy a damaged enemy unit.' },
    unit('envoy', 'Ashen Court envoy', 'B', 4, 2, 4, 5, { keywords: ['Drain'], text: 'Drain: heals this unit for the damage it deals.' }),
    unit('barrowpriest', 'Barrow priest', 'B', 4, 2, 2, 4, { ability: { key: 'exhume', label: 'Exhume', amount: 2 }, text: 'Ability: return a unit costing 2 or less from your discard pile to your back row.' }),
    unit('colossus', 'Barrow colossus', 'B', 5, 2, 4, 7, { keywords: ['Gathered'], text: 'Gathered: +1 attack for each unit in your discard pile, up to 4.' }),
    unit('firepot', 'Goblin firepot', 'R', 2, 1, 2, 1, { zap: 1, text: 'When summoned: 1 damage to an enemy unit.' }),
    { id: 'cinderfall', name: 'Cinderfall', type: 'spell', colour: 'R', cost: 4, wants: 2, blast: 3, splash: 1, text: '3 damage to an enemy unit, and 1 to each enemy next to it.' },
    unit('chieftain', 'Giant chieftain', 'R', 6, 3, 7, 8, { keywords: ['Frenzy'], text: 'Frenzy: +2 attack while damaged.' }),
    unit('boar', 'Thicket boar', 'G', 1, 1, 1, 3),
    unit('grovetender', 'Grove tender', 'G', 3, 1, 1, 4, { ability: { key: 'tend', label: 'Tend' }, text: 'Ability: an adjacent ally permanently gets +1 attack and +1 health.' }),
    unit('mossback', 'Mossback bear', 'G', 4, 2, 4, 6, { keywords: ['Regrow'], text: 'Regrow: recovers 1 health at the start of your turn.' }),
    unit('herdmother', 'Herd mother', 'G', 6, 3, 7, 11, { keywords: ['Overrun'], text: 'Overrun: damage beyond what kills a target hits the enemy behind it.' }),
    unit('orrowen', 'Orrowen, Who Was Here First', 'G', 7, 3, 6, 12, { sub: 'Velunn', keywords: ['Grows', 'Overrun'], text: 'Grows: +1 attack and +2 health at the start of your turn, up to three times. Overrun: damage beyond what kills a target hits the enemy behind it.' }),
    unit('follower', 'Camp follower', 'N', 1, 0, 1, 2),
    unit('scarred', 'Scarred summoner', 'N', 4, 0, 3, 5, { drawOnSummon: 1, text: 'When summoned: draw a card.' }),
    // Set 5, cards 31 to 42 in CARD_PROPOSALS.md.
    unit('fieldscholar', 'Conclave field scholar', 'U', 3, 1, 2, 3, { ability: { key: 'zap', label: 'Zap', amount: 1 }, text: 'Ability, instead of attacking: 1 damage to an enemy unit up to 2 tiles away.' }),
    unit('wardwright', 'Harmonic wardwright', 'U', 4, 2, 3, 4, { keywords: ['Ranged', 'Resonance'], text: 'Ranged. Resonance: its attacks also deal 1 damage to enemies next to the target.' }),
    { id: 'brightlance', name: 'Brightlance', type: 'spell', colour: 'U', cost: 3, wants: 1, blast: 2, knock: true, text: '2 damage to an enemy unit, then push it 1 tile back toward its side.' },
    { id: 'wovenward', name: 'Woven ward', type: 'enchant', colour: 'U', cost: 3, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, ward: 4, text: 'Enchant one of your units: it ignores the next 4 damage, then the ward is used up.' },
    { id: 'quench', name: "Enchanter's quench", type: 'enchant', colour: 'U', cost: 2, wants: 1, atkBonus: 1, hpBonus: 0, allyOnly: true, pierce: true, text: 'Enchant one of your units: +1 attack, and its attacks ignore Guard and Winter shelter.' },
    unit('rimedrake', 'Rime drake', 'U', 4, 2, 3, 4, { keywords: ['Flying', 'Freeze'], text: "Flying: moves 2 tiles, over other units. Freeze: the unit it attacks can't move on its next turn." }),
    unit('goblinscout', 'Thornwarden goblin scout', 'G', 1, 1, 1, 1, { keywords: ['Ranged'], text: 'Ranged: attacks up to 2 tiles away.' }),
    unit('alderkin', 'Bronze-harness alderkin', 'G', 4, 2, 4, 7, { sub: 'Alderkin' }),
    unit('retainer', 'Porcelain-visored retainer', 'B', 3, 1, 2, 5, { keywords: ['Guard', 'Sworn'], text: 'Guard. Sworn: permanently +1 attack when another of your units dies, up to +3.' }),
    unit('veiladept', 'Veil adept', 'B', 3, 1, 4, 2, { keywords: ['Veiled'], text: "Veiled: can't be attacked or targeted by enemy cards until it attacks." }),
    { id: 'flameblade', name: 'Banked flame blade', type: 'enchant', equipment: true, colour: 'R', cost: 2, wants: 1, atkBonus: 2, hpBonus: 0, allyOnly: true, text: 'Equip one of your units: +2 attack.' },
    unit('stoneward', 'Stoneward colossus', 'N', 6, 0, 4, 8, { keywords: ['Guard', 'Holding ground'], text: 'Guard. Holding ground: enemies that move next to it must stop.' })
  ].forEach(function (c) { CARDS[c.id] = c; });

  var DECKS = {
    white: { name: 'Oath of the Sunmane', colours: ['W'], list: [['land_w', 8], ['dawnsails', 1], ['stillflame', 1], ['carrier', 2], ['shelter', 1], ['cleric', 2], ['sentinel', 2], ['knight', 1], ['lancer', 1], ['warden', 1], ['maren', 1], ['shield', 1], ['banner', 1], ['across', 1]] },
    red: { name: 'The Warhorde', colours: ['R', 'U'], list: [['land_r', 7], ['land_u', 1], ['coalback', 1], ['clanraiders', 2], ['raider', 2], ['conjurer', 1], ['berserker', 2], ['passage', 1], ['captain', 1], ['warchief', 1], ['drake', 1], ['giant', 1], ['dragon', 1], ['firebolt', 1], ['hex', 1]] },
    blue: { name: 'The Lantern Conclave', colours: ['U', 'W'], list: [['land_u', 7], ['land_w', 1], ['decoy', 1], ['mending', 1], ['conjurer', 2], ['lampwright', 2], ['scholar', 2], ['arcanist', 3], ['chorister', 2], ['displacement', 1], ['glyph', 1], ['cleric', 1]] },
    black: { name: 'The Ashen Court', colours: ['B', 'R'], list: [['land_b', 6], ['land_r', 2], ['thrall', 3], ['harvester', 3], ['noble', 2], ['slateprowler', 1], ['vashkar', 1], ['raise', 2], ['warrant', 1], ['sellsword', 1], ['across', 1], ['firebolt', 1]] },
    green: { name: 'The Elder Herd', colours: ['G', 'R'], list: [['land_g', 6], ['land_r', 2], ['sapling', 3], ['saboteur', 3], ['owl', 2], ['wayfinder', 2], ['bull', 2], ['shifting', 1], ['youngsummoner', 1], ['giant', 1], ['raider', 1]] }
  };

  // Draft assignments, from the faction table in SETTING.md and the art briefs. A card that isn't listed has no faction.
  var FACTIONS = [
    { id: 'sunmane', name: 'The Sunmane Oath', colour: 'W', cards: ['spearman', 'cub', 'knight', 'sentinel', 'lancer', 'warden', 'shield', 'banner', 'shieldbearer', 'huntress', 'matriarch'] },
    { id: 'stillflame', name: 'The Still Flame', colour: 'W', cards: ['carrier', 'cleric', 'stillflame'] },
    { id: 'conclave', name: 'The Lantern Conclave', colour: 'U', cards: ['decoy', 'conjurer', 'scholar', 'arcanist', 'displacement', 'glyph', 'sifting', 'phantasm', 'adept', 'examiner', 'fieldscholar', 'wardwright', 'brightlance'] },
    { id: 'artificers', name: 'The Artificers', colour: 'U', cards: ['lampwright', 'chorister', 'mending', 'siegewalker', 'wovenward', 'quench'] },
    { id: 'ashen', name: 'The Ashen Court', colour: 'B', cards: ['noble', 'warrant', 'squire', 'calleddebt', 'envoy', 'retainer', 'veiladept'] },
    { id: 'gravebound', name: 'The Gravebound', colour: 'B', cards: ['thrall', 'harvester', 'raise', 'rats', 'barrowpriest', 'colossus'] },
    { id: 'warhorde', name: 'The Warhorde', colour: 'R', cards: ['goblin', 'raider', 'warchief', 'drake', 'giant', 'dragon', 'firebolt', 'hex', 'firepot', 'chieftain'] },
    { id: 'cinder', name: 'The Cinder Clans', colour: 'R', cards: ['clanraiders', 'berserker', 'captain', 'cinderfall', 'flameblade'] },
    { id: 'thornwardens', name: 'The Thornwardens', colour: 'G', cards: ['sapling', 'saboteur', 'wayfinder', 'shifting', 'grovetender', 'goblinscout'] },
    { id: 'herd', name: 'The Elder Herd', colour: 'G', cards: ['owl', 'bull', 'boar', 'mossback', 'herdmother'] }
  ];
  FACTIONS.forEach(function (f) { f.cards.forEach(function (id) { CARDS[id].faction = f.id; }); });

  // 40 is the planned size. 24 stays legal so the current starter decks still count.
  var DECK_MIN = 24, DECK_MAX = 40, MAX_COPIES = 3;
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
  function hasKw(u, k) { return CARDS[u.cardId].keywords.indexOf(k) >= 0; }
  function speed(u) { return hasKw(u, 'Swift') || hasKw(u, 'Flying') ? 2 : 1; }
  function range(u) { return hasKw(u, 'Longshot') ? 3 : hasKw(u, 'Ranged') || u.tempRange ? 2 : 1; }
  function dist(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }

  function nextToAlly(s, u) { return s.units.some(function (o) { return o !== u && o.owner === u.owner && dist(o, u) === 1; }); }

  function attackOf(s, u) {
    var a = CARDS[u.cardId].atk + u.tempAtk + (u.boost || 0) + (u.growth || 0) + (u.sworn || 0);
    u.enchants.forEach(function (e) { a += CARDS[e.c].atkBonus + (e.growth || 0); });
    if (hasKw(u, 'Stand together') && nextToAlly(s, u)) a += 1;
    if (hasKw(u, 'Frenzy') && u.hp < u.maxHp) a += 2;
    if (hasKw(u, 'Steadfast') && !(u.owner === s.active && u.walked)) a += 1;
    if (hasKw(u, 'Gathered')) a += Math.min(4, s.players[u.owner].discard.filter(function (d) { return CARDS[d.c].type === 'unit'; }).length);
    // Warband doesn't stack with itself.
    if (s.units.some(function (o) { return o !== u && o.owner === u.owner && dist(o, u) === 1 && hasKw(o, 'Warband'); })) a += 1;
    return Math.max(0, a);
  }
  // attackOf plus anything that depends on who is being hit. Hunted adds to attacks only, never to strike-backs, and doesn't stack with itself.
  function attackAgainst(s, u, t, back) {
    var hunted = !back && t.enchants.some(function (e) { return CARDS[e.c].hunted; }) ? 1 : 0;
    return attackOf(s, u) + (hasKw(u, 'Hunt') && t.hp < t.maxHp ? 2 : 0) + hunted;
  }

  // Guard takes 1 off attack and strike-back damage, and Winter shelter takes off 2 more. Neither stacks with itself.
  // pierce is true for the attacks of a unit with Enchanter's quench, which ignore both.
  function guarded(s, u, amt, pierce) {
    if (pierce) return amt;
    var safe = s.units.some(function (o) { return o !== u && o.owner === u.owner && dist(o, u) === 1 && hasKw(o, 'Guard'); });
    var cover = u.enchants.some(function (e) { return CARDS[e.c].shelter; }) ? 2 : 0;
    return Math.max(0, amt - cover - (safe ? 1 : 0));
  }

  // What an attack would actually take off a target, after Guard, Winter shelter and any instant that prevents damage.
  // back is true for a strike-back.
  function hitOn(s, a, t, prevent, back) { return guarded(s, t, Math.max(0, attackAgainst(s, a, t, back) - (prevent || 0)), !back && pierces(a)); }
  function pierces(u) { return u.enchants.some(function (e) { return CARDS[e.c].pierce; }); }

  // Soft coloured mana: each land short of what the card wants adds 1 to its cost.
  function costOf(s, p, c) {
    var have = s.players[p].lands.filter(function (l) { return l.colour === c.colour; }).length;
    return c.cost + Math.max(0, c.wants - have);
  }

  function newGame(opts) {
    var s = {
      seed: (opts.seed === undefined ? 1 : opts.seed) | 0, turn: 0, active: opts.first || 0, phase: 'play',
      winner: null, pending: null, nextId: 1, units: [], log: [], logMarked: true, fx: [],
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
  function mkPlayer(d) { return { deckKey: typeof d === 'string' ? d : null, name: deckOf(d).name, colour: (deckOf(d).colours || deckColours(deckOf(d).list))[0] || 'N', deck: [], hand: [], discard: [], lands: [], mana: 0, life: START_LIFE, landDropped: false, extraLands: 0, redraws: 0, toBottom: 0, bonusMana: 0, kept: false }; }

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
    p.extraLands = 0;
    s.units.forEach(function (u) {
      if (u.owner !== s.active) return;
      u.moved = false; u.acted = false; u.walked = false;
      if (hasKw(u, 'Grows') && (u.growth || 0) < 3) {
        u.growth = (u.growth || 0) + 1; u.maxHp += 2; u.hp += 2;
        s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+2', good: true });
      }
      if (hasKw(u, 'Regrow') && u.hp < u.maxHp) heal(s, u, 1);
      u.enchants.forEach(function (e) {
        if (CARDS[e.c].regrow && u.hp < u.maxHp) heal(s, u, CARDS[e.c].regrow);
        if (CARDS[e.c].grows && (e.growth || 0) < 3) {
          e.growth = (e.growth || 0) + 1; u.maxHp += 2; u.hp += 2;
          s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+2', good: true });
        }
      });
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
  // Bound by a glyph, held this turn by a Conclave examiner, or frozen this turn by a Rime drake.
  function stuck(s, u) { return bound(u) || u.held === s.turn || u.frozen === s.turn; }
  // Holding ground: a tile next to an enemy that has it ends the move, so nothing passes through it, fliers included.
  function reachable(s, u) {
    if (stuck(s, u)) return [];
    var seen = {}, out = [], frontier = [{ r: u.r, c: u.c }], fly = hasKw(u, 'Flying');
    var holders = s.units.filter(function (o) { return o.owner !== u.owner && hasKw(o, 'Holding ground'); });
    var held = function (r, c) { return holders.some(function (h) { return Math.abs(h.r - r) + Math.abs(h.c - c) === 1; }); };
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
  function heal(s, u, amt) {
    var healed = Math.min(amt, u.maxHp - u.hp);
    u.hp += healed;
    if (healed > 0) s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+' + healed, good: true });
    return healed;
  }

  function responses(s, kind, attack) {
    var pi = 1 - s.active, p = s.players[pi], out = [], seen = {};
    p.hand.forEach(function (i) {
      var c = card(i);
      if (c.type !== 'instant' || costOf(s, pi, c) > p.mana) return;
      if (c.prevent) {
        if (kind !== 'attack' || !attack) return;
        [attack.targetUid, attack.secondaryUid].forEach(function (uid) {
          var key = i.c + ':' + uid;
          if (uid && !seen[key] && unitById(s, uid)) { seen[key] = 1; out.push({ type: 'respond', card: i.id, target: uid }); }
        });
      } else if (c.damage) {
        s.units.forEach(function (u) {
          var key = i.c + ':' + u.uid;
          if (u.owner === s.active && !u.veiled && !seen[key]) { seen[key] = 1; out.push({ type: 'respond', card: i.id, target: u.uid }); }
        });
      } else if (c.debt) {
        if (p.life <= c.debt) return;
        s.units.forEach(function (u) {
          var key = i.c + ':' + u.uid;
          if (u.owner === s.active && !u.veiled && u.hp < u.maxHp && !seen[key]) { seen[key] = 1; out.push({ type: 'respond', card: i.id, target: u.uid }); }
        });
      } else if (c.dodge) {
        if (kind !== 'attack' || !attack) return;
        [attack.targetUid, attack.secondaryUid].forEach(function (uid) {
          var dodger = uid ? unitById(s, uid) : null;
          if (!dodger) return;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var r = dodger.r + d[0], col = dodger.c + d[1], key = i.c + ':' + uid + ':' + r + ',' + col;
            if (emptyTile(s, r, col) && !seen[key]) { seen[key] = 1; out.push({ type: 'respond', card: i.id, target: uid, r: r, c: col }); }
          });
        });
      } else if (c.shove && kind === 'end') {
        s.units.forEach(function (u) {
          var key = i.c + ':' + u.uid;
          if (u.owner === s.active && !u.veiled && emptyTile(s, shoveRow(u), u.c) && !seen[key]) { seen[key] = 1; out.push({ type: 'respond', card: i.id, target: u.uid }); }
        });
      }
    });
    return out;
  }

  // dedupe lists one copy of each identical card, which keeps the list short for players that aren't clicking a specific copy.
  function legalMoves(s, opts) {
    var dedupe = opts && opts.dedupe, out = [];
    if (s.winner !== null) return out;
    if (s.pending) {
      out = responses(s, s.pending.kind, s.pending.attack);
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
        if (c.type !== 'land' && costOf(s, pi, c) <= p.mana) {
          if (c.type === 'unit') {
            var foes = c.zap ? s.units.filter(function (e) { return e.owner !== pi && !e.veiled; }) : [];
            for (var col = 0; col < COLS; col++) {
              if (unitAt(s, backRow(pi), col)) continue;
              if (!foes.length) out.push({ type: 'summon', card: i.id, r: backRow(pi), c: col });
              foes.forEach(function (e) { out.push({ type: 'summon', card: i.id, r: backRow(pi), c: col, target: e.uid }); });
            }
          } else if (c.type === 'enchant') {
            s.units.forEach(function (u) { if ((!c.enemyOnly || u.owner !== pi) && (!c.allyOnly || u.owner === pi) && open(pi, u)) out.push({ type: 'enchant', card: i.id, target: u.uid }); });
          } else if (c.draw || c.extraLand || c.sift) {
            out.push({ type: 'cast', card: i.id });
          } else if (c.raise) {
            if (backTile(s, pi) !== null) p.discard.forEach(function (d) {
              var dc = CARDS[d.c];
              if (dc.type === 'unit' && dc.cost <= c.raise) out.push({ type: 'cast', card: i.id, raise: d.id });
            });
          } else if (c.cleanse) {
            s.units.forEach(function (a) { if (a.enchants.length && open(pi, a)) out.push({ type: 'cast', card: i.id, target: a.uid }); });
          } else if (c.mend) {
            s.units.forEach(function (a) { if (a.owner === pi && a.hp < a.maxHp) out.push({ type: 'cast', card: i.id, target: a.uid }); });
          } else if (c.blast) {
            s.units.forEach(function (e) { if (e.owner !== pi && !e.veiled) out.push({ type: 'cast', card: i.id, target: e.uid }); });
          } else if (c.fortify) {
            if (s.units.some(function (a) { return a.owner === pi; })) out.push({ type: 'cast', card: i.id });
          } else if (c.passage) {
            s.units.forEach(function (a) {
              if (a.owner !== pi || stuck(s, a)) return;
              for (var pr = 0; pr < ROWS; pr++) for (var pc = 0; pc < COLS; pc++) if (emptyTile(s, pr, pc)) out.push({ type: 'cast', card: i.id, target: a.uid, r: pr, c: pc });
            });
          }
        }
      });
      out.push({ type: 'toCommand' });
      return out;
    }
    s.units.forEach(function (u) {
      if (u.owner !== pi || u.summonedTurn === s.turn || u.acted) return;
      var held = u.held === s.turn;
      if (!u.moved) reachable(s, u).forEach(function (t) { out.push({ type: 'move', unit: u.uid, r: t.r, c: t.c }); });
      // An adjacent decoy has to be dealt with before anything else can be attacked.
      var pinned = s.units.some(function (e) { return e.owner !== pi && dist(u, e) === 1 && hasKw(e, 'Decoy'); });
      var mayHit = function (e) { return !pinned || (dist(u, e) === 1 && hasKw(e, 'Decoy')); };
      var strength = u.noAttack || held ? 0 : attackOf(s, u);
      if (strength > 0) {
        s.units.forEach(function (e) {
          if (e.owner !== pi && !e.veiled && dist(u, e) <= range(u) && mayHit(e)) out.push({ type: 'attack', unit: u.uid, target: e.uid });
        });
        if (u.r === backRow(1 - pi) && !pinned) out.push({ type: 'attackSummoner', unit: u.uid });
      }
      var ab = CARDS[u.cardId].ability;
      if (!ab) return;
      if (ab.key === 'heal') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1 && a.hp < a.maxHp) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
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
        if (s.units.some(function (a) { return a.owner === pi && a !== u && dist(u, a) === 1 && a.hp < a.maxHp; })) out.push({ type: 'ability', unit: u.uid });
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
      }
    });
    out.push({ type: 'endTurn' });
    return out;
  }

  // Raised units land on the free back-row tile nearest the centre.
  function backTile(s, pi) {
    var best = null;
    for (var col = 0; col < COLS; col++) if (!unitAt(s, backRow(pi), col) && (best === null || Math.abs(col - 2) < Math.abs(best - 2))) best = col;
    return best;
  }
  function newUnit(s, inst, id, pi, r, c) {
    var d = CARDS[id];
    return { uid: s.nextId++, inst: inst, cardId: id, owner: pi, r: r, c: c, hp: d.hp, maxHp: d.hp, tempAtk: 0, boost: 0, growth: 0, enchants: [], moved: false, acted: false, summonedTurn: s.turn, veiled: d.keywords.indexOf('Veiled') >= 0 };
  }

  function takeFromHand(p, id) {
    for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === id) return p.hand.splice(i, 1)[0];
    throw new Error('Card not in hand: ' + id);
  }

  function kill(s, u) {
    s.units.splice(s.units.indexOf(u), 1);
    s.players[u.owner].discard.push({ id: u.inst, c: u.cardId });
    u.enchants.forEach(function (e) { s.players[e.owner].discard.push({ id: e.id, c: e.c }); });
    say(s, CARDS[u.cardId].name + ' is destroyed.');
    // Sworn counts every other unit of yours that is destroyed, however it happens.
    s.units.forEach(function (o) {
      if (o.owner !== u.owner || !hasKw(o, 'Sworn') || (o.sworn || 0) >= 3) return;
      o.sworn = (o.sworn || 0) + 1;
      s.fx.push({ uid: o.uid, r: o.r, c: o.c, text: '+1', good: true });
      say(s, CARDS[o.cardId].name + ' gets +1 attack.');
    });
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
    if (att.missed) { say(s, name + ' misses.'); return; }
    var amt = attackOf(s, a);
    if (att.summoner !== undefined) {
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
    // Resonance works exactly like Stomp.
    var splash = hasKw(a, 'Stomp') ? ' stomps ' : hasKw(a, 'Resonance') ? "'s resonance hits " : null;
    if (t && splash) s.units.forEach(function (o) {
      if (o === t || o.owner === a.owner || dist(o, t) !== 1) return;
      var hit = damage(s, o, guarded(s, o, 1, pierces(a)));
      say(s, name + splash + CARDS[o.cardId].name + ' for ' + hit + '.');
      stomped.push(o);
    });
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
    s.units.forEach(function (u) { u.tempAtk = 0; u.tempRange = false; u.noAttack = false; });
    s.units.filter(function (u) { return u.enchants.some(function (e) { return e.expires === s.turn; }); }).forEach(function (u) {
      say(s, 'The warrant on ' + CARDS[u.cardId].name + ' comes due.');
      kill(s, u);
    });
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
        p.deck.unshift(takeFromHand(p, m.card));
        p.toBottom -= 1;
        if (!p.toBottom && s.phase === 'opening') finishOpening(s);
        break;
      case 'summon':
        i = takeFromHand(p, m.card); c = card(i);
        p.mana -= costOf(s, pi, c);
        s.units.push(newUnit(s, i.id, i.c, pi, m.r, m.c));
        say(s, mark(s, p) + ' summons ' + c.name + '.');
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
        p.mana -= costOf(s, pi, c);
        var ench = { id: i.id, c: i.c, owner: pi };
        if (c.warrant) ench.expires = s.turn + c.warrant;
        if (c.ward) ench.left = c.ward;
        u.enchants.push(ench);
        u.maxHp += c.hpBonus; u.hp += c.hpBonus;
        say(s, mark(s, p) + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + '.');
        break;
      case 'cast':
        i = takeFromHand(p, m.card); c = card(i);
        p.mana -= costOf(s, pi, c);
        p.discard.push(i);
        if (c.draw) {
          for (var dn = 0; dn < c.draw; dn++) draw(s, pi);
          say(s, mark(s, p) + ' casts ' + c.name + ' and draws ' + c.draw + ' cards.');
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
          var burnt = [u];
          say(s, mark(s, p) + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + ' for ' + damage(s, u, c.blast) + '.');
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
          // Health the enchantments granted goes with them, and damage already taken stays.
          u.enchants.forEach(function (e) {
            u.maxHp -= CARDS[e.c].hpBonus + (e.growth || 0) * 2;
            s.players[e.owner].discard.push({ id: e.id, c: e.c });
          });
          u.enchants = [];
          u.hp = Math.min(u.hp, u.maxHp);
          say(s, mark(s, p) + ' casts ' + c.name + ' and clears the enchantments from ' + CARDS[u.cardId].name + '.');
        }
        if (c.mend) {
          u = unitById(s, m.target);
          say(s, mark(s, p) + ' casts ' + c.name + ' and heals ' + CARDS[u.cardId].name + ' for ' + heal(s, u, c.mend) + '.');
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
        u.r = m.r; u.c = m.c; u.moved = true; u.walked = true;
        say(s, CARDS[u.cardId].name + ' moves.');
        break;
      case 'attack':
        u = unitById(s, m.unit); u.acted = true; u.veiled = false;
        beginAttack(s, { attacker: u.uid, targetUid: m.target });
        break;
      case 'attackSummoner':
        u = unitById(s, m.unit); u.acted = true; u.veiled = false;
        beginAttack(s, { attacker: u.uid, summoner: 1 - pi });
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
        }
        break;
      case 'respond':
        var rp = s.players[1 - pi];
        i = takeFromHand(rp, m.card); c = card(i);
        rp.mana -= costOf(s, 1 - pi, c);
        rp.discard.push(i);
        var target = unitById(s, m.target);
        say(s, mark(s, rp) + ' responds with ' + c.name + ' on ' + CARDS[target.cardId].name + '.');
        var pend = s.pending;
        s.pending = null;
        if (c.prevent) { pend.attack.shield = target.uid; pend.attack.prevent = c.prevent; }
        // Dodging the lance's second target clears only that hit. Dodging the main target misses the whole attack.
        if (c.dodge) {
          target.r = m.r; target.c = m.c;
          if (pend.attack.secondaryUid === target.uid) pend.attack.secondaryUid = null;
          else pend.attack.missed = true;
        }
        if (c.shove) target.r = shoveRow(target);
        if (c.damage) {
          damage(s, target, c.damage);
          if (target.hp <= 0) kill(s, target);
        }
        if (c.debt) {
          rp.life -= c.debt;
          s.fx.push({ summoner: 1 - pi, text: '-' + c.debt });
          say(s, mark(s, rp) + ' pays ' + c.debt + ' life.');
          kill(s, target);
        }
        if (pend.kind === 'attack') resolveAttack(s, pend.attack);
        else finishTurn(s);
        break;
      case 'pass':
        var pd = s.pending;
        s.pending = null;
        if (pd.kind === 'attack') resolveAttack(s, pd.attack);
        else finishTurn(s);
        break;
      case 'endTurn':
        if (responses(s, 'end').length) s.pending = { kind: 'end', responder: 1 - pi };
        else finishTurn(s);
        break;
      default:
        throw new Error('Unknown move: ' + m.type);
    }
    return s;
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
      p.deck = [];
      if (idx !== pi) p.hand = [];
    });
    return v;
  }

  return {
    ROWS: ROWS, COLS: COLS, START_LIFE: START_LIFE, CARDS: CARDS, DECKS: DECKS, FACTIONS: FACTIONS, viewFor: viewFor,
    DECK_MIN: DECK_MIN, DECK_MAX: DECK_MAX, maxCopies: maxCopies, deckSize: deckSize, deckProblems: deckProblems, deckColours: deckColours,
    newGame: newGame, legalMoves: legalMoves, applyMove: applyMove,
    attackOf: attackOf, attackAgainst: attackAgainst, hitOn: hitOn, costOf: costOf, backRow: backRow, range: range, speed: speed, hasKw: hasKw
  };
})();
if (typeof module !== 'undefined') module.exports = Engine;
