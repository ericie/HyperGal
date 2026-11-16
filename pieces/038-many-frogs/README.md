# Many Frogs

A Frogger variation on one fixed screen with a continuous stream of autonomous
frogs entering from the bottom edge. A field runs along the bottom, a field runs along the top, and a
road band between them takes eighty percent of the screen height. Every frog acts as an
independent player, weighing progress in its own heading, nearby traffic,
lateral escape routes, and its own appetite for risk before making each move.
Frogs also reserve their routes and landing spaces, so they wait or reroute
instead of stacking or passing through one another. They occasionally encounter
flies hovering over the fields. Catching one immediately adds three new frogs in
the collector's exact pigment, placed in nearby open turf before joining the
same route planner. Each fly can be caught only once per run.

New frogs enter on a timed cadence, independently of wins, deaths, or surviving
frogs. The interval is `clamp(48 / columns, 0.9, 1.8)` seconds. Entrants use
varied horizontal positions and reserve a clear landing space; a crowded entry
retries after 0.15 seconds. Live population is limited to
`clamp(round(columns * 1.2), 24, 80)` to keep the simulation bounded. Dead bodies
are retired while their pigment histories remain. Flies can still add offspring
within the same population limit.

The crossing never ends. Reaching the opposite edge at any horizontal position
counts as one completed crossing, grows the frog, and reverses its heading.
The survivor then shifts along that safe bank to a new departure column at least
24% of the board width away (and at least two tiles). It favors that relocation
before entering traffic again, so successive crossings use different columns.
Newborns start at 0.24 tile body scale; wins increase it with diminishing steps,
using `0.24 + 0.065 * sqrt(crossings)`. Spawning and resting at an edge do not
count as wins. There are no visible counters, markers, controls, or other text.

Before committing, a frog checks the full landing window—including its complete
path through moving traffic—and runs a rolling three-move search across the
safest future routes. The planner weighs hazard timing, escape options, edge
risk, boulders, shore relocation, and spaces reserved by the other frogs before
every hop. Cars remain lethal throughout a hop.

The board uses tiles close to twenty-two pixels. Rows come in groups of ten and
the tile fits their total to the screen height, keeping the road at exactly 80%
and each field at 10%. At 1440 × 900 the board has sixty-four columns, forty rows,
and thirty-two road lanes. Lanes alternate heading down the band, and pace and
gaps are drawn per row so no two read as one moving block. Gaps are wide—a frog
has dozens of lanes to thread and needs a readable window in every one. Boulders
create route-planning obstacles on the fields, clear of the two turnaround rows.
Each frog leaves a persistent, irregular pigment path along its actual movement,
including partial hops and retreats. Paths begin as barely deposited pigment.
Survival strengthens the whole existing route, broadening its wash and deepening
its pigment. Density follows maturity squared, making early marks much fainter
while allowing long-lived frogs to build strong routes. The frog itself becomes
more vivid in the same hue. Age follows a gradual curve with a thirty-second
time constant; newborns start from their family's original pigment. A dead
frog's route freezes at its final strength and remains as later frogs arrive.

Each death slowly blooms into a stationary layered watercolor stain with a
feathered edge, dried tide line, stipple, and angular event marks. Longer-lived
frogs leave larger death splashes, approaching 3.8 times a newborn's linear
splash size. Passing cars leave paths and splashes untouched and stay pale.
Arrivals continue on the same cadence even after the last living frog dies;
there is no cohort reset or aftermath pause.

The drawing uses a ghost field-print language. Every surface, machine, and
obstacle starts in whites and light grays at low contrast. Frogs, their marks,
and their death splashes supply all color. The view stays
overhead, but each solid rises off the ground on one shallow isometric angle: it
keeps the footprint the simulation gave it, sweeps walls up to a lit face offset
toward the same corner, and casts one soft print away from the light. Cars are simplified overhead silhouettes with one pale body, one window, and
a small soft shadow. They have no tires, lamps, raised cabins, or surface marks.
Boulders taper as they rise and take facets on the lit cap. The turf keeps mown
bands and scattered clover, and the road keeps polished wheel tracks and patched
seams. Frogs have narrow anatomical bodies and articulated folded legs, without
smiles or white eye discs. Fixed substrate pits, irregular contours, incised
lines, and worn road paint belong to the objects and terrain instead of
flickering over the screen. The frogs use a close family of natural
pigments—madder, oxblood, oxide, umber, and plum—instead of a spectral rainbow.
Every bloodstain keeps the pigment of the frog that left it.

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

Terrain impressions are cached per row as rasters. Each stationary death
impression is printed to a small offscreen canvas once and reused. The latest
640 stains are retained, bounding long-running history. The path
archive retains up to 128 routes, retiring completed routes first, with at most
1,024 turning points per route. Straight movement extends a segment rather than
storing every frame. Sample geometry is cached, and the combined path impression
refreshes at most ten times per second. Resize rebases stored routes and rebuilds
the impression. Vehicles outside the viewport are skipped before drawing.
Hidden tabs stop animation frames completely and resume without catching up.

Run `node scripts/check-many-frogs.mjs` from the repository root for layout,
collision, continuous arrivals before any win, changing departure columns,
growth per winning pass, wordless rendering, path density buildup,
stationary pigment under traffic, pale cars, shuttle turnaround, cache,
visibility, resize, and lifecycle checks.
Add `--benchmark` for a seeded 60-second simulation-only timing run.
`--baseline=/path/to/old/index.html` compares an earlier self-contained version
and verifies the same final state. The timing test does not measure browser
rasterization; an earlier version's live sample of update plus draw at 1440 × 900 recorded
a 2.6 ms median, 3.4 ms p95, and 6.3 ms worst frame over 1940 frames.
