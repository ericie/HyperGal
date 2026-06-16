# HyperGal

A digital art gallery where each piece is a self-contained folder of vanilla
HTML/CSS/JS. The goal: each piece runs in any browser, today and twenty years
from now, with zero external dependencies.

## Structure

- `pieces/<slug>/` — one folder per piece. Contains `index.html`, `meta.json`,
  a thumbnail, and any assets the piece needs. Open `index.html` directly to
  view.
- `pieces/_template/` — copy this to start a new piece.
- `index.html` — the master gallery. Vanilla HTML/JS, no build needed to view.
- `manifest.js` — generated list of pieces, loaded by `index.html` as a plain
  script tag so the gallery works on `file://` (no server required).
- `scripts/build-manifest.mjs` — Node script (stdlib only) that scans
  `pieces/` and writes `manifest.js`.

## Adding a piece

1. Copy `pieces/_template/` to `pieces/NNN-your-slug/` (e.g. `002-tideline`).
2. Build the piece in `index.html`. Drop every asset it needs — images,
   scripts, vendored libraries, fonts — into the same folder. **No CDNs, no
   external links.**
3. Edit `meta.json` (title, year, type, thumbnail filename, description).
4. Run `node scripts/build-manifest.mjs` to regenerate the gallery index.

## Viewing

- Master gallery: open `index.html` in any browser.
- Individual piece: open `pieces/<slug>/index.html` directly. Always works,
  no server, no build.

## Constraints (the archival rule)

- Each piece is fully self-contained. If a piece uses a library (e.g.
  three.js, p5.js), the library is **copied into the piece's folder** and
  pinned forever, not linked from a CDN.
- The master index is the only place build tools are tolerated, and even
  there the output is static HTML + a generated JS file so the archive
  survives if Node, npm, or anything else rots.
- Folders starting with `_` or `.` are skipped by the indexer (used for the
  template and any work-in-progress drafts you don't want listed yet).
