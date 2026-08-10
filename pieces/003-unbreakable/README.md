# unbreakable

A Breakout machine running backwards.

Strip out the player, the score, and the possibility of losing, and Breakout
inverts cleanly: the paddle's job stops being *defense* and becomes *supply*.
A single paddle patrols the floor — shadowing the ball, physically incapable of
missing — and lobs it upward over and over. Where the original game chips a
brick away on contact, this one lays a brick down. An underside hit extends a
column and returns the ball to the paddle. Each trip follows one clean arc to
one chosen column and back.

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
- **The paddle always chooses a nearest low column.** Each completed column is
  excluded until the rest catch up, so the front advances in even passes while
  the ball avoids wild cross-screen routes.

Every newly completed cell advances the shared lattice upward by one column's
fraction of a brick. A bounce that cannot add a genuinely empty cell does not
move the grid. No timer or invisible boundary moves the wall.

Add `?debug` to the URL for a live overlay of frame rate, ball and paddle state,
wall hits, completed cells, front spread, missed deposits, and recoveries.

## Color

The wall uses Growth Rings' Renaissance palette: chestnut, pale brown, crimson,
peach, and eggshell against a deep aubergine field. The opening wall is loosely
randomized, while every five paddle-made bricks contain all five swatches.

## Interaction

- **Click** — rebuild the wall.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
