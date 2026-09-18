# City of Signs

An architectural ink city: white plaster walls, solid black recesses, projecting
balconies, fine railings, small windows and working rooftops. All 22 active blocks
were redrawn from the user's two ink references on 2026-09-17, replacing the
previous graphic cutout treatment. Drawing remains procedural, 2D and black/white.

Click, tap, Enter or Space constructs another arrangement. `?seed=1907` fixes the
seed; resize recomposes the city without changing it.

## Numbered review

`?debug=true` shows all active blocks and an assembled city. Numbers 01–19 and
21–23 are stable; 20 (the rejected crane) remains absent. Anchors such as
`?debug=true#block-16` go directly to a block. `?debug=true&all=true` also shows
36 archived studies, prefixed A; these retain their historical drawings.

| Number | Redrawn subject |
|---|---|
| 01 | Glazed corner shop and recessed side entrance |
| 02 | Steel shutter and dark alley doorway |
| 03 | Tenant entrance and mail slots |
| 04 | Tenant floors and projecting blade signs |
| 05 | Connected switchback stair in a deep side court |
| 06 | Projecting balconies and fine steel guards |
| 07 | Sunlit plaster, offset windows and connected utilities |
| 08 | Staggered apartment volumes and roof terrace |
| 09 | White panelled tank on an anchored steel frame |
| 10 | Rooftop billboard and exposed bracing |
| 11 | Roof house and maintenance landing |
| 12 | Antenna, aerial cables and parapet |
| 13 | Timber shop and shallow tiled eave |
| 14 | Projecting canopy and shaded stair entry |
| 15 | Circular concrete openings and recessed glazing |
| 16 | Connected service conduits and meter cabinets |
| 17 | Alley galleries, AC clusters and shuttered bays |
| 18 | Glazed passage with straight steel ribs |
| 19 | Low tiled roof and timber gable |
| 21 | Glazed commercial tenants and slim sign tower |
| 22 | Staggered terraces and returning balcony guards |
| 23 | Rooftop ventilation and steel service platform |

## Construction

Studies share an isotropically scaled drawing kit. Thin outlines describe
construction; black is reserved for shadow planes and dark openings. Roof
proportions are capped. Stair endpoints, slab supports, equipment feet and
conduit outlets remain connected. The city uses unequal white building bays
with continuous dark side returns; whole-facade palette inversion is removed.
The retired nested court overlay is still excluded.

The 21 earlier photographs inform the subjects. The two newer architectural ink
references determine their drawing style. No reference images or raster textures
are used at runtime. Fine edge antialiasing is provided by Canvas.

## Verification

`node scripts/check-city-of-signs.mjs` checks 480 seeded layouts, all 58 drawings,
active-block reachability, stable review numbers, rejected-block exclusion,
continuous stair endpoints, finite geometry, profile fit, absence of secondary
room overlays, regeneration and resize. Browser review covers the active catalog,
desktop city and phone city. The thumbnail is the actual square seed-1907 render.

[Full ink redraw evidence](../../.impeccable/review/city-ink-redraw/README.md).
Earlier versions are retained in the sibling review folders. User review pending.
