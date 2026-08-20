# Forest of Rings

A companion to *Growth Rings*. Twenty top-down trunk sections grow edge to edge
across a single surveyed field. Latitude determines the shared solar direction;
the same sun, wind, and annual rainfall act on every tree. Elevation, slope,
soil, moisture, and cambium memory vary across the terrain, making every history
distinct. Each annual ring uses a different color from its two neighbors.

A large fire follows the prevailing wind through a broad corridor, crossing
multiple trees in one directional event and leaving aligned scars. Insect
outbreaks remain individual: only selected trunks receive bore marks and the
suppressed rings around them.

Two variables continuously reorganize the stand:

- **Spacing regularity** moves trees from a blue-noise woodland distribution
  toward an even five-by-four orchard plan. Size variation also settles as the
  spacing becomes more deliberate.
- **Planting regularity** moves germination dates from a mixed-age spread toward
  one shared planting year.

At `0 / 0` the piece is a wild forest. At `100 / 100` it is a synchronized
orchard, planted in rows all at once. Every setting between them is a different
kind of managed or unmanaged stand.

The variable panel starts closed so the forest occupies the first view. The
field grows to 96 seasons. `New forest` reseeds climate, terrain, fire path,
placement, and individual tree histories; `Replay growth` keeps the stand and
restarts its timeline. Pointer or keyboard focus reveals elevation, fire
exposure, and insect history for individual trees. Reduced motion renders the
mature stand immediately.

Query parameters `spacing`, `planting`, `seed`, and `age` can be used to open a
specific state directly. For example, `?spacing=100&planting=100&age=96`
opens the mature orchard.
