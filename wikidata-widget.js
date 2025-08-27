// ABOUTME: Smart widget integration with Wikidata enhancement service
// ABOUTME: Provides AI-powered suggestions for article improvements and expansions

class WikidataWidget {
  constructor() {
    this.isVisible = false;
    this.currentArticle = null;
    this.suggestions = [];
    this.init();
  }

  init() {
    this.createWidget();
    this.setupEventListeners();
  }

  createWidget() {
    // Enhanced widget container
    const widget = document.getElementById('smartWidget');
    if (!widget) return;

    // Create suggestions panel
    const suggestionsPanel = document.createElement('div');
    suggestionsPanel.id = 'suggestionsPanel';
    suggestionsPanel.className = 'suggestions-panel';
    suggestionsPanel.style.display = 'none';
    
    suggestionsPanel.innerHTML = `
      <div class="suggestions-header">
        <h3>Article Enhancement Suggestions</h3>
        <button class="close-suggestions" id="closeSuggestions">×</button>
      </div>
      <div class="suggestions-content" id="suggestionsContent">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Analyzing article with Wikidata...</p>
        </div>
      </div>
    `;

    widget.appendChild(suggestionsPanel);
  }

  setupEventListeners() {
    const trigger = document.getElementById('smartWidgetTrigger');
    const closeSuggestions = document.getElementById('closeSuggestions');

    if (trigger) {
      trigger.addEventListener('click', () => this.showSuggestions());
    }

    if (closeSuggestions) {
      closeSuggestions.addEventListener('click', () => this.hideSuggestions());
    }

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('suggestionsPanel');
      const trigger = document.getElementById('smartWidgetTrigger');
      
      if (this.isVisible && panel && 
          !panel.contains(e.target) && 
          !trigger.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  async showSuggestions() {
    this.isVisible = true;
    const panel = document.getElementById('suggestionsPanel');
    const content = document.getElementById('suggestionsContent');
    
    if (panel) {
      panel.style.display = 'block';
      // Show loading state
      content.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Analyzing article with Wikidata...</p>
        </div>
      `;
    }

    // Get current article
    this.currentArticle = (typeof articleData !== 'undefined') ? articleData : {
      id: 'katie-bouman',
      title: 'Katie Bouman',
      description: 'American computer scientist and engineer'
    };

    // Simulate API call delay and generate suggestions
    await this.generateSuggestions();
  }

  hideSuggestions() {
    this.isVisible = false;
    const panel = document.getElementById('suggestionsPanel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  async generateSuggestions() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate context-aware suggestions based on article
    const suggestions = this.getContextualSuggestions(this.currentArticle);
    this.suggestions = suggestions;
    this.renderSuggestions();
  }

  getContextualSuggestions(article) {
    const baseSuggestions = [
      {
        type: 'wikidata',
        title: 'Add Wikidata properties',
        description: 'Enhance article with structured data from Wikidata',
        priority: 'high',
        action: 'wikidata-integration'
      },
      {
        type: 'citations',
        title: 'Improve citations',
        description: 'Add more reliable sources and references',
        priority: 'medium',
        action: 'add-citations'
      },
      {
        type: 'images',
        title: 'Add multimedia content',
        description: 'Include relevant images from Wikimedia Commons',
        priority: 'medium',
        action: 'add-media'
      }
    ];

    // Add article-specific suggestions
    const contextualSuggestions = [];

    switch (article.id) {
      case 'katie-bouman':
        contextualSuggestions.push(
          {
            type: 'expand',
            title: 'Expand "Awards and recognition" section',
            description: 'Add information about recent honors and fellowships',
            priority: 'high',
            action: 'expand-section'
          },
          {
            type: 'timeline',
            title: 'Add career timeline',
            description: 'Create a visual timeline of major achievements',
            priority: 'medium',
            action: 'add-timeline'
          }
        );
        break;

      case 'john-langford':
        contextualSuggestions.push(
          {
            type: 'expand',
            title: 'Expand "Research contributions" section',
            description: 'Add details about machine learning algorithms',
            priority: 'high',
            action: 'expand-section'
          },
          {
            type: 'publications',
            title: 'Add publications list',
            description: 'Include major academic papers and books',
            priority: 'medium',
            action: 'add-publications'
          }
        );
        break;

      case 'henri-gouraud':
        contextualSuggestions.push(
          {
            type: 'technical',
            title: 'Expand technical details',
            description: 'Add more information about Gouraud shading algorithm',
            priority: 'high',
            action: 'expand-technical'
          },
          {
            type: 'legacy',
            title: 'Add legacy section',
            description: 'Describe impact on modern computer graphics',
            priority: 'medium',
            action: 'add-legacy'
          }
        );
        break;

      case 'eduardo-caianiello':
        contextualSuggestions.push(
          {
            type: 'expand',
            title: 'Expand scientific contributions',
            description: 'Add details about quantum theory work',
            priority: 'high',
            action: 'expand-science'
          },
          {
            type: 'institutions',
            title: 'Add institutional affiliations',
            description: 'Detail work at various universities and institutes',
            priority: 'medium',
            action: 'add-institutions'
          }
        );
        break;

      case 'patrick-mchale':
        contextualSuggestions.push(
          {
            type: 'expand',
            title: 'Expand "Creative process" section',
            description: 'Add information about artistic influences and methods',
            priority: 'high',
            action: 'expand-creative'
          },
          {
            type: 'awards',
            title: 'Add awards section',
            description: 'Include Emmy and other recognitions',
            priority: 'medium',
            action: 'add-awards'
          }
        );
        break;
    }

    return [...baseSuggestions, ...contextualSuggestions];
  }

  renderSuggestions() {
    const content = document.getElementById('suggestionsContent');
    if (!content) return;

    const suggestionsHtml = this.suggestions.map(suggestion => `
      <div class="suggestion-item ${suggestion.priority}" data-action="${suggestion.action}">
        <div class="suggestion-icon">
          ${this.getSuggestionIcon(suggestion.type)}
        </div>
        <div class="suggestion-details">
          <h4 class="suggestion-title">${suggestion.title}</h4>
          <p class="suggestion-description">${suggestion.description}</p>
          <div class="suggestion-meta">
            <span class="priority-badge ${suggestion.priority}">${suggestion.priority} priority</span>
          </div>
        </div>
        <button class="suggestion-action" data-action="${suggestion.action}">
          Apply
        </button>
      </div>
    `).join('');

    content.innerHTML = `
      <div class="suggestions-intro">
        <p>Based on Wikidata analysis of "<strong>${this.currentArticle.title}</strong>", here are Suggested Improvements:</p>
      </div>
      <div class="suggestions-list">
        ${suggestionsHtml}
      </div>
      <div class="suggestions-footer">
        <p class="suggestions-note">Suggestions powered by Wikidata and machine learning</p>
      </div>
    `;

    // Setup action handlers
    this.setupSuggestionActions();
  }

  getSuggestionIcon(type) {
    const icons = {
      'wikidata': '🔗',
      'citations': '📚',
      'images': '🖼️',
      'expand': '📝',
      'timeline': '📅',
      'publications': '📄',
      'technical': '⚙️',
      'legacy': '🏛️',
      'institutions': '🏫',
      'awards': '🏆'
    };
    return icons[type] || '💡';
  }

  setupSuggestionActions() {
    const actionButtons = document.querySelectorAll('.suggestion-action');
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = button.getAttribute('data-action');
        this.applySuggestion(action);
      });
    });
  }

  applySuggestion(action) {
    // Simulate applying the suggestion
    const actionMessages = {
      'wikidata-integration': 'Integrating Wikidata properties...',
      'add-citations': 'Adding citation templates...',
      'add-media': 'Searching Wikimedia Commons...',
      'expand-section': 'Adding content to section...',
      'add-timeline': 'Creating timeline visualization...',
      'add-publications': 'Fetching publication data...',
      'expand-technical': 'Adding technical documentation...',
      'add-legacy': 'Researching historical impact...',
      'expand-science': 'Adding scientific details...',
      'add-institutions': 'Gathering institutional information...',
      'expand-creative': 'Adding creative process details...',
      'add-awards': 'Compiling awards and recognition...'
    };

    const message = actionMessages[action] || 'Applying suggestion...';
    
    // Show notification
    this.showNotification(message);
    
    // In a real implementation, this would integrate with the editor
    setTimeout(() => {
      this.showNotification('Suggestion applied successfully!', 'success');
      this.hideSuggestions();
    }, 2000);
  }

  showNotification(message, type = 'info') {
    // Create or update notification
    let notification = document.getElementById('wikidataNotification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'wikidataNotification';
      notification.className = 'wikidata-notification';
      document.body.appendChild(notification);
    }

    notification.className = `wikidata-notification ${type}`;
    notification.textContent = message;
    notification.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (notification) {
        notification.style.display = 'none';
      }
    }, 3000);
  }
}

// Initialize widget when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WikidataWidget();
  });
} else {
  new WikidataWidget();
}
