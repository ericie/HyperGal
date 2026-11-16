---
version: 1
slug: "pieces-059-moon-orchard-index-html"
primary_target: "pieces/059-moon-orchard/index.html"
related_targets: ["pieces/059-moon-orchard/orchard.js"]
---

# Lunar Landgrab surface

Mode: Experience. A portable self-playing canvas artwork, with pause and image export available by keyboard and accessible name.

## Direction contract

THESIS: Rebuild the scene in the user's Moon Patrol screenshot vocabulary: saturated arcade pixels, one small moving buggy, open black sky, and layered landscape. No visible type or top status strip.

OWN-WORLD: Cyan mountains with blue facets, green foothills, cyan skylines and green windowed cities embedded in the two parallax layers, peach ground, a small rover with hot magenta, scarlet, electric violet or orange body paint shared by its fixed cannons, with darker matching tires per generation, simple saucer silhouettes in varied sizes and colors, with different attacks. Each depth layer has small, gently hovering UFOs and static cities in its own palette: cyan/blue in the distance and green/shade in the middle. These ships occasionally drop tiny vertical bombs and layer-colored impact flickers, with no foreground damage. Grown buildings retain their source parts’ paint. Original rectilinear sprites and two-pixel stepped silhouettes; no glow or smoothing.

STORY: Watch the buggy progress steadily with gentle forward-and-back screen drift, fire paired shots straight up and straight forward from fixed cannons, hop scrolling craters with committed takeoff and throttle through landing, explode into recognizable parts while scrolling stops, then watch the settled parts grow into varied alien towers at 90% of the previous large-city size. One compact garage opens its shutter and releases the next rover; the patrol and scrolling resume only after its visible exit. While the camera is stopped, the background UFOs continue hovering. Background cities remain static landscape artwork; the background growth function is removed. Growing cities blast nearby turrets, rocks and holes, filling the affected holes; the buggy has no repair mechanic or repair saucer. Keep click/Space pause, focused Enter and S export accessible without drawing controls.

FIRST VIEWPORT: Black sky above jagged cyan peaks, green hills in front, peach road occupying the bottom 16%. One compact readable rover patrols the road; three scouts open the first wave, followed by staggered bomber, dart and carrier formations with quiet gaps and a maximum of six ships. Primitive deep-rust ground turrets use one #a04018 paint without outlines on their squat fixed pedestals and simple pipe barrels to track and fire at the rover among the rocks and craters. The buggy has a simple upward barrel and a forward barrel, both in its single paint; both flash together when fired. One atmospheric UFO starts in each depth plane, among static landscape cities. Distant UFOs are 6–8 × 3 internal pixels at 0.27 scale, rendered between mountains and hills; middle UFOs are 9–12 × 4 at 0.43 scale, rendered between hills and foreground. Both use plain two-tone discs; gentle hover amplitudes use their 0.55/0.82 layer scales. Three parallax speeds establish distance immediately, while quiet hovering ships and paired white foreground shots punctuate the sky.

FORM: User-pinned reference, supplied Moon Patrol screenshots; no concept seed. Procedural canvas rendering is the artwork and uses code directly.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Fixed armament contract

The buggy cannot aim or swivel its cannons. It moves forward and back and shoots only straight up and straight forward. Both cannons share one trigger and fire together. At most three paired bursts are airborne; a pair keeps its slot until both rounds are gone. Movement, jumping and synchronized firing remain; tires use a darker body shade and depth UFOs are atmospheric scenery with occasional harmless vertical drops.

WRECK BUILDINGS: Newly grown towers use 90% of the previous large-city width and height, mixing pods, terraces, twin spires, domes and offset stacks without white rooftop crossbars. Background cities are also 10% smaller and vary by world tile. One fragment instead grows into a compact 44 × 34-pixel garage, narrower than the former 60-pixel facade. The shutter lifts over 0.5 seconds, then the replacement buggy rolls out over 1.8 seconds before scrolling resumes. Background cities never grow.

CITY GROUND: While foreground buildings grow, hazards in or within 18 pixels of the expanding foundation erupt once. Turrets and rocks disappear; holes fill into solid road. Hazards farther away remain. New bombs can crater restored ground again.

BUGGY PALETTE: Buggy generations use hot magenta #ff00b8, scarlet #ff2548, electric violet #d43bff and orange #ff5a00. Keep the warm paints bright and saturated, without a body or barrel outline. Tires retain a darker shade of the chosen body hue.

PACING: Cruise at 19–28% of screen width, with avoidance bounded to the left 42%. There is no scripted opening ditch or forced death. The first buggy reacts to nearby hazards and jumps simple ditches, but lacks landing and bomb-crater foresight. Later generations use full predictive avoidance after the first death. All attack waves enter from ahead; bombs have zero horizontal speed and drop only ahead of the rover, 2.8–4.4 seconds apart. Wave gaps vary from 6–11 seconds. Turrets arrive as singles or pairs with 16–32-second empty stretches; slower 105px/s rounds and 3.2–4.8-second shot intervals leave room to react. Ground obstacles are 4.8–8.2 seconds apart. Garage exits add no forward shove or forced hop. Background UFOs drop small harmless bombs at long intervals in their own plane colors.
