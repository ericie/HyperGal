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
  rock: "#f5f5f1"
  rock-light: "#fcfcf9"
  glass: "#dadddb"
  fly-wing: "#fbfbf8"
  fly-body: "#c7c8c0"
  ink: "#b2b3aa"
  tire: "#c0c1b8"
  vehicle-shell-a: "#f7f7f4"
  vehicle-shell-b: "#eff0ea"
---

# Design System: Many Frogs

## Overview

**Creative North Star: "Bodies Become Pigment"**

Scope: pieces/038-many-frogs/ only. A rough, physical, slightly unsettling printed world replaces the former childish sprites. Small living bodies become pigment while an indifferent moving landscape continues to work on their marks. One fixed screen — field, road band, field — printed as a ghost: whites and light grays at low contrast, lit by one shallow isometric camera, so muted madder, oxide, umber, oxblood, and plum bodies are the only color on the board.

This is an autonomous Canvas 2D artwork with small arrival numerals at the two ends of each frog's column. Its identity comes from vulnerable anatomical silhouettes, near-white machinery raised off the ground on a shared camera angle, worn contours, fixed substrate pits, and absorbing impressions. The procedural drawing remains in one HTML file; there is no generated raster asset or framework required for rendering.

**Key Characteristics:**

- A fixed board using tiles near 22px: a 10% field, a road band holding exactly 80% of screen height, and a 10% field.
- A cohort scaled to the board width shuttles bottom to top to bottom; flies add three matching offspring.
- Articulated folded legs and risen pale machinery share one printed material language.
- Persistent land impressions become soft directional pigment trails under passing cars.
- The only visible typography is each frog's pair of arrival counts, explicitly requested by the user.

The user approved this direction. Independent review returned Ship with no material findings for desktop (1663 × 1000) and mobile (390 × 844). Review evidence lives in [the desktop capture](../../.impeccable/review/frogs-print/desktop.png), [the mobile capture](../../.impeccable/review/frogs-print/mobile.png), and [the simulation benchmark](../../.impeccable/review/frogs-print/simulation-benchmark.txt), and [the review record](../../.impeccable/review/frogs-print/review.md). Screenshots establish the reviewed compositions, not every future procedural state.

## Colors

### Primary

The twelve pigment triples in the frontmatter preserve `frogPigments` order and repeat in that order once a cohort is larger than twelve. Each has a body color, a layered wash, and a darker rim for tide lines and incisions. The family is dominated by madder and oxide, with umber, oxblood, and quieter plum variations; individual identity does not depend on a rainbow sequence. Authored OKLCH values remain normative rather than being approximated as hex.

**The Pigment Continuity Rule.** A frog, its offspring, and its death impression share the same authored pigment family.

### Secondary

Vehicle shells are the lightest values on the board and read against the lanes by rising off them. Shade, Shade Deep, and Shadow are the only modeling tones: side walls and ground prints. Glass is the one cool note, on cabin windows. Rock Light and Paper supply sparse incisions and material variation.

### Neutral

Void and Verge frame the course and are the only values darker than the lanes. Grass A/B and Road separate field from crossing by a restrained tonal difference inside a narrow light band. Ink supplies substrate pits and small marks; Tire supplies the darkest structural details, still a light gray. The frontmatter contains active source palette entries and both vehicle-shell literals; unused legacy palette entries are omitted.

## Typography

Arrival counts use 11–13px semibold tabular monospace numerals in the frog's dark pigment rim, on small pale counter marks. Each marker belongs to one frog and sits at the same normalized column at both screen edges. A short pigment pulse acknowledges a touch; reduced motion suppresses the pulse. No other visible text or controls are added. The canvas exposes an image role and a description of the crossing and counters.

## Layout

The fixed canvas fills the viewport and the whole course is on it at once; nothing scrolls. Rows are the nearest multiple of ten to `viewportHeight / 22`, with a minimum of twenty. Tile size is `viewportHeight / rows`, and columns are `floor(viewportWidth / tile)`. Each field has 10% of the rows and the road has 80%, so its drawn height is exactly 80% of the canvas. Cohort size is `clamp(round(columns * 0.35), 10, 24)`. A resize rebuilds the layout, clears terrain caches, and rebases frogs and stains onto the new board. Counter columns retain their normalized positions when space allows, otherwise they redistribute in the same left-to-right order. Counts survive resize. No CSS responsive breakpoints exist.

The drawing width is clamped to at least 300 CSS pixels; height always matches the viewport, including short landscape screens. Device pixel ratio is capped at 2. World row zero is the bottom row of the lower field and row `rows - 1` the top row of the upper field. Frogs steer toward their own counter column in the destination field; contact with that counter increments its count and reverses heading. Initial spawning does not count as a return. Offspring get unique counter columns in the available gaps. Terrain and lane objects are clipped to the course, with narrow verge strips around its edges.

## Elevation & Depth

Depth comes from a shallow isometric rise shared by every solid on the field. An object keeps its simulated footprint on the ground, sweeps walls up to a lit face offset by ISO_SKEW of its rise, and casts one soft print away from the light. Rises are small: 0.17 tiles for a car body, 0.13 more for its cabin, 0.19 for a boulder. Terrain draws first, stains above it, then lane objects and flies; particles and frogs follow. Water blur belongs inside each pigment impression and communicates diffusion rather than interface elevation.

**The World-Fixed Texture Rule.** Attach pits, mown bands, wheel tracks, seams, clover, and dry lines to terrain and objects; do not introduce flickering screen noise.

**The One Camera Rule.** Every solid rises toward the same corner and prints its shadow the same way. A mirrored object flips `isoFlip` so its rise and its shadow stay put on screen.

## Shapes

Frogs have narrow irregular bodies, tiny dark eye marks, mitered articulated limbs, and short toe incisions. The body drawing scales with 0.39 of a tile. Folded hind limbs extend through a hop while the body stays visually attached to the ground. Cars are drawn from above and raised, carrying a cabin rising off the hood with glass facing the camera and lamps at the nose; their finest marks drop away below 40 drawn pixels of length. Rocks are tapered boulders with facets on the lit cap. Sparse worn lane paint preserves the readability of crossing bands without enclosing each row in a heavy outline.

**The Overhead Bodies Rule.** Keep machinery and animals in the same raised overhead view, with narrow frog anatomy and articulated limbs.

There is no reusable interface radius or spacing scale. Geometry belongs to the procedural drawing functions in `index.html`.

## Components

These are Canvas drawing systems, not DOM interface components. The sidecar therefore has no fabricated HTML/CSS component previews.

### Terrain impressions

Deterministic pits, fibers, mown bands, clover, wheel tracks, seams, ballast, and banks are rasterized per terrain row and reused. At most 128 row impressions remain in the print cache; resize clears that cache. Lane markings and moving water lines draw over the cached substrate.

### Frogs and autonomous movement

A cohort starts along the bottom edge after an opening hold (0.68 seconds) with individual stagger, each frog heading up. Hops take 0.18 seconds and use an ease-out quartic trajectory. Decisions retain a three-move look-ahead with beam width 7. The traffic-clearance calculation solves periodic swept intervals directly; distant frog reservations are rejected before predicting positions. These optimizations retain the simulation's behavior.

### Pigment impressions

Each death makes a layered impression with wash, dried rim, stipple, droplets, and angular event marks. The initial impression raster is 128 × 128 pixels, displayed relative to tile size. Bloom takes 1.65 seconds. Stains remain across cohorts; retained history is capped at 640 stains. Swept vehicle contact removes density from the original pool and drags pigment downstream. Translucent, flattened copies of the actual pigment raster form a feathered trail with fine tire grain, clipped to its traffic row and composited with multiply so overlapping pigments blend. A trail raster rebuilds only on a fresh vehicle pass. Length is bounded at 6.5 tiles and density has a residual floor, but additional cars continue to work it. Reduced motion applies each transfer immediately.

### Camera and motion preferences

After the last death the piece holds on the aftermath for 1.9 seconds, then a new cohort enters at the bottom. Reduced motion makes hops immediate after checking their hazard path, removes limb extension and death particles, and makes stain bloom and tire transfer reveal immediate. It preserves the autonomous simulation and some environmental motion; it is not an animation-off mode. Hidden tabs cancel requestAnimationFrame and resume without time catch-up.

Validation: `node scripts/check-many-frogs.mjs` covers the exact 80% road, collision windows, paired counter contact and offspring allocation, directional pigment transfer and caching, shuttle turnaround, visibility, normal/reduced-motion lifecycle, resize, and bounded stain history. Live desktop (1440 × 900) and mobile (390 × 844) checks showed independent arrival counts and continuous directional pigment trails without browser errors. Historical timing samples elsewhere in this repository predate the counter and blended-pigment changes.

Rendering has no external asset dependency. The source also contains an external Bakalytics analytics script; portability claims describe the artwork renderer, not the absence of all network requests.

## Do's and Don'ts

### Do:

- Do preserve the close natural-pigment family and the ghost-white environment it sits on.
- Do retain route decisions, reproduction, surface-driven stains, and the shuttle turnaround as part of the artwork.
- Do keep terrain and pigment impressions cached, with bounded retained history.
- Do keep this visual system scoped to Many Frogs.

### Don't:

- Don't restore smiles, white frog eye discs, full side elevations, gloss, or a spectral rainbow.
- Don't scroll the board or add a finish line; the crossing is a shuttle with no end.
- Don't add color to the environment; the only color on the board belongs to the frogs and their marks.
- Don't replace the procedural moving field with a static illustration.
- Don't add buttons, navigation, captions, or additional score overlays beyond the requested paired arrival counters.
