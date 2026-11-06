// Saved decks and the card pool. No DOM, so the screens and a future campaign or pack system all go through here.
var Decks = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  var KEY = 'breachline.decks.v1', PICKS = 'breachline.picks.v1', UNTITLED = 'Untitled deck';
  var store = null, mem = {};
  // If the browser refuses storage, decks stay in memory and persistent() lets the screens say so.
  try {
    store = window.localStorage;
    store.setItem(KEY + '.test', '1');
    store.removeItem(KEY + '.test');
  } catch (e) { store = null; }

  function read(key) {
    if (!store) return mem[key] || null;
    try { return store.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    if (!store) { mem[key] = value; return true; }
    try { store.setItem(key, value); return true; } catch (e) { return false; }
  }

  // A file that can't be read is kept to one side rather than overwritten by the next save.
  function readAll() {
    var raw = read(KEY);
    if (!raw) return [];
    try {
      var data = JSON.parse(raw);
      if (data && Array.isArray(data.decks)) return data.decks;
    } catch (e) {}
    write(KEY + '.corrupt', raw);
    return [];
  }
  function writeAll(decks) { return write(KEY, JSON.stringify({ version: 1, decks: decks })); }

  // Cards can leave the game between versions, so a saved list is only trusted after this. missing counts what was dropped.
  function clean(r) {
    var seen = {}, list = [], missing = 0;
    (Array.isArray(r.list) ? r.list : []).forEach(function (e) {
      if (!Array.isArray(e) || !(e[1] > 0)) return;
      if (!E.CARDS[e[0]]) { missing += e[1]; return; }
      if (seen[e[0]]) seen[e[0]][1] += Math.floor(e[1]);
      else { seen[e[0]] = [e[0], Math.floor(e[1])]; list.push(seen[e[0]]); }
    });
    return { id: String(r.id), name: String(r.name || '').trim() || UNTITLED, mode: r.mode || 'exhibition', list: list, updated: r.updated || 0, missing: missing };
  }

  function saved() {
    return readAll().filter(function (r) { return r && r.id; }).map(clean).sort(function (a, b) { return b.updated - a.updated; });
  }
  function starters() {
    return Object.keys(E.DECKS).map(function (k) { return { id: k, name: E.DECKS[k].name, list: E.DECKS[k].list.map(function (e) { return e.slice(); }), starter: true }; });
  }
  function find(id) {
    return saved().concat(starters()).filter(function (d) { return d.id === id; })[0] || null;
  }

  // A new deck stays out of storage until save(), so opening the builder and leaving adds nothing.
  function create(name, list) {
    return { id: 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), name: name, mode: 'exhibition', list: list || [], updated: 0, missing: 0 };
  }
  // Every write starts from what's in storage, so a second tab's decks aren't lost.
  function save(deck) {
    deck.updated = Date.now();
    var rec = { id: deck.id, name: deck.name, mode: deck.mode, list: deck.list, updated: deck.updated };
    var all = readAll().filter(function (r) { return r && r.id !== deck.id; });
    all.push(rec);
    return writeAll(all);
  }
  function remove(id) { return writeAll(readAll().filter(function (r) { return r && r.id !== id; })); }

  // What a deck can be built from. Exhibition is every card; campaign rewards and multiplayer packs will each
  // add a mode here that returns only the cards the player owns, and how many of each.
  function pool(mode) {
    if (mode !== 'exhibition') throw new Error('No card pool for mode: ' + mode);
    return { ids: Object.keys(E.CARDS), copies: E.maxCopies };
  }

  function picks() {
    try { return JSON.parse(read(PICKS)) || {}; } catch (e) { return {}; }
  }
  function setPicks(p) { write(PICKS, JSON.stringify(p)); }

  return {
    saved: saved, starters: starters, find: find, create: create, save: save, remove: remove, pool: pool,
    picks: picks, setPicks: setPicks, persistent: function () { return !!store; }
  };
})();
if (typeof module !== 'undefined') module.exports = Decks;
