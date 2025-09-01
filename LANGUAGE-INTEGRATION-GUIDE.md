# Language Integration Guide

## Quick Start

### 1. Add to your HTML files

Add this script tag before closing `</body>`:
```html
<script src="language-switcher.js"></script>
```

### 2. Mark translatable elements

Add `data-i18n` attributes to elements that need translation:

```html
<!-- Text content -->
<h2 data-i18n="steps.step1.title">Step 1: Enter article title</h2>

<!-- Placeholders -->
<input data-i18n="steps.step1.placeholder" data-i18n-placeholder placeholder="What is the article title?">

<!-- Tooltips -->
<button data-i18n="toolbar.bold" data-i18n-title title="Bold">B</button>
```

### 3. Handle dynamic content

For dynamically created elements, use the translation helper:

```javascript
// Get translation programmatically
const translation = window.languageSwitcher.t('steps.step1.title');

// For smart chips
element.dataset.chipType = 'template'; // Will auto-translate

// For category cards
element.dataset.category = 'biography'; // Will auto-translate
```

## Implementation Strategy for Your Prototypes

### For creation.html (Smart Chips Concept)

1. **Smart Chips** - Already handled automatically if you add `data-chip-type` attribute
2. **Category cards** - Add `data-category` attribute to each card
3. **Step titles** - Add `data-i18n="steps.stepX.title"`
4. **Buttons** - Add `data-i18n` for button text
5. **Editor placeholder** - Add `data-i18n-placeholder`

### For article-creator.html (Reference Chip Concept)

1. **Sidebar guidance** - Add `data-i18n` to guidance sections
2. **Eligibility questions** - Add `data-i18n="eligibility.questions.X"`
3. **What to include sections** - Store in translations.json, load dynamically

## Adding More Languages

To add more languages, simply extend `translations.json`:

```json
{
  "en": { ... },
  "id": { ... },
  "es": { ... }  // Add Spanish
}
```

## Testing Checklist

- [ ] Language switcher appears in top-right corner
- [ ] Clicking switches between English/Indonesian
- [ ] All static text updates immediately
- [ ] Dynamic content (chips, categories) translates correctly
- [ ] Language preference persists on page reload
- [ ] HTML lang attribute updates for accessibility

## Benefits of This Approach

1. **Single source of truth** - One HTML file, multiple languages
2. **Easy updates** - Change once, applies to all languages
3. **User testing friendly** - Quick language switching during sessions
4. **Maintainable** - All translations in one JSON file
5. **Performance** - Lightweight, no framework dependencies
6. **Accessibility** - Updates HTML lang attribute for screen readers

## Customization

### Styling the Language Switcher

The switcher uses Codex design tokens. Override in your CSS:

```css
.language-switcher {
  /* Your custom positioning */
  top: 20px;
  right: 30px;
}
```

### Default Language

Change default in `language-switcher.js`:
```javascript
this.currentLang = localStorage.getItem('articleCreatorLang') || 'id'; // Default to Indonesian
```

## Tips for Translation

1. Keep translation keys hierarchical for organization
2. Use consistent naming: `section.subsection.element`
3. Include context in longer texts for better translation
4. Test with actual Indonesian speakers before user testing
5. Consider text expansion (Indonesian often longer than English)