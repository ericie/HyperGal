# Root / Ruin

Two to four angular rock formations begin each scene. Their outlines, heights and widths vary, and one small plant starts at a random surface position. Flowers open, bees land and leave, fruit forms and drops. Fruit rolls and settles, then releases a puff of dandelion-like seeds that drift between rocks and germinate when they land.

## Rock and plant physics

Each intact formation is one solid polygon. Root pressure reveals a fracture pattern, then divides the actual outline into three to five convex pieces using Voronoi clipping. The child polygons preserve the parent's total area and inherit its motion. A small separating impulse represents the root wedge. From there, gravity, inertia, angular motion, friction and rock-to-rock collisions make the pieces tip, tumble, collide and form piles. Large fragments can split again under roots or sufficiently hard impacts. Rubble stays in the scene; minimum fragment size and a body limit bound the simulation.

Plants store a fixed attachment point and orientation in their supporting rock's local coordinates. They translate and rotate with that body. When a rock fractures, the plant transfers to the child containing its root without changing its world position or orientation. The stem is never repositioned using a terrain-height lookup. Rock overlapping a stem, or a rock rolling its plant into the floor, kills the plant. Dead plants stop growing, fruiting and applying root pressure, then wilt and fade.

Matter.js 0.20.0 supplies the rigid-body collision solver. Its minified distribution and MIT license are vendored in `vendor/`; the sketch makes no network requests and works directly from `index.html`. Intact formations are static until their first fracture. Fruit uses physical circle bodies in the same world. Floating seeds use a lightweight wind model.

There is no visible text or control interface.

- **Space** pauses or resumes.
- **R** generates another landscape and starting plant.
- **S** saves the canvas as a PNG.

The simulation advances at 120 Hz, pauses while hidden, and starts paused for reduced-motion preferences. Limits: 48 living plants, 65 fruit, 180 airborne seeds, roughly 100 rock bodies and 250 dust particles.

Run `node scripts/check-root-ruin.mjs` from the repository root to check stationary intact terrain, conserved fracture area, fixed rotating plant attachments, crushing, stable rubble contact and 150 seconds of natural growth.
