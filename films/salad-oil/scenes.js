// The Salad Oil Test — scenes. Loaded by web/index.html?film=salad-oil.
'use strict';
FILM.paperScenes = ['rule'];

// ═════════════════════════════════════════════════════════════════════════════
//  SCENES — each draws itself at absolute time t. `s` is the scene record.
// ═════════════════════════════════════════════════════════════════════════════

// 01 · HOOK — a single drop of oil, the year, then the title fills with oil.
SC.hook = (t, s) => {
  bgInk(t);
  const dropT0 = .15, impact = 1.05;
  const cx = W / 2, floor = 900;
  // the drop
  if (t < impact) {
    const k = P(t, dropT0, impact - dropT0);
    const y = lerp(260, floor, eIn(k));
    const stretch = 1 + eIn(k) * .9;
    withAlpha(P(t, 0, .25), () => {
      ctx.save(); ctx.translate(cx, y); ctx.scale(1 / Math.sqrt(stretch), stretch);
      const g = ctx.createRadialGradient(-6, -8, 2, 0, 0, 26);
      g.addColorStop(0, C.gold2); g.addColorStop(.6, C.gold); g.addColorStop(1, C.oil);
      ctx.fillStyle = g; ctx.shadowColor = C.gold; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.bezierCurveTo(14, -12, 20, 4, 20, 12); ctx.arc(0, 12, 20, 0, Math.PI); ctx.bezierCurveTo(-20, 4, -14, -12, 0, -34); ctx.fill();
      ctx.restore();
    });
  }
  // ripples and splash
  if (t >= impact) {
    const lt = t - impact;
    for (let i = 0; i < 4; i++) {
      const k = P(lt, i * .16, 2.4);
      if (k <= 0 || k >= 1) continue;
      withAlpha((1 - k) * .9, () => {
        ctx.strokeStyle = i === 0 ? C.gold2 : C.gold; ctx.lineWidth = 3 - i * .5;
        ctx.beginPath(); ctx.ellipse(cx, floor, 30 + eOut(k) * 480, 8 + eOut(k) * 70, 0, 0, Math.PI * 2); ctx.stroke();
      });
    }
    const r = rng(5);
    for (let i = 0; i < 14; i++) {
      const ang = -Math.PI * (.15 + r() * .7), sp = 300 + r() * 520, k = lt;
      const x = cx + Math.cos(ang) * sp * k, y = floor + Math.sin(ang) * sp * k + 900 * k * k;
      if (k < .9 && y < floor + 10) withAlpha(1 - k / .9, () => { ctx.fillStyle = C.gold2; ctx.beginPath(); ctx.arc(x, y, 3 + r() * 6, 0, 7); ctx.fill(); });
    }
    // flash
    withAlpha((1 - P(lt, 0, .35)) * .35, () => { ctx.fillStyle = C.gold2; ctx.fillRect(0, 0, W, H); });
  }
  // the year
  const yk = eOut(P(t, impact + .02, .7));
  const yearOut = P(t, wt('L01', 'with') - .25, .4);
  withAlpha(yk * (1 - yearOut), () => {
    const sc = lerp(1.18, 1, yk);
    at(cx, 640, sc, 0, () => {
      text('1963', 0, 0, { fam: 'serif', size: 300, weight: 900, color: C.paper, align: 'center', track: -4 });
    });
    tag('NOVEMBER · NEW YORK STOCK EXCHANGE', cx - 260, 730, C.gold, P(t, impact + .5, .5), 24);
    // the partnership ledger line (who this is about)
    const pk = P(t, wt('L01', 'Warren') - .05, 1.4);
    withAlpha(eOut(P(t, wt('L01', 'Warren') - .1, .3)), () => {
      const y0 = 1080;
      line2(140, y0 - 64, 940, y0 - 64, C.rule, 2);
      type('BUFFETT PARTNERSHIP, LTD.', 140, y0, pk, { fam: 'mono', size: 34, weight: 600, color: C.paper, track: 4 }, t);
      type('OMAHA, NEBRASKA  ·  EST. 1956', 140, y0 + 52, P(t, wt('L01', 'early'), .9), { fam: 'mono', size: 24, color: C.dim, track: 3 }, t);
      line2(140, y0 + 96, 940, y0 + 96, C.rule, 2);
    });
  });
  // title: A FRAUD / made of / SALAD OIL. — the letters fill with oil
  const tk = P(t, wt('L01', 'with') - .1, .01);
  if (tk > 0) {
    const kIn = eBack(P(t, wt('L01', 'fraud') - .2, .45));
    const oilLevel = eIO(P(t, wt('L01', 'made') - .1, .9));
    at(cx, 700, lerp(.9, 1, clamp(kIn)), 0, () => {
      withAlpha(clamp(kIn), () => {
        text('A FRAUD', 0, -170, { fam: 'serif', size: 150, weight: 900, color: C.paper, align: 'center', track: 2 });
        text('made of', 0, -40, { fam: 'serif', size: 84, weight: 400, italic: true, color: C.gold, align: 'center' });
      });
    });
    const k2 = eOut(P(t, wt('L01', 'salad') - .2, .35));
    if (k2 > 0) liquidText('SALAD OIL.', cx, 860, 160, oilLevel, t, k2);
  }
};
// 01 · TANKS — "tanks of soybean oil that were mostly water"
SC.tanks = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  tag('BAYONNE, NEW JERSEY', 120, 300, C.gold, P(lt, .1, .5));
  type('Allied Crude Vegetable Oil Refining Corp.', 120, 356, P(lt, .3, 1.2), { fam: 'serif', size: 38, italic: true, color: C.paper }, t);
  const reveal = eIO(P(t, wt('L02', 'soybean') + .25, .8));
  const tanks = [[250, 1, .1], [540, 1.12, 0], [830, 1, .2]];
  const base = 1180;
  tanks.forEach(([x, sc, d], i) => {
    const k = eOut(P(lt, .15 + d + i * .08, .7));
    const tw = 230 * sc, th = 480 * sc;
    at(x, base + (1 - k) * 120, 1, 0, () => withAlpha(k, () => drawTank(tw, th, reveal, t, i)));
  });
  // ground line
  line2(80, base + 4, W - 80, base + 4, C.rule, 2);
  // loans counter: rolling digits
  const ck = P(t, wt('L02', 'borrowed') - .2, .4);
  withAlpha(eOut(ck), () => {
    text('LOANS SECURED BY "OIL"', 120, 1290, { fam: 'mono', size: 24, color: C.dim, track: 3 });
    const prog = P(t, wt('L02', 'borrowed'), 2.2);
    const val = prog < 1 ? Math.floor(eOut(prog) * 1e8 + 7e5 * Math.sin(t * 40)) : 1e8;
    text('$' + Math.max(0, val).toLocaleString('en-US') + (prog >= 1 ? '+' : ''), 120, 1368, { fam: 'mono', size: 60, weight: 600, color: C.gold });
  });
};
function drawTank(w, h, reveal, t, idx) {
  const x0 = -w / 2, top = -h;
  // body
  const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
  g.addColorStop(0, '#2b2a24'); g.addColorStop(.35, '#4a473c'); g.addColorStop(.6, '#3a382f'); g.addColorStop(1, '#1d1c18');
  ctx.fillStyle = g; ctx.fillRect(x0, top, w, h);
  // dome
  ctx.beginPath(); ctx.ellipse(0, top, w / 2, 26, 0, Math.PI, 0); ctx.fill();
  // cut-away: show contents
  if (reveal > 0) {
    const iw = w - 28, ix = -iw / 2, ih = h - 40, iy = top + 20;
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih * reveal); ctx.clip();
    const fill = .92, surf = iy + ih * (1 - fill);
    const wave = y => y + Math.sin(t * 2 + idx) * 3;
    // water
    const wg = ctx.createLinearGradient(0, surf, 0, iy + ih); wg.addColorStop(0, C.water); wg.addColorStop(1, C.water2);
    ctx.fillStyle = '#0a0b09'; ctx.fillRect(ix, iy, iw, ih);
    ctx.fillStyle = wg; ctx.fillRect(ix, wave(surf) + 26, iw, iy + ih - surf - 26);
    // thin oil film
    ctx.fillStyle = C.gold; ctx.fillRect(ix, wave(surf), iw, 26);
    ctx.fillStyle = C.gold2; ctx.fillRect(ix, wave(surf), iw, 4);
    // bubbles
    const r = rng(idx * 9 + 3);
    for (let b = 0; b < 10; b++) {
      const bx = ix + 14 + r() * (iw - 28), sp = 40 + r() * 60, ph = r();
      const by = iy + ih - ((t * sp + ph * ih) % (ih - 60));
      ctx.strokeStyle = 'rgba(200,230,240,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 3 + r() * 4, 0, 7); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(239,230,210,.5)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
    ctx.strokeRect(ix, iy, iw, ih * reveal); ctx.setLineDash([]);
  }
  // bands & rivets
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 3;
  for (let b = 1; b < 5; b++) { const y = top + h * b / 5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke(); }
  // ladder
  ctx.strokeStyle = 'rgba(239,230,210,.18)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0 + w - 26, top); ctx.lineTo(x0 + w - 26, 0); ctx.moveTo(x0 + w - 12, top); ctx.lineTo(x0 + w - 12, 0); ctx.stroke();
  for (let y = top + 10; y < 0; y += 22) { ctx.beginPath(); ctx.moveTo(x0 + w - 26, y); ctx.lineTo(x0 + w - 12, y); ctx.stroke(); }
  // stencil + gauge
  withAlpha(1 - reveal, () => {
    text('SOYBEAN', 0, top + h * .42, { fam: 'mono', size: 22, weight: 600, color: 'rgba(239,230,210,.55)', align: 'center', track: 4 });
    text('OIL', 0, top + h * .42 + 32, { fam: 'mono', size: 22, weight: 600, color: 'rgba(239,230,210,.55)', align: 'center', track: 4 });
  });
  const gx = x0 + 30, gy0 = top + 40, gy1 = -30;
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(gx - 7, gy0, 14, gy1 - gy0);
  ctx.fillStyle = reveal > .5 ? C.water : C.gold; ctx.fillRect(gx - 4, gy0 + 6, 8, gy1 - gy0 - 6);
  if (idx === 1) withAlpha(1 - reveal, () => text('FULL', gx + 16, gy0 + 18, { fam: 'mono', size: 20, weight: 600, color: C.gold }));
  if (idx === 1 && reveal > 0) withAlpha(eOut(P(reveal, .5, .5)), () => {
    const iy = top + 20, ih = h - 40, surf = iy + ih * .08;
    line2(w / 2 + 6, surf + 12, w / 2 + 70, surf - 40, C.gold2, 2);
    text('OIL', w / 2 + 78, surf - 36, { fam: 'mono', size: 30, weight: 600, color: C.gold2 });
    text('a thin film', w / 2 + 78, surf - 4, { fam: 'serif', size: 24, italic: true, color: C.paper });
    text('WATER', 0, top + h * .56, { fam: 'mono', size: 44, weight: 600, color: '#cfe8ef', align: 'center', track: 8 });
    text('mostly', 0, top + h * .56 - 56, { fam: 'serif', size: 30, italic: true, color: '#cfe8ef', align: 'center' });
  });
}

// 01 · RECEIPT — "An American Express subsidiary had vouched for the inventory."
SC.receipt = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const k = eOut(P(lt, 0, .6));
  const stampT = wt('L03', 'vouched') - .05;
  const shake = t > stampT && t < stampT + .25 ? (rng(Math.floor(t * 60))() - .5) * 14 * (1 - P(t, stampT, .25)) : 0;
  at(W / 2 + shake, 860 + (1 - k) * 700, 1, -.045 * k, () => {
    const w = 820, h = 900;
    // paper
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
    ctx.fillStyle = C.paper; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
    ctx.globalAlpha *= .9; ctx.drawImage(paperTex, 300, 600, w, h, -w / 2, -h / 2, w, h); ctx.restore();
    // guilloche border
    ctx.strokeStyle = 'rgba(46,90,107,.55)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) ctx.strokeRect(-w / 2 + 26 + i * 6, -h / 2 + 26 + i * 6, w - 52 - i * 12, h - 52 - i * 12);
    const L = -w / 2 + 70, ink = '#1e2a2e';
    text('FIELD WAREHOUSE RECEIPT', 0, -h / 2 + 120, { fam: 'serif', size: 48, weight: 800, color: ink, align: 'center', track: 2 });
    text('NON-NEGOTIABLE  ·  ILLUSTRATION', 0, -h / 2 + 162, { fam: 'mono', size: 18, color: '#5a5a50', align: 'center', track: 4 });
    line2(L, -h / 2 + 196, w / 2 - 70, -h / 2 + 196, 'rgba(30,42,46,.5)', 2);
    const rows = [['ISSUED BY', 'American Express Field Warehousing Corp.'], ['DEPOSITOR', 'Allied Crude Vegetable Oil Refining'], ['LOCATION', 'Tank farm · Bayonne, N.J.'], ['COMMODITY', 'Crude soybean oil'], ['QUANTITY', 'As certified']];
    rows.forEach(([a, b], i) => {
      const y = -h / 2 + 270 + i * 92, rk = P(lt, .35 + i * .12, .4);
      withAlpha(rk, () => {
        text(a, L, y, { fam: 'mono', size: 20, weight: 600, color: '#5a5a50', track: 3 });
        text(b, L, y + 38, { fam: 'serif', size: 32, color: ink });
        line2(L, y + 54, w / 2 - 70, y + 54, 'rgba(30,42,46,.18)', 1.5);
      });
    });
    // signature squiggle
    const sigK = P(lt, 1.2, .8);
    const sig = []; for (let i = 0; i <= 40; i++) { const u = i / 40; sig.push([L + 40 + u * 300, h / 2 - 120 + Math.sin(u * 19) * 18 * (1 - u * .5) - u * 20]); }
    strokePath(sig, sigK, ink, 3);
    text('Warehouseman', L + 40, h / 2 - 70, { fam: 'mono', size: 18, color: '#5a5a50', track: 2 });
    // stamp
    const sk = P(t, stampT, .22);
    if (sk > 0) {
      const sc = lerp(2.4, 1, eOut(sk));
      at(170, 250, sc, -.22, () => withAlpha(.85 * eOut(sk), () => {
        ctx.strokeStyle = C.red; ctx.lineWidth = 7; rrect(-190, -70, 380, 140, 14); ctx.stroke();
        ctx.lineWidth = 2.5; rrect(-178, -58, 356, 116, 10); ctx.stroke();
        text('VERIFIED', 0, 20, { fam: 'mono', size: 64, weight: 600, color: C.red, align: 'center', track: 6 });
        text('AMEX FIELD WAREHOUSING', 0, 50, { fam: 'mono', size: 16, weight: 500, color: C.red, align: 'center', track: 3 });
      }));
    }
  });
  // ink burst on impact
  if (t > stampT) withAlpha((1 - P(t, stampT, .5)) * .25, () => { ctx.fillStyle = C.red; ctx.fillRect(0, 0, W, H); });
};

// Shared price chart. Monthly index from Sep 1963 (0). Illustrative, approximate.
const PRICE = (() => {
  const key = [[0, 61], [1, 64], [1.8, 62.5], [2.55, 60.5], [2.7, 55], [2.85, 50], [3.1, 47], [3.5, 44], [4, 41], [4.5, 38], [5, 36.2], [5.5, 35.4], [6, 35],
    [7, 37], [8, 39], [10, 41.5], [12, 44], [14, 47], [16, 50.5], [18, 53], [20, 55], [22, 58], [24, 61], [27, 64], [30, 67], [33, 69], [36, 70.5], [40, 71]];
  const out = []; const r = rng(21);
  for (let m = 0; m <= 40; m += .125) {
    let i = key.findIndex(k => k[0] > m); if (i < 0) i = key.length - 1;
    const a = key[Math.max(0, i - 1)], b = key[i];
    const f = b[0] === a[0] ? 0 : (m - a[0]) / (b[0] - a[0]);
    const noise = (r() - .5) * (m < 2.6 ? 1.6 : m < 6 ? 1.4 : 1.1) + (m > 6 ? Math.sin(m * 1.3) * 1.2 : 0);
    out.push([m, lerp(a[1], b[1], f) + noise]);
  }
  out[out.length - 1][1] = 71; return out;
})();
function drawChart(t, o) {
  const X0 = 130, X1 = 960, Y0 = 470, Y1 = 1170;
  const mx = m => lerp(X0, X1, (m - o.m0) / (o.m1 - o.m0));
  const py = p => lerp(Y1, Y0, (p - 20) / (80 - 20));
  // grid
  for (let p = 20; p <= 80; p += 10) {
    line2(X0, py(p), X1, py(p), C.rule, 1.5, .8);
    text('$' + p, X0 - 18, py(p) + 8, { fam: 'mono', size: 22, color: C.dim, align: 'right' });
  }
  const months = ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];
  for (let m = Math.ceil(o.m0); m <= o.m1; m++) {
    const step = o.m1 - o.m0 > 12 ? 12 : 1;
    if ((m - (step === 12 ? 4 : 0)) % step) continue;
    const lab = step === 12 ? String(1964 + (m - 4) / 12) : (months[m] || '') + (m === 0 || m === 4 ? ' ’' + (m < 4 ? '63' : '64') : '');
    line2(mx(m), Y1, mx(m), Y1 + 12, C.dim, 2);
    text(lab, mx(m), Y1 + 46, { fam: 'mono', size: 22, color: C.dim, align: 'center' });
  }
  // line, red to the low, gold after
  const pts = PRICE.filter(p => p[0] <= o.reveal).map(p => [mx(p[0]), py(p[1])]);
  const split = PRICE.findIndex(p => p[0] >= 6);
  const a = pts.slice(0, Math.min(pts.length, split + 1)), b = pts.slice(Math.min(pts.length, split));
  ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0 - 60, X1 - X0 + 40, Y1 - Y0 + 60); ctx.clip();
  // area under curve
  if (a.length > 1) {
    const g = ctx.createLinearGradient(0, Y0, 0, Y1); g.addColorStop(0, 'rgba(200,69,47,.22)'); g.addColorStop(1, 'rgba(200,69,47,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(a[0][0], Y1); a.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(a[a.length - 1][0], Y1); ctx.fill();
  }
  if (b.length > 1) {
    const g = ctx.createLinearGradient(0, Y0, 0, Y1); g.addColorStop(0, 'rgba(217,164,65,.25)'); g.addColorStop(1, 'rgba(217,164,65,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b[0][0], Y1); b.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(b[b.length - 1][0], Y1); ctx.fill();
  }
  strokePath(a, 1, C.red, 5, { glow: 14 });
  if (b.length > 1) strokePath(b, 1, C.gold, 5, { glow: 14 });
  ctx.restore();
  const head = pts[pts.length - 1];
  if (head) {
    const price = PRICE.filter(p => p[0] <= o.reveal).pop()[1];
    ctx.fillStyle = o.reveal > 6.2 ? C.gold2 : C.red; ctx.beginPath(); ctx.arc(head[0], head[1], 9, 0, 7); ctx.fill();
    withAlpha(.35 + .3 * Math.sin(t * 8), () => { ctx.beginPath(); ctx.arc(head[0], head[1], 20, 0, 7); ctx.fill(); });
  }
  return { mx, py, X0, X1, Y0, Y1, head };
}
function chartHeader(t, k) {
  withAlpha(eOut(k), () => {
    tag('AMERICAN EXPRESS · SHARE PRICE', 130, 300, C.gold, 1);
    text('Approximate, illustrative', 130, 350, { fam: 'serif', size: 30, italic: true, color: C.dim });
  });
}

// 01 · CRASH — "When the fraud surfaced, the stock nearly halved."
SC.crash = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const surf = wt('L04', 'surfaced');
  const reveal = lt < .1 ? 0 : lerp(0, 2.55, eOut(P(lt, 0, surf - s.start))) + 3.5 * eIO(P(t, surf, wt('L04', 'nearly') - surf + .3));
  const shake = t > surf + .1 && t < surf + .9 ? (rng(Math.floor(t * 60))() - .5) * 10 : 0;
  at(shake, 0, 1, 0, () => {
    chartHeader(t, P(lt, 0, .4));
    const g = drawChart(t, { m0: 0, m1: 7, reveal: Math.max(.2, reveal) });
    // news marker
    withAlpha(eOut(P(t, surf - .1, .3)), () => {
      const x = g.mx(2.6);
      ctx.setLineDash([6, 8]); line2(x, g.Y0 - 20, x, g.Y1, C.paper, 2, .5); ctx.setLineDash([]);
      text('NOV 19 · FRAUD REVEALED', x + 14, g.Y0 - 2, { fam: 'mono', size: 20, weight: 500, color: C.paper, track: 2 });
    });
    // drawdown bracket
    const bk = eOut(P(t, wt('L04', 'nearly') - .1, .45));
    withAlpha(bk, () => {
      const x = g.X1 + 10, y0 = g.py(62), y1 = g.py(35);
      line2(x, y0, x, lerp(y0, y1, bk), C.red, 4);
      line2(x - 14, y0, x + 6, y0, C.red, 4); if (bk > .95) line2(x - 14, y1, x + 6, y1, C.red, 4);
      at(730, 640, lerp(1.4, 1, bk), 0, () => {
        text('≈ −45%', 0, 0, { fam: 'serif', size: 120, weight: 900, color: C.red, align: 'center' });
        text('~$62 → ~$35', 0, 52, { fam: 'mono', size: 30, weight: 500, color: C.paper, align: 'center', track: 2 });
      });
    });
  });
  withAlpha((t > surf ? (1 - P(t, surf + .1, .8)) : 0) * .18, () => { ctx.fillStyle = C.red; ctx.fillRect(0, 0, W, H); });
};

// 02 · QUESTION — headlines blur away; balance sheet vs franchise.
const HEADS = [['SALAD OIL SWINDLE', -150, 480, -.06, 64], ['AMEX SHARES PLUNGE', 140, 640, .04, 58], ['MILLIONS MISSING', -120, 830, -.03, 70],
  ['BANKS EXPOSED', 200, 1010, .05, 54], ['WALL ST. JITTERS', -180, 1170, -.04, 60], ['SELL', 300, 360, .08, 90]];
SC.question = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const sharp = wt('L05', 'sharper');
  const L6 = ls('L06');
  // Act 1: headline scraps crowd in; then defocus as he "asks a sharper question"
  const blurK = P(t, sharp - .3, .8);
  if (t < L6 + .3) {
    withAlpha(1 - P(t, L6 - .2, .4), () => {
      HEADS.forEach(([h, dx, y, r, sz], i) => {
        const k = eBack(P(lt, .1 + i * .22, .45));
        ctx.save(); ctx.filter = `blur(${blurK * 14}px)`;
        at(W / 2 + dx * (1 + blurK * .4), y, k, r, () => withAlpha(clamp(k) * (1 - blurK * .6), () => {
          const w = measure(h, { fam: 'serif', size: sz, weight: 900 }) + 60;
          ctx.fillStyle = i % 2 ? C.paper2 : C.paper; ctx.fillRect(-w / 2, -sz * .95, w, sz * 1.35);
          text(h, 0, 0, { fam: 'serif', size: sz, weight: 900, color: C.ink, align: 'center' });
        }));
        ctx.restore();
      });
      const qk = eOut(P(t, sharp, .6));
      withAlpha(qk, () => at(W / 2, 960, lerp(.6, 1, qk), 0, () =>
        text('?', 0, 160, { fam: 'serif', size: 520, weight: 400, italic: true, color: C.gold, align: 'center', shadow: 40 })));
      tag('NOT: HOW BAD IS THE NEWS?', W / 2 - 250, 1310, C.dim, P(lt, .8, .5), 26);
    });
  }
  // Act 2: two panels
  if (t > L6 - .3) {
    const k = eOut(P(t, L6 - .25, .55));
    const bs = wt('L06', 'balance'), fr = wt('L06', 'franchise');
    const lOn = eOut(P(t, bs, .4)), rOn = eOut(P(t, fr - .05, .4));
    const panel = (x, on, title, sub, draw) => {
      at(x, 820 + (1 - k) * 80, 1, 0, () => withAlpha(k, () => {
        ctx.fillStyle = `rgba(239,230,210,${.03 + on * .05})`; rrect(-200, -380, 400, 760, 18); ctx.fill();
        ctx.strokeStyle = on > .5 ? C.gold : C.rule; ctx.lineWidth = 2 + on * 2; rrect(-200, -380, 400, 760, 18); ctx.stroke();
        text(title, 0, -300, { fam: 'mono', size: 26, weight: 600, color: on > .5 ? C.gold : C.dim, align: 'center', track: 4 });
        draw(on);
        text(sub, 0, 330, { fam: 'serif', size: 34, italic: true, color: C.paper, align: 'center', alpha: .4 + .6 * on });
      }));
    };
    panel(290, lOn, 'BALANCE SHEET', 'a one-time hit?', on => {
      const rows = [['Cash', '■■■■■■■'], ['Investments', '■■■■■'], ['Claims', '−■■■■■■']];
      rows.forEach(([a, b], i) => {
        const y = -170 + i * 90;
        text(a, -170, y, { fam: 'mono', size: 24, color: C.paper });
        text(b, 170, y, { fam: 'mono', size: 22, color: i === 2 ? C.red : C.dim, align: 'right' });
        line2(-170, y + 26, 170, y + 26, C.rule, 1.5);
      });
      // dent
      withAlpha(on, () => {
        ctx.strokeStyle = C.red; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-170, 140); ctx.lineTo(-60, 140); ctx.lineTo(-20, 200); ctx.lineTo(20, 140); ctx.lineTo(170, 140); ctx.stroke();
        text('finite', 0, 250, { fam: 'mono', size: 22, color: C.red, align: 'center', track: 3 });
      });
    });
    panel(790, rOn, 'FRANCHISE', 'lasting damage?', on => {
      // a 1960s charge card glyph
      at(0, -40, 1, -.08 * on, () => {
        const g = ctx.createLinearGradient(-160, -100, 160, 100); g.addColorStop(0, '#6a8f7f'); g.addColorStop(1, '#3d5a50');
        ctx.fillStyle = g; rrect(-160, -100, 320, 200, 16); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2; rrect(-150, -90, 300, 180, 12); ctx.stroke();
        text('CHARGE CARD', -130, -50, { fam: 'mono', size: 18, weight: 600, color: 'rgba(255,255,255,.75)', track: 3 });
        text('0000 000000 00000', -130, 30, { fam: 'mono', size: 22, color: 'rgba(255,255,255,.85)', track: 2 });
        text('CARDMEMBER', -130, 70, { fam: 'mono', size: 16, color: 'rgba(255,255,255,.6)', track: 3 });
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(110, -50, 18, 0, 7); ctx.fill();
      });
      ['TRUST', 'HABIT', 'NETWORK'].forEach((w, i) => withAlpha(P(t, fr + .2 + i * .15, .3), () =>
        text(w, 0, 140 + i * 40, { fam: 'mono', size: 22, weight: 500, color: C.teal, align: 'center', track: 6 })));
    });
    withAlpha(k, () => text('or', W / 2, 840, { fam: 'serif', size: 64, italic: true, color: C.gold, align: 'center' }));
  }
};

// 03 · FIELD — map pin on Omaha, then the field notebook fills in.
SC.field = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const desk = wt('L07', 'desk');
  // pin drop
  const pk = eOut(P(t, desk - .3, .5));
  withAlpha(1 - P(t, wt('L07', 'register') - .4, .4), () => {
    // stylised US outline grid of dots
    const r = rng(3);
    for (let i = 0; i < 520; i++) {
      const x = 120 + (i % 26) * 33, y = 520 + Math.floor(i / 26) * 30;
      const inside = Math.hypot((x - 540) / 470, (y - 820) / 300) < 1 && !(x > 860 && y < 640) && !(x < 260 && y > 980);
      if (inside) withAlpha(.18 + r() * .1, () => { ctx.fillStyle = C.paper; ctx.fillRect(x, y, 4, 4); });
    }
    const px = 610, py = 760;
    for (let i = 0; i < 3; i++) { const k = P(t, desk + i * .25, 1.2); if (k > 0 && k < 1) withAlpha(1 - k, () => { ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 10 + k * 120, 0, 7); ctx.stroke(); }); }
    at(px, lerp(560, py, pk), 1, 0, () => withAlpha(pk, () => {
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, -46, 26, Math.PI, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, -46, 10, 0, 7); ctx.fill();
    }));
    withAlpha(pk, () => {
      text('OMAHA, NE', 650, 740, { fam: 'mono', size: 30, weight: 600, color: C.paper, track: 4 });
      text('41.26° N  95.94° W', 650, 776, { fam: 'mono', size: 20, color: C.dim, track: 2 });
    });
    tag('LEAVE THE SPREADSHEET', 120, 1200, C.gold, P(t, desk, .5));
  });
  // notebook
  const nk = eOut(P(t, wt('L07', 'register') - .35, .6));
  if (nk > 0) at(W / 2, 880 + (1 - nk) * 900, 1, .02 * (1 - nk) - .015, () => {
    const w = 860, h = 1000;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
    ctx.fillStyle = C.paper; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); ctx.drawImage(paperTex, 100, 200, w, h, -w / 2, -h / 2, w, h); ctx.restore();
    for (let y = -h / 2 + 150; y < h / 2 - 20; y += 56) line2(-w / 2, y, w / 2, y, 'rgba(46,90,107,.22)', 1.5);
    line2(-w / 2 + 96, -h / 2, -w / 2 + 96, h / 2, 'rgba(200,69,47,.5)', 2);
    for (let i = 0; i < 9; i++) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-w / 2 + 44, -h / 2 + 80 + i * 108, 11, 0, 7); ctx.fill(); }
    const ink = '#1f2a30', L = -w / 2 + 126;
    text('Field notes — Omaha, 1964', L, -h / 2 + 108, { fam: 'serif', size: 44, italic: true, weight: 600, color: ink });
    // entries
    const e1 = wt('L07', 'register'), e2 = wt('L07', 'banks'), c1 = wt('L08', 'paid'), c2 = wt('L08', 'travelers');
    const entry = (y, k, title, sub) => withAlpha(eOut(k), () => {
      text(title, L, y, { fam: 'serif', size: 36, weight: 600, color: ink });
      text(sub, L, y + 44, { fam: 'mono', size: 22, color: '#5d5a4f', track: 1 });
    });
    entry(-h / 2 + 220, P(t, e1, .4), 'Ross’s Steak House — the register', 'Q: are diners still paying with the card?');
    // tally marks
    const tallyN = Math.floor(clamp((t - e1 - .4) / 2.6) * 18);
    for (let i = 0; i < tallyN; i++) {
      const grp = Math.floor(i / 5), j = i % 5, x0 = L + grp * 120;
      const y0 = -h / 2 + 300;
      if (j < 4) line2(x0 + j * 20, y0, x0 + j * 20 + 4, y0 + 62, ink, 4);
      else line2(x0 - 12, y0 + 44, x0 + 76, y0 + 14, ink, 4);
    }
    entry(-h / 2 + 470, P(t, e2, .4), 'Banks & travel agents', 'Q: are travelers cheques still selling?');
    entry(-h / 2 + 640, P(t, c1 - .2, .4), 'Verdict', '');
    const box = (y, k, label, kk) => withAlpha(eOut(P(k, 0, .3)), () => {
      ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.strokeRect(L, y - 34, 40, 40);
      checkmark(L + 20, y - 14, 44, kk, C.red);
      text(label, L + 66, y, { fam: 'serif', size: 34, color: ink });
    });
    box(-h / 2 + 740, P(t, c1 - .3, 1), 'Still paying with the card', P(t, c1 + .3, .35));
    box(-h / 2 + 812, P(t, c2 - .4, 1), 'Still buying travelers cheques', P(t, c2 + .3, .35));
    // circled conclusion
    const ck = P(t, le('L08') - .5, .7);
    withAlpha(ck > 0 ? 1 : 0, () => {
      text('Trust: intact.', L + 380, -h / 2 + 930, { fam: 'serif', size: 40, italic: true, weight: 800, color: C.red, alpha: eOut(ck) });
      const pts = []; for (let i = 0; i <= 50; i++) { const a = -Math.PI * .1 + i / 50 * Math.PI * 2.1; pts.push([L + 510 + Math.cos(a) * 160, -h / 2 + 918 + Math.sin(a) * 46]); }
      strokePath(pts, ck, C.red, 3);
    });
  });
  withAlpha(eOut(P(t, ls('L08') - .2, .5)), () => {
    ctx.fillStyle = 'rgba(14,15,13,.85)'; rrect(150, 236, 780, 96, 48); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; rrect(150, 236, 780, 96, 48); ctx.stroke();
    text('METHOD: SCUTTLEBUTT', W / 2, 282, { fam: 'mono', size: 28, weight: 600, color: C.gold, align: 'center', track: 4 });
    text('Philip Fisher, Common Stocks and Uncommon Profits, 1958', W / 2, 314, { fam: 'serif', size: 20, italic: true, color: C.paper, align: 'center' });
  });
};

// 04 · SCALE — bounded loss vs compounding trust.
SC.scale = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const fin = wt('L09', 'finite'), cmp = wt('L09', 'compounding'), intact = wt('L09', 'intact');
  tag('WEIGHING THE UNCERTAINTY', 120, 320, C.gold, P(lt, 0, .5));
  const grow = eIO(P(t, intact - .3, (cmp - intact) + 1.0));
  const tilt = lerp(-.12, .16, grow) * eOut(P(lt, .1, .6));      // + tips right side down
  const cx = W / 2, cy = 640, arm = 340;
  // post
  ctx.fillStyle = '#2a2820'; ctx.fillRect(cx - 10, cy, 20, 600);
  ctx.fillStyle = '#3a382f'; rrect(cx - 140, cy + 590, 280, 30, 8); ctx.fill();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(cx, cy - 30); ctx.lineTo(cx - 26, cy + 14); ctx.lineTo(cx + 26, cy + 14); ctx.fill();
  // beam
  at(cx, cy, 1, tilt, () => { ctx.fillStyle = C.paper2; rrect(-arm - 20, -8, arm * 2 + 40, 16, 8); ctx.fill(); });
  const ends = [-1, 1].map(d => [cx + Math.cos(tilt) * arm * d, cy + Math.sin(tilt) * arm * d]);
  ends.forEach(([x, y], i) => {
    const panY = y + 300;
    line2(x, y, x - 110, panY, C.dim, 2); line2(x, y, x + 110, panY, C.dim, 2);
    ctx.strokeStyle = C.paper2; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 140, panY); ctx.quadraticCurveTo(x, panY + 60, x + 140, panY); ctx.stroke();
    if (i === 0) {
      // CLAIMS: one heavy block with a ceiling
      const k = eOut(P(lt, .2, .5));
      withAlpha(k, () => {
        ctx.fillStyle = C.red; ctx.fillRect(x - 90, panY - 150, 180, 150);
        text('CLAIMS', x, panY - 64, { fam: 'mono', size: 30, weight: 600, color: C.paper, align: 'center', track: 4 });
      });
      const ck = eOut(P(t, fin - .1, .4));
      withAlpha(ck, () => {
        line2(x - 130, panY - 180, lerp(x - 130, x + 130, ck), panY - 180, C.paper, 4);
        text('CAPPED', x, panY - 200, { fam: 'mono', size: 22, weight: 600, color: C.paper, align: 'center', track: 6 });
        text('large, but finite', x, panY + 120, { fam: 'serif', size: 36, italic: true, color: C.paper, align: 'center' });
      });
    } else {
      // TRUST: coins stacking geometrically
      const n = Math.floor(1 + grow * 13);
      for (let c = 0; c < n; c++) {
        const cy2 = panY - 18 - c * 22, wob = Math.sin(c * 1.7) * 6;
        ctx.fillStyle = c % 2 ? C.gold : C.gold2; ctx.beginPath(); ctx.ellipse(x + wob, cy2, 80, 16, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = C.oil; ctx.lineWidth = 2; ctx.stroke();
      }
      text('TRUST', x, panY - 40 - n * 22, { fam: 'mono', size: 30, weight: 600, color: C.gold2, align: 'center', track: 4 });
      withAlpha(eOut(P(t, intact, .4)), () =>
        text('intact, compounding', x, panY + 120, { fam: 'serif', size: 36, italic: true, color: C.paper, align: 'center' }));
    }
  });
  // mini curves: flat vs exponential
  withAlpha(eOut(P(t, cmp - .2, .5)), () => {
    const y0 = 1340; line2(150, y0, 450, y0, C.rule, 2); line2(630, y0, 930, y0, C.rule, 2);
    strokePath([[150, y0 - 60], [450, y0 - 60]], P(t, cmp - .1, .5), C.red, 4);
    const ex = []; for (let i = 0; i <= 30; i++) { const u = i / 30; ex.push([630 + u * 300, y0 - 10 - (Math.exp(u * 3) - 1) / (Math.exp(3) - 1) * 150]); }
    strokePath(ex, P(t, cmp - .1, .8), C.gold, 4);
  });
};

// 04 · SIZING — ring to 40% of the partnership.
SC.sizing = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const pct = wt('L10', '40'), part = wt('L10', 'partnership');
  tag('POSITION SIZE', 120, 320, C.gold, P(lt, 0, .5));
  const fill = eIO(P(t, ls('L10') + .2, pct - ls('L10') + .3)) * .40;
  const cx = W / 2, cy = 830, R = 330;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(239,230,210,.08)'; ctx.lineWidth = 64; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  for (let i = 0; i < 100; i++) { const a = -Math.PI / 2 + i / 100 * Math.PI * 2; line2(cx + Math.cos(a) * (R + 48), cy + Math.sin(a) * (R + 48), cx + Math.cos(a) * (R + (i % 10 ? 58 : 72)), cy + Math.sin(a) * (R + (i % 10 ? 58 : 72)), C.dim, 2, .6); }
  ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 64; ctx.shadowColor = C.gold; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + fill * Math.PI * 2); ctx.stroke(); ctx.restore();
  const v = Math.round(fill * 100);
  text(v + '%', cx, cy + 70, { fam: 'serif', size: 230, weight: 900, color: C.paper, align: 'center' });
  withAlpha(eOut(P(t, part - .2, .4)), () => {
    text('of the partnership', cx, cy + 140, { fam: 'serif', size: 44, italic: true, color: C.gold, align: 'center' });
  });
  // build-up timeline 1964 → 1966
  const y = 1280, k = P(t, ls('L10'), pct - ls('L10') + .2);
  line2(180, y, 900, y, C.rule, 3); line2(180, y, lerp(180, 900, eIO(k)), y, C.gold, 5);
  [['1964', 180], ['1965', 540], ['1966', 900]].forEach(([l, x]) => {
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill();
    text(l, x, y + 50, { fam: 'mono', size: 24, color: C.dim, align: 'center' });
  });
  withAlpha(eOut(P(t, part + .3, .5)), () =>
    text('Size grows when downside is bounded.', cx, 1390, { fam: 'serif', size: 34, italic: true, color: C.paper, align: 'center', alpha: .85 }));
};

// 05 · RESULT — the same chart, zoomed out, recovering to ~2× the low.
SC.result = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const zoom = eIO(P(lt, 0, 1.0));
  const reveal = lerp(6, 40, eIO(P(t, ls('L11') + .2, wt('L11', 'doubled') - ls('L11') + .3)));
  chartHeader(t, 1);
  const g = drawChart(t, { m0: 0, m1: lerp(7, 40.5, zoom), reveal });
  withAlpha(eOut(P(lt, .3, .4)), () => {
    const x = g.mx(6), y = g.py(35);
    line2(x, y + 20, x, y + 70, C.red, 2);
    text('LOW ≈ $35', x, y + 100, { fam: 'mono', size: 22, weight: 600, color: C.red, align: 'center' });
  });
  const bk = eBack(P(t, wt('L11', 'doubled'), .5));
  withAlpha(clamp(bk), () => at(340, 560, clamp(bk, 0, 1.2), 0, () => {
    ctx.fillStyle = C.gold; rrect(-130, -100, 260, 150, 20); ctx.fill();
    text('≈ 2×', 0, 20, { fam: 'serif', size: 110, weight: 900, color: C.ink, align: 'center' });
    text('FROM THE LOW, ~3 YRS', 0, 100, { fam: 'mono', size: 22, weight: 600, color: C.gold, align: 'center', track: 3 });
  }));
};

// 05 · GRID — outcome vs process (after Russo & Schoemaker).
SC.grid = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const dont = wt('L12', 'outcome'), meth = wt('L12', 'method'), flat = wt('L12', 'flatter');
  // the 2× badge being struck out
  withAlpha(1 - P(t, wt('L12', 'Learn') - .1, .3), () => {
    at(W / 2, 760, 1, 0, () => {
      ctx.fillStyle = C.gold; rrect(-200, -140, 400, 210, 24); ctx.fill();
      text('≈ 2×', 0, 30, { fam: 'serif', size: 160, weight: 900, color: C.ink, align: 'center' });
    });
    const k = eOut(P(t, dont - .1, .3));
    line2(W / 2 - 240, 860, lerp(W / 2 - 240, W / 2 + 240, k), lerp(860, 600, k), C.red, 14);
    withAlpha(k, () => text('the outcome', W / 2, 960, { fam: 'serif', size: 46, italic: true, color: C.red, align: 'center' }));
  });
  const gk = eOut(P(t, wt('L12', 'Learn') - .05, .5));
  if (gk <= 0) return;
  const X = 210, Y = 470, S = 360;
  withAlpha(gk, () => {
    tag('PROCESS × OUTCOME', 120, 330, C.gold, 1);
    text('after Russo & Schoemaker', 120, 376, { fam: 'serif', size: 26, italic: true, color: C.dim });
    const cells = [
      [0, 0, 'Deserved', 'success', C.teal], [1, 0, 'Bad', 'break', C.dim],
      [0, 1, 'Dumb', 'luck', C.red], [1, 1, 'Poetic', 'justice', C.dim]];
    const methK = eOut(P(t, meth - .1, .4)), flatK = eOut(P(t, flat - .1, .4));
    cells.forEach(([c, r, a, b, col], i) => {
      const x = X + 80 + c * S, y = Y + 60 + r * S, ck = eOut(P(t, wt('L12', 'Learn') + i * .08, .4));
      const hiRow = r === 0 ? methK : 0, hiFlat = (c === 0 && r === 1) ? flatK : 0;
      at(x + S / 2, y + S / 2, lerp(.8, 1, ck), 0, () => withAlpha(ck, () => {
        ctx.fillStyle = hiFlat ? `rgba(200,69,47,${.12 + .2 * hiFlat})` : `rgba(239,230,210,${.04 + hiRow * .06})`;
        rrect(-S / 2 + 8, -S / 2 + 8, S - 16, S - 16, 14); ctx.fill();
        ctx.strokeStyle = hiFlat > .5 ? C.red : hiRow > .5 ? C.gold : C.rule; ctx.lineWidth = 2 + 2 * Math.max(hiRow, hiFlat);
        rrect(-S / 2 + 8, -S / 2 + 8, S - 16, S - 16, 14); ctx.stroke();
        text(a, 0, -6, { fam: 'serif', size: 52, weight: 800, color: col === C.dim ? C.paper : col, align: 'center' });
        text(b, 0, 52, { fam: 'serif', size: 52, italic: true, color: col === C.dim ? C.paper : col, align: 'center' });
      }));
    });
    // axes
    text('GOOD OUTCOME', X + 80 + S / 2, Y + 30, { fam: 'mono', size: 20, weight: 600, color: C.dim, align: 'center', track: 3 });
    text('BAD OUTCOME', X + 80 + S * 1.5, Y + 30, { fam: 'mono', size: 20, weight: 600, color: C.dim, align: 'center', track: 3 });
    at(X + 40, Y + 60 + S / 2, 1, -Math.PI / 2, () => text('GOOD PROCESS', 0, 0, { fam: 'mono', size: 20, weight: 600, color: methKcol(t, meth), align: 'center', track: 3 }));
    at(X + 40, Y + 60 + S * 1.5, 1, -Math.PI / 2, () => text('BAD PROCESS', 0, 0, { fam: 'mono', size: 20, weight: 600, color: C.dim, align: 'center', track: 3 }));
  });
};
const methKcol = (t, m) => t > m ? C.gold : C.dim;

// 06 · RULE — paper inversion, the line to remember.
SC.rule = (t, s) => {
  const lt = t - s.start;
  ctx.drawImage(paperTex, 0, 0);
  const ink = C.ink;
  const L = 110;
  const a1 = ls('L13'), p1 = wt('L13', 'price'), f1 = wt('L13', 'fact'), a2 = wt('L13', 'A', 1), v2 = wt('L13', 'value'), h2 = wt('L13', 'hypothesis'), g3 = wt('L13', 'Go');
  const rise = (k) => (1 - eOut(k)) * 30;
  const k1 = P(t, a1 - .15, .4), k2 = P(t, f1 - .1, .35), k3 = P(t, a2 - .1, .4), k4 = P(t, h2 - .15, .35), k5 = P(t, g3 - .1, .35);
  withAlpha(eOut(k1), () => {
    text('A falling', L, 470 + rise(k1), { fam: 'serif', size: 96, weight: 400, color: ink });
    text('price', L + measure('A falling ', { fam: 'serif', size: 96 }), 470 + rise(k1), { fam: 'serif', size: 96, weight: 900, color: C.red });
  });
  // arrow beside "price"
  withAlpha(eOut(P(t, p1, .3)), () => {
    const x = L + measure('A falling price ', { fam: 'serif', size: 96 }) + 10, y0 = 390, y1 = 390 + 100 * eOut(P(t, p1, .4));
    line2(x, y0, x, y1, C.red, 8); if (y1 > 440) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(x - 20, y1 - 10); ctx.lineTo(x + 20, y1 - 10); ctx.lineTo(x, y1 + 18); ctx.fill(); }
  });
  withAlpha(eOut(k2), () => text('is a fact.', L, 590 + rise(k2), { fam: 'serif', size: 96, weight: 800, color: ink }));
  line2(L, 680, lerp(L, W - L, eIO(P(t, f1 + .2, .5))), 680, 'rgba(14,15,13,.25)', 2);
  withAlpha(eOut(k3), () => {
    text('A falling', L, 820 + rise(k3), { fam: 'serif', size: 96, weight: 400, color: ink });
    text('value', L + measure('A falling ', { fam: 'serif', size: 96 }), 820 + rise(k3), { fam: 'serif', size: 96, weight: 900, color: C.oil });
  });
  withAlpha(eOut(k4), () => {
    text('is only a', L, 940 + rise(k4), { fam: 'serif', size: 96, weight: 400, color: ink });
    text('hypothesis.', L, 1060 + rise(k4), { fam: 'serif', size: 110, weight: 800, italic: true, color: ink });
  });
  // "Go test it." — stamp-like, underline drawn
  withAlpha(eOut(k5), () => {
    at(L, 1250, lerp(1.25, 1, eOut(k5)), 0, () => {
      ctx.fillStyle = ink; rrect(-10, -100, 560, 140, 10); ctx.fill();
      text('Go test it.', 20, 6, { fam: 'serif', size: 104, weight: 900, color: C.paper });
    });
    strokePath([[L - 10, 1320], [L + 550, 1314]], P(t, g3 + .2, .4), C.oil, 8);
  });
  text('THE RULE', L, 300, { fam: 'mono', size: 24, weight: 600, color: C.oil, track: 6, alpha: eOut(P(lt, 0, .5)) });
};

// End card
SC.endcard = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const k = eOut(P(lt, 0, .45));
  withAlpha(k, () => {
    tag('A CASE STUDY IN DECISIONS UNDER UNCERTAINTY', W / 2 - 360, 600, C.gold, 1, 22);
    text('THE', W / 2, 760, { fam: 'serif', size: 70, weight: 400, italic: true, color: C.gold, align: 'center' });
    text('SALAD OIL', W / 2, 900, { fam: 'serif', size: 150, weight: 900, color: C.paper, align: 'center', track: 2 });
    text('TEST', W / 2, 1040, { fam: 'serif', size: 150, weight: 900, color: C.paper, align: 'center', track: 14 });
  });
  line2(W / 2 - 200, 1110, lerp(W / 2 - 200, W / 2 + 200, eIO(P(lt, .2, .5))), 1110, C.gold, 4);
  withAlpha(eOut(P(lt, .3, .4)), () => {
    text('Buffett × American Express, 1963–66', W / 2, 1180, { fam: 'serif', size: 36, italic: true, color: C.paper, align: 'center' });
    text('Figures approximate · sources in description', W / 2, 1560, { fam: 'mono', size: 22, color: C.dim, align: 'center', track: 2 });
    text('Educational content — not investment advice.', W / 2, 1600, { fam: 'mono', size: 22, color: C.dim, align: 'center', track: 2 });
  });
};
