# Alphabet

A work-in-progress geometric alphabet assembled from a deliberately small kit
of parts: circles, rectangles, triangles, overlaps, and cut-outs. The main
piece drops the ten letters in `HYPERMEDIA` onto a shared ground line. Gravity,
restitution, friction, rotation, wall collisions, and letter-to-letter impulses
let the glyphs bounce, interrupt one another, and eventually settle. Once the
pile is still, every letter rights itself, sprouts two black legs, and begins
patrolling the line. Walkers reverse at the edges and scatter when they meet.

The letterforms borrow the constructional playfulness of mid-century shape
alphabets without tracing a single typeface. Each glyph has its own palette
and construction, while all twenty-six share a 100 × 100 coordinate system and
an 80 × 80 working box.

Click or tap the stage, or press `Enter` or `Space` while it is focused, to
drop the word again. With reduced motion enabled, the word is placed directly
on fully grown legs without animation.

## Debug view

Append `?debug=true` to the URL to replace the physics stage with the complete
A–Z specimen grid.

- Select **Show construction**, or press `D`, to reveal the shared working box,
  centerlines, and origin point for every glyph.
- The grid reflows from five columns on wide screens to two columns on the
  narrowest phones.

## Archive

The piece is plain HTML, CSS, JavaScript, and inline SVG with no build step,
font download, framework, or network dependency.
