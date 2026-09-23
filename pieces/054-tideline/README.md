# Tideline

Waves reaching a shore, seen from above. Each wave carries a fresh dye
colour up the pale sand, slows, turns, and drains back, leaving its colour
behind: densest along the line it reached, thinning down the slope. The
freshly uncovered sand is dark with water and dries over half a minute. Every
later wave stains over the earlier ones, so the low shore becomes a blend of
recent colours while the highest marks of the biggest waves survive up top.
Abstract, flat and fluid: a scalloped swash edge with a foam line, no
photographic detail.

- Click / tap: send a wave up to that spot.
- **Enter**: send a wave.
- **R**: a fresh shore with a new seed.
- **Space**: pause / resume.
- **F**: skip ahead a dozen waves.
- **S**: save the current view as a PNG.
- `?seed=your-word`: the same sequence of waves, colours and shapes.

Open `index.html` directly. No dependencies, network requests or build step.
Reduced motion shows a shore already stained by thirty waves and does not
animate; a tap stamps its wave at once. Resizing carries the stained sand
over to the new size and drops the waves in flight. Hidden tabs suspend the
sea.

## Drawing

The still water at the foot of the shore breathes with a slow tide (a few
percent of the height over five minutes) and a small ripple. A wave is a run
of rounded lobes joined at cusps: a soft maximum over super-Gaussian humps
whose centres drift and heights wobble while the wave is out. Its reach up the
slope decelerates on the way up and gathers speed on the way back, like water
on a slope. Run-ups are mostly modest, with occasional large waves, a slow
swell envelope, and a rare wave that washes over the whole shore.

Colours come from a list of natural dyes (indigo, woad, madder, cochineal,
weld, saffron, verdigris, logwood, walnut, rose madder, sage, teal), each
jittered slightly and never repeated within three waves. The still water
takes on each new wave's colour.

When a wave turns, its dye is stamped onto an offscreen sand canvas: a faint
wash over the whole wet area, fourteen translucent bands that thicken toward
the line it reached, and a darker rim along that line, the way a spill dries
darkest at its edge. Nothing is erased; every wave adds to the same sand. A
second offscreen layer multiplies a warm darkening over recently wet sand and
fades as it dries. In flight, the water is drawn as eight offset layers so the
leading edge is thin and lets the sand show through, with a foam line that is
thickest as the wave arrives and thins on the backwash.

The thumbnail is a 900 × 900 capture at 2× using seed `tideline`, three
skips ahead and nine seconds of waves, generated from this piece's code.

## Verification

`node scripts/check-tideline.mjs` runs the sketch against a canvas stub: 15
still layouts (mobile, desktop, wide, narrow and a one-pixel surface) check
finite, continuous crests that lie up the shore from the sea, deposits and
rims for every wave, drying patches, a bounded tide and seed determinism. A
live run checks the first wave's timing, uprush and backwash, retirement and
drying, pause, hidden tabs, resize carry-over, skip, Enter, tap aim, restart,
and a ten-minute run with nothing accumulating but dye. Browser checks cover
desktop, phone and ultrawide rendering and frame timing.
