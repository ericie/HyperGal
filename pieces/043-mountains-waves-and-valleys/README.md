# Mountains Waves and Valleys

An animated series of lines with various elements of chaos and phase shifting.
Emergent graphics can resemble waves, mountains, or graphs. It can feel
energized, meditative, chaotic, or harmonious.

Written between March 9 and March 14 2024 and packaged for fxhash on March 23.
Thanks to @concavepentagon, who showed me how to make it deterministic.

## Controls

The piece has eleven parameters. On fxhash these were set in the minting
interface before an edition was made — the artwork was the parameter space, not
any single configuration. There is no minting interface here, so the panel puts
them in the viewer's hands instead. It opens from the **Controls** button and
starts closed, so the piece opens unobscured.

| Parameter | Range |
| --- | --- |
| Animation Speed | 250 – 1000 |
| Chaos Amplifier | 0.5 – 1.5 |
| Color Palette | 20 palettes |
| Curved Lines | on / off |
| Line Complexity | 8 – 110 points |
| Line Weight | Faint · Very Light · Light · Regular · Medium · Heavy |
| Line Space | Close · Normal |
| Layout Mode | Even · Erratic · Center |
| Peak Height | Very Low · Low · Medium · High |
| Valleys On | on / off |
| Wave Offset | 0.0001 – 0.2 |

**Randomise** rerolls every parameter without changing the hash. **New hash**
draws a fresh iteration, which is also what clicking the artwork does.

Every parameter can also be set from the URL — `?chaos=1.2&layout_mode=Center`
— by name or by index, so a configuration you like can be linked to.

## Interaction

- **Click or tap** — a new iteration from a new hash
- **R, Space, or Enter** — the same
- **S** — save a PNG
- `?hash=` — pin a specific iteration
- `?debug` — expose the feature record on the console

Reduced-motion preferences render one settled frame and stop.

The standalone edition curates the original parameter space: very slow motion
and Loose spacing are no longer generated, and heavy Normal compositions keep
at least 20 lines. This trims the sparse variants while retaining the piece's
range of weights, layouts, peaks, and palettes.

## Notes on the port

fxhash shut down, and this piece was built against its SDK rather than the
simpler boilerplate snippet. `fx.js` replaces that 9KB SDK with about 150 lines
covering only what the sketch uses: a seeded, resettable generator, the
parameter store, and the feature record. fxhash's base58 hash format and sfc32
generator are kept verbatim and the parameter defaults are drawn in the original
order. The standalone density and motion bounds above deliberately curate the
original parameter values, so an original `oo…` hash remains deterministic here
but may no longer match its fxhash-era starting configuration.

`sketch.js` and `styles.css` are the shipped files.

**p5.js is gone.** `runtime.js` replaces it with about 300 lines of vanilla
canvas code implementing only what this sketch calls. Two parts are
transcriptions of p5 1.5.0 rather than substitutes, because they decide what the
artwork looks like:

- `noise()` / `noiseSeed()` — p5's Perlin implementation: four octaves at 0.5
  amplitude falloff over a 4096-entry table filled from a Lehmer LCG. Any other
  noise function draws a different piece.
- `curveVertex()` — p5 converts Catmull-Rom control points to cubic Béziers
  inside `endShape()`. The Curved Lines parameter depends on that exact
  conversion, including its habit of drawing nothing under four control points.

The canvas is also backed at the display's pixel density with a scaled context,
matching p5's default, so strokes land on the same subpixels.

Verified against the p5 build before it was deleted: both were loaded side by
side and driven through 72 configurations — six palettes by six line weights by
curved and straight, cycling every layout mode, peak height, spacing and the
valleys toggle — hashing the full canvas after each. Every one matched, and the
digest over all 72 was identical (`7a1432f5`).

**The repository copy of this piece did not run.** `10-SL01/index.js` in the
source repo is pre-bundle code missing its `rand()`, `randint()`, `randchoice()`
and `randBool()` helpers, which webpack had inlined from a separate module;
loading it dies immediately on `rand is not defined`. The port is built from
`upload.zip`, the package that actually shipped, where those helpers are
present. `params.js` here carries them.

Two changes to the sketch itself. `setup()` is split so that a parameter change
re-forms the piece without rebuilding the canvas. And `setLineParams()` now
clears the line dash and stroke cap before setting them: the Faint and Very
Light weights set a dash and nothing ever cleared it, which never mattered when
the weight was fixed at mint but would have left dashes behind the moment a
control panel could change it mid-run.

Numeric defaults are snapped to their declared step, which is what the minting
form would have done, so the panel and the artwork always agree on a value.
