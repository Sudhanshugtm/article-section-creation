# Article Creation Outline MVP Prototypes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build three mobile-first HTML prototypes within `article-creator.html` showcasing onboarding overlay, bottom-sheet guide, and inline section card flows that closely match mobile VisualEditor styling.

**Architecture:** Each variant lives on its own standalone HTML page reusing shared VE-like chrome CSS and data helpers. Shared assets split into reusable partials and JS modules to avoid duplication while keeping prototypes independent.

**Tech Stack:** Static HTML/CSS/JS (Codex CSS tokens, minimal vanilla JS), existing project styles (`article-selection-styles.css`, `creation-styles.css`), no build pipeline.

---

### Task 1: Establish Shared Prototype Scaffold

**Files:**
- Create: `prototypes/mobile-ve/chrome.css`
- Create: `prototypes/mobile-ve/chrome.js`
- Create: `prototypes/mobile-ve/shared-data.js`
- Modify: `article-creator.html`

**Step 1: Create shared CSS file with VE-like chrome**
```css
/* prototypes/mobile-ve/chrome.css */
:root {
  --ve-toolbar-height: 56px;
  --ve-toolbar-bg: #f8f9fa;
  --ve-toolbar-border: #eaecf0;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #fff;
}
.ve-toolbar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  height: var(--ve-toolbar-height);
  background: var(--ve-toolbar-bg);
  border-bottom: 1px solid var(--ve-toolbar-border);
  box-sizing: border-box;
}
.ve-toolbar button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  font-size: 18px;
}
.ve-canvas {
  min-height: calc(100vh - var(--ve-toolbar-height));
  padding: 16px;
  line-height: 1.4;
}
```

**Step 2: Create shared JS helpers**
```js
// prototypes/mobile-ve/chrome.js
export function initToolbarInteractions(root=document) {
  const closeBtn = root.querySelector('[data-ve-close]');
  if (closeBtn) closeBtn.addEventListener('click', () => alert('Close (prototype)'));
  const nextBtn = root.querySelector('[data-ve-next]');
  if (nextBtn) nextBtn.addEventListener('click', () => alert('Next / Publish (prototype)'));
}
```

```js
// prototypes/mobile-ve/shared-data.js
export const ARTICLE_TYPES = [
  {
    id: 'biography',
    name: 'Biography',
    outline: [
      { id: 'lead', title: 'Lead paragraph', guidance: 'Introduce the subject and notability quickly.' },
      { id: 'early-life', title: 'Early life', guidance: 'Summarize birth, upbringing, formative experiences.' }
    ],
    tips: [
      'Cite independent, reliable sources for key claims.',
      'Avoid promotional tone; keep language neutral.'
    ],
    policyUrl: 'https://en.wikipedia.org/wiki/Wikipedia:Notability_(people)'
  },
  {
    id: 'organization',
    name: 'Organization',
    outline: [
      { id: 'overview', title: 'Overview', guidance: 'Describe what the organization does and why it matters.' },
      { id: 'history', title: 'History', guidance: 'Highlight founding, milestones, major changes.' }
    ],
    tips: [
      'Cover at least two independent, secondary sources.',
      'Include dates for major events where possible.'
    ],
    policyUrl: 'https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)'
  }
];
```

**Step 3: Add index links to article-creator.html for quick access**
```html
<!-- article-creator.html (within body) -->
<nav class="prototype-links">
  <a href="prototypes/mobile-ve/variant-a.html">Variant A – Onboarding overlay</a>
  <a href="prototypes/mobile-ve/variant-b.html">Variant B – Bottom sheet guide</a>
  <a href="prototypes/mobile-ve/variant-c.html">Variant C – Inline cards</a>
</nav>
```

**Step 4: Manual verification**
- Open `article-creator.html` locally; ensure nav links render slim and unobtrusive at top.

**Step 5: Commit**
```bash
git add prototypes/mobile-ve/chrome.css prototypes/mobile-ve/chrome.js prototypes/mobile-ve/shared-data.js article-creator.html
git commit -m "chore: scaffold mobile VE prototype assets"
```

---

### Task 2: Build Variant A (Onboarding Overlay)

**Files:**
- Create: `prototypes/mobile-ve/variant-a.html`
- Create: `prototypes/mobile-ve/variant-a.js`
- Create: `prototypes/mobile-ve/variant-a.css`

**Step 1: Write HTML shell**
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Variant A – Onboarding Overlay</title>
  <link rel="stylesheet" href="../mobile-ve/chrome.css">
  <link rel="stylesheet" href="variant-a.css">
</head>
<body>
  <header class="ve-toolbar">
    <button data-ve-close aria-label="Close">×</button>
    <button aria-label="Undo">↺</button>
    <button aria-label="Formatting">A˅</button>
    <button aria-label="Link">🔗</button>
    <button aria-label="Insert">＋˅</button>
    <button aria-label="More">✎˅</button>
    <button data-ve-next aria-label="Next" class="ve-next">➜</button>
  </header>
  <main class="ve-canvas" id="canvas" contenteditable="true">
    <p class="placeholder">Your article outline will appear here.</p>
  </main>

  <div class="overlay" id="onboarding" role="dialog" aria-modal="true">
    <div class="overlay-content">
      <h1 class="overlay-title">Let’s set up your outline</h1>
      <p class="overlay-subtitle">Pick an article type to tailor guidance.</p>
      <div class="type-carousel" id="typeCarousel"></div>
      <div class="tip-card" id="tipCard"></div>
      <button class="cdx-button cdx-button--progressive" id="insertOutline">Insert outline</button>
      <button class="cdx-button cdx-button--quiet" id="skipOnboarding">Skip for now</button>
    </div>
  </div>
  <script type="module" src="variant-a.js"></script>
</body>
</html>
```

**Step 2: Style overlay**
```css
/* variant-a.css */
@import url('https://unpkg.com/@wikimedia/codex@2.3.0/dist/codex.style.css');
body { background: #fff; }
.overlay {
  position: fixed;
  inset: var(--safe-area-top,0) 0 0 0;
  background: rgba(32,33,36,0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 64px;
}
.overlay-content {
  width: min(420px, 92vw);
  background: #fff;
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: 0 18px 48px rgba(0,0,0,0.24);
}
.type-card {
  border: 1px solid #a2a9b1;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: #f8f9fa;
}
.type-card.active {
  border-color: #36c;
  box-shadow: 0 0 0 2px rgba(51,102,204,0.2);
}
```

**Step 3: Add behavior**
```js
// variant-a.js
import { initToolbarInteractions } from './chrome.js';
import { ARTICLE_TYPES } from './shared-data.js';

const state = { selected: ARTICLE_TYPES[0] };
const overlay = document.getElementById('onboarding');
const carousel = document.getElementById('typeCarousel');
const tipCard = document.getElementById('tipCard');

function renderTypes() {
  carousel.innerHTML = '';
  ARTICLE_TYPES.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'type-card' + (type.id === state.selected.id ? ' active' : '');
    btn.innerHTML = `
      <div class="type-name">${type.name}</div>
      <div class="type-outline">${type.outline.map(o => o.title).join(' • ')}</div>
    `;
    btn.addEventListener('click', () => {
      state.selected = type;
      renderTypes();
      renderTips();
    });
    carousel.appendChild(btn);
  });
}

function renderTips() {
  tipCard.innerHTML = `
    <h2>Before you start</h2>
    <ul>${state.selected.tips.map(t => `<li>${t}</li>`).join('')}</ul>
    <a class="policy-link" href="${state.selected.policyUrl}" target="_blank">Read policy guidance</a>
  `;
}

function insertOutline() {
  const canvas = document.getElementById('canvas');
  canvas.innerHTML = '';
  state.selected.outline.forEach(section => {
    const heading = document.createElement('h2');
    heading.textContent = section.title;
    const para = document.createElement('p');
    para.className = 'guidance-placeholder';
    para.textContent = section.guidance;
    canvas.append(heading, para);
  });
  overlay.classList.add('hidden');
  canvas.focus();
}

document.getElementById('insertOutline').addEventListener('click', insertOutline);
document.getElementById('skipOnboarding').addEventListener('click', () => overlay.classList.add('hidden'));

renderTypes();
renderTips();
initToolbarInteractions();
```

**Step 4: Manual verification**
- Open `variant-a.html` on mobile/DevTools iPhone view.
- Ensure overlay appears, type selects, and outline inserts into canvas.
- Skip button hides overlay without inserting.

**Step 5: Commit**
```bash
git add prototypes/mobile-ve/variant-a.html prototypes/mobile-ve/variant-a.js prototypes/mobile-ve/variant-a.css
git commit -m "feat: add onboarding overlay prototype"
```

---

### Task 3: Build Variant B (Bottom Sheet Guide)

**Files:**
- Create: `prototypes/mobile-ve/variant-b.html`
- Create: `prototypes/mobile-ve/variant-b.js`
- Create: `prototypes/mobile-ve/variant-b.css`

**Step 1: HTML shell with guidance banner**
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Variant B – Bottom Sheet Guide</title>
  <link rel="stylesheet" href="../mobile-ve/chrome.css">
  <link rel="stylesheet" href="variant-b.css">
</head>
<body>
  <header class="ve-toolbar"> ...same buttons... </header>
  <div class="guide-banner" id="guideBanner">Need an outline? Tap to choose type ▾</div>
  <main class="ve-canvas" id="canvas" contenteditable="true"></main>
  <div class="guide-pill" id="guidePill">Outline guide</div>
  <section class="bottom-sheet" id="bottomSheet" aria-hidden="true">
    <div class="sheet-handle"></div>
    <div class="sheet-body">
      <div class="type-tabs" id="typeTabs"></div>
      <div class="outline-preview" id="outlinePreview"></div>
      <ul class="tip-list" id="tipList"></ul>
      <button class="cdx-button cdx-button--progressive" id="applyOutline">Apply outline</button>
      <a class="policy-link" id="policyLink" target="_blank">View notability guidance</a>
    </div>
  </section>
  <script type="module" src="variant-b.js"></script>
</body>
</html>
```

**Step 2: CSS for sheet/pill**
```css
@import url('https://unpkg.com/@wikimedia/codex@2.3.0/dist/codex.style.css');
.guide-banner {
  background: #eef3ff;
  color: #2a4b8d;
  padding: 12px 16px;
  font-weight: 500;
  cursor: pointer;
}
.bottom-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: -80vh;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -12px 32px rgba(0,0,0,0.24);
  transition: transform 0.3s ease;
  padding: 16px 20px 32px;
}
.bottom-sheet.open {
  transform: translateY(-80vh);
}
.guide-pill {
  position: fixed;
  bottom: 24px;
  right: 20px;
  background: #36c;
  color: #fff;
  padding: 12px 16px;
  border-radius: 999px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(54,102,204,0.3);
}
```

**Step 3: JS interactions**
```js
import { initToolbarInteractions } from './chrome.js';
import { ARTICLE_TYPES } from './shared-data.js';

const state = { selected: ARTICLE_TYPES[0] };
const bottomSheet = document.getElementById('bottomSheet');
const guideBanner = document.getElementById('guideBanner');
const guidePill = document.getElementById('guidePill');

function openSheet() {
  bottomSheet.classList.add('open');
  bottomSheet.setAttribute('aria-hidden', 'false');
}
function closeSheet() {
  bottomSheet.classList.remove('open');
  bottomSheet.setAttribute('aria-hidden', 'true');
}

function buildTabs() {
  const tabs = document.getElementById('typeTabs');
  tabs.innerHTML = '';
  ARTICLE_TYPES.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'type-tab' + (type.id === state.selected.id ? ' active' : '');
    btn.textContent = type.name;
    btn.addEventListener('click', () => {
      state.selected = type;
      buildTabs();
      renderOutline();
    });
    tabs.appendChild(btn);
  });
}

function renderOutline() {
  document.getElementById('outlinePreview').innerHTML = state.selected.outline
    .map(item => `<div class="outline-chip">${item.title}</div>`).join('');
  document.getElementById('tipList').innerHTML = state.selected.tips.map(t => `<li>${t}</li>`).join('');
  document.getElementById('policyLink').href = state.selected.policyUrl;
}

function applyOutline() {
  const canvas = document.getElementById('canvas');
  canvas.innerHTML = '';
  state.selected.outline.forEach(section => {
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

guideBanner.addEventListener('click', openSheet);
guidePill.addEventListener('click', openSheet);
document.getElementById('applyOutline').addEventListener('click', applyOutline);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSheet(); });

initToolbarInteractions();
buildTabs();
renderOutline();
```

**Step 4: Manual verification**
- Banner tap opens sheet, CTA inserts outline.
- Pill reopens sheet.
- ESC closes sheet on desktop.

**Step 5: Commit**
```bash
git add prototypes/mobile-ve/variant-b.html prototypes/mobile-ve/variant-b.js prototypes/mobile-ve/variant-b.css
git commit -m "feat: add bottom sheet outline guide prototype"
```

---

### Task 4: Build Variant C (Inline Section Cards)

**Files:**
- Create: `prototypes/mobile-ve/variant-c.html`
- Create: `prototypes/mobile-ve/variant-c.js`
- Create: `prototypes/mobile-ve/variant-c.css`

**Step 1: HTML shell**
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Variant C – Inline Section Cards</title>
  <link rel="stylesheet" href="../mobile-ve/chrome.css">
  <link rel="stylesheet" href="variant-c.css">
</head>
<body>
  <header class="ve-toolbar"> ...same buttons... </header>
  <div class="type-selector" id="typeSelector">
    <span>Article type:</span>
    <button id="typeToggle" aria-haspopup="true" aria-expanded="false">Biography ▾</button>
  </div>
  <main class="ve-canvas" id="canvas"></main>
  <script type="module" src="variant-c.js"></script>
</body>
</html>
```

**Step 2: CSS for cards**
```css
@import url('https://unpkg.com/@wikimedia/codex@2.3.0/dist/codex.style.css');
.type-selector {
  padding: 12px 16px;
  border-bottom: 1px solid #eaecf0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-card {
  border: 1px solid #a2a9b1;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: #f8f9fa;
}
.section-card.completed {
  border-color: #36c;
  background: #eef3ff;
}
.section-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.placeholder-block {
  border: 1px dashed #a2a9b1;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  color: #54595d;
}
```

**Step 3: JS logic**
```js
import { initToolbarInteractions } from './chrome.js';
import { ARTICLE_TYPES } from './shared-data.js';

const canvas = document.getElementById('canvas');
const toggle = document.getElementById('typeToggle');
let currentType = ARTICLE_TYPES[0];

function renderCards() {
  canvas.innerHTML = '';
  currentType.outline.forEach(section => {
    const card = document.createElement('div');
    card.className = 'section-card';
    card.innerHTML = `
      <h2>${section.title}</h2>
      <p>${section.guidance}</p>
      <div class="section-actions">
        <button class="cdx-button cdx-button--progressive" data-action="add-paragraph">Add paragraph</button>
        <button class="cdx-button" data-action="add-reference">Add reference</button>
      </div>
    `;
    card.querySelector('[data-action="add-paragraph"]').addEventListener('click', () => insertParagraph(card, section));
    card.querySelector('[data-action="add-reference"]').addEventListener('click', () => alert('Would open reference dialog'));
    canvas.appendChild(card);
  });
}

function insertParagraph(card, section) {
  const block = document.createElement('div');
  block.className = 'placeholder-block';
  block.contentEditable = true;
  block.dataset.section = section.id;
  block.textContent = 'Write 2–3 sentences here...';
  canvas.insertBefore(block, card.nextSibling);
  card.classList.add('completed');
  setTimeout(() => {
    block.focus();
    document.execCommand('selectAll', false, null);
  });
}

function openTypeMenu() {
  const menu = document.createElement('div');
  menu.className = 'type-menu';
  menu.innerHTML = ARTICLE_TYPES.map(type => `
    <button class="type-option" data-id="${type.id}">${type.name}</button>
  `).join('');
  document.body.appendChild(menu);
  menu.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLButtonElement)) return;
    const type = ARTICLE_TYPES.find(t => t.id === event.target.dataset.id);
    if (type) {
      currentType = type;
      toggle.textContent = `${type.name} ▾`;
      renderCards();
    }
    menu.remove();
  });
}

toggle.addEventListener('click', openTypeMenu);
renderCards();
initToolbarInteractions();
```

**Step 4: Manual verification**
- Switching type updates cards.
- Add paragraph inserts editable block and marks card done.
- Reference button pops alert (mock placeholder).

**Step 5: Commit**
```bash
git add prototypes/mobile-ve/variant-c.html prototypes/mobile-ve/variant-c.js prototypes/mobile-ve/variant-c.css
git commit -m "feat: add inline section card prototype"
```

---

### Task 5: README & Verification Instructions

**Files:**
- Modify: `docs/plans/2025-10-28-article-creation-outline-mvp-plan.md` (append QA section)
- Create: `prototypes/mobile-ve/README.md`

**Step 1: Document how to preview prototypes**
```markdown
# Mobile VE Outline Prototype Playground

## Quick Start
1. Serve repository root with `python3 -m http.server 8000`.
2. Open `http://localhost:8000/article-creator.html`.
3. Use the links at top to launch Variant A/B/C.

## Notes
- Toolbar buttons are mocked; focus is on outline guidance flows.
- Best viewed in mobile device emulator (iPhone SE/12) to match screenshots.
- Shared data lives in `shared-data.js`; update once to reflect new article types.
```

**Step 2: Manual verification**
- Open README to confirm instructions and path references look correct.

**Step 3: Commit**
```bash
git add prototypes/mobile-ve/README.md docs/plans/2025-10-28-article-creation-outline-mvp-plan.md
git commit -m "docs: add prototype preview instructions"
```

---

### Task 6: Final Checks Before Handoff

**Files:** none (verification only)

**Step 1: Run `python3 -m http.server` from repo root; open each variant and smoke test flows.**

**Step 2: Capture screenshots or screen recordings for stakeholders (optional but recommended).**

**Step 3: Prepare summary in next status update referencing `article-creator.html` links and variant behaviors.**

---

## QA Checklist
- [ ] Variant A overlay renders on load, allows type selection, and inserts outline blocks.
- [ ] Variant B banner opens the bottom sheet on tap, CTA inserts outline, pill reopens sheet.
- [ ] Variant C cards allow switching article type and inserting editable paragraph blocks.
- [ ] Toolbar mock buttons respond with prototype alerts (close/next) on all variants.
- [ ] Prototype links in `article-creator.html` load each page without console errors.
