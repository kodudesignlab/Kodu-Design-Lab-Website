#!/bin/zsh
# Builds responsive JPG variants (1200 / 2000 / 2800 wide, q88) for a project.
#   Usage: scripts/build-images.sh <project-slug>
# Reads scripts/maps/<slug>.txt — one image per line:  <source folder>|<source file>|<output slug>
# Output goes to images/<slug>/<output slug>-<width>.jpg. Never upscales.
set -e
SLUG="$1"; MAP="scripts/maps/$SLUG.txt"; OUT="images/$SLUG"; Q=88
[ -f "$MAP" ] || { echo "No map at $MAP"; exit 1; }
mkdir -p "$OUT"
while IFS='|' read -r src file slug; do
  [ -z "$src" ] && continue
  f="$src/$file"
  srcw=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  widths=""
  for w in 1200 2000 2800; do
    if [ "$w" -le "$srcw" ]; then
      sips -s format jpeg -s formatOptions $Q --resampleWidth $w "$f" --out "$OUT/$slug-$w.jpg" >/dev/null
      widths="$widths $w"
    fi
  done
  # keep a native-width copy when the source is smaller than 2800 and not already a standard size
  if [ "$srcw" -lt 2800 ] && [ "$srcw" -ne 2000 ] && [ "$srcw" -ne 1200 ]; then
    sips -s format jpeg -s formatOptions $Q "$f" --out "$OUT/$slug-$srcw.jpg" >/dev/null
    widths="$widths $srcw"
  fi
  echo "$slug ← $file (${srcw}px) → widths:$widths"
done < "$MAP"
