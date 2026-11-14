// The lore codex: a book that drops onto the table, opens and is read page by page. The look, the timings and how the
// sounds layer are in CODEX_BOOK.md; the text is CODEX_ENTRIES, built from LORE_CODEX.md by tools/build-codex.py.
// Codex painted six still pieces (art/web/ui/codex/); everything that moves is this file moving them in 3D.
var Codex = (function () {
  var ART = 'art/web/ui/codex/', TITLE = 'Codex Orbis';
  var IMAGES = ['cover.jpg', 'cover-inside.jpg', 'page.jpg', 'dust.png', 'headpiece.png', 'tailpiece.png', 'device.png', 'cap-frame.png', 'ribbon.png'];
  var SOUNDS = ['codex-whoosh', 'codex-drop', 'codex-open', 'codex-cover-land', 'codex-page', 'codex-flutter', 'codex-close'];
  // Where the loudest moment falls in the page turn's and the flutter's recordings, so the motion can land on it.
  var PAGE_HIT = .68, FLUTTER_HIT = 1.56;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  var root = null, el = {}, W = 560, H = 747, compact = false, scale = 1;
  var pages = [], last = 0, spread = 0, view = 'right', phase = 'shut';
  var book = {}, timers = [], runs = [], voices = [], pageVoices = [], floated = [], leaves = [], queued = 0, queueDir = 0, landedTurn = 0, turnCount = 0;

  // Small helpers

  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sine(t) { return .5 - .5 * Math.cos(Math.PI * t); }
  function quadIn(t) { return t * t; }
  function quadOut(t) { return 1 - (1 - t) * (1 - t); }
  var PLAY = { vol: 1 };
  function sound(name, o) { var v = Sfx.play(name, Object.assign({ gap: 0 }, o || PLAY)); voices.push(v); if (voices.length > 12) voices.shift(); return v; }
  // A run of frames over secs seconds, calling fn with the share done; it stops when the book closes or is hurried.
  function run(secs, fn, done) {
    var start = performance.now(), r = { stop: false };
    runs.push(r);
    (function frame(now) {
      if (r.stop) return;
      var t = secs > 0 ? clamp((now - start) / (secs * 1000), 0, 1) : 1;
      fn(t);
      if (t < 1) requestAnimationFrame(frame);
      else { runs.splice(runs.indexOf(r), 1); if (done) done(); }
    })(start);
    return r;
  }
  function at(secs, fn) { timers.push(setTimeout(fn, secs * 1000)); }
  function cancelAll() { timers.forEach(clearTimeout); timers = []; runs.forEach(function (r) { r.stop = true; }); runs = []; }

  function warm() {
    IMAGES.forEach(function (f) { var i = new Image(); i.src = ART + f; });
    if (window.Sfx && Sfx.preload) Sfx.preload(SOUNDS);
  }
  document.addEventListener('pointerover', function (e) { if (e.target.closest && e.target.closest('[data-act="codex"]')) warm(); }, { passive: true });
  document.addEventListener('focusin', function (e) { if (e.target.closest && e.target.closest('[data-act="codex"]')) warm(); });

  // The pages. The book is laid out once as it opens, at its fixed page size, by filling a hidden page block by block.
  // Page 1 is the title, 2 the compiler's note, 3 the contents; each chapter opens on a left-hand page with its own list.

  var cardArt = null;
  function artSrc(art) {
    if (!art) return null;
    if (art.plate) return art.plate;
    if (!cardArt) {
      cardArt = {};
      Object.keys(Engine.CARDS).forEach(function (id) { cardArt[Engine.CARDS[id].name.toLowerCase()] = id; });
    }
    var id = cardArt[art.card.toLowerCase()];
    return id ? GameUI.artUrl(id) : null;
  }
  function entryBlocks(e) {
    var out = [{ html: '<div class="cx-etitle"><img src="' + ART + 'headpiece.png" alt=""><h3>' + esc(e.title) + '</h3></div>' }], first = true;
    var src = artSrc(e.art);
    if (src) out.push({ html: '<figure class="cx-plate"><img src="' + src + '" alt=""></figure>' });
    e.blocks.forEach(function (b) {
      if (b.q) out.push({ html: '<blockquote><p>' + b.q + '</p><cite>— ' + b.by + '</cite></blockquote>' });
      else if (/^— /.test(b.p)) out.push({ p: b.p, cls: 'sig' });
      else { out.push({ p: b.p, cls: first ? 'first' : '' }); first = false; }
    });
    out.push({ html: '<img class="cx-tail" src="' + ART + 'tailpiece.png" alt="">', optional: true });
    return out;
  }
  function row(title, n, cls) {
    return '<div class="cx-row' + (cls ? ' ' + cls : '') + '" data-goto="' + n + '" role="link" tabindex="0"><span class="t">' + esc(title) + '</span><span class="dots"></span><span class="n">' + (n || '00') + '</span></div>';
  }
  // Keeps <i> and <b> balanced when a paragraph is split across two pages.
  function openTags(html) {
    var stack = [];
    html.replace(/<(\/?)([ib])>/g, function (m, close, tag) { if (close) stack.pop(); else stack.push(tag); });
    return stack;
  }

  function paginate(numbers) {
    var out = [], cur = null, body = el.measureBody;
    function fresh(kind, chap, entry) { cur = { kind: kind, chap: chap, entry: entry, blocks: [] }; out.push(cur); body.innerHTML = ''; }
    function fits() { return body.scrollHeight <= body.clientHeight + 1; }
    function para(b) { return '<p' + (b.cls ? ' class="' + b.cls + '"' : '') + '>' + b.p + '</p>'; }
    function put(b) {
      var html = b.html || para(b), probe = h('div');
      probe.innerHTML = html; var node = probe.firstChild;
      body.appendChild(node);
      if (fits()) { cur.blocks.push(html); return; }
      body.removeChild(node);
      if (b.optional) return;
      if (b.p !== undefined) {
        // Fit as many words as will go, and carry the rest over.
        var words = b.p.split(' '), lo = 0, hi = words.length - 1;
        while (lo < hi) {
          var mid = Math.ceil((lo + hi) / 2), part = words.slice(0, mid).join(' ');
          var trial = h('p', b.cls, part + openTags(part).reverse().map(function (t) { return '</' + t + '>'; }).join(''));
          body.appendChild(trial); var ok = fits(); body.removeChild(trial);
          if (ok) lo = mid; else hi = mid - 1;
        }
        if (lo >= 6) {
          var head = words.slice(0, lo).join(' '), open = openTags(head);
          var done = { p: head + open.slice().reverse().map(function (t) { return '</' + t + '>'; }).join(''), cls: b.cls };
          cur.blocks.push(para(done)); body.appendChild(h('div', '', para(done)).firstChild);
          fresh(cur.kind, cur.chap, cur.entry);
          return put({ p: open.map(function (t) { return '<' + t + '>'; }).join('') + words.slice(lo).join(' '), cls: 'cont' });
        }
      }
      if (!cur.blocks.length) { cur.blocks.push(html); body.appendChild(node); return; }
      fresh(cur.kind, cur.chap, cur.entry);
      put(b);
    }
    var book = window.CODEX_ENTRIES || { note: null, chapters: [] }, starts = {};
    out.push({ kind: 'title' });
    if (book.note) { fresh('text', 'To the reader', book.note.title); entryBlocks(book.note).forEach(put); }
    fresh('toc', 'Contents', 'Contents');
    put({ html: '<div class="cx-h">Contents</div>' });
    book.chapters.forEach(function (c, ci) {
      put({ html: row(c.title, numbers['c' + ci], '') });
      put({ html: '<p class="some">' + c.entries.slice(0, 4).map(function (e) { return esc(e.title); }).join(' · ') + (c.entries.length > 4 ? ' …' : '') + '</p>' });
    });
    book.chapters.forEach(function (c, ci) {
      if (out.length % 2 === 0) out.push({ kind: 'blank' });
      fresh('chap', c.title, c.title);
      starts['c' + ci] = out.length;
      // The opener borrows the chapter's last painting, so it doesn't repeat the one on the facing page or the next spread.
      var plate = null, facing = c.entries.length ? artSrc(c.entries[0].art) : null;
      c.entries.slice(1).reverse().some(function (e) { var src = artSrc(e.art); if (src && src !== facing) plate = src; return plate; });
      put({ html: '<div class="cx-etitle"><img src="' + ART + 'headpiece.png" alt=""><div class="cx-h">' + esc(c.title) + '</div></div>' });
      if (plate && !compact) put({ html: '<figure class="cx-plate"><img src="' + plate + '" alt=""></figure>' });
      c.entries.forEach(function (e) { put({ html: row(e.title, numbers[e.id]) }); });
      c.entries.forEach(function (e) {
        fresh('text', c.title, e.title);
        starts[e.id] = out.length;
        entryBlocks(e).forEach(put);
      });
    });
    return { pages: out, starts: starts };
  }
  function layout() {
    var first = paginate({});
    var second = paginate(first.starts);
    pages = [null].concat(second.pages);
    last = Math.floor((pages.length - 1) / 2);
  }

  function pageHTML(i) {
    var side = i % 2 ? 'recto' : 'verso', pg = pages[i];
    if (!pg || pg.kind === 'blank') return '<div class="cx-pg ' + side + ' cx-blank"><div class="cx-in"><div class="cx-body">' + (pg ? '<img class="cx-tail" src="' + ART + 'tailpiece.png" alt="">' : '') + '</div></div></div>';
    if (pg.kind === 'title') {
      return '<div class="cx-pg recto cx-titlepage"><div class="cx-in"><img class="device" src="' + ART + 'device.png" alt="">' +
        '<h1>' + TITLE + '</h1><p class="sub">an account of the world as it stands</p><div class="rule"></div>' +
        '<p class="by">set down by <b>Edra Moyle</b>,<br>reader in histories<span>Lantern Conclave · Ambrel</span></p>' +
        '<p class="when">in the hundred and fiftieth year after the Cataclysm</p></div></div>';
    }
    var rh = side === 'verso' ? pg.chap : pg.entry;
    return '<div class="cx-pg ' + side + ' cx-' + pg.kind + '"><div class="cx-in"><div class="cx-rh">' + esc(rh || '') + '</div>' +
      '<div class="cx-body">' + pg.blocks.join('') + '</div></div><div class="cx-folio">' + i + '</div></div>';
  }
  function blank(side) { return '<div class="cx-pg ' + side + '"></div>'; }
  function setSlot(side, i, html) {
    var slot = el[side];
    slot.classList.toggle('board', side === 'left' && i === 0 && html === undefined);
    slot.innerHTML = html !== undefined ? html : side === 'left' && i === 0 ? '' : pageHTML(i);
    if (side === 'right') slot.appendChild(h('span', 'cx-corner'));
    slot.querySelectorAll('[data-goto]').forEach(function (r) { r.tabIndex = phase === 'open' ? 0 : -1; });
  }
  function showSpread() { setSlot('left', spread * 2); setSlot('right', spread * 2 + 1); edges(); announce(); }
  function edges() {
    var share = last ? spread / last : 0, max = 9;
    var r = 1.5 + max * (1 - share), l = spread ? 1.5 + max * share : 0;
    el.edgeR.style.width = r + 'px'; el.edgeL.style.width = l + 'px'; el.edgeL.style.left = (-W - l) + 'px';
  }
  function announce() {
    var a = spread * 2, b = a + 1, txt = a === 0 ? 'The title page' : b > pages.length - 1 ? 'Page ' + a : 'Pages ' + a + ' and ' + b;
    el.live.textContent = txt + ' of ' + (pages.length - 1) + '.';
  }

  // Building the scene

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7M8 12h13"/></svg>';
  function build() {
    root = h('div', 'codex' + (compact ? ' compact' : ''));
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Lore codex');
    el.lamp = root.appendChild(h('div', 'cx-lamp'));
    el.back = root.appendChild(h('button', 'btn cx-back', ARROW + 'Back'));
    el.back.type = 'button'; el.back.setAttribute('aria-label', 'Close the codex');
    el.stage = root.appendChild(h('div', 'cx-stage'));
    el.fit = el.stage.appendChild(h('div', 'cx-fit'));
    el.shadow = el.fit.appendChild(h('div', 'cx-shadow'));
    el.book = el.fit.appendChild(h('div', 'cx-book'));
    el.board = el.book.appendChild(h('div', 'cx-board'));
    el.edgeR = el.book.appendChild(h('div', 'cx-edge right'));
    el.edgeL = el.book.appendChild(h('div', 'cx-edge left'));
    el.ribbon = el.book.appendChild(h('button', 'cx-ribbon', '<i></i>'));
    el.ribbon.type = 'button'; el.ribbon.setAttribute('aria-label', 'Turn to the contents');
    el.left = el.book.appendChild(h('div', 'cx-slot left'));
    el.right = el.book.appendChild(h('div', 'cx-slot right'));
    el.castR = el.book.appendChild(h('div', 'cx-cast right'));
    el.castL = el.book.appendChild(h('div', 'cx-cast left'));
    el.cover = el.book.appendChild(h('div', 'cx-cover'));
    el.coverFront = el.cover.appendChild(h('div', 'cx-face front', '<div class="cx-title">' + TITLE + '</div><div class="shade"></div>'));
    el.coverBack = el.cover.appendChild(h('div', 'cx-face back', '<div class="cx-plate-line"><span>From the library of the</span><b>Lantern Conclave</b></div><div class="shade"></div>'));
    el.fore = el.book.appendChild(h('div', 'cx-side fore'));
    el.foot = el.book.appendChild(h('div', 'cx-side foot'));
    el.live = root.appendChild(h('div', 'cx-live')); el.live.setAttribute('aria-live', 'polite');
    var m = root.appendChild(h('div', 'cx-measure', '<div class="cx-pg recto"><div class="cx-in"><div class="cx-rh">x</div><div class="cx-body"></div></div></div>'));
    el.measureBody = m.querySelector('.cx-body');
    document.body.appendChild(root);
    root.addEventListener('click', onClick);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointermove', onMove);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
  }
  function fit() {
    var vw = window.innerWidth, vh = window.innerHeight;
    scale = compact ? Math.min((vw - 20) / (W * 1.03), (vh - 130) / (H * 1.2)) : Math.min((vw - 40) / (W * 2.1), (vh - 110) / (H * 1.22));
    el.fit.style.transform = 'translateY(' + (-H * scale * .05) + 'px) scale(' + scale + ')';
  }
  function isCompact() { return window.innerWidth < 700 && window.innerHeight > window.innerWidth; }

  // The book's pose: x and y in page pixels, s its scale, rx its tilt towards the camera, rz its turn on the table, o its
  // opacity, and sq a squash on landing. The shadow lies on the table below it, further off and softer the higher it is.
  function pose(p) {
    Object.assign(book, p);
    var b = book;
    el.book.style.transform = 'translate3d(' + b.x + 'px,' + b.y + 'px,0) rotateZ(' + b.rz + 'deg) rotateX(' + b.rx + 'deg) scale(' + b.s + ') scale(' + (2 - b.sq) + ',' + b.sq + ')';
    el.book.style.opacity = b.o;
    var lift = clamp((b.s - 1) / .3, 0, 1);
    el.shadow.style.transform = 'translate(' + (b.x + 8 + 50 * lift) + 'px,' + (b.y + 12 + 70 * lift) + 'px) rotateZ(' + b.rz + 'deg) scale(' + (1.02 + .1 * lift) + ')';
    el.shadow.style.opacity = b.o * (.62 - .42 * lift);
    el.shadow.style.width = (b.open ? W * 2 : W) + 'px';
    el.shadow.style.left = (b.open ? -W : 0) + 'px';
    var tilt = clamp(b.rx / 14, 0, 1);
    el.fore.style.opacity = el.foot.style.opacity = tilt;
  }
  // The cover's angle, from 0 (shut) to -180 (lying open on the left). It sinks under the left-hand pages once past upright.
  function coverAt(a) {
    var past = -a / 180;
    el.cover.style.transform = 'translateZ(' + lerp(3, -1, past) + 'px) rotateY(' + a + 'deg)';
    var tip = Math.sin(-a * Math.PI / 180);
    el.coverFront.lastChild.style.opacity = tip * .7;
    el.coverBack.lastChild.style.opacity = tip * .55;
    cast(a, 1.026);
    book.open = past > .5;
  }
  // The shadow a lifting cover or page throws on the page beneath it.
  function cast(a, wide) {
    var r = -a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    if (c >= 0) { el.castR.style.width = W * wide * c + 'px'; el.castR.style.opacity = s * .75; el.castL.style.opacity = 0; }
    else { el.castL.style.width = W * wide * -c + 'px'; el.castL.style.opacity = s * .75; el.castR.style.opacity = 0; }
    if (s < .02) el.castR.style.opacity = el.castL.style.opacity = 0;
  }
  function openX() { return compact ? (view === 'right' ? -W / 2 : W / 2) : 0; }

  function shake(px, secs) {
    if (calm.matches) return;
    run(secs, function (t) {
      var a = px * (1 - t) * (1 - t);
      el.stage.style.transform = t < 1 ? 'translate(' + (Math.random() * 2 - 1) * a + 'px,' + (Math.random() * 2 - 1) * a + 'px)' : '';
    });
  }
  // A puff of dust from under the book's edge: x, y on the book, turned so it blows outwards.
  function dust(x, y, turn, size, delay) {
    if (calm.matches) return;
    var d = el.book.appendChild(h('div', 'cx-dust', '<i></i><i></i>'));
    d.style.cssText = 'left:' + (x - size / 2) + 'px;top:' + (y - size) + 'px;width:' + size + 'px;height:' + size + 'px;transform-origin:50% 100%;transform:translateZ(.5px) rotate(' + turn + 'deg)';
    var a = d.firstChild, b = d.lastChild;
    a.style.inset = b.style.inset = '0'; a.style.left = b.style.left = '0'; a.style.top = b.style.top = '0';
    function frame(node, n) { node.style.backgroundPosition = (n % 3) * 50 + '% ' + Math.floor(n / 3) * 100 + '%'; }
    at(delay || 0, function () {
      run(.6, function (t) {
        var f = t * 5, i = Math.min(4, Math.floor(f)), k = f - i;
        frame(a, i); frame(b, i + 1); a.style.opacity = 1 - k; b.style.opacity = k;
        if (t >= 1) d.remove();
      });
    });
  }
  function dustAround(strength) {
    var s = W * .3 * strength;
    [.2, .5, .8].forEach(function (f, i) { dust(W * 1.02, H * f, 90, s, i * .02); dust(0, H * f, -90, s * .7, i * .03); });
    [.25, .7].forEach(function (f) { dust(W * f, H * 1.01, 180, s, .02); dust(W * f, 0, 0, s * .8, .04); });
  }

  // Opening

  function open() {
    if (root) return;
    warm();
    compact = isCompact(); W = compact ? 380 : 560; H = compact ? 507 : 747;
    build(); fit(); layout();
    spread = 0; view = 'right'; phase = 'opening'; turnCount = landedTurn = 0;
    showSpread();
    var scr = Screens.kit.root; scr.inert = true; scr.dataset.codexScroll = scr.style.overflow; scr.style.overflow = 'hidden';
    Sfx.duck(true);
    pose({ x: -W / 2, y: 0, s: 1, rx: 0, rz: 0, o: 0, sq: 1, open: false });
    coverAt(0);
    el.ribbon.style.opacity = 0;
    if (calm.matches) {
      floatAway(true);
      el.lamp.style.opacity = 1; el.back.style.opacity = 1;
      coverAt(-180); pose({ x: openX(), o: 1 });
      el.ribbon.style.opacity = 1;
      spread = 1; showSpread(); ready();
      return;
    }
    floatAway(false);
    sound('codex-whoosh');
    run(.6, function (t) { el.lamp.style.opacity = sine(t); });
    at(.25, function () { run(.35, function (t) { el.back.style.opacity = t; }); });
    at(.42, function () {
      run(.48, function (t) {
        var g = quadIn(t);
        pose({ s: lerp(1.3, 1, g), rx: lerp(14, 0, g), rz: lerp(-7, -2, g), y: lerp(-50, 0, g), o: clamp(t * 4, 0, 1) });
      });
    });
    at(.84, function () { sound('codex-drop'); });
    at(.9, function () {
      shake(4, .24); dustAround(1);
      run(.24, function (t) { pose({ sq: t < .25 ? lerp(1, .988, t / .25) : lerp(.988, 1, quadOut((t - .25) / .75)) }); });
    });
    at(1, function () { run(.3, function (t) { pose({ rz: lerp(-2, 0, quadOut(t)) }); }); });
    at(1.1, function () { sound('codex-open'); });
    at(1.65, function () {
      run(1.03, function (t) {
        // Lift slowly, sweep through upright, then let it fall onto the table.
        var a = t < .75 ? -150 * sine(t / .75) : -150 - 30 * quadIn((t - .75) / .25);
        coverAt(a); pose({ x: lerp(-W / 2, openX(), sine(t)) });
      });
    });
    at(2.31, function () { sound('codex-cover-land'); });
    at(2.68, function () {
      shake(1.5, .18);
      [.3, .7].forEach(function (f) { dust(-W * 1.02, H * f, -90, W * .25, 0); });
      run(.4, function (t) { el.ribbon.style.opacity = t; });
    });
    at(3.58, function () { ready(); if (spread === 0) turn(1); });
  }
  // A click during the opening skips straight to the open book, keeping only the page turn onto the contents.
  function hurry() {
    cancelAll();
    voices.forEach(function (v) { v.fade(.08); });
    floated.forEach(function (a) { try { a.finish(); } catch (e) {} });
    el.lamp.style.opacity = 1; el.back.style.opacity = 1; el.ribbon.style.opacity = 1; el.stage.style.transform = '';
    root.querySelectorAll('.cx-dust').forEach(function (d) { d.remove(); });
    coverAt(-180); pose({ x: openX(), y: 0, s: 1, rx: 0, rz: 0, o: 1, sq: 1 });
    ready();
    if (spread === 0) turn(1);
  }
  function ready() {
    phase = 'open';
    root.querySelectorAll('[data-goto]').forEach(function (r) { r.tabIndex = 0; });
    el.back.focus({ preventScroll: true });
  }

  // The rest of the interface drifts away from the middle of the screen as the book comes, and back as it goes.
  function floatAway(quick) {
    var scr = Screens.kit.root, cx = window.innerWidth / 2, cy = window.innerHeight / 2, list = [];
    scr.querySelectorAll('.page > *').forEach(function (c) {
      if (c.matches('header')) list.push.apply(list, c.children); else list.push(c);
    });
    list = list.map(function (n) { var r = n.getBoundingClientRect(); return { n: n, r: r, d: Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) }; })
      .filter(function (o) { return o.r.bottom > 0 && o.r.top < window.innerHeight && o.r.width; })
      .sort(function (a, b) { return a.d - b.d; });
    floated = list.map(function (o, i) {
      var dx = o.r.left + o.r.width / 2 - cx, dy = o.r.top + o.r.height / 2 - cy, len = Math.hypot(dx, dy) || 1;
      var to = quick ? 'none' : 'translate(' + dx / len * 70 + 'px,' + (dy / len * 50 - 26) + 'px) scale(.96)';
      return o.n.animate([{ transform: 'none', opacity: 1 }, { transform: to, opacity: 0 }],
        { duration: quick ? 200 : 420, delay: quick ? 0 : Math.min(i, 12) * 26, easing: 'cubic-bezier(.45,0,.8,.3)', fill: 'forwards' });
    });
  }
  function floatBack(done) {
    var list = floated; floated = [];
    list.forEach(function (a) { a.reverse(); });
    setTimeout(function () { list.forEach(function (a) { a.cancel(); }); if (done) done(); }, 760);
  }

  // Turning pages. A leaf is a row of narrow hinged strips; each strip carries its slice of the page on each face, so the
  // paper curls as it turns: the outer edge leads as it lifts and trails as it settles. The curl is spread over every
  // hinge, more towards the free edge, so the strips read as one smooth sheet.

  var STRIPS = 16;
  function makeLeaf(frontHTML, backHTML, n) {
    n = n || STRIPS;
    var leaf = h('div', 'cx-leaf'), parent = leaf, segs = [], w = W / n;
    leaf.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) {
      var seg = h('div', 'cx-seg');
      // Each strip overlaps the next by a hair so no seam of table shows through between them.
      seg.style.width = w + (i < n - 1 ? .8 : 0) + 'px'; seg.style.left = (i ? w : 0) + 'px';
      var f = seg.appendChild(h('div', 'cx-face front', frontHTML + '<div class="shade"></div>'));
      var b = seg.appendChild(h('div', 'cx-face back', backHTML + '<div class="shade"></div>'));
      f.firstChild.style.left = -i * w + 'px';
      b.firstChild.style.left = -(W - (i + 1) * w) + 'px';
      segs.push({ el: seg, front: f.lastChild, back: b.lastChild });
      parent.appendChild(seg); parent = seg;
    }
    el.book.appendChild(leaf);
    return { el: leaf, segs: segs };
  }
  // Poses a leaf at base angle a (0 lying on the right, -180 on the left) with the curl for share t of a turn in dir.
  function bend(leaf, a, t, dir, z) {
    var segs = leaf.segs, n = segs.length, total = n * (n - 1) / 2;
    var curl = -(50 * Math.sin(Math.PI * t) + 40 * Math.sin(2 * Math.PI * t)) * dir, sum = a, angles = [];
    leaf.el.style.transform = 'translateZ(' + z + 'px) rotateY(' + a + 'deg)';
    for (var i = 0; i < n; i++) {
      if (i) { var b = curl * i / total; sum += b; segs[i].el.style.transform = 'rotateY(' + b + 'deg)'; }
      angles.push(sum);
    }
    // Paper darkens the further it tips from facing the reader. Each strip shades from the tone at its inner hinge to the
    // tone at its outer one, and neighbours share the tone at their hinge, so the shading runs on without steps.
    function tone(deg) { return (Math.abs(Math.sin(deg * Math.PI / 180)) * .5).toFixed(3); }
    for (i = 0; i < n; i++) {
      var inner = tone(i ? (angles[i - 1] + angles[i]) / 2 : angles[0]), outer = tone(i < n - 1 ? (angles[i] + angles[i + 1]) / 2 : angles[i]);
      var g = 'rgba(52,34,16,' + inner + '),rgba(52,34,16,' + outer + '))';
      segs[i].front.style.background = 'linear-gradient(90deg,' + g;
      segs[i].back.style.background = 'linear-gradient(270deg,' + g;
    }
    cast(a, 1);
  }
  // The share of a turn's angle at time t: a lift that slows near the top, then the page drops flat at the end.
  function sweep(t) { return t < .8 ? .9 * sine(t / .8) : .9 + .1 * quadIn((t - .8) / .2); }

  function pageSound(secs, quiet) {
    var v = Sfx.play('codex-page', { from: Math.max(0, PAGE_HIT - secs), rate: .96 + Math.random() * .08, vol: (quiet ? .55 : .9) + Math.random() * .1, gap: 0 });
    pageVoices.push(v);
    if (pageVoices.length > 2) pageVoices.shift().fade(.06);
  }
  function turn(dir, secs) {
    var k = spread, nk = k + dir;
    if (nk < 0 || nk > last) return false;
    secs = secs || PAGE_HIT;
    spread = nk;
    var id = ++turnCount;
    if (calm.matches) { showSpread(); pageSound(.3, true); return true; }
    var front = pageHTML(dir > 0 ? 2 * k + 1 : 2 * k - 1), back = pageHTML(dir > 0 ? 2 * k + 2 : 2 * k);
    if (dir > 0) setSlot('right', 2 * nk + 1); else setSlot('left', 2 * nk);
    var leaf = makeLeaf(front, back), fired = false;
    leaves.push(leaf);
    pageSound(secs);
    edges(); announce();
    leaf.run = run(secs, function (t) {
      var s = sweep(t), a = dir > 0 ? -180 * s : -180 + 180 * s;
      bend(leaf, a, t, dir, 2.6 + leaves.indexOf(leaf) * .2);
      if (!fired && t >= .4 && queued && queueDir === dir) { fired = true; queued--; turn(dir, Math.max(.3, secs * .8)); }
      if (t >= 1) land(leaf, dir, nk, id);
    });
    leaf.finish = function () { leaf.run.stop = true; land(leaf, dir, nk, id); };
    return true;
  }
  function land(leaf, dir, nk, id) {
    if (leaf.landed) return;
    leaf.landed = true;
    leaves.splice(leaves.indexOf(leaf), 1);
    if (id > landedTurn) {
      landedTurn = id;
      if (dir > 0) setSlot('left', 2 * nk); else setSlot('right', 2 * nk + 1);
    }
    leaf.el.remove();
    if (!leaves.length) { el.castR.style.opacity = el.castL.style.opacity = 0; }
  }
  function settle() { leaves.slice().forEach(function (l) { l.finish(); }); queued = 0; }

  // Jumping: a run of blank leaves riffles across, and only the first and last leaves carry words: the page leaving and
  // the page arriving. The stack under the riffle is blank paper until the last leaf lifts.
  function flutter(target) {
    var k = spread, d = target - k, dir = d > 0 ? 1 : -1, n = clamp(Math.abs(d), 4, 12);
    var secs = clamp(.6 + .09 * Math.abs(d), .6, 1.5), each = Math.min(.42, secs * .55), gap = (secs - each) / (n - 1);
    settle();
    spread = target;
    var id = ++turnCount;
    if (calm.matches) { showSpread(); return; }
    sound('codex-flutter', { from: Math.max(0, FLUTTER_HIT - secs) });
    var from = dir > 0 ? 'right' : 'left', to = dir > 0 ? 'left' : 'right';
    var leaving = dir > 0 ? [pageHTML(2 * k + 1), blank('verso')] : [blank('recto'), pageHTML(2 * k)];
    var arriving = dir > 0 ? [blank('recto'), pageHTML(2 * target)] : [pageHTML(2 * target + 1), blank('verso')];
    setSlot(from, 0, blank(dir > 0 ? 'recto' : 'verso'));
    edges(); announce();
    for (var i = 0; i < n; i++) (function (i) {
      at(i * gap, function () {
        var first = i === 0, lastLeaf = i === n - 1, faces = first ? leaving : lastLeaf ? arriving : [blank('recto'), blank('verso')];
        if (lastLeaf) { if (dir > 0) setSlot('right', 2 * target + 1); else setSlot('left', 2 * target); }
        var leaf = makeLeaf(faces[0], faces[1], first || lastLeaf ? STRIPS : 6);
        leaves.push(leaf);
        leaf.run = run(each, function (t) {
          var a = dir > 0 ? -180 * sweep(t) : -180 + 180 * sweep(t);
          bend(leaf, a, t, dir * .8, 2.6 + i * .15);
          if (t >= 1) {
            leaves.splice(leaves.indexOf(leaf), 1); leaf.el.remove();
            if (first && !lastLeaf) setSlot(to, 0, blank(dir > 0 ? 'verso' : 'recto'));
            if (lastLeaf) { landedTurn = id; showSpread(); el.castR.style.opacity = el.castL.style.opacity = 0; }
          }
        });
        leaf.finish = function () { leaf.run.stop = true; leaf.el.remove(); leaves.splice(leaves.indexOf(leaf), 1); };
      });
    })(i);
  }

  // Going to a page: one turn if it's on the next or previous spread, a flutter if further.
  function go(page) {
    var target = Math.floor(page / 2), side = page % 2 ? 'right' : 'left', d = target - spread;
    if (d === 0) { pan(side); return; }
    if (Math.abs(d) === 1) turn(d); else flutter(target);
    pan(side, Math.abs(d) === 1 ? PAGE_HIT : 1);
  }
  // On an upright phone the book is zoomed to one page; reading moves across the spread, turning at the right-hand page.
  function pan(side, secs) {
    if (!compact || view === side) return;
    var from = book.x; view = side;
    run(calm.matches ? 0 : secs || .3, function (t) { pose({ x: lerp(from, openX(), sine(t)) }); });
  }
  function next() {
    if (compact && view === 'left') return pan('right');
    if (leaves.length && turnCount > landedTurn) { if (queueDir !== 1) queued = 0; queueDir = 1; queued = Math.min(3, queued + 1); return; }
    if (turn(1) && compact) pan('left', PAGE_HIT);
  }
  function prev() {
    if (compact && view === 'right' && spread > 0) return pan('left');
    if (leaves.length && turnCount > landedTurn) { if (queueDir !== -1) queued = 0; queueDir = -1; queued = Math.min(3, queued + 1); return; }
    if (turn(-1) && compact) pan('right', PAGE_HIT);
  }
  function contents() { go(3); }

  // Closing: the left side, cover and pages read, swings back over in one motion from any page, then the book lifts away.
  function close() {
    if (!root || phase === 'closing') return;
    if (phase === 'opening') hurry();
    phase = 'closing';
    cancelAll(); settle();
    voices.forEach(function (v) { v.fade(.1); });
    var leftPage = spread ? pageHTML(2 * spread) : '';
    if (leftPage) {
      var copy = h('div', '', leftPage).firstChild;
      copy.style.left = W * .026 + 'px'; copy.style.top = H * .016 + 'px';
      el.coverBack.insertBefore(copy, el.coverBack.firstChild);
    }
    setSlot('left', 0); el.edgeL.style.width = '0px';
    el.ribbon.style.opacity = 0;
    var done = function () {
      Sfx.duck(false);
      floatBack(function () {
        var scr = Screens.kit.root; scr.inert = false; scr.style.overflow = scr.dataset.codexScroll || '';
        teardown();
        var b = document.querySelector('[data-act="codex"]'); if (b) b.focus({ preventScroll: true });
      });
    };
    if (calm.matches) {
      sound('codex-close');
      run(.3, function (t) { root.style.opacity = 1 - t; }, done);
      return;
    }
    var from = book.x;
    run(.65, function (t) {
      var a = t < .7 ? -180 + 145 * sine(t / .7) : -35 + 35 * quadIn((t - .7) / .3);
      coverAt(a); pose({ x: lerp(from, -W / 2, sine(t)) });
    }, function () {
      shake(3, .22); dustAround(.8);
      at(.25, function () {
        run(.4, function (t) { pose({ s: lerp(1, 1.14, sine(t)), y: lerp(0, -24, t), o: 1 - quadIn(t) }); el.lamp.style.opacity = 1 - t; el.back.style.opacity = 1 - t; }, done);
      });
    });
    at(.65 - .23, function () { sound('codex-close'); });
  }
  function teardown() {
    cancelAll();
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    if (root) root.remove();
    root = null; el = {}; leaves = []; voices = []; pageVoices = []; phase = 'shut';
  }

  // Input

  var downAt = null;
  function onDown(e) { downAt = { x: e.clientX, y: e.clientY, t: Date.now() }; }
  function onUp(e) {
    if (!downAt || phase !== 'open') return;
    var dx = e.clientX - downAt.x, dy = e.clientY - downAt.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - downAt.t < 700) { downAt.swiped = true; if (dx < 0) next(); else prev(); }
  }
  function onClick(e) {
    if (downAt && downAt.swiped) { downAt = null; return; }
    if (e.target.closest('.cx-back')) return close();
    if (phase === 'opening') return hurry();
    if (phase !== 'open') return;
    if (e.target.closest('.cx-ribbon')) return contents();
    var row = e.target.closest('[data-goto]');
    if (row) return go(+row.dataset.goto);
    var r = el.book.getBoundingClientRect(), mid = compact ? window.innerWidth / 2 : r.left + r.width / 2;
    if (!e.target.closest('.cx-book') && !compact) return;
    if (e.clientX >= mid) next(); else prev();
  }
  function onMove(e) {
    if (phase !== 'open' || compact) return;
    var r = el.right.getBoundingClientRect();
    root.classList.toggle('hover-next', e.clientX > r.right - r.width * .25 && e.clientX < r.right + 10 && e.clientY > r.top && e.clientY < r.bottom);
  }
  function onKey(e) {
    if (!root) return;
    if (e.key === 'Escape') { e.preventDefault(); return close(); }
    if (phase === 'opening' && /^(Enter| |ArrowRight|ArrowLeft)$/.test(e.key)) { e.preventDefault(); return hurry(); }
    if (phase !== 'open') return;
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.goto) { e.preventDefault(); return go(+e.target.dataset.goto); }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); contents(); }
  }
  function onResize() {
    if (!root || phase !== 'open') { if (root) fit(); return; }
    var was = compact, page = Math.max(1, spread * 2 + (view === 'right' ? 1 : 0));
    compact = isCompact();
    if (was !== compact) {
      settle();
      W = compact ? 380 : 560; H = compact ? 507 : 747;
      root.classList.toggle('compact', compact);
      layout();
      spread = Math.min(last, Math.floor(page / 2)); view = page % 2 ? 'right' : 'left';
      showSpread(); edges(); coverAt(-180);
    }
    fit(); pose({ x: openX() });
  }

  return { open: open, close: close, warm: warm, isOpen: function () { return !!root; } };
})();
