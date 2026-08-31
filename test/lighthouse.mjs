// E2E gate: build, serve, run Lighthouse (mobile + desktop) on sample pages, require 100 in every category.
import { spawn, execSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PORT = 5199, BASE = `http://localhost:${PORT}`;
const PAGES = (process.env.LH_PAGES || '/,/about/,/cv/,/one-day/,/it/,/de/cv/').split(',');
const OUTDIR = join(ROOT, '.lighthouse'); mkdirSync(OUTDIR, { recursive: true });

const server = spawn('node', ['build.mjs', '--serve'], { cwd: ROOT, env: { ...process.env, PORT }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((ok, bad) => { server.stdout.on('data', d => /serving/.test(d) && ok()); server.on('exit', c => bad(new Error('server exited ' + c))); });

let failed = 0;
try {
  for (const page of PAGES) for (const preset of ['mobile', 'desktop']) {
    const out = join(OUTDIR, `${page.replace(/\W+/g, '_') || 'root'}-${preset}.json`);
    execSync(`npx --yes lighthouse@12 "${BASE}${page}" --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="${out}" --only-categories=performance,accessibility,best-practices,seo ${preset === 'desktop' ? '--preset=desktop' : ''}`, { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
    const r = JSON.parse(readFileSync(out, 'utf8'));
    const scores = Object.fromEntries(Object.entries(r.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
    const bad = Object.entries(scores).filter(([, s]) => s < 100);
    const m = r.audits.metrics?.details?.items?.[0] || {};
    console.log(`${bad.length ? '✗' : '✓'} ${page.padEnd(10)} ${preset.padEnd(7)} ${Object.entries(scores).map(([k, s]) => `${k.slice(0, 4)}=${s}`).join(' ')}  LCP=${Math.round(m.largestContentfulPaint || 0)}ms CLS=${m.cumulativeLayoutShift ?? '-'}`);
    if (bad.length) { failed++; for (const a of Object.values(r.audits)) if (a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative') console.log(`    - ${a.id}: ${a.title} (${Math.round(a.score * 100)})`); }
  }
} finally { server.kill(); }
if (failed) { console.error(`\n${failed} run(s) below 100.`); process.exit(1); }
console.log('\nAll runs scored 100/100/100/100.');
