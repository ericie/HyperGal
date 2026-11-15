---
name: Cloudcutter
description: Visual rules for the Cloudcutter canvas artwork.
colors:
  sky: "#48a7f5"
  cloud-cap: "#f7fbff"
  cloud-body: "#deefff"
  cloud-underside: "#bfe2fa"
  pilot-ink: "rgb(27,65,100)"
  ship-ink: "#0047ff"
  ship-light: "#2a69ff"
  ship-shade: "#0032c4"
  ship-cap: "#4382ff"
  rocket: "#ffe23b"
components:
  artwork:
    backgroundColor: "{colors.sky}"
    width: "100%"
    height: "100%"
---

# Design System: Cloudcutter

## Overview

**Creative North Star: "Cloudcutter"**

This local direction applies only to the artwork in this folder. A flat blue sky carries rounded cartoon cumulus, with distinct white caps, pale bodies, and visible blue underside bands. The small ship is a solid blue can with an always-visible yellow rocket flame.

**Key Characteristics:**
- Flat color fields with no cloud outlines.
- Wide cumulus silhouettes with connected base scallops and filled white curls.
- Carved sky channels remain clear through every painted layer.

## Colors

### Primary
- **Sky:** The uninterrupted canvas background and the color exposed by carved channels.
- **Ship ink:** The solid cobalt cylinder barrel.
- **Ship light:** The flat upper highlight and inset on the front cap.
- **Ship shade:** The rear elliptical end and lower barrel band.
- **Ship cap:** The brighter front elliptical end cap.
- **Rocket:** The filled yellow flame, fully opaque and always visible.
- **Pilot ink:** Dark blue rounds only.

### Neutral
- **Cloud cap:** Bright upper masses and filled curl lips; also the white ink used for vapor and fragments.
- **Cloud body:** The larger pale blue interior masses and curl insets.
- **Cloud underside:** A visible scalloped lower band, including newly exposed lower cut edges.

## Typography

No typography appears in the artwork. Keep the canvas accessible through its `role="img"` description; names and gallery metadata stay outside the visible sketch.

## Layout

The canvas fills the viewport without margins or scrolling. Weather continues beyond all edges; the camera follows slightly ahead of the ship. Cloud population and size scale with the viewport, retaining the same visual language on desktop and portrait mobile. There are no panels or visible controls.

## Elevation & Depth

Depth comes from flat tonal overlap. Do not add cloud shadows, outlines, gradients, haze, or background streaks. Preserve a clearly visible underside band rather than allowing the body fill to cover it.

## Shapes

Wide, tapered shoulders and central crowns sit above a shared scalloped baseline. Small puffs overlap into connected bodies. White curl lips and blue insets are filled shapes, never stroked rings.

**The Live Contour Rule.** Clip every painted cloud layer to the current carved silhouette. Decorative puffs cannot bridge a tunnel or join severed halves.

## Components

### Cloud

Fill the live contour with the underside tone, then lift the main painted contour by `size * .065` to expose the lower band. Clip the cap, offset puff unions, and filled curls inside these contours. Carving, separation, and slow healing use the live geometry while a cloud remains visible. Once the entire uncut body is beyond the viewport (including a 2px edge margin), clear its cuts and eased contours and rebuild it intact before it returns.

### Ship and vapor

Render the ship as a solid can (24×14px): a lengthwise rectangular cobalt barrel, dark rear ellipse and underside, flat upper highlight, and bright front elliptical cap with a lighter inset. Use filled shapes with no stroked outline or label. Translate and rotate the whole can with the ship heading. Its yellow rocket is a filled flickering triangle, always visible. Rounds retain dark blue pilot ink. Vapor and fragments use white linework; vapor remains hidden inside the cloud envelope.

Apply engine thrust exactly once per update in both autoplay and player control. There is no thrusting boolean or Up throttle; Up/W still takes over while acceleration stays automatic. Preserve turning and firing takeover behavior.

Shots use a 0.22-second cooldown, 45px blast radius, strength 7.5, and 900px range in both control modes.

### Artwork surface

Keep the rendering portable in the single HTML Canvas 2D implementation. Do not add a UI component library for this surface.

## Do's and Don'ts

### Do:
- **Do** keep the underside visible on intact clouds and exposed lower cut edges.
- **Do** preserve clear sky through the live carved channels.
- **Do** retain the existing ship and cloud-boring behavior.
- **Do** keep accessibility descriptions available without visible text.

### Don't:
- **Don't** add visible titles, captions, labels, counters, or instructions.
- **Don't** outline clouds or add gradients, haze, or sky streaks.
- **Don't** let decorative puffs fill a cut or bridge severed halves.
- **Don't** apply this artwork palette to the gallery or issue interfaces.
