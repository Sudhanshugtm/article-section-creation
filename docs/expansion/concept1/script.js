// ABOUTME: JavaScript for Wikipedia-style Visual Editor interface functionality
// ABOUTME: Handles Quill editor initialization, toolbar interactions, and UI controls

// Quill initialization
const quill = new Quill('#editor', {
  modules: { 
    toolbar: false, 
    history: { 
      delay: 250, 
      maxStack: 100, 
      userOnly: true 
    } 
  },
  placeholder: 'Start with a lead paragraph…',
  theme: 'snow'
});

// Set initial content
quill.setContents([
  { insert: 'Katie Bouman\n', attributes: { header: 1 } },
  { insert: 'Katherine Louise Bouman (born 1989) is an American engineer and computer scientist known for computational imaging and contributions to the Event Horizon Telescope.\n\n' },
  { insert: 'Early life and education\n', attributes: { header: 2 } },
  { insert: 'Bouman studied at the University of Michigan (BS) and MIT (SM, PhD). She later joined Caltech.\n\n' }
]);

// Dropdown helpers
function closeMenus() {
  document.querySelectorAll('.menu').forEach(m => m.classList.remove('open'));
}

document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown')) closeMenus();
});

// Undo/Redo
document.getElementById('undo').onclick = () => quill.history.undo();
document.getElementById('redo') && (document.getElementById('redo').onclick = () => quill.history.redo());

// Mobile-specific handlers
document.getElementById('undo-desktop') && (document.getElementById('undo-desktop').onclick = () => quill.history.undo());

// Mobile close button
document.getElementById('close') && (document.getElementById('close').onclick = () => {
  alert('Close editor (mock)');
});

// Mobile quote button
document.getElementById('quote') && (document.getElementById('quote').onclick = () => {
  const sel = quill.getSelection(true);
  if (sel) {
    quill.formatText(sel.index, sel.length, 'blockquote', true);
  }
});

// Mobile link button
document.getElementById('btn-link-mobile') && (document.getElementById('btn-link-mobile').onclick = () => {
  const sel = quill.getSelection(true);
  if (!sel) return;
  const url = prompt('Enter URL');
  if (url) quill.format('link', url);
});

// Mobile submit button
document.getElementById('submit') && (document.getElementById('submit').onclick = () => {
  alert('Submit changes (mock)');
});

// Mobile style dropdown
const ddStyleMobile = document.getElementById('dd-style-mobile');
const menuStyleMobile = document.getElementById('menu-style-mobile');

if (ddStyleMobile && menuStyleMobile) {
  ddStyleMobile.onclick = (e) => {
    e.stopPropagation();
    closeMenus();
    menuStyleMobile.classList.add('open');
  };

  menuStyleMobile.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const action = e.target.getAttribute('data-style');
    if (action === 'clean') {
      const sel = quill.getSelection(true);
      if (sel) quill.removeFormat(sel.index, sel.length);
    } else if (action === 'script-sup') {
      quill.format('script', 'super');
    } else if (action === 'script-sub') {
      quill.format('script', 'sub');
    } else {
      quill.format(action, !quill.getFormat()[action]);
    }
    closeMenus();
  });
}

// Mobile edit dropdown
const ddEditMobile = document.getElementById('dd-edit-mobile');
const menuEditMobile = document.getElementById('menu-edit-mobile');

if (ddEditMobile && menuEditMobile) {
  ddEditMobile.onclick = (e) => {
    e.stopPropagation();
    closeMenus();
    menuEditMobile.classList.add('open');
  };

  menuEditMobile.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const t = e.target.getAttribute('data-insert');
    if (t === 'image') {
      const url = prompt('Image URL');
      if (url) {
        const range = quill.getSelection(true) || { index: quill.getLength() };
        quill.insertEmbed(range.index, 'image', url, 'user');
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

ddPara.onclick = (e) => {
  e.stopPropagation();
  closeMenus();
  menuPara.classList.add('open');
};

menuPara.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  const val = e.target.getAttribute('data-header');
  if (val === 'code') {
    quill.format('code-block', true);
  } else {
    quill.format('header', val ? parseInt(val) : false);
  }
  ddPara.querySelector('.cdx-button__label').textContent = val ? ('Heading ' + val) : 'Paragraph';
  closeMenus();
});

// Style dropdown
const ddStyle = document.getElementById('dd-style');
const menuStyle = document.getElementById('menu-style');

ddStyle.onclick = (e) => {
  e.stopPropagation();
  closeMenus();
  menuStyle.classList.add('open');
};

menuStyle.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  const action = e.target.getAttribute('data-style');
  if (action === 'clean') {
    const sel = quill.getSelection(true);
    if (sel) quill.removeFormat(sel.index, sel.length);
  } else if (action === 'script-sup') {
    quill.format('script', 'super');
  } else if (action === 'script-sub') {
    quill.format('script', 'sub');
  } else {
    quill.format(action, !quill.getFormat()[action]);
  }
  closeMenus();
});

// Lists
document.querySelector('[data-cmd="ol"]').onclick = () => quill.format('list', 'ordered');
document.querySelector('[data-cmd="ul"]').onclick = () => quill.format('list', 'bullet');

// Link
document.getElementById('btn-link').onclick = () => {
  const sel = quill.getSelection(true);
  if (!sel) return;
  const url = prompt('Enter URL');
  if (url) quill.format('link', url);
};

// Cite dropdown (mock)
const ddCite = document.getElementById('dd-cite');
const menuCite = document.getElementById('menu-cite');

ddCite.onclick = (e) => {
  e.stopPropagation();
  closeMenus();
  menuCite.classList.add('open');
};

menuCite.addEventListener('click', () => {
  alert('Citations are mocked in this static demo.');
  closeMenus();
});

// Insert dropdown
const ddIns = document.getElementById('dd-insert');
const menuIns = document.getElementById('menu-insert');

ddIns.onclick = (e) => {
  e.stopPropagation();
  closeMenus();
  menuIns.classList.add('open');
};

menuIns.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  const t = e.target.getAttribute('data-insert');
  if (t === 'image') {
    const url = prompt('Image URL');
    if (url) {
      const range = quill.getSelection(true) || { index: quill.getLength() };
      quill.insertEmbed(range.index, 'image', url, 'user');
    }
  } else if (t === 'char') {
    alert('Special characters dialog is mocked.');
  } else {
    alert('This insert is mocked in the static demo.');
  }
  closeMenus();
});

// Publish button
document.getElementById('publish').onclick = () => alert('Publishing disabled in this static demo.');

// Article/Talk tab toggle (preview only)
document.querySelectorAll('.ns-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ns-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Page action tabs toggle
document.querySelectorAll('.action-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.classList.contains('star')) {
      document.querySelectorAll('.action-tab:not(.star)').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
});

// === Codex Icons via MW API ===
async function loadCodexIcons(iconNames) {
  const url = 'https://www.mediawiki.org/w/api.php?action=query&list=codexicons&format=json&origin=*' +
    '&names=' + encodeURIComponent(iconNames.join('|'));
  const res = await fetch(url);
  const data = await res.json();
  const out = {};
  const map = data?.query?.codexicons || {};
  
  for (const k of Object.keys(map)) {
    const entry = map[k];
    const path = typeof entry === 'string' ? entry : (entry.ltr || entry.default || Object.values(entry.langCodeMap || {})[0] || '');
    out[k] = path;
  }
  return out;
}

// Apply icons on load
(function applyIcons() {
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
  }).catch(console.error);
})();