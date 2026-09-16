---
name: City of Signs
description: A wordless geometric Tokyo assembled from occupied floors, exposed stairs and working rooftops.
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
  catalog-description:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.875rem"
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

## Direction

The user chose vertical Tokyo: stacked businesses, external stairs and rooftop
structures. This supersedes the previous arcaded fantasy-city vocabulary. Keep
pure black/white and the wordless procedural format. Personality should come
from architecture rather than added clutter or indiscriminate simplification.

## Blocks

The active vocabulary has 23 blocks: twenty Tokyo drawings plus the retained
fan hall, swelling facade and striped sky vessel. The user’s 21 reference photos
now guide detail: nested sliding-window frames, varied curtain infill, balcony
slabs and fine rails, circular stairwell openings, louver banks, AC fan grilles,
tile joints and conduits routed to meter boxes and vents. Five street-level
blocks, nine occupied-floor types and six rooftop types create distinct facade
systems. Older shop canopies, noren and stepped marquees contrast with glazed
structural ribs, utility walls, tile eaves and a construction crane. Keep quiet
wall areas between concentrated detail. No pseudo-Japanese lettering or visible
text is drawn. See README.md for the inventory and photographic reference notes.

The fan and swelling facade have rectangular window infill; the vessel is
limited to one per composition. Older arches, domes, ornamental gates and floating
connectors remain available only in the full archive, not the city. All 56 blocks
remain procedural and renderable; the 33 inactive drawings are labeled studies.

## Composition

5–16 unequal bays use `clamp(round(width / height * 7), 5, 16)`. Width weights are
0.36, 0.44, 0.55 for narrow bays and 0.85, 1.2, 1.7 for broad bays. Margin is 0.9%
of the shorter side. Ground floors occupy 10–14.5% of height. Each building has
three variable-height chambers, selected as architectural sequences. Narrow
towers emphasize service walls; broad towers mix tenant floors, exposed stairs,
balconies, setbacks, round bays, louvered fronts and ribbed glazing. The fan tower starts at 19% of height; others start at
17–41%. Surfaces group black and white across adjacent buildings. Profiles are
straight or stepped except for the curved swelling-wall tower.

Shared service courts join neighboring buildings. Rectangular shafts, thick
side piers, rear sash windows, doors, upper/lower landings, a stair and roof walk
replace the previous vaulted galleries. Their regions are reserved during facade
drawing, and they clear the fan hall and ground-floor entrances.

## Drawing and interaction

Use binary cutouts, offsets and occlusion for depth. No gray shading, gradients,
textures, lighting effects or raster substitution. Rail caps and plinths are
stronger than their uprights; upright count reduces with available width. Window
frames, infill and tracks use separate weights. Fan grilles and louvers reduce
their line counts at small sizes. AC case proportions and feet remain bounded;
tile-eave height is capped by its width. Only one crane appears per composition.

The normal canvas has no visible UI text and supplies an accessible description.
Click, tap, Enter or Space regenerates. Normal loads start with a random seed;
`?seed=1907` fixes the opening composition at a given viewport. Resize preserves
the seed, DPR caps at two, and keyboard focus uses an inset 3px black outline.

`?debug=true` shows active blocks, Tokyo first, and one composed city.
`?debug=true&all=true` shows all 56 blocks. Catalog links connect the city, active
set and full archive. The links use the documented 0.875rem description size;
all other catalog styling retains the token definitions above.

## Evidence and limitations

`.impeccable/review/city-photo-details/` contains before/current source and browser captures.
The square seed-1907 renderer supplies `thumbnail.jpg`. Tests exercise 480 layouts,
active vocabulary restrictions, all catalog drawings and regeneration/resize.
The vertical bay organization and repeated service-court form remain apparent.
This is a design attempt awaiting user response, not a Ship disposition or a
claim of acceptance. Earlier visual passes are historical evidence.
