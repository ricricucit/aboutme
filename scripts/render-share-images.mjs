// Publishing-only renderer. Uses the same installed Chrome as the Lighthouse gate.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'dist');
const manifest = JSON.parse(readFileSync(join(OUT, 'share/manifest.json'), 'utf8'));
const chrome = [process.env.CHROME_PATH, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].filter(Boolean)
  .find(bin => spawnSync(bin, ['--version'], { stdio: 'ignore' }).status === 0);
if (!chrome) throw new Error('Chrome is required to render social PNGs. Install Chrome or set CHROME_PATH, then run npm run share:render.');

const MIME = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  const file = resolve(OUT, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(OUT + '/') || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;
let index = 0;
async function worker() {
  while (index < manifest.length) {
    const card = manifest[index++];
    const profile = mkdtempSync(join(tmpdir(), 'aboutme-share-'));
    try {
      const { stdout } = await run(chrome, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=2000', `--user-data-dir=${profile}`, `--screenshot=${join(OUT, 'share', card.file)}`, '--dump-dom', `${base}/share/${card.template}`], { timeout: 45000, maxBuffer: 4 * 1024 * 1024 });
      if (!stdout.includes('data-ready="true"') || !stdout.includes('data-overflow="false"')) throw new Error(`Card text did not fit: ${card.id}`);
      const png = readFileSync(join(OUT, 'share', card.file));
      if (png.toString('hex', 0, 8) !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) throw new Error(`Invalid PNG: ${card.id}`);
      if (png.length > 2 * 1024 * 1024) throw new Error(`Share image exceeds 2 MB: ${card.id}`);
      // Stable embeds (README, newsletters) coexist with cache-busted OG URLs.
      copyFileSync(join(OUT, 'share', card.file), join(OUT, 'share', card.id + '.png'));
      console.log(`✓ ${card.id}: 1200×630, ${Math.round(png.length / 1024)} KB`);
    } finally { rmSync(profile, { recursive: true, force: true }); }
  }
}
try { await Promise.all(Array.from({ length: 3 }, worker)); }
finally { await new Promise(ok => server.close(ok)); }
console.log(`Rendered and checked ${manifest.length} share images.`);
