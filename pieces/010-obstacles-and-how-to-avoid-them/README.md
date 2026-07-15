# Obstacles and How to Avoid Them

A responsive browser wall drawing built from simple instructions.

Muted ink and pigment obstacles are placed as unrotated square blocks in a
tight, rough responsive grid. Some blocks are offset from their row or column,
so the field reads like a city from overhead rather than a perfect checkerboard.
Their visible bodies are spaced by conservative bounding circles, so they never
overlap or touch the frame. Each block keeps a composed grid position, then
sways up and down on its own slow wave phase. The horizontal lines are
regenerated around those moving positions and constrained against vertical
slices of each square's actual silhouette.

Click, tap, Space, or Enter to reseed the arrangement. Add `?seed=<value>` to
the URL for a repeatable starting composition.

Open `index.html` directly in any browser.
