# Paddle

Pong with the opponent removed and the field folded into a loop.

A single paddle stands at the centre of the court, exactly where the net used
to be — the net is the player. The ball leaves the left edge and returns from
the right, so the court is a cylinder with one obstacle in it. Every ball the
paddle saves travels away, around the seam, and comes back. Success is what
returns the ball; the only way to be rid of it is to miss.

The paddle plays every ball. Because the crossing height can be calculated
exactly, it commits to a reachable point on its face at the beginning of each
lap and spends the whole approach moving there. Catch or miss is decided by
the actual collision; the paddle never steps aside to manufacture an outcome.

On a catch it strikes deliberately off-centre. A dead-centre hit returns the
ball flat, and a flat rally never comes back anywhere interesting, so the
paddle places every return with a little english.

Because vx is constant between crossings and the walls are perfect mirrors,
the crossing height folds out analytically — the paddle is never guessing. It
slides onto its committed mark throughout the ball's approach.

## Scoring

The counters tally edge crossings. The ball leaving by the left edge is a
point for LEFT, and by the right edge a point for RIGHT. Exactly one crossing
happens per lap, so every lap scores — the paddle never decides whether a
point lands, only which side it lands on. A catch sends the ball back out the
edge behind it; a miss lets it through to the far one.

That makes the two numbers a record of the ball's circulation. Because a catch
reverses direction and a miss preserves it, the sides alternate almost
perfectly, and only a miss can break the rhythm by putting two consecutive laps
out the same edge. Both counters climb forever and wrap quietly at 9999. They
drift near even over a long run; the piece cannot be won or lost.

## Drawing

Black and white only. Bloom is drawn as concentric dim rectangles rather than
shadows or filters, and the phosphor trail is a separate alpha layer that
decays on a time constant, so the net and score stay crisp while only the moving
parts smear. Nothing here depends on a feature newer than Canvas 2D.

## Parameters

- `?seed=<base36>` — reproduce a specific run.
- `?warm=<seconds>` — open it already in motion with an advanced score.
- `?debug` — pass count, catch rate, and the next predicted intercept.

Click or press `r` to reseed. Open `index.html` directly in any browser.
