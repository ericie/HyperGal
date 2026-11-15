---
name: Lunar Founder
description: A self-playing saturated pixel arcade patrol.
colors:
  black: "#000000"
  white: "#ffffff"
  blue: "#1024ff"
  cyan: "#00a4bc"
  green: "#00d950"
  shade: "#00a000"
  peach: "#ffa65c"
  earth: "#bf7838"
  magenta: "#d500c8"
  window: "#00bce8"
  yellow: "#dce000"
  red: "#ff3000"
  rock: "#8c7100"
  turret: "#a04018"
spacing:
  pixel: "1px"
  double-pixel: "2px"
components:
  artwork:
    backgroundColor: "{colors.black}"
    width: "100%"
    height: "100%"
  fixed-shot:
    backgroundColor: "{colors.white}"
    size: "5px"
---

# Design System: Lunar Founder

## Overview

**Creative North Star: "Saturated Pixel Arcade Patrol"**

A self-playing pixel arcade patrol follows the user’s Moon Patrol reference: open black sky, cyan mountains with blue facets, green foothills, peach ground, and one small buggy whose body hue and darker matching tires change with each generation. Original procedural sprites and stepped silhouettes keep the artwork self-contained. This design system applies only to this piece.

**Key Characteristics:**
- Saturated flat fills and whole-pixel edges.
- Cities mixed into both landscape layers, three scrolling speeds, and one rover that drifts forward and back.
- Automatic hops, synchronized upward/forward burst fire, distinct UFO formations and attacks.
- Death stops landscape scrolling while wreckage grows into buildings and a compact garage releases the next rover; atmospheric hovering continues.
- A text-free full-viewport canvas with accessible pause and export.

## Colors

### Primary

- **Generation paints:** Body and fixed barrels share one generation paint. All three tires use the same darker shade, calculated by rounding each body sRGB channel multiplied by 0.55. Black windows, hubs and treads remain. Body debris keeps body paint; wheel debris and its resulting buildings keep the tire shade. Replacement generations cycle through deep magenta `#b00070`, crimson `#b02030`, plum `#9030a0` and rust `#a04018`. The body and fixed barrels have no perimeter outline. Each body paint has at least 3:1 luminance contrast against the main green hills, peach road and black sky. Blue, cyan and green landscape colors are excluded from buggy paint.
- **Mountain Cyan / Facet Blue:** Distant mountain silhouettes and their hard facets. Distant cities and atmospheric UFOs stay within cyan, blue and window cyan; cyan also appears in foreground UFO canopies.
- **Foothill Green / Hill Shade:** Nearer hills, road-edge pixels, and crater interiors. Middle-distance cities and atmospheric UFOs stay within green, shade and yellow, with black window detail.
- **Road Peach / Earth Brown:** Ground field and crater under-edge; brown also highlights rocks.

### Secondary

- **Window Cyan:** Dart hulls and distant-layer detail.
- **UFO paints:** Yellow scouts, red bombers, window-cyan darts and magenta carriers use simple dome-and-disc silhouettes in different proportions. Foreground ships have only hull and canopy colors; engines, windows, trim and white carrier outlines are removed. Projectile paint follows the firing type.
- **Rock Olive:** Solid angular rocks.

### Neutral

- **Space Black:** Sky, windows, hubs, treads and internal sprite cutouts.
- **Shot White:** Foreground projectiles travel only straight up or forward as five one-pixel samples; also one of the foreground square spark colors.

**The Hard-Pixel Rule.** Use flat palette fills and whole-pixel scan conversion; no smoothing, gradients, or glow.

## Typography

There is no visible typography. Keep the document title, description, and accessible canvas name outside the drawing. Do not introduce a title, score, captions, labels, or text controls.

## Layout

One canvas fills the viewport without scrolling or surrounding chrome. Its internal width is `min(480, innerWidth)`; its height is `round(innerHeight × internalWidth / innerWidth)`. CSS stretches the bitmap to the viewport with pixelated rendering, and the 2D context disables image smoothing. Measurements below use internal canvas pixels. There are no breakpoint swaps.

The ground begins at 84% of canvas height. Mountain height is capped at 174 pixels or 48% of height, whichever is smaller; foothill height is capped at 85 pixels or 25% of height. Resizing preserves the aspect ratio and adjusts active scene objects to the new ground position.

## Elevation & Depth

Depth comes from overlapping flat silhouettes and parallax, without shadows or raised surfaces. Terrain and obstacles scroll at 66 pixels/s; mountains use 0.18 of that speed (11.88 pixels/s), foothills use 0.46 (30.36 pixels/s). Mountain and hill contours are scan-converted in two-pixel steps; the black sky remains spacious above them. Small cyan and blue skylines share the mountain speed; green cities with yellow rims share the foothill speed. Hills overlap their foundations to embed the buildings in the terrain. Distant UFOs use 0.27 scale and measure 6–8 × 3 internal pixels; middle UFOs use 0.43 scale and measure 9–12 × 4. They have no combat hitboxes. Hover amplitudes use the existing 0.55 distant and 0.82 middle layer scales. Distant activity renders after mountains, before hills; middle activity renders after hills, before the foreground. City foundations and camera drift belong to their layer. Foreground death freezes camera travel while the atmospheric UFOs continue hovering; artwork pause freezes everything.

## Shapes

Rectilinear sprite parts and filled angular silhouettes define the scene. Landscape, rocks, and crater edges use two-pixel steps; rover details, saucers, and projectiles use whole-pixel rectangles. Wheels have angular tires in a darker shade of the body paint, black hubs and moving black tread pixels. Foreground sparks are two-pixel squares; the background layers contain no combat sparks. No rounded interface surfaces are present.

## Components

- **Artwork pause target:** Click or Space toggles pause; Enter also toggles when the canvas is focused. The canvas has a button role, accessible description, and an `aria-pressed` state reflecting pause. Keyboard focus is a white one-pixel outline inset by three pixels. Reduced-motion preference starts paused. S downloads the current frame as `lunar-founder.png`; no visible controls are drawn.
- **Buggy and weapons:** One compact rover has a preferred position between 30% and 43% of the canvas width over a 24-second cycle, with a predictive jump planner and recovery timer. Original whole-pixel sprites are about 57% of the previous rover width. Clear-road screen velocity is limited to −10…12 pixels/s and approaches its target at 54 pixels/s², keeping world progress within 56–78 pixels/s against the 66-pixel/s camera. Terrain can override that preference. Safe ground-hazard maneuvers commit their throttle and launch time through landing; plans cancel if their obstacle dies or a new incoming projectile appears. Two fixed barrels point straight up and straight forward. A single trigger always emits both rounds together. One shared 0.22-second firing interval and a limit of three airborne paired bursts control both cannons. Each pair retains its burst slot until both rounds disappear, so losing one round cannot enable independent fire. Rounds travel at 320 pixels/s along the two fixed axes. The sprite has simple fixed pipes and no swivel housing. Relative swept collision checks resolve real impacts. Hops launch at 225 pixels/s with gravity of 420 pixels/s². Collision bounds match the smaller wheels and chassis.
- **Background cities:** Distant six-building skylines use cyan walls, blue facets and windows, and cyan roof highlights. Nearer clusters use green windowed pods, yellow rims, antennae and connecting bridges. Mountain cities repeat with the 340-pixel mountain tiles; green city clusters occupy alternating 290-pixel hill tiles. World tile indices keep their variants stable across scrolling wraps. These repeating clusters remain scenery; no additional cities spawn or grow in the background.
- **Atmospheric UFOs:** Up to two small saucers per depth plane drift at 2 × layer scale pixels/s, with a gentle 3 × scale horizontal sway and 2 × scale vertical bob. They are scenery outside foreground collisions, with no combat. Background cities are static drawing functions inside the mountain and hill layers; no dynamic city objects, growth function or growth timer remains. Private random streams preserve foreground behavior.
- **UFO waves:** The opening formation has three scouts. Successive formations add bombers, fast weaving darts, and mixed carrier groups, with staggered 0.4-second arrivals. A wave clears before a 2.5–4.1-second quiet interval. Six ships and four airborne UFO projectiles are the limits. Scouts/darts need one hit, bombers two, carriers three; hits briefly flash the hull. Bombers and carriers lead their drops ahead of the rover; darts fire fast aimed bolts. Later waves increase speed gradually within a fixed bound. Arrivals and attacks pause during rebirth; existing ships still fly.
- **Ground turrets:** Primitive deep-rust mounts use a squat fixed pedestal and a pipe barrel in one #a04018 paint with no perimeter outline, with no tracks, windows or sensors. Their aiming pivot is 11 pixels above the ground and rounds originate 15 pixels along the barrel direction. One starts on the road; later emplacements appear every 7.5–11 seconds of driving on clear ground, with at most three alive. Barrels turn at 2.4 radians/s toward the rover and its jump height. A brief charge precedes red rounds, with a 1.9-second firing interval, muzzle flash and recoil. Turrets need three buggy shots, and their shots can be intercepted; nearby city growth destroys them outright. Shots travel at 130 internal pixels/s relative to terrain, with at most eight alive. Turrets and shells scroll with the road. Targeting and firing stop during rebirth while existing shells finish flying; muzzle flashes fade. Bomb craters can destroy turrets.
- **Crashes and rebirth:** Fatal contact stops all scrolling. Ten recognizable parts scatter, tumble and settle. After all parts rest and bombs finish falling, a 0.35-second resting beat precedes 2.6 seconds of growth with a 0.045-second stagger. Wreck-grown towers retain three times their former width and height, preserving their source paint or darker tire shade. One part instead becomes a compact garage, 44 pixels wide and 34 high, compared with the former 60-pixel-wide garage. Its shutter lifts during the first 0.5 seconds of emergence; the buggy waits inside, then rolls out over 1.8 seconds. Scrolling resumes only after the buggy clears the garage. Growing foundations blast nearby turrets, rocks and holes within an 18-pixel margin of the expanding footprint. Each hazard explodes once per encounter; rocks and turrets disappear regardless of remaining armor, while holes fill gradually. The visible crater and collision floor rise together, the completed hole is removed, and sunken building foundations rise with the restored ground. The origin tower retains a raised floor for other nearby hazards. Buildings remain world-anchored and scroll with the road.
- **Hazards:** Small rocks take one buggy shot; large rocks take three. UFO formations cross in both directions and release red bombs that can be intercepted. Bomb impacts make green stepped craters with brown under-edges. Craters remain until they scroll offscreen or a growing city foundation reaches them or comes within 18 pixels of their edge. Each affected hole bursts once and fills completely as the foundation grows. Hazards farther from the city stay intact, and later bomb hits can damage the restored ground again. Nothing persists between reloads.

## Do's and Don'ts

### Do:
- **Do** preserve the open black sky, saturated landscape layers, and readable rover separated from the landscape by its paint rather than an outline.
- **Do** blast hazards near growing foundations once, fill affected holes, and preserve hazards outside that reach.
- **Do** retain keyboard access, reduced-motion pause, and dependency-free rendering.

### Don't:
- **Don’t** draw titles, scores, labels, controls, or a top bar over the artwork.
- **Don’t** add a repair saucer, downward repair shots, a moon, orchard growth, or saved scene state.
- **Don’t** introduce smoothing, glow, gradients, or interface panels.
