# Only Ghosts

A Pac-Man riff where the protagonist exists only while the sightlines allow it.

The current sketch is intentionally small: one oversized Pac and one oversized
ghost on a single outer hallway wrapped around a solid inner box. The power
pellets sit on the outside corners, so the whole piece reads as a slow patrol,
a panic, and a possible reversal.

## Pac

Pac searches for power pellets. If no power pellets remain, it keeps eating the
ordinary pellets along the hallway.

A powered Pac is invincible for a short burst and seeks ghosts directly. When
it touches a ghost during that burst, the ghost becomes eyes and returns home.

A non-powered Pac only sees forward down straight corridor lines. It does not
see behind itself, around corners, or through walls. If it sees a ghost, it
runs away. After it believes it has gotten away, it stops, turns back along its
own path, and checks behind it. If no ghost is there, it becomes a ghost and
floats back toward the hallway home point. Once that former Pac has a little
time and enough privacy or distance, it turns yellow again and resumes
searching for power.

## Ghost

The ghost wanders by trying to discover the whole map. It keeps a small
internal record of the cells it has already visited and chooses unexplored
cells as its next destination.

When a ghost sees Pac, it resets that internal map, speeds up slightly, and
drifts toward Pac. The ghost keeps seeking that Pac even after line of sight
breaks. The hunt ends when the ghost kills Pac, the Pac becomes powered, or the
hunter sees another ghost.

Ghosts pass harmlessly through each other, but the sight of another ghost
breaks a hunt and steers the ghost away from the other ghost instead of letting
them trail each other.

## Death

Ghosts kill ordinary Pacs on contact. A dead Pac becomes only eyes, floats
back to the hallway home point, and is reborn as a ghost waiting for privacy.
When it gets clear enough, it becomes Pac again.

Powered Pacs reverse the collision: they eat ghosts, which become eyes and
return to the hallway home point.

## Maze

The maze is fixed at 17-by-11 cells: one hallway on the outside, one box on
the inside. The drawing stretches that tiny grid to fill the whole window, wide
or tall, so the characters become the main graphic event.

## Parameters

- `?seed=<base36>` - reproduce a specific run.
- `?warm=<seconds>` - open it already in motion.
- `?debug` - show identity, behavior mode, death, hunt, and pellet counters.

Click, press Space, or press `r` to reseed. Open `index.html` directly in any
browser.
