// Sound. Each moment has one file in sfx/, listed in sfx/CREDITS.md. Sounds load on first use and play through Web Audio,
// so the summoner hit can be pitched down and long files trimmed. A muted table stays muted between visits.
var Sfx = (function () {
  var FILES = {
    'card-draw': 'card-draw.ogg', 'card-hover': 'button-hover.mp4', 'card-play': 'card-play.ogg', 'card-flip': 'card-flip.ogg', shuffle: 'shuffle.ogg',
    'unit-summon': 'unit-summon.ogg', slash: 'attack-slash.mp4', spear: 'attack-spear.ogg', arrow: 'attack-arrow.mp4', crush: 'attack-crush.ogg',
    'beast-death': 'beast-death.ogg', 'summoner-hit': 'summoner-hit.ogg', 'enemy-turn': 'enemy-turn.ogg',
    'button-press': 'button-press.mp4', 'button-hover': 'button-hover.mp4', 'page-turn': 'page-turn.ogg', 'map-step': 'map-step.ogg',
    stamp: 'seal-stamp.ogg', 'coin-drop': 'coin-drop.ogg', 'coin-pile': 'coin-pile.mp4', victory: 'victory.ogg'
  };
  // How each is played: volume, pitch (playback rate), and a length in seconds after which it fades out.
  var HOW = {
    // Card sounds sit under the combat: hovering a card is the button hover, softer and a little lower; drawing is pitched down.
    'card-hover': { vol: .16, rate: .86 }, 'card-draw': { vol: .3, rate: .74 }, 'card-play': { vol: .5 }, 'card-flip': { vol: .5 }, shuffle: { vol: .5 },
    'button-hover': { vol: .3 }, 'button-press': { vol: .6 }, slash: { len: .7 }, 'summoner-hit': { rate: .88 },
    victory: { len: 1.5, vol: .8 }, 'coin-drop': { vol: .7 }, 'map-step': { vol: .6 }, 'enemy-turn': { vol: .55 }
  };
  var KEY = 'breachline.muted', ctx = null, buffers = {}, loading = {}, last = {};
  var muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) {}

  function context() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  }
  function load(name) {
    if (buffers[name] || loading[name] || !FILES[name] || !context()) return loading[name];
    loading[name] = fetch('sfx/' + FILES[name]).then(function (r) { return r.arrayBuffer(); }).then(function (data) {
      return new Promise(function (ok, no) { ctx.decodeAudioData(data, ok, no); });
    }).then(function (buf) { buffers[name] = buf; return buf; }, function () { return null; });
    return loading[name];
  }
  // A sound asked for again within gap ms is dropped, so a sweep across the hand doesn't stutter.
  function play(name, o) {
    o = o || {};
    if (muted || !FILES[name]) return;
    var now = Date.now(), gap = o.gap === undefined ? 40 : o.gap;
    if (last[name] && now - last[name] < gap) return;
    last[name] = now;
    var c = context();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    var go = function (buf) {
      if (!buf || muted) return;
      var how = HOW[name] || {}, src = c.createBufferSource(), gain = c.createGain(), t = c.currentTime + (o.delay || 0);
      var vol = (how.vol || 1) * (o.vol === undefined ? 1 : o.vol), len = o.len || how.len;
      src.buffer = buf;
      src.playbackRate.value = (how.rate || 1) * (o.rate || 1);
      gain.gain.setValueAtTime(vol, t);
      if (len) { gain.gain.setValueAtTime(vol, t + len * .7); gain.gain.linearRampToValueAtTime(0.0001, t + len); src.stop(t + len + .02); }
      src.connect(gain).connect(c.destination);
      src.start(t);
    };
    if (buffers[name]) go(buffers[name]);
    else { var p = load(name); if (p) p.then(go); }
  }
  // Browsers only allow sound after a click, so the common sounds are fetched then.
  var warmed = false;
  function warm() {
    if (warmed || muted) return;
    warmed = true;
    ['button-press', 'button-hover', 'card-hover', 'card-draw', 'card-play', 'page-turn', 'slash', 'unit-summon'].forEach(load);
  }
  document.addEventListener('pointerdown', warm, { once: false, passive: true });

  function setMuted(on) {
    muted = !!on;
    try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) {}
    if (!muted) warm();
    document.querySelectorAll('[data-sound]').forEach(function (b) { b.setAttribute('aria-pressed', muted ? 'false' : 'true'); b.title = muted ? 'Sound is off' : 'Sound is on'; });
  }
  return { play: play, muted: function () { return muted; }, setMuted: setMuted, toggle: function () { setMuted(!muted); } };
})();
