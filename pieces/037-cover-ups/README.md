# Cover Ups

Cover Ups is a deterministic fantasy alphabet made from one continuous-line
grammar. Each Latin letter A–Z maps to its own illegible symbol. The symbols
share fixed entry and exit points, allowing adjacent letters to join without a
break. Six structural families—loop, stem, bowl, cross, hook, and fold—keep the
writing from collapsing into a single vocabulary of spirals. Cursive K, T, R,
P, and Q contribute gestures such as crossing arms, tall stems, bowls, and
escaping descenders without being reproduced as legible Latin forms.

The main view begins with five to ten random words from the complete quotation
in The Greater Whole already distributed across the wall. It covers one word,
writes one new word, then selects another waiting word to cover. This alternating
cycle keeps several exposed marks in view while the wall steadily accumulates
finished repairs. Words range from small incidental marks to near-viewport-scale
gestures, but their connected writing always runs horizontally. Each cover-up
independently chooses its application direction: most raster across horizontal
rows, while roughly two in five raster through vertical columns with alternating
downward and upward roller passes. Each load begins on one of five walls derived
from urban cover-up photographs: whitewashed brick, a ribbed rolling door,
rose-colored block, red brick, or peeling plaster. Mortar, seams, chips, grit,
stains, and water runs are generated locally and remain visible through the
new paint.

Every cover-up is measured from the visible stroke bounds and receives only a
narrow, nearly even roller allowance, avoiding arbitrary blank space before or
after the symbols. The paint's drawing direction changes without rotating or
rearranging the word beneath it.
On red brick, an occasional pair of offset rectangles echoes the photographed
repairs. Long edge segments stay nearly straight while a slower drift and a few
short drag-outs keep the perimeter from becoming geometric. The coat is mostly
continuous: large, shallow variations in opacity and a small number of dry
streaks let mortar, ribs, and plaster remain visible without turning the paint
into digital speckle. Alternating rows or columns assemble each cover-up without
lifting the implied roller. Each wall carries its own limited
family of plausible repair colors. Completed words and their paint remain
permanently flattened into the wall; the history layer is never cleared, even
when the viewport is temporarily made smaller. A word may cross a viewport edge,
but its placement keeps at least half of its measured bounds visible.
Click or press Space/Enter to complete the current word-and-paint cycle and
advance immediately. Reduced-motion preferences add completed static cycles
only through direct interaction.

Append `?debug=true` to show a labeled A–Z specimen grid. Each caption also
names the symbol's structural family. Latin letters appear only as mapping
labels in the debug view; they are not used to construct the symbols.

Append `?surface=white-brick`, `rolling-door`, `rose-block`, `red-brick`, or
`peeling-plaster` to hold one wall for art-direction checks. Without that
parameter, one surface is selected per load.

The piece is self-contained vanilla HTML, CSS, SVG, and Canvas with no runtime
dependencies.
