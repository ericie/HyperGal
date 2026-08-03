# Cloudcutter

Asteroids on the same black-and-white Vectrex monitor as *Vectrex Asteroids*,
but flown against weather. Nothing here shatters. The clouds stream right to
left forever and a hit only takes a small bite out of one — so the only way
through a cloud is to cut a path through it, a bite at a time.

## The clouds

Each cloud is the **union** of its lobes, not their sum. A summed metaball field
smears the lobes into one featureless blob and piles the density up in the
middle; a union keeps every lobe's own curve, which is where the scalloped
silhouette and the interior folds come from, and it keeps the body an even
thickness all the way across so it cuts at the same rate everywhere. Lobes sit
on a level underside and are stepped along by less than the two radii they span,
so a cloud is always one connected chain and never sheds a loose circle.

A shot subtracts a small round bite from that field. The outline is re-traced
from the field by marching squares, so a dented edge, a bored tunnel, and a
severed body all fall out of the same rebuild — nothing is drawn as a special
case. Bites then either **heal**, closing over at a rate the cloud is born with,
or they meet: a slot that reaches all the way through leaves two separate
bodies, and the cloud comes apart into halves that drift away from each other
and swell as they go. A severed piece too small to survive is erased for good
and released as vapor.

## The pilot

The ship flies itself until a player takes over. It picks a cloud, chooses a
line to cut along — mostly with or against the weather so its drift stays down
the barrel — and swings wide to get behind that line. Then it makes strafing
runs: nose on the aim point, guns going, breaking off when the nose is about to
bury itself in solid weather and coming around for another pass on the same
slot.

Two things had to be true before the cuts would land. The aim point is anchored
at the cloud's own middle and rides with it, so wherever the ship has drifted to,
the line it fires along still runs through the body's centre and a finished slot
halves the cloud. And the ship burns off its sideways drift in the cloud's frame
before the guns are allowed to speak, laying off by exactly enough to cancel the
sideways kick a moving ship hands its rounds — otherwise the burst fans across
the whole face and never digs. It shoots only when the round will actually land
in the slot.

Cloud contact does not kill. It drags, shoves the ship back out along the density
gradient, and tears vapor off the cloud on the way through. There is no losing
and no winning; the counters track paths cut and passes flown.

## Controls

- Autoplay starts immediately
- Left / right or A / D: take over and turn
- Up or W: take over and thrust
- Space or click: take over and fire
- Enter: restart

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Open `index.html`
directly in any browser.
