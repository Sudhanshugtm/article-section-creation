const listeners = new Set();
let activeConcept = 'blueprint';

export const getActiveConcept = () => activeConcept;

export const setActiveConcept = concept => {
  if (concept === activeConcept) {
    return;
  }
  activeConcept = concept;
  listeners.forEach(listener => listener(concept));
};

export const onConceptChange = handler => {
  listeners.add(handler);
  return () => listeners.delete(handler);
};
