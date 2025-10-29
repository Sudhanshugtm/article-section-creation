import { initToolbarInteractions } from './chrome.js';
import { applyCodexIcons } from './icons.js';
import { ARTICLE_TYPES } from './shared-data.js';

const state = {
  selected: ARTICLE_TYPES[0]
};

const bottomSheet = document.getElementById('bottomSheet');
const guideBanner = document.getElementById('guideBanner');
const guidePill = document.getElementById('guidePill');
const backdrop = document.getElementById('sheetBackdrop');

function openSheet() {
  bottomSheet.classList.add('open');
  bottomSheet.setAttribute('aria-hidden', 'false');
  guideBanner.setAttribute('aria-expanded', 'true');
  guidePill.setAttribute('aria-expanded', 'true');
  backdrop.hidden = false;
}

function closeSheet() {
  bottomSheet.classList.remove('open');
  bottomSheet.setAttribute('aria-hidden', 'true');
  guideBanner.setAttribute('aria-expanded', 'false');
  guidePill.setAttribute('aria-expanded', 'false');
  backdrop.hidden = true;
}

function buildTabs() {
  const tabs = document.getElementById('typeTabs');
  tabs.innerHTML = '';

  ARTICLE_TYPES.forEach((type) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `type-tab${state.selected.id === type.id ? ' active' : ''}`;
    button.textContent = type.name;
    button.addEventListener('click', () => {
      state.selected = type;
      buildTabs();
      renderOutline();
    });
    tabs.appendChild(button);
  });
}

function renderOutline() {
  document.getElementById('outlinePreview').innerHTML = state.selected.outline
    .map((item) => `<div class="outline-chip">${item.title}</div>`)
    .join('');
  document.getElementById('tipList').innerHTML = state.selected.tips
    .map((tip) => `<li>${tip}</li>`)
    .join('');
  document.getElementById('policyLink').href = state.selected.policyUrl;
}

function applyOutline() {
  const canvas = document.getElementById('canvas');
  canvas.innerHTML = '';
  state.selected.outline.forEach((section) => {
    const heading = document.createElement('h2');
    heading.textContent = section.title;
    const placeholder = document.createElement('p');
    placeholder.className = 'guidance-placeholder';
    placeholder.textContent = section.guidance;
    canvas.append(heading, placeholder);
  });
  closeSheet();
  canvas.focus();
}

function handleKeyUp(event) {
  if (event.key === 'Escape') {
    closeSheet();
  }
}

function initInteractions() {
  guideBanner.addEventListener('click', openSheet);
  guideBanner.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      openSheet();
    }
  });

  guidePill.addEventListener('click', openSheet);
  backdrop.addEventListener('click', closeSheet);
  document.getElementById('applyOutline').addEventListener('click', applyOutline);
  document.addEventListener('keyup', handleKeyUp);
}

initToolbarInteractions();
buildTabs();
renderOutline();
initInteractions();
applyCodexIcons();
