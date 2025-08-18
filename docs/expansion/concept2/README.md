# Article Section & Creation Concepts

Unified demo of VisualEditor UX concepts for section expansion and article creation.

## Live Demos (GitHub Pages)

- Hub: https://sudhanshugtm.github.io/article-section-creation/
- Section Expansion
  - Concept 1 (Overlay wizard): https://sudhanshugtm.github.io/article-section-creation/expansion/concept1/expansions.html
  - Concept 2 (Sidebar panel): https://sudhanshugtm.github.io/article-section-creation/expansion/concept2/expansions.html
- Article Creation
  - Source‑based split view: https://sudhanshugtm.github.io/article-section-creation/creation/creation.html

## Branch → Folder Mapping

- `concept-editor` → `expansion/concept1/` (overlay wizard)
- `concept-selection` → `expansion/concept2/` (sidebar panel)
- `concept-creation` → `creation/` (source‑based creation)

The GitHub Actions workflow aggregates these branches into a single Pages site.

## Local Preview

- Serve locally: `python3 -m http.server 8000` then open `http://localhost:8000/`
- Run two concepts at once (optional):
  - `git worktree add ../ve-overlay concept-editor`
  - `git worktree add ../ve-sidebar concept-selection`
  - Serve each in separate terminals on different ports.

## Deploy (GitHub Pages)

1. Push branches: `main`, `concept-editor`, `concept-selection`, `concept-creation`.
2. In GitHub → Settings → Pages → Source = GitHub Actions.
3. The workflow `.github/workflows/pages.yml` builds `/site` and deploys.

## Notes

- External assets (Codex CSS, Quill) load from CDNs; offline fallback renders but with reduced visuals.
- Article pages are static demos; publishing is mocked.
