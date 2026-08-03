# Up Mario

A vertical platformer drawn as flat kawaii illustration in a single blue.

A small round climber in a cap starts on one cloud inside a narrow shaft of
sky and keeps moving upward through a field of them. The world is not a single
ladder of ledges: each vertical band can contain side clouds, alternate routes,
ladders, stairs, poles, patrolling grumps, and question mark boxes.

The piece plays itself by default. He chooses a local intention: hit a nearby
question mark box from below, climb a ladder, cross a stair, jump to a
reachable cloud, or occasionally descend to revisit one with a missed box. A
pole can become the fast way down; ladders and stairs can be used in either
direction.

The player can interrupt with left/right/jump input, but the work always
returns to its own climb after a short pause. There is no death screen. If he
falls out of the camera, he is pulled back to a live cloud in a burst of
sparkles and the climb continues.

## World

Clouds are generated upward from a seeded random stream. The main path is kept
within a conservative jump envelope, while branch clouds are added around it so
there is often more than one landing above. Links between clouds are generated
as ladders, stairs, or poles. Question boxes attach to clouds and are only
opened when he jumps into them from underneath.

The camera only rises. Old clouds, boxes, links, grumps, and particles are
trimmed below the viewport so the piece can run indefinitely.

## Drawing

Flat fills only, no gradients anywhere. Depth is made entirely by stacking
tones from a single blue ramp of eight steps, from near-white paper to a deep
navy. The one warm note in the piece is the blush on his cheeks; set `blush`
to `C.pale` in the palette and the whole thing goes strictly monotone.

Clouds are unions of overlapping circles over a rounded slab, with a
hard-edged band of the next tone down along the underside. Their crests sit
just above the surface he stands on, so he settles into the fluff. Side walls
are a drifting bank of cloud, and the shaft edge is scalloped rather than
ruled. A few of the larger clouds are asleep, and opened boxes are content
about it.

The climber is drawn from a skeleton rather than a fixed set of poses, so his
arms and legs actually swing, reach, tuck and splay: a run cycle with
counter-swinging arms and a body bob, a tuck on the way up and a splay on the
way down, squash on landing, hand-over-hand on a ladder, both fists on a pole.
He blinks on his own clock. Back limbs are drawn a tone lighter than front
ones, which is what keeps a flat figure readable at this size.

## Controls

- Arrow keys or A/D: move.
- Space, W, or Up: jump.
- Tap/click: reseed.
- R: reseed.

## Parameters

- `?seed=<text>` - reproduce a specific run.
- `?warm=<seconds>` - open it already partway into the climb.
- `?debug` - show simulation counts, current targets, and link traversal
  counts.

Open `index.html` directly in any browser.
