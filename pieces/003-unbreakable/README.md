# unbreakable

A Breakout machine running backwards.

Strip out the player, the score, and the possibility of losing, and Breakout
inverts cleanly: the paddle's job stops being *defense* and becomes *supply*.
A single paddle patrols the floor — shadowing the ball, physically incapable of
missing — and lobs it upward over and over. Where the original game chips a
brick away on contact, this one lays a brick down. An underside hit extends a
tower and returns the ball to the paddle. A side hit fills an adjacent corridor
cell and reverses only the horizontal motion. A climbing ball keeps climbing; a
returning ball keeps falling instead of cutting through the tower.

The wall therefore grows *downward* toward the paddle and *inward* through its
own passages. Each real brick impact creeps the shared lattice upward, carrying
old bricks off the top. The opening wall already fills roughly the top
two-fifths of the screen, which shortens the ball's return cycle. It is never
finished and never breached. Unbreakable.

## Keeping it solid — and giving it shape

A single ball feeding a whole wall needs precise geometry without invisible
guard rails. Three rules keep the construction coherent without sanding all of
its character away:

- **Every brick is a real occupied cell.** Bricks store integer rows and
  columns, never freeform screen positions. Empty corridor cells have no hidden
  collision line; only a swept contact with an occupied brick can make an
  impact. As old rows leave the screen, the moving lattice completes one real
  occupied row across the top, keeping the ceiling watertight without a hidden
  boundary.
- **Brick faces behave differently.** An underside impact reserves the next
  block beneath that brick and sends the ball down. A side impact reserves the
  empty cell on the approached side while preserving the ball's vertical
  direction. In both cases the new block locks in after the ball clears it, so
  growth never embeds or teleports the ball. Corridors close behind the ricochet
  instead of opening in front of it. A top-face contact also reflects; no
  direction of travel is allowed to pass through a brick.
- **The paddle develops temporary intentions.** It now favors longer, narrow
  tower-building runs, occasionally switching to a deeper bank or repairing a
  starved column. Taller towers create the side faces that turn the upper wall
  into a reverse-Breakout pinball corridor. Tower depth has no imposed maximum.

Every brick impact advances the shared lattice upward by one column's fraction
of a brick. No timer or invisible boundary moves the wall, and tower depth has
no placement limit.

The bomb is not a power-up or a random event. It is a recovery rule for the rare
case where the ball becomes trapped in the upper brickwork and cannot fall back
down. Repeated brick impacts must remain confined to roughly two and a half rows
for more than two seconds before it arms. Ordinary corridor runs make vertical
progress and never qualify. A trapped ball stops, blinks three times, and blows
an elliptical hole through nearby occupied cells. The spent bomb then falls
through the wall without colliding; the paddle catches it and relaunches it as
the normal building ball.

Add `?debug` to the URL for a live overlay of ball, brick, front, underside-hit,
side-hit, top-hit, bomb, and pending-deposit stats.

## Color

The wall uses Growth Rings' Hokusai palette: wheat, pale yellow, Prussian blue,
Tyrian purple, and burlywood against a deep green-black field. The opening wall
is loosely randomized, while every five paddle-made bricks contain all five
swatches with the blue and purple interleaved among the warmer tones.

## Interaction

- **Click** — rebuild the wall.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
