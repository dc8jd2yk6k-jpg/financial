"""Score, sound design and the final mix, all synthesised from scratch.

Usage: python3 src/audio.py <film>

Reads build/<film>/timeline.json and build/<film>/vo/*.wav, plus the film's
films/<film>/sound.py, which supplies CHORDS (scene -> harmony) and build_sfx()
(timed cues). Writes build/<film>/music.wav (score + SFX) and
build/<film>/mix_raw.wav (with the voice ducked over it). build.sh then
loudness-normalises the mix to -14 LUFS.
"""
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

ROOT = Path(__file__).resolve().parent.parent
FILM = sys.argv[1] if len(sys.argv) > 1 else "ten-year-bet"
BUILD = ROOT / "build" / FILM
SR = 48000
TL = json.loads((BUILD / "timeline.json").read_text())
DUR = TL["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(7)


# ── timeline helpers (mirror web/index.html) ────────────────────────────────
def line(i):
    return next(l for l in TL["lines"] if l["id"] == i)


def wt(i, frag, nth=0):
    n = 0
    for w in line(i)["words"]:
        if frag.lower() in w["w"].lower():
            if n == nth:
                return w["t0"]
            n += 1
    raise KeyError((i, frag))


def scene(i):
    return next(s for s in TL["scenes"] if s["id"] == i)


# ── synthesis primitives ────────────────────────────────────────────────────
def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, x, t, gain=1.0, pan=0.0):
    """Mix mono x into stereo buf at time t with constant-power pan (-1..1)."""
    i = int(t * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * gain * l
    buf[i:i + len(x), 1] += x * gain * r


def env_adsr(n, a=0.005, d=0.0, s=1.0, r=0.05):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) if na else e[:na]
    if nd:
        e[na:na + nd] = np.linspace(1, s, nd)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def piano(f, dur=3.0, vel=0.5):
    """Soft felt-piano note: inharmonic partials, per-partial decay, hammer thump."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.0004
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > SR / 2.2:
            break
        amp = (1 / k ** 1.6) * (0.6 + 0.4 * vel)
        dec = 1.1 + 0.55 * k + f / 900
        out += amp * np.sin(2 * np.pi * fk * t + rng.random() * 6) * np.exp(-dec * t)
    out *= env_adsr(n, a=0.004, r=0.3)
    thump = rng.normal(0, 1, int(0.02 * SR)) * np.exp(-np.arange(int(0.02 * SR)) / (0.003 * SR)) * 0.05
    out[: len(thump)] += thump
    return out * vel


def pad(freqs, dur, attack=1.5, release=1.5, bright=6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.0045):
            ff = f * (1 + det)
            for k in range(1, bright + 1):
                out += (1 / k ** 1.3) * np.sin(2 * np.pi * ff * k * t + rng.random() * 6)
    out *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + rng.random() * 6) ** 2
    out *= env_adsr(n, a=attack, r=release)
    return out / (len(freqs) * 3 * 2.2)


def lowpass(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def highpass(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bandpass(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def noise(dur):
    return rng.normal(0, 1, int(dur * SR))


def sweep(f0, f1, dur, decay=4.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-decay * t) * env_adsr(n, a=0.003, r=0.05)


def reverb_ir(dur=2.8, damp=2.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ir = np.stack([rng.normal(0, 1, n), rng.normal(0, 1, n)], 1) * np.exp(-damp * t)[:, None]
    ir[:, 0] = lowpass(ir[:, 0], 6000)
    ir[:, 1] = lowpass(ir[:, 1], 6000)
    return ir / np.sqrt((ir ** 2).sum() / 2)


# ── SFX ──────────────────────────────────────────────────────────────────────
def whoosh(dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = noise(dur)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2.5
    # Sweep a band-pass up across the swell by filtering in chunks.
    out = np.zeros(n)
    chunks = 12
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        fc = 300 + 2600 * (c / chunks)
        out[a:b] = bandpass(x, fc * 0.6, fc * 1.6)[a:b]
    return out * e * 0.5


def sub_drop(dur=2.2):
    return sweep(90, 32, dur, decay=1.6) * 1.0


def drip():
    x = sweep(500, 1500, 0.09, decay=25) * 0.6
    y = sweep(1800, 900, 0.05, decay=40) * 0.2
    x[: len(y)] += y
    return x


def splash():
    x = highpass(noise(0.5), 1200) * np.exp(-np.arange(int(0.5 * SR)) / (0.08 * SR))
    return x * 0.25


def thud(f=70, dur=0.5, click=0.4):
    n = int(dur * SR)
    body = sweep(f * 1.8, f, dur, decay=9)
    c = highpass(noise(0.03), 2000) * np.exp(-np.arange(int(0.03 * SR)) / (0.004 * SR)) * click
    body[: len(c)] += c
    return body


def tick(bright=True):
    n = int(0.025 * SR)
    x = highpass(noise(0.025), 3000 if bright else 1500) * np.exp(-np.arange(n) / (0.0025 * SR))
    return x * 0.5


def type_click():
    n = int(0.03 * SR)
    x = bandpass(noise(0.03), 1500, 6000) * np.exp(-np.arange(n) / (0.004 * SR))
    return x * 0.35


def bell(f=2093, dur=1.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d)
            for a, r, d in [(1, 1, 3), (.5, 2.76, 5), (.3, 5.4, 8), (.15, 8.9, 12)])
    return x * env_adsr(n, a=0.002, r=0.05) * 0.18


def coin():
    x = bell(3200 + rng.random() * 600, 0.35) * 0.6
    c = tick() * 0.4
    x[: len(c)] += c
    return x


def boom(dur=3.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 42 * t) * np.exp(-1.4 * t) + lowpass(noise(dur), 200) * np.exp(-3 * t) * 0.6
    return x * env_adsr(n, a=0.01, r=0.3)


def riser(dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = highpass(noise(dur), 2000) * (t / dur) ** 3
    return x * 0.25 * env_adsr(n, a=0.01, r=0.04)


# ── score ───────────────────────────────────────────────────────────────────
def load_film():
    """Execute films/<film>/sound.py with this module's helpers in its namespace."""
    spec = importlib.util.spec_from_file_location("film_sound", ROOT / "films" / FILM / "sound.py")
    mod = importlib.util.module_from_spec(spec)
    mod.__dict__.update({k: v for k, v in globals().items() if not k.startswith("__")})
    spec.loader.exec_module(mod)
    return mod


def build_score(CHORDS, END=(26, [50, 57, 62, 66, 69])):
    """END = (bass midi note, final chord notes) for the end card."""
    mus = np.zeros((N + SR * 4, 2))
    for sc in TL["scenes"]:
        notes, arp, step, vel = CHORDS[sc["id"]]
        a, b = sc["start"], sc["end"]
        dur = b - a
        p = pad([midi(m) for m in notes], dur + 1.4, attack=0.5 if sc["id"] != "hook" else 2.5, release=1.2)
        if sc["id"] == "rule":
            p *= 0.75
        place(mus, p, max(0, a - 0.2), 0.55, 0)
        # arpeggio
        t = a + (1.05 if sc["id"] == "hook" else 0.0)
        i = 0
        while t < b - 0.1:
            m = arp[i % len(arp)]
            v = vel * (0.85 + 0.3 * rng.random()) * (1.15 if i % len(arp) == 0 else 1.0)
            place(mus, piano(midi(m), 2.4, v), t + rng.normal(0, 0.006), 0.9, -0.35 + 0.7 * (i % len(arp)) / max(1, len(arp) - 1))
            t += step
            i += 1
        # bass note at each scene change
        place(mus, piano(midi(notes[0] - 12 if notes[0] > 40 else notes[0]), 4.0, 0.55), a, 0.9, 0)
    # end: sustained low D and final chord
    place(mus, piano(midi(END[0]), 6.0, 0.7), scene("endcard")["start"], 1.0, 0)
    for k, m in enumerate(END[1]):
        place(mus, piano(midi(m), 5.0, 0.35), scene("endcard")["start"] + 0.05 * k, 0.9, -0.4 + 0.2 * k)
    # reverb
    ir = reverb_ir()
    wet = np.stack([fftconvolve(mus[:, 0], ir[:, 0])[: len(mus)], fftconvolve(mus[:, 1], ir[:, 1])[: len(mus)]], 1)
    mus = mus * 0.7 + wet * 0.22
    # intensity: quieter under the hook's opening, a little up through the test
    return mus[:N]


def load_vo():
    vo = np.zeros(N)
    for ln in TL["lines"]:
        x, sr = sf.read(BUILD / "vo" / f"{ln['id']}.wav")
        x = resample_poly(x, SR, sr)
        x = highpass(x, 75)
        i = int(ln["start"] * SR)
        vo[i:i + len(x)] += x[: N - i]
    return vo


def main():
    film = load_film()
    music = build_score(film.CHORDS, getattr(film, "END", (26, [50, 57, 62, 66, 69])))
    sfx = film.build_sfx()
    vo = load_vo()

    # Duck the music under the voice (smoothed envelope, fast attack, slow release).
    env = np.abs(vo)
    win = int(0.25 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    env = env / (env.max() + 1e-9)
    duck = 1 - 0.5 * np.clip(env * 4, 0, 1)
    music = music * duck[:, None]
    music = np.stack([highpass(music[:, c], 55) for c in (0, 1)], 1)   # keep the low end clear for the voice

    music_bus = music * 0.32 + sfx * 0.5
    # Gentle fade in and out
    fade = np.ones(N)
    fade[: int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR))
    fade[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR))
    music_bus *= fade[:, None]
    sf.write(BUILD / "music.wav", music_bus.astype(np.float32), SR)

    mix = music_bus + np.stack([vo, vo], 1) * 1.0
    peak = np.abs(mix).max()
    mix = mix / peak * 0.89
    sf.write(BUILD / "mix_raw.wav", mix.astype(np.float32), SR, subtype="FLOAT")
    print(f"mix peak before norm {peak:.2f}; wrote {BUILD / 'mix_raw.wav'}")


if __name__ == "__main__":
    main()
