// ABOUTME: Language switcher and translation system for bilingual support
// ABOUTME: Handles English/Indonesian switching with localStorage persistence

class LanguageSwitcher {
  constructor() {
    this.currentLang = localStorage.getItem('articleCreatorLang') || 'en';
    this.translations = null;
    this.init();
  }

  async init() {
    // Load translations
    try {
      const response = await fetch('translations.json');
      this.translations = await response.json();
    } catch (error) {
      console.error('Failed to load translations:', error);
      return;
    }

    // Create language switcher UI
    this.createSwitcher();
    
    // Apply initial translations
    this.applyTranslations();
    
    // Set up dynamic translation for elements added later
    this.setupDynamicTranslation();
  }

  createSwitcher() {
    // Create Codex-style toggle button group
    const switcherHTML = `
      <div class="cdx-toggle-button-group language-switcher" role="group" aria-label="Language">
        <button class="cdx-toggle-button ${this.currentLang === 'en' ? 'cdx-toggle-button--toggled-on' : ''}" 
                data-lang="en" aria-pressed="${this.currentLang === 'en'}">
          English
        </button>
        <button class="cdx-toggle-button ${this.currentLang === 'id' ? 'cdx-toggle-button--toggled-on' : ''}" 
                data-lang="id" aria-pressed="${this.currentLang === 'id'}">
          Bahasa Indonesia
        </button>
      </div>
    `;

    // Add CSS for positioning
    const style = document.createElement('style');
    style.textContent = `
      .language-switcher {
        position: fixed;
        top: 12px;
        right: 20px;
        z-index: 1000;
        background: white;
        padding: 4px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      @media (max-width: 768px) {
        .language-switcher {
          right: 10px;
          top: 10px;
        }
      }
      
      .cdx-toggle-button {
        padding: 6px 12px;
        border: 1px solid #a2a9b1;
        background: white;
        color: #202122;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .cdx-toggle-button:first-child {
        border-radius: 4px 0 0 4px;
        border-right: none;
      }
      
      .cdx-toggle-button:last-child {
        border-radius: 0 4px 4px 0;
      }
      
      .cdx-toggle-button:hover {
        background: #f8f9fa;
      }
      
      .cdx-toggle-button.cdx-toggle-button--toggled-on {
        background: #36c;
        color: white;
        border-color: #36c;
      }
      
      .cdx-toggle-button.cdx-toggle-button--toggled-on + .cdx-toggle-button {
        border-left: 1px solid #a2a9b1;
      }
    `;
    document.head.appendChild(style);

    // Add switcher to page
    const switcher = document.createElement('div');
    switcher.innerHTML = switcherHTML;
    document.body.appendChild(switcher.firstElementChild);

    // Add event listeners
    document.querySelectorAll('.language-switcher button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        this.switchLanguage(lang);
      });
    });
  }

  switchLanguage(lang) {
    if (lang === this.currentLang) return;
    
    this.currentLang = lang;
    localStorage.setItem('articleCreatorLang', lang);
    
    // Update toggle buttons
    document.querySelectorAll('.language-switcher button').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('cdx-toggle-button--toggled-on', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
    
    // Apply translations
    this.applyTranslations();
  }

  applyTranslations() {
    if (!this.translations || !this.translations[this.currentLang]) return;
    
    const t = this.translations[this.currentLang];
    
    // Update page title
    document.title = t.pageTitle;
    
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLang;
    
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      const translation = this.getNestedTranslation(t, key);
      if (translation) {
        if (element.hasAttribute('data-i18n-placeholder')) {
          element.placeholder = translation;
        } else if (element.hasAttribute('data-i18n-title')) {
          element.title = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
    
    // Translate dynamic content
    this.translateDynamicContent();
  }

  getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  translateDynamicContent() {
    // Translate smart chips if they exist
    const smartChips = document.querySelectorAll('.smart-chip');
    smartChips.forEach(chip => {
      const chipType = chip.dataset.chipType;
      if (chipType && this.translations[this.currentLang].chips[chipType]) {
        const textNode = chip.childNodes[chip.childNodes.length - 1];
        if (textNode.nodeType === Node.TEXT_NODE) {
          textNode.textContent = ' ' + this.translations[this.currentLang].chips[chipType];
        }
      }
    });
    
    // Translate category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      const categoryType = card.dataset.category;
      if (categoryType && this.translations[this.currentLang].steps.step2.categories[categoryType]) {
        const category = this.translations[this.currentLang].steps.step2.categories[categoryType];
        const nameElement = card.querySelector('.category-name');
        const descElement = card.querySelector('.category-description');
        if (nameElement) nameElement.textContent = category.name;
        if (descElement) descElement.textContent = category.description;
      }
    });
  }

  setupDynamicTranslation() {
    // Observe DOM changes for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if new node needs translation
              if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                this.applyTranslations();
              }
              // Check children
              if (node.querySelectorAll) {
                const translatableElements = node.querySelectorAll('[data-i18n]');
                if (translatableElements.length > 0) {
                  this.applyTranslations();
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Helper method to get current translation
  t(key) {
    if (!this.translations || !this.translations[this.currentLang]) return key;
    return this.getNestedTranslation(this.translations[this.currentLang], key) || key;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.languageSwitcher = new LanguageSwitcher();
  });
} else {
  window.languageSwitcher = new LanguageSwitcher();
}