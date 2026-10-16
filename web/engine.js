'use strict';
// ─────────────────────────────────────────────────────────────────────────────
//  Deterministic canvas scene engine shared by every film in films/.
//  index.html?film=<id> loads films/<id>/scenes.js; renderFrame(i) draws frame i
//  at 30 fps from build/<id>/timeline.json. Nothing
//  depends on wall-clock time, so the headless render matches the preview.
// ─────────────────────────────────────────────────────────────────────────────
const W = 1080, H = 1920, FPS = 30;
const C = {
  ink: '#0E0F0D', ink2: '#16170F', paper: '#EFE6D2', paper2: '#E2D6BC', dim: '#8C8572',
  gold: '#D9A441', gold2: '#F2C76A', oil: '#B98322', red: '#C8452F', teal: '#6FA79A',
  water: '#2E5A6B', water2: '#1C3A47', rule: 'rgba(239,230,210,0.14)',
};
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
let TL = null;

// ── math & easing ───────────────────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const P = (t, a, d) => clamp((t - a) / d);                 // progress of [a, a+d]
const eOut = k => 1 - Math.pow(1 - k, 3);
const eIn = k => k * k * k;
const eIO = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eExpo = k => k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
const eBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ── timeline lookups ────────────────────────────────────────────────────────
const line = id => TL.lines.find(l => l.id === id);
// Absolute time a word containing `frag` starts in line `id` (nth match).
function wt(id, frag, nth = 0) {
  const l = line(id); let n = 0;
  for (const w of l.words) if (w.w.toLowerCase().includes(frag.toLowerCase())) { if (n++ === nth) return w.t0; }
  console.warn('word not found', id, frag); return l.start;
}
const ls = id => line(id).start, le = id => line(id).end;

// ── drawing helpers ─────────────────────────────────────────────────────────
function font(fam, size, weight = 400, italic = false) {
  const f = { serif: 'Playfair', mono: 'Plex', sans: 'Inter' }[fam] || fam;
  return `${italic ? 'italic ' : ''}${weight} ${size}px ${f}`;
}
function text(s, x, y, o = {}) {
  ctx.save();
  ctx.font = font(o.fam || 'sans', o.size || 40, o.weight || 400, o.italic);
  ctx.fillStyle = o.color || C.paper;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  ctx.letterSpacing = (o.track || 0) + 'px';
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = o.shadow; ctx.shadowOffsetY = o.shadow / 4; }
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; ctx.strokeText(s, x, y); }
  else ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(s, o = {}) {
  ctx.save(); ctx.font = font(o.fam || 'sans', o.size || 40, o.weight || 400, o.italic);
  ctx.letterSpacing = (o.track || 0) + 'px';
  const w = ctx.measureText(s).width; ctx.restore(); return w;
}
// Typewriter: reveal s by progress k, with a blinking block cursor while typing.
function type(s, x, y, k, o = {}, t = 0) {
  const n = Math.floor(s.length * clamp(k));
  text(s.slice(0, n), x, y, o);
  if (k > 0 && k < 1.0 && Math.floor(t * 4) % 2 === 0) {
    const wpx = measure(s.slice(0, n), o);
    const ax = o.align === 'center' ? x - measure(s, o) / 2 + wpx : x + wpx;
    ctx.save(); ctx.fillStyle = o.color || C.paper; ctx.globalAlpha *= .8;
    ctx.fillRect(ax + 4, y - (o.size || 40) * .78, (o.size || 40) * .5, (o.size || 40) * .9); ctx.restore();
  }
}
function line2(x1, y1, x2, y2, color, w = 2, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function rrect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function withAlpha(a, fn) { ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); }
function at(x, y, s, r, fn) { ctx.save(); ctx.translate(x, y); if (r) ctx.rotate(r); if (s !== 1) ctx.scale(s, s); fn(); ctx.restore(); }
// A mono label with a small leading tick: "— LABEL"
function tag(s, x, y, color = C.gold, k = 1, size = 26, align = 'left') {
  withAlpha(eOut(k), () => {
    const w = measure(s, { fam: 'mono', size, weight: 500, track: 3 });
    const x0 = align === 'center' ? x - w / 2 : x;
    line2(x0, y - size * .35, x0 + 26 * eOut(k), y - size * .35, color, 3);
    text(s, x0 + 40, y, { fam: 'mono', size, weight: 500, track: 3, color });
  });
}
// Animated stroke: draw a polyline up to fraction k of its length.
function strokePath(pts, k, color, w, opts = {}) {
  if (k <= 0 || pts.length < 2) return null;
  let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let rem = total * clamp(k), head = pts[0];
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (opts.glow) { ctx.shadowColor = color; ctx.shadowBlur = opts.glow; }
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    if (rem >= seg[i - 1]) { ctx.lineTo(pts[i][0], pts[i][1]); rem -= seg[i - 1]; head = pts[i]; }
    else { const f = rem / seg[i - 1]; head = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; ctx.lineTo(head[0], head[1]); break; }
  }
  ctx.stroke(); ctx.restore();
  return head;
}
function checkmark(x, y, s, k, color) {
  strokePath([[x - s * .5, y], [x - s * .15, y + s * .38], [x + s * .55, y - s * .45]], k, color, s * .16);
}

// ── texture: grain, vignette, paper ─────────────────────────────────────────
const grain = [];
function buildGrain() {
  for (let g = 0; g < 6; g++) {
    const c = document.createElement('canvas'); c.width = 360; c.height = 640;
    const x = c.getContext('2d'); const img = x.createImageData(360, 640); const r = rng(1000 + g);
    for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (r() - .5) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0); grain.push(c);
  }
}
let paperTex = null;
function buildPaper() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
  const r = rng(77);
  for (let i = 0; i < 2600; i++) {                    // fibres
    x.strokeStyle = `rgba(120,96,60,${r() * .06})`; x.lineWidth = r() * 1.4;
    const px = r() * W, py = r() * H, a = r() * Math.PI, l = 6 + r() * 26;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  for (let i = 0; i < 40; i++) {                      // foxing
    const px = r() * W, py = r() * H, rad = 20 + r() * 120;
    const g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, `rgba(150,110,50,${r() * .07})`); g.addColorStop(1, 'rgba(150,110,50,0)');
    x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  const g = x.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,60,20,.28)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  paperTex = c;
}
function bgInk(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * .5, H * .38, 50, W * .5, H * .45, H * .8);
  g.addColorStop(0, 'rgba(60,48,22,.38)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function finishFrame(t, f) {
  // grain
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .10;
  const g = grain[f % grain.length]; const r = rng(f * 13 + 7);
  ctx.drawImage(g, -r() * 40, -r() * 40, W + 80, H + 80); ctx.restore();
  // vignette
  const v = ctx.createRadialGradient(W / 2, H * .46, H * .28, W / 2, H * .5, H * .78);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // subtle gate weave flicker
  const fl = (rng(f * 31)() - .5) * .025;
  if (fl > 0) { ctx.fillStyle = `rgba(255,240,210,${fl})`; ctx.fillRect(0, 0, W, H); }
}

// ── persistent chrome: chapter marker, progress, corner marks ───────────────
function chrome(t, onPaper = false) {
  const end = TL.scenes.find(s => s.id === 'endcard').start;
  if (t > end + .3) return;
  const fade = 1 - P(t, end - .1, .4);
  const intro = eOut(P(t, .2, .8));
  withAlpha(fade * intro, () => {
    // progress rule
    line2(72, 112, W - 72, 112, onPaper ? 'rgba(14,15,13,.18)' : C.rule, 2);
    line2(72, 112, lerp(72, W - 72, t / TL.duration), 112, C.gold, 3);
    // chapter marker
    const i = TL.chapters.findIndex(c => t >= c.start && t < c.end);
    const ch = TL.chapters[Math.max(0, i)];
    const k = eOut(P(t, ch.start + (i === 0 ? .3 : .05), .5));
    const num = String(Math.max(0, i) + 1).padStart(2, '0');
    text(num, 72, 170, { fam: 'mono', size: 28, weight: 600, color: C.gold, track: 2 });
    text('/ ' + String(TL.chapters.length).padStart(2, '0'), 116, 170, { fam: 'mono', size: 28, weight: 400, color: C.dim, track: 2 });
    type(ch.label, 210, 170, k, { fam: 'mono', size: 28, weight: 500, color: onPaper ? C.ink : C.paper, track: 6 }, t);
    text(TL.title.toUpperCase(), W - 72, 170, { fam: 'mono', size: 22, weight: 400, color: C.dim, track: 4, align: 'right' });
  });
  // registration corners
  withAlpha(.35 * fade, () => {
    for (const [x, y, sx, sy] of [[44, 44, 1, 1], [W - 44, 44, -1, 1], [44, H - 44, 1, -1], [W - 44, H - 44, -1, -1]]) {
      line2(x, y, x + 34 * sx, y, C.paper, 2); line2(x, y, x, y + 34 * sy, C.paper, 2);
    }
  });
}

// ── captions: phrase chunks, karaoke highlight ──────────────────────────────
let CHUNKS = [];
function buildChunks() {
  CHUNKS = [];
  for (const l of TL.lines) {
    let cur = [];
    const flush = () => { if (cur.length) CHUNKS.push({ words: cur, t0: cur[0].t0, t1: cur[cur.length - 1].t1, line: l.id }); cur = []; };
    for (const w of l.words) {
      cur.push(w);
      const chars = cur.map(x => x.w).join(' ').length;
      if (/[,.:;?!…]$|\.\.\.$/.test(w.w) || chars > 20 || cur.length >= 5) flush();
    }
    flush();
  }
  // Each chunk holds until the next one starts (or briefly after its line ends).
  for (let i = 0; i < CHUNKS.length; i++) {
    const nx = CHUNKS[i + 1];
    CHUNKS[i].hold = nx && nx.line === CHUNKS[i].line ? nx.t0 : Math.min(CHUNKS[i].t1 + .35, nx ? nx.t0 : 1e9);
  }
}
function captions(t, y = 1480, dark = false) {
  const ch = CHUNKS.find(c => t >= c.t0 - .06 && t < c.hold);
  if (!ch) return;
  const o = { fam: 'sans', size: 62, weight: 700, track: -.5 };
  const words = ch.words.map(w => w.w);
  const widths = words.map(w => measure(w, o)); const space = measure(' ', o) + 10;
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let x = W / 2 - total / 2;
  const kin = eOut(P(t, ch.t0 - .06, .16));
  for (let i = 0; i < words.length; i++) {
    const w = ch.words[i];
    const active = t >= w.t0 && t < w.t1;
    const past = t >= w.t1;
    const pop = active ? 1 + .06 * Math.sin(Math.PI * P(t, w.t0, .18)) : 1;
    const col = active ? C.gold2 : (dark ? C.ink : C.paper);
    const a = (past || active ? 1 : .38) * kin;
    at(x + widths[i] / 2, y + (1 - kin) * 18, pop, 0, () => {
      if (!dark) text(words[i], 0, 0, { ...o, align: 'center', color: 'rgba(0,0,0,.6)', alpha: a, shadow: 18 });
      text(words[i], 0, 0, { ...o, align: 'center', color: active && dark ? C.oil : col, alpha: a });
    });
    x += widths[i] + space;
  }
}

const SC = {};          // scenes, registered by films/<id>/scenes.js
const FILM = {};        // per-film options, e.g. FILM.paperScenes = ['rule']
const FILM_ID = new URLSearchParams(location.search).get('film') || 'ten-year-bet';

// Text that fills with oil: an outline, then a gold wave rising inside it.
const off = document.createElement('canvas'); off.width = W; off.height = 600; const ox = off.getContext('2d');
function liquidText(s, x, y, size, level, t, alpha) {
  ox.clearRect(0, 0, W, 600);
  ox.font = font('serif', size, 900); ox.textAlign = 'center'; ox.letterSpacing = '2px';
  const by = 360;
  ox.fillStyle = '#24231c'; ox.fillText(s, W / 2, by);            // opaque base so source-atop keeps full alpha
  ox.globalCompositeOperation = 'source-atop';
  const top = by - size * .78, bottom = by + 8, ly = lerp(bottom, top - 10, level);
  const g = ox.createLinearGradient(0, ly, 0, bottom); g.addColorStop(0, C.gold2); g.addColorStop(.35, C.gold); g.addColorStop(1, C.oil);
  ox.fillStyle = g; ox.beginPath(); ox.moveTo(0, 600);
  for (let px = 0; px <= W; px += 12) ox.lineTo(px, ly + Math.sin(px * .018 + t * 5) * 7 + Math.sin(px * .041 - t * 3) * 4);
  ox.lineTo(W, 600); ox.closePath(); ox.fill();
  ox.globalCompositeOperation = 'source-over';
  ox.strokeStyle = 'rgba(239,230,210,.75)'; ox.lineWidth = 2.5; ox.strokeText(s, W / 2, by);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.shadowColor = 'rgba(217,164,65,.35)'; ctx.shadowBlur = 40 * level;
  ctx.drawImage(off, x - W / 2, y - by); ctx.restore();
}


// ═════════════════════════════════════════════════════════════════════════════
//  Compositor: scene crossfades, camera drift, chrome, captions, texture.
// ═════════════════════════════════════════════════════════════════════════════
const XF = .32;   // crossfade length
function drawScene(sc, t, alpha, zoom) {
  ctx.save(); ctx.globalAlpha = alpha;
  const d = sc.end - sc.start, k = clamp((t - sc.start) / d);
  const z = (1 + .025 * k) * zoom;                                   // slow push-in
  ctx.translate(W / 2, H * .45); ctx.scale(z, z); ctx.translate(-W / 2, -H * .45);
  SC[sc.id](t, sc);
  ctx.restore();
}
function renderAt(t, f) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const i = TL.scenes.findIndex(s => t >= s.start && t < s.end);
  const idx = i < 0 ? TL.scenes.length - 1 : i;
  const cur = TL.scenes[idx], prev = TL.scenes[idx - 1];
  const k = prev ? P(t, cur.start, XF) : 1;
  if (k < 1 && prev) drawScene(prev, t, 1, lerp(1, 1.04, eIO(k)));
  drawScene(cur, t, eIO(k), lerp(.97, 1, eOut(k)));
  // fade from black / to black
  const fadeIn = 1 - P(t, 0, .25), fadeOut = P(t, TL.duration - .35, .35);
  const paper = (FILM.paperScenes || []).includes(cur.id) && k > .5;
  chrome(t, paper);
  if (!paper) captions(t, 1500);
  finishFrame(t, f);
  if (fadeIn > 0 || fadeOut > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.max(fadeIn, fadeOut)})`; ctx.fillRect(0, 0, W, H); }
}
window.renderFrame = f => renderAt(f / FPS, f);
window.frameCount = () => Math.round(TL.duration * FPS);
window.grab = (q = .93) => cv.toDataURL('image/jpeg', q);

// ── boot ────────────────────────────────────────────────────────────────────
window.ready = (async () => {
  TL = await (await fetch(`../build/${FILM_ID}/timeline.json`)).json();
  await new Promise((ok, bad) => { const s = document.createElement('script'); s.src = `../films/${FILM_ID}/scenes.js`; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  const fams = [['Playfair', [400, 600, 800, 900]], ['Plex', [400, 500, 600]], ['Inter', [400, 600, 700]]];
  await Promise.all(fams.flatMap(([f, ws]) => ws.map(w => document.fonts.load(`${w} 40px ${f}`))));
  await Promise.all([400, 600, 800].map(w => document.fonts.load(`italic ${w} 40px Playfair`)));
  buildGrain(); buildPaper(); buildChunks();
  const q = new URLSearchParams(location.search);
  if (q.has('t')) { renderFrame(Math.round(parseFloat(q.get('t')) * FPS)); }
  else if (!q.has('headless')) startPreview();
  return true;
})();

function startPreview() {
  const ui = document.getElementById('ui');
  const audio = new Audio(`../build/${FILM_ID}/mix.wav`);
  ui.innerHTML = '<button id="pp">▶ play with sound</button> <span id="tc"></span>';
  let t0 = null;
  document.getElementById('pp').onclick = () => { audio.currentTime = 0; audio.play(); t0 = performance.now(); };
  const loop = () => {
    const t = t0 === null ? 0 : (audio.paused ? (performance.now() - t0) / 1000 : audio.currentTime);
    const f = Math.min(frameCount() - 1, Math.floor(t * FPS));
    renderFrame(f); document.getElementById('tc').textContent = (f / FPS).toFixed(2) + 's';
    requestAnimationFrame(loop);
  };
  loop();
}
