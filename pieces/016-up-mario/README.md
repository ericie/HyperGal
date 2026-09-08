# Many Mario

A self-playing vertical platform climber in a simplified anime-painted summer
sky.

A family of fat, bouncy, two-eyed silhouettes climbs forever through an
anime-painted sky assembled from transparent cloud banks, towers, and wisps.
Their scale, placement, reflection, and parallax change with every new seed.
Every runner favors pronounced side-to-side leaps and chooses an independent
route. Platforms can extend beyond either edge of the viewport, while
landing targets remain inside the visible area. Runners can cross paths without
colliding, so the motion stays focused on running, jumping, and landing.

The piece plays itself by default at a measured climbing cadence. The lead
runner chooses a local intention: jump to a reachable platform. The player can
interrupt with left/right/jump input, after which the climb resumes. The other
runners independently choose reachable surfaces, line up broad lateral jumps,
land, and look for the next step up.

## Physics

Runners carry horizontal momentum but do not collide with one another. A runner
whose center loses a platform edge falls under gravity and can still catch a
surface below. No runner dies, disappears, or warps back into view at the bottom
edge. A Mario with no route makes one desperate physical jump instead of
waiting forever. If the highest Mario is falling, the camera follows that fall
until another Mario becomes the highest.

## World

Platforms are generated well above the camera from a seeded random stream. Four
altitude zones repeat through the climb: stable black ink lines; square brick
tiles that crack and fall one square at a time whenever a runner stands on
them; trapdoors that swing open the instant a runner lands, with a second
triggering lever on the next ledge above; and cloud platforms that shed painted
chunks into drifting particles on every landing.
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
