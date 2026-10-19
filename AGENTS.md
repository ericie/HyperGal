## Sketch presentation

No sketch should contain visible text unless the user explicitly adds or requests that text. Never place a title on screen inside a sketch. Do not automatically add captions, readouts, instructions, labels, or text controls. Keep accessibility labels and gallery metadata available without displaying text over the artwork.

## Composition status

Every composition defaults to WIP unless the user explicitly promotes it to Selected or demotes it to Rejected. Do not infer promotion from completion, quality, ratings, or importing an existing work. Preserve manual decisions: `"wip": false` marks an explicit promotion; `"rejected": true` marks an explicit rejection and takes precedence. Missing status fields mean WIP. New compositions and the template must start with `"wip": true`.
