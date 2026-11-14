// Scripted opponent. It only reads its own hand and public board state, and picks from the engine's legal moves.
var Bot = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  function unitById(s, uid) { for (var i = 0; i < s.units.length; i++) if (s.units[i].uid === uid) return s.units[i]; return null; }
  function worth(u) { return E.CARDS[u.cardId].cost * 15 + 20; }
  function handCard(p, id) { for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === id) return p.hand[i]; return null; }
  function dist(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }
  // What healing t is worth to Devotion: each Devotion unit that grows, t itself or an ally next to it. Any heal counts.
  function devotion(s, t) {
    return 25 * s.units.filter(function (o) { return o.owner === t.owner && (o === t || dist(o, t) === 1) && E.hasKw(o, 'Devotion') && (o.devotion || 0) < 3; }).length;
  }
  function unitAt(s, r, c) { return s.units.filter(function (u) { return u.r === r && u.c === c; })[0] || null; }
  function hurtScore(t, amt) { return amt >= t.hp ? worth(t) + 30 : worth(t) * amt / t.maxHp; }

  // What a spell aimed at a tile is worth: damage to enemies, minus damage to its own side, plus the effect left behind.
  function aimScore(s, pi, c, r, col) {
    var a = c.aim, here = unitAt(s, r, col), v = 0, sign = function (u) { return u.owner === pi ? -1.5 : 1; };
    var area = E.aimArea(a, pi, r, col), inArea = area.map(function (t) { return unitAt(s, t.r, t.c); }).filter(Boolean);
    if (here && a.hit && !(a.foesOnly && here.owner === pi)) v += sign(here) * hurtScore(here, a.hit);
    if (a.splash) s.units.forEach(function (o) {
      if (o !== here && dist(o, { r: r, c: col }) === 1 && (a.splashAll || o.owner !== pi)) v += sign(o) * (a.splash >= o.hp ? worth(o) + 30 : 5);
    });
    // Area damage, healing and freezing, and the random spells at their average.
    inArea.forEach(function (o) {
      if (a.all) v += sign(o) * hurtScore(o, a.all);
      if (a.foes && o.owner !== pi) v += hurtScore(o, a.foes);
      if (a.mend && o.owner === pi) v += Math.min(a.mend, o.maxHp - o.hp) * 8;
      if (a.chill && o.owner !== pi) v += 6 + E.attackOf(s, o) * 2;
      if (a.mire && o.owner !== pi) v += 4 + E.attackOf(s, o) * 2;
      if (a.light && o.owner === pi && !o.lit) v += 12;
      if (a.lots) v += sign(o) * (worth(o) + 30) / inArea.length;
      if (a.embers && !E.hasKw(o, 'Fireproof')) v += sign(o) * hurtScore(o, a.ember) * a.embers / area.length;
      if (a.unmake) o.enchants.forEach(function (e) {
        var bad = E.CARDS[e.c].enemyOnly || E.CARDS[e.c].atkBonus < 0;
        v += (o.owner === pi) === bad ? 25 : -25;
      });
    });
    if (a.unmake) area.forEach(function (t) { var fx = E.tileAt(s, t.r, t.c); if (fx) v += fx.owner === pi ? -8 : 8; });
    var spots = a.spread || a.square || a.block || a.row || a.column ? area : [{ r: r, c: col }];
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
      if (a.tile === 'blight' && u) v += (u.owner === pi ? -10 : 10 + E.attackOf(s, u) * 3) + (doomed(s, u) ? 35 : 0);
      if (a.tile === 'holy' && u) v += u.owner === pi ? 20 + worth(u) / 8 + (near ? 15 + near * 5 : 0) : -10;
      if (a.tile === 'holy' && !u) v += near * 3;
      if (a.tile === 'charge' && !u) v += near * 5;
    });
    return v;
  }
  // A unit likely to die soon: an enemy that units of the other side next to it could finish, or the reverse.
  function doomed(s, u) {
    var hits = s.units.filter(function (o) { return o.owner !== u.owner && dist(o, u) <= E.range(o) + 1; }).reduce(function (n, o) { return n + E.attackOf(s, o); }, 0);
    return hits >= u.hp;
  }
  // The most an enemy unit could do to one of pi's units next turn: the worth of the unit it would kill, if any.
  function threat(s, pi, t, less) {
    var best = 0, reach = E.range(t) + E.speed(t), atk = E.attackOf(s, t);
    s.units.forEach(function (u) {
      if (u.owner !== pi || dist(u, t) > reach || atk < u.hp) return;
      // less: what the curse takes off its attack. Worth most when that saves the unit.
      best = Math.max(best, atk - less < u.hp ? worth(u) : worth(u) / 4);
    });
    return best;
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

  // Whether amt damage from u finishes t: enough of it, or any at all with Venom.
  function withoutFlare(m) { var x = {}; for (var k in m) x[k] = m[k]; x.noFlare = true; return x; }
  function fells(u, t, amt) { return amt >= t.hp || (amt > 0 && E.hasKw(u, 'Venom')); }
  function attackScore(s, u, t, extra) {
    var amt = E.hitOn(s, u, t), score = 0;
    if (fells(u, t, amt)) score += worth(t) + 30;
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
    if (fells(u, t, amt) && E.CARDS[u.cardId].drawOnKill) score += 25;
    if (!fells(u, t, amt) && dist(u, t) <= E.range(t)) {
      var back = E.hitOn(s, t, u, 0, true);
      score -= fells(t, u, back) ? worth(u) + 10 : worth(u) * (back / u.maxHp);
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
      case 'scry':
        var keep = wanted(s, p, p.scrying.cards[0].c);
        return (m.bottom ? -1 : 1) * (keep ? 10 : -10);
      case 'pick':
        return cardValue(s, p, p.picking.cards.filter(function (i) { return i.id === m.card; })[0].c);
      case 'summon':
        c = E.CARDS[handCard(p, m.card).c];
        if (c.lifeCost && p.life <= c.lifeCost * 2) return -100;
        var pull = 0, zap = 0;
        s.units.forEach(function (e) { if (e.owner === foe) pull -= Math.abs(e.c - m.c); });
        if (m.target && c.zap) {
          t = unitById(s, m.target);
          zap = c.zap >= t.hp ? worth(t) + 30 : worth(t) * c.zap / t.maxHp;
        }
        if (c.drawOnSummon) zap += 20;
        if (c.boon && m.target) { t = unitById(s, m.target); zap += 10 + (c.boon.atk || 0) * 8 + (c.boon.hp || 0) * 4 + worth(t) / 10; }
        if (c.scry) zap += 10;
        // A Blank unit can attack only with an ally beside it, so a newcomer next to one is worth more.
        if (s.units.some(function (b) { return b.owner === pi && E.hasKw(b, 'Blank') && dist(b, m) === 1; })) zap += 12;
        (c.summons || []).forEach(function (id) { zap += 30 + E.CARDS[id].cost * 20; });
        if (c.errant) zap += 30 + E.CARDS[c.errant].cost * 20;
        zap += (c.adds || []).length * 15 + (c.curse ? 25 : 0) + (c.tax ? 15 : 0);
        // An ambush pays off the further forward it lands.
        var ahead = Math.abs(m.r - E.backRow(pi)) * (c.atk >= 3 ? 12 : 4);
        var spot = E.tileAt(s, m.r, m.c), hurt = spot && (spot.kind === 'burn' || spot.kind === 'thorns') && !(c.keywords.indexOf('Fireproof') >= 0 && spot.kind === 'burn') ? 30 : 0;
        return 100 + c.cost * 20 + pull - Math.abs(m.c - (E.COLS - 1) / 2) + zap + ahead - hurt;
      case 'cast':
        c = E.CARDS[handCard(p, m.card).c];
        // Flare: a spell also strengthens each Glimmerfolk ready to attack this turn. Added to whatever the spell scores.
        if (c.type === 'spell' && s.phase === 'play' && !m.noFlare) {
          var flares = s.units.filter(function (a) { return a.owner === pi && E.hasKw(a, 'Flare') && a.summonedTurn !== s.turn && !a.acted; }).length;
          if (flares) { var base = score(s, withoutFlare(m)); return base > 0 ? base + flares * 6 : base; }
        }
        // On its own turn the bot casts an instant only for a clear gain, since it could wait for the enemy turn.
        if (c.type === 'instant') return instantScore(s, pi, c, m, null);
        if (c.type === 'relic') return 70 + c.cost * 10;
        if (m.relic) return p.relics.some(function (r) { return r.id === m.relic; }) ? -100 : 55;
        if (c.bolt) {
          if (m.summoner !== undefined) {
            // Burn reaches the summoner however far away the units are, so it goes there unless it can kill a unit worth more.
            // Once the burn in hand nearly finishes them off, it all goes to the summoner.
            var life = s.players[foe].life, reach = p.hand.reduce(function (n, h) { return n + (E.CARDS[h.c].bolt || 0); }, 0);
            if (c.bolt >= life) return 100000;
            return reach + 3 >= life ? 200 + c.bolt * 10 : 45 + c.bolt * 12 + (c.leech ? 15 : 0) + Math.max(0, 15 - life) * 4;
          }
          t = unitById(s, m.target);
          var zap = hurtScore(t, c.bolt);
          return zap >= 50 ? 30 + zap : -1;
        }
        if (c.selfLife) return p.life >= 8 ? 60 : -1;
        if (c.sweep || c.humble || c.hour || c.cull) {
          var net = 0;
          s.units.forEach(function (o) {
            var hit = c.sweep ? (E.hasKw(o, 'Fireproof') ? 0 : o.owner === pi && c.sweepOwn !== undefined ? c.sweepOwn : c.sweep)
              : c.humble ? (E.attackOf(s, o) >= c.humble.atk && !(c.humble.foesOnly && o.owner === pi) ? c.humble.hit : 0)
              : c.cull ? (o.owner !== pi && o.hp <= c.cull ? o.hp : 0) : (o.hp <= 2 ? o.hp : 0);
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
          return s.units.some(function (e) { return e.owner === foe && dist(e, t) <= 2; }) ? 30 + worth(t) / 10 + ((c.lightAtk || 0) + (c.lightHp || 0)) * 12 : -1;
        }
        if (c.unchain || c.loam) {
          t = unitById(s, m.target);
          var piece = t.enchants.length ? E.CARDS[t.enchants[t.enchants.length - 1].c] : null;
          if (c.loam) for (var g = t.enchants.length - 1; g >= 0; g--) if (E.CARDS[t.enchants[g].c].equipment) { piece = E.CARDS[t.enchants[g].c]; break; }
          var harmful = piece && (piece.enemyOnly || piece.atkBonus < 0);
          if (t.owner === pi) return harmful ? 40 + worth(t) / 5 : -100;
          if (c.unchainAny && t.hp <= c.unchain) return worth(t) + 30;
          // With nothing to remove, an always-playable Shatter is a small burn spell.
          if (!piece) return c.unchainAny ? 15 + hurtScore(t, c.unchain) / 2 : -100;
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
          return t.maxHp - t.hp >= 2 || devotion(s, t) ? 30 + Math.min(c.mend, t.maxHp - t.hp) * 10 + worth(t) / 10 + devotion(s, t) : -1;
        }
        if (c.blast) {
          t = unitById(s, m.target);
          var cold = t.frozen >= s.turn || (E.tileAt(s, t.r, t.c) || {}).kind === 'frost', bolt = c.iceBlast && cold ? c.iceBlast : c.blast;
          var burn = bolt >= t.hp ? worth(t) + 30 : worth(t) * bolt / t.maxHp + (c.chill ? 10 : 0);
          // Brightlance's push back onto a hazard hurts as well.
          if (c.knock && bolt < t.hp) burn += tileHarm(s, t, t.r + (t.owner === 0 ? 1 : -1), t.c) * 25;
          if (c.splash) s.units.forEach(function (o) { if (o.owner === foe && o !== t && dist(o, t) === 1) burn += c.splash >= o.hp ? worth(o) + 30 : 5; });
          return burn >= 60 ? 40 + burn : -1;
        }
        if (c.hospitality) {
          var mended = 0;
          s.units.forEach(function (a) { if (a.owner === pi) mended += Math.min(c.hospitality, a.maxHp - a.hp) * 9 + (a.hp <= 2 && a.maxHp > a.hp ? 10 : 0); });
          return mended >= 30 ? mended - 5 : -1;
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
          var next = p.lands.length + 1 + c.bonusNext, big = 0;
          p.hand.forEach(function (h) { var hc = E.CARDS[h.c], hcost = E.costOf(s, pi, hc); if (hc.type !== 'land' && hcost > p.lands.length + 1 && hcost <= next) big = Math.max(big, hcost); });
          return big ? 70 + big * 15 : -1;
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
          // A passage that lets the unit attack: land it next to an enemy it can kill, or on the back row to hit the summoner.
          if (c.passageAttack) {
            if (t.acted || t.summonedTurn === s.turn || E.attackOf(s, t) < 1) return -1;
            var dest = { r: m.r, c: m.c }, gain = 0;
            if (m.r === E.backRow(foe)) gain = 80 + E.attackOf(s, t) * 10;
            s.units.forEach(function (e) { if (e.owner === foe && dist(e, dest) === 1 && E.attackOf(s, t) >= e.hp) gain = Math.max(gain, worth(e) + 20); });
            return gain >= 50 ? gain : -1;
          }
          var open = !s.units.some(function (e) { return e.owner === foe && dist({ r: m.r, c: m.c }, e) === 1; });
          return m.r === E.backRow(foe) && open && E.attackOf(s, t) >= 3 ? 55 + E.attackOf(s, t) * 10 : -1;
        }
        if (!m.raise) return 100 + c.cost * 20;
        var raised = p.discard.filter(function (d) { return d.id === m.raise; })[0];
        return 100 + E.CARDS[raised.c].cost * 20;
      case 'enchant':
        c = E.CARDS[handCard(p, m.card).c]; t = unitById(s, m.target);
        if (c.allyOnly) return 40 + worth(t) / 5 + (c.castDraw ? 20 : 0);
        if (c.hunted) return t.owner === foe && worth(t) >= 65 ? 30 + worth(t) / 5 : -100;
        if (c.warrant) return t.owner === foe && worth(t) >= 50 ? 40 + worth(t) + E.attackOf(s, t) * 5 : -100;
        if (c.atkBonus < 0 && t.owner === foe) {
          var saves = threat(s, pi, t, -c.atkBonus);
          return E.attackOf(s, t) >= 2 || saves ? 30 + saves + E.attackOf(s, t) * 3 + (c.enchantHit ? hurtScore(t, c.enchantHit) : 0) : -100;
        }
        if (c.bind && t.owner === foe) return E.attackOf(s, t) >= 2 ? 30 + threat(s, pi, t, 99) + E.attackOf(s, t) * 6 + worth(t) / 5 : -100;
        if (c.hpBonus < 0 && t.owner === foe) return t.hp <= -c.hpBonus ? worth(t) + 30 : 30 + worth(t) / 5 + (doomed(s, t) ? 25 : 0);
        if (c.atkBonus > 0) return t.owner === pi ? 40 + worth(t) / 5 : -100;
        if (c.enchantHit && t.owner === foe && c.enchantHit >= t.hp) return worth(t) + 30;
        return t.owner === foe && E.attackOf(s, t) >= 3 ? 40 + E.attackOf(s, t) * 2 + (c.enchantHit ? hurtScore(t, c.enchantHit) : 0) : -100;
      case 'attackSummoner':
        u = unitById(s, m.unit);
        return E.attackOf(s, u) >= s.players[foe].life ? 100000 : 120 + E.attackOf(s, u) * 10;
      case 'attack':
        return attackScore(s, unitById(s, m.unit), unitById(s, m.target));
      case 'ability':
        u = unitById(s, m.unit);
        var ab = E.CARDS[u.cardId].ability, key = ab.key;
        if (key === 'heal') { t = unitById(s, m.target); return 25 + Math.min(25, (t.maxHp - t.hp) * 10) + worth(t) / 10 + devotion(s, t); }
        if (key === 'rally') return 60;
        if (key === 'healall') return 70;
        if (key === 'study') return 70;
        if (key === 'sift') return 55;
        if (key === 'forage') return 50;
        if (key === 'orders') {
          // Worth it when the extra tile brings an enemy, or the enemy back row, within reach this turn.
          t = unitById(s, m.target);
          var step = E.speed(t), gap = function (d) { return d > step && d <= step + 1; };
          var near = s.units.some(function (e) { return e.owner === foe && gap(dist(t, e) - E.range(t)); }) || gap(Math.abs(t.r - E.backRow(foe)));
          return near && E.attackOf(s, t) > 0 ? 30 + E.attackOf(s, t) * 3 : -1;
        }
        if (key === 'lens') {
          t = unitById(s, m.target);
          return s.units.some(function (e) { return e.owner === foe && dist(t, e) === E.range(t) + 1; }) ? 40 : -1;
        }
        if (key === 'push') {
          // Worth more when it shoves the enemy onto fire, thorns or a snare.
          t = unitById(s, m.target);
          if (!t || t.owner !== foe) return 22;
          return 22 + tileHarm(s, t, t.r + (t.r - u.r), t.c + (t.c - u.c)) * 25;
        }
        if (key === 'zap') { t = unitById(s, m.target); return ab.amount >= t.hp ? worth(t) + 30 : 12 + worth(t) / 10; }
        if (key === 'harvest') { t = unitById(s, m.target); return worth(t) <= 35 || (E.hasKw(t, 'Ledgered') && worth(t) <= 50) ? 35 + (ab.hp ? 10 : 0) : -1; }
        if (key === 'guide') { t = unitById(s, m.target); return E.attackOf(s, t) >= 2 ? 12 + E.attackOf(s, t) * 2 : -1; }
        if (key === 'hallow') {
          var on = unitAt(s, m.r, m.c), foesNear = s.units.filter(function (e) { return e.owner === foe && dist(e, m) <= 2; }).length;
          if (E.tileAt(s, m.r, m.c)) return -1;
          if (on && on.owner === pi) return 20 + worth(on) / 8 + foesNear * 6;
          return on ? -1 : foesNear ? 8 + foesNear * 3 : -1;
        }
        if (key === 'tend') return 45 + worth(unitById(s, m.target)) / 10;
        if (key === 'hold') return 30 + E.attackOf(s, unitById(s, m.target)) * 5;
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
        if (key === 'farheal') { t = unitById(s, m.target); return 25 + Math.min(20, (t.maxHp - t.hp) * 10) + worth(t) / 10 + devotion(s, t); }
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
        var blank = E.hasKw(u, 'Blank'), company = s.units.some(function (a) { return a.owner === pi && a !== u && dist(a, here) === 1; });
        s.units.forEach(function (e) {
          if (e.owner !== foe) return;
          var d = dist(here, e);
          if (d <= E.range(u) && (!blank || company)) bonus = Math.max(bonus, attackScore(s, u, e) / 2);
          if (d === 1 && fells(e, u, E.hitOn(s, e, u))) bonus -= 8;
        });
        // An enemy on overwatch strikes the first unit to end a move in its reach.
        var watch = 0;
        s.units.forEach(function (e) {
          if (e.owner !== foe || !e.watching || dist(here, e) > E.range(e)) return;
          var hit = E.hitOn(s, e, u, 0, true);
          watch = Math.max(watch, fells(e, u, hit) ? worth(u) + 10 : worth(u) * hit / u.maxHp);
        });
        bonus -= watch;
        if (blank && company) bonus += 10;
        s.units.forEach(function (b) {
          if (b === u || b.owner !== pi || !E.hasKw(b, 'Blank') || b.acted || b.summonedTurn === s.turn) return;
          var alone = !E.nextToAlly(s, b);
          if (dist(b, here) === 1 && alone) bonus += 18;
          else if (dist(b, u) === 1 && dist(b, here) > 1 && !s.units.some(function (o) { return o !== u && o.owner === pi && o !== b && dist(o, b) === 1; })) bonus -= 12;
        });
        // A unit with Overwatch gives up its watch by moving, so it moves only to fight.
        if (E.hasKw(u, 'Overwatch') && bonus <= 0) bonus -= 15;
        // Dropped equipment on the tile is worth walking onto.
        (s.drops || []).forEach(function (d) {
          if (d.r === m.r && d.col === m.c && (E.CONFIG.gearDrop === 'anyone' || d.owner === u.owner)) bonus += 30 + (E.CARDS[d.c].atkBonus || 0) * 10;
        });
        // Fire and thorns hurt a unit that ends its turn on them, so stepping off is worth as much as not stepping on.
        return 12 + gain * 12 + bonus - (tileHarm(s, u, m.r, m.c) - Math.max(0, tileHarm(s, u, u.r, u.c))) * 15;
      case 'relic':
        var rel = p.relics.filter(function (r) { return r.id === m.relic; })[0], rk = E.CARDS[rel.c].relic;
        var fresh = s.units.filter(function (a) { return a.owner === pi && a.summonedTurn !== s.turn && !a.acted; });
        if (rk === 'bell') return (s.phase === 'command' || s.free) && fresh.filter(function (a) { return s.units.some(function (o) { return o !== a && o.owner === pi && dist(o, a) === 1; }); }).length >= 2 ? 30 : -1;
        if (rk === 'bellgrow') { t = unitById(s, m.target); return 35 + E.attackOf(s, t) * 2 + worth(t) / 10 + (t.summonedTurn !== s.turn && !t.acted ? 10 : 0); }
        if (rk === 'pick') return 50;
        if (rk === 'scry') return 40;
        if (rk === 'drum') return (s.phase === 'command' || s.free) && fresh.filter(function (a) { return !a.moved; }).length >= 3 ? 25 : -1;
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
      return rowV >= 35 && m.c === Math.floor((E.COLS - 1) / 2) ? rowV : -1;
    }
    if (c.shove) return t.r === E.backRow(pi) ? 40 : -1;
    if (c.debt) return p.life > c.debt + 4 && worth(t) >= 65 ? worth(t) - 20 + (att && att.attacker === t.uid ? 30 : 0) : -1;
    if (c.damage >= t.hp) return worth(t) + (att && att.attacker === t.uid ? 30 : 0);
    return att || !s.pending ? -1 : 5;
  }

  // Scry and pick: a land is wanted while short of them, anything else while it's castable soon.
  function landsAhead(p) { return p.lands.length + p.hand.filter(function (i) { return E.CARDS[i.c].type === 'land'; }).length; }
  function wanted(s, p, id) {
    var c = E.CARDS[id];
    return c.type === 'land' ? landsAhead(p) < 6 : c.cost <= p.lands.length + 2;
  }
  function cardValue(s, p, id) {
    var c = E.CARDS[id];
    if (c.type === 'land') return landsAhead(p) < 5 ? 60 : 5;
    return c.cost <= p.lands.length + 1 ? 40 + c.cost * 5 : 25 - (c.cost - p.lands.length) * 5;
  }

  // The board as one number for player pi: life, units weighted by health, attack and how far forward they stand,
  // cards in hand and relics. Only what pi may know goes in.
  function evaluate(x, pi) {
    if (x.winner === pi) return 1e6;
    if (x.winner === 1 - pi) return -1e6;
    var v = (x.players[pi].life - x.players[1 - pi].life) * LOOK.life;
    x.units.forEach(function (u) {
      var sign = u.owner === pi ? 1 : -1, atk = E.attackOf(x, u);
      var val = worth(u) * (0.4 + 0.6 * u.hp / u.maxHp) + atk * 6 + u.maxHp * 2;
      val += (E.ROWS - 1 - Math.abs(u.r - E.backRow(1 - u.owner))) * LOOK.ahead;
      // Lasting effects. Attack and health bonuses are already in the numbers above; this counts what they don't show.
      // A curse on a unit counts against its owner, and a blessing for them.
      u.enchants.forEach(function (e) {
        var c = E.CARDS[e.c];
        if (c.enemyOnly) { val -= 8 + (c.leaden ? atk * 3 : 0); return; }
        val += 8;
        if (c.vow) val += worth(u) * 0.4;
        if (c.sanctuary) val += worth(u) * 0.25;
      });
      if (u.stasisOpen && u.owner !== pi) val -= atk * 2;
      // A unit with Overwatch that stayed still guards the ground in front of it through the enemy's turn.
      if (E.hasKw(u, 'Overwatch') && !u.moved && !u.acted && u.owner === x.active) val += atk * 4;
      if (E.hasKw(u, 'Blank') && !E.nextToAlly(x, u)) val -= atk * 4;
      if (u.owner !== pi && u.mired >= x.turn) val -= atk * 2;
      (x.hours || []).forEach(function () { if (u.hp <= 2) val -= worth(u) * 0.7; });
      // A frozen, held or stilled enemy loses its next turn's attack.
      if (u.owner !== pi && (u.frozen >= x.turn || u.held >= x.turn || u.stasis >= x.turn || u.sapped >= x.turn)) val -= atk * 4;
      v += sign * val;
    });
    v += x.players[pi].hand.length * LOOK.hand + x.players[pi].relics.length * 25 + (x.players[pi].bonusMana || 0) * 10
      + x.players[pi].relics.reduce(function (n, r) { return n + (r.store || 0) * 6; }, 0);
    return v;
  }
  // With free turns (s.free), units can act before cards are played. unitsFirst plays the rest of the turn
  // that way: any unit move worth making goes before the cards, so an attack can clear a tile to summon into or leave
  // a target for a spell to finish.
  var COMMANDS = { move: 1, attack: 1, ability: 1 };
  function greedy(s, unitsFirst) {
    var moves = E.legalMoves(s, { dedupe: true }), best = null, top = -Infinity, unit = null, unitTop = 0;
    moves.forEach(function (m) {
      var v = score(s, m);
      if (v > top) { top = v; best = m; }
      if (unitsFirst && COMMANDS[m.type] && v > unitTop) { unitTop = v; unit = m; }
    });
    return unit && best.type !== 'playLand' && top < 1000 ? unit : best;
  }
  // Plays the rest of pi's turn greedily and scores where it ends. The copy hides what pi can't know: the enemy's
  // hand is emptied, so no answer is assumed, and pi's own deck and the shuffle seed are scrambled.
  function rollout(s, m, pi, r, unitsFirst) {
    var x = JSON.parse(JSON.stringify(s));
    x.players[1 - pi].hand = [];
    x.seed = Math.floor(r() * 2147483647);
    var deck = x.players[pi].deck;
    for (var k = deck.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)), tmp = deck[k]; deck[k] = deck[j]; deck[j] = tmp; }
    x = E.applyMove(x, m);
    for (var steps = 0; steps < 40 && x.winner === null; steps++) {
      if (x.pending ? x.pending.responder !== pi : x.active !== pi) break;
      if (x.phase !== 'play' && x.phase !== 'command') break;
      var next = greedy(x, unitsFirst);
      if (!next || next.type === 'endTurn') break;
      x = E.applyMove(x, next);
    }
    return evaluate(x, pi);
  }

  // Weights for the lookahead: life point, row forward, card in hand.
  var LOOK = { on: true, width: 4, life: 14, ahead: 3, hand: 12 };
  function choose(s, jitter) {
    var moves = E.legalMoves(s, { dedupe: true }), best = null, top = -Infinity, scored = [];
    moves.forEach(function (m) {
      var v = score(s, m) + (jitter ? jitter() * 3 : 0);
      scored.push({ m: m, v: v });
      if (v > top) { top = v; best = m; }
    });
    // A little lookahead on the bot's own turn: the few best-looking moves are each played out to the end of the turn,
    // and the one that leaves the best board wins. Lands and winning blows need no lookahead.
    var pi = s.active, p = s.players[pi];
    if (!LOOK.on || s.pending || (s.phase !== 'play' && s.phase !== 'command') || p.toBottom || p.scrying || p.picking || top >= 1000) return best;
    var cands = scored.filter(function (x) { return x.v >= 0; }).sort(function (a, b) { return b.v - a.v; }), free = !!s.free;
    // With free turns the best unit action is always tried as well, and each move is played out both ways: the rest of
    // the turn as scored, and with units first.
    var unit = free && cands.filter(function (x) { return COMMANDS[x.m.type]; })[0];
    cands = cands.slice(0, LOOK.width);
    if (unit && cands.indexOf(unit) < 0) cands.push(unit);
    if (cands.length < 2) return best;
    var r = jitter || Math.random, pickBest = null, pickV = -Infinity;
    cands.forEach(function (x) {
      var v = x.m.type === 'endTurn' ? evaluate(s, pi) : free ? Math.max(rollout(s, x.m, pi, r), rollout(s, x.m, pi, r, true)) : rollout(s, x.m, pi, r);
      v += x.v * 0.05;
      if (v > pickV) { pickV = v; pickBest = x.m; }
    });
    return pickBest;
  }
  return { choose: choose, score: score, evaluate: evaluate, LOOK: LOOK };
})();
if (typeof module !== 'undefined') module.exports = Bot;
