# Only Centipede

A Centipede riff for two automatic defenders.

One small defender patrols the top edge and one patrols the bottom. They can only
shoot straight, and each can only keep one bullet in the air. They target only
centipedes that have crossed into their half of the field; otherwise they clear
mushrooms, and if no mushrooms remain they hold fire. Mushrooms block bullets
and steer the centipedes; each mushroom visibly dents, leans, and deforms across
three bullet hits before clearing.

Centipedes enter from offscreen as hard-edged arcade sprites, with the body
appearing one segment at a time. A new centipede enters only when the live field
is almost cleared. They race sideways on strict row lanes and make quick turns
from one row to the next instead of drifting between rows. A bullet to the head
removes the head and promotes the next segment; a one-segment centipede dies.
A bullet to the body removes that segment and splits the chain, sending the two
halves in opposite directions. Every hit segment leaves a mushroom in the
centipede's color, and split-off halves keep the parent color. When one live
centipede hits another, the struck section behaves like it was shot.

Click to reseed.

Open `index.html` directly in any browser.
