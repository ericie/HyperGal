# Marbled Water

A top-down procedural Suminagashi bath rendered as one continuous pigment
field. Dusty navy, slate, powder blue, and cool gray form the nearly still water
surface without polygon edges or overlapping vector shapes. Low-frequency
clouding, fine grain, and sparse pigment flecks keep the bath from feeling
digitally flat.

The initial frame is a finished composition rather than an empty simulation.
Blue pigments occupy almost the entire field, while oxidized gold, mineral
teal, and dusty plum braid into a dense cropped passage along the lower edge.
New ink first
appears as a shaded bead above its destination, accelerates into the surface,
and briefly dimples the bath on impact. Its color then blooms outward as a
translucent floating film. The complete visible pigment field is stored in a persistent
surface buffer above a pale water layer: each expanding front opens that still
water at its center and compresses the existing blue and colored ink outward,
building layered pools of pigment rather than drawing temporary outlines.
Automatic drops cluster near the current ink well; clicking the bath
moves that well to the new point.

Click or tap the bath to drop ink. The panel controls drop cadence, size, ring
variation, push strength, and the mineral palette. Press Space to pause or
resume, and R to generate a new seeded composition. Add `?seed=anything` to
revisit a bath or `&panel=0` for a clean capture. Reduced-motion preferences
receive a fully separated still deposit rather than a spatial animation.

## Archival rule

This folder is fully self-contained. It uses a browser-native WebGL shader for
the still mineral bath, a persistent Canvas 2D pigment simulation, and a static
Canvas 2D fallback with no external rendering dependencies.
