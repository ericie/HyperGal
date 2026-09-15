# Forest of Rings

A companion to *Growth Rings*, now focused on one tree. A bare vertical line
starts in the exact center and spans the window from top to bottom. Wide,
lengthwise grain grows outward until the tree covers the whole screen.

The top and bottom stay fixed. Older grain stays in place as new layers
accumulate on both sides of the vertical pith. There are no closed annual
ovals, stacked caps, ground illustration, or roots. The final width is fitted
to both screen edges on every resize.

Latitude, sun, wind, rainfall, elevation, soil, fire, and insect history still
shape the grain. The single tree uses the foreground palette. Forest spacing
and planting controls have been removed; growth starts immediately.

The panel starts closed. `New tree` generates a new history; `Replay growth`
keeps the same tree and starts again from the center line. Point or tap the tree
to inspect its record. Reduced motion shows the completed tree immediately.

Query parameters `seed` and `age` open a specific state. `?seed=woodland&age=0`
shows the starting line; `?seed=woodland&age=96` shows the full-width tree.
The piece remains self-contained Canvas 2D and runs directly from `index.html`.
