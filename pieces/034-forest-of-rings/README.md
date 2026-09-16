# Forest of Rings

The default page loops through 24 completed lengthwise wood slices, one image
at a time. Each face spans the full window height, retains the quarter-width
proportions, and stays on screen for 1.2 seconds before the next slice. The
sequence runs from bark through the center to the opposite bark, then repeats
with the same log. There are no visible labels, caps, or controls in this view.
Click or press Space to pause/resume; Left/Right arrow keys pause and browse. Reduced
motion starts paused. Background tabs suspend the loop without skipping ahead.

Add `?debug=true` to open the log-slicing study: top-down end grain at the upper
left, the grid of 24 one-centimeter slices to the right, and the existing
cutting animation and controls.

The modeled log has a nominal radius of 12 cm, a length of 60 cm, and 48 annual
growth layers. The first eight rings are smooth. Later annual growth increasingly
favors different sides, adding uneven bands to the existing rings. Each log has
persistent seeded sun and prevailing wind directions. In this stylized model,
sun exposure favors its facing side and wind loading favors the opposite side
from the incoming wind. Their strengths vary seasonally while their directions
stay fixed. Arrows beneath the end grain show the sun's location and wind's
travel direction; compass labels use north at the top. The pith
becomes off-center as asymmetric growth accumulates. Two seeded
injuries leave dark buried scars: growth compresses at each wound and thickens
around its shoulders in later years. The scars bend and fade along the log.
Bow and taper also vary the cross section. Each board face samples the cut plane nearest the log midplane through this same volume;
the separate cap above it samples the corresponding 1 cm strip of end grain.
The caps are enlarged vertically for readability. Faces and caps are displayed
at one-quarter of their original width, keeping the same height and spacing.
The long faces share a scale,
so slices widen toward the core and narrow again toward the opposite bark.
The two middle slabs share the central cut face; the eccentric pith need not
lie exactly on that plane. Far-side caps reverse their
depth direction to meet the displayed face, including the final bark slab. Palette colors repeat across different years,
but every particular layer retains its color throughout the log, except where
scar tissue interrupts it. Polar growth profiles stay strictly nested so
neighboring annual layers cannot cross. Injury-driven changes in layer thickness
affect only the injury year and later growth. The final outline comes from that
accumulated history; a single shared affine fit sizes the whole log without
smoothing the bark or deforming the core
to compensate for later scars.

In debug mode, cuts reveal sequentially on load. Select a board or move the depth slider to
pause and locate its slab on the ring diagram. Pause/resume controls the current
cut; Show all reveals every slice. After completion, Replay cuts restarts the
same log. New log generates another seeded growth history.

In debug mode, reduced motion shows all slices immediately. On small screens the ring diagram
and controls sit above the grid. The work uses Canvas 2D and vanilla JavaScript
and opens directly from `index.html`; no build step is required.

## Repeatable views

- `?seed=woodland` loops through a repeatable log.
- `?seed=woodland&cut=9` starts the loop at slice nine.
- `?debug=true&seed=woodland` opens the cutting study.
- `?debug=true&seed=woodland&all=1` immediately shows all 24 slices in the grid.
- `?debug=true&seed=woodland&cut=6` pauses the study with six slices revealed.

The geometry and drawing live in `log-slices.js`; layout and controls are in
`index.html`. This replaces the previous outward-growing tree animation.
