---
version: 1
slug: "pieces-059-moon-orchard-index-html"
primary_target: "pieces/059-moon-orchard/index.html"
related_targets: ["pieces/059-moon-orchard/orchard.js"]
---

# Lunar Landgrab surface

Mode: Experience. A self-playing illustration with accessible pause and image export, without visible interface text.

## Approved direction

The user approved the illustrated still with a lavender sky, tall jagged mountains, whimsical bulbous alien towers, simple disc-and-dome saucers, and a small low orange three-wheel rover. The rover has two broad body-painted pipes with flared roots integrated into the chassis, one opening vertically upward and one pointing forward. The original spatial arrangement and existing game mechanics remain. Implement the approved ink-and-flat-color drawing language in live procedural canvas, rather than inserting a static screenshot.

The latest instruction overrides the full-color still's background palette: distant mountains AND distant buildings must share a single muted lavender family; middle hills AND middle buildings must share a separate turquoise family. Quiet UFOs and their occasional decorative bombs stay in their respective layer palette. Foreground cities remain color-coded to the buggy parts that grew them, including darker wheel-derived buildings.

## First viewport and materials

Spacious flat lavender sky (#dcc3f5), muted lavender distant mountains/cities (#b7a8c9, contours #89769e), turquoise middle hills/cities (#7fc9ba, contours #428e83), cream road (#ffedca), warm dark ink (#25232b). Keep distances legible by matching the scenery line colors to each plane. Foreground outlines use dark ink. Foreground rover generations cycle orange #ff792e, pink #ed4c95, violet #b271e5 and coral #ed5949. Tires use 55% sRGB body channels; buildings inherit source colors.

Use smooth outlined silhouettes, rounded architectural pods, uneven bottle stems, portholes, restrained pipe loops, balconies, checkerboard panels and bent antennae. No white rooftop crossbars. Smooth round tire rotation and recognizable inked flying wreckage replace pixel sprites. No gradients, glow, baked lighting or typography. Rendering uses display resolution with DPR capped at 2, while the established 480px-wide maximum logical physics coordinate space remains.

## Preserved interaction and motion

The camera moves 66 logical pixels/s, distant scenery 0.18×, middle scenery 0.46×. The buggy cruises near the rear, generally 19–28% of screen width, and avoidance remains bounded to the left 42%. A novice jumps simple nearby ditches but does not rehearse landings; after its first death, replacements gain predictive avoidance. There is no forced opening crash.

Both fixed cannons fire together, straight up and forward, with at most three paired bursts airborne. Their illustrated muzzle centers remain the actual projectile origins. UFO waves enter from ahead and drop vertical bombs, with irregular gaps. Turrets arrive in singles or pairs separated by long gaps. Foreground collision, durability, city hazard blasts/fill, part settlement, and a compact 44×34 garage/shutter exit remain functional.

Death stops the camera; recognizable parts settle, then grow into varied towers at 90% of the prior large-city dimensions. The garage opens and releases a replacement before scrolling resumes. Atmospheric depth UFOs hover and occasionally drop small harmless bombs while the camera is stopped. Background cities remain static; no growing background cities.

Click/Space pauses, focused Enter toggles, S exports a high-resolution PNG. Reduced motion starts paused. Keep all names, instructions, counters and status accessible or machine-readable only; no visible HUD or labels. Preserve the manually Selected status and current work name.

## Finish

Inspect desktop, phone and landscape captures, natural play and controlled city/garage emergence. Verify palette isolation, smooth rendering, fixed muzzle geometry, pause/reduced motion/export and inherited foreground colors. Finish review and token-bearing documentation accompany the implementation.

## Alien architectural refinement

Rover guns use the exact body paint, with flared mounts that flow into the chassis. Openings remain fixed at the physical up/forward muzzle coordinates. Enemy turret barrels may remain cream.

Close buildings retain flattened asymmetric alien pods and more substantial uneven trunks. Replace uniform porthole rows and face-like underlines with varied kidney, tapered and mullioned apertures, unequal heights and offset groupings. Use thin inherited-paint rims and sparse seams. Avoid lollipop antenna tips, mouth curves and shiny edge streaks; keep restrained architectural balconies and framed bays. Background architecture stays simpler and within its original tone family.

Pits are open cuts in the ground. Fill the void, but stroke only its descending side/bottom contour; never close an ink stroke across the mouth. Visible terrain and collision/fill profiles remain coupled.

## Scenery occlusion and foundations

Draw middle-layer saucers, bombs and impact marks before the middle hills, so descending bombs disappear behind the hill silhouettes. Distant activity keeps its existing placement. Both monochrome scenery-building families have open stem strokes and unoutlined foundation fills; no horizontal baseline beneath background buildings. Foreground city foundations retain their ink contours.

## Three-sphere attack variant

Later waves mix in a triad UFO made from three pale-turquoise spheres with small orange cores and dark ink links. It has four hit points, four bombs, a 1.1-second drop interval, and 50-unit/s initial downward bomb speed (ordinary bombs start at 32). Triads bypass the slower ordinary shared drop timer but retain the global three-bomb cap, the forward attack lane, vertical drops and rebirth ceasefire. Existing classic disc saucers remain.

## Ground rhythm

Spawn five cyclic ground phrases with 3–5 real hazards each: mixed shooting/hopping, paired low chips, double pits, a heavy rock phrase and an offbeat phrase. Fixed within-phrase offsets establish timing; 198–264 world units (3–4 driving seconds) after the last beat provide a variable rest. Chips are low 6–8-unit one-hit rocks with a distinct broken profile; ordinary rocks are 11–14 units, heavy rocks 24 units/three hits, authored pits 24–32 units. All existing bomb-made pits remain.

Low chips below the fixed forward barrel do not trigger wasted shooting. The paired trigger remains shared, with at most three airborne bursts. Experienced drivers may rehearse easing out of a jump boost when the remaining flight and landing are clear; ordinary acceleration limits and the rear cruise/42% position limit remain. Camera freeze, city growth, and garage return retain their behavior.

## Lower jump arc

Launch at 157.5 logical units/s under gravity 294 units/s²: peak about 42 units, 30% below the prior 60, while airtime remains about 1.07 seconds. Keep the established obstacle spacing and cadence. Predictive collision padding is capped at two units only for rocks taller than 18 units, allowing close clearance with the lower arc; actual collision geometry and ordinary pit/projectile/chip planning margins remain unchanged.

## Distant mountain linework

Use authored angular peaks and shoulders with no sinusoidal edge jitter. Join the 340-unit repeats into one continuous filled silhouette and open skyline contour, with matching tile endpoints and no overlapping tile-edge strokes. Sparse interior folds connect summits to real shoulders; remove detached slash marks. Keep the existing lavender body/ink, peak height, 0.18× parallax and distant city palette.
