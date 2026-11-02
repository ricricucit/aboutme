// Content-derived social cards. HTML/SVG source, rasterized only during publishing.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://www.aboutme.it';
const cards = new Map();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
export const resetShareCards = () => cards.clear();

function ornament(seed) {
  // Deterministic mathematical curves: a small visual identity for each article.
  const n = parseInt(createHash('sha256').update(seed).digest('hex').slice(0, 6), 16);
  const curves = Array.from({ length: 12 }, (_, j) => {
    const points = Array.from({ length: 260 }, (_, i) => {
      const t = i / 259 * Math.PI * 2;
      const x = 190 + (128 + j * 3) * Math.sin(t * (2 + n % 3) + j * .035);
      const y = 240 + (168 - j * 4) * Math.cos(t * (3 + n % 2));
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<path d="${points}"/>`;
  }).join('');
  return `<svg viewBox="0 0 380 480" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".7" opacity=".5">${curves}</g><circle cx="190" cy="240" r="7" fill="currentColor"/></svg>`;
}

function specimen(source) {
  const svg = source?.match(/<svg class="cms-specimen"[\s\S]*?<\/svg>/)?.[0];
  if (!svg) return '';
  return svg.replace('preserveAspectRatio="none"', 'preserveAspectRatio="xMidYMid meet"').replace(/<title[\s\S]*?<\/title>|<desc[\s\S]*?<\/desc>/g, '');
}

const style = `
@font-face{font-family:Maison;src:url('../fonts/MaisonNeue-Book.woff2') format('woff2');font-weight:400;font-display:block}
@font-face{font-family:Maison;src:url('../fonts/MaisonNeue-Medium.woff2') format('woff2');font-weight:500;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{--bg:#f6f3e9;background:var(--bg);color:#151713;font-family:Maison,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.cover{position:relative;width:1200px;height:630px;padding:42px 56px;overflow:hidden}
header{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #b8b7ab;padding-bottom:17px;position:relative;z-index:2}
.brand{font-family:'Times New Roman','Liberation Serif',serif;font-style:italic;font-size:30px}.issue{font-size:16px;letter-spacing:.12em;text-transform:uppercase}
.copy{position:relative;z-index:2;width:760px;padding-top:38px}
h1{font-family:'Times New Roman','Liberation Serif',serif;font-weight:400;font-size:82px;line-height:1.08;letter-spacing:-.035em;margin:0;text-wrap:balance}
.deck{font-size:24px;line-height:1.45;margin:25px 0 0;max-width:680px;color:#4c5045}
.art{position:absolute;right:20px;top:96px;width:330px;height:440px;z-index:1}
.art::before{content:'';position:absolute;background:#eecc5d;width:240px;height:240px;border-radius:50%;right:25px;top:90px;z-index:-1}
.art svg{display:block;width:100%;height:100%;color:#292d23}.art text{font-family:serif;font-size:20px}.art .cms-specimen{--bg:#f6f3e9}
.footer{position:absolute;left:56px;right:56px;bottom:36px;border-top:1px solid #b8b7ab;padding-top:18px;display:flex;justify-content:space-between;align-items:center;font-size:19px;z-index:2}
.domain{font-size:17px;letter-spacing:.04em}.signature{display:flex;align-items:center;gap:12px}.dot{width:10px;height:10px;border-radius:50%;background:#eecc5d;display:inline-block}
.home{background:#172018;color:#f6f3e9}.home header,.home .footer{border-color:#586153}.home .copy{width:760px;padding-top:46px}.home h1{font-size:116px;max-width:720px;text-wrap:initial}.home .deck{color:#d3d5ca;max-width:660px;font-size:25px}.home .art{width:350px;right:12px;top:125px;height:380px;color:#eecc5d}.home .art svg{color:#eecc5d}.home .art::before{display:none}
.index h1{font-size:138px;font-style:italic}.index .deck{max-width:630px;font-size:29px}.index .art{right:8px;top:105px}.index .art::before{width:285px;height:285px;top:60px}
.article.has-specimen .copy{width:760px}.article.has-specimen h1{font-size:82px}.article.has-specimen .deck{max-width:700px;font-size:23px}
`;

function cardHtml(card, art) {
  const theme = card.kind === 'home' ? 'home' : card.kind === 'oneday' ? 'index' : card.kind === 'article' ? 'article' : '';
  const issue = card.date ? card.date.split('-').reverse().join('.') : card.label;
  return `<!doctype html><html lang="${esc(card.lang)}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=1200"><title>${esc(card.title)}</title><style>${style}</style></head><body><main class="cover ${theme}${card.hasSpecimen ? ' has-specimen' : ''}"><header><span class="brand">${card.kind === 'article' || card.kind === 'oneday' ? 'One Day' : 'aboutme.it'}</span><span class="issue">${esc(issue)} &nbsp; / &nbsp; ${esc(card.lang.toUpperCase())}</span></header><div class="copy"><h1>${esc(card.title)}</h1><p class="deck">${esc(card.subtitle)}</p></div><div class="art">${art}</div><div class="footer"><span class="signature"><i class="dot"></i>Enrico Icardi</span><span class="domain">aboutme.it${card.kind === 'article' || card.kind === 'oneday' ? ' / one day' : ''}</span></div></main><script>
document.fonts.ready.then(() => {
  const title=document.querySelector('h1'), deck=document.querySelector('.deck');
  // Measure line boxes, not glyph ink overflow: descenders should not shrink a title.
  for(const el of [title,deck]){let size=parseFloat(getComputedStyle(el).fontSize);const min=el===title?42:18,limit=el===title?300:110;while((el.getBoundingClientRect().height>limit||el.scrollWidth>el.clientWidth+1)&&size>min){el.style.fontSize=(--size)+'px';}}
  let size=parseFloat(getComputedStyle(title).fontSize);
  while(deck.getBoundingClientRect().bottom>520&&size>42) title.style.fontSize=(--size)+'px';
  const bottom=deck.getBoundingClientRect().bottom;
  document.body.dataset.overflow=String(bottom>535||title.getBoundingClientRect().height>300||deck.getBoundingClientRect().height>110||[title,deck].some(el=>el.scrollWidth>el.clientWidth+1));
  document.body.dataset.ready='true';
});
</script></body></html>`;
}

export function addShareCard({ id, lang, kind, title, subtitle, date = '', label = '', source = '' }) {
  const illustration = specimen(source);
  const card = { id, lang, kind, title: strip(title), subtitle: strip(subtitle), date, label, hasSpecimen: Boolean(illustration) };
  const art = illustration || ornament(id);
  const html = cardHtml(card, art);
  // Content-addressed image URLs refresh social caches when copy or artwork changes.
  const hash = createHash('sha256').update(html).digest('hex').slice(0, 12);
  const stem = id.replace(/[^a-z0-9-]/gi, '-') + '-' + hash;
  const value = { ...card, html, file: stem + '.png', template: stem + '.html', url: `${BASE}/share/${stem}.png` };
  cards.set(id, value);
  return value;
}

export function shareMeta(card) {
  return `<meta property="og:image" content="${card.url}"><meta property="og:image:secure_url" content="${card.url}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(card.title)} · Enrico Icardi"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${card.url}"><meta name="twitter:image:alt" content="${esc(card.title)} · Enrico Icardi">`;
}

export function postShareMeta(source, card) {
  return source.replace(/<meta\b[^>]*(?:property="og:image(?::[^"]*)?"|name="twitter:(?:card|image(?::[^"]*)?)")[^>]*>/gi, '').replace('</head>', shareMeta(card) + '</head>');
}

export function writeShareCards(out) {
  const dir = join(out, 'share'); mkdirSync(dir, { recursive: true });
  const manifest = [...cards.values()].map(({ html, ...card }) => card);
  for (const card of cards.values()) writeFileSync(join(dir, card.template), card.html);
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  writeFileSync(join(dir, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Share covers · aboutme.it</title><style>body{font:18px/1.5 system-ui;margin:40px;background:#f6f3e9;color:#172018}h1{font:48px Georgia}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:32px}figure{margin:0}img{width:100%;height:auto;border:1px solid #ccc}a{color:inherit}figcaption{margin:8px 0 0}</style><h1>aboutme.it / share covers</h1><main>${manifest.map(c => `<figure><a href="${esc(c.file)}"><img src="${esc(c.file)}" width="1200" height="630" loading="lazy" alt="${esc(c.title)}"></a><figcaption>${esc(c.lang.toUpperCase())} · ${esc(c.title)}</figcaption></figure>`).join('')}</main></html>`);
  return manifest;
}
