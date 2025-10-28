// Shared helpers for VisualEditor-style prototype chrome
export function initToolbarInteractions(root = document) {
  const closeBtn = root.querySelector('[data-ve-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      alert('Close editor (prototype)');
    });
  }

  const nextBtn = root.querySelector('[data-ve-next]');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      alert('Next / publish (prototype)');
    });
  }
}
