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
  void: "#171b18"
  verge: "#292e28"
  grass-a: "#3b4038"
  grass-b: "#3e4239"
  grass-line: "#747768"
  road: "#53554a"
  road-edge: "#92907d"
  road-mark: "#b5b09a"
  bike-lane: "#414b40"
  bike-edge: "#7d8770"
  bike-frame: "#b0b3a0"
  bike-rider: "#222b24"
  rail-bed: "#30352e"
  rail-tie: "#565b4c"
  rail-steel: "#999986"
  rail-signal: "#b65c40"
  train: "#a3a18e"
  train-light: "#c0bca5"
  water: "#686f62"
  water-line: "#a3ab97"
  log: "#303e32"
  log-light: "#7e8a72"
  gator: "#25392d"
  gator-light: "#71876b"
  gator-eye: "#a0a683"
  rock: "#777968"
  rock-light: "#a1a18a"
  mower: "#969986"
  fly-wing: "#cac4a8"
  fly-body: "#202a22"
  ink: "#d0c7aa"
  tire: "#242b25"
  vehicle-shell-ash: "#a4a18c"
  vehicle-shell-olive: "#929480"
---

# Design System: Many Frogs

## Overview

**Creative North Star: "Bodies Become Pigment"**

Scope: pieces/038-many-frogs/ only. A rough, physical, slightly unsettling printed world replaces the former childish sprites. Small living bodies become pigment while an indifferent moving landscape continues to work on their marks. Charcoal and mineral gray with an olive cast support muted madder, oxide, umber, oxblood, and plum bodies.

This is an autonomous, wordless Canvas 2D artwork. Its identity comes from vulnerable anatomical silhouettes, strict overhead machinery, worn contours, fixed substrate pits, and absorbing impressions. The procedural drawing remains in one HTML file; there is no generated raster asset or framework required for rendering.

**Key Characteristics:**

- A twenty-one-column endless course of readable crossing bands.
- Twelve initial frogs with individual pigment identities; flies add three matching offspring.
- Articulated folded legs and overhead machinery share one printed material language.
- Persistent land impressions, broken tire transfers, and current-driven water diffusion.
- No visible controls, scores, labels, or typography.

The user approved this direction. Independent review returned Ship with no material findings for desktop (1663 × 1000) and mobile (390 × 844). Review evidence lives in [the desktop capture](../../.impeccable/review/frogs-print/desktop.png), [the mobile capture](../../.impeccable/review/frogs-print/mobile.png), and [the simulation benchmark](../../.impeccable/review/frogs-print/simulation-benchmark.txt), and [the review record](../../.impeccable/review/frogs-print/review.md). Screenshots establish the reviewed compositions, not every future procedural state.

## Colors

### Primary

The twelve pigment triples in the frontmatter preserve `frogPigments` order. Each has a body color, a layered wash, and a darker rim for tide lines and incisions. The family is dominated by madder and oxide, with umber, oxblood, and quieter plum variations; individual identity does not depend on a rainbow sequence. Authored OKLCH values remain normative rather than being approximated as hex.

**The Pigment Continuity Rule.** A frog, its offspring, and its death impression share the same authored pigment family.

### Secondary

Ash and olive vehicle shells, train surfaces, bicycle frames, and mower bodies contrast softly against the darker lanes. Rail Signal is the localized warning accent. Water Line, Log Light, Gator Light, and Rock Light supply sparse incisions and material variation.

### Neutral

Void and Verge frame the course. Grass A/B, Road, Bike Lane, Rail Bed, and Water establish crossing types by restrained tonal differences. Ink supplies pale substrate pits and small marks; Tire supplies the darkest structural details. The frontmatter contains active source palette entries and both vehicle-shell literals; unused legacy palette entries are omitted.

## Typography

There is no visible typography and no font, size, weight, or spacing scale to extract. The browser title and HTML description are metadata. The canvas is currently `aria-hidden="true"`; this implementation does not expose a textual alternative or an accessible simulation control.

## Layout

The fixed canvas fills the viewport. The board has 21 columns. Tile size is `clamp(min(40, viewportWidth / 21), 14, 40)` in CSS pixels, so the course reaches a maximum width of 840 pixels and stays centered in quiet margins on wider displays. No CSS responsive breakpoints exist. Visible row count is viewport height divided by tile size; narrow screens show more rows at a smaller scale.

The drawing viewport is clamped to at least 300 × 420 CSS pixels and device pixel ratio is capped at 2. The canvas may exceed a smaller viewport. World row zero sits 0.72 tiles above the bottom edge; the camera follows the highest living frog once it reaches 72% of the visible row count. Terrain and lane objects are clipped to the course, with narrow verge strips outside its edges.

## Elevation & Depth

Depth comes from overlapping impressions, irregular silhouettes, sparse incised marks, and tonal separation. Terrain draws first, stains above it, then lane objects and flies; particles and frogs follow. There are no drop-shadow tokens, simulated floating frog shadows, or glossy highlights. Water blur belongs inside each pigment impression and communicates diffusion rather than interface elevation.

**The World-Fixed Texture Rule.** Attach pits and dry lines to terrain and objects; do not introduce flickering screen noise.

## Shapes

Frogs have narrow irregular bodies, tiny dark eye marks, mitered articulated limbs, and short toe incisions. The body drawing scales with 0.39 of a tile. Folded hind limbs extend through a hop while the body stays visually attached to the ground. Cars, mowers, trains, and bicycles use overhead profiles. Rocks, logs, and alligators use irregular polygons and dry internal cuts. Sparse worn lane paint preserves the readability of crossing bands without enclosing each row in a heavy outline.

**The Overhead Bodies Rule.** Keep machinery and animals in the same overhead view, with narrow frog anatomy and articulated limbs.

There is no reusable interface radius or spacing scale. Geometry belongs to the procedural drawing functions in `index.html`.

## Components

These are Canvas drawing systems, not DOM interface components. The sidecar therefore has no fabricated HTML/CSS component previews.

### Terrain impressions

Deterministic pits and fibers are rasterized per terrain row and reused. At most 128 row impressions remain in the print cache; resize clears that cache. Lane markings and moving water lines draw over the cached substrate.

### Frogs and autonomous movement

Twelve frogs start each cohort after an opening hold (0.68 seconds) with individual stagger. Hops take 0.18 seconds and use an ease-out quartic trajectory. Decisions retain a three-move look-ahead with beam width 7. The traffic-clearance calculation solves periodic swept intervals directly; distant frog reservations are rejected before predicting positions. These optimizations retain the simulation's behavior.

### Pigment impressions

Each death makes a layered impression with wash, dried rim, stipple, droplets, and angular event marks. The initial impression raster is 128 × 128 pixels, displayed relative to tile size. Bloom takes 1.65 seconds. Land stains remain across cohorts; retained history is capped at 640 stains. Road traffic adds broken directional transfers from at most five distinct vehicles per stain. Water carries, stretches, and fades the impression, selecting four additional diffusion stages at four-second intervals after its original sharp stage. Each stage is rasterized only when needed; it is not a live blur on every frame.

### Camera and motion preferences

After the last death, the camera holds for 1.15 seconds and returns over 2.8 seconds using cubic ease-in-out. Reduced motion makes hops immediate after checking their hazard path, removes limb extension, death particles, and camera interpolation, makes stain bloom and tire transfer reveal immediate, and holds an active rail warning steady. It preserves the autonomous simulation and some environmental motion; it is not an animation-off mode. Hidden tabs cancel requestAnimationFrame and resume without time catch-up.

Validation: `node scripts/check-many-frogs.mjs` passed collision windows, cached impressions, visibility, normal/reduced-motion lifecycle, resize, and bounded history checks. The seeded 60-second simulation-only comparison preserved exact final state: mean update time fell from 7.66 to 1.11 ms and p99 from 66.79 to 9.49 ms. It does not measure rasterization. A separate live browser sample recorded a 16.7 ms median interval, 17.6 ms p95, and 1 of 90 intervals over 33.4 ms; these are observed samples, not a device-independent frame-rate guarantee.

Rendering has no external asset dependency. The source also contains an external Bakalytics analytics script; portability claims describe the artwork renderer, not the absence of all network requests.

## Do's and Don'ts

### Do:

- Do preserve the close natural-pigment family and the charcoal, olive, and ash environment.
- Do retain route decisions, reproduction, surface-driven stains, and the camera return as part of the artwork.
- Do keep terrain and pigment impressions cached, with bounded retained history.
- Do keep this visual system scoped to Many Frogs.

### Don't:

- Don't restore smiles, white frog eye discs, toy side elevations, gloss, or a spectral rainbow.
- Don't replace the procedural moving field with a static illustration.
- Don't invent buttons, navigation, type scales, or score overlays for this wordless surface.
