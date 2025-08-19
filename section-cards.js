// Progressive enhancement for concept-editor: build "Pick a section" cards from suggestions.json
(function () {
  function getArticleId() {
    const meta = document.querySelector('meta[name="article-id"]');
    if (meta && meta.content) return meta.content.trim();
    try {
      const path = window.location.pathname;
      const file = path.substring(path.lastIndexOf('/') + 1);
      return file.replace(/\.html?$/i, '');
    } catch (_) {
      return '';
    }
  }

  function slugify(title) {
    return String(title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  function renderCards(container, items) {
    if (!container || !Array.isArray(items)) return;
    // Keep existing custom card if present
    const custom = container.querySelector('.section-card.custom-section');
    // Remove existing non-custom cards
    container.querySelectorAll('.section-card:not(.custom-section)').forEach(el => el.remove());

    // Build new cards
    const frag = document.createDocumentFragment();
    items.forEach(item => {
      const title = item.title ? String(item.title) : '';
      const why = item.why ? String(item.why) : '';
      if (!title) return;
      const card = document.createElement('div');
      card.className = 'section-card';
      card.setAttribute('data-section', slugify(title));
      card.innerHTML = [
        '<h4 class="section-card-title">' + title + '</h4>',
        '<p class="section-card-why">' + why + '</p>'
      ].join('');
      frag.appendChild(card);
    });

    // Insert new cards at start
    container.insertBefore(frag, container.firstChild);
    // Ensure custom card stays at the end
    if (custom && custom.parentNode !== container) {
      container.appendChild(custom);
    }
  }

  function init() {
    const articleId = getArticleId();
    try { console.log('[section-cards] init', { articleId }); } catch (_) {}
    if (!articleId) return;
    const container = document.querySelector('.wizard-overlay .section-suggestions');
    try { console.log('[section-cards] container found:', !!container); } catch (_) {}
    if (!container) return;

    const url = 'suggestions.json?ts=' + Date.now();
    try { console.log('[section-cards] fetching', url); } catch (_) {}
    fetch(url, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
      .then(data => {
        const items = data && data[articleId];
        if (!items || !items.length) return; // fallback to existing cards
        try { console.log('[section-cards]', articleId, 'items:', items.length); } catch (_) {}
        renderCards(container, items);
      })
      .catch((err) => { try { console.warn('[section-cards] fetch error', err); } catch (_) {} /* keep fallback */ });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
