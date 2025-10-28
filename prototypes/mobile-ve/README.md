# Mobile VisualEditor Outline Prototype Playground

## Quick Start
1. From the repository root, run `python3 -m http.server 8000`.
2. Visit `http://localhost:8000/article-creator.html`.
3. Use the prototype links banner near the top to open Variant A/B/C.

## Variant Overview
- **Variant A – Onboarding overlay:** full-screen pre-edit setup with type selection and tips.
- **Variant B – Bottom sheet guide:** persistent guidance accessible through a banner and floating pill.
- **Variant C – Inline outline cards:** section suggestion cards embedded directly in the document.

## Notes
- Toolbar buttons are mocked; focus is on outline guidance flows.
- Shared data for article types lives in `shared-data.js` for easy iteration.
- Best viewed using mobile device emulation (e.g., iPhone SE) to mirror on-wiki proportions.
