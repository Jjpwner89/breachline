// The Quartermaster: a short Claude chat in the deck builder that looks over the deck being built and helps it do what
// the player wants. Its brief is DECK_GUIDE.md; the deck, the player's other cards in its colours and the last few
// exchanges go with every question. Inside Claude it asks the page's own sample. On the hosted copy it goes through
// OwnKey, the shared key the Claude opponents use, so the player must be signed in.
var DeckHelp = (function () {
  var E = Engine, KEEP = 6, MAX_POOL = 24000;
  var hosted = !(window.claude && window.claude.use), sample = null, guide = null, logs = {}, busy = null;
  if (!hosted) window.claude.use('sample').then(function (fn) { sample = fn; drawNote(); });

  var FALLBACK = 'Build the deck the player wants and help it work; never talk them out of their idea. About a third of a deck is lands. ' +
    'Check for early plays, answers to big units and a way to reach the summoner. Be short, kind and practical. Never give win rates or balance numbers.';
  var GREETING = 'Lay out what you\'re bringing and tell me what you want it to do. I\'ll tell you where it\'s thin.';
  var QUICK = [
    ['Look over my deck', 'Look over my deck. What is working, and what is the biggest hole?'],
    ['What should I add?', 'What should I add or swap so this deck does its job better?'],
    ['How do I play it?', 'How should I play this deck? Give me a simple game plan.']
  ];
  var START = [['Help me start a deck', 'I\'m starting a new deck. Ask me what I want it to do, or suggest a direction from the cards I own.']];

  function byId(id) { return document.getElementById(id); }
  function esc(t) { return Screens.kit.esc(t); }
  function ed() { return Screens.editing(); }
  function loadGuide() {
    if (!guide) guide = fetch('DECK_GUIDE.md', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.text() : FALLBACK; }, function () { return FALLBACK; });
    return guide;
  }
  function asker() { return hosted ? (typeof OwnKey !== 'undefined' && OwnKey.has() ? OwnKey.sample : null) : sample; }
  function logFor() { var e = ed(); return e ? (logs[e.deck.id] = logs[e.deck.id] || []) : []; }

  // What Claude is told

  function colour(c) { return GameUI.ALIGNMENT[c]; }
  function factionName(id) { var f = E.FACTIONS.filter(function (f) { return f.id === id; })[0]; return f ? f.name : ''; }
  function describe(c) {
    if (c.type === 'land') return c.name + ' (' + colour(c.colour) + ' land)';
    var bits = [colour(c.colour) + ' ' + GameUI.TYPES[c.type].toLowerCase(), c.cost + ' mana' + (c.wants ? ', wants ' + c.wants + ' ' + colour(c.colour) + ' land' + (c.wants > 1 ? 's' : '') : '')];
    if (c.faction) bits.push(factionName(c.faction));
    if (c.type === 'unit') bits.push(c.atk + ' attack / ' + c.hp + ' health');
    return c.name + ' (' + bits.join(', ') + ')' + (c.text ? ': ' + c.text : '');
  }
  function order(a, b) {
    var x = E.CARDS[a], y = E.CARDS[b];
    return (x.type === 'land') - (y.type === 'land') || x.colour.localeCompare(y.colour) || x.cost - y.cost || x.name.localeCompare(y.name);
  }
  function counts(list) {
    var lands = {}, curve = {}, types = {}, size = 0;
    list.forEach(function (e) {
      var c = E.CARDS[e[0]];
      size += e[1];
      if (c.type === 'land') { lands[colour(c.colour)] = (lands[colour(c.colour)] || 0) + e[1]; return; }
      var k = Math.min(c.cost, 7) + (c.cost >= 7 ? '+' : '');
      curve[k] = (curve[k] || 0) + e[1];
      types[GameUI.TYPES[c.type]] = (types[GameUI.TYPES[c.type]] || 0) + e[1];
    });
    var line = function (o) { return Object.keys(o).map(function (k) { return k + ' ' + o[k]; }).join(', ') || 'none'; };
    var landN = Object.keys(lands).reduce(function (a, k) { return a + lands[k]; }, 0);
    return size + ' of ' + E.DECK_MAX + ' cards. Lands ' + landN + ' (' + line(lands) + '). Other cards by mana cost: ' + line(curve) + '. By type: ' + line(types) + '.';
  }
  // The player's cards that could go in: those in the deck's colours and neutral ones, or everything for an empty or
  // neutral deck, with how many more copies they could add.
  function poolText(e) {
    var list = e.deck.list, inDeck = {}, cols = E.deckColours(list).filter(function (c) { return c !== 'N'; });
    list.forEach(function (x) { inDeck[x[0]] = x[1]; });
    var out = [], len = 0;
    e.pool.ids.filter(function (id) {
      var c = E.CARDS[id];
      return c.type !== 'land' && e.pool.copies(id) > (inDeck[id] || 0) && (!cols.length || c.colour === 'N' || cols.indexOf(c.colour) >= 0);
    }).sort(order).some(function (id) {
      var line = describe(E.CARDS[id]) + ' [can add ' + (e.pool.copies(id) - (inDeck[id] || 0)) + ']';
      len += line.length + 1;
      if (len > MAX_POOL) return true;
      out.push(line);
    });
    return out.join('\n') || 'None.';
  }
  function prompt(brief, history, question) {
    var e = ed(), list = e.deck.list.slice().sort(function (a, b) { return order(a[0], b[0]); });
    var plan = Help.DECKS[e.deck.id];
    var talk = history.map(function (m) { return (m.who === 'you' ? 'Player: ' : 'Quartermaster: ') + m.text; }).join('\n');
    return 'You are the Quartermaster, the assistant in the deck builder of Breachline, a fantasy card game played on a grid. ' +
      'You help a player who is learning to build a deck they will enjoy. Follow this guide closely; its first rule matters most.\n\n' +
      '<guide>\n' + brief + '\n</guide>\n\n' +
      'How to answer:\n' +
      '- At most about 110 words. Plain text in short paragraphs, or lines starting "- " for a list. No headings, tables, bold or emoji.\n' +
      '- Write card names exactly as they appear below, so the game can link them.\n' +
      '- Suggest cards from <your_cards> unless the player asks about cards they don\'t own. Respect the 3-copy limit and the 40-card size.\n' +
      '- Never mention win rates, lift, scores, tiers or balance testing.\n' +
      '- If asked about something other than deck building or playing Breachline, steer back in one line.\n\n' +
      '<deck name="' + esc(e.deck.name || 'Untitled') + '">\n' + (list.map(function (x) { return x[1] + '× ' + describe(E.CARDS[x[0]]); }).join('\n') || 'Empty so far.') + '\n</deck>\n' +
      '<deck_counts>' + counts(list) + '</deck_counts>\n' +
      (plan ? '<deck_plan>' + plan + '</deck_plan>\n' : '') +
      '<your_cards>\n' + poolText(e) + '\n</your_cards>\n\n' +
      (talk ? '<conversation>\n' + talk + '\n</conversation>\n\n' : '') +
      'The player asks: ' + question;
  }

  // Replies, with card names turned into buttons that show the card

  var names = null;
  function nameRe() {
    if (names) return names;
    var by = {};
    Object.keys(E.CARDS).forEach(function (id) { if (!E.CARDS[id].token) by[esc(E.CARDS[id].name).toLowerCase()] = id; });
    var keys = Object.keys(by).sort(function (a, b) { return b.length - a.length; }).map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    names = { by: by, re: new RegExp('\\b(' + keys.join('|') + ')\\b', 'gi') };
    return names;
  }
  function linked(html) {
    var n = nameRe();
    return html.replace(n.re, function (m) { var id = n.by[m.toLowerCase()]; return '<button type="button" class="qcard" data-act="zoom" data-arg="' + id + '" data-peek="' + id + '">' + m + '</button>'; });
  }
  function format(text) {
    return String(text).replace(/\*\*|__|^#+\s*/gm, '').trim().split(/\n\s*\n/).map(function (block) {
      var lines = block.split('\n'), items = lines.filter(function (l) { return /^\s*[-•*]\s+/.test(l); });
      if (items.length && items.length === lines.length) return '<ul>' + items.map(function (l) { return '<li>' + linked(esc(l.replace(/^\s*[-•*]\s+/, ''))) + '</li>'; }).join('') + '</ul>';
      return '<p>' + linked(esc(lines.join(' '))) + '</p>';
    }).join('');
  }

  // The panel

  function button() {
    return '<button type="button" class="btn qmbtn" data-qm="open" aria-controls="qm" aria-expanded="false" title="Ask the Quartermaster to look over this deck">Quartermaster</button>';
  }
  function panelHtml() {
    return '<aside class="qm" id="qm" hidden aria-label="The Quartermaster">' +
      '<header class="qhead"><h2>The Quartermaster</h2><button type="button" class="btn" data-qm="close">Close</button></header>' +
      '<div class="qlog" id="qlog" aria-live="polite"></div><div class="qquick" id="qquick"></div>' +
      '<form class="qform" id="qform"><label class="sr" for="qin">Ask the Quartermaster</label><textarea id="qin" rows="2" maxlength="600" placeholder="Ask about this deck"></textarea>' +
      '<button type="submit" class="btn primary" id="qsend">Ask</button></form><p class="qnote" id="qnote"></p></aside>';
  }
  function drawLog() {
    var box = byId('qlog');
    if (!box) return;
    var log = logFor();
    box.innerHTML = '<div class="qmsg qm-says">' + format(GREETING) + '</div>' + log.map(function (m) {
      return '<div class="qmsg ' + (m.who === 'you' ? 'you-say' : 'qm-says') + (m.error ? ' err' : '') + '">' + (m.who === 'you' ? '<p>' + esc(m.text) + '</p>' : format(m.text)) + '</div>';
    }).join('') + (busy ? '<div class="qmsg qm-says pending" id="qpending">' + (busy.text ? format(busy.text) : '<p class="qwait">Going over your list…</p>') + '</div>' : '');
    box.scrollTop = box.scrollHeight;
    var e = ed(), quick = e && e.deck.list.length ? QUICK : START;
    byId('qquick').innerHTML = busy ? '' : quick.map(function (q, i) { return '<button type="button" class="chip" data-qm="quick" data-i="' + i + '">' + q[0] + '</button>'; }).join('');
    drawNote();
  }
  function drawNote() {
    var note = byId('qnote');
    if (!note) return;
    var ok = !!asker();
    note.textContent = ok ? (hosted ? 'Each question uses Claude on the game\'s shared key.' : 'Each question uses a little of your Claude usage.') :
      hosted ? 'Sign in from the main menu to ask the Quartermaster.' : 'The Quartermaster needs Claude, which works on the published page inside Claude.';
    byId('qsend').disabled = !ok || !!busy;
    Array.prototype.forEach.call(byId('qquick').querySelectorAll('button'), function (b) { b.disabled = !ok; });
  }
  function open() {
    var qm = byId('qm');
    if (!qm) return;
    qm.hidden = false;
    setToggle(true);
    loadGuide();
    drawLog();
    if (window.matchMedia && matchMedia('(hover: hover)').matches) byId('qin').focus();
  }
  function close() {
    var qm = byId('qm');
    if (!qm || qm.hidden) return false;
    qm.hidden = true;
    setToggle(false);
    return true;
  }
  function setToggle(on) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-qm="open"]'), function (b) { b.setAttribute('aria-expanded', on); });
  }

  var ERRORS = {
    rate_limited: 'Too many questions at once. Give it a moment and ask again.',
    sign_in_needed: 'Sign in from the main menu to ask the Quartermaster.',
    not_invited: 'This account isn\'t on the list for Claude yet.',
    not_granted: 'Claude wasn\'t allowed on this page, so the Quartermaster can\'t answer.',
    connection: 'Couldn\'t reach Claude. Check your connection and ask again.'
  };
  function ask(question) {
    question = String(question || '').trim();
    var fn = asker(), e = ed();
    if (!question || !fn || !e || busy) return;
    var log = logFor(), history = log.filter(function (m) { return !m.error; }).slice(-KEEP * 2), ctrl = new AbortController(), job = { text: '', ctrl: ctrl };
    log.push({ who: 'you', text: question });
    busy = job;
    drawLog();
    loadGuide().then(function (brief) {
      if (busy !== job) throw { code: 'cancelled' };
      return fn(prompt(brief, history, question), {
        signal: ctrl.signal, effort: 'low', cache: false,
        onText: function (s) { if (busy !== job) return; job.text = s.text; var el = byId('qpending'); if (el) { el.innerHTML = format(s.text); byId('qlog').scrollTop = byId('qlog').scrollHeight; } }
      });
    }).then(function (r) {
      if (busy !== job) return;
      log.push({ who: 'qm', text: (r && r.text || '').trim() || 'I\'ve nothing useful to add to that.' });
    }, function (err) {
      if (busy !== job || (err && err.code === 'cancelled') || ctrl.signal.aborted) return;
      log.push({ who: 'qm', error: true, text: ERRORS[err && err.code] || 'Something went wrong. Ask again in a moment.' });
    }).then(function () {
      if (busy !== job) return;
      busy = null;
      drawLog();
    });
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-qm]');
    if (!b || b.disabled) return;
    var what = b.dataset.qm;
    if (what === 'open') return byId('qm') && byId('qm').hidden ? open() : close();
    if (what === 'close') return close();
    if (what === 'quick') { var e = ed(), q = (e && e.deck.list.length ? QUICK : START)[b.dataset.i]; if (q) ask(q[1]); }
  });
  document.addEventListener('submit', function (ev) {
    if (ev.target.id !== 'qform') return;
    ev.preventDefault();
    var input = byId('qin');
    if (!asker() || busy || !input.value.trim()) return;
    ask(input.value);
    input.value = '';
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.target.id === 'qin' && ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); byId('qform').requestSubmit(); }
    // A card shown over the panel closes first.
    else if (ev.key === 'Escape' && !document.querySelector('.closeup.open') && close()) ev.stopImmediatePropagation();
  }, true);

  return { button: button, panelHtml: panelHtml, open: open, close: close, ask: ask };
})();
