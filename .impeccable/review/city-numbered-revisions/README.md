# City of Signs — numbered revisions

2026-09-17. Implements the user's debug review of 03, 05, 09, 11, 15 and 20–23.

| Review number | Revision |
|---|---|
| 03 | Recessed tenant lobby, double doors, mailboxes and intercom replace the basement entry |
| 05 | Flights share exact landing endpoints; continuous steel stair route |
| 09 | Tank panels, hatch, ladder and pipework; braced supports meet the roof slab |
| 11 | Access-house walls, door and AC feet meet a common roof slab |
| 15 | Right round windows redrawn as framed glass; detached rectangular strip removed |
| 20 | Crane removed from renderer and catalog |
| 21 | Public stair and upper concourse replace fan |
| 22 | Stepped apartment terraces with continuous rear wall replace swell |
| 23 | Roof duct bank and screened deck replace striped vessel |

Numbers remain stable: 01–19, 21–23. There are 22 active drawings and 36 archived
studies (58 total). Fan, swell and vessel survive only in the explicitly requested
full archive; they cannot be selected by the city. Curved building profiles are
no longer generated. Active figures have permanent anchors such as `#block-21`.

`node scripts/check-city-of-signs.mjs` passed 480 layouts and 58 catalog drawings,
3,802,042 finite drawing calls, and new assertions for rejected-block exclusion,
review-number stability and stair endpoint continuity across sizes/variants.
Existing checks cover composition bounds, determinism, reachability, shared-court
clearance, click/keyboard regeneration and resize.

Browser review covered the numbered catalog, desktop seed 420, phone 390×844 seed
420, and square seed 1907. The first inspection prompted one correction: joining
22's stacked floors with a continuous rear wall. Confirmation captured the final
catalog and phone view; no console errors were reported. Emulation was cleared.

- `before.js` / `after.js`: prior and revised renderer.
- `catalog.png`: complete active catalog.
- `mobile.png`: seed 420, 390×844 CSS pixels.
- `desktop.png`: seed 420, normal desktop viewport.
- `square.png`: seed 1907, 1200×1200 CSS pixels; thumbnail source.

This is a revision for user review, not a claim of acceptance. The vertical bay
framework and shared-court repetition remain.
