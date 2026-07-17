# Paddle

Pong with the opponent removed and the field folded into a loop.

A single paddle stands at the centre of the court, exactly where the net used
to be — the net is the player. The ball leaves the left edge and returns from
the right, so the court is a cylinder with one obstacle in it. Every ball the
paddle saves travels away, around the seam, and comes back. Success is what
returns the ball; the only way to be rid of it is to miss.

The paddle catches eight of every ten. Not eighty percent on average — a
shuffled bag of ten outcomes holds exactly two misses, so the ratio is exact
over every ten passes. Intent is authoritative: the bag rules on catch or miss
first, and the paddle's mark is then chosen so the geometry agrees with the
ruling. On a miss it stands just far enough off that the ball clips past the
rim by a few pixels, which reads as a fumble rather than a forfeit.

On a catch it strikes deliberately off-centre. A dead-centre hit returns the
ball flat, and a flat rally never comes back anywhere interesting, so the
paddle places every return with a little english.

Because vx is constant between crossings and the walls are perfect mirrors,
the crossing height folds out analytically — the paddle is never guessing. It
spends the first part of each loop simply tracking the ball's height, then
slides onto its committed mark as the ball closes.

## Scoring

The counters tally edge crossings. The ball leaving by the left edge is a
point for LEFT, and by the right edge a point for RIGHT. Exactly one crossing
happens per lap, so every lap scores — the paddle never decides whether a
point lands, only which side it lands on. A catch sends the ball back out the
edge behind it; a miss lets it through to the far one.

That makes the two numbers a record of the ball's circulation rather than a
record of the paddle's failures. Because a catch reverses direction and a miss
preserves it, the sides alternate almost perfectly, and only a miss can break
the rhythm by putting two consecutive laps out the same edge. Both counters
climb forever and wrap quietly at 9999. They drift near even over a long run;
the piece cannot be won or lost.

## Scars

Every miss burns a bar into the net at the exact height the ball slipped past,
growing toward the side it was heading. This is the only permanent thing here:
over hours the centre line becomes a histogram of where this paddle fails. Bar
length is logarithmic and capped, so it thickens for hours without ever eating
the court.

## Drawing

Black and white only. Bloom is drawn as concentric dim rectangles rather than
shadows or filters, and the phosphor trail is a separate alpha layer that
decays on a time constant, so the net, scars and score stay crisp while only
the moving parts smear. Nothing here depends on a feature newer than Canvas 2D.

## Parameters

- `?seed=<base36>` — reproduce a specific run.
- `?warm=<seconds>` — open it already alive, with a scarred net.
- `?debug` — pass count, catch rate, and the geometry-agreement check.

Click or press `r` to reseed. Open `index.html` directly in any browser.
