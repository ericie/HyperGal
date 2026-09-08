# Patchwork Geometry

A generative quilt. A square grid — between four and fifty-two cells across —
is filled with half-square triangles, bars, notched blocks, and solids drawn
from one of a set of named palettes. The grid is then folded through mirror
symmetry chosen per iteration: horizontal, vertical, both, or none. When both
axes fold, the quilt reads as a single medallion; when neither does, it reads
as scatter.

The quilt is never finished. Cells retire and return continuously in one of
several transition styles — all fading at once, or in stacking layers — on a
cycle speed set by the hash. Watching it is watching a pattern being unpicked
and re-sewn in slow motion.

## Interaction

- **Click or tap** — a new quilt from a new hash
- **R, Space, or Enter** — the same
- **P** — pause
- **S** — save a still as JPG
- `?hash=` — pin a specific iteration
- `?debug` — log the iteration's feature record to the console

Reduced-motion preferences render one completed quilt and stop.

## Notes on the port

Packaged for fxhash as `PatchworkGeom` in February 2023. This is that shipped
package with the platform boilerplate removed. `colors.js`, `particles.js`,
`grid.js`, and `sketch.js` are the shipped files.

**p5.js is gone.** `runtime.js` replaces it with about 300 lines of vanilla
canvas code implementing only what this sketch calls. Three details had to
follow p5 1.5.0 exactly, because the output is visibly different otherwise:

- `endShape(CLOSE)` appends the first vertex to the path *twice* before calling
  `closePath()`, so the closing corner is stroked as a join rather than as two
  caps meeting. Without it every shape loses a little edge coverage.
- every renderer opens with `strokeCap(ROUND)`; the raw canvas default is `butt`.
- colour keeps p5's rounded 0–255 levels *and* its unrounded internal array,
  because p5 prints `rgb()` from the rounded values but alpha from the unrounded
  one. The per-frame background fade depends on that alpha.
- `tint()` + `image()` follow p5 1.5's compositing pipeline — luminosity, then
  color, then multiply, then destination-in to restore alpha — against a canvas
  cached on the source. Recolouring the full-size quilt happens every frame, and
  the obvious per-pixel multiply is around a hundred times too slow for it.

Verified against the p5 build before it was deleted: both were loaded side by
side and driven through the same eight hashes in both their settled and
transitioning states, comparing full canvas pixel data. All sixteen frames came
out identical — zero differing pixels out of 3,240,000, maximum channel delta
zero — with matching feature records throughout.

fxhash's base58 hash format and sfc32 generator are kept verbatim in
`index.html`, so an original `oo…` hash passed as `?hash=` reproduces that exact
quilt. Verified: rebuilding twice from one hash produces a byte-identical
canvas, and a different hash produces a different one.

Two changes to the sketch. `setup()` is split so that a new hash rebuilds the
quilt without tearing down the canvas — `preSetUpGrid()` stays the first
`fxrand()` consumer, which keeps the random sequence identical to the shipped
build. And the original's double-tap-to-save gesture is gone, because tapping
now asks for a new quilt; **S** still saves.

The grid fills the viewport in whole cells, so a partial row can be left
uncovered along the bottom edge depending on the window's aspect ratio. That
is original behavior and has not been touched. The thumbnail is framed from a
taller render so the partial row falls outside the crop.

Note also that the piece is sized to the window, so the same hash composes
differently at different viewport sizes. That was true on fxhash too — each
mint rendered at whatever the viewer's window happened to be.
