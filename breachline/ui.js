// Board UI. The human is player 0 and sits at the bottom, except on the test table; every click ends in an Engine.legalMoves entry.
(function () {
  var E = Engine, S = null, sel = null, flash = null, runToken = 0, peek = null, lastTurn = null, peekTimer = null, picks = { mine: 'white', opp: 'red' }, decks = null;
  var HUMAN = 0, BOT = 1, BOT_DELAY = 750;
  // Who plays the opponent: the scripted bot, or Claude at a difficulty level from guides.js.
  var oppPlayer = 'bot', debugOn = false;
  // A campaign battle saves after every move and reports its result to Campaign. The exhibition's opponent pick waits meanwhile.
  var chapterBattle = false, exhibitionPlayer = 'bot';
  // The test table: no bot, you play whichever side is acting from that side's hand, and both sides always have mana.
  // HUMAN and BOT follow whoever is acting, so the board marks that side's units as yours. Picked cards go to seat 0 or 1.
  var sandbox = false, testSide = 0, TEST_MANA = 99;
  var $ = function (id) { return document.getElementById(id); };
  var COLOUR = { W: 'white', R: 'red', U: 'blue', B: 'black', G: 'green' };
  var ALIGNMENT = { W: 'Vigil', R: 'Fervor', U: 'Gnosis', B: 'Dominion', G: 'Genesis', N: 'Neutral' };
  var DECK_NOTES = {
    white: 'Healing, protecting allies and standing together.',
    red: 'High attack, direct damage, speed, giants and fliers.',
    blue: 'Ranged attacks, moving units, drawing cards and decoys.',
    black: 'Life drain, destroying units and returning them from the discard pile.',
    green: 'Very large units, units that grow, extra lands and recovering health.'
  };
  var DECK_ART = { white: 'lancer', red: 'warchief', blue: 'conjurer', black: 'harvester', green: 'land_g' };
  // On wide screens the close-up has its own column, and elsewhere it floats over the map. Same query as the CSS.
  var DOCKED = window.matchMedia('(min-width: 1280px) and (min-aspect-ratio: 3/2)');
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
    youngsummoner: 'young-summoner',
    stillflame: 'the-still-flame', lampwright: 'light-without-an-answer', across: 'across-the-silence',
    shelter: 'alderkin-winter-shelter', marble: 'overgrown-ruin-vignette', dawnsails: 'dawnsails-over-the-harvest', raincup: 'raincup-at-first-light', mending: 'spindlejack-mending-the-sail',
    channel: 'alderkin-waterkeeper', passage: 'dawnsail-passage', slateprowler: 'slateprowler-on-the-descent', reedcrown: 'reedcrown-grazer', coalback: 'coalback-forager',
    shieldbearer: 'oath-shieldbearer', huntress: 'pride-huntress', matriarch: 'pride-matriarch', sifting: 'sifting-the-shallows', phantasm: 'conclave-phantasm',
    adept: 'threshold-adept', examiner: 'conclave-examiner', siegewalker: 'brass-siege-walker', ilvane: 'ilvane', rats: 'barrow-rats', squire: 'indebted-squire',
    hunted: 'hunted', calleddebt: 'called-debt', envoy: 'ashen-court-envoy', barrowpriest: 'barrow-priest', colossus: 'barrow-colossus', firepot: 'goblin-firepot',
    cinderfall: 'cinderfall', chieftain: 'giant-chieftain', boar: 'thicket-boar', grovetender: 'grove-tender-set4', mossback: 'mossback-bear', herdmother: 'herd-mother',
    orrowen: 'orrowen', follower: 'camp-follower', scarred: 'scarred-summoner',
    fieldscholar: 'conclave-field-scholar', wardwright: 'harmonic-wardwright', brightlance: 'brightlance', wovenward: 'woven-ward', quench: 'enchanters-quench',
    rimedrake: 'rime-drake', goblinscout: 'thornwarden-goblin-scout', alderkin: 'bronze-harness-alderkin', retainer: 'porcelain-visored-retainer', veiladept: 'veil-adept',
    flameblade: 'banked-flame-blade', stoneward: 'stoneward-colossus',
    scorch: 'scorch', stormstrike: 'stormstrike', salamander: 'ember-salamander', frost: 'frost', glyphwright: 'glyphwright', thornbrake: 'thornbrake',
    gravesoil: 'grave-soil', ashsower: 'ash-sower', consecrate: 'consecrated-ground', muster: 'muster-the-levy', lioness: 'pride-lioness',
    rabblerouser: 'goblin-rabble-rouser', seedfall: 'seedfall', gravecaller: 'gravecaller', apprentice: 'lantern-apprentice', drummer: 'cinder-cant-drummer',
    tithekeeper: 'tithe-keeper', assassin: 'court-assassin', skirmisher: 'cinder-skirmisher', packhunter: 'orc-pack-hunter', ridgewolves: 'ridge-wolves',
    outrider: 'oath-outrider', sergeant: 'shieldline-sergeant', ironbark: 'ironbark-sentinel', martyr: 'cinder-martyr', vigilkeeper: 'vigil-keeper',
    acolyte: 'still-flame-acolyte', journeyman: 'artificers-journeyman',
    veteran: 'cinderline-veteran', falchion: 'redglass-falchion', rainreader: 'rain-reader', mountainlung: 'the-mountains-lung', cinderwake: 'cinderwake',
    stoneopens: 'the-stone-opens', torchrunner: 'copperlane-torch-runner', lanner: 'ash-white-lanner', winterdoor: 'winterdoor-keeper',
    mourner: 'mothwake-mourner', rapier: 'cobalt-rapier', corewright: 'corewright'
  };
  var TILE_NAMES = { burn: 'Burning', thorns: 'Thorns', frost: 'Frozen', snare: 'Snare', blight: 'Blighted', holy: 'Consecrated', charge: 'Charged' };
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
    land_g: { line: 'Something green is growing through the throne room floor.' },
    across: { line: 'It has never once gone slack.' },
    marble: { line: 'Give it time.' },
    dawnsails: { line: 'My grandfather saw one once.' },
    mending: { line: "I still don't know if it likes me." },
    coalback: { line: 'Count your coals.' }
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
        Screens.redraw();
        if (!$('start').hidden) renderStart();
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
  // The tile effect paintings too, so a new effect shows at once rather than a frame later.
  Object.keys(TILE_NAMES).forEach(function (k) {
    ['tile-', 'border-', 'emblem-'].forEach(function (p) { var im = new Image(); im.src = 'art/web/ui/' + p + k + '.png'; preloaded.push(im); });
  });

  function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  // The Claude opponent needs the page to be running inside Claude. Anywhere else, only the scripted bot is on offer.
  var sample = null, plan = null, thinking = null, modelOff = false, lastThought = null;
  if (window.claude && window.claude.use) window.claude.use('sample').then(function (fn) { sample = fn; refreshStart(); });
  function refreshStart() { if (!$('start').hidden) renderStart(); Screens.redraw(); }

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
  // A unit that brings others, or a spell that summons, takes its back-row tiles one click at a time.
  // Returns null until there are tiles to pick: for a unit, once its own tile is chosen.
  function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }
  function pickStage(sm) {
    if (!sel || sel.kind !== 'card') return null;
    var picks = sel.picks || [];
    var cands = sm.filter(function (m) {
      if (!m.at || (m.type === 'summon' && !(sel.summonAt && m.r === sel.summonAt.r && m.c === sel.summonAt.c))) return false;
      return picks.every(function (p) { return m.at.some(function (t) { return same(t, p); }); });
    });
    if (!cands.length || !cands.some(function (m) { return m.at.length; })) return null;
    var open = {};
    cands.forEach(function (m) { m.at.forEach(function (t) { if (!picks.some(function (p) { return same(t, p); })) open[t[0] + ',' + t[1]] = true; }); });
    return { cands: cands, picks: picks, open: open };
  }

  function sym(colour) { return '<svg aria-hidden="true"><use href="#sym-' + colour + '"/></svg>'; }

  function plateHtml(pi, targetable, threat) {
    var p = S.players[pi], main = p.colour, you = pi === HUMAN;
    var gems = p.lands.map(function (l, n) {
      return '<span class="gem ' + l.colour + (n < p.mana ? '' : ' spent') + '" title="' + E.CARDS[l.c].name + '" data-peek="' + l.c + '">' + sym(l.colour) + '</span>';
    }).join('');
    var pile = function (label, n, back) { return '<span class="pile' + (back ? ' back' : '') + '"><small>' + label + '</small><b>' + n + '</b></span>'; };
    var tag = targetable ? 'button type="button" data-summoner="1"' : 'div';
    var close = targetable ? 'button' : 'div';
    var active = S.winner === null && S.phase !== 'opening' && S.active === pi;
    return '<' + tag + ' class="plate ' + (you ? 'you' : 'them') + (active ? ' active' : '') + (targetable ? ' target' : '') + (threat ? ' threat' : '') + '" id="summoner' + pi + '"' +
      (targetable ? ' aria-label="Attack the enemy summoner, life ' + p.life + '"' : '') + '>' +
      '<span class="crest ' + main + '">' + sym(main) + '</span>' +
      '<span class="who"><b>' + (you ? 'You' : esc(p.name)) + '</b><small>' + (you ? esc(p.name) : ALIGNMENT[main] + (modelOn() ? ' · Claude, ' + AI.levels[oppPlayer].label : '')) + '</small></span>' +
      '<span class="life" title="Summoner life"><strong>' + p.life + '</strong><i><b style="width:' + Math.max(0, Math.min(100, Math.round(p.life / E.START_LIFE * 100))) + '%"></b></i></span>' +
      '<span class="manarow"><span class="mana">' + p.mana + ' <small>/ ' + p.lands.length + ' mana</small></span>' + gems + '</span>' +
      (targetable ? '<span class="strike">Strike summoner</span>' : '') +
      '<span class="piles">' + (you ? '' : pile('Hand', p.hand.length, true)) + pile('Deck', p.deck.length, true) + pile('Discard', p.discard.length) + '</span>' +
      '</' + close + '>';
  }

  function tileHtml(r, c, marks) {
    var u = S.units.filter(function (x) { return x.r === r && x.c === c; })[0];
    var cls = ['tile'], attrs = 'data-r="' + r + '" data-c="' + c + '"', key = r + ',' + c, inner = '';
    if (marks.tiles[key]) cls.push(marks.tiles[key]);
    if (flash && flash[0] === r && flash[1] === c) cls.push('flash');
    var label = '', fx = E.tileAt(S, r, c), fxText = '';
    if (fx) {
      var left = fx.until - S.turn + 1;
      cls.push('fx', 'fx-' + fx.kind);
      fxText = TILE_NAMES[fx.kind] + ', ' + left + ' turn' + (left === 1 ? '' : 's') + ' left';
      inner += '<span class="tfx" title="' + fxText + '"><i></i><b>' + left + '</b></span>';
    }
    if (sel && sel.picks && sel.picks.some(function (p) { return p[0] === r && p[1] === c; })) cls.push('t-picked');
    if (sel && sel.summonAt && sel.picks && sel.summonAt.r === r && sel.summonAt.c === c) cls.push('t-picked');
    if (u) {
      var d = E.CARDS[u.cardId], waiting = u.summonedTurn === S.turn;
      cls.push(u.owner === HUMAN ? 'own' : 'enemy', d.colour);
      if (waiting) cls.push('waiting');
      else if (u.owner === S.active && u.acted) cls.push('done');
      if (sel && sel.kind === 'unit' && sel.id === u.uid) cls.push('selected');
      if (marks.units[u.uid]) cls.push(marks.units[u.uid]);
      var chips = d.keywords.map(function (k) { return '<span class="chip">' + k + '</span>'; });
      u.enchants.forEach(function (e) { chips.push('<span class="chip">' + E.CARDS[e.c].name + (e.left ? ' ' + e.left : '') + '</span>'); });
      if (u.tempAtk) chips.push('<span class="chip">+' + u.tempAtk + ' this turn</span>');
      if (u.stride && u.owner === S.active) chips.push('<span class="chip">+' + u.stride + ' move</span>');
      if (u.held >= S.turn) chips.push('<span class="chip state">Held</span>');
      if (u.frozen >= S.turn) chips.push('<span class="chip state">Frozen</span>');
      if (u.veiled) chips.push('<span class="chip state">Veiled</span>');
      if (u.carrion) chips.push('<span class="chip">Carrion +' + u.carrion + '</span>');
      if (waiting) chips.push('<span class="chip state">Waiting</span>');
      else if (u.owner === S.active && u.acted) chips.push('<span class="chip state">Done</span>');
      var atk = E.attackOf(S, u), pct = Math.max(0, Math.round(u.hp / u.maxHp * 100));
      inner += (noArt[d.id] ? '' : '<img class="tart" src="' + artSrc(d.id) + '" alt="" decoding="sync" draggable="false">') +
        '<span class="nm">' + sym(d.colour) + '<span>' + d.name + '</span></span>' +
        (chips.length ? '<span class="chips">' + chips.join('') + '</span>' : '') +
        '<span class="st"><span class="badge atk' + (atk > d.atk ? ' up' : atk < d.atk ? ' down' : '') + '">' + atk + '</span>' +
        '<span class="bar"><i class="' + (pct <= 25 ? 'crit' : pct <= 50 ? 'low' : '') + '" style="width:' + pct + '%"></i></span>' +
        '<span class="badge hp' + (u.hp < u.maxHp ? ' hurt' : '') + '">' + u.hp + '</span></span>';
      label = (u.owner === HUMAN ? 'Your ' : 'Enemy ') + d.name + ', attack ' + E.attackOf(S, u) + ', health ' + u.hp;
      attrs += ' data-peek="' + d.id + '" data-note="' + (u.owner === HUMAN ? 'Your unit' : 'Enemy unit') + ', now ' + E.attackOf(S, u) + ' / ' + u.hp + '"';
    } else label = 'Empty tile, row ' + (r + 1) + ', column ' + (c + 1);
    if (fxText) label += ', ' + fxText.toLowerCase();
    return '<button type="button" class="' + cls.join(' ') + '" ' + attrs + ' aria-label="' + label + '">' + inner + '</button>';
  }

  function computeMarks(moves) {
    var marks = { tiles: {}, units: {}, summoner: false, threat: false };
    // While you decide on a response, the two units in the fight stay marked on the map.
    if (S.pending && S.pending.attack && actor() === HUMAN) {
      var fight = S.pending.attack;
      marks.units[fight.attacker] = 't-threat';
      if (fight.summoner !== undefined) marks.threat = true;
      else marks.units[fight.targetUid] = 't-threat';
    }
    var stage = pickStage(selectedMoves(moves));
    if (stage) {
      Object.keys(stage.open).forEach(function (k) { marks.tiles[k] = 't-summon'; });
      return marks;
    }
    selectedMoves(moves).forEach(function (m) {
      // A summon that hits an enemy takes a tile first, then a target.
      if (m.type === 'summon' && m.target !== undefined && sel.summonAt) {
        marks.tiles[sel.summonAt.r + ',' + sel.summonAt.c] = 't-summon';
        if (m.r === sel.summonAt.r && m.c === sel.summonAt.c) marks.units[m.target] = 't-attack';
      }
      else if (m.type === 'summon') marks.tiles[m.r + ',' + m.c] = 't-summon';
      else if (m.type === 'move' && !sel.ability) marks.tiles[m.r + ',' + m.c] = 't-move';
      else if (m.type === 'attack') marks.units[m.target] = 't-attack';
      else if (m.type === 'attackSummoner') marks.summoner = true;
      else if (m.type === 'cast' && m.r !== undefined && !m.target) marks.tiles[m.r + ',' + m.c] = 't-aim';
      else if (m.type === 'ability' && sel.ability && m.r !== undefined) marks.tiles[m.r + ',' + m.c] = 't-aim';
      else if (m.type === 'cast' && m.r !== undefined) {
        if (!sel.castUnit) marks.units[m.target] = 't-buff';
        else if (m.target === sel.castUnit) marks.tiles[m.r + ',' + m.c] = 't-move';
      }
      else if (m.type === 'cast' && m.target) marks.units[m.target] = cardOf(sel.id).blast ? 't-attack' : 't-buff';
      else if (m.type === 'enchant') marks.units[m.target] = cardOf(sel.id).atkBonus > 0 || cardOf(sel.id).allyOnly ? 't-buff' : 't-attack';
      else if (m.type === 'ability' && sel.ability && m.target) {
        var ab = E.CARDS[unitById(sel.id).cardId].ability;
        marks.units[m.target] = ab.key === 'heal' || ab.key === 'orders' || ab.key === 'harvest' || ab.key === 'lens' || ab.key === 'tend' || ab.key === 'swap' ? 't-buff' : 't-attack';
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
    var type = '<span class="type">' + (c.equipment ? 'Equipment' : TYPES[c.type]) + (c.sub ? ', ' + c.sub : '') + ' · ' + ALIGNMENT[c.colour] + '</span>';
    // A unit's type line goes between its plaques, so the rules text gets that line back.
    var foot = c.type === 'unit' ? '<span class="foot"><span class="stat"><span>Attack</span><strong>' + c.atk + '</strong></span>' + type + '<span class="stat hp"><span>Health</span><strong>' + c.hp + '</strong></span></span>' : '';
    var fl = FLAVOUR[c.id];
    if (fl) body += '<span class="flavour">' + fl.line + (fl.credit ? '<span class="credit">' + fl.credit + '</span>' : '') + '</span>';
    return '<span class="frame ' + c.colour + (isLand ? ' land' : '') + (o.big ? ' big' : '') + '"><span class="inner">' + costHtml +
      '<span class="bar-top">' + c.name + '</span>' +
      '<span class="art">' + (noArt[c.id] ? '' : '<img src="' + artSrc(c.id) + '" alt="" decoding="sync" draggable="false">') + '</span>' +
      (foot ? '' : type) + '<span class="ctext">' + body + '</span>' + foot + '</span></span>';
  }

  function cardHtml(i, moves) {
    var c = E.CARDS[i.c], you = S.players[HUMAN];
    var have = you.lands.filter(function (l) { return l.colour === c.colour; }).length;
    var playable = S.phase === 'opening' || moves.some(function (m) { return m.card === i.id; });
    var ready = playable && S.phase === 'play' && !S.pending && actor() === HUMAN;
    var cls = 'card' + (sel && sel.kind === 'card' && sel.id === i.id ? ' selected' : '') + (playable ? '' : ' dim') + (ready ? ' ready' : '');
    return '<button type="button" class="' + cls + '" data-card="' + i.id + '" data-peek="' + c.id + '" data-note="In your hand"><span class="cslot">' +
      frameHtml(c, { cost: E.costOf(S, HUMAN, c), have: have }) + '</span></button>';
  }

  // Small cards have little room, so a line that doesn't fit is left for the close-up. Rules text that still doesn't fit gets smaller,
  // then the name, then the rules text once more. The art is never cropped.
  function fitCards(host) {
    Array.prototype.forEach.call(host.querySelectorAll('.ctext'), function (t) {
      var over = function () { return t.scrollHeight > t.clientHeight; }, f = t.querySelector('.flavour');
      if (f && over()) t.removeChild(f);
      if (over()) t.classList.add('tight');
      if (over()) t.parentNode.querySelector('.bar-top').classList.add('long');
      if (over()) t.classList.add('tighter');
    });
  }

  // The large card. It only redraws when the card changes, so bot turns don't reset it.
  function showCard(id, note) {
    if (peek && peek.id === id && peek.note === (note || '')) return;
    peek = { id: id, note: note || '' };
    $('inspect').innerHTML = '<div class="slot">' + frameHtml(E.CARDS[id], { big: true }) + '</div><p class="note">' + peek.note + '</p>';
    $('peekBtn').setAttribute('aria-label', 'View card: ' + E.CARDS[id].name);
  }
  function revealPeek(ms) {
    clearTimeout(peekTimer);
    $('inspect').classList.add('show');
    if (ms) peekTimer = setTimeout(hidePeek, ms);
  }
  function hidePeek() { $('inspect').classList.remove('show'); }
  function peekFrom(e) {
    var t = e.target.closest('[data-peek]');
    if (!t) return;
    // A hand card zooms itself on hover, so it only needs the close-up when that has its own column.
    if (t.closest('.card') && !DOCKED.matches) { hidePeek(); return; }
    var box = t.getBoundingClientRect();
    $('inspect').classList.toggle('left', box.left + box.width / 2 > window.innerWidth * 0.55);
    showCard(t.dataset.peek, t.dataset.note || E.CARDS[t.dataset.peek].name + ' in play');
    revealPeek();
  }
  function peekAway(e) {
    if (!e.target.closest('[data-peek]')) return;
    clearTimeout(peekTimer);
    peekTimer = setTimeout(hidePeek, 120);
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

  // The latest log line stays beside the prompt, so you can follow the game with the log closed.
  function promptHtml(text) {
    var last = S.log[S.log.length - 1];
    return '<span class="prompt"><span class="ask">' + text + '</span>' + (last ? '<span class="ticker">' + esc(last.text) + '</span>' : '') + '</span>';
  }

  function phaseHtml() {
    if (S.winner !== null) return '<span class="turn">Game over</span>';
    if (S.phase === 'opening') return '<span class="turn">Opening hands</span>';
    var step = function (name, label) { return '<span class="step' + (S.phase === name ? ' on' : '') + '">' + label + '</span>'; };
    return '<span class="turn"><small>Turn ' + S.turn + '</small>' + (sandbox ? (S.active === 0 ? 'Bottom' : 'Top') + "'s turn" : S.active === HUMAN ? 'Your turn' : 'Enemy turn') + '</span>' +
      '<span class="steps">' + step('play', 'Play') + step('command', 'Command') + '</span>';
  }

  function resultHtml() {
    if (S.winner === null) return '';
    var txt = S.winner === 'draw' ? 'A draw' : S.winner === HUMAN ? 'You win' : 'You lose';
    var ended = Campaign.ended(), next = !chapterBattle ? '' : S.winner === 'draw' ? 'Fight it again' : S.winner !== HUMAN ? 'Continue' : ended ? 'Continue' : 'Choose a card';
    var note = chapterBattle && S.winner === 'draw' ? ' Nobody holds the field, so this battle is fought again.' : chapterBattle && S.winner !== HUMAN ? ' Your run ends here.' : '';
    return '<div class="plaque"><h2>' + txt + '</h2><p>' + S.players[HUMAN].life + ' to ' + S.players[BOT].life + ' after ' + S.turn + ' turns.' + note + '</p><span class="btns">' +
      (chapterBattle ? btn(next, { ui: 'campaign' }, true) : btn('Play again', { ui: 'new' }, true) + btn('Change decks', { ui: 'decks' })) + '</span></div>';
  }

  function announceTurn() {
    var key = S.winner === null && S.phase !== 'opening' ? S.active + ':' + S.turn : null;
    if (key && key !== lastTurn) {
      $('turnBanner').className = S.active === HUMAN ? '' : 'enemy';
      $('turnBanner').innerHTML = '<span>' + (sandbox ? (S.active === 0 ? 'Bottom' : 'Top') + "'s turn" : S.active === HUMAN ? 'Your turn' : 'Enemy turn') + '</span>';
    }
    lastTurn = key;
  }

  function actionsHtml(moves) {
    var you = S.players[HUMAN];
    if (S.winner !== null) return promptHtml('The battle is over.');
    if (actor() !== HUMAN) {
      if (thinking) return promptHtml('Claude is thinking.') + '<span class="btns">' + btn('Stop waiting', { ui: 'stopModel' }) + '</span>';
      return promptHtml(S.pending ? 'The opponent is deciding on a response.' : S.phase === 'opening' ? 'The opponent is choosing their opening hand.' : 'The opponent is taking their turn.');
    }
    if (you.toBottom) return promptHtml('Click ' + (you.toBottom > 1 ? you.toBottom + ' cards' : 'a card') + ' to put on the bottom of your deck.');
    if (S.phase === 'opening') {
      var redraw = moves.some(function (m) { return m.type === 'redraw'; });
      var costNote = you.redraws ? ' Keeping this hand means putting ' + (you.redraws > 1 ? you.redraws + ' cards' : '1 card') + ' on the bottom of your deck.' : '';
      return promptHtml((redraw ? 'Keep this hand, or shuffle it back and draw a new one? Each redraw leaves you one card fewer.' : 'This is your last redraw.') + costNote) + '<span class="btns">' +
        (redraw ? btn('Redraw', { move: { type: 'redraw' } }) : '') + btn('Keep hand', { move: { type: 'keepHand' } }, true) + '</span>';
    }
    if (S.pending) {
      var att = S.pending.attack, text;
      if (att) {
        var a = unitById(att.attacker);
        var target = att.summoner !== undefined ? 'you' : E.CARDS[unitById(att.targetUid).cardId].name;
        text = E.CARDS[a.cardId].name + ' is attacking ' + target + ' for ' + (att.summoner !== undefined ? E.attackOf(S, a) : E.hitOn(S, a, unitById(att.targetUid))) + '. Respond?';
      } else text = 'The enemy turn is ending. Use an instant?';
      var opts = moves.filter(function (m) { return m.type === 'respond'; }).map(function (m) { return btn(moveLabel(m), { move: m }); }).join('');
      return promptHtml(text) + '<span class="btns">' + opts + btn('Pass', { move: { type: 'pass' } }, true) + '</span>';
    }
    var out = [], sm = selectedMoves(moves);
    if (S.phase === 'play') {
      var hint = 'Pick a card from your hand, then move on to your units.';
      if (sel && sel.kind === 'card') {
        var c = cardOf(sel.id), place = sm.some(function (m) { return m.type === 'summon'; }), ench = sm.some(function (m) { return m.type === 'enchant'; });
        if (c.type === 'instant') hint = 'Instants are cast during the enemy turn.';
        else if (pickStage(sm)) hint = 'Choose a back-row tile for each unit it summons.';
        else if (place) hint = sel.summonAt ? 'Choose an enemy unit for it to hit.' : 'Choose a highlighted tile' + (sm.some(function (m) { return m.type === 'summon' && m.r !== E.backRow(HUMAN); }) ? ': your back row, or beside or behind one of your units.' : ' in your back row.');
        else if (ench) hint = 'Choose a unit to enchant.';
        else if (c.type !== 'land' && E.costOf(S, HUMAN, c) > you.mana) hint = 'Not enough mana to play this now.';
        else if (c.type === 'spell') hint = !sm.length ? "You can't cast this right now." : c.raise ? 'Choose a unit to return.' : c.cleanse ? 'Choose a unit with enchantments.' : c.mend ? 'Choose one of your wounded units.' : c.blast ? 'Choose an enemy unit.' : c.aim ? 'Choose a tile to aim at.' : c.chant ? 'Choose one of your units.' : c.passage ? (sel.castUnit ? 'Choose a free tile.' : 'Choose one of your units to move.') : 'Cast this spell.';
        else if (c.type === 'unit') hint = 'Your back row is full, so there is nowhere to summon this.';
        else if (c.type === 'enchant') hint = 'There is no unit this can enchant right now.';
        else hint = sm.length ? 'Play this land.' : 'You already played a land this turn.';
        sm.forEach(function (m) {
          if (m.type === 'playLand') out.push(btn('Play land', { move: m }, true));
          if (m.type === 'cast' && !m.target && m.r === undefined && !(m.at && m.at.length)) {
            var back = you.discard.filter(function (d) { return d.id === m.raise; })[0];
            out.push(btn(back ? 'Return ' + E.CARDS[back.c].name : 'Cast', { move: m }, true));
          }
        });
        out.push(btn('Cancel', { ui: 'clear' }));
      }
      var canCommand = E.legalMoves(E.applyMove(S, { type: 'toCommand' })).length > 1;
      out.push(canCommand ? btn('Command units', { move: { type: 'toCommand' } }, !sel) : btn('End turn', { ui: 'skip' }, !sel));
      return promptHtml(hint) + '<span class="btns">' + out.join('') + '</span>';
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
        if (abMoves.length && abMoves[0].raise) {
          // One button for each different unit Exhume could return.
          var offered = {};
          abMoves.forEach(function (m) {
            var back = S.players[HUMAN].discard.filter(function (d) { return d.id === m.raise; })[0];
            if (offered[back.c]) return;
            offered[back.c] = true;
            out.push(btn('Return ' + E.CARDS[back.c].name, { move: m }));
          });
        } else if (abMoves.length) {
          out.push(abMoves[0].target || abMoves[0].r !== undefined ? btn(ab.label, { ui: 'ability' }) : btn(ab.label, { move: abMoves[0] }));
        }
      }
    }
    out.push(btn('End turn', { move: { type: 'endTurn' } }, !sel));
    return promptHtml(cmdHint) + '<span class="btns">' + out.join('') + '</span>';
  }

  function floats() {
    (S.fx || []).forEach(function (f) {
      var host = f.summoner !== undefined ? $('summoner' + f.summoner) : document.querySelector('.tile[data-r="' + f.r + '"][data-c="' + f.c + '"]');
      if (!host) return;
      var s = document.createElement('span');
      s.className = 'float' + (f.good ? ' good' : '');
      s.textContent = f.text;
      host.appendChild(s);
      if (!f.good) host.classList.add('hit');
    });
  }

  function render() {
    if (sandbox) {
      S.players.forEach(function (p) { p.mana = TEST_MANA; });
      if (S.winner === null) { HUMAN = actor(); BOT = 1 - HUMAN; }
    }
    var moves = humanMoves(), marks = computeMarks(moves);
    $('app').classList.toggle('opening', S.phase === 'opening' && S.winner === null);
    $('cmd').classList.toggle('enemy', S.winner === null && S.phase !== 'opening' && actor() === BOT);
    $('phases').innerHTML = phaseHtml();
    $('themStrip').innerHTML = plateHtml(BOT, marks.summoner, false);
    $('youStrip').innerHTML = plateHtml(HUMAN, false, marks.threat);
    var g = '<div class="front" aria-hidden="true"></div>';
    for (var r = 0; r < E.ROWS; r++) for (var c = 0; c < E.COLS; c++) g += tileHtml(r, c, marks);
    $('grid').innerHTML = g;
    $('actions').innerHTML = actionsHtml(moves);
    $('hand').innerHTML = S.players[HUMAN].hand.map(function (i) { return cardHtml(i, moves); }).join('') || '<span class="empty">Your hand is empty.</span>';
    fitCards($('hand'));
    $('result').innerHTML = resultHtml();
    announceTurn();
    var log = $('log'), recent = S.log.slice(-40);
    log.innerHTML = recent.map(function (l) { return '<div>T' + l.turn + ': ' + esc(l.text) + '</div>'; }).join('');
    log.scrollTop = log.scrollHeight;
    floats();
  }

  // Which other tiles a spell aimed at (r, c) reaches, as the engine's castAt resolves it.
  var STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function reachOf(card, pi, r, c) {
    var a = card.aim, out = [];
    if (a.wave) {
      for (var wr = r + (pi === 0 ? -1 : 1); wr >= 0 && wr < E.ROWS; wr += pi === 0 ? -1 : 1) out.push([wr, c]);
      return out;
    }
    if (!a.spread && !a.splash) return out;
    STEPS.forEach(function (d) {
      var rr = r + d[0], cc = c + d[1];
      if (rr < 0 || cc < 0 || rr >= E.ROWS || cc >= E.COLS) return;
      var u = S.units.filter(function (x) { return x.r === rr && x.c === cc; })[0];
      if (a.spread || (u && (a.splashAll || u.owner !== pi))) out.push([rr, cc]);
    });
    return out;
  }
  function tileEl(r, c) { return document.querySelector('#grid .tile[data-r="' + r + '"][data-c="' + c + '"]'); }

  // A spell aimed at a tile plays its animation first, then the move resolves and the board redraws.
  var casting = false;
  function apply(m) {
    if (casting) return;
    var who = actor(), inHand = m.type === 'cast' && m.r !== undefined && S.players[who].hand.filter(function (i) { return i.id === m.card; })[0];
    var spell = inHand && E.CARDS[inHand.c];
    if (spell && spell.aim && spell.aim.tile && SpellFX.enabled()) {
      var from = who === HUMAN ? document.querySelector('#hand .card[data-card="' + m.card + '"]') : $('themStrip');
      var reach = reachOf(spell, who, m.r, m.c);
      if (who === BOT) announce(m);
      var before = S;
      casting = true;
      sel = null;
      SpellFX.unaim(true);
      showReach();
      if (from && from.classList.contains('card')) from.classList.add('casting');
      SpellFX.cast({
        kind: spell.aim.tile, from: from || $('themStrip'), target: tileEl(m.r, m.c), wave: !!spell.aim.wave, shake: document.querySelector('.board'),
        reach: reach.map(function (p) { return tileEl(p[0], p[1]); }),
        onLaunch: function () { if (from) { from.classList.remove('casting'); from.classList.add('spent'); } }
      }).then(function () {
        casting = false;
        // A new game started while the spell was in the air: drop this move.
        if (S !== before) return;
        resolve(m);
        [[m.r, m.c]].concat(reach).forEach(function (p) { var t = tileEl(p[0], p[1]); if (t && t.classList.contains('fx')) t.classList.add('bloom'); });
      });
      return;
    }
    if (who === BOT) announce(m);
    resolve(m);
  }
  function announce(m) {
    if (m.card && actor() === BOT && m.type !== 'playLand' && m.type !== 'bottomCard') {
      var played = S.players[BOT].hand.filter(function (i) { return i.id === m.card; })[0];
      if (played) {
        $('inspect').classList.remove('left');
        showCard(played.c, 'The enemy played this');
        revealPeek(2200);
      }
    }
  }
  function resolve(m) {
    if (m.type === 'summon' || m.type === 'move' || m.r !== undefined) flash = [m.r, m.c]; else flash = null;
    S = E.applyMove(S, m);
    if (chapterBattle) {
      if (S.winner !== null) Campaign.finish(S.winner);
      else Campaign.saveBattle(S);
    }
    if (m.type === 'move' && S.units.some(function (u) { return u.uid === m.unit; }) && E.legalMoves(S).some(function (x) { return x.unit === m.unit; })) sel = { kind: 'unit', id: m.unit };
    else sel = null;
    render();
    schedule();
  }

  function schedule() {
    if (sandbox || S.winner !== null || actor() !== BOT) return;
    var token = ++runToken;
    if (modelOn()) modelStep(token);
    else playNext(token, botMove);
  }

  function botMove() { return Bot.choose(E.viewFor(S, BOT), Math.random); }
  function planMove() {
    var dropped = [], view = E.viewFor(S, BOT), m = AI.nextMove(S, plan.queue, dropped);
    dropped.forEach(function (d) { Debug.note('Dropped a planned move that is no longer legal: ' + AI.describe(view, d)); });
    return m;
  }
  function playNext(token, pick) {
    setTimeout(function () {
      if (token !== runToken || S.winner !== null || actor() !== BOT) return;
      apply(pick());
    }, BOT_DELAY);
  }

  function modelOn() { return oppPlayer !== 'bot' && !!sample && !modelOff; }

  // The model makes one call for each of its turns, then the plan plays out a move at a time.
  // Opening hands and responses are one call each. Any failure hands that decision to the scripted bot, so a game never stalls.
  function modelStep(token) {
    var view = E.viewFor(S, BOT);
    if (S.phase === 'opening' || S.pending || S.players[BOT].toBottom) {
      if (E.legalMoves(view).length < 2) return playNext(token, botMove);
      return askModel(token, 'Decision', AI.decisionPrompt(view, oppPlayer, debugOn), AI.CALLS.decision, function (reply, entry) {
        var r = AI.readChoice(view, reply);
        if (r) {
          Debug.read(entry, r.say, r.why, [AI.describe(view, r.move)]);
          speak(r.say);
          apply(r.move);
        }
        return r;
      });
    }
    if (plan && plan.turn === S.turn) return playNext(token, plan.scripted ? botMove : planMove);
    if (!AI.hasChoice(view)) {
      plan = { turn: S.turn, queue: [] };
      return playNext(token, planMove);
    }
    askModel(token, 'Turn plan', AI.turnPrompt(view, oppPlayer, debugOn), AI.CALLS.turn, function (reply, entry) {
      var r = AI.readPlan(view, reply);
      if (r) {
        Debug.read(entry, r.say, r.why, r.queue.map(function (m) { return AI.describe(view, m); }));
        plan = { turn: S.turn, queue: r.queue };
        speak(r.say);
        schedule();
      }
      return r;
    });
  }

  function askModel(token, kind, prompt, call, use) {
    var began = Date.now(), entry = Debug.begin(S.turn, kind, prompt, call);
    thinking = new AbortController();
    $('actions').innerHTML = actionsHtml([]);
    AI.ask(sample, prompt, call, thinking.signal).then(function (answer) {
      if (token !== runToken) return;
      thinking = null;
      lastThought = Math.round((Date.now() - began) / 1000);
      Debug.answer(entry, answer);
      if (!use(answer.reply, entry)) { Debug.fail(entry, 'unusable'); modelFailed(token, 'unusable'); }
    }, function (e) {
      if (token !== runToken) return;
      thinking = null;
      Debug.fail(entry, e && e.code);
      modelFailed(token, e && e.code);
    });
  }

  function modelFailed(token, code) {
    if (AI.FATAL[code]) {
      modelOff = true;
      addChat(code === 'rate_limited' ? 'Claude has reached a usage limit, so the scripted bot finishes this game.' : "Claude isn't available here, so the scripted bot finishes this game.", true);
    } else addChat(code === 'cancelled' ? 'You stopped waiting, so the scripted bot plays this decision.' : "Claude's answer wasn't usable, so the scripted bot plays this decision.", true);
    if (S.phase !== 'opening' && !S.pending) plan = { turn: S.turn, scripted: true };
    Debug.note('The scripted bot played this decision instead of Claude.');
    render();
    playNext(token, botMove);
  }

  // Model words go in as plain text, never as HTML.
  function speak(text) {
    if (!text) return;
    $('speech').textContent = text;
    $('speech').hidden = false;
    addChat(text);
  }
  function addChat(text, system) {
    var line = document.createElement('div');
    line.textContent = text;
    if (system) line.className = 'sys';
    else if (lastThought !== null) {
      var took = document.createElement('small');
      took.textContent = ' ' + lastThought + 's';
      line.appendChild(took);
    }
    $('chat').appendChild(line);
    $('chat').scrollTop = $('chat').scrollHeight;
    $('chatBox').hidden = false;
  }
  function stopThinking() {
    if (thinking) thinking.abort();
    thinking = null;
  }

  function clickTile(el) {
    var r = +el.dataset.r, c = +el.dataset.c, moves = humanMoves();
    var u = S.units.filter(function (x) { return x.r === r && x.c === c; })[0], sm = selectedMoves(moves);
    var stage = pickStage(sm);
    if (stage) {
      if (!stage.open[r + ',' + c]) { sel = null; return render(); }
      sel.picks = stage.picks.concat([[r, c]]);
      var done = stage.cands.filter(function (m) {
        return m.at.length === sel.picks.length && sel.picks.every(function (p) { return m.at.some(function (t) { return same(t, p); }); });
      })[0];
      return done ? apply(done) : render();
    }
    // A unit that brings others takes its own tile first.
    if (sel && sel.kind === 'card' && !sel.summonAt && sm.some(function (m) { return m.type === 'summon' && m.at && m.at.length && m.r === r && m.c === c; })) {
      sel.summonAt = { r: r, c: c }; sel.picks = [];
      return render();
    }
    var hit = sm.filter(function (m) {
      if (m.type === 'summon' && m.target !== undefined) return !!sel.summonAt && !!u && m.target === u.uid && m.r === sel.summonAt.r && m.c === sel.summonAt.c;
      if (m.type === 'summon' || (m.type === 'move' && !sel.ability)) return m.r === r && m.c === c;
      if (m.type === 'ability' && m.r !== undefined) return !!sel.ability && m.r === r && m.c === c;
      if (m.type === 'cast' && m.r !== undefined) return m.target === sel.castUnit && m.r === r && m.c === c;
      if (!u || m.target !== u.uid) return false;
      if (m.type === 'enchant' || m.type === 'attack' || m.type === 'cast') return true;
      return m.type === 'ability' && sel.ability;
    });
    if (sel && sel.ability) hit = hit.filter(function (m) { return m.type === 'ability'; });
    if (hit.length) return apply(hit[0]);
    if (!u && sel && sel.kind === 'card' && sm.some(function (m) { return m.type === 'summon' && m.target !== undefined && m.r === r && m.c === c; })) { sel.summonAt = { r: r, c: c }; return render(); }
    if (u && sel && sel.kind === 'card' && sm.some(function (m) { return m.r !== undefined && m.type === 'cast' && m.target === u.uid; })) { sel.castUnit = u.uid; return render(); }
    if (u && u.owner === HUMAN && !S.pending && S.active === HUMAN && S.phase === 'command') { sel = { kind: 'unit', id: u.uid }; return render(); }
    if (sel) { sel = null; render(); }
  }

  // Aiming at a tile draws an arrow from the card, or from the unit using its ability, to the tile under the pointer,
  // and marks the other tiles the spell would reach from there.
  function aimFrom() {
    if (!sel) return null;
    if (sel.kind === 'card' && cardOf(sel.id).aim) return document.querySelector('#hand .card[data-card="' + sel.id + '"]');
    var u = sel.kind === 'unit' && sel.ability ? unitById(sel.id) : null;
    return u ? document.querySelector('.tile[data-r="' + u.r + '"][data-c="' + u.c + '"]') : null;
  }
  function showReach(r, c) {
    Array.prototype.forEach.call(document.querySelectorAll('#grid .t-reach'), function (t) { t.classList.remove('t-reach'); });
    var card = sel && sel.kind === 'card' ? cardOf(sel.id) : null;
    if (r === undefined || !card || !card.aim) return;
    reachOf(card, HUMAN, r, c).forEach(function (p) { var t = tileEl(p[0], p[1]); if (t) t.classList.add('t-reach'); });
  }
  $('grid').addEventListener('mouseover', function (e) {
    if (casting) return;
    var t = e.target.closest('.tile'), from = t && t.classList.contains('t-aim') ? aimFrom() : null;
    if (!from) { SpellFX.unaim(); showReach(); return; }
    SpellFX.aim(from, t);
    showReach(+t.dataset.r, +t.dataset.c);
  });
  $('grid').addEventListener('mouseleave', function () { SpellFX.unaim(); showReach(); });

  $('grid').addEventListener('click', function (e) {
    var t = e.target.closest('.tile');
    if (casting) return;
    SpellFX.unaim(true);
    if (t) clickTile(t);
  });
  $('hand').addEventListener('click', function (e) {
    var t = e.target.closest('.card');
    if (!t || casting || S.winner !== null || actor() !== HUMAN || S.pending) return;
    var id = +t.dataset.card;
    if (S.phase === 'opening' || S.players[HUMAN].toBottom) {
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
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-do]');
    if (!b) return;
    var d = JSON.parse(b.getAttribute('data-do'));
    if ($('menu').open) $('menu').close();
    if (d.move) return apply(d.move);
    if (d.ui === 'new') return sandbox ? startSandbox() : start();
    if (d.ui === 'decks') return showStart();
    if (d.ui === 'menu') return toMenu();
    if (d.ui === 'campaign') return toCampaign();
    if (d.ui === 'stopModel') { if (thinking) thinking.abort(); return; }
    if (d.ui === 'clear') sel = null;
    if (d.ui === 'ability') sel.ability = true;
    if (d.ui === 'noAbility') sel.ability = false;
    if (d.ui === 'skip') { S = E.applyMove(S, { type: 'toCommand' }); sel = null; return apply({ type: 'endTurn' }); }
    render();
  });
  ['mouseover', 'focusin', 'click'].forEach(function (type) { $('app').addEventListener(type, peekFrom); });
  ['mouseout', 'focusout'].forEach(function (type) { $('app').addEventListener(type, peekAway); });
  // One drawer at a time. Clicking the open drawer's button closes it.
  function setDrawer(id) {
    document.querySelectorAll('[data-panel]').forEach(function (b) {
      var on = b.dataset.panel === id;
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
      $(b.dataset.panel).classList.toggle('open', on);
    });
  }
  document.querySelector('.tools').addEventListener('click', function (e) {
    var b = e.target.closest('[data-panel]');
    if (b) setDrawer(b.getAttribute('aria-expanded') === 'true' ? null : b.dataset.panel);
  });
  $('menuBtn').addEventListener('click', function () {
    $('menuNote').textContent = chapterBattle ? 'Your run is saved after every move, so this battle waits on the map.' : 'If you leave, this battle waits until you begin another.';
    $('menuRestart').hidden = $('menuDecks').hidden = chapterBattle;
    $('menuMap').hidden = !chapterBattle;
    $('menu').showModal();
  });
  $('menu').addEventListener('click', function (e) { if (e.target.closest('[data-close]')) $('menu').close(); });
  $('peekBtn').addEventListener('click', function () { $('inspect').classList.add('open'); $('inspect').focus(); });
  $('inspect').addEventListener('click', closePeek);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePeek(); setDrawer(null); } });

  function deckHtml(d, role) {
    var problems = E.deckProblems(d.list), colours = d.starter ? E.DECKS[d.id].colours : E.deckColours(d.list), main = colours[0] || 'N', on = picks[role] === d.id;
    var art = d.starter ? (noArt[DECK_ART[d.id]] ? null : artSrc(DECK_ART[d.id])) : Screens.coverArt(d.list);
    return '<button type="button" class="deck ' + main + '" data-role="' + role + '" data-deck="' + esc(d.id) + '" aria-pressed="' + on + '"' + (problems.length ? ' disabled' : '') + '>' +
      '<span class="pic">' + (art ? '<img src="' + art + '" alt="" draggable="false">' : '') + '</span>' +
      '<span class="nm">' + esc(d.name) + '</span>' +
      '<span class="ty">' + colours.map(sym).join('') + ALIGNMENT[main] + ' · ' + E.deckSize(d.list) + ' cards</span>' +
      '<span class="ds">' + (problems.length ? esc(problems[0]) : d.starter ? DECK_NOTES[d.id] : 'One of your decks.') + '</span></button>';
  }
  function playable(d) { return !E.deckProblems(d.list).length; }
  function playerHtml(key, label, blurb, enabled) {
    return '<button type="button" class="who-plays" data-player="' + key + '" aria-pressed="' + (oppPlayer === key) + '"' + (enabled ? '' : ' disabled') + '><b>' + label + '</b><span>' + blurb + '</span></button>';
  }
  function renderStart() {
    var all = Decks.saved().concat(Decks.starters());
    $('myDecks').innerHTML = all.map(function (d) { return deckHtml(d, 'mine'); }).join('');
    $('oppDecks').innerHTML = all.filter(playable).map(function (d) { return deckHtml(d, 'opp'); }).join('');
    $('oppPlayer').innerHTML = playerHtml('bot', 'Scripted bot', 'Plays instantly, with fixed habits.', true) +
      ['easy', 'normal', 'hard'].map(function (k) { return playerHtml(k, 'Claude: ' + AI.levels[k].label, AI.levels[k].blurb, !!sample); }).join('');
    $('playerNote').textContent = sample ? 'Claude opponents use your own Claude usage, about a dozen requests a game, and take a little while to think.' : 'Claude opponents work only on the published page inside Claude.';
  }
  // The start screen is the exhibition setup. A battle in progress waits here until a new one begins.
  function showStart(mine) {
    runToken++;
    stopThinking();
    if (chapterBattle) oppPlayer = exhibitionPlayer;
    var last = Decks.picks(), ready = function (id) { var d = id && Decks.find(id); return d && playable(d) ? id : null; };
    var newest = Decks.saved().filter(playable)[0];
    picks = { mine: ready(mine) || ready(last.mine) || (newest ? newest.id : 'white'), opp: ready(last.opp) || 'red' };
    Screens.hide();
    $('app').hidden = true;
    $('start').hidden = false;
    renderStart();
    $('begin').focus();
  }
  function toMenu() {
    runToken++;
    stopThinking();
    $('app').hidden = true;
    $('start').hidden = true;
    Screens.menu();
  }
  function toCampaign() {
    runToken++;
    stopThinking();
    $('app').hidden = true;
    $('start').hidden = true;
    Screens.campaign();
  }
  // Fights the run's current chapter, picking up a saved battle if there is one.
  function playChapter() {
    var run = Campaign.current();
    if (!chapterBattle) exhibitionPlayer = oppPlayer;
    chapterBattle = true;
    sandbox = false;
    oppPlayer = run.player;
    decks = Campaign.decks(run);
    Screens.hide();
    start(run.battle || undefined);
    if (!run.battle) Campaign.saveBattle(S);
  }
  function forGame(id) {
    var d = Decks.find(id);
    return d.starter ? id : { name: d.name, list: d.list };
  }
  $('start').addEventListener('click', function (e) {
    var b = e.target.closest('[data-deck]');
    if (b) { picks[b.dataset.role] = b.dataset.deck; return renderStart(); }
    var who = e.target.closest('[data-player]');
    if (who) { oppPlayer = who.dataset.player; return renderStart(); }
    if (e.target.id === 'debugToggle') { debugOn = e.target.checked; return; }
    if (e.target.closest('#begin')) {
      Decks.setPicks(picks);
      chapterBattle = false;
      sandbox = false;
      decks = [forGame(picks.mine), forGame(picks.opp)];
      start();
    }
    if (e.target.closest('#startBack')) toMenu();
    if (e.target.closest('#startBuilder')) { $('start').hidden = true; Screens.builder(); }
  });

  function start(state) {
    runToken++;
    stopThinking();
    plan = null; modelOff = false; lastThought = null;
    $('chat').textContent = '';
    $('chatBox').hidden = true;
    $('speech').hidden = true;
    Debug.reset();
    sel = null; flash = null;
    HUMAN = 0; BOT = 1;
    $('testBtn').hidden = !sandbox;
    setDrawer(null);
    $('start').hidden = true;
    $('app').hidden = false;
    lastTurn = null;
    $('turnBanner').innerHTML = '';
    $('debugBtn').hidden = !(debugOn && modelOn());
    S = state || E.newGame({ seed: Math.floor(Math.random() * 2147483647), decks: decks || [forGame(picks.mine), forGame(picks.opp)], first: Math.random() < 0.5 ? 0 : 1 });
    var opening = S.players[HUMAN].hand[0];
    if (opening) showCard(opening.c, 'In your hand');
    render();
    schedule();
  }

  // The test table starts from the last exhibition decks with both opening hands kept, then opens the card picker.
  function startSandbox() {
    var last = Decks.picks(), ok = function (id) { var d = id && Decks.find(id); return d && playable(d) ? id : null; };
    sandbox = true;
    chapterBattle = false;
    decks = [forGame(ok(last.mine) || 'white'), forGame(ok(last.opp) || 'red')];
    start(E.newGame({ seed: Math.floor(Math.random() * 2147483647), decks: decks, first: 0 }));
    while (S.phase === 'opening' && S.winner === null) S = E.applyMove(S, { type: 'keepHand' });
    hidePeek();
    render();
    renderPicker();
    setDrawer('testPanel');
  }
  function testNote(text) {
    S.log.push({ turn: S.turn, text: 'Test table: ' + text });
    $('testMsg').textContent = text.charAt(0).toUpperCase() + text.slice(1);
  }
  function renderPicker() {
    var q = $('testSearch').value.trim().toLowerCase(), ORDER = 'WURBGN';
    $('testSides').innerHTML = [0, 1].map(function (pi) {
      return '<button type="button" class="step' + (testSide === pi ? ' on' : '') + '" data-side="' + pi + '" aria-pressed="' + (testSide === pi) + '">' +
        (pi === 0 ? 'You (bottom)' : 'Opponent (top)') + '</button>';
    }).join('');
    var ids = Object.keys(E.CARDS).filter(function (id) {
      var c = E.CARDS[id];
      return !c.token && (!q || (c.name + ' ' + (c.text || '') + ' ' + (TYPES[c.type] || c.type) + ' ' + (ALIGNMENT[c.colour] || '') + ' ' + (c.keywords || []).join(' ')).toLowerCase().indexOf(q) >= 0);
    }).sort(function (a, b) {
      var x = E.CARDS[a], y = E.CARDS[b];
      return ORDER.indexOf(x.colour) - ORDER.indexOf(y.colour) || x.cost - y.cost || x.name.localeCompare(y.name);
    });
    $('testCards').innerHTML = ids.map(function (id) {
      return '<button type="button" class="card" data-add="' + id + '" data-peek="' + id + '" data-note="Click to add to a hand" aria-label="Add ' + esc(E.CARDS[id].name) + '">' + frameHtml(E.CARDS[id]) + '</button>';
    }).join('') || '<p class="tnote">No cards match.</p>';
    fitCards($('testCards'));
  }
  // Fills up to three empty tiles on the enemy half with random units, ready to act.
  function populate() {
    var pool = Object.keys(E.CARDS).filter(function (id) { return E.CARDS[id].type === 'unit' && !E.CARDS[id].token; }), open = [], names = [];
    for (var r = 0; r < E.ROWS / 2; r++) for (var c = 0; c < E.COLS; c++) if (!S.units.some(function (u) { return u.r === r && u.c === c; })) open.push([r, c]);
    open.sort(function () { return Math.random() - 0.5; }).slice(0, 3).forEach(function (t) {
      var id = pool[Math.floor(Math.random() * pool.length)];
      E.placeUnit(S, 1, id, t[0], t[1]);
      names.push(E.CARDS[id].name);
    });
    testNote(names.length ? 'placed ' + names.join(', ') + ' for the opponent.' : 'the enemy half is full.');
  }
  $('testPanel').addEventListener('click', function (e) {
    var b = e.target.closest('[data-add], [data-side], [data-test]');
    if (!b || !S) return;
    if (b.dataset.side) { testSide = +b.dataset.side; return renderPicker(); }
    if (b.dataset.add) {
      S.players[testSide].hand.push({ id: S.nextId++, c: b.dataset.add });
      testNote('added ' + E.CARDS[b.dataset.add].name + ' to ' + (testSide === 0 ? 'your' : "the opponent's") + ' hand.');
    }
    if (b.dataset.test === 'populate') populate();
    if (b.dataset.test === 'clear') { S.units = []; S.tiles = {}; sel = null; testNote('cleared the board.'); }
    if (b.dataset.test === 'life') { S.players.forEach(function (p) { p.life = E.START_LIFE; }); testNote('both sides are back to ' + E.START_LIFE + ' life.'); }
    render();
  });
  $('testSearch').addEventListener('input', renderPicker);

  function boot(data) {
    var run = Campaign.current();
    if (data && data.chapter) { if (run && run.battle) playChapter(); else Screens.menu(); }
    else if (data && data.state && data.state.players.every(function (p) { return p.life <= E.START_LIFE; })) { sandbox = !!data.sandbox; start(data.state); if (sandbox) renderPicker(); }
    else Screens.menu();
  }
  window.GameUI = {
    frameHtml: frameHtml, fitCards: fitCards, ALIGNMENT: ALIGNMENT, TYPES: TYPES,
    artUrl: function (id) { return ART[id] && !noArt[id] ? artSrc(id) : null; },
    showStart: showStart, playChapter: playChapter, sandbox: startSandbox,
    modelReady: function () { return !!sample; },
    inProgress: function () { return !!S && S.winner === null && !chapterBattle; },
    resume: function () { $('app').hidden = false; render(); schedule(); }
  };
  if (window.claude && window.claude.hot) window.claude.hot.snapshot(function () { return { state: S, chapter: chapterBattle, sandbox: sandbox }; });
  if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(boot);
  else boot(window.claude && window.claude.hot && window.claude.hot.data || {});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (S) render(); });
  window.__game = { get state() { return S; }, load: start, setSample: function (fn) { sample = fn; refreshStart(); }, setPlayer: function (key) { oppPlayer = key; refreshStart(); }, setDebug: function (on) { debugOn = on; } };
})();
