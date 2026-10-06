---
name: Mount Fuji
description: A fixed landscape inheriting Loaded Brush's bristled oil relief on linen.
colors:
  ground: "#ebe6da"
  ink: "#282a29"
  ultramarine: "#31508c"
  snow: "#fff5dd"
  sun-gold: "#e6bd54"
  sky-blue: "#234781"
  lake: "#7395a9"
  reeds: "#35453e"
  button: "#eee8dc"
  button-hover: "#dcd7cb"
  button-ink: "#343b3d"
typography:
  label:
    fontFamily: "Georgia, serif"
    fontSize: "12px"
    lineHeight: 1.4
components:
  save-button:
    backgroundColor: "{colors.button}"
    textColor: "{colors.button-ink}"
    typography: "{typography.label}"
    padding: "9px 12px"
---

# Design System: Mount Fuji

## Overview

This piece inherits the material language of `053-loaded-brush`: visible linen weave, mixed pigment, bristle grooves, uneven deposits, and low directional light across raised paint. The user's requested continuity is the visual authority. The authored landscape replaces the brush editor with a quiet, fixed painting.

These decisions are local to this artwork. They do not redefine the gallery's visual system.

## Colors

Ultramarine and ivory snow establish Fuji against a swirling cobalt sky. Golden curls orbit a yellow sun and reflect in the turquoise lake; olive and ochre reeds carry the foreground. The user requested short, curving strokes inspired by Van Gogh. The frontmatter records representative pigment stops and interface colors; the renderer contains the full multicolor stroke mixtures. Lighting and pigment mixing alter their displayed appearance.

## Typography

Small Georgia labels keep the title and save action subordinate to the canvas. The artwork has no display typography or editorial content blocks.

## Layout

The canvas fills the viewport. A centered 1200 × 800 composition scales uniformly to fit, retaining the entire landscape on portrait screens. Bare linen surrounds irregular painted edges. The title and Save PNG button sit at the lower left with an 18px gap and safe-area-aware offsets of at least 20px horizontally and 18px vertically.

## Elevation & Depth

Depth comes from the inherited paint height field, bristle ridges, ambient occlusion, cast shadows, and wet highlights. The light has a fixed 225-degree azimuth and 28-degree elevation. Interface controls use a simple border rather than decorative elevation.

## Shapes

Every mark is a short, pressure-varied curved ribbon. Overlapping hooks follow the mountain slope and broken snow gullies; directional fields curl the sky around the sun. Small crescents build the water. No long horizontal scumbles or continuous base fills remain. The painted perimeter stays ragged and unframed; the save control retains simple rectangular geometry.

## Components

The painting is a static WebGL 2 canvas with descriptive accessible text. It redraws on resize while preserving composition. Save PNG exports the painting; S invokes the same action. The button uses a muted border, darker hover fill, and a two-pixel ultramarine focus outline offset by four pixels. Plain serif fallback text replaces the painting when the required rendering support is unavailable.

## Do's and Don'ts

- Do preserve Loaded Brush's material rendering and multicolor bristles when extending this piece.
- Do retain the complete mountain composition on narrow screens.
- Do keep controls visually secondary and keyboard accessible.
- Don't turn this fixed landscape into a stroke editor without a new user request.
- Don't apply this artwork's palette or composition as a global gallery rule.
