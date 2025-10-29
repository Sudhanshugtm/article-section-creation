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
  state.selected.outline.forEach((section, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'outline-block';
    wrapper.dataset.sectionId = section.id;

    const heading = document.createElement(index === 0 ? 'h1' : 'h2');
    heading.textContent = section.title;
    heading.className = 'outline-block__title';

    const tip = document.createElement('p');
    tip.className = 'outline-block__tip';
    tip.innerHTML = `${section.guidance} <span class="outline-block__reference" role="button" tabindex="0">Add reference</span>`;

    const body = document.createElement('p');
    body.className = 'outline-block__body';
    body.contentEditable = 'true';
    body.dataset.placeholder = 'Tap to start writing…';

    const referenceLink = tip.querySelector('.outline-block__reference');
    const triggerReference = () => alert('Reference dialog (prototype)');
    referenceLink.addEventListener('click', triggerReference);
    referenceLink.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        triggerReference();
      }
    });

    wrapper.append(heading, tip, body);
    canvas.appendChild(wrapper);
  });

  overlay.classList.add('hidden');
  showToast('Outline added — start drafting each section.');
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
}

function noop() {}

renderTypes();
renderTips();

initToolbarInteractions();

applyCodexIcons();

document.getElementById('insertOutline').addEventListener('click', insertOutline);
document.getElementById('skipOnboarding').addEventListener('click', skipOnboarding);
