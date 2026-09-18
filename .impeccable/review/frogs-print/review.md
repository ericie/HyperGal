# Many Frogs — printed redraw and lag fix

2026-09-17. User approved rough, physical, slightly unsettling art direction and
requested fixing intermittent lag. Work is local; no deployment was performed.

## Visual evidence

- desktop.png: 1663 × 1000, current renderer.
- mobile.png: 390 × 844, same renderer and unchanged 21-column course.
- Independent finish reviewer disposition: **ship**, no material findings.
  Narrow bodies, angular limbs, overhead machinery, incised marks, worn
  silhouettes and absorbed pigment form a coherent printed world. Mobile
  preserves the observation distance; individual anatomy is small but bodies,
  terrain, traffic and stains remain distinguishable.
- Mechanical detector: zero findings.

## Performance evidence

`node scripts/check-many-frogs.mjs --benchmark --baseline=/tmp/hypergal-frogs/before.html`
ran each source for 3,600 updates at 1/60 second with the same fixed Date seed.
Source extracted into Node VM; canvas is stubbed. This measures simulation CPU
work, not real canvas rasterization. The temporary baseline is the unedited
piece copied before this task. Both sources reached exactly the same final
state (21 total frogs, 2 survivors, lead row 95).

| Simulation work | Before | After |
| --- | ---: | ---: |
| Mean | 7.66 ms | 1.11 ms |
| 95th percentile | 37.80 ms | 5.38 ms |
| 99th percentile | 66.79 ms | 9.49 ms |
| Maximum | 143.15 ms | 20.21 ms |

An earlier independent run measured 10.81 → 1.43 ms mean; system load affects
absolute timings. Both runs show approximately sevenfold lower simulation work.

Live desktop Chrome, 90 animation-frame intervals with 27 total frogs and 11
survivors: median 16.7 ms, p95 17.6 ms, one interval over 33.4 ms. No browser
errors or warnings. This short sample supports normal frame pacing; it is not
an all-device or indefinite-duration guarantee.

## Behavioral checks

10,560 collision samples compare direct periodic lookups with explicitly
enumerated objects. Dense temporal sampling checks that analytic swept traffic
windows miss no hazard. Additional tests exercise cached pigment and terrain,
hidden-tab RAF cancellation/resume without duplicate loops, normal/reduced
motion progress, aftermath/new cohort, phone resize, and the 640-stain cap.

The existing route depth, movement timing and reproduction rules are retained.
Pigment history is now bounded to the latest 640 marks; river softness is baked
in four stages instead of applying a new full-frame filter to each stain.
