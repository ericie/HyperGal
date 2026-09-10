# From Growth

Each iteration is made by accumulating small changes and shown in a series of
cells. The lines are contained in shapes, and sometimes overflow.

This is an exercise in process over composition. The grid gives structure for
marking progress, but the work isn't about precision. It's about rhythm.
Growing, filling, containment and breaking loose.

## Controls

Eleven parameters, which on fxhash were set in the minting interface before an
edition was made. There is no minting interface here, so the panel puts them in
the viewer's hands instead. It opens from the **Controls** button and starts
closed, so the piece opens unobscured.

| Parameter | Range |
| --- | --- |
| Evolution Direction | Top-Down · Spiral-In |
| Layout Mode | Circle · Square · Diamond · Triangle |
| Direction Mode | 90 · 45 · Noise · Random · Scribble |
| Line Weight | Hairline · Thin · Medium |
| Container Size | 0.55 – 1.0 |
| Shape BG | on / off |
| Burst Mode | None · Last · A Few · Several |
| Fill Amount | Light · Medium · Full |
| Color Palette | 25 palettes |
| Grid Size | 2 – 11 cells along the shorter screen axis |
| Padding | None · Some · Alot |

**Randomise** rerolls every parameter without changing the hash. **New hash**
draws a fresh iteration, which is also what clicking the artwork does. Every
parameter can be set from the URL too — `?layoutMode=Diamond&rowSize=8` — by
name or index.

The canvas and grid follow the viewport. **Grid Size** sets the number of cells
on the shorter axis; portrait screens add rows and landscape screens add
columns, but only when another complete cell fits. Cells and their shapes stay
square with identical spacing in both directions. Any remainder becomes extra
outer padding on the longer axis, so no edge row or column is ever cropped or
distorted. Both linear and spiral growth visit each cell exactly once, so every
generated row is complete.

## Interaction

- **Click or tap** — a new iteration from a new hash
- **R, Space, or Enter** — the same
- `?hash=` — pin a specific iteration
- `?debug` — log the hash and the sketch's own diagnostics

Reduced-motion preferences run the growth forward without animating and settle
on the grid it has made by then.

## Notes on the port

Packaged for fxhash in May 2025. Vanilla now: `runtime.js` replaces p5.js with
about 340 lines implementing only what this sketch calls, and `fx.js` replaces
the fxhash SDK with the parameter store and a seeded generator. Two parts are
transcriptions of p5 1.x rather than substitutes, because they decide what the
piece looks like: Perlin `noise()`/`noiseSeed()`, and `curveVertex()`'s
Catmull-Rom to Bézier conversion inside `endShape()`.

**The SVG export is gone.** The original bound S to `generateSVG()`, which
re-rendered the whole scene through `p5.svg`'s alternate SVG backend. That
backend is a second renderer, not a function that can be transcribed, so the
export and its `drawCellToSVG()` helper are not carried over. Everything drawn
on screen is unchanged; only the vector output is missing. The artist statement
above has had its "Press S to export an SVG" line removed accordingly.

Verified against the p5 build before it was deleted, with both loaded side by
side sharing the same `fx.js` and the same `sketch.js` so that only the
rendering layer differed. Circle, Square and Diamond layouts came out
pixel-identical — zero differing pixels out of 1,440,000. Two configurations
using Hairline weight on large grids still differed once growth was well
advanced: 0.6% of pixels, almost all by a single value in one channel, and the
count kept falling as the drawing filled in (20,472 differing pixels at 400
frames, 9,000 at 900). That residue is sub-pixel coverage on 0.2px strokes and
is not visible; it is recorded here rather than rounded off.

Two changes to the sketch. The parameters and everything derived from them were
`const` at the top level, so a change needed a page reload; they are now
assigned inside `applyParams()`, unchanged and in the original order. And
`setup()` is split so `buildPiece()` can re-form the grid without rebuilding the
canvas.

One quirk preserved: the sketch seeds its noise with
`noiseSeed(parseInt($fx.hash.slice(0, 16), 16))`, and since the hash starts
`oo` that `parseInt` is `NaN`, which p5 coerces to 0. Every iteration therefore
shares one noise field, and the variation comes from the parameters and the
generator instead. The runtime reproduces that coercion exactly.
