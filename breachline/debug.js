// The debug panel for the Claude opponent. Everything goes in as plain text, since model replies are untrusted.
var Debug = (function () {
  // API prices per million tokens, input then output. The page reports only a tier, so each is priced as the model family it counts as.
  var PRICES = { quick: [0.1, 0.5], 'default': [2, 10], complex: [4, 20] };
  var entries = [];
  function byId(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function tokens(text) { return Math.ceil(text.length / 4); }
  function fold(label, text) {
    var d = el('details');
    d.appendChild(el('summary', '', label));
    d.appendChild(el('pre', '', text));
    return d;
  }

  function summary() {
    var done = entries.filter(function (e) { return e.answered; });
    var counts = {}, inTok = 0, outTok = 0, cost = 0, secs = 0;
    done.forEach(function (e) {
      var rate = PRICES[e.tier] || PRICES['default'], i = tokens(e.prompt), o = tokens(e.text);
      counts[e.tier] = (counts[e.tier] || 0) + 1;
      inTok += i; outTok += o; secs += e.secs;
      cost += (i * rate[0] + o * rate[1]) / 1000000;
    });
    var tiers = Object.keys(counts).map(function (t) { return counts[t] + ' ' + t; }).join(', ');
    byId('debugSum').textContent = done.length
      ? done.length + ' Claude requests this game (' + tiers + ' tier), ' + secs + 's of waiting, about ' + inTok.toLocaleString() + ' tokens in and ' + outTok.toLocaleString() + ' out. ' +
        'At API prices that is roughly $' + cost.toFixed(2) + ', not counting hidden thinking, which the page doesn\'t report. On a Claude plan this draws on your usage limits rather than costing this amount.'
      : 'No Claude requests yet. Newest entries appear first.';
  }

  function begin(turn, kind, prompt, call) {
    var node = el('div', 'dbg'), head = el('b', '', 'Turn ' + turn + ': ' + kind), meta = el('small', '', 'Waiting on the ' + call.modelTier + ' tier...');
    node.appendChild(head);
    node.appendChild(meta);
    var slot = el('div');
    node.appendChild(slot);
    node.appendChild(fold('Prompt sent to Claude', prompt));
    byId('debugLog').insertBefore(node, byId('debugLog').firstChild);
    var entry = { prompt: prompt, node: node, meta: meta, slot: slot, began: Date.now(), asked: call.modelTier, text: '', answered: false };
    entries.push(entry);
    return entry;
  }

  function answer(entry, a) {
    entry.answered = true;
    entry.text = a.text;
    entry.tier = a.tier || entry.asked;
    entry.secs = Math.round((Date.now() - entry.began) / 1000);
    entry.meta.textContent = 'Answered by the ' + entry.tier + ' tier in ' + entry.secs + 's' + (entry.tier !== entry.asked ? ' (asked for ' + entry.asked + ')' : '') + (a.truncated ? ', cut short' : '');
    entry.node.appendChild(fold('Raw reply', a.text));
    summary();
  }

  function read(entry, say, why, moves) {
    if (why) entry.slot.appendChild(el('div', 'why', 'Its explanation: ' + why));
    if (say) entry.slot.appendChild(el('div', 'said', 'Said aloud: ' + say));
    var list = el('ol');
    moves.forEach(function (m) { list.appendChild(el('li', '', m)); });
    if (moves.length) entry.slot.appendChild(list);
    else entry.slot.appendChild(el('small', '', 'It chose to do nothing this turn.'));
  }

  function fail(entry, code) {
    entry.node.classList.add('bad');
    entry.meta.textContent = 'No usable answer: ' + (code || 'unknown error');
    summary();
  }

  function note(text) {
    byId('debugLog').insertBefore(el('div', 'dbg note', text), byId('debugLog').firstChild);
  }

  function reset() {
    entries = [];
    byId('debugLog').textContent = '';
    summary();
  }

  return { begin: begin, answer: answer, read: read, fail: fail, note: note, reset: reset };
})();
