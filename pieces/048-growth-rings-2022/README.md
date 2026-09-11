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

**The grid.** Three to twenty-two cells along the short side of the window,
and as many as fit at that size along the long side. Cells are filled in
random order until every one is full: each takes a cell-sized slice from just
off the centre of one of the ten library cross-sections — the four quadrants
around the centre in rotation, jittered by up to twenty pixels — so every cell
carries a fragment of curve and the grid reads as a wall of sawn timber.

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

The picture fills the window whatever its shape. There is no animation.

## The window

fxhash served this as a fixed 1920 × 1920 square, letterboxed. Here the stage
takes the window's aspect ratio instead, with the same number of pixels as
that square — a square window still gets exactly 1920 × 1920; a 16:9 one gets
2560 × 1440 — so nothing is cropped, stretched, or letterboxed, and the
drawing's scale (ring thicknesses are in pixels) stays what it was. The grid
keeps `gridSize` cells along the short side and adds cells along the long
side; the overlay disc and the voids are sized to the short side and placed
relative to both. A window that changes shape gets the same hash drawn again
at the new shape, a moment after the resize ends (changes under 1% are left
alone); a fresh load at that shape draws the identical picture.

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
`?hash=` reproduces that exact iteration in a square window. In any other
window it is the same iteration — same palette, grid size and overlay, which
are dealt before anything is drawn — recomposed for that shape: the ring
count follows the stage, so the wobbles land differently. Verified against the recovered
build: fifty-two hashes covering all nine overlays, all three canvases (grid,
overlay, and their composite) compared as PNG — fifty-two of fifty-two
byte-identical. Dealing a new hash in place by clicking was checked the same
way against a fresh load.

The sketch files carry a handful of edits so the stage need not be square.
Each is a no-op at 1920 × 1920, which is the property the parity check above
guards — it was re-run after these edits: sixty-eight hashes, covering all nine
overlays, sixty-eight of sixty-eight byte-identical.

- `hmc-app.js`: the ten library canvases were created transposed
  (`height=stage.w, width=stage.h`) — invisible on a square, wrong otherwise —
  and are now `stage.w × stage.h`. The grid is `round(gridSize × w/short)`
  columns by `round(gridSize × h/short)` rows instead of `gridSize` square;
  the counts are passed on as `gridCols`/`gridRows`.
- `hmc-growth-circles.js`: the library discs grow to half the long side
  (`max(w,h)/2`, was `w/2`) so the slices cut near their centres are always
  covered; the overlay disc (`.28 ×`), the Void (`/5`) and the Joined discs
  (`/5.5`) are sized to the short side (`min(w,h)`, was `w`); Four Voids uses
  the column width and row height separately for its corner offsets.

Two things the page does around them:

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
