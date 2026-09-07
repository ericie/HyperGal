# Drips

Ink enters from several broad, uneven points along the top of a gritty masonry
wall. The piece opens with the seep already roughly halfway down the surface,
then advances quickly enough for pooling and overflow to remain visible.

The masonry color is the height field rather than decoration: lighter cells
are high ground, dark blue-gray cells are deep, mortar joints form recessed
channels, and irregular cool patches are basins. Each cell compares its liquid
surface height with the terrain and water level around it. Liquid seeks the
lowest neighbor, fills a depression until the combined surface reaches its
rim, then spills over or escapes through a lower side channel.

The dark trail records where liquid has passed while blurred margins, rounded
fronts, lateral pooling, and a faint mineral-blue glint keep the active edge
wet. Click or tap anywhere to add a small spill.
Press R, Space, or Enter to generate a new wall. Add `?seed=1234` to the URL to
revisit a particular arrangement.

Reduced-motion preferences render a settled, static seep. The piece is
self-contained vanilla HTML, CSS, and Canvas with no runtime dependencies.
