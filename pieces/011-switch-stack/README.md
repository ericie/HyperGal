# Switch Stack

A pure black-and-white scroll piece about the exact moment a state changes.

The page is a tall stack of boxes, one or two per row. Every box begins black
and says ON in block glyphs. Single-box rows shift width and alignment so the
stack does not become a dead grid. As scrolling carries a box toward the
vertical midpoint, a binary dither clears the surface from black to white. The
state word clears a small binary field before drawing, so the label stays crisp
while the surrounding box remains noisy. At the midpoint the surface is fully
white and the word flips to OFF.

There are no gradients, opacity fades, gray values, external assets, external
scripts, or dependencies. The piece is drawn with Canvas 2D rectangles in only
`#000` and `#fff`.

Open `index.html` directly in any browser.
