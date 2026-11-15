# Counterform

Mode: Experience. Preserve the shop-window reference's stripe field and organic
color reversal. The user requested a color clash, replacing the original
purple/cream palette with hot magenta and acid green. The composition remains WIP.

## Visual direction

Two flat inks begin at hot magenta `#f000b8` and acid green `#baff00`, then cycle
smoothly through a 90-second hue circuit. Full saturation and a constant hue
separation preserve the color clash without muddy crossfades. Stationary vertical bands,
smooth contours, edge crops, no visible typography or controls. Every body and
opening reverses the stripes; intersections reverse them again by parity.

The eight primary bodies range from a large cropped ring to small visitors.
The field gathers and disperses over 127 seconds, creating crowded intersections
and quieter intervals with long uninterrupted bands.

## Motion

Encounters change the contours. Pairwise proximity and relative motion pull a
narrow neck toward a neighbor, pinch its shoulders and leave a trailing
indentation during recovery. Deformation remains bounded even in dense clusters.

A small visitor follows a 67-second passage around and through the large ring:
slow approach, held near-contact, quicker transit, release and a wide return.
The surrounding circulation uses changing speeds and independent periods.

Four openings drift independently, trail their body's recent trajectory and
stretch toward neighbors. They periodically cross the parent's boundary and
depart as smaller bodies. A new opening grows while the previous one dwindles;
the cycle renews without a positional or radius jump.

Heart, cat-head and skull contours appear briefly during longer abstract
intervals. Features arrive and dissolve unevenly, with only a short clear crest.
Skull sockets emerge separately. Contact deformation continues through morphs.

## Runtime and controls

Native Canvas 2D; no dependencies, fonts or network requests. Eight 128-point
primary contours, reusable offscreen canvases and a device-pixel-ratio cap of two.
Geometry is derived from artwork time and recent sampled trajectories, so
resizing, pausing and hidden-tab suspension preserve continuity.

Click, Space or Enter pauses/resumes. S exports the current canvas. Reduced
motion starts still and may be explicitly resumed. No visible text is added.
Color uses the same artwork clock as the forms: pause and hidden-tab suspension
freeze both, and PNG export captures the palette currently on screen.

The HTML loads `counterform.js` with a fresh URL on every opening. Changing the
HTML query alone cannot invalidate an older cached script; versioning the script
itself makes revisions visible without asking visitors to clear browser caches.

## Verification

`node scripts/check-counterform.mjs` checks finite rendered geometry across five
viewports and 400 seconds, encounter deformation and recovery, escaping openings,
continuous renewal, scale/density variation, all three fleeting silhouettes and
the pause/resize/visibility/reduced-motion/save lifecycle.

Local Chrome checks cover desktop, mobile, landscape and a small viewport,
including the WIP gallery card, thumbnail decoding, navigation to the unmodified
sketch, keyboard/click controls and PNG export. No visible text, page errors or
external sketch requests were observed. Rendered evidence lives in the ignored
`.impeccable/review/counterform-encounters/` folder. The refreshed thumbnail is the
actual 14-second 768 × 768 canvas frame with its origin embedded in PNG metadata.

The color-cycling pass additionally checks palette bounds, saturation, separation,
step smoothness and the loop seam over two complete circuits. Chrome pixel checks
at multiple times verify the current pair, pause/reduced-motion stillness,
resume/resize and exact exported PNGs on desktop and mobile. Color-cycle evidence
lives in `.impeccable/review/counterform-cycling/`; the thumbnail now depicts the
cycling palette at 14 seconds. The unmodified page is verified on port 8000.
