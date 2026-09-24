# Agate

Small, irregular ink spirals fit together like slices of banded stone. Several drawing points
start across the page and grow outward together, filling the entire viewport with triangular,
quadrilateral and many-sided forms. Inspired by the supplied hand-drawn reference.
Each stone is drawn from its outside inward in one continuous pen stroke.

When the page is full the pens start again on another plate: a fresh packing in
another ink, laid over the finished field the way one colour is printed over
another. It keeps taking plates — iron oxide, indigo, dark gold, verdigris,
plum — until it has nothing left to take.

- Click / tap, **Enter**, or **R**: start a new drawing.
- **Space**: pause / resume.
- **F**: finish the drawing immediately.
- **S**: save the current drawing as a PNG.
- `?seed=your-word`: reproduce the composition at the same viewport size.

Open `index.html` directly. No dependencies, requests, or build step.
Reduced-motion preferences show the complete drawing immediately. Resizing
recomposes for the new viewport while preserving the approximate completed
fraction, including a fully finished or paused drawing. Hidden tabs suspend
animation. Finished drawings hold without an animation loop.

## Geometry and ink

A seeded best-candidate distribution supplies an irregular Voronoi tessellation.
Cells extend beyond all four edges. Some cells split diagonally into smaller
stones, introducing triangles among the larger polygons. Each spiral follows
successively inset cell edges, winding toward an approximate deepest interior
point. This creates closely spaced bands with narrow channels between stones.
Subpixel variations in the contour, line weight and dark ink soften the geometry.
A seeded, cached grain tile supplies the warm paper surface.

Twenty-four to a hundred and twelve pens (scaled to the viewport area) each
advance at 280 CSS pixels per second. Each pen finishes a spiral before moving
to a nearby stone; only newly drawn segments are painted each frame. Nothing is
erased or filled over. A pen that has drawn out its own neighbourhood takes the
nearest waiting spiral from whichever pen has the most left, so no front stands
idle while another is still crawling through a dense corner. **F** reveals
every plate at once.

## The plates

Every line is drawn twice: a stroke three times the width in the paper colour,
clearing a channel through whatever is already down, then the ink along the
middle of it. That margin of bare paper is what separates the layers. Without
it a plate's lines simply cross everything beneath them and the colours knit
into one flat weave.

The channel runs *ahead* of the ink rather than under it. Laying it from where
the ink stopped would bite back into the ink already down — the wider stroke's
round cap covers the narrower one's end — and nick the line at every frame
boundary.

The base plate packs the whole page. Each plate after it is cut at a different
scale and takes only some of its cells, and coverage falls away steeply as they
stack: roughly two cells in five, then one in four, then one in six. Both of
those matter. A plate at the base's density fills every channel and the two
collapse into a single texture with neither field readable; and because every
plate's channels cut the lines under it, plates that all arrived at the first
overprint's weight would saw the base field into dashes and the structure it
drew would be gone by the fourth colour. Thinned, the later plates land as
accents on a field that still reads. The page settles at a little over half
bare paper.

Stone size stays near the base's. A stone's spiral is one continuous stroke
that a single pen has to draw end to end, so its length sets how long its whole
plate takes however many pens are on the page — stones that kept growing left
one pen crawling through an enormous coil while the rest of the page stood
finished. Wider-spaced turns keep the overprints' coils short enough to stay in
step. The base plate takes about eighteen seconds and the five overprints
another twenty-five.

Nothing is ever erased in the sense of removing a finished mark: the paper
colour is itself an ink, laid down a moment before the colour it carries.

A resize replays the finished plates in full before restoring the plate in hand
to its own fraction, so a window drag never loses a colour. On a small page the
thinnest plates can come back with no stones at all; the drawing then settles
on the last plate that had some.

## Verification

Run `node scripts/check-agate.mjs` from the repository root. It checks coverage,
finite geometry, containment of each spiral in its own cell, deterministic
seeds, concurrent pen speed, distributed starting points, pause/resume, hidden-tab suspension, completion,
resizing and restart across desktop, mobile and unusually narrow viewports.
