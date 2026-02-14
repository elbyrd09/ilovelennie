#!/bin/sh
# Run this from the project folder to push to GitHub Pages (ilovelennie repo).
set -e
REPO_URL="https://github.com/elbyrd09/ilovelennie.git"

if [ ! -d .git ]; then
  git init
  git remote add origin "$REPO_URL"
fi

# Use main branch (create if needed)
git checkout -b main 2>/dev/null || git checkout main 2>/dev/null || true

git add index.html styles.css app.js .nojekyll .gitignore README.md copy-audio.sh
git add audio/ images/ 2>/dev/null || true
git add server.js 2>/dev/null || true
git status

echo ""
echo "Review the files above. Then run:"
echo "  git commit -m 'Initial commit: V-Day Bahb Chronicles'"
echo "  git push -u origin main"
echo ""
echo "Then in GitHub: Settings → Pages → Source: Deploy from branch → main → / (root) → Save"
