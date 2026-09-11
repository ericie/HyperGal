# Growth Rings

A still drawing. It starts with a seed and builds expanding growth rings,
grows a catalogue of them, slices the catalogue into a grid, and lays one of
nine overlays on top.

Not to be confused with **015 Growth Rings**, the 2026 animated trunk. This is
the 2022 fxhash release of the same name; its page title was the working
name, *Memory of Growth*.

## How it is drawn

**A ring.** Rings are built from the centre outward. Each one is traced in
steps of 0.02 radians, and its thickness wanders: on two steps in a hundred
the target thickness jumps by up to sixty pixels, and the ring eases toward
that target, tightening back to its base thickness in the last stretch so the
loop closes. Every ring is laid on the one before it at the same angle, so a
wobble in an early ring is inherited by every ring outside it — which is what
makes the result read as wood rather than as concentric circles. Ring
thickness is dealt between ten and twenty-five pixels.

**A cross-section.** Rings are drawn from the outermost in, each filled with a
colour dealt from the palette and stroked nine pixels wide in a darker version
of itself. The overlay disc stops at 28% of the field, and its final ring is
drawn instead in the palette's *separator* colour with a fifty-five pixel halo
in its *shadow* colour. The ten library cross-sections run all the way to the
edge of their canvases with no separator.

**The grid.** Three to twenty-two cells a side. Cells are filled in random
order until every one is full: each takes a cell-sized slice from just off the
centre of one of the ten library cross-sections — the four quadrants around the
centre in rotation, jittered by up to twenty pixels — so every cell carries a
fragment of curve and the grid reads as a wall of sawn timber.

**The overlay**, one of nine, over the grid:

- **Center** — the disc, at the centre. Five of the twelve slots, so it is
  the most common.
- **Spread** — three copies of the disc, each scaled 58–78%, one to the right,
  one to the left, one in the middle, overlapping.
- **Passage** — two copies at 120%, one pushed down, one pushed up, leaving a
  horizontal channel of grid between them.
- **Void** — the disc is discarded; a white circle a fifth of the field wide
  sits at the centre.
- **Joined** — two large discs on the diagonal, one in the shadow colour, one
  in the separator colour, each with a halo of the other.
- **Four Voids** — four white circles at grid-aligned positions, sized to the
  grid.
- **Diagonal Passage 1** and **2** — two copies at 140% in opposite corners,
  leaving a diagonal channel.

Sixteen palettes: Bright Secondary, Cool Gray, Cedar, Green Gate, Contemporary
Memphis, Butter, Night Sky, Vaporwave, Viking, Zebra, Lissitzky, Olive, Miami
Cottage, Peach, Arctic, and Hokusai. The palette is dealt with `Math.round`,
so the first and last — Bright Secondary and Hokusai — come up half as often
as the rest.

## Controls

- Click or tap, or press R, Space or Enter: a new iteration
- S: save the picture as a PNG
- `?hash=oo…` reproduces a specific iteration; `?debug` logs the feature
  record to the console

The piece is a fixed 1920 × 1920 square letterboxed into the window on a
mintcream ground — as it shipped. There is no animation.

## Notes on the port

Published on fxhash on June 13 2022 as Hypermedia Club, generative token
14783, an edition of 64.

No source survives for this piece — not in any repository, on any disk, or in
any cloud folder. What survives is the build fxhash served, recovered from
IPFS by following the chain: the mint operation from the Hypermedia Club
wallet, the token metadata it wrote, and that metadata's `generativeUri`
(project CID `Qmct3YZnVwfRbHRtE5oosNNBMh4qv1ecYf8XEpjgMFuvQa`). That build is a
webpack-minified bundle. The five JavaScript files here are those minified
files reformatted for reading — whitespace and line breaks only, no renaming
— and the archive copy sits in `_Check/_fxhash-minted-builds/06-growth-rings`.

fxhash's base58 hash format and sfc32 generator are kept verbatim, and random
values are drawn in the original order, so an original `oo…` hash passed as
`?hash=` reproduces that exact iteration. Verified against the recovered
build: fifty-two hashes covering all nine overlays, all three canvases (grid,
overlay, and their composite) compared as PNG — fifty-two of fifty-two
byte-identical. Dealing a new hash in place by clicking was checked the same
way against a fresh load.

Nothing in the sketch files is changed. Two things the page does around them:

- `init()` runs `bgGrid = new bgGrid`, which replaces the constructor with its
  instance; a second run would throw. The page keeps the constructor and puts
  it back before each new iteration. This never surfaced on fxhash, where
  `init()` ran once per page.
- `init()` appends ten full-size library canvases and paints over every layer
  without clearing, so a new iteration empties the library and clears the
  four canvases first.

The shipped `hmc-saver.js` is folded into the page: S still saves, from the
same composite canvas it read, but double-click no longer does (a click now
deals a new hash), the file is a real PNG rather than JPEG data under a `.png`
name, and the keypress logging is gone.

Quirks kept because they are in the picture:

- The grid cell tint (`rgba(0,0,0,.1–.3)` by a per-cell tone) is painted under
  each slice, and the slices are opaque, so it is invisible. The draws that
  choose the tones still advance the sequence.
- Cells are chosen at random until all are full, so most of the sequence is
  spent re-picking cells already filled.
- The shipped CSS hid the composite canvas (the selector meant to hide the
  overlay was misspelled `#hmcCompppp`), so the window shows the grid and the
  overlay stacked; the saver read the composite. Same picture either way.
- The sketch logs its layout choice for each of the eleven cross-sections.
