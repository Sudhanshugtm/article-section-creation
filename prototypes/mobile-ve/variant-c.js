import { initToolbarInteractions } from './chrome.js';
import { ARTICLE_TYPES } from './shared-data.js';

const canvas = document.getElementById('canvas');
const toggle = document.getElementById('typeToggle');
let currentType = ARTICLE_TYPES[0];

function createCard(section) {
  const card = document.createElement('article');
  card.className = 'section-card';
  card.dataset.sectionId = section.id;
  card.innerHTML = `
    <header>
      <h2>${section.title}</h2>
      <div class="section-guidance">${section.guidance}</div>
    </header>
    <div class="section-actions">
      <button type="button" class="cdx-button cdx-button--progressive" data-action="add-paragraph">Add paragraph</button>
      <button type="button" class="cdx-button" data-action="add-reference">Add reference</button>
    </div>
  `;

  const addParagraphBtn = card.querySelector('[data-action="add-paragraph"]');
  addParagraphBtn.addEventListener('click', () => insertParagraphAfter(card, section));
  const addReferenceBtn = card.querySelector('[data-action="add-reference"]');
  addReferenceBtn.addEventListener('click', () => {
    alert('Reference dialog would open here in full implementation.');
  });

  return card;
}

function insertParagraphAfter(card, section) {
  const block = document.createElement('div');
  block.className = 'placeholder-block';
  block.contentEditable = 'true';
  block.dataset.sectionId = section.id;
  block.textContent = 'Write 2–3 sentences here…';
  card.insertAdjacentElement('afterend', block);
  card.classList.add('completed');
  addProgressBadge(card);
  setTimeout(() => {
    block.focus();
    document.execCommand('selectAll', false, null);
  }, 0);
}

function addProgressBadge(card) {
  if (card.querySelector('.progress-badge')) {
    return;
  }
  const badge = document.createElement('div');
  badge.className = 'progress-badge';
  badge.textContent = 'Section started';
  card.insertBefore(badge, card.firstChild);
}

function renderCards() {
  canvas.innerHTML = '';
  currentType.outline.forEach((section) => {
    const card = createCard(section);
    canvas.appendChild(card);
  });
}

function openTypeMenu() {
  const menu = document.createElement('div');
  menu.className = 'type-menu';
  menu.setAttribute('role', 'menu');
  ARTICLE_TYPES.forEach((type) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'type-option';
    option.dataset.id = type.id;
    option.textContent = type.name;
    option.addEventListener('click', () => {
      currentType = type;
      toggle.textContent = `${type.name} ▾`;
      toggle.setAttribute('aria-expanded', 'false');
      menu.remove();
      renderCards();
    });
    menu.appendChild(option);
  });

  document.body.appendChild(menu);
  toggle.setAttribute('aria-expanded', 'true');

  const closeMenu = (event) => {
    if (event.target.closest('.type-menu') || event.target === toggle) {
      return;
    }
    menu.remove();
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', closeMenu);
  };

  setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

function init() {
  initToolbarInteractions();
  renderCards();
  toggle.addEventListener('click', () => {
    const alreadyExpanded = toggle.getAttribute('aria-expanded') === 'true';
    if (alreadyExpanded) {
      document.querySelector('.type-menu')?.remove();
      toggle.setAttribute('aria-expanded', 'false');
      return;
    }
    openTypeMenu();
  });
}

init();
