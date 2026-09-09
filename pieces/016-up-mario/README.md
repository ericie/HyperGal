# Many Mario

A self-playing vertical platform climber in a simplified anime-painted summer
sky.

A family of fat, bouncy, two-eyed silhouettes climbs forever through an
anime-painted sky assembled from transparent cloud banks, towers, and wisps.
Their scale, placement, reflection, and parallax change with every new seed.
Every runner favors pronounced side-to-side leaps and chooses an independent
route. Platforms can extend beyond either edge of the viewport, while
landing targets remain inside the visible area. The view is pulled back just
enough to hold a proper crowd without making the runners feel tiny.

The piece plays itself by default at a measured climbing cadence. The lead
runner chooses a local intention: jump to a reachable platform. The player can
interrupt with left/right/jump input, after which the climb resumes. The other
runners independently choose reachable surfaces, line up broad lateral jumps,
land, and look for the next step up.

## Physics

Runners carry horizontal momentum and collide while sharing a platform. Two
runners facing one another cancel their inward momentum in a stalemate. A
runner moving into another runner's back transfers momentum instead, so the
front runner can be shoved beyond the footing and fall. A runner whose center
loses a platform edge falls under gravity and can still catch a surface below.
No runner dies at the bottom edge. A Mario with no route makes one desperate
physical jump instead of waiting forever. If the highest Mario is falling, the
camera follows that fall until another Mario becomes the highest. The current
leader uses gentler steering and lingers after landing, giving the pack time to
remain in the scene.

## World

Platforms are generated well above the camera from a seeded random stream. Four
altitude zones repeat through the climb: stable black ink lines; square brick
tiles that crack and fall one square at a time whenever a runner stands on them,
then rebuild themselves a few seconds later so a course is worn down rather than
destroyed; trapdoors with a triggering lever on the ledge above; and cloud
platforms that shed painted chunks into drifting particles on every landing.

A trapdoor is ordinary ground until its lever is thrown. Runners stand and walk
on a closed one indefinitely, and landing on one does nothing. Throwing the lever
swings every trapdoor it governs open on that same frame, whether or not anyone
is standing on them, dropping whoever is. The lever is edge triggered, so holding
it down does not keep re-firing.

An open door takes one runner and no more. The first body down through the gap
slams it shut behind them, which means a Mario dropped through a stack of open
doors closes each one on the way past. A door that catches nobody simply times
out after a couple of seconds.

The climb does not empty out behind the leader. Roughly a quarter of platforms
are generated as shelves that run off the side of the frame, and when the
visible crowd thins a runner is placed on the offscreen tail of one and simply
walks in. Nobody is ever launched into the scene through the air. Existing
offscreen runners are reused before the bounded pool grows, so nobody pops into
existence in the visible scene and nobody is deleted for falling below it.

Runners are more reckless the further they have fallen behind. Aggression is
read straight off vertical screen position: the leader, whom the camera holds
near the middle of the frame, waits about two seconds between jumps, picks
roomy landings and never leaps without a route. A runner down near the bottom
edge jumps roughly every half second, reaches further sideways, and will throw
itself at open air rather than be left behind. Everyone now pulls up at a
platform lip instead of strolling off it, so falling is the result of a failed
jump rather than idle drift.
There are no spring launchers. The camera continuously follows whichever Mario
is currently highest and is free to move downward as well as upward.

## Drawing

The game runs on one dependency-free canvas. Its background is composed at
runtime from three transparent anime-painted raster assets rather than one
finished backdrop. Platforms remain code-drawn so cracks, hinges, levers,
fragmentation, and impact states can animate precisely. The pastel material
colors stay soft around stark black-and-white runners. Each figure uses a
continuous charcoal silhouette: a long pointed hood, two animated white eyes, a
broad round belly, floppy handless arms, thin legs, and sharp feet. Ground poses
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
