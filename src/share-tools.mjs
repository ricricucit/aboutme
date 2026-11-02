// Small, destination-neutral sharing helpers. Visitors choose where anything goes.
const labels = {
  en: ['Share', 'Share this section', 'Share passage', 'Link copied', 'Passage and link copied', 'Close', 'Copy this text to share it', 'Select a passage to share it with a link to its place in the page.'],
  it: ['Condividi', 'Condividi questa sezione', 'Condividi passaggio', 'Link copiato', 'Passaggio e link copiati', 'Chiudi', 'Copia questo testo per condividerlo', 'Seleziona un passaggio per condividerlo con il link al punto della pagina.'],
  de: ['Teilen', 'Diesen Abschnitt teilen', 'Textstelle teilen', 'Link kopiert', 'Textstelle und Link kopiert', 'Schließen', 'Diesen Text zum Teilen kopieren', 'Markiere eine Textstelle, um sie mit einem Link zur Stelle auf der Seite zu teilen.'],
  fr: ['Partager', 'Partager cette section', 'Partager le passage', 'Lien copié', 'Passage et lien copiés', 'Fermer', 'Copiez ce texte pour le partager', 'Sélectionnez un passage pour le partager avec un lien vers son emplacement dans la page.'],
  es: ['Compartir', 'Compartir esta sección', 'Compartir pasaje', 'Enlace copiado', 'Pasaje y enlace copiados', 'Cerrar', 'Copia este texto para compartirlo', 'Selecciona un pasaje para compartirlo con un enlace a su lugar en la página.'],
  pt: ['Partilhar', 'Partilhar esta secção', 'Partilhar excerto', 'Ligação copiada', 'Excerto e ligação copiados', 'Fechar', 'Copia este texto para o partilhares', 'Seleciona um excerto para o partilhares com uma ligação ao ponto da página.'],
  nl: ['Delen', 'Deze sectie delen', 'Passage delen', 'Link gekopieerd', 'Passage en link gekopieerd', 'Sluiten', 'Kopieer deze tekst om te delen', 'Selecteer een passage om die te delen met een link naar de plek op de pagina.'],
  pl: ['Udostępnij', 'Udostępnij tę sekcję', 'Udostępnij fragment', 'Link skopiowany', 'Fragment i link skopiowane', 'Zamknij', 'Skopiuj ten tekst, aby go udostępnić', 'Zaznacz fragment, aby udostępnić go z linkiem do jego miejsca na stronie.'],
  uk: ['Поділитися', 'Поділитися цим розділом', 'Поділитися уривком', 'Посилання скопійовано', 'Уривок і посилання скопійовано', 'Закрити', 'Скопіюйте цей текст, щоб поділитися', 'Виділіть уривок, щоб поділитися ним із посиланням на його місце на сторінці.']
};
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const icon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 15V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/></svg>';

export function makeShareData(base, title, { id = '', heading = '', quote = '' } = {}) {
  const url = new URL(base);
  url.search = ''; url.hash = '';
  const fragment = quote ? ':~:text=' + encodeURIComponent([...quote].slice(0, 160).join('')).replace(/-/g, '%2D') : '';
  url.hash = (id ? encodeURIComponent(id) : '') + fragment;
  return { title, text: quote ? '“' + quote + '”' : heading || title, url: url.href };
}

const css = `
/* Sharing is opt-in, with no social SDKs or requests before a visitor acts. */
.share-dock{position:fixed;z-index:30;inset:auto max(var(--r1),env(safe-area-inset-right)) max(var(--r1),env(safe-area-inset-bottom)) auto;display:flex;align-items:center;max-width:calc(100vw - var(--r2));border:1px solid var(--line);border-radius:2rem;background:var(--bg);color:var(--fg);box-shadow:0 2px 12px #0002}
.share-dock button,.share-section,.share-dialog button{font:inherit;font-size:var(--fs-s);color:inherit;cursor:pointer;min-height:2.75rem;min-width:2.75rem;border:0;background:transparent;display:inline-flex;align-items:center;justify-content:center;gap:var(--r0);padding:var(--r0) var(--r1);line-height:1.5}
.share-dock button{border-radius:2rem}
.share-dock [hidden]{display:none}
.share-dock svg,.share-section svg{width:1.125rem;height:1.125rem;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.share-dock button:hover,.share-dialog button:hover{background:var(--accent);color:#0a0a0a}
.share-dock button:focus-visible,.share-section:focus-visible,.share-dialog button:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.share-section{vertical-align:middle;padding:var(--r0);margin-inline-start:var(--r0);color:var(--muted);border-radius:50%;letter-spacing:normal}
.share-section:hover{color:var(--fg);background:var(--line)}
.share-status{position:fixed;z-index:40;inset:auto var(--r1) calc(4rem + env(safe-area-inset-bottom)) auto;max-width:calc(100vw - var(--r2));font-size:var(--fs-s);line-height:1.5;background:var(--fg);color:var(--bg);border-radius:var(--r0);padding:var(--r0) var(--r1);pointer-events:none}
.share-status:empty{opacity:0}
.share-dialog{background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:var(--r1);padding:var(--r2);width:min(32rem,calc(100vw - var(--r4)));max-height:80svh;overflow:auto}
.share-dialog::backdrop{background:#0008}
.share-dialog p{margin:0 0 var(--r1)}
.share-dialog label{display:block;font-size:var(--fs-s);margin-bottom:var(--r0)}
.share-dialog textarea{display:block;box-sizing:border-box;width:100%;min-height:9rem;font:inherit;font-size:var(--fs-s);background:var(--bg);color:var(--fg);border:1px solid var(--muted);padding:var(--r1);resize:vertical}
.share-dialog form{margin-top:var(--r1);text-align:end}
.share-dialog button{border:1px solid var(--line);border-radius:2rem}
body:has(.share-dock){padding-bottom:calc(var(--r4) + env(safe-area-inset-bottom))}
@media print{.share-dock,.share-section,.share-status,.share-dialog{display:none}}
`;

function initSharing(labels, makeShareData) {
  const [share, , passage, copied, quoteCopied] = labels;
  const dock = document.querySelector('.share-dock');
  const main = document.querySelector('main') || document.querySelector('article');
  const action = dock.querySelector('[data-share-page]');
  const actionText = action.querySelector('span');
  const dismiss = dock.querySelector('[data-share-dismiss]');
  const status = document.querySelector('.share-status');
  const dialog = document.querySelector('.share-dialog');
  const base = document.querySelector('link[rel="canonical"]')?.href || location.href;
  const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
  let selected = null, busy = false, timer;
  const notify = text => { clearTimeout(timer); status.textContent = text; timer = setTimeout(() => { status.textContent = ''; }, 3500); };
  const sync = () => { actionText.textContent = selected ? passage : share; dismiss.hidden = !selected; };
  const clear = () => { selected = null; sync(); };
  const send = async (options, button) => {
    if (busy) return;
    busy = true; button.disabled = true;
    const data = makeShareData(base, title, options);
    try {
      if (navigator.share) {
        try { await navigator.share(data); return; }
        catch (error) { if (error.name === 'AbortError') return; }
      }
      const text = options.quote ? data.text + '\n\n' + data.url : data.url;
      try { await navigator.clipboard.writeText(text); notify(options.quote ? quoteCopied : copied); }
      catch {
        const field = dialog.querySelector('textarea');
        field.value = text;
        dialog.showModal(); field.focus(); field.select();
      }
    } finally { busy = false; button.disabled = false; }
  };
  action.addEventListener('click', () => send(selected || {}, action));
  // Keep the selected passage available while the reader taps its share action.
  dock.addEventListener('pointerdown', event => { if (selected && event.target.closest('button')) event.preventDefault(); });
  dismiss.addEventListener('click', () => { clear(); window.getSelection()?.removeAllRanges(); action.focus(); });
  document.querySelectorAll('[data-share-section]').forEach(button => {
    button.addEventListener('click', () => send({ id: button.dataset.shareSection, heading: button.dataset.shareHeading }, button));
  });
  document.addEventListener('selectionchange', () => {
    // Opening the manual copy fallback selects its textarea, not a new passage.
    if (dialog.open) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) { clear(); return; }
    const range = selection.getRangeAt(0);
    const node = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    const quote = selection.toString().replace(/\s+/g, ' ').trim();
    if (!main?.contains(range.commonAncestorContainer) || !node || node.closest('button,input,textarea,nav,script,style') || quote.length < 3) { clear(); return; }
    let id = node.closest('details[id]')?.id || '';
    if (!id) for (const heading of main.querySelectorAll('h2[id]')) {
      if (heading.contains(node) || (heading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) id = heading.id;
    }
    selected = { quote, id }; sync();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.open) clear(); });
  dialog.addEventListener('close', () => { clear(); action.focus(); });
  // Section anchors remain useful even where text fragments are unsupported.
  const reveal = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1).split(':~:')[0]); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let opened = false;
    for (let element = target; element; element = element.parentElement) {
      if (element.tagName === 'DETAILS' && !element.open) { element.open = true; opened = true; }
    }
    if (opened) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  };
  window.addEventListener('hashchange', reveal);
  reveal();
}

export function enhanceSharing(source, lang) {
  if (source.includes('class="share-dock"')) return source;
  const text = labels[lang] || labels.en;
  // Reader headings already have stable IDs. Keep their text separate from controls.
  source = source.replace(/<h2\b([^>]*\bid="([^"]+)"[^>]*)>([\s\S]*?)<\/h2>/g, (_, attrs, id, content) => {
    const title = content.replace(/<[^>]*>/g, '').trim();
    return `<h2${attrs}>${content}<button type="button" class="share-section" data-share-section="${esc(id)}" data-share-heading="${esc(title)}" aria-label="${esc(text[1] + ': ' + title)}" title="${esc(text[1])}">${icon}</button></h2>`;
  });
  const markup = `<div class="share-dock"><button type="button" data-share-page title="${esc(text[7])}">${icon}<span>${esc(text[0])}</span></button><button type="button" data-share-dismiss hidden aria-label="${esc(text[5])}">×</button></div><div class="share-status" role="status" aria-atomic="true"></div><dialog class="share-dialog" aria-labelledby="share-dialog-title"><p id="share-dialog-title">${esc(text[0])}</p><label for="share-copy-text">${esc(text[6])}</label><textarea id="share-copy-text" readonly></textarea><form method="dialog"><button>${esc(text[5])}</button></form></dialog>`;
  const script = `(${initSharing.toString()})(${JSON.stringify(text).replace(/</g, '\\u003c')},${makeShareData.toString()});`;
  return source.replace('</style>', css + '</style>').replace('</body>', `${markup}<script>${script}</script></body>`);
}
