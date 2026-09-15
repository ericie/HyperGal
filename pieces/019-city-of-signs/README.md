# City of Signs

A wordless geometric dream assembled from 26 reusable architectural blocks.
Unequal towers carry unfolding fans, folding stairs, swelling walls, suspended
balconies, scalloped stacks, and improbable rooftop balances. Tokyo's stacked
architecture is a starting point for fantasy, rather than a literal streetscape.

The piece uses only pure black and white. Click, tap, or press Enter or Space
to construct another arrangement. Built with Canvas 2D, without runtime
dependencies or generated image assets. Open `index.html` directly.

## Block system

`city.js` holds both the block library and the seeded composer. Each block has
a stable ID, a role, a local drawing function, and a narrow-bay eligibility flag.
The drawing receives its box dimensions, black/white polarity, and a variant.

- **6 bases:** scalloped threshold, split curtain pavilion, sawtooth gateway,
  stepped recess, comb shutter, and unequal doorways. These occur only at ground
  level, share a baseline, and have slightly different header heights.
- **12 chambers:** arcades, cathedral slots, fan, folding stair, swelling wall,
  balconies, floating scallops, split disks, sideways scallops, pleats, dots into
  slots, and a flared chamber. Fans, stairs, and swelling walls occupy taller
  spans and are guaranteed in every composition.
- **6 crowns:** striped sky vessel, balancing mobile, spindle, cantilevered cups,
  off-center moon, and needle pavilion. Crowns may overhang their supporting bay.
- **2 connectors:** slender bridges and hanging crescents join adjacent bays.

The composer fits 5–22 unequal bays to the viewport, alternating broad and
needle-width stacks. Blocks fill variable-height spans without ornamental
frames. Neighboring bases and crowns do not repeat; oversized striped vessels
are limited to two and kept away from the canvas edges. Resize keeps the seed
and recomposes for the new aspect ratio; it does not shrink a desktop image.

Append `?debug=true` for the labeled block catalog and a complete composition.
Append `?seed=1907` (or another unsigned integer) for a reproducible opening.
The normal artwork contains no text or pictorial illustrations.

Run `node scripts/check-city-of-signs.mjs` from the repository root for composer,
geometry, block-role, seed, input, and resize checks.
