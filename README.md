# Hypermedia Club

A digital art gallery where each piece is a self-contained folder of vanilla
HTML/CSS/JS. The goal: each piece runs in any browser, today and twenty years
from now, with zero external dependencies.

## Structure

- `pieces/<slug>/` — one folder per piece. Contains `index.html`, `meta.json`,
  a thumbnail, and any assets the piece needs. Open `index.html` directly to
  view.
- `pieces/_template/` — copy this to start a new piece.
- `index.html` — the master gallery. Vanilla HTML/JS, no build needed to view.
- `Issues/` — thematic magazine-like collections, starting with **Arcade**.
  Each issue has its own static page and links to existing works.
- `manifest.js` — generated list of pieces, loaded by `index.html` as a plain
  script tag so the gallery works on `file://` (no server required).
- `scripts/build-manifest.mjs` — Node script (stdlib only) that scans
  `pieces/`, works out when each piece's code last changed, and writes
  `manifest.js`.

## Adding a piece

1. Copy `pieces/_template/` to `pieces/NNN-your-slug/` (e.g. `002-tideline`).
2. Build the piece in `index.html`. Drop every asset it needs — images,
   scripts, vendored libraries, fonts — into the same folder. **No CDNs, no
   external links.**
3. Edit `meta.json` (title, publication `date`, year, type, thumbnail filename,
   and description). Three optional curatorial fields drive the gallery's
   Status and Sort controls: `"wip": true` by default until you explicitly promote it to Selected
   with `"wip": false`,
   `"rejected": true` once it is cut (rejection outranks WIP), and
   `"rating"`, a 1-100 score that is never displayed and only orders the
   Recommended sort. Unrated pieces sort below every rated one.
   Missing status fields mean WIP. Completion, ratings, and imports do not
   promote a composition; only your explicit curatorial decision does.
4. Commit the piece, then run `node scripts/build-manifest.mjs` to regenerate
   the gallery index.

## The "Updated" date

A piece shows **Updated** only when its code changed after publication. The
date comes from Git, but not from any commit that merely touched the folder:

- `thumbnail.*`, `README.md` and `meta.json` never count.
- A commit whose message contains `[chore]` never counts — use it for
  mechanical edits like dropping a tracking snippet into every piece.
- Past commits that should have been chores are listed by hash in
  `CHORE_COMMITS` at the top of `scripts/build-manifest.mjs`.
- If a piece's history is too tangled for the rules, set `"updated"` in its
  `meta.json` (`YYYY-MM-DD`); that value wins outright.

The Date sort still keys on this date, and a piece with no qualifying commit
yet sorts as if updated today so fresh work surfaces first.

## Viewing

To rebuild gallery thumbnails from the running artworks, start the preview
server and run `node scripts/build-thumbnails.mjs`. This development command
requires Playwright; use `--playwright /path/to/playwright/index.mjs` when it is
installed outside the project. Captures and backups are staged under
`output/thumbnails-<timestamp>/`. After reviewing them, install that batch with
`node scripts/build-thumbnails.mjs --output <capture-directory> --publish`.
The command preserves thumbnail filenames and composition status, embeds capture
provenance, and hides control panels only during capture. `--only <slug,slug>`
limits a rebuild to specific pieces.

- Master gallery: open `index.html` in any browser.
- Individual piece: open `pieces/<slug>/index.html` directly. Always works,
  no server, no build.

For local editing, run `python3 scripts/preview.py` and open
`http://localhost:8000/Issues/index.html`. This server sends `Cache-Control:
no-store` and returns fresh files even for conditional requests. Reload after
editing; it does not automatically reload an already-open page. Use `--port 8001`
to choose a different port.

Arcade scripts, styles, and attract preview PNGs also use content-hash query
parameters for static hosting. After changing these assets, run
`node scripts/version-arcade-assets.mjs` before publishing. It updates both
Arcade views, all four attract studies, and the landing's generated image URLs.
`node scripts/version-arcade-assets.mjs --check` checks for stale versions without
writing. Run `node scripts/check-arcade-paths.mjs` before publishing to check local HTML/CSS references against exact Git filename casing, including case collisions hidden by macOS. The canonical issue directory is `Issues/`; lowercase aliases must not be added. These helpers use only Python and Node standard libraries; viewing the
gallery still requires neither a server nor a build step.

## Linking gallery states

Gallery filters use validated query parameters: `status`, `theme`, `view`,
`sort`, and `dir`. Default values are omitted, so the unfiltered published
grid remains `/`. For example:

`/?status=wip&theme=nature&view=list&sort=alpha&dir=asc`

Filter changes create browser-history entries, and Back/Forward restores both
the results and each dropdown selection. Unrelated parameters are kept.
Every loaded or changed state is also sent to Bakalytics as a
`Gallery filter state` event with all five values in its target.

The header uses Status, Theme, and Sort dropdowns, an Issue dropdown (None or
Arcade), and a Grid/List dropdown. Sort includes both directions. Choosing Arcade
opens the issue page; None represents the gallery index.

## Constraints (the archival rule)

- Each piece is fully self-contained. If a piece uses a library (e.g.
  three.js, p5.js), the library is **copied into the piece's folder** and
  pinned forever, not linked from a CDN.
- The master index is the only place build tools are tolerated, and even
  there the output is static HTML + a generated JS file so the archive
  survives if Node, npm, or anything else rots.
- Folders starting with `_` or `.` are skipped by the indexer (used for the
  template and any work-in-progress drafts you don't want listed yet).
- Never add text or titles of any kind unless the author specifically requests it
