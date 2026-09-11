# Hypermedia Title 01

A work-in-progress geometric alphabet assembled from a deliberately small kit
of parts: circles, rectangles, triangles, overlaps, and cut-outs. The main
piece turns the ten letters in `HYPERMEDIA` into the moving parts of a small
Rube Goldberg machine. A motorized conveyor introduces them from the upper
left, in outside-in order, and carries each glyph to a drop above the central
teeter-totter. Gravity, restitution, friction, rotation, wall collisions, and
letter-to-letter impulses let the glyphs interrupt one another and eventually
settle. Once the pile is still, every letter rights itself, sprouts two
color-matched rubbery legs, and begins patrolling.

The top platform is a long teeter-totter balanced on a fixed triangular
fulcrum. It starts answering the instant the first letter lands, then rocks as
far as thirty degrees to either side. Each collision transfers momentum
according to the letter's mass, landing speed, and distance from the pivot,
while letters already resting on the beam keep pulling it through their
weight. The rendered plank and its collision surface share the same angle, so
the letters lean with it and gravity pulls them toward the low end. They
continue walking while they slide, which makes the line thin out more
decisively on each swing.

Two banks of four dominoes ride near the ends of the moving beam. A walking
letter can bump the inner domino, starting an outward chain reaction. The last
domino transfers its fall into a nearby free-spinning bar, and those spinners
can in turn collide with the teeter or deflect a letter leaving the beam. When
the machine is empty, the dominoes reset and the conveyor feeds the word in
again.

Every letter is weighed before it drops. Its artwork is sampled on a grid to
find how much ink the glyph is actually drawn from and where that ink balances,
with cut-outs in the ground colour taking mass away rather than adding it — so
`D` lands about twice as heavy as `A`, `P` carries its weight left of centre,
and `Y` rides high while `A` sits low. That mass is what the plank weighs: the
beam answers to each letter's own weight times its distance from the fulcrum,
so one heavy glyph out at the tip outbalances several light ones loitering near
the middle. Mass also decides who wins a collision, how far a shove carries,
and how readily a letter perched at the end tips over its own balance point.
Each letter is dealt a grip score on every drop, which sets how much of the
slope it gives away: a sure-footed one holds its line across a steep plank
while a poor one is carried off it, so the same word thins out in a different
order each time.

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
