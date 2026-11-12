// Explanations for new players: a sentence on each deck's plan, each alignment's strengths, a line from inside each faction,
// and help mode. While help mode is on, pointing at anything on the battle table or in the deck builder shows a short tip;
// on a touch screen, press and hold it, or tap a label that does nothing else. Help mode never stops a move: a tip only
// appears on hover, on a hold, or on a tap that had nothing else to do. Whether it's on is kept in the browser, per viewer.
var Help = (function () {
  var E = Engine, KEY = 'breachline-help';

  // One sentence per starter and theme deck, by deck id. Saved decks show their main alignment's line instead.
  var DECKS = {
    white: 'Advance as one line: your lion folk and knights hit harder and take less damage beside each other, and clerics keep them standing.',
    red: 'Strike first and fast: cheap raiders charge in, fire spells clear the way, and giants and a dragon finish the job before your fragile army wears down.',
    blue: 'Fight from a distance: hold the enemy back with decoys and frost while Ranged and Longshot units shoot from where melee units can\'t strike back.',
    black: 'Win the long trade: Drain heals your nobles as they fight, Carrion units grow as anything dies, and some cards cost your own life for an early edge.',
    green: 'Play extra lands and growing units early, then win with beasts bigger than anything the enemy can match.',
    'theme-devotion': 'Keep healing: every heal makes your Devotion units permanently stronger, so a cleric beside them turns a slow army into a hard one.',
    'theme-armed': 'Equip your soldiers early: equipment makes its bearer stronger, and Armed units get another +1 / +1 while they carry it.',
    'theme-lit': 'Lit units explode when they die, so trade them into the enemy line and fight on the burning ground they leave.',
    'theme-burn': 'Race the summoner: rush fast units forward, then finish with spells that hit the enemy summoner directly.',
    'theme-winter': 'Freeze and snare enemies in place, then wear them down with ranged attackers before they reach you.',
    'theme-longshot': 'Set up behind a screen: Longshot units reach 3 tiles if they haven\'t moved, and pick off whatever comes close.',
    'theme-carrion': 'Spend your own units: sacrifices fuel your strongest cards, and Carrion units gain attack each time anything dies.',
    'theme-charm': 'Turn the enemy\'s army against them: charm and buy their units, strike from hiding with Veiled killers, and Drain life back.',
    'theme-rootfed': 'Play every land you can, because each Overgrown ruin grows your Rootfed beasts until they outclass the board.',
    'theme-thorns': 'Control the ground: thorns and Holding ground stop enemies where you want them, and ambushers hit them from the side.',
    'theme-giants': 'Extra lands early let you summon hill giants, chieftains and the Elder dragon turns before the enemy expects them.',
    'theme-levy': 'Flood the board with cheap militia, prides and goblins, then lift them all with drummers. Beware area spells.',
    'theme-firstblood': 'Fast raiders and hunters land the first wounds, and Venom from the Court\'s assassins kills whatever they wound.',
    'theme-funeral': 'Let cheap followers die on purpose, because every death feeds your harvesters, colossi and the Ossuary engine.',
    'theme-overwall': 'Fliers and fast raiders skip the front line and go straight for the enemy back row and summoner.',
    'theme-intofire': 'Set the ground burning, then push enemies into it with Brightlance and the choristers.'
  };

  // Strengths, then the weakness.
  var ALIGNMENTS = {
    W: 'Strong together: healing, Guard and bonuses for standing side by side. Slow to deal damage and reach the summoner.',
    U: 'Control from range: Ranged attacks, freezing, moving enemies and drawing cards. Small, fragile units.',
    B: 'Wins trades at a price: Drain, killing units outright, sacrifice and raising the dead. Pays with its own life and units.',
    R: 'Fast and hard-hitting: high attack, direct damage, speed, fliers and giants. Little defence or healing.',
    G: 'Big and growing: extra lands, units that grow and huge beasts. Few instants, and exposed to fliers and ranged attacks.',
    N: 'Neutral cards fit any deck: weaker than the alignments\' best, but reliable.'
  };

  // A line from inside each faction, in the world's own voice. Lines are in FLAVOUR.md.
  var FACTIONS = {
    sunmane: { line: 'Every oath here was sworn to someone long dead. Every one is kept.' },
    stillflame: { line: 'She has prayed every dawn for forty years. She heals the sick in between.' },
    conclave: { line: 'Every answer we have was once forbidden.', by: 'Conclave lecture' },
    artificers: { line: 'Built to lift stone. Then to lift more. Then to throw it.' },
    ashen: { line: 'Your debts have been transferred to the Court. So have you.' },
    gravebound: { line: 'They carry the bones down. Nothing is carried up.' },
    warhorde: { line: 'The chief is whoever stood up last.', by: 'Warhorde custom' },
    cinder: { line: 'We chose her at the fire. We can unchoose her at the next.', by: 'Cinder Clan saying' },
    thornwardens: { line: 'They plant two for every one you cut. Then they find you.' },
    herd: { line: 'The herd decides where the village is this year.' }
  };

  var TYPES = {
    land: 'Land: play one a turn. Each gives 1 mana every turn, in its alignment\'s colour.',
    unit: 'Unit: fights on the grid. It enters on your back row and waits a turn.',
    spell: 'Spell: cast in your play step, then it\'s gone.',
    instant: 'Instant: cast it any time, even on the enemy\'s turn, if you kept the mana.',
    enchant: 'Enchantment: attaches to a unit on either side, and goes when that unit dies. Equipment is the kind that\'s an object.',
    relic: 'Relic: stays beside your summoner, off the grid, with a lasting effect.'
  };

  // Conditions a unit can be under. Keywords are read from the cards' own rules text, so they stay current.
  var STATES = {
    Held: 'Held: it can\'t move until its next turn ends.',
    Frozen: 'Frozen: it can\'t move on its next turn.',
    Veiled: 'Veiled: it can\'t be attacked or targeted by enemy cards until it attacks.',
    Lit: 'Lit: fire doesn\'t hurt it, and when it dies it explodes, hurting the units next to it.',
    'Between moments': 'Between moments: it can\'t move, attack or use abilities, and it can\'t be attacked.',
    Restrained: 'Restrained: -2 attack until the end of its next turn.',
    Braced: 'Braced: it takes 2 less damage from attacks this turn.',
    Charmed: 'Charmed: it fights for the side that charmed it, for now.',
    Borrowed: 'Borrowed: it fights for the other side until the borrowing ends.',
    Fades: 'Fades: it vanishes at the start of its owner\'s turn.',
    Watching: 'Watching: it stood still, so it strikes the first enemy to end a move in its reach.',
    Waiting: 'Waiting: summoned this turn. It can act from your next turn.',
    Done: 'Done: it has acted this turn.'
  };
  var GENERIC = {
    Loyal: 'Loyal: +1 attack and +1 health while you have another unit of its faction on the board.',
    Grows: 'Grows: gains attack and health at the start of your turn, a few times.',
    Charge: 'Charge: moves 1 extra tile on its first move.',
    Errant: 'Errant: the units it summons land on a random tile of your back row.'
  };
  var TILES = {
    burn: 'Burning ground: 1 damage to a unit that ends a move here or starts its turn here, unless it\'s Fireproof.',
    thorns: 'Thorns: a unit that enters must stop and takes 1 damage. Alderkin aren\'t affected.',
    frost: 'Frozen ground: a unit standing here can\'t move.',
    snare: 'Snare: the first enemy to enter is caught and can\'t move on its next turn.',
    blight: 'Blighted ground: units here have -1 attack.',
    holy: 'Consecrated ground: its owner\'s unit here takes 1 less damage and recovers 1 health each turn.',
    charge: 'Charged ground: the next unit to enter takes 2 damage.'
  };

  var glossary = null;
  function readGlossary() {
    glossary = {};
    Object.keys(E.CARDS).forEach(function (id) {
      (E.CARDS[id].text || '').split(/\. (?=[A-Z])/).forEach(function (s) {
        var m = /^([A-Z][A-Za-z' -]{1,24}): (.+?)\.?$/.exec(s);
        if (m && !glossary[m[1]] && !/^(When|Aim|Enchant|Equip|Ability)/.test(m[1])) glossary[m[1]] = m[1] + ': ' + m[2] + '.';
      });
    });
  }
  // A keyword's meaning, from this card's own text when it has one (Carrion's cap differs between cards).
  function keyword(name, cardId) {
    var word = name.replace(/ [+\d].*$/, '');
    if (STATES[word]) return STATES[word];
    var own = cardId && E.CARDS[cardId] && E.CARDS[cardId].text, m = own && new RegExp('(?:^|\\. )' + word + ': ([^.]+)').exec(own);
    if (m) return word + ': ' + m[1] + '.';
    if (GENERIC[word]) return GENERIC[word];
    if (!glossary) readGlossary();
    if (glossary[word]) return glossary[word];
    var c = Object.keys(E.CARDS).map(function (k) { return E.CARDS[k]; }).filter(function (x) { return x.name === word; })[0];
    if (c) return word + ': ' + c.text;
    if (/this turn$/.test(name)) return name + ': extra attack until the end of this turn.';
    if (/move$/.test(name)) return name + ': it can move further this turn.';
    return '';
  }

  function deck(d) {
    if (d && DECKS[d.id]) return DECKS[d.id];
    var main = d && d.list ? (E.deckColours(d.list)[0] || 'N') : 'N';
    return ALIGNMENTS[main];
  }
  function alignment(colour) { return ALIGNMENTS[colour] || ''; }
  function faction(id) {
    var f = E.FACTIONS.filter(function (x) { return x.id === id; })[0], l = FACTIONS[id];
    return f && l ? { name: f.name, colour: f.colour, line: l.line, by: l.by || '' } : null;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function factionHtml(id) {
    var f = faction(id);
    if (!f) return '';
    return '<span class="hfac"><b>' + esc(f.name) + '</b> <q>' + esc(f.line) + '</q>' + (f.by ? ' <small>' + esc(f.by) + '</small>' : '') + '</span>';
  }

  // Help mode

  var on = false;
  try { on = localStorage.getItem(KEY) === 'on'; } catch (e) {}
  var touchy = window.matchMedia && window.matchMedia('(hover: none)').matches;
  function button() {
    return '<button type="button" class="btn helpbtn" data-help-toggle aria-pressed="' + on + '" title="Help mode: short explanations of what\'s on screen">Help</button>';
  }
  function set(v) {
    on = !!v;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
    document.body.classList.toggle('help-on', on);
    Array.prototype.forEach.call(document.querySelectorAll('[data-help-toggle]'), function (b) { b.setAttribute('aria-pressed', on); });
  }

  var ALIGN = { W: 'Vigil', U: 'Gnosis', B: 'Dominion', R: 'Fervor', G: 'Genesis', N: 'Neutral' };
  function colourOf(el, list) { for (var i = 0; i < list.length; i++) if (el.classList.contains(list[i])) return list[i]; return null; }
  function you(el) { var p = el.closest('.plate'); return p && p.classList.contains('you'); }
  function arg(el, group) { var a = el.getAttribute('data-arg') || ''; return a.indexOf(group + ':') === 0 ? a.slice(group.length + 1) : null; }
  function rows() { return E.ROWS; }
  function rowNote(r) {
    if (r === rows() - 1) return 'Your back row: your new units arrive here.';
    if (r === 0) return 'The enemy\'s back row: a unit of yours standing here can strike the enemy summoner.';
    return '';
  }
  function cardOfTile(t) { return t.getAttribute('data-peek'); }

  // Each rule: a selector, and the tip for the element it matched. The first rule an element or its ancestor matches wins.
  var RULES = [
    ['[data-help-toggle]', function () { return on ? (touchy ? 'Help is on. Hold anything to see what it is, or tap a label.' : 'Help is on. Point at anything to see what it is.') + ' Press again to turn it off.' : 'Turn on help mode for short explanations of what\'s on screen.'; }],
    ['.rowcap', function (el) { return el.getAttribute('data-tip'); }],
    ['.plate .life', function (el) { return you(el) ? 'Your life, a nail for each point. At 0 you lose.' : 'The enemy summoner\'s life. Bring it from ' + E.START_LIFE + ' to 0 to win.'; }],
    ['.plate .gem', function (el) { var c = colourOf(el, ['W', 'U', 'B', 'R', 'G']); return (c ? 'A ' + ALIGN[c] + ' land. ' : '') + 'Each land gives 1 mana a turn. Bright gems are mana left this turn; dark ones are spent. Cards of this colour need lands of it, and each one short adds 1 to the cost.'; }],
    ['.plate .mana', function (el) { return (you(el) ? 'Your mana' : 'The enemy\'s mana') + ' left this turn, out of one per land. Mana left at the end of a turn can pay for instants on the other side\'s turn.'; }],
    ['.plate .pile', function (el) {
      var t = (el.querySelector('small') || {}).textContent;
      if (t === 'Hand') return 'Cards in the enemy\'s hand, hidden from you.';
      if (t === 'Deck') return 'Cards left in the deck. Each player draws one a turn.';
      return 'The discard pile: spent spells and fallen units. When the deck runs out, these are shuffled back in.';
    }],
    ['.plate .relic', function () { return 'A relic: it stays beside its summoner, off the grid, with a lasting effect.'; }],
    ['.plate .strike', function () { return 'Your selected unit is on the enemy back row, so it can strike the summoner.'; }],
    ['.plate', function (el) { return you(el) ? 'You, the summoner. An enemy unit on your back row can strike you.' : 'The enemy summoner, unseen across the table. Only a unit on their back row, the top row, can strike them.'; }],
    ['#phases .step', function (el) {
      return /Play/.test(el.textContent) ? 'Play step: play one land, then cast spells and summon units with your mana.'
        : 'Command step: each unit can move, then attack or use an ability. Only instants can be cast now.';
    }],
    ['#phases .turn', function () { return 'Whose turn it is. Each turn has a play step, then a command step.'; }],
    ['#actions .press', function (el) { return el.classList.contains('foe') ? 'The enemy is taking its turn. You can answer some of its moves with instants.' : 'End your turn. Mana you leave unspent can pay for instants during the enemy\'s turn.'; }],
    ['#actions [data-do*="toCommand"]', function () { return 'Finish playing cards and start commanding your units.'; }],
    ['.tile .shd', function (el) {
      var t = el.getAttribute('data-t') || '', id = cardOfTile(el.closest('.tile'));
      if (el.classList.contains('more')) return t.split(', ').map(function (k) { return keyword(k, id) || k; }).join(' ');
      return keyword(t, id) || t;
    }],
    ['.tile .badge.atk', function (el) { return 'Attack: the damage this unit deals.' + (el.classList.contains('up') ? ' Raised above the card\'s own.' : el.classList.contains('down') ? ' Lowered below the card\'s own.' : ''); }],
    ['.tile .badge.hp', function (el) { return 'Health: damage stays until healed, and at 0 the unit is destroyed.' + (el.classList.contains('hurt') ? ' This one is wounded.' : ''); }],
    ['.tile .tfx', function (el) { var t = el.closest('.tile'), k = Object.keys(TILES).filter(function (x) { return t.classList.contains('fx-' + x); })[0]; return (k ? TILES[k] + ' ' : '') + (el.getAttribute('title') || ''); }],
    ['.tile', function (el) {
      var r = +el.getAttribute('data-r'), row = rowNote(r);
      if (!el.classList.contains('own') && !el.classList.contains('enemy')) return row;
      var mine = el.classList.contains('own');
      var st = el.classList.contains('waiting') ? STATES.Waiting + ' ' : el.classList.contains('done') ? STATES.Done + ' ' : '';
      return (mine ? 'Your unit. ' + st + 'Select it to move it, then attack or use an ability.' : 'An enemy unit. ' + st) +
        ' Its small shields are keywords and conditions; the plaques are attack and health.';
    }],
    ['#hand .card .cost, .pcard .cost', function () { return 'Cost in mana. Each land you\'re short of the colour it wants adds 1.'; }],
    ['#hand .card', function () { return 'A card in your hand. Select it, then pick where it goes.'; }],
    ['[data-panel="logPanel"]', function () { return 'The Chronicle: everything that has happened this battle.'; }],
    ['[data-panel="rulesPanel"]', function () { return 'The rules in brief, and what\'s on the table.'; }],
    ['.chip', function (el) {
      var c = arg(el, 'colour'), f = arg(el, 'faction'), t = arg(el, 'type');
      if (c) return ALIGN[c] + ': ' + alignment(c);
      if (f && f !== 'none') { var x = faction(f); return x ? x.name + ': "' + x.line + '"' + (x.by ? ' (' + x.by + ')' : '') : ''; }
      if (t) return TYPES[t] || '';
      return '';
    }],
    ['.pcard .qty', function () { return 'Copies in your deck. A deck holds up to 3 of any card except lands.'; }],
    ['#start .deck .ty', function (el) { var d = el.closest('.deck'), c = colourOf(d, ['W', 'U', 'B', 'R', 'G', 'N']); return c ? ALIGN[c] + ': ' + alignment(c) : ''; }]
  ];
  function tipFor(target) {
    for (var el = target; el && el !== document.body; el = el.parentElement) {
      for (var i = 0; i < RULES.length; i++) {
        if (el.matches && el.matches(RULES[i][0])) { var t = RULES[i][1](el); if (t) return { el: el, text: t }; }
      }
    }
    return null;
  }

  var box = null, showTimer = null, holdTimer = null, shownFor = null, swallow = false, start = null;
  function show(el, text) {
    if (!box) { box = document.createElement('div'); box.className = 'helptip'; box.setAttribute('role', 'tooltip'); document.body.appendChild(box); }
    box.textContent = text;
    box.hidden = false;
    var r = el.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var x = Math.max(8, Math.min(vw - w - 8, r.left + r.width / 2 - w / 2)), y = r.top - h - 8;
    if (y < 8) y = Math.min(vh - h - 8, r.bottom + 8);
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    shownFor = el;
  }
  function hide() { clearTimeout(showTimer); if (box) box.hidden = true; shownFor = null; }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-help-toggle]');
    if (!b) return;
    set(!on);
    if (on) show(b, RULES[0][1]()); else hide();
    if (on) { clearTimeout(showTimer); showTimer = setTimeout(hide, 3500); }
  });
  // With a mouse: point at something and the tip follows shortly.
  document.addEventListener('pointerover', function (e) {
    if (!on || e.pointerType !== 'mouse') return;
    var t = tipFor(e.target);
    if (!t) return hide();
    if (shownFor === t.el) return;
    clearTimeout(showTimer);
    showTimer = setTimeout(function () { if (t.el.isConnected) show(t.el, t.text); }, 250);
  });
  document.addEventListener('pointerout', function (e) {
    if (e.pointerType === 'mouse' && shownFor && !(e.relatedTarget && shownFor.contains(e.relatedTarget))) hide();
  });
  // On a touch screen: hold to see a tip without acting, or tap a label that does nothing else.
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') { if (!e.target.closest('[data-help-toggle]')) hide(); return; }
    if (!e.target.closest('[data-help-toggle]')) hide();
    if (!on) return;
    var t = tipFor(e.target);
    if (!t) return;
    start = { x: e.clientX, y: e.clientY, t: t };
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () { swallow = true; show(t.el, t.text); start = null; }, 450);
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (start && Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) > 12) { clearTimeout(holdTimer); start = null; }
  }, true);
  document.addEventListener('pointerup', function () {
    clearTimeout(holdTimer);
    if (start && !start.t.el.closest('button, a, input, [data-act], [data-do], [data-peek]')) show(start.t.el, start.t.text);
    start = null;
  }, true);
  document.addEventListener('pointercancel', function () { clearTimeout(holdTimer); start = null; }, true);
  document.addEventListener('click', function (e) { if (swallow) { swallow = false; e.preventDefault(); e.stopPropagation(); } }, true);
  document.addEventListener('contextmenu', function (e) { if (on && e.target.closest('#app, .screen, #start') && tipFor(e.target)) e.preventDefault(); }, true);
  window.addEventListener('scroll', hide, true);

  // The help button joins the battle's tools and the exhibition heading, and the board gets captions for each back row.
  function mount() {
    document.body.classList.toggle('help-on', on);
    var tools = document.querySelector('.topbar .tools');
    if (tools && !tools.querySelector('[data-help-toggle]')) tools.insertAdjacentHTML('afterbegin', button());
    var head = document.querySelector('#start .starthead'), builder = document.getElementById('startBuilder');
    if (head && builder && !head.querySelector('[data-help-toggle]')) {
      var group = document.createElement('span');
      group.className = 'hgroup';
      builder.parentNode.insertBefore(group, builder);
      group.insertAdjacentHTML('beforeend', button());
      group.appendChild(builder);
    }
    var board = document.querySelector('.board');
    if (board && !board.querySelector('.rowcap')) board.insertAdjacentHTML('beforeend',
      '<span class="rowcap foe" data-tip="' + esc(rowNote(0)) + '">Enemy back row</span><span class="rowcap you" data-tip="' + esc(rowNote(E.ROWS - 1)) + '">Your back row</span>');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  return { DECKS: DECKS, ALIGNMENTS: ALIGNMENTS, FACTIONS: FACTIONS, deck: deck, alignment: alignment, faction: faction, factionHtml: factionHtml, keyword: keyword, button: button, on: function () { return on; }, set: set, tipFor: tipFor };
})();
if (typeof module !== 'undefined') module.exports = Help;
