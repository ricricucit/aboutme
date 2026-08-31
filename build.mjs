// aboutme.it — dependency-free static build. `node build.mjs` → dist/, `node build.mjs --serve` → local server.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, rmSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';

const ROOT = new URL('.', import.meta.url).pathname;
const OUT = join(ROOT, 'dist');
const BASE = 'https://www.aboutme.it';
const BOOK = 'https://calendar.app.google/bHXHZtic4a7dmcfR8';
const LINKEDIN = 'https://www.linkedin.com/in/enricoicardi/';
const GITHUB = 'https://github.com/ricricucit';
const EMAIL = 'enrico@welance.com';
const ORDER = ['en', 'de', 'it', 'fr', 'es', 'pt', 'nl', 'pl', 'uk'];
// Cookie-less analytics (goatcounter.com). '' = disabled. Set to e.g. 'ricricucit'
// (your GoatCounter site code) to emit the async script + noscript pixel.
const GOATCOUNTER = 'ricricucit';
const PAGES = ['home', 'about', 'cv', 'oneday'];
const PAGE_SLUG = { about: 'about', cv: 'cv', oneday: 'one-day' };

let css = '', langs = [], posts = [], now = new Date();
function load() {
  css = readFileSync(join(ROOT, 'src/style.css'), 'utf8').trim();
  langs = ORDER.filter(l => existsSync(join(ROOT, 'content', l + '.json')))
    .map(l => JSON.parse(readFileSync(join(ROOT, 'content', l + '.json'), 'utf8')));
  // A post is a folder content/oneday/YYYY-MM-DD-slug/ holding one COMPLETE,
  // art-directed standalone HTML document per language (it.html, en.html, ...),
  // copied to /one-day/<slug>/ verbatim — no site chrome is injected.
  const pdir = join(ROOT, 'content', 'oneday');
  posts = !existsSync(pdir) ? [] : readdirSync(pdir).filter(n => statSync(join(pdir, n)).isDirectory()).sort().reverse().map(slug => {
    const tr = {};
    for (const f of readdirSync(join(pdir, slug))) if (f.endsWith('.html')) {
      const src = readFileSync(join(pdir, slug, f), 'utf8');
      tr[f.slice(0, -5)] = { src, title: (src.slice(0, 8192).match(/<title>([^<]+)<\/title>/i) || [, slug])[1].trim() };
    }
    return { slug, date: /^\d{4}-\d{2}-\d{2}/.test(slug) ? slug.slice(0, 10) : now.toISOString().slice(0, 10), tr };
  }).filter(p => Object.keys(p.tr).length);
  now = new Date();
}

const prefix = l => (l === 'en' ? '' : '/' + l);
const path = (l, page) => prefix(l) + (page === 'home' ? '/' : `/${PAGE_SLUG[page]}/`);
const postPath = (l, slug) => prefix(l) + `/one-day/${slug}/`;
const url = (l, page) => BASE + path(l, page);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s, l) => s.replaceAll('{about}', path(l, 'about')).replaceAll('{cv}', path(l, 'cv')).replaceAll('{book}', BOOK);
const ext = a => a.replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" rel="noopener" target="_blank"');
const html = (s, l) => ext(fill(s, l));
const updated = l => new Intl.DateTimeFormat(l, { month: 'short', year: 'numeric' }).format(now);

const ICON = {
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2zm13 8H4v10h16V10z"/></svg>',
  sun: '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0-6h0l1 4h-2l1-4zm0 22-1-4h2l-1 4zM1 12l4-1v2l-4-1zm22 0-4 1v-2l4 1zM4.2 4.2l3.6 2.1-1.5 1.5-2.1-3.6zm15.6 15.6-3.6-2.1 1.5-1.5 2.1 3.6zM19.8 4.2l-2.1 3.6-1.5-1.5 3.6-2.1zM4.2 19.8l2.1-3.6 1.5 1.5-3.6 2.1z"/></svg>',
  moon: '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2a9 9 0 1 0 8 13 8 8 0 0 1-8-13z"/></svg>',
  auto: '<svg class="i-auto" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20V2z"/><path d="M12 2a10 10 0 0 1 0 20V2z" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
};
const FAVICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0a0a0a"/><circle cx="32" cy="32" r="14" fill="#eecc5d"/></svg>');

function jsonld(c) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person', '@id': BASE + '/#person',
    name: 'Enrico Icardi', url: BASE + '/', image: BASE + '/img/og.jpg', email: 'mailto:' + EMAIL,
    jobTitle: 'Engineering and Product + AI Sitter', description: c.meta.description,
    worksFor: { '@type': 'Organization', name: 'welance', url: 'https://welance.com' },
    address: [{ '@type': 'PostalAddress', addressLocality: 'Berlin', addressCountry: 'DE' }, { '@type': 'PostalAddress', addressLocality: 'Lequio Berria', addressRegion: 'Piedmont', addressCountry: 'IT' }],
    nationality: { '@type': 'Country', name: 'Italy' },
    knowsLanguage: ['it', 'en', 'es', 'de', 'fr'],
    alumniOf: { '@type': 'EducationalOrganization', name: 'ITIS G. Vallauri, Fossano' },
    sameAs: [LINKEDIN, GITHUB, 'https://x.com/ricricucit']
  });
}

function head(c, page, title, desc, o = {}) {
  const l = c.lang;
  const route = o.route || (lg => path(lg, page));
  const L = o.langs ? langs.filter(x => o.langs.includes(x.lang)) : langs;
  const abs = lg => BASE + route(lg);
  const alts = L.map(x => `<link rel="alternate" hreflang="${x.lang}" href="${abs(x.lang)}">`).join('') + (L.some(x => x.lang === 'en') ? `<link rel="alternate" hreflang="x-default" href="${abs('en')}">` : '');
  return `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${abs(l)}">${alts}<meta property="og:type" content="profile"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${abs(l)}"><meta property="og:image" content="${BASE}/img/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="${l}"><meta property="og:site_name" content="${esc(c.meta.siteName)}"><meta name="twitter:card" content="summary_large_image"><meta name="author" content="Enrico Icardi"><meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)"><link rel="icon" href="${FAVICON}"><script>try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script><link rel="preload" href="/fonts/MaisonNeue-Book.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/MaisonNeue-Medium.woff2" as="font" type="font/woff2" crossorigin><style>${css}</style><script type="application/ld+json">${jsonld(c)}</script></head><body>`;
}

function header(c, page) {
  const l = c.lang, n = c.nav;
  const cur = p => (p === page ? ' aria-current="page"' : '');
  return `<header class="wrap"><div class="top"><nav aria-label="Main"><a class="brand" href="${path(l, 'home')}"${cur('home')}>${esc(n.home)}</a><a href="${path(l, 'about')}"${cur('about')}>${esc(n.about)}</a><a href="${path(l, 'cv')}"${cur('cv')}>${esc(n.cv)}</a><a href="${path(l, 'oneday')}"${cur('oneday')}>${esc(n.oneday)}</a></nav><div class="tools"><a href="${LINKEDIN}" rel="noopener" target="_blank" aria-label="${esc(n.linkedin)}" title="${esc(n.linkedin)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9h4v12H3zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/></svg></a><a href="${GITHUB}" rel="noopener" target="_blank" aria-label="${esc(n.github)}" title="${esc(n.github)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/></svg></a><button id="theme" type="button" aria-label="${esc(n.theme)}" title="${esc(n.theme)}">${ICON.auto}${ICON.sun}${ICON.moon}</button></div></div></header>`;
}

function footer(c) {
  const l = c.lang;
  const list = langs.map(o => `<li><a href="${path(o.lang, 'home')}" hreflang="${o.lang}" lang="${o.lang}" data-lang="${o.lang}"${o.lang === l ? ' aria-current="true"' : ''}>${esc(o.native)}</a></li>`).join('');
  const script = `<script>(function(){var d=document.documentElement,b=document.getElementById('theme');b.addEventListener('click',function(){var t=d.getAttribute('data-theme');var n=!t?'light':t==='light'?'dark':null;try{n?localStorage.setItem('theme',n):localStorage.removeItem('theme')}catch(e){}n?d.setAttribute('data-theme',n):d.removeAttribute('data-theme')});document.querySelectorAll('[data-lang]').forEach(function(a){a.addEventListener('click',function(){try{localStorage.setItem('lang',a.dataset.lang)}catch(e){}})});if(location.pathname==='/'){var L=${JSON.stringify(langs.map(o => o.lang))},s=null;try{s=localStorage.getItem('lang')}catch(e){}if(!s){var n=(navigator.languages||[navigator.language||'']).map(function(x){return x.slice(0,2).toLowerCase()});s=n.filter(function(x){return L.indexOf(x)>-1})[0]||'en'}if(s!=='en'&&L.indexOf(s)>-1)location.replace('/'+s+'/')}})();</script>`;
  const ga = GOATCOUNTER ? `<script data-goatcounter="https://${GOATCOUNTER}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script><noscript><img src="https://${GOATCOUNTER}.goatcounter.com/count?p=${encodeURIComponent(path(l, 'home'))}" alt=""></noscript>` : '';
  return `<footer><div class="wrap"><ul class="langs" aria-label="${esc(c.nav.language)}">${list}</ul><p>${esc(c.footer.updated)}: ${updated(l)} · ${esc(c.footer.colophon)}</p></div></footer>${script}${ga}</body></html>`;
}

const bookBtn = c => `<a class="btn" href="${BOOK}" rel="noopener" target="_blank">${ICON.cal} ${esc(c.nav.book)}</a>`;

function homePage(c) {
  const l = c.lang, h = c.home;
  return head(c, 'home', c.meta.title, c.meta.description) + header(c, 'home') +
    `<main class="wrap"><div class="hero"><figure><img src="/img/enrico-icardi.webp" srcset="/img/enrico-icardi-360.webp 360w, /img/enrico-icardi.webp 720w" sizes="(min-width: 48rem) 13rem, 7rem" width="720" height="900" alt="Enrico Icardi" fetchpriority="high"></figure><h1>${esc(h.hi)}</h1>` +
    h.intro.map((p, i) => `<p class="lead${i === h.intro.length - 1 ? ' tldr' : ''}">${html(p, l)}</p>`).join('') + bookBtn(c) + `</div>` +
    `<h2>${esc(h.alsoTitle)}</h2><ul class="plain">${h.also.map(x => `<li>${html(x, l)}</li>`).join('')}</ul><p class="muted">${html(h.moreAbout, l)}</p></main>` + footer(c);
}

function aboutPage(c) {
  const l = c.lang, a = c.about;
  return head(c, 'about', c.meta.aboutTitle, c.meta.aboutDescription) + header(c, 'about') +
    `<main class="wrap"><h1 class="sr">${esc(a.title)}</h1>` + a.html.map((p, i) => (p === '<hr>' ? '<hr>' : `<p${i === 0 ? ' class="opener"' : ''}>${html(p, l)}</p>`)).join('') + bookBtn(c) + `</main>` + footer(c);
}

function entry(e, l) {
  const org = e.url ? `<a href="${e.url}" rel="noopener" target="_blank">${esc(e.org)}</a>` : esc(e.org);
  return `<article class="entry"><div class="when">${esc(e.period)}</div><div><h3>${org}</h3><p class="role">${esc(e.role)}<br><span class="where">${esc(e.where)}</span></p>${(Array.isArray(e.text) ? e.text : [e.text]).map(t => `<p>${html(t, l)}</p>`).join('')}</div></article>`;
}

function cvPage(c) {
  const l = c.lang, v = c.cv, L = v.labels;
  const sec = (t, inner) => `<section class="sec"><h2>${esc(t)}</h2>${inner}</section>`;
  return head(c, 'cv', c.meta.cvTitle, c.meta.cvDescription) + header(c, 'cv') +
    `<main class="wrap"><h1 class="sr">${esc(v.title)}</h1><p class="lead opener">${esc(v.lead)}</p>` + bookBtn(c) +
    sec(L.now, v.now.map(e => entry(e, l)).join('')) +
    sec(L.earlier, v.earlier.map(e => entry(e, l)).join('')) +
    sec(L.advising, `<p>${html(v.advising, l)}</p>`) +
    sec(L.openSource, `<ul class="plain">${v.openSource.map(o => `<li><a href="${o.url}" rel="noopener" target="_blank">${esc(o.name)}</a>: ${esc(o.text)}</li>`).join('')}</ul>`) +
    sec(L.stack, `<p>${esc(v.stack)}</p>`) +
    sec(L.education, `<ul class="plain">${v.education.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`) +
    sec(L.languages, `<dl>${v.languages.map(x => `<dt>${esc(x.name)}</dt><dd>${esc(x.level)}</dd>`).join('')}</dl>`) +
    sec(L.interests, `<p>${esc(v.interests)}</p>`) +
    sec(L.contact, `<p>${html(v.contact, l)}</p>`) + `</main>` + footer(c);
}

function postFor(p, l) { return p.tr[l] ? l : (p.tr.it ? 'it' : Object.keys(p.tr)[0]); }
const fmtDate = (l, iso) => new Intl.DateTimeFormat(l, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T12:00:00Z'));

function onedayPage(c) {
  const l = c.lang, b = c.oneday;
  const list = posts.length
    ? `<ul class="plain">${posts.map(p => { const pl = postFor(p, l); return `<li><a href="${postPath(pl, p.slug)}">${esc(p.tr[pl].title)}</a>${pl === l ? '' : ` <span class="where">(${pl})</span>`} <span class="meta">· ${fmtDate(l, p.date)}</span></li>`; }).join('')}</ul>`
    : `<p>${esc(b.empty)}</p>`;
  return head(c, 'oneday', c.meta.onedayTitle, c.meta.onedayDescription) + header(c, 'oneday') +
    `<main class="wrap"><h1 class="masthead">${esc(b.title)}</h1><p class="lead">${esc(b.tagline)}</p>` + list +
    `<p class="meta">${esc(b.langNote)}</p></main>` + footer(c);
}

function strip(s) { return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function cvMarkdown(c) {
  const v = c.cv, sec = (t, items) => `\n## ${t}\n\n` + items.map(e => `### ${e.org} — ${e.role}\n${e.period} · ${e.where}\n\n${strip(Array.isArray(e.text) ? e.text.join(' ') : e.text)}\n`).join('\n');
  return `# Enrico Icardi — ${c.cv.title}\n\n${v.lead}\n\nSite: ${BASE}/ · E-mail: ${EMAIL} · LinkedIn: ${LINKEDIN} · GitHub: ${GITHUB} · Book a call: ${BOOK}\n` +
    sec(v.labels.now, v.now) + sec(v.labels.earlier, v.earlier) +
    `\n## ${v.labels.advising}\n\n${strip(v.advising)}\n\n## ${v.labels.openSource}\n\n${v.openSource.map(o => `- ${o.name} — ${o.text} (${o.url})`).join('\n')}\n\n## ${v.labels.stack}\n\n${v.stack}\n\n## ${v.labels.education}\n\n${v.education.map(x => '- ' + x).join('\n')}\n\n## ${v.labels.languages}\n\n${v.languages.map(x => `- ${x.name}: ${x.level}`).join('\n')}\n\n## ${v.labels.interests}\n\n${v.interests}\n`;
}

function build() {
  load();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, 'fonts'), { recursive: true }); mkdirSync(join(OUT, 'img'), { recursive: true });
  for (const f of readdirSync(join(ROOT, 'src/fonts'))) copyFileSync(join(ROOT, 'src/fonts', f), join(OUT, 'fonts', f));
  for (const f of readdirSync(join(ROOT, 'src/img'))) copyFileSync(join(ROOT, 'src/img', f), join(OUT, 'img', f));
  if (existsSync(join(ROOT, 'static'))) for (const f of readdirSync(join(ROOT, 'static'))) copyFileSync(join(ROOT, 'static', f), join(OUT, f));
  const urls = [];
  for (const c of langs) {
    for (const page of PAGES) {
      const dir = join(OUT, path(c.lang, page)); mkdirSync(dir, { recursive: true });
      const render = { home: homePage, about: aboutPage, cv: cvPage, oneday: onedayPage }[page];
      writeFileSync(join(dir, 'index.html'), render(c));
      urls.push({ loc: url(c.lang, page), page });
    }
    writeFileSync(join(OUT, prefix(c.lang) || '/', 'cv.md'), cvMarkdown(c));
  }
  for (const p of posts) for (const lg of Object.keys(p.tr)) {
    const dir = join(OUT, postPath(lg, p.slug)); mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), p.tr[lg].src);
    urls.push({ loc: BASE + postPath(lg, p.slug), page: null, post: p });
  }
  const en = langs[0];
  const sm = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
    urls.map(u => `<url><loc>${u.loc}</loc><lastmod>${now.toISOString().slice(0, 10)}</lastmod>` + (u.post
      ? Object.keys(u.post.tr).map(lg => `<xhtml:link rel="alternate" hreflang="${lg}" href="${BASE + postPath(lg, u.post.slug)}"/>`).join('')
      : langs.map(o => `<xhtml:link rel="alternate" hreflang="${o.lang}" href="${url(o.lang, u.page)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${url('en', u.page)}"/>`) + `</url>`).join('') + `</urlset>`;
  writeFileSync(join(OUT, 'sitemap.xml'), sm);
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
  writeFileSync(join(OUT, 'llms.txt'), `# Enrico Icardi\n\n> ${en.meta.description}\n\nPersonal site of Enrico Icardi, available in ${langs.map(o => o.native).join(', ')}. English is the canonical version.\n\n## Pages\n\n- [Home](${BASE}/): who I am and what I do now\n- [Career](${BASE}/about/): the story in my own words\n- [Detailed CV](${BASE}/cv/): full career, education, languages\n- [CV as Markdown](${BASE}/cv.md): plain-text version of the CV\n- [One Day](${BASE}/one-day/): blog, compressed stories of days worth telling (Italian-first)\n\n## Contact\n\n- E-mail: ${EMAIL}\n- Book a 30-minute call: ${BOOK}\n- LinkedIn: ${LINKEDIN}\n- GitHub: ${GITHUB}\n`);
  writeFileSync(join(OUT, '404.html'), head(en, 'home', 'Not found — Enrico Icardi', 'Page not found').replace(/<link rel="canonical"[^>]+>/, '').replace(/<link rel="alternate"[^>]+>/g, '') + header(en, '') + `<main class="wrap"><h1>404</h1><p class="lead">Nothing here. <a href="/">Home</a>.</p></main>` + footer(en));
  return urls.length;
}

export { build };
const isMain = process.argv[1] && new URL('file://' + process.argv[1]).pathname === new URL(import.meta.url).pathname;
if (isMain) { const n = build(); console.log(`built ${n} pages in ${langs.length} languages → dist/`); }

if (isMain && process.argv.includes('--serve')) {
  const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.json': 'application/json' };
  const port = Number(process.env.PORT) || 5173;
  createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/') || !extname(p)) { build(); } // rebuild on every page view so edits show on reload
    let file = join(OUT, p);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    else if (!existsSync(file) && existsSync(file + '/index.html')) file = file + '/index.html';
    if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404, { 'content-type': MIME['.html'] }); return res.end(readFileSync(join(OUT, '404.html'))); }
    const type = MIME[extname(file)] || 'application/octet-stream', body = readFileSync(file);
    const gz = /^(text\/|application\/(xml|json))/.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store', ...(gz ? { 'content-encoding': 'gzip' } : {}) });
    res.end(gz ? gzipSync(body) : body);
  }).listen(port, () => console.log(`serving dist/ at http://localhost:${port}/  (rebuilds on each page load)`));
}
