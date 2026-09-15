# Lengthwise grain review

Disposition: **ship within this narrow visual scope**. No required fixes found.

Reviewed `lengthwise-desktop.png` (1440 × 900), `lengthwise-mobile.png` (390 × 844), and `lengthwise-young.png` (1440 × 900), alongside `pieces/034-forest-of-rings/index.html`, its README, and `meta.json`.

## Evidence

- All three captures show two upright, square-ended trunk sections without roots. The young state is shorter and narrower.
- Grain runs continuously from the bottom cut to the top cut on both sides of a full-height central axis. The captures contain no closed annual ovals, bullseyes, or stacked horizontal cap bands.
- `trunkPath` supplies the rectangular clipping silhouette. `grainPath` closes its fill beyond the visible cut ends, so only the long grain boundaries appear inside the section. The small closed pest marks are damage details, not annual boundaries.
- `grainX` depends on a stored annual boundary and absolute elevation relative to mature trunk height, rather than current age. New outer boundaries accumulate while existing grain positions remain stable; increasing visible height exposes their upward continuation.
- Desktop and mobile retain both complete trunks, separated silhouettes, legible field readouts, and the existing palette. Dense mature grain becomes finer on mobile, but its vertical direction remains clear. No material visual regression appears in these captures.
- README and metadata describe the implemented vertical cut, lengthwise grain, outward accumulation, square ends, and absence of roots. Metadata still marks the piece as WIP/rejected; this review does not change or supersede that status.

This disposition confirms the requested topology and the supplied static views. It does not claim photorealism, user acceptance, or independent runtime verification of every interaction.
