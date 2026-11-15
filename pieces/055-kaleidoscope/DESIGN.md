---
name: Kaleidoscope
description: Luminous candy geometry with adjustable mirror fields and object cells.
colors:
  midnight: "#100c29"
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
  control-muted: "#c2b4d2"
  control-border: "#706080"
  control-divider: "#493956"
  control-hover: "#3a2855"
  control-active: "#513865"
  focus: "#ffdb63"
typography:
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "13px"
    lineHeight: 1.4
  secondary:
    fontFamily: "system-ui, sans-serif"
    fontSize: "12px"
    lineHeight: 1.4
  panel-label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  panel: "14px"
  button: "8px"
  select: "7px"
spacing:
  field-gap: "14px"
  panel-inset: "16px"
  edge: "18px"
  compact-edge: "12px"
components:
  control-panel:
    backgroundColor: "{colors.control-surface}"
    textColor: "{colors.control-ink}"
    rounded: "{rounded.panel}"
    width: "318px"
  artwork-control:
    textColor: "{colors.control-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0 12px"
  artwork-control-hover:
    backgroundColor: "{colors.control-hover}"
  artwork-control-active:
    backgroundColor: "{colors.control-active}"
  select:
    backgroundColor: "{colors.midnight}"
    textColor: "{colors.control-ink}"
    rounded: "{rounded.select}"
    padding: "0 30px 0 10px"
  control-tab:
    textColor: "{colors.control-muted}"
    typography: "{typography.label}"
    padding: "0 5px"
  control-tab-selected:
    textColor: "{colors.focus}"
---

# Design System: Kaleidoscope

## Overview

**Creative North Star: "Luminous candy geometry"**

Bright, playful shapes evolve autonomously into a mirrored field. This design applies only to artwork 055; Hypermedia Club's gallery and other independently styled works retain their own identities. Preserve the artwork's self-contained, dependency-free delivery.

The requested optical controls extend the original artwork with an opaque violet instrument panel. Mirror layouts, materials, object cells, light, and motion are independent experiments. Their effects are stylized procedural interpretations of optical instruments, not physical simulations.

**Key Characteristics:**
- Full-viewport geometric color.
- Continuous mirrored recombination.
- Compact, legible optical controls.

## Colors

### Primary

The six candy colors share the original artwork equally. The renderer also defines Mineral, Amber & brass, Lagoon, Clear glass, and Stained glass palettes; these belong to the artwork, not the interface. The background color is adjustable.

### Neutral

Midnight grounds the field and select controls. Glass-edge and glass-center provide pale translucent highlights. The opaque control surface, control ink, muted labels, borders, and dividers keep the panel readable over every palette. Hover and active fills distinguish button interaction; yellow marks focus, selected tabs, ranges, and brief functional feedback.

## Typography

System sans-serif labels serve controls only. The base label role is used by buttons and fields; the secondary role serves preset labels, numeric outputs, file inputs, and feedback. Numeric outputs use tabular numerals. The panel toggle uses the semibold panel-label role. The artwork carries the visual hierarchy without a displayed title or prose overlay.

## Layout

The canvas fills the viewport without page scrolling. The panel starts at the upper right with safe-area-aware edge spacing, a width of 318px, and a maximum width of the viewport minus 24px. Its maximum height is the dynamic viewport minus 36px; the fields scroll independently while the bar, preset selector, tabs, and footer remain available.

At widths up to 600px, the panel starts collapsed and uses compact-edge spacing. The collapsed bar is 242px wide. At heights up to 500px, vertical padding contracts and the maximum height becomes the viewport minus 24px. The grip supports pointer dragging and keyboard movement; moved panels remain clamped at least 12px inside the viewport and are reclamped after resize or collapse.

## Elevation & Depth

Canvas glow, pale outlines, translucent materials, and cached interference contours suggest illuminated glass. The interface uses flat opaque fills and borders without box shadows or backdrop blur. Its opacity is structural: artwork detail must not compete with control labels.

## Shapes

Triangles, squares, hexagons, faceted prisms, rounded beads, liquid contours, filaments, mineral sections, and foil fragments supply distinct source silhouettes. Full field and mandala layouts reflect alternating radial wedges; three-mirror tessellation uses triangles, four-mirror chamber uses reflected tiles, and the tapered tunnel nests twisted radial layers. Mirror points are adjustable from 3 to 24, producing twice as many radial wedges; twelve wedges describe the original setting only.

The panel, buttons, and selects use their respective rounded tokens. Tabs remain square and use a thin selected underline. Range controls use a 3px track and circular 15px thumb.

## Components

### Floating control panel

A grip, Controls toggle, Pause/Play, and Save image stay in the bar. Collapse hides the body while retaining these actions. Four tabs—Optics, Objects, Light, and Motion—organize 36 settings. A preset selector offers 12 starting configurations; edited settings display Custom. The footer contains Rearrange, Reset, and Copy settings link. Functional status feedback appears only when needed.

### Buttons and navigation

Buttons and selects have a minimum height of 44px; icon buttons are 44px square with inline SVGs. Buttons use transparent rest fills, then hover and active tokens. Keyboard focus uses a 2px yellow outline offset by 2px. Tabs use roving focus, Left/Right arrows, Home, and End. Native button activation remains intact.

### Fields

Each range has a visible label and secondary numeric output; selects span the field width beneath their label. A native color input adjusts the background. The Objects tab includes a local image file input for the teleidoscope cell. Inapplicable settings are disabled and rendered at half opacity. Shared-link clipboard failure reveals a selectable text field inside the panel.

### Kaleidoscope field

The original configuration retains 180 geometric fragments, 100 iridescent polygonal prisms, and 4,200 glitter flecks. Density and glitter settings scale these counts. Material sprites and prism films are cached; source rendering is bounded to 1400px and device pixel density to 2×. Local images are bounded to 2048px on their longest side. Export saves the canvas alone, excluding the interface.

Animation suspends while the document is hidden. Reduced-motion preference starts the artwork paused and synchronizes pause state when the preference changes; explicit Play remains available. Settings are not stored between visits; shared links restore validated settings, seed, and animation phase. Local image pixels and panel position are not included.

## Do's and Don'ts

- **Do** preserve bright, playful geometry and autonomous evolution.
- **Do** keep functional controls inside the requested panel and subordinate to the artwork.
- **Do** preserve reduced-motion support, native controls, and keyboard access.
- **Don't** display a title, captions, or explanatory prose over the artwork.
- **Don't** impose this artwork's palette or composition on the gallery or other pieces.
- **Don't** introduce external fonts, libraries, or network dependencies.
