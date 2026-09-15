# Strega Nona — six reference comparisons

Compared against the user's original three photographs: a first curved pen
stroke, a growing cluster of nested olive arcs and curled tendrils, and a
dense filled patch. The viewport remains the piece's border.

1. Baseline (`../desktop.png`): overly uniform scallops, circles cleared before
   being filled. Replaced shape painting with planned visible pen strokes.
2. `02-strokes.png`: no circular flashes, but an arc-only opening. Added a
   leading continuous tendril.
3. `03-tendril.png`, `03-patch.png`: leading curl present; crossings and floating
   tendrils remained. Rebuilt heads as continuous spirals, separated tendrils.
4. `04-patch.png`, `04-full.png`: compact patch improved; stem/head gaps and
   sharp S-bends remained. Fixed ribbon footprints and softened the curves.
5. `05-desktop-patch.png`, `05-mobile.png`: line spacing and mobile coverage
   held; too many complete rings and early detached stems. Reduced order
   variation and scheduled stems after the fans around their bases.
6. `06-patch.png`, `06-desktop.png`, `06-mobile.png`: attached smooth spirals,
   interlocking arcs, and complete desktop/mobile coverage. Retained.

Final verification:

- 123,987 conservative coverage samples across 12 seeded compositions.
- One stroke at a time; each takes at least 0.22 seconds.
- 48 Chromium frame comparisons at 30 fps: every frame adds ink; at most
  15 pixels darken per frame, at most one lightens at the antialiased pen tip.
- Natural completion, reduced motion, pause/resume, hidden tabs, resize,
  and restart pass. No browser errors.
- Independent finish reviewer: `ship`, no material fixes.
