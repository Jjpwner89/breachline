// Saved decks and the card pool. The screens and a future pack system all go through here.
var Decks = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  var KEY = 'breachline.decks.v1', PICKS = 'breachline.picks.v1', UNTITLED = 'Untitled deck';
  var GONE = KEY + '.deleted', store = null, mem = {};
  // On the published page, decks also go to the viewer's private part of the artifact's database, so they follow the
  // account. The local copy stays the working one, which keeps every call here synchronous and lets the game run without
  // a connection. A record's synced field is the updated time the database last confirmed.
  var remote = null, dirty = {}, pushTimer = null, pushing = false;
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
  function record(id) { return readAll().filter(function (r) { return r && r.id === id; })[0]; }
  // Deletions wait here until the database confirms them, so a deck can't come back from it on the next visit.
  function readGone() {
    try { return JSON.parse(read(GONE)) || []; } catch (e) { return []; }
  }
  function writeGone(ids) { write(GONE, JSON.stringify(ids)); }

  function toDoc(r) {
    var cards = {};
    r.list.forEach(function (e) { cards[e[0]] = e[1]; });
    return { name: r.name, mode: r.mode, cards: cards, updated: r.updated };
  }
  function fromDoc(id, d) {
    var cards = d.cards || {};
    return { id: id, name: d.name, mode: d.mode, list: Object.keys(cards).map(function (c) { return [c, cards[c]]; }), updated: d.updated || 0, synced: d.updated || 0 };
  }
  // The database asks for one retry after a short random wait when it's briefly unavailable.
  function retried(call) {
    return call().catch(function (e) {
      if (!e || e.code !== 'unavailable') throw e;
      return new Promise(function (done) { setTimeout(done, 500 + Math.random() * 1000); }).then(call);
    });
  }
  // A failed write isn't retried here: the record stays unconfirmed, and the next visit sends it again.
  function push() {
    var id = Object.keys(dirty)[0];
    if (!remote || pushing || !id) return;
    delete dirty[id];
    pushing = true;
    var rec = record(id), ref = remote.doc(id);
    retried(function () { return rec ? ref.set(toDoc(rec)) : ref.delete(); }).then(function () {
      if (!rec) return writeGone(readGone().filter(function (x) { return x !== id; }));
      var all = readAll(), now = all.filter(function (r) { return r && r.id === id; })[0];
      if (now) { now.synced = rec.updated; writeAll(all); }
    }).catch(function (e) { console.warn('Deck not saved to your account yet:', e && e.code); }).then(function () {
      pushing = false;
      push();
    });
  }
  function queue(id) {
    dirty[id] = true;
    if (!remote) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 800);
  }
  function changed() {
    if (typeof Screens !== 'undefined') Screens.redraw();
    var start = document.getElementById('start');
    if (start && !start.hidden) GameUI.showStart();
  }
  // The newer copy of each deck wins. A confirmed deck missing from the database was deleted on another device,
  // but only a full answer can show that: a cached one may simply be out of date.
  function pull() {
    return retried(function () { return remote.get(); }).then(function (snap) {
      var complete = !(snap.metadata && snap.metadata.fromCache), theirs = {}, gone = readGone(), before = readAll(), out = [];
      snap.docs.forEach(function (d) { if (d.data() && d.data().cards) theirs[d.id] = d.data(); });
      before.forEach(function (r) {
        if (!r || !r.id) return;
        var t = theirs[r.id];
        delete theirs[r.id];
        if (!t) {
          if (r.synced && complete) return;
          if (!r.synced) dirty[r.id] = true;
          out.push(r);
        } else if (r.updated > (t.updated || 0)) {
          dirty[r.id] = true;
          out.push(r);
        } else out.push(fromDoc(r.id, t));
      });
      Object.keys(theirs).forEach(function (id) { if (gone.indexOf(id) < 0) out.push(fromDoc(id, theirs[id])); });
      gone.forEach(function (id) { dirty[id] = true; });
      if (JSON.stringify(out) !== JSON.stringify(before)) {
        writeAll(out);
        changed();
      }
      push();
    });
  }
  function connect() {
    var host = typeof window !== 'undefined' && window.claude;
    if (!host || !host.use) return;
    Promise.all([host.use('db'), host.use('user')]).then(function (got) {
      if (!got[0] || !got[1]) return null;
      return got[1].id().then(function (id) {
        if (!id) return null;
        remote = got[0].collection('data/users/' + id);
        changed();
        return pull();
      });
    }).catch(function (e) { console.warn('Decks are staying in this browser for now:', e && e.code); });
  }

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
    var prev = record(deck.id), rec = { id: deck.id, name: deck.name, mode: deck.mode, list: deck.list, updated: deck.updated, synced: prev && prev.synced };
    var all = readAll().filter(function (r) { return r && r.id !== deck.id; });
    all.push(rec);
    var ok = writeAll(all);
    if (ok) queue(deck.id);
    return ok;
  }
  function remove(id) {
    var rec = record(id), ok = writeAll(readAll().filter(function (r) { return r && r.id !== id; }));
    if (ok && rec && (remote || rec.synced)) {
      writeGone(readGone().concat(id));
      queue(id);
    }
    return ok;
  }

  // What a deck can be built from. Exhibition is every card; multiplayer packs will
  // add a mode here that returns only the cards the player owns, and how many of each.
  function pool(mode) {
    if (mode !== 'exhibition') throw new Error('No card pool for mode: ' + mode);
    return { ids: Object.keys(E.CARDS), copies: E.maxCopies };
  }

  function picks() {
    try { return JSON.parse(read(PICKS)) || {}; } catch (e) { return {}; }
  }
  function setPicks(p) { write(PICKS, JSON.stringify(p)); }

  // Finish sending changes while the page can still do it, such as when the tab is closing.
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { clearTimeout(pushTimer); push(); }
  });
  connect();

  return {
    saved: saved, starters: starters, find: find, create: create, save: save, remove: remove, pool: pool,
    picks: picks, setPicks: setPicks, persistent: function () { return !!store || !!remote; }
  };
})();
if (typeof module !== 'undefined') module.exports = Decks;
