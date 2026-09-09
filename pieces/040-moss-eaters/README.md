# Moss Eaters

A single small, segmented grazer eats its way through a damp moss field.
The resource appears as dark, noise-distributed pixel clouds: some regions are
thick carpets while others expose most of the underlying stone.
Each animal tries to maximize moss eaten per unit of travel. In sparse growth
it follows rotational Brownian motion, wandering at constant forward speed as
its curvature changes stochastically. In thick moss it follows an uneaten lane
until resource or an old path blocks the way. It then previews both possible
semicircular turns, commits to the clear side, completes a compact 180° arc, and
enters the nearest parallel lane with almost no gap between eaten footprints.
A short forward sensor checks the immediate corridor against recorded paths
before every choice. Every animal moves
forward at its own fixed speed: there is no braking, reversing, sideways motion,
or sine-wave sweep. The trail is a broad, granular exposure of the surface
beneath the moss; there are no footprints or leg marks.

The surface opens untouched, with one grazer placed in a rich patch. Its trail
accumulates entirely in real time, gradually changing the image from a field
study into an all-over drawing. The grazer is never retired or killed; it
persists until the field is reset.

Click or tap to relocate the grazer to that point. Press R or Enter to grow a
new field. Press Space to pause and resume. Reduced-motion preferences preserve
the untouched opening state; clicks add a complete local feeding path.

The piece is self-contained vanilla HTML, CSS, and Canvas with no runtime
dependencies. Add `?seed=1234` to the URL to revisit a particular field. The
private `?preview=mature` state advances the simulation only for catalog image
capture; it is never used by the public piece.
