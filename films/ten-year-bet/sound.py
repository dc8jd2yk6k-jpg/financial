"""The Ten-Year Bet — score harmony and timed sound cues.

Loaded by src/audio.py, which injects its synthesis helpers (place, piano, thud, wt, scene, …)
into this module's namespace before executing it.

Harmony: A minor for the wager and the logic, tense E major for the 2008 crash,
and a lift to A major for the result and the rule.
"""

# ── score ───────────────────────────────────────────────────────────────────
CHORDS = {   # scene -> (pad midi notes, arpeggio midi notes, note spacing in seconds, velocity)
    "hook":    ([33, 45, 52, 57],     [69, 72, 76, 81],         0.75,   .28),
    "tape":    ([41, 53, 57, 60],     [65, 69, 72, 76],         0.375,  .20),
    "clock":   ([36, 48, 55, 60],     [72, 76, 79, 84],         0.5,    .20),
    "arith":   ([45, 57, 60, 64],     [69, 72, 76, 72],         0.375,  .19),
    "layers":  ([38, 50, 53, 57],     [62, 65, 69, 74],         0.375,  .20),
    "crash":   ([40, 52, 56, 59],     [64, 68, 71, 76],         0.1875, .18),
    "bond":    ([41, 53, 57, 60],     [65, 72, 69, 77],         0.375,  .19),
    "risk":    ([38, 50, 53, 57, 60], [62, 69, 65, 72],         0.5,    .18),
    "race":    ([45, 57, 61, 64],     [69, 73, 76, 81, 85],     0.25,   .23),
    "fees":    ([38, 50, 54, 57],     [66, 69, 74, 78],         0.375,  .20),
    "fair":    ([41, 52, 57, 60],     [64, 69, 72, 76],         0.75,   .22),
    "rule":    ([45, 52, 57, 61],     [69, 73, 76, 81],         0.5,    .17),
    "endcard": ([33, 45, 52, 57, 61], [76, 80, 81, 88],         0.6,    .25),
}
END = (21, [45, 52, 57, 61, 64])


# ── sound design ────────────────────────────────────────────────────────────
def build_sfx():
    """Timed sound cues for this film. Engine helpers are injected by src/audio.py."""
    fx = np.zeros((N + SR * 4, 2))
    # whooshes at scene changes
    for k, sc in enumerate(TL["scenes"][1:]):
        place(fx, whoosh(0.6), sc["start"] - 0.32, 0.42, -0.5 if k % 2 else 0.5)

    # 01 hook: 2007 lands, tag types on, the million rings, the contenders arrive
    place(fx, riser(0.6), 0.0, 0.35, 0)
    place(fx, thud(55, 0.9, 0.6), 0.32, 0.8, 0)
    for i in range(22):
        place(fx, type_click(), 0.9 + i * 0.5 / 22 + rng.normal(0, 0.006), 0.4, 0.3)
    mil = wt("L01", "million")
    place(fx, thud(48, 0.9, 0.5), mil - 0.08, 0.9, 0)
    place(fx, bell(2093, 1.8), mil + 0.05, 0.5, -0.2)
    place(fx, bell(2637, 1.6), mil + 0.12, 0.4, 0.2)
    for i in range(9):
        place(fx, coin(), mil + 0.15 + i * 0.07, 0.3, -0.6 + 0.15 * i)
    place(fx, thud(90, 0.4, 0.4), wt("L01", "laziest") - 0.15, 0.5, -0.5)
    place(fx, thud(110, 0.4, 0.4), wt("L01", "smartest") - 0.15, 0.5, 0.5)

    # 01 tape: 500 dots fill, five funds stack, fees row
    d0 = wt("L02", "500") - 0.2
    for i in range(36):
        place(fx, tick(i % 2 == 0), d0 + i * 0.045, 0.10, -0.6 + 0.4 * (i % 3) / 2)
    f0 = wt("L03", "five")
    for i in range(5):
        place(fx, thud(140 + 10 * i, 0.3, 0.6), f0 - 0.1 + i * 0.1, 0.35, 0.4)
    place(fx, thud(200, 0.25, 0.8), wt("L02", "Pay") - 0.1, 0.3, -0.4)

    # 01 clock: one tick per year, then the stamp
    a, b = wt("L04", "2008") - 0.1, wt("L04", "2017.") + 0.2
    for y in range(10):
        place(fx, tick(True), a + (b - a) * (y + 1) / 10, 0.35, -0.5 + y / 9)
    place(fx, thud(60, 0.6, 0.9), wt("L04", "Scored"), 0.95, 0)

    # 02 arith: forecast struck out, "arithmetic", the dots resolve
    place(fx, highpass(noise(0.2), 2500) * np.linspace(1, 0, int(0.2 * SR)) * 0.4, wt("L05", "forecasting") + 0.2, 0.5, 0)
    place(fx, bell(1760, 1.6), wt("L05", "arithmetic"), 0.4, 0)
    place(fx, riser(0.9), wt("L06", "active") - 0.6, 0.25, 0)
    place(fx, bell(1318, 2.2), wt("L06", "together,"), 0.35, -0.2)
    place(fx, bell(1975, 2.0), wt("L06", "are"), 0.3, 0.2)

    # 02 layers: each fee drops off with a clunk; skill vs cost cards
    for w in (wt("L07", "2%"), wt("L07", "20%"), wt("L07", "another")):
        place(fx, thud(95, 0.35, 0.5), w - 0.1, 0.5, 0.2)
        place(fx, sweep(500, 150, 0.6, decay=4), w + 0.45, 0.10, 0.2)
    place(fx, thud(130, 0.3, 0.4), wt("L08", "Skill") - 0.1, 0.45, -0.5)
    place(fx, thud(60, 0.5, 0.8), wt("L08", "Costs") - 0.1, 0.7, 0.5)

    # 03 crash: the 2008 drop, BEHIND, then the clock keeps running
    fell = wt("L09", "fell")
    place(fx, boom(2.6), fell + 0.15, 0.65, 0)
    place(fx, sweep(700, 110, 1.6, decay=1.3), wt("L09", "2008,"), 0.12, 0)
    place(fx, thud(70, 0.5, 0.6), wt("L09", "behind.") - 0.1, 0.7, 0.2)
    m0 = wt("L10", "move.")
    for i in range(6):
        place(fx, tick(i % 2 == 0), m0 + i * 0.5, 0.18, -0.3 if i % 2 else 0.3)

    # 04 bond: paper in, yield sinks, SOLD, the Berkshire card
    place(fx, whoosh(0.6), wt("L11", "Treasury") - 0.35, 0.35, -0.3)
    place(fx, bell(1568, 1.4), wt("L11", "worth"), 0.3, 0)
    place(fx, sweep(900, 220, 1.4, decay=1.2), wt("L12", "2012,") - 0.1, 0.10, 0)
    place(fx, thud(58, 0.7, 0.9), wt("L12", "moved") - 0.1, 0.95, 0)
    place(fx, whoosh(0.8), wt("L12", "moved") + 0.15, 0.45, 0.4)
    place(fx, bell(2349, 1.4), wt("L12", "Berkshire"), 0.35, 0.3)

    # 04 risk: the miss
    place(fx, thud(75, 0.5, 0.7), wt("L13", "miss"), 0.7, 0.5)

    # 05 race: lines run to 2017; the index lands; every one trailed
    place(fx, riser(2.2), wt("L14", "up") - 2.1, 0.35, 0)
    place(fx, thud(52, 0.8, 0.5), wt("L14", "up") - 0.05, 0.8, 0)
    place(fx, bell(1760, 2.0), wt("L14", "up"), 0.45, -0.2)
    e0 = wt("L15", "Every")
    for i in range(5):
        place(fx, tick(True), e0 + i * 0.22, 0.4, 0.5)

    # 05 fees: ten coins land, six in the managers' bin
    s0 = wt("L16", "60%")
    for i in range(10):
        place(fx, coin(), s0 - 0.3 + i * 0.09 + 0.7, 0.45, 0.5 if i < 6 else -0.5)
    place(fx, thud(65, 0.5, 0.5), s0, 0.6, 0)

    # 06 fair: the turn, then three checks
    place(fx, bell(1318, 2.0), wt("L17", "sample.") + 0.2, 0.3, 0)
    place(fx, thud(80, 0.5, 0.5), wt("L18", "But") - 0.2, 0.5, 0)
    for i in range(3):
        place(fx, bell(2637, 0.8), wt("L18", "any") + 0.2 + i * 0.18, 0.35, -0.5 + 0.5 * i)

    # 06 rule: the paper turns; two hits on the lines to remember
    place(fx, whoosh(0.8), scene("rule")["start"] - 0.4, 0.5, 0)
    place(fx, thud(50, 0.9, 0.5), wt("L19", "Fees") - 0.1, 0.85, 0)
    place(fx, thud(55, 0.8, 0.4), wt("L20", "own") - 0.15, 0.7, 0)
    place(fx, boom(3.0), scene("endcard")["start"], 0.5, 0)
    return fx[:N]
