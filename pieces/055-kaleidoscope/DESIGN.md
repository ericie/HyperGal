---
name: Kaleidoscope
description: Luminous candy geometry in a continuously evolving mirror field.
colors:
  midnight: "#100c29"
  light-center: "#352057"
  light-middle: "#191039"
  candy-pink: "#ff548f"
  sunny-yellow: "#ffcc49"
  turquoise: "#48f1df"
  violet: "#b486ff"
  orange: "#ff814d"
  cornflower: "#7baaff"
  glass-edge: "#fff5dd"
  glass-center: "#fffbe6"
  control-ink: "#fff5ff"
  control-surface: "#191331"
  control-border: "#706080"
  control-hover: "#3a2855"
  border-hover: "#ffc7ed"
  focus: "#ffdb63"
typography:
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "13px"
    lineHeight: 1
rounded:
  control: "20px"
spacing:
  control-gap: "8px"
  edge: "18px"
components:
  artwork-control:
    backgroundColor: "{colors.control-surface}"
    textColor: "{colors.control-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 18px"
  artwork-control-hover:
    backgroundColor: "{colors.control-hover}"
---

# Design System: Kaleidoscope

## Overview

**Creative North Star: "Luminous candy geometry"**

Bright, playful shapes evolve autonomously into a mirrored field. This design applies only to artwork 055; Hypermedia Club's gallery and other independently styled works retain their own identities. Preserve the artwork's self-contained, dependency-free delivery.

**Key Characteristics:**
- Full-viewport geometric color.
- Continuous mirrored recombination.
- Quiet, legible artwork controls.

## Colors

The six candy colors share the artwork equally. Midnight and the two light-pool colors provide a violet ground; glass-edge and glass-center add pale highlights. Control colors remain separate from the animated palette, with a yellow focus outline.

## Typography

System sans-serif labels serve controls only. The artwork carries the visual hierarchy without a displayed title or prose overlay.

## Layout

The canvas fills the viewport without scrolling. Controls form a horizontal row at the bottom right, respecting safe-area insets and the edge spacing. The rendering radius covers the viewport diagonal, preserving coverage at narrow and wide aspect ratios.

## Elevation & Depth

Canvas shadows give each shard a soft glow in its own color. Fine pale outlines and translucent inset polygons suggest illuminated glass; controls use flat opaque fills and borders, without box shadows.

## Shapes

Triangles, squares, and hexagons combine filled and hollow forms. Twelve alternating reflected wedges produce continuous symmetry. Rounded control silhouettes distinguish interface from the angular artwork.

## Components

### Artwork controls

Pause/Play and Save image are native buttons with a minimum height of 44px. Hover changes fill and border; keyboard focus uses a 2px yellow outline offset by 4px. Space toggles motion, S saves a PNG, and R creates a new arrangement. Native button keyboard activation remains intact.

### Kaleidoscope field

The field combines 180 geometric fragments, 100 faceted translucent polygonal prisms and 4,200 glitter flecks. Cached prism films carry rainbow interference contours and soft highlights; layered drift and smooth shimmer create depth. Animation suspends while the document is hidden. Reduced-motion preference starts the artwork paused and updates its state when the preference changes; explicit Play remains available.

## Do's and Don'ts

- **Do** preserve bright, playful geometry and autonomous evolution.
- **Do** keep controls legible and subordinate to the artwork.
- **Do** preserve reduced-motion support and keyboard controls.
- **Don't** impose this artwork's palette or composition on the gallery or other pieces.
- **Don't** introduce external fonts, libraries, or network dependencies.
