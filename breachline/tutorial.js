// The tutorial: a tour of the battle table, then a short set battle that walks through a land, a summon, an attack, a move and
// a strike at the summoner. ui.js runs the battle; this file builds its state, says which moves each step allows, plays the
// enemy's turn and draws the coach over the table. Each step's done() reads the state, so the coach follows whatever has happened.
var Tutorial = (function () {
  var E = Engine, ME = 0, FOE = 1, KEY = 'breachline-tutorial';
  var hooks = null, at = -1, ids = null, coach = null, ring = null, shades = [], looping = false, lastBox = '', lastSel = null;

  function seen() { try { return localStorage.getItem(KEY) === 'done'; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(KEY, 'done'); } catch (e) {} }

  // Turn 3, your third turn. You hold a land, a Temple cleric and a Pride warden you can't afford yet; a Sellsword faces the
  // enemy's across the middle and a Sunmane lancer waits on the right. The enemy is down to 4 life.
  function build() {
    at = -1;
    var s = E.newGame({ seed: 7, decks: [{ name: 'Oath of the Sunmane', list: [['land_w', 30]] }, { name: 'Warhorde scouts', list: [['land_r', 30]] }], first: ME });
    var card = function (id) { return { id: s.nextId++, c: id }; };
    var land = function (id) { var i = card(id); return { colour: E.CARDS[id].colour, id: i.id, c: id }; };
    var unit = function (pi, id, r, c) { var u = E.placeUnit(s, pi, id, r, c); delete u.conjured; u.inst = s.nextId++; return u; };
    s.tutorial = true;
    s.phase = 'play'; s.turn = 3; s.active = ME; s.log = [];
    s.players.forEach(function (p) { p.kept = true; p.hand = []; p.deck = []; });
    var you = s.players[ME], foe = s.players[FOE];
    you.life = 13; you.lands = [land('land_w'), land('land_w')]; you.mana = 2;
    you.hand = [card('land_w'), card('cleric'), card('warden')];
    for (var i = 0; i < 6; i++) you.deck.push(card('land_w'));
    foe.life = 4; foe.lands = [land('land_r'), land('land_r')];
    foe.hand = [card('goblin')];
    for (i = 0; i < 6; i++) foe.deck.push(card('land_r'));
    ids = {
      land: you.hand[0].id, cleric: you.hand[1].id,
      sword: unit(ME, 'sellsword', 2, 1).uid, lancer: unit(ME, 'lancer', 3, 4).uid, foeSword: unit(FOE, 'sellsword', 1, 1).uid
    };
    s.log.push({ turn: 3, text: 'Tutorial: your third turn begins.' });
    return s;
  }

  // The enemy's one turn: play the land it draws, summon its Goblin cutter, then stop.
  function enemyMove(s) {
    var ms = E.legalMoves(s), find = function (f) { return ms.filter(f)[0]; };
    return find(function (m) { return m.type === 'pass'; }) || find(function (m) { return m.type === 'playLand'; }) ||
      find(function (m) { return m.type === 'summon' && m.r === 0 && m.c === 2; }) || find(function (m) { return m.type === 'toCommand'; }) ||
      find(function (m) { return m.type === 'endTurn'; }) || ms[0];
  }

  function unitOf(s, uid) { return s.units.filter(function (u) { return u.uid === uid; })[0]; }
  function tile(u) { return u ? '#grid .tile[data-r="' + u.r + '"][data-c="' + u.c + '"]' : null; }
  function picked(sel, kind, id) { return sel && sel.kind === kind && sel.id === id; }
  function inHand(id) { return '#hand .card[data-card="' + id + '"]'; }
  var COMMAND = '#actions [data-do*="toCommand"]', PRESS = '#actions .press:not(.foe)';

  // Part 1 is a tour with Back and Next. Part 2 steps with allow() wait for that move; the rest wait for Next.
  var STEPS = [
    { part: 1, title: 'Welcome to the war table',
      text: 'This tutorial comes in two parts. First, a quick look around the table. Then you finish a short battle that\'s already under way, one move at a time.' },
    { part: 1, title: 'The enemy summoner', target: function () { return '#themStrip .plate'; },
      text: 'Across the table sits your opponent, an unseen summoner. The wax seal is their life: bring it to 0 and you win. Beside it are their lands, their hand and their deck.' },
    { part: 1, title: 'The war map', target: function () { return '#grid'; },
      text: 'Units fight on this grid of 6 columns and 5 rows. Your back row is the bottom row, where your new units arrive. The enemy\'s back row is the top row.' },
    { part: 1, title: 'Units', target: function (s) { return tile(unitOf(s, ids.sword)); },
      text: 'Each painted tile is a unit. Gold edges are yours and crimson edges are the enemy\'s. Attack is on the left plaque, health on the right, and the bar shows the damage taken.' },
    { part: 1, title: 'You', target: function () { return '#youStrip'; },
      text: 'Your own plate: your life, your mana and the lands that make it, and your deck and discard pile. Each land gives 1 mana every turn.' },
    { part: 1, title: 'Your hand', target: function () { return '#hand'; },
      text: 'Bright cards can be played now and dimmed ones can\'t. The coin on a card is its cost in mana. Point at a card to see it close up, or use View card on a phone.' },
    { part: 1, title: 'The turn', target: function () { return '#phases'; },
      text: 'Every turn has two steps. In Play you play cards from your hand. In Command you move your units and attack.' },
    { part: 1, title: 'What to do next', target: function () { return '#actions .prompt'; },
      text: 'This line always says what you can do next, and the line under it shows the last thing that happened.' },
    { part: 1, title: 'End turn', target: function () { return PRESS; },
      text: 'The bronze press ends your turn. It glows when you have nothing left to do.' },
    { part: 1, title: 'Tools', target: function () { return '.tools'; },
      text: 'Chronicle is the battle log and Rules is a short list of the rules. Menu lets you restart or leave, and the speaker turns the sound off and on.' },
    { part: 2, title: 'Play a land',
      target: function (s, sel) { return picked(sel, 'card', ids.land) ? '#actions [data-do*="playLand"]' : inHand(ids.land); },
      allow: function (m) { return m.type === 'playLand' && m.card === ids.land; },
      done: function (s) { return s.players[ME].lands.length > 2; },
      text: 'You can play one land each turn. Click the Sunlit plains in your hand, then Play land.' },
    { part: 2, title: 'Summon a unit',
      target: function (s, sel) { return picked(sel, 'card', ids.cleric) ? '#grid .tile.t-summon' : inHand(ids.cleric); },
      allow: function (m) { return m.type === 'summon' && m.card === ids.cleric; },
      done: function (s) { return s.units.some(function (u) { return u.owner === ME && u.cardId === 'cleric'; }); },
      text: 'You have 3 mana now. A card also wants lands of its own colour, and each one you\'re missing adds 1 to its cost. Click the Temple cleric, then a tile in your back row.' },
    { part: 2, title: 'New units wait',
      target: function (s) { return tile(s.units.filter(function (u) { return u.owner === ME && u.cardId === 'cleric'; })[0]); },
      text: 'The cleric is greyed out and marked Waiting: a unit can\'t act on the turn it arrives. Next turn it can use its ability, Heal, on an ally beside it.' },
    { part: 2, title: 'Command your units', target: function () { return COMMAND; },
      allow: function (m) { return m.type === 'toCommand'; },
      done: function (s) { return s.phase === 'command'; },
      text: 'That\'s your cards played. Press Command units to move on to your units. After this, the only cards you can play are instants.' },
    { part: 2, title: 'Attack',
      target: function (s, sel) { return picked(sel, 'unit', ids.sword) ? tile(unitOf(s, ids.foeSword)) : tile(unitOf(s, ids.sword)); },
      allow: function (m) { return m.type === 'attack' && m.unit === ids.sword && m.target === ids.foeSword; },
      done: function (s) { var f = unitOf(s, ids.foeSword); return !f || f.hp < f.maxHp; },
      text: 'A unit can move 1 tile, then attack or use an ability. Click your Sellsword, then the enemy Sellsword in front of it.' },
    { part: 2, title: 'Damage stays',
      target: function (s) { return [tile(unitOf(s, ids.sword)), tile(unitOf(s, ids.foeSword))].filter(Boolean).join(', '); },
      text: 'Your Sellsword dealt 3 damage. The enemy\'s survived on 1 health, so it struck back for 3. Damage stays until something heals it, and attacking ends a unit\'s turn.' },
    { part: 2, title: 'Move',
      target: function (s, sel) { return picked(sel, 'unit', ids.lancer) ? '#grid .tile.t-move' : tile(unitOf(s, ids.lancer)); },
      allow: function (m) { return m.type === 'move' && m.unit === ids.lancer && m.r === 1 && m.c === 4; },
      done: function (s) { return unitOf(s, ids.lancer).r <= 1; },
      text: 'Click the Sunmane lancer, then the marked tile. Units move 1 tile, never diagonally and never through another unit, but the lancer is Swift, so it moves 2.' },
    { part: 2, title: 'End your turn', target: function () { return PRESS; },
      allow: function (m) { return m.type === 'endTurn'; },
      done: function (s) { return s.active === FOE || s.turn > 3; },
      text: 'Nothing else can act this turn. Press End turn.' },
    { part: 2, title: 'The enemy\'s turn', target: function () { return '#cmd'; }, wait: true,
      done: function (s) { return s.active === ME && s.turn > 3; },
      text: 'The command strip turns red while the enemy acts.' },
    { part: 2, title: 'Your turn again',
      target: function (s) { return tile(s.units.filter(function (u) { return u.owner === FOE && u.cardId === 'goblin'; })[0]) || '#themStrip .plate'; },
      text: 'The enemy played a land and summoned a Goblin cutter into its back row. It has to wait a turn, like your cleric did. Your turn began with a fresh card, and your units are ready again.' },
    { part: 2, title: 'Command again', target: function () { return COMMAND; },
      allow: function (m) { return m.type === 'toCommand' || m.type === 'playLand'; },
      done: function (s) { return s.phase === 'command'; },
      text: 'You drew another Sunlit plains. Play it if you like, then press Command units.' },
    { part: 2, title: 'Reach their back row',
      target: function (s, sel) { return picked(sel, 'unit', ids.lancer) ? '#grid .tile.t-move' : tile(unitOf(s, ids.lancer)); },
      allow: function (m) { return m.type === 'move' && m.unit === ids.lancer && m.r === 0; },
      done: function (s) { return unitOf(s, ids.lancer).r === 0; },
      text: 'Only a unit standing on the enemy\'s back row can strike their summoner. Move the lancer up onto the top row.' },
    { part: 2, title: 'Strike the summoner',
      target: function () { return '#themStrip .plate'; },
      allow: function (m) { return m.type === 'attackSummoner' && m.unit === ids.lancer; },
      done: function (s) { return s.winner !== null; },
      text: 'The enemy has 4 life and your lancer hits for 4. Click the enemy\'s plate to strike.' },
    { part: 2, title: 'Victory', last: true,
      text: 'In a full battle each summoner starts with 15 life and a 40-card deck, and draws 7 cards to start, with up to two redraws. Instants can be played on either turn, even in answer to an enemy attack, with the mana you leave unspent. Point at any card to read its rules.',
      after: function () { return Progress.state().starter ? ' Next, try the campaign or an exhibition battle.' : ' Next, choose your first deck, then try the campaign.'; } }
  ];
  var PARTS = { 1: 'The table', 2: 'Your first battle' };

  function current() { return at >= 0 ? STEPS[at] : null; }
  function allows(m) { var st = current(); return !!(st && st.allow && st.allow(m)); }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function draw() {
    var st = current();
    var inPart = STEPS.filter(function (x) { return x.part === st.part; }), n = inPart.indexOf(st) + 1;
    var btns = st.last ? '<button type="button" class="btn primary" data-tut="menu">Main menu</button><button type="button" class="btn" data-tut="again">Play it again</button>'
      : st.allow || st.wait ? ''
      : (at > 0 && STEPS[at - 1].part === st.part && !STEPS[at - 1].allow ? '<button type="button" class="btn" data-tut="back">Back</button>' : '') +
        '<button type="button" class="btn primary" data-tut="next">' + (st.part === 1 && STEPS[at + 1].part === 2 ? 'To the battle' : 'Next') + '</button>';
    coach.className = 'coach' + (st.allow ? ' doing' : '') + (st.last ? ' last' : '');
    coach.innerHTML = '<p class="ceyebrow">Part ' + st.part + ' of 2 · ' + PARTS[st.part] + (st.last ? '' : '<span>' + n + ' / ' + inPart.length + '</span>') + '</p>' +
      '<h2>' + esc(st.title) + '</h2><p class="ctext">' + esc(st.text + (st.after ? st.after() : '')) + '</p>' +
      '<div class="cbtns">' + btns + (st.last ? '' : '<button type="button" class="linkbtn" data-tut="leave">Leave the tutorial</button>') + '</div>';
    if (st.allow) coach.insertAdjacentHTML('beforeend', '<p class="cdo">Your move</p>');
    lastBox = '';
    place();
    var first = coach.querySelector('.btn.primary');
    if (first && !st.allow) first.focus({ preventScroll: true });
    if (st.last) markSeen();
  }

  // The ring sits round every element the step's target matches, and the coach goes above or below it, or beside it if it's tall.
  function targetBox() {
    var st = current(), sel = st.target && st.target(hooks.state(), hooks.sel());
    if (!sel) return null;
    var els = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) { return el.offsetParent !== null || el.getClientRects().length; });
    if (!els.length) return null;
    // On a phone the table scrolls, so a new target that's out of sight is brought into view once.
    if (sel !== lastSel) {
      lastSel = sel;
      var first = els[0].getBoundingClientRect();
      if (first.top < 0 || first.bottom > window.innerHeight) els[0].scrollIntoView({ block: 'center' });
    }
    var b = { l: Infinity, t: Infinity, r: -Infinity, btm: -Infinity };
    els.forEach(function (el) { var r = el.getBoundingClientRect(); b.l = Math.min(b.l, r.left); b.t = Math.min(b.t, r.top); b.r = Math.max(b.r, r.right); b.btm = Math.max(b.btm, r.bottom); });
    return b.r > b.l ? b : null;
  }
  function place() {
    if (!coach || at < 0) return;
    var b = targetBox(), vw = window.innerWidth, vh = window.innerHeight, key = b ? [b.l, b.t, b.r, b.btm].map(Math.round).join(',') : 'none';
    key += ',' + vw + ',' + vh + ',' + coach.offsetHeight;
    if (key === lastBox) return;
    lastBox = key;
    var pad = 6, gap = 14, w = coach.offsetWidth, h = coach.offsetHeight, x, y;
    // Four panels dim the table round the ring; very large shadows aren't painted reliably.
    var hole = b ? { l: b.l - pad, t: b.t - pad, r: b.r + pad, b: b.btm + pad } : { l: vw / 2, t: vh / 2, r: vw / 2, b: vh / 2 };
    [[0, 0, vw, Math.max(0, hole.t)], [0, hole.b, vw, vh], [0, hole.t, Math.max(0, hole.l), hole.b], [hole.r, hole.t, vw, hole.b]].forEach(function (q, k) {
      var st = shades[k].style;
      st.left = q[0] + 'px'; st.top = q[1] + 'px'; st.width = Math.max(0, q[2] - q[0]) + 'px'; st.height = Math.max(0, q[3] - q[1]) + 'px';
    });
    if (!b) {
      ring.className = 'cring none';
      x = (vw - w) / 2; y = (vh - h) / 2;
    } else {
      ring.className = 'cring';
      ring.style.left = hole.l + 'px'; ring.style.top = hole.t + 'px';
      ring.style.width = (hole.r - hole.l) + 'px'; ring.style.height = (hole.b - hole.t) + 'px';
      x = (b.l + b.r) / 2 - w / 2;
      if (b.btm + gap + h < vh - 8) y = b.btm + gap;
      else if (b.t - gap - h > 8) y = b.t - gap - h;
      else if (b.r + gap + w < vw - 8) { x = b.r + gap; y = (b.t + b.btm) / 2 - h / 2; }
      else if (b.l - gap - w > 8) { x = b.l - gap - w; y = (b.t + b.btm) / 2 - h / 2; }
      else y = vh - h - 8;
    }
    coach.style.left = Math.round(Math.max(8, Math.min(x, vw - w - 8))) + 'px';
    coach.style.top = Math.round(Math.max(8, Math.min(y, vh - h - 8))) + 'px';
  }
  // Hand cards lift and the board resizes, so the ring follows its target every frame while the tutorial is open.
  function loop() {
    if (at < 0) { looping = false; return; }
    place();
    requestAnimationFrame(loop);
  }

  function go(i) {
    at = i;
    draw();
    hooks.render();
  }
  // Called after every render of the battle. A finished step moves on, and a step whose move is done waits for nothing.
  function sync() {
    var st = current();
    if (!st) return;
    if (st.done && st.done(hooks.state())) return go(at + 1);
    lastBox = '';
  }

  function buildDom() {
    if (coach) return;
    ring = document.createElement('div');
    ring.className = 'cring none';
    ring.setAttribute('aria-hidden', 'true');
    coach = document.createElement('section');
    coach.className = 'coach';
    coach.setAttribute('aria-label', 'Tutorial');
    coach.setAttribute('aria-live', 'polite');
    for (var k = 0; k < 4; k++) { var sh = document.createElement('div'); sh.className = 'cshade'; sh.setAttribute('aria-hidden', 'true'); shades.push(sh); document.body.appendChild(sh); }
    document.body.appendChild(ring);
    document.body.appendChild(coach);
    window.addEventListener('scroll', function () { place(); }, true);
    window.addEventListener('resize', function () { place(); });
    coach.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tut]');
      if (!b) return;
      var d = b.dataset.tut;
      if (d === 'next') go(at + 1);
      if (d === 'back') go(at - 1);
      if (d === 'again') hooks.restart();
      if (d === 'menu') hooks.leave();
      if (d === 'leave') { markSeen(); hooks.leave(); }
    });
  }

  // ui.js passes state(), sel(), render(), restart() and leave().
  function begin(h) {
    hooks = h;
    buildDom();
    coach.hidden = ring.hidden = false;
    shades.forEach(function (sh) { sh.hidden = false; });
    at = 0;
    draw();
    if (!looping) { looping = true; requestAnimationFrame(loop); }
  }
  function stop() {
    at = -1;
    if (coach) coach.hidden = ring.hidden = true;
    shades.forEach(function (sh) { sh.hidden = true; });
  }

  return { build: build, begin: begin, stop: stop, sync: sync, allows: allows, enemyMove: enemyMove, seen: seen, active: function () { return at >= 0; } };
})();
