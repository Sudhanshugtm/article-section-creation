# Version 1: "Instant Smart Guess"

## Overview
Version 1 builds on variant-d by adding **proactive intent detection** that appears immediately when users land on the visual editor. Instead of requiring users to discover the `/` command, Version 1 intelligently guesses the article type based on the title and presents a smart suggestion upfront.

## Key Difference from Variant-D
**Variant-D**: User must type `/` to discover category selection
**Version 1**: Smart guess banner appears immediately on page load

## User Journey: Creating "Tiger Cricket Academy" Article

### Step 1: Page Load (Smart Guess Appears)
```
URL: ?title=Tiger_Cricket_Academy&lang=en&veaction=edit
```

**Smart Guess Banner shows:**
```
🏏 Creating article: Tiger Cricket Academy

I found this is a cricket training organization.
Use organization article template?

[✓ Yes, use template]  [Choose different type]
```

### Step 2A: User Clicks "Yes, use template" (1 tap)
- Banner smoothly fades away
- Organization template loads automatically
- User sees introduction section with guidance
- All sections available to add progressively (Overview, History, Operations, Impact)
- Full variant-d functionality active (examples, citations with cricket-specific sources)

### Step 2B: User Clicks "Choose different type" (2 taps)
- Banner fades away
- Category selector bottom sheet opens
- User can browse/search all article types
- Same as variant-d's `/` command behavior

## Technical Implementation

### HTML Changes
- Added `#smartGuessBanner` element before canvas
- Changed title from "New Article" to "Bengal Tiger"
- Uses Codex button components for consistency

### CSS Changes (`variant-d.css`)
- Added `.smart-guess-banner` styles at end of file (lines 2231-2317)
- Smooth slide-down animation on load
- Smooth fade-out animation on dismiss
- Mobile-responsive button layout

### JavaScript Changes (`variant-d.js`)
- Added `initSmartGuessBanner()` function (lines 2598-2649)
- Simulates Wikidata lookup for "Tiger Cricket Academy"
- "Accept" button triggers `selectGranularType()` directly with organization template
- "Choose different" button opens `openCategorySelector()`
- All existing variant-d functionality preserved
- Cricket-specific citation sources automatically shown

## Files Modified
1. `variant-d.html` - Added smart guess banner HTML
2. `variant-d.css` - Added smart guess banner styles
3. `variant-d.js` - Added smart guess banner logic

## Design Principles Honored

### From Pau's Feedback:
✅ **Reduce friction**: 1 tap instead of discovering `/` command
✅ **Leverage title + language**: Simulates Wikidata lookup
✅ **Canvas stays sacred**: Banner disappears after choice
✅ **Template-based, not examples**: Uses same template system as variant-d
✅ **Progressive disclosure**: Sections add one at a time

### From Sudhanshu's Requirements:
✅ **Variant-d quality level**: Full functionality preserved
✅ **Mobile-first**: Bottom sheets, touch-friendly buttons
✅ **Species article**: Bengal Tiger template included
✅ **Complete journey**: User can finish entire article

## How to Test

### Option 1: Open directly
```bash
open variant-d.html
```

### Option 2: Local server
```bash
# From this directory
python3 -m http.server 8080

# Visit:
http://localhost:8080/variant-d.html
```

### Expected Behavior:
1. Page loads showing "Tiger Cricket Academy" title
2. Smart guess banner appears immediately with 🏏 cricket icon
3. Click "Yes, use template"
4. Banner fades, organization template loads
5. Introduction section appears with guidance box for organizations
6. Can add sections progressively (Overview, History, Operations, Impact)
7. Can see examples, add citations (cricket-specific sources like ESPNCricinfo)
8. Can publish article

## Future Enhancements (Not in V1)

- **Real Wikidata integration**: Actual API lookup instead of hardcoded
- **More article types**: Currently optimized for species, could detect biographies, places, etc.
- **Confidence scoring**: Show different UI if match confidence is low
- **Recent history**: Remember user's past article types
- **Language-specific templates**: Different templates for different wikis

## Comparison with Other Versions

| Feature | Variant-D | Version 1 | Version 2 | Version 3 | Version 4 | Version 5 |
|---------|-----------|-----------|-----------|-----------|-----------|-----------|
| Smart guess | ❌ | ✅ Banner | 🔄 Planned | 🔄 Planned | 🔄 Planned | 🔄 Planned |
| Discovery method | `/` command | Auto + `/` | TBD | TBD | TBD | TBD |
| Taps to start | 3-4 | 1 | TBD | TBD | TBD | TBD |

---

**Version**: 1.0 ("Instant Smart Guess")
**Base**: Variant-D (Nov 2024)
**Author**: Based on feedback from Pau Giner & Sudhanshu Gautam
**Date**: November 5, 2024
