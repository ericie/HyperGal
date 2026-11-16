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

Both pages have a right-aligned top navigation with [Games](index.html) and
[About](about.html), marking the current page. The About page's four
paragraphs explain the user-supplied concept: start with influential games and
ask “What if?”, change their rules to explore underlying systems through
satire, and make works that can be both played and watched. The final paragraph
connects the user's earlier interactive art and arcade projects to Hypermedia
Club, a current solo venture with AI agents as thought and coding partners.
It makes no claim about collaboration or AI use in the earlier work. Hypermedia Arcade
remains the provisional page name, with Arcade dominant in the heading.
The latest navigation revision removes the Hypermedia title and About's former
Arcade navigation link. Page headings, About copy, layout, original works and
manual statuses remain unchanged.

## Arcade

Current direction status: the user rejected the street-art/comic/photostat
foreground described below and a later glossy 3D exploration, which was not
applied. Twelve wall films still use that raw foreground. The user has now
approved placing the Asteroids native film on the current landing card and the
first original-wall link to review it in context. We're All Snakes now extends that
native direction on both entry surfaces with the local cursor-hunt and moving-title film
below. Warlords adds the requested four-turret firing tour and public rename
on both entry surfaces. The remaining films have not been redesigned; these
placements do not promote composition status. All three studies stay WIP, and the
original Asteroids, We're All Snakes, and Warlords works retain their manual `"wip": false`. The supplied GIF references
are now clarified toward classic Atari attract screens; only still previews
were available, so their motion has not been inspected.

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
Asteroids, We're All Snakes, and Warlords are placed on both entry surfaces; further film redesigns
wait for direction.

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
link remain. The corrected film builds eight broad structures in two rows:
terraces, a residential slab, linked civic towers, a stepped observatory, a
hangar, glazed atrium, sawtooth workshop and offset offices. Their separated
62–82px footprints, foundations, roof caps, dark side faces, floor bands and
regular window grids replace the rejected thin crowded architecture. Orange,
cyan, magenta and yellow facades retain the original black sky, cyan/blue
mountains, green hills and peach road. Steel frames precede facade construction;
floors rise in six-pixel steps under two working cranes. The attract contains
no rover, debris, sparks, explosions, projectiles or combat. The original game
retains its crash/rebirth behavior and manual `"wip": false`; the study remains WIP.

The 23.4-second loop starts construction at .2 seconds; all eight buildings
finish by 11.7. Cranes work through 13.7. The hangar finishes at 4.8 and opens
at 6–6.8, without producing a rover. **LUNAR** above **LANDGRAB** assembles at
14.8–16.17, then holds above the finished city. Camera travel at 19.4–23.4
brings in a fresh construction site and returns to the exact opening pixels.
The native 400×300 buffer scales without smoothing. Focus/reduced motion and
the provenance-recorded 1200×900 fallback hold the city/title at 18 seconds.
Shared playback, direct links, suspension, resolution limits and content hashes
remain; no font, image dependency or extra artwork copy is added.

`node scripts/check-landgrab-attract.mjs` passes 2,809 time samples and 4,174
construction samples for eight distinct profiles, broad separated footprints,
monotonic floors, doors/cranes, absence of destruction, title, exact loop,
wiring, current name and statuses. Current native evidence is
`.impeccable/review/lunar-landgrab-construction/`, including early/late
construction, full title and a contact sheet with a 320×240 still. The older
`lunar-landgrab-native` captures record rejected architecture. Browser host is
unavailable; no fresh browser layout or interaction pass is claimed. Shared
gallery tokens and the original game remain unchanged by this correction.

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

`arcade/attract-player.js` is 3,480 bytes and shares the Asteroids, Snake, and Warlords renderers across their landing
cards and original-wall links, using each film’s duration and still time. It
renders only visible films at 24fps; offscreen canvases shrink
to 1×1 and show the PNG fallback. Hidden, pause, and player-open states suspend
timing. Focus/reduced motion holds Asteroids at 11s, Snake at 9s, and Warlords at 18s; rendering caps DPR 1.5 and width 1400px.
The original wall’s shared pause controls both native and raw films, while
`arcade/attract.js` excludes native-marked links. Landing uses 44px back and pause
icon buttons outside artwork, with accessible names. The controller preserves
SVG content on `data-icon` buttons and retains text controls in standalone studies. Ordinary artwork links survive controller
failure. The original wall also retains all three native PNG links without JavaScript; the
current landing keeps its existing noscript link to the Selected Games catalog.

The 1200×900 completed-title `arcade/assets/asteroids-attract.png` is 60,326 bytes,
with embedded origin metadata and a provenance-registry entry. It includes the
constant `0¢ TO PLAY`; Snakes and Warlords have no play
message. The current landing retains four native films (Asteroids, We're All
Snakes, Warlords and Mutual Command), original thumbnails for the remaining
works, and the Selected-only game filter. Work names are no longer visible
beneath the screens: each of the fifteen links retains its actual title as an
accessible name, with empty image alt text to avoid duplicate announcements.

The requested uppercase **ARCADE** lettering retains six authored SVG glyph
paths with A/R hairpin-return strokes, without a surrounding rim or box.
Cyan gas (#73fbff) and a pale hot core (#e4ffff) sit over dark glass (#16464b),
with ambient cyan emission and a tighter bloom. This is custom stroke geometry
with no font outlines, raster assets, cursive joins or swashes. The responsive
`52 50 1020 250` viewBox is bounded at 1180px. The H1 remains named Arcade;
the SVG is accessibility-hidden and nonfocusable. A single emission group
pulses smoothly from .4 to 1 and back over 3.2 seconds, reaching full strength
at the midpoint without flashing. The shared
pause button, hidden document, reduced motion and fully dimmed sign suspend
this pulse; reduced motion holds full-strength emission.

The entrance stays sticky at the viewport top on layer zero. Screens occupy
layer one and scroll over it. Passive scroll updates are coalesced through
`requestAnimationFrame`; smoothstep progress over .9 entrance height dims the
sign from full opacity to 0, reversing when scrolling back. Reduced motion
retains this scroll-linked relationship. The top metadata band, promotional
copy, counts, section heading, closing copy, footer and decorative numbers
remain removed without reserving blank space. The Games page now uses four
original static SVG floors: `blacklight-carpet.svg` behind the title/entry,
`violet-ribbons.svg` in crossing, `woven-checks.svg` in counterflow and
`plum-studs.svg` in the deck, all under `arcade/assets/`. The supplied
blacklight-carpet photo informs the entrance colors and geometry only; no
photographed pixels, people or shoes are reproduced. About and future
extra-work zones retain `arcade/assets/linoleum.svg`. Public Sans remains the
utility face; skip-link hover stays readable on lime. Do not invent
promotional/editorial interface copy.

`node scripts/build-arcade-patterns.mjs` optionally regenerates these four
original SVGs from seeded geometry and seamless edge copies. They total
98,496 bytes (26,678 gzip). This is a development utility: viewing the static
site needs no generation or build step, new runtime dependency, raster asset
or raster provenance-registry entry. Later zone backgrounds sit behind the
screens, ignore pointer events and cover the measured runways plus half the
inter-zone gaps. Reduced motion keeps the distinct floors full-width across
mobile gutters without adding animation.

Borderless sharp screens sit directly on the zone floors, with no card housing,
inset borders, marquee bands, arrows, shadows, internal padding or visible
work-name captions. Fifteen Selected Games now form four scroll zones: an
asymmetric twelve-column entry with shallow parallax; a viewport-sticky
horizontal crossing; two vertical lanes moving in opposite directions; and a
sticky deck that peels screens upward while changing their scale. Native
vertical scrolling drives measured runways, with passive scroll updates through
requestAnimationFrame and reversible transforms. No wheel or touch interception
is added. Static thumbnails use square, portrait 3:4, landscape 3:2 and wide
16:9 crops; all four native films retain undistorted 4:3 frames. Below 700px,
14px gutters and adapted widths preserve the distinct zones. Keyboard focus
reveals each screen; reduced motion presents all fifteen links in ordinary
flow and holds films still. Future Selected Games outside the authored zones
append in ordinary flow. Utility controls retain frameless 44px targets and
visible keyboard focus.

The user explicitly promoted Many Frogs (requested as Frogger), Always Moving
Up, Micro Tetris, and Lunar Founder (requested as Moon Patrol), raising the
Selected Games count from eleven to fifteen. Their existing public names stay
unchanged. Only their `"wip": false` status promotes them; their existing
thumbnails preview the newly included works without adding films. Original
wall/player behavior, original works, shared film controller, global tokens,
issue WIP and study WIP statuses remain intact.

The current floor-material brief is
`.impeccable/surfaces/issues-arcade-floor-patterns.md`. Evidence in
`.impeccable/review/arcade-patterns/` includes ten current captures and two
before captures. `checks.json` and `keyboard.json` record distinct loaded
floors, fifteen links, six current native films, four zones, Games/About
isolation, no overflow or browser/network errors and all fifteen keyboard
destinations visible and unobstructed at 1440/390px. Small-screen captures
include the 320px title and reduced-motion crossing. The fresh floor-pattern
finish review returned **ship** after inspecting all ten current captures,
with no material fixes; its scoped verdict is in `review.md` in that folder.

The preceding scroll-zone brief is
`.impeccable/surfaces/issues-arcade-scroll-zones.md`; the lettering and copy
constraints remain in `.impeccable/surfaces/issues-landing-strip-copy.md`.
`.impeccable/review/arcade-scroll-zones/checks.json` verifies fifteen links,
four zones, visible keyboard targets at 1440/768/390/320px, reversible horizontal
travel, opposing lanes, reduced-motion flattening and restoration, and mobile
touch launch/Back scroll restoration, without browser errors. Inspection data
and desktop/mobile/small start, middle and end captures are in the same folder.
Fresh finish review returned ship after inspecting all 33 normal-motion captures and four reduced-motion captures, with no material fixes. Earlier copy cleanup, cursive sign, unhoused
screens and neon revisions remain historical in
`.impeccable/review/landing-strip-copy/`,
`.impeccable/review/arcade-cursive-neon/`,
`.impeccable/review/arcade-unhoused/`,
`.impeccable/review/arcade-neon-scroll/` and
`.impeccable/review/arcade-neon-no-box/`; their ship reviews describe those
revisions.

The following describes the original collection implementation, including the
twelve remaining rejected raw foreground films:

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
raw JPG plates and ordinary work links remain usable; enhanced controls stay
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

Twelve `arcade/assets/raw/*.jpg` files remain both state zero and their
no-JavaScript fallback. The retained Asteroids, Snake, and Warlords raw plates no longer
drive their foregrounds; the native completed-title PNGs replace those fallbacks.
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
registry contains thirty-five shipping rasters: fifteen retained raw plates,
fifteen background prints, the slot, the wall texture, and the native Asteroids,
We're All Snakes, and Warlords completed-title PNGs.

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
