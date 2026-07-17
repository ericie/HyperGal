# Vectrex Asteroids

A black-and-white vector Asteroids variant for a Vectrex monitor that never
really clears the field.

The ship pilots itself until a player takes the controls, mostly trying to park
itself with visible retrograde burns, then thrusting mainly to dodge predicted
asteroid paths. It fires tight two- or three-shot bursts one bullet at a time
when the aim is clean. It keeps up to three bullets alive at once, with
extra-narrow aim for small fragments. A bullet does not
destroy an asteroid: it breaks the rock into two to five procedural pieces that
burst away from the ship and keep dividing into smaller generations. The
smallest rocks no longer divide; shots kick them away so they stay in play.
Fragments drift with heavier inertia, pull on nearby mass with stronger slow
gravity, bump instead of passing through each other, and eventually glom onto
larger asteroids. Rocks must settle against each other before they weld into one
rough integrated outline, and the final body keeps shoulders, valleys, and
bulges from the pieces that formed it while the seam between them dissolves.
Large rocks can pull together into huge bodies.

The matter is persistent. It only changes scale, direction, and ownership as the
field slowly accretes.

## Controls

- Autoplay starts immediately
- Left / right or A / D: take over and rotate
- Up or W: take over and thrust
- Space or click: take over and fire
- Enter or click after signal loss: restart

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Open `index.html`
directly in any browser.
