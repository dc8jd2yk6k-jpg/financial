# The Salad Oil Test — production plan

A 60-second vertical (9:16) educational film about one real investment decision:
Warren Buffett's 1964 purchase of American Express after the Salad Oil Scandal.

## 1. Creative brief

| | |
|---|---|
| **Audience** | Curious retail investors, finance students, recruiters watching a showreel. Smart, but not specialists. |
| **Platform** | Shorts / Reels / TikTok. 1080×1920, 30 fps, ≤ 60 s, captions burned in for sound-off viewing. |
| **Single takeaway** | *A falling price is a fact. A falling value is a hypothesis — and you can go test it.* |
| **What it is not** | Not "Buffett got rich, so buy the dip." The film explicitly warns against learning from outcomes instead of process. |
| **Tone** | Documentary: calm, precise, a little noir. Archival paper, ink, and one warm accent colour — the colour of oil. |

### Why this case

It is one of the few famous investments where the *reasoning* is documented as well as the result,
and every part of the brief maps onto it:

| The brief asks… | What the story shows |
|---|---|
| **What** was decided | Buy a large stake in American Express while the stock was down by roughly half. |
| **Why** | The market priced a balance-sheet hit as if it were damage to the franchise. Those are different things. |
| **How uncertainty was evaluated** | He named the one question that mattered ("did customers stop trusting the brand?") and tested it in the field: restaurant registers, banks, merchants. Scuttlebutt, in Philip Fisher's term. Then he compared a *bounded* loss with a *durable, compounding* asset. |
| **What was learned** | Separate price from value. Test your thesis with evidence, not headlines. Judge the decision by its process, not its outcome. This trade also helped move Buffett from Graham's "cheap at any quality" toward "great businesses at fair prices." |

## 2. Narrative structure (six beats)

| # | Chapter | Time | Job |
|---|---|---|---|
| 01 | **The Panic** | 0–14 s | Hook, then context: a fraud made of salad oil, and the stock nearly halves. |
| 02 | **The Question** | 14–21 s | Reframe: is the damage to the balance sheet, or to the franchise? |
| 03 | **The Test** | 21–31 s | Field research. Evidence over headlines. |
| 04 | **The Bet** | 31–40 s | Downside is bounded, upside compounds, so he sizes for conviction. |
| 05 | **The Lesson** | 40–50 s | Result, then the rigour: outcome bias. |
| 06 | **The Rule** | 50–60 s | The line to remember, and the end card. |

Final times are derived from the measured narration (`build/timeline.json`). Each scene stretches to fit its lines.

## 3. Script

The `say` text is what the voice reads. Captions use the display text in `src/script.json`.

1. In 1963, the best investment of Warren Buffett's early career began… with a fraud made of salad oil.
2. A New Jersey trader had borrowed millions against tanks of soybean oil that were mostly water.
3. An American Express subsidiary had vouched for the inventory.
4. When the fraud surfaced, the stock nearly halved.
5. Buffett didn't ask how bad the headlines were. He asked a sharper question:
6. Is the damage to the balance sheet — or to the franchise?
7. So he left his desk. He watched the register at Ross's Steak House in Omaha, and checked with banks and merchants.
8. People still paid with the card. They still bought the travelers cheques.
9. The claims were large, but finite. The trust was intact — and compounding.
10. Over two years, he built the position to about forty percent of his partnership.
11. Within three years, the shares had roughly doubled from their lows.
12. But don't learn the outcome. Learn the method. Good results can flatter bad reasoning.
13. A falling price is a fact. A falling value is only a hypothesis. Go test it.

About 150 words, read at roughly 160 wpm with pauses at the beats.

## 4. Shot list / motion design

Design system: **"Archival Ledger."**
- Palette: ink `#0E0F0D`, paper `#EFE6D2`, oil gold `#D9A441`, alarm red `#C8452F`, ledger teal `#6FA79A`.
- Type: Playfair Display (headlines, the documentary voice), IBM Plex Mono (data, labels, dates), Inter (captions).
- Texture: animated film grain, vignette, slow camera drift, paper fibres, registration-mark corners.
- Persistent UI: chapter marker (`01 / 06 — THE PANIC`), a thin progress rule, word-by-word captions in the lower third.

| Beat | Visual |
|---|---|
| Hook | Black. A single drop of oil falls, splashes and ripples. "1963" types on in mono. The title slams in: *A fraud made of salad oil.* |
| Tanks | Vector storage tanks in cross-section. The gauge says FULL, then the cut-away shows water with a thin gold film on top. Label: *Bayonne, NJ — Allied Crude Vegetable Oil.* |
| Receipt | A warehouse receipt slides in and gets a red stamp: *VERIFIED — AMEX FIELD WAREHOUSING*. Then a second stamp: *VOID*. |
| Crash | A mono-labelled price line falls from about $60 to about $35, with a red "≈ −45%" callout. Marked "approximate". |
| Question | Split screen: BALANCE SHEET (a dented ledger) vs FRANCHISE (a card glyph, intact). The question mark scales up between them. |
| Test | Field-notebook page. A diner's register tape prints charge slips, tally marks tick up, and a checklist fills in: ✓ diners still use the card, ✓ travelers cheques still selling, ✓ merchants still accept. Tag: *Method: scuttlebutt — Philip Fisher, 1958.* |
| Bet | A balance scale: "CLAIMS: large, finite" against "FRANCHISE: durable, compounding". The franchise side grows (compounding rings). Then a ring chart fills to ~40%: *of the partnership.* |
| Result | The price line continues from the lows to about 2×. A "2×" badge appears. |
| Rigour | A 2×2 grid, process × outcome: *Good process / bad outcome = bad luck. Bad process / good outcome = dumb luck.* The highlight lands on "Good process". |
| Rule | Big serif lines on paper: "A falling **price** is a fact." / "A falling **value** is a hypothesis." / "Go test it." |
| End card | Title *THE SALAD OIL TEST*, sources line, "Educational content. Not investment advice." |

## 5. Sound

- **Voice:** neural TTS (Kokoro-82M, open weights) with a warm, measured documentary read.
- **Score:** composed procedurally in `src/audio.py`. A low D drone and sparse felt-piano notes (D minor) through the panic, a ticking clock pulse during the test, and a lift to D major on the lesson and the rule.
- **Sound design:** sub-drop on the hook, a drip and splash, a stamp thud, register clicks, a paper whoosh between chapters.
- **Mix:** the music ducks under the voice. Loudness is normalised to about −14 LUFS integrated, the platform standard.

## 6. Fact check

Figures are kept conservative where sources disagree. On screen, prices are labelled "approx." and the chart is labelled "illustrative".

| Claim | Status / source |
|---|---|
| Nov 1963 fraud at Allied Crude Vegetable Oil (Tino De Angelis), Bayonne NJ; tanks mostly water with oil on top; Amex's field-warehousing subsidiary had issued receipts | Widely documented. [Benzinga](https://www.benzinga.com/general/education/21/12/24829081/this-day-in-market-history-salad-oil-scandal-tanks-american-express-stock) |
| Stock roughly halved (~$60–65 → ~$35–37) | Benzinga; [InvestSmart](https://www.investsmart.com.au/insights/salad-oil-the-making-of-warren-buffett/58937) |
| Buffett observed card use at Ross's Steak House, Omaha; checked banks / travel agents on travelers cheques | [Fortune](https://fortune.com/2012/11/21/why-warren-buffetts-betting-big-on-american-express); [GuruFocus](https://www.gurufocus.com/news/244542/standing-in-the-shoes-of-the-oracle-from-omaha-american-express) |
| Position built to ~40% of partnership assets (1964–66) | Several secondary sources agree on about 40%. Fortune notes it was 17% in mid-1964, so the film says "over two years… about forty percent". |
| Shares roughly doubled from the lows within ~3 years ($35 → ~$70) | [Motley Fool](https://www.fool.com/investing/2017/05/27/1-stock-that-was-pivotal-in-billionaire-warren-buf.aspx) and others |
| "Scuttlebutt" method, Philip Fisher, *Common Stocks and Uncommon Profits* (1958) | Standard reference |

## 7. Build pipeline

```
src/script.json ──► src/tts.py ──► build/vo/*.wav + build/timeline.json (measured line timings, word timings)
                          │
                          ├──► src/audio.py ──► build/mix.wav (score + SFX + ducked VO, loudness-normalised)
                          │
web/index.html (canvas scene engine, deterministic renderFrame(t))
        └──► src/render.mjs (Playwright → JPEG frames → ffmpeg) ──► build/video.mp4
                                                                  └─► output/the-salad-oil-test.mp4 (mux)
```

Everything is deterministic and rebuildable with `./build.sh`.
