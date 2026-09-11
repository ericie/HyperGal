# Nothing but Flowers

Dozens of particles got together and decided to draw. They drew nothing but
flowers.

Fifty to eighty lines share one square field. Each picks a target, flies to it,
and once it arrives it settles into a jittery loop around that point — a radius
of fifty to a hundred pixels, shaken by up to a hundred more on every frame.
While it loops, its short trail is stamped onto a painting layer that is never
wiped: first in the ground colour, offset diagonally by the line's own width,
then in its colour at half strength. The offset stamp is a shadow, the loop is
a petal, and a few hundred frames of looping is a blossom. After six hundred to
thirteen hundred frames the line gives up on its target, flies to another, and
starts a new flower there. In flight it draws nothing permanent.

Roughly one line in seven is an eraser: its colour is the ground, so its
flowers cut holes in everyone else's.

## Layouts

The targets are a small solar system or a scattered field, chosen by the hash:

- **Circle** and **Ring** — a Sun at the centre with fifteen to twenty-three
  bodies orbiting it, one in five orbiting another body instead as a moon,
  thirty to eighty pixels from it. For Circle the first three bodies sit far
  out (400 to 820 pixels), the next three mid-way (300 to 720), the rest
  anywhere from 120 to 540. For Ring every body sits far out, so the flowers
  gather into a wreath. Ring is dealt three times as often as Circle.
- **Square** — five hundred targets scattered inside a 400-pixel margin.
- **Fill** — five hundred targets scattered edge to edge.
- **Sides** — five hundred targets in the top and bottom 600-pixel bands.
- **Frame** — five hundred targets in a 400-pixel band around the edges, with
  the Sun and the first four bodies pinned near the centre.

The scattered layouts re-scatter every 4020 frames — a little over a minute —
so the lines drift to new ground and the field keeps filling.

## Colour

Nine palette slots holding eight palettes. Four are monochrome — Light Olive,
Periwinkle, Butter on Mustard, Linen on Parchment — and four pair two line
families over a choice of grounds: Cyan & Coral, Bright Blue & Eggshell,
Gold & Drab, and Wild Style, which takes nine unrelated colours and is listed
twice so it turns up more often. Two more — Light Orange & Lavendar, Magenta &
Mint — are written out in the file but were never put in the pile. Lines are
five widths: 2, 6, 12, 18 and 24 pixels.

Slots are dealt with `Math.round`, so the first and last entry of every list
come up half as often as the others: hairline and very-thick lines, Light
Olive, and the second Wild Style slot.

The fxhash listing said "5 layout types, 6 base color palettes." The code has
six shapes and eight palettes. Both counts are in the record now.

## Controls

- Click or tap, or press R, Space or Enter: a new iteration
- S: save the picture as a PNG
- `?hash=oo…` reproduces a specific iteration; `?debug` logs the feature
  record to the console

The piece is a fixed 1920 × 1920 square, letterboxed into the window, with the
bars in the ground colour — as it shipped.

## Notes on the port

Published on fxhash on June 22 2022 as Hypermedia Club, generative token
15289. The source was never given its own repository; it is the
`Missy-Messy-Mandala` branch of `Record-of-Pursuit`, which branched from the
Conversation Loops codebase in March 2022 ("Messy Mandela", then "Missy
Mandala") and was published from that branch three months later.

Built from the shipped package, `editions/flowers-08.zip`, which is the
minified webpack build of that branch's `public/` folder. The build fxhash
actually served was later recovered from IPFS (project CID
`QmPFdnrAbXCjZxXbPZq19X311CDRZjAfXyaknfVhw7GUqn`, via the token metadata the
mint wrote on chain) and compared: every artwork file is byte-identical to the
zip; only the platform's own snippet in `index.html` differs. The three drawing
files here — `adapted.vector.js`, `adapted.library.js`, `adapted.particles.js`
— are the unminified sources for what is in the zip. fxhash's base58 hash
format and sfc32 generator are kept verbatim, and random values are drawn in
the original order, so an original `oo…` hash passed as `?hash=` reproduces
that exact iteration.

Verified against the zip build: with `requestAnimationFrame` stepped by hand,
twenty hashes covering all six layouts were run for 4500 frames in each build
and the composite canvases compared as PNG — twenty of twenty byte-identical.
Dealing a new hash in place by clicking was checked the same way against a
fresh load of that hash over 1500 frames.

One change to the sketch, for reseeding. The four draws the hash makes before
anything starts — line count, layout, palette, ground — were made at the top
level of `adapted.particles.js`, which meant a new hash needed a page reload.
They are now inside `selectIteration()`, unchanged and in the same order,
called once at load and again on each click. A click also clears the painting
layer and resets the sketch's frame counters to their load-time values.

Two files from the package are not here because they never touched the
picture: `adapted.background.js` defined a 40,000-dot spray for a fifth layer
that the entry point never called (so it never drew and never consumed a
random number), and `adapted.targets.js` was two empty stubs. `hmc-saver.js`
is folded into the page: S still saves, but double-click no longer does (a
click now deals a new hash), the file is a real PNG rather than JPEG data
under a `.png` name, and the keypress logging is gone. The hidden `#content`
div that showed the hash is not recreated; nothing is drawn over the artwork.

Quirks kept because they shape the output:

- The update loop runs to `length - 1`, so the last line dealt never draws.
  A swarm of eighty shows seventy-nine.
- Each line draws a random width that is immediately overwritten by its
  width class; the draw still advances the sequence.
- `percentSystem()` runs before any line exists, so the alternate
  "Scribbling" title it could produce never appears.
- Lines spawn one every five frames, so a swarm takes up to four hundred
  frames to fill out.

The original CSS hid layers one to four and, by a typo, left the fifth
visible; it was always empty. All five working layers are hidden here.

Reduced motion: the system is run forward 1500 updates without animating and
the frame loop then holds the picture.
