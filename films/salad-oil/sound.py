"""The Salad Oil Test — score harmony and timed sound cues.

Loaded by src/audio.py, which injects its synthesis helpers (place, piano, thud, wt, scene, …)
into this module's namespace before executing it.
"""

# ── score ───────────────────────────────────────────────────────────────────
D2, A2, D3, F3, A3 = 38, 45, 50, 53, 57
CHORDS = {   # scene -> (pad midi notes, arpeggio midi notes, note spacing in seconds, velocity)
    "hook":     ([38, 45, 50],     [62, 69, 65, 74],     1.10, .32),
    "tanks":    ([34, 46, 53],     [65, 70, 74, 70],     0.375, .22),
    "receipt":  ([43, 50, 55],     [67, 70, 74, 79],     0.375, .22),
    "crash":    ([45, 49, 52, 55], [69, 73, 76, 79],     0.1875, .20),
    "question": ([46, 53, 57, 62], [74, 77, 81],         0.75, .26),
    "field":    ([38, 50, 53, 57], [62, 65, 69, 72, 69, 65], 0.25, .18),
    "scale":    ([34, 46, 50, 53], [65, 70, 74, 77],     0.375, .20),
    "sizing":   ([41, 48, 53, 57], [65, 69, 72, 77],     0.375, .22),
    "result":   ([38, 50, 54, 57], [62, 66, 69, 74, 78], 0.25, .24),
    "grid":     ([43, 50, 55, 59], [67, 71, 74, 79],     0.375, .20),
    "rule":     ([45, 52, 57, 61], [69, 73, 76, 81],     0.5, .18),
    "endcard":  ([38, 50, 54, 57, 62], [74, 78, 81, 86], 0.6, .26),
}


# ── sound design ────────────────────────────────────────────────────────────
def build_sfx():
    """Timed sound cues for this film. Engine helpers are injected by src/audio.py."""
    fx = np.zeros((N + SR * 4, 2))
    impact = 1.05
    place(fx, drip(), impact, 0.6, 0)
    place(fx, splash(), impact, 0.5, 0)
    place(fx, sub_drop(), impact, 0.9, 0)
    place(fx, riser(1.0), impact - 0.95, 0.5, 0)
    # typing on the partnership ledger
    t0 = wt("L01", "Warren") - 0.05
    for i in range(18):
        place(fx, type_click(), t0 + i * 1.4 / 25 + rng.normal(0, 0.008), 0.5, 0.2)
    # title slam
    place(fx, thud(55, 0.8, 0.6), wt("L01", "fraud") - 0.12, 0.8, 0)
    # whooshes at scene changes
    for k, sc in enumerate(TL["scenes"][1:]):
        place(fx, whoosh(0.6), sc["start"] - 0.32, 0.45, -0.5 if k % 2 else 0.5)
    # tanks rise, metallic tick when the cut-away opens
    tk = scene("tanks")["start"]
    for i in range(3):
        place(fx, thud(90, 0.4, 0.2), tk + 0.15 + i * 0.12, 0.35, -0.6 + 0.6 * i)
    place(fx, riser(0.7), wt("L02", "soybean") - 0.3, 0.3, 0)
    # counter ticks
    t = wt("L02", "borrowed")
    while t < wt("L02", "borrowed") + 2.2:
        place(fx, tick(), t, 0.10, 0.4)
        t += 0.06
    # receipt: paper slide, signature, stamp
    place(fx, whoosh(0.5), scene("receipt")["start"], 0.3, 0)
    place(fx, thud(60, 0.6, 0.9), wt("L03", "vouched") - 0.05, 1.0, 0.15)
    # crash: boom and falling tone
    surf = wt("L04", "surfaced")
    place(fx, boom(2.5), surf + 0.05, 0.6, 0)
    place(fx, sweep(600, 120, 1.4, decay=1.5), surf + 0.1, 0.12, 0)
    place(fx, thud(48, 0.7, 0.3), wt("L04", "nearly") - 0.1, 0.6, 0)
    # question: headline slaps, then the question mark
    q0 = scene("question")["start"]
    for i in range(6):
        place(fx, thud(120 + 15 * i, 0.25, 0.7), q0 + 0.1 + i * 0.22 + 0.05, 0.28, -0.6 + 0.24 * i)
    place(fx, bell(1318, 2.0), wt("L05", "sharper"), 0.5, 0)
    # field: a clock ticking under the research; checkmarks ding like a register
    a, b = scene("field")["start"], scene("field")["end"]
    t, i = a + 0.2, 0
    while t < b - 0.2:
        place(fx, tick(i % 2 == 0), t, 0.13, -0.3 if i % 2 else 0.3)
        t += 0.5
        i += 1
    place(fx, thud(80, 0.5, 0.3), wt("L07", "desk") - 0.1, 0.5, 0)        # pin drop
    for w in (wt("L08", "paid") + 0.3, wt("L08", "travelers") + 0.3):
        place(fx, bell(2637, 1.2), w, 0.55, 0.2)
        place(fx, bell(3136, 1.0), w + 0.08, 0.35, 0.2)
    # scale: coins stacking
    intact, cmp = wt("L09", "intact"), wt("L09", "compounding")
    span = (cmp - intact) + 1.0
    for c in range(1, 14):
        # coin c appears when grow crosses c/13 (eIO easing inverted roughly)
        k = c / 13
        u = (k / 4) ** (1 / 3) if k < 0.5 else 1 - ((2 - 2 * k) ** (1 / 3)) / 2
        place(fx, coin(), intact - 0.3 + u * span, 0.5, 0.5)
    place(fx, thud(70, 0.4, 0.3), wt("L09", "finite") - 0.1, 0.5, -0.5)
    # sizing: ring fill riser
    place(fx, riser(1.4), wt("L10", "40") - 1.1, 0.35, 0)
    place(fx, bell(1760, 1.6), wt("L10", "40") + 0.2, 0.35, 0)
    # result: lift
    place(fx, riser(1.6), wt("L11", "doubled") - 1.4, 0.3, 0)
    place(fx, thud(65, 0.5, 0.4), wt("L11", "doubled"), 0.6, 0)
    # grid: strike-out scratch, cell pops
    place(fx, highpass(noise(0.18), 2500) * np.linspace(1, 0, int(0.18 * SR)) * 0.4, wt("L12", "outcome") - 0.1, 0.5, 0)
    for i in range(4):
        place(fx, tick(), wt("L12", "Learn") + i * 0.08, 0.3, -0.4 + 0.27 * i)
    # rule: paper turn, "Go test it." hit
    place(fx, whoosh(0.8), scene("rule")["start"] - 0.4, 0.5, 0)
    place(fx, thud(50, 0.9, 0.5), wt("L13", "Go") - 0.1, 0.9, 0)
    place(fx, boom(3.0), scene("endcard")["start"], 0.5, 0)
    return fx[:N]
