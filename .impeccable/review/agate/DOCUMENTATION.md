# Agate documentation review

## Scope and authority

This is an ordinary gallery extension in Experience mode. `PRODUCT.md` establishes portable, dependency-free artworks with quiet gallery navigation and an individual visual language for each piece. `pieces/050-strega-nona/index.html` supplies the nearby full-canvas convention. Agate's dark polygon spirals on warm paper are specific to this artwork, not new gallery-wide tokens.

Reviewed the documentation reference at `/Users/eric-eckhardt/.agents/skills/impeccable/reference/document.md`. The scoped extension does not require a new global design system. No root `DESIGN.md` or design sidecar was created or changed.

## Evidence checked

- Read `PRODUCT.md`, the preceding piece's HTML, and Agate's HTML, JavaScript, metadata, and README.
- Visually inspected `pieces/051-agate/thumbnail.png`: irregular triangular and many-sided spirals form a tightly packed field extending through the canvas edges, with subdued dark ink and warm paper. This is a thumbnail inspection, not a live browser interaction check.
- Ran `node scripts/check-agate.mjs`: passed 23,517 coverage samples across 12 layouts, spiral containment, deterministic seeds, serial pen movement, pause, hidden-tab suspension, finish, resize, restart, and natural completion.

## Fit with the incumbent

Agate retains a full-viewport canvas, no visible interface chrome, a keyboard-focusable canvas with an accessible description, hidden instructions, a visible focus outline, a no-JavaScript explanation, and a local script. It introduces no framework, remote dependency, or network request. Its warmer paper and charcoal palette differ from Strega Nona's olive ink as permitted by the gallery's individual-piece principle. Finish (`F`) adds a useful direct path through the longer drawing sequence.

The implementation supports click/tap, Enter, or R to restart; Space to pause/resume; F to finish; and S to export PNG. One stone is drawn continuously from outside inward before the next begins. Reduced motion completes immediately. Resizing recomposes at the new dimensions and restores approximate progress; hidden tabs and completed drawings stop scheduling animation frames.

## README accuracy

The geometry, controls, deterministic seed option, paper grain, direct-file use, reduced motion, and lifecycle descriptions match the implementation. The documented speed is the configured 280 CSS pixels per second; elapsed time is capped at 50 ms per animation frame, so stalls do not cause large jumps. The test description matches the supplied script's coverage. Browser download behavior and the thumbnail's capture provenance were not independently exercised by this documentation pass.

No piece documentation edit is needed.

## Preexisting drift

Root `DESIGN.md` is absent. This was known before this extension and does not authorize global system work. The working tree also contains existing modifications to other gallery pieces and untracked prior review/artwork files; none were changed or treated as Agate regressions by this review.

## Update: simultaneous growth

The user requested multiple starting points. Agate now uses 6–16 pens based
on viewport area (6 at 390 × 844; 12 at 1440 × 900). Starting stones are
spread across the canvas, and each pen grows a nearby cluster. Each stone
still receives a single continuous inward stroke. The earlier references to
serial pen movement describe the original version and are superseded here.
README, accessible instructions, metadata and the Agate manifest entry now
reflect simultaneous growth. The finished geometry and thumbnail are unchanged.

Re-ran `node scripts/check-agate.mjs`: 23,517 coverage samples across 12
layouts plus concurrent starts, spatial distribution, unique pen ownership,
pause/resume, hidden-tab suspension, resize progress, finish and natural
completion passed. Inspected desktop and mobile captures five seconds into
growth (`desktop-multiple-pens.png`, `mobile-multiple-pens.png`); clusters
are drawing at multiple positions across both screens. Browser pause/resume
and finish checks passed with no console errors.
