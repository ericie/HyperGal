# hydra

An autonomous game of traditional Snake, glowing like a flooded 8-bit cavern.

There are twenty contenders and one mouse. New snakes enter from offscreen with
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
- abstract cross-hatching appears segment by segment wherever the body recedes,
- the last survivor pauses while only its first two segments blink golden,
- after the pause, the golden head becomes a two-segment heir and the remaining
  body is divided into the small snakes that start the next round.

## The look

An underground Mega Man palette: near-black cavern navy, tile indigo, electric
cobalt, water cyan, mineral violet and pink, with one tiny amber energy pickup.
Living snakes are continuous, rounded bands of light rather than linked boxes.
The final survivor freezes for a short victory beat while its two-segment head
blinks six times between its original palette and a warm, luminous gold. At the
end of the beat, the whole winning body cleaves into the next field: the head
becomes a permanently golden heir, and every remaining segment is distributed
across as many contiguous offspring as the twenty-snake field allows. No outside
contenders enter. One-segment offspring carry enough latent growth to establish
a short body as they move. Reduced-motion mode replaces the blink with an
immediate golden head and a short static pause.
On death, a bright sparking front travels down the body. Each segment crossfades
directly from living pigment into dry, desaturated cross-hatching as the front
passes it, but the full sweep now finishes in 0.28–0.72 seconds with a wider
overlap between neighboring segments. The untouched body is drawn as one stroke,
and completed hatch marks cache their masks and batch their lines into six paths
instead of rebuilding hundreds of strokes every frame. The overlapping diagonal
marks are clipped through a single smoothed ribbon around the whole corpse curve,
forming one woven, abstract silhouette with no segment joints, skulls, ribs, or
other literal anatomy. They remain fixed when a living snake crosses them,
turning the arena into a layered subterranean drawing.

## Interaction

- **Click** — reseed the board.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
