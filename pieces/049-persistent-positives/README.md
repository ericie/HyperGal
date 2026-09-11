# Persistent Positives

Communication and progress are a cycle of building, entropy, and repair. This
piece explores that idea through a series of simple positive four-letter words
that struggle for legibility under a barrage of noise. It is meant as a moment
of uplift and encouragement to continue your fight, whatever that may be.

## What it does

**The field.** Four hundred shapes live on the field at once. Each is a circle,
rectangle or triangle with its own rotation, proportions, colour from the
palette, one of five texture tiles laid over it at low opacity, and a soft
two-step drop shadow. A shape lives thirty to two hundred and seventy frames,
growing from nothing to a diameter of ten to fifty-five pixels; when it dies it
is stamped onto the ground canvas for good and a new shape is born somewhere
else. The ground is therefore the accumulation of everything that has died —
that is the persistence — and the live layer is only what is still growing.

**The word.** One of HOPE, LOVE, GIVE, MAKE, GROW, LIVE, set in Space Mono at
five hundred to a thousand pixels in one of eleven layouts: a row across the
top, the centre, or the bottom; the four letters scattered around the centre;
the four as a giant two-by-two block; two diagonals; three verticals (left,
centre, right); and the word twice, stacked. The word is drawn into a hidden
buffer; it never appears on screen directly.

**Seeking.** After the opening 520 frames the shapes begin sampling that
buffer — fifty random points a frame — collecting up to 2,200 places where
the word is. From then on a share of every new shape (twenty to fifty-five
percent, set by the layout) is a *seeker*: it is born on one of those points,
takes the palette's highlight colour as a slight gradient, drops its texture,
and grows a little smaller than the rest. Over a few hundred frames the word
surfaces out of the noise.

**Entropy.** 1,600 frames into each cycle the seekers stop being replaced.
The ones alive die off within a few seconds, the field keeps growing, and the
word is buried. A thousand frames later the buffer is redrawn — the same
layout the first time round, a fresh one every cycle after that — the
collected points are discarded, and the seeking starts again.

Shape mixes are dealt separately for the field and for the word: Even Mix
(three of the seven slots), All Circles, All Triangles, All Rectangles, or
Right Angles (rectangles held at 0° or 90°). Fifteen palettes, each with its
own ground and highlight: Dandelions on Teal, Faded, Bold Cyan, Grayscale,
Hokusai, Arctic, Peach & Drab, Miami Cottage, Viking, Vaporwave, Night Sky,
Contemporary Memphis, Butter, Cedar, Green Gate. A sixteenth, Olive, is written
out but not in the pile.

## Controls

- Click or tap, or press R, Space or Enter: a new iteration
- S: save the picture as a PNG
- `?hash=oo…` reproduces a specific iteration; `?debug` logs the feature
  record to the console

The piece is a fixed 1920 × 1920 square letterboxed into the window on black —
as it shipped.

## Notes on the port

Published on fxhash on August 21 2022 as Hypermedia Club, generative token
18413, an edition of 128.

No source survives for this piece — not in any repository, on any disk, or in
any cloud folder. What survives is the build fxhash served, recovered from
IPFS by following the chain: the mint operation from the Hypermedia Club
wallet, the token metadata it wrote, and that metadata's `generativeUri`
(project CID `QmSzbPooxGVhku3saKSCVzceFDjUehmwzpxXmQEhHTEtUw`). That build is a
webpack-minified bundle. The eight JavaScript files here are those minified
files reformatted for reading — whitespace and line breaks only, no renaming
— and the archive copy sits in
`_Check/_fxhash-minted-builds/08-persistent-positives`. Space Mono ships with
it under the SIL Open Font License, as it did.

fxhash's base58 hash format and sfc32 generator are kept verbatim, and random
values are drawn in the original order, so an original `oo…` hash passed as
`?hash=` reproduces that exact iteration. Verified against the recovered
build with `requestAnimationFrame` stepped by hand once the font was in:
sixteen hashes run 700–900 frames (through the word's arrival) and three run
3,400 frames (through the first burial and relayout), the composite canvas
compared as PNG — every one byte-identical. Dealing a new hash in place by
clicking was checked the same way against a fresh load over 800 frames.

One change to the sketch. `init()` started the frame loop with a bare
`requestAnimationFrame(performAnimation)` and only stored the id from the
second frame on, so the loop could not be reliably cancelled. The call now
assigns to `request` like every later frame does. Around it, a new iteration
cancels the loop, empties the library of texture tiles and the shape layer
(which `init()` appends afresh), clears the three canvases (the word buffer
is painted without clearing), and resets the feature record.

The shipped `hmc-saver.js` is folded into the page: S still saves, but
double-click no longer does (a click now deals a new hash), the file is a
real PNG rather than JPEG data under a `.png` name, and the keypress logging
is gone.

Quirks kept because they are in the picture:

- Texture is dealt as one of six numbers for a list of five tiles. The sixth
  resolves to no pattern, so those shapes get their texture pass in their own
  colour instead — a touch more solid than their neighbours.
- The first cycle ends by redrawing the same layout; a new layout is only
  picked from the second cycle on.
- Palette and shape mixes are dealt with `Math.round`, so the ends of each
  list come up half as often: Dandelions on Teal and Green Gate, the first Even
  Mix slot and Right Angles.
- The feature record spells it `intial_layout`, as minted.
- Sampling the word buffer fifty times a frame makes Chrome warn that the
  canvas would be faster with `willReadFrequently`. Setting it would change
  the rasteriser and risk the pixel match, so it is left alone.

Reduced motion: once the font is in, the system is run forward 1,100 frames
without animating — past the word's arrival — and the loop is stopped there.
