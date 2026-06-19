# unbreakable

A Breakout machine running backwards.

Strip out the player, the score, and the possibility of losing, and Breakout
inverts cleanly: the paddle's job stops being *defense* and becomes *supply*.
Here a row of paddles patrols the floor — one shadowing each ball, each one
physically incapable of missing — and lobs a swarm of balls upward. Where the
original game chips a brick away on contact, this one lays a brick down. The
wall is built from below by the things that would have destroyed it.

Because every hit adds a brick to the underside, the wall grows *downward*,
toward the paddles. So the whole world is scrolled upward to keep the
build-front off the floor, and old bricks stream off the top. The wall is
never finished and never breached. Unbreakable.

## Keeping it solid

A loose swarm of balls feeding one shared wall wants to drift into gaps and
spikes — and, worse, a column that grows too far down can trap a ball against
the floor and run away to infinity. Two simple rules prevent all of that
without any feedback controller:

- **The front lives in a band.** Every column's build-front is hard-clamped to
  a band well above the paddles. A column can't run away downward — it stops
  depositing at the band's floor — and it can't empty out — it keeps depositing
  at the band's ceiling. Because the band sits far above the floor, the wall can
  never reach the paddles. This is the safety rail that makes it *unbreakable*.
- **Balls steer to the hungriest column.** On each paddle bounce a ball aims its
  small horizontal lean toward whichever nearby column has been starved longest
  — the one whose front has drifted highest. Deposits self-level into a flat
  front instead of piling into towers. A little noise stops the whole swarm
  stampeding the same gap.

A steady upward scroll then carries finished bricks off the top. Deposition and
scroll find their own loose equilibrium inside the band, whatever the screen
size or ball count.

Add `?debug` to the URL for a live overlay of ball, brick, and front stats.

## Interaction

- **Click** — reshuffle the palette and rebuild the wall.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
