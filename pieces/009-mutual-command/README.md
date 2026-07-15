# Mutual Command

A two-sided Missile Command riff with no player.

The north and south rows each begin with towns, three missile batteries, and a
1000-point counter. The rows launch paired missile exchanges so the attack rate
stays roughly symmetrical. Each battery also fires automatic counter-missiles
with imperfect lead prediction: most incoming missiles are caught in the middle,
but some leak through and detonate around the cities.

Every impact destroys area. Cities collapse block by block, batteries turn into
rubble, and the side's counter counts down from 1000. When a side reaches zero,
its remaining row is wiped, held for a beat, and replaced by a fresh row that
slides in from the left or right.

The graphics are drawn into a low-resolution canvas and scaled up with nearest
neighbor rendering for the blocky arcade feel. Click to reseed.

Open `index.html` directly in any browser.
