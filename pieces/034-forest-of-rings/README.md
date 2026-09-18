# Forest of Rings

The default page loops through 192 lengthwise slices at 0.125 cm intervals,
from bark through the middle to the opposite bark. All frames use one physical
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

## Growth model

`growth-model.js` adapts the pure growth model from `015-growth-rings/index.html`
without modifying that piece. The end grain and slice faces share its 200 annual
layers, Hokusai palette and tonal variation, directional sun/wind/slope forces,
rainfall and temperature history, and fire/pest growth suppression and healing.
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

This piece runs directly from `index.html` with Canvas 2D and local scripts;
there is no build step. `growth-model.js` owns the adapted reference model,
`log-slices.js` owns volumetric sampling and playback, and `index.html` owns layout.
