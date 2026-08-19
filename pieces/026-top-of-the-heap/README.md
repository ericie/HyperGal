# Top of the Heap

A two-sided, self-playing arcade match built for a portrait screen. The board is
a twenty-storey pyramid of equal-size cubes. A bright ball character enters
from above, lands on the summit, and stays on the board. Its springy legs carry
it both upward and downward along the pyramid's valid cube connections. A face
looks into each jump while the body squashes on landing.

The ball reassesses the field at every landing. It always defends against the
spring-snake with the fewest jumps remaining to the summit, using distance only
to break a tie. A new leader immediately replaces a safer target. If no snake
is present, the ball finds the shortest route to a cube it has not claimed.
Every ball landing paints a cube yellow, including cubes previously claimed by
the snakes.

Wide, coiled spring-snakes attack in frequent waves. Three to five arrive in a
compact burst, share a related hue, and choose their own random routes upward.
A six-to-ten-second lull separates each group, and no more than six snakes may
occupy the board at once. Every snake landing paints its cube green, replacing
yellow territory when necessary. Every snake reserves
both its current cube and its destination. No two snakes can occupy or move
through the same square; a blocked snake bounces in place until one of its two
upward routes opens. A snake that crosses the summit leaves the board; reaching
the top is not itself a win. The scoreboard continuously reports the percentage
of cubes claimed by Yellow, claimed by Green, and still unclaimed. Yellow or
Green wins only by claiming 100% of the heap. A win flashes the screen and
starts a fresh heap. When the ball character catches a snake, its feet flatten
that attacker but do not score separately. The character never falls from the
bottom edge; it turns and climbs back into the heap. The match has no finish
line.

Press `R` to clear both scores and start a new match. With
`prefers-reduced-motion` active, hops lose their arcs, trails and particles are
removed, and the simulation runs at a slower pace.

## Archival rule

This folder is fully self-contained. It uses browser-native HTML, CSS,
JavaScript, and Canvas 2D with no external assets or dependencies.
