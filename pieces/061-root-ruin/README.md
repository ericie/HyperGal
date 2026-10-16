# Root / Ruin

One crooked plant begins alone on a dominant, off-centre rock. A low outcrop and a taller, cropped formation frame the valley beyond. The composition varies in position, height and occasional mirroring. The first plant has a long curled leaf and a five-petaled flower; later plants vary in stature, lean, leaves and petals.

The opening takes time: growth unfolds over 18 seconds, the flower opens gradually, and a bee arrives, rests and leaves before the first fruit falls around 50 seconds into the scene. Each fruit releases just three drifting seeds. New plants are spaced at least 65 world units apart, births are separated by 18 seconds, and at most nine plants live at once. Life cycles last roughly 72–88 seconds.

After a plant dies, its stem bends over 12 seconds and remains for 75 seconds. Germination and root pressure pause for 14 seconds, or 24 seconds for the first plant; other plants grow much more slowly during that interval. Surviving seeds keep drifting. Loss is determined by physical contact, not a scripted death.


## Rock and plant physics

Each intact formation is one solid polygon. Root pressure reveals a fracture pattern, then divides the actual outline into three broad convex pieces using Voronoi clipping. The child polygons preserve the parent's total area and inherit its motion. A small separating impulse and a brief force at the root pocket prise the split apart. Hairline cracks reveal internal seams progressively; the entire subdivision is not outlined at once. Higher friction and lower restitution reduce bouncing, and fractures are spaced at least 12 seconds apart during growth. From there, gravity, inertia, angular motion, friction and rock-to-rock collisions make the pieces tip, tumble, collide and form piles. Large fragments can split again under roots or sufficiently hard impacts. Rubble stays in the scene; minimum fragment size and a body limit bound the simulation.

Plants store a fixed attachment point and orientation in their supporting rock's local coordinates. They translate and rotate with that body. When a rock fractures, the plant transfers to the child containing its root without changing its world position or orientation. The stem is never repositioned using a terrain-height lookup. Rock overlapping a stem, or a rock rolling its plant into the floor, kills the plant. Dead plants stop growing, fruiting and applying root pressure. The framing eases outward if a falling plant approaches the edge of the view.

Matter.js 0.20.0 supplies the rigid-body collision solver. Its minified distribution and MIT license are vendored in `vendor/`; the sketch makes no network requests and works directly from `index.html`. Intact formations are static until their first fracture. Fruit uses physical circle bodies in the same world. Floating seeds use a lightweight wind model.

There is no visible text or control interface.

- **Space** pauses or resumes.
- **R** generates another landscape and starting plant.
- **S** saves the canvas as a PNG.

The simulation advances at 120 Hz, pauses while hidden, and starts paused for reduced-motion preferences. Limits: 9 living plants, 12 fruit, 24 airborne seeds, roughly 100 rock bodies and 250 dust particles.

Run `node scripts/check-root-ruin.mjs` from the repository root to check stationary intact terrain, conserved fracture area, fixed rotating plant attachments, crushing, stable rubble contact and 240 seconds of natural growth and lingering dead stems.
