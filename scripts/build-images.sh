#!/bin/zsh
# Builds responsive JPG variants (1200 / 2000 / 2800 wide, q88) from the source folder.
# Usage: scripts/build-images.sh "images/Courtside Wines" images/courtside-wines
# Never upscales — widths larger than the source are skipped.
set -e
SRC="$1"; OUT="$2"; Q=88
mkdir -p "$OUT"
build() { # build <source file> <slug>
  local f="$1" slug="$2" w
  local srcw=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  for w in 1200 2000 2800; do
    if [ "$w" -le "$srcw" ]; then
      sips -s format jpeg -s formatOptions $Q --resampleWidth $w "$f" --out "$OUT/$slug-$w.jpg" >/dev/null
    fi
  done
  # if the source is narrower than 2800 also keep a full-res copy under its own width
  if [ "$srcw" -lt 2800 ] && { [ "$srcw" -gt 2000 ] || [ "$srcw" -lt 1200 ]; }; then
    sips -s format jpeg -s formatOptions $Q "$f" --out "$OUT/$slug-$srcw.jpg" >/dev/null
  fi
  echo "$slug ← $(basename "$f") (${srcw}px)"
}
build "$SRC/CSW_ToteBag_RoyalBlue_MockUp_WEB.jpg"          tote
build "$SRC/CSW_Graphic_On_VinyardPhoto_WEB.jpg"           vineyard-graphic
build "$SRC/Boxy Modelled Tshirt Front_WEB.jpg"            tshirt-front
build "$SRC/Boxy Modelled Tshirt Back_WEB.jpg"             tshirt-back
build "$SRC/CSW_BusniessCard_OnRock_Mockup_V1_WEB.jpg"     business-card
build "$SRC/Poster Designers A4 Digital WEB.jpg"           poster-01
build "$SRC/Poster Designers A4 Digital_Truch_WEB.jpg"     poster-02
build "$SRC/Poster Designers A4 Digital_WEB.jpg"           poster-03
build "$SRC/CSW_Multi-Mag MockUp_WEB.jpg"                  multi-mag
build "$SRC/CSW_MacbookConcrete_Mockup_WEB_V1.jpg"         macbook-01
build "$SRC/CSW_MacBookConcreet MockUp_LM_WEB.jpg"         macbook-02
