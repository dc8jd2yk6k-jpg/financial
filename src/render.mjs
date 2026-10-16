// Render web/index.html frame by frame in headless Chromium and pipe the JPEGs to ffmpeg.
//   node src/render.mjs <film>                    -> build/<film>/video.mp4 (silent; mux runs separately)
//   node src/render.mjs <film> --stills 1,6.2,15  -> build/<film>/stills/t_<sec>.jpg
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.otf': 'font/otf', '.wav': 'audio/wav' };

const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT)) throw new Error('outside root');
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() !== 'log') console.log('[page]', m.text()); });
page.on('pageerror', e => { console.error('[page error]', e); process.exitCode = 1; });
const argv = process.argv.slice(2);
const FILM = argv[0] && !argv[0].startsWith('--') ? argv.shift() : 'ten-year-bet';
const OUT = join(ROOT, 'build', FILM);
await page.goto(`http://127.0.0.1:${port}/web/index.html?headless&film=${FILM}`);
await page.evaluate(() => window.ready);

const decode = d => Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
const args = argv;

if (args[0] === '--stills') {
  const out = join(OUT, 'stills'); mkdirSync(out, { recursive: true });
  for (const s of args[1].split(',')) {
    const t = parseFloat(s);
    const data = await page.evaluate(t => { renderFrame(Math.round(t * 30)); return grab(.9); }, t);
    writeFileSync(join(out, `t_${t.toFixed(2)}.jpg`), decode(data));
  }
  console.log('stills ->', out);
} else {
  const n = await page.evaluate(() => frameCount());
  const outFile = join(OUT, 'video.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-tune', 'film',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    const data = await page.evaluate(f => { renderFrame(f); return grab(.95); }, f);
    if (!ff.stdin.write(decode(data))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('video ->', outFile);
}
await browser.close();
server.close();
