// Scripted opponent. It only reads its own hand and public board state, and picks from the engine's legal moves.
var Bot = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  function unitById(s, uid) { for (var i = 0; i < s.units.length; i++) if (s.units[i].uid === uid) return s.units[i]; return null; }
  function worth(u) { return E.CARDS[u.cardId].cost * 15 + 20; }
  function handCard(p, id) { for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === id) return p.hand[i]; return null; }
  function dist(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }
  function unitAt(s, r, c) { return s.units.filter(function (u) { return u.r === r && u.c === c; })[0] || null; }
  function hurtScore(t, amt) { return amt >= t.hp ? worth(t) + 30 : worth(t) * amt / t.maxHp; }

  // What a spell aimed at a tile is worth: damage to enemies, minus damage to its own side, plus the effect left behind.
  function aimScore(s, pi, c, r, col) {
    var a = c.aim, here = unitAt(s, r, col), v = 0, sign = function (u) { return u.owner === pi ? -1.5 : 1; };
    var area = E.aimArea(a, pi, r, col), inArea = area.map(function (t) { return unitAt(s, t.r, t.c); }).filter(Boolean);
    if (here && a.hit) v += sign(here) * hurtScore(here, a.hit);
    if (a.splash) s.units.forEach(function (o) {
      if (o !== here && dist(o, { r: r, c: col }) === 1 && (a.splashAll || o.owner !== pi)) v += sign(o) * (a.splash >= o.hp ? worth(o) + 30 : 5);
    });
    // Area damage, healing and freezing, and the random spells at their average.
    inArea.forEach(function (o) {
      if (a.all) v += sign(o) * hurtScore(o, a.all);
      if (a.foes && o.owner !== pi) v += hurtScore(o, a.foes);
      if (a.mend && o.owner === pi) v += Math.min(a.mend, o.maxHp - o.hp) * 8;
      if (a.chill && o.owner !== pi) v += 6 + E.attackOf(s, o) * 2;
      if (a.light && o.owner === pi && !o.lit) v += 12;
      if (a.lots) v += sign(o) * (worth(o) + 30) / inArea.length;
      if (a.embers && !E.hasKw(o, 'Fireproof')) v += sign(o) * hurtScore(o, a.ember) * a.embers / area.length;
      if (a.unmake) o.enchants.forEach(function (e) {
        var bad = E.CARDS[e.c].enemyOnly || E.CARDS[e.c].atkBonus < 0;
        v += (o.owner === pi) === bad ? 25 : -25;
      });
    });
    if (a.unmake) area.forEach(function (t) { var fx = E.tileAt(s, t.r, t.c); if (fx) v += fx.owner === pi ? -8 : 8; });
    var spots = a.spread || a.square || a.row || a.column ? area : [{ r: r, c: col }];
    // Cinderwake: every tile from the aimed one to the enemy back row, hurting only enemies.
    if (a.wave) {
      spots = [];
      for (var wr = r; wr >= 0 && wr < E.ROWS; wr += pi === 0 ? -1 : 1) {
        spots.push({ r: wr, c: col });
        var w = unitAt(s, wr, col);
        if (w && w.owner !== pi) v += hurtScore(w, a.wave);
      }
    }
    if (!a.tile || a.embers) spots = [];
    spots.forEach(function (t) {
      var u = unitAt(s, t.r, t.c), near = s.units.filter(function (e) { return e.owner !== pi && dist(e, t) === 1; }).length;
      if (a.tile === 'frost' && u) v += u.owner === pi ? -12 : 15;
      if (a.tile === 'burn' && u && !E.hasKw(u, 'Fireproof') && !(a.light && u.owner === pi)) v += u.owner === pi ? -15 : 10;
      if (a.tile === 'thorns') v += u ? (u.owner === pi ? -10 : 12) : near * 8;
      if (a.tile === 'blight' && u) v += u.owner === pi ? -10 : 10 + E.attackOf(s, u) * 3;
      if (a.tile === 'holy' && u) v += u.owner === pi ? 20 + worth(u) / 8 : -10;
      if (a.tile === 'charge' && !u) v += near * 5;
    });
    return v;
  }
  // A tile effect that would hurt a unit standing on it.
  function tileHarm(s, u, r, c) {
    var t = E.tileAt(s, r, c);
    if (!t) return 0;
    if (t.kind === 'burn') return E.hasKw(u, 'Fireproof') ? -10 : 1;
    if (t.kind === 'thorns') return E.CARDS[u.cardId].sub === 'Alderkin' ? 0 : 1;
    if (t.kind === 'charge') return 2;
    if (t.kind === 'snare' || t.kind === 'blight') return t.owner === u.owner ? 0 : 1;
    if (t.kind === 'holy') return t.owner === u.owner ? -1 : 0;
    return 0;
  }

  function attackScore(s, u, t, extra) {
    var amt = E.hitOn(s, u, t), score = 0;
    if (amt >= t.hp) score += worth(t) + 30;
    else score += worth(t) * (amt / t.maxHp);
    if (extra) {
      var side = E.hitOn(s, u, extra);
      score += side >= extra.hp ? worth(extra) + 30 : worth(extra) * (side / extra.maxHp);
    }
    if (E.hasKw(u, 'Stomp')) s.units.forEach(function (o) { if (o !== t && o.owner !== u.owner && dist(o, t) === 1) score += o.hp <= 1 ? worth(o) : 5; });
    if (E.hasKw(u, 'Resonance')) {
      var rr = t.r === u.r ? 0 : t.r > u.r ? 1 : -1, rc = rr ? 0 : t.c > u.c ? 1 : -1;
      s.units.forEach(function (o) {
        if (o.owner === u.owner || o.r !== t.r + rr || o.c !== t.c + rc) return;
        var rung = E.hitOn(s, u, o);
        score += rung >= o.hp ? worth(o) + 30 : worth(o) * (rung / o.maxHp);
      });
    }
    if (amt >= t.hp && E.CARDS[u.cardId].drawOnKill) score += 25;
    if (amt < t.hp && dist(u, t) <= E.range(t)) {
      var back = E.hitOn(s, t, u, 0, true);
      score -= back >= u.hp ? worth(u) + 10 : worth(u) * (back / u.maxHp);
    }
    return score + 10;
  }

  function score(s, m) {
    var pi = s.pending ? s.pending.responder : s.active, p = s.players[pi], foe = 1 - pi, c, u, t;
    switch (m.type) {
      case 'pass': case 'endTurn': return 0;
      case 'toCommand': return 1;
      case 'playLand': return 1000;
      case 'redraw': return 0;
      case 'keepHand':
        var landCount = p.hand.filter(function (i) { return E.CARDS[i.c].type === 'land'; }).length;
        return landCount === 0 || landCount === p.hand.length ? -1 : 1;
      case 'bottomCard':
        c = E.CARDS[handCard(p, m.card).c];
        var lands = p.hand.filter(function (i) { return E.CARDS[i.c].type === 'land'; }).length;
        if (c.type === 'land') return lands > 2 || p.lands.length >= 6 ? 100 : -100;
        return c.cost;
      case 'summon':
        c = E.CARDS[handCard(p, m.card).c];
        if (c.lifeCost && p.life <= c.lifeCost * 2) return -100;
        var pull = 0, zap = 0;
        s.units.forEach(function (e) { if (e.owner === foe) pull -= Math.abs(e.c - m.c); });
        if (m.target) {
          t = unitById(s, m.target);
          zap = c.zap >= t.hp ? worth(t) + 30 : worth(t) * c.zap / t.maxHp;
        }
        if (c.drawOnSummon) zap += 20;
        (c.summons || []).forEach(function (id) { zap += 30 + E.CARDS[id].cost * 20; });
        zap += (c.adds || []).length * 15 + (c.curse ? 25 : 0) + (c.tax ? 15 : 0);
        // An ambush pays off the further forward it lands.
        var ahead = Math.abs(m.r - E.backRow(pi)) * (c.atk >= 3 ? 12 : 4);
        var spot = E.tileAt(s, m.r, m.c), hurt = spot && (spot.kind === 'burn' || spot.kind === 'thorns') && !(c.keywords.indexOf('Fireproof') >= 0 && spot.kind === 'burn') ? 30 : 0;
        return 100 + c.cost * 20 + pull - Math.abs(m.c - 2) + zap + ahead - hurt;
      case 'cast':
        c = E.CARDS[handCard(p, m.card).c];
        // On its own turn the bot casts an instant only for a clear gain, since it could wait for the enemy turn.
        if (c.type === 'instant') return instantScore(s, pi, c, m, null);
        if (c.type === 'relic') return 70 + c.cost * 10;
        if (m.relic) return p.relics.some(function (r) { return r.id === m.relic; }) ? -100 : 55;
        if (c.bolt) {
          if (m.summoner !== undefined) return c.bolt >= s.players[foe].life ? 100000 : s.players[foe].life <= 8 ? 30 + c.bolt * 10 : -1;
          t = unitById(s, m.target);
          var zap = hurtScore(t, c.bolt);
          return zap >= 50 ? 30 + zap : -1;
        }
        if (c.selfLife) return p.life >= 8 ? 60 : -1;
        if (c.sweep || c.humble || c.hour) {
          var net = 0;
          s.units.forEach(function (o) {
            var hit = c.sweep ? (E.hasKw(o, 'Fireproof') ? 0 : c.sweep) : c.humble ? (E.attackOf(s, o) >= c.humble.atk ? c.humble.hit : 0) : (o.hp <= 2 ? o.hp : 0);
            if (hit) net += (o.owner === pi ? -1.3 : 1) * hurtScore(o, hit);
          });
          return net >= 60 ? net : -1;
        }
        if (c.borrow) {
          t = unitById(s, m.target);
          var prey = s.units.some(function (e) { return e.owner === t.owner && e !== t && dist(e, t) <= E.range(t) + E.speed(t); });
          return prey && E.attackOf(s, t) >= 3 ? 30 + E.attackOf(s, t) * 8 : -1;
        }
        if (c.buy) return 40 + worth(unitById(s, m.target));
        if (c.stasis) { t = unitById(s, m.target); return E.attackOf(s, t) >= 4 ? 20 + E.attackOf(s, t) * 6 : -1; }
        if (c.place) {
          var pinned = s.units.filter(function (e) { return e.owner === foe && dist(e, m) === 1 && E.attackOf(s, e) >= 2; }).length;
          return pinned ? 20 + pinned * 15 : -1;
        }
        if (c.light) {
          t = unitById(s, m.target);
          return s.units.some(function (e) { return e.owner === foe && dist(e, t) <= 2; }) ? 30 + worth(t) / 10 : -1;
        }
        if (c.unchain || c.loam) {
          t = unitById(s, m.target);
          var piece = E.CARDS[t.enchants[t.enchants.length - 1].c];
          if (c.loam) for (var g = t.enchants.length - 1; g >= 0; g--) if (E.CARDS[t.enchants[g].c].equipment) { piece = E.CARDS[t.enchants[g].c]; break; }
          var harmful = piece.enemyOnly || piece.atkBonus < 0;
          if (t.owner === pi) return harmful ? 40 + worth(t) / 5 : -100;
          return harmful ? -100 : 30 + worth(t) / 5 + (c.unchain ? hurtScore(t, c.unchain) / 2 : 0);
        }
        if (c.extraLand) {
          var spare = p.hand.filter(function (i) { return E.CARDS[i.c].type === 'land'; }).length;
          return !p.extraLands && spare >= (p.landDropped ? 1 : 2) ? 900 : -100;
        }
        if (c.cleanse) {
          t = unitById(s, m.target);
          var harmful = t.enchants.filter(function (e) { return E.CARDS[e.c].enemyOnly || E.CARDS[e.c].atkBonus < 0; });
          if (t.owner === foe) return !harmful.length ? 30 + worth(t) / 4 : -100;
          if (!harmful.length) return -100;
          return harmful.some(function (e) { return E.CARDS[e.c].warrant; }) ? 60 + worth(t) : 40 + worth(t) / 5;
        }
        if (c.mend) {
          t = unitById(s, m.target);
          if (c.temper) return 25 + Math.min(c.mend, t.maxHp - t.hp) * 8 + worth(t) / 10;
          return t.maxHp - t.hp >= 2 ? 30 + Math.min(c.mend, t.maxHp - t.hp) * 10 + worth(t) / 10 : -1;
        }
        if (c.blast) {
          t = unitById(s, m.target);
          var cold = t.frozen >= s.turn || (E.tileAt(s, t.r, t.c) || {}).kind === 'frost', bolt = c.iceBlast && cold ? c.iceBlast : c.blast;
          var burn = bolt >= t.hp ? worth(t) + 30 : worth(t) * bolt / t.maxHp + (c.chill ? 10 : 0);
          if (c.splash) s.units.forEach(function (o) { if (o.owner === foe && o !== t && dist(o, t) === 1) burn += c.splash >= o.hp ? worth(o) + 30 : 5; });
          return burn >= 60 ? 40 + burn : -1;
        }
        if (c.fortify) {
          var mine = s.units.filter(function (a) { return a.owner === pi; }).length;
          return mine >= 2 ? 40 + mine * 25 : -1;
        }
        if (c.aim) {
          var aimed = aimScore(s, pi, c, m.r, m.c);
          return aimed >= 30 ? 30 + aimed : -1;
        }
        if (c.summons) return 100 + c.cost * 20;
        if (c.coin) return 60;
        if (c.bonusNext) {
          // Worth it only with a card in hand that the extra mana would bring within reach next turn.
          var next = p.lands.length + 1 + c.bonusNext;
          return p.hand.some(function (h) { var hc = E.CARDS[h.c]; return hc.type !== 'land' && E.costOf(s, pi, hc) > p.lands.length + 1 && E.costOf(s, pi, hc) <= next; }) ? 45 : -1;
        }
        if (c.stride) {
          var ready = s.units.filter(function (a) { return a.owner === pi && a.summonedTurn !== s.turn && !a.moved; }).length;
          return ready >= 3 ? 20 + ready * 12 : -1;
        }
        if (c.chant) {
          t = unitById(s, m.target);
          var ready = t.summonedTurn !== s.turn && !t.acted && !t.noAttack;
          var reach = ready && (t.r === E.backRow(foe) || s.units.some(function (e) { return e.owner === foe && dist(e, t) <= E.range(t) + (t.moved ? 0 : E.speed(t)); }));
          return reach ? 35 + E.attackOf(s, t) * 3 : -1;
        }
        if (c.passage) {
          t = unitById(s, m.target);
          var open = !s.units.some(function (e) { return e.owner === foe && dist({ r: m.r, c: m.c }, e) === 1; });
          return m.r === E.backRow(foe) && open && E.attackOf(s, t) >= 3 ? 55 + E.attackOf(s, t) * 10 : -1;
        }
        if (!m.raise) return 100 + c.cost * 20;
        var raised = p.discard.filter(function (d) { return d.id === m.raise; })[0];
        return 100 + E.CARDS[raised.c].cost * 20;
      case 'enchant':
        c = E.CARDS[handCard(p, m.card).c]; t = unitById(s, m.target);
        if (c.allyOnly) return 40 + worth(t) / 5;
        if (c.hunted) return t.owner === foe && worth(t) >= 65 ? 30 + worth(t) / 5 : -100;
        if (c.warrant) return worth(t) >= 80 ? 40 + worth(t) : -100;
        if (c.atkBonus > 0) return t.owner === pi ? 40 + worth(t) / 5 : -100;
        return t.owner === foe && E.attackOf(s, t) >= 3 ? 40 + E.attackOf(s, t) * 2 : -100;
      case 'attackSummoner':
        u = unitById(s, m.unit);
        return E.attackOf(s, u) >= s.players[foe].life ? 100000 : 120 + E.attackOf(s, u) * 10;
      case 'attack':
        return attackScore(s, unitById(s, m.unit), unitById(s, m.target));
      case 'ability':
        u = unitById(s, m.unit);
        var ab = E.CARDS[u.cardId].ability, key = ab.key;
        if (key === 'heal') { t = unitById(s, m.target); return 25 + Math.min(25, (t.maxHp - t.hp) * 10) + worth(t) / 10; }
        if (key === 'rally') return 60;
        if (key === 'healall') return 70;
        if (key === 'study') return 70;
        if (key === 'sift') return 55;
        if (key === 'forage') return 50;
        if (key === 'orders') return 15;
        if (key === 'lens') {
          t = unitById(s, m.target);
          return s.units.some(function (e) { return e.owner === foe && dist(t, e) === 2; }) ? 40 : -1;
        }
        if (key === 'push') return 22;
        if (key === 'zap') { t = unitById(s, m.target); return ab.amount >= t.hp ? worth(t) + 30 : 12 + worth(t) / 10; }
        if (key === 'harvest') return worth(unitById(s, m.target)) <= 35 ? 35 : -1;
        if (key === 'tend') return 45 + worth(unitById(s, m.target)) / 10;
        if (key === 'hold') return 30 + E.attackOf(s, unitById(s, m.target)) * 5;
        if (key === 'errant') return 55;
        if (key === 'rain') {
          var wet = E.tileAt(s, m.r, m.c), there = unitAt(s, m.r, m.c), rv = -1;
          if (there && there.owner === pi && there.hp < there.maxHp) rv = 15;
          if (wet && there && there.owner === pi && tileHarm(s, there, m.r, m.c) > 0) rv = 45;
          else if (wet && wet.owner === foe && wet.kind !== 'frost') rv = Math.max(rv, 12);
          else if (wet && wet.kind === 'frost' && there && there.owner === pi) rv = 40;
          return rv;
        }
        if (key === 'winterdoor') return 25 + E.attackOf(s, unitAt(s, m.r, m.c)) * 4;
        if (key === 'snare') {
          var near = s.units.filter(function (e) { return e.owner === foe; }).map(function (e) { return dist(e, m); });
          return near.length ? 30 - Math.min.apply(null, near) * 6 : -1;
        }
        if (key === 'blight') {
          t = unitAt(s, m.r, m.c);
          return t && t.owner === foe ? 25 + E.attackOf(s, t) * 4 : t ? -10 : -1;
        }
        if (key === 'exhume') return 60 + E.CARDS[p.discard.filter(function (d) { return d.id === m.raise; })[0].c].cost * 15;
        if (key === 'farheal') { t = unitById(s, m.target); return 25 + Math.min(20, (t.maxHp - t.hp) * 10) + worth(t) / 10; }
        if (key === 'refit') {
          // Hand equipment on only to a stronger ally that carries none.
          t = unitById(s, m.target);
          var to = unitAt(s, m.r, m.c);
          return !to.enchants.some(function (e) { return E.CARDS[e.c].equipment; }) && E.attackOf(s, to) > E.attackOf(s, t) + 1 ? 20 : -1;
        }
        if (key === 'ferry') {
          t = unitById(s, m.target);
          var fwd = Math.abs(t.r - E.backRow(foe)) - Math.abs(m.r - E.backRow(foe));
          return fwd > 0 && !t.moved && E.attackOf(s, t) >= 3 ? 8 + fwd * 8 : -1;
        }
        if (key === 'sweep') {
          var swept = 0;
          [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var fx = E.tileAt(s, u.r + d[0], u.c + d[1]), on = unitAt(s, u.r + d[0], u.c + d[1]);
            if (fx && on && on.owner === pi && tileHarm(s, on, on.r, on.c) > 0) swept += 25;
            else if (fx && fx.owner === foe) swept += 8;
          });
          return swept ? swept : -1;
        }
        if (key === 'trap') {
          var close = s.units.filter(function (e) { return e.owner === foe; }).map(function (e) { return dist(e, m); });
          return close.length ? 24 - Math.min.apply(null, close) * 6 : -1;
        }
        if (key === 'wildcast') {
          var spots = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(function (d) { return { r: m.r + d[0], c: m.c + d[1] }; }).filter(function (q) { return q.r >= 0 && q.c >= 0 && q.r < E.ROWS && q.c < E.COLS; });
          var avg = 0;
          spots.forEach(function (q) { var o = unitAt(s, q.r, q.c); if (o) avg += (o.owner === pi ? -1.5 : 1) * hurtScore(o, ab.amount) / spots.length; });
          return avg >= 15 ? avg : -1;
        }
        if (key === 'charm') return 40 + worth(unitById(s, m.target));
        if (key === 'sap') { t = unitById(s, m.target); return E.attackOf(s, t) >= 3 ? 15 + E.attackOf(s, t) * 4 : -1; }
        if (key === 'reed') return p.hand.some(function (h) { return E.CARDS[h.c].type === 'land'; }) && p.lands.length < 7 ? 45 : -1;
        if (key === 'swap') {
          // Swap a strong ally forward when that brings it closer to the enemy back row.
          t = unitById(s, m.target);
          var ahead = Math.abs(t.r - E.backRow(foe)) - Math.abs(u.r - E.backRow(foe));
          return ahead > 0 && E.attackOf(s, t) >= 3 ? 10 + ahead * 10 : -1;
        }
        t = unitById(s, m.target);
        var behind = s.units.filter(function (e) { return e.owner === foe && e.r === t.r + (t.r - u.r) && e.c === t.c + (t.c - u.c); })[0];
        return attackScore(s, u, t, behind);
      case 'move':
        u = unitById(s, m.unit);
        var goal = E.backRow(foe), gain = Math.abs(u.r - goal) - Math.abs(m.r - goal), bonus = 0, here = { r: m.r, c: m.c };
        s.units.forEach(function (e) {
          if (e.owner !== foe) return;
          var d = dist(here, e);
          if (d <= E.range(u)) bonus = Math.max(bonus, attackScore(s, u, e) / 2);
          if (d === 1 && E.hitOn(s, e, u) >= u.hp) bonus -= 8;
        });
        return 12 + gain * 12 + bonus - tileHarm(s, u, m.r, m.c) * 15;
      case 'relic':
        var rel = p.relics.filter(function (r) { return r.id === m.relic; })[0], rk = E.CARDS[rel.c].relic;
        var fresh = s.units.filter(function (a) { return a.owner === pi && a.summonedTurn !== s.turn && !a.acted; });
        if (rk === 'bell') return s.phase === 'command' && fresh.filter(function (a) { return s.units.some(function (o) { return o !== a && o.owner === pi && dist(o, a) === 1; }); }).length >= 2 ? 30 : -1;
        if (rk === 'drum') return s.phase === 'command' && fresh.filter(function (a) { return !a.moved; }).length >= 3 ? 25 : -1;
        if (rk === 'tide') return s.phase === 'play' && p.hand.some(function (h) { var hc = E.CARDS[h.c], cost = E.costOf(s, pi, hc, h); return hc.type !== 'land' && cost > p.mana && cost <= p.mana + rel.store; }) ? 80 : -1;
        if (rk === 'seed') return rel.store >= 2 ? 30 + rel.store * 10 + worth(unitById(s, m.target)) / 10 : -1;
        if (rk === 'stars') {
          // Swap when the second card suits the hand better: a land when short of them, otherwise a spell or unit.
          var top = p.top || p.deck.slice(-2).reverse().map(function (i) { return i.c; }), short = p.lands.length < 5;
          var want = function (id) { return (E.CARDS[id].type === 'land') === short ? 1 : 0; };
          return top.length === 2 && want(top[1]) > want(top[0]) ? 15 : -1;
        }
        return -1;
      case 'respond':
        c = E.CARDS[handCard(p, m.card).c]; t = unitById(s, m.target);
        var att = s.pending.attack;
        if (c.unwind) {
          var close = t.r === E.backRow(pi) || s.units.some(function (o) { return o.owner === pi && dist(o, t) <= E.range(t); });
          return close && E.attackOf(s, t) >= 3 ? 25 + E.attackOf(s, t) * 5 : -1;
        }
        if (c.brace || c.canopy) {
          var hitter = unitById(s, att.attacker), blow = E.hitOn(s, hitter, t);
          var saved = c.canopy ? blow : Math.min(2, blow);
          return blow >= t.hp && blow - saved < t.hp ? worth(t) : saved >= 3 ? 15 + saved * 4 : -1;
        }
        if (c.dodge) return E.hitOn(s, unitById(s, att.attacker), t) >= t.hp ? worth(t) : -1;
        if (c.prevent) {
          var striker = unitById(s, att.attacker);
          return E.hitOn(s, striker, t) >= t.hp && E.hitOn(s, striker, t, c.prevent) < t.hp ? worth(t) : -1;
        }
        return instantScore(s, pi, c, m, att);
    }
    return 0;
  }

  // Instants that need no trigger, cast on either turn. att is the attack being answered, if any.
  function instantScore(s, pi, c, m, att) {
    var p = s.players[pi], t = m.target !== undefined ? unitById(s, m.target) : null;
    // Scatter the line: worth it when it hurts several enemies or pushes them off your back row.
    if (c.aim) {
      var rowV = 0;
      s.units.forEach(function (e) { if (e.owner !== pi && e.r === m.r) rowV += hurtScore(e, c.aim.foes) + (e.r === E.backRow(pi) || dist(e, { r: E.backRow(pi), c: e.c }) === 1 ? 15 : 3); });
      return rowV >= 35 && m.c === 2 ? rowV : -1;
    }
    if (c.shove) return t.r === E.backRow(pi) ? 40 : -1;
    if (c.debt) return p.life > c.debt + 4 && worth(t) >= 65 ? worth(t) - 20 + (att && att.attacker === t.uid ? 30 : 0) : -1;
    if (c.damage >= t.hp) return worth(t) + (att && att.attacker === t.uid ? 30 : 0);
    return att || !s.pending ? -1 : 5;
  }

  function choose(s, jitter) {
    var moves = E.legalMoves(s, { dedupe: true }), best = null, top = -Infinity;
    moves.forEach(function (m) {
      var v = score(s, m) + (jitter ? jitter() * 3 : 0);
      if (v > top) { top = v; best = m; }
    });
    return best;
  }
  return { choose: choose, score: score };
})();
if (typeof module !== 'undefined') module.exports = Bot;
