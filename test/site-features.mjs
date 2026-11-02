import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { build } from '../build.mjs';
import { enhanceReading, readingMinutes } from '../src/reading-tools.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'dist');
const total = build();
const cards = JSON.parse(readFileSync(join(OUT, 'share/manifest.json'), 'utf8'));
assert.equal(cards.length, total, 'Every published page has its own cover');
assert.equal(new Set(cards.map(c => c.url)).size, total);
for (const card of cards) {
  assert.match(card.url, /^https:\/\/www\.aboutme\.it\/share\/[a-z0-9-]+\.png$/);
  const html = readFileSync(join(OUT, 'share', card.template), 'utf8');
  assert.ok(html.includes('<h1>') && html.includes('document.fonts.ready'));
  assert.ok(!html.includes('<script src='), 'No external rendering scripts');
}
const pages = [];
function walk(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.name === 'share') continue;
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === 'index.html') pages.push(p);
  }
}
walk(OUT);
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  assert.ok(cards.some(c => c.url === image), `Missing cover: ${page}`);
  assert.equal((html.match(/property="og:image"/g) || []).length, 1);
  assert.equal((html.match(/name="twitter:card"/g) || []).length, 1);
  assert.ok(html.includes('content="summary_large_image"'));
  const slug = page.match(/\/one-day\/([^/]+)\/index\.html$/)?.[1];
  if (!slug) continue;
  const lang = html.match(/<html lang="([^"]+)"/)[1];
  const source = readFileSync(join(ROOT, 'content/oneday', slug, lang + '.html'), 'utf8');
  assert.equal((html.match(/class="reader-tools"/g) || []).length, 1);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate IDs: ${page}`);
  for (const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(m[1]), `Broken anchor ${m[1]} in ${page}`);
  const references = (source.match(/role="doc-noteref"/g) || []).length;
  assert.equal((html.match(/role="doc-noteref"/g) || []).length, references);
  assert.equal((html.match(/role="doc-backlink"/g) || []).length, (source.match(/role="doc-backlink"/g) || []).length);
  const toc = html.match(/<nav aria-label="[^"]+"><ol>([\s\S]*?)<\/ol><\/nav>/)?.[1];
  assert.ok(toc);
  assert.equal((toc.match(/<li>/g) || []).length, (source.match(/<h2\b/g) || []).length);
  const minutes = Number(html.match(/data-reading-minutes="(\d+)"/)[1]);
  assert.equal(minutes, readingMinutes(source, lang).minutes);
  console.log(`✓ ${lang}: ${minutes} min, section targets and ${references} note round trips intact`);
}
const sample = '<html><head><style></style></head><body><article><h2>One</h2><p>' + 'word '.repeat(401) + '</p><h2 id="existing">Two</h2></article></body></html>';
assert.equal(readingMinutes(sample, 'en').minutes, 3);
const enhanced = enhanceReading(sample, 'en');
assert.ok(enhanced.includes('href="#existing"'));
assert.equal(enhanceReading(enhanced, 'en'), enhanced, 'Enhancement is idempotent');
assert.ok(existsSync(join(OUT, 'share/index.html')));
console.log(`Checked ${pages.length} pages, ${cards.length} distinct cover templates and reader enhancements.`);
