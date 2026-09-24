---
name: City of Signs
description: An architectural ink city of white walls, deep recesses and finely drawn working details.
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

The user rejected the previous graphic block style on 2026-09-17 and supplied
two architectural ink references. The first establishes large sunlit white walls,
solid black recesses and building returns, shallow projecting balconies, fine
metal railings and small utility details. The second supplies the denser rhythm
of repeated inhabited floors. These references supersede the earlier treatment.

All 22 active studies have been redrawn. White is the wall surface; black locates
a recess, underside, party-wall gap or unlit opening. Buildings no longer invert
their entire facade palette. Outlines and hardware are fine; shadows carry the
visual weight. Projection uses a shallow consistent oblique angle, drawn as flat
black and white planes. No gradients, gray fills, raster assets or textures.
The artwork remains a procedural 2D Canvas drawing.

## Drawing grammar

Each study draws one bay in a 100-unit-wide local coordinate system with
isotropic scaling. A bay is the same width for every building in a composition,
so the unit is absolute: a window drawn at 25 units is the same size everywhere
in the city, not a fraction of whatever building it happens to sit on. The bay is
sized from the canvas and the building count follows, so the drawing is coarse
and legible rather than a fine screen of many small buildings. Buildings
repeat the bay, one to four times. This preserves the proportions of fans,
narrow railings and window hardware.
Structural lines are about 0.5–0.8 units; secondary lines about 0.2–0.45. Windows
have thin metal frames, offset reveals, unequal lit panes and shallow sills.
Balconies have deep black openings, white slab fronts, black undersides and fine
returning guard rails. Roof studies have maximum height-to-width ratios so the
catalog and narrow buildings cannot stretch roof houses or gables into towers.

Blocks lay out in absolute units and repeat: storeys, scaffold lifts, terrace
units and service runs divide the available height rather than taking fractions
of it, so nothing stretches as a building grows. Scaffold decks land on both
block edges, so a wrapped facade meets the frame of the block above and below
it. Tank supports and equipment
feet meet their decks. AC routes begin at the outlet returned by the fitted case.
Meter routes meet each cabinet's actual bottom edge; no later background masks
can erase the connections. Material seams remain sparse and subordinate.

## Composition and catalog

There are 38 active studies, numbered 01–19 and 21–39. Number 20 remains retired;
all other numbers retain their subject and review anchor. The 36 old archive
studies remain accessible only through the full archive. The rejected crane,
large fan, swelling facade and striped vessel do not enter generated cities.

The city retains its seeded assembly of 5–16 unequal building bays and three
facade modules per building. Continuous white walls and black side returns join
adjacent modules. Current building profiles are straight; setback rooms and
terraces provide the changing volumes within them. Crown decks align with their
buildings, with no lateral random shift. Chambers use the full bay width.

There is no secondary room/court overlay and no masking across whole facade
blocks. The catalog retains the tokens above, review numbers and direct links.

## Interaction and verification

Click, tap, Enter or Space regenerates. A query seed fixes the arrangement for a
given viewport; resizing retains that seed. DPR is capped at two. The accessible
canvas description and keyboard focus remain. No visible controls cover the art.

Evidence is in `.impeccable/review/city-ink-redraw/`. Earlier review folders
record superseded versions, not approval of this direction. The new drawings
are a reviewable implementation of the supplied reference direction.
