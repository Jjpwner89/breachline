// Quick balance check, run by tools/check.sh. Loaded after engine.js, bot.js, decks.js and any patch files.
// Globals: MODE ('card' or 'deck'), ID, GAMES, BASE, and optionally COPIES (card mode, default 2) and REF (card mode:
// a card to put in place of ID instead of leaving the deck as dealt).
//
// Card mode plays pairs of games. Each pair deals a random deck in the card's colour, then plays it twice against the
// same opponent with the same seed: once with COPIES of the card swapped in for random cards, once as dealt. The
// difference in wins is the card's lift, comparable to the lift in the big random-deck audits.
//
// Deck mode plays the deck against every starter and theme deck, sides and first player alternating.
var E = Engine, COLS = ['W', 'R', 'U', 'B', 'G'], LAND = { W: 'land_w', R: 'land_r', U: 'land_u', B: 'land_b', G: 'land_g' };
var POOL = {};
COLS.forEach(function (c) { POOL[c] = Object.keys(E.CARDS).filter(function (id) { var d = E.CARDS[id]; return !d.token && d.type !== 'land' && d.colour === c; }); });
var NEUTRAL = Object.keys(E.CARDS).filter(function (id) { var d = E.CARDS[id]; return !d.token && d.type !== 'land' && d.colour === 'N'; });
function lcg(seed) { var x = seed >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
function pick(r, a) { return a[Math.floor(r() * a.length)]; }
// The same random decks as the big audits: 13 lands and 27 cards, 1 to 3 copies each, now and then a neutral card.
// 40 cards, as games have used since 2026-11-11; the lift bands were refitted on these decks the same day.
function makeDeck(r, col, skip) {
  var list = {}, slots = 27, neutrals = 0;
  while (slots > 0) {
    var id = r() < 0.08 && neutrals < 3 ? pick(r, NEUTRAL) : pick(r, POOL[col]);
    if (list[id] || id === skip) continue;
    if (E.CARDS[id].colour === 'N') neutrals++;
    var n = Math.min(slots, 1 + Math.floor(r() * 3));
    list[id] = n; slots -= n;
  }
  var out = [[LAND[col], 13]];
  for (var k in list) out.push([k, list[k]]);
  return { name: 'Random ' + col, colours: [col], list: out };
}
function swapIn(r, deck, id, n) {
  var list = deck.list.map(function (e) { return [e[0], e[1]]; });
  for (var k = 0; k < n; k++) {
    var spells = list.filter(function (e) { return e[1] > 0 && E.CARDS[e[0]].type !== 'land'; });
    pick(r, spells)[1]--;
  }
  list = list.filter(function (e) { return e[1] > 0; });
  list.push([id, n]);
  return { name: deck.name, colours: deck.colours, list: list };
}
// Plays one game. Returns the result for side 0, the cards side 0 drew or played, and its opening hand.
function play(a, b, seed, first, br) {
  var s = E.newGame({ seed: seed, decks: [a, b], first: first }), n = 0, seen = {}, opening = null;
  while (s.winner === null && n++ < 4000) {
    var m = Bot.choose(s, br), mover = s.pending ? s.pending.responder : s.active;
    if (mover === 0 && m.card !== undefined && s.phase !== 'opening') s.players[0].hand.forEach(function (i) { if (i.id === m.card) seen[i.c] = 2; });
    s = E.applyMove(s, m);
    if (s.phase === 'opening') continue;
    if (!opening) { opening = {}; s.players[0].hand.forEach(function (i) { opening[i.c] = 1; }); }
    s.players[0].hand.forEach(function (i) { if (!seen[i.c]) seen[i.c] = 1; });
  }
  return { won: s.winner === 0 ? 1 : s.winner === null ? 0.5 : 0, seen: seen, opening: opening || {}, turns: s.turn };
}
if (typeof FAST !== 'undefined' && FAST) Bot.LOOK.on = false;
var out = { mode: MODE, id: ID, games: 0, fast: typeof FAST !== 'undefined' && !!FAST };
if (MODE === 'card') {
  var C = E.CARDS[ID]; if (!C) throw new Error('no card ' + ID);
  var copies = typeof COPIES !== 'undefined' ? COPIES : 2;
  out.x = 0; out.y = 0; out.d2 = 0; out.drawn = 0; out.drawnW = 0; out.played = 0; out.open = 0; out.openW = 0; out.notOpenW = 0; out.byCol = {};
  for (var g = 0; g < GAMES / 2; g++) {
    var r = lcg(BASE + g * 7919 + 13), col = C.colour === 'N' ? pick(r, COLS) : C.colour, oc = pick(r, COLS);
    var base = makeDeck(r, col, ID), opp = makeDeck(r, oc, ID);
    var x = swapIn(r, base, ID, copies), y = typeof REF !== 'undefined' ? swapIn(lcg(BASE + g), base, REF, copies) : base;
    var seed = BASE + g * 37 + 11, first = g % 2;
    var px = play(x, opp, seed, first, lcg(seed + 1)), py = play(y, opp, seed, first, lcg(seed + 1));
    var d = px.won - py.won;
    out.games += 2; out.x += px.won; out.y += py.won; out.d2 += d * d;
    var bc = out.byCol[oc] = out.byCol[oc] || { n: 0, d: 0 }; bc.n++; bc.d += d;
    if (px.seen[ID]) { out.drawn++; out.drawnW += px.won; if (px.seen[ID] === 2) out.played++; }
    if (px.opening[ID]) { out.open++; out.openW += px.won; } else out.notOpenW += px.won;
  }
} else {
  var all = Decks.themes().concat(Object.keys(E.DECKS).map(function (k) { return { id: k, name: E.DECKS[k].name, list: E.DECKS[k].list }; }));
  var me = all.filter(function (d) { return d.id === ID; })[0]; if (!me) throw new Error('no deck ' + ID);
  var foes = all.filter(function (d) { return d.id !== ID; });
  out.name = me.name; out.w = 0; out.turns = 0; out.vs = {}; out.open = {};
  for (var g = 0; g < GAMES; g++) {
    var foe = foes[g % foes.length], seed = BASE + g * 37 + 11, p = play(me, foe, seed, (g >> 1) % 2, lcg(seed + 1));
    out.games++; out.w += p.won; out.turns += p.turns;
    var v = out.vs[foe.name] = out.vs[foe.name] || { n: 0, w: 0 }; v.n++; v.w += p.won;
    me.list.forEach(function (e) {
      if (E.CARDS[e[0]].type === 'land') return;
      var o = out.open[e[0]] = out.open[e[0]] || { n: 0, w: 0, nw: 0 };
      if (p.opening[e[0]]) { o.n++; o.w += p.won; } else o.nw += p.won;
    });
  }
}
print(JSON.stringify(out));
