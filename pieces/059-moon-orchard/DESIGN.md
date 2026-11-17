---
name: Lunar Landgrab
description: A self-playing illustrated lunar patrol.
colors:
  ink: "#25232b"
  paper: "#fff0d3"
  sky: "#dcc3f5"
  distant-body: "#b7a8c9"
  distant-ink: "#89769e"
  middle-body: "#7fc9ba"
  middle-ink: "#428e83"
  road: "#ffedca"
  earth: "#8f7565"
  pipe: "#eee6d5"
  orange: "#ff792e"
  pink: "#ed4c95"
  violet: "#b271e5"
  coral: "#ed5949"
  yellow: "#f8ec4e"
  spark-orange: "#f4773b"
  rock: "#b9b0a4"
  turret: "#ae5f3a"
  triad-body: "#a8dcd5"
components:
  artwork:
    backgroundColor: "{colors.sky}"
    width: "100%"
    height: "100%"
  fixed-pipe:
    backgroundColor: "{colors.orange}"
  fixed-pipe-pink:
    backgroundColor: "{colors.pink}"
  fixed-pipe-violet:
    backgroundColor: "{colors.violet}"
  fixed-pipe-coral:
    backgroundColor: "{colors.coral}"
---

# Design System: Lunar Landgrab

## Overview

**Creative North Star: "Illustrated Lunar Patrol"**

A self-playing lunar patrol rendered as smooth ink contours and flat color. The approved illustrated world uses a spacious lavender sky, jagged lavender mountains, turquoise hills, whimsical alien architecture, classic saucers and a low three-wheel rover. This design system applies only to this piece.

Distance is organized by palette as well as overlap and motion. Mountains and distant buildings share one lavender family; hills and middle buildings share one turquoise family. Foreground wreckage grows into architecture that retains its source paint, making the crash and replacement cycle visible without a HUD.

**Key Characteristics:**
- Smooth outlined procedural drawing at display resolution.
- Two quiet, color-isolated background planes and an inherited-color foreground.
- Flattened alien pods, substantial uneven stems, irregular apertures, balconies and framed bays.
- Fixed paired fire, recognizable tumbling parts and a compact garage exit.
- Full-viewport, text-free artwork with accessible pause and image export.

## Colors

The frontmatter owns the literal palette. `orchard.js` is the implementation source; its legacy variable names do not describe the new hues (`C.cyan` is distant lavender and `C.green` is middle turquoise).

### Primary

- **Orange, pink, violet and coral:** Replacement body paints cycle in that order. Dark ink contours, windows and hubs provide foreground definition. Fixed guns use the exact generation body paint, with flared roots merging into the chassis. The `fixed-pipe` token is the initial orange state; its sibling variants follow replacement generations.
- **Distant body / distant ink:** One muted lavender family covers mountains, their ridge marks, distant towers, quiet saucers and their tiny harmless drops. Buildings use the same body fill and contour ink as the mountains.
- **Middle body / middle ink:** One turquoise family covers hills, embedded middle towers, quiet saucers and their drops. Background portholes and architectural details stay within the plane's contour ink.

### Secondary

- **Pipe:** Rotating enemy turret barrels, foreground bombs, dart hulls and small rover mechanical details. Rover gun bodies use generation paint.
- **Yellow:** Scout hulls, foreground paired-shot cores, bomb bands, muzzle flashes and sparks.
- **Orange / pink:** Bomber and carrier hulls respectively; foreground saucer canopies are tinted from their hull paint.
- **Triad body:** Pale turquoise spheres with orange cores and dark ink links distinguish the fifth foreground UFO type from the four classic saucers. This foreground paint does not expand either background plane's palette.
- **Spark orange:** One of the foreground spark paints, alongside yellow, pink and paper.
- **Rock / turret:** Warm gray angular rocks and rust turret pedestals, outlined in foreground ink.

### Neutral

- **Sky:** The uninterrupted lavender background and page fallback.
- **Road / earth:** Cream ground with sparse brown surface marks and crater under-edges. Crater interiors use middle body paint. Stroke only the descending sides and bottom; never close the ink contour across the open mouth. The physical pit profile stays unchanged.
- **Ink / paper:** Warm dark outlines, windows, hubs and openings; cream paper for hit flashes, sparks and generated foreground tints. Foreground window rims and small architectural accents use flat inherited-paint tints toward paper, not shiny edge streaks or lighting gradients.

**The Layer Family Rule.** Keep distant terrain, buildings, saucers and decorative drops within the distant body/ink family, and middle scenery within the middle body/ink family. Do not borrow foreground accents for either plane.

**The Material Inheritance Rule.** Derive each tire channel by rounding the body sRGB channel multiplied by 0.55. Wheel fragments and their buildings retain that darker paint; other fragments and their buildings retain body paint.

## Typography

There is no visible typography or display type scale. The HTML title, description and canvas accessible name live outside the artwork. Do not introduce a typeface or typography tokens for a drawing that contains no text.

**The Text-Free Rule.** Keep titles, instructions, counts and status outside the drawing. Use accessible names and machine-readable data for this information.

## Layout

One canvas fills the viewport without scrolling or surrounding chrome. CSS uses `image-rendering: auto`. The backing bitmap is `round(innerWidth × ratio)` by `round(innerHeight × ratio)`, where `ratio = min(2, devicePixelRatio || 1)`. A context transform maps the full backing bitmap to the existing logical physics space: width `min(480, innerWidth)` and height `round(innerHeight × logicalWidth / innerWidth)`. Image smoothing is enabled; line caps and joins are round. All following dimensions and velocities use logical units, not backing-store pixels. There are no responsive breakpoint swaps.

The road begins at 84% of logical height. Mountain height is capped at 174 or 48% of height; hill height is capped at 85 or 25%. Resizing preserves the viewport aspect ratio and reanchors active objects to the new ground and their depth-layer bases. The buggy's preferred 24-second cruise spans 19–28% of viewport width, with avoidance limited to the left 42%.

## Elevation & Depth

Depth comes from flat tonal planes, contour weight, overlap, scale and parallax. There are no UI shadows or raised surfaces. Terrain moves at 66 units/s while driving; distant mountains and cities move at 0.18 of that speed and middle hills and cities at 0.46. Distant contours are lavender ink, middle contours turquoise ink and foreground contours warm dark ink. Hills overlap middle city foundations.

Distant skylines repeat with 340-unit mountain tiles; middle clusters occupy alternating 290-unit hill tiles. Stable world tile indices keep architectural variants consistent during scrolling. Distant saucers use 0.27 drawing scale (roughly 6–8 × 3); middle saucers use 0.43 (roughly 9–12 × 4). Hover amplitudes use the respective 0.55 and 0.82 layer scales. Distant activity draws after the mountains. Middle saucers, bombs and impact effects draw before the middle hill loop, so hills occlude them as they descend behind the terrain.

Death freezes camera travel and city scrolling while atmospheric UFOs continue hovering and dropping harmless tiny bombs. Pause freezes simulation across every layer. Background cities remain static artwork; only foreground wreckage grows.

**The Flat Ink Rule.** Use flat fills and drawn contours; do not introduce gradients, glow or baked lighting.

## Shapes

Use continuous ink paths, ellipses and Bézier curves rather than scan-converted sprites. Thin strokes vary with the feature: shared path defaults are 0.75, ellipses 0.7 and lines 0.65 logical units. Smaller architectural marks use lighter weights. Authored angular mountain peaks and shoulders contrast with broad smooth hills and curved alien buildings. The mountain silhouette uses one continuous fill and open skyline across matching 340-unit repeats, with no sinusoidal noise or visible tile seams. Sparse connected summit/shoulder folds replace detached slash marks. The distant lavender palette, height limits, 0.18 parallax and cities remain unchanged.

Close architecture mixes flattened asymmetric pods, thicker uneven bottle stems, twin towers, offset stacks, broad domes, asymmetric balconies, restrained side pipe loops, framed bays and occasional checkerboard panels. Kidney-shaped, tapered and mullioned apertures use unequal heights and offset groupings, thin inherited-paint rims and sparse short seams. Avoid uniform eye-like porthole rows, mouth underlines, shiny edge streaks and knob antenna tips. The former large loop bridge is a framed bay. Background architecture remains simpler and within its two-color family. Distant and middle city stems have open stroked contours, and their foundations fill without strokes; neither background city plane has a bottom baseline. Foreground foundation outlines remain unchanged. No white rooftop crossbars. Foreground non-garage towers and background cities retain the 0.9 city scale; the garage remains 44 × 34.

The rover has a low curved chassis and three smooth elliptical tires with rotating tread marks. Broad body-painted gun pipes flare continuously into the chassis and point strictly upward and forward. Tumbling wreckage uses continuous rotation and recognizable wheel, panel, chassis, cockpit and barrel forms. The four classic saucer types use an elliptical disc and a simple dome, with proportions varying by type. Triads instead use three pale-turquoise spheres with orange cores connected by dark ink links. Rocks retain angular outlines; sparks are short ink-edged strokes rather than pixel squares.

## Components

### Artwork canvas

Click or Space toggles pause; Enter toggles when the canvas is focused. The canvas is keyboard focusable, has a button role, an accessible description and an `aria-pressed` pause state. Keyboard focus uses a one-CSS-pixel ink outline inset three pixels. Reduced-motion preference starts paused. S exports the current backing bitmap as `lunar-landgrab.png`. Diagnostics remain canvas dataset fields. No visible controls or HUD are drawn.

### Rover and fixed paired fire

One rover initially uses nearby-hazard reactions, then replacement generations gain predictive avoidance after the first death. There is no forced opening crash. Clear-road screen velocity approaches its target at 54 units/s² and is limited to −10…12 units/s. Hops launch at 157.5 units/s with gravity 294 units/s², lowering peak height by 30% from 60.27 to 42.19 units while preserving 1.071 seconds of level-ground airtime. Predictive collision padding remains 6 units normally and 7 during easing, but is capped at 2 for tall rocks (size > 18); physical collision padding stays 0. Safe ground-hop plans commit their launch timing and throttle; the mature planner may rehearse deceleration from a committed jump boost when the entire remaining flight and landing stay safe. Obstacle destruction or a new incoming projectile can cancel a plan.

The forward muzzle center is `(rover.x + 25, ground − jump − 10)` and the upward center is `(rover.x − 4, ground − jump − 28)`. The body-painted pipes merge into the chassis through flared roots. Their illustrated openings align exactly with `gunMuzzles`; pipes do not swivel. One trigger emits both rounds together at 320 units/s, subject to a shared 0.22-second interval and at most three airborne paired bursts. A pair keeps its slot until both rounds disappear. Shots are short yellow strokes edged in ink; relative swept collision checks resolve impacts. Ground targets trigger paired fire only when ahead and within the fixed forward barrel height. Low chips below the barrel require hops rather than wasted bursts; pairing and the three-burst limit stay unchanged.

### Saucers, bombs and turrets

Foreground waves enter from ahead and move right to left. The five repeating formations are three scouts; bomber/scout/bomber; three darts and a scout; carrier/triad/dart/scout; then triad/bomber/triad. Maximum active UFOs is six. Scouts and darts take one hit, bombers two, carriers three and triads four. Wave gaps vary from 6–11 seconds after the preceding wave clears. Ordinary vertical bombs use a shared varying 2.8–4.4-second drop gap. Triads bypass that cooldown, carry four bombs and use a 1.1-second per-ship drop interval, initially ready after `0.55 + slot × 0.24` seconds. All drops still require a ship more than 65 units ahead and share the maximum of three airborne bombs. Triad bombs start 14 units below the ship with downward speed 50, rather than the ordinary 8-unit offset and speed 32; all have zero horizontal velocity and gravity 48 units/s². Triads move at base speed 34 with an 8-unit hover amplitude and frequency 2.8, and a 26 × 20 collision envelope. Bombs open real craters. Quiet depth saucers and their tiny decorative drops have no foreground combat effects.

Rust turrets have rounded inked pedestals and cream rotating pipe barrels. They take three hits, track and elevate toward the rover, and fire interceptable rounds at 105 units/s, 3.2–4.8 seconds apart. New turrets appear on clear ground in singles or pairs; pair members are 1.8–3.4 seconds apart, followed by 16–32-second gaps. Turrets stop firing during rebirth. Medium rocks (11–14 units) and low chips (6–8 units) take one hit; heavy rocks (24 units) take three. Chips use a broken, low angular profile. Five cyclic authored ground phrases—step-hop, rattle, double-hop, heavy and offbeat—each place 3–5 real hazards at fixed world offsets, including pits 24–32 units wide. `spawnGroundPattern(index = groundPattern++)` adds each phrase together as offscreen world objects. After the last beat, a rest of 198–264 world units gives 3–4 driving seconds. The first phrase starts after 0.6 seconds; its clock pauses with the camera and preserves post-garage grace. Bomb-created craters retain their existing sizes and behavior.

### Wreckage, towers and garage

A fatal hit stops scrolling and scatters three wheels plus chassis, cockpit, barrel, axle and panel pieces. Every piece settles against the terrain before growth begins; existing foreground bombs must also finish falling. After 0.35 seconds of rest, source-colored structures grow over 2.6 seconds with small staggered starts. Body fragments retain body paint and wheels retain their darker paint. Wheel-derived towers keep a wheel detail.

One suitable fragment becomes the compact 44 × 34 garage with one offset mullioned window; the other structures use varied silhouettes at the established 90% city scale. Growing foundations blast nearby turrets and rocks, gradually fill nearby holes and rise with repaired ground. Hazards outside their reach remain; later bombs may create new holes. The garage shutter opens over 0.5 seconds, then the replacement emerges over 1.8 seconds. It clears the garage before camera travel and combat resume, without an extra shove or forced hop. The replacement cycles to the next body paint; prior buildings retain their inherited colors and scroll with the road.

## Do's and Don'ts

### Do:

- Do keep the distant and middle palette families isolated across terrain, cities and atmospheric activity.
- Do preserve smooth ink contours, round rotating tires and recognizable rotating debris.
- Do merge body-painted guns into the chassis while aligning openings with the actual fixed projectile origins.
- Do preserve body and tire paint through wreckage and foreground city growth.
- Do keep the compact garage clearance and the existing gameplay coordinate space.

### Don't:

- Don't restore the discarded black sky, saturated cyan/green landscape or pixelated rendering.
- Don't add visible titles, scores, captions, labels, instructions or text controls.
- Don't add gradients, glow, baked lighting or white rooftop crossbars.
- Don't cap pit mouths with an ink line or give close buildings uniform eye rows and mouth curves.
- Don't draw middle-layer UFO activity over the hills or add bottom baselines to distant or middle buildings.
- Don't turn background cities into growing structures or atmospheric UFOs into combat targets.
- Don't replace live procedural drawing with the approved still image.
