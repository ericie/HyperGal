# Obstacles and How to Avoid Them

A responsive browser obstacle drawing built from simple instructions.

Borderless Hokusai-toned walls, squares, and circles are placed by a set of
adjustable gestalt forces. Scale controls the overall obstacle footprint, with a
much larger maximum, while Scale variety controls the distance between slivers
and frame-dominating forms. Implied line builds one dominant broken continuation
from walls; proximity forms clusters and voids; closure suggests an incomplete
arc; off-page lets major walls continue beyond the frame. A small control panel
turns each force on or off and sets its strength, while Count controls how many
obstacles enter the composition and Lines sets the field-line density. The panel
can be dragged by its header or collapsed to keep the drawing unobstructed.

Walls vary between vertical, horizontal, and diagonal orientations, with
independent aspect ratios that range from compact bars to long, thin spans.
Squares and circles interrupt their directional rhythm. Open safe zones protect
the left and right edges, redirecting off-page continuation through the top and
bottom. Generous shape-to-shape clearance keeps the composition open.
Proximity reserves part of the composition for contact groups: at higher
strengths, shapes in the same group touch or overlap into clear stacks, while
unrelated shapes retain the full minimum clearance. This avoids accidental
sliver corridors between merely-near forms.
Irregularly spaced, fine field lines share long wave phases and flow through
continuous cubic curves around rounded influence envelopes rather than tracing
each silhouette's angles. They compress into dense bundles in tight passages,
retain that displacement downstream, and slowly fan back out when space returns.
Small colored boids travel each path from left to right, revealing the line in
their wake at a steady physical speed, including through large vertical detours.
A translucent vision cone projects from each boid. Its leading edge stops against
an obstacle just as the boid begins to turn, making the avoidance mechanic
visible. Each boid has its own vision length as well as its own steering response,
turn radius, bounded lane clearance, route choice, and recovery rate. Boids use
distinct local avoidance tracks instead of collapsing onto one shared clearance
line. Any route the solver cannot keep continuous is discarded rather than drawn
as an abrupt connector. Every trail runs on an independent draw, linger, fade,
and rest cadence,
so paths continually reappear across the field like rain rather than arriving in
one batch. Reduced motion displays the complete static field.

Click, tap, Space, or Enter to reseed the arrangement. Add `?seed=<value>` to
the URL for a repeatable starting composition.

Open `index.html` directly in any browser.
