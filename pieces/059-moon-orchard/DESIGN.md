---
name: Moon Orchard
description: A monochrome lunar arcade patrol whose gunfire grows an orchard overhead.
colors:
  white: "#fff"
  black: "#000"
typography:
  title:
    fontSize: "10px"
  label:
    fontSize: "5px"
spacing:
  pixel: "1px"
  double-pixel: "2px"
  hud-inset: "14px"
components:
  artwork:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    width: "100%"
    height: "100%"
  vertical-shot:
    backgroundColor: "{colors.white}"
    width: "2px"
    height: "5px"
  horizontal-shot:
    backgroundColor: "{colors.white}"
    width: "5px"
    height: "2px"
---

# Design System: Moon Orchard

## Overview

**Creative North Star: "Monochrome Lunar Arcade"**

A self-playing black-and-white patrol turns gunfire into slow-growing trees on an enormous moon. Sparse pixel sprites and thin outlined landscapes share open black space. This system belongs only to this artwork, not to the surrounding HyperGal gallery.

The user-pinned arcade direction is implemented directly in code; no approved visual comp exists. The built artifact and its desktop and mobile finish captures establish the reference.

**Key Characteristics:**
- Two-color marks and open black space.
- A moon clipped above the viewport, with trees along its visible rim.
- Compact sprites, straight three-shot volleys, and short automatic hops.
- Original bitmap lettering and an unobtrusive HUD.

## Colors

### Primary

- **Arcade White:** Sprites, bullets, trees, lettering, stars, and contour strokes.

### Neutral

- **Space Black:** Full-viewport field, hollow sprite details, terrain cutouts, and the small backing behind the title.

**The Two-Color Rule.** Author the scene with white and black only; do not introduce colored accents or soft glow. Canvas curve rasterization may produce intermediate edge pixels, but these are not palette tokens.

## Typography

The title and counters use original 3-by-5 bitmap glyphs drawn as rectangles, not a font family. Title lettering uses a two-pixel cell; other labels use a one-pixel cell. Character advance is four cells, including the gap. The frontmatter sizes describe glyph height in internal canvas pixels, not CSS text.

Keep the HUD short, uppercase, and on the sprite grid. The title sits above the tree count; patrol distance and the current pause/autopilot state occupy opposite bottom corners.

## Layout

One canvas fills the viewport with no scrolling or surrounding controls. Its internal width is the lesser of the viewport width and 800 pixels; height preserves the viewport aspect ratio. CSS stretches that bitmap to the viewport using pixelated image rendering. All scene measurements below are internal canvas pixels.

The ground sits at 84% of canvas height and the buggy at 23% of canvas width. The moon radius is the larger of 1.55 times the width and 1.1 times the height. Its center is horizontally centered and vertically offset so its lowest rim reaches 22% of the height. Almost all of its mass remains above the viewport. Keep the sky between rim and patrol spacious.

HUD labels begin at the inset token; bottom labels sit 16 pixels above the lower edge. There are no responsive breakpoint swaps: the same scene geometry adapts continuously, preserving small sprites on phones and exposing more terrain on wider displays.

## Elevation & Depth

No shadows, blur, gradients, or raised interface surfaces. Depth comes from sparse stars, the huge lunar rim, a slower scrolling mountain outline, moving ground, and foreground sprites. White contours and black occlusion keep overlapping forms distinct.

## Shapes

Use solid rectangular sprite parts, one-pixel contour lines, and sparse particle squares. The buggy wheels and lunar crater arcs are intentional curved forms. Rocks are angular outlined silhouettes in small and large sizes; pits visibly interrupt the ground line and descend into it. The moon is a broad shallow arc, never a complete small disc.

## Components

- **Artwork control:** The whole canvas is the pause target. Click, Space, or focused Enter toggles the scene; the visible status and pressed state follow it. Keyboard focus is a white one-pixel inset outline. Reduced-motion preference starts the scene paused. S exports the current canvas as PNG.
- **Buggy and weapons:** A compact wheeled sprite with separate upward and forward guns. Both emit straight axis-aligned bullets in three-shot volleys. Hops are short and automatic around nearby hazards.
- **Hazards:** Small and large rocks differ in size and durability. Saucers carry falling bombs; ground impacts cut outlined holes into the scrolling terrain. Bullet hits create brief square sparks.
- **Moon and orchard:** A thin curved rim carries outward-growing trees. Upward shots plant or nourish nearby roots; trees mature gradually as the moon rotates. Orchard state persists between visits.
- **HUD:** Bitmap title and tree count above; patrol distance and pause/autopilot status below. No added panel or navigation chrome.

## Do's and Don'ts

### Do:
- **Do** keep the enormous moon clipped above the screen and preserve open sky below it.
- **Do** retain straight burst shots, short hops, two rock sizes, and bomb impacts that leave holes.
- **Do** keep interaction, bitmap drawing, and persistent orchard state self-contained and dependency-free.

### Don't:
- **Don't** add color, soft glow, or surrounding app chrome to this artwork.
- **Don't** substitute a small complete moon for the visible rim.
- **Don't** replace the original bitmap HUD with a system display font.
