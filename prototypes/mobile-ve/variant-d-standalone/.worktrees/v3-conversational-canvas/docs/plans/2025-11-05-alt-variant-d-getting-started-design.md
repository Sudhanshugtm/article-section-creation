# Alternative Variant D “Get Started” Concepts

## Overview
Newcomers landing in the mobile VisualEditor today face a blank canvas that offers no confidence boost. We only know the article title and wiki language from the URL, yet those two fields unlock Wikidata context and interlanguage articles we can reuse. This document captures three parallel concepts that keep the editor untouched while surrounding it with lightweight guidance so first-time editors can picture their article skeleton and feel ready to write.

## Goals
- Deliver immediate, trustworthy scaffolding derived from Wikidata and sister articles.
- Preserve the existing toolbar and editing surface for typing.
- Improve newcomer confidence metrics (“I knew what to write first”) without adding heavy friction.

## Shared Data Inputs
- Title and language code from the current URL.
- Wikidata entity label, description, and key statements (dates, people, locations).
- Sitelinks to high-quality articles in other languages with section breakdowns and references.

## Concept A: Instant Article Blueprint Modal
- Fires on load: modal summarizing topic overview, suggested outline, and reference ideas based on the fetched data.
- Primary action pins the blueprint as a collapsible side drawer; secondary actions rotate alternative outlines or dismiss help.
- Reinforces simple how-to tips (“Start with two sentences…”) while keeping the editor behind the modal pristine.

## Concept B: Step-Through Onboarding Drawer
- Bottom sheet slides up with the canvas still visible, walking users through three cards: confirm topic, shape outline, gather quick facts.
- Each card adds to a pinned checklist hovering above the keyboard; progress indicator shrinks to a pill once steps are done.
- Allows revision at any time, balancing structured guidance with quick exit for confident users.

## Concept C: Inline Smart Scaffolding
- Renders light gray placeholder sections inside the editor itself, tagged with confidence cues (“common for biographies”).
- Tapping a placeholder converts it to a standard heading and reveals contextual facts or cite actions sourced from the data inputs.
- Idle placeholders collapse into a “Need ideas?” rail after typing begins, ensuring guidance never fights the writing surface.
