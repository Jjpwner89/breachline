// Main menu, deck builder and campaign map. Storage and the card pool come from Decks, runs from Campaign, card frames and game start from GameUI.
var Screens = (function () {
  var E = Engine, root = document.getElementById('screen'), refresh = null, actions = {};
  var COLOURS = ['W', 'U', 'B', 'R', 'G', 'N'], TYPES = ['unit', 'instant', 'enchant', 'spell', 'land'];
  var COLOUR_WORD = { W: 'white', U: 'blue', B: 'black', R: 'red', G: 'green', N: 'neutral' };
  var LAND_SHARE = 0.35;
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

  // Main menu, over the home scene

  var HOME = '<div class="home" aria-hidden="true"><div class="layers"><img class="field" src="art/web/ui/battlefield.jpg" alt="">' +
    '<span class="haze h1"></span><span class="haze h2"></span>' +
    '<img class="strand" src="art/web/ui/strand.jpg" alt=""><img class="strand glint" src="art/web/ui/strand.jpg" alt=""></div><canvas></canvas></div>';

  // A little ash and the odd ember drifting across the scene. It stops once the menu is gone, and pauses with the tab.
  function ash(canvas) {
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ctx = canvas.getContext('2d'), flecks = [], last = 0;
    function size() {
      var r = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvas.clientWidth * r; canvas.height = canvas.clientHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0);
    }
    size();
    for (var i = 0; i < 46; i++) flecks.push({ x: Math.random() * canvas.clientWidth, y: Math.random() * canvas.clientHeight, s: .6 + Math.random() * 1.5, v: 5 + Math.random() * 12, ph: Math.random() * 6, ember: Math.random() < .14 });
    window.addEventListener('resize', size);
    (function frame(now) {
      if (!canvas.isConnected) { window.removeEventListener('resize', size); return; }
      var dt = Math.min(.05, (now - (last || now)) / 1000), w = canvas.clientWidth, h = canvas.clientHeight, t = now / 1000; last = now;
      ctx.clearRect(0, 0, w, h);
      flecks.forEach(function (f) {
        f.x += f.v * dt; f.y -= f.v * .3 * dt + Math.sin(t + f.ph) * .12;
        if (f.x > w + 4) { f.x = -4; f.y = Math.random() * h; }
        if (f.y < -4) f.y = h + 4;
        ctx.fillStyle = f.ember ? 'rgba(255, 170, 90, ' + (.45 + .35 * Math.sin(t * 2 + f.ph)) + ')' : 'rgba(225, 215, 210, .32)';
        ctx.fillRect(f.x, f.y, f.s, f.s);
      });
      requestAnimationFrame(frame);
    })(performance.now());
  }

  function menu() {
    var n = Decks.saved().length, cont = GameUI.inProgress();
    function item(a, title, sub, primary) {
      return '<button type="button" class="mitem' + (primary ? ' primary' : '') + '" ' + act(a) + '><b>' + title + '</b><span>' + sub + '</span></button>';
    }
    function later(title, sub) {
      return '<div class="mitem off"><b>' + title + '</b><span>' + sub + '</span></div>';
    }
    var run = Campaign.current();
    show(HOME + '<main class="menu"><div class="mcol"><h1>Breachline</h1><nav class="mlist" aria-label="Main menu">' +
      (cont ? item('resume', 'Continue game', 'Go back to your current battle.', true) : '') +
      (run ? item('campaign', 'Continue run', esc(Campaign.storyOf(run).title) + ', chapter ' + (run.chapter + 1) + ' of ' + Campaign.storyOf(run).chapters.length + '.', !cont)
        : item('campaign', 'Campaign', 'Win battles and choose cards to keep. One loss ends the run.', !cont)) +
      item('exhibition', 'Exhibition', 'Any deck against the scripted bot or Claude.') +
      item('builder', 'Deck builder', (n ? plural(n, 'saved deck') : 'No saved decks yet') + '. Every card is open.') +
      item('testTable', 'Test table', 'Unlimited mana, and any card for either side. For checking effects.') +
      later('Multiplayer', 'Coming later. Collect cards from packs.') +
      '</nav></div></main>', menu);
    ash(root.querySelector('.home canvas'));
  }
  actions.menu = menu;
  actions.resume = function () { hide(); GameUI.resume(); };

  actions.exhibition = function () { GameUI.showStart(); };
  actions.testTable = function () { hide(); GameUI.sandbox(); };

  // Campaign

  var setupPlayer = 'bot', setupStory = 'vigil', mapPick = null, confirmAbandon = false;

  // A smooth line through the traced road, as far as stops legs.
  function roadPath(points, stops) {
    var d = 'M' + points[0][0] + ' ' + points[0][1];
    for (var i = 0; i < stops; i++) {
      var a = points[Math.max(i - 1, 0)], b = points[i], c = points[i + 1], e = points[Math.min(i + 2, points.length - 1)];
      d += 'C' + (b[0] + (c[0] - a[0]) / 6) + ' ' + (b[1] + (c[1] - a[1]) / 6) + ' ' + (c[0] - (e[0] - b[0]) / 6) + ' ' + (c[1] - (e[1] - b[1]) / 6) + ' ' + c[0] + ' ' + c[1];
    }
    return d;
  }
  // at is the chapter you stand on, or -1 before the run starts. The road itself is in the painting, so only the part you've walked is drawn.
  function mapHtml(story, at, picked) {
    var nodes = story.chapters.map(function (c, i) {
      var state = at < 0 || i > at ? 'next' : i < at ? 'done' : 'now';
      var word = state === 'done' ? 'cleared' : state === 'now' ? 'your next battle' : 'not reached yet';
      return '<button type="button" class="mnode ' + state + (picked === i ? ' picked' : '') + '" style="left:' + c.x + '%;top:' + c.y + '%" ' + act('mapPick', i) + ' aria-label="Chapter ' + (i + 1) + ', ' + esc(c.title) + ', ' + word + '"' + (at < 0 ? ' disabled' : '') + '>' +
        '<span class="seal">' + (i + 1) + '</span><span class="mlabel">' + esc(c.title) + '</span></button>';
    }).join('');
    var walked = '';
    if (at > 0 && story.road) {
      var stop = story.chapters[at], legs = story.road.map(function (p) { return p[0] + ',' + p[1]; }).indexOf(stop.x + ',' + stop.y), line = roadPath(story.road, legs);
      walked = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="walkedbase" d="' + line + '"/><path class="walked" d="' + line + '"/></svg>';
    }
    return '<div class="cmap"><img src="' + story.map + '" alt="" decoding="sync" draggable="false">' + walked + nodes + '</div>';
  }
  function deckGrid(list) {
    var cards = list.slice().sort(function (a, b) { return cardOrder(a[0], b[0]); }).map(function (e) {
      return '<div class="pcard"><div class="card">' + GameUI.frameHtml(E.CARDS[e[0]]) + '</div>' + (e[1] > 1 ? '<span class="have">× ' + e[1] + '</span>' : '') + '</div>';
    }).join('');
    return '<section class="pickset"><h2>Your deck: ' + plural(E.deckSize(list), 'card') + '</h2><div class="cgrid rdeck">' + cards + '</div></section>';
  }
  function opponentName(player) { return player === 'bot' ? 'the scripted bot' : 'Claude, ' + AI.levels[player].label; }
  function campaignHead(title) {
    return '<header class="shead"><button type="button" class="btn" ' + act('menu') + '>Main menu</button><h1>' + esc(title) + '</h1></header>' +
      (Campaign.persistent() ? '' : '<p class="warn">This browser is blocking storage, so this run lasts only until you close this tab.</p>');
  }
  function fitAll() { GameUI.fitCards(root); }

  function setup() {
    var ready = GameUI.modelReady(), all = Campaign.ORDER.map(function (k) { return Campaign.STORIES[k]; }), story = Campaign.STORIES[setupStory];
    var choose = '<div class="astories" role="group" aria-label="Campaigns">' + all.map(function (a) {
      return '<button type="button" class="astory" ' + act('setStory', a.id) + ' aria-pressed="' + (a === story) + '">' + symbol(a.colour) + GameUI.ALIGNMENT[a.colour] + '</button>';
    }).join('') + '</div>';
    if (setupPlayer !== 'bot' && !ready) setupPlayer = 'bot';
    var who = '<button type="button" class="who-plays" ' + act('setPlayer', 'bot') + ' aria-pressed="' + (setupPlayer === 'bot') + '"><b>Scripted bot</b><span>Plays instantly, with fixed habits.</span></button>' +
      ['easy', 'normal', 'hard'].map(function (k) {
        return '<button type="button" class="who-plays" ' + act('setPlayer', k) + ' aria-pressed="' + (setupPlayer === k) + '"' + (ready ? '' : ' disabled') + '><b>Claude: ' + AI.levels[k].label + '</b><span>' + AI.levels[k].blurb + '</span></button>';
      }).join('');
    show('<div class="page">' + campaignHead('Campaign') + '<div class="camp">' + mapHtml(story, -1) +
      '<aside class="cside">' + choose + '<div class="story"><p class="eyebrow">' + symbol(story.colour) + GameUI.ALIGNMENT[story.colour] + '</p><h2>' + esc(story.title) + '</h2><p>' + esc(story.premise) + '</p>' +
      '<p class="hint">You start with ' + esc(E.DECKS[story.starter].name) + '.</p></div>' +
      '<h2>Who plays your enemies</h2><div class="cwho">' + who + '</div>' +
      '<p class="hint">' + (ready ? 'Stays the same for the whole run. Claude uses your own Claude usage, about a dozen requests a battle.' : 'Stays the same for the whole run. Claude opponents work only on the published page inside Claude.') + '</p>' +
      '<p class="hint">' + story.chapters.length + ' battles, with a card to choose between them. If you lose one, the run is over.</p>' +
      '<button type="button" class="btn primary big" ' + act('beginRun') + '>Begin the run</button></aside></div></div>', setup);
  }
  function chapterPanel(run, i) {
    var story = Campaign.storyOf(run), c = story.chapters[i], head = '<p class="eyebrow">Chapter ' + (i + 1) + ' of ' + story.chapters.length + '</p><h2>' + esc(c.title) + '</h2>';
    if (i > run.chapter) return '<div class="story">' + head + '<p>You haven\'t reached this yet.</p></div>';
    var foe = '<p class="foe">' + symbol(c.enemy.colours[0]) + esc(c.enemy.name) + '</p>';
    if (i < run.chapter) return '<div class="story">' + head + '<p>' + esc(c.text) + '</p>' + foe + '<p class="cleared">Cleared</p></div>';
    return '<div class="story">' + head + '<p>' + esc(c.text) + '</p>' + foe + '</div>' +
      '<button type="button" class="btn primary big" ' + act('fight') + '>' + (run.battle ? 'Continue the battle' : 'Fight') + '</button>';
  }
  function mapScreen(run) {
    var story = Campaign.storyOf(run), picked = mapPick === null ? run.chapter : mapPick;
    var leave = confirmAbandon
      ? '<span class="dask">End this run for good?</span><button type="button" class="btn danger" ' + act('abandonRun') + '>End run</button><button type="button" class="btn" ' + act('keepRun') + '>Keep going</button>'
      : '<button type="button" class="btn" ' + act('askAbandon') + '>Abandon run</button>';
    show('<div class="page">' + campaignHead(story.title) + '<div class="camp">' + mapHtml(story, run.chapter, picked) +
      '<aside class="cside">' + chapterPanel(run, picked) +
      '<p class="hint">Your enemies are played by ' + opponentName(run.player) + '.</p><div class="cleave">' + leave + '</div></aside></div>' +
      deckGrid(run.list) + '</div>', campaign);
    fitAll();
  }
  function reward(run) {
    var offer = run.offer, c = Campaign.chapterOf(run);
    var cards = offer.cards.map(function (id) {
      var spoil = E.CARDS[id].colour === offer.spoils;
      return '<div class="rpick"><span class="rfrom">' + (spoil ? 'Won from ' + esc(c.enemy.name) : 'Joins your side') + '</span>' +
        '<button type="button" class="card" ' + act('takeCard', id) + ' aria-label="Keep ' + esc(E.CARDS[id].name) + '">' + GameUI.frameHtml(E.CARDS[id], { big: true }) + '</button></div>';
    }).join('');
    var lands = offer.lands.map(function (id) { return '<button type="button" class="btn" ' + act('takeCard', id) + '>' + symbol(E.CARDS[id].colour) + ' ' + esc(E.CARDS[id].name) + '</button>'; }).join('');
    show('<div class="page">' + campaignHead('Choose a card to keep') +
      '<p class="hint rlead">You beat ' + esc(c.enemy.name) + '. Your deck has ' + plural(E.deckSize(run.list), 'card') + '.</p>' +
      '<div class="rpicks">' + cards + '</div>' +
      '<div class="rother"><span class="hint">Or add a land:</span>' + lands + '<button type="button" class="btn" ' + act('takeCard') + '>Take nothing</button></div>' +
      deckGrid(run.list) + '</div>', campaign);
    fitAll();
  }
  function runEnd(run) {
    var story = Campaign.storyOf(run), won = run.status === 'won', c = Campaign.chapterOf(run);
    var taken = run.taken.length ? 'You kept ' + run.taken.map(function (id) { return E.CARDS[id].name; }).join(', ') + '.' : 'You kept no new cards.';
    show('<div class="page rend"><div class="story"><p class="eyebrow">' + esc(story.title) + '</p><h2>' + (won ? 'The road ends here' : 'The run is over') + '</h2>' +
      '<p>' + esc(won ? story.ending : story.defeat) + '</p>' +
      '<p class="hint">' + (won ? 'You cleared all ' + story.chapters.length + ' chapters.' : 'You fell at ' + esc(c.title) + ', chapter ' + (run.chapter + 1) + ' of ' + story.chapters.length + '.') + ' ' + esc(taken) + '</p></div>' +
      '<div class="cleave"><button type="button" class="btn primary" ' + act('newRun') + '>Start a new run</button><button type="button" class="btn" ' + act('leaveEnd') + '>Main menu</button></div></div>', campaign);
  }
  function campaign() {
    var done = Campaign.ended(), run = Campaign.current();
    if (done) return runEnd(done);
    if (!run) return setup();
    if (run.status === 'reward') return reward(run);
    mapScreen(run);
  }
  actions.campaign = function () { mapPick = null; confirmAbandon = false; campaign(); };
  actions.setPlayer = function (key) { setupPlayer = key; setup(); };
  actions.setStory = function (id) { setupStory = id; setup(); };
  actions.beginRun = function () { Campaign.begin(setupStory, setupPlayer); actions.campaign(); };
  actions.mapPick = function (i) { mapPick = +i; campaign(); };
  actions.fight = function () { GameUI.playChapter(); };
  actions.takeCard = function (id) { Campaign.take(id === undefined ? null : id); actions.campaign(); };
  actions.askAbandon = function () { confirmAbandon = true; campaign(); };
  actions.keepRun = function () { confirmAbandon = false; campaign(); };
  actions.abandonRun = function () { Campaign.abandon(); actions.campaign(); };
  actions.newRun = function () { Campaign.dismiss(); actions.campaign(); };
  actions.leaveEnd = function () { Campaign.dismiss(); menu(); };

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

  return { menu: menu, builder: builder, campaign: actions.campaign, hide: hide, redraw: redraw, coverArt: coverArt };
})();
