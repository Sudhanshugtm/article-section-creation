// Article Creation Concepts: source-based drafting

let quillCreation;
let sources = [];
let insertedTexts = [];
const KNOWN_ARTICLES = [
  'Katie Bouman',
  'John Langford',
  'Henri Gouraud',
  'Eduardo R. Caianiello',
  'Patrick McHale'
];

document.addEventListener('DOMContentLoaded', () => {
  // Init editor
  quillCreation = new Quill('#creationEditor', {
    modules: { 
      toolbar: false,
      history: { delay: 250, maxStack: 100, userOnly: true }
    },
    placeholder: 'Start a neutral, well-sourced lead…',
    theme: 'snow'
  });

  // Add source
  const urlInput = document.getElementById('sourceUrl');
  const addBtn = document.getElementById('addSource');
  const list = document.getElementById('sourcesList');

  function enableIfValid() {
    addBtn.disabled = !urlInput.value.trim();
  }
  urlInput.addEventListener('input', enableIfValid);
  enableIfValid();

  addBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) return;
    const id = sources.length + 1;
    const title = guessTitleFromURL(url) || `Source ${id}`;
    const domain = new URL(safeUrl(url)).hostname.replace(/^www\./,'');
    const source = classifySource({ id, url, title, domain });
    sources.push(source);
    list.appendChild(renderSource(source));
    urlInput.value = '';
    enableIfValid();
    updateChecks();
  });

  // Checks whenever content changes
  quillCreation.on('text-change', updateChecks);

  // Toolbar handlers and icons
  setupToolbarHandlers();
  applyIcons();

  // Match tab toggles to other pages (visual only)
  document.querySelectorAll('.ns-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ns-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('.page-actions .action-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('star')) {
        document.querySelectorAll('.page-actions .action-tab:not(.star)')
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });
});

function renderSource(src) {
  const item = document.createElement('div');
  item.className = 'source-item';
  item.innerHTML = `
    <div class="source-meta">
      <p class="source-title">${escapeHTML(src.title)}</p>
      <p class="source-url">${escapeHTML(src.url)}</p>
      <div class="source-badges">
        <span class="source-badge ${src.kind}">${src.kindLabel}</span>
        ${src.tier ? `<span class="source-badge ${src.tier}">${src.tierLabel}</span>` : ''}
        ${src.independent ? `<span class="source-badge secondary">independent</span>` : `<span class="source-badge primary">not independent</span>`}
      </div>
      <div class="extracted" id="extracted-${src.id}" style="display:none">
        <h5>Extracted statements</h5>
        <div class="facts"></div>
      </div>
    </div>
    <div class="source-actions">
      <button class="btn" data-act="extract">Extract</button>
      <button class="btn primary" data-act="insert-cite">Insert cite</button>
    </div>`;

  item.querySelector('[data-act="extract"]').onclick = () => {
    const box = item.querySelector('.extracted');
    const facts = box.querySelector('.facts');
    facts.innerHTML = '';
    mockExtractFacts(src).forEach(text => {
      const row = document.createElement('p');
      row.className = 'fact';
      row.innerHTML = `<span>${escapeHTML(text)}</span><button class="insert">Insert</button>`;
      row.querySelector('.insert').onclick = () => insertStatement(text, src.id);
      facts.appendChild(row);
    });
    box.style.display = 'block';
  };

  item.querySelector('[data-act="insert-cite"]').onclick = () => {
    insertCitation(src.id);
  };

  return item;
}

function insertStatement(text, sourceId) {
  const citeMark = ` [${sourceId}]`;
  quillCreation.focus();
  const range = quillCreation.getSelection(true) || { index: quillCreation.getLength(), length: 0 };
  quillCreation.insertText(range.index, text + citeMark + '\n');
  insertedTexts.push(text);
  updateChecks();
}

function insertCitation(sourceId) {
  quillCreation.focus();
  const range = quillCreation.getSelection(true) || { index: quillCreation.getLength(), length: 0 };
  quillCreation.insertText(range.index, ` [${sourceId}]`);
  updateChecks();
}

function updateChecks() {
  const text = quillCreation.getText().trim();
  const checksEl = document.getElementById('checks');
  const hasLead = text.length >= 120;
  const hasHeader = quillCreation.getContents().ops.some(op => op.attributes && op.attributes.header);
  const hasCite = /\[[0-9]+\]/.test(text);
  const hasSource = sources.length > 0;

  const independentReliable = sources.filter(s => s.independent && (s.kind === 'secondary') && (s.tier === 'good' || s.tier === 'gov' || s.tier === 'edu'));
  const independentCount = independentReliable.length;
  const notabilityPass = independentCount >= 2;

  const promoWords = ['leading','innovative','world-class','pioneer','premier','award-winning','cutting-edge','revolutionary','renowned','iconic','visionary'];
  const promoHit = promoWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(text));

  let overlap = 0;
  insertedTexts.forEach(t => { const m = text.indexOf(t); if (m !== -1) overlap += t.length; });
  const riskRatio = text.length ? (overlap / text.length) : 0;
  const copyvioLow = riskRatio < 0.2;

  const title = (document.getElementById('draftTitle')?.value || '').trim();
  const clashing = KNOWN_ARTICLES.some(a => a.toLowerCase() === title.toLowerCase());

  const dest = (document.getElementById('destSelect')?.value) || (document.querySelector('input[name="dest"]:checked') || {}).value || 'draft';
  const mainEligible = notabilityPass && hasLead && hasHeader && hasCite && copyvioLow && !promoHit && !clashing;
  const publishBtn = document.getElementById('publish');
  if (publishBtn) {
    if (dest === 'main') publishBtn.disabled = !mainEligible;
    else publishBtn.disabled = text.length === 0;
  }

  checksEl.innerHTML = `
    <h4>Preflight checks</h4>
    <div class="check ${hasSource?'ok':'fail'}">At least one source added</div>
    <div class="check ${notabilityPass?'ok':'fail'}">≥ 2 independent, reliable secondary sources (${independentCount})</div>
    <div class="check ${hasLead?'ok':'fail'}">Lead paragraph is clear and descriptive</div>
    <div class="check ${hasHeader?'ok':'fail'}">Has headings/structure</div>
    <div class="check ${hasCite?'ok':'fail'}">Contains inline citations [n]</div>
    <div class="check ${copyvioLow?'ok':'fail'}">Low copying from sources (${(riskRatio*100)|0}%)</div>
    <div class="check ${!promoHit?'ok':'fail'}">Neutral tone (no promotional language)</div>
    <div class="check ${!clashing?'ok':'fail'}">Title not already used</div>
    <div class="note">Mainspace publish enables only after all checks pass. Draft submission allowed anytime.</div>
  `;
}

// ===== Toolbar behavior (mirrors VE look) =====
function setupToolbarHandlers() {
  function closeMenus() { document.querySelectorAll('.menu').forEach(m => m.classList.remove('open')); }
  document.addEventListener('click', e => { if (!e.target.closest('.dropdown')) closeMenus(); });

  // Undo/Redo
  const undoBtn = document.getElementById('undo');
  const redoBtn = document.getElementById('redo');
  const undoDesktopBtn = document.getElementById('undo-desktop');
  if (undoBtn) undoBtn.onclick = () => quillCreation.history.undo();
  if (redoBtn) redoBtn.onclick = () => quillCreation.history.redo();
  if (undoDesktopBtn) undoDesktopBtn.onclick = () => quillCreation.history.undo();

  // Close -> back to concepts
  const closeBtn = document.getElementById('close');
  if (closeBtn) closeBtn.onclick = () => { window.location.href = 'index.html'; };

  // Mobile style dropdown
  const ddStyleMobile = document.getElementById('dd-style-mobile');
  const menuStyleMobile = document.getElementById('menu-style-mobile');
  if (ddStyleMobile && menuStyleMobile) {
    ddStyleMobile.onclick = (e) => { e.stopPropagation(); closeMenus(); menuStyleMobile.classList.add('open'); };
    menuStyleMobile.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const action = e.target.getAttribute('data-style');
      if (action === 'clean') {
        const sel = quillCreation.getSelection(true);
        if (sel) quillCreation.removeFormat(sel.index, sel.length);
      } else if (action === 'script-sup') {
        quillCreation.format('script', 'super');
      } else if (action === 'script-sub') {
        quillCreation.format('script', 'sub');
      } else {
        quillCreation.format(action, !quillCreation.getFormat()[action]);
      }
      closeMenus();
    });
  }

  // Mobile link
  const linkMobile = document.getElementById('btn-link-mobile');
  if (linkMobile) linkMobile.onclick = () => {
    const sel = quillCreation.getSelection(true);
    if (!sel) return;
    const url = prompt('Enter URL');
    if (url) quillCreation.format('link', url);
  };

  // Mobile quote
  const quoteBtn = document.getElementById('quote');
  if (quoteBtn) quoteBtn.onclick = () => {
    const sel = quillCreation.getSelection(true);
    if (sel) quillCreation.formatText(sel.index, sel.length, 'blockquote', true);
  };

  // Mobile edit dropdown
  const ddEditMobile = document.getElementById('dd-edit-mobile');
  const menuEditMobile = document.getElementById('menu-edit-mobile');
  if (ddEditMobile && menuEditMobile) {
    ddEditMobile.onclick = (e) => { e.stopPropagation(); closeMenus(); menuEditMobile.classList.add('open'); };
    menuEditMobile.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const t = e.target.getAttribute('data-insert');
      if (t === 'image') {
        const url = prompt('Image URL');
        if (url) {
          const range = quillCreation.getSelection(true) || { index: quillCreation.getLength() };
          quillCreation.insertEmbed(range.index, 'image', url, 'user');
        }
      } else {
        alert('This insert is mocked in the demo.');
      }
      closeMenus();
    });
  }

  // Paragraph dropdown
  const ddPara = document.getElementById('dd-paragraph');
  const menuPara = document.getElementById('menu-paragraph');
  if (ddPara && menuPara) {
    ddPara.onclick = (e) => { e.stopPropagation(); closeMenus(); menuPara.classList.add('open'); };
    menuPara.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const val = e.target.getAttribute('data-header');
      if (val === 'code') {
        quillCreation.format('code-block', true);
      } else {
        quillCreation.format('header', val ? parseInt(val) : false);
      }
      ddPara.querySelector('.cdx-button__label').textContent = val ? ('Heading ' + val) : 'Paragraph';
      closeMenus();
    });
  }

  // Style dropdown (desktop)
  const ddStyle = document.getElementById('dd-style');
  const menuStyle = document.getElementById('menu-style');
  if (ddStyle && menuStyle) {
    ddStyle.onclick = (e) => { e.stopPropagation(); closeMenus(); menuStyle.classList.add('open'); };
    menuStyle.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const action = e.target.getAttribute('data-style');
      if (action === 'clean') {
        const sel = quillCreation.getSelection(true);
        if (sel) quillCreation.removeFormat(sel.index, sel.length);
      } else if (action === 'script-sup') {
        quillCreation.format('script', 'super');
      } else if (action === 'script-sub') {
        quillCreation.format('script', 'sub');
      } else {
        quillCreation.format(action, !quillCreation.getFormat()[action]);
      }
      closeMenus();
    });
  }

  // Lists
  const olBtn = document.querySelector('[data-cmd="ol"]');
  const ulBtn = document.querySelector('[data-cmd="ul"]');
  if (olBtn) olBtn.onclick = () => quillCreation.format('list', 'ordered');
  if (ulBtn) ulBtn.onclick = () => quillCreation.format('list', 'bullet');

  // Link (desktop)
  const linkBtn = document.getElementById('btn-link');
  if (linkBtn) linkBtn.onclick = () => {
    const sel = quillCreation.getSelection(true);
    if (!sel) return;
    const url = prompt('Enter URL');
    if (url) quillCreation.format('link', url);
  };

  // Cite dropdown (mock)
  const ddCite = document.getElementById('dd-cite');
  const menuCite = document.getElementById('menu-cite');
  if (ddCite && menuCite) {
    ddCite.onclick = (e) => { e.stopPropagation(); closeMenus(); menuCite.classList.add('open'); };
    menuCite.addEventListener('click', () => { alert('Citations are mocked in this demo.'); closeMenus(); });
  }

  // Insert dropdown
  const ddIns = document.getElementById('dd-insert');
  const menuIns = document.getElementById('menu-insert');
  if (ddIns && menuIns) {
    ddIns.onclick = (e) => { e.stopPropagation(); closeMenus(); menuIns.classList.add('open'); };
    menuIns.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const t = e.target.getAttribute('data-insert');
      if (t === 'image') {
        const url = prompt('Image URL');
        if (url) {
          const range = quillCreation.getSelection(true) || { index: quillCreation.getLength() };
          quillCreation.insertEmbed(range.index, 'image', url, 'user');
        }
      } else if (t === 'char') {
        alert('Special characters dialog is mocked.');
      } else {
        alert('This insert is mocked in the demo.');
      }
      closeMenus();
    });
  }

  // Enable publish when user types
  quillCreation.on('text-change', (delta, oldDelta, source) => {
    if (source === 'user') {
      const publishBtn = document.getElementById('publish');
      if (publishBtn && publishBtn.disabled) {
        publishBtn.disabled = false;
        publishBtn.textContent = 'Publish draft';
      }
    }
  });

  // Publish button
  const publishBtn = document.getElementById('publish');
  if (publishBtn) publishBtn.onclick = () => alert('Publishing disabled in this demo.');
}

// ===== Codex icon loader (from MW API) =====
function loadCodexIcons(iconNames) {
  const url = 'https://www.mediawiki.org/w/api.php?action=query&list=codexicons&format=json&origin=*' +
    '&names=' + encodeURIComponent(iconNames.join('|'));
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      const out = {}; const map = data?.query?.codexicons || {};
      for (const k of Object.keys(map)) {
        const entry = map[k];
        const path = typeof entry === 'string' ? entry : (entry.ltr || entry.default || Object.values(entry.langCodeMap || {})[0] || '');
        out[k] = path;
      }
      return out;
    });
}

function applyIcons() {
  const nodes = Array.from(document.querySelectorAll('.cdx-icon[data-icon]'));
  const names = Array.from(new Set(nodes.map(n => n.getAttribute('data-icon'))));
  loadCodexIcons(names).then(paths => {
    nodes.forEach(n => {
      const name = n.getAttribute('data-icon');
      const p = paths[name];
      if (p) {
        n.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' + p + '</svg>';
      }
    });
  }).catch(() => {/* ignore icon load errors in offline */});
}

function mockExtractFacts(src) {
  const base = src.domain.replace(/\..+$/, '');
  return [
    `${capitalize(base)} reports key biographical details.`,
    `Notable contribution described by ${base}.`,
    `Timeline and context summarized in ${base}.`
  ];
}

function classifySource(s) {
  const domain = s.domain.toLowerCase();
  const gov = /\.(gov|gov\.[a-z]{2})$/.test(domain);
  const edu = /\.(edu|ac\.[a-z]{2})$/.test(domain);
  const press = /(prnewswire|businesswire|globenewswire|newswire|press)/.test(domain);
  const wiki = /(wikipedia\.org|wikimedia\.org)/.test(domain);
  const blog = /(medium\.com|substack\.com|blogspot|wordpress)/.test(domain);
  const social = /(twitter\.com|x\.com|facebook\.com|instagram\.com|tiktok\.com|linkedin\.com)/.test(domain);
  const news = /(nytimes|theguardian|bbc|bloomberg|reuters|apnews|washingtonpost|wsj|ft\.com|nature\.com|sciencemag|arstechnica|theverge|wired|nbcnews|cbsnews|abcnews|latimes|telegraph|economist|aljazeera|lemonde|zeit|spiegel|hindu|indiatimes|ndtv|hindustantimes)/.test(domain);

  let kind = 'secondary', kindLabel = 'secondary';
  let independent = true;
  let tier = '', tierLabel = '';

  if (gov) { tier = 'gov'; tierLabel = 'gov'; }
  else if (edu) { tier = 'edu'; tierLabel = 'edu'; }
  else if (news) { tier = 'good'; tierLabel = 'news'; }
  else if (press) { kind = 'primary'; kindLabel = 'press release'; independent = false; tier = 'warn'; tierLabel = 'primary'; }
  else if (wiki || social) { kind = 'primary'; kindLabel = wiki? 'wiki' : 'social'; independent = false; tier = 'bad'; tierLabel = 'not reliable'; }
  else if (blog) { kind = 'primary'; kindLabel = 'blog'; independent = false; tier = 'warn'; tierLabel = 'self-published'; }
  else { tier = 'warn'; tierLabel = 'unclassified'; }

  return { ...s, kind, kindLabel, independent, tier, tierLabel };
}

function guessTitleFromURL(url) {
  try {
    const u = new URL(safeUrl(url));
    const path = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
    return decodeURIComponent(path.replace(/[-_]/g, ' '));
  } catch { return null; }
}

function safeUrl(url) {
  // Ensure URL has a scheme
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url;
}

function escapeHTML(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
function capitalize(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
