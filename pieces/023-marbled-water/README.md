# Marbled Water

A procedural marbling bath rendered as one continuous pigment field. The
default Mineral Current mode folds dusty navy, slate, powder blue, and cool
gray through several broad vortices, creating rivers and rounded eddies without
polygon edges or overlapping vector shapes. Low-frequency clouding, fine grain,
and sparse pigment flecks keep the surface from feeling digitally flat.

The initial frame is a finished composition rather than an empty simulation.
Blue pigments occupy almost the entire field, while oxidized gold, deep teal,
and plum collect into one dense lower basin as narrow veins. Automatic events
and pointer presses add soft local eddies to the field; they bend existing
pigment instead of drawing circles. Each disturbance eases into the current and
eventually settles away, so the underlying composition remains legible.

Click or tap the bath to introduce an eddy. Press Space to pause or resume, and
R to generate a new seeded composition. Add `?seed=anything` to revisit a bath
or `&panel=0` for a clean capture. Reduced-motion preferences receive the same
finished composition without continuous drift.

## Archival rule

This folder is fully self-contained. It uses a browser-native WebGL shader with
a static Canvas 2D fallback and no external rendering dependencies.
