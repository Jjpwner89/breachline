// Board UI. The human is always player 0 and sits at the bottom; every click ends in an Engine.legalMoves entry.
(function () {
  var E = Engine, S = null, sel = null, flash = null, runToken = 0, peek = null;
  var HUMAN = 0, BOT = 1, BOT_DELAY = 750;
  var $ = function (id) { return document.getElementById(id); };
  var COLOUR = { W: 'white', R: 'red', U: 'blue', B: 'black', G: 'green' };
  var ALIGNMENT = { W: 'Vigil', R: 'Fervor', U: 'Gnosis', B: 'Dominion', G: 'Genesis', N: 'Neutral' };
  var TYPES = { land: 'Land', unit: 'Unit', instant: 'Instant', enchant: 'Enchantment', spell: 'Spell' };
  var ART = {
    land_w: 'sunlit-plains', land_r: 'cinder-peaks', land_u: 'lantern-quarter',
    spearman: 'militia-spearman', cleric: 'temple-cleric', knight: 'oath-knight', lancer: 'sunmane-lancer', warden: 'pride-warden',
    shield: 'shield-of-dawn', banner: 'blessed-banner',
    goblin: 'goblin-cutter', raider: 'orc-raider', conjurer: 'street-conjurer', sellsword: 'sellsword', warchief: 'orc-warchief',
    giant: 'hill-giant', dragon: 'elder-dragon', firebolt: 'firebolt', hex: 'withering-hex',
    land_b: 'ashen-barrows', land_g: 'overgrown-ruin',
    carrier: 'water-carrier', cub: 'pride-cub', sentinel: 'oath-sentinel', maren: 'saint-maren',
    clanraiders: 'cinder-clan-raiders', berserker: 'cinder-berserker', captain: 'mercenary-captain', drake: 'ember-drake',
    decoy: 'illusory-decoy', scholar: 'cloistered-scholar', arcanist: 'lantern-arcanist', chorister: 'brass-chorister', displacement: 'displacement', glyph: 'binding-glyph',
    thrall: 'gravebound-thrall', harvester: 'bone-harvester', noble: 'ashen-court-noble', vashkar: 'vashkar', raise: 'raise-the-dead', warrant: 'death-warrant',
    sapling: 'walking-sapling', saboteur: 'thornwarden-saboteur', owl: 'great-owl', wayfinder: 'wayfinder-druid', bull: 'elder-herd-bull', shifting: 'shifting-forest',
    youngsummoner: 'young-summoner'
  };
  // Lines live in FLAVOUR.md and NEW_CARDS.md. A card with no entry has no flavour text.
  var FLAVOUR = {
    spearman: { line: 'My mother held this spear at Sallow Bridge. It still pulls left.' },
    cleric: { line: 'I have closed nine thousand wounds and heard no voice. I will close another tomorrow.', credit: 'Still Flame healer' },
    knight: { line: 'No one ordered her to stay.' },
    lancer: { line: 'Some mornings, the ride is only a ride.' },
    shield: { line: 'The blow landed and I stood.' },
    banner: { line: 'We have rewoven it eleven times. No thread of the first remains.' },
    goblin: { line: 'Smaller than you think. Closer than you think.' },
    raider: { line: "We leave when there's nothing left to carry." },
    conjurer: { line: 'Two coppers for a sparrow of flame.' },
    sellsword: { line: 'Every side owes him.' },
    warchief: { line: 'Forty went up the pass with Grusha. Four hundred came down.' },
    giant: { line: 'Fee fi fo fum.' },
    dragon: { line: 'Three cities took its name, hoping to be spared.' },
    hex: { line: 'She stopped praying before the rust reached the hilt.' },
    carrier: { line: 'The wounded remember who brought the water.' },
    cub: { line: 'Every cub learns to roar before learning why.' },
    clanraiders: { line: 'Last one over the wall buys the drinks.' },
    berserker: { line: 'Nobody has ever told her to stop twice.' },
    captain: { line: 'We chose him at dawn. We can choose again by dusk.' },
    decoy: { line: 'Your aim was perfect.' },
    scholar: { line: 'She asked for one more candle. That was in the spring.' },
    noble: { line: 'She has never raised her voice. No one has needed her to.' },
    raise: { line: "Get up. You're still useful." },
    bull: { line: "The herd doesn't go around." },
    shifting: { line: 'The path was here yesterday.' },
    youngsummoner: { line: 'She has worn long sleeves since she was nine.' },
    land_g: { line: 'Something green is growing through the throne room floor.' }
  };
  function artSrc(id) { return 'art/web/' + ART[id] + '.jpg'; }
  // The board rebuilds on every render, so hold every image decoded up front to stop tiles flickering.
  // Cards whose painting isn't finished yet show a plain coloured panel instead of a broken image.
  var noArt = {}, artRedraw = null;
  var preloaded = Object.keys(ART).map(function (id) {
    var im = new Image();
    im.onerror = function () {
      noArt[id] = true;
      clearTimeout(artRedraw);
      artRedraw = setTimeout(function () {
        if (!S) return;
        var open = peek;
        peek = null;
        if (open) showCard(open.id, open.note);
        render();
      }, 50);
    };
    im.src = artSrc(id);
    return im;
  });

  function actor() { return S.pending ? S.pending.responder : S.active; }
  function humanMoves() { return S.winner === null && actor() === HUMAN ? E.legalMoves(S) : []; }
  function unitById(uid) { return S.units.filter(function (u) { return u.uid === uid; })[0]; }
  function cardOf(id) {
    var h = S.players[HUMAN].hand.filter(function (i) { return i.id === id; })[0];
    return h ? E.CARDS[h.c] : null;
  }

  function selectedMoves(moves) {
    if (!sel) return [];
    if (sel.kind === 'card') return moves.filter(function (m) { return m.card === sel.id; });
    return moves.filter(function (m) {
      if (m.unit !== sel.id) return false;
      return sel.ability ? m.type === 'ability' : true;
    });
  }

  function pips(p) {
    var mana = '<span class="mana">' + p.mana + ' / ' + p.lands.length + ' mana</span>';
    var list = p.lands.map(function (l) { return '<span class="pip ' + l.colour + '" title="' + E.CARDS[l.c].name + '" data-peek="' + l.c + '">' + l.colour + '</span>'; }).join('');
    return mana + (list || 'No lands yet');
  }

  function summonerHtml(pi, label, targetable) {
    var p = S.players[pi];
    var counts = pi === HUMAN
      ? p.deck.length + ' in deck, ' + p.discard.length + ' discarded'
      : p.hand.length + ' in hand, ' + p.deck.length + ' in deck, ' + p.discard.length + ' discarded';
    var tag = targetable ? 'button type="button" data-summoner="1"' : 'div';
    var close = targetable ? 'button' : 'div';
    return '<' + tag + ' class="summoner ' + (pi === HUMAN ? 'you' : 'them') + (targetable ? ' target' : '') + '" id="summoner' + pi + '">' +
      '<b>' + label + '</b><span class="life">' + p.life + '</span><span class="count">' + counts + '</span></' + close + '>';
  }

  function tileHtml(r, c, marks) {
    var u = S.units.filter(function (x) { return x.r === r && x.c === c; })[0];
    var cls = ['tile'], attrs = 'data-r="' + r + '" data-c="' + c + '"', key = r + ',' + c, inner = '';
    if (r === 0 || r === E.ROWS - 1) cls.push('back');
    if (marks.tiles[key]) cls.push(marks.tiles[key]);
    if (flash && flash[0] === r && flash[1] === c) cls.push('flash');
    var label = '';
    if (u) {
      var d = E.CARDS[u.cardId], waiting = u.summonedTurn === S.turn;
      cls.push(u.owner === HUMAN ? 'own' : 'enemy', d.colour);
      if (waiting) cls.push('waiting');
      else if (u.owner === S.active && u.acted) cls.push('done');
      if (sel && sel.kind === 'unit' && sel.id === u.uid) cls.push('selected');
      if (marks.units[u.uid]) cls.push(marks.units[u.uid]);
      var notes = d.keywords.slice();
      u.enchants.forEach(function (e) { notes.push(E.CARDS[e.c].name); });
      if (u.tempAtk) notes.push('+' + u.tempAtk + ' this turn');
      if (waiting) notes.push('Waiting');
      else if (u.owner === S.active && u.acted) notes.push('Done');
      inner = (noArt[d.id] ? '' : '<img class="tart" src="' + artSrc(d.id) + '" alt="" decoding="sync" draggable="false">') +
        '<span class="nm">' + d.name + '</span>' +
        '<span class="lower">' + (notes.length ? '<span class="meta">' + notes.join(', ') + '</span>' : '') +
        '<span class="st"><span class="dir" aria-hidden="true">' + (u.owner === HUMAN ? '▲' : '▼') + '</span>' + E.attackOf(S, u) + '<span class="sl">/</span>' + u.hp + '</span>' +
        '<span class="bar"><i style="width:' + Math.max(0, Math.round(u.hp / u.maxHp * 100)) + '%"></i></span></span>';
      label = (u.owner === HUMAN ? 'Your ' : 'Enemy ') + d.name + ', attack ' + E.attackOf(S, u) + ', health ' + u.hp;
      attrs += ' data-peek="' + d.id + '" data-note="' + (u.owner === HUMAN ? 'Your unit' : 'Enemy unit') + ', now ' + E.attackOf(S, u) + ' / ' + u.hp + '"';
    } else label = 'Empty tile, row ' + (r + 1) + ', column ' + (c + 1);
    return '<button type="button" class="' + cls.join(' ') + '" ' + attrs + ' aria-label="' + label + '">' + inner + '</button>';
  }

  // Each town fills two tiles beside its owner's half, so raiders reach it before the summoner. Closed in this version.
  function townHtml(side, label) {
    return '<div class="town ' + side + '" role="img" aria-label="' + label + ', under construction"><svg viewBox="0 0 100 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path class="scaffold" d="M20 100V62L42 44L64 62V100M20 62H64M20 81H64M42 44V100M30 150V116H82V150M30 133H82M47 116V150M64 116V150M64 116V96H84V106"/></svg>' +
      '<span class="who">' + label + '</span><span class="sign"><span class="long">Under construction</span><span class="short">Being built</span></span></div>';
  }

  function computeMarks(moves) {
    var marks = { tiles: {}, units: {}, summoner: false };
    selectedMoves(moves).forEach(function (m) {
      if (m.type === 'summon') marks.tiles[m.r + ',' + m.c] = 't-summon';
      else if (m.type === 'move' && !sel.ability) marks.tiles[m.r + ',' + m.c] = 't-move';
      else if (m.type === 'attack') marks.units[m.target] = 't-attack';
      else if (m.type === 'attackSummoner') marks.summoner = true;
      else if (m.type === 'enchant') marks.units[m.target] = cardOf(sel.id).atkBonus > 0 ? 't-buff' : 't-attack';
      else if (m.type === 'ability' && sel.ability && m.target) {
        var ab = E.CARDS[unitById(sel.id).cardId].ability;
        marks.units[m.target] = ab.key === 'heal' || ab.key === 'orders' || ab.key === 'harvest' ? 't-buff' : 't-attack';
      }
    });
    return marks;
  }

  // One frame for the hand and the close-up. o.cost and o.have give the live cost and matching lands; without them the printed card shows.
  function frameHtml(c, o) {
    o = o || {};
    var isLand = c.type === 'land', cost = o.cost === undefined ? c.cost : o.cost, have = o.have === undefined ? c.wants : o.have, syms = '';
    for (var n = 0; n < c.wants; n++) syms += '<svg class="sym' + (n < have ? '' : ' miss') + '" aria-hidden="true"><use href="#sym-' + c.colour + '"/></svg>';
    var wantsText = c.wants ? 'Wants ' + c.wants + ' ' + COLOUR[c.colour] + ' land' + (c.wants === 1 ? '' : 's') : 'Any lands';
    var costHtml = isLand ? '' : '<span class="cost" title="' + wantsText + '" aria-label="Costs ' + cost + ', ' + wantsText.toLowerCase() + '">' +
      '<span class="coin' + (cost > c.cost ? ' over' : '') + '">' + cost + '</span>' + (syms ? '<span class="wants">' + syms + '</span>' : '') + '</span>';
    var body = c.text || (isLand ? 'Adds 1 mana each turn.' : '');
    var foot = c.type === 'unit' ? '<span class="foot"><span class="stat"><span>Attack</span><strong>' + c.atk + '</strong></span><span class="stat hp"><span>Health</span><strong>' + c.hp + '</strong></span></span>' : '';
    var fl = FLAVOUR[c.id];
    if (fl) body += '<span class="flavour">' + fl.line + (fl.credit ? '<span class="credit">' + fl.credit + '</span>' : '') + '</span>';
    return '<span class="frame ' + c.colour + (isLand ? ' land' : '') + (o.big ? ' big' : '') + '"><span class="inner">' + costHtml +
      '<span class="bar-top">' + c.name + '</span>' +
      '<span class="art">' + (noArt[c.id] ? '' : '<img src="' + artSrc(c.id) + '" alt="" decoding="sync" draggable="false">') + '</span>' +
      '<span class="type">' + TYPES[c.type] + (c.sub ? ', ' + c.sub : '') + ' · ' + ALIGNMENT[c.colour] + '</span>' +
      '<span class="ctext">' + body + '</span>' + foot + '</span></span>';
  }

  function cardHtml(i, moves) {
    var c = E.CARDS[i.c], you = S.players[HUMAN];
    var have = you.lands.filter(function (l) { return l.colour === c.colour; }).length;
    var playable = S.phase === 'opening' || moves.some(function (m) { return m.card === i.id; });
    var cls = 'card' + (sel && sel.kind === 'card' && sel.id === i.id ? ' selected' : '') + (playable ? '' : ' dim');
    return '<button type="button" class="' + cls + '" data-card="' + i.id + '" data-peek="' + c.id + '" data-note="In your hand">' +
      frameHtml(c, { cost: E.costOf(S, HUMAN, c), have: have }) + '</button>';
  }

  // Hand cards have little room, so a line that doesn't fit is left for the close-up, and rules text that still doesn't fit gets smaller.
  function fitHand() {
    Array.prototype.forEach.call($('hand').querySelectorAll('.ctext'), function (t) {
      var f = t.querySelector('.flavour');
      if (f && t.scrollHeight > t.clientHeight) t.removeChild(f);
      if (t.scrollHeight > t.clientHeight) t.classList.add('tight');
    });
  }

  // The large card beside the board. It only redraws when the card changes, so bot turns don't reset it.
  function showCard(id, note) {
    if (peek && peek.id === id && peek.note === (note || '')) return;
    peek = { id: id, note: note || '' };
    $('inspect').innerHTML = '<div class="slot">' + frameHtml(E.CARDS[id], { big: true }) + '</div><p class="note">' + peek.note + '</p>';
    $('peekBtn').setAttribute('aria-label', 'View card: ' + E.CARDS[id].name);
  }
  function peekFrom(e) {
    var t = e.target.closest('[data-peek]');
    if (t) showCard(t.dataset.peek, t.dataset.note || E.CARDS[t.dataset.peek].name + ' in play');
  }
  function closePeek() {
    if (!$('inspect').classList.contains('open')) return;
    $('inspect').classList.remove('open');
    $('peekBtn').focus();
  }

  function btn(label, data, primary) {
    return '<button type="button" class="btn' + (primary ? ' primary' : '') + '" data-do=\'' + JSON.stringify(data) + '\'>' + label + '</button>';
  }

  function moveLabel(m) {
    var c = cardOf(m.card), t = m.target ? unitById(m.target) : null;
    var where = '';
    if (t && m.r !== undefined) where = ', moving ' + (m.r < t.r ? 'up' : m.r > t.r ? 'down' : m.c < t.c ? 'left' : 'right');
    return c.name + (t ? ' on ' + E.CARDS[t.cardId].name : '') + where;
  }

  function actionsHtml(moves) {
    var you = S.players[HUMAN];
    if (S.winner !== null) {
      var txt = S.winner === 'draw' ? 'The game is a draw.' : S.winner === HUMAN ? 'You win.' : 'You lose.';
      return '<span class="prompt"><b>' + txt + '</b> ' + S.players[HUMAN].life + ' to ' + S.players[BOT].life + ' after ' + S.turn + ' turns.</span><span class="btns">' + btn('Play again', { ui: 'new' }, true) + '</span>';
    }
    if (actor() !== HUMAN) {
      return '<span class="prompt">' + (S.pending ? 'The opponent is deciding on a response.' : S.phase === 'opening' ? 'The opponent is choosing their opening hand.' : 'The opponent is taking their turn.') + '</span>';
    }
    if (S.phase === 'opening') {
      if (you.toBottom) return '<span class="prompt">Click ' + (you.toBottom > 1 ? you.toBottom + ' cards' : 'a card') + ' to put on the bottom of your deck.</span>';
      var redraw = moves.some(function (m) { return m.type === 'redraw'; });
      var costNote = you.redraws ? ' Keeping this hand means putting ' + (you.redraws > 1 ? you.redraws + ' cards' : '1 card') + ' on the bottom of your deck.' : '';
      return '<span class="prompt">' + (redraw ? 'Keep this hand, or shuffle it back and draw a new one? Each redraw leaves you one card fewer.' : 'This is your last redraw.') + costNote + '</span><span class="btns">' +
        (redraw ? btn('Redraw', { move: { type: 'redraw' } }) : '') + btn('Keep hand', { move: { type: 'keepHand' } }, true) + '</span>';
    }
    if (S.pending) {
      var att = S.pending.attack, text;
      if (att) {
        var a = unitById(att.attacker);
        var target = att.summoner !== undefined ? 'you' : E.CARDS[unitById(att.targetUid).cardId].name;
        text = E.CARDS[a.cardId].name + ' is attacking ' + target + ' for ' + E.attackOf(S, a) + '. Respond?';
      } else text = 'The enemy turn is ending. Use an instant?';
      var opts = moves.filter(function (m) { return m.type === 'respond'; }).map(function (m) { return btn(moveLabel(m), { move: m }); }).join('');
      return '<span class="prompt">' + text + '</span><span class="btns">' + opts + btn('Pass', { move: { type: 'pass' } }, true) + '</span>';
    }
    var out = [], sm = selectedMoves(moves);
    if (S.phase === 'play') {
      var hint = 'Pick a card from your hand, then move on to your units.';
      if (sel && sel.kind === 'card') {
        var c = cardOf(sel.id), place = sm.some(function (m) { return m.type === 'summon'; }), ench = sm.some(function (m) { return m.type === 'enchant'; });
        if (c.type === 'instant') hint = 'Instants are cast during the enemy turn.';
        else if (place) hint = 'Choose a highlighted tile in your back row.';
        else if (ench) hint = 'Choose a unit to enchant.';
        else if (c.type === 'spell') hint = sm.length ? 'Choose a unit to return.' : "You can't cast this right now.";
        else if (c.type !== 'land') hint = 'Not enough mana to play this now.';
        else hint = you.landDropped ? 'You already played a land this turn.' : 'Play this land.';
        sm.forEach(function (m) {
          if (m.type === 'playLand') out.push(btn('Play land', { move: m }, true));
          if (m.type === 'cast') {
            var back = you.discard.filter(function (d) { return d.id === m.raise; })[0];
            out.push(btn('Return ' + E.CARDS[back.c].name, { move: m }, true));
          }
        });
        out.push(btn('Cancel', { ui: 'clear' }));
      }
      var canCommand = E.legalMoves(E.applyMove(S, { type: 'toCommand' })).length > 1;
      out.push(canCommand ? btn('Command units', { move: { type: 'toCommand' } }, !sel) : btn('End turn', { ui: 'skip' }, !sel));
      return '<span class="prompt">' + hint + '</span><span class="btns">' + out.join('') + '</span>';
    }
    var cmdHint = 'Select one of your units. Each can move, then attack or use an ability.';
    if (sel && sel.kind === 'unit') {
      var u = unitById(sel.id), ab = u ? E.CARDS[u.cardId].ability : null;
      if (sel.ability) {
        cmdHint = 'Choose a target for ' + ab.label + '.';
        out.push(btn('Back', { ui: 'noAbility' }));
      } else {
        cmdHint = sm.length ? 'Move to a dashed tile or attack a highlighted target.' : 'This unit has nothing it can do right now.';
        var abMoves = sm.filter(function (m) { return m.type === 'ability'; });
        if (abMoves.length) {
          out.push(abMoves[0].target ? btn(ab.label, { ui: 'ability' }) : btn(ab.label, { move: abMoves[0] }));
        }
      }
    }
    out.push(btn('End turn', { move: { type: 'endTurn' } }, !sel));
    return '<span class="prompt">' + cmdHint + '</span><span class="btns">' + out.join('') + '</span>';
  }

  function floats() {
    (S.fx || []).forEach(function (f) {
      var host = f.summoner !== undefined ? $('summoner' + f.summoner) : document.querySelector('.tile[data-r="' + f.r + '"][data-c="' + f.c + '"]');
      if (!host) return;
      if (f.summoner !== undefined) host.style.position = 'relative';
      var s = document.createElement('span');
      s.className = 'float' + (f.good ? ' good' : '');
      s.textContent = f.text;
      host.appendChild(s);
    });
  }

  function render() {
    var moves = humanMoves(), marks = computeMarks(moves);
    var who = S.winner !== null ? 'Game over' : S.phase === 'opening' ? 'Opening hands' : (S.active === HUMAN ? 'Your turn' : 'Enemy turn') + (S.phase === 'command' ? ', command' : ', play');
    $('turnLabel').textContent = S.phase === 'opening' ? who : 'Turn ' + S.turn + ' · ' + who;
    $('themStrip').innerHTML = '<div class="lands">' + pips(S.players[BOT]) + '</div>' + summonerHtml(BOT, S.players[BOT].name, marks.summoner);
    $('youStrip').innerHTML = summonerHtml(HUMAN, 'You · ' + S.players[HUMAN].name, false) + '<div class="lands">' + pips(S.players[HUMAN]) + '</div>';
    var g = '';
    for (var r = 0; r < E.ROWS; r++) for (var c = 0; c < E.COLS; c++) g += tileHtml(r, c, marks);
    g += townHtml('them', 'Enemy town') + townHtml('you', 'Your town');
    $('grid').innerHTML = g;
    $('actions').innerHTML = actionsHtml(moves);
    $('hand').innerHTML = S.players[HUMAN].hand.map(function (i) { return cardHtml(i, moves); }).join('') || '<span class="prompt">Your hand is empty.</span>';
    fitHand();
    var log = $('log'), recent = S.log.slice(-40);
    log.innerHTML = recent.map(function (l) { return '<div>T' + l.turn + ': ' + l.text + '</div>'; }).join('');
    log.scrollTop = log.scrollHeight;
    floats();
  }

  function apply(m) {
    if (m.card && actor() === BOT && m.type !== 'playLand' && m.type !== 'bottomCard') {
      var played = S.players[BOT].hand.filter(function (i) { return i.id === m.card; })[0];
      if (played) showCard(played.c, 'The enemy played this');
    }
    if (m.type === 'summon' || m.type === 'move') flash = [m.r, m.c]; else flash = null;
    S = E.applyMove(S, m);
    if (m.type === 'move' && S.units.some(function (u) { return u.uid === m.unit; }) && E.legalMoves(S).some(function (x) { return x.unit === m.unit; })) sel = { kind: 'unit', id: m.unit };
    else sel = null;
    render();
    schedule();
  }

  function schedule() {
    if (S.winner !== null || actor() !== BOT) return;
    var token = ++runToken;
    setTimeout(function () {
      if (token !== runToken || S.winner !== null || actor() !== BOT) return;
      apply(Bot.choose(S, Math.random));
    }, BOT_DELAY);
  }

  function clickTile(el) {
    var r = +el.dataset.r, c = +el.dataset.c, moves = humanMoves();
    var u = S.units.filter(function (x) { return x.r === r && x.c === c; })[0], sm = selectedMoves(moves);
    var hit = sm.filter(function (m) {
      if (m.type === 'summon' || (m.type === 'move' && !sel.ability)) return m.r === r && m.c === c;
      if (!u || m.target !== u.uid) return false;
      if (m.type === 'enchant' || m.type === 'attack') return true;
      return m.type === 'ability' && sel.ability;
    });
    if (sel && sel.ability) hit = hit.filter(function (m) { return m.type === 'ability'; });
    if (hit.length) return apply(hit[0]);
    if (u && u.owner === HUMAN && !S.pending && S.active === HUMAN && S.phase === 'command') { sel = { kind: 'unit', id: u.uid }; return render(); }
    if (sel) { sel = null; render(); }
  }

  $('grid').addEventListener('click', function (e) {
    var t = e.target.closest('.tile');
    if (t) clickTile(t);
  });
  $('hand').addEventListener('click', function (e) {
    var t = e.target.closest('.card');
    if (!t || S.winner !== null || actor() !== HUMAN || S.pending) return;
    var id = +t.dataset.card;
    if (S.phase === 'opening') {
      var bottom = humanMoves().filter(function (m) { return m.type === 'bottomCard' && m.card === id; })[0];
      if (bottom) apply(bottom);
      return;
    }
    if (S.phase !== 'play') return;
    sel = sel && sel.kind === 'card' && sel.id === id ? null : { kind: 'card', id: id };
    render();
  });
  $('themStrip').addEventListener('click', function (e) {
    if (!e.target.closest('[data-summoner]')) return;
    var m = selectedMoves(humanMoves()).filter(function (x) { return x.type === 'attackSummoner'; })[0];
    if (m) apply(m);
  });
  $('actions').addEventListener('click', function (e) {
    var b = e.target.closest('[data-do]');
    if (!b) return;
    var d = JSON.parse(b.getAttribute('data-do'));
    if (d.move) return apply(d.move);
    if (d.ui === 'new') return start();
    if (d.ui === 'clear') sel = null;
    if (d.ui === 'ability') sel.ability = true;
    if (d.ui === 'noAbility') sel.ability = false;
    if (d.ui === 'skip') { S = E.applyMove(S, { type: 'toCommand' }); sel = null; return apply({ type: 'endTurn' }); }
    render();
  });
  $('newGame').addEventListener('click', function () { start(); });
  ['mouseover', 'focusin', 'click'].forEach(function (type) { document.querySelector('.field').addEventListener(type, peekFrom); });
  $('peekBtn').addEventListener('click', function () { $('inspect').classList.add('open'); $('inspect').focus(); });
  $('inspect').addEventListener('click', closePeek);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePeek(); });

  function start(state) {
    runToken++;
    sel = null; flash = null;
    var mine = $('deckPick').value;
    S = state || E.newGame({ seed: Math.floor(Math.random() * 2147483647), decks: [mine, $('oppPick').value], first: Math.random() < 0.5 ? 0 : 1 });
    var opening = S.players[HUMAN].hand[0];
    if (opening) showCard(opening.c, 'In your hand');
    render();
    schedule();
  }

  function boot(data) { start(data && data.state); }
  if (window.claude && window.claude.hot) window.claude.hot.snapshot(function () { return { state: S }; });
  if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(boot);
  else boot(window.claude && window.claude.hot && window.claude.hot.data || {});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
  window.__game = { get state() { return S; }, load: start };
})();
