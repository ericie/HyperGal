# Many Frogs

An infinite Frogger variation for twelve autonomous frogs at once. Every frog
acts as an independent player, weighing forward progress, nearby traffic, log
positions, lateral escape routes, and its own appetite for risk before making
each move. Frogs also reserve their routes and landing spaces, so they wait or
reroute instead of stacking or passing through one another. The twelve enter
over a brief stagger, then quickly split into
separate paths and rhythms. Before committing, a frog checks the full landing
window—including its complete path through moving traffic—and whether it will
still have a safe escape from the next lane. Fixed-color cars remain lethal
throughout a hop. River contact is checked continuously too: a log is safe,
while open water and moving alligators are immediately fatal. Boulders create
additional route-planning obstacles on grassy rows. Any frog that falls below
the camera's bottom edge is also dead.

The road has no finish line. Grass, road, and river rows are generated
deterministically as the frogs climb, and the wider camera tracks the highest
living frog. Each death leaves a permanent, colorful stain on the course. When
the twelfth frog dies, the camera pauses on the aftermath, then eases back down
the accumulated field to a new group of twelve waiting at the start.

There are no controls, labels, scores, instructions, or other visible interface.
The frogs play continuously on their own. Reduced-motion preferences remove the
hop arcs, camera easing, and death particles while preserving the simulation.

The piece is one self-contained HTML file with no runtime dependencies. Open
`index.html` directly in a modern browser.
