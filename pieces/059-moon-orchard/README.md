# Moon Orchard

A black-and-white, self-playing lunar arcade patrol beneath the curved edge of an enormous moon. Original pixel sprites and bitmap lettering, no borrowed assets or dependencies.

The buggy makes short hops over craters and rocks. Paired guns fire straight up and straight forward in three-shot bursts, with a pause between volleys. Small rocks break in one hit; large rocks take three. Passing saucers occasionally drop bombs: a shot can intercept them, but a ground impact blasts a new crater into the scrolling terrain.

Upward shots that reach the moon plant trees in its rotating coordinate system. Nearby hits nourish the same tree. Roots remain fixed to the surface while the moon turns, and growth follows simulation time. The orchard and rotation persist in localStorage; existing saved forests remain compatible. Reloading restores the forest without advancing time while closed. Storage failure leaves the scene running with a session-only forest.

Click or Space pauses; Enter also works when the canvas is focused. S downloads a PNG. Reduced-motion preferences start the scene paused. Resize preserves the forest. Fully self-contained; open index.html directly. Browser storage belongs to the browser and origin, so moving the folder or clearing site data may give it a new forest.

Run `node scripts/check-moon-orchard.mjs` from the repository root to check burst timing, straight ballistics, hop height, rock sizes and durability, bomb craters, planting, persistence, pause, and resizing across desktop and phone dimensions.
