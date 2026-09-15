# Negative Fill

Silver pen marks gather across charcoal paper: nested fans, spiral-ended
stems, stippled fields and solid silver patches. The marks fit around each
other, leaving irregular islands of untouched paper. Inspired by the supplied
silver-on-black hand-drawn references. The third space filler, after Strega
Nona and Agate.

- Click / tap, **Enter**, or **R**: start a new drawing.
- **Space**: pause / resume.
- **F**: finish immediately.
- **S**: save the current drawing as a PNG.
- `?seed=your-word`: reproduce a composition at the same viewport size.

Open `index.html` directly. No dependencies, network requests or build step.
Reduced motion shows the finished drawing immediately. Resizing recomposes
for the new viewport and retains the approximate completed fraction and pause
state. Hidden tabs suspend drawing; finished drawings stop their animation loop.

## Drawing

A seeded occupancy map reserves irregular open pockets and the margins around
long curled stems. Fans then occupy the remaining surface in a best-candidate
order. Later arcs stop at earlier motifs, creating rounded shared boundaries.
Some regions receive dots or closely spaced silver hatching. Small dots finish
the gaps between regions. Marks accumulate without erasing or painting over
previous marks.

Six to sixteen pens, scaled to viewport area, each draw at 190 CSS pixels per
second. Dots have a short dwell. Pens work outward from distributed starting
points, completing nearby marks before moving on. A seeded grain tile gives
the charcoal paper a fine texture. Completed compositions retain dark pockets;
they hold until restarted.

The thumbnail is a completed canvas capture at 1440 × 900 using seed
`negative-fill`, generated from this piece's code.

## Verification

`node scripts/check-negative-fill.mjs` checks 15 seeded layouts, including
mobile, desktop, wide, narrow and a one-pixel surface. It verifies finite
paths, motif coverage, preserved negative space, deterministic seeds,
concurrent drawing, pause/resume, visibility, finish, resize, restart, tap and
natural completion. Browser checks cover desktop and mobile rendering and
keyboard controls.
