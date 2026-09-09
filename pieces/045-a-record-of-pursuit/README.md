# A Record of Pursuit

Sixteen targets sit on a four-by-four grid — square, and centred in the window. Thirty-two lines enter from beyond
the frame — each from a random point on a random edge — and converge on it. As
each one arrives it takes up its own manner of waiting: some orbiting, some
spiralling in and out, some wandering. Every so often a line gives up on its
target and sets off after the next one. What you see is not the
lines but the record they keep: a short rolling history of where each one has
just been, redrawn every frame.

Each line gets its own pursuit style, thickness, and colour from the hash. Six
palettes, six grounds each — Cyan & Coral, Light Orange & Lavendar, Magenta &
Mint, Bright Blue & Eggshell, Gold & Drab, and one called Wild Style that ignores
the pairing and takes whatever it likes.

## Colour

The original drew one of six hand-written palettes and one of its six grounds at
random. Some pairings were fine; others put line and field close enough together
that neither read. `palette.js` decides a relationship first — Complementary,
Split Complementary, Triadic, Analogous, Monochrome, or Accented Neutral — then
places the ground and eight inks in OKLCH with a guaranteed lightness separation
of 0.34.

Grounds are always dark here. That is not a stylistic preference but a
requirement: the glow only reads as bloom over a dark field, and turns to muddy
smudge over a light one.

The piece's `hashTable`, which mapped thirty-six minted hashes to fixed
palette-and-ground pairs, is gone. Those palettes no longer exist, so it could
not have honoured them — and its absence means the site cannot reproduce a
minted iteration. The table and the original palettes remain in the
Record-of-Pursuit repository.

## The glow

The swarm is split across two canvases. The first sixteen lines are composited
sharp; the second sixteen are drawn to a layer that is never composited at all —
it sits behind the picture under a thirteen-pixel blur at seven-tenths opacity,
so those lines exist only as light. The original used twenty pixels at full
strength, which swamped the drawn half; this keeps the halo without letting it
take over the picture. Half the chase is legible and half of it is atmosphere.

That effect is one line of CSS. The repo still carries `canvas_blur_rect.js`, a
whole stack-blur implementation from the commit named "Trying to glow again...
not working!" — it is loaded by the original page and never called once. The
commit three days later that got it working just showed the shadow layer and let
the browser blur it. That file is not carried over here, and neither is
`adapted.targets.js`, which contains two empty functions.

## Interaction

- **Click or tap** — a new iteration from a new hash, which clears the field and
  begins the convergence again
- **R, Space, or Enter** — the same
- `?hash=` — pin a specific iteration
- `?debug` — log the feature record, and re-enable the sketch's own logging

Reduced-motion preferences run the pursuit forward without animating and settle
on the record made by then.

## Fitting the window

The original drew into a fixed 1920 square and let the browser letterbox it, so
the lines entered from the edge of that square rather than the edge of the
window — they appeared to pop into existence in mid-air. The piece now sizes
its five layers to the viewport at the display's pixel density. The grid itself
stays square and centred: stretching it to the window's aspect pulled the
composition out of shape, so only the field around it grows.

Everything measured in pixels had been tuned against the 1920 square, so it all
hangs off one scale now: the tighter of the two grid spacings sets the orbit
radii, line weights and spiral steps, since a mark has to fit its cell in the
narrow direction. The approach is paced separately, against the *longer*
dimension — crossing a wide window is a different problem from sitting in a
cell, and pacing the journey by the short side left the swarm straggling in
long after it should have arrived. A resize re-lays the grid and the swarm
enters again.

## Notes on the port

Minted on fxhash in March 2022 as *Conversation Loops 01*. **This is not that
edition.** Work continued for eight days after the release — commits reading
"Wild Trippy", "Happy Accident... Waterfall Speed Painter", and finally "I like
it!" — and this is where it ended up. The minted version has no glow: it hides
every working layer and composites flat lines with drop shadows. Both still run;
this is the one worth showing.

The piece is vanilla canvas with no dependencies, so only the platform
boilerplate had to go. fxhash's base58 hash format and sfc32 generator are kept
verbatim, so an original `oo…` hash passed as `?hash=` reproduces that exact
iteration. Verified: rebuilding twice from one hash produces a byte-identical
canvas after a fixed number of steps, and a different hash produces a different
one.

The piece carries its own `hashTable` mapping thirty-six specific hashes to fixed
palette-and-ground pairs — one for each of the six-by-six combinations, which is
how the edition was planned. That table still works: `ootbHfbnpkBK…` resolves to
Cyan & Coral on Dark Glacier, as intended.

One change to the sketch. The palette, ground, and title were derived at the top
level of `adapted.particles.js`, which meant a new hash needed a page reload.
Those statements are now inside `selectPalette()`, unchanged and in the same
order, called once at load and again on each reseed — so the draw on `fxrand()`
is identical to the original.
