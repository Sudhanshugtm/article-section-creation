# Wikipedia Article Creation Concepts

This project contains two main concept prototypes for Wikipedia article creation user testing.

## Main Files

### 1. article-creator.html - Reference Chip Concept
**What it does:** 3-step article creation flow with contextual guidance
- **Step 1:** Enter article title
- **Step 2:** Select category (Person, Place, Species, etc.)  
- **Step 3:** Edit with sidebar guidance and "What to include" prompts

**Key features:**
- Article eligibility checker with Yes/Maybe/No questions
- Category-specific section suggestions 
- Inline "What to include" guidance instead of examples
- Desktop sidebar with contextual writing prompts
- Mobile-responsive modal interface

### 2. creation.html - Smart Chips Concept  
**What it does:** Enhanced editing experience with contextual assistance
- Same 3-step flow as article-creator.html
- **Enhanced with:** Smart chips system for contextual editing assistance
- **Smart chips:** 📝 Template, 📑 Section, 🔗 Source, ✨ Help
- **No sidebar:** Cleaner interface focused on editing experience

**Smart chips functionality:**
- Context-aware templates based on article category
- Click-to-insert templates with placeholder content
- Category-specific suggestions (Biography intro, Location intro, etc.)
- Balances newcomer help with Wikipedia quality standards

## File Dependencies

### Shared by both files:
- `reading-styles.css` - Wikipedia-style visual styling
- `article-creation-suggestions.json` - Category-based content suggestions
- `reliable-sources.json` - Source quality classification data
- **External:** Wikimedia Codex design system (CDN)

### creation.html only:
- `templates.json` - Smart chips template data and contextual suggestions

## Development Notes

⚠️ **Important:** Both files share critical dependencies. Avoid parallel AI development on this directory to prevent conflicts with shared CSS/JSON files.

**For multi-agent work, use:**
- Sequential development (one agent finishes, then next starts)
- Git worktrees for isolated environments
- File-specific assignments to avoid dependency conflicts

## Purpose

These are concept prototypes for user testing different approaches to Wikipedia article creation:
- **Reference Chip Concept:** Sidebar-guided approach with contextual prompts
- **Smart Chips Concept:** Inline assistance with contextual editing tools

Both aim to help newcomers create quality Wikipedia articles while maintaining community standards.