# Many Frogs

An infinite Frogger variation for twelve autonomous frogs at once. Every frog
acts as an independent player, weighing forward progress, nearby traffic, log
positions, lateral escape routes, and its own appetite for risk before making
each move. Frogs also reserve their routes and landing spaces, so they wait or
reroute instead of stacking or passing through one another. The twelve enter
over a brief stagger, then quickly split into separate paths and rhythms. They
occasionally encounter flies hovering over the grass. Catching one immediately
adds three new frogs in the collector's exact pigment, placed in nearby open
spaces before joining the same route planner. Each fly can be caught only once
per run.

The frogs begin at the bottom of a broad lawn where two moving mowers create the first
hazards. More mowing rows occasionally patrol later grass sections, with clear turf
instead of boulders or flies around each machine. Before committing, a frog checks the full landing
window—including its complete path through moving traffic—and runs a rolling
three-move search across the safest future routes. The planner weighs hazard
timing, supported log positions, escape options, edge risk, obstacles, and
spaces reserved by the other frogs before every hop. Fixed-color cars remain
lethal throughout a hop. River contact is checked continuously too: a log is
safe, and frogs can ride the tail and back of a moving alligator. Only its
visibly drawn head—the final eighteen percent of its length—is lethal; open
water remains immediately fatal. Boulders create additional route-planning
obstacles on grassy rows. Any frog that falls below
the camera's bottom edge is also dead.

The road has no finish line. Grass, road, bicycle, and river rows are generated as
deterministic terrain bands, with longer grass sections separating road blocks
from river blocks. Muted green-gray bike lanes appear as occasional single-row
crossings. Their small, slower bicycles leave lighter visual gaps than cars but
still demand a timed hop. Occasional single railway crossings interrupt that rhythm.
Long, fast trains occupy most of a crossing at once, but the large interval
between trains leaves a clear window for the frogs; warning lights at both
edges of the track announce an approaching or passing train. Roads can appear
alone or in short runs, but a road never
sits directly between two water lanes. Cars are spaced widely within each road
row, leaving longer readable crossing windows between vehicles. The zoomed-back,
twenty-one-column camera reveals more of the course while tracking the highest
living frog. Each death slowly blooms into a layered watercolor
stain with a feathered edge, dried tide line, stipple, and angular event marks.
The surface then acts on the pigment. A river stain is carried downstream,
stretched along the current, increasingly blurred, and gradually washed away.
A road stain remains, but every passing vehicle flattens its pool and pulls a
new set of broken, directional tire streaks through it.
When the last frog dies, the camera pauses on the aftermath, then eases back
down the accumulated field to a new group of twelve waiting at the start.

The course, traffic, water, obstacles, and animals use a grayscale palette. The
twelve frogs use a close family of natural pigments—madder, oxblood, oxide,
umber, and plum—instead of a spectral rainbow. Every bloodstain keeps the
pigment of the frog that left it, even as water or traffic transforms the mark.

There are no controls, labels, scores, instructions, or other visible interface.
The frogs play continuously on their own. Reduced-motion preferences remove the
hop arcs, camera easing, and death particles while preserving the simulation.

The piece is one self-contained HTML file with no runtime dependencies. Open
`index.html` directly in a modern browser.
