# Broken Patterns

Broken Patterns comes out of generative experiments from 2012 that were trying,
and failing, to be a Spirograph. The working version was less interesting than
the tangent the broken code took, so the bug became the piece. It was picked up
again in February 2022, finished, and minted as Edition 01 on fxhash.

## What it draws

Each iteration seeds a hash, picks one of seventy line-and-ground color pairs,
and lays out between five and seventeen hypotrochoids across the canvas. The
first four are forced into different quadrants so the composition never bunches
into one corner; the rest are placed freely inside a margin sized to the curve.
Every curve shares the same major and minor radii, the same amplitude, and the
same three hundred to twelve hundred steps, so they read as one family of shapes
at different positions.

The curves are not drawn one after another. On every tick each curve advances by
a single segment, and all of them stroke through one shared pen. A curve lifts
the pen only for its own first segment — after that, each segment starts wherever
the *previous curve* just finished. The long chords cutting between the figures
are that shared pen jumping across the canvas hundreds of times a second. At a
line alpha of 0.1 to 0.5 the overlaps accumulate into a translucent web that
belongs to none of the individual curves.

That is the whole trick, and it is fragile: giving each curve its own pen state
draws a tidy set of separate spirographs and loses the piece.

## Interaction

- **Click or tap** — a new pattern from a new hash
- **R** — redraw the current pattern from the start
- **Space or Enter** — a new pattern, for keyboard use
- `?hash=` — pin a specific iteration
- `?debug` — log the iteration's title, palette, and feature labels to the console

Reduced-motion preferences skip the animation and render the completed pattern
immediately.

## Notes on the port

fxhash shut down, so this is the minted build with the platform boilerplate
removed. The four original source files — `adapted.lines.js`, `adapted.library.js`,
`adapted.shapes.js`, and the webpack entry — are inlined into `index.html`, and
webpack, npm, and the `$fxhashFeatures` export are gone.

The drawing code is otherwise unchanged. fxhash's base58 hash format and its
sfc32 generator are kept verbatim, and every random value is still drawn in the
original order, so an original `oo…` hash passed as `?hash=` reproduces that exact
iteration stroke for stroke. Two quirks are deliberately preserved because
removing either would shift the random sequence and change every output: the
system builds `systemSize + 1` curves but only ever advances `systemSize - 1` of
them, so two are placed and never drawn; and the ground color `[66, 265, 154]`
has always been out of range and has always clamped to 255.

One thing was fixed. A palette entry carried a stray alpha value in its ground
color, which pushed the color name out of position and titled that iteration
"… Lines on a 0.1 Field". The name is now where it belongs. The rendered colors
are unaffected.

The canvas is the original fixed 1920 × 1920. It scales to fit the viewport
rather than reflowing, so the composition is the same on every screen.
