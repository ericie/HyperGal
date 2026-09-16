# City of Signs — photographic detail pass

2026-09-16. The user supplied 21 Tokyo facade, street and equipment photos and
asked to retain flat 2D, black-and-white geometric drawing while restoring
architectural personality.

## Changes

- Rebuilt sliding windows with nested frames, tracks, varied curtain/closed infill.
- Rebuilt AC housings with circular fans behind fine grilles, casing seams and
  proportioned feet. Recessed balconies now combine slabs, rails and privacy panels.
- Quiet service walls use offset windows, bars, vents and connected pipe routes.
- Added eight blocks: noren shop, stepped marquee, paired round bays, tiled conduit
  wall, louvered alley facade, glazed ribs, tile eaves and construction crane.
- All eight participate in the composer. There are 23 active blocks and 33 archived
  studies; 56 drawings total. No photo assets, colors or lettering were introduced.

## Verification

`node scripts/check-city-of-signs.mjs` passed 480 seeded layouts and all 56 catalog
blocks, with 3,881,185 finite drawing calls. The existing checks cover deterministic
layout, active-block reachability, narrow/curved profile fit, court bounds, fan
clearance, ground-only entrances, regeneration and resize.

Live Chrome inspection covered desktop, square and 390×844 phone views, catalog,
alternate seed 420, keyboard and click regeneration. No page console errors were
reported. The first visual check caught missing inverted backgrounds in new bases
and overlong condenser feet; both were corrected together. Roof proportions were
also capped so the catalog presents a shallow roof instead of a stretched gable.
Temporary viewport overrides were cleared after checks.

## Files

- `before.js`: previous Tokyo pass.
- `after.js`: current photo-inspired renderer.
- `mobile.png`: 390×844 CSS pixels, seed 1907.
- `square.png`: 1200×1200 CSS pixels, seed 1907; source of gallery thumbnail.
- `desktop-seed-420.png`: alternate desktop composition.
- `catalog.png`: full active catalog.

This is a reviewable attempt, not a claim of user acceptance. The vertical bay
organization, large fan motif and shared-court repetition are still present.
