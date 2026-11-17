---
name: Many Frogs
description: Autonomous bodies and accumulating pigment in a worn printed crossing field.
colors:
  pigment-01-body: "oklch(0.62 0.16 23)"
  pigment-01-wash: "oklch(0.58 0.15 20)"
  pigment-01-rim: "oklch(0.37 0.12 18)"
  pigment-02-body: "oklch(0.52 0.09 72)"
  pigment-02-wash: "oklch(0.49 0.09 68)"
  pigment-02-rim: "oklch(0.31 0.07 60)"
  pigment-03-body: "oklch(0.58 0.13 345)"
  pigment-03-wash: "oklch(0.54 0.13 347)"
  pigment-03-rim: "oklch(0.33 0.10 350)"
  pigment-04-body: "oklch(0.66 0.14 33)"
  pigment-04-wash: "oklch(0.61 0.13 30)"
  pigment-04-rim: "oklch(0.39 0.11 26)"
  pigment-05-body: "oklch(0.47 0.10 305)"
  pigment-05-wash: "oklch(0.45 0.10 308)"
  pigment-05-rim: "oklch(0.28 0.08 312)"
  pigment-06-body: "oklch(0.65 0.12 48)"
  pigment-06-wash: "oklch(0.60 0.12 45)"
  pigment-06-rim: "oklch(0.38 0.10 40)"
  pigment-07-body: "oklch(0.62 0.10 355)"
  pigment-07-wash: "oklch(0.58 0.10 357)"
  pigment-07-rim: "oklch(0.37 0.08 2)"
  pigment-08-body: "oklch(0.50 0.13 8)"
  pigment-08-wash: "oklch(0.47 0.12 8)"
  pigment-08-rim: "oklch(0.29 0.09 5)"
  pigment-09-body: "oklch(0.68 0.09 77)"
  pigment-09-wash: "oklch(0.62 0.09 72)"
  pigment-09-rim: "oklch(0.40 0.07 64)"
  pigment-10-body: "oklch(0.52 0.12 325)"
  pigment-10-wash: "oklch(0.49 0.11 328)"
  pigment-10-rim: "oklch(0.30 0.09 332)"
  pigment-11-body: "oklch(0.58 0.10 60)"
  pigment-11-wash: "oklch(0.54 0.10 56)"
  pigment-11-rim: "oklch(0.34 0.08 50)"
  pigment-12-body: "oklch(0.55 0.14 18)"
  pigment-12-wash: "oklch(0.52 0.13 16)"
  pigment-12-rim: "oklch(0.32 0.10 14)"
  void: "#dadbd4"
  verge: "#c6c7bf"
  paper: "#fdfdfb"
  shade: "#d9dad2"
  shade-deep: "#c8c9c0"
  shadow: "#c2c3b9"
  grass-a: "#f1f2ec"
  grass-b: "#ecede6"
  grass-line: "#dadbd2"
  road: "#e0e1dd"
  road-edge: "#cbccc4"
  road-mark: "#fbfbf7"
  ink: "#b2b3aa"
  counter-ink: "#575c55"
  vehicle-outline: "#90958d"
  vehicle-detail: "#a9ada4"
---

# Design System: Many Frogs

## Scope

Mode: Experience. One fixed, close overhead view of a finite group of frogs
attempting to cross a single lane. The prior multi-lane highway and shuttle
journeys are replaced by independent single-pass attempts. The only visible text
is the requested surviving count: a bare number on the upper bank. No title,
labels, controls, or other readouts appear inside the sketch.

The renderer remains procedural Canvas 2D in one portable HTML file. The canvas
keeps an accessible image description. Existing composition status is preserved.

## Composition and scale

The single lane occupies the central 78% of the viewport, with 11% grass banks
above and below. Five logical rows remain, projected nonuniformly into those
bands. Horizontal scale is `viewportHeight / 5`; columns use the full width,
including fractional columns and edge-clipped cars on narrow screens. The
projection and its inverse interpolate hops in physical screen
space, so enlarging the road does not stretch their movement or body proportions.

Frogs start in overlapping crowds on both banks, half on each. Lower-bank frogs
head upward toward y = 2.85; upper-bank frogs head downward toward y = 1.15.
Each successful frog keeps that direction, walks fully out through the opposite
screen edge, and retires without a death mark. No frog returns for another pass.
Rocks, flies, reproduction, and long-distance destination changes are removed.

## Traffic and movement

Only world row two is traffic. Cars move in one consistent horizontal direction.
Each car's seeded size multiplier is 0.72–1.28, its body width is 42% of the road
height times that multiplier, and its length is 1.9–2.3 times its body width.
Desired speeds vary independently from 2.4 to 6.2 scale units per second. Entry
time is `id * 2.7 + seededVariation * 0.25`.

Following clearance is 0.35 scale units. Where necessary, cap a faster follower's
constant speed so its nose reaches the right edge only after its predecessor's
rear clears that edge plus the gap. This avoids overlap and abrupt speed or
position jumps. Drawing and forecasting use the same individual trajectories.
Profiles are cached sequentially with a 256-profile bound; old queries reconstruct
the same profiles without changing the current traffic. Resize rebuilds traffic
profiles for the new visible width.

Broken white paint runs along the two lane edges, with no center divider.

Drivers look 1.4 seconds ahead for active crossing frogs, accounting for the
current frog hop. Candidate lateral offsets favor clearance and a consistent
choice of side. They ease toward that offset at rate 3, with lateral speed
limited to `forwardSpeed * tan(0.18)`, then return to the center when clear.
Waiting frogs do not trigger a dodge. Reserve space for the rotated corners
within the road edges. Drawing, collision checks, and frog forecasts share the
same steering pose; queries do not mutate it. Steering can still fail.

A finite group of `clamp(ceil(columns * 7 / 2) * 2, 24, 112)` frogs is visible immediately,
split evenly between the lower bank at 92.5–97% of screen height and the upper
bank at 3–7.5%. Initial body orientation faces toward the road. The upper crowd
leaves space around the counter. All are active from
the beginning, with individual initial hesitation of 0.12–1.32 seconds. No
admission clock, replacement, or population growth remains. Frogs may overlap
freely; they do not reserve space or block each other's hops.

The count begins at the initial group size and decreases exactly once per
traffic death. Successes and exits in either direction remain counted. The upper-bank number
uses muted dark ink, tabular numerals, and no label or panel. Resize preserves
the original group and count. Starting a new round resets the count and paint.

Hops take 0.24 seconds. Five candidate directions are up, down, left, right, and wait.
Lengths cover 9–12% of the road height, requiring roughly nine to twelve jumps
across the lane at any viewport size. Each hop stays strictly horizontal or
vertical, without cross-axis drift. Landings remain
continuous rather than snapping to lane centers. Bodies rotate to face actual
hop vectors. A three-move, beam-width-five planner checks traffic windows.
The actual hazard footprint is each translated, rotated car with a 0.16-unit frog
radius. Future landing windows sample that pose at intervals no longer than
0.03 seconds, padding longitudinal travel between samples. Standing and moving
frogs both check the same actual traffic positions.

## Material and palette

Keep the ghost field-print palette above. Grass, road, and cars remain pale;
all chromatic color belongs to frogs and stationary marks.
The twelve authored pigment families cycle through incoming frogs. Bodies and death
marks retain that family. Maturity is `1 - exp(-age / 12)`,
increasing body chroma gradually over the short close-up journeys.

Cars are transparent top-down plan drawings: a neutral body outline, four
outlined tires, roof, front and rear glass, side glazing, and a hood seam.
No filled body, filled windows, or shadow obscures the accumulated history. Frogs
retain narrow anatomical bodies and folded articulated limbs. Body scale starts
at 0.24 tiles and increases to 0.305 tiles on success before exit. Fixed ground
fibers, mown bands, sparse clover, and wheel tracks belong to their surfaces.
Do not add screen noise, independent environmental colors, or new decorative copy.

## History

Movement leaves no trails, pause deposits, or revisit marks. Do not record or
rasterize frog routes. Only traffic deaths leave stationary X marks impressions.

Each death leaves a simple, upright X in the frog's color at the hit position.
Each half-arm spans `tile * 0.08` on each axis, with stroke width
`max(1.5px, tile * 0.012)`. Marks appear immediately at full opacity, with no
age-based scaling, texture, bloom, droplets, or particles.

Terrain draws first, then death marks, then traffic and living frogs. The most
recent 640 marks remain retained. Resize rebases frogs and marks without
clearing them.

## Motion and verification

Hidden tabs cancel animation frames and suspend the round; resuming does not
catch up elapsed background time. Reduced motion makes hops immediate and retains traffic and simulation.

`node scripts/check-many-frogs.mjs` verifies the 78% single-lane layout, per-car size/speed variation, following
gaps, exact swept traffic intervals, a finite initial group and death-only countdown, one success per frog, exit in either direction without a
death mark, actual traffic deaths, cardinal-only hop geometry, neutral cars, stationary X marks, retained death marks, hidden-tab pause,
responsive resize, counter-only visible text, and normal/reduced-motion lifecycle.
Historical reviews and timing samples predate this single-lane composition.
