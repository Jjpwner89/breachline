// Online play: two people, each on their own page, fight one battle. Both pages run the same engine from the same seed, so
// only the setup and the moves travel. Each page tells the other everything it needs as one absolute state: who it is, its
// deck, the host's setup, the moves the other page hasn't applied yet, and how many it has applied itself.
// Nothing here knows how that state travels. A transport carries it: a Claude room inside Claude, or a broadcast channel
// between tabs of one browser for testing (?net=local), or a direct browser-to-browser connection anywhere else.
var Net = (function () {
  var E = Engine, KEY = 'breachline.match.v1', V = 1, ROOM = 'bl-', ROOM_BYTES = 3600;

  // A transport's open(name) resolves a link, or null when it can't run here:
  //   say(state)  replaces what this page tells the others; may return a promise that rejects with { code }
  //   hear(fn)    fn(list) whenever the others change, with [{ id, state }] for every other page in the room, state null
  //               for a page that hasn't said anything yet
  //   status(fn)  fn('up' | 'down' | 'lost', code); lost is for good
  //   leave()
  var TRANSPORTS = {
    // Presence is the only arm used: anyone in the room may set their own, guests invited from outside the organization
    // included, and the platform hands it to whoever arrives later. The state goes both to the match's named room and to
    // the lobby every viewer of the page shares, and the peer lists are read on a timer as well as on each change, so a
    // room that goes quiet doesn't strand a match. Pages tell matches apart by the code inside the state.
    claude: function (name) {
      if (!window.claude || !window.claude.use) return Promise.resolve(null);
      return window.claude.use('room').then(function (lobby) {
        if (!lobby) return null;
        return lobby.join(name).catch(function (e) { console.warn('Match room not joined:', e && e.code); return null; }).then(function (r) {
          var rooms = r ? [r, lobby] : [lobby], heard = null, timer = null, info = { named: r ? 0 : -1, lobby: 0 };
          function noop() {}
          function gather() {
            var by = {};
            rooms.forEach(function (rm) {
              var ps = rm.peers();
              if (rm === r) info.named = ps.length; else info.lobby = ps.length;
              ps.forEach(function (p) {
                if (p.sameTab || p.kind !== 'viewer') return;
                var st = p.presence && p.presence.bl || null;
                if (!by[p.peer] || (st && !by[p.peer].state)) by[p.peer] = { id: p.peer, state: st };
              });
            });
            if (heard) heard(Object.keys(by).map(function (k) { return by[k]; }));
          }
          return {
            info: info,
            say: function (st) { return Promise.all(rooms.map(function (rm) { return rm.presence({ bl: st }); })); },
            hear: function (fn) {
              heard = fn;
              rooms.forEach(function (rm) { rm.onPeers(gather, function (e) { console.warn('Match room lost:', e && e.code); }); });
              timer = setInterval(gather, 2000);
            },
            status: function (fn) { lobby.onConnection(function (up) { fn(up ? 'up' : 'down'); }, function (e) { fn('lost', e && e.code); }); },
            leave: function () { clearInterval(timer); if (r) r.leave().catch(noop); lobby.presence({ bl: null }).catch(noop); }
          };
        });
      });
    },
    // Outside Claude, browsers connect to each other directly over WebRTC, finding each other through PeerJS's free public
    // server. The first page in a match takes the match's hub id; the others connect to it, and the hub passes each page's
    // state to the rest. Everyone repeats their state every few seconds. If the hub goes quiet, whoever claims its id next
    // takes over.
    peer: function (name) {
      return loadPeer().then(function (Peer) {
        if (!Peer) return null;
        var hubId = 'breachline-' + name + '-hub', mine = null, heard = null, onStatus = function () {}, closed = false;
        var peer = null, isHub = false, conns = {}, toHub = null, others = {}, lastAll = 0, wait = null;
        function tell() { if (heard) heard(Object.keys(others).map(function (id) { return { id: id, state: others[id].state }; })); }
        function send(c, msg) { try { if (c && c.open) c.send(msg); } catch (e) {} }
        function share() {
          Object.keys(conns).forEach(function (id) {
            var list = [{ id: hubId, state: mine }].concat(Object.keys(others).filter(function (k) { return k !== id; }).map(function (k) { return { id: k, state: others[k].state }; }));
            send(conns[id], { t: 'all', list: list });
          });
        }
        function drop() {
          if (peer) { try { peer.destroy(); } catch (e) {} }
          peer = null; isHub = false; conns = {}; toHub = null;
          if (Object.keys(others).length) { others = {}; tell(); }
        }
        function again() {
          if (closed || wait) return;
          drop();
          onStatus('down');
          wait = setTimeout(function () { wait = null; claim(); }, 800 + Math.random() * 1200);
        }
        // Take the hub id, or connect to whoever has it.
        function claim() {
          if (closed) return;
          var p = peer = new Peer(hubId);
          p.on('open', function () { if (p !== peer) return; isHub = true; onStatus('up'); });
          p.on('connection', function (c) {
            c.on('open', function () { conns[c.peer] = c; share(); });
            c.on('data', function (d) {
              if (!d || d.t !== 'state') return;
              others[c.peer] = { state: d.state, at: Date.now() };
              tell(); share();
            });
            c.on('close', function () { delete conns[c.peer]; if (others[c.peer]) { delete others[c.peer]; tell(); } share(); });
          });
          p.on('disconnected', function () { if (p === peer && !closed) p.reconnect(); });
          p.on('error', function (e) {
            if (p !== peer) return;
            if (e.type === 'unavailable-id') { try { p.destroy(); } catch (x) {} peer = null; join(); }
            else again();
          });
        }
        function join() {
          if (closed) return;
          var p = peer = new Peer();
          p.on('open', function () {
            if (p !== peer) return;
            var c = toHub = p.connect(hubId, { reliable: true });
            c.on('open', function () { lastAll = Date.now(); onStatus('up'); send(c, { t: 'state', state: mine }); });
            c.on('data', function (d) {
              if (!d || d.t !== 'all') return;
              lastAll = Date.now();
              others = {};
              d.list.forEach(function (x) { if (x.state) others[x.id] = { state: x.state }; });
              tell();
            });
            c.on('close', function () { if (c === toHub) again(); });
          });
          p.on('error', function () { if (p === peer) again(); });
        }
        var beat = setInterval(function () {
          var now = Date.now();
          if (isHub) {
            Object.keys(others).forEach(function (k) { if (now - others[k].at > 12000) { delete others[k]; tell(); } });
            share();
          } else if (toHub) {
            send(toHub, { t: 'state', state: mine });
            if (now - lastAll > 12000) again();
          }
        }, 3000);
        claim();
        return {
          say: function (st) { mine = st; if (isHub) share(); else send(toHub, { t: 'state', state: mine }); },
          hear: function (fn) { heard = fn; tell(); },
          status: function (fn) { onStatus = fn; },
          leave: function () { closed = true; clearInterval(beat); clearTimeout(wait); drop(); }
        };
      });
    },
    // Tabs of one browser. Each says its state every second and is dropped after a few quiet seconds.
    local: function (name) {
      if (typeof BroadcastChannel === 'undefined') return Promise.resolve(null);
      var ch = new BroadcastChannel('breachline-' + name), me = nonce(), mine = null, others = {}, heard = null;
      function post(kind) { ch.postMessage({ from: me, kind: kind, state: mine }); }
      function tell() {
        if (heard) heard(Object.keys(others).map(function (id) { return { id: id, state: others[id].state }; }));
      }
      ch.onmessage = function (e) {
        var d = e.data;
        if (!d || d.from === me) return;
        if (d.kind === 'bye') delete others[d.from];
        else { others[d.from] = { state: d.state, at: Date.now() }; if (d.kind === 'hello') post('state'); }
        tell();
      };
      var beat = setInterval(function () {
        post('state');
        var now = Date.now(), gone = false;
        Object.keys(others).forEach(function (id) { if (now - others[id].at > 3500) { delete others[id]; gone = true; } });
        if (gone) tell();
      }, 1000);
      window.addEventListener('pagehide', function () { post('bye'); });
      post('hello');
      return Promise.resolve({
        say: function (st) { mine = st; post('state'); },
        hear: function (fn) { heard = fn; tell(); },
        status: function (fn) { setTimeout(function () { fn('up'); }, 0); },
        leave: function () { post('bye'); clearInterval(beat); ch.close(); }
      });
    }
  };
  // PeerJS loads only when a match needs it.
  var peerLib = null;
  function loadPeer() {
    if (window.Peer) return Promise.resolve(window.Peer);
    return peerLib || (peerLib = new Promise(function (done) {
      var tag = document.createElement('script');
      tag.src = 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js';
      tag.onload = function () { done(window.Peer || null); };
      tag.onerror = function () { peerLib = null; done(null); };
      document.head.appendChild(tag);
    }));
  }
  // Inside Claude, a Claude room; anywhere else, a direct connection. ?net=local, ?net=peer or ?net=claude picks one.
  var forced = null;
  function transport() {
    if (forced) return forced;
    var asked = /[?&]net=(\w+)/.exec(location.search);
    if (asked && TRANSPORTS[asked[1]]) return asked[1];
    return window.claude && window.claude.use ? 'claude' : 'peer';
  }

  // A match code is five letters and digits that are hard to mix up.
  var ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789';
  function newCode() { var s = ''; for (var i = 0; i < 5; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]; return s; }
  function cleanCode(c) { return String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12); }
  function nonce() { return Math.random().toString(36).slice(2, 10); }
  function hash(text) {
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  // Both pages must hold the same cards and decks, or the same moves would play out differently.
  var build = hash(JSON.stringify([E.CARDS, E.DECKS, E.CONFIG, E.ROWS, E.COLS]));
  function buildId() { return build; }
  // A battle's fingerprint after each move, so two pages that have drifted apart find out. The log, effects and the
  // screen's own notes are left out.
  var SKIP = { log: 1, fx: 1, tally: 1, payKey: 1, logMarked: 1 };
  function stateHash(s) { return hash(JSON.stringify(s, function (k, v) { return SKIP[k] ? undefined : v; })); }
  function bytes(o) { return unescape(encodeURIComponent(JSON.stringify(o))).length; }

  // Matches are kept by player id, a few at most, and each tab remembers its own, so two tabs of one browser can play each other.
  function readAll() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function tabPid(pid) {
    try { if (pid === undefined) return sessionStorage.getItem(KEY + '.tab'); if (pid) sessionStorage.setItem(KEY + '.tab', pid); else sessionStorage.removeItem(KEY + '.tab'); } catch (e) {}
    return null;
  }
  function write(rec) {
    var all = readAll();
    all[rec.pid] = rec;
    Object.keys(all).sort(function (a, b) { return all[b].at - all[a].at; }).slice(4).forEach(function (k) { delete all[k]; });
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
    tabPid(rec.pid);
  }
  function drop(pid) {
    var all = readAll();
    delete all[pid];
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
    if (tabPid() === pid) tabPid(null);
  }
  // This tab's match, or else the newest one that was set up and hasn't ended.
  function read() {
    var all = readAll(), mine = tabPid();
    if (mine && all[mine]) return all[mine];
    return Object.keys(all).map(function (k) { return all[k]; }).filter(function (r) { return r.setup && !r.over; }).sort(function (a, b) { return b.at - a.at; })[0] || null;
  }

  var current = null;
  // rec: { code, seat, pid, deck, setup, log, over }. The host is seat 0 and makes the setup once a guest arrives:
  // { mid, seed, first, decks: [host's, guest's], pids: [host's, guest's] }.
  function open(rec) {
    if (current) current.close();
    var m = current = {
      code: rec.code, seat: rec.seat, pid: rec.pid, deck: rec.deck, setup: rec.setup || null, log: rec.log || [], over: rec.over || null,
      hash: rec.hash || null, status: 'connecting', problem: null, opp: null, oppHere: false,
      // What the waiting screen reports: other pages in the room, how many of them are in a match, and the last refusal.
      room: { pages: 0, players: 0, error: null }
    };
    var link = null, inbox = {}, oppN = 0, listeners = [], closed = false;
    function emit(what) { listeners.forEach(function (fn) { fn(what, m); }); }
    function save() { write({ code: m.code, seat: m.seat, pid: m.pid, deck: m.deck, setup: m.setup, log: m.log, over: m.over, hash: m.hash, at: Date.now() }); }
    function publish() {
      if (!link || closed) return;
      var st = { v: V, b: buildId(), code: m.code, pid: m.pid, seat: m.seat, n: m.log.length };
      if (m.hash) st.h = m.hash;
      if (m.over) st.over = m.over;
      if (!m.setup) st.deck = m.deck;
      else {
        if (m.seat === 0) st.setup = m.setup;
        st.mid = m.setup.mid;
        // The moves the opponent hasn't applied yet, as many as fit. The rest follow once they catch up.
        var from = Math.min(oppN, m.log.length), mv = m.log.slice(from);
        st.mv = [from, mv];
        while (mv.length > 1 && bytes(st) > ROOM_BYTES) mv.pop();
      }
      var sent = link.say(st);
      if (sent && sent.then) sent.then(function () { if (m.room.error) { m.room.error = null; emit('room'); } }, function (e) {
        console.warn('Match state not sent:', e && e.code, e && e.message);
        m.room.error = (e && e.code) || 'error';
        emit('room');
      });
    }
    function heard(list) {
      var opp = null, busy = false, version = false, players = list.filter(function (p) { return p.state && p.state.code === m.code; }).length;
      var raw = link && link.info ? { named: link.info.named, lobby: link.info.lobby } : null, rawWas = JSON.stringify(m.room.raw || null);
      if (players !== m.room.players || list.length !== m.room.pages || JSON.stringify(raw) !== rawWas) { m.room.pages = list.length; m.room.players = players; m.room.raw = raw; emit('room'); }
      list.forEach(function (p) {
        var s = p.state;
        if (!s || s.v !== V || s.code !== m.code || s.seat !== 1 - m.seat) return;
        if (s.b !== buildId()) { version = true; return; }
        if (m.setup) { if (s.pid === m.setup.pids[1 - m.seat] && (!s.mid || s.mid === m.setup.mid)) opp = s; }
        else if (m.seat === 0) { if (!s.mid && s.deck && (!opp || s.pid < opp.pid)) opp = s; }
        else if (s.setup && s.setup.pids[1] === m.pid) opp = s;
        else if (s.setup) busy = true;
      });
      m.problem = opp ? null : version ? 'version' : busy ? 'full' : null;
      var fresh = opp && !m.setup;
      if (fresh) {
        if (m.seat === 0) m.setup = { mid: nonce(), seed: Math.floor(Math.random() * 2147483647), first: Math.random() < 0.5 ? 0 : 1, decks: [m.deck, opp.deck], pids: [m.pid, opp.pid] };
        else m.setup = opp.setup;
        m.log = [];
        save();
      }
      var was = m.oppHere;
      m.oppHere = !!opp;
      if (!opp) { if (was || m.problem) emit('peer'); return; }
      m.opp = opp;
      var acked = fresh || oppN !== (opp.n || 0);
      oppN = opp.n || 0;
      if (opp.mv) opp.mv[1].forEach(function (mv, i) { if (opp.mv[0] + i >= m.log.length) inbox[opp.mv[0] + i] = mv; });
      if (acked) publish();
      if (fresh) emit('setup');
      else if (!was) emit('peer');
      if (opp.over && !m.over) { m.over = opp.over; save(); emit('over'); }
      if (oppN === m.log.length && opp.h && m.hash && opp.h !== m.hash) { m.problem = 'drift'; emit('drift'); }
      if (inbox[m.log.length]) emit('moves');
    }
    var how = transport();
    (how ? TRANSPORTS[how](ROOM + m.code) : Promise.resolve(null)).catch(function (e) {
      console.warn('Match room not joined:', e && e.code, e && e.message);
      m.room.error = (e && e.code) || 'error';
      return null;
    }).then(function (l) {
      if (closed) { if (l) l.leave(); return; }
      if (!l) { m.status = 'failed'; m.room.error = m.room.error || 'unavailable'; return emit('status'); }
      link = l;
      link.status(function (s, code) { m.status = s === 'up' ? 'open' : s; if (code) m.room.error = code; emit('status'); });
      link.hear(heard);
      publish();
    });
    m.on = function (fn) { listeners.push(fn); };
    // Every move the battle applies comes through here, its own and the opponent's, with the battle's fingerprint after it.
    m.record = function (move, h) {
      delete inbox[m.log.length];
      m.log.push(move);
      m.hash = h;
      save();
      publish();
    };
    m.incoming = function () { return inbox[m.log.length] || null; };
    m.resign = function () { if (m.over) return; m.over = { resigned: m.seat }; save(); publish(); };
    // The battle ended on the board. The record stays until the player starts another match, and the link stays open so
    // the opponent still gets the last moves.
    m.finished = function () { if (!m.over) { m.over = { ended: true }; save(); publish(); } };
    m.close = function () { closed = true; if (link) link.leave(); link = null; if (current === m) current = null; };
    save();
    return m;
  }

  return {
    transport: transport,
    stateHash: stateHash,
    cleanCode: cleanCode,
    host: function (deck) { return open({ code: newCode(), seat: 0, pid: nonce(), deck: deck }); },
    join: function (code, deck) { return open({ code: cleanCode(code), seat: 1, pid: nonce(), deck: deck }); },
    // A match that was set up and hasn't ended, from this page or one before it.
    saved: function () { var r = read(); return r && r.setup && !r.over ? r : null; },
    resume: function () { var r = read(); return r && r.setup ? open(r) : null; },
    current: function () { return current; },
    forget: function () { var r = current || read(); if (current) current.close(); if (r) drop(r.pid); },
    // Another way for the state to travel, such as a relay server for a page hosted outside Claude: open(name) resolves a link.
    useTransport: function (name, openLink) { if (openLink) TRANSPORTS[name] = openLink; forced = name; }
  };
})();
if (typeof module !== 'undefined') module.exports = Net;
