# Moss Eaters

A colony of small, segmented grazers eats its way through a damp moss field.
Each animal tries to maximize moss eaten per unit of travel. In sparse growth
it bends gradually toward the nearest dense patch. In thick moss it follows an
uneaten lane until resource or an old path blocks the way. It then previews both
possible semicircular turns, commits to the clear side, completes a broad 180°
arc at constant speed, and enters the nearest parallel lane. Every animal moves
forward at its own fixed speed: there is no braking, reversing, sideways motion,
or sine-wave sweep. The trail is a broad, granular exposure of the surface
beneath the moss; there are no footprints or leg marks.

The surface opens untouched, with only a few grazers placed in separate rich
patches. Trails accumulate entirely in real time, gradually changing the image
from a field study into an all-over drawing.

Click or tap to hatch a small clutch at that point. Press R or Enter to grow a
new field. Press Space to pause and resume. Reduced-motion preferences preserve
the untouched opening state; clicks add complete local feeding paths.

The piece is self-contained vanilla HTML, CSS, and Canvas with no runtime
dependencies. Add `?seed=1234` to the URL to revisit a particular field. The
private `?preview=mature` state advances the simulation only for catalog image
capture; it is never used by the public piece.
