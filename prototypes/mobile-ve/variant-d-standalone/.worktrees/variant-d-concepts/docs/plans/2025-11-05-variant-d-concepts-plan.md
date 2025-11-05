# Variant D Alternate Concepts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build side-by-side prototypes for the three onboarding concepts (Blueprint modal, Step-through drawer, Inline scaffolding) on the Variant D standalone page so stakeholders can switch between them without leaving the editor.

**Architecture:** We keep a single HTML document and inject new UI containers for each concept. A concept switcher toggles which assistance script runs while leaving the existing toolbar and editor intact. Shared sample data (article metadata, sister sections, references) lives in `shared-data.js`, and concept-specific controllers live in new modules under `concepts/`.

**Tech Stack:** Static HTML/CSS, vanilla ES modules, Codex icon font, simple `python3 -m http.server` for local viewing.

---

## Task 1: Expand shared data for concepts

**Files**
- Modify: `shared-data.js`
- Create: `concepts/README.md` (document mock data usage)

**Step 1: Add shared article payload**

Append the following export to `shared-data.js` after the existing `ARTICLE_TYPES` array:

```js
export const ARTICLE_BLUEPRINT = {
  title: 'Tiger Cricket Academy',
  language: 'en',
  wikidataSummary: 'A fictional community cricket academy founded in 1998 in Mumbai, India.',
  keyFacts: [
    { label: 'Founded', value: '1998', source: 'Wikidata P571' },
    { label: 'Location', value: 'Mumbai, India', source: 'Wikidata P276' },
    { label: 'Founder', value: 'Asha Verma', source: 'Wikidata P112' }
  ],
  sisterArticle: {
    language: 'hi',
    quality: 'B-class',
    url: 'https://hi.wikipedia.org/wiki/Tiger_Cricket_Academy'
  },
  sectionOutline: [
    { id: 'lead', title: 'Lead', rationale: 'Seen in 100% of academy articles' },
    { id: 'history', title: 'History', rationale: '82% of academy articles include history' },
    { id: 'programs', title: 'Training programs', rationale: 'Highlights offerings' },
    { id: 'notable-alumni', title: 'Notable alumni', rationale: 'Shows impact' },
    { id: 'references', title: 'References', rationale: 'Required for verification' }
  ],
  references: [
    {
      title: 'Mumbai Mirror: Grassroots cricket academies on the rise',
      publisher: 'Mumbai Mirror',
      year: 2022,
      url: 'https://mumbaimirror.com/cricket-academies-rise'
    },
    {
      title: 'ESPN Cricinfo: Training the next generation in Mumbai',
      publisher: 'ESPN Cricinfo',
      year: 2021,
      url: 'https://www.espncricinfo.com/story/mumbai-next-gen-training'
    }
  ]
};
```

**Step 2: Document data assumptions**

Create `concepts/README.md` with a short note on why the mock data exists:

```markdown
# Concept Prototype Data

These prototypes reuse the same fictional article payload (`ARTICLE_BLUEPRINT`) so the three onboarding concepts stay comparable.

- Title & language approximate what the URL would provide.
- Key facts, sections, and references stand in for Wikidata and sister-article lookups.

Update this file if the payload shape changes; the concept controllers rely on it.
```

**Step 3: Sanity-check**

Run `node --input-type=module -e "import('./shared-data.js').then(() => console.log('ok'));"` and confirm it prints `ok` with no syntax errors.

---

## Task 2: Inject concept switcher and containers

**Files**
- Modify: `variant-d.html`

**Step 1: Add concept selector panel**

Inside `<main class="ve-prototype-body">` and above the existing `<div id="canvas">`, insert:

```html
<section class="concept-switcher" aria-label="Prototype selector">
  <h2 class="concept-title">Confidence helpers</h2>
  <div class="concept-buttons" role="tablist">
    <button class="concept-button active" data-concept="blueprint" role="tab">Blueprint modal</button>
    <button class="concept-button" data-concept="drawer" role="tab">Step-through drawer</button>
    <button class="concept-button" data-concept="inline" role="tab">Inline scaffolding</button>
  </div>
  <p class="concept-help-text">Switch concepts to compare how we guide newcomers before they start typing.</p>
</section>
```

**Step 2: Add concept host nodes at bottom of main**

Before the closing `</main>`, append placeholder containers:

```html
<div id="blueprintHost" class="concept-host"></div>
<div id="drawerHost" class="concept-host"></div>
<div id="inlineHost" class="concept-host"></div>
<div id="conceptAnnouncements" class="visually-hidden" aria-live="polite"></div>
```

**Step 3: Reference new script bundle**

In `<head>`, add the new stylesheet link immediately after the existing `variant-d.css` reference:

```html
<link rel="stylesheet" href="./concepts/concepts.css">
```

Then at the end of `<body>` (before `</body>`), swap the single `variant-d.js` script for a loader bundle:

```html
<script type="module" src="./concepts/bootstrap.js"></script>
```

**Verification**

Run `python3 -m http.server 8000` from the repo root, open `http://localhost:8000/variant-d.html`, and confirm the selector bar appears without console errors (buttons do nothing yet).

---

## Task 3: Style concept switcher and containers

**Files**
- Modify: `variant-d.css`
- Create: `concepts/concepts.css`

**Step 1: Switcher styling**

Append styles to `variant-d.css`:

```css
.concept-switcher {
  padding: 16px 16px 0;
  background: #f8f9fa;
  border-bottom: 1px solid #eaecf0;
}
.concept-switcher .concept-title {
  margin: 0 0 8px;
  font: 600 16px/1.4 'Helvetica Neue', Arial, sans-serif;
}
.concept-buttons {
  display: flex;
  gap: 8px;
}
.concept-button {
  flex: 1;
  padding: 10px;
  font: 500 14px/1.2 'Helvetica Neue', Arial, sans-serif;
  border-radius: 999px;
  border: 1px solid #a2a9b1;
  background: #fff;
}
.concept-button.active {
  background: #3366cc;
  color: #fff;
  border-color: #3366cc;
}
.concept-help-text {
  margin: 12px 0 0;
  color: #54595d;
  font-size: 13px;
}
.concept-host {
  position: relative;
  z-index: 10;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  clip: rect(0, 0, 0, 0);
  overflow: hidden;
}
```

**Step 2: Create `concepts/concepts.css`**

Add base styles reused across concepts:

```css
.concept-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  background: #eef3ff;
  border-radius: 999px;
  color: #3366cc;
  font-size: 13px;
}
```

**Step 3: Verify**

Reload the page. The selector should be styled and the console clean. Leave the HTTP server running for later tasks.

---

## Task 4: Bootstrap module and concept toggling

**Files**
- Create: `concepts/bootstrap.js`
- Create: `concepts/state.js`

**Step 1: Implement shared state helper**

`concepts/state.js` should expose a minimal event-driven toggle:

```js
const listeners = new Set();
let activeConcept = 'blueprint';

export const getActiveConcept = () => activeConcept;

export const setActiveConcept = concept => {
  if (concept === activeConcept) return;
  activeConcept = concept;
  listeners.forEach(listener => listener(concept));
};

export const onConceptChange = handler => {
  listeners.add(handler);
  return () => listeners.delete(handler);
};
```

**Step 2: Hook up concept switcher in `bootstrap.js`**

`concepts/bootstrap.js` should import `ARTICLE_BLUEPRINT`, the existing toolbar initializers, and the concept controllers. Keep CSS linked in HTML; native browser modules can’t import CSS directly.

```js
import '../chrome.js';
import '../icons.js';
import '../variant-d.js';
import { ARTICLE_BLUEPRINT } from '../shared-data.js';
import { setActiveConcept, onConceptChange, getActiveConcept } from './state.js';
import { mountBlueprint, unmountBlueprint } from './blueprint-modal.js';
import { mountDrawer, unmountDrawer } from './step-drawer.js';
import { mountInline, unmountInline } from './inline-scaffold.js';

const buttons = document.querySelectorAll('.concept-button');
const announcer = document.getElementById('conceptAnnouncements');

const mounts = {
  blueprint: { mount: mountBlueprint, unmount: unmountBlueprint },
  drawer: { mount: mountDrawer, unmount: unmountDrawer },
  inline: { mount: mountInline, unmount: unmountInline }
};

const activate = concept => {
  buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.concept === concept));
  announcer.textContent = `${concept} concept active`;
  Object.entries(mounts).forEach(([key, { unmount }]) => key !== concept && unmount());
  mounts[concept].mount(ARTICLE_BLUEPRINT);
};

buttons.forEach(btn => {
  btn.addEventListener('click', () => setActiveConcept(btn.dataset.concept));
});

activate(getActiveConcept());
onConceptChange(activate);
```

**Step 3: Manual smoke**

Reload the browser; buttons should still switch active state (mount functions not implemented yet, so expect errors referencing missing modules). Ignore console errors for now—they will disappear after the next tasks.

---

## Task 5: Implement blueprint modal concept

**Files**
- Create: `concepts/blueprint-modal.js`
- Modify: `concepts/concepts.css`

**Step 1: Build modal markup in JS**

`concepts/blueprint-modal.js` should export `mountBlueprint(data)` and `unmountBlueprint()`:

```js
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
        <p>${data.wikidataSummary}</p>
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
        <label class="concept-pill"><input type="checkbox" id="pinBlueprint" checked> Pin blueprint</label>
        <button class="blueprint-primary">Start writing with this outline</button>
        <button class="blueprint-secondary">Dismiss</button>
      </footer>
    </section>
  </div>
`;

export const mountBlueprint = data => {
  host.innerHTML = renderModal(data);
  const backdrop = host.querySelector('.blueprint-backdrop');
  const tabs = host.querySelectorAll('.blueprint-tab');
  const panels = host.querySelectorAll('.blueprint-panel');

  const toggleTab = tabName => {
    tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    panels.forEach(panel => panel.classList.toggle('hidden', panel.dataset.panel !== tabName));
  };

  tabs.forEach(btn => btn.addEventListener('click', () => toggleTab(btn.dataset.tab)));
  host.querySelector('.blueprint-dismiss').addEventListener('click', () => unmountBlueprint());
  host.querySelector('.blueprint-secondary').addEventListener('click', () => unmountBlueprint());
  host.querySelector('.blueprint-primary').addEventListener('click', () => {
    toggleTab('outline');
    backdrop.classList.add('pinned');
  });

  cleanup = () => {
    tabs.forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    host.innerHTML = '';
  };
};

export const unmountBlueprint = () => {
  if (cleanup) cleanup();
  cleanup = null;
};
```

**Step 2: Add modal styles**

Extend `concepts/concepts.css` with modal-specific rules:

```css
.blueprint-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.44);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.blueprint-modal {
  max-width: 360px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  padding: 20px;
  display: grid;
  gap: 16px;
}
.blueprint-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 8px;
}
.blueprint-dismiss {
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}
.blueprint-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}
.blueprint-tab {
  border-radius: 12px;
  border: none;
  padding: 10px;
  background: #eef3ff;
  color: #3366cc;
  font-weight: 600;
}
.blueprint-tab.active {
  background: #3366cc;
  color: #fff;
}
.blueprint-panel.hidden {
  display: none;
}
.blueprint-facts li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eaecf0;
  padding: 6px 0;
}
.blueprint-outline li {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 6px;
}
.blueprint-outline span {
  display: block;
  color: #54595d;
  font-size: 12px;
}
.blueprint-sources li {
  display: grid;
  gap: 2px;
  margin-bottom: 8px;
}
.blueprint-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.blueprint-primary {
  border: none;
  border-radius: 999px;
  padding: 12px;
  background: #3366cc;
  color: #fff;
  font-weight: 600;
}
.blueprint-secondary {
  border: none;
  background: transparent;
  color: #3366cc;
  text-decoration: underline;
}
```

**Step 3: Verify**

Reload the page and ensure the Blueprint concept now renders a modal. Switch to other concepts (will error until next tasks); returning to Blueprint should reopen the modal.

---

## Task 6: Implement step-through drawer concept

**Files**
- Create: `concepts/step-drawer.js`
- Modify: `concepts/concepts.css`

**Step 1: Drawer controller**

`step-drawer.js` should render a three-step bottom sheet and expose `mountDrawer`/`unmountDrawer`:

```js
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
      <button class="drawer-collapse" aria-label="Collapse">▾</button>
    </header>
    <ol class="drawer-steps">
      ${STEP_COPY.map((step, index) => `
        <li class="drawer-step" data-step="${step.id}">
          <div class="drawer-step-meta">
            <span class="drawer-step-number">${index + 1}</span>
            <h3>${step.title}</h3>
          </div>
          <p>${step.body}</p>
          ${index === 0 ? `<div class="drawer-card">
            <h4>${data.title}</h4>
            <p>${data.wikidataSummary}</p>
            <button class="drawer-action" data-action="confirm">Looks good</button>
          </div>` : ''}
          ${step.id === 'outline' ? `<div class="drawer-outline">
            ${data.sectionOutline.map(section => `
              <label class="drawer-checkbox">
                <input type="checkbox" checked>
                <span>${section.title}</span>
                <small>${section.rationale}</small>
              </label>`).join('')}
            <button class="drawer-action" data-action="save-outline">Add to outline</button>
          </div>` : ''}
          ${step.id === 'facts' ? `<ul class="drawer-facts">
            ${data.references.map(ref => `<li><strong>${ref.title}</strong><span>${ref.publisher} · ${ref.year}</span><button data-url="${ref.url}" class="drawer-action">Copy cite</button></li>`).join('')}
          </ul>` : ''}
        </li>
      `).join('')}
    </ol>
  </aside>
`;

export const mountDrawer = data => {
  host.innerHTML = renderDrawer(data);
  const shell = host.querySelector('.drawer-shell');
  const collapseBtn = shell.querySelector('.drawer-collapse');
  collapseBtn.addEventListener('click', () => shell.classList.toggle('collapsed'));
  teardown = () => {
    collapseBtn.replaceWith(collapseBtn.cloneNode(true));
    host.innerHTML = '';
  };
};

export const unmountDrawer = () => {
  if (teardown) teardown();
  teardown = null;
};
```

**Step 2: Drawer styles**

Extend `concepts/concepts.css`:

```css
.drawer-shell {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  background: #fff;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.16);
  padding: 18px;
  display: grid;
  gap: 16px;
  max-height: 70vh;
  overflow-y: auto;
}
.drawer-shell.collapsed {
  transform: translateY(calc(100% - 48px));
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.drawer-collapse {
  border: none;
  background: #eef3ff;
  border-radius: 999px;
  padding: 6px 10px;
}
.drawer-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}
.drawer-step {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  gap: 8px;
}
.drawer-step-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.drawer-step-number {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #eef3ff;
  color: #3366cc;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.drawer-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #eaecf0;
}
.drawer-outline {
  display: grid;
  gap: 6px;
}
.drawer-checkbox {
  display: grid;
  padding: 8px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eaecf0;
}
.drawer-outline small {
  color: #54595d;
}
.drawer-facts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.drawer-action {
  margin-top: 8px;
  border: none;
  background: #3366cc;
  color: #fff;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 600;
}
```

**Step 3: Verify**

Switch to “Step-through drawer” in the browser; a bottom sheet should appear and the collapse toggle should slide it down/up.

---

## Task 7: Implement inline scaffolding concept

**Files**
- Create: `concepts/inline-scaffold.js`
- Modify: `concepts/concepts.css`
- Modify: `variant-d.css` (ensure canvas padding accommodates overlays)

**Step 1: Inline controller**

`inline-scaffold.js` should render ghosted headings and contextual info chips within the editable canvas:

```js
const canvas = document.getElementById('canvas');
const host = document.getElementById('inlineHost');
let disconnect = null;

const renderSection = section => `
  <article class="inline-section" data-section="${section.id}">
    <header>
      <span class="inline-heading">${section.title}</span>
      <button class="inline-info" aria-label="Show tips">i</button>
    </header>
    <p class="inline-tip">Try a couple of sentences about ${section.title.toLowerCase()}.</p>
  </article>
`;

export const mountInline = data => {
  host.innerHTML = `<div class="inline-overlay">${data.sectionOutline.map(renderSection).join('')}</div>`;
  const overlay = host.querySelector('.inline-overlay');
  canvas.setAttribute('data-inline-active', 'true');
  const observer = new MutationObserver(() => {
    if (canvas.textContent.trim().length > 0) {
      overlay.classList.add('collapsed');
    }
  });
  observer.observe(canvas, { childList: true, subtree: true, characterData: true });
  disconnect = () => {
    observer.disconnect();
    canvas.removeAttribute('data-inline-active');
    host.innerHTML = '';
  };
};

export const unmountInline = () => {
  if (disconnect) disconnect();
  disconnect = null;
};
```

**Step 2: Style overlay**

Extend `concepts/concepts.css`:

```css
.inline-overlay {
  position: absolute;
  inset: 0 0 auto 0;
  pointer-events: none;
  display: grid;
  gap: 12px;
  padding: 20px;
}
.inline-overlay.collapsed {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.inline-section {
  background: rgba(238, 243, 255, 0.8);
  border: 1px dashed #a2a9b1;
  border-radius: 16px;
  padding: 14px;
}
.inline-section header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.inline-heading {
  font-weight: 600;
  color: #3366cc;
}
.inline-info {
  pointer-events: auto;
  border: none;
  background: #fff;
  color: #3366cc;
  border-radius: 999px;
  width: 26px;
  height: 26px;
}
.inline-tip {
  margin: 10px 0 0;
  color: #54595d;
  font-size: 13px;
}
```

**Step 3: Ensure canvas spacing**

Add to `variant-d.css` near the editor rules:

```css
.ve-prototype-editor[data-inline-active="true"] {
  padding-top: 220px;
  position: relative;
}
```

**Step 4: Verify**

Select “Inline scaffolding” and confirm the ghosted sections appear. Type into the editor; the overlay should fade out once content exists.

---

## Task 8: Wire concept cleanup and existing features

**Files**
- Modify: `variant-d.js` (ensure previous bottom sheets still work when concepts mount)
- Modify: `concepts/bootstrap.js`

**Step 1: Prevent double initialization**

Wrap the existing initialization logic in `variant-d.js` so it only runs once even if imported via `bootstrap.js`. Add a guard at the top:

```js
if (window.__variantDInitialized) {
  return;
}
window.__variantDInitialized = true;
```

Place it before any DOM queries.

**Step 2: Re-export existing helpers if needed**

If any old code relied on default exports, ensure `bootstrap.js` imports do not execute twice.

**Step 3: Cleanup on concept change**

Update `concepts/bootstrap.js` so `activate` calls previous `unmount` before new `mount`, guarding against null hosts:

```js
let current = null;

const activate = concept => {
  if (current && mounts[current]) {
    mounts[current].unmount();
  }
  ...
  mounts[concept].mount(ARTICLE_BLUEPRINT);
  current = concept;
};
```

Remove redundant `Object.entries` loop from earlier step.

**Step 4: Final verification**

Reload the page and cycle through the three concepts twice. Ensure no console errors, and the existing section/citation sheets still open via their triggers.

---

## Task 9: Update README with branch usage

**Files**
- Modify: `README.md`

Add a short subsection describing the new concept switcher and the `python3 -m http.server` command to preview.

---

## Task 10: Commit checkpoints

After each concept implementation (Tasks 5–7), run:

```bash
git status -sb
```

Confirm only the expected files changed, then commit:

```bash
git add <files>
git commit -m "feat: add blueprint modal concept"
```

Repeat with messages for `step-through drawer` and `inline scaffolding`. Finish with a final commit for README updates.

---

## Manual QA Checklist

1. Start server: `python3 -m http.server 8000`
2. Visit `http://localhost:8000/variant-d.html`
3. Switch among all three concepts and confirm UI updates instantly.
4. For blueprint modal, click through tabs and “Start writing” to see pinned state.
5. For drawer, collapse/expand and tick checkboxes.
6. For inline, start typing and watch overlays collapse.
7. Verify existing slash-command and section sheets still function.

Document any deviations in the PR description before handing off.
