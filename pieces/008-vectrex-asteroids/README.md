# Vectrex Asteroids

A black-and-white vector Asteroids variant for a Vectrex monitor that never
really clears the field.

The ship can keep up to three bullets alive at once. A bullet does not destroy an
asteroid: it fractures the rock. The struck shard splits, every nearby shard gets
thrown outward, and then the whole cloud slowly pulls itself back into the same
rock. The matter is persistent. It only becomes finer, angrier, and harder to
read before it reforms.

## Controls

- Left / right or A / D: rotate
- Up or W: thrust
- Space or click: fire
- Enter or click after signal loss: restart

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Open `index.html`
directly in any browser.
