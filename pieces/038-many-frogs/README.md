# Many Frogs

An infinite Frogger variation for twelve autonomous frogs at once. Every frog
acts as an independent player, weighing forward progress, nearby traffic, log
positions, lateral escape routes, and its own appetite for risk before making
each move. Frogs also reserve their routes and landing spaces, so they wait or
reroute instead of stacking or passing through one another. The twelve enter
over a brief stagger, then quickly split into separate paths and rhythms. They
begin at the bottom of a broad lawn where two moving mowers create the first
hazards. Before committing, a frog checks the full landing
window—including its complete path through moving traffic—and runs a rolling
three-move search across the safest future routes. The planner weighs hazard
timing, supported log positions, escape options, edge risk, obstacles, and
spaces reserved by the other frogs before every hop. Fixed-color cars remain
lethal throughout a hop. River contact is checked continuously too: a log is safe,
and frogs can ride the back of a moving alligator, but open water and an
alligator's head are immediately fatal. Boulders create additional route-planning
obstacles on grassy rows. Any frog that falls below
the camera's bottom edge is also dead.

The road has no finish line. Grass, road, and river rows are generated as
deterministic terrain bands, with longer grass sections separating road blocks
from river blocks. Roads can appear alone or in short runs, but a road never
sits directly between two water lanes. The wider camera tracks the highest
living frog. Each death leaves a permanent, colorful stain on the course. When
the twelfth frog dies, the camera pauses on the aftermath, then eases back down
the accumulated field to a new group of twelve waiting at the start.

The course, traffic, water, obstacles, and animals use a grayscale palette. The
twelve frogs are individually colored, and every permanent bloodstain retains
the exact color of the frog that left it.

There are no controls, labels, scores, instructions, or other visible interface.
The frogs play continuously on their own. Reduced-motion preferences remove the
hop arcs, camera easing, and death particles while preserving the simulation.

The piece is one self-contained HTML file with no runtime dependencies. Open
`index.html` directly in a modern browser.
