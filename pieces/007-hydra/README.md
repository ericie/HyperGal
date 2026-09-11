# Snake Pit

An autonomous game of traditional Snake, painted in flat cells over the memory
of every snake that came before.

A round opens with eight contenders and one mouse; the pit holds up to twenty. New snakes enter from offscreen with
random starting lengths and aggression values: higher aggression makes one chase
the mouse harder, lower aggression makes it preserve more space around its own
body and the other snakes. Success compounds quickly. A repeat winner gains
triangular growth, an increasing length bonus, a faster move interval, and an
advantage in head-to-head collisions.

The advantage is paired with judgment rather than recklessness. As a snake gets
larger, it puts increasing weight on next-turn exits, reachable area, a route
back to its moving tail, safe body clearance, and rival head threats. That
intelligence rises continuously with body length: the original leader curve is
preserved through 15 segments, then a veteran curve keeps strengthening route
judgment through roughly 60. The longest snakes preview up to seven moves and
prefer the route with the deepest proven escape. Once a snake has enough escape
room, a very long body folds into tight parallel lanes and actively fills holes
inside its own coil instead of preserving open ground. Its
free-space reserve shrinks as it matures, so the body can occupy most of the
arena—leaving only a narrow working channel—while still maintaining a route
toward its moving tail. Rather than only tightening wherever its head happens
to be, it begins adopting a looping one-cell-wide packing route after occupying
8% of the arena, reaching full commitment at 12%. That route visits every
arena cell, so an enormous body settles into continuous lanes instead of
leaving arbitrary holes. The packing route is only a guide: hunger strengthens
as the snake grows, and a useful order-preserving shortcut toward food overrides
the lane. Young snakes will still snap at any adjacent mouse; leaders run even
that bite through a size-scaled survival check, rank routes by escape quality,
and refuse a lower safety tier when a cleaner route exists. Large snakes still
hunt, but food no longer overrides an obvious cul-de-sac. Corner mice use a
direction-aware approach: a snake commits to the shortest route only after
proving it can leave the corner after the bite, preventing both nervous orbiting
and suicidal corner dives. Movement is strictly orthogonal, and turns remain
fully available whenever food, danger, or escape space makes one preferable.
During each movement tween, the body passes through the true Manhattan corner
of every turn and rounds only that compact elbow, so the continuous stroke
never cuts diagonally between grid cells. The rule set stays small:

- touching the **mouse** grows the snake and creates a new mouse,
- consecutive catches by the **same snake** grow it by 2, 4, 7, 11, ... segments,
- established leaders earn an additional length bonus and move much faster,
- larger snakes increasingly favor multi-step escape space over a tempting trap,
- in a head-to-head collision, the larger snake survives; equal lengths break randomly,
- touching the **border** kills the snake,
- touching its **own body** anywhere kills the snake,
- touching **another snake** kills one snake,
- death burns visibly from the snake's head to its tail,
- each segment the front passes is painted into the field for good,
- the last survivor pauses while its future head section blinks golden,
- after the pause, that golden head — the leading three tenths of the body, and
  at least three times the length of any offspring — becomes the heir, and the
  remaining body is divided into smaller snakes that start the next round.

## The look

Borrowed from *Snake Memories* (2025, fxhash): flat integer cells, a hard offset
shadow instead of a glow, one palette per round, and a field that remembers
its dead.

**Cells.** Every segment is a square on an integer grid. Its "glow" is the same
square drawn first, pushed down and right by a tenth of a cell, in a darker
version of its colour — or a lighter one if the colour is dark, grey if it is
black. Every living shadow goes down before any body, so a shadow never lands
on a neighbour. Only the head and the tail slide between cells; the body snaps.

**Palettes.** The multicolour palettes of Snake Memories, verbatim: retro,
neon, desert, hokusai, pastel, vaporwave, nordic, and a procedural one that
deals every snake a fresh random colour. Its five monochromes and the
black-and-white pair are left out — one hue cannot separate twenty snakes from
their own remains. One palette per round; each snake takes one swatch from it.
The golden heir is gold regardless.

**Memory.** Everything that has ever died is painted into a layer beneath the
living as flat cells in its own colour, and later deaths paint over earlier
ones. The field opens empty and fills only with what dies in play. (Snake
Memories opened on a full mosaic instead, filled before the first frame by
greedy snakes that never appear; `LOOK.prewarm` turns that on.)

Snake Memories painted its dead at full strength and let its one snake hide in
them, found by motion alone. Twenty snakes and their death fronts need to
read, so the dead are set back from the living, with two dials in `LOOK`: a
memory is desaturated halfway toward its own grey (`memoryDesaturate`, 0.5)
and pushed a little toward the ground (`memoryFade`, 0.22). The living keep
their full colour and nothing else is added to them — no outline, no head
marker. Both dials at zero is the original camouflage.

**Death.** A dying snake keeps its shape while a bright front travels from its
head to its tail — a pale cell with five sparking rays. As the front reaches
each segment, that cell is painted into the memory layer and the living cell
above it fades out, so the body crossfades from shadowed pigment into flat
memory one segment at a time. The sweep takes 0.28–0.72 seconds depending on
length. The final survivor's victory beat is unchanged: its future head section
blinks gold six times, then the body cleaves into the next field's snakes.

**The mouse** flickers, a fresh warm colour every frame.

The arena is a fixed grid of integer cells centred in the window; the margins
are the ground colour. There is no vignette, no blur, and no anti-aliased
curve anywhere: one image blit and a few hundred rectangles a frame.

## Interaction

- **Click** — reseed the board.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
