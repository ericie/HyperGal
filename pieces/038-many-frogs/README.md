# Many Frogs

A Frogger variation on one fixed screen, played by a couple of dozen autonomous
frogs at once. A field runs along the bottom, a field runs along the top, and a
road band between them takes eighty percent of the screen height. Every frog acts as an
independent player, weighing progress in its own heading, nearby traffic,
lateral escape routes, and its own appetite for risk before making each move.
Frogs also reserve their routes and landing spaces, so they wait or reroute
instead of stacking or passing through one another. They occasionally encounter
flies hovering over the fields. Catching one immediately adds three new frogs in
the collector's exact pigment, placed in nearby open turf before joining the
same route planner. Each fly can be caught only once per run.

The crossing never ends. Each frog has two small pigment-colored counters in its
own column, one at the top and one at the bottom. Both begin at zero. A frog enters
at the bottom edge, works its way up through the band, then steers to its own top
counter. Touching it records one arrival and turns the frog toward its bottom
counter; touching that records a return. Each end counts independently, with no
repeated increments while a frog rests on it. Offspring receive their own paired
counters. Bottom to top to bottom, for as long as each frog survives. A
frog's own heading decides which vertical move counts as forward, so the same
planner carries it in both directions. Before committing, a frog checks the full
landing window—including its complete path through moving traffic—and runs a
rolling three-move search across the safest future routes. The planner weighs
hazard timing, escape options, edge risk, boulders, and spaces reserved by the
other frogs before every hop. Cars remain lethal throughout a hop.

The board uses tiles close to twenty-two pixels. Rows come in groups of ten and
the tile fits their total to the screen height, keeping the road at exactly 80%
and each field at 10%. At 1440 × 900 the board has sixty-four columns, forty rows,
and thirty-two road lanes. Lanes alternate heading down the band, and pace and
gaps are drawn per row so no two read as one moving block. Gaps are wide—a frog
has dozens of lanes to thread and needs a readable window in every one. Boulders
create route-planning obstacles on the fields, clear of the two turnaround rows.
Each death slowly blooms into a layered watercolor stain with a feathered edge,
dried tide line, stipple, and angular event marks. Passing vehicles lift pigment
out of the pool and pull a continuous, softened wash in the direction of traffic.
Repeated passes lengthen the trail, flatten and dilute the original impression,
and blend overlapping pigments into the asphalt. Fine tire grain sits inside
the wash. The road slowly becomes a record of the crossing. When the last frog
dies, the piece holds on the aftermath for a beat
and a new cohort enters at the bottom.

The drawing uses a ghost field-print language. Every surface, machine, and
obstacle is printed in whites and light grays at low contrast, so the frogs and
the marks they leave are the only real color on the board. The view stays
overhead, but each solid rises off the ground on one shallow isometric angle: it
keeps the footprint the simulation gave it, sweeps walls up to a lit face offset
toward the same corner, and casts one soft print away from the light. Cars carry
a cabin raised off the hood with glass facing the camera and lamps at the nose;
their finest marks drop away once a car is only a few dozen pixels long.
Boulders taper as they rise and take facets on the lit cap. The turf keeps mown
bands and scattered clover, and the road keeps polished wheel tracks and patched
seams. Frogs have narrow anatomical bodies and articulated folded legs, without
smiles or white eye discs. Fixed substrate pits, irregular contours, incised
lines, and worn road paint belong to the objects and terrain instead of
flickering over the screen. The frogs use a close family of natural
pigments—madder, oxblood, oxide, umber, and plum—instead of a spectral rainbow.
Every bloodstain keeps the pigment of the frog that left it.

The only visible text is the requested pair of arrival counts for each frog.
Counts remain after death and reset when the next cohort starts. If a larger
cohort is resized onto a narrow screen, counter columns spread evenly in the
same left-to-right order to stay legible.
The frogs play continuously on their own. Reduced-motion preferences remove the
limb extension and death particles while preserving the simulation.

The piece is one self-contained HTML file with no runtime dependencies. Open
`index.html` directly in a modern browser.

## Performance

Terrain definitions and obstacles are cached, and a resize clears them because
the board size decides the layout. Traffic clearance is solved over the complete
swept interval of each landing window; the planner never allocates a full row of
traffic for each sample. Distant frog reservations are rejected before predicting
their positions. The three-move look-ahead remains.

Terrain impressions are cached per row as rasters. Pigment is printed to a small
offscreen canvas once; a tire pass rebuilds a bounded blend raster. Both
impressions are reused between passes instead of drawing dozens of paths every
frame. There is no five-car limit on working a stain. The latest 640 stains are retained across
cohorts, bounding long-running history. Vehicles outside the viewport are
skipped before any path is built. Hidden tabs stop animation frames completely
and resume without catching up.

Run `node scripts/check-many-frogs.mjs` from the repository root for layout,
collision, paired counter contact, directional pigment transfer, shuttle
turnaround, cache, visibility, resize, and lifecycle checks.
Add `--benchmark` for a seeded 60-second simulation-only timing run.
`--baseline=/path/to/old/index.html` compares an earlier self-contained version
and verifies the same final state. The timing test does not measure browser
rasterization; an earlier version's live sample of update plus draw at 1440 × 900 recorded
a 2.6 ms median, 3.4 ms p95, and 6.3 ms worst frame over 1940 frames.
