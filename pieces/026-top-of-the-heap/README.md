# Top of the Heap

A two-sided, self-playing arcade match built for a portrait screen. The board is
a twenty-storey pyramid of equal-size cubes. A bright ball character enters
from above, lands on the summit, and stays on the board. Its springy legs carry
it both upward and downward along the pyramid's valid cube connections. A face
looks into each jump while the body squashes on landing.

The ball reassesses the field at every landing. It always defends against the
spring-snake with the fewest jumps remaining to the summit, using distance only
to break a tie. A new leader immediately replaces a safer target. If no snake
is present, the ball finds the shortest route to an unlit cube instead. Every
cube has only two states: off and on. A landing turns an off cube on and never
advances it to a third color.

Wide, coiled spring-snakes attack in waves. One or two arrive in a compact
burst, share a related hue, and choose their own random routes upward. A sixteen-
to-twenty-two-second lull separates each group, and no more than three snakes may
occupy the board at once. This gives the hunter time to resume lighting cubes
between attacks while leaving enough simultaneous routes for one snake to break
through. Every snake reserves
both its current cube and its destination. No two snakes can occupy or move
through the same square; a blocked snake bounces in place until one of its two
upward routes opens. The ON side scores only by lighting every cube in the
pyramid. The OFF side scores only when a snake reaches the summit. Either win
flashes the screen and replaces the board with a new two-state palette. When the
ball character catches a snake, its feet flatten that defender but do not score
separately. The character never falls from the bottom edge; it turns and climbs
back into the heap. The match has no finish line.

Press `R` to clear both scores and start a new match. With
`prefers-reduced-motion` active, hops lose their arcs, trails and particles are
removed, and the simulation runs at a slower pace.

## Archival rule

This folder is fully self-contained. It uses browser-native HTML, CSS,
JavaScript, and Canvas 2D with no external assets or dependencies.
