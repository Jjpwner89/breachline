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
  var sandbox = false, testSide = 0, testKind = '', TEST_MANA = 99;
  // The test table's top side is played by you or by the scripted bot.
  var testBot = false;
  function bothHands() { return sandbox && !testBot; }
  // An online match from Net, or null. You play its seat, and the guest sees the board turned round so their side is at the bottom.
  var online = null;
  function turned() { return !!online && HUMAN === 1; }
  // The test table's card-type filter: label and which cards it keeps.
  var TEST_KINDS = [
    ['', 'All', function () { return true; }],
    ['unit', 'Units', function (c) { return c.type === 'unit'; }],
    ['spell', 'Spells', function (c) { return c.type === 'spell'; }],
    ['aimed', 'Aimed spells', function (c) { return !!c.aim; }],
    ['instant', 'Instants', function (c) { return c.type === 'instant'; }],
    ['enchant', 'Enchantments', function (c) { return c.type === 'enchant' && !c.equipment; }],
    ['equipment', 'Equipment', function (c) { return !!c.equipment; }],
    ['relic', 'Relics', function (c) { return c.type === 'relic'; }],
    ['land', 'Lands', function (c) { return c.type === 'land'; }]
  ];
  var $ = function (id) { return document.getElementById(id); };
  var COLOUR = { W: 'white', R: 'red', U: 'blue', B: 'black', G: 'green' };
  var ALIGNMENT = { W: 'Vigil', R: 'Fervor', U: 'Gnosis', B: 'Dominion', G: 'Genesis', N: 'Neutral' };
  // Each deck's one-line plan and each alignment's strengths are in help.js.
  var DECK_ART = { white: 'lancer', red: 'warchief', blue: 'conjurer', black: 'harvester', green: 'land_g' };
  // On wide screens the close-up has its own column, and elsewhere it floats over the map. Same query as the CSS.
  var DOCKED = window.matchMedia('(min-width: 1280px) and (min-aspect-ratio: 3/2)');
  var TYPES = { land: 'Land', unit: 'Unit', instant: 'Instant', enchant: 'Enchantment', spell: 'Spell', relic: 'Relic' };
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
    mourner: 'mothwake-mourner', rapier: 'cobalt-rapier', corewright: 'corewright',
    kindle: 'kindle-the-line', slagheart: 'slagheart-hulk', rimebolt: 'rimebolt', pilgrim: 'devoted-pilgrim', borrowedwill: 'borrowed-will', barrowmark: 'barrow-mark',
    marksman: 'focus-rifle-marksman', whitemorning: 'white-morning', hostess: 'hostess-of-the-late-hour', springmelt: 'spring-melt',
    firebrand: 'cinder-firebrand', rimecaller: 'conclave-rimecaller', vow: 'vow-of-keeping', ledger: 'ledger-of-debts', hurledbrand: 'hurled-brand', heldmoments: 'held-between-moments',
    shutterassassin: 'shutter-window-assassin', temptress: 'gilt-hall-temptress', alderelder: 'alderkin-elder', recruit: 'buckling-recruit', ashsweeper: 'still-flame-ash-sweeper', emberward: 'emberward',
    firecaller: 'untaught-firecaller', skyfalls: 'the-sky-falls-in', tithe: 'collect-the-tithe', harmonic: 'harmonic-burst', lineofdawn: 'line-of-dawn', penitent: 'hearth-sworn-penitent',
    fieldplate: 'field-plate-artificer', mortuary: 'mortuary-priest', lynx: 'halfshade-lynx', stag: 'elderwood-stag', rusthinged: 'rust-hinged-warden', salmantle: 'salamander-hide-mantle',
    pallofash: 'pall-of-ash', wildfire: 'wildfire', bought: 'bought-allegiance', leaden: 'leaden-step', vowkeeper: 'vowkeeper-of-the-long-road', glimmer: 'glimmer-double',
    gallows: 'lots-for-the-gallows', anoint: 'anoint-with-embers', earthspeaker: 'earthspeaker', tortoise: 'shell-mountain-tortoise', hound: 'copper-hound',
    chaplain: 'still-flame-chaplain', ribbonvane: 'white-flier', unwind: 'unwind-the-step', humbling: 'humbling-light', frostbreak: 'frostbreak', cinderrain: 'cinder-rain',
    overgrowth: 'overgrowth', trapper: 'thornwarden-trapper', mosshorn: 'mosshorn-grazer', waystone: 'waystone-golem', ossuary: 'ossuary-engine',
    debtblade: 'debt-collectors-blade', reedbank: 'reedbank-forager', siphon: 'siphon-vigor', scatter: 'scatter-the-line', hour: 'hour-of-collection',
    roadshield: 'roadwardens-shield', glaive: 'stormglass-glaive', sunthread: 'sunthread-mantle', roadsquire: 'oath-road-squire', standasone: 'stand-as-one', sanctuary: 'sanctuary-threshold',
    prism: 'prism-bracer', courier: 'conclave-courier', unmake: 'unmake-the-pattern', informant: 'court-informant', bailiff: 'ashen-court-bailiff', tender: 'barrow-tender',
    mourningveil: 'mourning-veil', cinderhook: 'cinderhook-axe', clanoutrider: 'clan-outrider', shatter: 'shatter-the-chain', pathguard: 'thornwarden-pathguard',
    canopy: 'sudden-canopy', returnloam: 'return-to-loam',
    oathbell: 'oath-bell', reliquary: 'pilgrim-reliquary', tideglass: 'tideglass-engine', observatory: 'folded-observatory', scale: 'sepulchral-scale', warbanddrum: 'warband-drum', seedheart: 'seedheart-vessel'
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
    goblin: { line: 'The sentry was watching the treeline.' },
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
    berserker: { line: 'Nobody has ever told him to stop twice.' },
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
    coalback: { line: 'Count your coals.' },
    vow: { line: "Her mother's knot held. So will this one." },
    chaplain: { line: 'She never asks which ones will come back.' },
    pilgrim: { line: 'No answer yet. There is more road.' },
    roadshield: { line: 'Every dent is somebody who walked home.' },
    sunthread: { line: 'It has kept three generations warm.' },
    roadsquire: { line: "Her saddlebags first. His own, if there's time." },
    sanctuary: { line: 'The door has never been shut.' },
    humbling: { line: 'Even giants look away.' },
    reliquary: { line: 'Some say it is only a stone.' },
    ashsweeper: { line: 'The priests pray for the gods to return. She sweeps, in case they do.' },
    borrowedwill: { line: "He'll remember none of it." },
    heldmoments: { line: 'He is still certain he was winning.' },
    unwind: { line: 'For a heartbeat, he had never moved.' },
    marksman: { line: 'One shot.' },
    glimmer: { line: 'She sent herself home an hour early.' },
    whitemorning: { line: 'Dawn came. Nothing else moved.' },
    frostbreak: { line: 'Everything is brittle at the right temperature.' },
    prism: { line: 'Light bends, if you ask it properly.' },
    courier: { line: 'The seal is unbroken. She has read it anyway.' },
    unmake: { line: 'Taking things apart is how we learned to make them.' },
    tideglass: { line: 'Nobody has found where the water comes back in.' },
    observatory: { line: 'Some nights it shows more stars than the sky does.' },
    ledger: { line: 'He has yet to write "paid in full."' },
    siphon: { line: "You weren't using all of it." },
    tithe: { line: 'The children are counted too.' },
    pallofash: { line: 'Return to dust.' },
    bought: { line: "Everyone has a number. His was lower than he'd hoped." },
    barrowmark: { line: "Walk on. You'll come back." },
    mortuary: { line: 'He closes their eyes for the last time. Usually.' },
    hostess: { line: 'Stay. The night is young, and so are you.' },
    temptress: { line: 'You came to arrest her. Remember?' },
    lynx: { line: 'The guards count the cats each night. There is always one too many.' },
    gallows: { line: 'There have never been many white stones.' },
    informant: { line: 'Never invited. Never missed a word.' },
    mourningveil: { line: 'She wore it to every funeral, and arranged most of them.' },
    ossuary: { line: 'Grandfather is in the left foreleg.' },
    scale: { line: 'It has never once tipped toward the living.' },
    debtblade: { line: 'He took the coat as well.' },
    tender: { line: 'Smooth at dusk. He checks them at dawn.' },
    kindle: { line: 'Nobody stepped back.' },
    firecaller: { line: 'He was meant to be the camp cook.' },
    hurledbrand: { line: 'Catch!' },
    clanoutrider: { line: 'Brakka always votes first.' },
    anoint: { line: "It only burns if you're afraid." },
    returnloam: { line: 'Iron rusts. Ferns wait.' },
    trapper: { line: 'He takes what comes.' },
    mosshorn: { line: 'They graze the old roads.' },
    earthspeaker: { line: 'The ground is talking.' },
    hound: { line: 'It has never learned to sit.' },
    waystone: { line: 'It still walks to the thirteenth milestone and back.' },
    lineofdawn: { line: 'The light goes first.' },
    oathbell: { line: 'Once for the hour. Twice for the dead. Three times for the oath.', credit: 'Sunmane custom' },
    vowkeeper: { line: "He swore to walk the road until it ended. It hasn't." },
    standasone: { line: "Three hands on the bar. Then six. Then everyone's." },
    penitent: { line: 'No one asks why he takes the night watch.' },
    rimebolt: { line: 'Cold is not a thing. It is the absence of one.', credit: 'Lantern Conclave lecture' },
    rimecaller: { line: 'His mother still sends him wool socks.' },
    fieldplate: { line: 'His armour has never failed. Some of the men inside it have.' },
    shutterassassin: { line: 'Nobody in a crowd looks up.' },
    bailiff: { line: 'Your hearing is set for next spring.' },
    hour: { line: 'Nobody remembers turning it over.' },
    slagheart: { line: 'When the mountain walks, walk the other way.', credit: 'Cinder Clan saying' },
    firebrand: { line: "They burned his fields once. Now he burns everyone's." },
    skyfalls: { line: 'The keep had stood for six hundred years. It stood for one more evening.' },
    scatter: { line: 'The line broke before the shields did.' },
    wildfire: { line: 'Nobody won the valley that summer.' },
    emberward: { line: 'Hold still. A crooked line lets the fire in.' },
    reedbank: { line: 'Take half. The river will want the rest.' },
    overgrowth: { line: 'Not every army marches.' },
    pathguard: { line: "Turn back. You'll only be asked once." },
    canopy: { line: 'The forest takes sides.' },
    stag: { line: 'It has never been found by anyone who was looking.' },
    alderelder: { line: 'It does not hurry. It has outlived everyone who did.' },
    tortoise: { line: 'The village moved twice last year. Nobody packed.' },
    recruit: { line: 'He has already written the letter home, in case.' }
  };
  function artSrc(id) { return 'art/web/' + ART[id] + '.jpg'; }
  // The board rebuilds on every render, so a battle holds both decks' paintings decoded from its start to stop tiles flickering.
  // Cards whose painting isn't finished yet show a plain coloured panel instead of a broken image.
  // The other paintings trickle in a few at a time after the first screen, so a first visit isn't held up by every painting in the game.
  var noArt = {}, artRedraw = null, warmed = {};
  function afterLoad(fn) { if (document.readyState === 'complete') setTimeout(fn, 0); else window.addEventListener('load', function () { setTimeout(fn, 0); }); }
  function warmArt(id) {
    if (warmed[id] || !ART[id]) return warmed[id];
    var im = warmed[id] = new Image();
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
  }
  afterLoad(function () {
    // The tile effect paintings too, so a new effect shows at once rather than a frame later.
    Object.keys(TILE_NAMES).forEach(function (k) {
      ['tile-', 'border-', 'emblem-'].forEach(function (p) { warmed[p + k] = new Image(); warmed[p + k].src = 'art/web/ui/' + p + k + '.png'; });
    });
    setTimeout(trickle, 3000);
  });
  // The deck list hurries the rest along, so the editor's full card pool is ready by the time it opens.
  var rest = Object.keys(ART), running = 0, lanes = 3;
  function trickle(more) {
    if (more) lanes = Math.max(lanes, more);
    while (running < lanes && rest.length) {
      var id = rest.shift();
      if (warmed[id]) continue;
      running++;
      var im = warmArt(id);
      im.addEventListener('load', landed);
      im.addEventListener('error', landed);
    }
  }
  function landed() { running--; trickle(); }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  // The Claude opponent needs the page to be running inside Claude. Anywhere else, only the scripted bot is on offer.
  var sample = null, plan = null, thinking = null, modelOff = false, lastThought = null;
  // Inside Claude the page asks Claude itself. A copy hosted elsewhere plays on the owner's key once the player signs in.
  var hosted = !(window.claude && window.claude.use);
  if (!hosted) window.claude.use('sample').then(function (fn) { sample = fn; refreshStart(); });
  else if (OwnKey.has()) sample = OwnKey.sample;
  function refreshStart() { if (!$('start').hidden) renderStart(); Screens.redraw(); }

  function actor() { return S.pending ? S.pending.responder : S.active; }
  function humanMoves() {
    var ms = S.winner === null && actor() === HUMAN ? E.legalMoves(S) : [];
    // The tutorial offers only the move its current step teaches.
    return S.tutorial ? ms.filter(Tutorial.allows) : ms;
  }
  function unitById(uid) { return S.units.filter(function (u) { return u.uid === uid; })[0]; }
  function cardOf(id) {
    var h = S.players[HUMAN].hand.filter(function (i) { return i.id === id; })[0];
    return h ? E.CARDS[h.c] : null;
  }

  function selectedMoves(moves) {
    if (!sel) return [];
    if (sel.kind === 'card') return moves.filter(function (m) { return m.card === sel.id; });
    if (sel.kind === 'relic') return moves.filter(function (m) { return m.type === 'relic' && m.relic === sel.id; });
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

  // Each summoner's medallion shows a painting from their alignment inside a bronze ring.
  var PORTRAIT = { W: 'lancer', R: 'warchief', U: 'conjurer', B: 'noble', G: 'wayfinder', N: 'youngsummoner' };
  // Life is a wax seal with the number and a rail of nails, one per point. A nail lost since the last redraw is pulled out.
  var lifeSeen = {};
  function lifeHtml(pi, p) {
    var was = lifeSeen[pi] === undefined ? p.life : lifeSeen[pi], n = Math.max(E.START_LIFE, p.life, was), nails = '';
    for (var i = 0; i < n; i++) nails += '<i class="' + (i < p.life ? (i >= was ? 'back' : '') : i < was ? 'out pull' : 'out') + '"' + (i < p.life && i >= was ? ' style="--k:' + (i - was) + '"' : i >= p.life && i < was ? ' style="--k:' + (was - 1 - i) + '"' : '') + '></i>';
    return '<span class="life' + (p.life < was ? ' hurt' : p.life > was ? ' healed' : '') + '" title="Summoner life ' + p.life + '"><span class="lseal"><b>' + p.life + '</b></span><span class="lrail" style="--n:' + n + '">' + nails + '</span></span>';
  }

  function plateHtml(pi, targetable, threat) {
    var p = S.players[pi], main = p.colour, you = pi === HUMAN;
    var gems = p.lands.map(function (l, n) {
      return '<span class="gem ' + l.colour + (n < p.mana ? '' : ' spent') + '" title="' + E.CARDS[l.c].name + '" data-peek="' + l.c + '">' + sym(l.colour) + '</span>';
    }).join('');
    var pile = function (label, n, back) { return '<span class="pile' + (back ? ' back' : '') + '"><small>' + label + '</small><b>' + n + '</b></span>'; };
    var tag = targetable ? 'button type="button" data-summoner="1"' : 'div';
    var close = targetable ? 'button' : 'div';
    var active = S.winner === null && S.phase !== 'opening' && S.active === pi;
    // Relics sit beside the summoner. The Folded observatory shows its owner the top two cards of the deck.
    var relics = (p.relics || []).map(function (r) {
      var rc = E.CARDS[r.c], top = '';
      if (rc.relic === 'stars' && you && p.deck.length >= 2) top = ': next ' + p.deck.slice(-2).reverse().map(function (i) { return E.CARDS[i.c].name; }).join(', then ');
      return '<span class="relic ' + rc.colour + '" data-peek="' + r.c + '">' + sym(rc.colour) + esc(rc.name) + (r.store ? ' <b>' + r.store + '</b>' : '') + esc(top) + '</span>';
    }).join('');
    return '<' + tag + ' class="plate ' + (you ? 'you' : 'them') + (active ? ' active' : '') + (targetable ? ' target' : '') + (threat ? ' threat' : '') + '" id="summoner' + pi + '"' +
      (targetable ? ' aria-label="Attack the enemy summoner, life ' + p.life + '"' : '') + '>' +
      '<span class="crest ' + main + (you ? ' you' : ' foe') + '">' + (noArt[PORTRAIT[main]] ? '' : '<img src="' + artSrc(PORTRAIT[main]) + '" alt="" draggable="false">') + '<span class="emb">' + sym(main) + '</span></span>' +
      '<span class="who"><b>' + (you ? 'You' : esc(p.name)) + '</b><small>' + (you ? esc(p.name) : ALIGNMENT[main] + (modelOn() ? ' · Claude, ' + AI.levels[oppPlayer].label : online ? ' · Online' : '')) + '</small></span>' +
      lifeHtml(pi, p) +
      '<span class="manarow"><span class="mana">' + p.mana + ' <small>/ ' + p.lands.length + ' mana</small></span>' + gems + '</span>' +
      (relics ? '<span class="relics">' + relics + '</span>' : '') +
      (targetable ? '<span class="strike">' + (sel && sel.kind === 'card' ? 'Target summoner' : 'Strike summoner') + '</span>' : '') +
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
      if (fanAt === u.uid) cls.push('fanned');
      if (marks.units[u.uid]) cls.push(marks.units[u.uid]);
      // Conditions come first. Every label shows, kept small; the close-up note and the tile's label repeat them.
      var states = [], notes = d.keywords.slice();
      u.enchants.forEach(function (e) { notes.push(E.CARDS[e.c].name + (e.left ? ' ' + e.left : '')); });
      if (u.tempAtk) notes.push('+' + u.tempAtk + ' this turn');
      if (u.stride && u.owner === S.active) notes.push('+' + u.stride + ' move');
      if (u.held >= S.turn) states.push('Held');
      if (u.frozen >= S.turn) states.push('Frozen');
      if (u.veiled) states.push('Veiled');
      if (u.watching) states.push('Watching');
      if (u.lit && d.keywords.indexOf('Lit') < 0) states.push('Lit');
      if (u.stasis >= S.turn) states.push('Between moments');
      if (u.sapped >= S.turn) states.push('Restrained');
      if (u.braced === S.turn) states.push('Braced');
      if (u.from !== undefined && u.from !== u.owner) states.push(u.charmedBy ? 'Charmed' : 'Borrowed');
      if (u.fleeting) states.push('Fades');
      if (u.rootfed) notes.push('Rootfed +' + u.rootfed);
      if (u.carrion) notes.push('Carrion +' + u.carrion);
      if (u.devotion) notes.push('Devotion +' + u.devotion);
      if (waiting) states.push('Waiting');
      else if (u.owner === S.active && u.acted) states.push('Done');
      // Each label is a small enamel shield with its first letter, stacked in a corner and fanned out on hover; the tile's
      // title and the close-up note spell them out. Waiting and Done show in the painting's dimming instead.
      var all = states.concat(notes).filter(function (t, k, a) { return a.indexOf(t) === k; });
      var shown = all.filter(function (t) { return t !== 'Waiting' && t !== 'Done'; });
      var chips = shown.slice(0, shown.length > 6 ? 5 : 6).map(function (t, k) {
        return '<i class="shd ' + shieldKind(t) + '" style="--i:' + k + '" data-t="' + t + '">' + (/^\+/.test(t) ? '+' : t.charAt(0).toUpperCase()) + '</i>';
      });
      if (shown.length > 6) chips.push('<i class="shd n more" style="--i:5" data-t="' + shown.slice(5).join(', ') + '">+' + (shown.length - 5) + '</i>');
      var atk = E.attackOf(S, u);
      inner += (noArt[d.id] ? '' : '<img class="tart" src="' + artSrc(d.id) + '" alt="" decoding="sync" draggable="false">') +
        '<span class="nm">' + sym(d.colour) + '<span>' + d.name + '</span></span>' +
        (chips.length ? '<span class="chips' + (chips.length > 1 ? ' stack' : '') + '" style="--n:' + chips.length + '" title="' + all.join(', ') + '">' + chips.join('') + '</span>' : '') +
        '<span class="st"><span class="badge atk' + (atk > d.atk ? ' up' : atk < d.atk ? ' down' : '') + '">' + atk + '</span>' +
        '<span class="badge hp' + (u.hp < u.maxHp ? ' hurt' : '') + '">' + u.hp + '</span></span>';
      label = (u.owner === HUMAN ? 'Your ' : 'Enemy ') + d.name + ', attack ' + E.attackOf(S, u) + ', health ' + u.hp + (all.length ? ', ' + all.join(', ') : '');
      attrs += ' data-peek="' + d.id + '" data-note="' + (u.owner === HUMAN ? 'Your unit' : 'Enemy unit') + ', now ' + E.attackOf(S, u) + ' / ' + u.hp + (all.length ? '. ' + all.join(', ') : '') + '"';
    } else label = 'Empty tile, row ' + (r + 1) + ', column ' + (c + 1);
    if (fxText) label += ', ' + fxText.toLowerCase();
    return '<button type="button" class="' + cls.join(' ') + '" ' + attrs + ' aria-label="' + label + '">' + inner + '</button>';
  }

  // Shield colours: red for attack, blue for movement and reach, green for growth and healing, gold for everything else.
  var SHIELD = {
    r: ['Hunt', 'Frenzy', 'Overrun', 'Flanking', 'Armed', 'Stomp', 'Drain', 'Warband', 'Lit', 'Resonance', 'Charmed', 'Borrowed', 'Venom', 'Overwatch', 'Watching'],
    u: ['Swift', 'Flying', 'Ranged', 'Longshot', 'Ambush', 'Errant', 'Veiled', 'Decoy', 'Frozen', 'Held', 'Restrained', 'Between moments'],
    g: ['Grows', 'Rootfed', 'Carrion', 'Devotion']
  };
  function shieldKind(t) {
    if (/this turn$/.test(t)) return 'r';
    if (/move$/.test(t)) return 'u';
    var word = t.replace(/ [+\d].*$/, '');
    return SHIELD.r.indexOf(word) >= 0 ? 'r' : SHIELD.u.indexOf(word) >= 0 ? 'u' : SHIELD.g.indexOf(word) >= 0 ? 'g' : 'n';
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
      else if (m.type === 'attackSummoner' || (m.type === 'cast' && m.summoner !== undefined)) marks.summoner = true;
      else if (m.type === 'relic' && m.target) marks.units[m.target] = 't-buff';
      // Abilities that take a unit and then a tile, like the Oath-road squire's, pick the unit first.
      else if (m.type === 'ability' && sel.ability && m.r !== undefined && m.target) {
        if (!sel.abUnit) marks.units[m.target] = 't-buff';
        else if (m.target === sel.abUnit) marks.tiles[m.r + ',' + m.c] = 't-move';
      }
      else if ((m.type === 'cast' || m.type === 'respond') && m.r !== undefined && !m.target) marks.tiles[m.r + ',' + m.c] = 't-aim';
      else if (m.type === 'ability' && sel.ability && m.r !== undefined) marks.tiles[m.r + ',' + m.c] = 't-aim';
      else if (m.type === 'cast' && m.r !== undefined) {
        if (!sel.castUnit) marks.units[m.target] = 't-buff';
        else if (m.target === sel.castUnit) marks.tiles[m.r + ',' + m.c] = 't-move';
      }
      else if ((m.type === 'cast' || m.type === 'enchant') && m.target) marks.units[m.target] = unitById(m.target).owner === HUMAN ? 't-buff' : 't-attack';
      else if (m.type === 'ability' && sel.ability && m.target) {
        var ab = E.CARDS[unitById(sel.id).cardId].ability;
        marks.units[m.target] = ['heal', 'farheal', 'orders', 'harvest', 'lens', 'tend', 'swap'].indexOf(ab.key) >= 0 ? 't-buff' : 't-attack';
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
    var rar = isLand || c.token ? '' : '<i class="rar ' + Rarity.of(c.id) + '" title="' + Rarity.name(c.id) + '"><span class="sr">, ' + Rarity.name(c.id).toLowerCase() + '</span></i>';
    var type = '<span class="type">' + (c.equipment ? 'Equipment' : TYPES[c.type]) + (c.sub ? ', ' + c.sub : '') + ' · ' + ALIGNMENT[c.colour] + rar + '</span>';
    // Every card has the same band under the art, so every card is laid out the same; a unit's Attack and Health sit at its ends.
    var band = c.type === 'unit' ? '<span class="num" title="Attack" aria-label="Attack ' + c.atk + '">' + c.atk + '</span>' + type +
      '<span class="num hp" title="Health" aria-label="Health ' + c.hp + '">' + c.hp + '</span>' : type;
    var fl = FLAVOUR[c.id];
    if (fl) body += '<span class="flavour">' + fl.line + (fl.credit ? '<span class="credit">' + fl.credit + '</span>' : '') + '</span>';
    return '<span class="frame ' + c.colour + (isLand ? ' land' : '') + (o.big ? ' big' : '') + '"><span class="inner">' + costHtml +
      '<span class="bar-top">' + c.name + '</span>' +
      '<span class="art">' + (noArt[c.id] ? '' : '<img src="' + artSrc(c.id) + '" alt="" decoding="sync" draggable="false">') + '</span>' +
      '<span class="band">' + band + '</span><span class="ctext">' + body + '</span></span></span>';
  }

  // The hand fans out from its middle: each card turns a little and drops a little further from the centre.
  function cardHtml(i, moves, k, n) {
    var c = E.CARDS[i.c], you = S.players[HUMAN], off = k === undefined ? 0 : k - (n - 1) / 2;
    var have = you.lands.filter(function (l) { return l.colour === c.colour; }).length;
    var playable = S.phase === 'opening' || moves.some(function (m) { return m.card === i.id; });
    var ready = playable && actor() === HUMAN && ((S.phase === 'play' && !S.pending) || aimable(moves, i.id));
    var cls = 'card' + (sel && sel.kind === 'card' && sel.id === i.id ? ' selected' : '') + (playable ? '' : ' dim') + (ready ? ' ready' : '');
    return '<button type="button" class="' + cls + '" data-card="' + i.id + '" data-peek="' + c.id + '" data-note="In your hand" style="--rot:' + (off * 2.6).toFixed(1) + 'deg;--dy:' + Math.round(off * off * 2.4) + 'px"><span class="cslot">' +
      frameHtml(c, { cost: E.costOf(S, HUMAN, c, i), have: have }) + '</span></button>';
  }

  // Names and the band stay on one line, shrinking for long ones. Small cards have little room, so a line that doesn't fit is
  // left for the close-up, and rules text that still doesn't fit gets smaller twice. The art is never cropped.
  // A card drawn while hidden can't be measured, so it fits itself when it first appears.
  var unsized = window.ResizeObserver ? new ResizeObserver(function (es) {
    es.forEach(function (e) {
      if (!e.target.isConnected) unsized.unobserve(e.target);
      else if (e.target.offsetWidth) { unsized.unobserve(e.target); fitFrame(e.target); }
    });
  }) : null;
  // Every card is measured in the same pass and changed in the next, since each measurement after a change makes the page lay
  // itself out again. A long line's size comes from one measurement, as text narrows in step with its size.
  function fitFrames(frames) {
    var cards = [], lines = [];
    frames.forEach(function (fr) { var w = fr.offsetWidth; if (w) cards.push({ fr: fr, cqw: w / 100 }); else if (unsized) unsized.observe(fr); });
    cards.forEach(function (k) {
      var big = k.fr.classList.contains('big');
      [[k.fr.querySelector('.bar-top'), big ? 4 : 5.2], [k.fr.querySelector('.band .type'), big ? 2.6 : 3.4]].forEach(function (l) {
        if (!l[0]) return;
        l[0].style.fontSize = '';
        lines.push({ el: l[0], floor: l[1], cqw: k.cqw });
      });
    });
    lines.forEach(function (l) {
      var cs = getComputedStyle(l.el), pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      l.size = parseFloat(cs.fontSize) / l.cqw;
      l.over = l.el.scrollWidth > l.el.clientWidth;
      if (l.over) l.to = Math.max(l.floor, Math.floor(l.size * (l.el.clientWidth - pad) / (l.el.scrollWidth - pad) * 10) / 10);
    });
    lines = lines.filter(function (l) { return l.over && l.to < l.size; });
    lines.forEach(function (l) { l.el.style.fontSize = l.to + 'cqw'; });
    // Rounding can leave a line a hair too wide; those few step down the old way.
    lines.filter(function (l) { return l.el.scrollWidth > l.el.clientWidth; }).forEach(function (l) {
      var size = l.to;
      while (l.el.scrollWidth > l.el.clientWidth && size > l.floor) { size -= 0.2; l.el.style.fontSize = size + 'cqw'; }
    });
    var texts = cards.map(function (k) { var t = k.fr.querySelector('.ctext'); return { t: t, f: t.querySelector('.flavour') }; });
    var over = function (x) { return x.t.scrollHeight > x.t.clientHeight; };
    texts.filter(function (x) { return x.f && over(x); }).forEach(function (x) { x.t.removeChild(x.f); });
    texts.filter(over).forEach(function (x) { x.t.classList.add('tight'); });
    texts.filter(over).forEach(function (x) { x.t.classList.add('tighter'); });
  }
  function fitFrame(fr) { fitFrames([fr]); }
  // Takes one element, or a list of them to fit in the same pass.
  function fitCards(hosts) {
    var frames = [];
    Array.prototype.forEach.call(hosts.nodeType ? [hosts] : hosts, function (h) { frames.push.apply(frames, h.querySelectorAll('.frame')); });
    fitFrames(frames);
  }

  // The large card. It only redraws when the card changes, so bot turns don't reset it.
  function showCard(id, note) {
    if (peek && peek.id === id && peek.note === (note || '')) return;
    peek = { id: id, note: note || '' };
    $('inspect').innerHTML = '<div class="slot">' + frameHtml(E.CARDS[id], { big: true }) + '</div><p class="note">' + peek.note + '</p>';
    fitCards($('inspect'));
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
    return '<span class="turn"><small>Turn ' + S.turn + '</small>' + (bothHands() ? (S.active === 0 ? 'Bottom' : 'Top') + "'s turn" : S.active === HUMAN ? 'Your turn' : 'Enemy turn') + '</span>' +
      '<span class="steps">' + step('play', 'Play') + step('command', 'Command') + '</span>';
  }

  function resultHtml() {
    // The tutorial's coach says its own goodbye.
    if (S.winner === null || S.tutorial) return '';
    var txt = S.winner === 'draw' ? 'A draw' : S.winner === HUMAN ? 'You win' : 'You lose';
    var ended = Campaign.ended(), next = !chapterBattle ? '' : S.winner === 'draw' ? 'Fight it again' : S.winner !== HUMAN ? 'Continue' : ended ? 'Continue' : 'Choose a card';
    var note = chapterBattle && S.winner === 'draw' ? ' Nobody holds the field, so this battle is fought again.' : chapterBattle && S.winner !== HUMAN ? ' Your run ends here.' : '';
    if (S.resigned !== undefined) note = S.resigned === HUMAN ? ' You resigned.' : ' Your opponent resigned.';
    var btns = '<span class="btns">' + (online ? btn('Multiplayer', { ui: 'online' }, true) + btn('Open packs', { ui: 'packs' }) : chapterBattle ? btn(next, { ui: 'campaign' }, true) : btn('Play again', { ui: 'new' }, true) + btn('Change decks', { ui: 'decks' }) + (sandbox ? '' : btn('Open packs', { ui: 'packs' }))) + '</span>';
    if (sandbox) return '<div class="plaque"><h2>' + txt + '</h2><p>' + S.players[HUMAN].life + ' to ' + S.players[BOT].life + ' after ' + S.turn + ' turns.' + note + '</p>' + btns + '</div>';
    var pay = payout || reward(), lines = pay.pay.lines.filter(function (l) { return l.length < 3 || l[2]; });
    var who = { bot: 'the scripted bot', easy: 'Claude, Easy', normal: 'Claude, Normal', hard: 'Claude, Hard', human: 'a person' };
    // Each line of the ledger is stamped in turn and pays its coins into the purse; Polish.payout plays it.
    var rows = lines.map(function (l) {
      var each = l[2] ? l[1] / l[2] : 0;
      return '<li data-gold="' + l[1] + '"><span>' + l[0] + '</span><small>' + (l[2] && each !== l[1] ? l[2] + ' × ' + (Math.round(each * 10) / 10) : '') + '</small><b>+' + l[1] + '</b></li>';
    }).join('');
    var mults = [];
    if ((Progress.VS[pay.vs] || 1) > 1) mults.push(['Against ' + who[pay.vs], Progress.VS[pay.vs]]);
    if (pay.entry && pay.entry.boost > 1) mults.push(['A campaign you\'ve already beaten', pay.entry.boost]);
    rows += mults.map(function (m) { return '<li class="mult" data-mult="' + m[1] + '"><span>' + m[0] + '</span><small></small><b>× ' + m[1] + '</b></li>'; }).join('');
    var result = S.winner === 'draw' ? 'draw' : S.winner === HUMAN ? 'win' : 'loss';
    return '<div class="plaque summary ' + result + (chapterBattle ? ' campaign' : '') + '"><div class="screst"><b>' + (result === 'win' ? 'Victory' : result === 'loss' ? 'Defeat' : 'A draw') + '</b></div>' +
      '<p class="ssub">' + S.players[HUMAN].life + ' to ' + S.players[BOT].life + ' after ' + S.turn + ' turns.' + note + '</p>' +
      '<ol class="stally">' + rows + '</ol>' +
      '<div class="earned"><span class="purse" aria-hidden="true"></span><span>Gold earned</span><strong data-count="' + pay.pay.total + '">' + pay.pay.total + '</strong></div>' +
      '<p class="hint">You have ' + Progress.state().gold + ' gold.</p>' + btns + '</div>';
  }

  var lastResult = null;
  function announceTurn() {
    var key = S.winner === null && S.phase !== 'opening' ? S.active + ':' + S.turn : null;
    if (key && key !== lastTurn) {
      if (lastTurn && S.active === BOT && !bothHands()) Sfx.play('enemy-turn');
      $('turnBanner').className = S.active === HUMAN ? '' : 'enemy';
      $('turnBanner').innerHTML = '<span>' + (bothHands() ? (S.active === 0 ? 'Bottom' : 'Top') + "'s turn" : S.active === HUMAN ? 'Your turn' : 'Enemy turn') + '</span>';
    }
    lastTurn = key;
  }

  // End turn is a bronze press. It sinks when pressed, and the enemy's dark press stands in its place until your turn comes back.
  function pressHtml(data, glow) {
    return '<button type="button" class="press' + (glow ? ' glow' : '') + '" data-do=\'' + JSON.stringify(data) + '\' aria-label="End turn">End<br>turn</button>';
  }
  var FOE_PRESS = '<span class="press foe" aria-hidden="true">Enemy<br>turn</span>';
  function actionsHtml(moves) {
    var html = actionsInner(moves);
    return S.winner === null && S.phase !== 'opening' && S.active === BOT && !bothHands() ? html + FOE_PRESS : html;
  }
  function actionsInner(moves) {
    var you = S.players[HUMAN];
    if (S.winner !== null) return promptHtml('The battle is over.');
    if (online && online.problem === 'drift') return promptHtml('The two games no longer match, so this battle can\'t go on. Resign it from the menu and start another.');
    if (actor() !== HUMAN) {
      if (online && !online.oppHere) return promptHtml('Your opponent has left the match. It carries on when they come back.');
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
      } else if (S.pending.kind === 'move') text = E.CARDS[unitById(S.pending.step.uid).cardId].name + ' has moved. Respond?';
      else text = 'The enemy turn is ending. Use an instant?';
      if (sel && sel.kind === 'card') return promptHtml('Choose a tile to aim ' + cardOf(sel.id).name + ' at.') + '<span class="btns">' + btn('Cancel', { ui: 'clear' }) + btn('Pass', { move: { type: 'pass' } }, true) + '</span>';
      // An aimed instant gets one button that picks it up, then the board takes the aim.
      var aimed = {}, opts = moves.filter(function (m) { return m.type === 'respond'; }).map(function (m) {
        if (m.r === undefined || m.target !== undefined) return btn(moveLabel(m), { move: m });
        if (aimed[m.card]) return '';
        aimed[m.card] = true;
        return btn('Aim ' + cardOf(m.card).name, { ui: 'pick', id: m.card });
      }).join('');
      return promptHtml(text) + '<span class="btns">' + opts + btn('Pass', { move: { type: 'pass' } }, true) + '</span>';
    }
    var out = [], sm = selectedMoves(moves);
    if (S.phase === 'play') {
      var hint = 'Pick a card from your hand, then move on to your units.';
      if (sel && sel.kind === 'relic') {
        hint = 'Choose one of your units.';
        out.push(btn('Back', { ui: 'clear' }));
      }
      if (sel && sel.kind === 'card') {
        var c = cardOf(sel.id), inst = you.hand.filter(function (i) { return i.id === sel.id; })[0], place = sm.some(function (m) { return m.type === 'summon'; }), ench = sm.some(function (m) { return m.type === 'enchant'; });
        if (c.type === 'instant') hint = instantHint(c, sm);
        else if (pickStage(sm)) hint = 'Choose a back-row tile for each unit it summons.';
        else if (place) hint = sel.summonAt ? 'Choose an enemy unit for it to hit.' : 'Choose a highlighted tile' + (sm.some(function (m) { return m.type === 'summon' && m.r !== E.backRow(HUMAN); }) ? ': your back row, or beside or behind one of your units.' : ' in your back row.');
        else if (ench) hint = 'Choose a unit to enchant.';
        else if (c.type !== 'land' && E.costOf(S, HUMAN, c, inst) > you.mana) hint = 'Not enough mana to play this now.';
        else if (c.type === 'relic') hint = 'Put this relic into play beside you.';
        else if (c.type === 'spell') hint = !sm.length ? "You can't cast this right now." : c.raise ? 'Choose a unit to return.' : c.cleanse || c.unchain || c.loam ? 'Choose a unit with enchantments' + (c.unrelic ? ', or break a relic.' : '.') : c.mend ? 'Choose one of your units.' : c.bolt ? 'Choose an enemy unit or the enemy summoner.' : c.blast || c.borrow || c.stasis || c.buy ? 'Choose an enemy unit.' : c.place ? 'Choose an empty tile in the middle rows.' : c.aim ? 'Choose a tile to aim at' + (c.unrelic ? ', or break a relic.' : '.') : c.chant || c.light ? 'Choose one of your units.' : c.passage ? (sel.castUnit ? 'Choose a free tile.' : 'Choose one of your units to move.') : 'Cast this spell.';
        else if (c.type === 'unit') hint = 'Your back row is full, so there is nowhere to summon this.';
        else if (c.type === 'enchant') hint = 'There is no unit this can enchant right now.';
        else hint = sm.length ? 'Play this land.' : 'You already played a land this turn.';
        sm.forEach(function (m) {
          if (m.type === 'playLand') out.push(btn('Play land', { move: m }, true));
          if (m.type === 'cast' && m.relic !== undefined) out.push(btn('Break ' + relicName(m.relic), { move: m }));
          else if (m.type === 'cast' && m.summoner !== undefined) out.push(btn('Hit the enemy summoner', { move: m }));
          else if (m.type === 'cast' && !m.target && m.r === undefined && !(m.at && m.at.length)) {
            var back = you.discard.filter(function (d) { return d.id === m.raise; })[0];
            out.push(btn(back ? 'Return ' + E.CARDS[back.c].name : c.type === 'relic' ? 'Play relic' : 'Cast', { move: m }, true));
          }
        });
        out.push(btn('Cancel', { ui: 'clear' }));
      }
      if (!sel) out = out.concat(relicButtons(moves));
      var canCommand = E.legalMoves(E.applyMove(S, { type: 'toCommand' })).length > 1;
      if (canCommand) out.push(btn('Command units', { move: { type: 'toCommand' } }, !sel));
      return promptHtml(hint) + '<span class="btns">' + out.join('') + '</span>' + pressHtml({ ui: 'skip' }, !canCommand && !sel && !moves.some(function (m) { return m.card !== undefined && m.type !== 'bottomCard'; }));
    }
    var cmdHint = 'Select one of your units. Each can move, then attack or use an ability.';
    if (sel && sel.kind === 'card') {
      cmdHint = instantHint(cardOf(sel.id), sm);
      out.push(btn('Cancel', { ui: 'clear' }));
    } else if (sel && sel.kind === 'relic') {
      cmdHint = 'Choose one of your units.';
      out.push(btn('Back', { ui: 'clear' }));
    } else if (!sel) out = out.concat(relicButtons(moves));
    if (sel && sel.kind === 'unit') {
      var u = unitById(sel.id), ab = u ? E.CARDS[u.cardId].ability : null;
      if (sel.ability) {
        cmdHint = sel.abUnit ? 'Choose where it goes.' : 'Choose a target for ' + ab.label + '.';
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
    return promptHtml(cmdHint) + '<span class="btns">' + out.join('') + '</span>' + pressHtml({ move: { type: 'endTurn' } }, !sel && moves.every(function (m) { return m.type === 'endTurn'; }));
  }

  // Instants such as Scatter the line, aimed at a tile on either turn, or Firebolt picking a unit on your own turn.
  function aimable(moves, id) {
    return moves.some(function (m) { return m.card === id && (m.type === 'cast' || (m.type === 'respond' && m.r !== undefined && m.target === undefined)); });
  }
  function instantHint(c, sm) {
    if (!sm.length) return c.damage || c.debt || c.shove || c.aim ? "You can't cast this right now." : 'This answers an enemy move, so it waits for the enemy turn.';
    return c.aim ? 'Choose a tile to aim at.' : c.shove ? 'Choose an enemy unit to push back.' : c.debt ? 'Choose a damaged enemy unit.' : 'Choose an enemy unit.';
  }

  function relicName(id) {
    var r = [].concat(S.players[0].relics, S.players[1].relics).filter(function (x) { return x.id === id; })[0];
    return r ? (S.players[HUMAN].relics.indexOf(r) >= 0 ? 'your ' : 'the enemy ') + E.CARDS[r.c].name : 'relic';
  }
  // One button per relic you can use now. The Seedheart vessel needs a unit, so its button selects it first.
  function relicButtons(moves) {
    var out = [], seen = {};
    moves.forEach(function (m) {
      if (m.type !== 'relic' || seen[m.relic]) return;
      seen[m.relic] = true;
      var r = S.players[HUMAN].relics.filter(function (x) { return x.id === m.relic; })[0], rc = E.CARDS[r.c];
      var label = rc.relic === 'tide' ? 'Release ' + r.store + ' mana' : rc.relic === 'stars' ? 'Swap the top two cards' : rc.relic === 'seed' ? 'Release the ' + rc.name : rc.name + ' (1 mana)';
      out.push(m.target ? btn(label, { ui: 'relic', id: m.relic }) : btn(label, { move: m }));
    });
    return out;
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

  var handSeen = null;
  function render() {
    if (sandbox) {
      S.players.forEach(function (p) { p.mana = TEST_MANA; });
      if (S.winner === null && !testBot) { HUMAN = actor(); BOT = 1 - HUMAN; }
    }
    var moves = humanMoves(), marks = computeMarks(moves);
    $('app').classList.toggle('opening', S.phase === 'opening' && S.winner === null);
    $('cmd').classList.toggle('enemy', S.winner === null && S.phase !== 'opening' && actor() === BOT);
    $('phases').innerHTML = phaseHtml();
    $('themStrip').innerHTML = plateHtml(BOT, marks.summoner, false);
    $('youStrip').innerHTML = plateHtml(HUMAN, false, marks.threat);
    lifeSeen[BOT] = S.players[BOT].life; lifeSeen[HUMAN] = S.players[HUMAN].life;
    var g = '<div class="front" aria-hidden="true"></div>';
    for (var r = 0; r < E.ROWS; r++) for (var c = 0; c < E.COLS; c++) g += turned() ? tileHtml(E.ROWS - 1 - r, E.COLS - 1 - c, marks) : tileHtml(r, c, marks);
    $('grid').innerHTML = g;
    $('grid').style.gridTemplateColumns = 'repeat(' + E.COLS + ', minmax(0, 1fr))';
    $('grid').style.gridTemplateRows = 'repeat(' + E.ROWS + ', minmax(0, 1fr))';
    // Bigger test maps get wider tiles, slimmer side panels and a smaller hand so units stay readable.
    var big = E.ROWS * E.COLS > 20, ratio = big ? E.ROWS / E.COLS / 1.45 : 0.72;
    $('app').classList.toggle('big', big);
    $('grid').style.setProperty('--grat', ratio.toFixed(3));
    $('app').style.setProperty('--rc', (E.ROWS / E.COLS).toFixed(3));
    $('grid').parentNode.style.setProperty('--bwr', (big ? 1 / ratio : 1.81).toFixed(3));
    $('actions').innerHTML = actionsHtml(moves);
    var hand = S.players[HUMAN].hand;
    $('hand').innerHTML = hand.map(function (i, k) { return cardHtml(i, moves, k, hand.length); }).join('') || '<span class="empty">Your hand is empty.</span>';
    fitCards($('hand'));
    // Cards that weren't in the hand last time are dealt in from the deck.
    var ids = hand.map(function (i) { return i.id; }), fresh = handSeen ? ids.filter(function (id) { return handSeen.indexOf(id) < 0; }) : [];
    handSeen = ids;
    if (fresh.length && S.phase !== 'opening') Polish.drawn(fresh);
    var rh = resultHtml();
    if (rh !== lastResult) { lastResult = rh; $('result').innerHTML = rh; if (rh) Polish.payout($('result').querySelector('.plaque')); }
    announceTurn();
    var log = $('log'), recent = S.log.slice(-40);
    log.innerHTML = recent.map(function (l) { return '<div>T' + l.turn + ': ' + esc(l.text) + '</div>'; }).join('');
    log.scrollTop = log.scrollHeight;
    floats();
    if (S.tutorial) Tutorial.sync();
  }

  // Which other tiles a spell aimed at (r, c) reaches, as the engine's castAt resolves it.
  function reachOf(card, pi, r, c) {
    var a = card.aim;
    return E.aimArea(a, pi, r, c).slice(1).filter(function (p) {
      var u = S.units.filter(function (x) { return x.r === p.r && x.c === p.c; })[0];
      return !a.splash || a.spread || (u && (a.splashAll || u.owner !== pi));
    }).map(function (p) { return [p.r, p.c]; });
  }

  function tileEl(r, c) { return document.querySelector('#grid .tile[data-r="' + r + '"][data-c="' + c + '"]'); }

  // A spell or instant aimed at a tile, a unit or a summoner is thrown there first, then the move resolves and the board
  // redraws. A tile spell with its own tile effect looks like that effect; any other takes the look of its element.
  var LOOK_OF = { fire: 'burn', ice: 'frost', lightning: 'charge', vigil: 'holy', gnosis: 'arcane', dominion: 'blight', genesis: 'thorns' };
  var casting = false;
  function apply(m) {
    if (casting) return;
    if (S.tutorial && actor() === HUMAN && !Tutorial.allows(m)) { Sfx.play('not-allowed', { gap: 120 }); return render(); }
    var who = actor(), thrown = (m.type === 'cast' || m.type === 'respond') && (m.r !== undefined || m.target !== undefined || m.summoner !== undefined);
    var inHand = thrown && S.players[who].hand.filter(function (i) { return i.id === m.card; })[0];
    var spell = inHand && E.CARDS[inHand.c], el = spell && Polish.element(spell);
    var look = spell && (spell.type === 'spell' || spell.type === 'instant') && (spell.aim && (spell.aim.fx || spell.aim.tile) || LOOK_OF[el] || 'arcane');
    var unit = m.target !== undefined ? S.units.filter(function (u) { return u.uid === m.target; })[0] : null;
    var target = unit ? tileEl(unit.r, unit.c) : m.summoner !== undefined ? $(m.summoner === HUMAN ? 'youStrip' : 'themStrip') : m.r !== undefined ? tileEl(m.r, m.c) : null;
    if (look && target && SpellFX.enabled()) {
      var from = who === HUMAN ? document.querySelector('#hand .card[data-card="' + m.card + '"]') : $('themStrip');
      var onTile = !unit && m.summoner === undefined, reach = onTile && spell.aim ? reachOf(spell, who, m.r, m.c) : [];
      if (who === BOT) announce(m);
      var before = S;
      casting = true;
      sel = null;
      SpellFX.unaim(true);
      showReach();
      if (from && from.classList.contains('card')) from.classList.add('casting');
      Sfx.play('card-play');
      SpellFX.cast({
        kind: look, from: from || $('themStrip'), target: target, wave: !!(spell.aim && spell.aim.wave), volley: spell.id === 'cinderfall', shake: document.querySelector('.board'),
        push: who === (turned() ? 1 : 0) ? -1 : 1, gentle: !!unit && unit.owner === who,
        reach: reach.map(function (p) { return tileEl(p[0], p[1]); }),
        onLaunch: function () { if (from) { from.classList.remove('casting'); from.classList.add('spent'); } },
        onStage: function (stage, ms) {
          if (stage !== 'impact') return Sfx.spell(stage, el, ms / 1000);
          // The spell's own sound lands with it; the board catches up a moment later.
          var hit = Polish.castOf(spell, !!unit && unit.owner !== who);
          if (hit) Sfx.play(hit);
        }
      }).then(function () {
        casting = false;
        // A new game started while the spell was in the air: drop this move.
        if (S !== before) return;
        Polish.thrown();
        resolve(m);
        if (onTile) [[m.r, m.c]].concat(reach).forEach(function (p) { var t = tileEl(p[0], p[1]); if (t && t.classList.contains('fx')) t.classList.add('bloom'); });
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
  // What each side did this battle, for the summary. It rides on the state, so a saved campaign battle keeps it.
  function tally(prev, m) {
    var t = S.tally = S.tally || [{}, {}], bump = function (side, k, n) { side[k] = (side[k] || 0) + (n === undefined ? 1 : n); };
    var who = prev.pending ? prev.pending.responder : prev.active;
    var played = m.card !== undefined && m.type !== 'bottomCard' && prev.players[who].hand.filter(function (i) { return i.id === m.card; })[0];
    if (played && !S.players[who].hand.some(function (i) { return i.id === m.card; })) {
      var type = E.CARDS[played.c].type;
      bump(t[who], type === 'land' ? 'lands' : type === 'unit' ? 'units' : 'spells');
    }
    prev.units.forEach(function (u) { if (!S.units.some(function (x) { return x.uid === u.uid; })) bump(t[1 - u.owner], 'kills'); });
    [0, 1].forEach(function (pi) { var lost = prev.players[pi].life - S.players[pi].life; if (lost > 0) bump(t[1 - pi], 'damage', lost); });
  }
  // A battle pays once, when it ends. The key rides on the state, so reloading a finished battle doesn't pay it again.
  var payout = null;
  function reward() {
    if (sandbox || !S || S.winner === null || S.tutorial) return null;
    var run = chapterBattle ? Campaign.current() : null, story = run ? run.story : null;
    S.payKey = S.payKey || S.seed + '.' + S.firstPlayer;
    payout = Progress.battle({
      key: S.payKey, result: S.winner === 'draw' ? 'draw' : S.winner === HUMAN ? 'win' : 'loss', vs: chapterBattle ? (run ? run.player : 'bot') : online ? 'human' : oppPlayer,
      boost: story && Progress.cleared(story) ? 1.5 : 1, story: story, deck: S.players[HUMAN].name, opp: S.players[BOT].name, turns: S.turn,
      life: S.players[HUMAN].life, tally: (S.tally || [{}, {}])[HUMAN]
    });
    payout.vs = chapterBattle ? (run ? run.player : 'bot') : online ? 'human' : oppPlayer;
    payout.cleared = !!(story && Progress.cleared(story));
    return payout;
  }
  function resolve(m) {
    if (m.type === 'summon' || m.type === 'move' || m.r !== undefined) flash = [m.r, m.c]; else flash = null;
    var prev = S;
    S = E.applyMove(S, m);
    if (online) online.record(m, Net.stateHash(S));
    if (!sandbox && !S.tutorial) tally(prev, m);
    if (S.winner !== null && prev.winner === null) { reward(); if (online) online.finished(); }
    if (chapterBattle) {
      if (S.winner !== null) {
        // Beating the last chapter wins the campaign: its starter and picked cards the first time, gold after that.
        var done = Campaign.finish(S.winner);
        if (done && done.status === 'won') done.prize = Progress.campaignWon(done.story, Campaign.STORIES[done.story].starter, done.taken, done.seed);
      }
      else Campaign.saveBattle(S);
    }
    if (m.type === 'move' && S.units.some(function (u) { return u.uid === m.unit; }) && E.legalMoves(S).some(function (x) { return x.unit === m.unit; })) sel = { kind: 'unit', id: m.unit };
    else sel = null;
    render();
    Polish.moved(prev, S, m, HUMAN);
    schedule();
  }

  function schedule() {
    if (online) return pump();
    if (bothHands() || S.winner !== null || actor() !== BOT) return;
    var token = ++runToken;
    if (S.tutorial) playNext(token, function () { return Tutorial.enemyMove(S); });
    else if (modelOn() && !sandbox) modelStep(token);
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

  // The opponent's moves play out one at a time, like the bot's but quicker. Nothing plays while the battle is off screen.
  var pumpTimer = null;
  function pump() {
    if (!online || pumpTimer || casting || !S || S.winner !== null || $('app').hidden || actor() === HUMAN || !online.incoming()) return;
    var match = online;
    pumpTimer = setTimeout(function () {
      pumpTimer = null;
      var m = match === online && online.incoming();
      if (m && !casting && S.winner === null && actor() === BOT && !$('app').hidden) apply(m);
    }, 350);
  }
  // An online battle is rebuilt from its setup and every move so far, so a reloaded page picks up where it left off.
  function startOnline(match) {
    var st = match.setup;
    S = E.newGame({ seed: st.seed, decks: st.decks, first: st.first });
    // Each seat is paid under its own key, so two tabs of one account can play each other.
    S.payKey = 'o.' + st.mid + '.' + match.seat;
    match.log.forEach(function (m) { var prev = S; S = E.applyMove(S, m); tally(prev, m); });
    leaveTutorial();
    sandbox = false; chapterBattle = false;
    Screens.hide();
    start(S, match);
    resigned();
    if (match.battleHeard) return;
    match.battleHeard = true;
    match.on(function (what) {
      if (match !== online || !S) return;
      if (what === 'moves') return pump();
      if (what === 'over') resigned();
      if (!casting && !$('app').hidden) render();
    });
  }
  // A resignation ends the battle where it stands. Only the board can say who won otherwise.
  function resigned() {
    var o = online.over;
    if (!o || o.resigned === undefined || S.winner !== null) return;
    S.winner = 1 - o.resigned;
    S.resigned = o.resigned;
    reward();
  }

  function modelOn() { return !online && oppPlayer !== 'bot' && !!sample && !modelOff && !(S && S.tutorial); }

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
      addChat(code === 'rate_limited' ? 'Claude has reached a usage limit, so the scripted bot finishes this game.' :
        code === 'request_rejected' ? 'Anthropic turned down the request, often because the account is out of credit, so the scripted bot finishes this game.' :
        code === 'sign_in_needed' ? 'Your sign-in needs refreshing, so the scripted bot finishes this game. Sign out and in again from the main menu.' :
        code === 'not_invited' ? "This account isn't on the list for Claude opponents yet, so the scripted bot finishes this game." :
        "Claude isn't available here, so the scripted bot finishes this game.", true);
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
      if (m.type === 'ability' && m.r !== undefined) return !!sel.ability && (m.target === undefined || m.target === sel.abUnit) && m.r === r && m.c === c;
      if (m.type === 'relic') return !!u && m.target === u.uid;
      if (m.type === 'respond') return m.target === undefined && m.r === r && m.c === c;
      if (m.type === 'cast' && m.r !== undefined) return m.target === sel.castUnit && m.r === r && m.c === c;
      if (!u || m.target !== u.uid) return false;
      if (m.type === 'enchant' || m.type === 'attack' || m.type === 'cast') return true;
      return m.type === 'ability' && sel.ability;
    });
    if (sel && sel.ability) hit = hit.filter(function (m) { return m.type === 'ability'; });
    if (hit.length) return apply(hit[0]);
    if (!u && sel && sel.kind === 'card' && sm.some(function (m) { return m.type === 'summon' && m.target !== undefined && m.r === r && m.c === c; })) { sel.summonAt = { r: r, c: c }; return render(); }
    if (u && sel && sel.kind === 'card' && sm.some(function (m) { return m.r !== undefined && m.type === 'cast' && m.target === u.uid; })) { sel.castUnit = u.uid; return render(); }
    if (u && sel && sel.ability && sm.some(function (m) { return m.type === 'ability' && m.r !== undefined && m.target === u.uid; })) { sel.abUnit = u.uid; return render(); }
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

  // Clicking a unit's stacked shields fans them out and keeps them open through redraws; a second click stacks them again.
  // It only reads the shields, so the click goes no further.
  var fanAt = null;
  $('grid').addEventListener('click', function (e) {
    var t = e.target.closest('.tile');
    if (t && e.target.closest('.chips.stack')) {
      var fu = S.units.filter(function (x) { return x.r === +t.dataset.r && x.c === +t.dataset.c; })[0];
      fanAt = fu && fanAt !== fu.uid ? fu.uid : null;
      t.classList.toggle('fanned', fanAt !== null);
      return;
    }
    if (casting) return;
    SpellFX.unaim(true);
    if (t) clickTile(t);
  });
  $('hand').addEventListener('click', function (e) {
    var t = e.target.closest('.card');
    if (!t || casting || S.winner !== null || actor() !== HUMAN) return;
    var id = +t.dataset.card;
    // During a response window, or in the command phase, only a card with somewhere to aim can be picked up.
    if (S.pending || S.phase === 'command') {
      if (!aimable(humanMoves(), id)) return;
      sel = sel && sel.kind === 'card' && sel.id === id ? null : { kind: 'card', id: id };
      return render();
    }
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
    var m = selectedMoves(humanMoves()).filter(function (x) { return x.type === 'attackSummoner' || (x.type === 'cast' && x.summoner !== undefined); })[0];
    if (m) apply(m);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-do]');
    if (!b) return;
    var d = JSON.parse(b.getAttribute('data-do'));
    if ($('menu').open) $('menu').close();
    if (b.classList.contains('press')) {
      if (b.classList.contains('down')) return;
      b.classList.add('down');
      Sfx.play('button-press');
      return setTimeout(function () { if (b.isConnected) doAction(d); }, 170);
    }
    if (d.ui === 'new' || d.ui === 'decks' || d.ui === 'menu' || d.ui === 'campaign' || d.ui === 'packs' || d.ui === 'online') return Polish.lamp(function () { doAction(d); });
    doAction(d);
  });
  function doAction(d) {
    if (d.move) return apply(d.move);
    if (d.ui === 'new') return S && S.tutorial ? startTutorial() : sandbox ? startSandbox() : start();
    if (d.ui === 'decks') return showStart();
    if (d.ui === 'menu') return toMenu();
    if (d.ui === 'campaign') return toCampaign();
    if (d.ui === 'online') { toMenu(); return Screens.online(); }
    if (d.ui === 'packs') { toMenu(); return Collection.page('packs'); }
    if (d.ui === 'stopModel') { if (thinking) thinking.abort(); return; }
    if (d.ui === 'clear') sel = null;
    if (d.ui === 'ability') sel.ability = true;
    if (d.ui === 'noAbility') { sel.ability = false; sel.abUnit = null; }
    if (d.ui === 'relic') sel = { kind: 'relic', id: d.id };
    if (d.ui === 'pick') sel = { kind: 'card', id: d.id };
    if (d.ui === 'skip' && S.tutorial && !Tutorial.allows({ type: 'endTurn' })) { Sfx.play('not-allowed', { gap: 120 }); return render(); }
    if (d.ui === 'skip') { S = E.applyMove(S, { type: 'toCommand' }); if (online) online.record({ type: 'toCommand' }, Net.stateHash(S)); sel = null; return apply({ type: 'endTurn' }); }
    render();
  }
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
    $('menuNote').textContent = online ? 'If you leave, the match waits for you under Multiplayer. Resigning ends it as a loss.' : chapterBattle ? 'Your run is saved after every move, so this battle waits on the map.' : S.tutorial ? 'Restart begins the tutorial again. You can also find it on the main menu.' : 'If you leave, this battle waits until you begin another.';
    $('menuRestart').hidden = chapterBattle || !!online;
    $('menuDecks').hidden = chapterBattle || !!S.tutorial || !!online;
    $('menuMap').hidden = !chapterBattle;
    $('menuQuit').hidden = !chapterBattle && !(online && S.winner === null);
    $('menuQuit').textContent = online ? 'Resign' : 'Quit the run';
    $('menuQuit').classList.remove('danger');
    $('menu').showModal();
  });
  // Quitting a campaign battle ends the run, so the first press only asks.
  $('menuQuit').addEventListener('click', function () {
    var b = $('menuQuit');
    if (online) {
      if (!b.classList.contains('danger')) {
        b.classList.add('danger');
        b.textContent = 'Resign for good';
        return;
      }
      $('menu').close();
      online.resign();
      resigned();
      return render();
    }
    if (!b.classList.contains('danger')) {
      b.classList.add('danger');
      b.textContent = 'End the run for good';
      $('menuNote').textContent = 'Quitting ends this run, the same as losing this battle.';
      return;
    }
    $('menu').close();
    Campaign.abandon();
    Polish.lamp(toCampaign);
  });
  $('menu').addEventListener('click', function (e) { if (e.target.closest('[data-close]')) $('menu').close(); });
  $('peekBtn').addEventListener('click', function () { $('inspect').classList.add('open'); $('inspect').focus(); });
  $('inspect').addEventListener('click', closePeek);
  // On a phone (phone.css), holding anything with a card behind it brings that card up large on the left until you let go.
  // The tap that ends a hold does nothing else, and a finger that slides away first is not a hold.
  var PHONE = window.matchMedia('(max-width: 820px) and (orientation: portrait), (max-height: 470px) and (orientation: landscape)');
  var holdTimer = null, holdAt = null, holding = false, swallow = false, heldEl = document.createElement('div');
  heldEl.className = 'held';
  heldEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(heldEl);
  function endHold() {
    clearTimeout(holdTimer);
    holdAt = null;
    if (!holding) return;
    holding = false;
    swallow = true;
    setTimeout(function () { swallow = false; }, 400);
    heldEl.classList.remove('on');
  }
  $('app').addEventListener('pointerdown', function (e) {
    var t = e.target.closest('[data-peek]');
    // With Help on, a hold shows that thing's tip instead (help.js).
    if (!PHONE.matches || !t || e.button > 0 || (Help.on() && Help.tipFor(e.target))) return;
    holdAt = [e.clientX, e.clientY];
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () {
      holding = true;
      heldEl.innerHTML = '<div class="slot">' + frameHtml(E.CARDS[t.dataset.peek], { big: true }) + '</div>';
      heldEl.classList.add('on');
      fitCards(heldEl);
    }, 380);
  });
  $('app').addEventListener('pointermove', function (e) {
    if (holdAt && !holding && Math.abs(e.clientX - holdAt[0]) + Math.abs(e.clientY - holdAt[1]) > 14) { clearTimeout(holdTimer); holdAt = null; }
  });
  ['pointerup', 'pointercancel'].forEach(function (type) { document.addEventListener(type, endHold); });
  document.addEventListener('click', function (e) { if (swallow) { swallow = false; e.preventDefault(); e.stopPropagation(); } }, true);
  $('app').addEventListener('contextmenu', function (e) { if (PHONE.matches && e.target.closest('[data-peek]')) e.preventDefault(); });
  // The phone's menu also holds the rules, which close with a tap.
  $('menuRules').addEventListener('click', function () { $('menu').close(); setDrawer('rulesPanel'); });
  $('rulesPanel').addEventListener('click', function () { if (PHONE.matches) setDrawer(null); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePeek(); setDrawer(null); } });

  function deckHtml(d, role) {
    if (d.id === 'random') return '<button type="button" class="deck N random" data-role="opp" data-deck="random" aria-pressed="' + (picks.opp === 'random') + '"><span class="pic"><img src="art/web/ui/card-back.jpg" alt="" draggable="false"></span>' +
      '<span class="nm">Random deck</span><span class="ty">Any alignment</span><span class="ds">A different starter, theme or saved deck each game.</span></button>';
    var short = role === 'mine' && !d.open ? Progress.missing(d.list) : 0, problems = E.deckProblems(d.list).concat(short ? ['Missing ' + short + ' card' + (short === 1 ? '' : 's') + ' you don\'t own'] : []), colours = d.starter ? E.DECKS[d.id].colours : E.deckColours(d.list), main = colours[0] || 'N', on = picks[role] === d.id;
    var art = d.starter ? (noArt[DECK_ART[d.id]] ? null : artSrc(DECK_ART[d.id])) : Screens.coverArt(d.list);
    return '<button type="button" class="deck ' + main + '" data-role="' + role + '" data-deck="' + esc(d.id) + '" aria-pressed="' + on + '"' + (problems.length ? ' disabled' : '') + '>' +
      '<span class="pic">' + (art ? '<img src="' + art + '" alt="" draggable="false">' : '') + '</span>' +
      '<span class="nm">' + esc(d.name) + '</span>' +
      '<span class="ty">' + colours.map(sym).join('') + ALIGNMENT[main] + ' · ' + E.deckSize(d.list) + ' cards</span>' +
      '<span class="ds">' + esc(Help.deck(d)) + '</span>' + (d.open && role === 'mine' ? '<span class="ds">Open to everyone. Playing it doesn\'t add its cards to your collection.</span>' : '') + (problems.length ? '<span class="ds miss">' + esc(problems[0]) + '</span>' : '') + '</button>';
  }
  function playable(d) { return !E.deckProblems(d.list).length; }
  function playerHtml(key, label, blurb, enabled) {
    return '<button type="button" class="who-plays" data-player="' + key + '" aria-pressed="' + (oppPlayer === key) + '"' + (enabled ? '' : ' disabled') + '><b>' + label + '</b><span>' + blurb + '</span></button>';
  }
  function renderStart() {
    var all = Decks.saved().concat(Decks.starters(), Decks.themes());
    $('myDecks').innerHTML = all.map(function (d) { return deckHtml(d, 'mine'); }).join('');
    var mine = Decks.find(picks.mine), main = mine ? (mine.starter ? E.DECKS[mine.id].colours : E.deckColours(mine.list))[0] || 'N' : null;
    $('myNote').innerHTML = main ? sym(main) + '<b>' + ALIGNMENT[main] + '.</b> ' + esc(Help.alignment(main)) : '';
    $('oppDecks').innerHTML = deckHtml({ id: 'random' }, 'opp') + all.filter(playable).map(function (d) { return deckHtml(d, 'opp'); }).join('');
    $('oppPlayer').innerHTML = playerHtml('bot', 'Scripted bot', 'Plays instantly, with fixed habits.', true) +
      ['easy', 'normal', 'hard'].map(function (k) { return playerHtml(k, 'Claude: ' + AI.levels[k].label, AI.levels[k].blurb, !!sample); }).join('');
    $('playerNote').textContent = hosted ? (sample ? 'Claude opponents make about a dozen requests a game and take a little while to think.' : '') :
      sample ? 'Claude opponents use your own Claude usage, about a dozen requests a game, and take a little while to think.' : 'Claude opponents work only on the published page inside Claude.';
    $('keyBox').hidden = !hosted;
    if (hosted) $('keyBox').innerHTML = keyHtml();
  }
  function keyHtml() {
    if (!OwnKey.has()) return '<p class="player-note"><b>Sign in from the main menu to play Claude here.</b></p>';
    var m = OwnKey.model();
    return '<div class="keyrow"><label>Claude model <select id="keyModel">' + OwnKey.MODELS.map(function (o) {
      return '<option value="' + o.id + '"' + (o.id === m.id ? ' selected' : '') + '>' + o.label + '</option>';
    }).join('') + '</select></label></div><p class="player-note">' + esc(m.note) + ' Spent in this browser so far: about $' + OwnKey.spent().toFixed(2) + '.</p>';
  }
  // The start screen is the exhibition setup. A battle in progress waits here until a new one begins.
  function showStart(mine) {
    leaveTutorial();
    runToken++;
    stopThinking();
    if (chapterBattle) oppPlayer = exhibitionPlayer;
    var last = Decks.picks(), ready = function (id) { var d = id && Decks.find(id); return d && playable(d) ? id : null; };
    var yours = function (id) { var d = ready(id) && Decks.find(id); return d && Decks.yours(d) ? id : null; };
    var newest = Decks.saved().filter(function (d) { return yours(d.id); })[0];
    picks = { mine: yours(mine) || yours(last.mine) || (newest ? newest.id : yours(Progress.state().starter) || 'white'), opp: last.opp === 'random' ? 'random' : ready(last.opp) || 'red' };
    Screens.hide();
    $('app').hidden = true;
    $('start').hidden = false;
    renderStart();
    $('begin').focus();
  }
  function toMenu() {
    leaveTutorial();
    runToken++;
    stopThinking();
    $('app').hidden = true;
    $('start').hidden = true;
    Screens.menu();
  }
  function toCampaign() {
    leaveTutorial();
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
    if (id === 'random') {
      var any = Decks.saved().concat(Decks.starters(), Decks.themes()).filter(playable);
      id = any[Math.floor(Math.random() * any.length)].id;
    }
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
      var mine = Decks.find(picks.mine);
      if (!mine || !Decks.yours(mine)) return;
      Decks.setPicks(picks);
      chapterBattle = false;
      sandbox = false;
      decks = [forGame(picks.mine), forGame(picks.opp)];
      Polish.lamp(function () { start(); });
    }
    if (e.target.closest('#startBack')) Polish.lamp(toMenu);
    if (e.target.closest('#startBuilder')) Polish.lamp(function () { $('start').hidden = true; Screens.builder(); });
  });
  $('start').addEventListener('change', function (e) {
    if (e.target.id === 'keyModel') { OwnKey.setModel(e.target.value); renderStart(); }
  });

  function start(state, match) {
    runToken++;
    if (online && online !== match) online.close();
    online = match || null;
    stopThinking();
    plan = null; modelOff = false; lastThought = null; payout = null; lastResult = null;
    $('chat').textContent = '';
    $('chatBox').hidden = true;
    $('speech').hidden = true;
    Debug.reset();
    sel = null; flash = null; lifeSeen = {}; handSeen = null;
    HUMAN = online ? online.seat : 0; BOT = 1 - HUMAN;
    $('testBtn').hidden = !sandbox;
    setDrawer(null);
    $('start').hidden = true;
    $('app').hidden = false;
    lastTurn = null;
    $('turnBanner').innerHTML = '';
    $('debugBtn').hidden = !(debugOn && modelOn());
    S = state || E.newGame({ seed: Math.floor(Math.random() * 2147483647), decks: decks || [forGame(picks.mine), forGame(picks.opp)], first: Math.random() < 0.5 ? 0 : 1 });
    if (!S.tutorial) Tutorial.stop();
    S.players.forEach(function (p) { p.hand.concat(p.deck).forEach(function (k) { warmArt(k.c); }); });
    var opening = S.players[HUMAN].hand[0];
    if (opening && S.winner === null) showCard(opening.c, 'In your hand');
    if (!state) Sfx.play('shuffle');
    render();
    schedule();
  }

  // The tutorial is a set battle that never pays or saves. Leaving it drops the battle, so the menu has nothing to continue.
  function startTutorial() {
    chapterBattle = false;
    sandbox = false;
    start(Tutorial.build());
    Tutorial.begin({
      state: function () { return S; }, sel: function () { return sel; }, render: render,
      restart: function () { Polish.lamp(startTutorial); }, leave: function () { Polish.lamp(toMenu); }
    });
  }
  function leaveTutorial() {
    if (!S || !S.tutorial) return;
    Tutorial.stop();
    S = null;
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
    $('testOpp').innerHTML = [[false, 'You play both'], [true, 'Scripted bot']].map(function (o) {
      return '<button type="button" class="step' + (testBot === o[0] ? ' on' : '') + '" data-bot="' + o[0] + '" aria-pressed="' + (testBot === o[0]) + '">' + o[1] + '</button>';
    }).join('');
    $('testSides').innerHTML = [0, 1].map(function (pi) {
      return '<button type="button" class="step' + (testSide === pi ? ' on' : '') + '" data-side="' + pi + '" aria-pressed="' + (testSide === pi) + '">' +
        (pi === 0 ? 'You (bottom)' : 'Opponent (top)') + '</button>';
    }).join('');
    $('testKinds').innerHTML = TEST_KINDS.map(function (k) {
      return '<button type="button" class="step' + (testKind === k[0] ? ' on' : '') + '" data-kind="' + k[0] + '" aria-pressed="' + (testKind === k[0]) + '">' + k[1] + '</button>';
    }).join('');
    var keep = TEST_KINDS.filter(function (k) { return k[0] === testKind; })[0][2];
    var ids = Object.keys(E.CARDS).filter(function (id) {
      var c = E.CARDS[id];
      return !c.token && keep(c) && (!q || (c.name + ' ' + (c.text || '') + ' ' + (TYPES[c.type] || c.type) + ' ' + (ALIGNMENT[c.colour] || '') + ' ' + (c.keywords || []).join(' ')).toLowerCase().indexOf(q) >= 0);
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
    var b = e.target.closest('[data-add], [data-side], [data-kind], [data-test], [data-bot]');
    if (!b || !S) return;
    if (b.dataset.test === 'close') return setDrawer(null);
    if (b.dataset.bot) {
      // With the bot on you keep the bottom side; it takes over the top, mid-turn if need be.
      testBot = b.dataset.bot === 'true';
      if (testBot) { HUMAN = 0; BOT = 1; sel = null; }
      testNote(testBot ? 'the scripted bot plays the top side.' : 'you play both sides.');
      renderPicker();
      render();
      return schedule();
    }
    if (b.dataset.side) { testSide = +b.dataset.side; return renderPicker(); }
    if (b.dataset.kind !== undefined) { testKind = b.dataset.kind; return renderPicker(); }
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
    else if (data && data.online && Net.saved()) startOnline(Net.resume());
    else if (data && data.state && data.state.players.every(function (p) { return p.life <= E.START_LIFE; })) { sandbox = !!data.sandbox; start(data.state); if (sandbox) renderPicker(); }
    else Screens.menu();
  }
  window.GameUI = {
    frameHtml: frameHtml, fitCards: fitCards, ALIGNMENT: ALIGNMENT, TYPES: TYPES,
    deckArt: function (k) { return noArt[DECK_ART[k]] ? null : artSrc(DECK_ART[k]); }, deckNote: function (k) { return Help.deck({ id: k }); },
    artUrl: function (id) { return ART[id] && !noArt[id] ? artSrc(id) : null; },
    warmAllArt: function () { trickle(6); },
    showStart: showStart, playChapter: playChapter, online: startOnline, inOnline: function () { return !!online && !!S && S.winner === null; }, sandbox: startSandbox, tutorial: startTutorial,
    modelReady: function () { return !!sample; },
    inProgress: function () { return !!S && S.winner === null && !chapterBattle && !S.tutorial; },
    resume: function () { $('app').hidden = false; render(); schedule(); }
  };
  var hot = window.claude && window.claude.hot;
  if (hot) hot.snapshot(function () { return { state: S && (S.tutorial || online) ? null : S, chapter: chapterBattle, sandbox: sandbox, online: !!online && S.winner === null }; });
  // Only a page reopened on a new version has a battle to carry over. Waiting on hot.ready otherwise keeps a first visit dark for five seconds.
  if (hot && hot.ready && hot.from) hot.ready(boot);
  else boot({});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (S) render(); });
  // Card names are measured, so every card on the page fits again once a font arrives.
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { fitCards(document); });
  window.__game = { get state() { return S; }, load: start, setSample: function (fn) { sample = fn; refreshStart(); }, setPlayer: function (key) { oppPlayer = key; refreshStart(); }, setDebug: function (on) { debugOn = on; } };
})();
