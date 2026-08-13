# Many Mario

A self-playing vertical platformer in a pastel kawaii sticker world.

A family of tiny chibi Marios climbs forever through a blue candy sky. Every
Mario seeks a higher cloud, with frequent sideways leaps across the screen.
The cast rides plump, asymmetrical cloud characters with grape
outlines, bright eyes, rosy cheeks, little smiles, and occasional sparkles.
Question boxes are lemon yellow, ladders are mint and lavender, and a cropped
pastel rainbow floats at the edge of the scene.

The piece plays itself by default. The lead Mario chooses a local intention:
hit a nearby question box from below, climb a ladder, cross a stair, jump to a
reachable cloud, or occasionally descend to revisit a missed box. The player
can interrupt with left/right/jump input, after which the climb resumes. The
other Marios independently choose reachable clouds, line up compact little
jumps, land, and immediately look for the next step upward.

## Cloud physics

Clouds are physical platforms rather than background decoration. A traversal
jump makes the departing cloud break into falling puffs. Every Mario standing
on that cloud is attached to it until the breakup begins; riders then detach,
drop under gravity with a startled pose, and reappear on a safe cloud higher in
the sky after falling out of view. The lead Mario follows the same rule if a
cloud ever breaks while he is still grounded on it.

## World

Clouds are generated upward from a seeded random stream. The main path stays
inside a conservative jump envelope, while side clouds, alternate routes,
ladders, stairs, question boxes, and small peach-colored grumps make the field
feel inhabited. The camera only rises. Old world elements are trimmed below the
viewport so the piece can run indefinitely.

## Drawing

Everything is drawn at runtime on one dependency-free canvas. Large cloud
silhouettes use a central dome, uneven shoulders, and a softly scalloped belly
instead of repeated identical lobes. A full pastel palette—sky blue,
strawberry, lemon, mint, lavender, peach, and denim—is held together by a soft
grape outline. Mario's red cap, M badge, moustache, overalls, gloves, and warm
skin tones stay readable even at miniature scale.

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
