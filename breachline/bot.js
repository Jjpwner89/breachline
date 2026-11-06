// Scripted opponent. It only reads its own hand and public board state, and picks from the engine's legal moves.
var Bot = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  function unitById(s, uid) { for (var i = 0; i < s.units.length; i++) if (s.units[i].uid === uid) return s.units[i]; return null; }
  function worth(u) { return E.CARDS[u.cardId].cost * 15 + 20; }
  function handCard(p, id) { for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === id) return p.hand[i]; return null; }
  function dist(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }

  function attackScore(s, u, t, extra) {
    var amt = E.attackAgainst(s, u, t), score = 0;
    if (amt >= t.hp) score += worth(t) + 30;
    else score += worth(t) * (amt / t.maxHp);
    if (extra) score += amt >= extra.hp ? worth(extra) + 30 : worth(extra) * (amt / extra.maxHp);
    if (amt < t.hp && dist(u, t) <= E.range(t)) {
      var back = E.attackAgainst(s, t, u);
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
        var pull = 0;
        s.units.forEach(function (e) { if (e.owner === foe) pull -= Math.abs(e.c - m.c); });
        return 100 + c.cost * 20 + pull - Math.abs(m.c - 2);
      case 'cast':
        c = E.CARDS[handCard(p, m.card).c];
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
          return t.maxHp - t.hp >= 2 ? 30 + Math.min(c.mend, t.maxHp - t.hp) * 10 + worth(t) / 10 : -1;
        }
        if (c.fortify) {
          var mine = s.units.filter(function (a) { return a.owner === pi; }).length;
          return mine >= 2 ? 40 + mine * 25 : -1;
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
        var key = E.CARDS[u.cardId].ability.key;
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
        if (key === 'harvest') return worth(unitById(s, m.target)) <= 35 ? 35 : -1;
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
          if (d === 1 && E.attackOf(s, e) >= u.hp) bonus -= 8;
        });
        return 12 + gain * 12 + bonus;
      case 'respond':
        c = E.CARDS[handCard(p, m.card).c]; t = unitById(s, m.target);
        var att = s.pending.attack;
        if (c.dodge) return E.attackAgainst(s, unitById(s, att.attacker), t) >= t.hp ? worth(t) : -1;
        if (c.shove) return t.r === E.backRow(pi) ? 40 : -1;
        if (c.prevent) {
          var hit = E.attackAgainst(s, unitById(s, att.attacker), t);
          return hit >= t.hp && hit - c.prevent < t.hp ? worth(t) : -1;
        }
        if (c.damage >= t.hp) return worth(t) + (att && att.attacker === t.uid ? 30 : 0);
        return att ? -1 : 5;
    }
    return 0;
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
