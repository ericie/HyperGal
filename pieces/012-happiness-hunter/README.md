# Happiness Hunter

An autonomous arcade traffic piece. One yellow hero car searches for the
fastest lane, accelerates or backs off to manufacture an opening, and works
through compact gray traffic, buses, and semi trucks, signaling as it hunts
for passes. Other drivers want to get ahead too, with slow pokes, sprinters,
aggressive squeezers, and conservative gap-waiters sharing the road. Slow
traffic packs tighter; fast traffic leaves more room. When the road opens up,
the hero sometimes surges forward. The hero never exits.

Every car claims exactly one whole lane for traffic decisions, then animates
over slowly when a safe lane change opens. The hero signals pass attempts;
traffic may or may not signal. Traffic avoids obstacles; if a car cannot move
away safely, it stops until a lane opens. Cars do not drive through obstacles.
The highway changes width as it scrolls, with wide five-lane sections
collapsing into narrower two-lane bottlenecks and opening again.

Obstacles appear on the highway: construction, police cars, accidents, and
road animals. The yellow car is the only car that scores: each gray car it
passes adds one point, each car that passes it costs one point, and a semi
truck passing it costs five. Scores can go negative. Gray cars can take
diagonal exit ramps and leave the highway. Click the piece to reseed the
traffic.

## Archival rule

This folder is fully self-contained. It uses only vanilla HTML, CSS, SVG, and
JavaScript. No external CDNs, no package manager, no build step.
