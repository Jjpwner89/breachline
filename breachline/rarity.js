// Each card's rarity: c common, u uncommon, r rare, l legendary. Lands have none: they're free and never in packs.
// First drawn up on 2026-11-10 from each card's cost and how much rules text it carries, within its colour, with the Velunn and one
// signature card per colour as legendary. It's a starting point for the creator to adjust card by card; PROGRESSION.md has the targets.
var Rarity = (function () {
  var OF = {
    // W legendary
    maren: 'l', matriarch: 'l',
    // W rare
    glaive: 'r', lancer: 'r', oathbell: 'r', ribbonvane: 'r', sanctuary: 'r', vow: 'r', vowkeeper: 'r', warden: 'r',
    // W uncommon
    consecrate: 'u', humbling: 'u', lineofdawn: 'u', lioness: 'u', outrider: 'u', penitent: 'u', reliquary: 'u', roadshield: 'u', shelter: 'u', standasone: 'u', stillflame: 'u', sunthread: 'u',
    // W common
    acolyte: 'c', ashsweeper: 'c', banner: 'c', carrier: 'c', chaplain: 'c', cleric: 'c', cub: 'c', dawnsails: 'c', huntress: 'c', knight: 'c', muster: 'c', pilgrim: 'c', roadsquire: 'c', sentinel: 'c', sergeant: 'c', shield: 'c', shieldbearer: 'c', spearman: 'c', vigilkeeper: 'c',
    // U legendary
    ilvane: 'l', observatory: 'l',
    // U rare
    borrowedwill: 'r', frost: 'r', rapier: 'r', rimecaller: 'r', rimedrake: 'r', siegewalker: 'r', wardwright: 'r', winterdoor: 'r', wovenward: 'r',
    // U uncommon
    brightlance: 'u', examiner: 'u', fieldplate: 'u', frostbreak: 'u', glyphwright: 'u', harmonic: 'u', heldmoments: 'u', leaden: 'u', marksman: 'u', prism: 'u', quench: 'u', rimebolt: 'u', tideglass: 'u', unmake: 'u',
    // U common
    adept: 'c', apprentice: 'c', arcanist: 'c', chorister: 'c', conjurer: 'c', corewright: 'c', courier: 'c', decoy: 'c', displacement: 'c', fieldscholar: 'c', glimmer: 'c', glyph: 'c', journeyman: 'c', lampwright: 'c', mending: 'c', phantasm: 'c', rainreader: 'c', scholar: 'c', sifting: 'c', unwind: 'c', whitemorning: 'c',
    // B legendary
    bought: 'l', vashkar: 'l',
    // B rare
    colossus: 'r', gallows: 'r', hostess: 'r', hour: 'r', shutterassassin: 'r', temptress: 'r', tithe: 'r', warrant: 'r',
    // B uncommon
    assassin: 'u', barrowmark: 'u', barrowpriest: 'u', debtblade: 'u', gravecaller: 'u', mourningveil: 'u', ossuary: 'u', pallofash: 'u', retainer: 'u', scale: 'u', siphon: 'u', slateprowler: 'u', tithekeeper: 'u',
    // B common
    ashsower: 'c', bailiff: 'c', calleddebt: 'c', envoy: 'c', gravesoil: 'c', harvester: 'c', hunted: 'c', informant: 'c', ledger: 'c', lynx: 'c', mortuary: 'c', mourner: 'c', noble: 'c', raise: 'c', rats: 'c', squire: 'c', tender: 'c', thrall: 'c', veiladept: 'c',
    // R legendary
    dragon: 'l',
    // R rare
    chieftain: 'r', cinderfall: 'r', cinderrain: 'r', drake: 'r', giant: 'r', kindle: 'r', slagheart: 'r', stormstrike: 'r', wildfire: 'r',
    // R uncommon
    captain: 'u', cinderhook: 'u', cinderwake: 'u', drummer: 'u', falchion: 'u', firecaller: 'u', lanner: 'u', salamander: 'u', salmantle: 'u', shatter: 'u', skyfalls: 'u', torchrunner: 'u', veteran: 'u', warbanddrum: 'u',
    // R common
    anoint: 'c', berserker: 'c', clanoutrider: 'c', clanraiders: 'c', coalback: 'c', emberward: 'c', firebolt: 'c', firebrand: 'c', firepot: 'c', flameblade: 'c', goblin: 'c', hex: 'c', hurledbrand: 'c', martyr: 'c', packhunter: 'c', rabblerouser: 'c', raider: 'c', scatter: 'c', scorch: 'c', skirmisher: 'c', warchief: 'c',
    // G legendary
    alderelder: 'l', orrowen: 'l',
    // G rare
    earthspeaker: 'r', herdmother: 'r', ironbark: 'r', marble: 'r', seedheart: 'r', stag: 'r',
    // G uncommon
    bull: 'u', channel: 'u', grovetender: 'u', mossback: 'u', mosshorn: 'u', overgrowth: 'u', pathguard: 'u', returnloam: 'u', seedfall: 'u', thornbrake: 'u', tortoise: 'r', wayfinder: 'u',
    // G common
    alderkin: 'c', boar: 'c', canopy: 'c', goblinscout: 'c', owl: 'c', raincup: 'c', reedbank: 'c', reedcrown: 'c', ridgewolves: 'c', saboteur: 'c', sapling: 'c', shifting: 'c', springmelt: 'c', stoneopens: 'c', trapper: 'c',
    // N rare
    scarred: 'r', stoneward: 'r',
    // N uncommon
    passage: 'u', rusthinged: 'u', waystone: 'u', youngsummoner: 'u',
    // N common
    across: 'c', follower: 'c', hound: 'c', mountainlung: 'c', recruit: 'c', sellsword: 'c'
  };
  var NAMES = { c: 'Common', u: 'Uncommon', r: 'Rare', l: 'Legendary' };
  function of(id) { return OF[id] || 'c'; }
  return { OF: OF, ORDER: ['c', 'u', 'r', 'l'], NAMES: NAMES, of: of, name: function (id) { return NAMES[of(id)]; } };
})();
if (typeof module !== 'undefined') module.exports = Rarity;
