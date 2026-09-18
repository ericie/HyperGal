# Removal of nested court overlays

2026-09-17. User supplied a crop of a framed two-storey stair court and objected
to the nested composition. The source was the extra shared-court layer added
after complete tower modules had already been composed. It masked a horizontal
band out of both buildings, retained partial facade fragments around that band,
and drew a separate room with its own frame, windows, doors and stair on top.

Removed the court generator, drawCourt renderer and horizontal clipping mask.
The numbered blocks remain unchanged and render whole within their building
profiles. Stairs and balconies supply circulation without a secondary room layer.
The prior test requiring a court in every city was replaced with a regression
check excluding secondary court data. Existing fit and continuity tests remain.

Passed 480 seeded layouts and all 58 catalog drawings (3,473,111 finite drawing
calls). Inspected desktop, phone 390×844 and square 1200×1200 at seed 1907.
No further visual corrections were needed. Viewport emulation was cleared.

`before.js` / `after.js` record the change. `desktop.png`, `mobile.png` and
`square.png` show the result; the square is the new gallery thumbnail source.
The vertical bay framework remains; this addresses the reported nested overlay.
