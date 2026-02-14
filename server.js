/**
 * Local dev server: serves the SPA and proxies ElevenLabs TTS so the API key stays server-side.
 * Run: node server.js   (requires ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env if present (no extra deps)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    });
  }
} catch (_) {}
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
/** Where to serve /audio/* from. Default: ./audio next to server.js. Override with AUDIO_DIR. */
const AUDIO_DIR = process.env.AUDIO_DIR ? path.resolve(process.env.AUDIO_DIR) : path.join(__dirname, 'audio');

function getVoiceIdForYear(year) {
  if (year != null && year !== '') {
    const id = process.env['ELEVENLABS_VOICE_' + year];
    if (id) return id.trim();
  }
  return DEFAULT_VOICE_ID;
}

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function proxyElevenLabs(voiceId, text, onResponse) {
  const body = JSON.stringify({
    text,
    model_id: 'eleven_multilingual_v2',
  });
  const opts = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
      'Content-Length': Buffer.byteLength(body),
    },
  };
  const req = require('https').request(opts, (upstream) => {
    onResponse(upstream.statusCode, upstream.headers, upstream);
  });
  req.on('error', () => onResponse(500, {}, null));
  req.write(body);
  req.end();
}

const server = http.createServer((req, res) => {
  // CORS for same-origin only; proxy is same host
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // Serve audio files from ./audio/ directory (GET /audio/2019.mp3 etc.)
  if (req.method === 'GET' && req.url.startsWith('/audio/')) {
    const requested = path.basename(req.url.split('?')[0]);
    if (!requested || requested.includes('..')) {
      res.writeHead(400);
      res.end();
      return;
    }
    const audioDir = AUDIO_DIR;
    const trySend = (filePath) => {
      const safePath = path.resolve(filePath);
      const allowed = path.resolve(__dirname);
      const allowedAudio = path.resolve(AUDIO_DIR);
      if (!safePath.startsWith(allowed) && !safePath.startsWith(allowedAudio)) {
        res.writeHead(403);
        res.end();
        return;
      }
      fs.readFile(safePath, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.readdir(audioDir, (readErr, files) => {
              console.warn('Audio not found:', safePath);
              if (!readErr && files && files.length) {
                console.warn('  Files in audio/:', files.join(', '));
              } else {
                console.warn('  audio/ directory missing or empty. Put 2019.mp3–2025.mp3 in:', audioDir);
              }
            });
          }
          res.writeHead(404);
          res.end();
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const mime = ext === '.mp3' ? 'audio/mpeg' : MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      });
    };
    const exactPath = path.join(audioDir, requested);
    fs.access(exactPath, fs.constants.R_OK, (err) => {
      if (!err) {
        trySend(exactPath);
        return;
      }
      fs.readdir(audioDir, (readErr, files) => {
        if (readErr || !files) {
          trySend(exactPath);
          return;
        }
        const lower = requested.toLowerCase();
        const found = files.find((f) => f.toLowerCase() === lower);
        if (found) {
          trySend(path.join(audioDir, found));
        } else {
          trySend(exactPath);
        }
      });
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/speak') {
    if (!API_KEY) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ElevenLabs not configured. Set ELEVENLABS_API_KEY in .env' }));
      return;
    }
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let json;
      try {
        json = JSON.parse(body);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }
      const text = json.text;
      const year = json.year != null ? String(json.year) : '';
      const voiceId = getVoiceIdForYear(year);
      if (!voiceId) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No voice for this year. Set ELEVENLABS_VOICE_ID or ELEVENLABS_VOICE_2018 … ELEVENLABS_VOICE_2025 in .env' }));
        return;
      }
      if (typeof text !== 'string' || !text.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing or empty "text"' }));
        return;
      }
      proxyElevenLabs(voiceId, text.trim(), (statusCode, headers, stream) => {
        res.writeHead(statusCode, {
          'Content-Type': headers['content-type'] || 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
        });
        if (stream) stream.pipe(res);
        else res.end();
      });
    });
    return;
  }

  const relativePath = req.url === '/' ? 'index.html' : req.url.replace(/^\//, '').split('?')[0];
  const filePath = path.join(__dirname, relativePath);
  const safePath = path.resolve(filePath);
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end();
    return;
  }
  serveFile(safePath, res);
});

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

server.listen(PORT, () => {
  const hasPerYear = YEARS.some((y) => process.env['ELEVENLABS_VOICE_' + y]);
  const hasEleven = API_KEY && (DEFAULT_VOICE_ID || hasPerYear);
  console.log(`V-Day Bahb Chronicles: http://localhost:${PORT}`);
  fs.readdir(AUDIO_DIR, (err, files) => {
    if (err) {
      console.log('Audio folder not found at:', AUDIO_DIR);
      console.log('  Create it and add 2019.mp3–2025.mp3, or run with: AUDIO_DIR=/path/to/your/audio node server.js');
    } else {
      const mp3s = (files || []).filter((f) => f.toLowerCase().endsWith('.mp3'));
      console.log('Audio folder:', AUDIO_DIR);
      console.log('  MP3 files:', mp3s.length ? mp3s.join(', ') : 'none (add 2019.mp3–2025.mp3 here)');
    }
  });
  if (hasEleven) {
    console.log('ElevenLabs: enabled' + (hasPerYear ? ' (per-year voices)' : ''));
  } else {
    console.log('ElevenLabs: not configured.');
  }
});
