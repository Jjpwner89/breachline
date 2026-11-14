// Sound. Each moment has one file in sfx/, listed in sfx/CREDITS.md. Sounds load on first use and play through Web Audio,
// so a sound can be pitched, layered and long files trimmed. Music plays quietly underneath and follows the mood of the
// screen. A muted table stays muted between visits. Sounds are .ogg or .wav, and music .mp3 too: the published page can't
// serve .mp4 audio to other viewers.
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
    'music-tower-inn': 'music-tower-inn.wav', 'music-kings-feast': 'music-kings-feast.wav',
    'codex-whoosh': 'codex-whoosh.wav', 'codex-drop': 'codex-drop.wav', 'codex-open': 'codex-open.wav', 'codex-cover-land': 'codex-cover-land.wav',
    'codex-page': 'codex-page.wav', 'codex-flutter': 'codex-flutter.wav', 'codex-close': 'codex-close.wav'
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
    'impact-fire': { vol: .55 }, 'impact-lightning': { vol: .5 }, 'impact-genesis': { vol: .55 },
    // The lore codex book. The files are levelled alike; these are starting points to tune by ear (CODEX_BOOK.md).
    'codex-whoosh': { vol: .25 }, 'codex-drop': { vol: .75 }, 'codex-open': { vol: .6 }, 'codex-cover-land': { vol: .4 },
    'codex-page': { vol: .5 }, 'codex-flutter': { vol: .5 }, 'codex-close': { vol: .7 }
  };
  // Fire, lightning and Genesis land with a blow under the spell's own sound; lightning's crackle comes just after the
  // strike.
  var LAYERS = { 'spell-fire': ['impact-fire', 0], 'spell-lightning': ['impact-lightning', .25], 'spell-genesis': ['impact-genesis', 0] };
  STAGES.forEach(function (name) { if (!HOW[name]) HOW[name] = { vol: .55 }; });
  // Music follows the mood of the screen: the tavern tunes at home and over the decks, travelling tunes on the campaign,
  // battle tunes at the table and a harder one for a story's last chapter or a summoner near the end. A campaign can have
  // its own road and battle tunes (road-vigil, battle-vigil and so on), used in place of the shared ones. A mood's tunes
  // take turns while it lasts; a change of mood fades the old tune out and the next one in. A mood with no tunes of its
  // own leaves the music as it is. Music waits for the first click in the page, as some browsers allow sound before one
  // and a page left open in the background should stay silent. Only one open copy of the game plays music: starting it
  // tells the others to stop. vol levels each tune to the tavern tunes, measured on the music board.
  var TUNES = {
    'tower-inn': { file: 'music-tower-inn.wav', vol: .92 }, 'kings-feast': { file: 'music-kings-feast.wav', vol: 1.1 },
    'bards-tale': { file: 'music-bards-tale.mp3', vol: 1.33 }, 'minstrel-dance': { file: 'music-minstrel-dance.mp3', vol: .81 },
    'market-day': { file: 'music-market-day.mp3', vol: .48 },
    exploration: { file: 'music-exploration.mp3', vol: 2.48 }, 'harvest-season': { file: 'music-harvest-season.mp3', vol: .62 },
    battle: { file: 'music-battle.mp3', vol: .8 }, battlegrounds: { file: 'music-battlegrounds.mp3', vol: .575 },
    'battle-theme': { file: 'music-battle-theme.mp3', vol: .76 }, 'war-theme': { file: 'music-war-theme.ogg', vol: .82 },
    'victory-theme': { file: 'music-victory-theme.mp3', vol: .63 }, 'defeat-theme': { file: 'music-defeat-theme.mp3', vol: .495 },
    cathedral: { file: 'music-cathedral.wav', vol: 1.93 }, 'new-town': { file: 'music-new-town.mp3', vol: .92 },
    'dark-shrine': { file: 'music-dark-shrine.mp3', vol: 1.78 }, 'cathedral-forest': { file: 'music-cathedral-forest.ogg', vol: .81 },
    foreboding: { file: 'music-foreboding.ogg', vol: 1.51 }, 'enemy-marches': { file: 'music-enemy-marches.ogg', vol: .91 },
    'viking-march': { file: 'music-viking-march.ogg', vol: 1.82 }, manganda: { file: 'music-manganda.wav', vol: .81 },
    'beautiful-forest': { file: 'music-beautiful-forest.ogg', vol: .86 }, 'forest-whisper': { file: 'music-forest-whisper.ogg', vol: 4.37 }
  };
  // wait holds the new tune back for that many seconds, so the win or lose jingle is heard first; once plays the tunes
  // through a single time and then leaves the table quiet.
  var MOODS = {
    hearth: { tunes: ['tower-inn', 'kings-feast', 'bards-tale', 'minstrel-dance', 'market-day'] },
    road: { tunes: ['exploration', 'harvest-season'] },
    battle: { tunes: ['battle', 'battlegrounds'] },
    clash: { tunes: ['battle-theme', 'war-theme'] },
    won: { tunes: ['victory-theme'], once: true, wait: 4 },
    lost: { tunes: ['defeat-theme'], once: true, wait: 5.5 },
    // The campaigns' own, picked on the campaign music board. The Quiet Order keeps to its own tunes throughout; No Throne
    // and The Green Return mix one of theirs into the shared battle tunes and keep the shared clash.
    'road-vigil': { tunes: ['cathedral', 'harvest-season'] },
    'road-gnosis': { tunes: ['new-town', 'exploration'] },
    'road-dominion': { tunes: ['dark-shrine', 'cathedral-forest'] },
    'battle-dominion': { tunes: ['foreboding'] },
    'clash-dominion': { tunes: ['enemy-marches'] },
    'road-fervor': { tunes: ['viking-march', 'battle'] },
    'battle-fervor': { tunes: ['manganda', 'battle', 'battlegrounds'] },
    'road-genesis': { tunes: ['beautiful-forest', 'harvest-season'] },
    'battle-genesis': { tunes: ['forest-whisper', 'battle', 'battlegrounds'] }
  };
  var MUSIC_VOL = .16, FADE = 2.5, mood = 'hearth', turn = {}, voice = null, hold = 0, clicked = false, bus = null, ducked = false;
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
  // that many seconds; o.fromEnd plays only the file's last seconds, so a sound that builds peaks when it stops; o.from
  // starts that many seconds in. It returns a voice whose fade(secs) quietens it to nothing, even before it has loaded.
  var SILENT = { fade: function () {} };
  function play(name, o) {
    o = o || {};
    if (muted || !FILES[name]) return SILENT;
    var now = Date.now(), gap = o.gap === undefined ? 40 : o.gap;
    if (last[name] && now - last[name] < gap) return SILENT;
    last[name] = now;
    var c = context();
    if (!c) return SILENT;
    if (c.state === 'suspended') c.resume();
    var voice = { gain: null, src: null, gone: false, fade: function (secs) {
      voice.gone = true;
      if (!voice.gain) return;
      var t = c.currentTime;
      voice.gain.gain.cancelScheduledValues(t); voice.gain.gain.setValueAtTime(voice.gain.gain.value, t);
      voice.gain.gain.linearRampToValueAtTime(0.0001, t + (secs || .08)); voice.src.stop(t + (secs || .08) + .02);
    } };
    var go = function (buf) {
      if (!buf || muted || voice.gone) return;
      var how = HOW[name] || {}, src = c.createBufferSource(), gain = c.createGain(), t = c.currentTime + (o.delay || 0);
      var vol = (how.vol || 1) * (o.vol === undefined ? 1 : o.vol), len = o.len || how.len;
      src.buffer = buf;
      src.playbackRate.value = (how.rate || 1) * (o.rate || 1);
      var from = o.fromEnd ? Math.max(0, buf.duration - o.fromEnd) : Math.min(o.from || 0, buf.duration);
      if (o.fadeIn) { gain.gain.setValueAtTime(0.0001, t); gain.gain.linearRampToValueAtTime(vol, t + o.fadeIn); }
      else gain.gain.setValueAtTime(vol, t);
      if (len) { gain.gain.setValueAtTime(vol, t + len * .7); gain.gain.linearRampToValueAtTime(0.0001, t + len); }
      src.connect(gain).connect(c.destination);
      src.start(t, from);
      if (len) src.stop(t + len + .02);
      voice.gain = gain; voice.src = src;
    };
    if (buffers[name]) go(buffers[name]);
    else { var p = load(name); if (p) p.then(go); }
    var layer = LAYERS[name];
    if (layer) play(layer[0], { delay: (o.delay || 0) + layer[1], vol: o.vol, gap: 0 });
    return voice;
  }
  // Fetches sounds ahead of a moment that needs them on time, such as the codex book opening.
  function preload(names) { if (!muted && context()) names.forEach(load); }
  // Quietens the music while something wants the room, such as reading the codex, and brings it back after. Every tune
  // plays through one shared gain, so a tune that starts while the music is ducked starts quiet too.
  function duck(on) {
    ducked = !!on;
    if (!bus) return;
    var t = ctx.currentTime;
    bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t);
    bus.gain.linearRampToValueAtTime(ducked ? .5 : 1, t + .8);
  }
  // Browsers only allow sound after a click, so the common sounds are fetched then.
  var warmed = false;
  function warm() {
    if (warmed || muted) return;
    warmed = true;
    ['button-press', 'button-hover', 'card-hover', 'card-draw', 'card-play', 'page-turn', 'slash', 'unit-summon', 'hit-unit', 'impact-fire', 'impact-lightning', 'impact-genesis'].concat(STAGES).forEach(load);
  }
  document.addEventListener('pointerdown', function () { clicked = true; warm(); music(); }, { once: false, passive: true });

  // A tune streams from an <audio> element through Web Audio, so a long one starts at once and isn't held in memory
  // whole. When it ends the mood's next tune begins after a breath; a tune that won't load is skipped from then on.
  function music() {
    var m = MOODS[mood], list = m.tunes.filter(function (n) { return !TUNES[n].bad; });
    if (muted || voice || !clicked || !list.length || Date.now() < hold || !context()) return;
    var k = turn[mood] || 0;
    if (m.once && k >= list.length) return;
    turn[mood] = k + 1;
    var name = list[k % list.length], c = ctx, el = new Audio('sfx/' + TUNES[name].file), gain = c.createGain(), v = { el: el, gain: gain };
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.linearRampToValueAtTime(MUSIC_VOL * (TUNES[name].vol || 1), c.currentTime + FADE);
    if (!bus) { bus = c.createGain(); bus.gain.value = ducked ? .5 : 1; bus.connect(c.destination); }
    c.createMediaElementSource(el).connect(gain).connect(bus);
    var next = function (bad) {
      if (voice !== v) return;
      if (bad) TUNES[name].bad = true;
      voice = null;
      fade(v, 0);
      hold = Date.now() + 1500;
      setTimeout(music, 1500);
    };
    el.onended = function () { next(false); };
    el.onerror = function () { next(true); };
    voice = v;
    if (c.state === 'suspended') c.resume();
    var go = el.play();
    if (go && go.catch) go.catch(function () { if (voice === v) { voice = null; fade(v, 0); } });
    if (tavern) tavern.postMessage('playing');
  }
  function fade(v, secs) {
    if (!v) return;
    var g = v.gain.gain, t = ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0.0001, t + secs + .02);
    setTimeout(function () { v.el.pause(); v.el.removeAttribute('src'); v.el.load(); v.gain.disconnect(); }, secs * 1000 + 80);
  }
  function stopMusic() {
    fade(voice, .3);
    voice = null;
  }
  // Called whenever a screen shows or the battle changes; the same mood again does nothing. Coming back to a mood plays
  // its next tune, and a once mood starts from its first. story picks that campaign's own tunes for the mood, if it has any.
  function setMood(name, story) {
    if (story && MOODS[name + '-' + story]) name += '-' + story;
    var m = MOODS[name];
    if (!m || name === mood || !m.tunes.length) return;
    mood = name;
    if (m.once) turn[name] = 0;
    fade(voice, voice ? FADE : 0);
    voice = null;
    hold = Date.now() + (m.wait || 0) * 1000;
    if (m.wait) setTimeout(music, m.wait * 1000 + 20); else music();
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
  return { play: play, preload: preload, duck: duck, spell: spell, mood: setMood, muted: function () { return muted; }, setMuted: setMuted, toggle: function () { setMuted(!muted); } };
})();
