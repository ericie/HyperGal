# Knot Work

A full-browser knot composition inspired by mid-century textile posters and
Celtic interlace. Continuous cords form rounded turns, nested border loops,
and alternating over-under crossings on worn paper. A connectivity pass joins
isolated interior rings and border ovals into the larger weave, so closed cords
remain interlaced with the rest of the composition.

The floating **Controls** panel edits the drawing immediately:

- Set independent top, right, bottom, and left padding, as percentages of the
  viewport. The knot stretches horizontally and vertically to meet those margins.
  Changing top/bottom leaves its horizontal placement and extent fixed; changing
  left/right leaves its vertical placement and extent fixed.
- Choose single, double, or triple parallel lines.
- Adjust density, line weight, crossing gap, and irregularity. Line weight scales
  within the space available at the tightest bends, including allowance for
  irregularity, so neighboring cords stay separate at the maximum setting.
- Pick each line's color and the paper color.
- Enable a gradient that follows each closed cord, choose its blend color,
  and set one to six color cycles. Each cycle blends to that color and back,
  keeping the loop seam and crossing overprints continuous.

Click the panel header to collapse it, press Escape while inside it to collapse
and focus the header, or drag the dotted grip to move it. The panel scrolls on
small screens. **Reset settings** restores the original double-line umber palette
and five-percent padding without replacing the seed. **New knot**, clicking the
artwork, or Enter/Space while the artwork is focused generates a new seed and
keeps the drawing settings.

The piece generates deterministic geometry from its seed and viewport. Changes
update the URL when the control is committed, so copying or bookmarking that
URL preserves the seed and all drawing settings. Use `?seed=anything` to revisit
a particular composition; viewport changes adapt its layout.

The sketch uses local HTML, CSS, and JavaScript without a build step or rendering
dependencies. Run `node scripts/check-knot-work.mjs` from the repository root to
check geometry, padding, line modes, gradients, URL restoration, and controls.
