// Merges quickcheck.js results and prints the report. Run by tools/check.sh after engine.js and rarity.js;
// the result files are the script's arguments.
// The bands are where most cards of each rarity land, refitted on the 40-card audit of 2026-11-11 (150,000 games).
// They are provisional: the creator is still deciding how much better each rarity should be.
var BANDS = { c: [-1.5, 0.5], u: [-1, 1], r: [-0.5, 2], l: [1, 3.5] };
// Paired games read larger than the audit's lift, because nothing else differs between the two decks. Calibrated on
// seven cards from the Elder dragon to Illusory decoy at 40 cards (2026-11-11); lifts print on the audit's scale.
var SCALE = 0.65;
var parts = arguments.map(function (f) { return JSON.parse(read(f)); });
var M = parts[0], E = Engine, f1 = function (x) { return (x >= 0 ? '+' : '') + x.toFixed(1); };
function sum(k) { return parts.reduce(function (a, p) { return a + p[k]; }, 0); }
if (M.mode === 'card') {
  var C = E.CARDS[M.id], rar = Rarity.of(M.id), pairs = sum('games') / 2;
  var x = sum('x'), y = sum('y'), d2 = sum('d2'), mean = (x - y) / pairs;
  var se = Math.sqrt(Math.max(0, d2 / pairs - mean * mean) / pairs) * 100 * SCALE, lift = mean * 100 * SCALE;
  var band = BANDS[rar], lo = lift - 2 * se, hi = lift + 2 * se;
  var verdict = hi < band[0] ? 'BELOW its band' : lo > band[1] ? 'ABOVE its band' : lift < band[0] ? 'probably below its band' : lift > band[1] ? 'probably above its band' : 'in its band';
  if (lift < -6 && hi < -3) verdict += ', and dead';
  if (lift > 8 && lo > 5) verdict += ', and broken';
  print(C.name + ' (' + Rarity.name(M.id) + ', ' + C.cost + ' mana): lift ' + f1(lift) + ' ± ' + (2 * se).toFixed(1) + ' over ' + pairs + ' paired games' + (M.fast ? ', plain bot' : ''));
  print('  ' + Rarity.name(M.id) + ' band ' + f1(band[0]) + ' to ' + f1(band[1]) + ': ' + verdict);
  var drawn = sum('drawn'), open = sum('open');
  print('  played in ' + Math.round(100 * sum('played') / Math.max(1, drawn)) + '% of the games it was drawn in');
  print('  win with it in the opening hand ' + Math.round(100 * sum('openW') / Math.max(1, open)) + '% (' + open + ' games), without ' + Math.round(100 * sum('notOpenW') / Math.max(1, pairs - open)) + '%');
  var by = {};
  parts.forEach(function (p) { for (var c in p.byCol) { var b = by[c] = by[c] || { n: 0, d: 0 }; b.n += p.byCol[c].n; b.d += p.byCol[c].d; } });
  print('  lift by opponent colour: ' + Object.keys(by).sort().map(function (c) { return c + ' ' + f1(100 * SCALE * by[c].d / by[c].n); }).join('  '));
} else {
  var n = sum('games'), w = sum('w'), p = w / n, vs = {}, open = {};
  parts.forEach(function (q) {
    for (var k in q.vs) { var v = vs[k] = vs[k] || { n: 0, w: 0 }; v.n += q.vs[k].n; v.w += q.vs[k].w; }
    for (var c in q.open) { var o = open[c] = open[c] || { n: 0, w: 0, nw: 0 }; o.n += q.open[c].n; o.w += q.open[c].w; o.nw += q.open[c].nw; }
  });
  var rates = Object.keys(vs).map(function (k) { return { k: k, p: 100 * vs[k].w / vs[k].n }; }).sort(function (a, b) { return b.p - a.p; });
  var avg = rates.reduce(function (a, r) { return a + r.p; }, 0) / rates.length;
  var sd = Math.sqrt(rates.reduce(function (a, r) { return a + (r.p - avg) * (r.p - avg); }, 0) / rates.length);
  print(M.name + ': wins ' + (100 * p).toFixed(1) + '% ± ' + (200 * Math.sqrt(p * (1 - p) / n)).toFixed(1) + ' over ' + n + ' games against the other decks, ' + (sum('turns') / n).toFixed(1) + ' turns a game');
  print('  matchups: spread (SD) ' + sd.toFixed(1) + ', best ' + rates[0].k + ' ' + rates[0].p.toFixed(0) + '%, worst ' + rates[rates.length - 1].k + ' ' + rates[rates.length - 1].p.toFixed(0) + '%');
  print('  ' + rates.map(function (r) { return r.k + ' ' + r.p.toFixed(0); }).join(', '));
  print('  reliance: win with the card in the opening hand minus without (cards in 15%+ of opening hands)');
  Object.keys(open).map(function (c) { var o = open[c]; return { c: c, n: o.n, g: 100 * (o.w / Math.max(1, o.n) - o.nw / Math.max(1, n - o.n)) }; })
    .filter(function (o) { return o.n >= n * 0.15 && n - o.n >= n * 0.15; }).sort(function (a, b) { return b.g - a.g; })
    .forEach(function (o) { print('    ' + f1(o.g) + '  ' + E.CARDS[o.c].name + ' (' + Math.round(100 * o.n / n) + '% of hands)'); });
}
