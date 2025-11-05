# 5 Versions of Intent Discovery for Wikipedia Visual Editor

## Overview
This directory contains **5 experimental variations** of variant-d that explore different approaches to reducing friction in article type discovery for mobile Wikipedia article creation. Each version maintains full variant-d functionality while implementing a unique approach to upfront intent capture.

## Quick Comparison

| Version | Approach | Taps to Start | Upfront UI | Best For |
|---------|----------|---------------|------------|----------|
| **V1: Smart Guess** | Proactive banner asks for confirmation | 1 | Dismissible banner | Transparency + trust |
| **V2: Floating Bar** | Persistent ambient bar, auto-loads template | 0 | Sticky bar | Speed + reference |
| **V3: Conversational** | Friendly in-canvas dialogue | 1 | Chat bubble | Newcomer warmth |
| **V4: Zero-Tap** | Invisible intelligence, silent loading | 0 | None (toast on interaction) | Power users + speed |
| **V5: Hybrid** | Smart shortcuts + "/" command coexist | 1 or manual | Shortcut chips | Diverse users |

## Version Details

### Version 1: "Instant Smart Guess"
**Location**: `.worktrees/v1-smart-guess/`

**What it does**: Proactive banner appears on page load asking: "I found this is a cricket training organization. Use organization article template? [Yes] [Choose different]"

**Philosophy**: **Transparency first** - explicitly ask permission before loading template

**Advantages**:
- Clear, understandable interaction
- User maintains full control
- High trust / low presumption
- Easy to reject and choose alternative

**Disadvantages**:
- Requires 1 tap (not zero-tap)
- Banner takes up screen space temporarily
- Feels like interruption

**When to use**: First-time editors, low-confidence detection, communities valuing consent

---

### Version 2: "Floating Smart Bar"
**Location**: `.worktrees/v2-floating-bar/`

**What it does**: Persistent floating bar at top showing "Article type: 🏏 Cricket organization ▾". Template auto-loads after 800ms. Bar remains visible and clickable throughout editing.

**Philosophy**: **Ambient intelligence** - assume guess is correct, provide persistent reference and escape hatch

**Advantages**:
- Zero taps required
- Always visible as reminder
- Easy to change type anytime
- Clean, professional appearance

**Disadvantages**:
- Adds permanent UI element
- Slightly reduces canvas space
- Presumes guess is correct without asking

**When to use**: High-confidence detection, power users who want quick reference, desktop editors

---

### Version 3: "Conversational Canvas"
**Location**: `.worktrees/v3-conversational-canvas/`

**What it does**: In-canvas dialogue with avatar and speech bubble: "Hi! I noticed you're creating an article about Tiger Cricket Academy. It looks like a cricket training organization. Is that right? [Yes, that's right] [Not quite]"

**Philosophy**: **Human connection** - friendly assistant that asks naturally, builds trust

**Advantages**:
- Warm, personable tone
- Reduces user anxiety
- Natural language feels less robotic
- Integrated into editing space

**Disadvantages**:
- Takes up more space than other approaches
- More text to read (cognitive load)
- Dialogue might feel patronizing to experts
- No persistent reference after dismissal

**When to use**: Newcomers, wikis with friendly culture, scenarios prioritizing comfort over speed

---

### Version 4: "Zero-Tap Intelligence"
**Location**: `.worktrees/v4-zero-tap/`

**What it does**: Absolutely no upfront UI. Template loads silently in background after 1 second. Subtle toast appears on first user interaction: "💡 Smart template loaded! I've prepared an organization article structure for you."

**Philosophy**: **Invisible intelligence** - get completely out of the way, reveal benefits through discovery

**Advantages**:
- Zero taps, zero friction
- Canvas completely clean on load
- Maximum respect for writing space
- Feels like magic

**Disadvantages**:
- No transparency about what's happening
- Presumes guess is correct
- User might miss the toast
- No persistent reference to article type

**When to use**: Power users, high-confidence detection, speed-critical scenarios, mobile users

---

### Version 5: "Hybrid Slash + Upfront"
**Location**: `.worktrees/v5-hybrid/`

**What it does**: Smart shortcut chips at top: "Quick start: [🏏 Cricket organization] [🔍 Browse all types]". Shortcuts coexist with "/" command. User chooses their preferred path.

**Philosophy**: **Multiple pathways** - don't force one approach, let users choose what fits them

**Advantages**:
- Serves diverse user base
- Preserves "/" command for power users
- Shortcuts for speed, browse for discovery
- Backwards compatible with variant-d
- High user control and flexibility

**Disadvantages**:
- Not as fast as V4 (requires 1 tap)
- Not as clean as V4 (has visible UI)
- Multiple paths might confuse some users
- Slightly more complex than pure approaches

**When to use**: Diverse users, A/B testing, gradual rollout, wikis valuing user choice

---

## Design Principles Spectrum

### Transparency ←→ Efficiency
- **High transparency**: V1 (explicit ask), V3 (conversational)
- **Balanced**: V5 (clear shortcuts)
- **High efficiency**: V2 (auto-load + bar), V4 (silent load)

### Control ←→ Speed
- **High control**: V1 (explicit choice), V5 (multiple paths)
- **Balanced**: V3 (friendly ask)
- **High speed**: V2 (0 taps + persistent), V4 (0 taps invisible)

### Persistent ←→ Dismissible
- **Persistent UI**: V2 (floating bar stays)
- **Dismissible UI**: V1 (banner), V3 (dialogue), V5 (shortcuts)
- **No upfront UI**: V4 (zero-tap)

## Testing All Versions

### Quick Test (Open Directly)
```bash
# Version 1
open .worktrees/v1-smart-guess/variant-d.html

# Version 2
open .worktrees/v2-floating-bar/variant-d.html

# Version 3
open .worktrees/v3-conversational-canvas/variant-d.html

# Version 4
open .worktrees/v4-zero-tap/variant-d.html

# Version 5
open .worktrees/v5-hybrid/variant-d.html
```

### Local Server Testing
```bash
# From variant-d-standalone directory
python3 -m http.server 8080

# Then visit:
# http://localhost:8080/.worktrees/v1-smart-guess/variant-d.html
# http://localhost:8080/.worktrees/v2-floating-bar/variant-d.html
# http://localhost:8080/.worktrees/v3-conversational-canvas/variant-d.html
# http://localhost:8080/.worktrees/v4-zero-tap/variant-d.html
# http://localhost:8080/.worktrees/v5-hybrid/variant-d.html
```

## Common Features (All Versions)

All versions maintain full variant-d functionality:
- ✅ Tiger Cricket Academy article example
- ✅ Organization template (Overview, History, Operations, Impact sections)
- ✅ Cricket-specific citation sources (ESPNCricinfo, ICC, etc.)
- ✅ Section-by-section guidance and examples
- ✅ Bottom sheet UI patterns
- ✅ Mobile-responsive design
- ✅ "/" command for manual category selection (except V4 where it's still available)
- ✅ Progressive disclosure of sections
- ✅ Template-based with placeholders
- ✅ Category taxonomy system
- ✅ Complete edit-to-publish journey

## Files Modified Per Version

Each version modifies exactly 3 files:
1. `variant-d.html` - UI structure
2. `variant-d.css` - Styling and animations
3. `variant-d.js` - Interaction logic

Plus each has:
4. `README-VX.md` - Comprehensive documentation

## Selection Guide: Which Version to Use?

### Use **Version 1** if:
- Transparency is your top priority
- Users are mostly newcomers
- Community values explicit consent
- Algorithm confidence is variable
- You want clear cause-and-effect

### Use **Version 2** if:
- Speed is important but not critical
- Users value persistent references
- Desktop users dominate
- Algorithm confidence is high
- You want professional, minimal UI

### Use **Version 3** if:
- User comfort is top priority
- Community culture is friendly/welcoming
- Users are mostly newcomers
- Building trust is critical
- You don't mind warmer tone

### Use **Version 4** if:
- Speed is absolute top priority
- Users are experienced/power users
- Algorithm confidence is very high
- Canvas cleanliness is critical
- You're okay with low transparency

### Use **Version 5** if:
- User base is very diverse
- You want to A/B test approaches
- Backwards compatibility matters
- User choice and control are valued
- You want gradual rollout

## User Research Questions

When testing these versions, ask:

**Effectiveness**:
- Did you understand what the system was suggesting?
- Did you feel confident accepting/rejecting the suggestion?
- Did the template help you get started faster?

**Preference**:
- Which version felt most comfortable?
- Which felt too pushy or presumptuous?
- Which gave you the right amount of control?

**Context**:
- Does your preference change on mobile vs desktop?
- Does it change based on article type complexity?
- Does it change based on your Wikipedia experience level?

## Implementation Roadmap

**Phase 1**: User test all 5 versions with diverse participants
**Phase 2**: Measure quantitative metrics (time to first edit, completion rate, template acceptance rate)
**Phase 3**: Analyze qualitative feedback (comfort, trust, clarity)
**Phase 4**: Select 2-3 strongest candidates for broader testing
**Phase 5**: A/B test winners in production
**Phase 6**: Iterate based on real usage data

## Technical Notes

### Shared Dependencies
All versions share:
- `chrome.css` - Wikipedia chrome styling
- `shared-data.js` - Article blueprints and type taxonomy
- Codex design system (via CDN)
- `concepts/` directory for concept testing framework

### Independent Deployment
Each version is **fully standalone** and can be deployed independently without affecting others. They can also be A/B tested against each other in production.

### Wikidata Simulation
All versions currently simulate Wikidata lookup with hardcoded results for "Tiger Cricket Academy" → "Cricket organization". In production, this would be replaced with actual Wikidata API calls.

## Philosophy Summary

These 5 versions represent different answers to the fundamental question:

**"How do we help users without presuming to know what they want?"**

- **V1**: Ask them explicitly
- **V2**: Assume but show them what we assumed
- **V3**: Ask them conversationally
- **V4**: Don't ask, just help invisibly
- **V5**: Offer shortcuts but preserve manual path

No single answer is universally correct. The right choice depends on:
- User expertise level
- Algorithm confidence
- Community culture
- Platform constraints (mobile vs desktop)
- Product priorities (speed vs trust vs control)

---

**Created**: November 5, 2024
**Base**: Variant-D (Nov 2024)
**Author**: Based on feedback from Pau Giner & Sudhanshu Gautam
**Purpose**: Exploration / Ideation for user testing

**Next Steps**: User test → Data analysis → Selection → Iteration
