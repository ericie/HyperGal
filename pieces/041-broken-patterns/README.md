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

- **On arrival** — the day's iteration, the same for everyone visiting today
- **Click or tap** — a new pattern from a new hash, leaving the day behind
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
sfc32 generator are kept verbatim, and the geometry still draws its random
values in the original order. Two quirks are deliberately preserved because
removing either would shift that sequence and change every output: the system
builds `systemSize + 1` curves but only ever advances `systemSize - 1` of them,
so two are placed and never drawn; and the ground color `[66, 265, 154]` has
always been out of range and has always clamped to 255.

**An original `oo…` hash no longer reproduces its minted iteration**, and that is
deliberate — see Colour below. The structure it produces is unchanged; the
colours are not.

## Colour

The original chose from seventy hand-written {line, ground} pairs at random.
Most were good. Measured in OKLab, eleven of them sat under 0.30 lightness
separation and came out muddy — two colours of similar weight fighting each
other rather than one reading against the other.

`palette.js` replaces the lottery with a decision. It picks a relationship
first — Complementary, Split Complementary, Triadic, Analogous, Monochrome, or
Accented Neutral — then places ground and ink in OKLCH so the separation is
guaranteed rather than hoped for. The floor is 0.32, above every one of those
eleven failures. Across a year of daily iterations the minimum actually reached
is 0.320, and the six schemes come up in roughly even measure.

The hue vocabulary is measured from the original seventy, whose peaks were gold,
blue, cyan, red, green and magenta, so the range still looks like the same
artist picked it. Colour names are generated too, which is what keeps the titles
working: "6720 Deep Sky Lines on a Light Amber Field".

Those original pairs are gone from this folder; they remain in the
Broken-Patterns repository and in this file's history. One of them carried a
stray alpha in its ground colour and titled its iteration "… on a 0.1 Field" —
that class of mistake is no longer possible.

## The daily iteration

The piece seeds itself from the date. Everyone visiting on a given day sees the
same iteration, and reloading returns to it. Clicking leaves the day behind and
explores freely; `?hash=` still pins anything specific.

It also means the site never shows a minted iteration: the fxhash edition drew
from the old palette table, which no longer exists here.

The canvas is the window. The original drew into a fixed 1920 square that the
browser letterboxed; the piece now sizes itself to the viewport at the display's
pixel density and places its curves across that whole frame, so the quadrant
spread means the corners of the browser rather than the corners of a square
floating inside it.

The curve maths is still expressed in the original 1920 units — that is what
keeps the feature labels meaningful — and a single scale carries it onto
whatever shape the window is, taken from the narrower side so a curve always
fits. Resizing redraws the current pattern against the new shape.
