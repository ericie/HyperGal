# Many Mario

A self-playing vertical platform fighter in a pastel kinetic-toy world.

A family of tiny chibi Marios climbs forever through a blue candy sky. Every
Mario favors long sideways leaps and seeks out occupied clouds. When two meet,
they run into one another and try to shove the other over an edge. Face-to-face
pressure locks them in a short stalemate; once one turns, the Mario behind him
can transfer his momentum through the other body and push him into open air.
Question boxes are lemon yellow, ladders are mint and lavender, and a cropped
pastel rainbow floats at the edge of the scene.

The piece plays itself by default. The lead Mario chooses a local intention:
hit a nearby question box from below, climb a ladder, cross a stair, jump to a
reachable cloud, or occasionally descend to revisit a missed box. The player
can interrupt with left/right/jump input, after which the climb resumes. The
other Marios independently choose reachable clouds, line up broad lateral
jumps, land, and either challenge a nearby Mario or look for the next step up.

## Physics

Clouds are persistent physical platforms rather than temporary effects. They
never crumble, rain, or pop into view as a recovery device. Mario bodies carry
horizontal momentum, meet at a shared contact distance, brace when they face
one another, and transfer a shove when one catches the other's back. A Mario
whose center loses the cloud's edge falls under gravity and can land below or
reappear only after dropping out of view.

## World

Clouds are generated well above the camera from a seeded random stream and stay
in place for as long as they remain in the world. The main path stays inside a
reachable jump envelope, while side clouds, alternate routes, ladders, stairs,
question boxes, and small peach-colored grumps make the field feel inhabited.
The camera only rises. Old world elements are trimmed after they are far below
the viewport so the piece can run indefinitely.

## Drawing

Everything is drawn at runtime on one dependency-free canvas. Large, faceless,
borderless cloud silhouettes use a central dome, uneven shoulders, and a softly
scalloped belly instead of repeated identical lobes. A full pastel palette—sky
blue, strawberry, lemon, mint, lavender, peach, and denim—keeps depth without
hard outlines. Mario's red cap, M badge, moustache, overalls, gloves, and warm
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
