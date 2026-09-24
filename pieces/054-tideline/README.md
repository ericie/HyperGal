# Tideline

Two shores facing each other, seen from above: one along the bottom edge, one
along the top. Each sends waves of fresh dye across the pale sand between
them. A wave carries its colour out, slows, turns, and drains back, leaving
the dye behind — densest along the line it reached, thinning back down the
slope. The sand it uncovers is dark with water and dries over half a minute.
Every wave stains over the ones before it, so the two colour fields grow
toward each other and interleave, with a seam of bare sand wherever neither
has reached. Abstract, flat and fluid: scalloped swash edges and foam lines,
no photographic detail.

- Click / tap: the nearer shore sends a wave up to that spot.
- **Enter**: the shores take turns sending one.
- **R**: a fresh pair of shores with a new seed.
- **Space**: pause / resume.
- **F**: skip ahead a dozen waves.
- **S**: save the current view as a PNG.
- `?seed=your-word`: the same sequence of waves, colours and shapes.

Open `index.html` directly. No dependencies, network requests or build step.
Reduced motion shows a dry shore already stained by thirty waves and does not
animate; a tap stamps its wave at once. Resizing carries the stained sand over
to the new size and drops the waves in flight. Hidden tabs suspend both seas.

## Drawing

Everything is written once in terms of a shore's `dir` — the direction from
its water into the field — so the same code runs from either side. Each
shore's still water breathes with its own slow tide and ripple, so every wave
is measured from a line that is itself alive.

A wave is a run of rounded lobes joined at cusps: a soft maximum over
super-Gaussian humps whose centres drift and heights wobble while the wave is
out. Scallops run from broad tongues to a fine frill, so no two waves share a
scale. Some waves run the whole width; others surge along one stretch of it
and fade away at both ends with their own lobes, which breaks the field out of
full-width banding into overlapping patches. A surge along a short stretch
does not run as far. Run-ups mostly stay modest, under a slow swell envelope,
with a rare wave that crosses the whole field.

Each shore works from a hue that creeps around the colour wheel, and the two
stay on opposite sides of it, off exact complements. Saturation and lightness
come from a list of natural dyes — indigo, woad, madder, cochineal, weld,
saffron, verdigris, logwood, walnut, rose madder, sage, teal — and no strength
repeats within three waves. Colours therefore blend within a family rather
than silting up into brown, and the whole palette turns over the course of
minutes.

When a wave turns, its dye is stamped onto an offscreen sand canvas: eleven
translucent bands that fall away quickly behind the line it reached, and a
darker rim along that line, the way a spill dries darkest at its edge. Each
stamp first weathers the whole canvas one step back toward bare sand, so the
shore keeps a rolling memory instead of silting up. A second offscreen layer
darkens recently wet sand — overlapping patches take the wettest value rather
than compounding — and is repainted a few times a second, since sand dries far
slower than a frame. In flight, the water is three offset layers so the
leading edge is thin and lets the sand show through, with a foam line thickest
as the wave arrives and thinning on the backwash.

The thumbnail is a 900 × 900 capture at 2× using seed `weld`, two skips ahead
and eight seconds of waves, generated from this piece's code.

## Verification

`node scripts/check-tideline.mjs` runs the sketch against a canvas stub. Five
layouts (mobile, desktop, wide, narrow and a one-pixel surface) × three seeds
check that the two shores face each other across bare sand, that a still
composition is dry and carries thirty waves split evenly between them, and
that every wave that turns has a finite, continuous crest lying up the shore
from its own water and no further than it can run — 259 waves and 54,000 front
samples per run. Surges are checked for fading along the shore, colours for
muting and for the two shores starting apart on the wheel. A live run checks
the first wave's timing, uprush and backwash, retirement and drying, pause,
hidden tabs, resize carry-over, skip, Enter, tap aim from the nearer shore,
paused tap, restart, seed determinism, and a ten-minute run in which both
shores stay busy, nothing accumulates but dye, and every wave weathers what
came before. Browser checks cover desktop, phone and ultrawide rendering and
frame timing.
