# Top of the Heap

A two-sided, self-playing arcade match built for a portrait screen. The board is
a twenty-storey pyramid of equal-size cubes. A smiling yellow sun enters
from above, lands on the summit, and stays on the board. Golden rays surround
its round face as it bounces upward and downward along valid cube connections.
Its face looks into each jump while the sun squashes on landing.

The sun reassesses the field at every landing. It prioritizes the hazard with
the earliest possible arrival at the summit and takes a shortest route along
connected cubes toward its next landing. It avoids descending so far that it
cannot climb back before the hazards. Every defensive move uses an ordinary hop;
it never skips cubes or redirects a hop in midair. At the summit it can bounce
in place while hazards approach. If no hazard
is present, the sun finds the shortest route to a cube it has not claimed.
Every sun landing paints a cube yellow, including cubes previously claimed by
the hazards. Route choices favor fresh territory with further unclaimed neighbors
and discourage immediately retracing a hop. Normal hops take 0.35–0.43 seconds;
reduced-motion timing stays slower.

Skulls, daggers, guns, whiskey bottles, and cigarettes ride on little coiled
springs. The five symbols cycle through each wave, drawn as local Canvas shapes
without text or external images. Their palette is dark gray-brown. They bounce
between cubes, compressing and extending their springs as they land and jump.
Their shadows stay on the cubes beneath them; reduced motion removes the hops
and deformation. Three to five arrive in a
compact burst, share a related hue, and choose their own random routes upward.
A six-to-ten-second lull separates each group, and no more than six hazards may
occupy the board at once. Every hazard landing paints its cube dark gray-brown, replacing
yellow territory when necessary. Every hazard reserves
both its current cube and its destination. No two hazards can occupy or move
through the same square; a blocked hazard waits in place until one of its two
upward routes opens. The sun intercepts hazards before they reach the summit.
A yellow flag with two eyes and a simple smiling mouth is planted in the center of
the summit cube, with open space above it. Three percentages stack in the
top-left corner without labels: yellow territory, dark gray-brown territory, and purple
unclaimed territory. Yellow or dark gray-brown wins only by claiming 100% of the heap.
A win flashes the screen and starts a fresh heap. When the sun
catches a hazard, it flattens
that hazard without scoring separately. The character never falls from the
bottom edge; it turns and climbs back into the heap. The match has no finish
line.

Press `R` to clear both scores and start a new match. With
`prefers-reduced-motion` active, hops lose their arcs, trails and particles are
removed, and the simulation runs at a slower pace.

## Archival rule

This folder is fully self-contained. It uses browser-native HTML, CSS,
JavaScript, and Canvas 2D with no external assets or dependencies.
