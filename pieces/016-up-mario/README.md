# Up Mario

A vertical platformer that only points upward.

Mario starts on one ledge inside a narrow arcade shaft and keeps jumping to
the next platform forever. The piece plays itself by default: it chooses the
next reachable brick or girder, runs to a launch point, jumps, corrects in the
air, lands, and immediately starts looking higher.

The player can interrupt with left/right/jump input, but the work always
returns to its own climb after a short pause. There is no death screen. If the
hero falls out of the camera, he is pulled back to a live ledge with a burst of
red dust and the climb continues.

## World

Platforms are generated upward from a seeded random stream. Each new ledge is
kept within a conservative jump envelope so the autonomous route has a real
path, but the composition still wanders left and right. Later platforms may
move, hold springs, carry coin arcs, or host a barrel that rolls along the
surface.

The camera only rises. Old platforms, coins, barrels, and particles are
trimmed below the viewport so the piece can run indefinitely.

## Controls

- Arrow keys or A/D: move.
- Space, W, or Up: jump.
- Tap/click: reseed.
- R: reseed.

## Parameters

- `?seed=<text>` - reproduce a specific run.
- `?warm=<seconds>` - open it already partway into the climb.
- `?debug` - show simulation counts and current target.

Open `index.html` directly in any browser.
