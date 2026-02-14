# The V-Day Bahb Chronicles

A romantic single-page web app: eight years (2018–2025), imagery, and a **Reflections of Bahbs in Love** page. One **Listen to the Bahb story** / **Pause the Bahb story** button plays the current year’s audio (2019–2025 only; no audio on 2018 or Reflections).  
**Audio:** The app looks for `audio/2019_vday.mp3` … `audio/2025_vday.mp3`. Put those files in the project’s `audio/` folder (or run with `AUDIO_DIR=/path/to/folder node server.js`). When you run `node server.js`, it prints which MP3s it found.  
**Images:** Put `2018_firstpage.jpg` (or `.png`) and `1_newPage.png` … `4_newPage.png` in `images/` for the 2018 first page and the Reflections page.

## Deploy to GitHub Pages

**Repo:** [github.com/elbyrd09/ilovelennie](https://github.com/elbyrd09/ilovelennie)

The app is set up for static hosting. To finish setup:

1. **Push this project** to the repo (if not already):
   ```bash
   cd yearly-chronicle
   git init
   git remote add origin https://github.com/elbyrd09/ilovelennie.git
   git add index.html styles.css app.js .nojekyll .gitignore README.md copy-audio.sh setup-github-pages.sh server.js audio/ images/
   git commit -m "V-Day Bahb Chronicles"
   git branch -M main
   git push -u origin main
   ```
2. **Turn on Pages:** GitHub → **ilovelennie** → **Settings** → **Pages** → **Source**: “Deploy from a branch” → **Branch**: `main`, **Folder**: `/ (root)` → **Save**.
3. The site will be at **https://elbyrd09.github.io/ilovelennie/** (may take 1–2 minutes).

Do not push `.env` or `node_modules`. The `.nojekyll` file is included so all assets are served as-is.

## What’s in the project

- **8 static “year” pages** (2018–2025), each with:
  - A year heading  
  - An image  
  - Body text  
  - A “Listen to this year” button for narration  

- **Simple navigation**
  - **Previous** / **Next** to move between years  
  - Dot indicators to jump to any year  

- **Romantic theme**
  - Cream, blush, and dusty rose palette  
  - **Great Vibes** for headings (elegant script)  
  - **Cormorant Garamond** for body text  
  - Soft shadows and gentle transitions  

- **Narration**
  - **ElevenLabs (recommended):** Run the included Node server with your API key and a voice ID for a rich, documentary-style narrator (e.g. David Attenborough–style). See [ElevenLabs setup](#elevenlabs-setup-david-attenborough-style-voice) below.
  - **Fallback:** If the server isn’t running or isn’t configured, the app uses the browser’s **Web Speech API** with a British English voice.

## How to run

1. **With ElevenLabs narration (recommended)**  
   From the project folder, add a `.env` file (see [ElevenLabs setup](#elevenlabs-setup-david-attenborough-style-voice)), then:

   ```bash
   node server.js
   ```

   Open **http://localhost:3000**. “Listen to this year” will use your chosen ElevenLabs voice.

2. **Without ElevenLabs (browser TTS only)**  
   Serve the app with any static server, e.g.:

   ```bash
   python3 -m http.server 8080
   # or: npx serve -p 8080
   ```

   Open **http://localhost:8080**. Narration uses the browser’s British English voice.

3. **Open file directly**  
   Double-click `index.html`. Narration will use browser TTS (and may not work on `file://` in some browsers).

### ElevenLabs setup (David Attenborough–style voice)

ElevenLabs doesn’t offer a named “David Attenborough” voice for legal/rights reasons. You can get a similar **warm, British documentary-narrator** sound in two ways:

1. **Voice Library**  
   Go to [elevenlabs.io/voice-library](https://elevenlabs.io/voice-library) and search for **British**, **narrator**, or **documentary**. Pick a voice you like and copy its **Voice ID** (from the voice’s page or when you use it in the app).

2. **Voice Design or Voice Clone**  
   In the ElevenLabs dashboard you can design a custom voice or clone a voice (subject to their terms and your rights to the source). Use the resulting voice’s **Voice ID**.

Then:

1. Get your **API key**: [elevenlabs.io](https://elevenlabs.io) → Profile → **API Key**.
2. Copy `.env.example` to `.env` in this project folder.
3. Set in `.env`:
   - `ELEVENLABS_API_KEY=` your API key  
   - Either **one voice for all years:** `ELEVENLABS_VOICE_ID=` a Voice ID  
   - Or **a different British narrator per year:** set `ELEVENLABS_VOICE_2018`, `ELEVENLABS_VOICE_2019`, … `ELEVENLABS_VOICE_2025` (eight different Voice IDs from the library). Each year’s “Listen” will use that year’s voice so you can compare.
4. Run `node server.js` and open **http://localhost:3000**.

The API key stays on the server (in `.env`); the browser only talks to your local `/api/speak` endpoint.

## Editing content

- **Text:** Edit the `<div class="year-text">` blocks inside each `<article id="year-YYYY">` in `index.html`.  
- **Images:** Change the `style="background-image: url('...')"` on each `<div class="year-image">` to your own image URLs or paths.  
- **Years / order:** Adjust the `YEARS` array in `app.js` and add or remove articles and dots so they stay in sync.

## Files

| File            | Purpose |
|-----------------|--------|
| `index.html`    | Structure, 8 year sections, nav, narration buttons |
| `styles.css`    | Layout and romantic theme |
| `app.js`        | SPA navigation (prev/next/dots), ElevenLabs proxy + browser TTS fallback |
| `server.js`     | Optional Node server: serves static files and proxies ElevenLabs TTS (keeps API key server-side) |
| `.env.example`  | Template for `.env` (copy to `.env` and add your ElevenLabs key + voice ID) |
| `.gitignore`    | Excludes `.env` and `node_modules` |
| `README.md`     | This file |

Enjoy your chronicle.
