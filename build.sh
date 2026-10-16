#!/usr/bin/env bash
# Rebuild a film from source.
#   ./build.sh <film>            full build -> output/<slug>.mp4      (films: ten-year-bet, salad-oil)
#   ./build.sh <film> --stills   only render review stills -> build/<film>/stills/
set -euo pipefail
cd "$(dirname "$0")"
FILM="${1:-ten-year-bet}"
B="build/$FILM"
MODELS="${KOKORO_MODELS:-build/models}"
SLUG=$(python3 -c "import json; print(json.load(open('films/$FILM/script.json'))['slug'])")
TITLE=$(python3 -c "import json; print(json.load(open('films/$FILM/script.json'))['title'])")
mkdir -p "$B" output "$MODELS"

# 1. Voice model (Kokoro-82M, Apache-2.0), fetched once.
REL=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -f "$MODELS/kokoro-v1.0.onnx" ] || curl -sSL -o "$MODELS/kokoro-v1.0.onnx" "$REL/kokoro-v1.0.onnx"
[ -f "$MODELS/voices-v1.0.bin" ]  || curl -sSL -o "$MODELS/voices-v1.0.bin"  "$REL/voices-v1.0.bin"

# 2. Narration and timeline
python3 src/tts.py "$FILM" "$MODELS"

if [ "${2:-}" = "--stills" ]; then
  DUR=$(python3 -c "import json; print(json.load(open('$B/timeline.json'))['duration'])")
  node src/render.mjs "$FILM" --stills "$(python3 -c "print(','.join(str(round(x*$DUR/24,2)) for x in range(1,24)))")"
  exit 0
fi

# 3. Score, SFX and mix
python3 src/audio.py "$FILM"

# 4. Master: gentle glue compression, a limiter, then two-pass loudness normalisation to -14 LUFS / -2 dBTP.
PRE="acompressor=threshold=-20dB:ratio=2:attack=15:release=250,alimiter=limit=0.9:level=false"
M=$(ffmpeg -hide_banner -i "$B/mix_raw.wav" -af "$PRE,loudnorm=I=-14:TP=-2.0:LRA=9:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { python3 -c "import json,sys; print(json.loads(sys.argv[1])['$1'])" "$M"; }
ffmpeg -hide_banner -loglevel error -y -i "$B/mix_raw.wav" -af "$PRE,loudnorm=I=-14:TP=-2.0:LRA=9:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" -ar 48000 "$B/mix.wav"

# 5. Picture
node src/render.mjs "$FILM"

# 6. Mux the picture and sound, then make a poster frame
ffmpeg -hide_banner -loglevel error -y -i "$B/video.mp4" -i "$B/mix.wav" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 21 -tune film -pix_fmt yuv420p -maxrate 12M -bufsize 24M -c:a aac -b:a 256k -shortest \
  -metadata title="$TITLE" -metadata comment="Educational content. Not investment advice." -movflags +faststart "output/$SLUG.mp4"
POSTER=$(python3 -c "import json; print(json.load(open('films/$FILM/script.json')).get('poster', 5.9))")
node src/render.mjs "$FILM" --stills "$POSTER" && cp "$B/stills/t_$(printf '%.2f' "$POSTER").jpg" "output/$SLUG-poster.jpg"
echo "-> output/$SLUG.mp4"
