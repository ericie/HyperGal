# hunt prey paint

An abstract ecosystem that paints itself, and then wipes the painting clean,
forever. Three layers share one toroidal field — it wraps at every edge, so
there are no corners to win or die in.

## The three layers

- **Plants** — the food, drawn as a quiet **distributed-pixel terrain** in the
  spirit of the original *Dune*'s top-down landscape: a low-contrast dither over
  the sand whose density (not colour) tracks biomass, so growth reads as a subtle
  thickening of the ground rather than a busy field of symbols. Lush patches
  sprout tiny flowers from the active bloom palette. Plants grow more slowly and
  the visible terrain is painted incrementally, one small pixel at a time, so new
  groundcover fills in instead of popping on all at once.
- **Prey** — vector grazers, each wearing one of many **colours**. They eat
  plants, grow into larger bodies, and flee hunters. Giant prey become spiny and
  age continuously toward white. They must reach a visibly grown body before
  they can breed. Every prey is born with its own **alertness** (how far off it
  spots a hunter) and **sprint speed**; a fleeing one trails a streak in its own
  colour. A sprint outruns a hunter but burns energy fast, so a hounded prey can
  run itself to starvation.
- **Hunters** — black **arrows** that run the nearest prey down and **grow** as
  they feed (a weakening hunter is simply *smaller*, never faded out). Their
  energy is spent by **moving**: a starving hunter sprints faster but burns out
  faster for it. The only way a hunter breeds is to eat enough to swell and
  **split in half**, dividing into two.

Prey and hunters have solid bodies — their own kind cannot overlap, only bump
and crowd; a hunter and a prey, of course, do meet.

## Death paints; long life cleanses

The marks layer is painterly watercolour and persistent — it *is* the painting:

- a prey that is **killed** blooms a watercolour stain **in its own colour**;
- a prey that **starves** leaves a pale, washed-out stain of that colour;
- a hunter that dies leaves a dark ash mark;
- a spiny prey that reaches **old age** is the one redemption: it bursts white,
  erases the bloodstains around it, and flushes the ground. Living long enough
  is the only thing that heals the field.

Both prey and hunters die of starvation and of old age. The painting fills with
the watercolour marks of the hunt and is endlessly cleansed by the old —
rebirth, eternity, and no end.

## Balance (neither side wins)

The dials were found with a headless balance harness (long runs scored for
coexistence). The crux: hunters must be *faster than most prey* so a chase can
land — yet the fleetest prey still escape — and a hunter only breeds by eating
enough to grow fat and split, so the predator line tracks the food supply. Both
populations are floored (a thread of immigration if either crashes) and capped,
so the system is pinned into a perpetual balance: in long runs neither species
ever reaches zero, and hunters die of both starvation and old age.

## Tuning & interaction

- **Click** — reseed with a fresh soil tint and bloom palette (and a clean canvas).
- **`g` / `G`**, **`p` / `P`** — lower/raise plant growth and propagation live.
- URL: `?growth=`, `?prop=` set the plant rates; `?warm=120` fast-forwards the
  simulation ~120 s before the first frame, so it opens already alive instead of
  from a sparse cold start; `?debug` shows population, coverage, death counts, fps.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
