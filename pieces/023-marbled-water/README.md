# Marbled Water

A simulation of paper marbling on a floating bath. Every ink drop is stored as
a smooth contour. As a new circle grows, its area displaces every older contour,
so colors repel and wrap around one another rather than blending like ordinary
paint.

The bath begins with a single drop and adds color gradually. Complexity rises
with each drop and comb pass. At the selected limit, a large paper-colored drop
pushes the pattern apart and opens white space before accumulation resumes.

The comb tools rake all existing contours along evenly spaced parallel tines.
Adjust tine spacing, direction, and pull, then swipe forward or reverse. Click
or tap the bath to place an ink drop manually. Press Space to pause or resume,
and R to start a new bath. Add `?seed=anything` to revisit a bath or `&panel=0`
for a clean capture.

## Archival rule

This folder is fully self-contained. It uses browser-native Canvas 2D and
JavaScript with no external assets or dependencies.
