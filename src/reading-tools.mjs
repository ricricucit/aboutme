// Progressive enhancement for standalone One Day posts. No external scripts.
const labels = {
  en: ['Contents', '{n} min read', 'Back to top', 'Reading progress', 'About {n} minutes to read'],
  it: ['Indice', '{n} min di lettura', 'Torna all’inizio', 'Avanzamento della lettura', 'Circa {n} minuti di lettura'],
  de: ['Inhalt', '{n} Min. Lesezeit', 'Zum Anfang', 'Lesefortschritt', 'Etwa {n} Minuten Lesezeit'],
  fr: ['Sommaire', '{n} min de lecture', 'Revenir au début', 'Progression de lecture', 'Environ {n} minutes de lecture'],
  es: ['Índice', '{n} min de lectura', 'Volver al inicio', 'Progreso de lectura', 'Unos {n} minutos de lectura'],
  pt: ['Índice', '{n} min de leitura', 'Voltar ao início', 'Progresso da leitura', 'Cerca de {n} minutos de leitura'],
  nl: ['Inhoud', '{n} min leestijd', 'Terug naar boven', 'Leesvoortgang', 'Ongeveer {n} minuten leestijd'],
  pl: ['Spis treści', '{n} min czytania', 'Na początek', 'Postęp czytania', 'Około {n} minut czytania'],
  uk: ['Зміст', '{n} хв читання', 'На початок', 'Перебіг читання', 'Приблизно {n} хвилин читання']
};
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = s => s.replace(/<[^>]*>/g, ' ').replace(/&(?:amp|nbsp|quot|lt|gt);/g, ' ').replace(/\s+/g, ' ').trim();

export function readingMinutes(source, lang) {
  // Count the translated article itself, including optional field reports, without navigation or endnotes.
  let body = source.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || source;
  body = body.replace(/<(script|style|svg|header|footer|nav)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<section\b[^>]*class="footnotes"[\s\S]*?<\/section>/gi, '')
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '');
  const words = [...new Intl.Segmenter(lang, { granularity: 'word' }).segment(plain(body))].filter(x => x.isWordLike).length;
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) };
}

const css = `
/* Reading tools: native disclosure, usable without JavaScript. */
#reader-start,#article-top{display:block;height:0}
.reader-tools{position:sticky;top:0;z-index:20;margin:0 0 var(--r3);background:var(--bg);border-block:1px solid var(--line);font-size:var(--fs-s);line-height:1.5;box-shadow:0 3px 0 var(--bg)}
.reader-row{display:flex;align-items:flex-start;gap:var(--r1)}
.reader-toc{flex:1;min-width:0}
.reader-toc summary{display:flex;align-items:center;gap:var(--r0);min-height:3rem;cursor:pointer;list-style:none;font-weight:500;padding-block:var(--r0)}
.reader-toc summary::-webkit-details-marker{display:none}
.reader-toc summary::after{content:'+';margin-inline-start:auto;font-weight:400}
.reader-toc[open] summary::after{content:'−'}
.reader-time{font-weight:400;color:var(--muted);margin-inline-start:auto;white-space:nowrap}
.reader-toc summary::after{margin-inline-start:var(--r0)}
.reader-top{display:flex;align-items:center;justify-content:center;min-width:2.75rem;min-height:3rem;text-decoration:none;font-size:var(--fs-l)}
.reader-toc nav{max-height:min(65svh,30rem);overflow-y:auto;overscroll-behavior:contain;padding-bottom:var(--r1);scrollbar-gutter:stable}
.reader-toc ol{list-style:none;counter-reset:sections;padding:0;margin:0}
.reader-toc li{margin:0;border-top:1px solid var(--line);counter-increment:sections}
.reader-toc li a{display:flex;gap:var(--r1);align-items:baseline;min-height:2.75rem;padding-block:var(--r0);text-decoration:none}
.reader-toc li a::before{content:counter(sections,decimal-leading-zero);font-variant-numeric:tabular-nums;color:var(--muted);font-family:var(--ff-serif)}
.reader-toc li a:hover,.reader-toc li a[aria-current]{text-decoration:underline;text-decoration-color:var(--accent)}
.reader-progress{height:3px;position:absolute;inset:auto 0 -1px;overflow:hidden;pointer-events:none}
.reader-progress span{display:block;width:100%;height:100%;background:var(--accent);transform:scaleX(var(--read-progress,0));transform-origin:left center}
article h2[id]{scroll-margin-top:5rem}
.note-ref,.footnotes li{scroll-margin-top:5rem}
.reader-toc a:focus-visible,.reader-top:focus-visible,.reader-toc summary:focus-visible{outline-offset:-2px}
@media(max-width:25rem){.reader-row{gap:var(--r0)}.reader-toc summary{flex-wrap:wrap;column-gap:var(--r0)}.reader-time{white-space:normal}}
@media print{.reader-tools{display:none}}
`;

const script = `
(() => {
  const tools = document.querySelector('.reader-tools');
  if (!tools) return;
  const toc = tools.querySelector('details');
  const links = [...toc.querySelectorAll('nav a')];
  const sections = links.map(a => document.getElementById(a.hash.slice(1)));
  const article = document.querySelector('article');
  const end = article.querySelector('.footnotes') || article.lastElementChild;
  let pending = false;
  const update = () => {
    pending = false;
    const start = document.getElementById('reader-start').getBoundingClientRect().top + window.scrollY;
    const finish = end.getBoundingClientRect().top + window.scrollY - window.innerHeight;
    const fraction = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, finish - start)));
    tools.style.setProperty('--read-progress', fraction);
    let current = -1;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= 100) current = i; });
    links.forEach((link, i) => { if (i === current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  document.addEventListener('toggle', schedule, true);
  links.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    toc.open = false;
    // The native fragment navigation preserves browser history and keyboard focus.
    schedule();
  }));
  toc.addEventListener('keydown', event => { if (event.key === 'Escape') { toc.open = false; toc.querySelector('summary').focus(); } });
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(article);
  schedule();
})();
`;

export function enhanceReading(source, lang) {
  if (source.includes('class="reader-tools"')) return source;
  const words = readingMinutes(source, lang);
  const [contents, duration, top, progress, estimate] = labels[lang] || labels.en;
  source = source.replace(/(<time\b[^>]*>[\s\S]*?<\/time>)/, '$1<span class="reading-estimate"> · ' + esc(duration.replace('{n}', words.minutes)) + '</span>');
  const entries = [];
  // h2 headings are the editorial sections; preserve existing deep links.
  source = source.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (whole, attrs, text) => {
    let id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (!id) { id = 'section-' + String(entries.length + 1).padStart(2, '0'); attrs += ` id="${id}"`; }
    entries.push({ id, title: plain(text) });
    if (!/\btabindex=/.test(attrs)) attrs += ' tabindex="-1"';
    return `<h2${attrs}>${text}</h2>`;
  });
  const toolbar = `<span id="reader-start" aria-hidden="true"></span><div class="reader-tools" data-reading-minutes="${words.minutes}"><div class="reader-row"><details class="reader-toc"><summary><span>${esc(contents)}</span><span class="reader-time" title="${esc(estimate.replace('{n}', words.minutes))}">${esc(duration.replace('{n}', words.minutes))}</span></summary><nav aria-label="${esc(contents)}"><ol>${entries.map(e => `<li><a href="#${esc(e.id)}">${esc(e.title)}</a></li>`).join('')}</ol></nav></details><a class="reader-top" href="#article-top" aria-label="${esc(top)}" title="${esc(top)}">↑</a></div><div class="reader-progress" aria-hidden="true"><span></span></div></div>`;
  source = source.replace(/<article\b([^>]*)>/, (_, attrs) => `<article${attrs}><span id="article-top" tabindex="-1"></span>`);
  const head = source.match(/<header class="post-head">[\s\S]*?<\/header>/);
  source = head ? source.replace(head[0], head[0] + '\n' + toolbar) : source.replace('<span id="article-top" tabindex="-1"></span>', '<span id="article-top" tabindex="-1"></span>' + toolbar);
  return source.replace('</style>', css + '</style>').replace('</body>', `<script>${script}</script></body>`);
}
