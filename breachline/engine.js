// Rules engine. Pure state in, state out, with no DOM, so the UI, the scripted
// bot and a future model-driven player all go through legalMoves and applyMove.
var Engine = (function () {
  var ROWS = 4, COLS = 5, START_LIFE = 150, OPENING_HAND = 5, MAX_REDRAWS = 2, TURN_LIMIT = 60;

  function land(id, colour, name) { return { id: id, name: name, type: 'land', colour: colour, cost: 0, wants: 0 }; }
  function unit(id, name, colour, cost, wants, atk, hp, extra) {
    var c = { id: id, name: name, type: 'unit', colour: colour, cost: cost, wants: wants, atk: atk, hp: hp, keywords: [], ability: null, text: '' };
    for (var k in (extra || {})) c[k] = extra[k];
    return c;
  }

  var CARDS = {};
  [
    land('land_w', 'W', 'Sunlit plains'), land('land_r', 'R', 'Cinder peaks'), land('land_u', 'U', 'Lantern quarter'), land('land_b', 'B', 'Ashen barrows'), land('land_g', 'G', 'Overgrown ruin'),
    unit('spearman', 'Militia spearman', 'W', 1, 1, 20, 25),
    unit('cleric', 'Temple cleric', 'W', 2, 1, 15, 40, { ability: { key: 'heal', label: 'Heal', amount: 25 }, text: 'Ability: heal an adjacent ally 25.' }),
    unit('knight', 'Oath knight', 'W', 3, 1, 30, 50),
    unit('lancer', 'Sunmane lancer', 'W', 4, 2, 45, 65, { keywords: ['Swift'], ability: { key: 'lance', label: 'Lance through' }, text: 'Swift. Ability: hit an adjacent enemy and the enemy directly behind it.' }),
    unit('warden', 'Pride warden', 'W', 6, 3, 60, 95, { ability: { key: 'rally', label: 'Rally', amount: 10 }, text: 'Ability: adjacent allies get +10 attack this turn.' }),
    { id: 'shield', name: 'Shield of dawn', type: 'instant', colour: 'W', cost: 1, wants: 1, prevent: 25, text: 'When your unit is attacked: prevent 25 of that damage.' },
    { id: 'banner', name: 'Blessed banner', type: 'enchant', colour: 'W', cost: 2, wants: 1, atkBonus: 10, hpBonus: 15, text: 'Enchant a unit: +10 attack and +15 health.' },
    unit('goblin', 'Goblin cutter', 'R', 1, 1, 25, 15),
    unit('raider', 'Orc raider', 'R', 2, 1, 35, 30),
    unit('conjurer', 'Street conjurer', 'U', 2, 1, 25, 30, { keywords: ['Ranged'], text: 'Ranged: attacks up to 2 tiles away.' }),
    unit('sellsword', 'Sellsword', 'R', 3, 1, 35, 45),
    unit('warchief', 'Orc warchief', 'R', 4, 2, 55, 50),
    unit('giant', 'Hill giant', 'R', 5, 2, 50, 85),
    unit('dragon', 'Elder dragon', 'R', 7, 3, 85, 100, { keywords: ['Flying'], text: 'Flying: moves 2 tiles, over other units.' }),
    { id: 'firebolt', name: 'Firebolt', type: 'instant', colour: 'R', cost: 2, wants: 1, damage: 25, text: 'On the enemy turn: 25 damage to an enemy unit.' },
    { id: 'hex', name: 'Withering hex', type: 'enchant', colour: 'R', cost: 2, wants: 1, atkBonus: -15, hpBonus: 0, text: 'Enchant a unit: -15 attack.' },
    unit('carrier', 'Water carrier', 'W', 1, 1, 10, 25, { ability: { key: 'heal', label: 'Heal', amount: 10 }, text: 'Ability: heal an adjacent ally 10.' }),
    unit('cub', 'Pride cub', 'W', 1, 1, 15, 20, { keywords: ['Stand together'], text: 'Stand together: +10 attack while next to an ally.' }),
    unit('sentinel', 'Oath sentinel', 'W', 3, 1, 25, 60, { keywords: ['Guard'], text: 'Guard: adjacent allies take 10 less damage from attacks.' }),
    unit('maren', 'Saint Maren of the Long Watch', 'W', 6, 3, 50, 110, { sub: 'Velunn', ability: { key: 'healall', label: 'Heal all', amount: 20 }, text: 'Ability: heal all adjacent allies 20.' }),
    unit('clanraiders', 'Cinder Clan raiders', 'R', 2, 1, 30, 25, { keywords: ['Swift'], text: 'Swift: moves 2 tiles.' }),
    unit('berserker', 'Cinder berserker', 'R', 3, 1, 40, 30, { keywords: ['Frenzy'], text: 'Frenzy: +15 attack while damaged.' }),
    unit('captain', 'Mercenary captain', 'R', 4, 2, 40, 55, { ability: { key: 'orders', label: 'Orders' }, text: 'Ability: an adjacent ally that already moved can move again.' }),
    unit('drake', 'Ember drake', 'R', 4, 2, 35, 30, { keywords: ['Flying'], text: 'Flying: moves 2 tiles, over other units.' }),
    unit('decoy', 'Illusory decoy', 'U', 1, 1, 0, 15, { keywords: ['Decoy'], text: 'Decoy: adjacent enemies must attack this first. Removed after one hit.' }),
    unit('scholar', 'Cloistered scholar', 'U', 2, 1, 10, 30, { ability: { key: 'study', label: 'Study' }, text: 'Instead of moving or attacking: draw a card.' }),
    unit('arcanist', 'Lantern arcanist', 'U', 3, 1, 30, 35, { keywords: ['Ranged'], text: 'Ranged: attacks up to 2 tiles away.' }),
    unit('chorister', 'Brass chorister', 'U', 4, 2, 35, 70, { sub: 'Construct', ability: { key: 'push', label: 'Push' }, text: 'Ability: push an adjacent enemy 1 tile.' }),
    { id: 'displacement', name: 'Displacement', type: 'instant', colour: 'U', cost: 2, wants: 1, dodge: true, text: 'When your unit is attacked: move it 1 tile, and the attack misses.' },
    { id: 'glyph', name: 'Binding glyph', type: 'enchant', colour: 'U', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, enemyOnly: true, bind: true, text: "Enchant an enemy unit: it can't move." },
    unit('thrall', 'Gravebound thrall', 'B', 1, 1, 30, 20),
    unit('harvester', 'Bone harvester', 'B', 2, 1, 25, 35, { ability: { key: 'harvest', label: 'Harvest', amount: 25 }, text: 'Ability: destroy an adjacent ally. This unit gets +25 attack.' }),
    unit('noble', 'Ashen Court noble', 'B', 3, 1, 30, 55, { keywords: ['Drain'], text: 'Drain: heals this unit for the damage it deals.' }),
    unit('vashkar', 'Vashkar, Who Counts the Dead', 'B', 6, 3, 70, 85, { sub: 'Velunn', keywords: ['Drain'], lifeCost: 15, text: 'Drain: heals for the damage it deals. When summoned, you lose 15 life.' }),
    { id: 'raise', name: 'Raise the dead', type: 'spell', colour: 'B', cost: 3, wants: 1, raise: 3, text: 'Return a unit costing 3 or less from your discard pile to your back row.' },
    { id: 'warrant', name: 'Death warrant', type: 'enchant', colour: 'B', cost: 5, wants: 2, atkBonus: 0, hpBonus: 0, enemyOnly: true, warrant: 2, text: 'Enchant an enemy unit: destroy it at the end of your next turn.' },
    unit('sapling', 'Walking sapling', 'G', 2, 1, 10, 40, { keywords: ['Grows'], text: 'Grows: +10 attack and +15 health at the start of your turn, up to three times.' }),
    unit('saboteur', 'Thornwarden saboteur', 'G', 2, 1, 30, 35, { keywords: ['Regrow'], text: 'Regrow: recovers 10 health at the start of your turn.' }),
    unit('owl', 'Great owl', 'G', 3, 1, 25, 30, { keywords: ['Flying'], text: 'Flying: moves 2 tiles, over other units.' }),
    unit('wayfinder', 'Wayfinder druid', 'G', 3, 1, 20, 45, { extraLand: true, text: 'When summoned: you may play an extra land this turn.' }),
    unit('bull', 'Elder Herd bull', 'G', 5, 2, 60, 95, { keywords: ['Overrun'], text: 'Overrun: damage beyond what kills a target hits the enemy behind it.' }),
    { id: 'shifting', name: 'Shifting forest', type: 'instant', colour: 'G', cost: 1, wants: 1, shove: true, text: 'At the end of the enemy turn: push an enemy unit 1 tile back toward its side.' },
    unit('youngsummoner', 'Young summoner', 'N', 2, 0, 20, 30),
    { id: 'stillflame', name: 'The Still Flame', type: 'enchant', colour: 'W', cost: 2, wants: 1, atkBonus: 0, hpBonus: 0, allyOnly: true, regrow: 15, text: 'Enchant one of your units: it recovers 15 health at the start of your turn.' },
    unit('lampwright', 'Ambrel lampwright', 'U', 3, 1, 20, 40, { ability: { key: 'lens', label: 'Lens' }, text: 'Ability: an adjacent ally can attack up to 2 tiles away this turn.' }),
    { id: 'across', name: 'Across the silence', type: 'spell', colour: 'N', cost: 4, wants: 0, draw: 2, text: 'Draw two cards.' }
  ].forEach(function (c) { CARDS[c.id] = c; });

  var DECKS = {
    white: { name: 'Oath of the Sunmane', colours: ['W'], list: [['land_w', 11], ['spearman', 1], ['stillflame', 1], ['carrier', 1], ['cub', 1], ['cleric', 1], ['sentinel', 1], ['knight', 1], ['lancer', 1], ['warden', 1], ['maren', 1], ['shield', 1], ['banner', 1], ['across', 1]] },
    red: { name: 'The Warhorde', colours: ['R', 'U'], list: [['land_r', 9], ['land_u', 2], ['goblin', 1], ['clanraiders', 1], ['raider', 1], ['conjurer', 1], ['berserker', 1], ['sellsword', 1], ['captain', 1], ['warchief', 1], ['drake', 1], ['giant', 1], ['dragon', 1], ['firebolt', 1], ['hex', 1]] },
    blue: { name: 'The Lantern Conclave', colours: ['U', 'W'], list: [['land_u', 9], ['land_w', 2], ['decoy', 2], ['conjurer', 1], ['lampwright', 1], ['scholar', 2], ['arcanist', 2], ['chorister', 2], ['displacement', 1], ['glyph', 1], ['cleric', 1]] },
    black: { name: 'The Ashen Court', colours: ['B', 'R'], list: [['land_b', 9], ['land_r', 2], ['thrall', 2], ['harvester', 2], ['noble', 3], ['vashkar', 1], ['raise', 1], ['warrant', 1], ['sellsword', 1], ['across', 1], ['firebolt', 1]] },
    green: { name: 'The Elder Herd', colours: ['G', 'R'], list: [['land_g', 9], ['land_r', 2], ['sapling', 2], ['saboteur', 2], ['owl', 1], ['wayfinder', 2], ['bull', 2], ['shifting', 1], ['youngsummoner', 1], ['giant', 1], ['raider', 1]] }
  };

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
  function range(u) { return hasKw(u, 'Ranged') || u.tempRange ? 2 : 1; }
  function dist(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }

  function nextToAlly(s, u) { return s.units.some(function (o) { return o !== u && o.owner === u.owner && dist(o, u) === 1; }); }

  function attackOf(s, u) {
    var a = CARDS[u.cardId].atk + u.tempAtk + (u.boost || 0) + (u.growth || 0) * 10;
    u.enchants.forEach(function (e) { a += CARDS[e.c].atkBonus; });
    if (hasKw(u, 'Stand together') && nextToAlly(s, u)) a += 10;
    if (hasKw(u, 'Frenzy') && u.hp < u.maxHp) a += 15;
    return Math.max(0, a);
  }

  // Guard takes 10 off attack and strike-back damage. Several guards don't stack.
  function guarded(s, u, amt) {
    var safe = s.units.some(function (o) { return o !== u && o.owner === u.owner && dist(o, u) === 1 && hasKw(o, 'Guard'); });
    return safe ? Math.max(0, amt - 10) : amt;
  }

  // Soft coloured mana: each land short of what the card wants adds 1 to its cost.
  function costOf(s, p, c) {
    var have = s.players[p].lands.filter(function (l) { return l.colour === c.colour; }).length;
    return c.cost + Math.max(0, c.wants - have);
  }

  function newGame(opts) {
    var s = {
      seed: (opts.seed === undefined ? 1 : opts.seed) | 0, turn: 0, active: opts.first || 0, phase: 'play',
      winner: null, pending: null, nextId: 1, units: [], log: [], fx: [],
      players: [mkPlayer(opts.decks[0]), mkPlayer(opts.decks[1])]
    };
    s.players.forEach(function (p, idx) {
      DECKS[p.deckKey].list.forEach(function (e) {
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
  function mkPlayer(key) { return { deckKey: key, name: DECKS[key].name, deck: [], hand: [], discard: [], lands: [], mana: 0, life: START_LIFE, landDropped: false, extraLands: 0, redraws: 0, toBottom: 0, kept: false }; }

  function say(s, text) { s.log.push({ turn: s.turn, text: text }); }

  // Each player keeps or redraws in turn, first player first, then turn 1 begins.
  function finishOpening(s) {
    var p = s.players[s.active];
    p.kept = true;
    say(s, p.name + ' keeps ' + p.hand.length + ' cards.');
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
    p.mana = p.lands.length;
    p.landDropped = false;
    p.extraLands = 0;
    s.units.forEach(function (u) {
      if (u.owner !== s.active) return;
      u.moved = false; u.acted = false;
      if (hasKw(u, 'Grows') && (u.growth || 0) < 3) {
        u.growth = (u.growth || 0) + 1; u.maxHp += 15; u.hp += 15;
        s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '+15', good: true });
      }
      if (hasKw(u, 'Regrow') && u.hp < u.maxHp) heal(s, u, 10);
      u.enchants.forEach(function (e) { if (CARDS[e.c].regrow && u.hp < u.maxHp) heal(s, u, CARDS[e.c].regrow); });
    });
    if (s.turn > 1) draw(s, s.active);
  }

  function draw(s, pi) {
    var p = s.players[pi];
    if (!p.deck.length && p.discard.length) {
      p.deck = p.discard; p.discard = [];
      shuffle(s, p.deck);
      say(s, p.name + ' reshuffled their discards.');
    }
    if (p.deck.length) p.hand.push(p.deck.pop());
  }

  function reachable(s, u) {
    if (u.enchants.some(function (e) { return CARDS[e.c].bind; })) return [];
    var seen = {}, out = [], frontier = [{ r: u.r, c: u.c }], fly = hasKw(u, 'Flying');
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
          next.push({ r: r, c: c });
          if (!occ) out.push({ r: r, c: c });
        });
      });
      frontier = next;
    }
    return out;
  }

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
          if (u.owner === s.active && !seen[key]) { seen[key] = 1; out.push({ type: 'respond', card: i.id, target: u.uid }); }
        });
      } else if (c.dodge) {
        var dodger = kind === 'attack' && attack && attack.targetUid ? unitById(s, attack.targetUid) : null;
        if (!dodger) return;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var r = dodger.r + d[0], col = dodger.c + d[1], key = i.c + ':' + r + ',' + col;
          if (emptyTile(s, r, col) && !seen[key]) { seen[key] = 1; out.push({ type: 'respond', card: i.id, target: dodger.uid, r: r, c: col }); }
        });
      } else if (c.shove && kind === 'end') {
        s.units.forEach(function (u) {
          var key = i.c + ':' + u.uid;
          if (u.owner === s.active && emptyTile(s, shoveRow(u), u.c) && !seen[key]) { seen[key] = 1; out.push({ type: 'respond', card: i.id, target: u.uid }); }
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
    if (s.phase === 'opening') {
      if (p.toBottom) return p.hand.map(function (i) { return { type: 'bottomCard', card: i.id }; });
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
            for (var col = 0; col < COLS; col++) if (!unitAt(s, backRow(pi), col)) out.push({ type: 'summon', card: i.id, r: backRow(pi), c: col });
          } else if (c.type === 'enchant') {
            s.units.forEach(function (u) { if ((!c.enemyOnly || u.owner !== pi) && (!c.allyOnly || u.owner === pi)) out.push({ type: 'enchant', card: i.id, target: u.uid }); });
          } else if (c.draw) {
            out.push({ type: 'cast', card: i.id });
          } else if (c.type === 'spell' && backTile(s, pi) !== null) {
            p.discard.forEach(function (d) {
              var dc = CARDS[d.c];
              if (dc.type === 'unit' && dc.cost <= c.raise) out.push({ type: 'cast', card: i.id, raise: d.id });
            });
          }
        }
      });
      out.push({ type: 'toCommand' });
      return out;
    }
    s.units.forEach(function (u) {
      if (u.owner !== pi || u.summonedTurn === s.turn || u.acted) return;
      if (!u.moved) reachable(s, u).forEach(function (t) { out.push({ type: 'move', unit: u.uid, r: t.r, c: t.c }); });
      // An adjacent decoy has to be dealt with before anything else can be attacked.
      var pinned = s.units.some(function (e) { return e.owner !== pi && dist(u, e) === 1 && hasKw(e, 'Decoy'); });
      var mayHit = function (e) { return !pinned || (dist(u, e) === 1 && hasKw(e, 'Decoy')); };
      var strength = attackOf(s, u);
      if (strength > 0) {
        s.units.forEach(function (e) {
          if (e.owner !== pi && dist(u, e) <= range(u) && mayHit(e)) out.push({ type: 'attack', unit: u.uid, target: e.uid });
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
        s.units.forEach(function (e) {
          if (e.owner !== pi && dist(u, e) === 1 && mayHit(e)) {
            var b = unitAt(s, e.r + (e.r - u.r), e.c + (e.c - u.c));
            if (b && b.owner !== pi) out.push({ type: 'ability', unit: u.uid, target: e.uid });
          }
        });
      } else if (ab.key === 'lens') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1 && !a.acted && !a.tempRange && range(a) === 1) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'healall') {
        if (s.units.some(function (a) { return a.owner === pi && a !== u && dist(u, a) === 1 && a.hp < a.maxHp; })) out.push({ type: 'ability', unit: u.uid });
      } else if (ab.key === 'orders') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1 && a.moved && !a.acted && reachable(s, a).length) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'study') {
        if (!u.moved) out.push({ type: 'ability', unit: u.uid });
      } else if (ab.key === 'push') {
        s.units.forEach(function (e) { if (e.owner !== pi && dist(u, e) === 1 && emptyTile(s, e.r + (e.r - u.r), e.c + (e.c - u.c))) out.push({ type: 'ability', unit: u.uid, target: e.uid }); });
      } else if (ab.key === 'harvest') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
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
    return { uid: s.nextId++, inst: inst, cardId: id, owner: pi, r: r, c: c, hp: d.hp, maxHp: d.hp, tempAtk: 0, boost: 0, growth: 0, enchants: [], moved: false, acted: false, summonedTurn: s.turn };
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
  }

  function damage(s, u, amt) {
    u.hp -= amt;
    s.fx.push({ uid: u.uid, r: u.r, c: u.c, text: '-' + amt });
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
      say(s, name + ' hits ' + def.name + ' for ' + amt + '.');
      drain(s, a, amt);
      if (def.life <= 0) { def.life = 0; s.winner = a.owner; say(s, s.players[a.owner].name + ' wins.'); }
      return;
    }
    var t = unitById(s, att.targetUid), b = att.secondaryUid ? unitById(s, att.secondaryUid) : null, over = null;
    function strike(u, verb) {
      var hit = guarded(s, u, Math.max(0, amt - (att.shield === u.uid ? att.prevent : 0))), before = u.hp;
      damage(s, u, hit);
      say(s, verb + CARDS[u.cardId].name + ' for ' + hit + '.');
      drain(s, a, Math.min(hit, before));
      if (hasKw(u, 'Decoy')) { u.hp = 0; say(s, 'The decoy vanishes.'); }
    }
    if (t) {
      strike(t, name + ' hits ');
      if (t.hp < 0 && hasKw(a, 'Overrun')) {
        over = unitAt(s, t.r + (t.r - a.r), t.c + (t.c - a.c));
        if (over && over.owner !== a.owner) {
          var excess = guarded(s, over, -t.hp);
          damage(s, over, excess);
          say(s, name + ' overruns ' + CARDS[over.cardId].name + ' for ' + excess + '.');
          drain(s, a, excess);
        } else over = null;
      }
    }
    if (b) strike(b, 'The lance also hits ');
    // Only a survivor strikes back, and only if the attacker is within its range.
    if (t && t.hp > 0) {
      if (dist(a, t) <= range(t)) {
        var back = guarded(s, a, attackOf(s, t)), had = a.hp;
        damage(s, a, back);
        say(s, CARDS[t.cardId].name + ' strikes back for ' + back + '.');
        drain(s, t, Math.min(back, had));
      } else say(s, CARDS[t.cardId].name + " can't strike back: " + name + ' is out of reach.');
    }
    if (b && b.hp > 0) say(s, CARDS[b.cardId].name + " can't strike back: only the lance's main target does.");
    [t, b, over, a].forEach(function (u) { if (u && u.hp <= 0 && s.units.indexOf(u) >= 0) kill(s, u); });
  }

  function beginAttack(s, att) {
    if (responses(s, 'attack', att).length) {
      s.pending = { kind: 'attack', attack: att, responder: 1 - s.active };
    } else resolveAttack(s, att);
  }

  function finishTurn(s) {
    s.units.forEach(function (u) { u.tempAtk = 0; u.tempRange = false; });
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
        say(s, p.name + ' plays ' + c.name + '.');
        break;
      // Opening hands work like a London mulligan: every redraw is a full new hand, then one card goes to the bottom on keeping.
      case 'redraw':
        p.redraws += 1;
        p.deck = p.deck.concat(p.hand);
        p.hand = [];
        shuffle(s, p.deck);
        for (var d = 0; d < OPENING_HAND; d++) p.hand.push(p.deck.pop());
        say(s, p.name + ' redraws their opening hand.');
        break;
      case 'keepHand':
        p.toBottom = p.redraws;
        if (!p.toBottom) finishOpening(s);
        break;
      case 'bottomCard':
        p.deck.unshift(takeFromHand(p, m.card));
        p.toBottom -= 1;
        if (!p.toBottom) finishOpening(s);
        break;
      case 'summon':
        i = takeFromHand(p, m.card); c = card(i);
        p.mana -= costOf(s, pi, c);
        s.units.push(newUnit(s, i.id, i.c, pi, m.r, m.c));
        say(s, p.name + ' summons ' + c.name + '.');
        if (c.extraLand) p.extraLands += 1;
        if (c.lifeCost) {
          p.life -= c.lifeCost;
          s.fx.push({ summoner: pi, text: '-' + c.lifeCost });
          say(s, p.name + ' pays ' + c.lifeCost + ' life.');
          if (p.life <= 0) { p.life = 0; s.winner = 1 - pi; say(s, s.players[1 - pi].name + ' wins.'); }
        }
        break;
      case 'enchant':
        i = takeFromHand(p, m.card); c = card(i); u = unitById(s, m.target);
        p.mana -= costOf(s, pi, c);
        var ench = { id: i.id, c: i.c, owner: pi };
        if (c.warrant) ench.expires = s.turn + c.warrant;
        u.enchants.push(ench);
        u.maxHp += c.hpBonus; u.hp += c.hpBonus;
        say(s, p.name + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + '.');
        break;
      case 'cast':
        i = takeFromHand(p, m.card); c = card(i);
        p.mana -= costOf(s, pi, c);
        p.discard.push(i);
        if (c.draw) {
          for (var dn = 0; dn < c.draw; dn++) draw(s, pi);
          say(s, p.name + ' casts ' + c.name + ' and draws ' + c.draw + ' cards.');
        }
        for (var di = 0; m.raise && di < p.discard.length; di++) {
          if (p.discard[di].id === m.raise) {
            var back = p.discard.splice(di, 1)[0];
            s.units.push(newUnit(s, back.id, back.c, pi, backRow(pi), backTile(s, pi)));
            say(s, p.name + ' casts ' + c.name + ' and returns ' + CARDS[back.c].name + '.');
            break;
          }
        }
        break;
      case 'toCommand':
        s.phase = 'command';
        break;
      case 'move':
        u = unitById(s, m.unit);
        u.r = m.r; u.c = m.c; u.moved = true;
        say(s, CARDS[u.cardId].name + ' moves.');
        break;
      case 'attack':
        u = unitById(s, m.unit); u.acted = true;
        beginAttack(s, { attacker: u.uid, targetUid: m.target });
        break;
      case 'attackSummoner':
        u = unitById(s, m.unit); u.acted = true;
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
          say(s, CARDS[u.cardId].name + ' studies, and ' + p.name + ' draws a card.');
        } else if (ab.key === 'push') {
          var pushed = unitById(s, m.target), pr = pushed.r + (pushed.r - u.r), pc = pushed.c + (pushed.c - u.c);
          pushed.r = pr; pushed.c = pc;
          say(s, CARDS[u.cardId].name + ' pushes ' + CARDS[pushed.cardId].name + ' back.');
        } else if (ab.key === 'harvest') {
          var fed = unitById(s, m.target);
          say(s, CARDS[u.cardId].name + ' harvests ' + CARDS[fed.cardId].name + '.');
          kill(s, fed);
          u.boost = (u.boost || 0) + ab.amount;
        }
        break;
      case 'respond':
        var rp = s.players[1 - pi];
        i = takeFromHand(rp, m.card); c = card(i);
        rp.mana -= costOf(s, 1 - pi, c);
        rp.discard.push(i);
        var target = unitById(s, m.target);
        say(s, rp.name + ' responds with ' + c.name + ' on ' + CARDS[target.cardId].name + '.');
        var pend = s.pending;
        s.pending = null;
        if (c.prevent) { pend.attack.shield = target.uid; pend.attack.prevent = c.prevent; }
        if (c.dodge) { target.r = m.r; target.c = m.c; pend.attack.missed = true; }
        if (c.shove) target.r = shoveRow(target);
        if (c.damage) {
          damage(s, target, c.damage);
          if (target.hp <= 0) kill(s, target);
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

  return {
    ROWS: ROWS, COLS: COLS, START_LIFE: START_LIFE, CARDS: CARDS, DECKS: DECKS,
    newGame: newGame, legalMoves: legalMoves, applyMove: applyMove,
    attackOf: attackOf, costOf: costOf, backRow: backRow, range: range, speed: speed, hasKw: hasKw
  };
})();
if (typeof module !== 'undefined') module.exports = Engine;
