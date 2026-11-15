---
name: Painting Together
description: A changing oil painting using the original Loaded Brush material.
colors:
  linen: "#ebe6da"
  focus-blue: "#31508c"
  navy: "#19355e"
  steel-blue: "#426f9a"
  mist-blue: "#8eafbb"
  cream: "#f2e5c8"
  deep-teal-blue: "#254e71"
  slate-teal: "#548d9c"
  pale-celadon: "#acd0c5"
  pale-straw: "#e9dfbb"
  muted-mauve: "#705f63"
  warm-ochre: "#be936b"
  golden-ochre: "#e7bf68"
  light-yellow: "#fff0ba"
  indigo: "#243e68"
  muted-violet: "#5a6090"
  pale-violet: "#a6a2ba"
  warm-grey: "#e1d9ce"
  deep-teal: "#254c58"
  sage: "#6d8b80"
  olive-grey: "#b1b798"
  light-ochre: "#eadbb7"
  red-earth: "#8d503f"
  copper: "#c58056"
  sand: "#deb27d"
  buff: "#f0dab0"
---

# Design System: Painting Together

## Overview

**Creative North Star: "Loaded Brush material"**

The original Loaded Brush material is the visual authority: linen weave, multicolor bristles, curved pressure ribbons, raised pigment and dry edges. The painting is an abstract accumulation of brushwork, with no literal landscape or illustrative subject.

Motion is the application of new paint. Completed strokes stay fixed on the surface while advancing brushes reveal their loaded color and leave a raised leading bead. The inherited material renderer supplies the continuity; this local system does not redefine the gallery interface.

**Key Characteristics:**
- Oklab-mixed pigment carried across individual bristles.
- Curvature-aware ribbons with pressure, pileup and dry run-out.
- Raised paint and linen described by raking light.
- Persistent completed marks with live overpainting and direct drag painting.
- A full-viewport, text-free artwork.

## Colors

The six four-stop pigment loads in `mount-fuji.js` are the palette source. Frontmatter records those exact stops plus the HTML linen ground and keyboard focus pigment. Displayed colors vary with interpolation, bristle mixing, coverage and lighting; these are paint loads rather than flat UI fills.

### Primary

The navy–steel-blue–mist-blue–cream load and deep-teal-blue–slate-teal–pale-celadon–pale-straw load carry the principal cool passages. The indigo–muted-violet–pale-violet–warm-grey load adds violet variation. Color is distributed across the brush face, not assigned to depicted objects.

### Secondary

The deep-teal–sage–olive-grey–light-ochre load supplies the green passages. Broad irregular pigment bands influence palette selection, with slowly changing flow and local variation rather than object silhouettes.

### Tertiary

The muted-mauve–warm-ochre–golden-ochre–light-yellow and red-earth–copper–sand–buff loads supply the warmer passages. A stroke may carry the first three stops, a middle–light–middle load, or the complete four-stop palette; some loads reverse across the brush.

### Neutral

Linen is the HTML ground behind the renderer. The shader generates its own warm, mottled linen albedo and height rather than flattening this to a single color. Focus Blue is reserved for the existing canvas keyboard-focus outline.

## Typography

There is no visible typography or type ramp. The document title and description remain metadata. The canvas accessible name describes the material and gives drag and keyboard instructions; the fallback image has descriptive alternative text. Neither appears as text over the artwork.

## Layout

The canvas fills the viewport without scrolling, visible controls or a fixed landscape frame. Stroke dimensions use `min(viewport width, viewport height) / 900` as their unit. Paths are stored as viewport fractions and rendered as CSS-pixel ribbons. Viewport shape changes the available painting surface rather than preserving a literal subject composition.

Rendering scale starts with device pixel ratio clamped between 1.5 and 2, is reduced toward a target of 2.6 million texels, and has a floor of 1. The floor means that target can be exceeded when the viewport itself is larger than 2.6 million CSS pixels. This is the actual sizing formula, not a strict total-memory ceiling.

A resize stops animation, waits 150ms, reallocates the render targets and starts the painting again. Existing hand marks are not retained across that reset. These are canvas and material dimensions; there is no interface spacing or corner-radius scale.

## Elevation & Depth

The original WebGL 2 renderer separates pigment, paint relief and primed linen. Linen threads waver in width and height, with irregular fibres and mottle. Each stroke deposits coverage, height and gloss; groove families follow individual hairs while thicker pigment accumulates at the landing, brush edges and advancing front. Inner hairs crowd and pile paint on turns, outer hairs stretch it thinner, and pivoting hairs scrub the surface. Dry hairs catch the weave crests and run out independently.

A height-derived normal field, marched cast shadows, local ambient occlusion and wet two-lobe specular response describe the raised material. A warm key light, cooler fill and soft environment reflection illuminate it. The key light has a 28-degree elevation; its azimuth varies only five degrees around 225 degrees on a slow clock. This is relief within the painting, not interface shadow styling.

**The Material Continuity Rule.** Preserve the inherited bristle-space pigment, linen, paint height and relief lighting when extending the work. The dynamic brushwork is the subject.

**The Deposited Paint Rule.** Completed paint stays fixed. Animate the advancing application and commit each finished stroke once; do not move or repeatedly stamp the deposited surface.

## Shapes

The stroke is a pressure-varied ribbon along a centripetal Catmull–Rom path, sampled at approximately two CSS pixels and perturbed by a slow hand tremor. Twelve columns across the brush resolve its curvature. Inner offsets squeeze toward the pivot rather than folding through the centre of curvature.

Landings are rounded, raised and irregular. Brush sides have stray hairs and pushed paint lips; ends narrow and thin as the brush lifts. Broad lean scrubs sit beneath shorter loaded marks and larger final gestures. These are deposited paint forms, without an imposed geometric icon, illustration or object silhouette.

## Components

### Painting surface

The sole interactive surface is a focusable WebGL 2 canvas, with floating-point render-target support required. It uses half-float pigment and relief targets. Missing support or initialization failure reveals the existing thumbnail image without visible fallback copy. The image fits its viewport with `object-fit: contain`.

The canvas suppresses native touch panning. Keyboard focus uses a two-pixel Focus Blue outline with a negative five-pixel outline offset. Space pauses/resumes autonomous painting, R starts a new painting, and S exports the rendered surface as PNG. No visible buttons accompany these actions.

Dragging deposits a loaded ribbon directly into the surface. A pen supplies pressure clamped from 0.2 to 1; other pointers use 0.9. Hand strokes use a width of 65 painting units, thickness 1 and load 1.25. Pointer movement adds a point after five CSS pixels; pointer release, cancellation or lost capture commits the hand stroke. A stroke also commits after more than 70 points. Direct painting remains available while autonomous application is paused or reduced motion is active.

The sidecar's canvas specimen records only the actual surface and focus treatment. The procedural painting is implemented by the material shaders and application code, and is not replaced with a decorative preview.

### Paint application

The initial surface receives 57 thin broad scrubs, 260 unequal loaded marks and 13 broad final gestures. New paths follow a slowly evolving flow around an eddy and overlap the established surface. Up to four autonomous paths can advance at once. Each reveals over `1.5 + run / (150 × painting unit) + random × 0.6` seconds, using smoothstep travel. A fresh application can begin every 0.75–1.6 seconds while capacity is available and no hand stroke is active.

A half-float backing framebuffer holds completed strokes. Each live frame copies that backing and draws the advancing applications over it; completion deposits a stroke once and releases its buffer and gradient texture. The moving bead belongs to the application front. The finished mark remains in the backing rather than becoming an independently animated shape.

The default seed is `fuji`; an optional `seed` query parameter changes it. R increments the painting revision. Hidden tabs and reduced-motion preference suspend the animation loop and reset its timestamp, preventing catch-up. Live preference changes are respected. Frame updates are capped at 0.07 seconds. A restored WebGL context rebuilds the resources and starts a fresh painting.

## Do's and Don'ts

### Do:

- Do preserve the original Loaded Brush material and multicolor bristles.
- Do mix loaded gradient stops in Oklab before converting back for the GPU texture.
- Do keep the distinct landing, advancing bead, edge lips and hair-by-hair dry trails.
- Do preserve keyboard pause, regeneration and PNG export alongside drag painting.
- Do suspend autonomous application while hidden or under reduced motion.

### Don't:

- Don't replace painterly material with literal scenery or decorative illustration.
- Don't add visible titles, labels, instructions, captions or text controls.
- Don't move completed strokes as floating objects or stamp the advancing stroke repeatedly into the backing store.
- Don't introduce a separate visual language through specimen artwork or extra interface controls.
- Don't infer Selected status from completion; preserve WIP unless the user explicitly changes it.
