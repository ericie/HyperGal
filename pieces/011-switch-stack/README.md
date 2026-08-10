# Switch Stack

A black-and-white scroll piece with a hot-pink threshold, about the exact
moment a state changes.

The page is a varied-height masonry of boxes packed edge to edge. Half contain
block-glyph ON/OFF labels; half contain utilitarian light-switch diagrams with
a faceplate, screw heads, markings, pivot, and moving lever. Boxes below the
hot-pink midpoint are black and ON; boxes above it are white and OFF. Crossing
the line triggers a self-contained ten-frame binary transition instead of tying
the fill amount to scroll position. Dither is restricted to word tiles; switch
tiles keep solid fields while the lever travels toward its new marking over the
same ten frames. The sequence reverses when a box crosses back.

There are no gradients, opacity fades, gray values, external assets, external
scripts, or dependencies. The piece is drawn with Canvas 2D rectangles in
`#000`, `#fff`, and a single `#ff1493` overlay line.

Open `index.html` directly in any browser.
