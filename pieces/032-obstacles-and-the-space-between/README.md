# Obstacles, and The Space Between

A dry-garden companion to **Obstacles and How to Avoid Them** and
**Obstacles and How to Go Around Them**.

Three obstacles sit on pale paper: a wall, a square, and a circle, drawn as flat
geometric plans in the Hokusai palette of plan 010 — prussian, tyrian, wheat,
burlywood, pale yellow, and ink. The sand around them is raked into one
continuous contour field. The furrows use signed distance to the obstacle
outlines: negative inside each plan, zero at its edge, positive out in the sand.
Taking the minimum across the three fields makes the interior and exterior one
drawing, and where expanding rings meet they join into larger contours instead
of crossing.

Each obstacle sends out a train of waves, and a wave shows as colour filling the
spaces between the furrows rather than as a darkened line. The colour is read at
the centre of whichever band a point falls in, so every space between two rake
lines takes a single flat tone, and a passing wave lands as a run of solidly
filled bands radiating out from the plan that sent it.

Waves blend rather than merge. Every source runs on one shared train, so two
waves that arrive together are genuinely in step, and where they overlap their
colours add the way ink washes do — prussian across tyrian sinks toward ink.
Nothing is joined into a single front.

Waves reflect twice over. Each of the four frame walls returns a true specular
wave: the distance to a point mirrored in that wall is the distance to the
mirrored obstacle, so a reflection arrives curved as it should be. And a wave
that reaches another obstacle is thrown back out from it, still carrying the
colour of the obstacle that sent it, so the tyrian wall re-radiates prussian
rings. A short threshold keeps faint tails off the paper, so the sand between
waves stays bare.

The whole field is one fragment shader over the obstacle distance functions, so
the rake interval retunes the drawing instantly. Reduced-motion preferences hold
one frozen arrangement instead of animating it.

The floating panel currently exposes only the interval between rake furrows.
The other garden principles and additional obstacles remain outside this base
case.

This is a construction stage, not the final garden composition.

Click or tap the sand, or press `R`, Space, or Enter, to generate a new garden.
The panel can be dragged by its header or collapsed. Add `?seed=<value>` to the
URL for a repeatable starting composition.

Open `index.html` directly in any modern browser. The artwork has no runtime
dependencies beyond WebGL.
