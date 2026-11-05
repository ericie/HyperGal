# Moon Orchard

A black-and-white, self-playing lunar arcade patrol beneath the curved edge of an enormous moon. Original pixel sprites, no borrowed assets or dependencies. A small HOLES score counts ground and moon holes once when first seen, and subtracts one when either repair fills a hole. Holes leaving the screen keep their count; the score starts fresh on reload.

The buggy makes short hops over craters and rocks. Its regular guns fire straight up and forward in bursts. Each pit jump also fires three bullets: up, forward and down. The downward bullet follows the scrolling terrain and fills the pit beneath the buggy. Small rocks break in one hit; large rocks take three. Passing enemy saucers drop bombs that can be intercepted or blast new ground craters.

Upward shots carve holes into the rotating moon’s edge. A dedicated saucer moves back and forth along that edge, using a repair beam to fill holes it passes. Moon holes and rotation persist in localStorage. Existing saved trees remain compatible. Storage failure leaves the scene running for the current session.

Click or Space pauses; Enter also works when the canvas is focused. S downloads a PNG. Reduced-motion preferences start the scene paused. Fully self-contained; open index.html directly.

Run `node scripts/check-moon-orchard.mjs` to check ballistics, bursts, pit repair, moon damage, saucer repairs and reversals, hazards, persistence, pause, and resizing across desktop and phone dimensions.
