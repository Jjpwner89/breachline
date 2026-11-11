// Feel: the lamp-dim between screens, painted combat effects, cards dealt into the hand, the battle summary's payout, and the
// sounds of buttons and cards. Everything here is decoration over a state the game has already settled; with reduced motion
// it plays the sounds and skips the movement.
var Polish = (function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var E = Engine, layer = null;
  function $(id) { return document.getElementById(id); }
  function box(el) { var b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height, t: b.top, l: b.left }; }
  function fxLayer() {
    if (!layer || !layer.isConnected) { layer = document.createElement('div'); layer.className = 'fxpaint'; document.body.appendChild(layer); }
    return layer;
  }

  // The lamp over the table gutters down, the scene changes in the dark, and it comes back up.
  var dimming = false;
  function lamp(fn, quiet) {
    if (reduced || dimming || !document.body.animate) { fn(); return; }
    dimming = true;
    if (!quiet) Sfx.play('page-turn');
    var l = document.createElement('div');
    l.className = 'lamp';
    document.body.appendChild(l);
    // Timers, not animation events, decide when the scene changes, so a paused or hidden page still moves on.
    l.animate([{ opacity: 0 }, { opacity: .72, offset: .5 }, { opacity: .55, offset: .66 }, { opacity: 1 }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
    setTimeout(function () {
      try { fn(); } finally {
        dimming = false;
        l.getAnimations().forEach(function (a) { a.cancel(); });
        l.style.opacity = 1;
        l.animate([{ opacity: 1 }, { opacity: 1, offset: .12 }, { opacity: .42, offset: .52 }, { opacity: .6, offset: .64 }, { opacity: 0 }], { duration: 640, easing: 'ease-out', fill: 'forwards' });
        setTimeout(function () { l.remove(); }, 680);
      }
    }, 330);
  }

  // Painted effects: each sheet is six frames, three across and two down, played over the spot at about 16 frames a second.
  var SHEETS = { slash: 1, pierce: 0, crush: 0, death: 0, summon: 1, heal: 1, 'rare-burst': 1, 'legendary-burst': 1 };
  Object.keys(SHEETS).forEach(function (k) { var im = new Image(); im.src = 'art/web/fx/' + k + '.png'; });
  function sprite(name, x, y, size, o) {
    o = o || {};
    if (reduced) return;
    var d = document.createElement('div'), host = o.host || fxLayer();
    d.className = 'fxs' + (SHEETS[name] ? '' : ' norm');
    d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;background-image:url(art/web/fx/' + name + '.png)' + (o.rot ? ';transform:translate(-50%,-50%) rotate(' + o.rot + 'deg)' : '');
    host.appendChild(d);
    var f = 0, ms = o.ms || 62;
    (function step() {
      if (!d.isConnected) return;
      d.style.backgroundPosition = ((f % 3) * 50) + '% ' + (f < 3 ? 0 : 100) + '%';
      f++;
      if (f < 6) setTimeout(step, ms); else setTimeout(function () { d.remove(); }, ms);
    })();
  }

  // Combat. Which painting and sound a blow gets depends on who struck it.
  var BEASTS = ['cub', 'owl', 'bull', 'boar', 'mossback', 'herdmother', 'ridgewolves', 'lynx', 'stag', 'tortoise', 'salamander', 'drake', 'rimedrake', 'dragon', 'rats',
    'reedcrown', 'coalback', 'slateprowler', 'mosshorn', 'lanner', 'lioness'];
  function blowOf(card) {
    if (!card) return 'slash';
    var kw = card.keywords || [];
    if (kw.indexOf('Ranged') >= 0 || kw.indexOf('Longshot') >= 0) return 'arrow';
    if (/spear|lance|pike|glaive|hunter|outrider/i.test(card.name)) return 'spear';
    if (kw.indexOf('Stomp') >= 0 || /giant|colossus|bull|hulk|tortoise|golem|walker|chieftain|bear/i.test(card.name) || card.atk >= 6) return 'crush';
    return 'slash';
  }
  var SHEET_OF = { slash: 'slash', spear: 'pierce', arrow: 'pierce', crush: 'crush' };
  function tileEl(r, c) { return document.querySelector('#grid .tile[data-r="' + r + '"][data-c="' + c + '"]'); }
  function unitIn(s, uid) { return s.units.filter(function (u) { return u.uid === uid; })[0]; }
  function lunge(el, dx, dy) {
    if (!el || reduced) return;
    el.style.zIndex = 5;
    el.animate([{ transform: 'none' }, { transform: 'translate(' + (-dx * .1) + 'px,' + (-dy * .1) + 'px) scale(1.04)', offset: .3 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1.08)', offset: .5 }, { transform: 'none' }],
      { duration: 560, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = function () { el.style.zIndex = ''; };
  }
  function shake(el, k) {
    if (!el || reduced) return;
    k = k || 4;
    el.animate([{ transform: 'none' }, { transform: 'translate(' + k + 'px,' + (-k * .6) + 'px)' }, { transform: 'translate(' + (-k) + 'px,' + (k * .6) + 'px)' }, { transform: 'translate(' + (k * .5) + 'px,0)' }, { transform: 'none' }], { duration: 300 });
  }

  function moved(prev, next, m, human) {
    var who = prev.pending ? prev.pending.responder : prev.active, played = null;
    if (m.card !== undefined && m.type !== 'bottomCard') {
      var inst = prev.players[who].hand.filter(function (i) { return i.id === m.card; })[0];
      if (inst && !next.players[who].hand.some(function (i) { return i.id === m.card; })) played = E.CARDS[inst.c];
    }
    if (m.type === 'redraw') Sfx.play('shuffle');
    if (played && played.type !== 'unit') Sfx.play('card-play');
    // New units arrive in a swirl of light.
    next.units.forEach(function (u) {
      if (unitIn(prev, u.uid)) return;
      var t = tileEl(u.r, u.c);
      Sfx.play('unit-summon', { gap: 120 });
      if (t) { var b = box(t); sprite('summon', b.x, b.y, Math.max(b.w, b.h) * 1.5); }
    });
    // The blow: the striker lunges, the painting plays over whatever it hit, and the summoner's plate shakes.
    var att = m.type === 'attack' || m.type === 'attackSummoner' ? { attacker: m.unit, summoner: m.type === 'attackSummoner' ? 1 - who : undefined, target: m.target } : null;
    if (prev.pending && prev.pending.attack && !next.pending) att = { attacker: prev.pending.attack.attacker, summoner: prev.pending.attack.summoner, target: prev.pending.attack.targetUid };
    var hits = (next.fx || []).filter(function (f) { return !f.good && f.text.charAt(0) === '-'; });
    var striker = att ? unitIn(prev, att.attacker) : null, sCard = striker ? E.CARDS[striker.cardId] : null;
    if (att && striker && hits.length) {
      var sEl = unitIn(next, striker.uid) ? tileEl(unitIn(next, striker.uid).r, unitIn(next, striker.uid).c) : null;
      if (att.summoner !== undefined) {
        // At the summoner the blow goes straight up the board (or straight down for the enemy), toward the plate.
        if (sEl) lunge(sEl, 0, (striker.owner === human ? -1 : 1) * box(sEl).h * .55);
      } else {
        var tgt = unitIn(prev, att.target), tEl = tgt ? tileEl(tgt.r, tgt.c) : null;
        if (sEl && tEl) { var a = box(sEl), b = box(tEl); lunge(sEl, (b.x - a.x) * .45, (b.y - a.y) * .45); }
      }
    }
    var delay = att && !reduced ? 200 : 0;
    setTimeout(function () {
      var sounded = {};
      hits.forEach(function (f) {
        var src = att && f.uid !== undefined && f.uid === att.attacker ? unitIn(prev, att.target) : striker;
        var blow = blowOf(src ? E.CARDS[src.cardId] : sCard);
        if (f.summoner !== undefined) {
          var plate = $('summoner' + f.summoner);
          if (plate) { var p = box(plate.querySelector('.crest') || plate); sprite(SHEET_OF[blow], p.x, p.y, p.h * 2.6, { rot: blow === 'slash' ? -20 : 0 }); shake(plate, 5); }
          if (!sounded.s) Sfx.play('summoner-hit');
          sounded.s = true;
          return;
        }
        var t = tileEl(f.r, f.c);
        if (t) { var b = box(t); sprite(SHEET_OF[blow], b.x, b.y, Math.max(b.w, b.h) * 1.35, { rot: blow === 'arrow' ? (f.r < (src ? src.r : f.r) ? -90 : 90) : 0 }); }
        if (!sounded[blow]) Sfx.play(blow);
        sounded[blow] = true;
      });
      // The fallen leave a dark burst on their tile. Only beasts cry out.
      prev.units.forEach(function (u) {
        if (unitIn(next, u.uid)) return;
        var t = tileEl(u.r, u.c);
        if (t) { var b = box(t); sprite('death', b.x, b.y, Math.max(b.w, b.h) * 1.4); }
        if (BEASTS.indexOf(u.cardId) >= 0) Sfx.play('beast-death', { delay: .12 });
      });
      (next.fx || []).filter(function (f) { return f.good && f.uid !== undefined; }).forEach(function (f) {
        var t = tileEl(f.r, f.c);
        if (t) { var b = box(t); sprite('heal', b.x, b.y, Math.max(b.w, b.h) * 1.3); }
      });
    }, delay);
  }

  // New cards come off your deck pile one after another.
  function drawn(ids) {
    var pile = document.querySelector('#youStrip .pile.back:last-of-type b') || document.querySelector('#youStrip .piles');
    ids.forEach(function (id, k) {
      var card = document.querySelector('#hand .card[data-card="' + id + '"]');
      Sfx.play('card-draw', { delay: k * .11, gap: 0 });
      if (!card || !pile || reduced) return;
      var a = box(pile), b = box(card);
      card.animate([{ transform: 'translate(' + (a.x - b.x) + 'px,' + (a.y - b.y) + 'px) scale(.22) rotate(-14deg)', opacity: .2 }, { transform: 'translate(0,-26px) scale(1.04) rotate(2deg)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }],
        { duration: 480, delay: k * 110, easing: 'cubic-bezier(.25,.8,.3,1)', fill: 'backwards' });
    });
  }

  // The battle summary: the crest drops, each ledger line is stamped and pays its coins straight into the purse, the multipliers
  // land, and the total rolls up.
  function payout(pl) {
    if (!pl || !pl.classList.contains('summary')) return;
    var crest = pl.querySelector('.screst'), rows = pl.querySelectorAll('.stally li'), total = pl.querySelector('.earned strong'), purse = pl.querySelector('.purse');
    var win = pl.classList.contains('win');
    if (win) Sfx.play('victory');
    if (reduced || !pl.animate) return;
    var to = +total.dataset.count, shown = 0, sum = 0;
    pl.classList.add('playing');
    total.textContent = '0';
    crest.animate([{ opacity: 0, transform: 'translateY(-60px) scale(1.18)' }, { opacity: 1, transform: 'translateY(6px) scale(.97)', offset: .6 }, { opacity: 1, transform: 'none' }], { duration: 950, easing: 'cubic-bezier(.2,1.2,.4,1)', fill: 'backwards' });
    function roll(v) {
      var from = shown, t0 = performance.now();
      shown = v;
      (function f(now) {
        if (!total.isConnected) return;
        var k = Math.min(1, (now - t0) / 650);
        total.textContent = Math.round(from + (v - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    }
    function stamp(li, big) {
      li.classList.add('in');
      li.animate([{ opacity: 0, transform: big ? 'scale(1.5) rotate(-3deg)' : 'scale(1.3)' }, { opacity: 1, transform: 'scale(.97)', offset: .6 }, { opacity: 1, transform: 'none' }], { duration: big ? 420 : 340, easing: 'ease-out' });
      Sfx.play('stamp', { gap: 0 });
    }
    function coins(li, gold) {
      var a = box(li.querySelector('b')), p = box(purse), n = Math.min(8, Math.max(2, Math.round(gold / 6)));
      for (var c = 0; c < n; c++) (function (c) {
        var coin = document.createElement('img');
        coin.src = 'art/web/ui/coin.png';
        coin.className = 'flycoin';
        coin.style.left = a.x + 'px';
        coin.style.top = a.y + 'px';
        fxLayer().appendChild(coin);
        var dx = p.x - a.x + (Math.random() - .5) * p.w * .25, dy = p.y - p.h * .1 - a.y;
        // Straight into the purse: no arc, just a quick pull in.
        coin.animate([{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: .12 }, { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.7)', opacity: 1 }],
          { duration: 620, delay: c * 80, easing: 'cubic-bezier(.55,0,.75,.6)', fill: 'backwards' });
        setTimeout(function () {
          coin.remove();
          if (c === 0) Sfx.play('coin-drop', { gap: 0 });
          purse.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08,.92)' }, { transform: 'scale(1)' }], { duration: 170 });
        }, 620 + c * 80);
      })(c);
      return 620 + (n - 1) * 80;
    }
    var t = 1050, base = Array.prototype.filter.call(rows, function (li) { return !li.classList.contains('mult'); }), mults = Array.prototype.filter.call(rows, function (li) { return li.classList.contains('mult'); });
    base.forEach(function (li) {
      var g = +li.dataset.gold;
      setTimeout(function () {
        if (!pl.isConnected) return;
        stamp(li);
        var land = coins(li, g);
        sum += g;
        var v = sum;
        setTimeout(function () { roll(v); }, land);
      }, t);
      t += 760;
    });
    t += 450;
    mults.forEach(function (li) {
      setTimeout(function () { if (!pl.isConnected) return; stamp(li, true); shake(pl, 3); }, t);
      t += 650;
    });
    setTimeout(function () {
      if (!pl.isConnected) return;
      roll(to);
      if (to) Sfx.play('coin-pile');
      purse.classList.add('full');
      setTimeout(function () { total.classList.add('landed'); pl.classList.remove('playing'); }, 650);
    }, t + 150);
  }

  // Buttons and cards answer the pointer.
  var hovered = null;
  document.addEventListener('mouseover', function (e) {
    var b = e.target.closest('.btn, .mitem:not(.off), .who-plays, .press:not(.foe), .chip, .tab, .astory, .deck, .dtile, .mnode, .ptear, .ocard, #hand .card');
    if (b === hovered) return;
    hovered = b;
    if (!b || b.disabled) return;
    if (b.matches('#hand .card')) Sfx.play('card-hover', { gap: 60 });
    else if (!b.matches('.chip, .tab, .astory, .ocard, .mnode')) Sfx.play('button-hover', { gap: 90 });
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.btn, .mitem, .who-plays, .chip, .tab, .astory, .deck, .dtile, .linkbtn, .rbtn, .minus');
    if (b && !b.disabled) Sfx.play('button-press', { gap: 60 });
  }, true);

  // The battle summary covers the whole table, not just the map, so the crest and ledger always have room.
  var res = $('result');
  if (res && $('app')) $('app').appendChild(res);

  // The sound toggle, in the battle's tools and on the main menu.
  document.addEventListener('click', function (e) { if (e.target.closest('[data-sound]')) Sfx.toggle(); });
  Sfx.setMuted(Sfx.muted());

  return { lamp: lamp, sprite: sprite, moved: moved, drawn: drawn, payout: payout, enabled: function () { return !reduced; } };
})();
