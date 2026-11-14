// The free starter pick, the collection, packs and their opening, the match record and the save file. Rules and storage are in
// Progress, rarities in Rarity; this file only draws them. Its actions join the ones in screens.js.
var Collection = (function () {
  var E = Engine, P = Progress, K = Screens.kit, act = K.act, esc = K.esc, symbol = K.symbol, plural = K.plural;
  var COLOURS = ['W', 'U', 'B', 'R', 'G', 'N'], RNAME = Rarity.NAMES;
  var tab = 'cards', view = { colour: {}, rarity: {}, own: 'all' }, focus = null, packColour = null, note = '', pickStarter = null;
  var COIN = '<img class="coin-i" src="art/web/ui/coin.png" alt="">';
  var SHARD = '<img class="shard-i" src="art/web/ui/shard.png" alt="">';

  function gold(n) { return '<span class="money gold">' + COIN + '<b>' + n + '</b><span class="sr"> gold</span></span>'; }
  function shards(n) { return '<span class="money shards">' + SHARD + '<b>' + n + '</b><span class="sr"> shards</span></span>'; }
  function rarityTag(id) { var r = Rarity.of(id); return '<span class="rtag ' + r + '">' + RNAME[r] + '</span>'; }
  function savingNote() {
    var s = P.status(), acct = Accounts.available() ? 'your account' : 'your Claude account';
    if (s === 'synced') return 'Saved to ' + acct + ' and in this browser.';
    if (s === 'loading') return 'Checking ' + acct + ' for saved progress…';
    if (s === 'offline') return 'Saved in this browser. ' + acct.charAt(0).toUpperCase() + acct.slice(1) + " can't be reached right now, so it will catch up later.";
    if (s === 'full') return 'Saved in this browser. The storage for this game in ' + acct + ' is full.';
    if (!P.persistent()) return 'This browser is blocking storage, so progress lasts only until you close this tab. Save a file to keep it.';
    return Accounts.available() ? 'Saved in this browser only. Sign in from the main menu to keep it on every device, or keep a save file.' : 'Saved in this browser only. Open the game inside Claude to save to your account too, or keep a save file.';
  }

  // The free starter, shown once before anything else.

  function starter() {
    var keys = Object.keys(E.DECKS);
    if (!pickStarter) pickStarter = keys[0];
    var d = E.DECKS[pickStarter];
    var tiles = keys.map(function (k) {
      var dk = E.DECKS[k], art = GameUI.deckArt(k);
      return '<button type="button" class="dtile' + (k === pickStarter ? ' on' : '') + '" ' + act('pickStarter', k) + ' aria-pressed="' + (k === pickStarter) + '">' +
        '<span class="cover">' + (art ? '<img src="' + art + '" alt="" draggable="false">' : '') + '</span><span class="dname">' + esc(dk.name) + '</span>' +
        '<span class="dmeta"><span class="csyms">' + dk.colours.map(symbol).join('') + '</span><span>' + GameUI.ALIGNMENT[dk.colours[0]] + '</span></span></button>';
    }).join('');
    var units = d.list.filter(function (e) { return E.CARDS[e[0]].type === 'unit'; }).reduce(function (n, e) { return n + e[1]; }, 0);
    var best = d.list.filter(function (e) { return E.CARDS[e[0]].type !== 'land'; }).sort(function (a, b) { return Rarity.ORDER.indexOf(Rarity.of(b[0])) - Rarity.ORDER.indexOf(Rarity.of(a[0])) || E.CARDS[b[0]].cost - E.CARDS[a[0]].cost; }).slice(0, 3);
    K.show('<div class="page starter"><header class="shead"><h1>Choose your first deck</h1></header>' +
      '<p class="lead">It\'s yours to keep. Win more cards in battles and packs, and beat a campaign to win that campaign\'s deck too.</p>' +
      (Accounts.available() ? '<p class="hint">Have an account? <button type="button" class="linkbtn" ' + act('account') + '>Sign in</button> to bring your progress here.</p>' : '') +
      '<div class="dtiles">' + tiles + '</div>' +
      '<div class="story spick"><p class="eyebrow">' + symbol(d.colours[0]) + GameUI.ALIGNMENT[d.colours[0]] + '</p><h2>' + esc(d.name) + '</h2>' +
        '<p>' + esc(GameUI.deckNote(pickStarter)) + '</p>' +
        '<p class="hint"><b>' + GameUI.ALIGNMENT[d.colours[0]] + '.</b> ' + esc(Help.alignment(d.colours[0])) + '</p>' +
        '<p class="hint">' + E.deckSize(d.list) + ' cards, ' + units + ' of them units. Its best cards: ' + best.map(function (e) { return esc(E.CARDS[e[0]].name) + ' (' + RNAME[Rarity.of(e[0])].toLowerCase() + ')'; }).join(', ') + '.</p>' +
        '<button type="button" class="btn primary big" ' + act('takeStarter', pickStarter) + '>Take ' + esc(d.name) + '</button></div>' +
      '<p class="hint">New to the game? <button type="button" class="linkbtn" ' + act('tutorial') + '>Learn how to play</button> first.</p>' +
      '<p class="hint">Played before? <button type="button" class="linkbtn" ' + act('collection', 'save') + '>Load a save file</button> instead.</p></div>', starter);
  }
  K.actions.pickStarter = function (k) { pickStarter = k; starter(); };
  K.actions.takeStarter = function (k) { if (P.chooseStarter(k)) Screens.menu(); };

  // The collection page

  function head() {
    var st = P.state(), tabs = [['cards', 'Cards'], ['packs', 'Packs'], ['record', 'Record'], ['save', 'Save and unlock']];
    var owned = P.allCards().filter(function (id) { return P.count(id) > 0; }).length;
    return '<header class="shead"><button type="button" class="btn" ' + act('menu') + '>Main menu</button><h1>Collection</h1>' +
      '<button type="button" class="btn" ' + act('codex') + '>Lore codex</button>' +
      '<span class="wallet push">' + gold(st.gold) + shards(st.shards) + '</span></header>' +
      '<p class="hint">' + owned + ' of ' + P.allCards().length + ' cards owned' + (st.unlocked ? '. Everything is unlocked by password, so every deck can use any card.' : '.') + '</p>' +
      '<nav class="tabs" role="tablist">' + tabs.map(function (t) {
        return '<button type="button" role="tab" class="tab" aria-selected="' + (tab === t[0]) + '" ' + act('collection', t[0]) + '>' + t[1] + '</button>';
      }).join('') + '</nav>' + (note ? '<p class="warn" role="status">' + esc(note) + '</p>' : '');
  }
  function page() {
    var body = tab === 'packs' ? packs() : tab === 'record' ? record() : tab === 'save' ? saveTab() : cards();
    K.show('<div class="page coll">' + head() + body + '</div>', page);
    if (tab === 'cards') GameUI.fitCards(K.root);
  }
  K.actions.collection = function (t) { if (t) tab = t; note = ''; focus = null; page(); };
  // The lore codex is a book over the table (codex.js), with the collection waiting underneath.
  K.actions.codex = function () { Codex.open(); };

  // Cards: every card, greyed where you have none, with crafting in the close-up.

  function shown(id) {
    var c = E.CARDS[id], n = P.count(id), any = function (s) { return Object.keys(s).some(function (k) { return s[k]; }); };
    if (any(view.colour) && !view.colour[c.colour]) return false;
    if (any(view.rarity) && !view.rarity[Rarity.of(id)]) return false;
    if (view.own === 'owned') return n > 0;
    if (view.own === 'missing') return n < P.MAX;
    if (view.own === 'spare') return n > P.MAX;
    return true;
  }
  function order(a, b) {
    var x = E.CARDS[a], y = E.CARDS[b];
    return COLOURS.indexOf(x.colour) - COLOURS.indexOf(y.colour) || x.cost - y.cost || x.name.localeCompare(y.name);
  }
  function chip(kind, key, label, on) { return '<button type="button" class="chip" aria-pressed="' + !!on + '" ' + act('collFilter', kind + ':' + key) + '>' + label + '</button>'; }
  function milestonesHtml() {
    var fp = P.factionProgress(), ms = P.state().milestones, done = Object.keys(ms).length;
    return '<details class="msets"><summary>Faction sets <span class="hint">' + done + ' of ' + fp.length * 2 + ' earned. One of every card in a faction, then three of each.</span></summary><div class="msgrid">' +
      fp.map(function (f) {
        var bar = function (n, kind) {
          var got = ms[kind + ':' + f.id];
          return '<span class="mbar' + (got ? ' got' : '') + '" title="' + (got ? esc(got.title) : '') + '"><i style="width:' + Math.round(n / f.total * 100) + '%"></i><small>' + (kind === 'set' ? 'One of each' : 'Three of each') + ' ' + n + ' / ' + f.total + (got ? ' · ' + esc(got.title) : '') + '</small></span>';
        };
        return '<div class="mset"><b><span class="fdot ' + f.colour + '"></span>' + esc(f.name.replace(/^The /, '')) + '</b>' + bar(f.one, 'set') + bar(f.three, 'full') + '</div>';
      }).join('') + '</div></details>';
  }
  function cards() {
    var ids = P.allCards().filter(shown).sort(order), spareIds = P.allCards().filter(function (id) { return P.spare(id) > 0; });
    var spareGain = spareIds.reduce(function (n, id) { return n + P.spare(id) * P.SHARDS.gain[Rarity.of(id)]; }, 0);
    var tools = '<div class="ctools"><div class="chips">' + chip('own', 'all', 'All', view.own === 'all') + chip('own', 'owned', 'Owned', view.own === 'owned') + chip('own', 'missing', 'Not complete', view.own === 'missing') + chip('own', 'spare', 'Spares', view.own === 'spare') + '</div>' +
      '<div class="chips">' + Rarity.ORDER.map(function (r) { return chip('rarity', r, '<span class="rdot ' + r + '"></span>' + RNAME[r], view.rarity[r]); }).join('') + '</div>' +
      '<div class="chips">' + COLOURS.map(function (c) { return chip('colour', c, symbol(c) + GameUI.ALIGNMENT[c], view.colour[c]); }).join('') + '</div>' +
      (spareIds.length ? '<button type="button" class="btn" ' + act('breakAll') + '>Break down all spares for ' + spareGain + ' shards</button>' : '') + '</div>';
    var grid = ids.map(function (id) {
      var n = P.count(id);
      return '<div class="pcard' + (n ? '' : ' unowned') + (id === focus ? ' chosen' : '') + '"><button type="button" class="card" ' + act('collFocus', id) + ' aria-label="' + esc(E.CARDS[id].name) + ', ' + (n ? 'you own ' + n : 'not owned') + '">' + GameUI.frameHtml(E.CARDS[id]) + '</button>' +
        (n ? '<span class="have">× ' + n + '</span>' : '<span class="nown">Not owned</span>') + '</div>';
    }).join('') || '<p class="hint none">No cards match.</p>';
    return milestonesHtml() + tools + '<div class="collbody"><div class="cgrid coll">' + grid + '</div>' + focusHtml() + '</div>';
  }
  function focusHtml() {
    if (!focus) return '<aside class="cfocus"><p class="hint">Choose a card to see how many you own, break down spares or craft a copy.</p></aside>';
    var id = focus, c = E.CARDS[id], n = P.count(id), sp = P.spare(id), cost = P.craftCost(id), st = P.state();
    var craft = n >= P.MAX ? '<p class="hint">You have the three copies a deck can hold.</p>'
      : '<button type="button" class="btn primary" ' + act('craft', id) + (st.shards < cost ? ' disabled' : '') + '>Craft a copy for ' + cost + ' shards</button>' +
        (st.shards < cost ? '<p class="hint">You need ' + (cost - st.shards) + ' more shards.</p>' : '');
    return '<aside class="cfocus open"><button type="button" class="btn cfclose" ' + act('collFocus') + '>Close</button><div class="slot">' + GameUI.frameHtml(c, { big: true }) + '</div>' +
      '<p>' + rarityTag(id) + ' ' + (n ? 'You own ' + n + (n === 1 ? ' copy.' : ' copies.') : "You don't own this yet.") + '</p>' +
      (sp ? '<button type="button" class="btn" ' + act('breakOne', id) + '>Break down ' + plural(sp, 'spare') + ' for ' + sp * P.SHARDS.gain[Rarity.of(id)] + ' shards</button>' : '') +
      craft + '</aside>';
  }
  K.actions.collFilter = function (arg) {
    var at = arg.indexOf(':'), kind = arg.slice(0, at), key = arg.slice(at + 1);
    if (kind === 'own') view.own = key; else view[kind][key] = !view[kind][key];
    page();
  };
  K.actions.collFocus = function (id) { focus = id || null; note = ''; page(); };
  K.actions.breakOne = function (id) { var e = P.breakDown([id]); note = e ? 'Broke down ' + plural(e.cards[id], 'spare') + ' for ' + e.shards + ' shards.' : ''; page(); };
  K.actions.breakAll = function () { var e = P.breakDown(P.allCards()); note = e ? 'Broke down ' + plural(Object.keys(e.cards).reduce(function (n, k) { return n + e.cards[k]; }, 0), 'spare') + ' for ' + e.shards + ' shards.' : ''; page(); };
  K.actions.craft = function (id) { note = P.craft(id) ? 'Crafted ' + E.CARDS[id].name + '.' : ''; page(); };

  // Packs

  // The painted wrappers, with an aligned pack's emblem pressed into the wax.
  function packArt(tier, colour) {
    return '<span class="pack painted ' + tier + (colour ? ' ' + colour : '') + '" aria-hidden="true"><img src="art/web/ui/pack-' + tier + '.png" alt="" draggable="false"><span class="pseal">' + (colour ? symbol(colour) : '') + '</span></span>';
  }
  function packs() {
    var st = P.state(), cols = [null, 'W', 'U', 'B', 'R', 'G'];
    var pick = '<div class="chips">' + cols.map(function (c) { return chip('packColour', c || 'mixed', c ? symbol(c) + GameUI.ALIGNMENT[c] : 'Every alignment', packColour === c); }).join('') + '</div>';
    var tiles = P.PACK_ORDER.map(function (t) {
      var p = P.PACKS[t], cost = P.packCost(t, packColour), short = cost - st.gold;
      return '<div class="ptile">' + packArt(t, packColour) + '<b>' + esc(p.name) + '</b><span class="hint">8 cards. ' + esc(p.blurb) + '</span>' +
        '<button type="button" class="btn primary" ' + act('buyPack', t) + (short > 0 ? ' disabled' : '') + '>Open for ' + gold(cost) + '</button>' +
        (short > 0 ? '<span class="hint">You need ' + short + ' more gold.</span>' : '') + '</div>';
    }).join('');
    return '<section class="pickset"><h2>Choose the cards\' alignment</h2><p class="hint">A pack of one alignment costs more than a mixed one. Packs never hold lands, which are always free.</p>' + pick + '</section>' +
      '<div class="ptiles">' + tiles + '</div>' +
      '<p class="hint">Gold comes from battles: some for finishing one, more for winning, and a little for each unit, spell and land you play. Beating a campaign pays more.</p>';
  }
  K.actions.packColour = function (c) { packColour = c === 'mixed' ? null : c; page(); };
  K.actions.buyPack = function (tier) {
    var before = {};
    P.allCards().forEach(function (id) { before[id] = P.count(id); });
    var e = P.buyPack(tier, packColour);
    if (!e) { note = "You don't have enough gold for that."; return page(); }
    page();
    openPack(e, before);
  };

  // Opening a pack: it drops onto the table, tears open, deals its cards face down, and each turns over when clicked. The rarest
  // comes last. Drawn in code for now; PROGRESSION.md lists the paintings that would replace it.
  var ov = null, pending = null;
  function openPack(e, before) {
    if (!ov) { ov = document.createElement('div'); ov.className = 'popen'; document.body.appendChild(ov); ov.addEventListener('click', onOpen); }
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pending = { e: e, before: before, turned: 0 };
    ov.hidden = false;
    ov.className = 'popen sealed' + (still ? ' still' : '');
    ov.innerHTML = '<div class="pstage"><button type="button" class="ptear" data-open="tear" aria-label="Tear open the ' + esc(P.PACKS[e.tier].name) + '">' + packArt(e.tier, e.colour) + '</button>' +
      '<p class="phint">Click the pack to open it</p></div><div class="prow" aria-live="polite"></div><div class="pbtns"></div>';
    ov.querySelector('.ptear').focus();
  }
  function onOpen(ev) {
    var b = ev.target.closest('[data-open]');
    if (!b || !pending) return;
    var what = b.dataset.open;
    if (what === 'tear') return tear();
    if (what === 'flip') return flip(b);
    if (what === 'all') return Array.prototype.forEach.call(ov.querySelectorAll('.ocard:not(.up)'), flip);
    if (what === 'again') { var t = pending.e.tier; close(); return K.actions.buyPack(t); }
    if (what === 'done') return close();
  }
  // The wrapper falls open first, then the cards come out.
  function tear() {
    if (!ov.classList.contains('sealed') || ov.classList.contains('opening')) return;
    var img = ov.querySelector('.ptear img');
    Sfx.play('card-flip');
    if (img && Polish.enabled()) {
      img.src = 'art/web/ui/pack-' + pending.e.tier + '-open.png';
      ov.classList.add('opening');
      return setTimeout(function () { if (pending) { ov.classList.remove('opening'); dealOut(); } }, 480);
    }
    dealOut();
  }
  function dealOut() {
    var e = pending.e;
    Sfx.play('shuffle');
    ov.classList.remove('sealed');
    ov.classList.add('torn');
    ov.querySelector('.prow').innerHTML = e.cards.map(function (id, i) {
      var r = Rarity.of(id), fresh = !pending.before[id];
      return '<button type="button" class="ocard ' + r + '" data-open="flip" style="--i:' + i + '" aria-label="Turn over card ' + (i + 1) + '">' +
        '<span class="oback"></span><span class="oface">' + GameUI.frameHtml(E.CARDS[id]) + (fresh ? '<span class="onew">New</span>' : '') + '</span></button>';
    }).join('');
    GameUI.fitCards(ov);
    ov.querySelector('.phint').textContent = 'Click each card to turn it over';
    ov.querySelector('.pbtns').innerHTML = '<button type="button" class="btn" data-open="all">Turn them all</button>';
  }
  function flip(card) {
    if (card.classList.contains('up')) return;
    card.classList.add('up');
    Sfx.play('card-flip', { gap: 30 });
    // Rares and legendaries burst behind the card as it turns.
    var rare = card.classList.contains('l') ? 'legendary-burst' : card.classList.contains('r') ? 'rare-burst' : null;
    if (rare) { var b = card.getBoundingClientRect(); Polish.sprite(rare, b.left + b.width / 2, b.top + b.height / 2, b.width * (rare === 'legendary-burst' ? 3 : 2.4), { host: ov }); }
    card.setAttribute('aria-label', E.CARDS[pending.e.cards[+card.style.getPropertyValue('--i')]].name);
    if (card.classList.contains('l')) { ov.classList.remove('quake'); void ov.offsetWidth; ov.classList.add('quake'); }
    pending.turned += 1;
    if (pending.turned < pending.e.cards.length) return;
    var e = pending.e, fresh = e.cards.filter(function (id) { return !pending.before[id]; }).length, again = P.state().gold >= e.cost;
    ov.querySelector('.phint').textContent = fresh ? plural(fresh, 'new card') + ' for your collection.' : 'Nothing new this time. Spares beyond three can be broken down for shards.';
    ov.querySelector('.pbtns').innerHTML = (again ? '<button type="button" class="btn" data-open="again">Open another for ' + e.cost + ' gold</button>' : '') + '<button type="button" class="btn primary" data-open="done">Done</button>';
    ov.querySelector('[data-open="done"]').focus();
  }
  function close() { if (ov) { ov.hidden = true; ov.innerHTML = ''; } pending = null; page(); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov && !ov.hidden && pending && pending.turned >= pending.e.cards.length) close(); });

  // Record

  function when(t) { var d = new Date(t); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  function record() {
    var r = P.record(), word = { win: 'Won', loss: 'Lost', draw: 'Draw' };
    if (!r.recent.length) return '<p class="hint">Finish a battle and it shows up here, with what it paid.</p>';
    var decks = '<table class="rtable"><thead><tr><th>Deck</th><th>Won</th><th>Lost</th><th>Drawn</th></tr></thead><tbody>' + r.decks.map(function (d) {
      return '<tr><td>' + esc(d.deck || 'A deck') + '</td><td>' + d.win + '</td><td>' + d.loss + '</td><td>' + d.draw + '</td></tr>';
    }).join('') + '</tbody></table>';
    var recent = '<table class="rtable"><thead><tr><th>When</th><th>Your deck</th><th>Against</th><th>Result</th><th>Turns</th><th>Gold</th></tr></thead><tbody>' + r.recent.map(function (b) {
      return '<tr class="' + b.result + '"><td>' + when(b.at) + '</td><td>' + esc(b.deck || '') + '</td><td>' + esc(b.opp || '') + '</td><td>' + word[b.result] + '</td><td>' + (b.turns || '') + '</td><td>' + (b.gold || 0) + '</td></tr>';
    }).join('') + '</tbody></table>';
    return '<section class="pickset"><h2>' + r.all.win + ' won, ' + r.all.loss + ' lost' + (r.all.draw ? ', ' + r.all.draw + ' drawn' : '') + '</h2><div class="rwrap">' + decks + '</div></section>' +
      '<section class="pickset"><h2>Recent battles</h2><div class="rwrap">' + recent + '</div></section>';
  }

  // Save file and password

  function saveTab() {
    var st = P.state();
    return '<section class="pickset"><h2>Saving</h2><p>' + esc(savingNote()) + '</p>' +
      '<div class="cleave"><button type="button" class="btn primary" ' + act('saveFile') + '>Save to a file</button>' +
      '<label class="btn filebtn">Load a save file<input type="file" id="loadFile" accept=".json,application/json" class="sr"></label></div>' +
      '<p class="hint">A save file holds your whole collection, record and saved decks. Loading one adds whatever it has that this game doesn\'t, so an old file never takes anything away.</p></section>' +
      '<section class="pickset"><h2>Unlock everything</h2>' + (st.unlocked
        ? '<p>Every card is unlocked, so any deck can use three of anything. Your real collection is unchanged underneath.</p><div class="cleave"><button type="button" class="btn" ' + act('lockAll') + '>Lock again</button></div>'
        : '<form class="pwform" id="pwForm"><label class="sr" for="pw">Password</label><input type="password" id="pw" autocomplete="off" placeholder="Password"><button type="submit" class="btn">Unlock</button></form>') + '</section>' +
      '<section class="pickset"><h2>Gift code</h2><form class="pwform" id="giftForm"><label class="sr" for="gift">Gift code</label><input type="text" id="gift" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Code"><button type="submit" class="btn">Redeem</button></form></section>';
  }
  function download(name, text) {
    var fallback = function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
    var host = window.claude;
    if (!host || !host.use) return fallback();
    host.use('downloads').then(function (d) {
      if (!d) return fallback();
      return d.save({ filename: name, data: text }).then(function () { note = 'Saved ' + name + '.'; page(); });
    }).catch(function (e) { note = e && e.code === 'declined' ? 'Not saved.' : "Couldn't save the file here."; page(); });
  }
  K.actions.saveFile = function () { download('breachline-save-' + new Date().toISOString().slice(0, 10) + '.json', P.exportText()); };
  K.actions.lockAll = function () { P.lock(); note = 'Locked. Decks use your own cards again.'; page(); };
  K.root.addEventListener('change', function (e) {
    if (e.target.id !== 'loadFile' || !e.target.files[0]) return;
    var r = new FileReader();
    r.onload = function () {
      var res = P.importText(String(r.result));
      note = !res.ok ? res.why : res.entries || res.decks ? 'Loaded: ' + plural(res.entries, 'new record') + (res.decks ? ' and ' + plural(res.decks, 'deck') : '') + '.' : 'Everything in that file was already here.';
      page();
    };
    r.readAsText(e.target.files[0]);
  });
  K.root.addEventListener('submit', function (e) {
    if (e.target.id === 'giftForm') {
      e.preventDefault();
      P.redeem(document.getElementById('gift').value).then(function (r) {
        note = r.ok ? 'Redeemed: ' + r.gold + ' gold.' : r.why === 'used' ? "You've already used that code." : r.why === 'unsaved' ? "Couldn't save that here. Try again." : "That isn't a code.";
        page();
      });
      return;
    }
    if (e.target.id !== 'pwForm') return;
    e.preventDefault();
    P.unlock(document.getElementById('pw').value).then(function (ok) { note = ok ? 'Everything is unlocked.' : "That isn't the password."; page(); });
  });

  return { page: K.actions.collection, starter: starter, gold: gold };
})();
