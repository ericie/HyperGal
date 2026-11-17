# Issues

Thematic collections of existing Hypermedia Club works. The current `index.html`
is the Arcade landing page; `arcade/index.html` is the original
fifteen-work wall. Open either directly or follow **Issues** from the master
gallery. No server, build step, CDN, or package installation is required.

For cache-free local editing, run `python3 scripts/preview.py` from the repository
root and reload the page after edits. Before publishing attract changes, run
`node scripts/version-arcade-assets.mjs` to refresh content-hash URLs for scripts,
styles, and preview PNGs across both entry views and the standalone studies.

## About

Both pages have [Hypermedia Club](../index.html) on the left of the top bar,
with [Games](index.html) and [About](about.html) on the right, marking the current page. Games also has a small Pause/Play text button for the title pulse and attract films; the brand link replaces the separate back arrow. The About page's four
paragraphs explain the user-supplied concept: start with influential games and
ask “What if?”, change their rules to explore underlying systems through
satire, and make works that can be both played and watched. The final paragraph
connects the user's earlier interactive art and arcade projects to Hypermedia
Club, a current solo venture with AI agents as thought and coding partners.
It makes no claim about collaboration or AI use in the earlier work. Hypermedia Arcade
remains the provisional page name, with Arcade dominant in the heading.
The user restored Hypermedia Club as a link to the master gallery. Page headings,
About copy, layout, original works and manual statuses remain unchanged.

## Arcade

Current integration: all fifteen Selected Games have continuous native films
on the current landing and original wall. The static wall retains fifteen
provenance-recorded PNG fallbacks and direct work links without JavaScript;
the landing offers its Selected Games catalog link. The user rejected the
eight-film batch: three unchanged studies and the batch overview have explicit
rejected status; the new user-directed Pac, Cloudcutter, Paddle, Bitsy Blocks and Top of the Heap replacements
and earlier studies remain WIP. Original manual Selected statuses and gameplay
remain unchanged.

Historical direction record: the user rejected the street-art/comic/photostat
foreground described below and a later glossy 3D exploration, which was not
applied. Asteroids, We're All Snakes and Warlords were the first three native
integrations; twelve raw films and the remaining original thumbnails belonged
to that former stage. The supplied GIF references were clarified toward classic
Atari attract screens; only still previews were available, so their motion was
not inspected. The historical raw implementation below is not the current film bank.

Preview the [Asteroids attract study](arcade/attract-test.html). In its
twenty-second native canvas loop, rigid brackets and hinged multisegment strokes
converge, bend, approach joins with eight-pixel gaps, then clamp into the requested
ASTEROIDS ASSEMBLE title with brief coral jaws and minor recoil. The completed
title holds until a radial ballistic burst at 14.6 seconds accelerates and
tumbles fragments offscreen. Incoming parts mainly originate beyond the frame;
a small next-cycle lead-in begins near the end. Fully offscreen fragments are
culled. Three faint asteroid pairs drift left to right behind the words and
coalesce into plain external union outlines with internal edges omitted. No
background clamp brackets, locks, jaws, or added marks remain. At the same
14.6-second onset as the words, wedges from the actual asteroid polygons scatter
outward and tumble, with no added rings, sparks, or ornaments. Both letter parts
and asteroid chunks leave the frame, leaving only the constant **0¢ TO PLAY** message
by 16.3 seconds. Background asteroids gradually return from 18.5 seconds
through the loop boundary. The words’ geometry, motion, and existing tiny
assembly accents remain unchanged. There is no spaceship or shot sequence.
The exact bottom message **0¢ TO PLAY** stays visible for the full loop, including the explosion, pause, and reduced-motion still. It uses the same authored vector lettering and does not blink or break apart.
The standalone study HTML plus renderer totals 15,372 bytes; the shared renderer
plus integration controller totals 14,684 bytes,
with no animation rasters or video; reused scenery and the existing Public Sans
font are additional assets. A 24fps timer runs only while active, with pause,
focus, reduced motion, and hidden-document suspension. Focus and reduced motion
hold the completed title at eleven seconds. The whole screen links to the
original Asteroids Assemble work. The wall and three old raw images remain as
permitted dim background posters. No new fonts or shared tokens are introduced.
The test metadata starts with `"wip": true`; original piece content and status
remain unchanged. Longer loops within reasonable byte budgets are permitted;
Asteroids, We're All Snakes, and Warlords were the first entry-surface placements;
the complete fifteen-film integration is recorded below.

Preview the [We're All Snakes attract study](arcade/snake-test.html). Exactly 36
continuous snakes crawl along safe ground tracks during the perspective opening,
settling into **WE'RE ALL** above **SNAKES** by 3.8 seconds. The blinking mouse
stands on clear ground at (-8.4, -1.2), with at least .52 world units of clearance
around its full footprint. The camera follows an arriving snake, then pulls
overhead in .65 seconds from 4.4–5.05 seconds. The title stays fixed from 3.8
until 9.6 seconds, without letter morphs or crossfades. Every body is .8 world
units wide; all 13 letters share a 5.6-unit cap height, with a 1.6-unit apostrophe.
Adjoining pieces meet edge-to-edge, closing the glyphs. Fractional body motion
preserves right-angle interior corners. At 9.6 seconds the bodies hustle
offscreen without overlaps; all tails clear by 11.2875 seconds. The 15-second
loop returns the camera at 13.2–15 seconds. No play-price text, footer, heads or eyes.
Focus, reduced motion and the native 1200×900 fallback show the title at 9s.
`node scripts/plan-snake-attract.mjs` jointly plans exits offline, reserving old
and new full bodies through each movement step; arrivals retrace those safe
tracks. Runtime decodes the compact routes. `--check` verifies routes are current.
`node scripts/check-snake-attract.mjs` checks moving arrivals, settled geometry
through the camera rise, uniform widths/heights, 14 edge-connected glyphs and
mouse safety. Arrivals and exits receive 1,341 overlap/backtrack samples at
240Hz, with full-width self-segments at 80Hz and a complete-exit assertion.
Touching edges are allowed; penetration is not. Current native evidence is
`.impeccable/review/snake-uniform-arrival/`, including the contact sheet,
800×600 opening and 1200×900 title. Browser
access is unavailable for a fresh layout/interaction pass. Shared playback
controls, direct links and all manual statuses remain; the study stays WIP.
The original game's public title is now We're All Snakes (formerly Snake Pit);
browser and accessible names, metadata, manifest, and README alias follow the
rename. Its `pieces/007-hydra/` link, gameplay, rating, and manual `"wip": false`
remain unchanged; no visible title is added inside the game. Earlier checks in
`.impeccable/review/snake-cursor-title/checks.json` cover the prior revision
across three surfaces and three viewports. The native captures in
`.impeccable/review/snake-24-exits/` also describe an earlier revision; current
36-body evidence is linked above.

Preview the [Warlords attract study](arcade/warlords-test.html). Its 24-second
native loop uses the original four flat colored cannons, curved planet caps,
and star field. The camera stays at 2.8× through the firing
close-ups in north/east/south/west order: pink, orange, mint, then blue. Each
3.6-second dwell fires seven shots with recoil and color-matched projectiles
toward the opposite edge; 280ms pans connect the close-ups. At 15.4 seconds,
the intact **WARLORDS** word accelerates downward, landing at 16.05 seconds.
Its existing letter geometry is uniformly scaled to 78%, roughly 573px wide
with 157px cap height at native 800×600. Contact triggers a brief squash/shake
and flat 8px-cell fireball, ground shockwave, rising dark smoke, and embers
behind the word. A dark keyline keeps the lettering readable; the letters
never fragment. Fire ends 1.6 seconds after contact, smoke/embers dissipate
within 3.2 seconds, and the intact title holds.
Only the first close-up returns at 23.4–24 seconds; no four-gun overview appears
anywhere. The ammunition counter and **0¢ TO PLAY** are removed from Warlords
at the user’s request. Asteroids retains its play message; Snakes has no play-price text.
The animation now uses the entire 800×600 source frame: the old 68-pixel
bottom mask is removed, and arena, blast and ember bounds extend to the bottom
edge. The native 1200×900 `arcade/assets/warlords-attract.png` fallback shows the
settled title at 18 seconds, with refreshed provenance and cache hashes.
The standalone study and
original wall keep that PNG and ordinary work link without JavaScript. The
study starts with `"wip": true`; the original work retains its manual
`"wip": false` and unchanged gameplay. Its public title is now Warlords while
`pieces/005-only-invaders/` remains the stable link. Browser and accessible
names, manifest metadata, and README alias follow the rename. A fresh native-game
900×900 JPG thumbnail (39,459 bytes) replaces the old lettered image and embeds
its provenance; historical prompts and rejected background images retain their
original names. No visible title is added inside the original game, and no
shared font, palette, token, or gallery identity changes. The Warlords-only HUD removal is
recorded by `.impeccable/review/warlords-no-hud/checks.json` and ten captures:
historical samples verified the former blank footer, firing and intact title blast
remain, and desktop, mobile, small-study, and wall views have no overflow or
browser errors. The finish review returned **ship**; the study remains WIP.

Preview the [Mutual Command attract study](arcade/command-test.html). Its
21.4-second loop shows both consoles at once: upside-down bright pink above and
upright bright blue below. All text is white at the same 14px source height,
including **Both**, with no reverse highlight. **MISSILES INCOMING / Response _ /
ATTACK or DEFEND? / Both** types at 24 characters per second; the bottom console
leads the top by .35 seconds. Both exchanges finish before the outward exit.
From 5.2–5.9 seconds, the top panel/text slide off the top and the bottom off the
bottom. After they clear, both lands enter from their respective vertical edges
at 5.9–6.7 seconds, in lockstep and without horizontal movement. Brief combat
runs until 10.9 seconds; both lands leave vertically at 10.9–11.7 seconds.
The existing title sequence starts at 11.9 seconds: **MUTUAL** descends and
**COMMAND** rises, M/C first, then U/O, T/M, U/M, A/A, L/N and the final D.
Pairs arrive .62 seconds apart, contact after .58 seconds and recoil/settle over
.95 seconds. All 13 letters stop at 17.15 seconds. Focus/reduced motion and the
provenance-recorded 1200×900 fallback show the settled title at 18.5 seconds.
`node scripts/check-command-attract.mjs` checks staggered typing, uniform white
text, saturated panel colors with at least 4.5:1 text contrast, separate bounds,
complete outward exits before deployment, symmetric
vertical land entry, combat, six painted-pixel contacts, 1,297 overlap samples
at 240Hz, opposite rebounds and the stopped title. Completed white text masks
match after a 180-degree rotation, with zero mismatches and 2,764 white pixels
per panel. Current native evidence is `.impeccable/review/command-bright-stagger/`,
including partial typing, complete consoles and a 320×240 title still.
Browser access remains unavailable for a fresh layout/interaction pass. Shared
playback, direct original-game links and all manual statuses remain; the study
stays WIP. No scores, prices, new fonts, dependencies or shared tokens.

Preview the [Unbreakable attract study](arcade/unbreakable-test.html). Its
20.2-second native loop opens with **UNBRE** above **AKABLE** in eleven heavy
cream glyphs on the original game's deep purple ground. At 800×600, the title
has 6px outer margins, 4px seams, a 6px row gap and 291px-high letters; its cream
silhouette occupies about 80.3% of the frame. Both B glyphs have a right-edge
notch. The title caps the wall, with no masonry above its upper edge. It holds
until 2.2 seconds, tilts through 3.8 seconds, then the camera travels 128 world
units along the restored tall wall at 3.8–5.4 seconds. Projection flattens during
arrival at 4.5–5.4 seconds; the camera eye approaches monotonically and stops
before the paddle plane, without overshooting and returning. Reverse-Breakout
play at 5.4–12.6 seconds adds whole bricks
after the ball clears each new cell. The wall and machine retreat at
12.6–14.1 seconds, expanding empty ground; all eleven letters type back in at
.32-second intervals from 14.1–17.3 seconds. The completed title matches the
opening pixels and holds through the loop boundary. No extra artwork copy,
font or image dependency is added.

`arcade/unbreakable-attract.js` serves the study, landing card and original wall
through the shared native-film controller. Focus/reduced motion and the
provenance-recorded 1200×900 `arcade/assets/unbreakable-attract.png` show the
complete title at 1 second. Pause, hidden/offscreen suspension, direct
`pieces/003-unbreakable/` links and resolution limits use the existing lifecycle;
`scripts/version-arcade-assets.mjs` refreshes content-hash URLs. The study starts
with `"wip": true`; the original manual `"wip": false` and gameplay remain intact.
`node scripts/check-unbreakable-attract.mjs` passes 2,425 draw samples at 120Hz,
B notches, the wall's upper limit, restored wall span and fast travel, camera-eye continuity
and limits, nine brick hits, nine paddle catches, nine added cells with
ball clearance, ordered typing, wiring and the exact loop state. Native evidence
in `.impeccable/review/unbreakable-tall-wall-fast/` covers the title, upper wall edge,
descent, arrival and flat view, including a 320×240 still. Browser access was unavailable, so
these checks do not claim a fresh browser layout or interaction pass. This is
a local film extension with no shared token or gallery identity change.

Preview the [Lunar Landgrab attract study](arcade/landgrab-test.html). The
provisional name (formerly Lunar Founder) and stable `pieces/059-moon-orchard/`
link remain. Eight low ivory pressure modules replace the terrestrial facades:
a ribbed barrel habitat, command dome, connected laboratory pods, dish
observatory, hangar, greenhouse, solar station and airlock. Blue shadows, cyan
glass and small orange/yellow service details sit against the unchanged black
sky, cyan/blue mountains, green hills and peach road. Separated footprints in
two rows are 66–82px wide and 43–106px high. Frames and six-pixel construction
steps reveal the modules under working cranes. No destruction, debris,
explosions, projectiles or combat appear; original crash/rebirth gameplay and
manual `"wip": false` remain unchanged, and the study stays WIP.

The 23.4-second loop starts construction at .2 seconds; all modules finish by
11.7 and cranes work through 13.7. The completed hangar opens at 11.8–12.6.
At 12.6 a compact original-style three-wheel buggy, without guns, emerges from
its actual hatch at (61, 259), follows the apron to road level y=281, then drives
right and fully leaves by 19 seconds. **LUNAR** above **LANDGRAB** assembles at
14.8–16.17. Camera travel at 19.4–23.4 brings in a fresh site and returns to the
exact opening pixels. The native 400×300 buffer scales without smoothing;
focus/reduced motion and the provenance-recorded 1200×900 fallback show the
finished outpost, title and departing buggy at 18 seconds. Shared playback,
direct links, suspension, resolution caps and content hashes remain unchanged.

`node scripts/check-landgrab-attract.mjs` passes 2,809 time samples and 4,174
construction samples for eight lunar profiles, broad separated footprints,
monotonic construction, completed/open hatch and vehicle fit, apron/road path,
full offscreen departure, cranes, title, exact loop, wiring and statuses.
`node scripts/check-attract-playback.mjs` passes the existing shared lifecycle.
Current evidence is `.impeccable/review/lunar-landgrab-departure/`, including
city, hatch exit, apron, full title and a contact sheet with a 320×240 still.
Earlier `lunar-landgrab-construction` and `lunar-landgrab-native` captures show
rejected architecture. No fresh browser layout or interaction pass is claimed.
No font, asset dependency, shared token or original-game change is introduced.

Preview the [Onward & Upward attract study](arcade/onward-test.html). Its
22.4-second loop flies upward into a deep course of 210 floating platforms,
continuously flattens at 3.8–5.8 seconds, then follows fourteen independent
jumpers until 12.8 seconds. Mint/plum ledges, pink crumbly tiles, lilac moving
shelves and three floppy navy bag shapes with high white eyes adapt the source
game. Jumpers take supported ballistic routes between real ledges. At
12.8–14.8 seconds the camera rushes to the title's actual course position:
**ONWARD** / **&** / **UPWARD**. The title holds before a gentle sky reset at
20.8–22.4 seconds. Only the requested title appears in the artwork.

Three existing painted cloud images are reused through provenance-recorded,
content-addressed copies with identical RGBA pixels; original assets remain
untouched. The native title PNG fallback and focus/reduced-motion still show
the finished composition at 17.5 seconds. Study, landing and original wall
share `arcade/onward-attract.js` and the existing controller/version helper.
The controller keeps the fallback visible and holds the opening clock while
clouds load; readiness also renders the reduced-motion still without starting
an animation timer. Synchronous films retain their existing playback behavior.
Pause, focus, hidden/player/offscreen suspension, resolution caps and direct
`pieces/016-up-mario/` links remain. The original work stays **Always Moving
Up** with manual `"wip": false`; the new study starts `"wip": true`.

`node scripts/check-onward-attract.mjs` passes 2,689 samples and 224 supported
landings, with at least eleven jumpers visible during flat play and maximum
lateral air speed 282.97 below the 320-unit limit.
`node scripts/check-attract-playback.mjs` passes readiness/fallback, held opening
clock, synchronous-film behavior, reduced-motion loading and shared lifecycle
checks. Native evidence in `.impeccable/review/onward-native/` covers perspective,
crowd, rush and title at 800×600, 1200×900 and 320×240. Browser host was
unavailable; no fresh browser layout or interaction pass is claimed. No shared
gallery token or original-piece change follows from this local extension.

Preview the [current Pac attract study](arcade/pacman-test.html). The exact
three-line title **TO BIG / FOR THIS / WORLD** appears as uniform blue
double-rail strokes on black/purple, with one row of 27 small warm dots at
y=530 below all letters. There are no surrounding maze rails or other dots.
The 14.8-second fixed-camera loop keeps small Pac at radius 10: it feeds at
95 units/second, pauses at 4 seconds, looks backward from 4.4, then accelerates
right from 5.1 toward 390 units/second. Its whole body exits by about 6.592
seconds, before the giant's pass starts at 6.9. The radius-800 giant (1600px
diameter, twice the native screen width) consumes the title and remaining dots
with a persistent mouth sweep; small Pac is already offscreen. The pass ends
at 10.5, empty space holds briefly, and letters redraw from 11.2 before dots
return. Focus/reduced motion and the native 1200×900 fallback hold the complete
title/dot row with small Pac at 2.2 seconds.

`node scripts/check-pacman-attract.mjs` passes 1,777 samples for exact phrase,
only one dot row below the title, clear small-Pac passage, stop/look/escape
beats, full-body exit before giant entry, giant size, permanent consumption,
letter/dot return, loop/seek and status preservation. Native evidence is
`.impeccable/review/pacman-title-escape/`, including `native-contact.png` and
`native-still.png` at native/full-title/card scopes. Exact loop pixels and
deterministic seeking are checked across 356 native frames. Updated batch checks
pass 9,012 draws and shared playback passes. No fresh browser layout or
interaction pass is claimed. Original **To Big for This World**, gameplay and manual
`"wip": false` remain; the study stays WIP. The earlier TOO word-maze/chase
captures in `pacman-word-chase` are superseded history, not a new rejection.
The original eight-film batch's Pac captures remain rejected historical work.
No other film, shared token, font/image dependency or original-piece change
is introduced by this revision.

Preview the [current Cloudcutter attract study](arcade/cloudcutter-test.html).
**CLOUD / CUTTER** now uses 216 larger scalloped lobes, radii 25.5–30.5px,
forming eleven taller, thicker cloud letters with open counters. White caps,
pale bodies and blue undersides retain the original blue sky. The cobalt can
is scaled to 80% across body, muzzle and collision geometry, with one centered
barrel. Its downward-curved left-to-right pass remains at 3–9.4 seconds.
Twenty-four sequential rounds cause sixteen real cloud hits; each shot waits
until the previous round hits or exits, plus .08 seconds, so at most one bullet
is in flight. Broad shot cuts and the hull channel remain after the can leaves.
Healing at 10.4–17.2 restores the same original cloud pixels within the fixed
19.8-second loop. Focus/reduced motion and the native 1200×900 fallback hold
the intact title at 2.2 seconds.

`node scripts/check-cloudcutter-attract.mjs` passes 2,377 samples for fuller
letter bounds/open counters, coordinated can scaling, centered muzzle and
sequential emission, single active projectile, real impacts, persistent damage,
monotonic healing and exact restoration. Occupied cloud-area samples rise from
6,237 to 7,709 during healing. Current native evidence is
`.impeccable/review/cloudcutter-puffier/`, including intact title, single-shot
detail, firing, damage, healing and restoration plus a 320×240 contact still.
Native coverage is 476 frames with exact loop/seek pixels and healed/intact PNG
equality. Updated batch checks pass 9,012 draws and shared playback passes.
No fresh browser layout or interaction verification is claimed.
Original **Cloudcutter** identity, gameplay, slow game healing and manual
`"wip": false` remain unchanged; the study stays WIP and other study decisions
remain. Earlier twin-gun `cloudcutter-cloud-type` evidence is superseded history,
without a new rejection; original batch evidence remains rejected history.
No font/image dependency, extra artwork copy or shared-system change is added.

Preview the [current Paddle attract study](arcade/paddle-test.html). The
cylinder's side is now exactly the letters' 126px height. From frame zero,
**PADDLE** curves around its black/white wire surface, with dimmed rear faces.
One full spin at 1.4–5 seconds returns the six glyphs to the front. They then
accelerate as whole letters into the center line at 5–5.48, keeping their 18px
cell sizes and internal relationships through impact. Their overlapping
90×126 shapes squash at 5.48–6.05, briefly narrowing/stretching beyond the
settled dimensions before becoming a solid 32×203 paddle. Compressed glyph
cells broaden internally to fill counters; there is no independent tile-grid
packing. All 145 identities remain.

The existing three-ball rally follows from 7 seconds at 920/1120/1320 units
per second, above the original game's maximum of 560. Real face contacts and
screen wrapping use the same paddle. Balls fade/clear at 15.8–16.2; recentering
finishes by 16.7 and reverse formation opens the same material back to the
cylinder at 16.7–18.2. The fixed-camera loop remains 20 seconds, with a legible
cylinder focus/reduced-motion/native fallback still at .8 seconds. Original
**Paddle**, gameplay and manual `"wip": false` remain unchanged; this study
stays WIP and other study decisions remain.

`node scripts/check-paddle-attract.mjs` passes 2,401 samples for matching
cylinder/glyph heights, whole-letter impact, preserved identities, controlled
squash overshoot, solid paddle coverage, continuous phases, three faster balls,
38 face contacts, 37 wraps, no tunneling and loop/seek/status preservation.
Current native evidence is `.impeccable/review/paddle-crash/`, covering still,
spin, approach, impact, squash, rally and reset at native/full-title/card scopes.
All 480 frames have exact loop/seek pixels checked. Updated batch checks pass
9,012 draws and shared playback passes. Earlier `paddle-cylinder`
gather evidence is superseded history without a new rejection; original batch
Paddle evidence remains rejected history. No fresh browser layout or interaction
claim, font/image dependency, extra artwork copy or shared-token change is added.

Preview the [current Bitsy Blocks attract study](arcade/tetris-test.html).
The camera now stays at 5× from the opening through the title and Tetris play:
each source 4px cell projects to 20px, with an 18px solid face and 2px seam.
The same seven muted colors fill 113,163 wall cells. Culled visible cells are
drawn directly with the same rectangle geometry as the falling blocks, keeping
the close view crisp. The crack and **BITSY / BLOCKS** remain actual omitted
cells; the title is recut at one-cell scale to fit the close frame. The camera
pans up the crack at 1–5.2 seconds, holds the complete title (still at 6.5), then
pans to the 20×24-cell game pocket at 8.2–9 without changing zoom.

The existing legal T/O/vertical-I drops at 9.2–12.9 complete rows 20–23 for the
real four-line clear. The fault begins at 13.25, but no pullback starts until
crumbling begins at 14.2. The camera then pulls from 5× to 1× through 15.4 while
28,383 world-space blocks fall under the same camera; the cleared support strip
is excluded and remaining game-board blocks join the particles. Every block
clears by 17.2. Camera reset occurs offscreen at 17.2–17.8, then the close wall
rebuilds at 17.8–20.2 within the unchanged 22.2-second loop.

`node scripts/check-bitsy-attract.mjs` passes 2,665 samples for title/crack
voids, constant close scale and title fit, legal supported drops/four-row clear,
pullback starting with collapse, complete particle coverage/gravity, original
name/status and loop/seek. Current native evidence is
`.impeccable/review/bitsy-close/`, covering close opening/title/gameplay, fault
and simultaneous crumble/pullback, including a 320×240 still. Native coverage
is 533 frames with exact loop/seek and identical pixels across collapse onset.
Updated batch checks pass 9,012 draws and shared playback passes. No fresh
browser layout or interaction verification is claimed. Existing **Bitsy Blocks** identity,
`pieces/058-micro-tetris/` link, original gameplay/manual `"wip": false`, study
WIP and all other study decisions remain. Earlier `bitsy-blocks-wall` evidence
is superseded history without a new rejection; former Micro Tetris batch
proofs remain rejected history. No shared token, sidecar, asset dependency or
other film change is introduced.

Preview the [current Top of the Heap attract study](arcade/heap-test.html).
A fixed close-up shows exactly six already-present isometric cubes in rows
1+2+3, forming a 600px-wide summit. A plain yellow 232×106 flag flies on a
172px pole. The current game's smiling yellow sun has a 42px body and rays
reaching 59px; blue teardrop climbers replace the old spring characters.
There is no assembly, zoom, title or artwork text.

Two attacks climb the lower left and right routes toward row one. The sun takes
legal adjacent hops, lands on each climber at 2.95 and 6.75 seconds, squashes it,
repaints the lower path yellow and returns to the apex at 4.45 and 8.25.
The summit is never lost; all six blocks start and end gold. The loop lasts
10 seconds, with focus/reduced motion and the native fallback at 2.7 seconds.
Original **Top of the Heap** identity, gameplay, stable
`pieces/026-top-of-the-heap/` link and manual `"wip": false` remain; the new
study is WIP. The earlier twenty-row assembly/title film remains rejected
historical work. Shared player and other film details remain unchanged.

`node scripts/check-heap-attract.mjs` passes 1,200 samples for six blocks,
dominant flag, legal sun routes, two actual interceptions/squashes, ownership,
return, exact loop/seek, zero font text calls and statuses. Updated batch checks
pass 9,012 draws and shared playback passes. Native evidence in
`.impeccable/review/heap-summit/` includes the summit, still and both defenses,
with a 320×240 contact still. Native rendering covers 241 frames with exact
loop/seek pixels. No fresh browser layout or interaction verification is claimed.
No dependency, extra artwork copy, shared token or original-piece change follows.

The [eight-film batch overview](arcade/remaining-test.html) is rejected.
The user rejected all eight original batch films; Only Centipede, Happiness
Hunter and Many Frogs remain
unchanged rejected studies, and the overview has `"rejected": true`. The new Pac, Cloudcutter, Paddle, Bitsy Blocks and Heap
revisions above are WIP. Rejection takes precedence over any retained WIP
field and does not alter original Selected statuses or gameplay. The other
three sequence descriptions below are historical records of rejected films.

| Study / original work | Loop / focus still | Sequence |
| --- | --- | --- |
| [Only Centipede](arcade/centipede-test.html) | 20.4s / 16s | Macro chain pullback; defender fire removes a segment at 6s, adds a mushroom and splits the chain; luminous ONLY / CENTIPEDE. |
| [Happiness Hunter](arcade/happiness-test.html) | 21s / 17s | Close yellow car pulls back into gray traffic, makes three clear-gap lane changes and overtakes, then passes beneath a green HAPPINESS / HUNTER sign. |
| [Paddle — current film](arcade/paddle-test.html) | 20s / .8s | WIP refinement: letter-height cylinder spins; six whole glyphs crash into one line and squash into a solid oversized paddle, then rally and reverse formation. |
| [To Big for This World — current Pac film](arcade/pacman-test.html) | 14.8s / 2.2s | WIP revision: TO BIG / FOR THIS / WORLD above one dot row; small Pac feeds, looks back and fully escapes before the giant consumes the title, which returns. |
| [Cloudcutter — current film](arcade/cloudcutter-test.html) | 19.8s / 2.2s | WIP refinement: puffier CLOUD / CUTTER; smaller blue can with one centered barrel and one round in flight, then identical cloud healing. |
| [Top of the Heap — current film](arcade/heap-test.html) | 10s / 2.7s | WIP replacement: fixed six-block summit, large plain flag and smiling ray-sun intercepting two blue teardrop climbers; no artwork text. |
| [Many Frogs](arcade/frogs-test.html) | 22s / 18s | Sixteen pigment frogs cross moving traffic on reserved routes to the far bank; cars part for pigment MANY / FROGS. |
| [Bitsy Blocks — current film](arcade/tetris-test.html) | 22.2s / 6.5s | WIP refinement: 5× close crack/title/Tetris, with pullback beginning only when world-space blocks crumble, then a close-scale rebuild. |

`arcade/film-kit.js` shares geometry and title cells; each renderer owns its
scene, camera and pacing. Frogs routes are baked by
`scripts/build-frogs-attract-routes.mjs`, avoiding startup path searches.
Source palettes, characters and materials stay local. The films have no image
or font dependency and add no slogans, counters or other artwork copy.
Native 1200×900 still PNGs carry embedded origin and registry records. The
existing controller retains pause, focus/reduced-motion stills, hidden/player
suspension, offscreen release and resolution caps; the version helper covers
all new renderers, fallbacks, studies and the overview.

`node scripts/check-remaining-attracts.mjs` passes 9,012 draw samples at 60Hz,
841 highway samples and 500 frog-crossing windows, plus specific mechanics,
mechanics, deterministic state, wiring and WIP/rejection/manual-status checks, with
zero font text calls. Existing playback, Onward and Landgrab checks also pass.
Historical rejected-batch evidence in `.impeccable/review/remaining-attracts/` includes each
`key-contact.png`, title/scene captures and `title-overview.png`, covering
800×600, 1200×900 and 320×240. That original batch recorded 4,081 native frames at
24fps; its Pac/Cloudcutter/Paddle/Bitsy Blocks/Heap captures and earlier reviews do not describe the replacements. Browser host is
unavailable; these checks do not claim fresh browser layout or interaction
verification. Original pieces, previous films and shared gallery tokens remain.

`arcade/attract-player.js` shares all fifteen native renderers across landing
cards, original-wall links and individual studies, using each film’s duration
and still time. It
renders only visible films at 24fps; offscreen canvases shrink
to 1×1 and show the PNG fallback. Hidden, pause, and player-open states suspend
timing. Focus/reduced motion holds Asteroids at 11s, Snake at 9s, and Warlords at 18s; rendering caps DPR 1.5 and width 1400px.
The original wall’s shared pause controls all native films, while
`arcade/attract.js` excludes native-marked links. Landing uses a Pause/Play text button in the top navigation with a 44px target and an accessible name; Hypermedia Club links back to the gallery. The controller preserves
SVG content on `data-icon` buttons and retains text controls in standalone studies. Ordinary artwork links survive controller
failure. The static wall and individual studies retain all fifteen native PNG
fallbacks and ordinary work links without JavaScript. The dynamic landing
retains its Selected Games catalog link when JavaScript is unavailable.

The 1200×900 completed-title `arcade/assets/asteroids-attract.png` is 60,326 bytes,
with embedded origin metadata and a provenance-registry entry. It includes the
constant `0¢ TO PLAY`; Snakes and Warlords have no play
message. The current landing uses native films and PNG fallbacks for all fifteen
Selected Games, retaining the Selected-only game filter. Work names are no longer visible
beneath the screens: each of the fifteen links retains its actual title as an
accessible name, with empty image alt text to avoid duplicate announcements.

The current Games/About frame is explicitly monochrome: solid `#080808`
ground, `#f5f5f5` ink, `#a3a3a3` muted text and white focus/selection. Source
artwork and native films retain their full colors. No background patterns,
linoleum, glow, tubing or title pulse load on either page.

The real one-line **ARCADE** H1 uses self-hosted Bungee Regular 400; About
uses Bungee for Arcade only. Public Sans supplies Games/About navigation,
Hypermedia, existing prose and four modest H2 section names. Bungee's heavy
geometric signage is the local arcade-lettering authority, without copying a
proprietary logo. `arcade/assets/Bungee-Regular.ttf` is 118,996 bytes and ships
with `Bungee-OFL.txt` from the official Google Fonts repository. Public Sans is
variable 100–900, with that range declared in its font-face descriptor. Both
pages preload Bungee and require no external font service.

The user-requested ARCADE color-scale experiment is the sole title-only
exception to the neutral frame. A five-stop blue/mint/yellow/amber/pink
vertical gradient is clipped inside the real Games H1, repeats blue and moves
top→bottom→top over six seconds while brightness varies .82→1.08→.82. Frame,
Hypermedia Club/Games/About navigation, plain controls, About and source art
stay unchanged. No glow, shadow, font, geometry or copy changes are added.
CSS defaults paused; H1 visibility, document hidden state, reduced motion and
the shared pause button gate animation. Reduced motion is a static middle
fill, forced colors uses CanvasText, and unsupported clipping stays white.
Current authority/evidence is `.impeccable/surfaces/issues-arcade-spectrum.md`
and `.impeccable/review/arcade-spectrum/`: nine parent-inspected cool/warm/
reduced captures at 1440/390/320 and checks for pause/resume, settled timing,
offscreen suspension, reduced still and stable title bounds pass without
errors. Forced-color fallback is verified as CanvasText with no
gradient/animation. Minimum sampled contrast is 4.86:1 on black at brightness
.82. The detector’s two gradient-text warnings in index/CSS are the intentional
user-requested title exception, scoped to those two files with evidence; no
second scan. Fresh finish review returned **ship** after all nine captures, source and
checks/fallback/detector evidence were reviewed, with no material fixes
(`finish-review.md`).

Use these requested names for feedback: Title for the masthead, Opening
(`#opening`) for the first three works, Side Scroll (`#side-scroll`) for the
horizontal crossing, Counterflow (`#counterflow`) for desktop opposed lanes /
large staggered mobile works, and Grid (`#grid`) for the final four works.
The four actual H2 headings name regions outside artwork frames. Work names
remain accessible link names without visible work captions. Their measured
heading heights participate in pinned runways, progress origins and keyboard
focus mapping.

Games now uses a full-width normal-flow technical machine profile. The user
explicitly rejected the fixed cabinet simulation, joystick/deck, coin panel
and locked scroll display. The browser window is the only scroll root;
`#works` is relative, overflow-visible and auto height. The real Bungee ARCADE
titleboard scrolls away naturally with the page. The separate back arrow and icon toolbar are removed. Hypermedia Club returns to the gallery, and a 44px Pause/Play text control sits in the Games top bar.

Section names are now accessibility labels only; Opening, Side Scroll and Counterflow have no visible headings or heading spacer. Stable section anchors remain.

The side-board edges and bezel rails share one centered 1px stroke; collection and footer reserve transparent borders rather than drawing duplicate offset lines. The screen frame closes with a bottom bezel rail. Below it, a white-line coin collector schematic sits left of the Hypermedia Club / Games / About footer menu. A full-width stepped base with two feet closes the cabinet. This is a decorative SVG front elevation; it adds no physical controls or internal scroll pane.

The current Opening / Side Scroll / Counterflow sequence keeps
3/2/10 works and all fifteen native films. Grid’s four screens have moved into Counterflow, giving five works per opposing desktop lane; mobile keeps its ordinary flow. Window vw/svh dimensions and
scroll/progress/focus math are restored; there is no container viewport,
wheel forwarding, ResizeObserver, fixed-height root or cqw/cqh sizing. Side
Scroll holds, taller Counterflow, Grid, native touch/keyboard flow and reduced
motion remain; the shared overlap returns to
`clamp(-260px,-24svh,-120px)`. About is independent and unchanged.

Current authority is `.impeccable/surfaces/issues-arcade-profile.md`. The
supplied JAMMA drawing now informs an inset marquee face/housing, a separate
black underside sloping into the bezel, a distinct closed rectangular bezel-top rail and
full-height side-board faces. Side boards are 3.4% wide with 1.5px inner/outer
lines; face and primary frame joins use 1px lines; the underside return-joint stays
.5px. The former separate bezel lip is removed.
The collection shares the side-board inset and inner bezel line while the
machine remains edge-to-edge and normally scrollable. Pre-corner joinery
evidence in `.impeccable/review/arcade-joinery/` includes eight inspected
captures and seven-view checks: full width, contiguous frame joins, native
window scroll/no nested pane, all fifteen links, preserved groups/motion,
reduced restoration and touch/Back pass without errors. Fresh finish review
returned **ship** after all eight captures, source and checks were reviewed,
with no material fixes (`finish-review.md`);
the earlier eight-capture profile review covers only the outline pass.
The current corner correction uses one closed rectangular rail path
(`M0 0H1000V24H0Z`) in place of the two open chamfer/lip paths, fixing both
mirrored joins while dimensions, native scroll and artwork remain unchanged.
Seven inspected PNGs and `checks.json` in
`.impeccable/review/arcade-corner/` confirm joints within .1px and aligned
side-board/collection edges with normal full-width flow and no page errors.
Fresh corner finish review returned **ship** after all seven captures and
source/checks were reviewed, with no material fixes (`finish-review.md`).

The rejected cabinet experiment and its old technical ship review remain
historical, with supersession recorded in
`.impeccable/review/arcade-cabinet/superseded.md`. They do not authorize
restoring a locked internal display or rejected furniture.

Counterflow above 700px now gives its opposed lanes the full available width,
with a narrower `clamp(20px,4vw,72px)` gap and full-width lane contents. Removing
the former 1240px container / 50svh lane caps makes the native-ratio screens
taller without cropping or stretching. Its desktop travel multiplier rises
from 1.1 to 1.65. In the preceding four-work revision at 1440×1000, cards grew from 490px to
619px wide, travel
from 702px to 1426px and total zone height from 1736px to 2460px. At 768×900,
travel grows from 396px to 627px. That four-work mobile revision at 700px and below was unchanged:
the 390×844 zone remained 1410px tall. Grid and the other regions are preserved.

That size/pacing revision is documented in
`.impeccable/surfaces/issues-arcade-counterflow-taller.md`; `before.json`,
`after.json` and `checks.json` in
`.impeccable/review/arcade-counterflow-taller/` record the geometry changes and
seven-view checks for all fifteen keyboard targets, preserved Side Scroll and
reveal, reduced-motion restoration, normal Grid and touch launch/Back without
page errors. The pre-edit B detector reports zero findings. Parent inspected
all seven responsive captures, including the 1800×600 short viewport and Grid
entry. Fresh finish review returned **ship** after all seven captures plus
source/checks were reviewed, with no material fixes (see `finish-review.md`); prior verdicts remain scoped to
their recorded revisions.

Side Scroll now keeps only its first two works: `038-many-frogs` and
`059-moon-orchard`. Both screens use Moon Patrol’s larger dimensions: desktop `min(76vw,112svh,1100px)`, mobile `min(90vw,100svh)`, preserving native 4:3 media and the second screen’s vertical offset. Mutual Command and Happiness Hunter move to the start of
Counterflow, followed by `016-up-mario`, `013-paddle`, `058-micro-tetris` and
`006-only-centipede`. Counterflow retains its name and has three works per
desktop lane / six in mobile ordinary flow. All fifteen works keep their
overall DOM order; Grid, native ratios and size/travel functions are unchanged.
The six-work zone remeasures naturally, so the preceding four-work height and
travel figures are historical. Current grouping is recorded in
`.impeccable/surfaces/issues-arcade-regroup.md` and
`.impeccable/review/arcade-regroup/checks.json`: seven viewports, exact 2/6
memberships, all fifteen keyboard targets, Side Scroll holds/reversal, reveal,
reduced restoration, Grid and touch launch/Back pass without page errors.
Parent inspected all six captures: two Side Scroll holds and three Counterflow
positions at 1440px, plus mobile Counterflow at 390px. Fresh finish review
returned **ship** after all six captures, source arrays and checks were
reviewed, with no material fixes; see that folder’s `finish-review.md`.

The user explicitly promoted Many Frogs (requested as Frogger), Always Moving
Up, Micro Tetris, and Lunar Founder (requested as Moon Patrol), raising the
Selected Games count from eleven to fifteen. Their existing public names stay
unchanged. Only their `"wip": false` status promotes them; their existing
thumbnails preview the newly included works without adding films. Original
wall/player behavior, original works, shared film controller, global tokens,
issue WIP and study WIP statuses remain intact.

Current local style authority is
`.impeccable/surfaces/issues-arcade-monochrome.md`. Evidence in
`.impeccable/review/arcade-monochrome/` records the preceding frame revision: real Bungee, solid grounds, no
pattern requests/shadows and exact names/IDs at 1440/390/320/700px, with fifteen
works and no page errors. Six-viewport functional checks pass holds, reversal,
centered arrivals, shared reveal, all fifteen keyboard targets, reduced-motion
restoration and touch launch/Back. Loaded and blocked-font fallback titles
fit at 320px. Parent inspected all 23 captures; two reduced captures were
recaptured after lazy assets loaded (harness correction only). The final type
detector returned zero findings. Fresh finish review returned **ship** after inspecting all 23 captures plus
source/diff and evidence, with no material fixes; see `finish-review.md` in
that folder.
Independent pre-edit typography assessment supports the Bungee/Public Sans
roles; the second type-only detector reported zero findings. Bungee is
explicitly declared in DESIGN.md and matching sidecar metadata.

The later Grid refinement is documented in
`.impeccable/surfaces/issues-arcade-grid.md`. Four parent-inspected captures in
`.impeccable/review/arcade-grid/` show the desktop two-column / mobile
one-column layout; the wide capture uses 1440×1600 to include the whole grid.
`checks.json` passes all six sizes, normal flow without overlap, all fifteen
keyboard targets, preserved Side Scroll holds/reversal/centering and reveal,
reduced-motion restoration and Grid touch launch/Back, without page errors.
The pre-edit B detector and active hooks reported no new findings. Fresh
finish review returned **ship** after all four captures plus source/checks were
reviewed, with no material fixes; see that folder’s `finish-review.md`. Earlier ship reviews describe their recorded revisions. The other zones, frame, About,
native links/films and manual statuses remain unchanged.

Earlier neon, original floor, lowered carpet and motion-phrasing reviews
remain historical in `.impeccable/review/arcade-neon-no-box/`,
`.impeccable/review/arcade-patterns/`,
`.impeccable/review/arcade-carpet-lowered/` and
`.impeccable/review/arcade-motion-phrasing/`. The motion choreography carries
forward, with section-heading offsets; those prior ship verdicts do not
approve this style replacement. The four original SVG patterns, linoleum and
`node scripts/build-arcade-patterns.mjs` remain unused historical materials.
No generation/build step is needed to view the current static site.

Historical record of the former three-native-film integration follows. Its
twelve raw foreground films have since been replaced; the implementation details
and rejected visual history are retained here:

`arcade/index.html` presents fifteen Games works: the three native films
above plus twelve remaining raw illustrated attract films. Oversized
Permanent Marker brush lettering sits above an asymmetrical
twelve-column bank of differently sized 4:3 screens. Each remaining raw film contains three
abrupt authored states: an original full-bleed illustrated plate, a magnified
crop with overprinted title lettering, and a cut-up panorama, vertical splice,
or punched-strip edit. Coarse ink, bold integrated titles, strange humor, black
voids, and clashing color replace the earlier clean geometric title films.
The supplied Deluxx Fluxx images informed the energy; their characters, logos,
lettering, and compositions are not copied. These are canvas-composited title
films; real gameplay begins only after entry into the player.

The surrounding room stays seedy and dark: mottled charcoal walls,
tobacco-toned background print, warm brush lettering, and pale lime controls.
The wall texture also repeats inside the ARCADE wordmark. Foreground plates and
canvases keep their full ink colors without saturation or brightness filters;
inset edge falloff and restrained palette-derived spill seat the screens in
the room. The old printed posters remain desaturated, slower background debris.
The interactive slot sits near the bottom of the wall, at 94% of its height.
The player shares the worn dark surround and retains its minimal flat structure.

The twelve raw films advance through discrete timed cuts, holding their three states for
1800, 1050, and 1450 milliseconds. Moving a mouse across a panel scrubs
its three frames; keyboard focus holds frame zero. The square pause/play control
stops or resumes timed cycling. System reduced motion keeps static frame zero
and disables automatic playback and scrubbing. Films stop cycling while the
player is open or the document is hidden. Offscreen panels release their canvas
and show the raw JPG plate; only nearby films allocate drawing surfaces.
Reduced motion also freezes scenery, removes selector return transitions, and
omits coin flight.

Each film is a direct link to its original piece. With native-dialog JavaScript
enhancement, activation opens the real artwork in a flat, minimal player. The
surround includes a return arrow, a link to open the original work separately,
previous/next controls, a draggable pale lime selector dot, a surprise control, and
optional sound. There are no neon frames, cabinet bevels, or simulated CRT
housing. Horizontal selector dragging chooses by direction; vertical dragging
or clicking selects a surprise. Click the quarter or drag it to the background
slot to draw a surprise. The draw bag favors unvisited works and exhausts its
candidates before repeating.

Small dots record local visits, with a larger dot for the last work played.
These traces are activity, not ratings or Selected status, and never alter work
metadata. Optional synthesized sound begins off and shares its setting between
the issue and player. Sound suspends while the document is hidden.

Controls have accessible names and keyboard focus. The native dialog contains
focus; Escape and the visible return arrow close it. The `#play=slug` address
supports sharing and browser Back/Forward. Same-origin artwork Escape is relayed
to the player; when a file-origin browser isolates the frame, use the visible
return arrow. Closing restores issue focus and scroll; closing a deep link
returns to its film. Each work switch replaces the previous iframe so the old
artwork stops running. With JavaScript disabled or native dialog unavailable,
native PNG fallbacks and ordinary work links remain usable; enhanced controls stay
absent or disabled.

`arcade/attract-art.js` owns plate loading, the three-state collage edits, title
lettering, and individual film colors. `arcade/attract.js` handles timing, scrubbing, pause, reduced motion,
visibility, and canvas lifecycle. `arcade/arcade.js` handles background scenery;
`arcade/cabinet.js` retains player, selection, history, focus, and sound behavior.
`arcade/arcade.css` defines the flat local interface. Physical-sounding CSS and
JavaScript names are retained implementation hooks, not a visible cabinet style.
The master gallery remains the white, Georgia, blue-link catalog. The former
quiet Issues cover is historical; the current separate landing uses its
local neon heading and dark linoleum pattern.

The ordered collection in `arcade/meta.json` includes every piece whose metadata
had `"category": "games"` on November 3, 2026. It records work slugs and film
keys; the linked panels follow that order. Membership is an explicit editable
snapshot, not a live filter that rearranges the composition. Arcade remains WIP;
issue membership never changes an individual work’s status or original content.

At that historical three-film stage, twelve `arcade/assets/raw/*.jpg` files served
as state zero and no-JavaScript fallbacks. All fifteen foreground fallbacks are
now native title PNGs; the raw plates remain retained historical material.
Of all fifteen retained plates, fourteen are newly generated original game-inspired
illustrations. Many Mario is an original code-authored photostat collage using
its own `pieces/016-up-mario/thumbnail.jpg`: independent crops, duotone pixel
mapping, Rubik Dirt titles, and grain from the issue’s recorded wall texture.
Its source lives in `arcade/assets/source/mario.html`. The former geometric
`assets/attract/` PNG fallbacks are removed.

Each shipping raster has embedded provenance and an entry in
`arcade/assets/prompts.json`. The earlier fourteen generated poster JPEGs,
authored Many Mario geometric print, generated transparent slot prop, and
generated dark `wall-wear.jpg` texture retain their original records. The
current registry contains fifty shipping rasters: fifteen retained historical raw
plates, fifteen background prints, the slot, the wall texture, fifteen native
film PNG fallbacks and the three source-cloud copies used by Onward & Upward.

Bangers, Rubik Dirt, and Permanent Marker are uppercase-subset WOFF2 additions
for expressive film lettering; Permanent Marker also draws the wordmark.
Anybody remains the player-title face and Public Sans the utility face. All
five families and their licenses are self-hosted. Nothing loads from an
external font service.

## Future issues

Add a sibling folder with its own `index.html`, `meta.json`, and local assets,
then link it from `Issues/index.html`. Each issue can have its own visual
language. Keep metadata and collection membership explicit and keep navigation
link-based. New issues and compositions start with `"wip": true`; absent status
fields also mean WIP. Only an explicit user decision promotes a work, represented
by `"wip": false`. Preserve explicit `"rejected": true`, which takes precedence.
Completion, quality, ratings, import, and local visits do not infer promotion.
