# Happiness Hunter

An autonomous arcade traffic piece. A yellow hero car searches for the fastest
lane, signals when there is no opening, and works its way toward required
exits through traffic that has its own aggression and compassion values.

Every passing car carries two small roof indicators: red for aggression, blue
for compassion. Aggressive cars follow closer and close gaps faster.
Compassionate cars are more likely to slow when the hero signals into their
lane. The score rises by one whenever the hero passes a car, and falls by one
whenever a car passes the hero.

Obstacles appear on the highway: construction, police cars, accidents, and
road animals. Cars try to avoid them and generally try not to crash. Click the
piece to reseed the traffic.

## Archival rule

This folder is fully self-contained. It uses only vanilla HTML, CSS, SVG, and
JavaScript. No external CDNs, no package manager, no build step.
