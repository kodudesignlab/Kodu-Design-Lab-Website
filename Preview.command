#!/bin/zsh
# Double-click me: builds the site and opens a local preview (no publishing).
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
node scripts/build.js || { echo "\n✗ Build failed. Press any key to close."; read -k1; exit 1; }
echo "\n▶ Preview running at http://localhost:5173 — close this window to stop."
(sleep 1.5; open http://localhost:5173) &
npx -y serve -l 5173 .
