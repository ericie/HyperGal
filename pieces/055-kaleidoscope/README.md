# Kaleidoscope

A dense mixture of 4,200 glitter flecks, 100 translucent iridescent polygonal prisms and
180 geometric fragments drifts through twelve alternating mirror sections.
Rainbow film contours, slowly changing glints and overlapping candy-colored
shapes move at different speeds. The whole field spins briskly on its own.

Open `index.html` directly; no dependencies, network requests or build step.

- **Space** or **Pause / Play**: pause or resume.
- **S** or **Save image**: download the current frame as a PNG.
- **R**: create a new arrangement.
- `?seed=your-word`: repeat an initial arrangement.

Reduced-motion preferences start with a still image; Play opts into motion.
Hidden tabs suspend animation. The canvas adapts to the viewport and caps its
pixel density at 2×. Geometry is drawn into a bounded offscreen canvas, then
reflected across alternating 30-degree wedges. The thumbnail is captured from
the running sketch.

Prism films are cached as sixteen small procedural sprites, with straight-edged
contours, translucent bodies, rainbow interference bands and soft highlights.
Their polygonal outlines scale uniformly as they turn. Glitter passes both behind and in front
of the geometry; brightness varies smoothly without flashing. Source objects
outside the mirrored wedge are culled before painting.

The scope rotates at 0.085 radians per second (5× the original speed);
internal drift and fragment rotation run at 3.5× their original pace.
