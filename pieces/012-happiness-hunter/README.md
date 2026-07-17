# Happiness Hunter

An autonomous arcade traffic piece. One yellow hero car searches for the
fastest lane, accelerates or backs off to manufacture an opening, and works
through gray traffic. The hero never exits.

Every car claims exactly one whole lane for traffic decisions, then animates
over when a safe lane change opens. Blinkers are reserved for obstacle
avoidance, not ordinary faster-lane hunting or exit-taking. Traffic avoids
obstacles; if a car cannot move away safely, it stops until a lane opens. Cars
do not drive through obstacles. The highway changes width as it scrolls, with
wide five-lane sections collapsing into narrower two-lane bottlenecks and
opening again.

Obstacles appear on the highway: construction, police cars, accidents, and
road animals. The yellow car is the only car that scores: each gray car it
passes adds one point. Gray cars can take exit ramps and leave the highway.
Click the piece to reseed the traffic.

## Archival rule

This folder is fully self-contained. It uses only vanilla HTML, CSS, SVG, and
JavaScript. No external CDNs, no package manager, no build step.
