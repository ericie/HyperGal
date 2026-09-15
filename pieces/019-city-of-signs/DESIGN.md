---
name: City of Signs
description: A wordless geometric dream assembled from interchangeable architectural blocks.
colors:
  ink: "#000"
  paper: "#fff"
  catalog-background: "#dededb"
  catalog-ink: "#111"
  catalog-description: "#555"
  catalog-muted: "#666"
  catalog-rule: "#aaa"
typography:
  catalog-title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(1.25rem, 2.3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  catalog-name:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.9375rem"
    lineHeight: 1.2
  catalog-group:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.75rem"
    lineHeight: 1.2
spacing:
  catalog-inset: "clamp(18px, 3vw, 42px)"
  caption-gap: "10px"
components:
  city-canvas:
    backgroundColor: "{colors.paper}"
    width: "100%"
    height: "100%"
  catalog-caption:
    backgroundColor: "{colors.catalog-background}"
    textColor: "{colors.catalog-ink}"
    padding: "12px 14px"
---

# Design System: City of Signs

## Overview

**Creative North Star: “A wordless geometric dream.”**

This document applies only to `pieces/019-city-of-signs/`. Other HyperGal artworks retain their own visual languages. The approved geometric image established this piece's direction: impossible architecture, unequal stacked chambers, miniature openings, and extravagant roof balances.

The shipped artwork is drawn procedurally by `city.js`. The user-approved AI raster was a visual reference, never an image embedded into the renderer or substituted for code. `thumbnail.jpg` is a square screenshot of the actual renderer at seed `1907`.

**Key characteristics:** pure binary color, variable unframed blocks, grounded entrances, and a skyline that recomposes for its viewport. Independent finish review returned **Ship** for square, desktop, mobile, and catalog views, with no blocking findings.

## Colors

### Primary

**Ink** and **Paper** are the only authored drawing colors in the normal artwork. Bays alternate polarity; individual chambers may invert it. Browser antialiasing softens geometric edges without introducing an authored gray palette.

### Neutral

The catalog-only background, ink, description, muted text, and rule tokens support inspection labels and dividers. These neutral grays belong exclusively to `?debug=true`.

## Typography

The normal artwork has no visible type. Its accessible canvas description provides the subject and regeneration instructions. Catalog headings and specimen labels use the system sans-serif roles above; specimen numbers use tabular numerals. Catalog metadata describes blocks rather than decorating the city.

## Layout

The canvas fills the viewport. The composer chooses `clamp(round(width / height × 11), 5, 22)` bays, mixing narrow stacks with broad chambers. The outer margin is 0.9% of the shorter viewport dimension. Bases share a ground line and occupy 11–14.5% of the viewport height; their top edges vary.

Tall fan, folding-stair, and swelling-wall chambers anchor every composition. Ordinary towers have two to four variable-height chambers; narrow towers have two or three. Crowns reach into small sky pockets and may overhang their bays. Resize preserves the seed and recomposes geometry for the new aspect ratio. Rendering resolution is capped at a device pixel ratio of two.

The debug catalog uses an automatic grid with a preferred minimum column width of 230px, shrinking to the available width when necessary. Preview height ranges from 250px to 340px. Below 520px, its header stacks vertically.

## Elevation & Depth

There are no shadows, gradients, textures, or lighting effects. Depth comes from cutouts, black/white inversion, overlap, tiny repeated apertures, suspended connections, and changes of scale.

## Shapes

Chambers have no ornamental frames. Arches, folds, pleats, scallops, disks, fans, and tapering silhouettes create variety without a universal rounded-corner treatment. Crisp straight edges use miter joins and butt line caps. A fine ground-level seam separates inverted bases without enclosing every room.

## Components

### Architectural block library

The 26 blocks have stable IDs, local drawing functions, roles, and narrow-bay eligibility. Each receives dimensions, polarity, and a variant. Six **bases** occur only at ground level; twelve **chambers** fill the towers; six **crowns** define the skyline; two **connectors** bridge or hang between neighbors. See `README.md` for the inventory.

Adjacent bases and crowns avoid repetition. Striped sky vessels are limited to two and kept away from the canvas edges; off-center moons also avoid edge bays. Composition rules preserve architectural rhythm while allowing a new arrangement with each regeneration.

### Interactive canvas

Click, tap, Enter, or Space generates another seed and redraws immediately. Keyboard focus uses a black 3px outline inset by 8px. There is no continuous animation or transition. `?seed=1907` reproduces the opening composition at a given viewport.

### Block catalog

`?debug=true` exposes 26 labeled specimens plus a complete composition. Specimen figures use thin dividers, a two-column caption, and readable role/ID metadata. Catalog canvases are static inspection surfaces.

## Do's and Don'ts

- **Do** keep each block procedural, dimension-aware, and useful in multiple compositions.
- **Do** preserve ground-only bases, unequal bay widths, and the three large chamber features.
- **Do** regenerate thumbnails from the renderer and record their seed and framing.
- **Don't** add visible words or pictorial illustrations to the normal artwork.
- **Don't** introduce a gray drawing palette, gradients, room frames, or uniform rounded geometry.
- **Don't** turn the reference raster into the runtime artwork or apply this piece's identity to the entire gallery.
