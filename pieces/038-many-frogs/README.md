# Many Frogs

A close view of one lane of traffic. A finite group starts evenly split between
the two banks, attempts one crossing, and leaves through the far side when successful.
A surviving count decreases only when a frog is hit. There are no return
journeys, replacements, labels, or controls.

## Crossing

The single lane fills the middle 78% of the viewport, with 11% grass banks
above and below. Five logical rows are projected into those bands. Horizontal
scale remains one fifth of the viewport height, while vertical positions use
a matching inverse projection. Hops interpolate in screen space so frogs take
normal-sized steps across the wide road and narrow banks.

A finite group of `clamp(ceil(columns * 7 / 2) * 2, 24, 112)` frogs starts together
with half on each bank, facing the road. All are visible immediately and can begin crossing after a
short individual hesitation of 0.12–1.32 seconds. No frogs are released later or
replaced. Frogs may overlap freely while waiting and crossing.

The only visible text is a bare surviving count on the upper bank. It starts
at the number of frogs in the group and decreases once per traffic death.
Successful crossings and exits do not reduce it. Resize preserves the group
and count; a new round resets both.

Each frog chooses among up, down, left, right, and wait moves.
Each hop covers 9–12% of the road height and takes 0.24 seconds, requiring
roughly nine to twelve jumps to cross the road. Continuous landing
positions, boldness, and patience
produce different attempts. Hops stay strictly horizontal or vertical, without
sideways or vertical drift. The planner uses a three-move look-ahead with beam
width five. Cars travel in one direction through the single lane. Each car has
its own deterministic body size, length, entry time, and speed. Body sizes vary
from 0.72 to 1.28 times the base shape and desired speeds from 2.4 to 6.2 scale
units per second. Entries are spaced about 2.7 seconds apart with timing variation.
A faster follower's travel speed is capped when necessary to preserve a 0.35-unit
gap until its predecessor leaves the visible road. The resulting per-car
trajectory is shared by drawing, planning, and collision detection.

Cars use a transparent top-down schematic with neutral outlines for the body,
tires, roof, windows, and hood. Death marks remain visible through them.
Drivers look 1.4 seconds ahead for crossing frogs, steer toward the clearer side,
and return toward the center afterward. Waiting frogs on the bank do not trigger
evasion. Steering is gradual, stays inside the road, and can still fail to avoid
a collision. The body turns with its lateral movement.

Collision checks use each car's translated and rotated footprint, with sampled
steering forecasts for future landing windows. The bounded traffic cache retains
256 profiles; old longitudinal profiles can be reconstructed deterministically.
Actual hop positions are checked throughout an attempt.

Reaching the far bank records one success. The frog keeps its original crossing direction and
walks out through the opposite edge; it is then retired without making a death mark.
Traffic hits end an attempt immediately and leave a stationary impression.
Rocks, flies, reproduction, return targets, and repeated crossings are absent.

## Marks

Frogs leave no movement trails, pause deposits, or revisit marks. A frog's body
becomes more vivid with survival, using maturity `1 - exp(-age / 12)`. It starts
at 0.24 tile body scale and grows once on crossing successfully, before leaving
through the opposite edge.

Each traffic death leaves one small X at the hit position in the frog's color.
Every X has the same size and stroke weight, with no splatter, bloom, texture,
or particles. Cars neither smear nor collect these marks. The most recent
640 marks are retained. Resize rebases live frogs and marks. Hidden tabs pause
the round without time catch-up.

The piece is one self-contained HTML file with no renderer dependencies. Open
`index.html` directly in a modern browser. Reduced-motion mode makes hops
immediate while retaining the simulation.

## Verification

Run `node scripts/check-many-frogs.mjs` from the repository root. It checks the
78% single-lane layout, per-car size/speed variation, following gaps, swept
collisions, a finite initial group and death-only countdown, single-pass success
and exit in both directions, traffic deaths, cardinal-only hops, neutral
cars, stationary X marks, retained death marks, visibility, responsive resize,
counter-only visible text, and normal/reduced-motion lifecycle.

Add `--benchmark` for a seeded 60-second simulation-only timing run. This excludes
browser rasterization. Historical timing results elsewhere in the repository
predate this single-lane version.
