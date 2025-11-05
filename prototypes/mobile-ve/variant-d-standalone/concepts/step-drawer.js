const host = document.getElementById('drawerHost');
let teardown = null;

const STEP_COPY = [
  { id: 'confirm', title: 'Confirm the topic', body: 'We matched the Wikidata item so you can double-check the basics.' },
  { id: 'outline', title: 'Shape your outline', body: 'Pick the sections that make sense for this article.' },
  { id: 'facts', title: 'Gather quick facts', body: 'Grab ready-to-cite details before you start typing.' }
];

const renderDrawer = data => `
  <aside class="drawer-shell" aria-label="Onboarding steps">
    <header class="drawer-header">
      <span class="concept-pill">Guided steps</span>
      <button class="drawer-collapse" aria-label="Collapse drawer">▾</button>
    </header>
    <ol class="drawer-steps">
      ${STEP_COPY.map((step, index) => `
        <li class="drawer-step" data-step="${step.id}">
          <div class="drawer-step-meta">
            <span class="drawer-step-number">${index + 1}</span>
            <h3>${step.title}</h3>
          </div>
          <p>${step.body}</p>
          ${step.id === 'confirm' ? `
            <div class="drawer-card">
              <h4>${data.title}</h4>
              <p>${data.wikidataSummary}</p>
              <button class="drawer-action" data-action="confirm">Looks good</button>
            </div>
          ` : ''}
          ${step.id === 'outline' ? `
            <div class="drawer-outline">
              ${data.sectionOutline.map(section => `
                <label class="drawer-checkbox">
                  <input type="checkbox" checked>
                  <span>${section.title}</span>
                  <small>${section.rationale}</small>
                </label>
              `).join('')}
              <button class="drawer-action" data-action="save-outline">Add to outline</button>
            </div>
          ` : ''}
          ${step.id === 'facts' ? `
            <ul class="drawer-facts">
              ${data.references.map(ref => `
                <li>
                  <strong>${ref.title}</strong>
                  <span>${ref.publisher} · ${ref.year}</span>
                  <button data-url="${ref.url}" class="drawer-action drawer-action--secondary">Copy cite</button>
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </li>
      `).join('')}
    </ol>
  </aside>
`;

export const mountDrawer = data => {
  if (!host) {
    return;
  }
  host.innerHTML = renderDrawer(data);
  const shell = host.querySelector('.drawer-shell');
  const collapseBtn = shell.querySelector('.drawer-collapse');
  const actionButtons = Array.from(shell.querySelectorAll('.drawer-action'));

  const onCollapseToggle = () => {
    shell.classList.toggle('collapsed');
  };

  const onActionClick = event => {
    const button = event.currentTarget;
    button.classList.add('drawer-action--done');
    button.textContent = button.dataset.action === 'save-outline' ? 'Outline added' : 'Done';
  };

  collapseBtn.addEventListener('click', onCollapseToggle);
  actionButtons.forEach(btn => btn.addEventListener('click', onActionClick));

  teardown = () => {
    collapseBtn.removeEventListener('click', onCollapseToggle);
    actionButtons.forEach(btn => btn.removeEventListener('click', onActionClick));
    host.innerHTML = '';
  };
};

export const unmountDrawer = () => {
  if (teardown) {
    teardown();
  }
  teardown = null;
};
