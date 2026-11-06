// Campaign runs, with no DOM. A run is one attempt at an alignment's story: a starter deck, a fixed route of battles on
// the map and a card after each win. A loss ends it. The chapter text is draft, tracked in CAMPAIGN.md.
var Campaign = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  var KEY = 'breachline.campaign.v1', OFFER = 3, MAX_REWARD_COST = 7, store = null, mem = null, ended = null;
  // If the browser refuses storage, the run stays in memory and persistent() lets the screens say so.
  try {
    store = window.localStorage;
    store.setItem(KEY + '.test', '1');
    store.removeItem(KEY + '.test');
  } catch (e) { store = null; }

  // x and y place a chapter on the map, as percentages. place picks the terrain drawn around it.
  var STORIES = {
    vigil: {
      id: 'vigil', colour: 'W', title: 'The Shrine Road', starter: 'white',
      premise: 'A shepherd came down from the high country with a story. At the old shrine, after a hundred and fifty years, something answered her. The Oath has heard stories before. It sends you anyway.',
      ending: 'The shrine is one small room with a cold lamp. You light it and wait. Near dawn, with no wind, the flame leans toward you. It might be nothing. You send word anyway.',
      defeat: 'The Oath will send someone else. The road is still there.',
      chapters: [
        {
          id: 'ford', title: 'The ford', place: 'ford', x: 16, y: 74,
          text: 'Cinder Clan raiders hold the ford. They took a vote on you before you arrived.',
          enemy: { name: 'Cinder Clan raiders', colours: ['R'], list: [['land_r', 13], ['goblin', 3], ['clanraiders', 1], ['raider', 2], ['berserker', 1], ['sellsword', 1], ['hex', 2], ['youngsummoner', 1]] }
        },
        {
          id: 'forest', title: 'The closed road', place: 'forest', x: 41, y: 83,
          text: 'The old road goes through the forest, or did. The Thornwardens have spent three generations making sure of it.',
          enemy: { name: 'The Thornwardens', colours: ['G'], list: [['land_g', 14], ['sapling', 2], ['saboteur', 1], ['wayfinder', 2], ['owl', 1], ['shifting', 2], ['youngsummoner', 2]] }
        },
        {
          id: 'pass', title: 'The pass', place: 'pass', x: 56, y: 53,
          text: "The hill bands don't care what answered her. They care that you're carrying grain through their pass.",
          enemy: { name: 'The Warhorde', colours: ['R'], list: [['land_r', 13], ['goblin', 3], ['raider', 2], ['sellsword', 2], ['warchief', 1], ['giant', 2], ['firebolt', 1]] }
        },
        {
          id: 'gate', title: 'The lower gate', place: 'gate', x: 31, y: 34,
          text: "The Conclave got here first. They've brought instruments.",
          enemy: { name: 'The Lantern Conclave', colours: ['U'], list: [['land_u', 14], ['decoy', 3], ['conjurer', 1], ['scholar', 3], ['arcanist', 1], ['chorister', 1], ['displacement', 1]] }
        },
        {
          id: 'field', title: 'The fallow field', place: 'field', x: 61, y: 23,
          text: 'Nobody has farmed the field below the shrine. Tonight, it stands up.',
          enemy: { name: 'The Gravebound', colours: ['B'], list: [['land_b', 12], ['thrall', 3], ['harvester', 3], ['noble', 2], ['raise', 2], ['sellsword', 2]] }
        },
        {
          id: 'shrine', title: 'The shrine steps', place: 'shrine', x: 86, y: 17,
          text: 'Vashkar, Who Counts the Dead, is waiting on the shrine steps. He has already counted you.',
          enemy: { name: 'Vashkar, Who Counts the Dead', colours: ['B'], list: [['land_b', 13], ['thrall', 2], ['harvester', 2], ['noble', 2], ['vashkar', 2], ['raise', 1], ['warrant', 1], ['firebolt', 1]] }
        }
      ]
    }
  };

  function landOf(colour) { return 'land_' + colour.toLowerCase(); }
  function known(id) { return Object.prototype.hasOwnProperty.call(E.CARDS, id); }
  function rand(run) {
    run.seed = (run.seed + 0x6D2B79F5) | 0;
    var t = Math.imul(run.seed ^ (run.seed >>> 15), 1 | run.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function read() {
    if (!store) return mem;
    try { return store.getItem(KEY); } catch (e) { return null; }
  }
  function write(text) {
    if (!store) { mem = text; return true; }
    try {
      if (text === null) store.removeItem(KEY); else store.setItem(KEY, text);
      return true;
    } catch (e) { return false; }
  }
  function save(run) { return write(JSON.stringify(run)); }

  // A battle saved before a card left the game can't be played on, so that battle starts over.
  function battleOk(b) {
    if (!b || !b.players || !b.units) return false;
    var ok = true, check = function (i) { if (!known(i.c)) ok = false; };
    b.players.forEach(function (p) { [p.deck, p.hand, p.discard, p.lands].forEach(function (pile) { (pile || []).forEach(check); }); });
    b.units.forEach(function (u) { if (!known(u.cardId)) ok = false; (u.enchants || []).forEach(check); });
    return ok;
  }
  // Saved runs outlive game updates, so nothing in one is trusted until it has been checked against this version.
  function checked(run) {
    var story = run && STORIES[run.story];
    if (!story || !Array.isArray(run.list) || run.chapter !== (run.chapter | 0) || run.chapter < 0 || run.chapter >= story.chapters.length) return null;
    run.list = run.list.filter(function (e) { return known(e[0]); });
    if (!run.list.length) return null;
    if (!battleOk(run.battle)) run.battle = null;
    if (run.status === 'reward' && !(run.offer && run.offer.cards.concat(run.offer.lands).every(known))) run.offer = makeOffer(run);
    return run;
  }
  function current() {
    var raw = read();
    if (!raw) return null;
    try { return checked(JSON.parse(raw)); } catch (e) { return null; }
  }

  function begin(storyId, player, seed) {
    var story = STORIES[storyId];
    ended = null;
    var run = {
      story: storyId, player: player, chapter: 0, status: 'map', battle: null, offer: null, taken: [],
      seed: (seed === undefined ? Math.floor(Math.random() * 2147483647) : seed) | 0,
      list: E.DECKS[story.starter].list.map(function (e) { return e.slice(); })
    };
    save(run);
    return run;
  }
  function storyOf(run) { return STORIES[run.story]; }
  function chapterOf(run) { return storyOf(run).chapters[run.chapter]; }
  function decks(run) {
    return [{ name: E.DECKS[storyOf(run).starter].name, colours: [storyOf(run).colour], list: run.list }, chapterOf(run).enemy];
  }

  function copiesOf(run, id) {
    var e = run.list.filter(function (x) { return x[0] === id; })[0];
    return e ? e[1] : 0;
  }
  function rewardable(run, colours) {
    return Object.keys(E.CARDS).filter(function (id) {
      var c = E.CARDS[id];
      return colours.indexOf(c.colour) >= 0 && c.type !== 'land' && c.sub !== 'Velunn' && c.cost + c.wants <= MAX_REWARD_COST && copiesOf(run, id) < E.maxCopies(id);
    });
  }
  function draw(run, from, out) {
    var left = from.filter(function (id) { return out.indexOf(id) < 0; });
    if (left.length) out.push(left[Math.floor(rand(run) * left.length)]);
  }
  // Two cards from your own side and one from the enemy you just beat, or a land for either, so a deck can keep up its mana.
  function makeOffer(run) {
    var story = storyOf(run), foe = chapterOf(run).enemy.colours[0], cards = [], own = rewardable(run, [story.colour, 'N']);
    draw(run, rewardable(run, foe === story.colour ? [] : [foe]), cards);
    while (cards.length < OFFER && own.some(function (id) { return cards.indexOf(id) < 0; })) draw(run, own, cards);
    cards.reverse();
    return { cards: cards, spoils: foe === story.colour ? null : foe, lands: foe === story.colour ? [landOf(story.colour)] : [landOf(story.colour), landOf(foe)] };
  }

  function saveBattle(state) {
    var run = current();
    if (!run) return false;
    run.battle = state;
    return save(run);
  }
  // A win moves to a reward or the ending, a loss ends the run on the spot so reloading the page can't undo it, and a draw refights the chapter.
  function finish(winner) {
    var run = current();
    if (!run) return ended;
    run.battle = null;
    if (winner === 'draw') { save(run); return run; }
    if (winner !== 0) run.status = 'lost';
    else if (run.chapter === storyOf(run).chapters.length - 1) run.status = 'won';
    else { run.status = 'reward'; run.offer = makeOffer(run); }
    if (run.status === 'reward') save(run);
    else { ended = run; write(null); }
    return run;
  }
  // id is a card or land from the offer. Null takes nothing, which keeps the deck as tight as it is.
  function take(id) {
    var run = current();
    if (!run || run.status !== 'reward' || !run.offer) return null;
    if (id !== null) {
      if (run.offer.cards.concat(run.offer.lands).indexOf(id) < 0) return null;
      var e = run.list.filter(function (x) { return x[0] === id; })[0];
      if (e) e[1] += 1; else run.list.push([id, 1]);
      run.taken.push(id);
    }
    run.offer = null;
    run.status = 'map';
    run.chapter += 1;
    save(run);
    return run;
  }
  function abandon() { ended = null; write(null); }

  return {
    STORIES: STORIES, current: current, begin: begin, storyOf: storyOf, chapterOf: chapterOf, decks: decks, saveBattle: saveBattle,
    finish: finish, take: take, abandon: abandon, ended: function () { return ended; }, dismiss: function () { ended = null; },
    persistent: function () { return !!store; }
  };
})();
if (typeof module !== 'undefined') module.exports = Campaign;
