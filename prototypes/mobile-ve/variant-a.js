import { initToolbarInteractions } from './chrome.js';
import { applyCodexIcons } from './icons.js';
import { ARTICLE_TYPES } from './shared-data.js';

const state = {
  selected: ARTICLE_TYPES[0]
};

const overlay = document.getElementById('onboarding');
const carousel = document.getElementById('typeCarousel');
const tipCard = document.getElementById('tipCard');
const toast = document.getElementById('toast');

const progressBar = document.getElementById('outlineProgress');
const progressTypeLabel = document.getElementById('outlineProgressType');
const progressSummary = document.getElementById('outlineSectionSummary');
const reopenButton = document.getElementById('outlineReopen');

let sectionMeta = {};

function renderTypes() {
  carousel.innerHTML = '';
  ARTICLE_TYPES.forEach((type) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `type-card${state.selected.id === type.id ? ' active' : ''}`;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', state.selected.id === type.id ? 'true' : 'false');
    button.innerHTML = `
      <div class="type-name">${type.name}</div>
      <div class="type-outline">${type.outline.map((item) => item.title).join(' • ')}</div>
    `;
    button.addEventListener('click', () => {
      state.selected = type;
      renderTypes();
      renderTips();
    });
    carousel.appendChild(button);
  });
}

function renderTips() {
  const policyLink = `<a class="policy-link" href="${state.selected.policyUrl}" target="_blank" rel="noopener noreferrer">View notability guidance</a>`;
  tipCard.innerHTML = `
    <h2>Before you start</h2>
    <ul>${state.selected.tips.map((tip) => `<li>${tip}</li>`).join('')}</ul>
    ${policyLink}
  `;
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function insertOutline() {
  const canvas = document.getElementById('canvas');
  canvas.innerHTML = '';
  progressBar.hidden = false;
  progressBar.classList.remove('is-hidden');
  progressTypeLabel.textContent = `${state.selected.name} outline`;
  sectionMeta = {};

  state.selected.outline.forEach((section, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'outline-block outline-block--not-started';
    wrapper.dataset.sectionId = section.id;

    const header = document.createElement('div');
    header.className = 'outline-block__header';

    const heading = document.createElement(index === 0 ? 'h1' : 'h2');
    heading.textContent = section.title;
    heading.className = 'outline-block__title';

    const status = document.createElement('span');
    status.className = 'outline-block__status outline-block__status--not-started';
    status.textContent = 'Not started';

    header.append(heading, status);

    const tip = document.createElement('p');
    tip.className = 'outline-block__tip';
    tip.innerHTML = `${section.guidance} <span class="outline-block__reference" role="button" tabindex="0">Add reference</span>`;

    const body = document.createElement('div');
    body.className = 'outline-block__body';
    body.contentEditable = 'true';
    body.dataset.placeholder = 'Tap to start writing…';

    const referenceLink = tip.querySelector('.outline-block__reference');
    referenceLink.hidden = true;

    const meta = {
      status: 'not-started',
      hasReference: false,
      wrapper,
      statusEl: status,
      referenceLink,
      bodyEl: body
    };

    sectionMeta[section.id] = meta;

    const triggerReference = () => {
      alert('Reference dialog (prototype)');
      if (!meta.hasReference) {
        meta.hasReference = true;
        updateSectionVisuals(section.id);
        updateProgressSummary();
      }
    };

    referenceLink.addEventListener('click', triggerReference);
    referenceLink.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        triggerReference();
      }
    });

    body.addEventListener('input', handleSectionInput);

    wrapper.append(header, tip, body);
    canvas.appendChild(wrapper);
  });

  overlay.classList.add('hidden');
  showToast('Outline added — start drafting each section.');
  updateProgressSummary();
  setTimeout(() => {
    const firstBody = canvas.querySelector('.outline-block__body');
    if (firstBody) {
      firstBody.focus();
    }
  }, 120);
}

function skipOnboarding() {
  overlay.classList.add('hidden');
  showToast('Outline skipped — start writing when ready.');
  progressBar.hidden = true;
  progressBar.classList.add('is-hidden');
  sectionMeta = {};
  reopenButton?.classList.remove('is-hidden');
}

function handleSectionInput(event) {
  const body = event.currentTarget;
  const wrapper = body.closest('.outline-block');
  if (!wrapper) return;
  const sectionId = wrapper.dataset.sectionId;
  const meta = sectionMeta[sectionId];
  if (!meta) return;

  const text = body.textContent.trim();
  let status = 'not-started';
  if (text.length > 0 && text.length < 120) status = 'drafting';
  if (text.length >= 120) status = 'ready';

  meta.status = status;
  if (text.length > 0) {
    reopenButton?.classList.add('is-hidden');
    progressBar.classList.remove('is-hidden');
  }

  updateSectionVisuals(sectionId);
  updateProgressSummary();
}

function updateSectionVisuals(sectionId) {
  const meta = sectionMeta[sectionId];
  if (!meta) return;
  const { wrapper, statusEl, referenceLink } = meta;

  let stateClass = 'not-started';
  let label = 'Not started';

  if (meta.status === 'drafting') {
    stateClass = meta.hasReference ? 'reference' : 'drafting';
    label = meta.hasReference ? 'Drafting • ref added' : 'Drafting';
  }

  if (meta.status === 'ready') {
    if (meta.hasReference) {
      stateClass = 'ready';
      label = 'Ready';
    } else {
      stateClass = 'needs-reference';
      label = 'Needs reference';
    }
  }

  wrapper.classList.remove(
    'outline-block--not-started',
    'outline-block--drafting',
    'outline-block--ready',
    'outline-block--reference',
    'outline-block--needs-reference'
  );
  wrapper.classList.add(`outline-block--${stateClass}`);

  if (statusEl) {
    statusEl.classList.remove(
      'outline-block__status--not-started',
      'outline-block__status--drafting',
      'outline-block__status--ready',
      'outline-block__status--reference',
      'outline-block__status--needs-reference'
    );
    statusEl.classList.add(`outline-block__status--${stateClass}`);
    statusEl.textContent = label;
  }

  if (referenceLink) {
    referenceLink.hidden = meta.status === 'not-started';
  }
}

function updateProgressSummary() {
  const entries = Object.values(sectionMeta);
  if (!entries.length) {
    progressSummary.textContent = '';
    return;
  }

  const total = entries.length;
  const ready = entries.filter((meta) => meta.status === 'ready' && meta.hasReference).length;
  const needsReference = entries.filter((meta) => meta.status === 'ready' && !meta.hasReference).length;
  const drafting = entries.filter((meta) => meta.status === 'drafting').length;
  const remaining = entries.filter((meta) => meta.status === 'not-started').length;
  const references = entries.filter((meta) => meta.hasReference).length;

  if (ready === total) {
    progressSummary.textContent = 'All sections ready with references';
  } else {
    progressSummary.textContent = `${ready}/${total} ready • ${needsReference} need references • ${references}/${total} references added`;
  }
}

function reopenOverlay() {
  if (Object.values(sectionMeta).some((meta) => meta.status !== 'not-started')) {
    alert('Switching outline would reset your draft. (Prototype prevents change once drafting begins.)');
    return;
  }
  overlay.classList.remove('hidden');
  progressBar.classList.add('is-hidden');
}

function noop() {}

renderTypes();
renderTips();

initToolbarInteractions();

applyCodexIcons();

document.getElementById('insertOutline').addEventListener('click', insertOutline);
document.getElementById('skipOnboarding').addEventListener('click', skipOnboarding);
reopenButton && reopenButton.addEventListener('click', reopenOverlay);
