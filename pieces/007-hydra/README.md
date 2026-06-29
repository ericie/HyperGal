# hydra

An autonomous game of snake, painted like an Apple //e amber monitor.

A snake hunts the nearest mouse. Its pathfinding is greedy and **blind to its own
body**, so a long snake chasing a mouse that sits behind it will curl around and
run into its own tail — and where the head strikes the body, the snake **splits
into two**, each piece becoming a snake that hunts on its own. Cut the hydra and
it doubles.

The cull is the **heads**: when two snakes try to move onto the same cell, one of
them dies. When a head strikes another snake's *body*, the hit snake splits as
if its own head had struck that segment. So:

- **mice** lengthen snakes,
- **body strikes** divide the hit snake,
- **head-on collisions** thin them,

and the number of snakes breathes up and down forever without a player ever
touching it. A fragment too short to be a snake simply dies; the field is capped
so it never floods, and floored so it never empties.

## The look

A single **amber phosphor** on black, the way lo-res graphics smeared on an //e's
CRT: blocky cells, a soft glow, blinking mice, a bright-eyed head, scanlines, a
touch of flicker, and a soft vignette. Splits and deaths leave a quick amber ring.

## Interaction

- **Click** — reseed the board.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
