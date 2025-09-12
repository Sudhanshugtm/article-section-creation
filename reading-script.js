// ABOUTME: Main script for reading mode with edit mode toggle functionality
// ABOUTME: Handles article loading, mode switching, and VE initialization

let quill = null;
let isEditMode = false;

// Extract MediaWiki-style content from HTML for Indonesian articles
function extractContentFromHTML(articleBody) {
  let content = '';
  
  // Process each element in the article body
  const elements = articleBody.children;
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    if (element.tagName === 'P') {
      // Regular paragraphs
      content += element.textContent + '\n\n';
    } else if (element.tagName === 'SECTION' && element.classList.contains('article-section')) {
      // Section with title
      const title = element.querySelector('.article-section__title');
      const sectionContent = element.querySelector('.article-section__content');
      
      if (title) {
        content += '== ' + title.textContent + ' ==\n';
      }
      
      if (sectionContent) {
        // Process paragraphs within the section
        const paragraphs = sectionContent.querySelectorAll('p');
        paragraphs.forEach(p => {
          content += p.textContent + '\n\n';
        });
        
        // Process lists within the section
        const lists = sectionContent.querySelectorAll('ul');
        lists.forEach(list => {
          const items = list.querySelectorAll('li');
          items.forEach(li => {
            content += '* ' + li.textContent + '\n';
          });
          content += '\n';
        });
      }
    }
  }
  
  return content.trim();
}

// Default article data - will be overridden by specific article pages
const defaultArticle = {
  id: 'katie-bouman',
  title: 'Katie Bouman',
  description: 'American computer scientist and engineer',
  content: `'''Katherine Louise Bouman''' (born 1989) is an American [[engineer]] and [[computer scientist]] working in the field of [[computational imaging]]. She led the development of an [[algorithm]] for imaging [[black hole]]s, known as [[CHIRP (algorithm)|Continuous High-resolution Image Reconstruction using Patch priors]] (CHIRP), and was a member of the [[Event Horizon Telescope]] team that captured the first image of a black hole.

== Early life and education ==
Bouman grew up in [[West Lafayette, Indiana]]. Her father, [[Charles Bouman]], is a professor of [[electrical and computer engineering]] and [[biomedical engineering]] at [[Purdue University]].

== Research and career ==
After earning her doctorate, Bouman joined [[Harvard University]] as a [[postdoctoral fellow]] on the Event Horizon Telescope Imaging team. She led the development of an algorithm for imaging black holes, known as [[CHIRP (algorithm)|Continuous High-resolution Image Reconstruction using Patch priors]] (CHIRP).

== Recognition ==
She was recognized as one of the [[BBC]]'s [[100 Women (BBC)#2019|100 women of 2019]]. In 2024, Bouman was awarded a [[Sloan Research Fellowship]].`
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadArticleContent();
  setupEventListeners();
});

function loadArticleContent() {
  const articleBody = document.getElementById('articleBody');
  
  // Skip loading if content already exists (e.g., for Indonesian articles with pre-populated content)
  if (articleBody && articleBody.children.length > 0) {
    return;
  }
  
  // Use global articleData if available, otherwise fall back to defaultArticle
  const currentArticle = (typeof articleData !== 'undefined') ? articleData : defaultArticle;
  const htmlContent = convertMediaWikiToHTML(currentArticle.content);
  articleBody.innerHTML = htmlContent;
}

function convertMediaWikiToHTML(mediaWikiText) {
  let html = mediaWikiText;
  
  // Convert section headers
  html = html.replace(/^== (.+?) ==$/gm, '<section class="article-section"><h2 class="article-section__title">$1</h2><div class="article-section__content">');
  html = html.replace(/^=== (.+?) ===$/gm, '<h3 class="article-subsection__title">$1</h3>');
  
  // Convert paragraphs - split by double newlines and wrap non-markup text in <p> tags
  html = html.split('\n\n').map(paragraph => {
    paragraph = paragraph.trim();
    if (paragraph === '') return '';
    if (paragraph.startsWith('<section') || paragraph.startsWith('<h3') || paragraph.startsWith('*') || paragraph.startsWith('{{')) {
      return paragraph;
    }
    return '<p>' + paragraph + '</p>';
  }).join('\n');
  
  // Close section divs before new sections
  html = html.replace(/<section class="article-section">/g, '</div></section><section class="article-section">');
  html = html.replace(/^<\/div><\/section>/, ''); // Remove first closing tags
  
  // Convert lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Convert wiki links to regular links (simplified)
  html = html.replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '<a href="#" class="wiki-link">$1</a>');
  
  // Convert external links (simplified)
  html = html.replace(/\[([^\s]+) ([^\]]+)\]/g, '<a href="$1" class="external-link">$2</a>');
  
  // Convert bold text
  html = html.replace(/'''(.+?)'''/g, '<strong>$1</strong>');
  
  // Convert italic text
  html = html.replace(/''(.+?)''/g, '<em>$1</em>');
  
  // Add closing div for last section
  html += '</div></section>';
  
  return html;
}

function convertArticleToQuillFormat(article) {
  // Enhanced conversion from MediaWiki to Quill format with proper links
  let content = [];
  
  // Parse the content line by line
  const lines = article.content.split('\n');
  
  for (let line of lines) {
    line = line.trim();
    if (line === '') {
      content.push({ insert: '\n' });
      continue;
    }
    
    // Handle different header levels
    if (line.startsWith('=== ') && line.endsWith(' ===')) {
      const headerText = line.slice(4, -4);
      content.push({ insert: headerText + '\n', attributes: { header: 3 } });
    } else if (line.startsWith('== ') && line.endsWith(' ==')) {
      const headerText = line.slice(3, -3);
      content.push({ insert: headerText + '\n', attributes: { header: 2 } });
    } else {
      // Process line for formatting and links
      processLineWithFormatting(line, content);
      content.push({ insert: '\n' });
    }
  }
  
  return content;
}

function processLineWithFormatting(line, content) {
  // Process the line character by character to handle nested formatting
  let i = 0;
  let currentText = '';
  
  while (i < line.length) {
    // Check for wiki links [[Link|Text]] or [[Link]]
    if (line.substring(i, i + 2) === '[[') {
      // Add any accumulated text
      if (currentText) {
        content.push({ insert: currentText });
        currentText = '';
      }
      
      // Find the end of the link
      let linkEnd = line.indexOf(']]', i + 2);
      if (linkEnd !== -1) {
        let linkContent = line.substring(i + 2, linkEnd);
        let linkText, linkTarget;
        
        if (linkContent.includes('|')) {
          [linkTarget, linkText] = linkContent.split('|', 2);
        } else {
          linkTarget = linkText = linkContent;
        }
        
        // Add as a link
        content.push({ 
          insert: linkText, 
          attributes: { link: '#' } // Using # as placeholder URL
        });
        
        i = linkEnd + 2;
      } else {
        // Malformed link, treat as regular text
        currentText += line[i];
        i++;
      }
    }
    // Check for external links [URL Text]
    else if (line.substring(i, i + 1) === '[' && line.indexOf(' ', i) !== -1 && line.indexOf(']', i) !== -1) {
      // Add any accumulated text
      if (currentText) {
        content.push({ insert: currentText });
        currentText = '';
      }
      
      let linkEnd = line.indexOf(']', i + 1);
      if (linkEnd !== -1) {
        let linkContent = line.substring(i + 1, linkEnd);
        let spaceIndex = linkContent.indexOf(' ');
        if (spaceIndex !== -1) {
          let url = linkContent.substring(0, spaceIndex);
          let text = linkContent.substring(spaceIndex + 1);
          
          // Add as external link
          content.push({ 
            insert: text, 
            attributes: { link: url } 
          });
          
          i = linkEnd + 1;
        } else {
          currentText += line[i];
          i++;
        }
      } else {
        currentText += line[i];
        i++;
      }
    }
    // Check for bold text '''text'''
    else if (line.substring(i, i + 3) === "'''") {
      // Add any accumulated text
      if (currentText) {
        content.push({ insert: currentText });
        currentText = '';
      }
      
      let boldEnd = line.indexOf("'''", i + 3);
      if (boldEnd !== -1) {
        let boldText = line.substring(i + 3, boldEnd);
        content.push({ 
          insert: boldText, 
          attributes: { bold: true } 
        });
        i = boldEnd + 3;
      } else {
        currentText += line[i];
        i++;
      }
    }
    // Check for italic text ''text''
    else if (line.substring(i, i + 2) === "''" && line.substring(i, i + 3) !== "'''") {
      // Add any accumulated text
      if (currentText) {
        content.push({ insert: currentText });
        currentText = '';
      }
      
      let italicEnd = line.indexOf("''", i + 2);
      if (italicEnd !== -1) {
        let italicText = line.substring(i + 2, italicEnd);
        content.push({ 
          insert: italicText, 
          attributes: { italic: true } 
        });
        i = italicEnd + 2;
      } else {
        currentText += line[i];
        i++;
      }
    }
    else {
      currentText += line[i];
      i++;
    }
  }
  
  // Add any remaining text
  if (currentText) {
    content.push({ insert: currentText });
  }
}

function setupEventListeners() {
  // Close button (mobile) - exit edit mode
  const closeBtn = document.getElementById('close');
  if (closeBtn) {
    closeBtn.addEventListener('click', exitEditMode);
  }



  // Page action tabs toggle
  document.querySelectorAll('.action-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('star')) {
        if (btn.id === 'editTab') {
          toggleEditMode();
        } else {
          // Read tab or other tabs - exit edit mode
          if (isEditMode) {
            exitEditMode();
          } else {
            // Just update tab state if not in edit mode
            document.querySelectorAll('.action-tab:not(.star)').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          }
        }
      }
    });
  });

  // Article/Talk tab toggle
  document.querySelectorAll('.ns-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ns-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // VE mode tabs (in edit interface)
  document.addEventListener('click', (e) => {
    if (e.target.matches('.ve-interface .action-tab')) {
      if (!e.target.classList.contains('star')) {
        if (e.target.id === 'editTabVE') {
          // Already in edit mode, do nothing
        } else {
          // Read tab or other tabs in VE - exit edit mode
          exitEditMode();
        }
      }
    }
  });
}

function toggleEditMode() {
  if (isEditMode) {
    exitEditMode();
  } else {
    enterEditMode();
  }
}

function enterEditMode() {
  isEditMode = true;
  
  // Hide reading content
  const readingContent = document.getElementById('readingContent');
  if (readingContent) readingContent.style.display = 'none';
  
  // Show VE interface (if it exists) or simple editing interface as fallback
  const veInterface = document.getElementById('veInterface');
  if (veInterface) {
    veInterface.style.display = 'block';
  } else {
    // Fallback for articles without full VE interface (like Indonesian articles)
    const editingContent = document.getElementById('editing-content');
    if (editingContent) editingContent.style.display = 'block';
  }
  
  // Update tab states in main interface
  document.querySelectorAll('#readingContent .action-tab:not(.star)').forEach(b => b.classList.remove('active'));
  const editTab = document.getElementById('editTab');
  if (editTab) editTab.classList.add('active');
  
  // Update tab states in VE interface
  document.querySelectorAll('.ve-interface .action-tab:not(.star)').forEach(b => b.classList.remove('active'));
  const editTabVE = document.getElementById('editTabVE');
  if (editTabVE) {
    editTabVE.classList.add('active');
  }
  
  // Reset publish button to disabled state
  const publishBtn = document.getElementById('publish');
  if (publishBtn) {
    publishBtn.disabled = true;
    publishBtn.textContent = 'Publish';
  }
  
  // Reset mobile submit button to disabled state
  const submitBtn = document.getElementById('submit');
  if (submitBtn) {
    submitBtn.classList.remove('enabled');
  }
  

  // Open the expand sidebar by default in edit mode
  const sidebar = document.getElementById('expandSidebar');
  if (sidebar) {
    sidebar.style.display = 'block';
    sidebar.classList.add('open');
  }
  
  // Initialize Quill editor if not already done
  if (!quill) {
    initializeQuillEditor();
  }
  
  // Load content into editor
  loadContentIntoEditor();
}

function exitEditMode() {
  isEditMode = false;
  
  // Show reading content
  const readingContent = document.getElementById('readingContent');
  if (readingContent) readingContent.style.display = 'block';
  
  // Hide VE interface (if it exists) and simple editing interface
  const veInterface = document.getElementById('veInterface');
  if (veInterface) {
    veInterface.style.display = 'none';
  } else {
    // Hide simple editing interface for articles without full VE
    const editingContent = document.getElementById('editing-content');
    if (editingContent) editingContent.style.display = 'none';
  }
  
  // Hide smart widget (if it exists)
  const smartWidget = document.getElementById('smartWidget');
  if (smartWidget) smartWidget.style.display = 'none';

  // Hide expand sidebar if present
  const expandSidebar = document.getElementById('expandSidebar');
  if (expandSidebar) {
    expandSidebar.classList.remove('open');
    expandSidebar.style.display = 'none';
  }
  
  // Update tab state in main interface - activate Read tab
  document.querySelectorAll('.action-tab:not(.star)').forEach(b => b.classList.remove('active'));
  const readTab = document.querySelector('.action-tab'); // First action tab is Read
  if (readTab) {
    readTab.classList.add('active');
  }
}

function initializeQuillEditor() {
  // Try different editor containers (VE uses #editor, simple editing uses #quillEditor)
  const editorContainer = document.getElementById('editor') || document.getElementById('quillEditor');
  if (!editorContainer) return; // No editor container found
  
  quill = new Quill(editorContainer, {
    modules: { 
      toolbar: false, 
      history: { 
        delay: 250, 
        maxStack: 100, 
        userOnly: true 
      } 
    },
    placeholder: 'Start editing the article…',
    theme: 'snow'
  });

  // Enable publish button when user starts typing
  quill.on('text-change', function(delta, oldDelta, source) {
    if (source === 'user') {
      const publishBtn = document.getElementById('publish');
      if (publishBtn && publishBtn.disabled) {
        publishBtn.disabled = false;
        publishBtn.textContent = 'Publish changes';
      }
      
      // Enable mobile submit button
      const submitBtn = document.getElementById('submit');
      if (submitBtn && !submitBtn.classList.contains('enabled')) {
        submitBtn.classList.add('enabled');
      }
    }
  });

  // Setup VE functionality
  setupVEHandlers();

  // Setup inline hints (placeholder + smart chips)
  setupInlineHints();
}

function loadContentIntoEditor() {
  if (!quill) return;
  
  let currentArticle;
  
  // Check if we have global articleData (English articles)
  if (typeof articleData !== 'undefined') {
    currentArticle = articleData;
  } else {
    // For Indonesian articles, extract content from the page HTML
    const articleBody = document.getElementById('articleBody');
    if (articleBody) {
      // Create a fake article object with content from the HTML
      currentArticle = {
        id: document.querySelector('meta[name="article-id"]')?.content || 'unknown',
        title: document.querySelector('h1.firstHeading')?.textContent || 'Unknown',
        content: extractContentFromHTML(articleBody)
      };
    } else {
      // Ultimate fallback to default article
      currentArticle = defaultArticle;
    }
  }
  
  // Convert the article content to a simplified Quill format
  const content = convertArticleToQuillFormat(currentArticle);
  
  quill.setContents(content);
  
  // Position cursor at the beginning of the content (index 0)
  setTimeout(() => {
    quill.focus();
    quill.setSelection(0, 0);
    // Ensure the editor container is focused
    const editor = document.getElementById('editor');
    if (editor) {
      editor.focus();
    }
  }, 200);
}

// Inline hints: show placeholder + chips on empty new line (prototype UI)
function setupInlineHints() {
  const container = document.getElementById('editor');
  if (!container || !quill) return;

  // Overlay element positioned to look inline at caret
  let hints = document.getElementById('inlineHints');
  if (!hints) {
    hints = document.createElement('div');
    hints.id = 'inlineHints';
    hints.className = 'inline-hints';
    hints.style.display = 'none';
    hints.innerHTML = `
      <span class="inline-placeholder-inline">Add more details...</span>
    `;
    container.appendChild(hints);
  }

  function hideHints() {
    hints.style.display = 'none';
  }

  function isLineEmpty(line, lineEl) {
    try {
      if (line && typeof line.length === 'function') return line.length() <= 1;
    } catch (e) {}
    if (lineEl) return lineEl.textContent.trim() === '';
    return false;
  }

  function showHintsAt(range) {
    if (!range || range.length !== 0) return hideHints();
    const info = quill.getLine(range.index);
    if (!info) return hideHints();
    const line = info[0];
    const lineEl = line && line.domNode ? line.domNode : null;
    // Only show on empty paragraphs, not headers or other blocks
    if (!lineEl) return hideHints();
    const tag = (lineEl.tagName || '').toUpperCase();
    if (tag && tag.startsWith('H')) return hideHints();
    if (tag !== 'P') return hideHints();
    if (!isLineEmpty(line, lineEl)) return hideHints();

    // Position just after caret
    const bounds = quill.getBounds(range.index);
    hints.style.left = bounds.left + 'px';
    hints.style.top = (bounds.top + bounds.height + 4) + 'px';
    hints.style.display = 'inline-flex';
  }

  quill.on('selection-change', (range) => {
    if (!range) return hideHints();
    showHintsAt(range);
  });

  quill.on('text-change', (delta, oldDelta, source) => {
    if (source === 'user') {
      hideHints();
    }
    const sel = quill.getSelection();
    if (!sel) return hideHints();
    showHintsAt(sel);
  });

  // Hide hints immediately on keydown for typing/navigation
  const editorRoot = container.querySelector('.ql-editor');
  if (editorRoot) {
    editorRoot.addEventListener('keydown', (e) => {
      const nonWritingKeys = new Set(['Shift','Alt','Control','Meta','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape','Tab','CapsLock']);
      if (!nonWritingKeys.has(e.key)) {
        hideHints();
      }
    });
  }

  // Clicking outside editor removes hints
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) hideHints();
  });

  // No chip actions (chips hidden for now)
}

function setupVEHandlers() {
  // Dropdown helpers
  function closeMenus() {
    document.querySelectorAll('.menu').forEach(m => m.classList.remove('open'));
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) closeMenus();
  });

  // Undo/Redo
  const undoBtn = document.getElementById('undo');
  const redoBtn = document.getElementById('redo');
  const undoDesktopBtn = document.getElementById('undo-desktop');
  
  if (undoBtn) undoBtn.onclick = () => quill.history.undo();
  if (redoBtn) redoBtn.onclick = () => quill.history.redo();
  if (undoDesktopBtn) undoDesktopBtn.onclick = () => quill.history.undo();

  // Mobile-specific handlers
  setupMobileHandlers();
  setupDesktopHandlers();
  
  // Shared handlers
  setupSharedHandlers();
}

function setupMobileHandlers() {
  // Mobile quote button
  const quoteBtn = document.getElementById('quote');
  if (quoteBtn) {
    quoteBtn.onclick = () => {
      // On mobile, use Quote button to open the expand sidebar drawer
      const sidebar = document.getElementById('expandSidebar');
      if (sidebar && window.matchMedia('(max-width: 768px)').matches) {
        sidebar.style.display = 'block';
        requestAnimationFrame(() => sidebar.classList.add('open'));
      } else {
        // Fallback to original quote behavior on larger screens
        const sel = quill.getSelection(true);
        if (sel) quill.formatText(sel.index, sel.length, 'blockquote', true);
      }
    };
  }

  // Mobile link button
  const linkMobileBtn = document.getElementById('btn-link-mobile');
  if (linkMobileBtn) {
    linkMobileBtn.onclick = () => {
      const sel = quill.getSelection(true);
      if (!sel) return;
      const url = prompt('Enter URL');
      if (url) quill.format('link', url);
    };
  }

  // Mobile submit button
  const submitBtn = document.getElementById('submit');
  if (submitBtn) {
    submitBtn.onclick = () => {
      alert('Submit changes (mock)');
    };
  }

  // Mobile style dropdown
  const ddStyleMobile = document.getElementById('dd-style-mobile');
  const menuStyleMobile = document.getElementById('menu-style-mobile');

  if (ddStyleMobile && menuStyleMobile) {
    ddStyleMobile.onclick = (e) => {
      e.stopPropagation();
      closeMenus();
      menuStyleMobile.classList.add('open');
    };

    menuStyleMobile.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const action = e.target.getAttribute('data-style');
      if (action === 'clean') {
        const sel = quill.getSelection(true);
        if (sel) quill.removeFormat(sel.index, sel.length);
      } else if (action === 'script-sup') {
        quill.format('script', 'super');
      } else if (action === 'script-sub') {
        quill.format('script', 'sub');
      } else {
        quill.format(action, !quill.getFormat()[action]);
      }
      closeMenus();
    });
  }

  // Mobile edit dropdown
  const ddEditMobile = document.getElementById('dd-edit-mobile');
  const menuEditMobile = document.getElementById('menu-edit-mobile');

  if (ddEditMobile && menuEditMobile) {
    ddEditMobile.onclick = (e) => {
      e.stopPropagation();
      closeMenus();
      menuEditMobile.classList.add('open');
    };

    menuEditMobile.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const t = e.target.getAttribute('data-insert');
      if (t === 'image') {
        const url = prompt('Image URL');
        if (url) {
          const range = quill.getSelection(true) || { index: quill.getLength() };
          quill.insertEmbed(range.index, 'image', url, 'user');
        }
      } else {
        alert('This insert is mocked in the demo.');
      }
      closeMenus();
    });
  }
}

function setupDesktopHandlers() {
  // Paragraph dropdown
  const ddPara = document.getElementById('dd-paragraph');
  const menuPara = document.getElementById('menu-paragraph');

  if (ddPara && menuPara) {
    ddPara.onclick = (e) => {
      e.stopPropagation();
      closeMenus();
      menuPara.classList.add('open');
    };

    menuPara.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const val = e.target.getAttribute('data-header');
      if (val === 'code') {
        quill.format('code-block', true);
      } else {
        quill.format('header', val ? parseInt(val) : false);
      }
      ddPara.querySelector('.cdx-button__label').textContent = val ? ('Heading ' + val) : 'Paragraph';
      closeMenus();
    });
  }

  // Style dropdown
  const ddStyle = document.getElementById('dd-style');
  const menuStyle = document.getElementById('menu-style');

  if (ddStyle && menuStyle) {
    ddStyle.onclick = (e) => {
      e.stopPropagation();
      closeMenus();
      menuStyle.classList.add('open');
    };

    menuStyle.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const action = e.target.getAttribute('data-style');
      if (action === 'clean') {
        const sel = quill.getSelection(true);
        if (sel) quill.removeFormat(sel.index, sel.length);
      } else if (action === 'script-sup') {
        quill.format('script', 'super');
      } else if (action === 'script-sub') {
        quill.format('script', 'sub');
      } else {
        quill.format(action, !quill.getFormat()[action]);
      }
      closeMenus();
    });
  }
}

function setupSharedHandlers() {
  // Lists
  const olBtn = document.querySelector('[data-cmd="ol"]');
  const ulBtn = document.querySelector('[data-cmd="ul"]');
  
  if (olBtn) olBtn.onclick = () => quill.format('list', 'ordered');
  if (ulBtn) ulBtn.onclick = () => quill.format('list', 'bullet');

  // Link (desktop)
  const linkBtn = document.getElementById('btn-link');
  if (linkBtn) {
    linkBtn.onclick = () => {
      const sel = quill.getSelection(true);
      if (!sel) return;
      const url = prompt('Enter URL');
      if (url) quill.format('link', url);
    };
  }

  // Cite dropdown (mock)
  const ddCite = document.getElementById('dd-cite');
  const menuCite = document.getElementById('menu-cite');

  if (ddCite && menuCite) {
    ddCite.onclick = (e) => {
      e.stopPropagation();
      closeMenus();
      menuCite.classList.add('open');
    };

    menuCite.addEventListener('click', () => {
      alert('Citations are mocked in this demo.');
      closeMenus();
    });
  }

  // Insert dropdown
  const ddIns = document.getElementById('dd-insert');
  const menuIns = document.getElementById('menu-insert');

  if (ddIns && menuIns) {
    ddIns.onclick = (e) => {
      e.stopPropagation();
      closeMenus();
      menuIns.classList.add('open');
    };

    menuIns.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return;
      const t = e.target.getAttribute('data-insert');
      if (t === 'image') {
        const url = prompt('Image URL');
        if (url) {
          const range = quill.getSelection(true) || { index: quill.getLength() };
          quill.insertEmbed(range.index, 'image', url, 'user');
        }
      } else if (t === 'char') {
        alert('Special characters dialog is mocked.');
      } else {
        alert('This insert is mocked in the demo.');
      }
      closeMenus();
    });
  }

  // Publish button
  const publishBtn = document.getElementById('publish');
  if (publishBtn) {
    publishBtn.onclick = () => alert('Publishing disabled in this demo.');
  }

  // Smart widget - handled by WikidataWidget class
  
  // Add section button - opens wizard
  const addSectionBtn = document.getElementById('addSectionBtn');
  if (addSectionBtn) {
    // In this branch, open the right-side expand sidebar instead of wizard
    addSectionBtn.onclick = () => {
      const sidebar = document.getElementById('expandSidebar');
      if (sidebar) {
        sidebar.style.display = 'block';
      }
    };
  }
  
  // Wizard close button
  const wizardClose = document.getElementById('wizardClose');
  if (wizardClose) {
    wizardClose.onclick = () => {
      closeSectionWizard();
    };
  }

  // Expand sidebar close button (sidebar concept)
  const expandSidebarClose = document.getElementById('expandSidebarClose');
  if (expandSidebarClose) {
    expandSidebarClose.onclick = () => {
      const sidebar = document.getElementById('expandSidebar');
      if (sidebar) {
        sidebar.classList.remove('open');
        // Wait for transition on mobile, then hide
        setTimeout(() => { sidebar.style.display = 'none'; }, 200);
      }
    };
  }

  // Insert actions from suggestions (delegated)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    if (!action) return;
    e.preventDefault();
    e.stopPropagation();
    if (action === 'insert-image') {
      insertImagePlaceholder();
      return;
    }
    const card = btn.closest('.expand-suggestion');
    const btnTitle = btn.getAttribute('data-title');
    const titleEl = card ? card.querySelector('.expand-suggestion__content h5') : null;
    const sectionTitle = (btnTitle || (titleEl ? titleEl.textContent : '') || 'New section').trim();
    const includeAttr = btn.getAttribute('data-include') || '';
    const includeItems = includeAttr ? includeAttr.split('||').map(s => s.trim()).filter(Boolean) : [];
    insertSectionIntoEditor(sectionTitle, includeItems);
    // Tell sidebar to switch to Focus Mode for this section
    try {
      document.dispatchEvent(new CustomEvent('sidebar:focusSection', { detail: { title: sectionTitle, include: includeItems } }));
    } catch (_) {}
  });

  // (Removed) example overlay handler

  
  // Close wizard when clicking backdrop
  const wizardBackdrop = document.querySelector('.wizard-backdrop');
  if (wizardBackdrop) {
    wizardBackdrop.onclick = () => {
      closeSectionWizard();
    };
  }
  
  // Close wizard with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const wizard = document.getElementById('sectionWizard');
      if (wizard && wizard.classList.contains('show')) {
        closeSectionWizard();
      }
    }
  });
  
  // Wizard cancel button
  const wizardCancel = document.getElementById('wizardCancel');
  if (wizardCancel) {
    wizardCancel.onclick = () => {
      closeSectionWizard();
    };
  }
  
  // Wizard navigation buttons
  const wizardContinue = document.getElementById('wizardContinue');
  const wizardBack = document.getElementById('wizardBack');
  const wizardSkip = document.getElementById('wizardSkip');
  const wizardInsert = document.getElementById('wizardInsert');
  
  if (wizardContinue) {
    wizardContinue.onclick = () => proceedToNextStep();
  }
  
  if (wizardBack) {
    wizardBack.onclick = () => goBackStep();
  }
  
  if (wizardSkip) {
    wizardSkip.onclick = () => skipStep();
  }
  
  if (wizardInsert) {
    wizardInsert.onclick = () => finishSection();
  }
  
  // Source palette handlers
  const sourcePaletteClose = document.getElementById('sourcePaletteClose');
  if (sourcePaletteClose) {
    sourcePaletteClose.onclick = () => hideSourcePalette();
  }
  
  // Section card selection
  document.addEventListener('click', (e) => {
    if (e.target.closest('.section-card')) {
      const card = e.target.closest('.section-card');
      const isCustom = card.dataset.section === 'custom';
      
      // Remove selection from other cards
      document.querySelectorAll('.section-card').forEach(c => c.classList.remove('selected'));
      
      // Select this card
      card.classList.add('selected');
      
      // Handle custom section
      if (isCustom) {
        const customInput = card.querySelector('.custom-section-input');
        const textInput = card.querySelector('.custom-section-name');
        customInput.style.display = 'block';
        textInput.focus();
        
        // Save to wizard state and update buttons
        wizardState.selectedSection = textInput.value.trim();
        
        // Enable continue button when custom name is entered
        textInput.addEventListener('input', () => {
          wizardState.selectedSection = textInput.value.trim();
          updateWizardButtons();
        });
      } else {
        // Hide custom inputs from other cards
        document.querySelectorAll('.custom-section-input').forEach(input => {
          input.style.display = 'none';
        });
        
        // Save to wizard state
        wizardState.selectedSection = card.querySelector('.section-card-title').textContent;
        updateWizardButtons();
      }
    }
    
    // Source input and management
    if (e.target.id === 'addSourceBtn') {
      addSourceToList();
    }
    
    // Source statement clicking in palette
    if (e.target.closest('.source-statement-item')) {
      const item = e.target.closest('.source-statement-item');
      const text = item.querySelector('.source-statement-text').textContent;
      insertTextAtCursor(text);
    }
    
    // Remove format button handlers and statement selection (no longer needed)
  });
  
  // Source URL input enter key
  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'sourceUrlInput' && e.key === 'Enter') {
      e.preventDefault();
      addSourceToList();
    }
  });
}

// Insert a new section (H2) with a placeholder paragraph at current caret (or end)
function insertSectionIntoEditor(title, includeItems = []) {
  if (!quill) return;
  const safeTitle = String(title || 'New section');

  // If section already exists (by exact title line), jump there instead of duplicating
  let index = findExistingSectionStartIndex(safeTitle);
  if (index !== -1) {
    // Move caret just after the heading line
    index = index + safeTitle.length + 1; // title + newline
  } else {
    // Append at end
    index = quill.getLength();
    try {
      const prev1 = index > 0 ? quill.getText(index - 1, 1) : '\n';
      if (prev1 !== '\n') { quill.insertText(index, '\n', 'user'); index += 1; }
    } catch (_) {}
    // Insert heading and format
    quill.insertText(index, safeTitle, 'user');
    quill.insertText(index + safeTitle.length, '\n', 'user');
    quill.formatLine(index, 1, 'header', 2, 'user');
    index += safeTitle.length + 1;
    // Insert placeholder paragraph below heading and remember caret pos here
    const placeholder = 'Start adding ' + safeTitle.toLowerCase() + '…';
    quill.insertText(index, placeholder, { italic: true }, 'user');
    const caretAfterPlaceholder = index + placeholder.length; // caret should blink here
    quill.insertText(caretAfterPlaceholder, '\n', 'user');
    index = caretAfterPlaceholder + 1;
  }

  // Do not auto-insert guidance bullets; sidebar provides this context now

  // Place caret back next to the placeholder to encourage typing there
  try {
    const caretPos = findExistingSectionStartIndex(safeTitle);
    if (caretPos !== -1) {
      const pos = caretPos + safeTitle.length + 1; // after heading newline
      const phText = 'Start adding ' + safeTitle.toLowerCase() + '…';
      quill.setSelection(pos + phText.length, 0, 'user');
    } else {
      quill.setSelection(0, 0, 'user');
    }
  } catch (_) {}
  try { quill.scrollIntoView && quill.scrollIntoView(); } catch (_) {}
}

// Find the index of an existing H2 line that matches title (by plain text line)
function findExistingSectionStartIndex(title) {
  try {
    const full = quill.getText();
    const lines = full.split('\n');
    let acc = 0;
    for (const line of lines) {
      if (line.trim().toLowerCase() === String(title).trim().toLowerCase()) {
        return acc; // start index of that line
      }
      acc += line.length + 1; // include newline
    }
  } catch (_) {}
  return -1;
}

// Sidebar-driven editor actions
document.addEventListener('editor:jumpToHeading', (ev) => {
  const d = ev && ev.detail || {};
  if (!d.title || !quill) return;
  const idx = findExistingSectionStartIndex(d.title);
  if (idx !== -1) {
    const pos = idx + String(d.title).length + 1; // after heading newline
    quill.setSelection(pos, 0, 'user');
    try { quill.scrollIntoView && quill.scrollIntoView(); } catch (_) {}
  }
});

document.addEventListener('editor:insertOutline', (ev) => {
  const d = ev && ev.detail || {};
  if (!d.title || !Array.isArray(d.include) || !quill) return;
  const idx = findExistingSectionStartIndex(d.title);
  if (idx === -1) return;
  let index = idx + String(d.title).length + 1; // after heading newline
  // Insert guidance label
  const guidanceText = 'Suggested items to include (reference):';
  quill.insertText(index, guidanceText, { italic: true }, 'user');
  try { quill.formatText(index, guidanceText.length, { color: '#72777d' }, 'user'); } catch (_) {}
  quill.insertText(index + guidanceText.length, '\n', 'user');
  index += guidanceText.length + 1;
  // Insert bullets
  for (const it of d.include) {
    const txt = String(it || '').trim();
    if (!txt) continue;
    quill.insertText(index, txt, { italic: true }, 'user');
    try { quill.formatText(index, txt.length, { color: '#72777d' }, 'user'); } catch (_) {}
    quill.insertText(index + txt.length, '\n', 'user');
    quill.formatLine(index, 1, 'list', 'bullet', 'user');
    index += txt.length + 1;
  }
  quill.setSelection(index, 0, 'user');
  try { quill.scrollIntoView && quill.scrollIntoView(); } catch (_) {}
});

// Insert a grey image placeholder (SVG data URI) with a caption line
function insertImagePlaceholder() {
  if (!quill) return;
  const w = 640, h = 360;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#e6e6e6"/>
  <rect x="${Math.round(w*0.18)}" y="${Math.round(h*0.28)}" width="${Math.round(w*0.64)}" height="${Math.round(h*0.44)}" fill="#d0d0d0"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="16" fill="#7a7a7a">Image</text>
</svg>`;
  const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

  const sel = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
  let index = sel.index;

  // Ensure on its own line
  try {
    const prevChar = index > 0 ? quill.getText(index - 1, 1) : '\n';
    if (prevChar !== '\n') { quill.insertText(index, '\n', 'user'); index += 1; }
  } catch (_) {}

  // Insert image embed
  quill.insertEmbed(index, 'image', dataUrl, 'user');
  index += 1; // embeds count as length 1
  quill.insertText(index, '\n', 'user');
  index += 1;

  // Caption placeholder
  const caption = 'Add caption…';
  quill.insertText(index, caption, { italic: true }, 'user');
  quill.insertText(index + caption.length, '\n', 'user');

  // Place caret at caption line
  quill.setSelection(index, 0, 'user');
}

// (Removed) example overlay implementation

function addSourceToList() {
  const urlInput = document.getElementById('sourceUrlInput');
  const sourcesList = document.getElementById('sourcesList');
  
  if (!urlInput || !sourcesList || !urlInput.value.trim()) return;
  
  const url = urlInput.value.trim();
  
  // Simple example sentences for concept demonstration
  const exampleSentences = [
    `${wizardState.selectedSection} has been recognized for significant contributions to the field.`,
    `Recent developments in ${wizardState.selectedSection} have gained widespread attention.`,
    `The impact of ${wizardState.selectedSection} continues to influence current research.`
  ];
  
  const sourceItem = document.createElement('div');
  sourceItem.className = 'source-item';
  sourceItem.innerHTML = `
    <div class="source-url">${url}</div>
    <div class="source-statements">
      ${exampleSentences.map(sentence => `
        <div class="example-sentence">
          ${sentence} <span class="citation-note">(will add a citation)</span>
        </div>
      `).join('')}
    </div>
  `;
  
  sourcesList.appendChild(sourceItem);
  
  // Add to wizard state
  wizardState.sources.push({
    url: url,
    sentences: exampleSentences
  });
  
  // Clear input
  urlInput.value = '';
  
  // Hide nudge if it was showing
  const sourcesNudge = document.getElementById('sourcesNudge');
  if (sourcesNudge) {
    sourcesNudge.style.display = 'none';
  }
  
  updateWizardButtons();
}

// === Codex Icons via MW API ===
async function loadCodexIcons(iconNames) {
  const url = 'https://www.mediawiki.org/w/api.php?action=query&list=codexicons&format=json&origin=*' +
    '&names=' + encodeURIComponent(iconNames.join('|'));
  const res = await fetch(url);
  const data = await res.json();
  const out = {};
  const map = data?.query?.codexicons || {};
  
  for (const k of Object.keys(map)) {
    const entry = map[k];
    const path = typeof entry === 'string' ? entry : (entry.ltr || entry.default || Object.values(entry.langCodeMap || {})[0] || '');
    out[k] = path;
  }
  return out;
}

// Apply icons on load
(function applyIcons() {
  const nodes = Array.from(document.querySelectorAll('.cdx-icon[data-icon]'));
  const names = Array.from(new Set(nodes.map(n => n.getAttribute('data-icon'))));
  
  loadCodexIcons(names).then(paths => {
    nodes.forEach(n => {
      const name = n.getAttribute('data-icon');
      const p = paths[name];
      if (p) {
        n.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' + p + '</svg>';
      }
    });
  }).catch(console.error);
})();

// === Section Wizard Functions ===
let currentWizardStep = 1;
let wizardState = {
  selectedSection: null,
  customSectionName: '',
  sources: [],
  insertedSectionPosition: null,
  sourcePaletteVisible: false
};

function openSectionWizard() {
  const wizard = document.getElementById('sectionWizard');
  if (wizard) {
    // Reset wizard state
    resetWizardState();
    
    wizard.style.display = 'block';
    // Use setTimeout to ensure the display change has taken effect before adding the class
    setTimeout(() => {
      wizard.classList.add('show');
    }, 10);
    
    // Prevent body scrolling while wizard is open
    document.body.style.overflow = 'hidden';
  }
}

function closeSectionWizard() {
  const wizard = document.getElementById('sectionWizard');
  if (wizard) {
    wizard.classList.remove('show');
    
    // Wait for transition to complete before hiding
    setTimeout(() => {
      wizard.style.display = 'none';
      resetWizardState();
    }, 300);
    
    // Restore body scrolling
    document.body.style.overflow = '';
  }
}

function resetWizardState() {
  // Reset step counter
  currentWizardStep = 1;
  
  // Reset wizard data
  wizardState = {
    selectedSection: null,
    customSectionName: '',
    sources: [],
    insertedSectionPosition: null,
    sourcePaletteVisible: false
  };
  
  // Show only step 1
  showWizardStep(1);
  
  // Clear all card selections
  document.querySelectorAll('.section-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Hide all custom section inputs
  document.querySelectorAll('.custom-section-input').forEach(input => {
    input.style.display = 'none';
  });
  
  // Clear custom section text
  document.querySelectorAll('.custom-section-name').forEach(input => {
    input.value = '';
  });
  
  // Clear sources list
  const sourcesList = document.getElementById('sourcesList');
  if (sourcesList) {
    sourcesList.innerHTML = '';
  }
  
  // Clear review checks
  const reviewChecks = document.getElementById('reviewChecks');
  if (reviewChecks) {
    reviewChecks.innerHTML = '';
  }
  
  // Hide source palette
  hideSourcePalette();
  
  // Reset buttons
  updateWizardButtons();
}

function showWizardStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.wizard-step').forEach(step => {
    step.style.display = 'none';
  });
  
  // Show current step
  const currentStep = document.getElementById(`step${stepNumber}`);
  if (currentStep) {
    currentStep.style.display = 'block';
  }
  
  // Update stepper
  document.querySelectorAll('.stepper-item').forEach((item, index) => {
    if (index + 1 === stepNumber) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  currentWizardStep = stepNumber;
  updateWizardButtons();
}

function updateWizardButtons() {
  const backBtn = document.getElementById('wizardBack');
  const skipBtn = document.getElementById('wizardSkip');
  const continueBtn = document.getElementById('wizardContinue');
  const insertBtn = document.getElementById('wizardInsert');
  
  // Show/hide back button
  if (backBtn) {
    backBtn.style.display = currentWizardStep > 1 ? 'inline-block' : 'none';
  }
  
  // Show/hide skip button (only on step 2)
  if (skipBtn) {
    skipBtn.style.display = currentWizardStep === 2 ? 'inline-block' : 'none';
  }
  
  // Show/hide continue button
  if (continueBtn) {
    continueBtn.style.display = currentWizardStep < 3 ? 'inline-block' : 'none';
    
    // Enable/disable continue button based on step
    if (currentWizardStep === 1) {
      continueBtn.disabled = !wizardState.selectedSection;
    } else if (currentWizardStep === 2) {
      continueBtn.disabled = false; // Can continue even without sources
    }
  }
  
  // Show/hide insert button (only on step 3)
  if (insertBtn) {
    insertBtn.style.display = currentWizardStep === 3 ? 'inline-block' : 'none';
    insertBtn.disabled = false; // Always allow finishing
  }
}

// Removed isReadyToInsert - no longer needed with inline compose

function proceedToNextStep() {
  if (currentWizardStep === 1) {
    // Save selected section
    const selectedCard = document.querySelector('.section-card.selected');
    if (selectedCard) {
      if (selectedCard.dataset.section === 'custom') {
        const customName = selectedCard.querySelector('.custom-section-name');
        wizardState.selectedSection = customName ? customName.value.trim() : '';
        wizardState.customSectionName = wizardState.selectedSection;
      } else {
        wizardState.selectedSection = selectedCard.querySelector('.section-card-title').textContent;
      }
    }
    
    // Immediately insert section scaffold and switch to edit mode
    insertSectionScaffold();
    
    // Update chosen section displays
    document.querySelectorAll('.chosen-section-name').forEach(span => {
      span.textContent = wizardState.selectedSection;
    });
    
    showWizardStep(2);
    
  } else if (currentWizardStep === 2) {
    // Show source palette if we have sources
    if (wizardState.sources.length > 0) {
      showSourcePalette();
    }
    
    // Run review checks
    runReviewChecks();
    showWizardStep(3);
  }
}

function goBackStep() {
  if (currentWizardStep > 1) {
    showWizardStep(currentWizardStep - 1);
  }
}

function skipStep() {
  if (currentWizardStep === 2) {
    // Show nudge if no sources added
    if (wizardState.sources.length === 0) {
      const sourcesNudge = document.getElementById('sourcesNudge');
      if (sourcesNudge) {
        sourcesNudge.style.display = 'block';
      }
    }
    proceedToNextStep();
  }
}

function insertSectionScaffold() {
  if (!quill || !isEditMode) {
    // If not in edit mode, enter it first
    if (!isEditMode) {
      enterEditMode();
    }
    
    // Wait for quill to be ready
    setTimeout(() => {
      insertSectionScaffold();
    }, 100);
    return;
  }
  
  const length = quill.getLength();
  
  // Insert section heading
  quill.insertText(length - 1, '\n\n'); // Add some space
  quill.insertText(length + 1, wizardState.selectedSection + '\n', { header: 2 });
  
  // Insert a placeholder paragraph
  const placeholderText = 'Start writing about ' + wizardState.selectedSection + '...';
  quill.insertText(quill.getLength() - 1, placeholderText + '\n');
  
  // Position cursor after the heading
  const cursorPosition = length + wizardState.selectedSection.length + 3;
  quill.setSelection(cursorPosition, placeholderText.length);
  
  // Store position for later reference
  wizardState.insertedSectionPosition = cursorPosition;
}

function runReviewChecks() {
  const reviewChecks = document.getElementById('reviewChecks');
  const reviewPreview = document.getElementById('reviewPreview');
  
  if (!reviewChecks || !reviewPreview) return;
  
  let warnings = [];
  
  // Check for uncited content
  const draftEditor = document.getElementById('draftEditor');
  const hasContent = draftEditor && draftEditor.textContent.trim();
  const hasCitations = wizardState.sources.length > 0;
  
  if (hasContent && !hasCitations) {
    warnings.push({
      icon: '⚠️',
      title: 'Uncited content',
      text: 'This content appears to lack citations. For living persons (BLP), all content must be cited.'
    });
  }
  
  // Check if no sources were added
  if (wizardState.sources.length === 0) {
    warnings.push({
      icon: '📚',
      title: 'No sources provided',
      text: 'Consider adding reliable sources to support your content.'
    });
  }
  
  // Display warning cards
  let warningsHTML = '';
  warnings.forEach(warning => {
    warningsHTML += `
      <div class="review-issue">
        <div class="review-issue-icon">${warning.icon}</div>
        <div class="review-issue-content">
          <div class="review-issue-title">${warning.title}</div>
          <div class="review-issue-text">${warning.text}</div>
        </div>
      </div>
    `;
  });
  
  reviewChecks.innerHTML = warnings.length > 0 ? warningsHTML : '<p style="color: #00af89; font-weight: 500;">✓ No issues found. Ready to insert!</p>';
  
  // Display preview
  const draftContent = draftEditor ? draftEditor.innerHTML : '';
  reviewPreview.innerHTML = `
    <h4>${wizardState.selectedSection}</h4>
    <div class="review-preview-content">${draftContent || 'No content to preview.'}</div>
  `;
}

function finishSection() {
  // Show success toast
  showToast(`Section "${wizardState.selectedSection}" added successfully!`);
  
  // Hide source palette
  hideSourcePalette();
  
  // Close wizard
  closeSectionWizard();
}

function showSourcePalette() {
  const palette = document.getElementById('sourcePalette');
  const paletteContent = document.getElementById('sourcePaletteContent');
  
  if (!palette || !paletteContent) return;
  
  // Populate with source statements
  let statementsHTML = '';
  wizardState.sources.forEach((source, sourceIndex) => {
    source.sentences.forEach((sentence, sentenceIndex) => {
      statementsHTML += `
        <div class="source-statement-item" data-source="${sourceIndex}" data-sentence="${sentenceIndex}">
          <div class="source-statement-text">${sentence}</div>
          <div class="source-statement-citation">[${sourceIndex + 1}]</div>
        </div>
      `;
    });
  });
  
  paletteContent.innerHTML = statementsHTML;
  
  // Show palette
  palette.style.display = 'block';
  setTimeout(() => {
    palette.classList.add('show');
  }, 10);
  
  wizardState.sourcePaletteVisible = true;
}

function hideSourcePalette() {
  const palette = document.getElementById('sourcePalette');
  if (!palette) return;
  
  palette.classList.remove('show');
  setTimeout(() => {
    palette.style.display = 'none';
  }, 300);
  
  wizardState.sourcePaletteVisible = false;
}

function insertTextAtCursor(text) {
  if (!quill) return;
  
  const selection = quill.getSelection();
  if (selection) {
    quill.insertText(selection.index, text + ' ');
    quill.setSelection(selection.index + text.length + 1);
  } else {
    // Insert at the end if no selection
    const length = quill.getLength();
    quill.insertText(length - 1, text + ' ');
    quill.setSelection(length + text.length);
  }
}

function showToast(message) {
  // Create and show a simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #00af89;
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    z-index: 4000;
    animation: slideUpToast 0.3s ease-out;
  `;
  toast.textContent = message;
  
  // Add keyframe animation
  if (!document.getElementById('toastStyles')) {
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
      @keyframes slideUpToast {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideUpToast 0.3s ease-out reverse';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
