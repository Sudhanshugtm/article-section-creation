const canvas = document.getElementById('canvas');
let disconnect = null;
let overlayEl = null;

const renderSection = section => `
  <article class="inline-section" data-section="${section.id}">
    <header>
      <span class="inline-heading">${section.title}</span>
      <button class="inline-info" aria-label="Show guidance" type="button">i</button>
    </header>
    <p class="inline-tip">Try a couple of sentences about ${section.title.toLowerCase()}.</p>
  </article>
`;

export const mountInline = data => {
  if (!canvas) {
    return;
  }
  overlayEl = document.createElement('div');
  overlayEl.className = 'inline-overlay';
  overlayEl.innerHTML = data.sectionOutline.map(renderSection).join('');
  canvas.prepend(overlayEl);

  const infoButtons = Array.from(overlayEl.querySelectorAll('.inline-info'));

  canvas.setAttribute('data-inline-active', 'true');

  const onInfoClick = event => {
    const section = event.currentTarget.closest('.inline-section');
    section?.classList.toggle('inline-section--expanded');
  };

  infoButtons.forEach(btn => btn.addEventListener('click', onInfoClick));

  const observer = new MutationObserver(() => {
    const hasContent = canvas.textContent.trim().length > 0;
    overlayEl.classList.toggle('collapsed', hasContent);
  });

  observer.observe(canvas, { childList: true, subtree: true, characterData: true });

  disconnect = () => {
    observer.disconnect();
    infoButtons.forEach(btn => btn.removeEventListener('click', onInfoClick));
    canvas.removeAttribute('data-inline-active');
    overlayEl?.remove();
    overlayEl = null;
  };
};

export const unmountInline = () => {
  if (disconnect) {
    disconnect();
  }
  disconnect = null;
};
