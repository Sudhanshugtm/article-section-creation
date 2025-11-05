const host = document.getElementById('blueprintHost');
let cleanup = null;

const renderModal = data => `
  <div class="blueprint-backdrop">
    <section class="blueprint-modal" role="dialog" aria-modal="true" aria-labelledby="blueprintTitle">
      <header class="blueprint-header">
        <h2 id="blueprintTitle">We found a head start for “${data.title}”</h2>
        <button class="blueprint-dismiss" aria-label="Dismiss">×</button>
      </header>
      <nav class="blueprint-tabs" role="tablist">
        <button class="blueprint-tab active" data-tab="overview">Overview</button>
        <button class="blueprint-tab" data-tab="outline">Suggested outline</button>
        <button class="blueprint-tab" data-tab="sources">Source ideas</button>
      </nav>
      <section class="blueprint-panel" data-panel="overview">
        <p class="blueprint-summary">${data.wikidataSummary}</p>
        <ul class="blueprint-facts">
          ${data.keyFacts.map(fact => `<li><span>${fact.label}</span><strong>${fact.value}</strong></li>`).join('')}
        </ul>
      </section>
      <section class="blueprint-panel hidden" data-panel="outline">
        <ul class="blueprint-outline">
          ${data.sectionOutline.map(section => `<li>${section.title}<span>${section.rationale}</span></li>`).join('')}
        </ul>
      </section>
      <section class="blueprint-panel hidden" data-panel="sources">
        <ul class="blueprint-sources">
          ${data.references.map(ref => `<li><strong>${ref.title}</strong><span>${ref.publisher} · ${ref.year}</span><a href="${ref.url}" target="_blank" rel="noopener">Open</a></li>`).join('')}
        </ul>
      </section>
      <footer class="blueprint-footer">
        <label class="concept-pill blueprint-pin">
          <input type="checkbox" id="pinBlueprint" checked>
          Pin blueprint
        </label>
        <button class="blueprint-primary">Start writing with this outline</button>
        <button class="blueprint-secondary">Dismiss</button>
      </footer>
    </section>
  </div>
`;

export const mountBlueprint = data => {
  if (!host) {
    return;
  }
  host.innerHTML = renderModal(data);

  const backdrop = host.querySelector('.blueprint-backdrop');
  const tabs = Array.from(host.querySelectorAll('.blueprint-tab'));
  const panels = Array.from(host.querySelectorAll('.blueprint-panel'));
  const dismissBtn = host.querySelector('.blueprint-dismiss');
  const secondaryBtn = host.querySelector('.blueprint-secondary');
  const primaryBtn = host.querySelector('.blueprint-primary');
  const pinCheckbox = host.querySelector('#pinBlueprint');
  const tabHandlers = [];

  const toggleTab = tabName => {
    tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    panels.forEach(panel => panel.classList.toggle('hidden', panel.dataset.panel !== tabName));
  };

  const onTabClick = event => toggleTab(event.currentTarget.dataset.tab);
  tabs.forEach(btn => {
    btn.addEventListener('click', onTabClick);
    tabHandlers.push({ btn, handler: onTabClick });
  });

  const close = () => {
    unmountBlueprint();
  };

  const onPrimary = () => {
    toggleTab('outline');
    backdrop.classList.add('pinned');
    if (pinCheckbox && !pinCheckbox.checked) {
      pinCheckbox.checked = true;
    }
  };

  const onPinToggle = event => {
    backdrop.classList.toggle('pinned', event.target.checked);
  };

  if (pinCheckbox) {
    pinCheckbox.addEventListener('change', onPinToggle);
  }
  dismissBtn?.addEventListener('click', close);
  secondaryBtn?.addEventListener('click', close);
  primaryBtn?.addEventListener('click', onPrimary);

  cleanup = () => {
    tabHandlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
    dismissBtn?.removeEventListener('click', close);
    secondaryBtn?.removeEventListener('click', close);
    primaryBtn?.removeEventListener('click', onPrimary);
    pinCheckbox?.removeEventListener('change', onPinToggle);
    host.innerHTML = '';
  };
};

export const unmountBlueprint = () => {
  if (cleanup) {
    cleanup();
  }
  cleanup = null;
};
