// Sound. Each moment has one file in sfx/, listed in sfx/CREDITS.md. Sounds load on first use and play through Web Audio,
// so a sound can be pitched, layered and long files trimmed. Two tavern tunes play quietly underneath. A muted table
// stays muted between visits. Sounds are .ogg or .wav: the published page can't serve .mp4 audio to other viewers.
var Sfx = (function () {
  var FILES = {
    'card-draw': 'card-draw.ogg', 'card-hover': 'card-hover.wav', 'card-play': 'card-play.ogg', 'card-flip': 'card-flip.ogg', shuffle: 'shuffle.ogg',
    'unit-summon': 'unit-summon.wav', slash: 'attack-slash.wav', spear: 'attack-spear.wav', arrow: 'attack-arrow.wav', magic: 'attack-magic.wav',
    crush: 'attack-crush.ogg',
    'beast-death': 'beast-death.ogg', 'summoner-hit': 'summoner-hit.wav', 'enemy-turn': 'enemy-turn.ogg',
    'button-press': 'button-press.wav', 'button-hover': 'button-hover.wav', 'page-turn': 'page-turn.ogg', 'map-step': 'map-step.ogg',
    stamp: 'seal-stamp.ogg', 'coin-drop': 'coin-drop.wav', 'coin-pile': 'coin-pile.wav', victory: 'victory.wav', 'level-up': 'level-up.wav', defeat: 'defeat.wav', 'defeat-run': 'defeat-run.wav',
    'spell-vigil': 'spell-vigil.wav', 'spell-gnosis': 'spell-gnosis.wav', 'spell-ice': 'spell-ice.wav',
    'spell-lightning': 'spell-lightning.wav', 'spell-fire': 'spell-fire.wav', 'spell-dominion': 'spell-dominion.ogg', 'spell-genesis': 'spell-genesis.wav',
    'impact-fire': 'impact-fire.wav', 'impact-lightning': 'impact-lightning.wav', 'impact-genesis': 'impact-genesis.wav',
    enchant: 'enchant.wav', equip: 'equip.wav', curse: 'curse.wav', heal: 'heal.wav', 'hit-unit': 'hit-unit.wav', ward: 'ward.wav',
    'unit-move': 'unit-move.wav', 'end-turn': 'end-turn.wav', 'not-allowed': 'not-allowed.ogg',
    'music-tower-inn': 'music-tower-inn.wav', 'music-kings-feast': 'music-kings-feast.wav'
  };
  // A thrown spell's three stages each have an air layer every spell shares and, for most elements, a sound of its own.
  var ELEMENTS = ['fire', 'ice', 'lightning', 'vigil', 'gnosis', 'dominion', 'genesis'], STAGES = [];
  ['charge', 'launch', 'flight'].forEach(function (stage) {
    ['air'].concat(ELEMENTS).forEach(function (el) { STAGES.push(stage + '-' + el); FILES[stage + '-' + el] = stage + '-' + el + (stage === 'launch' && el === 'fire' ? '.ogg' : '.wav'); });
  });
  // No charge fitted Vigil or Gnosis, nor a launch Gnosis: those stages play the air alone.
  ['charge-vigil', 'charge-gnosis', 'launch-gnosis'].forEach(function (name) { delete FILES[name]; });
  // How each is played: volume, pitch (playback rate), and a length in seconds after which it fades out.
  var HOW = {
    // Card sounds sit under the combat: hovering a card is a light touch of card on card, drawing a soft slide.
    'card-hover': { vol: .22 }, 'card-draw': { vol: .4 }, 'card-play': { vol: .5 }, 'card-flip': { vol: .5 }, shuffle: { vol: .5 },
    'button-hover': { vol: .3 }, 'button-press': { vol: .6 }, slash: { len: .7 }, magic: { vol: .8 },
    // Victory is a win jingle and a level-up (none yet) an achievement jingle. A battle lost outside the campaign is a
    // quiet lose jingle; a lost campaign battle, which ends the run, a sad phrase.
    victory: { vol: .6 }, 'level-up': { vol: .6 }, defeat: { vol: .32 }, 'defeat-run': { vol: .55 }, 'coin-drop': { vol: .7 }, 'map-step': { vol: .6 }, 'enemy-turn': { vol: .55 },
    // The spell sounds were levelled alike on the sound board, so they share a volume. Dominion's is a catching flame pitched
    // down into something darker, and an enchantment's finger cymbal is pitched down too.
    'spell-vigil': { vol: .55 }, 'spell-gnosis': { vol: .55 }, 'spell-ice': { vol: .55 }, 'spell-lightning': { vol: .5 },
    'spell-fire': { vol: .55 }, 'spell-dominion': { vol: .9, rate: .55 }, 'spell-genesis': { vol: .6 }, enchant: { vol: .5, rate: .72 },
    equip: { vol: .5 }, curse: { vol: .5 }, heal: { vol: .5 }, 'hit-unit': { vol: .55 }, ward: { vol: .5 },
    'unit-move': { vol: .5 }, 'end-turn': { vol: .55 }, 'not-allowed': { vol: .6 },
    // The spell stages were levelled alike on the sound board and sit at the impact's volume; the rushing air of a
    // flight stays under the element.
    'flight-air': { vol: .38 },
    'impact-fire': { vol: .55 }, 'impact-lightning': { vol: .5 }, 'impact-genesis': { vol: .55 }
  };
  // Fire, lightning and Genesis land with a blow under the spell's own sound; lightning's crackle comes just after the
  // strike.
  var LAYERS = { 'spell-fire': ['impact-fire', 0], 'spell-lightning': ['impact-lightning', .25], 'spell-genesis': ['impact-genesis', 0] };
  STAGES.forEach(function (name) { if (!HOW[name]) HOW[name] = { vol: .55 }; });
  // The two tavern tunes take turns under everything, quietly, from the first click in this page. Some browsers allow
  // sound before any click, so waiting for one keeps a page left open in the background silent. Only one open copy of
  // the game plays music: starting it tells the others to stop.
  var TUNES = ['music-tower-inn', 'music-kings-feast'], MUSIC_VOL = .16, tune = 0, musicSrc = null, musicGain = null, clicked = false;
  var tavern = null;
  try { tavern = new BroadcastChannel('breachline-music'); tavern.onmessage = function () { stopMusic(); }; } catch (e) {}
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
  // A sound asked for again within gap ms is dropped, so a sweep across the hand doesn't stutter. o.fadeIn swells it in over
  // that many seconds; o.fromEnd plays only the file's last seconds, so a sound that builds peaks when it stops.
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
      var from = o.fromEnd ? Math.max(0, buf.duration - o.fromEnd) : 0;
      if (o.fadeIn) { gain.gain.setValueAtTime(0.0001, t); gain.gain.linearRampToValueAtTime(vol, t + o.fadeIn); }
      else gain.gain.setValueAtTime(vol, t);
      if (len) { gain.gain.setValueAtTime(vol, t + len * .7); gain.gain.linearRampToValueAtTime(0.0001, t + len); }
      src.connect(gain).connect(c.destination);
      src.start(t, from);
      if (len) src.stop(t + len + .02);
    };
    if (buffers[name]) go(buffers[name]);
    else { var p = load(name); if (p) p.then(go); }
    var layer = LAYERS[name];
    if (layer) play(layer[0], { delay: (o.delay || 0) + layer[1], vol: o.vol, gap: 0 });
  }
  // Browsers only allow sound after a click, so the common sounds are fetched then.
  var warmed = false;
  function warm() {
    if (warmed || muted) return;
    warmed = true;
    ['button-press', 'button-hover', 'card-hover', 'card-draw', 'card-play', 'page-turn', 'slash', 'unit-summon', 'hit-unit', 'impact-fire', 'impact-lightning', 'impact-genesis'].concat(STAGES).forEach(load);
  }
  document.addEventListener('pointerdown', function () { clicked = true; warm(); music(); }, { once: false, passive: true });

  // Each tune plays through once, then the other begins. The first one fades in; muting stops it.
  function music() {
    if (muted || musicSrc || !clicked || !context()) return;
    var c = ctx, name = TUNES[tune % TUNES.length], p = load(name);
    if (!p) return;
    musicSrc = 'loading';
    p.then(function (buf) {
      if (musicSrc !== 'loading') return;
      if (!buf || muted) { musicSrc = null; return; }
      if (c.state === 'suspended') c.resume();
      if (!musicGain) {
        musicGain = c.createGain();
        musicGain.gain.setValueAtTime(0.0001, c.currentTime);
        musicGain.gain.linearRampToValueAtTime(MUSIC_VOL, c.currentTime + 4);
        musicGain.connect(c.destination);
      }
      var src = c.createBufferSource();
      src.buffer = buf;
      src.connect(musicGain);
      src.onended = function () { if (musicSrc === src) { musicSrc = null; tune++; music(); } };
      musicSrc = src;
      src.start();
      if (tavern) tavern.postMessage('playing');
    });
  }
  function stopMusic() {
    var src = musicSrc;
    musicSrc = null;
    if (src && src.stop) try { src.stop(); } catch (e) {}
    if (musicGain) { musicGain.disconnect(); musicGain = null; }
  }

  // One stage of a thrown spell, layered and overlapping the next: the air drawn in swells to its peak at the launch while
  // the element's charge rings on past it; the flight's sounds last as long as the throw, plus a little tail into the hit.
  // el is an element from ELEMENTS, or null for the air alone; secs is the charge's or the flight's length.
  function spell(stage, el, secs) {
    if (stage === 'charge') {
      play('charge-air', { fromEnd: secs + .09, len: secs + .04, gap: 0 });
      if (el) play('charge-' + el, { len: secs + .15, fadeIn: .08, gap: 0 });
    } else if (stage === 'launch') {
      play('launch-air', { len: .7, gap: 0 });
      if (el) play('launch-' + el, { len: .6, gap: 0 });
    } else if (stage === 'flight') {
      play('flight-air', { delay: .05, len: secs + .1, fadeIn: .06, gap: 0 });
      if (el) play('flight-' + el, { delay: .02, len: secs + .15, fadeIn: .05, gap: 0 });
    }
  }

  function setMuted(on) {
    muted = !!on;
    try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) {}
    if (!muted) { warm(); music(); } else stopMusic();
    document.querySelectorAll('[data-sound]').forEach(function (b) { b.setAttribute('aria-pressed', muted ? 'false' : 'true'); b.title = muted ? 'Sound is off' : 'Sound is on'; });
  }
  return { play: play, spell: spell, muted: function () { return muted; }, setMuted: setMuted, toggle: function () { setMuted(!muted); } };
})();
