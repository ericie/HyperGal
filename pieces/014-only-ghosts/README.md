# Only Ghosts

A Pac-Man riff where Pac survives a threat by becoming it.

The sketch is intentionally small: one oversized Pac and one oversized Ghost
on a single outer hallway wrapped around a solid inner box.

## The rule

You respond to a threat by becoming the threat.

Pac sees only forward down a straight corridor. When Pac sees Ghost, Pac turns
and runs. After a brief retreat, Pac folds into a Ghost without stopping. The
pursuing Ghost never changes.

Contact is the fallback for an encounter that happens around a corner or from
behind. It causes Pac to change immediately. Nobody dies, becomes eyes, returns
home, or changes back. The encounter leaves only ghosts.

## Motion

The response is one readable sequence: a sightline, a clean retreat, then a
yellow Pac silhouette closes and compresses while the colored Ghost body rises
through it and its eyes appear last. Only the threatened figure moves
differently or changes form.

Before the encounter, Pac searches for pellets while Ghost explores and hunts.
Afterward, the two Ghosts explore the course independently with a slow drift,
long buoyant bob, and slight body sway.

## Maze

The maze is fixed at 17-by-11 cells: one hallway on the outside, one box on
the inside. The drawing stretches that tiny grid to fill the whole window, wide
or tall, so the characters become the main graphic event.

## Parameters

- `?seed=<base36>` - reproduce a specific run.
- `?warm=<seconds>` - open it already in motion.
- `?debug` - show identity, behavior mode, transformations, and pellet counters.

Click, press Space, or press `r` to reseed. Open `index.html` directly in any
browser.
