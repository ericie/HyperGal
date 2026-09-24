# Many Frogs

A Frogger variation on one fixed screen, played by a couple of dozen autonomous
frogs at once. A field runs along the bottom, a field runs along the top, and a
road band between them takes sixty percent of the height. Every frog acts as an
independent player, weighing progress in its own heading, nearby traffic,
lateral escape routes, and its own appetite for risk before making each move.
Frogs also reserve their routes and landing spaces, so they wait or reroute
instead of stacking or passing through one another. They occasionally encounter
flies hovering over the fields. Catching one immediately adds three new frogs in
the collector's exact pigment, placed in nearby open turf before joining the
same route planner. Each fly can be caught only once per run.

The crossing never ends. A frog enters at the bottom edge, works its way up
through the band, and the moment it reaches the top edge it turns around and
works its way back down. Bottom to top to bottom, for as long as it survives. A
frog's own heading decides which vertical move counts as forward, so the same
planner carries it in both directions. Before committing, a frog checks the full
landing window—including its complete path through moving traffic—and runs a
rolling three-move search across the safest future routes. The planner weighs
hazard timing, escape options, edge risk, boulders, and spaces reserved by the
other frogs before every hop. Cars remain lethal throughout a hop.

The board is sized from the viewport at a fixed twenty-two-pixel tile, so it
fills the screen edge to edge and the whole course is visible at once: roughly
sixty-five columns and forty rows on a wide display, with two dozen road lanes
between the fields. Lanes alternate heading down the band, and pace and gaps are
drawn per row so no two read as one moving block. Gaps are wide—a frog has two
dozen lanes to thread and needs a readable window in every one of them. Boulders
create route-planning obstacles on the fields, clear of the two turnaround rows.
Each death slowly blooms into a layered watercolor stain with a feathered edge,
dried tide line, stipple, and angular event marks. A stain stays where it fell,
and every passing vehicle flattens its pool and pulls a new set of broken,
directional tire streaks through it, so the road slowly becomes a record of the
crossing. When the last frog dies, the piece holds on the aftermath for a beat
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

There are no controls, labels, scores, instructions, or other visible interface.
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
offscreen canvas once, so drawing each stain is a single image operation instead
of dozens of paths every frame. The latest 640 stains are retained across
cohorts, bounding long-running history. Vehicles outside the viewport are
skipped before any path is built. Hidden tabs stop animation frames completely
and resume without catching up.

Run `node scripts/check-many-frogs.mjs` from the repository root for layout,
collision, shuttle-turnaround, cache, visibility, resize, and lifecycle checks.
Add `--benchmark` for a seeded 60-second simulation-only timing run.
`--baseline=/path/to/old/index.html` compares an earlier self-contained version
and verifies the same final state. The timing test does not measure browser
rasterization; a live browser sample of update plus draw at 1440 × 900 recorded
a 2.6 ms median, 3.4 ms p95, and 6.3 ms worst frame over 1940 frames.
