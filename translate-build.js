#!/usr/bin/env node

/**
 * Simple build-time translation script
 * Generates Indonesian versions of HTML files using translations.json
 * 
 * Usage: node translate-build.js <input-file> <output-file>
 * Example: node translate-build.js creation.html id-creation.html
 */

const fs = require('fs');
const path = require('path');

function main() {
  const [,, inputFile, outputFile] = process.argv;
  
  if (!inputFile || !outputFile) {
    console.log('Usage: node translate-build.js <input-file> <output-file>');
    console.log('Example: node translate-build.js creation.html id-creation.html');
    process.exit(1);
  }

  console.log(`🔄 Translating ${inputFile} → ${outputFile}`);
  
  try {
    // Load translation data
    const translations = JSON.parse(fs.readFileSync('translations.json', 'utf8'));
    const t = translations.id; // Indonesian translations
    
    // Read source HTML
    let html = fs.readFileSync(inputFile, 'utf8');
    
    // Simple translations (safe replacements only)
    console.log('📝 Applying translations...');
    
    // Page title
    if (t.pageTitle) {
      html = html.replace(
        /<title>Article Creator — Reference Chip Concept<\/title>/g,
        `<title>${t.pageTitle}</title>`
      );
      console.log('  ✓ Title translated');
    }
    
    // Step 1 content
    if (t.steps?.step1) {
      html = html.replace(
        /What article would you like to create\?/g,
        t.steps.step1.title.replace('Step 1: ', '')
      );
      html = html.replace(
        /e\.g\., Jane Doe \/ Example Software/g,
        'contoh: Jane Doe / Perangkat Lunak Contoh'
      );
      console.log('  ✓ Step 1 translated');
    }
    
    // Step 2 content  
    if (t.steps?.step2) {
      html = html.replace(
        /Assign a topic category/g,
        'Pilih kategori topik'
      );
      html = html.replace(
        /This helps us suggest the right structure and policies\./g,
        'Ini membantu kami menyarankan struktur dan kebijakan yang tepat.'
      );
      console.log('  ✓ Step 2 translated');
    }
    
    // Buttons
    html = html.replace(/\>Continue</g, '>Lanjutkan<');
    html = html.replace(/\>Back</g, '>Kembali<');
    html = html.replace(/\>Start editing</g, '>Mulai mengedit<');
    console.log('  ✓ Buttons translated');
    
    // Categories (safe replacements - avoid JavaScript keywords)
    html = html.replace(/Person \/ Biography/g, 'Orang / Biografi');
    html = html.replace(/Geographic Location/g, 'Lokasi Geografis');
    html = html.replace(/Species \/ Biology/g, 'Spesies / Biologi');
    html = html.replace(/Organization/g, 'Organisasi');
    html = html.replace(/Academic \/ Concept/g, 'Akademik / Konsep');
    html = html.replace(/Creative Work/g, 'Karya Kreatif');
    // Only replace "Event" when it's in category context, not in JavaScript
    html = html.replace(/data-cat="event">Event</g, 'data-cat="event">Peristiwa<');
    html = html.replace(/>Event</g, function(match, offset) {
      // Only replace if it's in a category context, not in JavaScript
      const before = html.substring(offset - 50, offset);
      if (before.includes('category-item') && !before.includes('addEventListener')) {
        return '>Peristiwa<';
      }
      return match;
    });
    html = html.replace(/Other/g, 'Lainnya');
    console.log('  ✓ Categories translated');
    
    // Smart Chips translations
    if (t.chips) {
      // Reference chip
      if (t.chips.reference) {
        html = html.replace(/\>Reference</g, `>${t.chips.reference}<`);
      }
      console.log('  ✓ Smart chips translated');
    }
    
    // Dynamic chip tooltips ("add" prefix in prettifyPlaceholder function)
    html = html.replace(/return 'add '\+label;/g, "return 'tambah '+label;");
    console.log('  ✓ Chip tooltips translated');
    
    // Update language attribute
    html = html.replace(/html lang="en"/, 'html lang="id"');
    console.log('  ✓ Language attribute updated');
    
    // Write output
    fs.writeFileSync(outputFile, html, 'utf8');
    console.log(`✅ Successfully created ${outputFile}`);
    console.log(`📊 Size: ${Math.round(fs.statSync(outputFile).size / 1024)}KB`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };