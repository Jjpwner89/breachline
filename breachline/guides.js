// Strategy guides for the Claude opponent. Every level plays by the same rules with the same information;
// a level differs only in what it has been taught here. Edit these freely: they go into the prompt as written.
var Guides = {
  easy: {
    label: 'Easy',
    blurb: 'Knows the rules and little else.',
    general: [
      'You are new to this game. This is all you have been taught:',
      '- Play a land if you have one.',
      '- Play a card if you can afford it.',
      '- Move your units toward the enemy and attack what you can reach.',
      '- If a unit reaches the enemy back row, hit the enemy summoner.',
      'Decide from what you see this turn. Do not plan ahead or work out any deeper strategy.'
    ].join('\n'),
    decks: {}
  },

  normal: {
    label: 'Normal',
    blurb: 'Taught the fundamentals.',
    general: [
      'You know the fundamentals of this game:',
      '- Play a land every turn you can, and spend most of your mana each turn.',
      '- A new unit waits a turn, so summon early rather than late.',
      '- Read the attack previews. Favour attacks that destroy a unit, or that deal more than they cost you, and count a costly unit as worth more.',
      '- Damage stays, so finish wounded units before starting on healthy ones.',
      '- A Ranged unit attacking from 2 tiles takes no strike back from a melee unit.',
      '- Keep healers and Ranged units behind the units that take the hits.',
      '- A unit on your back row can hit you every turn. Deal with it quickly.',
      '- Instants can be cast on your own turn, but on the enemy turn they need spare mana, so leave some when one in your hand matters.'
    ].join('\n'),
    decks: {}
  },

  hard: {
    label: 'Hard',
    blurb: 'Taught the full strategy guide.',
    general: [
      'You have studied this game closely. Use all of this:',
      '',
      'THE RACE',
      '- Each turn, count how many turns each side needs to reach 0 life at the current damage. If you win the race, ignore enemy units that cannot stop you. If you lose it, block and trade until that changes.',
      '- Only a unit on the enemy back row hits the summoner, so the map decides the game. A lane held by a unit is closed to everything except fliers.',
      '- At the turn limit, the higher life total wins.',
      '',
      'MANA AND TEMPO',
      '- Play a land every turn you can. A land held in hand does nothing.',
      '- Plan the whole turn before spending: the best use of all your mana usually beats the single largest card.',
      '- A new unit waits a turn, so a unit delayed is a whole turn of attacks lost.',
      '- Choose summoning columns on purpose: opposite a threat to block it, or in an open lane to race.',
      '',
      'TRADES',
      '- Value a unit by its cost and by what it will still do, not by its current health.',
      '- Order attacks within a turn. Start with attacks that take no strike back, then finish with the unit that kills, so the kill prevents the strike back.',
      '- Combine attackers to destroy one unit rather than wounding two. Damage stays, but a wounded unit still hits at full attack.',
      '- Do not attack just because you can. A bad attack leaves your unit weaker and in reach.',
      '',
      'THE FIRST HIT',
      '- Units move, then attack. A melee unit that moves 1 tile can hit anything within 2 tiles, so ending your turn exactly 2 tiles away hands the enemy the first hit.',
      '- Ending 3 tiles away forces the enemy to step to 2, which gives you the first hit. Allow 1 more tile against Swift and Flying units, and against Ranged units.',
      '- Enemy units cannot walk through yours, and there are no diagonal moves. Use that to protect wounded units and your Ranged units.',
      '',
      'POSITION',
      '- Keep units that help their neighbours adjacent to the units they help: healers, Guard, Stand together, Rally.',
      '- Keep healers out of reach, and heal a unit that will survive and fight again rather than one about to die anyway.',
      '- Put enchantments that help a unit on one that is safe. Losing it loses the enchantment too.',
      '',
      'HIDDEN INFORMATION',
      '- Enemy unspent mana is a warning: it can pay for an instant on your turn. Lead with your less important attack to draw it out.',
      '- Hold your own instants until they swing a fight: saving a unit from death, or destroying an attacker before its hit lands, which cancels the attack.',
      '- Mana you leave unspent is wasted unless you hold an instant, so without one, spend everything on your own turn.',
      '',
      'OPENING HANDS',
      '- Keep 2 to 4 lands out of 5. Redraw 0 or 5 lands. With 1 land, keep only if the rest is cheap.',
      '- When putting cards on the bottom, keep a working mix of lands and spells.'
    ].join('\n'),
    decks: {
      white: 'YOUR DECK: Win by outlasting. Your units are hard to kill when they stand together, so advance as a block, keep Temple cleric and Saint Maren adjacent to the front, and use Oath sentinel to shield its neighbours. Save Shield of dawn for a unit it will actually save. Winter shelter belongs on the unit holding the front. Pride lioness and Pride matriarch fight best beside allies, and Oath outrider wants an ally on the far side of its target.',
      red: 'YOUR DECK: Win the race. You hit hard and die easily, so attack first and trade up. Use Swift and Flying units to reach open lanes early, and hold Firebolt to finish a wounded unit or stop an attacker on the enemy turn. Cinder berserker is stronger once damaged, so a small hit on it is no loss. Have Coalback forager forage early to reach big units sooner. Dawnsail passage can drop a strong unit onto an open tile of the enemy back row, ready to hit the summoner next turn.',
      blue: 'YOUR DECK: Win at range. Keep Illusory decoys in front, since adjacent enemies must attack them first, and shoot from 2 tiles so melee units cannot strike back. Use Cloistered scholars to draw early while safe. Binding glyph belongs on the enemy unit that most threatens to reach you, and Brass chorister can push it away again. Mending the sail is small, so spend it on a unit that will keep shooting.',
      black: 'YOUR DECK: Win by attrition. Drain keeps Ashen Court nobles alive through trades, so let them fight often. Bone harvester can spend a weak ally for lasting attack, and Raise the dead returns what you lost, so a cheap unit dying is rarely a real loss. Save Death warrant for the costliest unit, and do not pay Vashkar\'s life cost when the race is close. Slateprowler hits damaged units harder, so send it in after another unit has landed a blow. The Porcelain-visored retainer and Barrow colossus gain attack each time any other unit dies, on either side, so play them early in a bloody fight and keep them alive. Indebted squire costs you a life each, so hold it when you are close to losing.',
      green: 'YOUR DECK: Win late. Play lands and Wayfinder druids early, and Walking saplings on your first turns, since they grow for three turns. Avoid even trades until Elder Herd bulls arrive, then send them at small units, since Overrun carries extra damage into whatever stands behind. Thornwarden saboteurs can enter beside or behind your units, so use them to reach the flanks.'
    }
  }
};
if (typeof module !== 'undefined') module.exports = Guides;
