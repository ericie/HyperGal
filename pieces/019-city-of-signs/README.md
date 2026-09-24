# City of Signs

An architectural ink city: white plaster walls, solid black recesses, projecting
balconies, fine railings, small windows and working rooftops. All 22 active blocks
were redrawn from the user's two ink references on 2026-09-17, replacing the
previous graphic cutout treatment. Drawing remains procedural, 2D and black/white.

Click, tap, Enter or Space constructs another arrangement. `?seed=1907` fixes the
seed; resize recomposes the city without changing it.

## Numbered review

`?debug=true` shows all active blocks and an assembled city. Facade studies are
drawn at the city's bay width and show the tile repeating; a ground floor or a
roof is drawn at one bay, because at city scale either is too small to review.
Each specimen is sized in units, so a one-storey entrance is not stretched to
fill its cell. Numbers 01–19 and
21–23 are stable; 20 (the rejected crane) remains absent. 05 was redrawn on
2026-09-24: the rejected switchback stair is replaced by a scaffolded facade.
24–39 were added the same day. There are 38 active blocks: 9 street entrances,
21 occupied floors and 10 rooftops.
Anchors such as `?debug=true#block-16` go directly to a block.
`?debug=true&all=true` also shows 36 archived studies, prefixed A; these retain
their historical drawings.

| Number | Redrawn subject |
|---|---|
| 01 | Glazed corner shop and recessed side entrance |
| 02 | Steel shutter and dark alley doorway |
| 03 | Tenant entrance and mail slots |
| 04 | Tenant floors and projecting blade signs |
| 05 | Tube scaffold lifts over a facade under repair |
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
| 24 | Projecting box windows and shallow hoods |
| 25 | Open drying decks and airing poles |
| 26 | Glass block panel and ventilation louvres |
| 27 | Vending machines and covered bicycle stand |
| 28 | Lantern bar front and hanging noren |
| 29 | Roof planters and glazed growing frame |
| 30 | Bolted capsule rooms and single round lights |
| 31 | Stacked lightbox signs and service slot |
| 32 | Exposed seismic bracing and glazed bays |
| 33 | Tiled spandrels and horizontal window bands |
| 34 | Planted balconies and trailing greenery |
| 35 | Bathhouse gable and split noren |
| 36 | Counter shop with extract duct and stools |
| 37 | Rooftop sign pylon and open steel frame |
| 38 | Roof shrine and fenced gravel platform |
| 39 | Cooling towers and fan decks |

## Bays

Drawing size no longer follows building width. A bay is 100 drawing units wide,
and one bay is the same number of pixels for every building in a composition, so
a window, a balcony rail, an air conditioner and a door are the same size on a
narrow building as on a broad one. Buildings are a whole number of bays: narrow
ones are a single bay, broad ones two or three. The bay is sized for the canvas
first and the buildings follow from it, so the drawing keeps its grain rather
than getting finer as buildings multiply — the city draws few buildings large
rather than many small. `?bay=0.16` overrides how coarse it reads; the default
is 0.24 of the shorter canvas edge, which gives a 295px bay across three
buildings on a 1200px square and a 203px bay across five at 1440x900.

A single-bay building draws its floors from every chamber that fits one bay, so
slim buildings differ from one another. Broad buildings draw from twenty stacks
and three feature facades, which spread over the broad buildings one each; a
small canvas holds fewer broad buildings than there are features, so which ones
appear rotates with the seed.

A block draws one bay and is repeated across its building. Only the outer bays
carry edges: the first draws the left edge line and the last draws the dark party
return, so repeated bays connect and the building closes correctly at both ends.
Each repeat takes its own variant, so a facade changes its window infill and
service hardware across its width instead of printing one tile again. Roof
furniture repeats every second bay over a parapet that runs the whole roof,
which is why a broad building carries two ordinary tanks rather than one giant
one. Storey height, lift height and equipment size are absolute units, so they
hold their proportions however tall a building becomes.

## Construction

Studies share an isotropically scaled drawing kit. Thin outlines describe
construction; black is reserved for shadow planes and dark openings. Roof
proportions are capped. Scaffold decks, slab supports, equipment feet and
conduit outlets remain connected. The city uses whole-bay white buildings with
continuous dark side returns; whole-facade palette inversion is removed.
The retired nested court overlay is still excluded.

The 21 earlier photographs inform the subjects. The two newer architectural ink
references determine their drawing style. No reference images or raster textures
are used at runtime. Fine edge antialiasing is provided by Canvas.

## Verification

`node scripts/check-city-of-signs.mjs` checks 480 seeded layouts, all 74 drawings,
active-block reachability, stable review numbers, rejected-block exclusion,
a single bay width shared by every building in a composition, whole-bay building
widths, continuous scaffold decks, finite geometry, profile fit, absence of
secondary room overlays, regeneration and resize. Browser review covers the active catalog,
desktop city and phone city. The thumbnail is the actual square seed-1907 render.

[Uniform bay scale evidence](../../.impeccable/review/city-bay-scale/README.md).
[Block 05 replacement evidence](../../.impeccable/review/city-block-05/README.md).
[Full ink redraw evidence](../../.impeccable/review/city-ink-redraw/README.md).
Earlier versions are retained in the sibling review folders. User review pending.
