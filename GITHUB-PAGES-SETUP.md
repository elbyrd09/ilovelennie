# Quick setup: Push to GitHub & turn on Pages

Repo: **https://github.com/elbyrd09/ilovelennie**

---

## Step 1: Push the project to GitHub

Open a terminal, go to this project folder, then run these commands **in order**.

```bash
cd /Users/evanbyrd/yearly-chronicle
```

If this folder **does not** have a `.git` folder yet:

```bash
git init
git remote add origin https://github.com/elbyrd09/ilovelennie.git
```

Then (whether or not you just ran the lines above):

```bash
git add index.html styles.css app.js .nojekyll .gitignore README.md copy-audio.sh server.js
git add audio
git add images
git status
```

Check that `audio/` and `images/` are listed (and that `.env` is **not** listed). Then:

```bash
git commit -m "V-Day Bahb Chronicles"
git branch -M main
git push -u origin main
```

If GitHub asks you to sign in or use a personal access token, do that. When the push succeeds, the code is on the remote.

---

## Step 2: Turn on GitHub Pages

1. In your browser, go to **https://github.com/elbyrd09/ilovelennie**
2. Click **Settings**
3. In the left sidebar, click **Pages**
4. Under **“Build and deployment”**:
   - **Source:** choose **“Deploy from a branch”**
   - **Branch:** choose **main**
   - **Folder:** choose **“/ (root)”**
5. Click **Save**

---

## Step 3: Wait and open the site

After 1–2 minutes, the site will be live at:

**https://elbyrd09.github.io/ilovelennie/**

Open that URL to confirm it loads.

---

## If the repo already has files (e.g. a README)

If GitHub created the repo with a README or license and the first push fails with “updates were rejected”:

```bash
git pull origin main --allow-unrelated-histories
# Resolve any conflicts if your editor opens files, then:
git add -A && git commit -m "Merge with repo" && git push origin main
```

Or, to overwrite the remote with your local project (only do this if you’re fine replacing what’s on GitHub):

```bash
git push -u origin main --force
```

---

**Summary:** Run the commands in Step 1 from `yearly-chronicle`, then do Step 2 in the repo Settings. Your stage right now is “quick setup on the remote repo,” and that’s exactly what this file walks through.
