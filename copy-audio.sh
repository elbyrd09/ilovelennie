#!/bin/sh
# Copy V-Day MP3s from Desktop/claude_vday into this project's audio/ folder.
# Expects files named 2019_vday.mp3, 2020_vday.mp3, etc. Run from project root: ./copy-audio.sh

SOURCE="${1:-$HOME/Desktop/claude_vday}"
DEST="$(dirname "$0")/audio"
mkdir -p "$DEST"

for year in 2018 2019 2020 2021 2022 2023 2024 2025; do
  for name in "${year}_vday" "$year"; do
    for ext in mp3 MP3; do
      if [ -f "$SOURCE/$name.$ext" ]; then
        cp "$SOURCE/$name.$ext" "$DEST/${year}_vday.mp3" && echo "Copied $name.$ext -> audio/${year}_vday.mp3"
        break 2
      fi
    done
  done
done

echo "Done. App expects audio/2018_vday.mp3 through audio/2025_vday.mp3. Run: node server.js"
