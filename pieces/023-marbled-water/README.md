# Marbled Water

A simulation of paper marbling on a floating bath. Every ink drop is stored as
a smooth contour. As a new circle grows, its area displaces every older contour,
so colors repel and wrap around one another rather than blending like ordinary
paint.

The bath opens with twenty settled drops, so there is a marbled field on the
first frame, then adds color gradually. Complexity rises with each new drop and
comb pass. At the selected limit, a large paper-colored drop pushes the pattern
apart and opens white space before accumulation resumes.

The comb tools move a visible row of individual teeth through the bath. Each
tooth lightly entrains the contour it crosses and pulls a narrow filament from
the downstream edge of that pigment. Adjust tine spacing, direction, and pull,
then swipe forward or reverse. Click or tap the bath to place an ink drop
manually. Press Space to pause or resume, and R to start a new bath. Add
`?seed=anything` to revisit a bath or `&panel=0` for a clean capture.

## Archival rule

This folder is fully self-contained. It uses browser-native Canvas 2D and
JavaScript with no external assets or dependencies.
