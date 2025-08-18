// Article Creation Concepts: source-based drafting

let quillCreation;
let sources = [];

document.addEventListener('DOMContentLoaded', () => {
  // Init editor
  quillCreation = new Quill('#creationEditor', {
    modules: { toolbar: [['bold','italic','underline'], [{'header':[1,2,false]}], [{'list':'ordered'},{'list':'bullet'}], ['link','blockquote']] },
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
    const source = { id, url, title, domain };
    sources.push(source);
    list.appendChild(renderSource(source));
    urlInput.value = '';
    enableIfValid();
    updateChecks();
  });

  // Checks whenever content changes
  quillCreation.on('text-change', updateChecks);
});

function renderSource(src) {
  const item = document.createElement('div');
  item.className = 'source-item';
  item.innerHTML = `
    <div class="source-meta">
      <p class="source-title">${escapeHTML(src.title)}</p>
      <p class="source-url">${escapeHTML(src.url)}</p>
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
  const hasLead = text.length >= 80; // simple heuristic
  const hasHeader = /\n#|\n==|\n.{0,100}\n/.test(text) || quillCreation.getContents().ops.some(op => op.attributes && op.attributes.header);
  const hasCite = /\[[0-9]+\]/.test(text);
  const hasSource = sources.length > 0;

  checksEl.innerHTML = `
    <h4>Draft checks</h4>
    <div class="check ${hasSource?'ok':'fail'}">At least one source added</div>
    <div class="check ${hasLead?'ok':'fail'}">Lead paragraph is reasonably descriptive</div>
    <div class="check ${hasHeader?'ok':'fail'}">Has at least one heading/structure</div>
    <div class="check ${hasCite?'ok':'fail'}">Contains inline citations [n]</div>
  `;
}

function mockExtractFacts(src) {
  const base = src.domain.replace(/\..+$/, '');
  return [
    `${capitalize(base)} reports key biographical details.`,
    `Notable contribution described by ${base}.`,
    `Timeline and context summarized in ${base}.`
  ];
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

