# Life Checkers

Conway's Game of Life rendered as a four-color checkerboard.

- Dead and live cells each use a different two-color palette selected by the seed.
- Eight woven checkerboard palettes supply the pairs: rose/orange,
  red/tangerine, blush/moss, black/cream, olive/ivory, emerald/ice,
  teal/mustard, and cobalt/cyan.
- Opposite colors always alternate across rows and columns.
- On load, live cells fade in through ten quick batches and begin evolving.
- An unseeded visit opens with a centered pulsar oscillator before resetting
  into a random field.
- Generations move quickly while cells fade smoothly between dead and alive.
- When a generation stops changing or repeats a recent state, the field resets
  with a new seed and palette.
- At reset, the dead checkerboard changes from top to bottom before the new
  live cells fade in through ten quick batches. None of the four incoming
  colors appear in the outgoing palette pair.

## Controls

- Click or drag: draw/erase live cells
- Space: pause/play
- N: advance one generation
- R: scatter a new seeded field and palette combination
- C: clear and pause

The field wraps at every edge. Add `?seed=your-seed` to the URL to reproduce
an opening pattern and its palette combination.

Add `?test=stasis` to start with a centered four-cell still life and verify the
automatic reset.
