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
intelligence rises continuously with body length: safety tolerance tightens,
the required escape pocket grows, and lookahead deepens from two moves to seven
through roughly 60 segments. Safety tier and proven survival depth are applied
before food distance, so a mature snake takes a longer route instead of entering
a short trap. There is no density reward, space-filling route, or packing mode:
every snake hunts the mouse directly from the survivable routes available to
it. Hunger strengthens with body length, but food cannot override an obvious
cul-de-sac. Corner mice use a
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
- the last survivor freezes and blinks its entire original-colour body five times,
- after a final visible hold, the leading three tenths of the body — at least
  three times the length of any offspring — becomes the heir, and the remaining
  body divides into smaller snakes that start the next round,
- the heir keeps the winner's exact colour; the final fragment takes the next
  swatch in the active palette, and every fragment between them is an even RGB
  interpolation from the head colour to that palette endpoint.

## The look

Borrowed from *Snake Memories* (2025, fxhash): flat integer cells, a hard offset
shadow instead of a glow, one palette per round, and a field that remembers
its dead.

**Cells.** Every segment is a square on an integer grid. Its "glow" is the same
square drawn first, pushed down and right by a tenth of a cell, in a darker
version of its colour — or a lighter one if the colour is dark, grey if it is
black. Every living shadow goes down before any body, so a shadow never lands
on a neighbour. Every square slides between cells, while square-width
orthogonal joins keep the snake continuous through each bend. The grid stays
crisp without either snapping or breaking the body into loose squares.

**Palettes.** The control panel offers neon, vaporwave, and hokusai, with Neon
selected by default. A chosen palette stays locked across reseeds. After a win,
the split forms a colour ramp from the winner to the next swatch in that
palette.

**Memory.** Everything that has ever died is painted into a layer beneath the
living as crosshatched cells in its own colour. Each corpse gets its own loose,
hand-drawn hatch: wandering strokes, uneven pressure and opacity, varied angles
and spacing, and occasional lifted gaps. Five extremely tight stroke families
are always used, with a sixth appearing at random. The individual lines are
finer so the nearly doubled weave stays visibly hatched instead of becoming a
solid fill. Later deaths accumulate over earlier ones instead of erasing
them, making overlaps visibly denser and multicoloured. Like Snake Memories,
the field now opens on a full mosaic, filled before the first frame by greedy
snakes that never appear. A final clipped hatch pass closes any isolated gaps
without delaying the first frame. Set `LOOK.prewarm` to `false` to start empty
instead.

Snake Memories painted its dead at full strength and let its one snake hide in
them, found by motion alone. Here the prebaked field is almost fully desaturated
toward grey (`prewarmDesaturate`, 0.9) and darkened toward the ground
(`prewarmFade`, 0.32). An actual death keeps much more of its colour
(`memoryDesaturate`, 0.2; `memoryFade`, 0.08), so its dense crosshatched body
remains readable during the extinction sweep and in the history it leaves
behind. The living remain solid and fully coloured — no outline, no head
marker.

**Death.** A dying snake keeps its shape while a bright front travels from its
head to its tail — a pale cell with five sparking rays. The body is crosshatched
for the whole sweep; as the front reaches each segment, that cell is transferred
into permanent memory beneath it. The sweep takes 0.28–0.72 seconds depending
on length. The final survivor freezes and blinks as one complete silhouette in
its own colour five times, holds visibly for a beat, then cleaves into the next
field's palette-ramped snakes. Reduced-motion mode replaces the flashes with a
short steady hold before the split.

**The mouse** takes one fresh warm colour each time it spawns and rapidly toggles
on and off while remaining exactly one grid cell. Reduced-motion mode keeps it
continuously visible.

The arena is a fixed grid of integer cells that slightly overdraws the viewport;
the outer cells are clipped evenly so snakes and painted memory run all the way
to every screen edge with no ground-colour border. There is no vignette, no
blur, and no anti-aliased curve anywhere: one image blit and a few hundred
rectangles a frame.

Hunting takes priority at every size: if a survivable route to the mouse is
available, the snake chooses its shortest first step. Even the youngest snake
refuses an adjacent bite with no exit. When every computed mouse route is
unsafe, the snake falls back to escape depth and open exits rather than field
coverage.

## Interaction

- **Palette option** — lock that palette and immediately reseed the board.
- **Hide / Show** — collapse or reveal the palette panel.
- **Click the field** — reseed with the currently selected palette.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
