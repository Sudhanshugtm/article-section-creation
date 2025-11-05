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

let current = null;

const activate = concept => {
  buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.concept === concept));
  if (announcer) {
    announcer.textContent = `${concept} concept active`;
  }
  if (current && mounts[current]) {
    mounts[current].unmount();
  }
  mounts[concept].mount(ARTICLE_BLUEPRINT);
  current = concept;
};

buttons.forEach(btn => {
  btn.addEventListener('click', () => setActiveConcept(btn.dataset.concept));
});

activate(getActiveConcept());
onConceptChange(activate);
