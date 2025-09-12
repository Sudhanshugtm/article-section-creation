// Progressive enhancement: replace inline Suggested improvements with JSON data
(function () {
  // Cached items for returning from Focus Mode
  let lastItems = null;
  let lastListEl = null;
  let currentFocus = null;

  const SECTION_HELP = {
    education: {
      articles: [
        { title: 'Ada Lovelace', excerpt: 'Ada Lovelace received private education from tutors and governesses, studying mathematics and science under the guidance of several notable scholars.' },
        { title: 'Andrew Ng', excerpt: 'Andrew Ng earned degrees in computer science and electrical engineering, completing his doctoral studies with a focus on machine learning.' }
      ],
      tips: [
        'Order degrees chronologically; include institution, field, and year',
        'Add thesis/advisor only when notable and cited'
      ]
    },
    career: {
      articles: [
        { title: 'Tim Berners‑Lee', excerpt: 'Berners‑Lee held research and leadership roles at academic and industrial institutions, developing and standardizing web technologies.' },
        { title: 'Fei‑Fei Li', excerpt: 'Li has led research labs and initiatives in computer vision and AI, holding professorships and director positions across major institutions.' }
      ],
      tips: [
        'Summarize roles and appointments with dates; avoid CV‑style lists',
        'Highlight milestones and notable projects with independent sourcing'
      ]
    },
    research: {
      articles: [
        { title: 'Geoffrey Hinton', excerpt: 'Hinton’s research centers on neural networks and representation learning, with work that has influenced modern deep learning methods.' },
        { title: 'Yoshua Bengio', excerpt: 'Bengio’s contributions include advances in deep learning architectures and training methods, emphasizing reproducibility and impact across applications.' }
      ],
      tips: [
        'Use secondary sources to summarize contributions; avoid self‑promotion',
        'Introduce terms with links; keep details high‑level and neutral'
      ]
    },
    publications: {
      articles: [
        { title: 'Leslie Lamport', excerpt: 'Selected publications include foundational papers on distributed systems and formal methods; citations typically include full bibliographic details and DOIs.' },
        { title: 'Barbara Liskov', excerpt: 'Representative works highlight key advances in programming languages and systems; lists emphasize notable, peer‑reviewed items.' }
      ],
      tips: [
        'List representative, peer‑reviewed works with full citations/DOIs',
        'Avoid exhaustive bibliographies; prefer items with independent coverage'
      ]
    },
    awards: {
      articles: [
        { title: 'Donna Strickland', excerpt: 'Awards and honors are listed with year, awarding body, and context; significant recognitions are summarized with references.' },
        { title: 'John McCarthy (computer scientist)', excerpt: 'Honors separate major awards and provide concise, verifiable details with reliable sources.' }
      ],
      tips: [
        'Provide year, awarding body, category, and work/project (if applicable)',
        'Differentiate wins from nominations; include citations for each entry'
      ]
    },
    personal: {
      articles: [
        { title: 'Katherine Johnson', excerpt: 'Personal life sections present brief, relevant, and sourced details, avoiding private information and speculative claims.' },
        { title: 'Grace Hopper', excerpt: 'Content focuses on verifiable aspects of personal history and legacy without extraneous detail.' }
      ],
      tips: [
        'Follow BLP policy; include only verifiable, relevant details',
        'Avoid unsourced or private information; keep it concise'
      ]
    }
  };

  function keyFromTitle(title) {
    const t = String(title || '').toLowerCase();
    if (t.includes('publication')) return 'publications';
    if (t.includes('award') || t.includes('recognition')) return 'awards';
    if (t.includes('education')) return 'education';
    if (t.includes('career') || t.includes('affiliation')) return 'career';
    if (t.includes('research')) return 'research';
    if (t.includes('personal')) return 'personal';
    return '';
  }
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
    lastItems = items;
    lastListEl = listEl;
    const limited = items.slice(0, 2);
    // Removed example link functionality for now
    const html = limited.map(item => {
      const icon = item.icon ? String(item.icon) : '';
      const title = item.title ? String(item.title) : '';
      const why = item.why ? String(item.why) : '';
      // Reference and Example blocks removed per request
      const include = Array.isArray(item.include) ? item.include.map(String) : [];
      const primary = item.primaryAction ? String(item.primaryAction) : '';
      const attrTitle = title.replace(/\"/g, '&quot;');
      const includeAttr = include.length ? include.map(s => s.replace(/\|\|/g, ' / ')).join('||') : '';
      // example key removed
      return (
        '<li class="expand-suggestion">' +
          '<div class="expand-suggestion__icon" aria-hidden="true" style="display:none">' + icon + '</div>' +
          '<div class="expand-suggestion__content">' +
            '<h5 class="suggestion-title">' + title + '</h5>' +
            '<p>' + why + '</p>' +
            '' +
            (include.length ? (
              '<div class="include-guidance no-bg">' +
                '<div class="include-guidance__title">What to include</div>' +
                '<ul class="include-guidance__list">' +
                  include.map(it => '<li>' + it + '</li>').join('') +
                '</ul>' +
              '</div>'
            ) : '') +
            (primary ? '<div class="suggestion-actions">'
              + '<a href="#" class="wiki-link" data-action="insert-section" data-title="' + attrTitle + '" data-include="' + includeAttr + '">' + primary + '</a>'
              + '</div>' : '') +
          '</div>' +
        '</li>'
      );
    }).join('');
    listEl.innerHTML = html;
  }

  function renderFocusMode(title, include) {
    const listEl = lastListEl;
    if (!listEl) return;
    currentFocus = { title, include: include || [] };
    const key = keyFromTitle(title);
    const help = SECTION_HELP[key] || { examples: [], tips: [] };
    const includeHtml = (currentFocus.include && currentFocus.include.length)
      ? '<div class="include-guidance">'
        + '<div class="include-guidance__title">What to include:</div>'
        + '<ul class="include-guidance__list">'
        + currentFocus.include.map(it => '<li>' + it + '</li>').join('')
        + '</ul>'
        + '</div>'
      : '';

    const examplesHtml = help.articles && help.articles.length
      ? '<div class="wiki-examples">'
        + help.articles.map(a => (
            '<div class="wiki-example">'
            +   '<div class="wiki-example__title wiki-link" role="presentation">' + a.title + '</div>'
            +   '<p class="wiki-example__excerpt">' + a.excerpt + '</p>'
            + '</div>'
          )).join('')
        + '</div>'
      : '';

    const tipsHtml = help.tips && help.tips.length
      ? '<div class="tips-guidance">'
        + '<div class="tips-guidance__title">Community tips</div>'
        + '<ul class="tips-guidance__list">'
        + help.tips.map(t => '<li>' + t + '</li>').join('')
        + '</ul>'
        + '</div>'
      : '';

    listEl.innerHTML = (
      '<li class="expand-suggestion">'
      + '<div class="expand-suggestion__icon">💡</div>'
      + '<div class="expand-suggestion__content">'
      +   '<div class="focus-header">'
      +     '<h5 class="focus-title">Working on: ' + title + '</h5>'
      +     '<a href="#" class="focus-back-link" data-sidebar-action="focus-back">Back</a>'
      +   '</div>'
      +   includeHtml + examplesHtml + tipsHtml
      + '</div>'
      + '</li>'
    );
  }

  function init() {
    const articleId = getArticleId();
    if (!articleId) return; // keep fallback

    // Find the suggestions list in the sidebar
    const listEl = document.querySelector('.expand-sidebar .expand-suggestions');
    if (!listEl) return; // keep fallback

    // Fetch suggestions file (can be overridden via window.SUGGESTIONS_FILE)
    // Add a cache-busting query to avoid CDN/browser caching
    const suggestionsFile = window.SUGGESTIONS_FILE || 'suggestions.json';
    const url = suggestionsFile + '?ts=' + Date.now();
    fetch(url, { cache: 'no-store' })
      .then(resp => resp.ok ? resp.json() : Promise.reject(new Error('HTTP ' + resp.status)))
      .then(data => {
        // data is expected to be an object keyed by article id
        const items = data && data[articleId];
        if (!items || !items.length) return; // keep fallback
        try { console.log('[suggestions]', articleId, 'items:', items.length); } catch (_) {}
        renderSuggestions(listEl, items);
        // Listen for focus requests from editor
        document.addEventListener('sidebar:focusSection', (ev) => {
          const d = ev && ev.detail || {};
          if (!d.title) return;
          renderFocusMode(String(d.title), Array.isArray(d.include) ? d.include : []);
        });

        // Sidebar actions in Focus Mode
        document.addEventListener('click', (e) => {
          const actBtn = e.target.closest('[data-sidebar-action]');
          if (!actBtn) return;
          const action = actBtn.getAttribute('data-sidebar-action');
          if (action === 'focus-back') {
            if (lastListEl && lastItems) renderSuggestions(lastListEl, lastItems);
            return;
          }
          if (action === 'focus-jump') {
            if (currentFocus && currentFocus.title) {
              document.dispatchEvent(new CustomEvent('editor:jumpToHeading', { detail: { title: currentFocus.title } }));
            }
            return;
          }
          if (action === 'focus-insert-outline') {
            if (currentFocus && currentFocus.title) {
              document.dispatchEvent(new CustomEvent('editor:insertOutline', { detail: { title: currentFocus.title, include: currentFocus.include || [] } }));
            }
            return;
          }
        });
      })
      .catch(() => { /* noop: preserve inline fallback */ });
  }

  function initInteractivity() {
    // Sidebar close functionality
    const expandSidebar = document.getElementById('expandSidebar');
    const expandSidebarClose = document.getElementById('expandSidebarClose');

    if (expandSidebarClose && expandSidebar) {
      // Close button hides sidebar
      expandSidebarClose.addEventListener('click', () => {
        expandSidebar.style.display = 'none';
      });
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
    initInteractivity();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initInteractivity();
    });
  }
})();
