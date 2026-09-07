# Cover Ups

Cover Ups is a deterministic fantasy alphabet made from one continuous-line
grammar. Each Latin letter A–Z maps to its own illegible symbol. The symbols
share fixed entry and exit points, allowing adjacent letters to join without a
break. Six structural families—loop, stem, bowl, cross, hook, and fold—keep the
writing from collapsing into a single vocabulary of spirals. Cursive K, T, R,
P, and Q contribute gestures such as crossing arms, tall stems, bowls, and
escaping descenders without being reproduced as legible Latin forms.

The main view selects one random word at a time from the complete quotation in
The Greater Whole, draws its connected fantasy symbols at a random safe
position and scale, then covers the word with a hand-applied field of paint on
a weathered architectural surface. Each load begins on one of five walls derived
from urban cover-up photographs: whitewashed brick, a ribbed rolling door,
rose-colored block, red brick, or peeling plaster. Mortar, seams, chips, grit,
stains, and water runs are generated locally and remain visible through the
new paint.

Most cover-ups extend beyond the width of the word as one low, broad rectangle.
On red brick, an occasional pair of offset rectangles echoes the photographed
repairs. Long edge segments stay nearly straight while a slower drift and a few
short drag-outs keep the perimeter from becoming geometric. The coat is mostly
continuous: large, shallow variations in opacity and a small number of dry
horizontal streaks let mortar, ribs, and plaster remain visible without turning
the paint into digital speckle. Four to eight alternating horizontal passes
assemble the cover-up from top to bottom. Each wall carries its own limited
family of plausible repair colors. Once a cover-up is complete, the next word
begins. No more than two finished repairs remain on the wall before the field
clears for the next one. A word may cross a viewport
edge, but its placement keeps at least half of its measured bounds visible.
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
