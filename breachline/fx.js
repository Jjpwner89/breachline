// Board effects: the aiming arrow and the animation of a spell aimed at a tile. Purely visual; the engine has already decided everything.
// The arrow is SVG, redrawn every frame so it can move on springs. Spells draw on a canvas laid over the whole page.
var SpellFX = (function () {
  // Effects play a little slower than real time, so each beat reads.
  var SPEED = 0.65;
  var GOLD = '#f0d68c';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function f1(n) { return n.toFixed(1); }
  function centre(el) { var b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height, l: b.left, t: b.top }; }
  // A card's arrow starts at its top edge; anything else starts from its middle.
  function origin(el) { var c = centre(el); if (el.classList.contains('card')) c.y = el.getBoundingClientRect().top + 6; return c; }

  // ---------- The aiming arrow ----------
  var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), parts = {};
  svg.id = 'aimArrow';
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs><filter id="aimBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>' +
    '<linearGradient id="aimShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1209" stop-opacity=".38"/><stop offset="1" stop-color="#0c0804" stop-opacity=".62"/></linearGradient></defs>';
  function part(name, attrs) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; }
  parts.drop = part('path', { fill: 'rgba(0,0,0,.42)', filter: 'url(#aimBlur)', transform: 'translate(3 6)' });
  parts.edge = part('path', { fill: 'none', stroke: 'rgba(16,10,4,.85)', 'stroke-width': 5.5, 'stroke-linejoin': 'round' });
  parts.body = part('path', { fill: 'url(#aimShade)', stroke: GOLD, 'stroke-width': 2.2, 'stroke-linejoin': 'round' });
  parts.socket = part('circle', { r: 6, fill: 'url(#aimShade)', stroke: GOLD, 'stroke-width': 2 });
  parts.brkEdge = part('path', { fill: 'none', stroke: 'rgba(16,10,4,.8)', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  parts.brk = part('path', { fill: 'none', stroke: GOLD, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  svg.style.display = 'none';
  document.body.appendChild(svg);

  var A = { on: false, from: null, to: null, cur: null, vel: { x: 0, y: 0 }, ctl: null, cvel: { x: 0, y: 0 }, grow: 0, thunk: 0, br: 0, time: 0, running: false, last: 0 };

  function aim(fromEl, toEl) {
    if (!fromEl || !toEl) return unaim();
    var t = centre(toEl);
    if (!A.on) { A.cur = { x: t.x, y: t.y }; A.vel = { x: 0, y: 0 }; A.ctl = null; A.grow = reduced ? 1 : 0; }
    if (A.to !== toEl) { A.thunk = 1; A.br = reduced ? 0 : 1; }
    A.on = true; A.from = fromEl; A.to = toEl;
    if (!A.running) { A.running = true; A.last = performance.now(); requestAnimationFrame(tick); }
  }
  function unaim(now) {
    A.on = false; A.to = null;
    if (now || reduced) { A.grow = 0; svg.style.display = 'none'; }
  }
  function tick(ts) {
    var dt = Math.max(0, Math.min(0.04, (ts - A.last) / 1000)); A.last = ts; A.time += dt;
    var live = A.on && A.from && A.from.isConnected && A.to && A.to.isConnected;
    if (live) {
      var t = centre(A.to);
      A.box = t;
      if (reduced) { A.cur = { x: t.x, y: t.y }; }
      else {
        // A stiff, slightly underdamped spring gives the head weight: it overshoots a little and settles.
        A.vel.x += (260 * (t.x - A.cur.x) - 19 * A.vel.x) * dt; A.vel.y += (260 * (t.y - A.cur.y) - 19 * A.vel.y) * dt;
        A.cur.x += A.vel.x * dt; A.cur.y += A.vel.y * dt;
        A.grow = Math.min(1, A.grow + dt * 5.5);
      }
    } else { A.on = false; A.grow = Math.max(0, A.grow - dt * 9); }
    A.thunk *= Math.exp(-dt * 10); A.br *= Math.exp(-dt * 12);
    if ((!A.on && A.grow <= 0.001) || !A.from || !A.from.isConnected) { A.running = false; svg.style.display = 'none'; return; }
    svg.style.display = '';
    draw(dt);
    requestAnimationFrame(tick);
  }

  function bez(p0, p1, p2, t) { var u = 1 - t; return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y }; }
  function sample(p0, p1, p2, upto, n) {
    var pts = [], len = 0;
    for (var i = 0; i <= n; i++) {
      var p = bez(p0, p1, p2, upto * i / n);
      if (i) len += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
      p.s = len; pts.push(p);
    }
    pts.forEach(function (p, j) {
      var a = pts[Math.max(0, j - 1)], b = pts[Math.min(pts.length - 1, j + 1)], dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1;
      p.tx = dx / m; p.ty = dy / m; p.nx = -dy / m; p.ny = dx / m;
    });
    pts.len = len;
    return pts;
  }
  function poly(list) { return 'M' + list.map(function (p) { return f1(p.x) + ' ' + f1(p.y); }).join('L') + 'Z'; }

  // A hollow, tapering shaft with a barbed head: dark see-through fill inside a gold edge.
  function draw(dt) {
    var s = origin(A.from), e = A.cur, dist = Math.hypot(e.x - s.x, e.y - s.y);
    // The curve leaves the source upward and sweeps onto the tile. Its bend point trails on a softer spring, so the arc swings.
    var want = { x: lerp(s.x, e.x, 0.12), y: lerp(e.y, s.y, 0.42) - Math.min(70, dist * 0.12) };
    if (!A.ctl || reduced) A.ctl = { x: want.x, y: want.y };
    else { A.cvel.x += (90 * (want.x - A.ctl.x) - 11 * A.cvel.x) * dt; A.cvel.y += (90 * (want.y - A.ctl.y) - 11 * A.cvel.y) * dt; A.ctl.x += A.cvel.x * dt; A.ctl.y += A.cvel.y * dt; }
    var pts = sample(s, A.ctl, e, 1 - Math.pow(1 - A.grow, 3), 48), L = pts.len, end = pts[pts.length - 1];
    var headLen = 38 * (1 + 0.22 * A.thunk), headW = 21 * (1 + 0.28 * A.thunk), bodyEnd = Math.max(0, L - headLen * 0.72);
    var b = { x: end.x - end.tx * headLen, y: end.y - end.ty * headLen };
    var head = [{ x: end.x, y: end.y }, { x: b.x + end.nx * headW, y: b.y + end.ny * headW }, { x: b.x - end.nx * headW, y: b.y - end.ny * headW }];
    var left = [], right = [];
    pts.forEach(function (p) {
      if (p.s > bodyEnd) return;
      var hw = lerp(3, 10, Math.pow(p.s / Math.max(1, bodyEnd), 0.8));
      left.push({ x: p.x + p.nx * hw, y: p.y + p.ny * hw }); right.push({ x: p.x - p.nx * hw, y: p.y - p.ny * hw });
    });
    // One closed outline: down one edge, round the head, back up the other.
    var d = left.length > 1 ? poly(left.concat([head[1], head[0], head[2]]).concat(right.reverse())) : poly(head);
    parts.drop.setAttribute('d', d); parts.edge.setAttribute('d', d); parts.body.setAttribute('d', d);
    parts.socket.setAttribute('cx', f1(s.x)); parts.socket.setAttribute('cy', f1(s.y));
    // Four corner brackets close in on the tile whenever the target changes.
    var bx = A.box;
    if (bx && A.on) {
      var pad = -3 + 16 * A.br, c = 13, x0 = bx.l - pad, y0 = bx.t - pad, x1 = bx.l + bx.w + pad, y1 = bx.t + bx.h + pad;
      var k = 'M' + f1(x0) + ' ' + f1(y0 + c) + 'V' + f1(y0) + 'H' + f1(x0 + c) + 'M' + f1(x1 - c) + ' ' + f1(y0) + 'H' + f1(x1) + 'V' + f1(y0 + c) +
        'M' + f1(x1) + ' ' + f1(y1 - c) + 'V' + f1(y1) + 'H' + f1(x1 - c) + 'M' + f1(x0 + c) + ' ' + f1(y1) + 'H' + f1(x0) + 'V' + f1(y1 - c);
      parts.brk.setAttribute('d', k); parts.brkEdge.setAttribute('d', k);
    } else { parts.brk.setAttribute('d', ''); parts.brkEdge.setAttribute('d', ''); }
  }

  // ---------- Spell animation ----------
  var cv = document.createElement('canvas'), ctx = cv.getContext('2d'), dpr = 1;
  cv.id = 'fxLayer';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  function fit() { dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  fit();
  window.addEventListener('resize', fit);

  var actors = [], specks = [], freeze = 0, shakeAmp = 0, shakeEl = null, looping = false, last = 0;
  var glowCache = {};
  function glowSprite(col) {
    if (glowCache[col]) return glowCache[col];
    var c = document.createElement('canvas'), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    c.width = c.height = 64;
    gr.addColorStop(0, col); gr.addColorStop(0.35, col + 'aa'); gr.addColorStop(1, col + '00');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (glowCache[col] = c);
  }
  function glow(x, y, r, col, a) { if (r <= 0 || a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(glowSprite(col), x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1; }
  function spawn(p) { p.age = 0; p.life = p.life || 0.6; p.drag = p.drag === undefined ? 1.5 : p.drag; p.grav = p.grav || 0; p.rot = p.rot || rnd(0, 6.28); p.spin = p.spin || rnd(-6, 6); specks.push(p); run(); }
  function burst(x, y, n, speed, make) { for (var i = 0; i < n; i++) { var a = rnd(0, Math.PI * 2), v = rnd(speed[0], speed[1]); var p = make(); p.x = x; p.y = y; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; spawn(p); } }
  function actor(a) { a.t = 0; if (!a.update) { var ms = a.ms; a.update = function (dt) { this.t += dt * 1000; return this.t < ms; }; } actors.push(a); run(); return a; }
  function wait(ms) { return new Promise(function (ok) { actor({ update: function (dt) { this.t += dt * 1000; if (this.t >= ms) { ok(); return false; } return true; } }); }); }
  function hitStop(ms) { freeze = Math.max(freeze, ms / 1000); }
  function shake(px) { shakeAmp = Math.max(shakeAmp, px); }
  function run() { if (!looping) { looping = true; last = performance.now(); requestAnimationFrame(loop); } }
  var BELOW = { smoke: 1, shard: 1, leaf: 1, dirt: 1, rot: 1 };

  function loop(ts) {
    var real = Math.max(0, Math.min(0.05, (ts - last) / 1000)), dt = real * SPEED;
    last = ts;
    if (freeze > 0) { freeze -= real; dt = 0; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    actors = actors.filter(function (a) { return a.update(dt) !== false; });
    specks = specks.filter(function (p) {
      p.age += dt;
      if (p.age >= p.life) return false;
      var k = Math.exp(-p.drag * dt);
      p.vx *= k; p.vy = p.vy * k + p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
      return true;
    });
    // Shadows and smoke sit underneath; light adds on top; solid shapes go last.
    actors.forEach(function (a) { if (a.under) a.under(); });
    specks.forEach(function (p) { if (BELOW[p.kind]) speck(p); });
    ctx.globalCompositeOperation = 'lighter';
    specks.forEach(function (p) { if (!BELOW[p.kind]) speck(p); });
    actors.forEach(function (a) { if (a.light) a.light(); });
    ctx.globalCompositeOperation = 'source-over';
    actors.forEach(function (a) { if (a.over) a.over(); });
    if (shakeEl) {
      if (shakeAmp > 0.3) { if (dt > 0) shakeAmp *= Math.exp(-dt * 11); shakeEl.style.translate = f1(rnd(-1, 1) * shakeAmp) + 'px ' + f1(rnd(-1, 1) * shakeAmp * 0.7) + 'px'; }
      else { shakeAmp = 0; shakeEl.style.translate = ''; }
    }
    if (actors.length || specks.length || shakeAmp) requestAnimationFrame(loop);
    else { looping = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function speck(p) {
    var k = p.age / p.life, a = (p.alpha || 1) * (1 - k);
    switch (p.kind) {
      case 'glow': glow(p.x, p.y, p.size * (p.grow ? 1 + k * p.grow : 1 - k * 0.6), p.col, a); break;
      case 'spark':
        ctx.strokeStyle = p.col; ctx.globalAlpha = a; ctx.lineWidth = p.size; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035); ctx.stroke(); ctx.globalAlpha = 1; break;
      case 'smoke': case 'rot':
        ctx.globalAlpha = a * (p.kind === 'rot' ? 0.8 : 0.5); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + k * (p.grow || 1.6)), 0, 7); ctx.fill(); ctx.globalAlpha = 1; break;
      case 'shard':
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, a * 1.4); ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.35, 0); ctx.lineTo(0, p.size); ctx.lineTo(-p.size * 0.35, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1; break;
      case 'leaf':
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, a * 1.3); ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; break;
      case 'dirt':
        ctx.globalAlpha = Math.min(1, a * 1.2); ctx.fillStyle = p.col; ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); ctx.globalAlpha = 1; break;
    }
  }
  function ring(x, y, r0, r1, col, ms, w, mode) {
    var a = { ms: ms };
    a[mode === 'dark' ? 'over' : 'light'] = function () {
      var k = Math.min(1, this.t / ms), e = 1 - Math.pow(1 - k, 3), r = lerp(r0, r1, e);
      ctx.strokeStyle = col; ctx.globalAlpha = (1 - k) * 0.9; ctx.lineWidth = (w || 6) * (1 - k) + 1;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.62, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    };
    actor(a);
  }
  function flash(x, y, r, col, ms) {
    actor({ ms: ms, light: function () { var k = this.t / ms; glow(x, y, r * (1 + k * 0.5), col, 1 - k); glow(x, y, r * 0.5, '#ffffff', (1 - k) * 0.9); } });
  }
  function jagged(a, b, rough, segs) {
    var pts = [a], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    for (var i = 1; i < segs; i++) { var t = i / segs, o = rnd(-1, 1) * rough * Math.sin(Math.PI * t); pts.push({ x: a.x + dx * t + nx * o, y: a.y + dy * t + ny * o }); }
    pts.push(b);
    return pts;
  }
  function bolt(a, b, col, ms, rough) {
    var path = jagged(a, b, rough, 9);
    actor({ ms: ms, light: function () {
      var k = this.t / ms;
      if (Math.random() < 0.35) path = jagged(a, b, rough, 9);
      if (!(k < 0.25 || (k > 0.4 && k < 0.55) || (k > 0.7 && k < 0.8))) return;
      ctx.lineJoin = 'round';
      [[9, col, 0.35], [3.5, col, 0.9], [1.4, '#ffffff', 1]].forEach(function (st) {
        ctx.strokeStyle = st[1]; ctx.globalAlpha = st[2]; ctx.lineWidth = st[0]; ctx.beginPath();
        path.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    } });
  }

  // Painted impact sheets: 3 x 2 frames on a transparent sheet, played over the procedural burst.
  // Sources and prompts are in art/fx/; these are the game copies.
  var IMPACT_SHEETS = {
    fire: 'art/web/fx/impact-fire.png', storm: 'art/web/fx/impact-storm.png', frost: 'art/web/fx/impact-frost.png',
    thorns: 'art/web/fx/impact-thorns.png', blight: 'art/web/fx/impact-blight.png', holy: 'art/web/fx/impact-holy.png'
  };
  var PROJECTILES = { thorns: 'art/web/fx/projectile-thorns.png' };
  var sheets = {}, missiles = {};
  function preload(list, into) { Object.keys(list).forEach(function (k) { var im = new Image(); im.onload = function () { into[k] = im; }; im.src = list[k]; }); }
  preload(IMPACT_SHEETS, sheets); preload(PROJECTILES, missiles);
  // Recoloured copies of painted sheets, for a spell that borrows another family's look: each pixel's brightness is
  // repainted along a ramp of colours, darkest first, keeping the sheet's own transparency.
  var TINTS = {
    'gale-storm': ['storm', ['#2a0410', '#9c1230', '#ff3d3a', '#ff9a52', '#fff3e0']],
    'gale-frost': ['frost', ['#3a1206', '#b8461a', '#ff9a3c', '#ffd27a', '#fffaf0']]
  };
  function tinted(name) {
    var t = TINTS[name], im = t && sheets[t[0]];
    if (!im) return null;
    var c = document.createElement('canvas'), g = c.getContext('2d');
    c.width = im.naturalWidth; c.height = im.naturalHeight; g.drawImage(im, 0, 0);
    try {
      var d = g.getImageData(0, 0, c.width, c.height), px = d.data, lut = ramp(t[1]);
      for (var i = 0; i < px.length; i += 4) {
        var l = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) * 3;
        px[i] = lut[l]; px[i + 1] = lut[l + 1]; px[i + 2] = lut[l + 2];
      }
      g.putImageData(d, 0, 0);
    } catch (e) { return (sheets[name] = im); } // Pixels unreadable (opened from disk): play the source colours.
    return (sheets[name] = c);
  }
  // 256 brightness steps spread evenly across the ramp's colours, as r, g, b triples.
  function ramp(cols) {
    var rgb = cols.map(function (h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }), out = [];
    for (var i = 0; i < 256; i++) {
      var p = i / 255 * (rgb.length - 1), j = Math.min(rgb.length - 2, Math.floor(p)), f = p - j;
      for (var k = 0; k < 3; k++) out.push(Math.round(lerp(rgb[j][k], rgb[j + 1][k], f)));
    }
    return out;
  }
  // How each sheet plays: its length, and how much of each step is spent dissolving into the next (1 = the whole step).
  // Fire plays its frames in order but never stands still: the whole blast turns slowly, each frame swells as it
  // dissolves into the next, the widest frame churns into its own mirror image, and the edges feather into flame.
  var SHEET_TIME = { fire: { ms: 820, blend: 0.65, soft: true, churn: true, drift: 0.3, swell: 0.1 }, thorns: { ms: 660, blend: 0.6 } }, SHEET_DEFAULT = { ms: 820, blend: 1 };
  function sequence(T) {
    // With churn, the widest frame dissolves into its mirror image, turned a little, and the blast stays mirrored to the end.
    var order = T.churn ? [0, 1, 2, 3, -3, -4, -5] : [0, 1, 2, 3, 4, 5];
    return order.map(function (n, j) { return { i: Math.abs(n), rot: j > 3 && T.churn ? 0.5 : 0, flip: j > 3 && T.churn ? -1 : 1 }; });
  }
  var soft = document.createElement('canvas'), sctx = soft.getContext('2d');
  // scale is the frame's width in tiles; a smaller hit on a reached tile plays a little quicker.
  function playSheet(family, b, scale, quick) {
    var im = sheets[family] || tinted(family);
    if (!im) return false;
    var T = SHEET_TIME[family] || SHEET_DEFAULT, ms = T.ms * (quick ? 0.78 : 1), seq = sequence(T), step = ms / (seq.length - 0.4);
    var fw = im.width / 3, fh = im.height / 2, size = b.w * (scale || 1.7);
    // j is the frame's place in the sequence; it grows a little over the time it's on screen.
    function frame(g, j, p, cx, cy, a, turn) {
      var fr = seq[j];
      if (!fr || a <= 0.01) return;
      var sc = 1 + (T.swell || 0) * (Math.max(0, Math.min(1, (p - j + T.blend) / (1 + T.blend))) - 0.5);
      g.save(); g.globalAlpha = a; g.translate(cx, cy); g.rotate(fr.rot + turn); g.scale(fr.flip * sc, sc);
      g.drawImage(im, (fr.i % 3) * fw, Math.floor(fr.i / 3) * fh, fw, fh, -size / 2, -size / 2, size, size);
      g.restore();
    }
    if (T.soft) flames(b, size, ms);
    actor({ ms: ms, over: function () {
      var p = Math.min(seq.length - 1, this.t / step), i = Math.floor(p), f = Math.max(0, (p - i - (1 - T.blend)) / T.blend);
      var turn = (T.drift || 0) * this.t / ms;
      f = f * f * (3 - 2 * f);
      if (!T.soft) { frame(ctx, i, p, b.x, b.y, 1 - f, turn); frame(ctx, i + 1, p, b.x, b.y, f, turn); return; }
      // Drawn off to the side first, then faded toward its rim so no hard silhouette shows.
      var px = Math.ceil(size * dpr);
      if (soft.width < px) { soft.width = soft.height = px; }
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0); sctx.clearRect(0, 0, size, size);
      frame(sctx, i, p, size / 2, size / 2, 1 - f, turn); frame(sctx, i + 1, p, size / 2, size / 2, f, turn);
      var g = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, '#000'); g.addColorStop(0.42, '#000'); g.addColorStop(0.7, 'rgba(0,0,0,.55)'); g.addColorStop(0.9, 'rgba(0,0,0,0)');
      sctx.globalCompositeOperation = 'destination-in'; sctx.fillStyle = g; sctx.fillRect(0, 0, size, size); sctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(soft, 0, 0, px, px, b.x - size / 2, b.y - size / 2, size, size);
    } });
    return true;
  }
  // Tongues of flame licking out round the painted fire, each its own length, lean and flicker, over a warm halo.
  function flames(b, size, ms) {
    var licks = [];
    for (var i = 0; i < 18; i++) licks.push({ a: i / 18 * 6.28 + rnd(-0.15, 0.15), ph: rnd(0, 6.28), sp: rnd(0.009, 0.016), len: rnd(0.1, 0.2), w: rnd(0.03, 0.055), sway: rnd(0.12, 0.3) });
    var rolls = [];
    for (var j = 0; j < 9; j++) rolls.push({ a: j / 9 * 6.28, ph: rnd(0, 6.28), r: rnd(0.16, 0.24) });
    function shape(t) {
      var k = t / ms;
      return { env: k < 0.1 ? k / 0.1 : k > 0.55 ? Math.max(0, 1 - (k - 0.55) / 0.45) : 1, R: size * 0.5 * (0.2 + 0.42 * Math.min(1, k / 0.4)) };
    }
    // The halo adds light; the tongues are painted normally so they still read as flame on the pale map.
    actor({ ms: ms, light: function () {
      var f = shape(this.t);
      glow(b.x, b.y, f.R * 1.35, '#ff7a2a', 0.5 * f.env); glow(b.x, b.y, f.R * 0.8, '#ffb347', 0.35 * f.env);
    }, over: function () {
      var t = this.t, f = shape(t), env = f.env, R = f.R, x = b.x, y = b.y;
      // A slowly rolling body of flame under the painting, so its frames always dissolve into fire, never into nothing.
      rolls.forEach(function (o) {
        var a = o.a + t * 0.0007, rr = size * o.r * (0.85 + 0.15 * Math.sin(t * 0.008 + o.ph)), cx = x + Math.cos(a) * R * 0.62, cy = y + Math.sin(a) * R * 0.62;
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        g.addColorStop(0, 'rgba(255,190,90,' + (0.55 * env).toFixed(2) + ')'); g.addColorStop(0.5, 'rgba(225,80,20,' + (0.4 * env).toFixed(2) + ')'); g.addColorStop(1, 'rgba(120,24,6,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.fill();
      });
      licks.forEach(function (l) {
        var fl = 0.55 + 0.35 * Math.sin(t * l.sp + l.ph) + 0.15 * Math.sin(t * l.sp * 2.3 + l.ph * 1.7);
        var L = size * l.len * fl * env, w = size * l.w * (0.7 + 0.3 * fl);
        if (L < 2) return;
        var bx = x + Math.cos(l.a) * R * 0.82, by = y + Math.sin(l.a) * R * 0.82;
        var dx = Math.cos(l.a), dy = Math.sin(l.a) - 0.45, s = Math.sin(t * 0.006 + l.ph) * l.sway, m = Math.hypot(dx, dy);
        dx /= m; dy /= m;
        var ux = dx * Math.cos(s) - dy * Math.sin(s), uy = dx * Math.sin(s) + dy * Math.cos(s), nx = -uy, ny = ux;
        var g = ctx.createRadialGradient(bx, by, 0, bx, by, L);
        g.addColorStop(0, 'rgba(255,214,120,' + (0.9 * env).toFixed(2) + ')'); g.addColorStop(0.45, 'rgba(240,96,24,' + (0.7 * env).toFixed(2) + ')'); g.addColorStop(1, 'rgba(160,30,6,0)');
        ctx.fillStyle = g; ctx.beginPath();
        ctx.moveTo(bx + nx * w, by + ny * w);
        ctx.quadraticCurveTo(bx + ux * L * 0.5 + nx * w * 0.9, by + uy * L * 0.5 + ny * w * 0.9, bx + ux * L, by + uy * L);
        ctx.quadraticCurveTo(bx + ux * L * 0.5 - nx * w * 0.9, by + uy * L * 0.5 - ny * w * 0.9, bx - nx * w, by - ny * w);
        ctx.closePath(); ctx.fill();
      });
    } });
  }

  // How each tile effect looks: its colours, what it leaves behind in flight, and how it lands.
  var LOOK = {
    burn: { family: 'fire', core: '#ffe2a0', glow: '#ff7a2a', deep: '#ff3d0a', smoke: '#2a170e', size: 12 },
    charge: { family: 'storm', core: '#f6efff', glow: '#a77bff', deep: '#7a4dff', smoke: '#1d1530', size: 11 },
    frost: { family: 'frost', core: '#f4fbff', glow: '#8fd0ff', deep: '#4ea6e8', smoke: '#cfe8ff', size: 11 },
    thorns: { family: 'thorns', core: '#e6f4b4', glow: '#86c24a', deep: '#4f8a26', smoke: '#3a2a16', size: 12 },
    blight: { family: 'blight', core: '#e2ccff', glow: '#8a5bb5', deep: '#5a2f80', smoke: '#140a1c', size: 11 },
    holy: { family: 'holy', core: '#fffaf0', glow: '#ffd77a', deep: '#ffb53d', smoke: '#fff0c8', size: 11 },
    // Scatter the line: the storm and frost bursts turned scarlet and amber, with a gust that drives the row back.
    gale: { family: 'gale-storm', also: 'gale-frost', core: '#fff0e0', glow: '#ff5a3c', deep: '#d01e3a', smoke: '#2a0e12', size: 11 },
    // Gnosis has no painted sheet: a cold sea-blue light with a turning sigil, that lands in rings.
    arcane: { core: '#e8ffff', glow: '#3fd6e0', deep: '#1a7fb8', smoke: '#06222c', size: 11 }
  };
  // The painted sheet for a look, and its second sheet layered a little smaller when it has one.
  function paint(L, b, scale, quick) {
    var done = playSheet(L.family, b, scale, quick);
    if (L.also) playSheet(L.also, b, (scale || 1.7) * 0.8, quick);
    return done;
  }
  // Which way, down the screen, the cast spell pushes enemies: -1 up, 1 down.
  var push = -1;

  function trail(kind, x, y, L, dt) {
    for (var i = 0; i < Math.ceil(dt * 90); i++) {
      if (kind === 'burn') {
        spawn({ kind: 'glow', x: x + rnd(-4, 4), y: y + rnd(-4, 4), vx: rnd(-30, 30), vy: rnd(-60, 0), size: rnd(8, 15), col: Math.random() < .5 ? L.glow : L.deep, life: rnd(.25, .45), grav: -120 });
        if (Math.random() < .5) spawn({ kind: 'smoke', x: x, y: y, vx: rnd(-20, 20), vy: rnd(-40, -10), size: rnd(4, 7), col: L.smoke, life: rnd(.5, .8), alpha: .7 });
      } else if (kind === 'charge') spawn({ kind: 'spark', x: x, y: y, vx: rnd(-160, 160), vy: rnd(-160, 160), size: 1.6, col: Math.random() < .5 ? '#ffffff' : L.glow, life: rnd(.12, .25), drag: 4 });
      else if (kind === 'frost') {
        if (Math.random() < .6) spawn({ kind: 'shard', x: x + rnd(-5, 5), y: y + rnd(-5, 5), vx: rnd(-25, 25), vy: rnd(-10, 30), size: rnd(2.5, 4.5), col: '#dff2ff', life: rnd(.35, .6), grav: 60 });
        spawn({ kind: 'glow', x: x, y: y, vx: 0, vy: 0, size: rnd(6, 10), col: L.glow, life: .3 });
      } else if (kind === 'thorns') {
        if (Math.random() < .55) spawn({ kind: 'leaf', x: x + rnd(-6, 6), y: y + rnd(-6, 6), vx: rnd(-50, 50), vy: rnd(-20, 40), size: rnd(3, 6), col: Math.random() < .5 ? '#4e7a2a' : '#7aa840', life: rnd(.6, .9), grav: 120, spin: rnd(-9, 9) });
        if (Math.random() < .4) spawn({ kind: 'dirt', x: x, y: y, vx: rnd(-30, 30), vy: rnd(0, 40), size: rnd(1.5, 3), col: '#5a4020', life: rnd(.4, .7), grav: 300 });
        spawn({ kind: 'glow', x: x, y: y, vx: 0, vy: 0, size: rnd(7, 11), col: L.glow, life: .28, alpha: .8 });
      } else if (kind === 'blight') {
        spawn({ kind: 'smoke', x: x + rnd(-4, 4), y: y + rnd(-4, 4), vx: rnd(-15, 15), vy: rnd(10, 40), size: rnd(5, 9), col: L.smoke, life: rnd(.6, 1), alpha: .9 });
        if (Math.random() < .4) spawn({ kind: 'glow', x: x, y: y, vx: rnd(-20, 20), vy: rnd(-30, 10), size: rnd(4, 7), col: L.glow, life: .4 });
      } else if (kind === 'gale') {
        spawn({ kind: 'spark', x: x, y: y, vx: rnd(-140, 140), vy: rnd(-140, 140), size: 1.5, col: Math.random() < .5 ? '#ffd9a0' : L.glow, life: rnd(.12, .25), drag: 4 });
        if (Math.random() < .35) spawn({ kind: 'shard', x: x + rnd(-4, 4), y: y + rnd(-4, 4), vx: rnd(-30, 30), vy: rnd(-10, 30), size: rnd(2, 3.5), col: '#ffb36b', life: rnd(.3, .5), grav: 60 });
      } else if (kind === 'arcane') {
        spawn({ kind: 'glow', x: x + rnd(-5, 5), y: y + rnd(-5, 5), vx: rnd(-20, 20), vy: rnd(-20, 20), size: rnd(4, 8), col: Math.random() < .5 ? L.glow : L.deep, life: rnd(.3, .5), drag: 2 });
        if (Math.random() < .3) spawn({ kind: 'spark', x: x, y: y, vx: rnd(-70, 70), vy: rnd(-70, 70), size: 1.3, col: '#ffffff', life: rnd(.15, .3), drag: 3 });
      } else if (kind === 'holy') spawn({ kind: 'glow', x: x + rnd(-6, 6), y: y + rnd(-6, 6), vx: rnd(-15, 15), vy: rnd(-25, 5), size: rnd(3, 6), col: Math.random() < .5 ? L.glow : '#ffffff', life: rnd(.4, .8), drag: 2 });
    }
  }

  // A tangle of thorny vine, for the thorn seed in flight.
  function bramble(x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.lineCap = 'round';
    for (var i = 0; i < 3; i++) {
      ctx.rotate(Math.PI * 2 / 3);
      ctx.strokeStyle = '#2a1d0c'; ctx.lineWidth = s * 0.42; ctx.beginPath(); ctx.arc(s * 0.35, 0, s * 0.75, -1.9, 1.3); ctx.stroke();
      ctx.strokeStyle = '#6f9a35'; ctx.lineWidth = s * 0.2; ctx.beginPath(); ctx.arc(s * 0.35, 0, s * 0.75, -1.9, 1.3); ctx.stroke();
      ctx.fillStyle = '#d9e6a8';
      for (var j = 0; j < 3; j++) {
        var a = -1.6 + j * 1.2, px = s * 0.35 + Math.cos(a) * s * 0.75, py = Math.sin(a) * s * 0.75;
        ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * s * 0.42, py + Math.sin(a) * s * 0.42); ctx.lineTo(px + Math.cos(a + 1.4) * s * 0.12, py + Math.sin(a + 1.4) * s * 0.12); ctx.lineTo(px + Math.cos(a - 1.4) * s * 0.12, py + Math.sin(a - 1.4) * s * 0.12); ctx.fill();
      }
    }
    ctx.restore();
  }

  // The throw: a high lob, shown as height above a shadow sliding across the table, so it reads as heavy.
  // o (optional): lift scales the arc's height, size the projectile, pace its flight time.
  function flightMs(src, dst, pace) { return (420 + Math.hypot(dst.x - src.x, dst.y - src.y) * 0.5) * (pace || 1); }
  function flight(src, dst, kind, o) {
    o = o || {};
    var L = LOOK[kind], dist = Math.hypot(dst.x - src.x, dst.y - src.y), ms = flightMs(src, dst, o.pace), H = (50 + dist * 0.28) * (o.lift || 1), sc = o.size || 1;
    return new Promise(function (ok) {
      actor({ update: function (dt) {
        this.t += dt * 1000;
        var k = Math.min(1, this.t / ms), e = Math.pow(k, 1.55);
        this.g = { x: lerp(src.x, dst.x, e), y: lerp(src.y, dst.y, e) };
        this.h = H * 4 * e * (1 - e); this.p = { x: this.g.x, y: this.g.y - this.h };
        if (dt) trail(kind, this.p.x, this.p.y, L, dt * sc);
        if (k >= 1) { ok(); return false; }
        return true;
      }, under: function () {
        if (!this.g) return;
        var hk = 1 - this.h / H, r = (9 + 10 * hk) * sc;
        ctx.fillStyle = 'rgba(10,6,2,' + f1(0.22 + 0.3 * hk) + ')'; ctx.beginPath(); ctx.ellipse(this.g.x, this.g.y + 4, r, r * 0.45, 0, 0, 7); ctx.fill();
      }, light: function () {
        if (!this.p) return;
        var s = L.size * sc * (1 + 0.55 * this.h / H), x = this.p.x, y = this.p.y;
        glow(x, y, s * 3.4, L.glow, 0.85); glow(x, y, s * 1.7, L.deep, 0.9); glow(x, y, s * (kind === 'thorns' ? 0.7 : 1.05), L.core, 1);
        if (kind === 'charge' && Math.random() < .6) bolt({ x: x, y: y }, { x: x + rnd(-28, 28), y: y + rnd(-28, 28) }, L.glow, 90, 7);
      }, over: function () {
        if (!this.p) return;
        var s = L.size * sc * (1 + 0.55 * this.h / H), x = this.p.x, y = this.p.y;
        if (kind === 'blight') { ctx.fillStyle = '#140a1c'; ctx.beginPath(); ctx.arc(x, y, s * 0.75, 0, 7); ctx.fill(); }
        if (kind === 'thorns' && missiles.thorns) { var m = s * 4.4; ctx.save(); ctx.translate(x, y); ctx.rotate(this.t / 110); ctx.drawImage(missiles.thorns, -m / 2, -m / 2, m, m); ctx.restore(); }
        else if (kind === 'thorns') bramble(x, y, s * 1.1, this.t / 110);
        if (kind === 'arcane') {
          ctx.save(); ctx.translate(x, y); ctx.rotate(this.t / 240); ctx.strokeStyle = 'rgba(220,255,255,.85)'; ctx.lineWidth = 1.3;
          ctx.strokeRect(-s * 0.9, -s * 0.9, s * 1.8, s * 1.8); ctx.rotate(Math.PI / 4); ctx.strokeRect(-s * 0.9, -s * 0.9, s * 1.8, s * 1.8);
          ctx.restore();
        }
        if (kind === 'frost') {
          ctx.save(); ctx.translate(x, y); ctx.rotate(this.t / 160); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.4;
          for (var i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.stroke(); }
          ctx.restore();
        }
      } });
    });
  }
  // Wind-up: power gathers at the source before the throw.
  function gather(src, kind, ms) {
    var L = LOOK[kind];
    actor({ update: function (dt) {
      this.t += dt * 1000;
      for (var i = 0; i < Math.ceil(dt * 70); i++) {
        var a = rnd(0, 6.28), r = rnd(40, 70);
        spawn({ kind: 'glow', x: src.x + Math.cos(a) * r, y: src.y + Math.sin(a) * r * 0.7, vx: -Math.cos(a) * r * 4, vy: -Math.sin(a) * r * 2.8, size: rnd(3, 6), col: Math.random() < .5 ? L.glow : L.core, life: .22, drag: 0 });
      }
      return this.t < ms;
    }, light: function () { var k = this.t / ms; glow(src.x, src.y, L.size * 3 * k, L.glow, k); glow(src.x, src.y, L.size * k, L.core, k); } });
  }

  function crystals(x, y, r, n) {
    var arms = [];
    for (var i = 0; i < n; i++) arms.push({ a: (i / n) * 6.28 + rnd(-.2, .2), l: r * rnd(.6, 1) });
    actor({ ms: 1000, over: function () {
      var k = Math.min(1, this.t / 260), fade = this.t > 700 ? 1 - (this.t - 700) / 300 : 1;
      ctx.strokeStyle = 'rgba(236,248,255,' + f1(0.9 * fade) + ')'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      arms.forEach(function (a) {
        var ex = x + Math.cos(a.a) * a.l * k, ey = y + Math.sin(a.a) * a.l * k * .7, mx = x + Math.cos(a.a) * a.l * k * .6, my = y + Math.sin(a.a) * a.l * k * .42;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey);
        ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(a.a + .7) * 8 * k, my + Math.sin(a.a + .7) * 6 * k);
        ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(a.a - .7) * 8 * k, my + Math.sin(a.a - .7) * 6 * k); ctx.stroke();
      });
    } });
  }
  // Thornbrake: thick thorned brambles whip up out of the ground, overshoot, then sink back into the tile.
  function brambles(b) {
    var vines = [];
    for (var i = 0; i < 9; i++) {
      var a = (i / 9) * 6.28 + rnd(-.3, .3), r0 = rnd(.05, .22) * b.w;
      vines.push({ x: b.x + Math.cos(a) * r0, y: b.y + Math.sin(a) * r0 * .6, lean: rnd(-.9, .9), h: rnd(.35, .6) * b.h, w: rnd(4, 7), delay: rnd(0, 120) });
    }
    actor({ ms: 1250, over: function () {
      var t = this.t, fade = t > 900 ? 1 - (t - 900) / 350 : 1;
      ctx.lineCap = 'round';
      vines.forEach(function (v) {
        var k = Math.max(0, Math.min(1, (t - v.delay) / 260));
        if (!k) return;
        var c1 = 1.70158 + 1, e = 1 + c1 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2); // ease out with a whip of overshoot
        var tx = v.x + v.lean * v.h * 0.6 * e, ty = v.y - v.h * e, cx = v.x + v.lean * v.h * 0.1, cy = v.y - v.h * 0.55 * e;
        ctx.globalAlpha = Math.max(0, fade);
        ctx.strokeStyle = '#24180a'; ctx.lineWidth = v.w + 2.5; ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.quadraticCurveTo(cx, cy, tx, ty); ctx.stroke();
        ctx.strokeStyle = '#4d6a24'; ctx.lineWidth = v.w; ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.quadraticCurveTo(cx, cy, tx, ty); ctx.stroke();
        ctx.strokeStyle = '#8db152'; ctx.lineWidth = v.w * 0.3; ctx.beginPath(); ctx.moveTo(v.x - 1, v.y); ctx.quadraticCurveTo(cx - 1, cy, tx - 1, ty); ctx.stroke();
        ctx.fillStyle = '#e3e8b8';
        for (var j = 1; j <= 4; j++) {
          var u = j / 5, px = (1 - u) * (1 - u) * v.x + 2 * (1 - u) * u * cx + u * u * tx, py = (1 - u) * (1 - u) * v.y + 2 * (1 - u) * u * cy + u * u * ty, side = j % 2 ? 1 : -1, sz = v.w * (1 - u * .5);
          ctx.beginPath(); ctx.moveTo(px + side * sz * 1.2, py - sz * .4); ctx.lineTo(px, py - sz * .35); ctx.lineTo(px, py + sz * .35); ctx.fill();
        }
        ctx.globalAlpha = 1;
      });
    } });
    // A crack of churned earth at the base.
    actor({ ms: 1250, under: function () {
      var k = Math.min(1, this.t / 200), fade = this.t > 900 ? 1 - (this.t - 900) / 350 : 1;
      ctx.fillStyle = 'rgba(40,26,10,' + f1(0.55 * fade) + ')'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 4, b.w * .34 * k, b.h * .16 * k, 0, 0, 7); ctx.fill();
    } });
  }
  // Grave soil: the mote sinks in and the ground rots outward in a dark pool, with cold wisps rising from it.
  function rot(b) {
    var blots = [];
    for (var i = 0; i < 10; i++) { var a = rnd(0, 6.28), d = rnd(0, .22) * b.w; blots.push({ x: b.x + Math.cos(a) * d, y: b.y + Math.sin(a) * d * .55, r: rnd(.12, .22) * b.w, delay: rnd(0, 200) }); }
    actor({ ms: 1500, under: function () {
      var t = this.t, fade = t > 1100 ? 1 - (t - 1100) / 400 : 1;
      blots.forEach(function (p) {
        var k = Math.max(0, Math.min(1, (t - p.delay) / 500)), e = 1 - Math.pow(1 - k, 3);
        if (!e) return;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * e);
        g.addColorStop(0, 'rgba(18,8,26,' + f1(0.8 * fade) + ')'); g.addColorStop(.7, 'rgba(40,16,60,' + f1(0.5 * fade) + ')'); g.addColorStop(1, 'rgba(40,16,60,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * e, p.r * e * .62, 0, 0, 7); ctx.fill();
      });
    }, update: function (dt) {
      this.t += dt * 1000;
      if (dt && this.t > 150 && this.t < 1100) for (var i = 0; i < Math.ceil(dt * 26); i++) {
        spawn({ kind: 'rot', x: b.x + rnd(-.28, .28) * b.w, y: b.y + rnd(-.12, .12) * b.h, vx: rnd(-8, 8), vy: rnd(-55, -25), size: rnd(3, 6), grow: 2.4, col: Math.random() < .5 ? '#1d0f28' : '#2e1840', life: rnd(.9, 1.5), drag: .6, spin: 0 });
        if (Math.random() < .35) spawn({ kind: 'glow', x: b.x + rnd(-.25, .25) * b.w, y: b.y + rnd(-.1, .1) * b.h, vx: rnd(-6, 6), vy: rnd(-45, -20), size: rnd(3, 5), col: Math.random() < .6 ? '#9a6fc8' : '#b8d48a', life: rnd(.8, 1.3), drag: .5 });
      }
      return this.t < 1500;
    } });
  }
  // Scatter the line: tapered crescents of wind sweep off the tile the way the enemies are pushed, trailing streaks.
  function gust(b, L) {
    var dir = push;
    [0, 70, 150].forEach(function (delay, i) {
      var dx = rnd(-.12, .12) * b.w, wide = rnd(.75, .95) - i * .12;
      actor({ ms: 560 + delay, over: function () {
        var k = (this.t - delay) / 560;
        if (k <= 0) return;
        var e = 1 - Math.pow(1 - k, 2), x = b.x + dx * e, y = b.y + dir * b.h * (0.9 * e - 0.1), w = b.w * wide * (1 + e * 0.2);
        var bow = dir * b.h * 0.26, th = dir * b.h * (0.13 - i * 0.025) * (1 - k * 0.5);
        ctx.globalAlpha = Math.min(1, (1 - k) * 1.5);
        crescent(x, y, w, bow, th, L.deep); crescent(x, y, w * 0.86, bow, th * 0.45, L.glow); crescent(x, y, w * 0.6, bow, th * 0.15, '#fff3e0');
        ctx.globalAlpha = 1;
      } });
    });
    for (var n = 0; n < 26; n++) spawn({ kind: 'spark', x: b.x + rnd(-.42, .42) * b.w, y: b.y + rnd(-.25, .25) * b.h, vx: rnd(-30, 30), vy: dir * rnd(380, 820), size: rnd(1.6, 3), col: Math.random() < .5 ? '#ffd9a0' : L.glow, life: rnd(.3, .5), drag: 2.5 });
  }
  // A crescent bulging bow from its ends, th thick at its middle and sharp at both tips.
  function crescent(x, y, w, bow, th, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w / 2, y);
    ctx.quadraticCurveTo(x, y + bow * 2, x + w / 2, y); ctx.quadraticCurveTo(x, y + (bow - th) * 2, x - w / 2, y); ctx.fill();
  }
  function pillar(b, ms) {
    actor({ ms: ms, light: function () {
      var k = this.t / ms, a = k < .2 ? k / .2 : 1 - (k - .2) / .8, w = b.w * 0.55 * (1 + k * .3);
      var g = ctx.createLinearGradient(0, 0, 0, b.y);
      g.addColorStop(0, 'rgba(255,215,122,0)'); g.addColorStop(.7, 'rgba(255,215,122,' + f1(.35 * a) + ')'); g.addColorStop(1, 'rgba(255,250,235,' + f1(.8 * a) + ')');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b.x - w * .3, 0); ctx.lineTo(b.x + w * .3, 0); ctx.lineTo(b.x + w / 2, b.y); ctx.ellipse(b.x, b.y, w / 2, w * .2, 0, 0, Math.PI); ctx.lineTo(b.x - w / 2, b.y); ctx.closePath(); ctx.fill();
    } });
  }

  function impact(kind, b) {
    var L = LOOK[kind], x = b.x, y = b.y;
    hitStop(kind === 'holy' ? 40 : 75);
    shake(kind === 'charge' || kind === 'gale' ? 10 : kind === 'holy' ? 4 : kind === 'blight' ? 6 : 8);
    // With a painted sheet, the code-drawn centrepiece (vines, rot pool, crystals) steps aside; sparks, debris and light stay.
    var painted = paint(L, b);
    if (kind === 'blight') {
      // Blight darkens rather than flashes.
      flash(x, y, b.w * 0.4, L.deep, 260);
      ring(x, y, 8, b.w * 0.8, 'rgba(20,8,30,.9)', 620, 9, 'dark');
      if (!painted) rot(b);
      return;
    }
    flash(x, y, b.w * 0.75, L.glow, 340);
    ring(x, y, 8, b.w * 0.85, L.core, 520, 7);
    if (kind === 'burn') {
      burst(x, y, 46, [140, 460], function () { return { kind: 'spark', size: rnd(1.4, 2.6), col: Math.random() < .5 ? '#ffd27a' : L.glow, life: rnd(.35, .7), grav: 700, drag: 1.2 }; });
      burst(x, y, 14, [30, 110], function () { return { kind: 'smoke', size: rnd(8, 14), col: L.smoke, life: rnd(.8, 1.3), grav: -40, drag: 2, alpha: .75 }; });
      burst(x, y, 16, [20, 80], function () { return { kind: 'glow', size: rnd(12, 22), col: Math.random() < .5 ? L.glow : L.deep, life: rnd(.4, .7), grav: -90, drag: 2 }; });
    } else if (kind === 'charge') {
      for (var i = 0; i < 5; i++) bolt({ x: x + rnd(-b.w * .4, b.w * .4), y: b.t - rnd(30, 120) }, { x: x + rnd(-8, 8), y: y + rnd(-8, 8) }, L.glow, 380, 22);
      burst(x, y, 40, [160, 520], function () { return { kind: 'spark', size: rnd(1.2, 2.2), col: Math.random() < .5 ? '#ffffff' : L.glow, life: rnd(.2, .45), drag: 3 }; });
    } else if (kind === 'frost') {
      burst(x, y, 34, [120, 380], function () { return { kind: 'shard', size: rnd(3, 7), col: Math.random() < .5 ? '#e8f6ff' : '#a9dcff', life: rnd(.5, .9), grav: 520, drag: 1.4 }; });
      burst(x, y, 10, [20, 70], function () { return { kind: 'smoke', size: rnd(8, 13), col: L.smoke, life: rnd(.6, 1), drag: 2, alpha: .45 }; });
      if (!painted) crystals(x, y, b.w * 0.42, 7);
    } else if (kind === 'thorns') {
      if (!painted) brambles(b);
      burst(x, y, 40, [120, 360], function () { return { kind: 'dirt', size: rnd(2, 4.5), col: Math.random() < .5 ? '#4a3518' : '#6b4f26', life: rnd(.5, .9), grav: 820, drag: 1 }; });
      burst(x, y, 18, [60, 220], function () { return { kind: 'leaf', size: rnd(3, 6), col: Math.random() < .5 ? '#4e7a2a' : '#7aa840', life: rnd(.8, 1.2), grav: 200, drag: 2 }; });
    } else if (kind === 'gale') {
      for (var j = 0; j < 3; j++) bolt({ x: x + rnd(-b.w * .4, b.w * .4), y: b.t - rnd(30, 90) }, { x: x + rnd(-8, 8), y: y + rnd(-8, 8) }, L.deep, 320, 18);
      burst(x, y, 30, [140, 460], function () { return { kind: 'spark', size: rnd(1.2, 2.2), col: Math.random() < .5 ? '#ffd9a0' : L.glow, life: rnd(.2, .45), drag: 3 }; });
      burst(x, y, 16, [100, 300], function () { return { kind: 'shard', size: rnd(2.5, 5), col: Math.random() < .5 ? '#ffc58a' : '#ff8a5c', life: rnd(.4, .7), grav: 420, drag: 1.4 }; });
      gust(b, L);
    } else if (kind === 'arcane') {
      ring(x, y, 4, b.w * 0.6, L.glow, 700, 3);
      burst(x, y, 28, [60, 240], function () { return { kind: 'glow', size: rnd(3, 6), col: Math.random() < .5 ? L.glow : '#ffffff', life: rnd(.5, .9), drag: 2.5 }; });
      burst(x, y, 24, [140, 420], function () { return { kind: 'spark', size: rnd(1.2, 2), col: Math.random() < .5 ? '#ffffff' : L.glow, life: rnd(.2, .4), drag: 3 }; });
    } else if (kind === 'holy') {
      pillar(b, 900);
      burst(x, y, 30, [40, 160], function () { return { kind: 'glow', size: rnd(3, 6), col: Math.random() < .5 ? L.glow : '#ffffff', life: rnd(.8, 1.4), grav: -70, drag: 1.5 }; });
    }
  }
  // A spell on one of the caster's own: it settles rather than strikes, with no stop or shake.
  function bless(kind, b) {
    var L = LOOK[kind];
    flash(b.x, b.y, b.w * 0.5, L.glow, 320); ring(b.x, b.y, 6, b.w * 0.6, L.core, 480, 4);
    burst(b.x, b.y, 22, [20, 90], function () { return { kind: 'glow', size: rnd(3, 6), col: Math.random() < .5 ? L.glow : L.core, life: rnd(.6, 1.1), grav: -90, drag: 1.5 }; });
  }
  // The spell carries on from where it landed to each other tile it affects.
  function travel(from, to, kind, ms) {
    var L = LOOK[kind];
    if (kind === 'charge' || kind === 'gale') { bolt(from, to, L.glow, 340, 16); return wait(80); }
    return new Promise(function (ok) {
      actor({ update: function (dt) {
        this.t += dt * 1000;
        var k = Math.min(1, this.t / ms), e = k * k * (3 - 2 * k);
        this.p = { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e) };
        if (dt) trail(kind, this.p.x, this.p.y, L, dt * 0.7);
        if (k >= 1) { ok(); return false; }
        return true;
      }, light: function () { if (this.p) { glow(this.p.x, this.p.y, 18, L.glow, .8); glow(this.p.x, this.p.y, 7, L.core, 1); } },
      over: function () {
        if (kind !== 'frost' || !this.p) return;
        ctx.strokeStyle = 'rgba(230,246,255,.85)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(this.p.x, this.p.y); ctx.stroke();
      } });
    });
  }
  // A smaller hit on each other tile the spell reaches; the wave's first tile already had the full impact.
  function land(kind, b, noSheet) {
    var L = LOOK[kind];
    if (!noSheet) paint(L, b, 1.15, true);
    flash(b.x, b.y, b.w * 0.45, L.glow, 260); ring(b.x, b.y, 6, b.w * 0.55, L.core, 380, 4); shake(3);
    if (kind === 'gale') gust(b, L);
    if (kind === 'frost') burst(b.x, b.y, 14, [80, 220], function () { return { kind: 'shard', size: rnd(2.5, 5), col: '#e8f6ff', life: rnd(.4, .7), grav: 480 }; });
    else if (kind === 'burn') burst(b.x, b.y, 20, [100, 300], function () { return { kind: 'spark', size: rnd(1.2, 2.2), col: Math.random() < .5 ? '#ffd27a' : L.glow, life: rnd(.3, .5), grav: 600 }; });
    else burst(b.x, b.y, 18, [100, 300], function () { return { kind: 'spark', size: 1.4, col: Math.random() < .5 ? '#ffffff' : L.glow, life: rnd(.2, .35), drag: 3 }; });
  }
  // Cinderwake: a wall of fire rolls tile by tile along the path.
  function wave(tiles, ms) {
    var L = LOOK.burn, seen = {};
    return new Promise(function (ok) {
      actor({ update: function (dt) {
        this.t += dt * 1000;
        var pos = this.t / ms, i = Math.min(tiles.length - 1, Math.floor(pos));
        var a = centre(tiles[i]), b = centre(tiles[Math.min(tiles.length - 1, i + 1)]), f = pos - i;
        var x = i >= tiles.length - 1 ? a.x : lerp(a.x, b.x, f), y = i >= tiles.length - 1 ? a.y : lerp(a.y, b.y, f);
        for (var j = 0; j <= i; j++) if (!seen[j]) { seen[j] = 1; land('burn', centre(tiles[j]), j === 0); }
        if (dt) for (var n = 0; n < Math.ceil(dt * 160); n++) spawn({ kind: 'glow', x: x + rnd(-a.w * .48, a.w * .48), y: y + rnd(-6, 10), vx: rnd(-20, 20), vy: rnd(-160, -60), size: rnd(8, 16), col: Math.random() < .5 ? L.glow : L.deep, life: rnd(.3, .55), grav: -100 });
        if (pos >= tiles.length) { ok(); return false; }
        return true;
      } });
    });
  }

  // Plays a thrown spell. o: { kind: its look, from: element it's thrown from, target: the tile, unit or summoner plate it's
  // aimed at, reach: other tile elements it reaches, wave: true for Cinderwake, shake: element to shake, push: -1 or 1, the
  // screen direction enemies are driven, gentle: true when it lands on the caster's own, onLaunch: called as it leaves the
  // source, onStage(stage, ms): called as it starts to charge, launches and starts to fly, with the charge's and the
  // flight's length, for the sound }.
  // Resolves when the animation is done, so the caller can apply the move. Animation frames stop while the page is hidden,
  // so it also gives up after a few seconds rather than hold the game.
  var CHARGE = 600;
  function cast(o) { return Promise.race([play(o), new Promise(function (ok) { setTimeout(ok, 7000); })]); }
  // Cinderfall: a volley thrown from the card. The heavy shot goes to the target and a lighter one to each other
  // tile it reaches; with few of those, stray cinders rain round the target so it always reads as a volley.
  function volley(src, o) {
    var dst = centre(o.target), shots = [{ to: dst, hit: 'main' }];
    (o.reach || []).filter(Boolean).forEach(function (el) { shots.push({ to: centre(el), hit: 'reach' }); });
    while (shots.length < 4) shots.push({ to: { x: dst.x + rnd(-0.32, 0.32) * dst.w, y: dst.y + rnd(-0.3, 0.3) * dst.h, w: dst.w * 0.5, h: dst.h * 0.5 }, hit: 'cinder' });
    return Promise.all(shots.map(function (s, i) {
      var from = { x: src.x + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 14, y: src.y };
      var how = s.hit === 'main' ? { lift: 1.15 } : { lift: rnd(0.65, 1.35), size: s.hit === 'reach' ? 0.8 : 0.6, pace: rnd(0.85, 1.05) };
      return wait(i * 95).then(function () { return flight(from, s.to, o.kind, how); }).then(function () {
        if (s.hit === 'main') impact(o.kind, s.to); else land(o.kind, s.to, s.hit === 'cinder');
      });
    }));
  }
  async function play(o) {
    if (reduced || !LOOK[o.kind] || !o.target) return;
    shakeEl = o.shake || null;
    push = o.push || -1;
    var src = origin(o.from), stage = function (name, ms) { try { if (o.onStage) o.onStage(name, ms); } catch (e) {} };
    // The charge is long enough to hear the air drawn into it.
    gather(src, o.kind, CHARGE);
    stage('charge', CHARGE);
    await wait(CHARGE);
    if (o.onLaunch) o.onLaunch();
    stage('launch');
    stage('flight', flightMs(src, centre(o.target)));
    if (o.volley) { await volley(src, o); await wait(180); return; }
    await flight(src, centre(o.target), o.kind);
    var dst = centre(o.target);
    if (o.gentle) { bless(o.kind, dst); await wait(320); return; }
    impact(o.kind, dst);
    var reach = (o.reach || []).filter(Boolean);
    // A gale spreads outward from where it lands, nearest tiles first.
    if (o.kind === 'gale') reach.sort(function (p, q) { var a = centre(p), b = centre(q); return Math.abs(a.x - dst.x) - Math.abs(b.x - dst.x); });
    if (o.wave) { await wait(120); await wave([o.target].concat(reach), 190); }
    else {
      await wait(o.kind === 'frost' ? 140 : 90);
      await Promise.all(reach.map(function (el, i) {
        return wait(i * 70).then(function () { return travel(dst, centre(el), o.kind, 240); }).then(function () { land(o.kind, centre(el)); });
      }));
    }
    await wait(180);
  }

  return { aim: aim, unaim: unaim, cast: cast, enabled: function () { return !reduced; } };
})();
