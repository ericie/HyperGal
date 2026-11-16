# unbreakable

A Breakout machine running backwards.

Strip out the player, the score, and the possibility of losing, and Breakout
inverts cleanly: the paddle's job stops being *defense* and becomes *supply*.
A single paddle patrols the floor — shadowing the ball, physically incapable of
missing — and lobs it upward over and over. Where the original game chips a
brick away on contact, this one lays a brick down. An underside hit extends a
column and returns the ball to the paddle. Each trip follows one clear arc to
one reachable column and back.

The wall grows *downward* toward the paddle. Each newly completed brick creeps
the shared lattice upward, carrying old bricks off the top. The opening wall
already fills roughly the top two-fifths of the screen, which shortens the
ball's return cycle. It is never finished and never breached. Unbreakable.

## Keeping it solid — and level

A single ball feeding a whole wall needs precise geometry without invisible
guard rails. Three rules keep the construction coherent without sanding all of
its character away:

- **Every brick is a real occupied cell.** Bricks store integer rows and
  columns, never freeform screen positions. Empty corridor cells have no hidden
  collision line; only a swept contact with an occupied brick can make an
  impact. Every column starts on the same row. As old rows leave the screen,
  the moving lattice completes one real occupied row across the top, keeping
  the ceiling watertight without a hidden boundary.
- **The exposed front is the only collision surface.** An underside impact
  reserves the next block beneath that column and sends the ball down. The new
  brick locks in only after the ball clears its cell, so growth never embeds or
  teleports the ball.
- **The build alternates between regional runs and catch-up passes.** Sustained
  runs favor a patch on the left, center, or right, allowing sections to build
  about four rows ahead before lower columns catch up. The front stays broadly
  level without requiring every row to finish first. Shots need clear outgoing
  and return paths; recessed columns can send the ball back along its incoming
  arc to clear raised neighbors instead of building those neighbors higher.

Every newly completed cell advances the shared lattice upward by one column's
fraction of a brick. A bounce that cannot add a genuinely empty cell does not
move the grid. No timer or invisible boundary moves the wall.

## Color

The color moves gradually through tertiary hues, starting at orange and
advancing three degrees per completed brick, circling the hue wheel every 120
bricks. Each brick independently randomizes its HSV saturation between 38–72%
and brightness between 60–95%, giving the gradient lighter, darker, muted, and
richer shades. The opening wall uses the same gradient against a deep aubergine
field. Existing bricks keep their colors as the wall scrolls. The ball and
paddle take the next brick's color when the ball launches, with no ball trail.
Click to rebuild and restart the hue sweep with fresh saturation and brightness.

## Interaction

- **Click** — rebuild the wall.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
