# Forest of Rings

A companion to *Growth Rings*. Twenty top-down trunk sections grow across a
single surveyed field. The trees share sun, wind, and annual rainfall, while
local soil, moisture, damage, and cambium memory make every history distinct.

Two variables continuously reorganize the stand:

- **Spacing regularity** moves trees from a blue-noise woodland distribution
  toward an even five-by-four orchard plan. Size variation also settles as the
  spacing becomes more deliberate.
- **Planting regularity** moves germination dates from a mixed-age spread toward
  one shared planting year.

At `0 / 0` the piece is a wild forest. At `100 / 100` it is a synchronized
orchard, planted in rows all at once. Every setting between them is a different
kind of managed or unmanaged stand.

The field grows to 96 seasons. `New forest` reseeds climate, placement, and
individual tree histories; `Replay growth` keeps the stand and restarts its
timeline. Pointer or keyboard focus reveals individual tree records. Reduced
motion renders the mature stand immediately.

Query parameters `spacing`, `planting`, `seed`, and `age` can be used to open a
specific state directly. For example, `?spacing=100&planting=100&age=96`
opens the mature orchard.
