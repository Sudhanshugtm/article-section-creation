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
    const outBase = path.basename(outputFile, '.html');
    
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
    
    // Sidebar guidance content
    if (t.guidance) {
      if (t.guidance.title) {
        html = html.replace(/Writing guidance/g, t.guidance.title);
      }
      if (t.guidance.sections) {
        html = html.replace(/Suggested sections/g, t.guidance.sections);
      }
      if (t.guidance.eligibility) {
        html = html.replace(/Article eligibility check/g, t.guidance.eligibility + ' check');
      }
      console.log('  ✓ Sidebar guidance translated');
    }
    
    // Eligibility questions
    if (t.eligibility) {
      if (t.eligibility.title) {
        html = html.replace(/Is this article eligible\?/g, t.eligibility.title);
      }
      if (t.eligibility.questions) {
        // Actual questions from article-creator.html
        html = html.replace(/Has your topic been covered in newspapers or magazines\?/g, 'Apakah topik Anda telah diliput di koran atau majalah?');
        html = html.replace(/Are these sources from well-known news sites or publications\?/g, 'Apakah sumber-sumber ini dari situs berita atau publikasi terkenal?');
        html = html.replace(/Were these written by independent journalists \(not press releases\)\?/g, 'Apakah ini ditulis oleh jurnalis independen (bukan siaran pers)?');
        html = html.replace(/Do you have at least 2 different sources\?/g, 'Apakah Anda memiliki setidaknya 2 sumber yang berbeda?');
      }
      if (t.eligibility.yes) {
        html = html.replace(/\>Yes</g, `>${t.eligibility.yes}<`);
      }
      if (t.eligibility.no) {
        html = html.replace(/\>No</g, `>${t.eligibility.no}<`);
      }
      if (t.eligibility.maybe) {
        html = html.replace(/\>Maybe</g, `>${t.eligibility.maybe}<`);
      }
      console.log('  ✓ Eligibility questions translated');
    }
    
    // Detailed guidance content in sidebar
    html = html.replace(/Write a clear opening that summarizes the topic, explains why it\\'s important, and covers the main points readers will find in the article\./g, 
      'Tulis pembukaan yang jelas yang merangkum topik, menjelaskan mengapa penting, dan mencakup poin-poin utama yang akan ditemukan pembaca dalam artikel.');
    html = html.replace(/Examples from Wikipedia:/g, 'Contoh dari Wikipedia:');
    html = html.replace(/Template structure:/g, 'Struktur templat:');
    html = html.replace(/Quick check: Does your topic have what Wikipedia needs\?/g, 'Pemeriksaan cepat: Apakah topik Anda memiliki apa yang dibutuhkan Wikipedia?');
    html = html.replace(/Helper for citing reliable sources/g, 'Bantuan untuk mengutip sumber terpercaya');
    html = html.replace(/Manual source entry:/g, 'Entri sumber manual:');
    html = html.replace(/Include key facts in the first paragraph/g, 'Sertakan fakta kunci di paragraf pertama');
    html = html.replace(/Use reliable sources throughout/g, 'Gunakan sumber terpercaya di seluruh artikel');
    html = html.replace(/Select a category in Step 2 to see specific section suggestions for your article type\./g, 
      'Pilih kategori di Langkah 2 untuk melihat saran bagian spesifik untuk jenis artikel Anda.');
    html = html.replace(/Sister project data will appear when you enter an article title above\./g, 
      'Data proyek saudara akan muncul ketika Anda memasukkan judul artikel di atas.');
    html = html.replace(/Quick facts for/g, 'Fakta cepat untuk');
    html = html.replace(/We found key facts from reliable sources:/g, 'Kami menemukan fakta kunci dari sumber terpercaya:');
    html = html.replace(/Images available from Wikimedia Commons/g, 'Gambar tersedia dari Wikimedia Commons');
    html = html.replace(/Writing tip/g, 'Tips menulis');
    
    console.log('  ✓ Detailed guidance content translated');
    
    // Sample article content (from article-creation-suggestions.json)
    html = html.replace(/Marie Curie \(born Maria Salomea Skłodowska; 7 November 1867 – 4 July 1934\) was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity\./g,
      'Marie Curie (lahir Maria Salomea Skłodowska; 7 November 1867 – 4 Juli 1934) adalah seorang fisikawan dan kimiawan Polandia-Prancis yang melakukan penelitian perintis tentang radioaktivitas.');
    
    // Source checker draft generation content
    html = html.replace(/DRAFT: Needs editing/g, 'DRAFT: Perlu pengeditan');
    html = html.replace(/This is a draft stub\. Please expand with your own analysis and additional sources before publishing\./g,
      'Ini adalah draft stub. Harap kembangkan dengan analisis Anda sendiri dan sumber tambahan sebelum dipublikasikan.');
    html = html.replace(/According to \[SOURCE\], "\[TITLE\]" was reported on \[DATE\]\.\[1\] The article discusses \[TOPIC\]\./g,
      'Menurut [SOURCE], "[TITLE]" dilaporkan pada [DATE].[1] Artikel membahas [TOPIC].');
    html = html.replace(/This is a DRAFT stub created from source metadata\. Please expand with your own analysis and additional sources before publishing\./g,
      'Ini adalah DRAFT stub yang dibuat dari metadata sumber. Harap kembangkan dengan analisis Anda sendiri dan sumber tambahan sebelum dipublikasikan.');
    
    console.log('  ✓ Sample content and draft templates translated');
    
    // Update language attribute
    html = html.replace(/html lang="en"/, 'html lang="id"');
    console.log('  ✓ Language attribute updated');

    // Toolbar and common UI labels
    html = html.replace(/title=\"Close\"/g, 'title="Tutup"');
    html = html.replace(/\>Suggestions</g, '>Saran');
    html = html.replace(/title=\"Get suggestions\"/g, 'title="Dapatkan saran"');
    html = html.replace(/\>Source</g, '>Sumber');
    html = html.replace(/\>Publish</g, '>Terbitkan');
    html = html.replace(/Add link/g, 'Tambah pranala');
    html = html.replace(/Insert/g, 'Sisipkan');
    html = html.replace(/Template… \(mock\)/g, 'Templat… (mock)');
    html = html.replace(/Math… \(mock\)/g, 'Matematika… (mock)');
    html = html.replace(/Table… \(mock\)/g, 'Tabel… (mock)');
    html = html.replace(/Special character…/g, 'Karakter khusus…');
    html = html.replace(/Cite web… \(mock\)/g, 'Kutip web… (mock)');
    html = html.replace(/Cite book… \(mock\)/g, 'Kutip buku… (mock)');
    html = html.replace(/Cite news… \(mock\)/g, 'Kutip berita… (mock)');
    html = html.replace(/title=\"Page options\"/g, 'title="Opsi halaman"');
    html = html.replace(/title=\"Help\"/g, 'title="Bantuan"');
    html = html.replace(/title=\"Add from a source\"/g, 'title="Tambahkan dari sumber"');
    html = html.replace(/title=\"Numbered list\"/g, 'title="Daftar bernomor"');
    html = html.replace(/title=\"Bullet list\"/g, 'title="Daftar poin"');
    console.log('  ✓ Toolbar labels translated');

    // Step 2 dynamic title template
    html = html.replace(/step2Title\.textContent = 'What is \"' \+ userTopic \+ '\"\?';/g,
      "step2Title.textContent = 'Apa itu \\\"' + userTopic + '\\\"?';");
    console.log('  ✓ Dynamic Step 2 title translated');

    // Source modal and sidebar strings
    html = html.replace(/Add content from a reliable source/g, 'Tambahkan konten dari sumber terpercaya');
    html = html.replace(/Source verification/g, 'Verifikasi sumber');
    html = html.replace(/Source URL/g, 'URL sumber');
    html = html.replace(/Title \(optional\)/g, 'Judul (opsional)');
    html = html.replace(/Article title/g, 'Judul artikel');
    html = html.replace(/Draft content preview/g, 'Pratinjau konten draf');
    html = html.replace(/\>Cancel</g, '>Batal<');
    html = html.replace(/\>Check source</g, '>Periksa sumber<');
    html = html.replace(/textContent = 'Check source';/g, "textContent = 'Periksa sumber';");
    html = html.replace(/Create draft from source/g, 'Buat draf dari sumber');
    html = html.replace(/Insert as draft/g, 'Sisipkan sebagai draf');
    html = html.replace(/Add reference/g, 'Tambahkan referensi');
    html = html.replace(/Insert cite/g, 'Sisipkan kutipan');
    html = html.replace(/unclassified/g, 'tidak terklasifikasi');
    html = html.replace(/Add from source/g, 'Tambahkan dari sumber');

    // Verification steps (modal and sidebar)
    html = html.replace(/Checking domain\.\.\./g, 'Memeriksa domain...');
    html = html.replace(/Verifying reliability\.\.\./g, 'Memverifikasi keandalan...');
    html = html.replace(/Checking HTTPS security\.\.\./g, 'Memeriksa keamanan HTTPS...');
    html = html.replace(/Verifying source reliability\.\.\./g, 'Memverifikasi keandalan sumber...');
    html = html.replace(/Checking\.\.\./g, 'Memeriksa...');
    html = html.replace(/Domain verified: /g, 'Domain terverifikasi: ');
    html = html.replace(/Source reliability checked/g, 'Keandalan sumber telah diperiksa');
    html = html.replace(/Insert into article/g, 'Sisipkan ke artikel');

    // Sidebar helper and facts labels
    html = html.replace(/External source/g, 'Sumber eksternal');
    html = html.replace(/Source checking available/g, 'Pemeriksaan sumber tersedia');

    // Introduction accordion and template helpers
    html = html.replace(/<h4 style=\"margin: 0;\">Introduction<\/h4>/g, '<h4 style="margin: 0;">Pengantar</h4>');
    html = html.replace(/Typically, introduction sections have this structure:/g, 'Biasanya, bagian pengantar memiliki struktur seperti ini:');
    // Translate getIntroductionTemplate() string templates
    html = html.replace(/\[Person\\'s Name\] was born on \[Date\] and is known for \[notable achievements\]\. They are \[brief description of what makes them notable\]\./g,
      "[Person's Name] lahir pada [Date] dan dikenal karena [notable achievements]. Ia [brief description of what makes them notable].");
    html = html.replace(/\[Place Name\] is \[type of location\] located in \[geographic area\]\. It has a population of \[number\] and is known for \[key features or significance\]\./g,
      '[Place Name] adalah [type of location] yang terletak di [geographic area]. Memiliki populasi [number] dan dikenal karena [key features or significance].');
    html = html.replace(/The \[common name\] \(\[Scientific name\]\) is a \[type of organism\] that \[key characteristics\]\. It is \[distinctive features or behaviors\]\./g,
      '[common name] ([Scientific name]) adalah [type of organism] yang [key characteristics]. Memiliki [distinctive features or behaviors].');
    html = html.replace(/\[Organization Name\] is a \[type of organization\] founded in \[year\] by \[founder\]\. It \[main purpose or mission\]\./g,
      '[Organization Name] adalah [type of organization] yang didirikan pada [year] oleh [founder]. [main purpose or mission].');
    html = html.replace(/\[Term\/Concept\] is \[definition\] that \[main characteristics or applications\]\. It was \[development or discovery context\]\./g,
      '[Term/Concept] adalah [definition] yang [main characteristics or applications]. [development or discovery context].');
    html = html.replace(/\[Title\] is a \[type of work\] \[created\/written\/directed\] by \[creator\] in \[year\]\. It \[brief description of content or significance\]\./g,
      '[Title] adalah [type of work] yang [created/written/directed] oleh [creator] pada [year]. [brief description of content or significance].');
    html = html.replace(/\[Event Name\] was \[type of event\] that occurred on \[date\] in \[location\]\. It \[significance or impact\]\./g,
      '[Event Name] adalah [type of event] yang terjadi pada [date] di [location]. [significance or impact].');
    html = html.replace(/\[Topic Name\] is \[definition or description\] that \[key characteristics or significance\]\. It \[additional context\]\./g,
      '[Topic Name] adalah [definition or description] yang [key characteristics or significance]. [additional context].');

    // Update fetch paths inside the localized HTML to point to localized assets next to it
    // reliable-sources.json → <outBase>-reliable-sources.json
    html = html.replace(/fetch\('\s*reliable-sources\.json'\)/g, `fetch('${outBase}-reliable-sources.json')`);
    // article-creation-suggestions.json → <outBase>-suggestions.json
    html = html.replace(/fetch\('\s*article-creation-suggestions\.json'\)/g, `fetch('${outBase}-suggestions.json')`);
    
    // Write output
    fs.writeFileSync(outputFile, html, 'utf8');
    console.log(`✅ Successfully created ${outputFile}`);
    console.log(`📊 Size: ${Math.round(fs.statSync(outputFile).size / 1024)}KB`);
    
    // Also translate reliable-sources.json templates if it exists and the output is article-creator.html
    if (outputFile.includes('article-creator') && fs.existsSync('reliable-sources.json')) {
      console.log('📝 Updating reliable-sources.json templates...');
      const sourcesData = JSON.parse(fs.readFileSync('reliable-sources.json', 'utf8'));
      
      // Update draft templates
      if (sourcesData.draft_templates) {
        Object.keys(sourcesData.draft_templates).forEach(key => {
          if (sourcesData.draft_templates[key].stub) {
            sourcesData.draft_templates[key].stub = sourcesData.draft_templates[key].stub
              .replace(/According to \[SOURCE\], "\[TITLE\]" was reported on \[DATE\]\.\[1\] The article discusses \[TOPIC\]\./g,
                'Menurut [SOURCE], "[TITLE]" dilaporkan pada [DATE].[1] Artikel membahas [TOPIC].');
          }
        });
      }
      
      // Update warning messages
      if (sourcesData.warning_messages) {
        if (sourcesData.warning_messages.draft_notice) {
          sourcesData.warning_messages.draft_notice = 'Ini adalah DRAFT stub yang dibuat dari metadata sumber. Harap kembangkan dengan analisis Anda sendiri dan sumber tambahan sebelum dipublikasikan.';
        }
        if (sourcesData.warning_messages.review_required) {
          sourcesData.warning_messages.review_required = 'Selalu verifikasi informasi dan tambahkan konteks dari berbagai sumber terpercaya.';
        }
        if (sourcesData.warning_messages.not_ai) {
          sourcesData.warning_messages.not_ai = 'Tool ini hanya mengekstrak informasi kutipan dasar. Pengeditan manusia diperlukan.';
        }
      }
      
      // Write updated reliable-sources.json (for Indonesian version)
      const sourcesOutputFile = outputFile.replace('.html', '-reliable-sources.json');
      fs.writeFileSync(sourcesOutputFile, JSON.stringify(sourcesData, null, 2), 'utf8');
      console.log(`✅ Updated ${sourcesOutputFile}`);
    }
    
    // Also translate article-creation-suggestions.json if it exists
    if (fs.existsSync('article-creation-suggestions.json')) {
      console.log('📝 Updating article-creation-suggestions.json...');
      const suggestionsData = JSON.parse(fs.readFileSync('article-creation-suggestions.json', 'utf8'));
      
      // Update Marie Curie example
      if (suggestionsData.person && suggestionsData.person.introduction && suggestionsData.person.introduction.examples) {
        suggestionsData.person.introduction.examples.forEach(example => {
          if (example.title === 'Marie Curie') {
            example.text = 'Marie Curie (lahir Maria Salomea Skłodowska; 7 November 1867 – 4 Juli 1934) adalah seorang fisikawan dan kimiawan Polandia-Prancis yang melakukan penelitian perintis tentang radioaktivitas.';
          }
        });
      }
      
      // Write updated suggestions file (for Indonesian version)  
      const suggestionsOutputFile = outputFile.replace('.html', '-suggestions.json');
      fs.writeFileSync(suggestionsOutputFile, JSON.stringify(suggestionsData, null, 2), 'utf8');
      console.log(`✅ Updated ${suggestionsOutputFile}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
