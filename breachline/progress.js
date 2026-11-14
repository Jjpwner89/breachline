// The player's collection and everything that changes it: the free starter, packs, battle rewards, crafting, milestones and the
// unlock-everything password. Decisions are in PROGRESSION.md.
//
// Progress is a ledger: every grant and spend is an entry with its own id, and the counts are worked out from all of them. Each
// browser appends to its own chunks, so two devices merge by taking every chunk, never by one overwriting the other. A chunk only
// ever grows, so the longer copy of a chunk is always the newer one. Entries with fixed ids (the starter, a battle, a milestone)
// count once however many devices recorded them.
var Progress = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  var R = typeof Rarity !== 'undefined' ? Rarity : require('./rarity.js');
  var KEY = 'breachline.progress.v1', CHUNK = 400, MAX = 3;
  var UNLOCK_HASH = 'ddacf85d8604913b6b0fed3a41a18bb2a84858b58c9a0c2b1b7295692a9e6408';
  // Gift codes, by the hash of the code in capitals, and the gold each gives. The code itself isn't kept anywhere in the game.
  var GIFTS = { '0d9909cf0bca89d9f27f1f215d5218364915bb1b094f72206c75b7fef47a52ec': 500 };

  // Pack slots: c, u and r are that rarity; R is rare with a 1 in 8 chance of legendary; L is legendary half the time, else rare.
  var PACKS = {
    field: { name: 'Field pack', cost: 100, slots: ['c', 'c', 'c', 'c', 'c', 'u', 'u', 'R'], blurb: 'Five commons, two uncommons and a rare, sometimes a legendary.' },
    strongbox: { name: 'Strongbox', cost: 250, slots: ['c', 'c', 'c', 'u', 'u', 'u', 'R', 'R'], blurb: 'Three commons, three uncommons and two rares.' },
    warchest: { name: 'War chest', cost: 500, slots: ['c', 'c', 'u', 'u', 'u', 'R', 'R', 'L'], blurb: 'Fewer commons, two rares and a good chance of a legendary.' }
  };
  var ORDER = ['field', 'strongbox', 'warchest'];
  // A pack of one alignment costs this much more than a mixed one.
  var ALIGNED = 1.6;
  var SHARDS = { gain: { c: 10, u: 20, r: 50, l: 200 }, craft: { c: 50, u: 100, r: 250, l: 1000 } };
  // Battle rewards. Finishing pays, winning pays more, and each line of the battle summary adds a little.
  var GOLD = { finish: 10, win: 40, unit: 1, spell: 1, land: 1, kill: 2, damage: 1 };
  var VS = { bot: 1, easy: 1, normal: 1.25, hard: 1.5, human: 1.5 };
  var MILESTONE = { set: 150, full: 400 };
  var COMPLETE = 300;

  var store = null, mem = null, cache = null, listeners = [], remote = null, dirty = {}, pushing = false, ready = false, status = 'local';
  try {
    store = window.localStorage;
    store.setItem(KEY + '.test', '1');
    store.removeItem(KEY + '.test');
  } catch (e) { store = null; }

  function rid() { return Math.random().toString(36).slice(2, 8); }
  function blank() { return { v: 1, device: 'd' + Date.now().toString(36) + rid(), chunks: {} }; }
  // Entries are checked on the way in, so a damaged chunk can't break the fold.
  function cleanChunk(list) { return Array.isArray(list) ? list.filter(function (e) { return e && typeof e.id === 'string' && typeof e.t === 'string'; }) : []; }
  function load() {
    var raw = null;
    if (store) { try { raw = store.getItem(KEY); } catch (e) {} } else raw = mem;
    if (raw) {
      try {
        var d = JSON.parse(raw);
        if (d && d.device && d.chunks) { Object.keys(d.chunks).forEach(function (k) { d.chunks[k] = cleanChunk(d.chunks[k]); }); return d; }
      } catch (e) {}
      // A file that can't be read is kept to one side rather than overwritten.
      if (store) { try { store.setItem(KEY + '.corrupt.' + Date.now(), raw); } catch (e) {} }
    }
    var fresh = blank();
    save(fresh);
    return fresh;
  }
  function save(d) {
    var text = JSON.stringify(d);
    if (!store) { mem = text; return true; }
    try { store.setItem(KEY, text); return true; } catch (e) { return false; }
  }
  function entries(d) {
    var all = [];
    Object.keys(d.chunks).forEach(function (k) { all.push.apply(all, d.chunks[k]); });
    return all.sort(function (a, b) { return (a.at || 0) - (b.at || 0) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
  }
  function known(id) { return Object.prototype.hasOwnProperty.call(E.CARDS, id); }
  function add(cards, id, n) { if (known(id)) cards[id] = (cards[id] || 0) + n; }

  // Works the whole state out from the ledger. Unknown card ids are kept in the ledger but don't count until the card exists.
  function fold(list) {
    var st = { cards: {}, gold: 0, shards: 0, starters: [], starter: null, cleared: {}, prestiged: {}, unlocked: false, battles: [], milestones: {}, packs: 0, ids: {} };
    list.forEach(function (e) {
      if (st.ids[e.id]) return;
      st.ids[e.id] = true;
      if (e.t === 'start' || e.t === 'clear') {
        var deck = E.DECKS[e.deck];
        if (deck && st.starters.indexOf(e.deck) < 0) {
          st.starters.push(e.deck);
          deck.list.forEach(function (x) { if (E.CARDS[x[0]] && E.CARDS[x[0]].type !== 'land') add(st.cards, x[0], x[1]); });
        }
        if (e.t === 'start' && !st.starter) st.starter = e.deck;
      }
      if (e.t === 'clear' || e.t === 'campaign') {
        (e.cards || []).forEach(function (id) { add(st.cards, id, 1); });
        st.cleared[e.story] = (st.cleared[e.story] || 0) + 1;
        if (e.prestige) st.prestiged[e.story] = (st.prestiged[e.story] || 0) + 1;
        st.gold += e.gold || 0;
      }
      if (e.t === 'pack') { st.gold -= e.cost || 0; st.packs += 1; (e.cards || []).forEach(function (id) { add(st.cards, id, 1); }); }
      if (e.t === 'battle') { st.gold += e.gold || 0; st.battles.push(e); }
      if (e.t === 'break') { Object.keys(e.cards || {}).forEach(function (id) { add(st.cards, id, -e.cards[id]); }); st.shards += e.shards || 0; }
      if (e.t === 'craft') { add(st.cards, e.card, 1); st.shards -= e.shards || 0; }
      if (e.t === 'milestone') { st.milestones[e.key] = e; st.gold += e.gold || 0; }
      if (e.t === 'unlock') st.unlocked = !!e.on;
      if (e.t === 'gift') st.gold += e.gold || 0;
    });
    Object.keys(st.cards).forEach(function (id) { if (st.cards[id] < 0) st.cards[id] = 0; });
    return st;
  }
  function state() {
    if (!cache) cache = fold(entries(load()));
    return cache;
  }
  function changed() {
    cache = null;
    listeners.slice().forEach(function (fn) { try { fn(); } catch (e) { console.warn(e); } });
  }

  // Appends to this browser's newest chunk, reading storage first so another tab's entries aren't lost.
  function append(entry) {
    var d = load(), n = 0;
    while (d.chunks[d.device + '.' + (n + 1)]) n++;
    var key = d.device + '.' + n;
    if ((d.chunks[key] || []).length >= CHUNK) key = d.device + '.' + (n + 1);
    entry.id = entry.id || d.device + ':' + Date.now().toString(36) + rid();
    entry.at = entry.at || Date.now();
    (d.chunks[key] = d.chunks[key] || []).push(entry);
    if (!save(d)) return null;
    dirty[key] = true;
    changed();
    push();
    return entry;
  }
  function has(id) { return !!state().ids[id]; }

  // Cards

  function eligible(id) { var c = E.CARDS[id]; return c && !c.token && c.type !== 'land'; }
  function allCards() { return Object.keys(E.CARDS).filter(eligible); }
  function count(id) { return state().cards[id] || 0; }
  // How many copies a deck may use: every land, and up to three of a card you own, or of any card once unlocked.
  function usable(id) {
    if (E.CARDS[id] && E.CARDS[id].type === 'land') return Infinity;
    return state().unlocked ? MAX : Math.min(MAX, count(id));
  }
  function missing(list) {
    return list.reduce(function (n, e) { return n + Math.max(0, e[1] - usable(e[0])); }, 0);
  }

  function chooseStarter(key) {
    if (!E.DECKS[key] || state().starter) return false;
    var e = append({ id: 'start', t: 'start', deck: key });
    if (e) milestones();
    return !!e;
  }

  // Packs

  function packCost(tier, colour) { return Math.round(PACKS[tier].cost * (colour ? ALIGNED : 1)); }
  function roll(slot, rand) {
    if (slot === 'R') return rand() < 1 / 8 ? 'l' : 'r';
    if (slot === 'L') return rand() < 0.5 ? 'l' : 'r';
    return slot;
  }
  // The cards in a pack. A rarity the colour lacks falls to the next one down, and a pack never holds the same card twice.
  function draw(tier, colour, rand) {
    rand = rand || Math.random;
    var pool = allCards().filter(function (id) { return !colour || E.CARDS[id].colour === colour; }), out = [];
    PACKS[tier].slots.forEach(function (slot) {
      var want = R.ORDER.indexOf(roll(slot, rand)), pick = null;
      for (var r = want; r >= 0 && !pick; r--) {
        var from = pool.filter(function (id) { return R.of(id) === R.ORDER[r] && out.indexOf(id) < 0; });
        if (from.length) pick = from[Math.floor(rand() * from.length)];
      }
      if (pick) out.push(pick);
    });
    return out.sort(function (a, b) { return R.ORDER.indexOf(R.of(a)) - R.ORDER.indexOf(R.of(b)); });
  }
  function buyPack(tier, colour) {
    if (!PACKS[tier]) return null;
    var cost = packCost(tier, colour);
    if (state().gold < cost) return null;
    var e = append({ t: 'pack', tier: tier, colour: colour || null, cost: cost, cards: draw(tier, colour) });
    if (e) milestones();
    return e;
  }

  // Crafting. Only copies beyond the three a deck can hold break down, and you choose each one.
  function spare(id) { return Math.max(0, count(id) - MAX); }
  function breakDown(ids) {
    var cards = {}, shards = 0;
    ids.forEach(function (id) {
      var n = spare(id);
      if (!n) return;
      cards[id] = n;
      shards += n * SHARDS.gain[R.of(id)];
    });
    if (!shards) return null;
    return append({ t: 'break', cards: cards, shards: shards });
  }
  function craftCost(id) { return SHARDS.craft[R.of(id)]; }
  function craft(id) {
    if (!eligible(id) || count(id) >= MAX || state().shards < craftCost(id)) return null;
    var e = append({ t: 'craft', card: id, shards: craftCost(id) });
    if (e) milestones();
    return e;
  }

  // Milestones: one of every card in a faction, then three of every one.
  function factionProgress() {
    var cards = state().cards;
    return E.FACTIONS.map(function (f) {
      var ids = f.cards.filter(eligible);
      return {
        id: f.id, name: f.name, colour: f.colour, total: ids.length,
        one: ids.filter(function (id) { return (cards[id] || 0) >= 1; }).length,
        three: ids.filter(function (id) { return (cards[id] || 0) >= MAX; }).length
      };
    });
  }
  function title(f, kind) { return (kind === 'full' ? 'Warden of ' : 'Keeper of ') + f.name.replace(/^The /, 'the '); }
  function milestones() {
    var got = [];
    factionProgress().forEach(function (f) {
      [['set', f.one], ['full', f.three]].forEach(function (k) {
        var key = k[0] + ':' + f.id;
        if (k[1] < f.total || has('ms:' + key)) return;
        var e = append({ id: 'ms:' + key, t: 'milestone', key: key, title: title(f, k[0]), gold: MILESTONE[k[0]] });
        if (e) got.push(e);
      });
    });
    return got;
  }

  // Battles. The summary's lines are the reward, so what it shows is exactly what was paid.
  function rewardLines(b) {
    var t = b.tally || {}, lines = [['Battle fought', GOLD.finish]];
    if (b.result === 'win') lines.push(['Victory', GOLD.win]);
    lines.push(['Units played', (t.units || 0) * GOLD.unit, t.units || 0]);
    lines.push(['Spells played', (t.spells || 0) * GOLD.spell, t.spells || 0]);
    lines.push(['Lands played', (t.lands || 0) * GOLD.land, t.lands || 0]);
    lines.push(['Enemy units destroyed', (t.kills || 0) * GOLD.kill, t.kills || 0]);
    lines.push(['Damage to the enemy summoner', (t.damage || 0) * GOLD.damage, t.damage || 0]);
    var sum = lines.reduce(function (n, l) { return n + l[1]; }, 0), mult = (VS[b.vs] || 1) * (b.boost || 1);
    return { lines: lines, mult: mult, total: Math.round(sum * mult) };
  }
  // b: { key, result: 'win' | 'loss' | 'draw', vs, boost, deck, opp, turns, life, tally }. A battle pays once, however often it's reported.
  function battle(b) {
    var id = 'b:' + b.key, pay = rewardLines(b);
    if (has(id)) return { pay: pay, entry: state().battles.filter(function (x) { return x.id === id; })[0], again: true };
    var e = append({ id: id, t: 'battle', result: b.result, vs: b.vs, deck: b.deck, opp: b.opp, turns: b.turns, life: b.life, tally: b.tally, boost: b.boost || 1, gold: pay.total, story: b.story || null });
    return { pay: pay, entry: e };
  }
  function record() {
    var by = {}, all = { win: 0, loss: 0, draw: 0 };
    state().battles.forEach(function (b) {
      all[b.result] = (all[b.result] || 0) + 1;
      var r = by[b.deck] = by[b.deck] || { deck: b.deck, win: 0, loss: 0, draw: 0, last: 0 };
      r[b.result] += 1;
      r.last = Math.max(r.last, b.at);
    });
    return { all: all, decks: Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.last - a.last; }), recent: state().battles.slice(-40).reverse() };
  }

  // Campaigns. The first clear unlocks the campaign's starter and keeps the cards picked on the way; later clears pay gold
  // instead, and a prestige clear pays double and earns the campaign its prestige badge.
  function campaignWon(story, starter, taken, key, prestige) {
    var first = !state().cleared[story];
    var e = first
      ? append({ id: 'clear:' + story, t: 'clear', story: story, deck: starter, cards: (taken || []).filter(eligible), gold: COMPLETE })
      : prestige
        ? append({ id: 'cw:' + story + ':' + key, t: 'campaign', story: story, cards: [], gold: COMPLETE * 2, prestige: true })
        : append({ id: 'cw:' + story + ':' + key, t: 'campaign', story: story, cards: [], gold: COMPLETE });
    if (e) milestones();
    return e;
  }
  function cleared(story) { return state().cleared[story] || 0; }
  function prestiged(story) { return state().prestiged[story] || 0; }

  // The password sets a flag rather than adding cards, so switching it off leaves the real counts untouched.
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function unlock(password) {
    var subtle = typeof crypto !== 'undefined' && crypto.subtle;
    if (!subtle) return Promise.resolve(false);
    return subtle.digest('SHA-256', new TextEncoder().encode(String(password).trim())).then(function (buf) {
      if (hex(buf) !== UNLOCK_HASH) return false;
      return !!append({ t: 'unlock', on: true });
    });
  }
  function lock() { return !!append({ t: 'unlock', on: false }); }

  // A gift code pays once per player: its entry has a fixed id, so a second use, on this device or another, adds nothing.
  function redeem(code) {
    var subtle = typeof crypto !== 'undefined' && crypto.subtle;
    if (!subtle) return Promise.resolve({ ok: false, why: 'wrong' });
    return subtle.digest('SHA-256', new TextEncoder().encode(String(code).trim().toUpperCase())).then(function (buf) {
      var h = hex(buf), id = 'gift:' + h.slice(0, 16);
      if (!GIFTS[h]) return { ok: false, why: 'wrong' };
      if (state().ids[id]) return { ok: false, why: 'used' };
      return append({ id: id, t: 'gift', gold: GIFTS[h] }) ? { ok: true, gold: GIFTS[h] } : { ok: false, why: 'unsaved' };
    });
  }

  // The save file holds the whole ledger and the saved decks. Loading merges, so an old file can't take away anything newer.
  function exportText() {
    var d = load();
    return JSON.stringify({ game: 'Breachline', kind: 'save', version: 1, saved: new Date().toISOString(), chunks: d.chunks, decks: typeof Decks !== 'undefined' ? Decks.saved() : [] }, null, 1);
  }
  function importText(text) {
    var f;
    try { f = JSON.parse(text); } catch (e) { return { ok: false, why: "That file isn't a Breachline save." }; }
    if (!f || f.game !== 'Breachline' || f.kind !== 'save' || !f.chunks) return { ok: false, why: "That file isn't a Breachline save." };
    var d = load(), added = 0;
    Object.keys(f.chunks).forEach(function (k) {
      if (!/^[A-Za-z0-9]+\.\d+$/.test(k)) return;
      var theirs = cleanChunk(f.chunks[k]);
      if (theirs.length > (d.chunks[k] || []).length) { added += theirs.length - (d.chunks[k] || []).length; d.chunks[k] = theirs; dirty[k] = true; }
    });
    if (!save(d)) return { ok: false, why: "This browser wouldn't save it." };
    var decks = typeof Decks !== 'undefined' && Array.isArray(f.decks) ? Decks.adopt(f.decks) : 0;
    changed();
    push();
    milestones();
    return { ok: true, entries: added, decks: decks };
  }

  // The account copy, in the viewer's private part of the page's database. Nothing here blocks play: until the account answers,
  // or if it never does, the browser copy is the working one.
  function retried(call) {
    return call().catch(function (e) {
      if (!e || e.code !== 'unavailable') throw e;
      return new Promise(function (done) { setTimeout(done, 500 + Math.random() * 1000); }).then(call);
    });
  }
  function push() {
    var key = Object.keys(dirty)[0];
    if (!remote || pushing || !key) return;
    delete dirty[key];
    pushing = true;
    var list = load().chunks[key] || [];
    retried(function () { return remote.doc(key).set({ entries: list, updated: Date.now() }); })
      .catch(function (e) { dirty[key] = true; console.warn('Progress not saved to your account yet:', e && e.code); if (e && e.code === 'quota_exceeded') status = 'full'; })
      .then(function () { pushing = false; if (!dirty[key]) push(); });
  }
  function merge(snap) {
    var d = load(), grew = false, theirs = {};
    snap.docs.forEach(function (doc) {
      var body = doc.data(), list = cleanChunk(body && body.entries);
      theirs[doc.id] = list.length;
      var mine = d.chunks[doc.id] || [];
      if (list.length > mine.length) { d.chunks[doc.id] = list; grew = true; }
      else if (mine.length > list.length) dirty[doc.id] = true;
    });
    if (!snap.metadata || !snap.metadata.fromCache) Object.keys(d.chunks).forEach(function (k) { if (!(k in theirs) && d.chunks[k].length) dirty[k] = true; });
    if (grew) { save(d); changed(); }
    push();
  }
  var readyFns = [];
  function becomeReady(how) {
    if (how) status = how;
    if (ready) return changed();
    ready = true;
    readyFns.splice(0).forEach(function (fn) { fn(); });
    changed();
  }
  function connect() {
    // Inside Claude the page's own account holds the copy. On the hosted copy a signed-in account does (accounts.js).
    var host = typeof window === 'undefined' ? null : window.claude && window.claude.use ? window.claude : typeof Accounts !== 'undefined' ? Accounts.host() : null;
    if (!host) return becomeReady('local');
    status = 'loading';
    var timer = setTimeout(function () { becomeReady('offline'); }, 10000);
    Promise.all([host.use('db'), host.use('user')]).then(function (got) {
      if (!got[0] || !got[1]) { clearTimeout(timer); return becomeReady('local'); }
      return got[1].id().then(function (uid) {
        if (!uid) { clearTimeout(timer); return becomeReady('local'); }
        remote = got[0].doc('data/users/' + uid + '/progress').collection('ledger');
        remote.onSnapshot(function (snap) {
          merge(snap);
          if (!snap.metadata || !snap.metadata.fromCache) { clearTimeout(timer); becomeReady('synced'); }
        }, function (e) { clearTimeout(timer); console.warn('Progress is staying in this browser for now:', e && e.code); becomeReady('offline'); });
      });
    }).catch(function (e) { clearTimeout(timer); console.warn('Progress is staying in this browser for now:', e && e.code); becomeReady('local'); });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', function (e) { if (e.key === KEY) changed(); });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') push(); });
  }
  connect();

  return {
    PACKS: PACKS, PACK_ORDER: ORDER, SHARDS: SHARDS, GOLD: GOLD, VS: VS, MAX: MAX,
    state: state, count: count, usable: usable, missing: missing, allCards: allCards, spare: spare,
    chooseStarter: chooseStarter, packCost: packCost, draw: draw, buyPack: buyPack,
    breakDown: breakDown, craft: craft, craftCost: craftCost, factionProgress: factionProgress,
    rewardLines: rewardLines, battle: battle, record: record, campaignWon: campaignWon, cleared: cleared, prestiged: prestiged,
    unlock: unlock, lock: lock, redeem: redeem, exportText: exportText, importText: importText,
    ready: function () { return ready; }, whenReady: function (fn) { if (ready) fn(); else readyFns.push(fn); },
    status: function () { return status; }, persistent: function () { return !!store || !!remote; },
    onChange: function (fn) { listeners.push(fn); }, fold: fold
  };
})();
if (typeof module !== 'undefined') module.exports = Progress;
