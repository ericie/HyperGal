# Many Mario

A self-playing vertical platform climber in a simplified anime-painted summer
sky.

A flock of floppy navy bags climbs forever through an anime-painted sky
assembled from transparent cloud banks, towers, and wisps.
Their scale, placement, reflection, and parallax change with every new seed.
Every runner favors pronounced side-to-side leaps and chooses an independent
route. Platforms can extend beyond either edge of the viewport, while
landing targets remain inside the visible area. The view is pulled back just
enough to hold a proper crowd without making the runners feel tiny.

The piece plays itself by default at a measured climbing cadence. The lead
runner chooses a local intention: jump to a reachable platform. The player can
interrupt with left/right/jump input, after which the climb resumes. The other
runners independently choose reachable surfaces, line up broad lateral jumps,
land, and look for the next step up. Each runner commits to a route while lining
up, reserves a landing point away from other runners, and replans if that
footing disappears. Recovery arcs are checked for intervening platforms so
a runner does not repeatedly jump back onto the same shelf.

## Physics

A runner coming down on another's head takes the step: it stops there, is
thrown upward harder than its own jump, and the one underneath squashes flat
for a moment. Only a falling runner can take a head, and only from above, so a
crowd sharing a ledge never sets it off. The bounce clears the rider's route so
it re-plans from its new height, which is the point -- a head is a way onto a
ledge that was otherwise out of reach, and the climb measurably gets further
because of it.

Runners carry horizontal momentum and collide while sharing a platform. Two
runners facing one another cancel their inward momentum in a stalemate. A
runner moving into another runner's back transfers momentum instead, so the
front runner can be shoved beyond the footing and fall. A runner whose center
loses a platform edge falls under gravity and can still catch a surface below.
No runner dies at the bottom edge. Runners line up on their actual footing before jumping, hold a consistent
landing point in flight, and steer toward a reachable lower ledge after a miss. If the highest bird is falling, the
camera follows that fall until another bird becomes the highest. The current
leader uses gentler steering and lingers after landing, giving the pack time to
remain in the scene.

## Hazards

Wooden barrels tumble in from above; spinning saw blades are bolted to some of
the ledges. Both knock a bag out the same way, and a knocked-out bag returns
through the same spaced, below-leader entrances as everyone else.

Runners try not to die. On the ground they read the nearest thing bearing down
on them -- the ledge's blade, a barrel rolling along it, a barrel still falling
toward it, even the amber warning marker for one about to drop -- and back away
while there is ledge to back onto. Once there is not, or the thing is too close
to outrun, they hop it and let it pass underneath. Anything moving away is
ignored, so a runner will happily fall in behind a hazard rather than flee
something already past.

In the air they have less to work with, so the important decision is made
before takeoff: a jump waits rather than commits while a barrel is anywhere
over the run. Mid-flight they lean away from a barrel sharing the air, which
rarely saves anyone outright but turns a lot of direct hits into near misses.
Jumping into a falling barrel was by a wide margin the commonest way to die
here; holding the jump roughly halved the casualty rate on its own.

### Barrels

Wooden barrels tumble in from above after a short amber arrow warning, then roll
across ledges and fall off their edges. They can wear down crumbly blocks too.
Drops are staggered, with at most three active barrels.

A barrel hit knocks a bird out with crossed eyes and a tumbling fall. Defeated
runners cannot jump, land, or lead the camera; the highest survivor takes over.
Once a defeated bird has left the screen, it can return through the same spaced,
below-leader entrances as the rest of the crowd. This includes the controllable
bird. If nobody survives, the camera holds while a fresh runner walks in.

### Saw blades

Roughly a quarter of wide, stationary ledges above the opening stretch carry a
blade that slides back and forth across the middle of the deck and spins as it
goes. It is fatal on contact.

A bladed ledge is never simply lethal. Landing points are chosen on whichever
side of the blade has more room at the moment the jump is planned, so nobody
arrives underneath one -- but the blade keeps moving during the flight, which
is where the near misses come from. On the ground, a bird that sees a blade
closing breaks off whatever it was doing and outruns it toward the end with
more footing; one already backed against a lip cuts past the blade instead.
That reaction is deliberately late, so a cornered or committed bird still gets
caught. Birds treat a bladed ledge as a slightly worse step than a clean one
and route around it when there is a choice.

## World

The course is dense: the step up the trunk is short, and most trunk steps also
throw off one or two optional branches, a second one taking the opposite side
so a pair opens two routes rather than crowding one flank. Around eighteen
platforms share the frame on a wide screen and around twenty-two on a phone.
The spacing guard is set just under the shortest trunk step, so the tighter
step can actually be placed.

Platforms are generated well above the camera from a seeded random stream.
Flat mint ledges with plum outlines and crumbly pink blocks are mixed
throughout the climb, with no altitude zones. Each shuffled group of ten
contains six solid ledges and four crumbly platforms. The starting platform is
solid. Cloud platforms were withdrawn: they did not read as footing.

About a quarter of wide solid ledges above the opening stretch drift steadily
from side to side rather than sitting still. Placement reserves the full sweep,
and a ledge that cannot fit its own travel gives up the motion instead of the
position.

A drifting ledge is its own material so it can be told from a still one at a
glance: pastel purple rather than mint, corners rounded much harder, and a
triangle at each end pointing the way it travels. Final placement reserves space for each platform
and its full movement range, including offscreen shelf extensions. Unseen optional
branches yield to the main route when they would overlap the next ledge.

Crumbly tiles crack and fall one square at a time whenever a runner stands on
them, then rebuild themselves a few seconds later so the course is worn down
rather than destroyed. Solid platforms give the runners places to gather
between the fragile steps.

The climb does not empty out behind the leader. Roughly a quarter of platforms
are generated as shelves that run off the side of the frame, and when the
visible crowd thins a runner is placed on the offscreen tail of one and simply
walks in. Nobody is ever launched into the scene through the air. Entrances must be below the highest active bird, with a full body of clearance.
Arrivals are spaced out, with at most two runners inbound at once. Each entrance
area rests for eight seconds before reuse; nearby ledges on the same side share
that cooldown. Entrances favor the opposite side when a suitable shelf is
available, and a shelf never queues another arrival while one is still walking
in. If no eligible entrance is ready, the scene waits.

An entrant waits offscreen if the leader falls below its shelf before it arrives.
Only when every established runner is knocked out or has fallen below the frame
with no reachable recovery ledge may a new entrance start above them. Waiting entrants do not lead
the camera. Existing
offscreen runners are reused before the bounded pool grows, so nobody pops into
existence in the visible scene and nobody is deleted for falling below it.

Runners pick routes using their actual jump arc and the same conservative reach
used to generate the course. They favor ledges with another step above them and
room away from the crowd. Stable individual preferences keep their routes varied.
Runners near the front pause according to the gap behind them; trailing runners
shorten that pause and favor upward progress. On crumbling bricks, everyone reacts quickly before their footing disappears. Bricks give a
short, readable crack warning before breaking. Narrow but usable ledges remain valid steps, including on
phones. A runner without an upward route can reposition onto a nearby ledge with
an onward path. They no longer make blind desperation jumps.

Drifting ledges are never used as walk-in entrances, and a shelf only offers
one if it reaches far enough past the frame to actually hide an arriving bird.

There are no spring launchers. The camera continuously follows whichever bird
is currently highest and is free to move downward as well as upward.

## Drawing

The game runs on one dependency-free canvas. Its background is composed at
runtime from three transparent anime-painted raster assets rather than one
finished backdrop. The background scrolls continuously with altitude: distant
wisps move slowly, towers at a middle speed, and the nearest cloud banks faster.
Layers repeat beyond the screen edges for an endless climb, reverse when the
camera descends, and move more gently with reduced motion enabled.
Platforms remain code-drawn so cracks, fragmentation, and impact states can animate precisely. The pastel material
colors stay soft around the navy runners. A figure has no head and no neck:
two white eyes sit high and forward on the body itself, over tiny stub arms
and stubby two-toed legs, and the body's own squash and stretch carries all
the weight.

There are three bodies -- a floppy square, a floppy round, and a floppy wedge.
All three fill the same box, so the physics footprint never changes with the
shape; only the outline does. Every edge stays bowed outward and every corner
soft, which is what keeps them floppy rather than geometric. Arm anchors and
eye positions move with the shape, since a wedge is narrow where a square is
wide.

A figure is a single flat color -- body, arms, legs and feet alike -- and every
runner draws its own shade of navy and its own body shape from a stable hash of
its id. The crowd reads as a family rather than one repeated sprite, neighbors
on a shared ledge separate from each other, and a runner keeps both traits
through a fall, a knockout and its return. They come off a hash rather than the
world rng, so adding runners cannot shift a seeded course. Ground poses
carry a pronounced step bounce; takeoff stretches the body and every landing
produces a deep squash.

## Controls

- Arrow keys or A/D: move.
- Space, W, or Up: jump.
- Tap/click: reseed.
- R: reseed.

## Parameters

- `?seed=<text>` reproduces a specific run.
- `?warm=<seconds>` opens the piece partway into the climb.
- `?debug` shows simulation counts and current targets.

Open `index.html` directly in any browser.
