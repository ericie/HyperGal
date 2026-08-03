# Marbles

Four marble tiles cut from one procedural slab and mirrored across the
horizontal and vertical joints. The surface is rendered as pixels in WebGL:
warped noise makes the cloudy stone and veins, while mineral grain, relief
lighting, edge shading, and specular polish give it photographic depth.
The turbulence follows a closed circular path and returns to the same frame
every five seconds without a cut or reversal.

Each load starts with one of Life Checkers' eight two-color palettes:
rose/orange, red/tangerine, blush/moss, black/cream, olive/ivory, emerald/ice,
teal/mustard, or cobalt/cyan. A URL seed always returns to the same starting
palette. The palette selector switches between all eight pairs, and changing
either color directly marks the pair as custom.

The same seed also chooses starting values for vein scale, flow, turbulence,
vein width, mineral grain, polish, and relief. Their ranges are art-directed
to keep every first frame active and legible. Cutting a new slab randomizes
the palette and all seven settings together, and its new URL reproduces that
complete configuration.

Use the panel to change the stone and vein colors, vein scale and flow,
turbulence, width, mineral grain, polish, and relief. Drag the panel by its
header, collapse it with the minus button, cut a new slab with the arrow
button, or press `R`. Add `?seed=anything` to the URL to revisit a slab.
Add `&panel=0` to hide the controls for a clean capture.

The turbulence slider sets the loop's maximum intensity. The visible value
breathes between 42% of that setting and the full setting during each cycle.
The animation stops on a stable frame when `prefers-reduced-motion` is active.

## Archival rule

This folder is fully self-contained. It uses browser-native HTML, CSS,
JavaScript, and WebGL with no external assets or dependencies.
