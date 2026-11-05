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
    land('land_w', 'W', 'Sunlit plains'), land('land_r', 'R', 'Cinder peaks'), land('land_u', 'U', 'Lantern quarter'),
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
    unit('dragon', 'Elder dragon', 'R', 7, 3, 85, 100, { keywords: ['Flying', 'Swift'], text: 'Flying: moves over other units. Swift.' }),
    { id: 'firebolt', name: 'Firebolt', type: 'instant', colour: 'R', cost: 2, wants: 1, damage: 25, text: 'On the enemy turn: 25 damage to an enemy unit.' },
    { id: 'hex', name: 'Withering hex', type: 'enchant', colour: 'R', cost: 2, wants: 1, atkBonus: -15, hpBonus: 0, text: 'Enchant a unit: -15 attack.' }
  ].forEach(function (c) { CARDS[c.id] = c; });

  var DECKS = {
    white: { name: 'Oath of the Sunmane', colours: ['W'], list: [['land_w', 9], ['spearman', 2], ['cleric', 2], ['knight', 2], ['lancer', 2], ['warden', 1], ['shield', 1], ['banner', 1]] },
    red: { name: 'The Warhorde', colours: ['R', 'U'], list: [['land_r', 7], ['land_u', 2], ['goblin', 1], ['raider', 2], ['conjurer', 2], ['sellsword', 1], ['warchief', 1], ['giant', 1], ['dragon', 1], ['firebolt', 1], ['hex', 1]] }
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
  function speed(u) { return hasKw(u, 'Swift') ? 2 : 1; }
  function range(u) { return hasKw(u, 'Ranged') ? 2 : 1; }
  function dist(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }

  function attackOf(u) {
    var a = CARDS[u.cardId].atk + u.tempAtk;
    u.enchants.forEach(function (e) { a += CARDS[e.c].atkBonus; });
    return Math.max(0, a);
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
  function mkPlayer(key) { return { deckKey: key, name: DECKS[key].name, deck: [], hand: [], discard: [], lands: [], mana: 0, life: START_LIFE, landDropped: false, redraws: 0, toBottom: 0, kept: false }; }

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
    s.units.forEach(function (u) { if (u.owner === s.active) { u.moved = false; u.acted = false; } });
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
        if (!p.landDropped && c.type === 'land') out.push({ type: 'playLand', card: i.id });
        if (c.type !== 'land' && costOf(s, pi, c) <= p.mana) {
          if (c.type === 'unit') {
            for (var col = 0; col < COLS; col++) if (!unitAt(s, backRow(pi), col)) out.push({ type: 'summon', card: i.id, r: backRow(pi), c: col });
          } else if (c.type === 'enchant') {
            s.units.forEach(function (u) { out.push({ type: 'enchant', card: i.id, target: u.uid }); });
          }
        }
      });
      out.push({ type: 'toCommand' });
      return out;
    }
    s.units.forEach(function (u) {
      if (u.owner !== pi || u.summonedTurn === s.turn || u.acted) return;
      if (!u.moved) reachable(s, u).forEach(function (t) { out.push({ type: 'move', unit: u.uid, r: t.r, c: t.c }); });
      s.units.forEach(function (e) {
        if (e.owner !== pi && dist(u, e) <= range(u)) out.push({ type: 'attack', unit: u.uid, target: e.uid });
      });
      if (u.r === backRow(1 - pi)) out.push({ type: 'attackSummoner', unit: u.uid });
      var ab = CARDS[u.cardId].ability;
      if (!ab) return;
      if (ab.key === 'heal') {
        s.units.forEach(function (a) { if (a.owner === pi && a !== u && dist(u, a) === 1 && a.hp < a.maxHp) out.push({ type: 'ability', unit: u.uid, target: a.uid }); });
      } else if (ab.key === 'rally') {
        if (s.units.some(function (a) { return a.owner === pi && a !== u && dist(u, a) === 1; })) out.push({ type: 'ability', unit: u.uid });
      } else if (ab.key === 'lance') {
        s.units.forEach(function (e) {
          if (e.owner !== pi && dist(u, e) === 1) {
            var b = unitAt(s, e.r + (e.r - u.r), e.c + (e.c - u.c));
            if (b && b.owner !== pi) out.push({ type: 'ability', unit: u.uid, target: e.uid });
          }
        });
      }
    });
    out.push({ type: 'endTurn' });
    return out;
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

  function resolveAttack(s, att) {
    var a = unitById(s, att.attacker);
    if (!a) { say(s, 'The attack fizzles.'); return; }
    var amt = attackOf(a), name = CARDS[a.cardId].name;
    if (att.summoner !== undefined) {
      var def = s.players[att.summoner];
      def.life -= amt;
      s.fx.push({ summoner: att.summoner, text: '-' + amt });
      say(s, name + ' hits ' + def.name + ' for ' + amt + '.');
      if (def.life <= 0) { def.life = 0; s.winner = a.owner; say(s, s.players[a.owner].name + ' wins.'); }
      return;
    }
    var t = unitById(s, att.targetUid), b = att.secondaryUid ? unitById(s, att.secondaryUid) : null;
    if (t) {
      var hit = Math.max(0, amt - (att.shield === t.uid ? att.prevent : 0));
      damage(s, t, hit);
      say(s, name + ' hits ' + CARDS[t.cardId].name + ' for ' + hit + '.');
    }
    if (b) {
      var hitB = Math.max(0, amt - (att.shield === b.uid ? att.prevent : 0));
      damage(s, b, hitB);
      say(s, 'The lance also hits ' + CARDS[b.cardId].name + ' for ' + hitB + '.');
    }
    // Only a survivor strikes back, and only if the attacker is within its range.
    if (t && t.hp > 0) {
      if (dist(a, t) <= range(t)) {
        var back = attackOf(t);
        damage(s, a, back);
        say(s, CARDS[t.cardId].name + ' strikes back for ' + back + '.');
      } else say(s, CARDS[t.cardId].name + " can't strike back: " + name + ' is out of reach.');
    }
    if (b && b.hp > 0) say(s, CARDS[b.cardId].name + " can't strike back: only the lance's main target does.");
    [t, b, a].forEach(function (u) { if (u && u.hp <= 0 && s.units.indexOf(u) >= 0) kill(s, u); });
  }

  function beginAttack(s, att) {
    if (responses(s, 'attack', att).length) {
      s.pending = { kind: 'attack', attack: att, responder: 1 - s.active };
    } else resolveAttack(s, att);
  }

  function finishTurn(s) {
    s.units.forEach(function (u) { u.tempAtk = 0; });
    startTurn(s);
  }

  function applyMove(prev, m) {
    var s = JSON.parse(JSON.stringify(prev));
    s.fx = [];
    var pi = s.active, p = s.players[pi], i, c, u;
    switch (m.type) {
      case 'playLand':
        i = takeFromHand(p, m.card); c = card(i);
        p.lands.push({ colour: c.colour, id: i.id, c: i.c }); p.mana += 1; p.landDropped = true;
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
        s.units.push({ uid: s.nextId++, inst: i.id, cardId: i.c, owner: pi, r: m.r, c: m.c, hp: c.hp, maxHp: c.hp, tempAtk: 0, enchants: [], moved: false, acted: false, summonedTurn: s.turn });
        say(s, p.name + ' summons ' + c.name + '.');
        break;
      case 'enchant':
        i = takeFromHand(p, m.card); c = card(i); u = unitById(s, m.target);
        p.mana -= costOf(s, pi, c);
        u.enchants.push({ id: i.id, c: i.c, owner: pi });
        u.maxHp += c.hpBonus; u.hp += c.hpBonus;
        say(s, p.name + ' casts ' + c.name + ' on ' + CARDS[u.cardId].name + '.');
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
          var a = unitById(s, m.target), healed = Math.min(ab.amount, a.maxHp - a.hp);
          a.hp += healed;
          s.fx.push({ uid: a.uid, r: a.r, c: a.c, text: '+' + healed, good: true });
          say(s, CARDS[u.cardId].name + ' heals ' + CARDS[a.cardId].name + ' for ' + healed + '.');
        } else if (ab.key === 'rally') {
          s.units.forEach(function (o) { if (o.owner === pi && o !== u && dist(u, o) === 1) o.tempAtk += ab.amount; });
          say(s, CARDS[u.cardId].name + ' rallies nearby allies.');
        } else if (ab.key === 'lance') {
          var e = unitById(s, m.target), behind = unitAt(s, e.r + (e.r - u.r), e.c + (e.c - u.c));
          beginAttack(s, { attacker: u.uid, targetUid: e.uid, secondaryUid: behind ? behind.uid : null });
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
