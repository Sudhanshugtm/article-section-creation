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
  state.selected.outline.forEach((section) => {
    const heading = document.createElement('h2');
    heading.textContent = section.title;
    const paragraph = document.createElement('p');
    paragraph.className = 'guidance-placeholder';
    paragraph.textContent = section.guidance;
    canvas.append(heading, paragraph);
  });
  overlay.classList.add('hidden');
  showToast('Outline added — start drafting each section.');
  canvas.focus();
}

function skipOnboarding() {
  overlay.classList.add('hidden');
  showToast('Outline skipped — start writing when ready.');
}

renderTypes();
renderTips();

initToolbarInteractions();

applyCodexIcons();

document.getElementById('insertOutline').addEventListener('click', insertOutline);
document.getElementById('skipOnboarding').addEventListener('click', skipOnboarding);
