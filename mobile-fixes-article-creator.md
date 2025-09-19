# Mobile Fixes — article-creator.html (Test-Day Notes)

This doc captures today’s iPhone 13 findings, likely causes, safe workarounds for the study, and a minimal, low‑risk fix plan. No code has been changed yet.

## Summary
- Inputs in the optional Sources step auto‑zoom on focus, making the view feel stuck zoomed in.
- Entering the editor can appear zoomed; toolbar may hide until pinching out.
- Mobile toolbar Close (X) does nothing.
- “Publish” is not visible on mobile (mobile uses a Submit arrow in the toolbar).
- A placeholder‑looking line persists in content (it’s an inserted prompt paragraph, not the transient editor placeholder).

## Observed Issues (with references)
- iOS input auto‑zoom in Sources step
  - `article-creator.html:96–116` — `#creation-stepSources .source-url-input` uses `font-size: 14px` (iOS zooms inputs < 16px).
  - `article-creator.html:694–703` — generic `.source-url-input` styles (also < 16px).
- Editor zoom on focus
  - Base body font in `reading-styles.css` is `14px` (top of file). iOS zoom heuristics are more sensitive at small base sizes.
- Mobile toolbar Close button has no behavior
  - Button exists: `article-creator.html:904` (`id="close"`), no event handler bound in script.
- Guidance drawer discovery
  - Desktop auto‑opens guidance, mobile does not: `article-creator.html:1708–1718` (only desktop calls `showGuide()` on entry).
- Duplicate IDs (modal vs wizard) — may break source verification step animations
  - Wizard steps: `article-creator.html:1008–1069` (`#step1`, `#step2`, `#step3`).
  - Source modal verification steps also use `#step1`, `#step2`, `#step3`: `article-creator.html:1114–1140`.
  - Step updates select by ID: `article-creator.html:3048–3090` (likely targets the wizard instead of the modal items).
- Step 1 keyboard layout rule nested inside another `@media` (ignored by plain CSS)
  - `article-creator.html:161–174` — `@media (max-height: 500px)` nested within `@media (max-width: 768px)`.
- Placeholder confusion in editor content
  - The transient editor placeholder is via `data-placeholder`: `article-creator.html:1070`.
  - We also inject an italic prompt paragraph as real content: `article-creator.html:2694` — looks like a “saved placeholder”.

## Test‑Day Workarounds (no code changes)
- If the Sources step zoom feels awkward, tap “Skip for now” to continue to writing.
- If the editor view is zoomed, pinch‑out once to reveal the full toolbar; the mobile “Submit” arrow is at the far right.
- To open guidance on mobile, tap the “✨” button in the mobile toolbar (it does not auto‑open like desktop).
- Close (X) currently does nothing; use browser back if needed.

## Minimal, Low‑Risk Fix Plan (post‑session)
1) Prevent iOS input zoom (CSS only)
   - Set `font-size: 16px` for interactive inputs on mobile:
     - `#creation-stepSources .source-url-input`, generic `.source-url-input`, and modal inputs like `#sourceUrl`, `#refUrl`.
   - Optionally set a 16px base on mobile for `.ve-in-step3` content to avoid zoom on editable focus.

2) Make the mobile Close (X) work (tiny JS)
   - Bind `#close` to exit editing (e.g., return to Step 2 or show a confirm). Preserve editor content in memory.

3) Keep the editor readable at mobile scale
   - Apply a mobile breakpoint to keep editor/body base font at 16px to reduce iOS auto‑zoom behavior.

4) Fix duplicate IDs in the source modal
   - Rename modal verification steps to unique IDs (e.g., `vstep1..3`) and scope selectors to the modal container.

5) Un‑nest the keyboard `@media` rule for Step 1
   - Move `@media (max-height: 500px)` to top‑level so Step 1 repositions correctly with keyboard shown.

6) Serve locally for data fetches
   - Use a simple local server to avoid fetch issues for `article-creation-suggestions.json` and `reliable-sources.json`.

## Nice‑to‑have after the study
- Distinguish “prompt paragraphs” from user content more clearly (e.g., as removable chips) or avoid injecting them as persistent text.
- Consider auto‑open guidance on first editor entry on mobile (one‑time), to aid discovery.

## Quick File References
- `article-creator.html:96–116` (Sources input font‑size)
- `article-creator.html:694–703` (Generic input font‑size)
- `article-creator.html:904` (Mobile toolbar Close button)
- `article-creator.html:1008–1069` (Wizard steps IDs)
- `article-creator.html:1088–1120` (Mobile guidance drawer markup)
- `article-creator.html:1114–1140` (Modal verification steps IDs)
- `article-creator.html:1708–1718` (Guidance auto‑open desktop only)
- `article-creator.html:3048–3090` (Verification step animations)
- `article-creator.html:161–174` (Nested `@media` rule)
- `reading-styles.css: body` (Base font-size 14px)

