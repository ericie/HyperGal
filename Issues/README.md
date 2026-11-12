# Issues

Thematic collections of existing Hypermedia Club works. The current `index.html`
is the Arcade landing page; `arcade/index.html` is the original
fifteen-work wall. Open either directly or follow **Issues** from the master
gallery. No server, build step, CDN, or package installation is required.

## Arcade

Current direction status: the user rejected the street-art/comic/photostat
foreground described below and a later glossy 3D exploration, which was not
applied. Twelve wall films still use that raw foreground. The user has now
approved placing the Asteroids native film on the current landing card and the
first original-wall link to review it in context. Snake Pit now extends that
native direction on both entry surfaces with the local chase-and-reveal film
below. Warlords adds the requested four-turret firing tour and public rename
on both entry surfaces. The remaining films have not been redesigned; these
placements do not promote composition status. All three studies stay WIP, and the
original Asteroids, Snake Pit, and Warlords works retain their manual `"wip": false`. The supplied GIF references
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
Asteroids, Snake Pit, and Warlords are placed on both entry surfaces; further film redesigns
wait for direction.

Preview the [Snake Pit attract study](arcade/snake-test.html). Its 22-second
native loop begins with a first-person snake hunting a coral pixel mouse across
a dim blue grid, amid cyan and acid-green right-angle light-cycle trails. From
6–12 seconds the camera climbs and turns continuously; the same world-coordinate
snake paths flatten into the exact requested **SNAKES!**, with heads and tiny
eyes. The overhead word holds until 19.5 seconds, then the camera returns into
the next chase. Flat wireframe ribbon walls recede through the pullback; there
is no replacement title scene. **0¢ TO PLAY** remains stationary below the field.
This is a local classic Atari/vector extension, with no new fonts, shared tokens,
or gallery identity change. The renderer is 8,116 bytes; HTML plus renderer is
10,130 bytes; renderer plus the shared controller is 11,596 bytes. Its native 1200×900 completed-word fallback at 15 seconds is
`arcade/assets/snake-attract.png` (61,273 bytes), with embedded provenance and a
registry entry. That PNG and the ordinary original-work link remain usable in
the standalone study without JavaScript. The study starts with `"wip": true`;
the original Snake Pit game and its manual `"wip": false` remain unchanged.

Preview the [Warlords attract study](arcade/warlords-test.html). Its 24-second
native loop uses the original four flat colored cannons, curved planet caps,
star field, and ammunition marks. The camera stays at 2.8× through the firing
close-ups in north/east/south/west order: pink, orange, mint, then blue. Each
3.6-second dwell fires seven shots with recoil and color-matched projectiles
toward the opposite edge; 280ms pans connect the close-ups. At 15.4 seconds,
the scene cuts to **WARLORDS** alone on black, with 201-unit cap height and a
brief impact scale. At 19.8 seconds its actual strokes explode into 126
ballistic, tumbling fragments, culled offscreen and all gone by 21.5 seconds.
Only the first close-up returns at 23.4–24 seconds; no four-gun overview appears
anywhere. **0¢ TO PLAY** stays stationary below the field. The renderer is
8,698 bytes; study HTML plus renderer is 10,694 bytes, and renderer plus shared
controller is 12,178 bytes. Its native 1200×900
`arcade/assets/warlords-attract.png` fallback shows the completed word alone at
18 seconds and is 40,523 bytes, with embedded provenance and an updated registry
entry. The standalone study and
original wall keep that PNG and ordinary work link without JavaScript. The
study starts with `"wip": true`; the original work retains its manual
`"wip": false` and unchanged gameplay. Its public title is now Warlords while
`pieces/005-only-invaders/` remains the stable link. Browser and accessible
names, manifest metadata, and README alias follow the rename. A fresh native-game
900×900 JPG thumbnail (39,459 bytes) replaces the old lettered image and embeds
its provenance; historical prompts and rejected background images retain their
original names. No visible title is added inside the original game, and no
shared font, palette, token, or gallery identity changes.

`arcade/attract-player.js` is 3,480 bytes and shares the Asteroids, Snake, and Warlords renderers across their landing
cards and original-wall links, using each film’s duration and still time. It
renders only visible films at 24fps; offscreen canvases shrink
to 1×1 and show the PNG fallback. Hidden, pause, and player-open states suspend
timing. Focus/reduced motion holds Asteroids at 11s, Snake at 15s, and Warlords at 18s; rendering caps DPR 1.5 and width 1400px.
The original wall’s shared pause controls both native and raw films, while
`arcade/attract.js` excludes native-marked links. Landing uses 44px back and pause
icon buttons outside artwork, with accessible names. The controller preserves
SVG content on `data-icon` buttons and retains text controls in standalone studies. Ordinary artwork links survive controller
failure. The original wall also retains all three native PNG links without JavaScript; the
current landing keeps its existing noscript link to the Selected Games catalog.

The 1200×900 completed-title `arcade/assets/asteroids-attract.png` is 60,326 bytes,
with embedded origin metadata and a provenance-registry entry. It includes the
constant `0¢ TO PLAY`. Current-landing cards other than Asteroids, Snake Pit, and Warlords keep their original thumbnails
and existing Selected-only game filter. The landing now shows only the requested
Arcade heading in local Anybody (650) with pink neon stroke/shadows, actual work
names, and essential controls. The top metadata band, promotional/editorial copy,
counts, section heading, closing copy, footer, and decorative numbers are removed
without reserving blank space. A small native `arcade/assets/linoleum.svg` supplies
the dark-on-dark patterned ground; it adds no raster registry entry. Public Sans
remains the utility face. Dark skip-link text stays readable on lime during hover.
This local cleanup changes no shared tokens, original works, or composition status.
Do not invent promotional/editorial copy for gallery or issue interfaces.
The brief is `.impeccable/surfaces/issues-landing-strip-copy.md`; desktop, mobile,
and small captures plus `checks.json` are in `.impeccable/review/landing-strip-copy/`.

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
Snake Pit, and Warlords completed-title PNGs.

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
