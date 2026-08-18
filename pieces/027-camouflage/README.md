# Camouflage

A finely pixelated field changes its pattern. One variable zebra field
interprets a striped textile reference through convergence fans whose spacing,
bend, width, and compression change independently across the surface. Leopard,
ocelot, tiger, giraffe, fawn, and crocodile use six other animal systems:
open golden rosettes, tightly packed black rosettes and blotches, narrow tapered
and forked stripes, tight reticulated polygons, a dense irregular field of small
oval dapples, and broad armored scutes arranged in irregular rows with dark
flexible seams.

Two military families extend the set without reusing the animal geometry.
Woodland uses four overlapping scales of organic macro-blotches; six-color
desert lays paired dark and pale rock chips over sand, green, and brown bands.
Every marking uses a hard boundary and a small flat-color palette; there is no
edge smoothing or ordered dithering between pixels.

Every camouflage field is completely still. The piece holds each pattern for
4.2 seconds, drawing from a shuffled bag so all nine appear once before the
order is reshuffled without an immediate repeat. During each transition, every
color region becomes a two-dimensional distance field while its palette shifts
over the same interval. Interpolating those fields lets boundaries flow across
both axes while spots split, stripes narrow, and polygons merge into the next
geometry. The pixels remain hard-edged throughout; there is no wipe, crossfade,
or dissolve. The HUD is hidden by default; add `?debug=true` to the
URL to reveal the status, nine pattern controls, and pause button. Click or tap
the field to advance in the shuffled order, use the number keys to choose a
pattern directly, press `Space`
to pause automatic changes, press `R` to grow a new hide from a new seed, and
press `H` to hide or reveal the controls while debugging.

With `prefers-reduced-motion` active, automatic cycling stops and pattern
changes happen immediately.

## Archival rule

This folder is fully self-contained. It uses browser-native HTML, CSS,
JavaScript, and Canvas 2D with no external assets or dependencies.
