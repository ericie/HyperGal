# Forest of Rings

The default page loops through 192 lengthwise slices at 0.125 cm intervals,
from bark through the middle to the opposite bark. The saw runs on a shallow
bias of 1.1 degrees, so each cut crosses the growth layers instead of running
parallel to them. That crossing is what opens
the face into cathedral grain: nested arches that converge where the cut passes
closest to the pith, and a tapering tip where it leaves the log altogether.
A slice's stated depth is therefore true at the centre of the frame, with the
cut running shallower above it and deeper below. All frames use one physical
scale for both axes: the widest slice reaches 90% of the window width, while
narrower slices retain their relative widths and positions. The top end stays in view and excess length is cropped
below the window when the log’s proportional height exceeds the screen;
it is never stretched to fill both dimensions. Very tall windows can show the
entire log with vertical margins. There is no individual zoom or recentering
between slices.

Frames advance every 150 ms, preserving the previous 28.8-second loop while
sampling twice as many depths as the 96-slice version. Click or press Space to pause/resume;
Left/Right arrow keys pause and browse. Reduced motion starts paused, and
background tabs suspend playback without skipping ahead.

## Cut angle

A panel in the lower left re-cuts the log live. It runs from 0 to 12 degrees,
which spans everything useful: past about ten the arches close into squat
concentric ovals, and the interesting shallow settings crowd into the first
couple of degrees. It fades out after a few seconds and returns on any pointer
movement; `H` hides it outright. Moving it pauses playback, the same as browsing
the depth does, and the angle is written back to the URL as `tilt`, the model's
own quantity of depth per unit length, so a view can be reloaded or shared.

## Sampling

One sample per pixel aliases badly at shallow angles, which is where the piece
now lives. The rings run almost vertically and thin to about a pixel wide near
the bark, so each column flickers between neighbouring rings and the face fills
with broken vertical dashes. Raising the raster to the canvas's own resolution
does not fix it — the dashes survive at 2232x1800 — because the rings are
genuinely finer than the pixel grid. Averaging several samples across each pixel
does fix it.

The aliasing is horizontal only. Even at the steepest cut the face moves less
than one ring per row, so samples spent on the vertical axis buy nothing: four
samples across x are visibly cleaner than a 2x2 grid at identical cost. Sampling
is therefore horizontal, and tiered by what the piece is doing — 1 while the
angle is being dragged, 2 while playing, 4 once a frame has sat still for 350 ms.
Playing re-arms that timer every 150 ms so it never fires mid-loop; pause, and
the frame you are looking at is recut at the finest tier.

Two things paid for the extra samples. `materialAt` reports its hit through
module-level scratch rather than allocating a result object and a boundary
closure per sample, and the ring lookup walks from the previous sample's ring
instead of binary searching all 200 from scratch, since neighbouring samples
nearly always land in the same ring or the next one over. Together they cut
about a quarter off every tier, and both are exact: the seeded walk was checked
pixel-for-pixel against the binary search across the tilt range.

## Framing

Re-cutting the visible face costs about 70 ms, too slow to follow a dragging
thumb, so while the angle is moving each face is cut at 45% resolution and
scaled up; the sharp one replaces it once the thumb settles. The framing is
deliberately not recomputed. It comes from `makeTextures`, which would have to
re-cut all 192 slices, and across the whole slider range the widest slice moves
by about three pixels in twelve hundred — so the frame holds still while the
grain changes, which is what you want when judging the angle. The panel is
presentation-only for the same reason; in the debug study the angle is set by
`?tilt=` at load.

## Growth model

`growth-model.js` adapts the pure growth model from `015-growth-rings/index.html`
without modifying that piece. The end grain and slice faces share its 200 annual
layers, directional sun/wind/slope forces, rainfall and temperature history,
and fire/pest growth suppression and healing. The only addition to the adapted
model is that it now also returns its raw palette swatches.

Ring colour is the one thing this piece does not take from the reference. There
each ring draws a random palette index, which reads as texture under the thin
concentric rings of an end grain but as noise once a lengthwise cut widens those
rings into bands. `log-slices.js` replaces it with a single gradient keyed to
distance from the pith: the palette is sorted light to dark, spaced by lightness,
and interpolated in OKLCh so chroma holds up and the hue turns the short way
round. Hokusai runs pale yellow at the heart through wheat, tan and terracotta to
a crimson and Prussian-blue rim at the sapwood. Ring width still modulates it —
a wide ring is an easy year and stays slightly lighter, a narrow one darkens.

Within each ring, shading runs from pale porous earlywood to dense dark latewood
on a cubic falloff, so the ring boundary itself carries the grain line. This
replaces the reference's every-fifth-ring counting marks, which were legible on
hairline rings and became stripes at this scale.

The source's progressive contour detail preserves smoother young growth and
more irregular later growth. Small overlaps introduced by the source contour
smoothing are clamped for unambiguous material sampling.

The completed cross section is extended into a 60 cm log with gentle bow, taper,
and twist along its length. The cut axis spans 24 cm. Every face and end-grain cap
samples this same volume. The two middle slabs share a central face. End caps
reverse direction after the middle to meet the displayed core-facing surface.

## Debug study

Add `?debug=true` for the end grain, the full 192-slice grid, and cutting controls.
The diagram highlights the selected 0.125 cm slab. Select a board or
use the slider to locate it. Show all reveals all cuts; Replay cuts restarts the
same log; New log generates a new history and stays in debug mode. Debug slices
retain the slim grid proportions; caps are enlarged vertically for readability.
Reduced motion reveals the whole grid immediately.

## Repeatable views

- `?seed=woodland` loops through a repeatable log.
- `?seed=woodland&cut=50` starts at slice fifty.
- `?debug=true&seed=woodland&all=1` shows all 192 slices.
- `?debug=true&seed=woodland&cut=96` pauses at the middle.
- `&palette=nature` selects another palette supported by the reference model.
- `&tilt=0.1` re-cuts the log at a different bias, in cm of depth per cm of
  length — `tan` of the angle the panel shows. Around 0.3 (17 degrees) the
  arches close into squat concentric ovals; 0.06 (3.4 degrees) stretches them
  into a narrow spire of chevrons over otherwise straight grain. The default
  0.0192 is 1.1 degrees, shallow enough that the arches run the full height.

This piece runs directly from `index.html` with Canvas 2D and local scripts;
there is no build step. `growth-model.js` owns the adapted reference model,
`log-slices.js` owns volumetric sampling and playback, and `index.html` owns layout.
