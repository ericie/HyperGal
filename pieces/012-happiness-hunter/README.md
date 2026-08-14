# Happiness Hunter

An autonomous arcade traffic piece. One yellow hero car searches for the
fastest lane, accelerates or backs off to manufacture an opening, and works
through compact gray traffic, buses, and semi trucks, signaling as it hunts
for passes. Other drivers want to get ahead too, with slow pokes, sprinters,
aggressive squeezers, and conservative gap-waiters sharing the road. Slow
traffic packs tighter; fast traffic leaves more room. When the road opens up,
the hero sometimes surges forward. The hero never exits.

If packed traffic leaves the hero stopped, it holds its turn signal on and
requests space in an adjacent lane. The closest following driver makes a
seeded courtesy decision; a cooperative driver brakes and preserves the opening
until the hero can merge, while an aggressive driver may refuse. A fresh
request after several seconds gives the next encounter another chance to yield.

Every car claims exactly one whole lane for traffic decisions, then animates
over slowly when a safe lane change opens. The hero signals pass attempts;
traffic may or may not signal. Traffic avoids obstacles; if a car cannot move
away safely, it stops until a lane opens. A car facing a multi-lane closure
selects an open lane beyond the obstacle and works toward it one lane at a
time, signaling early and accepting tighter zipper gaps only as the barrier
gets close. Cars do not drive through obstacles.
The highway changes width as it scrolls, with wide five-lane sections
collapsing into narrower two-lane bottlenecks and opening again.
Alternating parcels of green farmland move behind the narrower road, making the
forward travel visible even when traffic is briefly still.

Obstacles appear on the highway: construction, police cars, accidents, and
road animals. The yellow car is the only car that scores: each gray car it
passes adds one point, each car that passes it costs one point, and a semi
truck passing it costs five. Scores can go negative. Gray cars can take
diagonal exit ramps and leave the highway. Click the piece to reseed the
traffic.

The permanent score bank lives entirely in the roadside field so the highway
remains visible. Each pass or loss produces a compact speech-bubble payout near
the passed car on the side farthest from the hero. Longer runs rotate through
racing-language text, bubble clusters, roadside alerts, multiplier stamps, chip
trails, and five-event burst announcements placed in the roadside gutters.
Recent results survive as a small roadside trail rather than a second
scoreboard. Road-width transitions and exit ramps are rasterized as matching
staircase pixels rather than smooth vector diagonals.

## Archival rule

This folder is fully self-contained. It uses only vanilla HTML, CSS, SVG, and
JavaScript. No external CDNs, no package manager, no build step.
