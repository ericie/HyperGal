# Cloudcutter

Asteroids on the same black-and-white Vectrex monitor as *Vectrex Asteroids*,
but flown against weather. Nothing here explodes. A round takes a small chunk
out of a cloud and no more, so the only way through a body is to bore a tunnel
and fly down it.

## The clouds

Each cloud is the **union** of its lobes, not their sum. A summed metaball field
smears the lobes into one featureless blob and piles the density up in the
middle; a union keeps every lobe's own curve, which is where the scalloped
silhouette and the interior folds come from, and it keeps the body an even
thickness all the way across so it bores at the same rate everywhere. Lobes sit
on a level underside and are stepped along by less than the two radii they span,
so a cloud is always one connected chain and never sheds a loose circle.

A shot subtracts a small round bite from that field, and a round landing just
past the end of a cut already made lengthens that cut instead of adding another
— a bore is one channel, not a rosary of holes. That is both what the ship is
physically doing and the only way a whole tunnel fits in a list short enough to
evaluate every frame; modelled as separate holes, the far end of a tunnel was
being forgotten before the near end was finished. The outline is re-traced from
the field by marching squares, so a dented edge, a bored tunnel, and a severed
body all fall out of the same rebuild — nothing is drawn as a special case.

A cut takes the better part of a minute to **heal** shut, so a tunnel outlives
the pass that made it and the sky keeps a record of where the ship has been.
Now and then a bore runs clean through a body end to end, and the cloud comes
apart into halves that are shouldered aside once and then swell as they drift.
A severed piece too small to survive is erased for good and released as vapor.

The weather only ever pans. Clouds slide left across an unbounded sky and never
rise or fall; the ship is the thing that goes up and down.

## The icebreaker

There is no target and no plan. The ship holds a slowly wandering course, leans
toward the thicker sky, and keeps the guns going whenever anything is close
enough ahead to open up. What decides its speed is not what it has aimed at but
what its bow is pressed against: open sky is cheap, a face of cloud is thick
going, and in a body the ship grinds down to a crawl and makes headway at
exactly the rate its own fire opens the way in front of it.

Two details make that work. Testing whether the ship is *standing* in cloud is
useless — down its own bore it never is — so the drag reads the load on the bow
instead, sampling the few dozen pixels ahead of the nose. And the guns alone cut
a hole narrower than the ship, so the hull reams out what they began: the ship
can never wedge itself in a bore too small to fly.

The camera pans with the ship, riding a little ahead of it so the sky about to
be cut is already on screen, on a leash short enough that the ship never leaves
the frame. There is no losing and no winning. The counters track bodies bored
through and clouds cut in half.

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
