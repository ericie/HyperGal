# Growth Rings

An animated tree-trunk cross-section. The piece adds one annual ring about every
0.22 seconds, reaching 200 years in roughly 44 seconds.

The growth model is biased by visible and invisible forces:

- Latitude and solar elevation thicken the sunward side.
- Wind exposure compresses the windward side and pushes growth leeward.
- Temperature, yearly rainfall, droughts, and wet years change annual ring width.
- Each new ring randomly selects an opaque palette swatch and flat tone variant.
- Ground slope adds reaction wood toward the downhill side.
- Pest and fire are severity-scaled incidents, pre-marked with abstract chart
  lines. Each one affects 1-5 years of growth: minor incidents leave narrow
  kinks, severe incidents compress multiple rings and deform the bark while
  later rings grow over the record.

Those forces are drawn as abstract field-map symbols around the trunk. Click or
press Enter/Space to reseed the specimen.

The default palette is Hokusai. Use `?palette=gucci`, `?palette=renaissance`,
`?palette=nature`, `?palette=vapor`, or `?palette=debug` to render alternate
palette families.

Use `?rate=5` for the original slow five-second annual growth, or any other
number to set seconds per ring.
