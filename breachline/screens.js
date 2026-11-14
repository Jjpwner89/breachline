// Main menu, deck builder and campaign map. Storage and the card pool come from Decks, runs from Campaign, card frames and game start from GameUI.
var Screens = (function () {
  var E = Engine, root = document.getElementById('screen'), refresh = null, actions = {};
  var COLOURS = ['W', 'U', 'B', 'R', 'G', 'N'], TYPES = ['unit', 'instant', 'enchant', 'spell', 'relic', 'land'];
  var COLOUR_WORD = { W: 'white', U: 'blue', B: 'black', R: 'red', G: 'green', N: 'neutral' };
  var LAND_SHARE = 0.35;
  // Editor state. Filters survive leaving the editor, so they stay put when moving between decks.
  var ed = null, filters = { type: {}, colour: {}, faction: {}, q: '', own: 'all' }, confirmDelete = null, flipped = null;
  // The filter panel starts folded; whether it and each of its rows is open is remembered on this device.
  var FOLD_KEY = 'breachline.filterFolds', folds = { panel: true };
  try { folds = JSON.parse(localStorage.getItem(FOLD_KEY)) || folds; } catch (e) {}
  // How the deck builder orders the pool. Colour is the order it always had (creator, 2026-11-13).
  var SORT_KEY = 'breachline.cardSort', sort = { by: 'colour', down: false };
  try { sort = JSON.parse(localStorage.getItem(SORT_KEY)) || sort; } catch (e) {}
  // The reserve card picked to swap into a campaign deck.
  var swapIn = null;

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
    // The campaign's screens all redraw through setup or campaign, and get the travelling music of the story chosen or
    // under way.
    var run = onRefresh === campaign && Campaign.current();
    if (onRefresh === setup || onRefresh === campaign) Sfx.mood('road', onRefresh === setup ? setupStory : run && run.story);
    else Sfx.mood('hearth');
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
    var problems = E.deckProblems(d.list), short = Progress.missing(d.list);
    return problems.length ? problems[0] : short ? 'Missing ' + plural(short, 'card') : plural(E.deckSize(d.list), 'card');
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
    // The free starter comes first, once the account has had its chance to say one was already chosen.
    if (Progress.ready() && !Progress.state().starter) return Collection.starter();
    var n = Decks.saved().length, cont = GameUI.inProgress(), st = Progress.state();
    function item(a, title, sub, primary) {
      return '<button type="button" class="mitem' + (primary ? ' primary' : '') + '" ' + act(a) + '><b>' + title + '</b><span>' + sub + '</span></button>';
    }
    function later(title, sub) {
      return '<div class="mitem off"><b>' + title + '</b><span>' + sub + '</span></div>';
    }
    var run = Campaign.current(), learn = !Tutorial.seen() && !st.battles.length;
    var embs = '<div class="memb">' + Campaign.ORDER.map(function (id) {
      var st = Campaign.STORIES[id], won = Progress.cleared(id), pres = Progress.prestiged(id), said = pres ? 'beaten on prestige' : won ? 'beaten' : '';
      return '<img src="art/web/ui/emblem-' + st.colour + '.png" alt="' + esc(st.title) + ', ' + (said || 'not beaten yet') + '" title="' + esc(st.title) + (said ? ': ' + said : '') + '"' + (won ? ' class="won' + (pres ? ' prestige' : '') + '"' : '') + '>';
    }).join('') + '</div>';
    // The corner holds what isn't a battle or your cards: sound, the test table, the tutorial and your account (creator, 2026-11-13).
    // A first visit lights the tutorial and points at it, until it's tried or the note is closed.
    var who = Accounts.available() && Accounts.name(), tip = learn && !tutTipShut();
    var corner = '<header class="mcorner"><button type="button" class="btn snd" data-sound aria-pressed="' + !Sfx.muted() + '" aria-label="Sound"></button>' +
      '<button type="button" class="btn" ' + act('testTable') + ' title="Unlimited mana, and any card for either side. For checking effects.">Test table</button>' +
      '<span class="mtut"><button type="button" class="btn' + (learn ? ' primary lit' : '') + '" ' + act('tutorial') + ' title="A tour of the table and a short practice battle.">Tutorial</button>' +
        (tip ? '<span class="mtip" role="note"><button type="button" class="mtipx" ' + act('shutTutTip') + ' aria-label="Close">×</button><b>New here? Start here.</b>Tour the table, then win a short battle.</span>' : '') + '</span>' +
      (Accounts.available() ? '<button type="button" class="macct" ' + act('account') + ' title="' + (who ? 'Signed in as ' + esc(who) + '. Your progress follows you to other devices.' : 'Keep your progress and decks on every device.') + '">' +
        (who ? '<span class="minit" aria-hidden="true">' + esc(who.trim().charAt(0).toUpperCase()) + '</span><span class="mname">' + esc(who) + '</span><span class="sr">, your account</span>' : '<span class="mname">Sign in</span>') + '</button>' : '') + '</header>';
    show(HOME + corner + '<main class="menu"><div class="mcol"><h1>Breachline</h1>' + embs + '<nav class="mlist" aria-label="Main menu">' +
      (cont ? item('resume', 'Continue game', 'Go back to your current battle.', true) : '') +
      (run ? item('campaign', 'Continue run', esc(Campaign.storyOf(run).title) + (run.prestige ? ' on prestige' : '') + ', chapter ' + (run.chapter + 1) + ' of ' + Campaign.storyOf(run).chapters.length + '.', !cont)
        : item('campaign', 'Campaign', 'Win battles and choose cards to keep. One loss ends the run.', !cont)) +
      item('exhibition', 'Exhibition', 'Any deck against the scripted bot or Claude.') +
      item('online', 'Multiplayer', Net.saved() ? 'Your online match is waiting for you.' : 'Play another person online. Each of you brings a deck.') +
      '<span class="mgap" aria-hidden="true"></span>' +
      item('builder', 'Deck builder', (n ? plural(n, 'saved deck') : 'No saved decks yet') + '. Build from the cards you own.') +
      item('collection', 'Collection', st.gold + ' gold. Open packs, craft cards and see your record.') +
      '</nav>' + (Progress.ready() ? '' : '<p class="hint mload">Checking your ' + (Accounts.available() ? '' : 'Claude ') + 'account for saved progress…</p>') + '</div></main>', menu);
    ash(root.querySelector('.home canvas'));
  }
  actions.menu = menu;
  var TUT_TIP = 'breachline.tutorialTipShut';
  function tutTipShut() { try { return localStorage.getItem(TUT_TIP) === '1'; } catch (e) { return false; } }
  actions.shutTutTip = function () {
    try { localStorage.setItem(TUT_TIP, '1'); } catch (e) { /* the note just comes back next visit */ }
    var t = root.querySelector('.mtip');
    if (t) t.remove();
  };
  actions.resume = function () { hide(); GameUI.resume(); };

  actions.exhibition = function () { GameUI.showStart(); };
  actions.testTable = function () { hide(); GameUI.sandbox(); };
  actions.tutorial = function () { hide(); GameUI.tutorial(); };

  // Multiplayer. One player starts a match and sends its code, the other enters it, and the battle begins once both are in.
  // Any deck needs the cards you own, the same as in Exhibition. Open decks are the exception: anyone can bring one,
  // so a new player still has a fair choice, without its cards joining their collection.
  var netDeck = null, netCode = '';
  function netDecks() {
    var ok = function (d) { return !E.deckProblems(d.list).length && !d.open && Decks.yours(d); };
    return { mine: Decks.saved().filter(ok), fixed: Decks.starters().concat(Decks.themes()).filter(ok), open: Decks.themes().filter(function (d) { return d.open; }) };
  }
  function online() {
    GameUI.warmAllArt();
    var m = Net.current(), saved = Net.saved(), how = Net.transport(), body;
    if (m && !m.screenHeard) {
      m.screenHeard = true;
      m.on(function (what) {
        if (m !== Net.current()) return;
        if (what === 'setup') return Polish.lamp(function () { GameUI.online(m); });
        if (refresh === online) online();
      });
    }
    var all = netDecks(), pool = all.mine.concat(all.fixed, all.open);
    if (!pool.some(function (d) { return d.id === netDeck; })) netDeck = (all.mine[0] || Decks.find(Progress.state().starter) || pool[0]).id;
    var inClaude = how === 'claude';
    var note = '<p class="hint">' + (inClaude ? 'Both of you need this page open in Claude. If your opponent isn\'t in your organization, invite them by email from the Share menu first.'
      : 'Your opponent opens this same page in their own browser. The two browsers connect to each other directly, which a few strict work or school networks block.') + '</p>';
    if (!how) body = '<p class="warn">Online play works on the published page inside Claude.</p>';
    else if (m && !m.setup) {
      var why = m.status === 'failed' ? (inClaude ? 'The match room couldn\'t be reached. You need to be signed in to Claude, and invited to this page if you\'re outside its organization.' : 'The connection service couldn\'t be reached. Check your internet connection, then try again.')
        : m.problem === 'full' ? 'That match already has two players. Check the code.'
        : m.problem === 'version' ? 'Your opponent has a different version of the game open. Both of you reload the page, then try again.'
        : m.seat === 0 ? 'Send this code to your opponent. The battle starts as soon as they join.' : 'Looking for the match. It starts once the player who made it is here.';
      body = '<section class="pickset netwait"><h2>' + (m.seat === 0 ? 'Your match code' : 'Joining') + '</h2><p class="netcode">' + esc(m.code) + '</p>' +
        '<p class="hint" role="status">' + why + '</p><p class="hint netroom">' + esc(roomLine(m)) + '</p><div class="dtools"><button type="button" class="btn" ' + act('netCancel') + '>Cancel</button></div></section>' + note;
    } else if (saved) {
      body = '<section class="pickset netwait"><h2>Your match</h2><p class="hint">' + esc(deckName(saved.setup.decks[saved.seat])) + ' against ' + esc(deckName(saved.setup.decks[1 - saved.seat])) + ', code ' + esc(saved.code) + '. ' +
        (GameUI.inOnline() ? 'It\'s still going.' : 'It carries on where it stopped once you\'re both back.') + '</p>' +
        '<div class="dtools"><button type="button" class="btn primary" ' + act('netRejoin') + '>' + (GameUI.inOnline() ? 'Back to the battle' : 'Rejoin') + '</button></div></section>' + note;
    } else {
      var tiles = function (list) { return '<div class="dtiles">' + list.map(function (d) { return deckPick(d, d.id === netDeck); }).join('') + '</div>'; };
      body = '<section class="pickset netplay"><h2>Play</h2><div class="netrow"><button type="button" class="btn primary" ' + act('netHost') + '>Start a match</button>' +
        '<span class="netor">or</span><label class="netjoin"><span>Match code</span><input id="netCode" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="12" value="' + esc(netCode) + '" placeholder="abc23"></label>' +
        '<button type="button" class="btn" ' + act('netJoin') + '>Join</button></div><p class="hint">Choose your deck below first. Start a match and send its code, or enter the code you were sent.</p></section>' + note +
        (all.mine.length ? '<section class="pickset"><h2>Your decks</h2>' + tiles(all.mine) + '</section>' : '') +
        (all.fixed.length ? '<section class="pickset"><h2>Starter and theme decks</h2>' + tiles(all.fixed) + '</section>' : '') +
        '<section class="pickset"><h2>Open to everyone</h2><p class="hint">Anyone can bring these, whatever they own. Playing one doesn\'t add its cards to your collection.</p>' + tiles(all.open) + '</section>';
    }
    show('<div class="page"><header class="shead"><button type="button" class="btn" ' + act('menu') + '>Main menu</button><h1>Multiplayer</h1></header>' + body + '</div>', online);
    var input = byId('netCode');
    if (input) input.addEventListener('input', function () { netCode = input.value; });
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') actions.netJoin(); });
    fitAll();
  }
  // What the match room looks like from here, so a match that never starts says where it stopped.
  function roomLine(m) {
    var r = m.room, s;
    if (m.status === 'connecting') return 'Connecting to the match room…';
    if (m.status === 'failed' || m.status === 'lost') return 'The match room turned this page away' + (r.error ? ' (' + r.error + ').' : '.');
    s = m.status === 'down' ? 'Reconnecting to the match room.' : 'Connected to the match room.';
    s += !r.pages ? ' No other page is here yet.' : ' ' + (r.pages === 1 ? 'One other page is' : r.pages + ' other pages are') + ' here' +
      (r.players < r.pages ? (r.players ? ', ' + r.players + ' of them in this match' : ', not in this match') : '') + '.';
    if (r.error) s += ' This page\'s last message was refused (' + r.error + ').';
    // The platform's own counts, this page included, for when a match never starts.
    if (r.raw) s += ' [match room ' + (r.raw.named < 0 ? 'not joined' : r.raw.named) + ', lobby ' + r.raw.lobby + ']';
    return s;
  }
  function deckName(d) { return typeof d === 'string' ? E.DECKS[d].name : d.name; }
  function netForGame(id) { var d = Decks.find(id); return d.starter ? id : { name: d.name, list: d.list }; }
  actions.online = online;
  actions.netDeck = function (id) { netDeck = id; online(); };
  actions.netHost = function () { Net.host(netForGame(netDeck)); online(); };
  actions.netJoin = function () {
    var c = Net.cleanCode(netCode);
    if (!c) { var i = byId('netCode'); if (i) i.focus(); return; }
    Net.join(c, netForGame(netDeck));
    online();
  };
  actions.netCancel = function () { Net.forget(); online(); };

  // Accounts, on the copy hosted outside Claude (accounts.js). Signing in or out reloads the page, so progress and decks
  // start again from the right copy.
  var acctBusy = false;
  function account() {
    var name = Accounts.name(), body;
    if (name) body = '<section class="pickset acct"><h2>Signed in as ' + esc(name) + '</h2>' +
      '<p class="hint">Your progress and decks are saved to this account, so they follow you to any device where you sign in.</p>' +
      '<div class="dtools"><button type="button" class="btn" ' + act('acctLeave') + '>Sign out</button></div>' +
      '<p class="hint" id="acctMsg" role="status">Signing out takes your progress off this browser. It stays in your account.</p></section>';
    else body = '<section class="pickset acct"><h2>Sign in</h2>' +
      '<p class="hint">Keep your progress and decks on every device. An account is just a name and a password, with no email.</p>' +
      '<div class="acctform"><label><span>Name</span><input id="acctName" type="text" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="24"></label>' +
      '<label><span>Password</span><input id="acctPass" type="password" autocomplete="current-password" maxlength="100"></label></div>' +
      '<div class="dtools"><button type="button" class="btn primary" ' + act('acctEnter') + '>Sign in</button><button type="button" class="btn" ' + act('acctCreate') + '>Create account</button></div>' +
      '<p class="hint" id="acctMsg" role="status"></p>' +
      '<p class="hint">There\'s no way to reset a password, so choose one you\'ll remember. If the account already has progress, it replaces what this browser has. A new account keeps it.</p></section>';
    show('<div class="page"><header class="shead"><button type="button" class="btn" ' + act('menu') + '>Main menu</button><h1>Account</h1></header>' + body + '</div>', account);
    var pass = byId('acctPass');
    if (pass) pass.addEventListener('keydown', function (e) { if (e.key === 'Enter') actions.acctEnter(); });
  }
  function acctGo(create) {
    var n = byId('acctName'), p = byId('acctPass'), msg = byId('acctMsg');
    if (!n || acctBusy) return;
    acctBusy = true;
    msg.textContent = create ? 'Creating your account…' : 'Signing in…';
    Accounts.enter(n.value, p.value, create).then(function () { location.reload(); }, function (e) {
      acctBusy = false;
      msg.textContent = Accounts.problem(e.code);
    });
  }
  actions.account = account;
  actions.acctEnter = function () { acctGo(false); };
  actions.acctCreate = function () { acctGo(true); };
  actions.acctLeave = function () {
    if (acctBusy) return;
    acctBusy = true;
    byId('acctMsg').textContent = 'Signing out…';
    Accounts.leave().then(function () { location.reload(); });
  };
  actions.netRejoin = function () {
    if (GameUI.inOnline()) { hide(); return GameUI.resume(); }
    var m = Net.resume();
    if (m) Polish.lamp(function () { GameUI.online(m); });
  };

  // Campaign

  var setupPlayer = 'bot', setupStory = 'vigil', setupPrestige = false, mapPick = null, confirmAbandon = false;

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
      return '<button type="button" class="mnode ' + state + (i === story.chapters.length - 1 ? ' last' : '') + (picked === i ? ' picked' : '') + '" style="left:' + c.x + '%;top:' + c.y + '%" ' + act('mapPick', i) + ' aria-label="Chapter ' + (i + 1) + ', ' + esc(c.title) + ', ' + word + '"' + (at < 0 ? ' disabled' : '') + '>' +
        '<span class="seal">' + (i + 1) + '</span><span class="mlabel">' + esc(c.title) + '</span></button>';
    }).join('');
    var walked = '';
    if (at > 0 && story.road) {
      var stop = story.chapters[at], legs = story.road.map(function (p) { return p[0] + ',' + p[1]; }).indexOf(stop.x + ',' + stop.y), line = roadPath(story.road, legs);
      walked = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="walkedbase" d="' + line + '"/><path class="walked" d="' + line + '"/></svg>';
    }
    var here = at >= 0 ? story.chapters[at] : null;
    var army = here ? '<span class="army ' + story.colour + '" style="left:' + here.x + '%;top:' + here.y + '%"></span>' : '';
    return '<div class="cmap"><img src="' + story.map + '" alt="" decoding="sync" draggable="false">' + walked + nodes + army + '</div>';
  }
  // After a win the army marches from the chapter it took to the next, along the painted road, a step at a time.
  var standing = {};
  function march(run) {
    var story = Campaign.storyOf(run), key = run.story + ':' + run.seed, from = standing[key], to = run.chapter;
    standing[key] = to;
    var army = root.querySelector('.cmap .army');
    if (!army || from === undefined || from >= to || !Polish.enabled()) return;
    var a = story.chapters[from], b = story.chapters[to], pts = null;
    if (story.road) {
      var ids = story.road.map(function (p) { return p[0] + ',' + p[1]; }), i0 = ids.indexOf(a.x + ',' + a.y), i1 = ids.indexOf(b.x + ',' + b.y);
      if (i0 >= 0 && i1 > i0) {
        // Measured with the map's 3:2 shape, so the pace is even across the painting.
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path'), wide = story.road.map(function (p) { return [p[0] * 1.5, p[1]]; });
        var whole = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        whole.setAttribute('style', 'position:absolute;width:0;height:0');
        whole.appendChild(path);
        document.body.appendChild(whole);
        path.setAttribute('d', roadPath(wide, i0));
        var l0 = i0 ? path.getTotalLength() : 0;
        path.setAttribute('d', roadPath(wide, i1));
        var l1 = path.getTotalLength();
        pts = function (k) { var q = path.getPointAtLength(l0 + (l1 - l0) * k); return [q.x / 1.5, q.y]; };
        pts.done = function () { whole.remove(); };
        pts.len = l1 - l0;
      }
    }
    if (!pts) { pts = function (k) { return [a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k]; }; pts.len = Math.hypot((b.x - a.x) * 1.5, b.y - a.y); }
    var ms = Math.max(1800, pts.len * 70), t0 = null, steps = 0;
    army.style.left = a.x + '%'; army.style.top = a.y + '%';
    (function step(now) {
      if (!army.isConnected) { if (pts.done) pts.done(); return; }
      t0 = t0 || now;
      var k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, p = pts(e), stride = (now - t0) / 380;
      army.style.left = p[0] + '%';
      army.style.top = p[1] + '%';
      // A soft bob and sway each stride, fading out as it arrives.
      army.style.transform = 'translate(-50%, -100%) translateY(' + (-Math.abs(Math.sin(stride * Math.PI)) * 3 * (1 - k * k)) + 'px) rotate(' + (Math.sin(stride * Math.PI) * 2.5 * (1 - k)) + 'deg)';
      if (Math.floor(stride) > steps && k < .97) { steps = Math.floor(stride); Sfx.play('map-step', { gap: 0, vol: .8 }); }
      if (k < 1) requestAnimationFrame(step);
      else { army.style.transform = ''; if (pts.done) pts.done(); }
    })(performance.now());
  }
  function deckGrid(list, title) {
    var cards = list.slice().sort(function (a, b) { return cardOrder(a[0], b[0]); }).map(function (e) {
      return '<div class="pcard"><div class="card">' + GameUI.frameHtml(E.CARDS[e[0]]) + '</div>' + (e[1] > 1 ? '<span class="have">× ' + e[1] + '</span>' : '') + '</div>';
    }).join('');
    return '<section class="pickset"><h2>' + (title || 'Your deck') + ': ' + plural(E.deckSize(list), 'card') + '</h2><div class="cgrid rdeck">' + cards + '</div></section>';
  }
  // The campaign deck and its reserve. Pick a reserve card, then the deck card it replaces; the deck keeps its size.
  function runDeck(run) {
    var locked = !!run.battle, spare = run.spare || [];
    if (swapIn && !spare.some(function (e) { return e[0] === swapIn; })) swapIn = null;
    var inDeck = function (id) { var e = run.list.filter(function (x) { return x[0] === id; })[0]; return e ? e[1] : 0; };
    var grid = function (list, tile) { return list.slice().sort(function (a, b) { return cardOrder(a[0], b[0]); }).map(tile).join(''); };
    var tile = function (e, cls, attrs, label) {
      var c = E.CARDS[e[0]];
      return '<div class="pcard' + cls + '">' + (attrs ? '<button type="button" class="card" ' + attrs + ' aria-label="' + esc(label + c.name) + '">' : '<div class="card">') +
        GameUI.frameHtml(c) + (attrs ? '</button>' : '</div>') + (e[1] > 1 ? '<span class="have">× ' + e[1] + '</span>' : '') + '</div>';
    };
    var deck = grid(run.list, function (e) { return tile(e, '', swapIn && !locked ? act('swapOut', e[0]) : '', 'Swap out '); });
    var reserve = grid(spare, function (e) {
      var full = inDeck(e[0]) >= E.maxCopies(e[0]);
      return tile(e, (e[0] === swapIn ? ' chosen' : '') + (full ? ' maxed' : ''), locked || full ? '' : act('pickSpare', e[0]), 'Swap in ');
    });
    var hint = locked ? 'Finish this battle before changing your deck.'
      : swapIn ? 'Choose a card in your deck to swap out for ' + esc(E.CARDS[swapIn].name) + '. <button type="button" class="linkbtn" ' + act('pickSpare') + '>Cancel</button>'
      : spare.length ? 'Choose a card in your reserve to swap into your deck.'
      : 'Cards you win go to your reserve, and you can swap them into your deck here between battles.';
    // The reserve comes first, since a swap starts there.
    var note = '<p class="hint" role="status">' + hint + '</p>';
    return (spare.length ? '<section class="pickset"><h2>Reserve: ' + plural(E.deckSize(spare), 'card') + '</h2>' + note + '<div class="cgrid rdeck">' + reserve + '</div></section>' : '') +
      '<section class="pickset"><h2>Your deck: ' + plural(E.deckSize(run.list), 'card') + '</h2>' + (spare.length ? '' : note) +
      '<div class="cgrid rdeck' + (swapIn && !locked ? ' swapping' : '') + '">' + deck + '</div></section>';
  }
  function opponentName(player) { return player === 'bot' ? 'the scripted bot' : 'Claude, ' + AI.levels[player].label; }
  function campaignHead(title, extra, prestige) {
    return '<header class="shead"><button type="button" class="btn" ' + act('menu') + '>Main menu</button><h1>' + esc(title) + (prestige ? ' <span class="pmark">Prestige</span>' : '') + '</h1>' +
      (extra ? '<div class="push cleave">' + extra + '</div>' : '') + '</header>' +
      (Campaign.persistent() ? '' : '<p class="warn">This browser is blocking storage, so this run lasts only until you close this tab.</p>');
  }
  function fitAll() { GameUI.fitCards(root); }

  function setup() {
    var ready = GameUI.modelReady(), all = Campaign.ORDER.map(function (k) { return Campaign.STORIES[k]; }), story = Campaign.STORIES[setupStory];
    var choose = '<div class="astories" role="group" aria-label="Campaigns">' + all.map(function (a) {
      var badge = Progress.prestiged(a.id) ? '<span class="pbadge" title="Beaten on prestige"><span class="sr">, beaten on prestige</span></span>' : '';
      return '<button type="button" class="astory" ' + act('setStory', a.id) + ' aria-pressed="' + (a === story) + '">' + symbol(a.colour) + GameUI.ALIGNMENT[a.colour] + badge + '</button>';
    }).join('') + '</div>';
    // Prestige opens once a campaign is beaten, and each run picks normal or prestige (creator, 2026-11-13).
    var beaten = !!Progress.cleared(story.id), pres = beaten && setupPrestige;
    var level = !beaten ? '' : '<h2>Difficulty</h2><div class="cwho">' +
      '<button type="button" class="who-plays" ' + act('setPrestige', '') + ' aria-pressed="' + !pres + '"><b>Normal</b><span>The campaign as you beat it.</span></button>' +
      '<button type="button" class="who-plays" ' + act('setPrestige', '1') + ' aria-pressed="' + pres + '"><b>Prestige</b><span>Stronger enemies, some already on the field. Double gold.</span></button></div>';
    if (setupPlayer !== 'bot' && !ready) setupPlayer = 'bot';
    var who = '<button type="button" class="who-plays" ' + act('setPlayer', 'bot') + ' aria-pressed="' + (setupPlayer === 'bot') + '"><b>Scripted bot</b><span>Plays instantly, with fixed habits.</span></button>' +
      ['easy', 'normal', 'hard'].map(function (k) {
        return '<button type="button" class="who-plays" ' + act('setPlayer', k) + ' aria-pressed="' + (setupPlayer === k) + '"' + (ready ? '' : ' disabled') + '><b>Claude: ' + AI.levels[k].label + '</b><span>' + AI.levels[k].blurb + '</span></button>';
      }).join('');
    show('<div class="page">' + campaignHead('Campaign') + '<div class="camp">' + mapHtml(story, -1) +
      '<aside class="cside">' + choose + '<div class="story"><p class="eyebrow">' + symbol(story.colour) + GameUI.ALIGNMENT[story.colour] + '</p><h2>' + esc(story.title) + '</h2><p>' + esc(story.premise) + '</p>' +
      '<p class="hint">You start with <b>' + esc(E.DECKS[story.starter].name) + '</b>. ' + esc(Help.deck({ id: story.starter })) + '</p>' +
      '<p class="hint"><b>' + GameUI.ALIGNMENT[story.colour] + '.</b> ' + esc(Help.alignment(story.colour)) + '</p></div>' +
      level + '<h2>Who plays your enemies</h2><div class="cwho">' + who + '</div>' +
      '<p class="hint">' + (ready ? 'Stays the same for the whole run. Claude uses your own Claude usage, about a dozen requests a battle.' : 'Stays the same for the whole run. Claude opponents work only on the published page inside Claude.') + '</p>' +
      '<p class="hint">' + story.chapters.length + ' battles, with a card to choose between them. If you lose one, the run is over.</p>' +
      '<p class="hint">' + (pres ? 'Prestige battles pay double gold, and beating every chapter pays double too and earns this campaign its prestige badge. Your card choices lean toward rarer cards.'
        : beaten ? 'You\'ve beaten this campaign, so the cards you pick stay with the run, and its battles pay half again as much gold.'
        : 'Beat it to win ' + esc(E.DECKS[story.starter].name) + ' for your collection, along with every card you pick on the way.') + '</p>' +
      '<button type="button" class="btn primary big" ' + act('beginRun') + '>Begin the run</button></aside></div></div>', setup);
  }
  function chapterPanel(run, i) {
    var story = Campaign.storyOf(run), c = story.chapters[i], head = '<p class="eyebrow">Chapter ' + (i + 1) + ' of ' + story.chapters.length + '</p><h2>' + esc(c.title) + '</h2>';
    if (i > run.chapter) return '<div class="story">' + head + '<p>You haven\'t reached this yet.</p></div>';
    var foe = '<p class="foe">' + symbol(c.enemy.colours[0]) + esc(c.enemy.name) + '</p>', held = Campaign.unitsOf(run.story, i, run.prestige);
    if (held.length && i >= run.chapter) foe += '<p class="hint">Already on the field: ' + esc(held.map(function (u) { return E.CARDS[u[1]].name; }).join(' and ')) + '.</p>';
    if (i < run.chapter) return '<div class="story">' + head + '<p>' + esc(c.text) + '</p>' + foe + '<p class="cleared">Cleared</p></div>';
    return '<div class="story">' + head + '<p>' + esc(c.text) + '</p>' + foe + '</div>' +
      '<button type="button" class="btn primary big" ' + act('fight') + '>' + (run.battle ? 'Continue the battle' : 'Fight') + '</button>';
  }
  function mapScreen(run) {
    var story = Campaign.storyOf(run), picked = mapPick === null ? run.chapter : mapPick;
    var leave = confirmAbandon
      ? '<span class="dask">End this run for good?</span><button type="button" class="btn danger" ' + act('abandonRun') + '>End run</button><button type="button" class="btn" ' + act('keepRun') + '>Keep going</button>'
      : '<button type="button" class="btn" ' + act('askAbandon') + '>Abandon run</button>';
    // Abandoning sits in the header, where it can't fall below the fold.
    show('<div class="page">' + campaignHead(story.title, leave, run.prestige) + '<div class="camp">' + mapHtml(story, run.chapter, picked) +
      '<aside class="cside">' + chapterPanel(run, picked) +
      '<p class="hint">Your enemies are played by ' + opponentName(run.player) + '.</p></aside></div>' +
      runDeck(run) + '</div>', campaign);
    fitAll();
    march(run);
  }
  function reward(run) {
    var offer = run.offer, c = Campaign.chapterOf(run);
    var cards = offer.cards.map(function (id) {
      var spoil = E.CARDS[id].colour === offer.spoils;
      return '<div class="rpick"><span class="rfrom' + (spoil ? ' spoil' : '') + '">' + (spoil ? 'Won from ' + esc(c.enemy.name) : 'Joins your side') + '</span>' +
        '<button type="button" class="card" ' + act('takeCard', id) + ' aria-label="Keep ' + esc(E.CARDS[id].name) + '"><span class="rflip">' + GameUI.frameHtml(E.CARDS[id], { big: true }) + '<span class="rback"></span></span></button></div>';
    }).join('');
    var lands = offer.lands.map(function (id) { return '<button type="button" class="btn" ' + act('takeCard', id) + '>' + symbol(E.CARDS[id].colour) + ' ' + esc(E.CARDS[id].name) + '</button>'; }).join('');
    show('<div class="page">' + campaignHead('Choose a card to keep') +
      '<p class="hint rlead">You beat ' + esc(c.enemy.name) + '. The card you keep goes to your reserve, and you can swap it into your deck on the map.' +
        (Progress.cleared(run.story) ? '' : ' Win the campaign and it joins your collection.') + '</p>' +
      '<div class="rpicks">' + cards + '</div>' +
      '<div class="rother"><span class="hint">Or add a land:</span>' + lands + '<button type="button" class="btn" ' + act('takeCard') + '>Take nothing</button></div>' +
      deckGrid(run.list) + '</div>', campaign);
    fitAll();
    // The offered cards are dealt face down, then turn over one by one.
    if (!Polish.enabled()) return;
    Array.prototype.forEach.call(root.querySelectorAll('.rpick .rflip'), function (f, i) {
      f.animate([{ transform: 'translateY(-50px) rotateY(180deg)', opacity: 0 }, { transform: 'rotateY(180deg)', opacity: 1, offset: .3 }, { transform: 'rotateY(180deg)', offset: .5 }, { transform: 'rotateY(0deg) scale(1.04)', offset: .85 }, { transform: 'none' }],
        { duration: 1300, delay: 200 + i * 380, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' });
      Sfx.play('card-flip', { delay: .85 + i * .38, gap: 0 });
    });
  }
  function runEnd(run) {
    var story = Campaign.storyOf(run), won = run.status === 'won', c = Campaign.chapterOf(run);
    var cards = run.taken.filter(function (id) { return E.CARDS[id].type !== 'land'; }).map(function (id) { return E.CARDS[id].name; }), prize = run.prize;
    var taken = !won ? (cards.length ? 'The cards you picked on this run are lost with it.' : '')
      : prize && prize.t === 'clear' ? E.DECKS[story.starter].name + (cards.length ? ', ' + cards.join(', ') : '') + ' and ' + prize.gold + ' gold join your collection.'
      : prize && prize.prestige ? 'You beat it on prestige: it paid ' + prize.gold + ' gold, and the campaign now wears its prestige badge.'
      : prize ? 'You\'d beaten this campaign before, so it paid ' + prize.gold + ' gold instead of cards.' : '';
    show('<div class="page rend"><div class="story"><p class="eyebrow">' + esc(story.title) + (run.prestige ? ' · Prestige' : '') + '</p><h2>' + (won ? 'The road ends here' : 'The run is over') + '</h2>' +
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
  actions.campaign = function () { mapPick = null; confirmAbandon = false; swapIn = null; campaign(); };
  actions.setPlayer = function (key) { setupPlayer = key; setup(); };
  actions.setStory = function (id) { setupStory = id; setup(); };
  actions.setPrestige = function (on) { setupPrestige = !!on; setup(); };
  actions.beginRun = function () { Campaign.begin(setupStory, setupPlayer, undefined, setupPrestige && !!Progress.cleared(setupStory)); actions.campaign(); };
  actions.mapPick = function (i) { mapPick = +i; campaign(); };
  actions.fight = function () { GameUI.playChapter(); };
  // A card just won comes back already picked, ready to swap in.
  actions.takeCard = function (id) { Campaign.take(id === undefined ? null : id); actions.campaign(); if (id !== undefined && Campaign.current()) { swapIn = id; campaign(); } };
  actions.pickSpare = function (id) { swapIn = id === undefined || id === swapIn ? null : id; campaign(); };
  actions.swapOut = function (id) { if (swapIn) Campaign.swap(swapIn, id); swapIn = null; campaign(); };
  actions.askAbandon = function () { confirmAbandon = true; campaign(); };
  actions.keepRun = function () { confirmAbandon = false; campaign(); };
  actions.abandonRun = function () { Campaign.abandon(); actions.campaign(); };
  actions.newRun = function () { Campaign.dismiss(); actions.campaign(); };
  actions.leaveEnd = function () { Campaign.dismiss(); menu(); };

  // Deck list

  function builder() {
    GameUI.warmAllArt();
    var saved = Decks.saved();
    var mine = saved.map(function (d) {
      var tools = confirmDelete === d.id
        ? '<span class="dask">Delete this deck?</span><button type="button" class="btn danger" ' + act('deleteDeck', d.id) + '>Delete</button><button type="button" class="btn" ' + act('keepDeck') + '>Keep</button>'
        : '<button type="button" class="btn primary" ' + act('edit', d.id) + '>Edit</button><button type="button" class="btn" ' + act('copyDeck', d.id) + '>Copy</button><button type="button" class="btn" ' + act('askDelete', d.id) + '>Delete</button>';
      return deckCard(d, '', tools);
    }).join('');
    var fixed = function (d, hint) {
      return deckCard(d, hint, '<button type="button" class="btn" ' + act('viewDeck', d.id) + '>View</button><button type="button" class="btn" ' + act('copyDeck', d.id) + ' aria-label="Copy to edit">Copy</button>');
    };
    var owns = Progress.state().starters, story = function (k) { return Campaign.ORDER.map(function (id) { return Campaign.STORIES[id]; }).filter(function (x) { return x.starter === k; })[0]; };
    var starters = Decks.starters().map(function (d) {
      if (owns.indexOf(d.id) >= 0 || Progress.state().unlocked) return fixed(d);
      var s = story(d.id);
      return fixed(d, s ? 'Beat ' + s.title + ' to win this deck.' : 'Not yours yet.');
    }).join(''), themes = Decks.themes().map(function (d) { return fixed(d); }).join('');
    show('<div class="page"><header class="shead"><button type="button" class="btn" ' + act('menu') + '>Main menu</button><h1>Deck builder</h1><span class="push">' + Help.button() + '</span><button type="button" class="btn primary" ' + act('newDeck') + '>New deck</button></header>' +
      (Decks.persistent() ? '' : '<p class="warn">This browser is blocking storage, so decks last only until you close this tab.</p>') +
      '<section class="pickset"><h2>Your decks</h2>' + (mine ? '<div class="dtiles">' + mine + '</div>' : '<p class="hint">Nothing saved yet. Start a new deck, or copy a starter below and change it.</p>') + '</section>' +
      '<section class="pickset"><h2>Starter decks</h2><div class="dtiles">' + starters + '</div></section>' +
      '<section class="pickset"><h2>Theme decks</h2><p class="hint">One for each newer mechanic, built and tested against the starters.</p><div class="dtiles">' + themes + '</div></section></div>', builder);
    fitAll();
  }
  // A deck is a card: its painting and name on the front, and on the back its plan and what you can do with it. Selecting one turns it over.
  function deckFace(d, line) {
    var cols = E.deckColours(d.list), c = cols[0] || 'N', art = coverArt(d.list);
    return '<span class="frame ' + c + '"><span class="inner"><span class="bar-top">' + esc(d.name) + '</span>' +
      '<span class="art">' + (art ? '<img src="' + art + '" alt="" draggable="false">' : '') + '</span>' +
      '<span class="band"><span class="type">' + (cols.length ? cols.map(function (k) { return GameUI.ALIGNMENT[k]; }).join(' · ') : 'Empty') + '</span></span>' +
      '<span class="ctext"><span class="csyms">' + cols.map(symbol).join('') + '</span><span>' + esc(line || deckStatus(d)) + '</span></span></span></span>';
  }
  // A deck to choose for a match: just the front, lit while chosen.
  function deckPick(d, on) {
    return '<div class="dcard pick' + (on ? ' on' : '') + '" data-deck="' + esc(d.id) + '"><div class="dflip"><button type="button" class="dface dfront" ' + act('netDeck', d.id) + ' aria-pressed="' + on + '" title="' + esc(Help.deck(d)) + '">' + deckFace(d, plural(E.deckSize(d.list), 'card')) + '</button></div></div>';
  }
  function deckCard(d, hint, tools) {
    var open = flipped === d.id;
    var front = '<button type="button" class="dface dfront" ' + act('flipDeck', d.id) + ' aria-label="' + esc(d.name) + ', turn over"' + (open ? ' inert' : '') + '>' + deckFace(d) + '</button>';
    var back = '<div class="dface dback" ' + act('flipDeck', d.id) + (open ? '' : ' inert') + '><b class="dbname">' + esc(d.name) + '</b>' +
      '<p class="dnote">' + esc(Help.deck(d)) + '</p>' + (hint ? '<p class="dlock">' + esc(hint) + '</p>' : '') +
      '<div class="dtools">' + tools + '</div></div>';
    return '<div class="dcard' + (hint ? ' locked' : '') + (open ? ' flipped' : '') + '" data-deck="' + esc(d.id) + '"><div class="dflip">' + front + back + '</div></div>';
  }
  // Turn a deck over, or back. Only one deck shows its back at a time.
  function turnDeck(el, open) {
    el.classList.toggle('flipped', open);
    el.querySelector('.dfront').inert = open;
    el.querySelector('.dback').inert = !open;
  }
  actions.flipDeck = function (id) {
    var was = flipped && root.querySelector('.dcard.flipped');
    if (was) turnDeck(was, false);
    flipped = flipped === id ? null : id;
    var el = flipped && root.querySelector('.dcard[data-deck="' + flipped + '"]');
    if (el) { turnDeck(el, true); el.querySelector('.dback .btn').focus({ preventScroll: true }); }
    else if (was) was.querySelector('.dfront').focus({ preventScroll: true });
    Sfx.play('card-flip', { gap: 0 });
  };
  // A starter or theme deck, card by card. Copy it to change it.
  function viewDeck(d) {
    var c = E.deckColours(d.list)[0];
    show('<div class="page"><header class="shead"><button type="button" class="btn" ' + act('builder') + '>All decks</button><h1>' + esc(d.name) + '</h1>' +
      '<span class="push"></span><button type="button" class="btn primary" ' + act('copyDeck', d.id) + '>Copy to edit</button></header>' +
      '<p class="lead dview">' + esc(Help.deck(d)) + (c ? ' <span class="hint">' + symbol(c) + '<b>' + GameUI.ALIGNMENT[c] + '.</b> ' + esc(Help.alignment(c)) + '</span>' : '') + '</p>' +
      deckGrid(d.list, 'Cards') + '</div>', function () { viewDeck(d); });
    fitAll();
  }
  actions.viewDeck = function (id) { viewDeck(Decks.find(id)); };
  actions.builder = function () { confirmDelete = null; flipped = null; builder(); };
  actions.newDeck = function () { editor(Decks.create('New deck')); };
  actions.edit = function (id) { editor(Decks.find(id)); };
  actions.copyDeck = function (id) {
    var d = Decks.find(id), copy = Decks.create(d.name + ' copy', d.list.map(function (e) { return e.slice(); }));
    Decks.save(copy);
    editor(copy);
  };
  actions.askDelete = function (id) { confirmDelete = id; builder(); };
  actions.keepDeck = function () { confirmDelete = null; builder(); };
  actions.deleteDeck = function (id) { Decks.remove(id); confirmDelete = null; flipped = null; builder(); };

  // Deck editor

  function countOf(id) {
    var e = ed.deck.list.filter(function (x) { return x[0] === id; })[0];
    return e ? e[1] : 0;
  }
  function cardOrder(a, b) {
    var ca = E.CARDS[a], cb = E.CARDS[b];
    return COLOURS.indexOf(ca.colour) - COLOURS.indexOf(cb.colour) || (ca.type === 'land') - (cb.type === 'land') || ca.cost - cb.cost || ca.name.localeCompare(cb.name);
  }
  // A spell that deals damage counts its damage as attack when sorting: the first amount its text says it deals.
  // Protection ("ignores the next 6 damage") and a death blast ("explodes for 2 damage") don't count.
  function spellDamage(c) {
    var m = /(?:^|[:.,] |takes |deals |dealing )(\d+) damage/.exec(c.text || '');
    return m ? +m[1] : null;
  }
  var SORTS = [['colour', 'Colour'], ['cost', 'Cost'], ['atk', 'Attack'], ['hp', 'Health'], ['name', 'Name']];
  function sortValue(c) {
    if (sort.by === 'cost') return c.cost;
    if (sort.by === 'atk') return c.type === 'unit' ? c.atk : spellDamage(c);
    if (sort.by === 'hp') return c.type === 'unit' ? c.hp : null;
    return null;
  }
  // Lands always come last, then cards the sort says nothing about (a spell's health); ties fall back to cost, then name.
  function poolOrder(a, b) {
    if (sort.by === 'colour') return cardOrder(a, b);
    var ca = E.CARDS[a], cb = E.CARDS[b], land = (ca.type === 'land') - (cb.type === 'land');
    if (land) return land;
    if (sort.by === 'name') return (sort.down ? -1 : 1) * ca.name.localeCompare(cb.name);
    var va = sortValue(ca), vb = sortValue(cb);
    if ((va === null) !== (vb === null)) return va === null ? 1 : -1;
    return (va === null ? 0 : (sort.down ? vb - va : va - vb)) || ca.cost - cb.cost || ca.name.localeCompare(cb.name);
  }
  function drawSort() {
    var el = byId('fsort');
    if (!el) return;
    el.innerHTML = '<span class="flabel nofold">Sort</span>' + SORTS.map(function (o) {
      return '<button type="button" class="chip" aria-pressed="' + (sort.by === o[0]) + '" ' + act('sortBy', o[0]) + '>' + o[1] + '</button>';
    }).join('') + (sort.by === 'colour' ? '' : '<button type="button" class="chip fdir" ' + act('sortDir', 'flip') + ' aria-label="Order: ' + dirWord() + '. Select to flip it.">' + dirWord() + (sort.down ? ' ↓' : ' ↑') + '</button>');
  }
  function dirWord() { return sort.by === 'name' ? (sort.down ? 'Z to A' : 'A to Z') : sort.down ? 'High to low' : 'Low to high'; }
  function setSort(next) {
    sort = next;
    try { localStorage.setItem(SORT_KEY, JSON.stringify(sort)); } catch (e) {}
    keepFocus(drawSort);
    drawGrid(true);
  }
  // Cost and name start low to high; attack and health start with the biggest.
  actions.sortBy = function (by) { if (by !== sort.by) setSort({ by: by, down: by === 'atk' || by === 'hp' }); };
  actions.sortDir = function () { setSort({ by: sort.by, down: !sort.down }); };
  function matches(c) {
    var q = filters.q.trim().toLowerCase();
    if (any(filters.type) && !filters.type[c.type]) return false;
    if (any(filters.colour) && !filters.colour[c.colour]) return false;
    if (any(filters.faction) && !filters.faction[c.faction || 'none']) return false;
    if (filters.own === 'owned' && !ed.pool.copies(c.id)) return false;
    return !q || c.name.toLowerCase().indexOf(q) >= 0 || (c.text || '').toLowerCase().indexOf(q) >= 0;
  }

  function editor(deck) {
    ed = { deck: deck, pool: Decks.pool(deck.mode), peek: null, saved: deck.updated > 0, msg: '' };
    if (deck.missing) ed.msg = plural(deck.missing, 'card') + ' in this deck no longer exist' + (deck.missing === 1 ? 's' : '') + ' and were taken out.';
    show('<div class="editor"><header class="shead"><button type="button" class="btn" ' + act('builder') + '>All decks</button><h1>Deck builder</h1><span class="hint">' + (Progress.state().unlocked ? 'Everything is unlocked, in any mix of colours.' : 'Build from the cards you own, in any mix of colours. Greyed cards are ones you don\'t have yet.') + '</span>' + DeckHelp.button() + Help.button() + '</header>' +
      '<div class="ebody">' +
      '<aside class="closeup" id="closeup" ' + act('closeZoom') + ' aria-label="Card close-up"></aside>' +
      '<section class="cards" aria-label="Cards">' +
        '<div class="filters" id="filters"><div class="fhead"><button type="button" class="ftoggle" id="ftoggle" aria-controls="fchips" ' + act('foldFilter', 'panel') + '>Filters</button>' +
          '<span class="fpicked" id="filterSum"></span>' +
          '<label class="fsearch"><span class="sr">Search</span><input type="search" id="fq" autocomplete="off" placeholder="Search name or rules text" value="' + esc(filters.q) + '"></label>' +
          '<span class="fsort" id="fsort" role="group" aria-label="Sort cards"></span><span class="fcount" id="fcount"></span></div><div class="fbody" id="fchips"></div></div>' +
        '<div class="cgrid" id="cgrid"></div></section>' +
      '<aside class="dpanel" id="dpanel" aria-label="Your deck">' +
        '<div class="dtop"><label class="sr" for="dname">Deck name</label><input type="text" id="dname" maxlength="40" value="' + esc(deck.name) + '"><button type="button" class="btn dclose" ' + act('closeDeck') + '>Back to cards</button></div>' +
        '<div id="dsum"></div><div class="dlist" id="dlist"></div><div class="dfoot" id="dfoot"></div></aside>' +
      '<button type="button" class="btn primary dopen" id="dopen" ' + act('openDeck') + '></button>' +
      '</div>' + DeckHelp.panelHtml() + '</div>', function () { drawGrid(true); });
    drawFilters();
    drawSort();
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
    var own = chip('own', 'all', 'Every card', filters.own !== 'owned') + chip('own', 'owned', 'Cards I own', filters.own === 'owned');
    var picked = pickedNames();
    byId('fchips').innerHTML = filterRow('own', 'Show', own, picked.own) + filterRow('colour', 'Colour', colours, picked.colour) +
      filterRow('type', 'Type', types, picked.type) + filterRow('faction', 'Faction', factions, picked.faction) + filterNote();
    var shut = !!folds.panel;
    byId('filters').classList.toggle('shut', shut);
    byId('fchips').hidden = shut;
    byId('ftoggle').setAttribute('aria-expanded', !shut);
    drawPicked();
  }
  // A folded row keeps its label and says what is picked in it.
  function filterRow(group, label, chips, picked) {
    var shut = !!folds[group];
    return '<div class="frow' + (shut ? ' shut' : '') + '"><button type="button" class="flabel" aria-expanded="' + !shut + '" ' + act('foldFilter', group) + '>' + label + '</button>' +
      (shut ? '<span class="fpick">' + esc(picked.join(', ') || 'Any') + '</span>' : '<div class="chips">' + chips + '</div>') + '</div>';
  }
  function pickedNames() {
    var on = function (g) { return Object.keys(filters[g]).filter(function (k) { return filters[g][k]; }); };
    return {
      own: [filters.own === 'owned' ? 'Cards I own' : 'Every card'],
      colour: on('colour').map(function (c) { return GameUI.ALIGNMENT[c]; }),
      type: on('type').map(function (t) { return GameUI.TYPES[t]; }),
      faction: on('faction').map(function (k) {
        var f = E.FACTIONS.filter(function (x) { return x.id === k; })[0];
        return f ? f.name.replace(/^The /, '') : 'No faction';
      })
    };
  }
  // With the panel folded, its bar lists what is filtered.
  function drawPicked() {
    var p = pickedNames(), list = (filters.own === 'owned' ? p.own : []).concat(p.colour, p.type, p.faction);
    byId('filterSum').textContent = folds.panel ? list.join(' · ') : '';
  }
  // With one colour or one faction picked, a line under the filters says what it's good at, or a word from inside it.
  function filterNote() {
    var on = function (g) { return Object.keys(filters[g]).filter(function (k) { return filters[g][k]; }); };
    var cs = on('colour'), fs = on('faction').filter(function (k) { return k !== 'none'; });
    if (fs.length === 1) return '<p class="fnote">' + Help.factionHtml(fs[0]) + '</p>';
    if (cs.length === 1 && cs[0] !== 'N') return '<p class="fnote"><b>' + GameUI.ALIGNMENT[cs[0]] + '.</b> ' + esc(Help.alignment(cs[0])) + '</p>';
    return '';
  }
  function activeFilters() {
    return ['type', 'colour', 'faction'].reduce(function (n, g) {
      return n + Object.keys(filters[g]).filter(function (k) { return filters[g][k]; }).length;
    }, 0) + (filters.q.trim() ? 1 : 0) + (filters.own === 'owned' ? 1 : 0);
  }

  function pickHtml(id) {
    var c = E.CARDS[id];
    return '<div class="pcard" data-card-id="' + id + '">' +
      '<button type="button" class="card" ' + act('add', id) + ' data-peek="' + id + '" aria-label="Add ' + esc(c.name) + ' to deck">' + GameUI.frameHtml(c) + '</button>' +
      '<span class="have" hidden></span><span class="qty" aria-hidden="true"></span><span class="nown" hidden>Not owned</span>' +
      '<button type="button" class="minus" ' + act('remove', id) + ' aria-label="Take ' + esc(c.name) + ' out of deck" hidden>&minus;</button></div>';
  }
  // Every card is drawn once; a filter only hides and shows them, so turning one off doesn't redraw and refit the whole pool.
  // A hidden card is fitted when it first shows. A fresh grid draws the first screenful of matching cards at once and adds
  // the rest a batch at a time, so the editor opens straight away instead of waiting for the whole pool to be laid out.
  var gridRun = 0;
  function drawGrid(rebuild) {
    var grid = byId('cgrid'), n = activeFilters();
    var shown = ed.pool.ids.filter(function (id) { return matches(E.CARDS[id]); }).length;
    if (rebuild || !grid.querySelector('.pcard, .none')) {
      var run = ++gridRun, left = ed.pool.ids.slice().sort(poolOrder);
      grid.innerHTML = '<p class="hint none">No cards match these filters.</p>';
      var more = function () {
        if (run !== gridRun || !grid.isConnected) return;
        var box = document.createElement('div'), took = 0, html = '';
        while (left.length && took < 24) { var id = left.shift(); html += pickHtml(id); took += matches(E.CARDS[id]); }
        box.innerHTML = html;
        var els = Array.prototype.slice.call(box.children), none = grid.querySelector('.none');
        els.forEach(function (el) { el.hidden = !matches(E.CARDS[el.dataset.cardId]); grid.insertBefore(el, none); });
        drawBadges(els);
        GameUI.fitCards(els);
        if (left.length) setTimeout(more, 0);
      };
      more();
    } else Array.prototype.forEach.call(grid.querySelectorAll('.pcard'), function (el) { el.hidden = !matches(E.CARDS[el.dataset.cardId]); });
    grid.querySelector('.none').hidden = !!shown;
    byId('fcount').innerHTML = shown + ' of ' + ed.pool.ids.length + ' cards' + (n ? ' <button type="button" class="linkbtn" ' + act('clearFilters') + '>Clear</button>' : '');
    drawBadges();
  }
  function drawBadges(els) {
    Array.prototype.forEach.call(els || byId('cgrid').querySelectorAll('.pcard'), function (el) {
      var id = el.dataset.cardId, have = countOf(id), limit = ed.pool.copies(id), badge = el.querySelector('.have'), cap = Math.min(limit, E.maxCopies(id));
      // Up to four copies show as pips under the card; lands and other open-ended cards keep a count.
      var pips = cap <= 4 && cap > 0;
      badge.hidden = !have || pips;
      badge.textContent = limit === Infinity ? have : have + ' / ' + limit;
      el.querySelector('.qty').innerHTML = pips ? Array.apply(null, Array(cap)).map(function (x, j) { return '<i' + (j < have ? ' class="on"' : '') + '></i>'; }).join('') : '';
      el.querySelector('.minus').hidden = !have;
      el.querySelector('.nown').hidden = !!limit || !!have;
      el.classList.toggle('maxed', have >= limit);
      el.classList.toggle('unowned', !limit);
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
  // The bars grow from their last heights to the new ones.
  function curveHtml(curve) {
    var top = Math.max.apply(null, curve.concat(4)), was = ed.curveH || [];
    ed.curveH = curve.map(function (n) { return Math.round(n / top * 100); });
    return '<div class="curve" role="img" aria-label="Cards by cost: ' + curve.map(function (n, i) { return (i === 7 ? '7 or more' : i) + ': ' + n; }).join(', ') + '">' + curve.map(function (n, i) {
      return '<span class="cbar"><em>' + (n || '') + '</em><i style="height:' + (was[i] === undefined ? ed.curveH[i] : was[i]) + '%" data-h="' + ed.curveH[i] + '"></i><small>' + (i === 7 ? '7+' : i) + '</small></span>';
    }).join('') + '</div>';
  }
  function growCurve() {
    requestAnimationFrame(function () { Array.prototype.forEach.call(root.querySelectorAll('.curve i[data-h]'), function (b) { b.style.height = b.dataset.h + '%'; }); });
  }
  function rowHtml(e) {
    var c = E.CARDS[e[0]], own = ed.pool.copies(c.id), full = e[1] >= own || E.deckSize(ed.deck.list) >= E.DECK_MAX;
    var art = GameUI.artUrl(c.id);
    return '<div class="drow ' + c.colour + (e[1] > own ? ' short" title="You own ' + (own || 'none') : '') + '" data-row="' + c.id + '">' + (art ? '<img class="rart" src="' + art + '" alt="" draggable="false">' : '') +
      '<span class="rcost' + (c.type === 'land' ? ' land' : '') + '">' + (c.type === 'land' ? '' : c.cost) + '</span>' +
      '<button type="button" class="rname" data-peek="' + c.id + '" ' + act('zoom', c.id) + '>' + esc(c.name) + '</button>' +
      '<span class="rn">×' + e[1] + '</span>' + (e[1] > own ? '<span class="rmiss">' + (e[1] - own) + ' missing</span>' : '') +
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
    var list = ed.deck.list, size = E.deckSize(list), st = statsOf(list), short = Progress.missing(list), problems = E.deckProblems(list).concat(short ? ["You're missing " + plural(short, 'card') + ' you don\'t own'] : []), advice = deckAdvice(st, size);
    var saveNote = !Decks.persistent() ? 'This browser is blocking storage, so this deck lasts only until you close this tab.' : ed.saveFailed ? "Couldn't save the last change." : ed.saved ? 'Saved' : '';
    byId('dsum').innerHTML =
      '<div class="dcount"><b>' + size + '</b><span> of ' + (E.DECK_MIN === E.DECK_MAX ? E.DECK_MAX : E.DECK_MIN + '–' + E.DECK_MAX) + ' cards</span><span class="dready' + (problems.length ? '' : ' ok') + '">' + (problems.length ? esc(problems[0]) : 'Ready to play') + '</span></div>' +
      '<div class="dprog"><i style="width:' + Math.min(100, Math.round(size / E.DECK_MIN * 100)) + '%"></i></div>' +
      '<p class="dline">Lands ' + st.lands + (size ? ' (' + Math.round(st.lands / size * 100) + '%)' : '') + TYPES.slice(0, 5).map(function (t) { return st.types[t] ? ' · ' + GameUI.TYPES[t] + 's ' + st.types[t] : ''; }).join('') + '</p>' +
      curveHtml(st.curve) +
      missingHtml(list) +
      advice.map(function (a) { return '<p class="advice">' + a + '</p>'; }).join('') +
      '<p class="dmsg" id="dmsg" role="status">' + esc(ed.msg) + '</p>';
    growCurve();
    keepFocus(function () { byId('dlist').innerHTML = listHtml(list); });
    byId('dfoot').innerHTML = '<span class="dsaved' + (ed.saveFailed || !Decks.persistent() ? ' bad' : '') + '">' + saveNote + '</span>' +
      '<button type="button" class="btn primary" ' + (problems.length ? 'disabled ' : '') + act('playDeck') + '>Play this deck</button>';
    byId('dopen').textContent = 'View deck: ' + size + ' cards';
  }
  // The copies in the deck beyond what the player owns, by name, with one press to take them all out. A copied starter or
  // theme deck can then be filled back up with cards the player has.
  function unowned(list) {
    return list.map(function (e) { return [e[0], e[1] - Math.min(e[1], ed.pool.copies(e[0]))]; }).filter(function (e) { return e[1] > 0; });
  }
  function missingHtml(list) {
    var gone = unowned(list);
    if (!gone.length) return '';
    var n = gone.reduce(function (a, e) { return a + e[1]; }, 0);
    return '<div class="dmissing"><p><b>You don\'t own ' + n + ' of these cards' + '.</b> ' +
      gone.map(function (e) { return esc(E.CARDS[e[0]].name) + (e[1] > 1 ? ' ×' + e[1] : ''); }).join(', ') + '</p>' +
      '<button type="button" class="btn" ' + act('trimUnowned') + '>Take out the cards I don\'t own</button></div>';
  }
  actions.trimUnowned = function () {
    var gone = unowned(ed.deck.list), n = gone.reduce(function (a, e) { return a + e[1]; }, 0);
    if (!n) return;
    gone.forEach(function (g) {
      var e = ed.deck.list.filter(function (x) { return x[0] === g[0]; })[0];
      e[1] -= g[1];
      if (!e[1]) ed.deck.list.splice(ed.deck.list.indexOf(e), 1);
    });
    Sfx.play('card-draw', { gap: 0 });
    ed.msg = 'Took out ' + plural(n, 'card') + '. Add ' + (n === 1 ? 'one' : n) + ' of your own to fill the deck.';
    store();
    drawDeck();
    drawBadges();
  };
  function store() {
    ed.saveFailed = !Decks.save(ed.deck);
    ed.saved = !ed.saveFailed;
  }
  function peek(id) {
    if (!id || ed.peek === id) return;
    ed.peek = id;
    var c = E.CARDS[id], f = E.FACTIONS.filter(function (x) { return x.id === c.faction; })[0];
    var art = GameUI.artUrl(id) ? ' ' + act('viewArt', id) : '';
    byId('closeup').innerHTML = '<div class="slot' + (art ? ' viewable' : '') + '"' + art + ' title="' + (art ? 'View the full painting' : '') + '">' + GameUI.frameHtml(c, { big: true }) + '</div>' +
      (art ? '<button type="button" class="btn artbtn"' + art + '>View full art</button>' : '') +
      '<p class="hint">' + (f ? Help.factionHtml(f.id) : 'No faction') + '</p>';
  }

  // The full painting, large, over everything. It shows the game's copy at once, then the full-size original if this copy of the game has it.
  actions.viewArt = function (id) {
    var c = E.CARDS[id], src = GameUI.artUrl(id);
    if (!src) return;
    var v = byId('artView');
    if (!v) { v = document.createElement('div'); v.id = 'artView'; v.className = 'artview'; root.appendChild(v); }
    v.setAttribute('data-act', 'closeArt');
    v.innerHTML = '<figure><img src="' + src + '" alt="' + esc(c.name) + ' artwork"><figcaption><b>' + esc(c.name) + '</b><span>' +
      (c.equipment ? 'Equipment' : GameUI.TYPES[c.type]) + (c.sub ? ', ' + esc(c.sub) : '') + ' · ' + GameUI.ALIGNMENT[c.colour] + '</span></figcaption></figure>' +
      '<button type="button" class="btn" ' + act('closeArt') + '>Close</button>';
    v.hidden = false;
    // Finished card art sits in art/, earlier concept paintings in art/concepts/.
    var img = v.querySelector('img'), name = src.replace('art/web/', '').replace(/\.jpg$/, '.png');
    (function tryFull(dirs) {
      if (!dirs.length) return;
      var full = new Image();
      full.onload = function () { if (img.isConnected) img.src = full.src; };
      full.onerror = function () { tryFull(dirs.slice(1)); };
      full.src = dirs[0] + name;
    })(['art/', 'art/concepts/']);
  };
  actions.closeArt = function () { var v = byId('artView'); if (v) v.hidden = true; };

  actions.filter = function (arg) {
    var at = arg.indexOf(':'), group = arg.slice(0, at), key = arg.slice(at + 1);
    if (group === 'own') filters.own = key; else filters[group][key] = !filters[group][key];
    // A faction hidden by the colour filter can't stay on, or it would quietly empty the grid.
    if (group === 'colour') E.FACTIONS.forEach(function (f) { if (!factionShown(f)) filters.faction[f.id] = false; });
    keepFocus(drawFilters);
    drawGrid();
  };
  actions.foldFilter = function (group) {
    folds[group] = !folds[group];
    try { localStorage.setItem(FOLD_KEY, JSON.stringify(folds)); } catch (e) {}
    keepFocus(drawFilters);
  };
  actions.clearFilters = function () {
    filters = { type: {}, colour: {}, faction: {}, q: '', own: 'all' };
    byId('fq').value = '';
    drawFilters();
    drawGrid();
  };
  actions.add = function (id) {
    var c = E.CARDS[id], have = countOf(id), limit = ed.pool.copies(id);
    ed.msg = '';
    if (E.deckSize(ed.deck.list) >= E.DECK_MAX) ed.msg = 'A deck can hold ' + E.DECK_MAX + ' cards at most.';
    else if (have >= limit) ed.msg = limit < ed.pool.limit(id) ? (limit ? 'You own ' + limit + ' of ' + c.name + '.' : "You don't own " + c.name + ' yet. Win it in packs, or craft it in your collection.') : 'A deck can hold ' + limit + ' copies of ' + c.name + '.';
    else {
      var e = ed.deck.list.filter(function (x) { return x[0] === id; })[0];
      if (e) e[1] += 1; else ed.deck.list.push([id, 1]);
      store();
      var from = lastAct && lastAct.closest && lastAct.closest('#cgrid .card');
      Sfx.play('card-play', { gap: 0 });
    }
    drawDeck();
    drawBadges();
    if (from) flyToList(from, id);
    else if (!ed.msg) glowRow(id);
  };
  // An added card flies from the grid into its row in the deck list, which lights up as it lands.
  function glowRow(id) {
    var row = byId('dlist') && byId('dlist').querySelector('[data-row="' + id + '"]');
    if (!row || !Polish.enabled()) return;
    row.scrollIntoView({ block: 'nearest' });
    row.animate([{ boxShadow: '0 0 0 2px #f0d68c, 0 0 16px #f0d68c', transform: 'scale(1.04)' }, { boxShadow: '0 0 0 0 transparent', transform: 'none' }], { duration: 650 });
  }
  function flyToList(from, id) {
    var row = byId('dlist').querySelector('[data-row="' + id + '"]'), list = byId('dpanel');
    if (!Polish.enabled() || !row || !list.offsetWidth) return glowRow(id);
    row.scrollIntoView({ block: 'nearest' });
    var a = from.getBoundingClientRect(), b = row.getBoundingClientRect(), ghost = from.querySelector('.frame').cloneNode(true);
    ghost.style.cssText = 'position:fixed;z-index:90;left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;pointer-events:none;container-type:inline-size';
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;left:0;top:0;width:' + a.width + 'px;container-type:inline-size;z-index:90;pointer-events:none';
    ghost.style.position = 'static';
    wrap.appendChild(ghost);
    document.body.appendChild(wrap);
    var dx = b.left + b.width * .3 - a.left, dy = b.top + b.height / 2 - a.top - a.height * .2;
    wrap.animate([{ transform: 'translate(' + a.left + 'px,' + a.top + 'px)', opacity: 1 }, { transform: 'translate(' + (a.left + dx * .5) + 'px,' + (a.top + dy * .5 - 30) + 'px) scale(.85) rotate(-4deg)', opacity: 1, offset: .5 }, { transform: 'translate(' + (a.left + dx) + 'px,' + (a.top + dy) + 'px) scale(.22)', opacity: 0 }],
      { duration: 520, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    setTimeout(function () { wrap.remove(); glowRow(id); }, 520);
  }
  actions.remove = function (id) {
    var e = ed.deck.list.filter(function (x) { return x[0] === id; })[0];
    if (!e || ed.leaving === id) return;
    Sfx.play('card-draw', { gap: 0 });
    // The last copy slides its row out of the list before it goes.
    var row = e[1] === 1 && byId('dlist') && byId('dlist').querySelector('[data-row="' + id + '"]');
    if (row && Polish.enabled()) {
      ed.leaving = id;
      row.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(40%)', opacity: 0 }], { duration: 240, easing: 'ease-in', fill: 'forwards' });
      setTimeout(function () { ed.leaving = null; takeOut(id); }, 240);
      return;
    }
    takeOut(id);
  };
  function takeOut(id) {
    var e = ed.deck.list.filter(function (x) { return x[0] === id; })[0];
    if (!e) return;
    e[1] -= 1;
    if (!e[1]) ed.deck.list.splice(ed.deck.list.indexOf(e), 1);
    ed.msg = '';
    store();
    drawDeck();
    drawBadges();
  }
  actions.zoom = function (id) { peek(id); byId('closeup').classList.add('open'); };
  actions.closeZoom = function () { byId('closeup').classList.remove('open'); };
  actions.openDeck = function () { byId('dpanel').classList.add('open'); };
  actions.closeDeck = function () { byId('dpanel').classList.remove('open'); };
  actions.playDeck = function () { GameUI.showStart(ed.deck.id); };

  // Moving between screens dims the lamp; going into a battle shuffles instead of turning a page.
  var NAV = { menu: 1, campaign: 1, exhibition: 1, online: 1, account: 1, builder: 1, testTable: 2, tutorial: 2, resume: 2, edit: 1, newDeck: 1, copyDeck: 1, viewDeck: 1, fight: 2, beginRun: 1, newRun: 1, leaveEnd: 1, playDeck: 1, takeCard: 1 };
  var lastAct = null;
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b && flipped && !e.target.closest('.dcard')) return actions.flipDeck(flipped);
    if (!b || b.disabled) return;
    var name = b.dataset.act, arg = b.dataset.arg;
    lastAct = b;
    if (NAV[name] || (name === 'collection' && arg === undefined)) return Polish.lamp(function () { actions[name](arg); }, NAV[name] === 2);
    actions[name](arg);
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
    if (e.key !== 'Escape') return;
    var v = byId('artView');
    if (v && !v.hidden) actions.closeArt();
    else if (byId('closeup')) actions.closeZoom();
    else if (flipped && root.querySelector('.dcard.flipped')) actions.flipDeck(flipped);
  });

  function redraw() { if (refresh && !root.hidden) refresh(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

  function hide() { root.hidden = true; refresh = null; }

  Progress.onChange(redraw);
  return {
    menu: menu, builder: builder, campaign: actions.campaign, hide: hide, redraw: redraw, coverArt: coverArt, deckFace: deckFace, online: online,
    // For deckhelp.js: the deck being edited and its card pool, or null away from the deck builder.
    editing: function () { return ed && byId('qm') ? ed : null; },
    // For collection.js, whose screens share this page and its click handling.
    kit: { show: show, act: act, esc: esc, symbol: symbol, plural: plural, actions: actions, root: root }
  };
})();
