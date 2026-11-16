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
  vehicle-shell-a: "#f7f7f4"
  vehicle-shell-b: "#eff0ea"
---

# Design System: Many Frogs

## Overview

**Creative North Star: "Bodies Become Pigment"**

Scope: pieces/038-many-frogs/ only. A rough, physical, slightly unsettling printed world replaces the former childish sprites. Small living bodies become pigment while indifferent traffic continues to cross their marks. One fixed screen — field, road band, field — starts as a ghost: whites and light grays at low contrast, lit by one shallow isometric camera. All color originates with madder, oxide, umber, oxblood, and plum frogs, their recorded paths, and their stationary death impressions.

This is an autonomous Canvas 2D artwork with continuous arrivals and no visible text. Its identity comes from vulnerable anatomical silhouettes, simple near-white traffic in an overhead view, worn contours, fixed substrate pits, and absorbing impressions. The procedural drawing remains in one HTML file; there is no generated raster asset or framework required for rendering.

**Key Characteristics:**

- A fixed board using tiles near 22px: a 10% field, a road band holding exactly 80% of screen height, and a 10% field.
- Timed arrivals continue independently of crossings and deaths; flies can add three matching offspring within the live population limit.
- Articulated folded legs, simple pale car silhouettes, and faceted boulders share one printed material language.
- Paths begin barely visible, then deepen across the entire route as their frog survives.
- Survival deepens each frog and its entire recorded route; older frogs leave larger death splashes.
- Frogs start smaller and grow after every completed crossing, including return trips. Cars stay pale and leave pigment undisturbed.
- Survivors relocate substantially along the safe bank after every pass. No visible text, counter marks, or controls appear in the artwork.

The earlier printed-world direction received an independent Ship review at desktop (1663 × 1000) and mobile (390 × 844). That historical review predates survival paths, simpler cars, and crossing-based frog growth. Evidence lives in [the desktop capture](../../.impeccable/review/frogs-print/desktop.png), [the mobile capture](../../.impeccable/review/frogs-print/mobile.png), [the simulation benchmark](../../.impeccable/review/frogs-print/simulation-benchmark.txt), and [the review record](../../.impeccable/review/frogs-print/review.md).

## Colors

### Primary

The twelve pigment triples in the frontmatter preserve `frogPigments` order and cycle in that order through new entrants. Each has a body color, a layered wash, and a darker rim for tide lines and incisions. The family is dominated by madder and oxide, with umber, oxblood, and quieter plum variations; individual identity does not depend on a rainbow sequence. Authored OKLCH values remain normative rather than being approximated as hex.

**The Pigment Continuity Rule.** A frog, its offspring, and its death impression share the same authored pigment family.

The palette entries are newborn colors. Survival increases OKLCH chroma by up to 85% and lightness by up to 0.025, using maturity `1 - exp(-age / 30)`. Body and wash use the full increase; dark rim changes are restrained. Offspring begin in their family's original palette rather than inheriting accumulated maturity. Cars remain in the neutral palette throughout the simulation.

### Secondary

Vehicle shells are the lightest values on the board and read as simple overhead silhouettes against the lanes. Shade, Shade Deep, and Shadow are the only modeling tones: side walls and ground prints. Glass is the one cool note, on the single window of each car. Rock Light and Paper supply sparse incisions and material variation.

### Neutral

Void and Verge frame the course and are the only values darker than the lanes. Grass A/B and Road separate field from crossing by a restrained tonal difference inside a narrow light band. Ink supplies substrate pits and small marks. The frontmatter contains active source palette entries and both vehicle-shell literals; unused legacy palette entries are omitted.

## Typography

No visible typography appears in the sketch. Crossing totals remain internal simulation state for growth. The canvas keeps its image role and accessible description of the continuous arrivals, pigment history, and changing routes.

## Layout

The fixed canvas fills the viewport and the whole course is on it at once; nothing scrolls. Rows are the nearest multiple of ten to `viewportHeight / 22`, with a minimum of twenty. Tile size is `viewportHeight / rows`, and columns are `floor(viewportWidth / tile)`. Each field has 10% of the rows and the road has 80%, so its drawn height is exactly 80% of the canvas. The live population limit is `clamp(round(columns * 1.2), 24, 80)`. Admission interval is `clamp(48 / columns, 0.9, 1.8)` seconds, with a 0.15-second retry when entry is crowded. A resize rebuilds the layout, clears terrain caches, and rebases frogs and stains onto the new board. Departure targets retain normalized horizontal positions on resize. Completed-crossing growth survives resize. No CSS responsive breakpoints exist.

The drawing width is clamped to at least 300 CSS pixels; height always matches the viewport, including short landscape screens. Device pixel ratio is capped at 2. World row zero is the bottom row of the lower field and row `rows - 1` the top row of the upper field. Reaching the opposite edge at any column completes one crossing and reverses heading. Each survivor selects a new departure column at least 24% of the board width (and at least two tiles) away and favors moving along the safe bank before returning to traffic. Initial spawning does not count as a return. Entry positions are checked against existing frogs and reserved hop destinations. Terrain and lane objects are clipped to the course, with narrow verge strips around its edges.

## Elevation & Depth

Depth comes from faceted boulders rising 0.19 tiles toward the light and small ground shadows beneath the frogs. Cars are flat overhead bodies with one window and a soft shadow offset down by 0.04 tiles. Terrain draws first, paths and stationary death impressions above it, then lane objects and flies; particles and frogs follow.

**The World-Fixed Texture Rule.** Attach pits, mown bands, wheel tracks, seams, clover, and dry lines to terrain and objects; do not introduce flickering screen noise.

**The One Camera Rule.** Keep the overhead view consistent. Boulders retain their shallow rise; simplified cars stay flat with the same ground-shadow direction in either traffic direction.

## Shapes

Frogs have narrow irregular bodies, tiny dark eye marks, mitered articulated limbs, and short toe incisions. Body scale is `0.24 + 0.065 * sqrt(crossings)` tiles, including growth after either top or bottom arrival. Initial spawning and repeated contact with the same edge do not count. The ground shadow scales with the body. Folded hind limbs extend through a hop. Car graphics use one pale six-point body and a single gray window, without tires, lamps, raised cabins, or surface incisions. Rocks retain their faceted caps. Sparse worn lane paint preserves crossing bands without heavy row outlines.

**The Overhead Bodies Rule.** Keep machinery and animals in the same overhead view, with narrow frog anatomy and articulated limbs.

There is no reusable interface radius or spacing scale. Geometry belongs to the procedural drawing functions in `index.html`.

## Components

These are Canvas drawing systems, not DOM interface components. The sidecar therefore has no fabricated HTML/CSS component previews.

### Terrain impressions

Deterministic pits, fibers, mown bands, clover, wheel tracks, seams, ballast, and banks are rasterized per terrain row and reused. At most 128 row impressions remain in the print cache; resize clears that cache. Lane markings and moving water lines draw over the cached substrate.

### Frogs and autonomous movement

One frog enters immediately; subsequent entrants follow a clock independently of wins and deaths. An entrant begins moving after a short 0.12–0.20-second delay, independent of its lifetime ID. Dead simulation bodies are retired after each update; their paths and splashes remain. Live population and archived pigment are separately bounded. Hops take 0.18 seconds and use an ease-out quartic trajectory. Decisions retain a three-move look-ahead with beam width 7. Relocating survivors score movement toward their new bank departure column strongly, and avoid prematurely entering the road while still far from it. Traffic clearance solves periodic swept intervals directly; distant frog reservations are rejected before predicting positions.

### Pigment impressions

Paths record actual motion, including partial hops, reversals, and reduced-motion hops. Every living frog strengthens its complete recorded route as it ages. Path density uses maturity squared, with starting wash/body/dry-mark opacities of 0.008/0.012/0.005; early routes remain very faint before stronger pigment builds. Irregular translucent ribbons and broken dry deposits are fixed to distance along that route. Completed routes retain their final strength as new frogs enter. The archive keeps up to 128 routes, retiring completed routes first; each route retains at most 1,024 points. Collinear movement extends its existing segment. Sample geometry is cached until movement or resize changes it, and the combined raster refreshes at most ten times per second. Routes rebase with the board on resize.

Death splash linear scale is multiplied by `1 + maturity * 2.8`. Each death makes a stationary layered impression with wash, dried rim, stipple, droplets, and angular event marks. Its raster is 128 × 128 pixels, displayed relative to tile size, with a 1.65-second bloom. Stains remain as new frogs enter; retained history is capped at 640 stains. Traffic does not move, smear, dilute, or collect pigment. There is no car-tint state or tire-transfer renderer.

### Camera and motion preferences

Admission continues on the same clock after the last death; there is no round reset or aftermath pause. Reduced motion makes hops immediate after checking their hazard path, removes limb extension and death particles, and makes stain bloom immediate. It preserves the autonomous simulation and some environmental motion; it is not an animation-off mode. Hidden tabs cancel requestAnimationFrame and resume without time catch-up.

Validation: `node scripts/check-many-frogs.mjs` covers the exact 80% road, collision windows, timed arrivals before wins, actual horizontal bank relocation, wordless rendering, growth after each winning pass, faint-to-strong path rendering, stationary pigment beneath traffic, pale cars after impacts, offspring, shuttle turnaround, visibility, normal/reduced-motion lifecycle, resize, caches, and bounded stain/path history. Historical timing samples elsewhere in this repository predate the current rendering changes.

Rendering has no external asset dependency. The source also contains an external Bakalytics analytics script; portability claims describe the artwork renderer, not the absence of all network requests.

## Do's and Don'ts

### Do:

- Do preserve the close natural-pigment family and the ghost-white environment it sits on.
- Do retain route decisions, reproduction, stationary death impressions, and the shuttle turnaround as part of the artwork.
- Do keep terrain and pigment impressions cached, with bounded retained history.
- Do keep this visual system scoped to Many Frogs.

### Don't:

- Don't restore smiles, white frog eye discs, full side elevations, gloss, or a spectral rainbow.
- Don't scroll the board or add a finish line; the crossing is a shuttle with no end.
- Don't add independent environmental colors; all color must belong to frogs, their paths, or their death impressions.
- Don't replace the procedural moving field with a static illustration.
- Don't add buttons, navigation, captions, counters, edge markers, or score overlays.
