# No Empty Places

No Empty Places is a self-packing field of painted lines. Each iteration begins
with an invisible landscape made from several scales of seeded value noise. The
gradient of that landscape supplies a current: paths travel across its contours,
curling around peaks and sinks instead of crossing them.

The paths are added one at a time. A new path grows in both directions from an
open point and stops when it reaches the frame, its own natural limit, or the
space already claimed by another path. Seed points are tested throughout the
remaining openings, so later marks settle into progressively narrower pockets.
The result is neither a maze nor a set of contour lines, but it borrows the
continuous pressure of both.

Deep indigo varies slightly from stroke to stroke over a cool mineral ground.
Width drift, edge feathering, dry pinholes, and quiet surface fibers move the
output away from clean vector geometry and toward a densely worked painting.

## Interaction

- **Click or tap** — grow a new painting from a new seed
- **Space or Enter** — grow a new painting from a new seed
- **R** — repaint the current seed
- `?seed=` — revisit a particular painting

Reduced-motion preferences draw the completed field immediately. The piece is
self-contained vanilla HTML, CSS, and Canvas with no runtime dependencies.
