# Block 16 conduit connections

2026-09-17. Fixed disconnected wires in the tiled service wall. Equipment
background pads now render before the wiring, so they cannot erase its ends.
Each meter route terminates at that meter's actual bottom edge, including the
lower middle box. The upper routes terminate in a shared junction box.

The condenser returns its fitted service outlet, which anchors the lower route
to a visible junction box instead of an estimated point on the wall. Small
couplings make the box connections legible. Review number 16 is unchanged.

Passed 480 seeded layouts and 58 catalog drawings (3,483,302 finite drawing
calls). Inspected the catalog on desktop and at 390×844; no browser errors.
Viewport emulation was cleared. No further visual corrections were needed.

`before.js` and `after.js` capture this focused change; `catalog.png` and
`mobile.png` show the verified result. User acceptance remains pending.
