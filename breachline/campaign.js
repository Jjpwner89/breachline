// Campaign runs, with no DOM. A run is one attempt at an alignment's story: a starter deck, a fixed route of battles on
// the map and a card after each win, kept in a reserve that can be swapped into the deck between battles. A loss ends it. The story text is draft, tracked in CAMPAIGN.md.
var Campaign = (function () {
  var E = typeof Engine !== 'undefined' ? Engine : require('./engine.js');
  var KEY = 'breachline.campaign.v1', OFFER = 3, MAX_REWARD_COST = 7, store = null, mem = null, ended = null;
  // If the browser refuses storage, the run stays in memory and persistent() lets the screens say so.
  try {
    store = window.localStorage;
    store.setItem(KEY + '.test', '1');
    store.removeItem(KEY + '.test');
  } catch (e) { store = null; }

  // ORDER is how the campaigns are listed. map is the painting under the route. x and y place a chapter on it, as percentages, and road traces the painted road
  // through every stop, so the walked part can follow it.
  var ORDER = ['vigil', 'gnosis', 'dominion', 'fervor', 'genesis'];
  var STORIES = {
    vigil: {
      id: 'vigil', colour: 'W', title: 'The Shrine Road', starter: 'white', map: 'art/web/maps/map-vigil.jpg',
      road: [[0, 99], [3.9, 96], [6.5, 88], [11, 81], [13.3, 77], [16, 75], [21.5, 74.7], [24, 77], [28.6, 80], [34.5, 83], [40, 81], [43, 77], [45.6, 71.3], [50, 62.5], [54, 58.5], [58.5, 54], [59.2, 51.8], [57.3, 50.3], [54, 49.3], [50, 47.5], [46, 45.2], [40, 41.5], [30.5, 36], [34.5, 33.7], [38.4, 32.2], [41.7, 29.3], [47, 27.3], [54, 26.9], [61, 26], [64, 24], [69, 23.2], [75, 22.6], [79, 20.5], [85, 19]],
      premise: 'A shepherd came down from the high country with a story. At the old shrine, after a hundred and fifty years, something answered her. The Oath has heard stories before. It sends you anyway.',
      ending: 'The shrine is one small room with a cold lamp. You light it and wait. Near dawn, with no wind, the flame leans toward you. It might be nothing. You send word anyway.',
      defeat: 'The Oath will send someone else. The road is still there.',
      chapters: [
        {
          id: 'ford', title: 'The ford', x: 16, y: 75,
          text: 'Cinder Clan raiders hold the ford. They took a vote on you before you arrived.',
          enemy: { name: 'Cinder Clan raiders', colours: ['R'], list: [['land_r', 11], ['goblin', 3], ['clanraiders', 3], ['raider', 3], ['berserker', 3], ['sellsword', 1], ['hex', 3], ['youngsummoner', 3]] }
        },
        {
          id: 'forest', title: 'The closed road', x: 40, y: 81,
          text: 'The old road goes through the forest, or did. The Thornwardens have spent three generations making sure of it.',
          enemy: { name: 'The Thornwardens', colours: ['G'], list: [['land_g', 11], ['sapling', 3], ['saboteur', 3], ['wayfinder', 3], ['owl', 3], ['shifting', 3], ['youngsummoner', 3], ['reedcrown', 1]] }
        },
        {
          id: 'pass', title: 'The pass', x: 58.5, y: 54,
          text: "The hill bands don't care what answered her. They care that you're carrying grain through their pass.",
          enemy: { name: 'The Warhorde', colours: ['R'], list: [['land_r', 10], ['goblin', 3], ['clanraiders', 3], ['raider', 3], ['sellsword', 3], ['warchief', 3], ['giant', 3], ['firebolt', 2]] }
        },
        {
          id: 'gate', title: 'The lower gate', x: 30.5, y: 36,
          text: "The Conclave got here first. They've brought instruments.",
          enemy: { name: 'The Lantern Conclave', colours: ['U'], list: [['land_u', 11], ['decoy', 3], ['conjurer', 3], ['scholar', 3], ['arcanist', 3], ['chorister', 3], ['displacement', 3], ['lampwright', 1]] }
        },
        {
          id: 'field', title: 'The fallow field', x: 61, y: 26,
          text: 'Nobody has farmed the field below the shrine. Tonight, it stands up.',
          enemy: { name: 'The Gravebound', colours: ['B'], list: [['land_b', 10], ['thrall', 3], ['harvester', 3], ['noble', 3], ['slateprowler', 3], ['raise', 3], ['sellsword', 3], ['colossus', 1], ['retainer', 1]] }
        },
        {
          id: 'shrine', title: 'The shrine steps', x: 85, y: 19,
          text: 'Vashkar, Who Counts the Dead, is waiting on the shrine steps. He has already counted you.',
          enemy: { name: 'Vashkar, Who Counts the Dead', colours: ['B'], list: [['land_b', 10], ['thrall', 3], ['harvester', 3], ['noble', 3], ['vashkar', 3], ['raise', 3], ['warrant', 3], ['firebolt', 2]] }
        }
      ]
    },
    gnosis: {
      id: 'gnosis', colour: 'U', title: 'The Long Survey', starter: 'blue', map: 'art/web/maps/map-gnosis.jpg',
      road: [[100, 85.9], [96.4, 84.2], [91.1, 80.1], [86, 76], [78.1, 72.8], [71.6, 70.5], [66.4, 66.4], [62, 62], [56, 63.5], [51.4, 64.5], [45.6, 70.3], [41.7, 75.2], [38, 74], [30.6, 74.2], [26, 70.3], [21.5, 62.5], [18.6, 56.2], [17, 52], [19.5, 46.9], [24.7, 43.5], [29.3, 39.1], [33.9, 33.7], [40, 30], [33.9, 29.3], [28.6, 26.4], [24.7, 22.5], [19.5, 19.5], [15, 18]],
      premise: "The Conclave has found an Old Empire survey that ends at an observatory nobody has opened in a hundred and fifty years. They want to know what it was measuring. You're the one they can spare.",
      ending: 'The great lens still points at the same empty patch of sky. You take the measurements anyway. They make no sense yet. They will.',
      defeat: 'The Conclave will send another surveyor. The instruments are still waiting in the harbour.',
      chapters: [
        {
          id: 'ambrel', title: 'Ambrel', x: 86, y: 76,
          text: "Someone sold the survey's instruments on the docks before dawn. The buyers are still there, and they've grown attached.",
          enemy: { name: 'Dockside sellswords', colours: ['R'], list: [['land_r', 12], ['goblin', 3], ['raider', 3], ['coalback', 3], ['sellsword', 2], ['clanraiders', 3], ['youngsummoner', 3], ['hex', 1]] }
        },
        {
          id: 'waterworks', title: 'The waterworks', x: 62, y: 62,
          text: "The Thornwardens have opened every sluice. The lower ward is flooding, and they're waiting to see who comes.",
          enemy: { name: 'The Thornwardens', colours: ['G'], list: [['land_g', 12], ['sapling', 3], ['saboteur', 3], ['reedcrown', 3], ['wayfinder', 3], ['owl', 1], ['shifting', 3], ['raincup', 2]] }
        },
        {
          id: 'farms', title: 'The hill farms', x: 38, y: 74,
          text: 'The new channels watered the hill farms for the first time in years. The Ashen Court has come to collect for the water.',
          enemy: { name: 'Ashen Court collectors', colours: ['B'], list: [['land_b', 11], ['thrall', 3], ['harvester', 3], ['noble', 2], ['slateprowler', 2], ['sellsword', 3], ['raise', 3], ['youngsummoner', 3]] }
        },
        {
          id: 'checkpoint', title: 'The checkpoint', x: 17, y: 52,
          text: "The Oath has built a gate across the only road into the high country. They've heard what the Conclave studies.",
          enemy: { name: 'The Sunmane Oath', colours: ['W'], list: [['land_w', 11], ['spearman', 3], ['cub', 3], ['carrier', 3], ['knight', 3], ['sentinel', 3], ['lancer', 2], ['cleric', 1], ['shield', 1]] }
        },
        {
          id: 'canal', title: 'The dry canal', x: 40, y: 30,
          text: 'The canal has been dry for a hundred and fifty years. The Gravebound have been using it as a road for nearly as long.',
          enemy: { name: 'The Gravebound', colours: ['B'], list: [['land_b', 10], ['thrall', 3], ['harvester', 3], ['noble', 3], ['slateprowler', 3], ['raise', 3], ['warrant', 2], ['youngsummoner', 3]] }
        },
        {
          id: 'observatory', title: 'The silent observatory', x: 15, y: 18,
          text: 'Saint Maren of the Long Watch is sitting at the observatory door. She believes some doors stay shut for a reason.',
          enemy: { name: 'Saint Maren of the Long Watch', colours: ['W'], list: [['land_w', 10], ['warden', 1], ['lancer', 3], ['knight', 3], ['sentinel', 3], ['cleric', 3], ['stillflame', 1], ['shield', 2], ['spearman', 3], ['maren', 1]] }
        }
      ]
    },
    dominion: {
      id: 'dominion', colour: 'B', title: 'The Quiet Order', starter: 'black', map: 'art/web/maps/map-dominion.jpg',
      road: [[0, 96.2], [3.9, 92.8], [7.8, 85.9], [12, 80], [18.2, 83], [27.3, 86.4], [39.1, 88.4], [50, 88], [66.7, 83.8], [80.1, 76.4], [83.4, 70.7], [87, 68], [91.7, 64.5], [95.5, 61.3], [93.4, 55.1], [89.3, 47.6], [85.9, 40], [82.6, 31.2], [78, 24], [71.6, 18.6], [61.8, 14.6], [52.1, 14.6], [42.3, 16.1], [34, 18], [27.3, 20], [25.4, 25.4], [28, 31.2], [32.6, 36.6], [39.1, 42], [50, 50]],
      premise: 'The court of still water has stood empty since the Silence. The Ashen Court means to sit in it again, and every village on the way owes something.',
      ending: 'The court is cold and very quiet. By spring the villages are paying on time. Nobody can say exactly when they stopped arguing.',
      defeat: 'The Court has waited a hundred and fifty years. It can wait for another summoner.',
      chapters: [
        {
          id: 'village', title: 'The tithe village', x: 12, y: 80,
          text: 'The tithe village has hired Cinder Clan raiders to say no on its behalf.',
          enemy: { name: 'Cinder Clan raiders', colours: ['R'], list: [['land_r', 12], ['goblin', 3], ['clanraiders', 3], ['raider', 3], ['berserker', 2], ['coalback', 3], ['youngsummoner', 3], ['hex', 1]] }
        },
        {
          id: 'barrows', title: 'The barrows', x: 50, y: 88,
          text: "The Gravebound tend these barrows, and they don't want them counted.",
          enemy: { name: 'The Gravebound', colours: ['B'], list: [['land_b', 11], ['thrall', 3], ['harvester', 3], ['noble', 3], ['slateprowler', 3], ['raise', 3], ['youngsummoner', 3], ['colossus', 1]] }
        },
        {
          id: 'causeway', title: 'The salt causeway', x: 87, y: 68,
          text: 'The Thornwardens have cut the causeway in three places. The marsh was theirs first.',
          enemy: { name: 'The Thornwardens', colours: ['G'], list: [['land_g', 12], ['sapling', 3], ['saboteur', 3], ['reedcrown', 3], ['owl', 1], ['wayfinder', 3], ['shifting', 3], ['raincup', 2]] }
        },
        {
          id: 'orchard', title: 'The bone orchard', x: 78, y: 24,
          text: "Conclave scholars are taking cuttings from the bone orchard. They haven't asked.",
          enemy: { name: 'The Lantern Conclave', colours: ['U'], list: [['land_u', 11], ['decoy', 3], ['conjurer', 3], ['scholar', 3], ['arcanist', 3], ['lampwright', 3], ['displacement', 2], ['mending', 2]] }
        },
        {
          id: 'town', title: 'The silent town', x: 34, y: 18,
          text: 'Someone has lit a lamp in the silent town. The Still Flame has come to keep it lit.',
          enemy: { name: 'The Still Flame', colours: ['W'], list: [['land_w', 10], ['carrier', 3], ['cleric', 3], ['sentinel', 3], ['knight', 3], ['stillflame', 3], ['shelter', 2], ['maren', 2], ['shield', 1]] }
        },
        {
          id: 'court', title: 'The court of still water', x: 50, y: 50,
          text: "An elder dragon has slept on the island for longer than anyone has kept records. It doesn't recognise the Court.",
          enemy: { name: 'The elder dragon', colours: ['R'], list: [['land_r', 11], ['dragon', 2], ['goblin', 3], ['coalback', 3], ['raider', 3], ['clanraiders', 3], ['youngsummoner', 1], ['drake', 3], ['giant', 1]] }
        }
      ]
    },
    fervor: {
      id: 'fervor', colour: 'R', title: 'No Throne', starter: 'red', map: 'art/web/maps/map-fervor.jpg',
      road: [[0, 2.9], [3.9, 5.9], [7.8, 10.7], [10.4, 16.6], [14, 22], [21.5, 20.5], [28.6, 18.6], [36.5, 16.1], [44, 15], [54.7, 15.6], [60.5, 17.6], [65.8, 21.5], [71, 24.9], [76, 27], [76.2, 29.3], [71.6, 34.2], [65.8, 37.6], [60.5, 40], [58.4, 40.2], [52.6, 43], [47, 46], [43, 46.7], [39.3, 47.6], [35, 50.1], [31.7, 53.8], [27.5, 57.6], [22, 62], [27.3, 66.4], [33.9, 72.3], [41.7, 78.1], [52.1, 83], [59.9, 84], [70, 80]],
      premise: 'Someone is rebuilding the high seat. The moot voted, and it was close, but nobody wants a king.',
      ending: "You take the seat apart stone by stone, and every band carries one home. Next year someone will try again. Next year you'll vote again.",
      defeat: 'For now, the seat has a king. The bands will argue about it all winter.',
      chapters: [
        {
          id: 'moot', title: 'The moot', x: 14, y: 22,
          text: 'Not every band voted the same way. The ones who lost would like a rematch.',
          enemy: { name: 'The losing bands', colours: ['R'], list: [['land_r', 12], ['goblin', 3], ['clanraiders', 3], ['raider', 3], ['sellsword', 2], ['coalback', 3], ['youngsummoner', 3], ['hex', 1]] }
        },
        {
          id: 'market', title: 'The moving market', x: 44, y: 15,
          text: 'The market has new guards with brass on their gloves. Someone paid the Artificers well.',
          enemy: { name: 'The Artificers', colours: ['U'], list: [['land_u', 11], ['chorister', 3], ['lampwright', 3], ['conjurer', 3], ['scholar', 3], ['mending', 3], ['decoy', 3], ['glyph', 1]] }
        },
        {
          id: 'saltpan', title: 'The salt pan', x: 76, y: 27,
          text: 'The salt was free last year. The Ashen Court has put a price on it.',
          enemy: { name: 'The Ashen Court', colours: ['B'], list: [['land_b', 10], ['thrall', 3], ['noble', 3], ['harvester', 3], ['slateprowler', 3], ['sellsword', 3], ['raise', 3], ['warrant', 2]] }
        },
        {
          id: 'gorge', title: 'The red gorge', x: 47, y: 46,
          text: "The herd crosses the gorge every autumn. It doesn't stop for bridges, or for you.",
          enemy: { name: 'The Elder Herd', colours: ['G'], list: [['land_g', 11], ['reedcrown', 3], ['sapling', 3], ['owl', 3], ['wayfinder', 3], ['saboteur', 3], ['marble', 2], ['shifting', 2]] }
        },
        {
          id: 'toll', title: 'The toll wall', x: 22, y: 62,
          text: 'The new kingdom built its wall with Oath money. Oath knights stand on it.',
          enemy: { name: 'The Sunmane Oath', colours: ['W'], list: [['land_w', 11], ['spearman', 3], ['cub', 3], ['carrier', 3], ['knight', 3], ['sentinel', 3], ['lancer', 2], ['cleric', 1], ['shield', 1]] }
        },
        {
          id: 'seat', title: 'The high seat', x: 70, y: 80,
          text: 'The claimant sits on the high seat in borrowed armour. He has promised everyone something.',
          enemy: { name: "The claimant's host", colours: ['W', 'U'], list: [['land_w', 8], ['land_u', 2], ['knight', 3], ['lancer', 1], ['cleric', 1], ['arcanist', 3], ['chorister', 3], ['shield', 1], ['glyph', 1], ['banner', 1], ['spearman', 3], ['cub', 3]] }
        }
      ]
    },
    genesis: {
      id: 'genesis', colour: 'G', title: 'The Green Return', starter: 'green', map: 'art/web/maps/map-genesis.jpg',
      road: [[100, 5.9], [96.4, 8.8], [91.1, 13.7], [84, 16], [78.1, 19.5], [71.6, 20.5], [67.1, 21], [62.5, 22.7], [58, 24], [60.5, 29.3], [63.8, 37.1], [67.1, 43], [70, 52], [65, 47.6], [54.2, 41.9], [45.8, 40.2], [39.2, 41.3], [37.1, 45], [38.3, 55.1], [40, 65], [43.4, 72.6], [48, 76], [39.1, 77.6], [32.6, 75.7], [26, 75.7], [20.8, 75.2], [16, 72]],
      premise: 'Something upstream has slowed the river. The fish are late, the reeds are dying, and the herd has started walking.',
      ending: "The dam gave way slowly, then all at once. By summer the river runs through the old city's halls, and the first families are planting in them.",
      defeat: "The river stays slow this year. The forest is patient. You'll have to be too.",
      chapters: [
        {
          id: 'grove', title: 'The mother grove', x: 84, y: 16,
          text: "Sellswords have camped in the mother grove for the firewood. They've started on the old trees.",
          enemy: { name: 'Sellswords', colours: ['R'], list: [['land_r', 11], ['sellsword', 3], ['goblin', 3], ['raider', 3], ['berserker', 2], ['coalback', 3], ['youngsummoner', 2], ['hex', 3]] }
        },
        {
          id: 'reedways', title: 'The reedways', x: 58, y: 24,
          text: 'Conclave surveyors are mapping the reedways. Everything they map, someone builds on.',
          enemy: { name: 'Conclave surveyors', colours: ['U'], list: [['land_u', 11], ['conjurer', 3], ['scholar', 3], ['decoy', 3], ['arcanist', 3], ['lampwright', 3], ['displacement', 3], ['mending', 1]] }
        },
        {
          id: 'crossing', title: "The herd's crossing", x: 70, y: 52,
          text: "The Warhorde follows the herd for meat. This year they've brought giants.",
          enemy: { name: 'The Warhorde', colours: ['R'], list: [['land_r', 10], ['goblin', 3], ['raider', 3], ['warchief', 3], ['giant', 3], ['sellsword', 3], ['berserker', 3], ['firebolt', 2]] }
        },
        {
          id: 'cutline', title: 'The cut line', x: 39.2, y: 41.3,
          text: "The timber goes to the Oath's new fortress. The Oath sent knights to guard it.",
          enemy: { name: 'The Sunmane Oath', colours: ['W'], list: [['land_w', 11], ['knight', 3], ['sentinel', 3], ['lancer', 2], ['spearman', 3], ['cub', 3], ['cleric', 3], ['banner', 1], ['shield', 1]] }
        },
        {
          id: 'dam', title: 'The dam', x: 48, y: 76,
          text: "The dam is the finest thing anyone has built in a century. The Artificers won't let you near it.",
          enemy: { name: 'The Artificers', colours: ['U'], list: [['land_u', 10], ['chorister', 3], ['lampwright', 3], ['arcanist', 3], ['conjurer', 3], ['glyph', 3], ['displacement', 3], ['decoy', 2]] }
        },
        {
          id: 'city', title: 'The green city', x: 16, y: 72,
          text: 'The Ashen Court has claimed the old city below the dam. It means to drain the ground and build.',
          enemy: { name: 'The Ashen Court', colours: ['B'], list: [['land_b', 8], ['land_r', 2], ['vashkar', 3], ['noble', 3], ['thrall', 3], ['slateprowler', 3], ['sellsword', 3], ['firebolt', 3], ['raider', 2]] }
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

  // A battle saved before a card left the game, or on the old number scale, can't be played on, so that battle starts over.
  function battleOk(b) {
    if (!b || !b.players || !b.units) return false;
    if (b.players.some(function (p) { return p.life > E.RULES.standard.life; })) return false;
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
    run.spare = (Array.isArray(run.spare) ? run.spare : []).filter(function (e) { return known(e[0]) && e[1] > 0; });
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
      story: storyId, player: player, chapter: 0, status: 'map', battle: null, offer: null, taken: [], spare: [],
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

  function countIn(list, id) {
    var e = list.filter(function (x) { return x[0] === id; })[0];
    return e ? e[1] : 0;
  }
  function addTo(list, id, n) {
    var e = list.filter(function (x) { return x[0] === id; })[0];
    if (e) e[1] += n; else list.push([id, n]);
    for (var i = list.length - 1; i >= 0; i--) if (list[i][1] <= 0) list.splice(i, 1);
  }
  // The reserve counts too, so a run can't stockpile more copies than a deck could hold.
  function copiesOf(run, id) { return countIn(run.list, id) + countIn(run.spare || [], id); }
  function rewardable(run, colours) {
    return Object.keys(E.CARDS).filter(function (id) {
      var c = E.CARDS[id];
      return colours.indexOf(c.colour) >= 0 && c.type !== 'land' && !c.token && c.sub !== 'Velunn' && c.cost + c.wants <= MAX_REWARD_COST && copiesOf(run, id) < E.maxCopies(id);
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
  // id is a card or land from the offer, and it goes to the reserve. Null takes nothing.
  function take(id) {
    var run = current();
    if (!run || run.status !== 'reward' || !run.offer) return null;
    if (id !== null) {
      if (run.offer.cards.concat(run.offer.lands).indexOf(id) < 0) return null;
      addTo(run.spare, id, 1);
      run.taken.push(id);
    }
    run.offer = null;
    run.status = 'map';
    run.chapter += 1;
    save(run);
    return run;
  }
  // Swaps a reserve card into the deck for one of the deck's cards, so the deck keeps its size. Not during a battle,
  // since the battle already holds the deck.
  function swap(inId, outId) {
    var run = current();
    if (!run || run.status !== 'map' || run.battle || inId === outId) return null;
    if (!countIn(run.spare, inId) || !countIn(run.list, outId) || countIn(run.list, inId) >= E.maxCopies(inId)) return null;
    addTo(run.spare, inId, -1);
    addTo(run.list, inId, 1);
    addTo(run.list, outId, -1);
    addTo(run.spare, outId, 1);
    save(run);
    return run;
  }
  function abandon() { ended = null; write(null); }

  return {
    ORDER: ORDER, STORIES: STORIES, current: current, begin: begin, storyOf: storyOf, chapterOf: chapterOf, decks: decks, saveBattle: saveBattle,
    finish: finish, take: take, swap: swap, abandon: abandon, ended: function () { return ended; }, dismiss: function () { ended = null; },
    persistent: function () { return !!store; }
  };
})();
if (typeof module !== 'undefined') module.exports = Campaign;
