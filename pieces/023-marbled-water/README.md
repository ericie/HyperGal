# Marbled Water

A simulation of paper marbling on a floating bath, centered on the visual logic
of suminagashi. Colored ink arrives one drop at a time in a quick, irregular
rhythm. Each drop lands and blooms into a contour whose growing area displaces
every older color.

The bath opens with several colored ring families. New drops usually land near
one of those families, but vary from centered hits to broad offsets and entirely
new starting points. Drop diameter and timing both vary substantially. There are
no blank or clearing drops: a visible bath border contains every displaced
contour and lets the pattern accumulate against the edge.

The comb tools move a visible row of individual teeth through the bath. Each
tooth lightly entrains the contour it crosses and pulls a narrow filament from
the downstream edge of that pigment. Adjust tine spacing, direction, and pull,
then swipe forward or reverse. Click or tap the bath to place an ink drop
manually. Press Space to pause or resume, and R to start a new bath. Add
`?seed=anything` to revisit a bath or `&panel=0` for a clean capture.

## Archival rule

This folder is fully self-contained. It uses browser-native Canvas 2D and
JavaScript with no external assets or dependencies.
