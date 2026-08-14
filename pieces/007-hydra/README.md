# hydra

An autonomous game of traditional Snake, glowing like a flooded 8-bit cavern.

There are five contenders and one mouse. New snakes enter from offscreen with
random starting lengths and aggression values: higher aggression makes one chase
the mouse harder, lower aggression makes it preserve more space around its own
body and the other snakes. Success compounds quickly. A repeat winner gains
triangular growth, an increasing length bonus, a faster move interval, and an
advantage in head-to-head collisions.

The advantage is paired with judgment rather than recklessness. As a snake gets
larger, it puts increasing weight on next-turn exits, reachable area, a route
back to its moving tail, safe body clearance, and rival head threats. Once it
has enough escape room, a very long snake folds into tight parallel lanes and
actively fills holes inside its own coil instead of preserving open ground. Its
free-space reserve shrinks as it matures, so the body can occupy most of the
arena—leaving only a narrow working channel—while still maintaining a route
toward its moving tail. Rather than only tightening wherever its head happens
to be, it begins adopting a looping one-cell-wide packing route after occupying
14% of the arena, reaching full commitment at 20%. That route visits every
arena cell, so an enormous body settles into continuous lanes instead of
leaving arbitrary holes. Large snakes still hunt and box opponents, but will
abandon the shortest route to the mouse when it could close a trap around
themselves. The rule set stays small:

- touching the **mouse** grows the snake and creates a new mouse,
- consecutive catches by the **same snake** grow it by 2, 4, 7, 11, ... segments,
- established leaders earn an additional length bonus and move much faster,
- larger snakes increasingly favor multi-step escape space over a tempting trap,
- in a head-to-head collision, the larger snake survives; equal lengths break randomly,
- touching the **border** kills the snake,
- touching its **own body** anywhere kills the snake,
- touching **another snake** kills one snake,
- when the snake dies, its body remains as a translucent watercolor stroke,
- living snakes drag and feather those wet remains when they cross them,
- once only one survivor remains, new contenders enter from beyond the border.

## The look

An underground Mega Man palette: near-black cavern navy, tile indigo, electric
cobalt, water cyan, mineral violet and pink, with one tiny amber energy pickup.
Living snakes are continuous, rounded bands of light rather than linked boxes.
Dead snakes accumulate underneath as broad wet-on-wet gestures: a blurred
underwash, layered translucent pigment, soft edge blooms, and long bristle trails.
Crossing marks brighten and mingle into a shared subterranean mural.

## Interaction

- **Click** — reseed the board.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
