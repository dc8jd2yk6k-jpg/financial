// The Ten-Year Bet — scenes. Loaded by web/index.html?film=ten-year-bet.
// Gold is Buffett's index fund; steel blue is the hedge funds; red is fees and losses.
'use strict';
FILM.paperScenes = ['rule'];
const IX = C.gold, HF = '#7FA6B3', HF2 = '#A9C6CF';

// ── data ────────────────────────────────────────────────────────────────────
// S&P 500 total return by calendar year, 2008–2017, scaled so ten years
// compound to the index fund's reported +125.8% (Buffett, 2017 letter).
const IDX_R = [-.370, .265, .151, .021, .160, .324, .137, .014, .120, .218];
// Five funds of funds: ten-year endpoints from the 2017 letter. Each one lost
// less than the index in 2008; the yearly paths in between are illustrative.
const FOF = [
  { name: 'C', final: 1.877, y08: -.21 }, { name: 'B', final: 1.423, y08: -.22 },
  { name: 'E', final: 1.270, y08: -.30 }, { name: 'A', final: 1.217, y08: -.17 },
  { name: 'D', final: 1.028, y08: -.29 }];
function monthly(yearLogs, sigma, seed, shape08) {
  // Monthly path that hits each year-end exactly (a noise bridge inside each year).
  const r = rng(seed), out = [[0, 1]]; let v = 0;
  yearLogs.forEach((lg, y) => {
    let n = Array.from({ length: 12 }, () => (r() + r() + r() - 1.5) * sigma);
    if (y === 0 && shape08) n = n.map((x, i) => x + shape08[i]);
    const mean = n.reduce((a, b) => a + b, 0) / 12;
    n = n.map(x => x - mean + lg / 12);
    n.forEach((d, m) => { v += d; out.push([y + (m + 1) / 12, Math.exp(v)]); });
  });
  return out;
}
const CRASH08 = [.02, .01, .01, .015, .012, -.02, -.005, .005, -.03, -.075, -.03, .01];
const IDX_PATH = (() => {
  let logs = IDX_R.map(r => Math.log(1 + r));
  // rescale 2009–2017 only, keeping 2008 at exactly -37%
  const rest = logs.slice(1).reduce((a, b) => a + b, 0), need = Math.log(2.258) - logs[0];
  logs = logs.map((l, i) => i === 0 ? l : l * need / rest);
  return monthly(logs, .045, 11, CRASH08);
})();
const FOF_PATHS = FOF.map((f, j) => {
  const r = rng(40 + j), l08 = Math.log(1 + f.y08), need = Math.log(f.final) - l08;
  const w = Array.from({ length: 9 }, () => .4 + r() * 1.2), sw = w.reduce((a, b) => a + b, 0);
  return monthly([l08, ...w.map(x => need * x / sw)], .02, 70 + j, CRASH08.map(x => x * .55));
});
const valAt = (path, yr) => {
  const i = Math.min(path.length - 1, Math.max(0, Math.round(yr * 12)));
  return path[i][1];
};

// Race chart: growth of $1, Jan 2008 → Dec 2017.
function raceChart(t, o) {
  const X0 = 150, X1 = 900, Y0 = 440, Y1 = 1170;
  const v0 = o.v0 ?? 0, v1 = o.v1 ?? 10, lo = .5, hi = 2.45;
  const mx = y => lerp(X0, X1, (y - v0) / (v1 - v0));
  const py = v => lerp(Y1, Y0, (v - lo) / (hi - lo));
  for (const v of [.5, 1, 1.5, 2]) {
    line2(X0, py(v), X1, py(v), v === 1 ? 'rgba(239,230,210,.32)' : C.rule, v === 1 ? 2 : 1.5);
    text('$' + v.toFixed(2), X0 - 16, py(v) + 8, { fam: 'mono', size: 21, color: C.dim, align: 'right' });
  }
  for (let y = Math.ceil(v0); y <= Math.floor(v1); y++) {
    const show = (v1 - v0) <= 3 || y % 2 === 0;
    if (!show || y > 10) continue;
    line2(mx(y), Y1, mx(y), Y1 + 10, C.dim, 2);
    text(String(2008 + y), mx(y), Y1 + 44, { fam: 'mono', size: 21, color: C.dim, align: 'center' });
  }
  text('GROWTH OF $1, AFTER FEES', X0, Y0 - 34, { fam: 'mono', size: 20, color: C.dim, track: 3 });
  ctx.save(); ctx.beginPath(); ctx.rect(X0 - 4, Y0 - 80, X1 - X0 + 30, Y1 - Y0 + 90); ctx.clip();
  const pts = path => path.filter(p => p[0] <= o.reveal + 1e-6 && p[0] >= v0 - .1).map(p => [mx(p[0]), py(p[1])]);
  const heads = [];
  FOF_PATHS.forEach((p, j) => {
    const a = (o.hfAlpha ?? 1) * (o.hfHi === undefined ? 1 : (o.hfHi === j ? 1 : .45));
    withAlpha(a, () => { const h = strokePath(pts(p), 1, j === o.hfHi ? HF2 : HF, 3.5); heads.push(h); });
  });
  const g = pts(IDX_PATH);
  if (g.length > 1) {
    const gr = ctx.createLinearGradient(0, Y0, 0, Y1); gr.addColorStop(0, 'rgba(217,164,65,.20)'); gr.addColorStop(1, 'rgba(217,164,65,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(g[0][0], py(1)); g.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(g[g.length - 1][0], py(1)); ctx.fill();
  }
  const ih = strokePath(g, 1, IX, 6, { glow: 16 });
  ctx.restore();
  if (ih) { ctx.fillStyle = C.gold2; ctx.beginPath(); ctx.arc(ih[0], ih[1], 9, 0, 7); ctx.fill(); }
  return { mx, py, X0, X1, Y0, Y1, ih, heads };
}
function legend(x, y, k) {
  withAlpha(eOut(k), () => {
    line2(x, y - 8, x + 40, y - 8, IX, 6); text('BUFFETT · S&P 500 INDEX FUND', x + 56, y, { fam: 'mono', size: 21, weight: 600, color: IX, track: 2 });
    line2(x, y + 32, x + 40, y + 32, HF, 4); text('SEIDES · FIVE FUNDS OF HEDGE FUNDS', x + 56, y + 40, { fam: 'mono', size: 21, weight: 600, color: HF, track: 2 });
  });
}

// ── 01 · HOOK — 2007, a million dollars, two contenders ─────────────────────
SC.hook = (t, s) => {
  bgInk(t);
  const mil = wt('L01', 'million'), laz = wt('L01', 'laziest'), sma = wt('L01', 'smartest');
  // 2007
  const yk = eOut(P(t, .3, .8)), yOut = eIO(P(t, mil - .4, .6));
  withAlpha(yk, () => {
    at(W / 2, lerp(700, 420, yOut), lerp(1.12, 1, yk) * lerp(1, .55, yOut), 0, () =>
      text('2007', 0, 0, { fam: 'serif', size: 300, weight: 900, color: C.paper, align: 'center', track: -4 }));
    withAlpha(1 - yOut, () => tag('A PUBLIC WAGER · REGISTERED ON LONGBETS.ORG', W / 2 - 380, 800, C.gold, P(t, .9, .5), 22));
  });
  // the million
  const mk = P(t, mil - .1, .5);
  if (mk > 0) {
    const val = Math.round(eExpo(mk) * 1e6);
    at(W / 2, 660, lerp(1.5, 1, eOut(mk)), 0, () => {
      text('$' + val.toLocaleString('en-US'), 0, 0, { fam: 'serif', size: 150, weight: 900, color: C.gold2, align: 'center', shadow: 40 });
    });
    // glints
    const r = rng(9);
    for (let i = 0; i < 9; i++) {
      const k = P(t, mil + .1 + r() * .6, .5), x = W / 2 + (r() - .5) * 760, y = 610 + (r() - .5) * 140;
      if (k > 0 && k < 1) withAlpha(Math.sin(Math.PI * k), () => { line2(x - 14, y, x + 14, y, C.gold2, 2); line2(x, y - 14, x, y + 14, C.gold2, 2); });
    }
  }
  // contenders
  const card = (x, k, top, bottom, col, icon) => withAlpha(eOut(k), () => at(x, 1060 + (1 - eOut(k)) * 60, 1, 0, () => {
    ctx.fillStyle = 'rgba(239,230,210,.04)'; rrect(-220, -150, 440, 300, 18); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 3; rrect(-220, -150, 440, 300, 18); ctx.stroke();
    icon();
    text(top, 0, 70, { fam: 'mono', size: 22, weight: 600, color: C.dim, align: 'center', track: 4 });
    text(bottom, 0, 118, { fam: 'serif', size: 40, weight: 800, color: col, align: 'center' });
  }));
  card(285, P(t, laz - .15, .4), 'THE LAZIEST', 'portfolio', IX, () => {
    // a deck chair: do-nothing investing
    ctx.strokeStyle = IX; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-70, 20); ctx.lineTo(-20, -60); ctx.lineTo(40, -60); ctx.moveTo(-30, -44); ctx.lineTo(60, 20); ctx.moveTo(-70, 20); ctx.lineTo(60, 20); ctx.stroke();
    text('z', 60, -70, { fam: 'serif', size: 34, italic: true, color: C.paper }); text('z', 84, -98, { fam: 'serif', size: 26, italic: true, color: C.paper });
  });
  card(795, P(t, sma - .15, .4), 'THE SMARTEST', 'money', HF, () => {
    // a stack of research: charts and screens
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = HF; ctx.lineWidth = 3; rrect(-80 + i * 22, -84 + i * 18, 120, 70, 6); ctx.stroke(); }
    strokePath([[-20, -10], [0, -30], [20, -18], [50, -44]], 1, HF2, 3);
  });
  withAlpha(eOut(P(t, sma - .1, .4)), () => text('vs', W / 2, 1080, { fam: 'serif', size: 64, italic: true, color: C.paper, align: 'center' }));
};

// ── 01 · TAPE — the tale of the tape ────────────────────────────────────────
SC.tape = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const own = wt('L02', 'Own'), pay = wt('L02', 'Pay'), ag = wt('L03', 'Against'), five = wt('L03', 'five'), hed = wt('L03', 'hedge');
  tag('THE TALE OF THE TAPE', 100, 300, C.gold, P(lt, 0, .5));
  const col = (x, k, head, sub, colr) => withAlpha(eOut(k), () => {
    text(head, x, 400, { fam: 'serif', size: 64, weight: 900, color: colr });
    text(sub, x, 446, { fam: 'serif', size: 30, italic: true, color: C.paper });
  });
  // left: Buffett
  col(100, P(lt, .1, .4), 'Buffett', 'S&P 500 index fund', IX);
  // 500 dots — own everything
  const dk = P(t, wt('L02', '500') - .2, own - wt('L02', '500') + .6);
  const n = Math.floor(eOut(dk) * 500);
  withAlpha(.9, () => {
    for (let i = 0; i < n; i++) {
      const x = 104 + (i % 20) * 20, y = 500 + Math.floor(i / 20) * 20;
      ctx.fillStyle = i % 37 === 0 ? C.gold2 : IX; ctx.fillRect(x, y, 13, 13);
    }
  });
  withAlpha(eOut(P(t, own, .4)), () => text('500 companies. All of them.', 100, 1040, { fam: 'mono', size: 22, color: C.paper }));
  // right: Seides
  col(580, P(t, ag - .1, .4), 'Seides', 'Protégé Partners', HF);
  for (let f = 0; f < 5; f++) {
    const k = eBack(P(t, five - .1 + f * .1, .4));
    const y = 500 + f * 108;
    withAlpha(clamp(k), () => at(580, y, 1, 0, () => {
      ctx.strokeStyle = HF; ctx.lineWidth = 3; rrect(0, 0, 400, 92, 10); ctx.stroke();
      text('FUND OF FUNDS ' + 'ABCDE'[f], 16, 30, { fam: 'mono', size: 18, weight: 600, color: HF, track: 2 });
      const hk = P(t, hed + f * .05, .6), r = rng(f + 3), m = Math.floor(hk * 22);
      const ga = ctx.globalAlpha;
      for (let i = 0; i < m; i++) { ctx.fillStyle = HF2; ctx.globalAlpha = ga * (.55 + r() * .4); ctx.fillRect(16 + i * 17, 48 + (i % 2) * 18, 12, 12); }
      ctx.globalAlpha = ga;
    }));
  }
  withAlpha(eOut(P(t, hed + .3, .4)), () => text('Hundreds of hedge funds inside.', 580, 1080, { fam: 'mono', size: 22, color: C.paper }));
  // fees row
  const fk = P(t, pay - .1, .4);
  withAlpha(eOut(fk), () => {
    line2(100, 1150, 980, 1150, C.rule, 2);
    text('FEES', 100, 1200, { fam: 'mono', size: 22, weight: 600, color: C.dim, track: 4 });
    ctx.fillStyle = IX; ctx.fillRect(100, 1222, 10, 26);
    text('almost nothing', 124, 1244, { fam: 'serif', size: 30, italic: true, color: IX });
  });
  withAlpha(eOut(P(t, hed + .5, .4)), () => {
    ctx.fillStyle = C.red; ctx.fillRect(580, 1222, 260, 26);
    text('fees on fees', 580, 1290, { fam: 'serif', size: 30, italic: true, color: C.red });
  });
};

// ── 01 · CLOCK — ten years, net of every fee ────────────────────────────────
SC.clock = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const cx = W / 2, cy = 780, R = 330;
  const yk = P(t, wt('L04', '2008') - .1, wt('L04', '2017.') - wt('L04', '2008') + .3);
  for (let y = 0; y < 10; y++) {
    const a0 = -Math.PI / 2 + y / 10 * Math.PI * 2 + .03, a1 = a0 + Math.PI * 2 / 10 - .06;
    const on = yk * 10 > y;
    ctx.strokeStyle = on ? IX : 'rgba(239,230,210,.08)'; ctx.lineWidth = 56; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
    const am = (a0 + a1) / 2;
    withAlpha(on ? 1 : .35, () => text(String(2008 + y), cx + Math.cos(am) * (R + 66), cy + Math.sin(am) * (R + 66) + 8, { fam: 'mono', size: 22, color: on ? C.paper : C.dim, align: 'center' }));
  }
  withAlpha(eOut(P(lt, 0, .5)), () => {
    text('10', cx, cy + 70, { fam: 'serif', size: 240, weight: 900, color: C.paper, align: 'center' });
    text('YEARS', cx, cy + 130, { fam: 'mono', size: 30, weight: 600, color: C.gold, align: 'center', track: 10 });
  });
  const sk = P(t, wt('L04', 'Scored'), .25);
  if (sk > 0) at(cx, 1300, lerp(2.2, 1, eOut(sk)), -.05, () => withAlpha(eOut(sk), () => {
    ctx.strokeStyle = C.red; ctx.lineWidth = 6; rrect(-260, -56, 520, 100, 12); ctx.stroke();
    text('NET OF ALL FEES', 0, 16, { fam: 'mono', size: 44, weight: 600, color: C.red, align: 'center', track: 6 });
  }));
};

// ── 02 · ARITH — they are the market (Sharpe, 1991) ─────────────────────────
SC.arith = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const fore = wt('L05', 'forecasting'), ari = wt('L05', 'arithmetic'), bef = wt('L06', 'Before'),
    act = wt('L06', 'active'), mkt = wt('L06', 'return,'), tog = wt('L06', 'together,'), are = wt('L06', 'are');
  // Act 1: no crystal ball
  const a1Out = P(t, bef - .3, .4);
  withAlpha(1 - a1Out, () => {
    const k = eOut(P(lt, 0, .5));
    withAlpha(k, () => {
      const g = ctx.createRadialGradient(W / 2 - 40, 700, 10, W / 2, 760, 200);
      g.addColorStop(0, 'rgba(169,198,207,.45)'); g.addColorStop(1, 'rgba(127,166,179,.05)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, 760, 190, 0, 7); ctx.fill();
      ctx.strokeStyle = HF; ctx.lineWidth = 3; ctx.stroke();
      text('?', W / 2, 830, { fam: 'serif', size: 200, italic: true, color: C.paper, align: 'center', alpha: .7 });
      ctx.fillStyle = '#2a2820'; rrect(W / 2 - 150, 935, 300, 50, 10); ctx.fill();
      text('MARKET FORECAST', W / 2, 520, { fam: 'mono', size: 26, weight: 600, color: C.dim, align: 'center', track: 4 });
    });
    const sk = eOut(P(t, fore + .2, .35));
    line2(W / 2 - 240, 1000, lerp(W / 2 - 240, W / 2 + 240, sk), lerp(1000, 520, sk), C.red, 14);
    withAlpha(eOut(P(t, ari - .1, .4)), () => text('arithmetic', W / 2, 1130, { fam: 'serif', size: 84, italic: true, weight: 600, color: C.gold, align: 'center' }));
  });
  if (t < bef - .35) return;
  // Act 2: the market is everyone. Dots = investors.
  const k2 = eOut(P(t, bef - .3, .5));
  const cx = W / 2, cy = 720, R = 290, r = rng(17);
  const split = eIO(P(t, act - .05, .6));      // colour the active managers
  const unite = eIO(P(t, tog - .1, .7));        // ...and show they are the whole
  withAlpha(k2, () => {
    const ga = ctx.globalAlpha;
    for (let i = 0; i < 640; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      const active = i % 3 !== 0;
      ctx.fillStyle = active ? (split > 0 ? (unite > .5 ? IX : HF) : C.paper) : (unite > .5 ? IX : C.dim);
      ctx.globalAlpha = ga * (active ? lerp(.55, 1, split) : lerp(.55, .4 + .6 * unite, split));
      ctx.beginPath(); ctx.arc(x, y, 5.2, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = ga;
    ctx.strokeStyle = unite > .5 ? IX : C.rule; ctx.lineWidth = 3 + 3 * unite; ctx.beginPath(); ctx.arc(cx, cy, R + 24, 0, 7); ctx.stroke();
    text(unite > .5 ? 'THEY ARE THE MARKET' : 'THE MARKET = ALL INVESTORS', cx, cy - R - 50, { fam: 'mono', size: 26, weight: 600, color: unite > .5 ? IX : C.dim, align: 'center', track: 4 });
  });
  // equation
  const ek = eOut(P(t, mkt - .3, .5));
  withAlpha(ek, () => {
    const y = 1170;
    text('Active, on average,', 100, y, { fam: 'serif', size: 44, color: HF2 });
    text('before costs', 100, y + 52, { fam: 'mono', size: 24, color: C.dim, track: 2 });
    text('=', 600, y + 20, { fam: 'serif', size: 80, color: C.paper });
    text('Market', 680, y + 20, { fam: 'serif', size: 60, weight: 800, color: IX });
  });
  withAlpha(eOut(P(t, are, .5)), () => text('W. F. Sharpe, “The Arithmetic of Active Management,” 1991', W / 2, 1310, { fam: 'serif', size: 24, italic: true, color: C.dim, align: 'center' }));
};

// ── 02 · LAYERS — fees in layers; skill vs cost ─────────────────────────────
SC.layers = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const aft = wt('L07', 'After'), two = wt('L07', '2%'), twe = wt('L07', '20%'), ano = wt('L07', 'another'), skill = wt('L08', 'Skill'), costs = wt('L08', 'Costs');
  tag('ONE ILLUSTRATIVE YEAR · 8% GROSS', 100, 300, C.gold, P(lt, 0, .5));
  // waterfall: 8.0 → −2.0 → −1.2 → −1.0 → 3.8
  const steps = [
    { lab: 'Gross return', sub: 'what the funds earn', v0: 0, v1: 8.0, col: HF, at: aft - .2 },
    { lab: '2% a year', sub: 'management fee', v0: 6.0, v1: 8.0, col: C.red, at: two - .1, fee: true },
    { lab: '20% of gains', sub: 'performance fee', v0: 4.8, v1: 6.0, col: C.red, at: twe - .1, fee: true },
    { lab: 'another layer', sub: 'fund-of-funds fee', v0: 3.8, v1: 4.8, col: C.red, at: ano - .1, fee: true },
    { lab: 'You keep', sub: 'net to investors', v0: 0, v1: 3.8, col: HF2, at: ano + .9 },
  ];
  const X0 = 110, BW = 150, GAP = 22, Y1 = 1080, sc = 78;
  const dim = 1 - eIO(P(t, skill - .3, .5));
  withAlpha(dim, () => {
    line2(X0 - 10, Y1, X0 + 5 * (BW + GAP), Y1, C.rule, 2);
    steps.forEach((st, i) => {
      const k = eOut(P(t, st.at, .45)); if (k <= 0) return;
      const x = X0 + i * (BW + GAP);
      const yTop = Y1 - st.v1 * sc, yBot = Y1 - st.v0 * sc;
      const drop = st.fee ? eIn(P(t, st.at + .5, .6)) * 60 : 0;
      withAlpha(k, () => {
        withAlpha(st.fee ? .9 : 1, () => { ctx.fillStyle = st.col; ctx.fillRect(x, lerp(yBot, yTop, k) + drop, BW, (yBot - yTop) * k); });
        const val = st.fee ? '−' + (st.v1 - st.v0).toFixed(1) + '%' : st.v1.toFixed(1) + '%';
        text(val, x + BW / 2, yTop - 18 + drop, { fam: 'mono', size: 28, weight: 600, color: st.fee ? C.red : C.paper, align: 'center' });
        text(st.lab, x + BW / 2, Y1 + 44, { fam: 'serif', size: 26, weight: 600, color: C.paper, align: 'center' });
        text(st.sub, x + BW / 2, Y1 + 76, { fam: 'mono', size: 16, color: C.dim, align: 'center' });
        if (i > 0 && i < 4) { ctx.setLineDash([5, 6]); line2(x - GAP, yTop, x, yTop, C.dim, 1.5); ctx.setLineDash([]); }
      });
    });
    withAlpha(eOut(P(t, ano + 1.2, .5)), () => text('More than half the gross return, gone.', W / 2, 1240, { fam: 'serif', size: 32, italic: true, color: C.paper, align: 'center' }));
  });
  // skill vs costs
  const ck = (at0) => eOut(P(t, at0 - .1, .4));
  const card = (x, k, head, word, col, draw) => withAlpha(k, () => at(x, 700, lerp(.9, 1, k), 0, () => {
    ctx.fillStyle = C.ink; rrect(-230, -260, 460, 520, 20); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 3; rrect(-230, -260, 460, 520, 20); ctx.stroke();
    text(head, 0, -190, { fam: 'mono', size: 30, weight: 600, color: col, align: 'center', track: 6 });
    draw();
    text(word, 0, 200, { fam: 'serif', size: 60, weight: 800, italic: true, color: col, align: 'center' });
  }));
  card(290, ck(skill), 'SKILL', 'uncertain', HF, () => {
    // a wide, wobbling distribution
    const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60 * 2 - 1; pts.push([u * 180, 80 - 150 * Math.exp(-u * u * 2.2) * (1 + .1 * Math.sin(t * 4 + u * 6))]); }
    strokePath(pts, 1, HF2, 4);
    text('?', 0, 20, { fam: 'serif', size: 80, italic: true, color: C.paper, align: 'center', alpha: .6 });
  });
  card(790, ck(costs), 'COSTS', 'certain', C.red, () => {
    // a single spike: you pay them every year
    line2(-180, 80, 180, 80, C.rule, 2); line2(0, 80, 0, -90, C.red, 10);
    text('every year', 0, 130, { fam: 'mono', size: 22, color: C.dim, align: 'center' });
  });
};

// ── 03 · CRASH — year one: 2008 ─────────────────────────────────────────────
SC.crash = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const y08 = wt('L09', '2008,'), fell = wt('L09', 'fell'), less = wt('L09', 'less.'), beh = wt('L09', 'behind.'),
    move = wt('L10', 'move.'), ten = wt('L10', 'ten.');
  legend(150, 300, P(lt, 0, .5));
  const reveal = lerp(0, 1, eIO(P(t, y08, (less - y08) + .2)));
  const zoom = eIO(P(t, move - .1, 1.4));
  const g = raceChart(t, { v0: 0, v1: lerp(1.6, 10, zoom), reveal: Math.max(.02, reveal), hfAlpha: 1 });
  // year-one title, then the −37% callout in the empty space above the lines
  withAlpha(eOut(P(lt, .1, .5)) * (1 - eIO(P(t, fell, .4))), () => {
    text('YEAR ONE', g.mx(.8), g.py(1.75), { fam: 'mono', size: 30, weight: 600, color: C.gold, align: 'center', track: 10 });
    text('2008', g.mx(.8), g.py(1.75) + 130, { fam: 'serif', size: 150, weight: 900, color: C.paper, align: 'center' });
  });
  const ck = eOut(P(t, fell + .2, .4));
  withAlpha(ck * (1 - zoom), () => {
    at(g.mx(.8), g.py(1.62), lerp(1.3, 1, ck), 0, () => {
      text('−37%', 0, 0, { fam: 'serif', size: 150, weight: 900, color: C.red, align: 'center' });
      text('S&P 500 IN 2008', 0, 50, { fam: 'mono', size: 24, weight: 500, color: C.paper, align: 'center', track: 3 });
    });
  });
  withAlpha(eOut(P(t, less - .1, .4)) * (1 - zoom), () => {
    const x = g.mx(1), y = g.py(.76);
    text('lost less', x + 24, y - 30, { fam: 'serif', size: 40, italic: true, color: HF2 });
  });
  // BEHIND badge
  const bk = eBack(P(t, beh - .1, .45));
  withAlpha(clamp(bk) * (1 - P(t, move + 1.2, .4)), () => at(W / 2 + 90, 905, clamp(bk, 0, 1.3), -.04, () => {
    ctx.fillStyle = C.red; rrect(-230, -60, 460, 110, 14); ctx.fill();
    text('BUFFETT: BEHIND', 0, 18, { fam: 'mono', size: 42, weight: 600, color: C.paper, align: 'center', track: 4 });
  }));
  // year 1 of 10
  withAlpha(eOut(P(t, move, .5)), () => {
    const x0 = 150, x1 = 900, y = 1310;
    line2(x0, y, x1, y, C.rule, 8); line2(x0, y, lerp(x0, x1, .1), y, C.red, 8);
    text('YEAR 1 OF 10', x0, y - 26, { fam: 'mono', size: 24, weight: 600, color: C.paper, track: 4 });
    withAlpha(eOut(P(t, ten - .4, .4)), () => text('scored at year ten', x1, y - 26, { fam: 'serif', size: 30, italic: true, color: IX, align: 'right' }));
  });
};

// ── 04 · BOND — the stake: a zero-coupon Treasury, then Berkshire ───────────
SC.bond = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const tre = wt('L11', 'Treasury'), wor = wt('L11', 'worth'), y12 = wt('L12', '2012,'), und = wt('L12', 'under'),
    mov = wt('L12', 'moved'), brk = wt('L12', 'Berkshire');
  tag('THE STAKE', 100, 300, C.gold, P(lt, 0, .5));
  const sold = P(t, mov - .1, .3);
  const slide = eIO(P(t, mov + .2, .8));
  // bond certificate
  const bk = eOut(P(t, tre - .3, .6));
  at(W / 2 - slide * 1100, 690 + (1 - bk) * 160, 1, -.03, () => withAlpha(bk, () => {
    const w = 860, h = 560;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    ctx.fillStyle = '#E7E3D2'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); ctx.globalAlpha *= .8; ctx.drawImage(paperTex, 200, 300, w, h, -w / 2, -h / 2, w, h); ctx.restore();
    ctx.strokeStyle = 'rgba(40,80,70,.6)'; ctx.lineWidth = 1.3;
    for (let i = 0; i < 4; i++) ctx.strokeRect(-w / 2 + 20 + i * 6, -h / 2 + 20 + i * 6, w - 40 - i * 12, h - 40 - i * 12);
    // guilloche rosette
    ctx.save(); ctx.translate(w / 2 - 130, -40); ctx.strokeStyle = 'rgba(40,80,70,.35)';
    for (let i = 0; i < 24; i++) { ctx.rotate(Math.PI / 12); ctx.beginPath(); ctx.ellipse(0, 0, 90, 30, 0, 0, 7); ctx.stroke(); }
    ctx.restore();
    const ink = '#1d3a33';
    text('ZERO-COUPON TREASURY BOND', -w / 2 + 60, -h / 2 + 100, { fam: 'serif', size: 40, weight: 800, color: ink, track: 1 });
    text('ILLUSTRATION', -w / 2 + 60, -h / 2 + 136, { fam: 'mono', size: 16, color: '#4d5a52', track: 5 });
    text('STAKE, 2008', -w / 2 + 60, -h / 2 + 220, { fam: 'mono', size: 18, weight: 600, color: '#4d5a52', track: 3 });
    text('≈ $640,000', -w / 2 + 60, -h / 2 + 268, { fam: 'serif', size: 44, weight: 800, color: ink });
    text('$320K from each side', -w / 2 + 60, -h / 2 + 300, { fam: 'mono', size: 18, color: '#4d5a52' });
    const vk = eOut(P(t, wor - .1, .5));
    withAlpha(vk, () => {
      text('VALUE AT MATURITY, 2017', -w / 2 + 60, -h / 2 + 380, { fam: 'mono', size: 18, weight: 600, color: '#4d5a52', track: 3 });
      text('$1,000,000', -w / 2 + 60, -h / 2 + 440, { fam: 'serif', size: 64, weight: 900, color: ink });
    });
    // yield meter
    const yk = P(t, y12 - .2, (und - y12) + .8);
    if (yk > 0) {
      const yv = lerp(4.6, .9, eIO(yk));
      withAlpha(eOut(P(yk, 0, .2)), () => {
        ctx.fillStyle = 'rgba(29,58,51,.08)'; rrect(w / 2 - 300, h / 2 - 170, 250, 130, 10); ctx.fill();
        text('YIELD TO 2017', w / 2 - 175, h / 2 - 136, { fam: 'mono', size: 16, weight: 600, color: '#4d5a52', align: 'center', track: 3 });
        text(yv.toFixed(1) + '%', w / 2 - 175, h / 2 - 66, { fam: 'serif', size: 64, weight: 900, color: yk > .9 ? C.red : ink, align: 'center' });
      });
    }
    // SOLD stamp
    if (sold > 0) at(40, 40, lerp(2.2, 1, eOut(sold)), -.18, () => withAlpha(.85 * eOut(sold), () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 7; rrect(-150, -60, 300, 120, 12); ctx.stroke();
      text('SOLD', 0, 26, { fam: 'mono', size: 72, weight: 600, color: C.red, align: 'center', track: 10 });
    }));
  }));
  // context line under the bond
  withAlpha(eOut(P(t, und + .2, .4)) * (1 - slide), () => {
    text('The bond had already risen in price.', W / 2, 1110, { fam: 'serif', size: 32, italic: true, color: C.paper, align: 'center' });
    text('What was left to earn was almost nothing.', W / 2, 1156, { fam: 'serif', size: 32, italic: true, color: C.paper, align: 'center' });
  });
  // Berkshire share card
  const ck = eOut(P(t, brk - .3, .6));
  if (ck > 0) at(W / 2 + (1 - slide) * 1100, 690, 1, .02, () => withAlpha(ck, () => {
    const w = 820, h = 520;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    ctx.fillStyle = '#1b1c16'; rrect(-w / 2, -h / 2, w, h, 16); ctx.fill(); ctx.restore();
    ctx.strokeStyle = IX; ctx.lineWidth = 3; rrect(-w / 2, -h / 2, w, h, 16); ctx.stroke();
    text('BERKSHIRE HATHAWAY', 0, -h / 2 + 110, { fam: 'serif', size: 56, weight: 900, color: C.paper, align: 'center', track: 2 });
    text('CLASS B SHARES · 2012', 0, -h / 2 + 156, { fam: 'mono', size: 22, weight: 600, color: IX, align: 'center', track: 5 });
    line2(-w / 2 + 80, -h / 2 + 196, w / 2 - 80, -h / 2 + 196, C.rule, 2);
    text('The same stake, now in a business', 0, 40, { fam: 'serif', size: 36, italic: true, color: C.paper, align: 'center' });
    text('that keeps compounding.', 0, 86, { fam: 'serif', size: 36, italic: true, color: C.paper, align: 'center' });
    text('Illustration', 0, h / 2 - 40, { fam: 'mono', size: 16, color: C.dim, align: 'center', track: 4 });
  }));
};

// ── 04 · RISK — risk is missing the goal, not wiggles ───────────────────────
SC.risk = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const wig = wt('L13', 'wiggles.'), miss = wt('L13', 'miss'), goal = wt('L13', 'goal.');
  const X0 = 130, X1 = 940, base = 1100, gy = 680;
  tag('WHAT RISK REALLY IS', 100, 300, C.gold, P(lt, 0, .4));
  // goal line
  withAlpha(eOut(P(lt, .1, .4)), () => {
    ctx.setLineDash([14, 12]); line2(X0, gy, X1, gy, C.paper, 3, .7); ctx.setLineDash([]);
    text('YOUR GOAL', X1, gy - 20, { fam: 'mono', size: 24, weight: 600, color: C.paper, align: 'right', track: 4 });
  });
  const k = eIO(P(lt, .2, (miss - s.start) - .1));
  // volatile path that ends above the goal
  const r = rng(5), vol = []; let v = 0;
  for (let i = 0; i <= 80; i++) { const u = i / 80; v += (r() - .45) * 34; vol.push([lerp(X0, X1, u), base - u * 520 + Math.sin(u * 23) * 50 - v * .3 + (u > .95 ? 0 : 0)]); }
  vol[80][1] = gy - 90;
  strokePath(vol, k, IX, 5, { glow: 10 });
  withAlpha(eOut(P(t, wig - .2, .4)), () => text('wiggles a lot', X0 + 20, 560, { fam: 'serif', size: 36, italic: true, color: IX }));
  // "safe" flat path that ends below the goal
  const flat = [[X0, base - 260], [X1, base - 300]];
  strokePath(flat, k, HF, 5);
  withAlpha(eOut(P(t, wig, .4)), () => text('“safe” at under 1%', X0 + 10, base - 196, { fam: 'serif', size: 36, italic: true, color: HF2 }));
  // miss
  const mk = eOut(P(t, miss, .35));
  withAlpha(mk, () => {
    const x = X1, y = base - 300;
    line2(x - 26, y - 26, x + 26, y + 26, C.red, 8); line2(x - 26, y + 26, x + 26, y - 26, C.red, 8);
    text('MISSES', x + 20, y + 80, { fam: 'mono', size: 28, weight: 600, color: C.red, align: 'right', track: 4 });
  });
  withAlpha(eOut(P(t, goal, .4)), () => text('Risk = the chance you miss the goal', W / 2, 1290, { fam: 'serif', size: 40, weight: 600, color: C.paper, align: 'center' }));
};

// ── 05 · RACE — the full decade ─────────────────────────────────────────────
SC.race = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const up = wt('L14', 'up'), ab = wt('L14', 'about'), five = wt('L15', 'five'), bet = wt('L15', 'between'), every = wt('L15', 'Every');
  legend(150, 300, 1);
  const reveal = lerp(1, 10, eIO(P(t, s.start + .1, up - s.start - .1)));
  const hi = t > every ? Math.min(4, Math.floor((t - every) / .22)) : undefined;
  const g = raceChart(t, { v0: 0, v1: 10, reveal, hfHi: hi });
  // index endpoint label
  withAlpha(eOut(P(t, up - .1, .4)), () => {
    const y = g.py(2.258);
    text('+126%', g.X1 + 16, y + 12, { fam: 'serif', size: 52, weight: 900, color: IX });
    withAlpha(eOut(P(t, ab, .4)), () => text('≈ 8.5% / yr', g.X1 + 18, y + 46, { fam: 'mono', size: 20, weight: 600, color: C.paper }));
  });
  // fund-of-funds endpoint labels, nudged apart
  const fk = eOut(P(t, bet - .1, .5));
  if (fk > 0) {
    let ys = FOF.map(f => g.py(f.final));
    for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i - 1] < 30) ys[i] = ys[i - 1] + 30;
    FOF.forEach((f, j) => withAlpha(fk * (hi === undefined || hi === j ? 1 : .5), () =>
      text('+' + Math.round((f.final - 1) * 100) + '%', g.X1 + 16, ys[j] + 8, { fam: 'mono', size: 24, weight: 600, color: hi === j ? HF2 : HF })));
  }
  withAlpha(eOut(P(t, every + .6, .5)), () => {
    ctx.fillStyle = 'rgba(14,15,13,.88)'; rrect(150, 470, 420, 70, 35); ctx.fill();
    text('EVERY ONE TRAILED', 360, 516, { fam: 'mono', size: 28, weight: 600, color: C.paper, align: 'center', track: 4 });
  });
  withAlpha(eOut(P(lt, .4, .5)), () => text('Fund paths illustrative · endpoints from Buffett’s 2017 letter', W / 2, 1290, { fam: 'serif', size: 22, italic: true, color: C.dim, align: 'center' }));
};

// ── 05 · FEES — where the gains went ────────────────────────────────────────
SC.fees = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const est = wt('L16', 'estimate,'), six = wt('L16', '60%'), man = wt('L16', 'managers.');
  tag('THE FUNDS’ GAINS, SPLIT', 100, 300, C.gold, P(lt, 0, .4));
  const cx = W / 2;
  // bins
  withAlpha(eOut(P(lt, .1, .4)), () => {
    ctx.strokeStyle = HF; ctx.lineWidth = 3; rrect(90, 940, 400, 260, 18); ctx.stroke();
    ctx.strokeStyle = C.red; rrect(590, 940, 400, 260, 18); ctx.stroke();
    text('INVESTORS', 290, 1250, { fam: 'mono', size: 26, weight: 600, color: HF, align: 'center', track: 4 });
    text('MANAGERS', 790, 1250, { fam: 'mono', size: 26, weight: 600, color: C.red, align: 'center', track: 4 });
  });
  // ten coins fall from the top row into the bins: six to managers
  for (let i = 0; i < 10; i++) {
    const toMgr = i < 6;
    const k = eIO(P(t, six - .3 + i * .09, .7));
    const x0 = 140 + i * 88, y0 = 560;
    const slot = toMgr ? i : i - 6;
    const x1 = toMgr ? 650 + (slot % 3) * 140 : 150 + (slot % 2) * 140 + 70;
    const y1 = 1010 + Math.floor(slot / (toMgr ? 3 : 2)) * 110;
    const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(Math.PI * k) * 160;
    withAlpha(eOut(P(lt, .1 + i * .04, .3)), () => {
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 38, 0, 7); ctx.fill();
      ctx.strokeStyle = C.oil; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 30, 0, 7); ctx.stroke();
      text('$', x, y + 14, { fam: 'serif', size: 40, weight: 900, color: C.oil, align: 'center' });
    });
  }
  withAlpha(eOut(P(t, six, .4)), () => at(cx, 800, lerp(1.3, 1, eOut(P(t, six, .4))), 0, () =>
    text('≈ 60%', 0, 0, { fam: 'serif', size: 150, weight: 900, color: C.red, align: 'center' })));
  withAlpha(eOut(P(t, est - .1, .4)), () => text('Buffett’s estimate, 2016 letter (first nine years)', cx, 1330, { fam: 'serif', size: 24, italic: true, color: C.dim, align: 'center' }));
};

// ── 06 · FAIR — the counterpoint, and why costs still win ───────────────────
SC.fair = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const roar = wt('L17', 'roaring'), dec = wt('L17', 'One'), samp = wt('L17', 'sample.'), but = wt('L18', 'But'), any = wt('L18', 'any');
  tag('THE COUNTERPOINT', 100, 300, C.gold, P(lt, 0, .4));
  const out = eIO(P(t, but - .25, .45));
  withAlpha(1 - out, () => {
    // quote card
    const k = eOut(P(lt, .1, .5));
    withAlpha(k, () => {
      text('“', 90, 560, { fam: 'serif', size: 220, weight: 900, color: HF, alpha: .5 });
      const lines = ['A roaring bull market', 'favored the index.'];
      lines.forEach((l, i) => withAlpha(eOut(P(t, roar - .2 + i * .5, .4)), () =>
        text(l, 140, 560 + i * 84, { fam: 'serif', size: 66, weight: 600, italic: i === 1, color: C.paper })));
      withAlpha(eOut(P(t, roar + .8, .4)), () => text('— Ted Seides’ argument, paraphrased', 140, 760, { fam: 'mono', size: 22, color: C.dim, track: 1 }));
    });
    // n = 1
    const nk = eOut(P(t, dec - .1, .4));
    withAlpha(nk, () => {
      for (let i = 0; i < 10; i++) {
        const lit = i === 0;
        ctx.fillStyle = lit ? IX : 'rgba(239,230,210,.08)'; rrect(140 + i * 82, 900, 64, 64, 8); ctx.fill();
      }
      text('2008–17', 172, 1000, { fam: 'mono', size: 18, color: IX, align: 'center' });
      text('n = 1', 960, 1120, { fam: 'mono', size: 80, weight: 600, color: C.paper, align: 'right', alpha: eOut(P(t, samp - .2, .4)) });
      text('decades observed', 960, 1160, { fam: 'mono', size: 22, color: C.dim, align: 'right', alpha: eOut(P(t, samp - .2, .4)) });
    });
  });
  // the identity holds in any market
  if (out > 0) withAlpha(out, () => {
    const y = 700;
    text('Your return', W / 2, y - 120, { fam: 'serif', size: 60, weight: 600, color: C.paper, align: 'center' });
    text('=', W / 2, y - 30, { fam: 'serif', size: 70, color: C.dim, align: 'center' });
    text('Market return − Costs', W / 2, y + 60, { fam: 'serif', size: 64, weight: 800, color: C.paper, align: 'center' });
    line2(W / 2 + 120, y + 80, W / 2 + 330, y + 80, C.red, 5);
    ['BULL', 'BEAR', 'FLAT'].forEach((m, i) => {
      const k = eOut(P(t, any - .1 + i * .18, .3)), x = 260 + i * 280;
      withAlpha(k, () => {
        ctx.strokeStyle = IX; ctx.lineWidth = 3; rrect(x - 110, 900, 220, 110, 14); ctx.stroke();
        text(m, x - 10, 970, { fam: 'mono', size: 34, weight: 600, color: C.paper, align: 'center', track: 4 });
        checkmark(x + 70, 952, 34, P(t, any + .1 + i * .18, .3), IX);
      });
    });
  });
};

// ── 06 · RULE — paper: the quote and the takeaway ───────────────────────────
SC.rule = (t, s) => {
  const lt = t - s.start;
  ctx.drawImage(paperTex, 0, 0);
  const ink = C.ink, L = 100;
  const pc = wt('L19', 'comes,'), pg = wt('L19', 'goes.'), fe = wt('L19', 'Fees'), fal = wt('L19', 'falter.');
  const iff = wt('L20', 'If'), own = wt('L20', 'own'), kp = wt('L20', 'keep');
  const rise = k => (1 - eOut(k)) * 26;
  text('THE RULE', L, 300, { fam: 'mono', size: 24, weight: 600, color: C.oil, track: 6, alpha: eOut(P(lt, 0, .5)) });
  const q = [[pc - .45, 'Performance comes,', 470, 84, 400, false, ink], [pg - .45, 'performance goes.', 570, 84, 400, false, ink], [fe - .1, 'Fees never falter.', 710, 96, 900, true, C.red]];
  q.forEach(([a, str, y, sz, wgt, it, col]) => { const k = P(t, a, .4); withAlpha(eOut(k), () => text(str, L, y + rise(k), { fam: 'serif', size: sz, weight: wgt, italic: it, color: col })); });
  withAlpha(eOut(P(t, fal + .2, .4)), () => text('— Warren Buffett, 2016 letter to shareholders', L, 772, { fam: 'mono', size: 22, color: '#5d5a4f', track: 1 }));
  line2(L, 850, lerp(L, W - L, eIO(P(t, iff - .3, .6))), 850, 'rgba(14,15,13,.25)', 2);
  const k1 = P(t, iff - .1, .4), k2 = P(t, own - .15, .4), k3 = P(t, kp - .15, .4);
  withAlpha(eOut(k1), () => text('If you can’t know who will win,', L, 980 + rise(k1), { fam: 'serif', size: 56, italic: true, color: ink }));
  withAlpha(eOut(k2), () => {
    at(L, 1120 + rise(k2), lerp(1.15, 1, eOut(k2)), 0, () => {
      const o = { fam: 'serif', size: 80, weight: 900 }, w = measure('own the whole field', o);
      ctx.fillStyle = ink; rrect(-14, -80, w + 56, 112, 10); ctx.fill();
      text('own the whole field', 14, 4, { ...o, color: C.paper });
    });
  });
  withAlpha(eOut(k3), () => text('and keep what it earns.', L, 1260 + rise(k3), { fam: 'serif', size: 64, weight: 800, color: C.oil }));
};

// ── END CARD ────────────────────────────────────────────────────────────────
SC.endcard = (t, s) => {
  bgInk(t);
  const lt = t - s.start;
  const k = eOut(P(lt, 0, .45));
  withAlpha(k, () => {
    tag('A CASE STUDY IN DECISIONS UNDER UNCERTAINTY', W / 2 - 360, 600, C.gold, 1, 22);
    text('THE', W / 2, 740, { fam: 'serif', size: 70, italic: true, color: C.gold, align: 'center' });
  });
  liquidText('TEN-YEAR', W / 2, 880, 150, eIO(P(lt, .1, 1.1)), t, k);
  withAlpha(k, () => text('BET', W / 2, 1030, { fam: 'serif', size: 150, weight: 900, color: C.paper, align: 'center', track: 14 }));
  line2(W / 2 - 200, 1100, lerp(W / 2 - 200, W / 2 + 200, eIO(P(lt, .2, .5))), 1100, C.gold, 4);
  withAlpha(eOut(P(lt, .3, .4)), () => {
    text('Buffett vs. Protégé Partners · 2008–2017', W / 2, 1170, { fam: 'serif', size: 34, italic: true, color: C.paper, align: 'center' });
    text('Winnings ≈ $2.2M → Girls Inc. of Omaha', W / 2, 1230, { fam: 'mono', size: 24, weight: 500, color: C.gold, align: 'center', track: 2 });
    text('Figures from Buffett’s 2016 & 2017 letters · sources in description', W / 2, 1540, { fam: 'mono', size: 20, color: C.dim, align: 'center', track: 1 });
    text('Educational content — not investment advice.', W / 2, 1580, { fam: 'mono', size: 20, color: C.dim, align: 'center', track: 2 });
  });
};
