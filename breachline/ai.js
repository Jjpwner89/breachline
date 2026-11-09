// The Claude opponent's mind, with no DOM. Prompts are built only from Engine.viewFor, so the model can't be told
// what its player couldn't see, and a move it names is played only if it matches a move the engine lists as legal.
var AI = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  var G = typeof Guides !== 'undefined' ? Guides : require('./guides.js');
  var MAX_PLAN = 40, MAX_SAY = 140, MAX_WHY = 900;
  var COMMAND = { move: 1, attack: 1, attackSummoner: 1, ability: 1 };
  var FIELDS = ['card', 'unit', 'target', 'r', 'c', 'raise'];
  // One call per turn takes longer than a choice made while the player waits on a response, so those use the fast model.
  var CALLS = { turn: { modelTier: 'default', effort: 'low' }, decision: { modelTier: 'quick' } };
  // These won't clear up by asking again, so the scripted bot finishes the game.
  var FATAL = { not_granted: 1, sampling_disabled: 1, not_declared: 1, capability_disabled: 1, capability_removed: 1, session_expired: 1, rate_limited: 1 };

  var RULES = [
    'THE RULES',
    '- The map has 4 rows (0-3) and 5 columns (0-4). Each summoner starts with 15 life and loses at 0. At the turn limit of 60, the higher life total wins.',
    '- Your turn: you draw a card, then the play phase, then the command phase. You cannot go back to the play phase.',
    '- Play phase: play one land (adds 1 mana now and each later turn), and play any cards you can pay for. Mana refills at the start of your turn.',
    '- Each land you lack of a card\'s colour adds 1 to its cost, so a card is never locked out.',
    '- New units appear only on free tiles of your back row, and cannot move or act until your next turn.',
    '- Command phase: each unit may move once, then either attack or use its ability. A unit that has attacked or used an ability cannot move afterwards.',
    '- Units move 1 tile with no diagonals and cannot pass through other units. Swift and Flying units move 2 tiles, and Flying units pass over other units.',
    '- Attack reach is 1 tile with no diagonals. Ranged units reach 2 tiles, counted in steps across rows and columns.',
    '- Damage stays until healed. A target that survives strikes back if the attacker is within its reach. Only the main target strikes back.',
    '- Only a unit on the enemy back row can attack the enemy summoner, and the summoner does not strike back.',
    '- Instants are cast on the enemy turn, paid from mana you left unspent on your own turn.',
    '- Hands are hidden. When a deck runs out, its discard pile is shuffled back in.'
  ].join('\n');

  var VOICE = 'Also write "say": one short sentence, under 15 words, spoken aloud across the table as the opposing summoner, for your opponent to read. Stay serious and grounded in a fantasy war, with no jokes or modern slang. It can boast, needle or bluff, and need not reveal your real thinking. Never mention being an AI, the rules text or this format.';

  // Only asked for in debug mode. This is what the model writes when asked to explain itself, not its hidden thinking.
  var WHY = '\nAlso write "why": 1 to 3 plain sentences on what you are really thinking and why you chose this. It goes to the game\'s debug log. Unlike "say", it must be honest and not a bluff.';

  function card(id) { return E.CARDS[id]; }
  function unitBy(v, uid) { return v.units.filter(function (u) { return u.uid === uid; })[0]; }
  function tag(v, u) { return (u.owner === v.viewer ? 'Y' : 'E') + u.uid; }
  function named(v, u) { return tag(v, u) + ' ' + card(u.cardId).name; }

  function cardFacts(c) {
    if (c.type === 'land') return 'Land, ' + c.colour + ' colour. Adds 1 mana each turn.';
    var kind = { unit: 'Unit', instant: 'Instant', enchant: 'Enchantment', spell: 'Spell' }[c.type];
    return kind + (c.type === 'unit' ? ' ' + c.atk + ' attack / ' + c.hp + ' health' : '') + (c.text ? '. ' + c.text : '');
  }

  function handLines(v) {
    var me = v.viewer, p = v.players[me];
    if (!p.hand.length) return ['(empty)'];
    return p.hand.map(function (i) {
      var c = card(i.c);
      return 'card ' + i.id + ': ' + c.name + (c.type === 'land' ? '' : ', costs ' + E.costOf(v, me, c) + ' now') + '. ' + cardFacts(c);
    });
  }

  function unitLine(v, u) {
    var c = card(u.cardId), bits = [];
    if (u.summonedTurn === v.turn) bits.push('waiting: just summoned');
    if (u.owner === v.active && u.acted) bits.push('has acted');
    else if (u.owner === v.active && u.moved) bits.push('has moved');
    if (u.held >= v.turn) bits.push("held: can't move or attack " + (u.held === v.turn ? 'this turn' : 'on its next turn'));
    u.enchants.forEach(function (e) { bits.push('enchanted with ' + card(e.c).name + (card(e.c).text ? ' (' + card(e.c).text + ')' : '')); });
    return named(v, u) + ' at row ' + u.r + ', column ' + u.c + ': attack ' + E.attackOf(v, u) + ', health ' + u.hp + '/' + u.maxHp + '.' +
      (c.text ? ' ' + c.text : '') + (bits.length ? ' [' + bits.join('; ') + ']' : '');
  }

  function mapLines(v) {
    var rows = [];
    for (var r = 0; r < E.ROWS; r++) {
      var cells = [];
      for (var c = 0; c < E.COLS; c++) {
        var here = v.units.filter(function (u) { return u.r === r && u.c === c; })[0];
        cells.push(here ? (tag(v, here) + '   ').slice(0, 4) : '.   ');
      }
      rows.push('row ' + r + ': ' + cells.join(' '));
    }
    return rows;
  }

  function pileNames(pile) {
    return pile.length ? pile.map(function (d) { return card(d.c).name; }).join(', ') : 'empty';
  }

  // A built deck's name is typed by a player, so it never goes into a prompt. Log lines get "Your side" and "The enemy" instead.
  // Lines from a battle saved before names were marked fall back to matching the name as text.
  function deckLabel(p) { return p.deckKey ? E.DECKS[p.deckKey].name : 'a deck of their own'; }
  function logLine(v, l) {
    if (l.marked) return l.marked.replace(/\u0001(\d)\u0002/g, function (x, i) { return +i === v.viewer ? 'Your side' : 'The enemy'; });
    if (v.logMarked) return l.text;
    return l.text.split(v.players[v.viewer].name).join('Your side').split(v.players[1 - v.viewer].name).join('The enemy');
  }

  function stateText(v) {
    var me = v.viewer, you = v.players[me], foe = v.players[1 - me];
    var mine = v.units.filter(function (u) { return u.owner === me; }), theirs = v.units.filter(function (u) { return u.owner !== me; });
    var recent = v.log.slice(-12).map(function (l) { return 'turn ' + l.turn + ': ' + logLine(v, l); });
    return [
      'THE BATTLE',
      'Turn ' + v.turn + '. You play ' + deckLabel(you) + '. Your enemy plays ' + deckLabel(foe) + '.',
      'You: ' + you.life + ' life, ' + you.mana + ' mana available from ' + you.lands.length + ' lands, deck ' + you.deckCount + ', discard: ' + pileNames(you.discard) + '.',
      'Enemy: ' + foe.life + ' life, ' + foe.mana + ' unspent mana from ' + foe.lands.length + ' lands, ' + foe.handCount + ' hidden cards in hand, deck ' + foe.deckCount + ', discard: ' + pileNames(foe.discard) + '.',
      'Your back row is row ' + E.backRow(me) + '. The enemy back row is row ' + E.backRow(1 - me) + '.',
      '',
      'Map (Y is yours, E is the enemy, and the number is the unit id):',
      mapLines(v).join('\n'),
      '',
      'Your units:',
      mine.length ? mine.map(function (u) { return unitLine(v, u); }).join('\n') : '(none)',
      '',
      'Enemy units:',
      theirs.length ? theirs.map(function (u) { return unitLine(v, u); }).join('\n') : '(none)',
      '',
      'Your hand:',
      handLines(v).join('\n'),
      '',
      'Recent events:',
      recent.length ? recent.join('\n') : '(none)'
    ].join('\n');
  }

  // What a move would do if nothing else changes. Worked out on the view, so the enemy's hidden instants play no part.
  function preview(v, m) {
    var after = E.applyMove(v, m), out = [], foe = 1 - v.viewer;
    v.units.forEach(function (u) {
      var now = unitBy(after, u.uid);
      if (!now) out.push(named(v, u) + ' is destroyed');
      else if (now.hp !== u.hp) out.push(named(v, u) + ' goes from ' + u.hp + ' to ' + now.hp + ' health');
    });
    if (after.players[foe].life !== v.players[foe].life) out.push('the enemy summoner goes from ' + v.players[foe].life + ' to ' + after.players[foe].life + ' life');
    return out.length ? out.join('; ') : 'no damage';
  }

  function actionLine(v, m) {
    var u = unitBy(v, m.unit), c = card(u.cardId);
    if (m.type === 'attack') return 'attack ' + named(v, unitBy(v, m.target)) + ' {"type":"attack","unit":' + m.unit + ',"target":' + m.target + '}: ' + preview(v, m);
    if (m.type === 'attackSummoner') return 'attack the enemy summoner {"type":"attackSummoner","unit":' + m.unit + '}: ' + preview(v, m);
    var t = m.target ? unitBy(v, m.target) : null, back = m.raise ? v.players[v.viewer].discard.filter(function (d) { return d.id === m.raise; })[0] : null;
    return 'use ' + c.ability.label + (t ? ' on ' + named(v, t) : '') + (back ? ' returning ' + card(back.c).name : '') +
      ' {"type":"ability","unit":' + m.unit + (t ? ',"target":' + m.target : '') + (back ? ',"raise":' + m.raise : '') + '}: ' + (c.text || '');
  }

  function unitOptions(cmd, u) {
    var lines = [], moves = E.legalMoves(cmd).filter(function (m) { return m.unit === u.uid; });
    if (u.summonedTurn === cmd.turn) return [];
    moves.filter(function (m) { return m.type !== 'move'; }).forEach(function (m) { lines.push('  without moving: ' + actionLine(cmd, m)); });
    var steps = moves.filter(function (m) { return m.type === 'move'; });
    if (steps.length) lines.push('  can move to: ' + steps.map(function (m) { return '{"type":"move","unit":' + u.uid + ',"r":' + m.r + ',"c":' + m.c + '}'; }).join(' '));
    steps.forEach(function (m) {
      var there = E.applyMove(cmd, m);
      E.legalMoves(there).filter(function (x) { return x.unit === u.uid && x.type !== 'move'; }).forEach(function (x) {
        lines.push('  after moving to row ' + m.r + ', column ' + m.c + ': ' + actionLine(there, x));
      });
    });
    return lines.length ? [named(cmd, u) + ':'].concat(lines) : [];
  }

  function turnOptions(v) {
    var me = v.viewer, p = v.players[me], lines = ['YOUR OPTIONS', 'Previews assume nothing else changes first, and the enemy may answer with an instant.'];
    var free = [];
    for (var col = 0; col < E.COLS; col++) if (!v.units.some(function (u) { return u.r === E.backRow(me) && u.c === col; })) free.push(col);
    lines.push('Land drop: ' + (p.landDropped && !(p.extraLands > 0) ? 'already used this turn.' : 'available.'));
    lines.push('Free back-row tiles for new units: row ' + E.backRow(me) + ', columns ' + (free.length ? free.join(', ') : 'none') + '.');
    var aimed = {};
    E.legalMoves(v).forEach(function (m) {
      if (m.type !== 'summon' || !m.target || aimed[m.card]) return;
      aimed[m.card] = true;
      var c = card(p.hand.filter(function (i) { return i.id === m.card; })[0].c);
      lines.push('Summon ' + c.name + ' and name the enemy unit it hits: {"type":"summon","card":' + m.card + ',"r":' + E.backRow(me) + ',"c":COLUMN,"target":ENEMY_UNIT}');
    });
    var cast = E.legalMoves(v).filter(function (m) { return m.type === 'enchant' || m.type === 'cast'; });
    var passage = {};
    cast.forEach(function (m) {
      var c = card(p.hand.filter(function (i) { return i.id === m.card; })[0].c), extra;
      // Dawnsail passage has too many unit and tile pairs to list, so it gets one line.
      if (m.type === 'cast' && m.r !== undefined) {
        if (passage[m.card]) return;
        passage[m.card] = true;
        lines.push('Cast ' + c.name + ' on one of your units, to any free tile: {"type":"cast","card":' + m.card + ',"target":UNIT,"r":ROW,"c":COLUMN}');
        return;
      }
      if (m.type === 'enchant') extra = 'on ' + named(v, unitBy(v, m.target)) + ' {"type":"enchant","card":' + m.card + ',"target":' + m.target + '}';
      else if (m.target) extra = 'on ' + named(v, unitBy(v, m.target)) + ' {"type":"cast","card":' + m.card + ',"target":' + m.target + '}';
      else if (m.raise) extra = 'returning ' + card(p.discard.filter(function (d) { return d.id === m.raise; })[0].c).name + ' {"type":"cast","card":' + m.card + ',"raise":' + m.raise + '}';
      else extra = '{"type":"cast","card":' + m.card + '}';
      lines.push('Cast ' + c.name + ' ' + extra);
    });
    var cmd = v.phase === 'play' ? E.applyMove(v, { type: 'toCommand' }) : v;
    v.units.filter(function (u) { return u.owner === me; }).forEach(function (u) {
      lines = lines.concat(unitOptions(cmd, unitBy(cmd, u.uid)));
    });
    return lines.join('\n');
  }

  function guideText(v, level) {
    var g = G[level] || G.normal, deck = g.decks[v.players[v.viewer].deckKey];
    return g.general + (deck ? '\n\n' + deck : '');
  }

  var INTRO = 'You are playing Breachline, a fantasy card game on a grid, against a human. Try to win. You see only what your side is allowed to see, the same as the human does.';

  function turnPrompt(v, level, debug) {
    return [
      INTRO,
      RULES,
      'WHAT YOU KNOW ABOUT STRATEGY\n' + guideText(v, level),
      stateText(v),
      turnOptions(v),
      'YOUR ANSWER\nPlan your whole turn as moves in the order you want them, with the land and cards first, then unit moves and actions. A unit\'s move comes before its attack. Land: {"type":"playLand","card":ID}. New unit: {"type":"summon","card":ID,"r":ROW,"c":COLUMN}. Unit moves and actions use the forms shown above. Playing a land first gives you 1 more mana for the cards after it. A unit may move without attacking. Your turn ends after the last move, so leave out anything you do not want to do. If you have no land, or would rather do nothing, leave those moves out; an empty plan is allowed.\n' +
        VOICE + (debug ? WHY : '') + '\nReply with only JSON in this form: {"say":"...",' + (debug ? '"why":"...",' : '') + '"plan":[{"type":"playLand","card":12},{"type":"move","unit":34,"r":1,"c":2}]}'
    ].join('\n\n');
  }

  function menuLabel(v, m) {
    var p = v.players[v.viewer], inHand = function (id) { return card(p.hand.filter(function (i) { return i.id === id; })[0].c); };
    switch (m.type) {
      case 'keepHand': return 'Keep this hand' + (p.redraws ? ', then put ' + p.redraws + ' on the bottom of your deck' : '');
      case 'redraw': return 'Shuffle it back and draw a new hand, which leaves you one card fewer';
      case 'bottomCard': return 'Put ' + inHand(m.card).name + ' on the bottom of your deck';
      case 'pass': return 'Do nothing';
      case 'respond':
        var t = unitBy(v, m.target);
        return 'Cast ' + inHand(m.card).name + ' on ' + named(v, t) + (m.r !== undefined ? ', moving it to row ' + m.r + ', column ' + m.c : '') + (inHand(m.card).debt ? ', losing ' + inHand(m.card).debt + ' life' : '') + ' (costs ' + E.costOf(v, v.viewer, inHand(m.card)) + ')';
    }
    return m.type;
  }

  function decisionPrompt(v, level, debug) {
    var moves = E.legalMoves(v), ask, pd = v.pending;
    if (v.players[v.viewer].toBottom) ask = 'Choose a card to put on the bottom of your deck.';
    else if (v.phase === 'opening') ask = 'Choose whether to keep your opening hand.';
    else if (pd && pd.attack) {
      var a = unitBy(v, pd.attack.attacker);
      ask = named(v, a) + ' is attacking ' + (pd.attack.summoner !== undefined ? 'you, the summoner,' : named(v, unitBy(v, pd.attack.targetUid))) + ' for ' + (pd.attack.summoner !== undefined ? E.attackOf(v, a) : E.hitOn(v, a, unitBy(v, pd.attack.targetUid))) + '. Choose whether to respond.';
    } else ask = 'The enemy turn is ending. Choose whether to use an instant.';
    return [
      INTRO,
      RULES,
      'WHAT YOU KNOW ABOUT STRATEGY\n' + guideText(v, level),
      stateText(v),
      'YOUR DECISION\n' + ask + '\n' + moves.map(function (m, n) { return n + ': ' + menuLabel(v, m); }).join('\n'),
      'YOUR ANSWER\n' + VOICE + (debug ? WHY : '') + '\nReply with only JSON in this form: {"say":"...",' + (debug ? '"why":"...",' : '') + '"choice":0}'
    ].join('\n\n');
  }

  function clean(move) {
    var out = { type: String(move.type) };
    FIELDS.forEach(function (f) { if (move[f] !== undefined && move[f] !== null) out[f] = Number(move[f]); });
    return out;
  }

  // The engine's own move is what gets played, never the model's object.
  function matchMove(moves, m) {
    return moves.filter(function (x) {
      return x.type === m.type && FIELDS.every(function (f) { return x[f] === undefined || x[f] === m[f]; });
    })[0] || null;
  }

  function cleanSay(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, MAX_SAY);
  }

  function cleanWhy(text) {
    return typeof text === 'string' ? text.trim().slice(0, MAX_WHY) : '';
  }

  // A move in plain words, for the debug panel.
  function describe(v, m) {
    var p = v.players[v.viewer], inHand = p.hand.filter(function (i) { return i.id === m.card; })[0];
    var u = unitBy(v, m.unit), t = unitBy(v, m.target), name = inHand ? card(inHand.c).name : 'card ' + m.card;
    var who = u ? named(v, u) : 'unit ' + m.unit, at = 'row ' + m.r + ', column ' + m.c;
    switch (m.type) {
      case 'playLand': return 'Play land: ' + name;
      case 'summon': return 'Summon ' + name + ' at ' + at + (t ? ', hitting ' + named(v, t) : '');
      case 'enchant': return 'Cast ' + name + ' on ' + (t ? named(v, t) : 'unit ' + m.target);
      case 'cast': return 'Cast ' + name + (t ? ' on ' + named(v, t) : '') + (m.r !== undefined ? ' to ' + at : '');
      case 'move': return who + ' moves to ' + at;
      case 'attack': return who + ' attacks ' + (t ? named(v, t) : 'unit ' + m.target);
      case 'attackSummoner': return who + ' attacks the enemy summoner';
      case 'ability': return who + ' uses its ability' + (t ? ' on ' + named(v, t) : '') + (m.raise ? ' to return card ' + m.raise : '');
      case 'keepHand': return 'Keep this hand';
      case 'redraw': return 'Redraw';
      case 'pass': return 'Do nothing';
      case 'bottomCard': return 'Put ' + name + ' on the bottom of the deck';
      case 'respond': return 'Cast ' + name + ' on ' + (t ? named(v, t) : 'unit ' + m.target);
    }
    return JSON.stringify(m);
  }

  // The next move of a planned turn. A planned move that has stopped being legal, say because an instant killed the unit, is dropped.
  function nextMove(s, queue, dropped) {
    var moves = E.legalMoves(s);
    // A card to put on the bottom comes up mid-plan. The rest of the plan waits for it.
    if (moves[0] && moves[0].type === 'bottomCard') return moves[0];
    while (queue.length) {
      var hit = matchMove(moves, queue[0]);
      if (hit) { queue.shift(); return hit; }
      if (s.phase === 'play' && COMMAND[queue[0].type]) return { type: 'toCommand' };
      var gone = queue.shift();
      if (dropped) dropped.push(gone);
    }
    return { type: s.phase === 'play' ? 'toCommand' : 'endTurn' };
  }

  // Returns null when the reply is unusable: not a plan, or a plan with nothing in it the engine would accept.
  function readPlan(v, reply) {
    if (!reply || !Array.isArray(reply.plan)) return null;
    var queue = reply.plan.slice(0, MAX_PLAN).filter(function (m) { return m && typeof m === 'object'; }).map(clean);
    if (!queue.length) return { say: cleanSay(reply.say), why: cleanWhy(reply.why), queue: [] };
    var trial = queue.slice(), s = v, played = 0;
    for (var n = 0; n < MAX_PLAN * 2 && s.active === v.viewer && s.winner === null; n++) {
      var m = nextMove(s, trial);
      if (m.type === 'endTurn') break;
      if (m.type !== 'toCommand') played += 1;
      s = E.applyMove(s, m);
    }
    return played ? { say: cleanSay(reply.say), why: cleanWhy(reply.why), queue: queue } : null;
  }

  function readChoice(v, reply) {
    if (!reply || typeof reply.choice !== 'number') return null;
    var move = E.legalMoves(v)[reply.choice];
    return move ? { say: cleanSay(reply.say), why: cleanWhy(reply.why), move: move } : null;
  }

  // Whether this turn holds anything to decide. With nothing to play or command, no model call is needed.
  function hasChoice(v) {
    if (E.legalMoves(v).length > 1) return true;
    return v.phase === 'play' && E.legalMoves(E.applyMove(v, { type: 'toCommand' })).length > 1;
  }

  // Reads JSON from a reply: the whole text, a fenced block, or the text from the first brace to the last.
  function parseReply(text) {
    var tries = [text], fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text), a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (fence) tries.push(fence[1]);
    if (a >= 0 && b > a) tries.push(text.slice(a, b + 1));
    for (var i = 0; i < tries.length; i++) {
      try { return JSON.parse(tries[i]); } catch (e) { /* try the next form */ }
    }
    return null;
  }

  // Uses the plain call rather than the JSON one because only this reports which tier answered and gives the raw reply.
  function ask(sample, prompt, call, signal) {
    var options = { modelTier: call.modelTier, cache: false, signal: signal };
    if (call.effort) options.effort = call.effort;
    return sample(prompt, options).then(function (r) {
      return { reply: parseReply(r.text), text: r.text, tier: r.modelTierApplied, truncated: r.truncated };
    });
  }

  return {
    CALLS: CALLS, FATAL: FATAL, levels: G,
    turnPrompt: turnPrompt, decisionPrompt: decisionPrompt, guideText: guideText, stateText: stateText,
    readPlan: readPlan, readChoice: readChoice, nextMove: nextMove, hasChoice: hasChoice, cleanSay: cleanSay, parseReply: parseReply, describe: describe, ask: ask
  };
})();
if (typeof module !== 'undefined') module.exports = AI;
