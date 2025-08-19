// Progressive enhancement: replace inline Suggested improvements with JSON data
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

  function renderSuggestions(listEl, items) {
    if (!listEl || !Array.isArray(items)) return;
    const html = items.map(item => {
      const icon = item.icon ? String(item.icon) : '';
      const title = item.title ? String(item.title) : '';
      const why = item.why ? String(item.why) : '';
      const primary = item.primaryAction ? String(item.primaryAction) : '';
      const secondary = item.secondaryAction ? String(item.secondaryAction) : '';
      return (
        '<li class="expand-suggestion">' +
          '<div class="expand-suggestion__icon">' + icon + '</div>' +
          '<div class="expand-suggestion__content">' +
            '<h5>' + title + '</h5>' +
            '<p>' + why + '</p>' +
            '<div class="expand-suggestion__actions">' +
              (primary ? '<button class="expand-suggestion__action expand-suggestion__action--primary">' + primary + '</button>' : '') +
              (secondary ? '<button class="expand-suggestion__action">' + secondary + '</button>' : '') +
            '</div>' +
          '</div>' +
        '</li>'
      );
    }).join('');
    listEl.innerHTML = html;
  }

  function init() {
    const articleId = getArticleId();
    if (!articleId) return; // keep fallback

    // Find the suggestions list in the sidebar
    const listEl = document.querySelector('.expand-sidebar .expand-suggestions');
    if (!listEl) return; // keep fallback

    // Fetch suggestions.json relative to the page (works on GitHub Pages aggregation)
    fetch('suggestions.json', { cache: 'no-store' })
      .then(resp => resp.ok ? resp.json() : Promise.reject(new Error('HTTP ' + resp.status)))
      .then(data => {
        // data is expected to be an object keyed by article id
        const items = data && data[articleId];
        if (!items || !items.length) return; // keep fallback
        renderSuggestions(listEl, items);
      })
      .catch(() => { /* noop: preserve inline fallback */ });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();

