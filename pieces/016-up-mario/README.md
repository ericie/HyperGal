# Up Mario

A vertical platformer drawn as flat kawaii illustration in a single blue.

A small round climber in a cap starts on one cloud inside a narrow shaft of
sky and keeps moving upward through a field of them. The world is not a single
ladder of ledges: each vertical band can contain side clouds, alternate routes,
ladders, stairs, patrolling grumps, and question mark boxes.

The piece plays itself by default. He chooses a local intention: hit a nearby
question mark box from below, climb a ladder, cross a stair, jump to a
reachable cloud, or occasionally descend to revisit one with a missed box.
Ladders are always strictly vertical; ladders and stairs can be used in either
direction. Clouds begin as dark, angry-faced puffballs. Landing on one makes
it rain and brighten to white; jumping away bursts it into a spray of smaller
cloud puffs. Short hops made to hit a box keep their cloud intact.

The player can interrupt with left/right/jump input, but the work always
returns to its own climb after a short pause. There is no death screen. If he
falls out of the camera, he is pulled back to a live cloud in a burst of
sparkles and the climb continues.

## World

Clouds are generated upward from a seeded random stream. The main path is kept
within a conservative jump envelope, while branch clouds are added around it so
there is often more than one landing above. Links between clouds are generated
as vertical ladders or stairs. Question boxes attach to clouds and are only
opened when he jumps into them from underneath.

The camera only rises. Old clouds, boxes, links, grumps, and particles are
trimmed below the viewport so the piece can run indefinitely.

## Drawing

Flat fills only, no gradients anywhere. Depth is made entirely by stacking
tones from a single blue ramp of eight steps, from near-white paper to a deep
navy. The one warm note in the piece is the blush on his cheeks; set `blush`
to `C.pale` in the palette and the whole thing goes strictly monotone.

Clouds use one connected outline of oversized alternating puffs along both the
top and bottom, with a hard-edged darker underside. Their crests sit just above
the surface he stands on, so he settles into the fluff. Side walls are a
drifting bank of cloud, and the shaft edge is scalloped rather than ruled.
Untouched clouds glare at him until a landing washes the anger and darkness out
of them.

The climber is drawn from a skeleton rather than a fixed set of poses, so his
arms and legs actually swing, reach, tuck and splay: a run cycle with
counter-swinging arms and a body bob, a tuck on the way up and a splay on the
way down, squash on landing, and hand-over-hand on a ladder or stair. He blinks
on his own clock. Back limbs are drawn a tone lighter than front
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
