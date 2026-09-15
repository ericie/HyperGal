# Agate

Small, irregular ink spirals fit together like slices of banded stone. Several drawing points
start across the page and grow outward together, filling the entire viewport with triangular,
quadrilateral and many-sided forms. Inspired by the supplied hand-drawn reference.
Each stone is drawn from its outside inward in one continuous pen stroke.

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

Six to sixteen pens (scaled to the viewport area) each advance at 280 CSS
pixels per second. Each pen finishes a spiral before moving to a nearby stone;
only newly drawn segments are painted each frame. Nothing is erased or filled
over. A dense drawing takes several minutes to finish; **F** reveals it at once.
The thumbnail is an actual completed canvas capture, seed `agate`, 1440 × 900.

## Verification

Run `node scripts/check-agate.mjs` from the repository root. It checks coverage,
finite geometry, containment of each spiral in its own cell, deterministic
seeds, concurrent pen speed, distributed starting points, pause/resume, hidden-tab suspension, completion,
resizing and restart across desktop, mobile and unusually narrow viewports.
