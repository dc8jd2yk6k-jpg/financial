"""Narration: synthesise each script line with Kokoro, then measure the timings.

Usage: python3 src/tts.py <film> [models_dir]

Reads films/<film>/script.json. Writes build/<film>/vo/<id>.wav (trimmed, 24 kHz
mono) and build/<film>/timeline.json. The timeline holds
each line's start and end in the film, approximate per-word timings for the
captions, and the scene and chapter spans. Word timings come from the silences
inside each clip: the longest pauses are matched to punctuation breaks, and
words inside a phrase are spread by spoken weight.
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
FILM = sys.argv[1] if len(sys.argv) > 1 else "ten-year-bet"
MODELS = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "build" / "models"
BUILD = ROOT / "build" / FILM
VO = BUILD / "vo"
SR = 24000
SCRIPT = json.loads((ROOT / "films" / FILM / "script.json").read_text())

# Pacing. Each film's script.json can override any of these.
P = {"duration": 60.0, "lead_in": 0.40, "gap_line": 0.24, "gap_chapter": 0.55,
     "end_card": 2.9, "end_card_gap": 1.1, "speed": 1.13, **SCRIPT.get("pacing", {})}
FILM_LEN, LEAD_IN, GAP_LINE, GAP_CHAPTER = P["duration"], P["lead_in"], P["gap_line"], P["gap_chapter"]
END_CARD, SPEED = P["end_card"], P["speed"]


def trim(x, thresh=0.012, pad=0.04):
    env = np.abs(x)
    idx = np.where(env > thresh)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]


def silences(x, win=0.01, thresh_db=-38, min_len=0.09):
    """Return [(start, end)] of internal silences, in seconds."""
    n = int(win * SR)
    frames = len(x) // n
    rms = np.sqrt(np.mean(x[: frames * n].reshape(frames, n) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms / (rms.max() + 1e-12))
    quiet = db < thresh_db
    out, i = [], 0
    while i < frames:
        if quiet[i]:
            j = i
            while j < frames and quiet[j]:
                j += 1
            if (j - i) * win >= min_len and i > 0 and j < frames:
                out.append((i * win, j * win))
            i = j
        else:
            i += 1
    return out


def word_weight(w):
    core = re.sub(r"[^\w%']", "", w)
    weight = max(1, len(core))
    if re.search(r"\d", core):
        weight *= 3.5          # "1963" and "40%" take far longer to say than to write
    return weight + 1.5        # a fixed cost per word for onset and transition


def phrases_of(text):
    """Split the display text into phrases at punctuation that usually makes a pause."""
    words = text.split()
    groups, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"(\.\.\.|[,.:;?!—])$", w):
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    return groups


def word_times(text, audio):
    dur = len(audio) / SR
    groups = phrases_of(text)
    gaps = silences(audio)
    need = len(groups) - 1
    if need > 0 and len(gaps) >= need:
        chosen = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[:need])
        spans, t = [], 0.0
        for g in chosen:
            spans.append((t, g[0]))
            t = g[1]
        spans.append((t, dur))
    else:
        # Fallback: one span for the whole line. Phrases share it by weight.
        spans = None
    out = []
    if spans:
        for grp, (a, b) in zip(groups, spans):
            out += spread(grp, a, b)
    else:
        out = spread([w for g in groups for w in g], 0.0, dur)
    return out


def spread(words, a, b):
    ws = [word_weight(w) for w in words]
    tot = sum(ws)
    t, out = a, []
    for w, k in zip(words, ws):
        d = (b - a) * k / tot
        out.append({"w": w, "t0": round(t, 3), "t1": round(t + d, 3)})
        t += d
    return out


def main():
    script = SCRIPT
    VO.mkdir(parents=True, exist_ok=True)
    kokoro = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))

    clips = []
    for line in script["lines"]:
        say = line.get("say", line["text"])
        samples, sr = kokoro.create(say, voice=script["voice"], speed=SPEED, lang="en-us")
        assert sr == SR
        x = trim(np.asarray(samples, dtype=np.float32))
        sf.write(VO / f"{line['id']}.wav", x, SR)
        clips.append((line, x))
        print(f"{line['id']}: {len(x)/SR:5.2f}s  {say[:60]}")

    # Lay the lines out on the film's clock.
    t = LEAD_IN
    lines_out = []
    prev_ch = None
    for line, x in clips:
        if prev_ch is not None:
            t += GAP_CHAPTER if line["chapter"] != prev_ch else GAP_LINE
        dur = len(x) / SR
        words = [{"w": w["w"], "t0": round(t + w["t0"], 3), "t1": round(t + w["t1"], 3)}
                 for w in word_times(line["text"], x)]
        lines_out.append({**line, "start": round(t, 3), "end": round(t + dur, 3), "words": words})
        t += dur
        prev_ch = line["chapter"]

    voice_end = t
    total = voice_end + END_CARD
    print(f"voice ends {voice_end:.2f}s, film {total:.2f}s (target {FILM_LEN}s)")
    if total > FILM_LEN + 0.01:
        print("WARNING: narration is too long for the film; raise SPEED or trim the script")
    duration = FILM_LEN

    # Scene spans: each scene runs from its first line's start (pulled back
    # half a gap, for the transition) to the next scene's start.
    scenes = []
    for ln in lines_out:
        if scenes and scenes[-1]["id"] == ln["scene"]:
            scenes[-1]["lines"].append(ln["id"])
            continue
        scenes.append({"id": ln["scene"], "chapter": ln["chapter"], "lines": [ln["id"]],
                       "start": ln["start"]})
    scenes[0]["start"] = 0.0
    for i, sc in enumerate(scenes):
        if i > 0:
            prev_end = next(l["end"] for l in lines_out if l["id"] == scenes[i - 1]["lines"][-1])
            sc["start"] = round((prev_end + sc["start"]) / 2, 3)
    scenes.append({"id": "endcard", "chapter": "rule", "lines": [],
                   "start": round(voice_end + P["end_card_gap"], 3)})
    for i, sc in enumerate(scenes):
        sc["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else duration

    chapters = []
    for ch in script["chapters"]:
        own = [s for s in scenes if s["chapter"] == ch["id"]]
        chapters.append({**ch, "start": own[0]["start"], "end": own[-1]["end"]})

    timeline = {"title": script["title"], "fps": 30, "duration": duration,
                "voiceEnd": round(voice_end, 3), "lines": lines_out,
                "scenes": scenes, "chapters": chapters}
    (BUILD / "timeline.json").write_text(json.dumps(timeline, indent=1))
    print("wrote", BUILD / "timeline.json")


if __name__ == "__main__":
    main()
