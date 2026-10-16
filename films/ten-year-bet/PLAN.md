# The Ten-Year Bet — production plan

A 120-second vertical (9:16) educational film about Warren Buffett's 2008–2017 wager that an S&P 500 index fund would beat a hand-picked portfolio of hedge funds.

## 1. Creative brief

| | |
|---|---|
| **Audience** | Curious retail investors, finance students, recruiters watching a showreel |
| **Platform** | Shorts / Reels / TikTok long-form. 1080×1920, 30 fps, 120 s, captions burned in |
| **Single takeaway** | *When you can't know who will win, own the whole field, and keep what it earns.* |
| **Rigor rule** | Present the strongest counter-argument (one decade is one sample), then show why the conclusion survives it (the arithmetic of costs holds in any market) |
| **Tone** | Documentary, calm and exact. Gold is Buffett's index fund, steel blue the hedge funds, red the fees and losses. |

### Why this case

| The brief asks… | What the story shows |
|---|---|
| **What** was decided | A public, ten-year, $1M bet that a passive S&P 500 index fund would beat five funds of hedge funds, net of fees |
| **Why** | Not a market forecast but arithmetic. Before costs, active managers as a group *are* the market, so they earn its return. After costs they must trail it, and hedge funds charge in layers. |
| **How uncertainty was evaluated** | He separated what was uncertain (manager skill) from what was certain (costs, every year), and bet only on the certain part. He also held through a losing first year: in 2008 the index fell 37% and the hedge funds lost less. The stake itself carried a second lesson. In 2012 the "safe" Treasury bonds would pay under 1% a year for five more years, so the stake moved into Berkshire stock. Risk is the chance of missing your goal, not price wiggles. |
| **What was learned** | Fees compound as reliably as returns do. Judge a long bet at its end, not its first year. Volatility is not risk. A single decade can't prove a strategy, but the cost identity doesn't depend on the decade. |

## 2. Narrative structure

| # | Chapter | Time | Job |
|---|---|---|---|
| 01 | **The Wager** | 0–25 s | Hook: 2007, $1,000,000, "the laziest portfolio vs. the smartest money". The tale of the tape. Ten years, scored net of fees. |
| 02 | **The Logic** | 25–48 s | No forecast, just arithmetic: Sharpe's identity. Fee layers as a waterfall. Skill uncertain, costs certain. |
| 03 | **The Test** | 48–60 s | 2008: −37%, Buffett behind. Year 1 of 10, and he holds. |
| 04 | **The Stake** | 60–79 s | Zero-coupon Treasury, then the 2012 switch into Berkshire. Risk vs. volatility. |
| 05 | **The Result** | 79–97 s | The full race chart: +126% vs +3% to +88%. About 60% of the gains went to fees. |
| 06 | **The Lesson** | 97–120 s | The fair counterpoint (n = 1), the cost identity, Buffett's line, the takeaway, the end card |

Times come from the measured narration (`build/ten-year-bet/timeline.json`).

## 3. Script

Captions show the `text` field of `script.json`. The `say` field spells numbers out for the voice.

1. In 2007, Warren Buffett bet a million dollars that the laziest portfolio on Earth would beat Wall Street's smartest money.
2. His pick: a plain S&P 500 index fund. Own everything. Pay almost nothing.
3. Against him: Ted Seides of Protégé Partners, with five funds of hedge funds.
4. Ten years. 2008 to 2017. Scored after every fee.
5. Buffett wasn't forecasting the market. His logic was arithmetic.
6. Before costs, active managers as a group earn the market's return, because together, they are the market.
7. After costs, they must trail it. And hedge funds charge in layers: 2% a year, plus 20% of gains, then another layer on top.
8. Skill was uncertain. Costs were certain.
9. Then came year one. In 2008, the market fell 37%. The hedge funds lost less. Buffett was behind.
10. He didn't move. A ten-year bet is scored at year ten.
11. Even the stake held a lesson. It sat in Treasury bonds, set to be worth a million dollars in 2017.
12. By 2012, those safe bonds would pay under 1% a year. So both sides moved the stake into Berkshire stock.
13. Risk isn't a price that wiggles. It's the chance you miss your goal.
14. December 2017. The index fund: up 126%, about 8.5% a year.
15. The five funds of funds: between 3% and 88%. Every one trailed.
16. By Buffett's estimate, roughly 60% of their gains had gone to the managers.
17. Seides made a fair point: a roaring bull market favored the index. One decade is one sample.
18. But the arithmetic of costs holds in any decade.
19. Performance comes, performance goes. Fees never falter.
20. If you can't know who will win, own the whole field, and keep what it earns.

## 4. Shot list

| Scene | Visual |
|---|---|
| hook | "2007" lands. A tag reads *A public wager · registered on longbets.org*. **$1,000,000** counts up with glints. Two contender cards: *the laziest portfolio* (a deck chair) vs. *the smartest money* (stacked research screens). |
| tape | Tale of the tape. On the left, 500 gold squares fill in ("500 companies. All of them."). On the right, five fund-of-funds boxes fill with dozens of hedge-fund chips. Fees row: a sliver of gold vs. a red bar of "fees on fees". |
| clock | A ten-segment ring lights up year by year, 2008→2017. A red **NET OF ALL FEES** stamp. |
| arith | A crystal ball labelled "market forecast" is struck out, and *arithmetic* appears. Then 640 investor dots in a circle; the active managers turn blue, then the whole circle turns gold: **THEY ARE THE MARKET**. Equation: *Active, on average, before costs = Market*. Credit: Sharpe (1991). |
| layers | Waterfall for one illustrative 8% gross year: −2.0% management fee, −1.2% performance fee (20% of the 6% left), −1.0% fund-of-funds layer, leaving 3.8%. Then two cards: **SKILL: uncertain** (a wobbling distribution) and **COSTS: certain** (paid every year). |
| crash | Race chart, zoomed on 2008. Title *YEAR ONE · 2008*. **−37%** for the index, "lost less" for the funds, and a red **BUFFETT: BEHIND** badge. The axis zooms out to ten years: *Year 1 of 10, scored at year ten*. |
| bond | Zero-coupon Treasury certificate (illustration): ≈ $640K stake, $1,000,000 at maturity in 2017. The yield meter sinks from 4.6% to 0.9%, a **SOLD** stamp lands, and a Berkshire Hathaway Class B card slides in. |
| risk | A volatile gold path ends above the dashed goal line. A flat "safe at under 1%" path ends below it, marked ✕ MISSES. *Risk = the chance you miss the goal.* |
| race | The full decade. The index fund ends at **+126%** (≈ 8.5%/yr). The five fund lines end at +88%, +42%, +27%, +22% and +3%, each highlighted in turn: **EVERY ONE TRAILED**. A footnote marks the fund paths as illustrative. |
| fees | Ten coins arc into two bins, six to MANAGERS and four to INVESTORS. **≈ 60%**, sourced to the 2016 letter. |
| fair | Counterpoint card: *"A roaring bull market favored the index"* (Seides' argument, paraphrased). Ten decade boxes with one lit, and **n = 1**. Then the identity *Your return = Market return − Costs*, checked for BULL, BEAR and FLAT markets. |
| rule | Paper inversion. *Performance comes, performance goes. **Fees never falter.*** (Buffett, 2016). Then: *If you can't know who will win, **own the whole field**, and keep what it earns.* |
| endcard | *THE TEN-YEAR BET*, with "TEN-YEAR" filling with gold. Buffett vs. Protégé Partners, 2008–2017. Winnings ≈ $2.2M → Girls Inc. of Omaha. Sources and disclaimer. |

## 5. Sound

- **Voice:** Kokoro-82M `af_heart`, read at speed 1.0 with chapter pauses of 1.0 s.
- **Score:** felt-piano arpeggios and pads. A minor for the wager and the logic, a tense E major for 2008, a lift to A major for the result, and an A major resolution on the end card.
- **Sound design:** about 70 cues. A typewriter on the tag, bells and coins on the million, a tick per year on the ring, clunks as each fee falls away, a boom for 2008, a stamp for SOLD, coins into the managers' bin, and checks for bull, bear and flat.

## 6. Fact check

Where secondary sources disagree, the film uses the primary figures from Buffett's shareholder letters.

| Claim | Status / source |
|---|---|
| Bet made in 2007; period 1 Jan 2008 – 31 Dec 2017; returns measured net of fees; registered on Long Bets | [Validea](https://blog.validea.com/buffett-wins-his-10-year-million-dollar-wager/), [Long Now](https://longnow.org/ideas/warren-buffett-maintains-his-lead-in-his-1-million-long-bet/) |
| Counterparty Ted Seides of Protégé Partners; five funds of hedge funds | Validea, Institutional Investor |
| Index fund +125.8% over ten years, ≈ 8.5%/yr | Buffett, 2017 letter ([Safal Niveshak notes](https://www.safalniveshak.com/notes-on-warren-buffett-2017-letter/), [D&O Diary](https://www.dandodiary.com/2018/02/articles/warren-buffett/closer-look-warren-buffetts-latest-letter-berkshire-shareholders/), [Investor Daily](https://www.investordaily.com.au/buffett-wins-10-year-bet-with-hedge-funds)) |
| Funds of funds: +21.7%, +42.3%, +87.7%, +2.8%, +27.0% (between 3% and 88%) | Buffett, 2017 letter (same sources) |
| The often-quoted "7.1% vs 2.2% a year" | Those are the **nine-year** figures through 2016 (2016 letter). Not used. |
| 2008: S&P 500 −37%; every fund of funds lost less that year | Investor Daily; 2017 letter table |
| ~60% of the funds' gains went to the two layers of managers | Buffett's estimate in the 2016 letter, through year nine. The film says "by Buffett's estimate". [Gulf Times](https://www.gulf-times.com/story/534386/over-100bn-wasted-to-beat-market-says-buffett) |
| Stake: ≈ $320K each into zero-coupon Treasuries worth $1M at maturity; switched to Berkshire shares in 2012 because remaining yield was under 1%; final ≈ $2.2M to Girls Inc. of Omaha | [Institutional Investor](https://www.institutionalinvestor.com/article/2bsxg3kg83vmbpufwighs/culture/protege-partners-pays-up-in-buffett-bet), [Professional Adviser](https://professionaladviser.com/news/3023700/buffett-wins-usd1m-hedge-fund-performance-bet) |
| "Performance comes, performance goes. Fees never falter." | Buffett, 2016 letter |
| Active managers as a group earn the market return before costs | W. F. Sharpe, "The Arithmetic of Active Management", *Financial Analysts Journal*, 1991 |
| Fee waterfall (8% gross → 3.8% net) | Illustrative arithmetic using a 2-and-20 structure plus a ~1% fund-of-funds layer, labelled "illustrative" on screen |
| Yield 4.6% → 0.9% | 4.6% is implied by $640K growing to $1M over ten years. ≈ 0.9% is the remaining yield in 2012 (reported as 0.88%). |
| Race-chart paths | The index uses S&P 500 calendar-year total returns, scaled to the fund's +125.8%. Fund-of-funds yearly paths are illustrative between true 2008 direction and true ten-year endpoints, labelled on screen. |
