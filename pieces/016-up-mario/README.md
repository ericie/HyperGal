# Up Mario

A vertical platformer drawn as a one-bit castle cross-section.

Mario starts on one ledge inside a narrow shaft and keeps moving through a
field of stone platforms. The world is no longer a single ladder of ledges:
each vertical band can contain side platforms, alternate routes, iron
ladders, stairs, poles, rolling wheels, and question mark boxes.

The piece plays itself by default. Mario chooses a local intention: hit a
nearby question mark box from below, climb a ladder, cross a stair, jump to a
reachable ledge, or occasionally descend to revisit a platform with a missed
box. A fireman's pole can become the fast way down; ladders and stairs can be
used in either direction.

The player can interrupt with left/right/jump input, but the work always
returns to its own climb after a short pause. There is no death screen. If the
hero falls out of the camera, he is pulled back to a live ledge with a burst of
ink marks and the climb continues.

## World

Platforms are generated upward from a seeded random stream. The main path is
kept within a conservative jump envelope, while branch platforms are added
around it so there is often more than one ledge above. Links between platforms
are generated as ladders, stairs, or poles. Question boxes attach to platforms
and are only opened when Mario jumps into them from underneath.

The camera only rises. Old platforms, boxes, links, wheels, and particles are
trimmed below the viewport so the piece can run indefinitely.

## Drawing

Black and white only. The castle is built from tight brick courses, barred
arches, stippled black chambers, stone shelves, iron girders, stair rails, and
hanging chains. Mario is a compact ink silhouette with a white face and
overalls. A framed status console anchors the bottom of the screen. The piece
keeps the old arcade vocabulary but gives it the severe, illustrated density
of an early monochrome computer game.

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
