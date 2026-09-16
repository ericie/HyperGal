# Marbled Water

A procedural Suminagashi-inspired artwork: mineral blues, pale cool water,
fine folds, and restrained teal, ochre, and plum share one moving pigment
surface. The supplied mineral-blue reference defines this piece's visual
direction. The compact control panel stays subordinate to the full-window bath.

The first frame is already composed. Broad folds, fine veins, and mineral seams
are seeded together into the same field. Gentle currents carry all of that
pigment continuously. New ink arrives as a small falling bead, then spreads by
inserting successive increments of area. Each increment pushes earlier pigment
outward, including the color deposited by earlier increments of the same drop.
A temporary local strain stretches and folds the deposit and its neighbors;
its strength decays after the drop arrives. This is a stylized transport effect,
not a claim of physical fluid accuracy.

## Interaction

- Click or tap the bath to add ink and move the automatic drop well. Automatic
  drops gather near that well and periodically move to another part of the bath.
- Expand the panel to choose a palette and adjust drop tempo, drop size, edge
  variation, and push strength. Drag its header to reposition it.
- Press **Space** to pause or resume. Pausing settles active and queued drops
  immediately; new manual drops also settle immediately while paused.
- Press **R**, or use the reset button, to start a newly seeded bath. Changing
  the palette or resizing the window rebuilds the starting composition.
- Use `?seed=anything` to revisit a starting composition and
  `?seed=anything&panel=0` to hide the panel for a clean capture. A seed does not
  save a history of manual drops or control changes.

Reduced-motion preferences start the bath as a finished still composition and
disable the panel's collapse transition. Manual deposits remain available and
settle immediately. Space can explicitly resume motion.

## Renderer

`fluid.js` owns the persistent pigment field. The WebGL path alternates between
two texture-backed framebuffers, carrying the previous image forward on each
simulation step. It prefers floating-point texture storage where supported,
then half-float, with unsigned-byte storage as the compatibility option.
Nine-tap Catmull–Rom cubic sampling helps preserve narrow veins during repeated
subpixel transport. Smooth currents and up to six decaying local strain fields
move the pigment; the drop's inverse area mapping displaces and inserts color
within that same transport pass.

`renderer.js` owns seeded palettes, drop timing, input, pause state, sizing, and
the panel. The GPU simulation advances at a fixed 30 steps per second. Canvas
resolution is limited to 1.5 device pixels per CSS pixel and 1.8 million pixels
overall. The additional canvases provide an input surface and the brief falling
bead; they do not hold separate persistent pigment layers.

When WebGL is unavailable, a Canvas 2D CPU fallback keeps a smaller persistent
pixel field and advances at 15 steps per second. It retains moving pigment and
drop displacement, but uses simpler currents and bilinear sampling at lower
resolution. Fine detail, drop contours, and folding are lower fidelity than the
GPU path. Shader or framebuffer initialization failures report an error;
graphics-context loss pauses the bath and asks for a reload.

## Portability

Open `index.html` directly or serve this folder statically. The artwork's
rendering code uses native browser APIs, local scripts, and procedural color;
it needs no build step, rendering library, image assets, or package manager.
The page includes the gallery's external analytics script, which is separate
from the renderer.
