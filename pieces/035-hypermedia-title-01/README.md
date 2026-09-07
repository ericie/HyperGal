# Hypermedia Title 01

A work-in-progress geometric alphabet assembled from a deliberately small kit
of parts: circles, rectangles, triangles, overlaps, and cut-outs. The main
piece drops the ten letters in `HYPERMEDIA` onto a raised rule, well inside its
ends so the whole word lands, with three angled platforms staggered through the
space below it. Gravity, restitution, friction, rotation, wall collisions, and
letter-to-letter impulses let the glyphs bounce, interrupt one another, and
eventually settle. Once the pile is still, every letter rights itself, sprouts
two color-matched rubbery legs, and begins patrolling.

The top platform is a long teeter-totter balanced on a fixed triangular
fulcrum. It begins level while the letters land, then rocks slowly through a
thirteen-degree arc. The rendered plank and its collision surface share the
same angle, so the letters lean with it and gravity pulls them toward the low
end. They continue walking while they slide, which makes the line thin out
more decisively on each swing. A dropped letter tumbles down the angled lower
platforms, bouncing off each one it clips, and leaves the frame. When the top
platform is bare the word falls again.

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
