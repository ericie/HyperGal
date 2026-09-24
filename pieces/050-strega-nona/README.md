# Strega Nona

Olive-ink arcs and coiled tendrils grow over warm paper until the entire
viewport is covered. Inspired by the supplied hand-drawn spiral-and-arc
reference. Several points draw at once—eight on desktop, five below 600 CSS pixels
wide. Each traces one continuous line at a time; the completed drawing holds.

- Click / tap, **Enter**, or **R**: grow another drawing.
- **Space**: pause / resume.
- **S**: save the current drawing as a PNG.
- `?seed=your-word`: reproduce a composition at the same viewport size.

Open `index.html` directly. No dependencies, network requests, or build step.
Reduced-motion preferences show the complete drawing immediately. Resizing
recomposes for the new viewport while preserving the growth percentage.

## Drawing

The composition is planned before any ink appears. An invisible ownership map
resolves the nested fans and reserves space for the tendrils. The resulting
visible curves are split into continuous pen strokes. Each drawing point
completes a local fan or tendril before moving to another shape along the
growing edge. Starts are staggered, with slightly different drawing speeds. There are no painted circle fills, paper wipes, or erased marks.

Sixteen to a hundred and twenty-eight pens draw at once, scaled to the paper
rather than fixed, so a large screen is not left inking one shape at a time
across ten times the area. Each advances by distance at roughly 175–205 CSS
pixels per second. Every stroke takes at least 0.22 seconds, so even a short arc
is visibly drawn, and the whole set is on the paper within the first second
however many there are. A desktop drawing finishes in under thirty seconds.

Completed strokes are cached; each frame draws only the active lines over that
cached ink. A leading S-curve curls into a spiral, and later tendrils wait until
neighboring fans at their bases have been drawn, including when other pens are
drawing those fans. Fan spacing extends the pattern beyond all four edges.

The animation stops when finished and suspends while the tab is hidden.
The thumbnail is a capture of this piece using the seed `olive`.

Run `node scripts/check-strega-nona.mjs` from the repository root to check
viewport coverage, simultaneous drawing points, per-pen stroke timing, pause/resume, hidden-tab suspension,
completion, resizing, and restart.
