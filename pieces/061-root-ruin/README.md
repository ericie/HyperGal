# Root / Ruin

A small silhouette plant lives on a black hill against warm ivory. Its flower opens, a bee lands and leaves, the petals close around a fruit, and the fruit drops. Gravity carries it onto the hill, where it rolls, settles, and melts into three new seedlings. Their roots cut into the ground. Each generation repeats the cycle while older stems grow taller and roots reach deeper.

The hill is made of rigid triangular fragments. Intact rock remains completely still. Growing roots cut cracks into it and accumulate pressure through the hill. Exposed fragments break away from the flanks inward, tip outward, and fall under gravity; the small angular pieces settle as rubble. Plants travel downhill with their fragment and remain on its upper surface. Fruit collides with the moving triangle surfaces, rolls downhill, and spreads seeds along the hill rather than collecting only at the summit. Thin ivory root incisions and cracks reveal the pressure beneath the silhouette.

The sketch has no visible text or controls. Keyboard shortcuts remain available.

Open `index.html` directly; no dependencies, server or network requests are needed.

- **Space** stops or resumes the simulation.
- **R** begins again with one little plant.
- **S** downloads a PNG.

A flower-and-fruit cycle takes 24 seconds. New seedlings appear around 25 seconds after starting; substantial fractures accumulate over the following minutes. The simulation uses fixed 120 Hz physics steps and 15 Hz root damage checks, with limits of 48 plants, 80 fruit and 300 dust particles. Once the plant population is full, plants continue flowering and fruiting as their roots dismantle the remaining hill. Fragments collide with the ground; contact between rubble fragments is approximated rather than resolved by a full rigid-body solver. The sketch starts paused for reduced-motion preferences and suspends simulation while its tab is hidden.
