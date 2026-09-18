# Architectural ink redraw

2026-09-17. The user rejected the current style and supplied two architectural
ink drawings, asking to redo all blocks. All 22 active drawings were replaced;
the historical archive remains untouched. Numbers 01–19 and 21–23 are preserved.

The new kit separates thin construction lines from solid shadow planes. White
walls, dark recesses and returns, projecting slabs, fine steel rails, framed
windows, small service hardware and supported rooftop equipment replace the
previous cutout drawings. Entire facades no longer alternate black and white.
Each study uses isotropic coordinates; fans stay circular and line weights stay
consistent. Roof structures have height limits, preserving their proportions.

The first reference supplies the wall/shadow balance and the second supplies
repeated occupied floors. This remains a modular skyline composition, with
shallow oblique projections within the blocks, rather than a reproduction of
either reference's viewpoint. No raster assets, gradients or gray fills are used.

One implementation pass, one batched desktop/catalog/phone inspection, one batch
of corrections (roof proportions, balcony occupancy and repetitive glazing),
then final confirmation. The final browser log showed no errors. Responsive
emulation was cleared afterward.

Validation passed: 480 seeded layouts, all 58 active/archive drawings, over 10.6
million finite drawing calls, stable review numbers, stairs, palette, retired block and
overlay exclusions, regeneration and DPR resize. JavaScript syntax and whitespace
checks pass. No build step is required for this static Canvas piece.

`before.js` and `after.js` preserve the source transition. `catalog.png` is the
complete final catalog; `desktop.png` (1440×1000), `mobile.png` (390×844) and
`square.png` (1200×1200) show the final renderer. The square supplies the gallery
thumbnail. User acceptance remains pending; no publication or commit was made.
