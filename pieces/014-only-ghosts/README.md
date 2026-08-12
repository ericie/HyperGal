# Only Ghosts

A Pac-Man riff where Pac survives a threat by becoming it.

The sketch is intentionally small: one oversized Pac and one oversized Ghost
crossing a compact maze with four marked changing rooms.

## The rule

You respond to a threat by becoming the threat.

Pac sees only forward down a straight corridor. When Pac and Ghost see each
other, a live wavy line connects their pupils: the alarm. Pac then runs for a
pink changing room while Ghost gives chase. Pac can only fold into a Ghost
after crossing a changing-room threshold. The pursuing Ghost never changes.
Pac's disguise lasts long enough for the two Ghosts to split up and explore;
then the disguised Pac returns to a changing room and emerges as Pac again.

Contact is the fallback for an encounter that happens around a corner or from
behind. It starts the same run-to-a-room response but cannot cause a hallway
transformation. Nobody dies, becomes eyes, or returns home. The encounter
briefly leaves only ghosts before the Pac/Ghost chase can begin again.

## Motion

The response is one readable sequence: an eye-to-eye alarm, a dash toward a
marked room, then the yellow Pac silhouette closes and compresses while the
colored Ghost body rises through it and its eyes appear last. Only the
threatened figure moves differently or changes form.

Before the encounter, Pac searches for pellets while Ghost explores and hunts.
Afterward, the two Ghosts explore the course independently with a slow drift,
long buoyant bob, and slight body sway. Changing rooms are excluded from normal
routes: a Ghost crosses their threshold only when it is returning to Pac form.

## Maze and changing rooms

The maze is fixed at 17-by-11 cells, with connected outer lanes, a small central
circuit, and four two-by-two changing rooms. The drawing stretches that tiny
grid to fill the whole window, wide or tall, so the characters remain the main
graphic event.

## Parameters

- `?seed=<base36>` - reproduce a specific run.
- `?warm=<seconds>` - open it already in motion.
- `?debug` - show identity, behavior mode, transformations, and pellet counters.

Use the **New run** button, press Space, or press `r` to reseed. Open
`index.html` directly in any browser.
