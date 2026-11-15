// Text harness for a Claude playtester: player 0 is "You", player 1 is the lookahead bot. Run through play.sh.
// Globals from play.sh: CMD ('new' | 'decks' | 'show' | 'cards' | 'autoturn' | 'move' | 'do'), ARG, STATE_IN (JSON text or ''),
// DECK0, DECK1 (deck specs), SEED.
var E = Engine, C = E.CARDS;
function actor(s) { return s.pending ? s.pending.responder : s.active; }
// A deck spec is a starter key, a theme id (with or without 'theme-'), or either followed by swaps (red/goblin>flameblade:2)
// and cards to start in the opening hand (winter/+rimebolt), each traded for a spell or unit so the land count stays the same.
var STARTERS = Object.keys(E.DECKS), OPEN = [], DECKN = 0;
function deckSpec(spec) {
  var parts = spec.split('/'), id = parts.shift(), open = parts.filter(function (x) { return x[0] === '+'; }).map(function (x) { return x.slice(1); });
  parts = parts.filter(function (x) { return x[0] !== '+'; });
  var themes = Decks.themes(), base = E.DECKS[id] ? { name: E.DECKS[id].name, colours: E.DECKS[id].colours, list: E.DECKS[id].list }
    : themes.filter(function (t) { return t.id === id || t.id === 'theme-' + id; })[0];
  if (!base) throw new Error('no deck ' + id + ' (play.sh decks lists them)');
  var list = JSON.parse(JSON.stringify(base.list));
  parts.forEach(function (sw) {
    var m = /^([A-Za-z0-9_]+)>([A-Za-z0-9_]+):([0-9]+)$/.exec(sw);
    if (!m) throw new Error('bad swap ' + sw + ' (write out>in:copies)');
    if (!C[m[2]]) throw new Error('no card ' + m[2]);
    var e = list.filter(function (x) { return x[0] === m[1]; })[0], n = +m[3];
    if (!e || e[1] < n) throw new Error(id + ' has fewer than ' + n + ' ' + m[1]);
    e[1] -= n; if (!e[1]) list.splice(list.indexOf(e), 1);
    var f = list.filter(function (x) { return x[0] === m[2]; })[0]; if (f) f[1] += n; else list.push([m[2], n]);
  });
  open.forEach(function (c) { if (!list.some(function (x) { return x[0] === c; })) throw new Error(id + ' has no ' + c + ' to start in hand'); });
  OPEN[DECKN++] = open;
  return parts.length || !E.DECKS[id] ? { name: base.name + (parts.length ? ' (swapped)' : ''), colours: base.colours, list: list } : id;
}
function nm(id) { return C[id] ? C[id].name : id; }
function uAt(s, r, c) { return s.units.filter(function (u) { return u.r === r && u.c === c; })[0]; }
function byId(s, uid) { return s.units.filter(function (u) { return u.uid === uid; })[0]; }
function where(u) { return 'r' + u.r + 'c' + u.c; }
function unitLine(s, u) {
  var d = C[u.cardId], kw = d.keywords.filter(function (k) { return k !== 'Veiled'; }), st = [];
  // Veiled shows the unit's current state, so it drops once the unit attacks and appears under a Mourning veil.
  if (u.veiled) kw.push('Veiled');
  if (u.ward) st.push('ward ' + u.ward);
  if (u.momentum) st.push('momentum +' + u.momentum);
  if (u.seasoned) st.push('seasoned +' + u.seasoned);
  if (u.rooted) st.push('rooted');
  if (u.frozen >= s.turn) st.push('frozen');
  if (u.summonedTurn === s.turn) st.push('just summoned');
  if (u.moved) st.push('moved'); if (u.acted) st.push('acted');
  u.enchants.forEach(function (e) { st.push('has ' + nm(e.c)); });
  return (u.owner === 0 ? 'YOURS ' : 'BOT   ') + where(u) + ' ' + d.name + ' ' + E.attackOf(s, u) + '/' + u.hp + (u.maxHp !== u.hp ? ' (max ' + u.maxHp + ')' : '') + (kw.length ? ' [' + kw.join(', ') + ']' : '') + (st.length ? ' {' + st.join('; ') + '}' : '');
}
function cardLine(s, i) {
  var d = C[i.c], cost = d.type === 'land' ? '' : ' (cost ' + E.costOf(s, 0, d, i) + (E.costOf(s, 0, d, i) !== d.cost ? ', printed ' + d.cost : '') + ')';
  return nm(i.c) + ' — ' + d.type + (d.type === 'unit' ? ' ' + d.atk + '/' + d.hp : '') + cost + (d.keywords && d.keywords.length ? ' [' + d.keywords.join(', ') + ']' : '') + (d.text ? ': ' + d.text : '');
}
function describe(s, m) {
  var p = s.players[actor(s)], card = m.card !== undefined ? p.hand.filter(function (h) { return h.id === m.card; })[0] : null, cn = card ? nm(card.c) : '';
  var t = m.target !== undefined ? byId(s, m.target) : null, tn = t ? (t.owner === 0 ? 'your ' : "bot's ") + nm(t.cardId) + ' ' + where(t) : '';
  var extra = (m.empower ? ' EMPOWERED' + (C[card.c].empower && C[card.c].empower.extra ? ' (pay ' + C[card.c].empower.extra + ' more)' : '') : '') + (m.surge !== undefined ? ' with SURGE X=' + m.surge : '') + (m.reach ? ' with OVERREACH (cheaper, 1 in 3 goes astray)' : '') +
    (m.offer !== undefined ? ' OFFERING your ' + nm(byId(s, m.offer).cardId) + ' ' + where(byId(s, m.offer)) : '') + (m.recall !== undefined ? ' and RECALL your ' + nm(byId(s, m.recall).cardId) + ' ' + where(byId(s, m.recall)) + ' to hand' : '');
  switch (m.type) {
    case 'playLand': return 'play land ' + cn;
    case 'summon': return 'summon ' + cn + ' at r' + m.r + 'c' + m.c + (tn ? ' targeting ' + tn : '') + extra;
    case 'cast': return 'cast ' + cn + (tn ? ' on ' + tn : '') + (m.r !== undefined ? ' aimed at r' + m.r + 'c' + m.c : '') + (m.summoner !== undefined ? ' at the ' + (m.summoner === 0 ? 'your' : "bot's") + ' summoner' : '') + (m.relic !== undefined ? ' destroying a relic' : '') + (m.raise !== undefined ? ' returning ' + nm((p.discard.filter(function (d) { return d.id === m.raise; })[0] || {}).c) : '') + extra;
    case 'enchant': return 'enchant ' + tn + ' with ' + cn + extra;
    case 'tradeIn': return 'TRADE IN ' + cn + ' (pay ' + C[card.c].tradeIn + ', put it on the bottom of your deck, draw a card)';
    case 'move': var u = byId(s, m.unit); return 'move ' + nm(u.cardId) + ' ' + where(u) + ' -> r' + m.r + 'c' + m.c;
    case 'attack': return 'attack ' + tn + ' with ' + nm(byId(s, m.unit).cardId) + ' ' + where(byId(s, m.unit)) + ' (it would deal ' + E.hitOn(s, byId(s, m.unit), t) + ')';
    case 'attackSummoner': return 'attack the enemy summoner with ' + nm(byId(s, m.unit).cardId) + ' ' + where(byId(s, m.unit)) + ' for ' + E.attackOf(s, byId(s, m.unit));
    case 'ability': return 'use ability of ' + nm(byId(s, m.unit).cardId) + ' ' + where(byId(s, m.unit)) + (tn ? ' on ' + tn : '') + (m.r !== undefined ? ' at r' + m.r + 'c' + m.c : '');
    case 'relic': return 'use relic ' + nm((p.relics.filter(function (r) { return r.id === m.relic; })[0] || {}).c) + (tn ? ' on ' + tn : '');
    case 'respond': return 'respond with instant ' + cn + (tn ? ' on ' + tn : '');
    case 'toCommand': return 'done playing cards: go to the command phase (move and attack with units)';
    case 'endTurn': return 'end your turn';
    case 'pass': return 'pass (no response)';
    case 'keepHand': return 'keep this opening hand';
    case 'redraw': return 'redraw your opening hand';
    case 'bottomCard': return 'put ' + cn + ' on the bottom of your deck';
    case 'scry': return (m.bottom ? 'put it on the BOTTOM: ' : 'keep it on TOP: ') + nm(p.scrying.cards[0].c);
    case 'pick': return 'take ' + nm((p.picking.cards.filter(function (x) { return x.id === m.card; })[0] || {}).c);
  }
  return JSON.stringify(m);
}
function view(s) {
  var me = s.players[0], foe = s.players[1], out = [];
  out.push('=== Turn ' + s.turn + ', ' + (s.winner !== null ? 'GAME OVER: ' + (s.winner === 0 ? 'YOU WIN' : s.winner === 1 ? 'BOT WINS' : 'draw') : (actor(s) === 0 ? 'your decision' : "bot's decision")) + ', phase ' + s.phase + ' ===');
  out.push('Your summoner: ' + me.life + ' life, mana ' + me.mana + '/' + me.lands.length + ' lands, deck ' + me.deck.length + ', discard ' + me.discard.length + (me.stratagems && me.stratagems.length ? ', your stratagems set: ' + me.stratagems.map(function (x) { return nm(x.c); }).join(', ') : ''));
  out.push('Bot summoner:  ' + foe.life + ' life, ' + foe.lands.length + ' lands, hand ' + foe.hand.length + ', deck ' + foe.deck.length + ', discard ' + foe.discard.length + (foe.stratagems && foe.stratagems.length ? ', FACE-DOWN STRATAGEMS: ' + foe.stratagems.length : '') + (foe.relics.length ? ', relics: ' + foe.relics.map(function (r) { return nm(r.c); }).join(', ') : ''));
  out.push('Board (row 0 = bot back row, row ' + (E.ROWS - 1) + ' = your back row; you reach the bot summoner from row 0):');
  for (var r = 0; r < E.ROWS; r++) {
    var row = 'r' + r + ' ';
    for (var c = 0; c < E.COLS; c++) { var u = uAt(s, r, c), t = E.tileAt(s, r, c); row += u ? (u.owner === 0 ? '[Y' : '[B') + E.attackOf(s, u) + '/' + u.hp + ']' : t ? '[ ' + t.kind.slice(0, 3) + ' ]' : '[  .  ]'; }
    out.push(row);
  }
  out.push('     c0     c1     c2     c3     c4     c5');
  s.units.forEach(function (u) { out.push('  ' + unitLine(s, u)); });
  if (me.discard.length) out.push('Your discard pile: ' + me.discard.map(function (i) { return nm(i.c); }).join(', '));
  if (me.relics.length) out.push('Your relics: ' + me.relics.map(function (x) { return nm(x.c); }).join(', '));
  out.push('Your hand:'); me.hand.forEach(function (i) { out.push('  - ' + cardLine(s, i)); });
  if (me.scrying) out.push('Looking at the top of your deck: ' + nm(me.scrying.cards[0].c));
  if (s.winner === null && actor(s) === 0) {
    out.push('Legal moves:');
    // Identical moves (two copies of the same card) are listed once, under the first one's number.
    var shown = {}; E.legalMoves(s, { dedupe: true }).forEach(function (m, k) { var d = describe(s, m); if (shown[d]) return; shown[d] = 1; out.push('  ' + k + ': ' + d); });
  }
  return out.join('\n');
}
// Cards on test start in the opening hand, and again after a redraw, each traded for a spell or unit.
function dealOpen(s) {
  (s.ptOpen || []).forEach(function (ids, pi) {
    var p = s.players[pi];
    ids.forEach(function (c) {
      if (p.hand.some(function (h) { return h.c === c; })) return;
      var k = p.deck.map(function (d) { return d.c; }).indexOf(c), h = p.hand.map(function (x) { return C[x.c].type !== 'land' && ids.indexOf(x.c) < 0; }).indexOf(true);
      // A hand with no spell or unit left to trade gives up a land instead, while it keeps at least two.
      var lands = p.hand.filter(function (x) { return C[x.c].type === 'land'; }).length;
      if (h < 0 && lands > 2) h = p.hand.map(function (x) { return C[x.c].type === 'land'; }).indexOf(true);
      if (k < 0 || h < 0) return;
      var t = p.hand[h]; p.hand[h] = p.deck[k]; p.deck[k] = t;
    });
  });
}
function botUntilYou(s) {
  var n = 0;
  while (s.winner === null && actor(s) === 1 && n++ < 400) s = E.applyMove(s, Bot.choose(s));
  return s;
}
function logSince(s, k) { return s.log.slice(k).map(function (e) { return '  [t' + e.turn + '] ' + e.text; }).join('\n'); }
var s, mark0;
if (CMD === 'decks') {
  print('Starters: ' + STARTERS.map(function (k) { return k + ' (' + E.DECKS[k].name + ')'; }).join(', '));
  print('Theme decks:'); Decks.themes().forEach(function (t) { print('  ' + t.id.replace(/^theme-/, '') + ': ' + t.name + '. ' + t.note); });
  quit();
}
if (CMD === 'new') {
  s = E.newGame({ seed: SEED, decks: [deckSpec(DECK0), deckSpec(DECK1 || STARTERS[SEED % STARTERS.length])], first: SEED % 2 });
  s.ptOpen = OPEN; dealOpen(s);
  s.players.forEach(function (p) { p.deckName = p.name; }); s.players[0].name = 'You'; s.players[1].name = 'Bot';
  mark0 = 0; s = botUntilYou(s);
  print('New game, seed ' + SEED + ': your ' + s.players[0].deckName + ' against the bot, playing ' + s.players[1].deckName + '. ' + (SEED % 2 === 0 ? 'You go first.' : 'The bot goes first.'));
} else {
  s = JSON.parse(STATE_IN); mark0 = s.log.length;
  if (CMD === 'move' || CMD === 'do') {
    var moves = E.legalMoves(s, { dedupe: true }), m = /^[0-9]+$/.test(ARG) ? moves[+ARG] : null;
    if (CMD === 'do') { var hits = moves.filter(function (x) { return describe(s, x).toLowerCase().replace(/'/g, '').indexOf(ARG.toLowerCase().replace(/'/g, '')) >= 0; }); if (hits.length > 1 && hits.every(function (x) { return describe(s, x) === describe(s, hits[0]); })) hits = [hits[0]]; m = hits.length === 1 ? hits[0] : null; if (hits.length > 1) print(hits.length + ' moves match; be more specific:\n' + hits.map(function (x) { return '  ' + describe(s, x); }).join('\n')); }
    if (!m || actor(s) !== 0) print('No such move: ' + ARG);
    else { print('You: ' + describe(s, m)); s = E.applyMove(s, m); if (m.type === 'redraw') dealOpen(s); s = botUntilYou(s); }
  }
}
if (CMD === 'cards') {
  var seen = {};
  s.players.forEach(function (p) { p.deck.concat(p.hand, p.discard).forEach(function (i) { seen[i.c] = 1; }); });
  s.units.forEach(function (u) { seen[u.cardId] = 1; });
  Object.keys(seen).filter(function (id) { return C[id].type !== 'land'; }).forEach(function (id) { var d = C[id]; print(d.name + ' (' + d.colour + ' ' + d.type + ', cost ' + d.cost + (d.type === 'unit' ? ', ' + d.atk + '/' + d.hp : '') + ')' + (d.keywords && d.keywords.length ? ' [' + d.keywords.join(', ') + ']' : '') + ': ' + (d.text || 'no rules text')); });
}
if (CMD === 'autoturn' && actor(s) === 0) {
  var t0 = s.turn, k = 0;
  while (s.winner === null && actor(s) === 0 && s.turn === t0 && k++ < 200) s = E.applyMove(s, Bot.choose(s));
  print('The bot played the rest of your turn for you.');
  s = botUntilYou(s);
}
var newLog = logSince(s, mark0);
if (newLog) print('What happened:\n' + newLog);
print(view(s));
print('STATE:' + JSON.stringify(s));
