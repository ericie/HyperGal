# Issues

Thematic collections of existing Hypermedia Club works. Open `index.html`
directly or follow **Issues** from the master gallery. No server, build step,
CDN, or package installation is required.

## Arcade

Current direction status: the user rejected the street-art/comic/photostat
foreground described below and a later glossy 3D exploration, which was not
applied. The main fifteen-film collection still exists in that raw form; it has
not been replaced or approved. The next step is one representative WIP test,
awaiting user feedback before a collection-wide redo. The supplied GIF references
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
and asteroid chunks leave the frame, intentionally producing a quiet blank
field by 16.3 seconds. Background asteroids gradually return from 18.5 seconds
through the loop boundary. The words’ geometry, motion, and existing tiny
assembly accents remain unchanged. There is no spaceship or shot sequence.
Its HTML and JavaScript total 14,672 bytes,
with no animation rasters or video; reused scenery and the existing Public Sans
font are additional assets. A 24fps timer runs only while active, with pause,
focus, reduced motion, and hidden-document suspension. Focus and reduced motion
hold the completed title at eleven seconds. The whole screen links to the
original Vectrex Asteroids work. The wall and three old raw images remain as
permitted dim background posters. No new fonts or shared tokens are introduced.
The test metadata starts with `"wip": true`; original piece content and status
remain unchanged. Longer loops within reasonable byte budgets are permitted;
further rollout waits for feedback.

The following describes the existing collection implementation, including its
rejected foreground:

`arcade/index.html` presents all fifteen Games works as raw illustrated attract
films. Oversized Permanent Marker brush lettering sits above an asymmetrical
twelve-column bank of differently sized 4:3 screens. Each screen contains three
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

Films advance through discrete timed cuts, holding their three states for
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
The master gallery and the page surrounding the Issues cover remain the white,
Georgia, blue-link catalog. The issue cover previews upright first-frame films.

The ordered collection in `arcade/meta.json` includes every piece whose metadata
had `"category": "games"` on November 3, 2026. It records work slugs and film
keys; the linked panels follow that order. Membership is an explicit editable
snapshot, not a live filter that rearranges the composition. Arcade remains WIP;
issue membership never changes an individual work’s status or original content.

All fifteen `arcade/assets/raw/*.jpg` files are both state zero and the
no-JavaScript fallback. Fourteen are newly generated original game-inspired
illustrations. Many Mario is an original code-authored photostat collage using
its own `pieces/016-up-mario/thumbnail.jpg`: independent crops, duotone pixel
mapping, Rubik Dirt titles, and grain from the issue’s recorded wall texture.
Its source lives in `arcade/assets/source/mario.html`. The former geometric
`assets/attract/` PNG fallbacks are removed.

Each shipping raster has embedded provenance and an entry in
`arcade/assets/prompts.json`. The earlier fourteen generated poster JPEGs,
authored Many Mario geometric print, generated transparent slot prop, and
generated dark `wall-wear.jpg` texture retain their original records. The
registry contains thirty-two shipping rasters: fifteen raw plates, fifteen
background prints, the slot, and the wall texture.

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
