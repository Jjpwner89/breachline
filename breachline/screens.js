// Main menu and the deck builder. Storage and the card pool come from Decks, card frames and game start from GameUI.
var Screens = (function () {
  var E = Engine, root = document.getElementById('screen'), refresh = null, actions = {};
  var COLOURS = ['W', 'U', 'B', 'R', 'G', 'N'], TYPES = ['unit', 'instant', 'enchant', 'spell', 'land'];
  var COLOUR_WORD = { W: 'white', U: 'blue', B: 'black', R: 'red', G: 'green', N: 'neutral' };
  var LAND_SHARE = 0.45;
  // Editor state. Filters survive leaving the editor, so they stay put when moving between decks.
  var ed = null, filters = { type: {}, colour: {}, faction: {}, q: '' }, confirmDelete = null;

  function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function byId(id) { return document.getElementById(id); }
  function act(name, arg) { return 'data-act="' + name + '"' + (arg === undefined ? '' : ' data-arg="' + esc(arg) + '"'); }
  function symbol(c) { return '<svg class="csym ' + c + '" aria-hidden="true"><use href="#sym-' + c + '"/></svg>'; }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function any(set) { return Object.keys(set).some(function (k) { return set[k]; }); }

  function show(html, onRefresh) {
    root.hidden = false;
    root.innerHTML = html;
    root.scrollTop = 0;
    refresh = onRefresh;
    window.scrollTo(0, 0);
  }

  // Deck summaries

  function coverArt(list) {
    var best = null;
    list.forEach(function (e) {
      var c = E.CARDS[e[0]];
      if (!GameUI.artUrl(c.id)) return;
      var rank = c.type === 'land' ? -1 : c.cost;
      if (!best || rank > best.rank) best = { rank: rank, id: c.id };
    });
    return best ? GameUI.artUrl(best.id) : null;
  }
  function deckStatus(d) {
    var problems = E.deckProblems(d.list);
    return problems.length ? problems[0] : plural(E.deckSize(d.list), 'card');
  }
  function coverHtml(d) {
    var art = coverArt(d.list);
    return '<span class="cover">' + (art ? '<img src="' + art + '" alt="" draggable="false">' : '') + '</span>' +
      '<span class="dname">' + esc(d.name) + '</span>' +
      '<span class="dmeta"><span class="csyms">' + E.deckColours(d.list).map(symbol).join('') + '</span><span>' + esc(deckStatus(d)) + '</span></span>';
  }

  // Main menu

  function menu() {
    var n = Decks.saved().length, cont = GameUI.inProgress();
    var fan = ['lancer', 'dragon', 'maren'].map(function (id) { return '<span class="slot">' + GameUI.frameHtml(E.CARDS[id], { big: true }) + '</span>'; }).join('');
    function item(a, title, sub, primary) {
      return '<button type="button" class="mitem' + (primary ? ' primary' : '') + '" ' + act(a) + '><b>' + title + '</b><span>' + sub + '</span></button>';
    }
    function later(title, sub) {
      return '<div class="mitem off"><b>' + title + '</b><span>' + sub + '</span></div>';
    }
    show('<main class="menu"><div class="mcol"><h1>Breachline</h1><nav class="mlist" aria-label="Main menu">' +
      (cont ? item('resume', 'Continue game', 'Go back to your current battle.', true) : '') +
      item('exhibition', 'Exhibition', 'Any deck against the scripted bot or Claude.', !cont) +
      item('builder', 'Deck builder', (n ? plural(n, 'saved deck') : 'No saved decks yet') + '. Every card is open.') +
      later('Campaign', 'Coming later. Win battles and choose cards to keep.') +
      later('Multiplayer', 'Coming later. Collect cards from packs.') +
      '</nav></div><div class="fan" aria-hidden="true">' + fan + '</div></main>', menu);
  }
  actions.menu = menu;
  actions.resume = function () { hide(); GameUI.resume(); };

  actions.exhibition = function () { GameUI.showStart(); };

  // Deck list

  function builder() {
    var saved = Decks.saved();
    var mine = saved.map(function (d) {
      var tools = confirmDelete === d.id
        ? '<span class="dask">Delete this deck?</span><button type="button" class="btn danger" ' + act('deleteDeck', d.id) + '>Delete</button><button type="button" class="btn" ' + act('keepDeck') + '>Keep</button>'
        : '<button type="button" class="btn" ' + act('copyDeck', d.id) + '>Copy</button><button type="button" class="btn" ' + act('askDelete', d.id) + '>Delete</button>';
      return '<div class="dcard"><button type="button" class="dtile" ' + act('edit', d.id) + ' aria-label="Edit ' + esc(d.name) + '">' + coverHtml(d) + '</button><div class="dtools">' + tools + '</div></div>';
    }).join('');
    var starters = Decks.starters().map(function (d) {
      return '<div class="dcard"><div class="dtile static">' + coverHtml(d) + '</div><div class="dtools"><button type="button" class="btn" ' + act('copyDeck', d.id) + '>Copy to edit</button></div></div>';
    }).join('');
    show('<div class="page"><header class="shead"><button type="button" class="btn" ' + act('menu') + '>Main menu</button><h1>Deck builder</h1><button type="button" class="btn primary push" ' + act('newDeck') + '>New deck</button></header>' +
      (Decks.persistent() ? '' : '<p class="warn">This browser is blocking storage, so decks last only until you close this tab.</p>') +
      '<section class="pickset"><h2>Your decks</h2>' + (mine ? '<div class="dtiles">' + mine + '</div>' : '<p class="hint">Nothing saved yet. Start a new deck, or copy a starter below and change it.</p>') + '</section>' +
      '<section class="pickset"><h2>Starter decks</h2><div class="dtiles">' + starters + '</div></section></div>', builder);
  }
  actions.builder = function () { confirmDelete = null; builder(); };
  actions.newDeck = function () { editor(Decks.create('New deck')); };
  actions.edit = function (id) { editor(Decks.find(id)); };
  actions.copyDeck = function (id) {
    var d = Decks.find(id), copy = Decks.create(d.name + ' copy', d.list.map(function (e) { return e.slice(); }));
    Decks.save(copy);
    editor(copy);
  };
  actions.askDelete = function (id) { confirmDelete = id; builder(); };
  actions.keepDeck = function () { confirmDelete = null; builder(); };
  actions.deleteDeck = function (id) { Decks.remove(id); confirmDelete = null; builder(); };

  // Deck editor

  function countOf(id) {
    var e = ed.deck.list.filter(function (x) { return x[0] === id; })[0];
    return e ? e[1] : 0;
  }
  function cardOrder(a, b) {
    var ca = E.CARDS[a], cb = E.CARDS[b];
    return COLOURS.indexOf(ca.colour) - COLOURS.indexOf(cb.colour) || (ca.type === 'land') - (cb.type === 'land') || ca.cost - cb.cost || ca.name.localeCompare(cb.name);
  }
  function matches(c) {
    var q = filters.q.trim().toLowerCase();
    if (any(filters.type) && !filters.type[c.type]) return false;
    if (any(filters.colour) && !filters.colour[c.colour]) return false;
    if (any(filters.faction) && !filters.faction[c.faction || 'none']) return false;
    return !q || c.name.toLowerCase().indexOf(q) >= 0 || (c.text || '').toLowerCase().indexOf(q) >= 0;
  }

  function editor(deck) {
    ed = { deck: deck, pool: Decks.pool(deck.mode), peek: null, saved: deck.updated > 0, msg: '' };
    if (deck.missing) ed.msg = plural(deck.missing, 'card') + ' in this deck no longer exist' + (deck.missing === 1 ? 's' : '') + ' and were taken out.';
    show('<div class="editor"><header class="shead"><button type="button" class="btn" ' + act('builder') + '>All decks</button><h1>Deck builder</h1><span class="hint">Exhibition: every card is open, in any mix of colours.</span></header>' +
      '<div class="ebody">' +
      '<aside class="closeup" id="closeup" ' + act('closeZoom') + ' aria-label="Card close-up"></aside>' +
      '<section class="cards" aria-label="Cards">' +
        '<details class="filters" id="filters"><summary><span id="filterSum"></span><span class="fcount" id="fcount"></span></summary>' +
          '<label class="fsearch"><span>Search</span><input type="search" id="fq" autocomplete="off" placeholder="Name or rules text" value="' + esc(filters.q) + '"></label><div id="fchips"></div></details>' +
        '<div class="cgrid" id="cgrid"></div></section>' +
      '<aside class="dpanel" id="dpanel" aria-label="Your deck">' +
        '<div class="dtop"><label class="sr" for="dname">Deck name</label><input type="text" id="dname" maxlength="40" value="' + esc(deck.name) + '"><button type="button" class="btn dclose" ' + act('closeDeck') + '>Back to cards</button></div>' +
        '<div id="dsum"></div><div class="dlist" id="dlist"></div><div class="dfoot" id="dfoot"></div></aside>' +
      '<button type="button" class="btn primary dopen" id="dopen" ' + act('openDeck') + '></button>' +
      '</div></div>', function () { drawGrid(); });
    byId('filters').open = !window.matchMedia('(max-width: 820px)').matches;
    drawFilters();
    drawGrid();
    drawDeck();
    if (!deck.list.length) peek(ed.pool.ids.slice().sort(cardOrder)[0]);
    else peek(deck.list[0][0]);
    byId('fq').addEventListener('input', function (e) { filters.q = e.target.value; drawGrid(); });
    byId('dname').addEventListener('input', function (e) { ed.deck.name = e.target.value; store(); drawDeck(); });
    if (!deck.updated) byId('dname').select();
  }

  function chip(group, key, label, pressed, title) {
    return '<button type="button" class="chip" aria-pressed="' + !!pressed + '" ' + act('filter', group + ':' + key) + (title ? ' title="' + title + '"' : '') + '>' + label + '</button>';
  }
  function factionShown(f) { return !any(filters.colour) || filters.colour[f.colour]; }
  function drawFilters() {
    var types = TYPES.map(function (t) { return chip('type', t, GameUI.TYPES[t], filters.type[t]); }).join('');
    var colours = COLOURS.map(function (c) { return chip('colour', c, symbol(c) + GameUI.ALIGNMENT[c], filters.colour[c], c === 'N' ? 'No colour' : 'Colour: ' + COLOUR_WORD[c]); }).join('');
    var factions = E.FACTIONS.filter(factionShown).map(function (f) {
      return chip('faction', f.id, '<span class="fdot ' + f.colour + '" aria-hidden="true"></span>' + f.name.replace(/^The /, ''), filters.faction[f.id]);
    }).join('') + chip('faction', 'none', 'No faction', filters.faction.none);
    byId('fchips').innerHTML =
      '<div class="frow"><span class="flabel">Type</span><div class="chips">' + types + '</div></div>' +
      '<div class="frow"><span class="flabel">Colour</span><div class="chips">' + colours + '</div></div>' +
      '<div class="frow"><span class="flabel">Faction</span><div class="chips">' + factions + '</div></div>';
  }
  function activeFilters() {
    return ['type', 'colour', 'faction'].reduce(function (n, g) {
      return n + Object.keys(filters[g]).filter(function (k) { return filters[g][k]; }).length;
    }, 0) + (filters.q.trim() ? 1 : 0);
  }

  function pickHtml(id) {
    var c = E.CARDS[id];
    return '<div class="pcard" data-card-id="' + id + '">' +
      '<button type="button" class="card" ' + act('add', id) + ' data-peek="' + id + '" aria-label="Add ' + esc(c.name) + ' to deck">' + GameUI.frameHtml(c) + '</button>' +
      '<span class="have" hidden></span>' +
      '<button type="button" class="minus" ' + act('remove', id) + ' aria-label="Take ' + esc(c.name) + ' out of deck" hidden>&minus;</button></div>';
  }
  function drawGrid() {
    var ids = ed.pool.ids.filter(function (id) { return matches(E.CARDS[id]); }).sort(cardOrder), n = activeFilters();
    byId('cgrid').innerHTML = ids.length ? ids.map(pickHtml).join('') : '<p class="hint none">No cards match these filters.</p>';
    GameUI.fitCards(byId('cgrid'));
    byId('filterSum').textContent = n ? 'Filters (' + n + ')' : 'Filters';
    byId('fcount').innerHTML = ids.length + ' of ' + ed.pool.ids.length + ' cards' + (n ? ' <button type="button" class="linkbtn" ' + act('clearFilters') + '>Clear</button>' : '');
    drawBadges();
  }
  function drawBadges() {
    Array.prototype.forEach.call(byId('cgrid').querySelectorAll('.pcard'), function (el) {
      var id = el.dataset.cardId, have = countOf(id), limit = ed.pool.copies(id), badge = el.querySelector('.have');
      badge.hidden = !have;
      badge.textContent = limit === Infinity ? have : have + ' / ' + limit;
      el.querySelector('.minus').hidden = !have;
      el.classList.toggle('maxed', have >= limit);
    });
  }

  function statsOf(list) {
    var st = { lands: 0, curve: [0, 0, 0, 0, 0, 0, 0, 0], types: {}, landsBy: {}, wants: {} };
    list.forEach(function (e) {
      var c = E.CARDS[e[0]];
      st.types[c.type] = (st.types[c.type] || 0) + e[1];
      if (c.type === 'land') { st.lands += e[1]; st.landsBy[c.colour] = (st.landsBy[c.colour] || 0) + e[1]; return; }
      st.curve[Math.min(c.cost, 7)] += e[1];
      if (c.wants) st.wants[c.colour] = Math.max(st.wants[c.colour] || 0, c.wants);
    });
    return st;
  }
  // Advice only. Nothing here stops a deck being played.
  function deckAdvice(st, size) {
    var out = [];
    var short = COLOURS.filter(function (c) { return st.wants[c] > (st.landsBy[c] || 0); }).map(function (c) { return GameUI.ALIGNMENT[c] + ' ' + (st.wants[c] - (st.landsBy[c] || 0)); });
    if (size >= 12 && short.length) out.push('Short of lands for the most demanding card: ' + short.join(', ') + '. Each missing land adds 1 to a card\'s cost.');
    if (size >= E.DECK_MIN) {
      var share = st.lands / size;
      if (share < LAND_SHARE - 0.1) out.push('Light on lands. The starter decks run about ' + Math.round(LAND_SHARE * 100) + '%.');
      if (share > LAND_SHARE + 0.1) out.push('Heavy on lands. The starter decks run about ' + Math.round(LAND_SHARE * 100) + '%.');
    }
    return out;
  }
  function curveHtml(curve) {
    var top = Math.max.apply(null, curve.concat(1));
    return '<div class="curve" role="img" aria-label="Cards by cost: ' + curve.map(function (n, i) { return (i === 7 ? '7 or more' : i) + ': ' + n; }).join(', ') + '">' + curve.map(function (n, i) {
      return '<span class="cbar"><em>' + (n || '') + '</em><i style="height:' + Math.round(n / top * 100) + '%"></i><small>' + (i === 7 ? '7+' : i) + '</small></span>';
    }).join('') + '</div>';
  }
  function rowHtml(e) {
    var c = E.CARDS[e[0]], full = e[1] >= ed.pool.copies(c.id) || E.deckSize(ed.deck.list) >= E.DECK_MAX;
    return '<div class="drow ' + c.colour + '"><span class="rcost">' + (c.type === 'land' ? '' : c.cost) + '</span>' +
      '<button type="button" class="rname" data-peek="' + c.id + '" ' + act('zoom', c.id) + '>' + esc(c.name) + '</button>' +
      '<span class="rn">' + e[1] + '</span>' +
      '<button type="button" class="rbtn" ' + act('remove', c.id) + ' aria-label="One fewer ' + esc(c.name) + '">&minus;</button>' +
      '<button type="button" class="rbtn" ' + (full ? 'disabled ' : '') + act('add', c.id) + ' aria-label="One more ' + esc(c.name) + '">+</button></div>';
  }
  function listHtml(list) {
    var sorted = function (a, b) { return E.CARDS[a[0]].cost - E.CARDS[b[0]].cost || E.CARDS[a[0]].name.localeCompare(E.CARDS[b[0]].name); };
    var out = TYPES.map(function (t) {
      var rows = list.filter(function (e) { return E.CARDS[e[0]].type === t; }).sort(sorted);
      if (!rows.length) return '';
      var n = rows.reduce(function (a, e) { return a + e[1]; }, 0);
      return '<h3>' + GameUI.TYPES[t] + 's <span>' + n + '</span></h3>' + rows.map(rowHtml).join('');
    }).join('');
    return out || '<p class="hint">Click a card to add it. Right-click a card to take one out.</p>';
  }
  function keepFocus(fn) {
    var a = document.activeElement, name = a && a.dataset && a.dataset.act, arg = a && a.dataset && a.dataset.arg;
    fn();
    if (!name || document.contains(a)) return;
    var again = root.querySelector('[data-act="' + name + '"][data-arg="' + arg + '"]');
    if (again) again.focus();
  }
  function drawDeck() {
    var list = ed.deck.list, size = E.deckSize(list), st = statsOf(list), problems = E.deckProblems(list), advice = deckAdvice(st, size);
    var saveNote = !Decks.persistent() ? 'This browser is blocking storage, so this deck lasts only until you close this tab.' : ed.saveFailed ? "Couldn't save the last change." : ed.saved ? 'Saved' : '';
    byId('dsum').innerHTML =
      '<div class="dcount"><b>' + size + '</b><span> of ' + E.DECK_MIN + '–' + E.DECK_MAX + ' cards</span><span class="dready' + (problems.length ? '' : ' ok') + '">' + (problems.length ? esc(problems[0]) : 'Ready to play') + '</span></div>' +
      '<div class="dprog"><i style="width:' + Math.min(100, Math.round(size / E.DECK_MIN * 100)) + '%"></i></div>' +
      '<p class="dline">Lands ' + st.lands + (size ? ' (' + Math.round(st.lands / size * 100) + '%)' : '') + TYPES.slice(0, 4).map(function (t) { return st.types[t] ? ' · ' + GameUI.TYPES[t] + 's ' + st.types[t] : ''; }).join('') + '</p>' +
      curveHtml(st.curve) +
      advice.map(function (a) { return '<p class="advice">' + a + '</p>'; }).join('') +
      '<p class="dmsg" id="dmsg" role="status">' + esc(ed.msg) + '</p>';
    keepFocus(function () { byId('dlist').innerHTML = listHtml(list); });
    byId('dfoot').innerHTML = '<span class="dsaved' + (ed.saveFailed || !Decks.persistent() ? ' bad' : '') + '">' + saveNote + '</span>' +
      '<button type="button" class="btn primary" ' + (problems.length ? 'disabled ' : '') + act('playDeck') + '>Play this deck</button>';
    byId('dopen').textContent = 'View deck: ' + size + ' cards';
  }
  function store() {
    ed.saveFailed = !Decks.save(ed.deck);
    ed.saved = !ed.saveFailed;
  }
  function peek(id) {
    if (!id || ed.peek === id) return;
    ed.peek = id;
    var c = E.CARDS[id], f = E.FACTIONS.filter(function (x) { return x.id === c.faction; })[0];
    byId('closeup').innerHTML = '<div class="slot">' + GameUI.frameHtml(c, { big: true }) + '</div><p class="hint">' + (f ? f.name : 'No faction') + '</p>';
  }

  actions.filter = function (arg) {
    var at = arg.indexOf(':'), group = arg.slice(0, at), key = arg.slice(at + 1);
    filters[group][key] = !filters[group][key];
    // A faction hidden by the colour filter can't stay on, or it would quietly empty the grid.
    if (group === 'colour') E.FACTIONS.forEach(function (f) { if (!factionShown(f)) filters.faction[f.id] = false; });
    keepFocus(drawFilters);
    drawGrid();
  };
  actions.clearFilters = function () {
    filters = { type: {}, colour: {}, faction: {}, q: '' };
    byId('fq').value = '';
    drawFilters();
    drawGrid();
  };
  actions.add = function (id) {
    var c = E.CARDS[id], have = countOf(id), limit = ed.pool.copies(id);
    ed.msg = '';
    if (E.deckSize(ed.deck.list) >= E.DECK_MAX) ed.msg = 'A deck can hold ' + E.DECK_MAX + ' cards at most.';
    else if (have >= limit) ed.msg = 'A deck can hold ' + limit + ' copies of ' + c.name + '.';
    else {
      var e = ed.deck.list.filter(function (x) { return x[0] === id; })[0];
      if (e) e[1] += 1; else ed.deck.list.push([id, 1]);
      store();
    }
    drawDeck();
    drawBadges();
  };
  actions.remove = function (id) {
    var e = ed.deck.list.filter(function (x) { return x[0] === id; })[0];
    if (!e) return;
    e[1] -= 1;
    if (!e[1]) ed.deck.list.splice(ed.deck.list.indexOf(e), 1);
    ed.msg = '';
    store();
    drawDeck();
    drawBadges();
  };
  actions.zoom = function (id) { peek(id); byId('closeup').classList.add('open'); };
  actions.closeZoom = function () { byId('closeup').classList.remove('open'); };
  actions.openDeck = function () { byId('dpanel').classList.add('open'); };
  actions.closeDeck = function () { byId('dpanel').classList.remove('open'); };
  actions.playDeck = function () { GameUI.showStart(ed.deck.id); };

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (b && !b.disabled) actions[b.dataset.act](b.dataset.arg);
  });
  root.addEventListener('contextmenu', function (e) {
    var b = e.target.closest('.pcard');
    if (!b) return;
    e.preventDefault();
    actions.remove(b.dataset.cardId);
  });
  ['mouseover', 'focusin'].forEach(function (type) {
    root.addEventListener(type, function (e) {
      var t = e.target.closest('[data-peek]');
      if (t && ed && byId('closeup')) peek(t.dataset.peek);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && byId('closeup')) actions.closeZoom();
  });

  function redraw() { if (refresh && !root.hidden) refresh(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

  function hide() { root.hidden = true; refresh = null; }

  return { menu: menu, builder: builder, hide: hide, redraw: redraw, coverArt: coverArt };
})();
