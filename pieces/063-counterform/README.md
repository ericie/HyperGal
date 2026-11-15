# Counterform

An animated two-color study inspired by a shop window: regular stripes meet soft,
circulating contours. The two inks start as hot magenta and acid green, then move
continuously through a 90-second hue circuit. Both remain fully saturated and
separated in hue; reversal uses the same pair of colors everywhere in each frame.
Eight bodies span almost an eightfold
range in radius, from a large cropped ring to small passing forms. A 127-second
gather-and-disperse cycle alternates dense encounters with quieter stripe fields.

Each organic body reverses the stripe colors. Overlapping bodies reverse them
again. Nearby bodies pull narrow necks toward one another, pinch at the shoulders,
and retain a trailing indentation during separation. A small visitor follows a
67-second passage around and through the large ring: slow approach, held contact,
quicker transit, release, then a wide return. Other encounters respond to the
actual distances and relative motion of every pair of bodies.

Four bodies have independent openings. They drift off-center, lag behind the
body's motion, and stretch toward neighbors. Each opening periodically slips
across its parent's rim, becomes a small separate form and dwindles as a new
opening grows inside. Renewal is continuous across cycle boundaries.

Hearts, cat heads and skulls remain brief appearances within longer abstract
intervals. Features arrive and dissolve unevenly; the clearest crest lasts only
a few seconds. Neighboring contours continue to interrupt them. Openings dissolve
as skull sockets emerge at different times. The stripe geometry stays fixed
while its two colors cycle.

Click, Space, or Enter pauses and resumes both motion and color. S saves the
current forms and palette as PNG.
Reduced motion starts paused. Animation sleeps while the document is hidden.
No visible titles, labels, or controls. The canvas carries an accessible
description and keyboard focus outline.

Open `index.html` directly. Native Canvas 2D only; no dependencies or network
requests. The thumbnail is a browser-rendered frame of the actual piece.

Every page load requests a fresh version of `counterform.js`, so editing the
sketch does not require clearing a previously cached script. This also works
when the page is opened directly from disk.

Run `node scripts/check-counterform.mjs` from the repository root for geometry,
encounter, aperture continuity and animation lifecycle checks. It uses Node's
standard library; the artwork itself has no test hooks or dependencies.

Status: WIP.
