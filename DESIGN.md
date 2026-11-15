---
name: Hypermedia Club
description: A quiet artwork catalog with independently art-directed themed issues.
colors:
  catalog-blue: "#0000ee"
  catalog-visited: "#551a8b"
  catalog-ink: "#111"
  catalog-paper: "#fff"
  catalog-thumbnail: "#f0f0f0"
  catalog-muted: "#555"
  catalog-date-label: "#767676"
  catalog-tag-border: "#8a8a8a"
  catalog-divider: "#ececec"
  catalog-nav-ground: "#000"
  catalog-nav-muted: "#bbb"
  catalog-nav-border: "#767676"
  catalog-nav-accent: "#a8c7ff"
  arcade-ground: "#101211"
  arcade-paper: "#d8cbb2"
  arcade-ink: "#e3d7bf"
  arcade-control-ink: "#11140e"
  arcade-signal: "#c9dc64"
  arcade-acid: "#c9dc64"
  arcade-border: "#8d8269"
  arcade-scrollbar: "#776e59"
  arcade-screen: "#000"
typography:
  catalog-display:
    fontFamily: 'Georgia, "Times New Roman", Times, serif'
    fontSize: "1.3125rem"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-.015em"
  catalog-controls:
    fontFamily: 'Georgia, "Times New Roman", Times, serif'
    fontSize: ".875rem"
    lineHeight: 1.55
  catalog-control-label:
    fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    fontSize: ".625rem"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: ".08em"
  catalog-dates:
    fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    fontSize: ".625rem"
  catalog-title:
    fontFamily: 'Georgia, "Times New Roman", Times, serif'
    fontSize: "clamp(1.05rem, 1.5vw, 1.28rem)"
    lineHeight: 1.3
  catalog-status:
    fontFamily: 'system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: ".66em"
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: ".08em"
  issues-display:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "clamp(2rem, 5.5vw, 3.1rem)"
    lineHeight: 1.02
    letterSpacing: "-.015em"
  issues-cover-title:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "1.5rem"
  arcade-display:
    fontFamily: '"Permanent Marker", cursive'
    fontSize: "268px"
  arcade-film-marker:
    fontFamily: '"Permanent Marker"'
    fontSize: "100px"
  arcade-film-bangers:
    fontFamily: 'Bangers'
    fontSize: "100px"
  arcade-film-dirt:
    fontFamily: '"Rubik Dirt"'
    fontSize: "100px"
  arcade-navigation:
    fontFamily: '"Public Sans", sans-serif'
    fontSize: ".85rem"
  arcade-navigation-mobile:
    fontFamily: '"Public Sans", sans-serif'
    fontSize: ".78rem"
  arcade-player-title:
    fontFamily: 'Anybody, sans-serif'
    fontSize: "clamp(1.1rem, 2.2vw, 2rem)"
    fontWeight: 800
    lineHeight: 1.1
rounded:
  catalog-control: "2px"
  catalog-badge: "50%"
  arcade-control-round: "50%"
spacing:
  catalog-page: "clamp(1.25rem, 5vw, 4rem)"
  catalog-grid-row: "clamp(2rem, 4vw, 3.25rem)"
  catalog-grid-column: "clamp(1.5rem, 3.5vw, 3rem)"
  catalog-caption: ".6rem"
  issues-page: "clamp(24px, 5vw, 64px)"
  arcade-film-row: "clamp(70px, 10vw, 160px)"
  arcade-player: "12px 22px"
  arcade-player-gap: "8px"
  arcade-control-gap: "20px"
components:
  catalog-option:
    textColor: "{colors.catalog-paper}"
    typography: "{typography.catalog-controls}"
    padding: ".05em .55em"
  catalog-option-selected:
    textColor: "{colors.catalog-nav-ground}"
    backgroundColor: "{colors.catalog-paper}"
  catalog-theme-select:
    textColor: "{colors.catalog-paper}"
    typography: "{typography.catalog-controls}"
    rounded: "{rounded.catalog-control}"
    padding: ".05em 1.5em .05em .45em"
  catalog-status-tag:
    textColor: "{colors.catalog-muted}"
    typography: "{typography.catalog-status}"
    rounded: "{rounded.catalog-control}"
    padding: "0 .38em"
  catalog-thumbnail:
    backgroundColor: "{colors.catalog-thumbnail}"
  arcade-navigation:
    textColor: "{colors.arcade-ink}"
    typography: "{typography.arcade-navigation}"
    padding: "24px 3.5%"
  arcade-film:
    backgroundColor: "{colors.arcade-ground}"
  arcade-pause:
    backgroundColor: "{colors.arcade-ground}"
    textColor: "{colors.arcade-paper}"
    padding: "12px"
    size: "46px"
  arcade-direction:
    textColor: "{colors.arcade-ink}"
    padding: "13px"
    size: "44px"
  arcade-surprise:
    backgroundColor: "{colors.arcade-acid}"
    textColor: "{colors.arcade-control-ink}"
    rounded: "{rounded.arcade-control-round}"
    padding: "10px"
    size: "44px"
  arcade-sound:
    backgroundColor: "{colors.arcade-ground}"
    textColor: "{colors.arcade-ink}"
    rounded: "{rounded.arcade-control-round}"
    padding: "11px"
    size: "44px"
---

# Design System: Hypermedia Club

## Overview

**Creative North Star: "The quiet catalog and independently directed issues"**

The master gallery is a quiet archival catalog: white ground, Georgia text, ordinary blue links, and artwork-led square thumbnails. The former quiet Issues cover is retained below as a historical record. The current `Issues/index.html` is a separate Arcade landing page with an uppercase cyan bent-tube ARCADE sign over dark-on-dark linoleum, with no enclosing rim or box. The sign pulses smoothly, stays behind four distinct artwork scroll zones, and fades fully away as they pass over it. Work names remain available as accessible link names, with no visible work-name captions; promotional/editorial copy and the top metadata band have been removed. This local direction does not change the master catalog.

The existing Arcade collection is a local moving-image world with the seedy darkness of an after-hours basement venue: oversized brush lettering, mottled charcoal walls, nearly buried printed debris, flat controls, and saturated illustrated collage. The twelve remaining raw foreground films integrate bold titles, coarse ink, strange humor, and black voids. Their three authored states cut abruptly from a full plate into magnified crops, splices, and overprinted lettering. Asteroids, We're All Snakes, and Warlords now use the native films described below. Clashing screen colors retain their full intensity against the dark room and minimal player surround. The supplied Deluxx Fluxx images establish energy only; their characters, logos, lettering, and compositions are not copied. Other works retain their own visual languages.

**Direction status:** The user rejected the current street-art/comic/photostat foreground and the subsequent glossy 3D exploration; the latter was not applied. The raw collection remains below as an implementation record, not an approved direction. The user approved placing the Asteroids film in context: it now occupies its card on the current Issues landing page and the first link on the original Arcade wall. We're All Snakes now extends that local native direction on both entry surfaces with 36 uniform bodies crawling into a two-row ground title, a blinking mouse on clear ground, and a fast continuous pullback after the letters settle; the same bodies then leave without overlaps. Warlords adds the requested four-turret firing tour and public rename while preserving its stable `005-only-invaders` slug. The other twelve wall films remain raw; the other landing cards keep their original thumbnails and Selected-only filter. These placements do not promote composition status: all three studies remain WIP, while the original Asteroids, We're All Snakes, and Warlords works retain their manual `"wip": false`. Further film redesigns remain pending. The clarified reference is the supplied GIFs skewed toward classic Atari attract screens; only still previews were available, so this record makes no claim about inspecting their motion. Rejected images may remain as dim background posters.

**Key Characteristics:**

- Quiet serif catalog and link-based navigation.
- Themed issues keep their visual worlds local.
- The existing, foreground-rejected Arcade collection pairs distressed Permanent Marker brush lettering and a worn charcoal environment with differently sized, asymmetrically placed 4:3 screens.
- Existing collection motion uses three abrupt illustrated states; the WIP native studies test Asteroids’ twenty-second assembly and explosion, We're All Snakes’ fifteen-second perspective arrivals, settled ground title, fast camera rise and 36-body exits, and Warlords’ twenty-four-second fixed-zoom firing tour and smaller intact title thud with a fiery blast.
- Original artwork runs only after entry, within a minimal flat player.

This record derives from root `index.html`, `Issues/index.html`, and `Issues/arcade/{index.html,arcade.css,arcade.js,cabinet.js,attract-art.js,attract.js}`. The existing issue direction is in `.impeccable/surfaces/issues-arcade-index-html.md`; the current test brief is `.impeccable/surfaces/issues-arcade-attract-test-html.md`. The test source is `Issues/arcade/{attract-test.html,asteroids-attract.js,attract-test.meta.json}`. The integration brief is `.impeccable/surfaces/issues-landing-integration.md`; the local Snake extension is recorded in `.impeccable/surfaces/issues-snake-attract.md` and `Issues/arcade/{snake-test.html,snake-attract.js,snake-test.meta.json}`. The Warlords extension is recorded in `.impeccable/surfaces/issues-warlords-attract.md` and `Issues/arcade/{warlords-test.html,warlords-attract.js,warlords-test.meta.json}`. Frontmatter tokens preserve the catalog and earlier local issue record; this integration adds no global style tokens or fonts and does not canonize the separate current landing page’s styling.

## Colors

### Primary

Catalog Blue identifies linked titles, active filter choices, selection, and keyboard focus. Visited Purple preserves ordinary link history. Arcade Signal is the pale lime local selection and focus color, the hover color for player utility links, and the draggable selector dot. Selected text uses Control Ink for contrast against this light accent.

### Secondary

Arcade Acid shares Signal’s source color but retains its distinct action role: the surprise control and previous/next hover field. These controls use dark Control Ink, not the light text ink. This lime is a local action accent, not a gallery status color. Each film has an original illustrated plate and per-work color, ink, and acid settings in `attract-art.js`; those illustrative colors are independent of shared UI colors.

### Neutral

Catalog Paper and Ink anchor the archive. Thumbnail gray is a loading fallback; muted metadata, date labels, tag borders, and dividers keep metadata subordinate. Arcade Ground supplies the dark issue field and player surround; a worn-wall texture overlays it. Arcade Ink is the warm light wordmark, link, and utility glyph color. Arcade Paper is the aged-paper pause glyph, loading line, and visit-dot color. Control Ink is reserved for dark marks on pale lime or paper. The muted Border outlines pause and sound controls; Scrollbar is the thumb against Ground. Arcade Screen is the black iframe and loading ground. The former quiet Issues cover adopted Arcade Ground only inside its preview. The separate current landing uses its local dark-on-dark SVG linoleum pattern and requested cyan neon lettering without an enclosing rim or box.

**The Surface Boundary Rule.** The white, Georgia, blue-link catalog remains the master language; Arcade’s typography and palette stay within its issue and its cover preview.

**The Film Palette Rule.** Screen-specific palettes stay local rather than becoming shared UI tokens. In the existing raw collection, each illustrated plate and attract-art.js ink setting defines its screen palette; the WIP native studies use their own canvas line colors.

## Typography

**Catalog:** Georgia with the source serif fallbacks; compact status tags use the recorded system sans stack. **Original wall wordmark:** self-hosted Permanent Marker. **Current landing heading:** six authored SVG glyph paths form uppercase ARCADE in cyan bent tubing, with A/R hairpin-return strokes and no surrounding rim or box. Layered glass, gas, pale cores and blurred cyan emission give the tubing depth. It uses no font outlines or cursive swashes; the H1’s accessible name remains Arcade. **Arcade added film lettering:** self-hosted Permanent Marker, Bangers, and Rubik Dirt. **Arcade player title:** self-hosted Anybody. **Arcade navigation and controls:** self-hosted Public Sans.

The catalog display uses regular weight at 1.5 times the navigation text size (1.3125rem against .875rem), with the title and controls sharing the header's --nav-font-size setting. Controls use compact labeled groups; captions stay underlined. Dates use uppercase italic monospace at .625rem in both grid captions and list rows, matching the menu labels through the shared --label-font-size setting. The Issues title uses its separate heading token; the cover title is (1.5rem), with a (600 .75rem system-ui) WIP tag and (.08em) tracking.

The ARCADE brush wordmark uses Permanent Marker, fitted across a (1440 × 278) SVG viewBox with a (1400) text length. Its display size token is the source SVG value, not a fixed viewport size. A repeating (420 × 420) pattern combines warm ink and the same wall texture at (.22) opacity, making the wear part of the letters. Canvas film tokens record the actual drawing fonts before each title line is scaled to (.85) of the screen width. Added lettering receives a black (11px) source stroke and a (.24) opacity plate overprint; the lettering is integrated into the collage rather than placed in an interface caption. The player uses Anybody (800), uppercase and balanced, outside the iframe. Navigation becomes (.78rem) at the mobile breakpoint; the player title becomes (1rem) in short landscape.

Bangers, Rubik Dirt, and Permanent Marker ship as uppercase-subset WOFF2 files with their licenses. Anybody remains the variable player-title face and Public Sans the utility face, also licensed and self-hosted. These local roles do not replace Georgia in the master catalog.

**The Artwork First Rule.** Gallery metadata and player chrome remain outside the artwork iframe. Requested title-film lettering does not authorize adding text to original sketches.

## Layout

The catalog keeps its fluid gutters and `repeat(auto-fill, minmax(clamp(11rem, 22vw, 17rem), 1fr))` grid. Square thumbnails precede metadata without enclosing card panels. List mode is bounded at (60rem); Published and Updated share one line, with the date group moving below titles at (42rem). Grid dates remain stacked on separate lines. The minimum page width is (320px).

The former Issues cover was a simple document with a linked cover bounded at (560px), a (4 / 3) preview, and its caption beneath. This is historical layout information, not a description of the current separate Arcade landing page. The current landing starts with the responsive ARCADE tube sign, bounded at (1180px) with a (`52 50 1020 250`) SVG viewBox, followed by frameless 44px icon links/controls and borderless artwork screens without visible work-name captions. The entrance sticks at the viewport top at layer zero; the collection occupies layer one, so its screens scroll over the sign. The metadata band, promotional prose, counts, section heading, closing copy, footer, and decorative numbers are removed without reserving blank space. Fifteen Selected Games occupy four distinct zones: a twelve-column asymmetric entry with shallow parallax, a viewport-sticky horizontal crossing driven by vertical scroll, two lanes moving vertically in opposite directions, and a sticky deck whose screens peel upward and scale as scrolling advances. Native vertical scrolling drives measured runways through requestAnimationFrame; scrolling back reverses the transforms. Static thumbnails use square, portrait (3 / 4), landscape (3 / 2), and wide (16 / 9) crops; the four native films keep their undistorted (4 / 3) frames. At (700px) and below, gutters become (14px), screen widths and entry spans adjust, and the distinct zone behaviors remain. Reduced motion flattens every zone into ordinary two-column flow, becoming one column at (700px), with all fifteen works visible and films held still. Sharp screens have no surrounding panel, inset border, marquee band, arrow, shadow, or internal padding. Actual work names are the links’ accessible names; image alt text is empty to avoid duplicate announcements. Keyboard focus reveals each work in its scroll zone. The four native films and Selected-only game filter remain intact; future Selected Games outside the authored layout append in ordinary flow.

Arcade’s film field is a (12-column) grid bounded at (1600px), with (3%) column gaps, fluid row gaps, (4%) side padding, and (140px) bottom padding. Its six-work composition repeats spans of (7, 4, 5, 5, 8, 3) columns, with offset starts and some panels lowered by (22–30%) margins. The last film spans eight columns from column three. Every screen is (4 / 3); scale and asymmetric placement provide the variation. The wordmark nearly fills the page width; navigation uses (3.5%) side gutters.

At (650px) and below, the twelve-column structure remains, with spans of (10, 8, 9, 9, 12, 8), alternating starts, (2%) column gaps, (66px) row gaps, and (5%) side gutters. Alternate films use a (−15px) top margin. The final panel spans eleven columns. Background scraps scale to (.55) of their authored widths. The interactive background slot sits at (94%) of the wall height; there are no decorative rule lines.

The full-viewport native player uses a flat layout bounded at (1700px): (58px) title row, flexible iframe, and (62px) controls, separated by the player gap. No artwork aspect ratio is imposed. On mobile the bottom row becomes (58px), the gap becomes (5px), and padding respects safe areas. At heights of (550px) or less in landscape, rows become (42px), flexible iframe, and (46px), with (2px) gaps. Controls remain beside a low, unobtrusive selector.

## Elevation & Depth

The catalog remains flat and shadow-free. Arcade retains flat graphics, sharp edges, and a minimal player within a dim, materially worn environment. The locally shipped wall texture repeats at (900px) width behind the issue and player. Film panels cast a dark seating shadow, with a restrained (12%) palette-derived spill and inset edge falloff; this gives screens a little light against the wall without restoring neon signage, bevels, thick borders, or simulated cabinet housing. The old physical-sounding source selector names remain implementation hooks, not a description of the visible form.

The separate current landing expressly uses physical neon lettering: six authored SVG glyph paths form uppercase ARCADE, including A/R hairpin-return strokes, with no enclosing rim or box. Cyan gas (`#73fbff`, 8px source stroke) and a pale hot core (`#e4ffff`, 4.5px) sit over dark glass (`#16464b`, 12px). Ambient cyan emission (`#27cced`, 20px, .5 opacity, 9px blur) and a tighter bloom (`#78faff`, 12px, .7 opacity, 2.2px blur) give the lettering depth. The source is stroke geometry, with no font outlines, raster assets, cursive joins, or swashes. Its SVG is accessibility-hidden and nonfocusable beneath the Arcade-named H1. The landing screens are borderless rectangles directly on the patterned ground. The requested sign effect stays local to `Issues/index.html`, `Issues/arcade.css`, and `Issues/arcade.js`; it does not alter original-wall or catalog depth rules.

A single emission group pulses smoothly from (.4) to (1) and back over (3.2s), reaching full strength halfway through the cycle, without flashing. The shared pause control, hidden documents, reduced motion, and a fully dimmed sign suspend the pulse; reduced motion uses a static full-strength emission. A passive scroll handler coalesces updates through `requestAnimationFrame`: smoothstep progress across (.9×) entrance height lowers overall sign opacity from (1) to (0), reversing when the user scrolls back. The scroll-linked relationship remains with reduced motion.

### Shadow Vocabulary

- **Screen seating:** `0 16px 38px #0009`, with a spill of `0 0 36px color-mix(in srgb, var(--spill, var(--ground)) 12%, transparent)`. Each film supplies its existing palette’s ground as the spill color.
- **Screen edge:** `inset 0 0 35px #0004`, combined with a shallow transparent-to-black diagonal overlay. This darkens the screen edge without changing the source stills.

Foreground images and canvases retain full source color at rest, on hover, and on focus. The dark worn environment and shallow screen-edge overlay seat the clashing inks without a saturation or brightness filter on the artwork.

Printed background flyers use `grayscale(.75) sepia(.28) brightness(.64)`, normal blending, and (.4) opacity, with every third flyer at (.26). They remain behind the title films and do not intercept pointers. The slot prop uses `sepia(.4) brightness(.6)` at (.65) opacity. The wall moves by (scrollY × .045); scraps move by (distance × .09), clamped to (±110px). Passive scroll handling schedules one animation frame; hidden documents and an open player suspend scenery painting. Reduced motion removes scenery translation.

The existing raw collection cuts between three authored collage states rather than running games in miniature. This describes its rejected foreground implementation, not a motion rule for the pending vector direction.

Film holds are (1800ms, 1050ms, 1450ms), with staggered starts. Visible films use bounded canvas resolutions; offscreen films release their canvas to (1 × 1) and reveal the raw JPG fallback. The shared pause control, document visibility, and open player suspend timed cycling. Mouse position scrubs three horizontal regions; focus holds frame zero. Reduced-motion preference keeps frame zero and disables timed cycling and pointer scrubbing. The selector dot returns over (150ms) with the source spring easing; successful quarter flight lasts (520ms). Reduced motion removes that return transition and cancels coin flight. Optional synthesized sound begins off and suspends while hidden.

The current landing utility links and pause button have no border or filled housing and retain (44 × 44px) targets. Work links and controls turn lime on hover; work links also turn lime on keyboard focus, with a visible outline. Each work link gets its actual title through aria-label, with no visible work-name heading beneath the screen; fallback images have empty alt text to avoid duplicate names. This treatment is local to the landing and leaves the original wall and player unchanged. Historical checks and eight captures in `.impeccable/review/arcade-unhoused/` cover (1440/768/390/320px), with eleven preserved destinations, no overflow or browser errors and screen-width gains of (16%/29%/39%) at (1440/390/320px). The previous sign revision’s link names, rim removal, layering and motion remain recorded in `.impeccable/review/arcade-neon-no-box/`; its ship review applies to that revision. Current `.impeccable/review/arcade-scroll-zones/checks.json` verifies fifteen accessible links, four zones, keyboard visibility at (1440/768/390/320px), reversible horizontal travel, opposing lanes, reduced-motion flattening and restoration, and mobile touch launch/Back restoration without browser errors. Current screenshots and inspection measurements are in the same folder; fresh finish review returned ship after inspecting all 33 normal-motion captures and four reduced-motion captures, with no material fixes. The user explicitly promoted Many Frogs (requested as Frogger), Always Moving Up, Micro Tetris, and Lunar Founder (requested as Moon Patrol) with `"wip": false`, raising the Selected Games count from eleven to fifteen. Their names and thumbnails remain their existing metadata; these promotions do not create new films or promote the issue or studies.

## Shapes

Catalog thumbnails and issue film panels have sharp rectangular edges. Catalog native selection and metadata tags retain small rounded corners; the image WIP badge is circular. Arcade’s wordmark, pause control, film fields, and player surround are hard-edged. Only compact sound/surprise controls, the pocket quarter, selector dot, and local visit dots use circles. There is no general rounded-card or cabinet radius scale.

## Components

### Catalog controls and work links

The header uses content-driven flex wrapping: the title stays left and the menu sits to its right when both fit. When they no longer fit together, the menu starts below the title and its control groups flow onto additional rows as needed, aligned left.

The black header presents Status, Theme, Sort, Issue, and View in that order, wrapping complete label/control groups on narrow screens. Navigation text is .875rem. Each label sits above its control in light uppercase monospace type, using the .625rem catalog-control-label role and catalog-nav-muted color. The title and control text are white; changed filters and keyboard focus use the pale catalog-nav-accent. Status, Theme, Sort, Issue, and View use native serif dropdowns with a one-pixel catalog-nav-border stroke and light SVG arrow. Open dropdowns use the same black ground and white text. Sort includes both directions for each ordering. Issue offers None for the index and Arcade to open the issue page. View offers Grid and List in a matching dropdown. Hover underlines; focus is a two-pixel outline. The white artwork area has a gap below the header. Work links retain underlined titles, purple visited titles, and a three-pixel blue thumbnail focus outline with a three-pixel offset. Metadata tags and the white WIP disc remain gallery metadata.

### Earlier Issues cover — historical

Three upright first-frame images previously previewed Arcade within the serif catalog, with the linked caption and bordered WIP tag outside the preview. The current separate landing page is not this cover.

### Arcade navigation and films

Small underlined links use Arcade Ink. Focus uses a three-pixel Signal outline, offset by (6px), or (8px) around films. The hidden skip link appears on focus. The twelve raw-film semantic work links contain local JPG plates and accessibility-hidden canvases; the first two images load eagerly and later images lazily. Asteroids, We're All Snakes, and Warlords instead use their completed-title PNGs and the shared native controller. A raw-film canvas replaces its fallback only after the plate loads, drawing succeeds, and the three local lettering fonts are ready. Each original work name remains accessible without an added caption over the artwork.

Twelve remaining three-state canvas films build on original raw illustrated plates; the retained Asteroids, Snake, and Warlords raw plates no longer drive their foregrounds. State zero draws the full plate, exactly matching the no-JavaScript JPG fallback. State one jumps into a (.58 × .58) crop, applies a (.28) opacity multiply ink field, and adds expressive title lettering. State two uses one of three per-work edit families: split panorama, vertical splice, or punched strips, with another title placement. Fourteen plates are newly generated game-inspired illustrations; Many Mario is an original code-authored photostat collage using its own existing game thumbnail. Film compositing and per-work colors live in `attract-art.js`; lifecycle and scrubbing live in `attract.js`.

### Asteroids native film and direction study — WIP

`Issues/arcade/attract-test.html` remains the representative WIP study. Its renderer is now also placed on the current `Issues/index.html` Asteroids card and the first link on `Issues/arcade/index.html`; this remains a local film integration, not a collection redesign. Its sharp black (4 / 3) canvas is bounded at (960px) within the existing worn room. The requested ASTEROIDS ASSEMBLE title builds from separate rigid brackets and hinged multisegment strokes: parts converge and unfold, approach joins with (8px) gaps, then clamp with brief coral jaws and minor recoil. The completed title holds until a radial ballistic burst at (14.6s) accelerates and tumbles fragments out of frame. Incoming parts mainly originate beyond the frame edges, and a small next-cycle lead-in begins near the end of the (20s) loop. Bounding-box culling omits fully offscreen fragments. Three faint asteroid pairs drift left to right behind the lettering and coalesce into plain external union outlines, with internal edges omitted. The background carries no clamp brackets, locks, jaws, or added marks. At the same (14.6s) onset as the word burst, wedges derived from the actual asteroid polygons scatter outward and tumble; no explosion rings, sparks, or other ornaments are added. Both letter parts and asteroid chunks are culled offscreen, leaving only the stationary “0¢ TO PLAY” message by (16.3s). Background asteroids gradually return from (18.5s) through the loop boundary. The words’ geometry, movement, and existing tiny assembly accents remain unchanged. There is no spaceship or shot sequence. This is native canvas geometry, with no animation rasters or video. The standalone study HTML plus renderer totals (15,372 bytes); the shared renderer plus integration controller totals (14,684 bytes). These source figures exclude scenery, fonts, and the static fallback.

The user-requested **0¢ TO PLAY** stays centered at the bottom throughout the entire loop, including the explosion and completed accessibility still. It uses authored vector glyphs with (32) native cap height and a small black clearance behind them, preserving readability at the (320px) viewport. It never blinks or joins the animated fragments.

The source uses (24fps) timeout scheduling only while active. Pause, link focus, reduced motion, and a hidden document suspend the timer. Focus and reduced motion display the completed title at (11s), rather than the scattered starting parts. The whole screen links directly to the unchanged original Asteroids Assemble work. Navigation and the visible pause control stay outside the image, with a three-pixel lime focus outline offset by (6px). The standalone study has no no-JavaScript image fallback; the integrated links use the completed-title PNG described below. Render counts are returned for verification only and are not displayed in the artwork.

The existing wall texture and three raw images—Asteroids, Pacman, and Frogs—are reused only as dim background posters in the study: `grayscale(.65) sepia(.22) brightness(.5)` at (.45) opacity. The screen uses `0 20px 60px #000a` seating. Public Sans remains the existing utility font; the title glyphs introduce no font dependency. `attract-test.meta.json` records `"wip": true`; original artwork content and status remain unchanged. Longer loops within reasonable byte budgets are permitted. Asteroids placement is approved for review in context; the study remains WIP. We're All Snakes is the separate local extension below; the remaining films have not been redesigned.

### We're All Snakes native film and local study — WIP

`Issues/arcade/snake-test.html` opens with 36 continuous rectangular snakes crawling along safe ground tracks into **WE'RE ALL** / **SNAKES**, settling by 3.8s. The camera follows an arriving snake while the upright blinking mouse stands at (-8.4, -1.2), with at least .52 world units between its full footprint and every body. The camera rises overhead in .65 seconds at 4.4–5.05s; completed title geometry stays stationary from 3.8–9.6s. Every body is .8 world units wide and all 13 letters share a 5.6-unit cap height, with a 1.6-unit apostrophe. Adjoining pieces meet edge-to-edge to close the glyphs. Fractional movement slides tails and heads along their tracks while preserving right-angle interior corners; there is no letter morph or crossfade. At 9.6s all 36 bodies hurry offscreen without penetration; all tails clear by 11.2875s. Camera return remains 13.2–15s in the 15-second loop. No price text, footer, heads, eyes or extra copy.

`scripts/plan-snake-attract.mjs` plans exits offline with swept reservations for old/new full bodies; arrivals retrace the safe routes. Edge contact is allowed while overlaps are forbidden. Runtime only decodes compact routes. `scripts/check-snake-attract.mjs` checks moving arrivals, settled geometry before/during zoom, uniform widths and letter heights, 14 edge-connected glyphs, and mouse clearance at 240Hz. Arrivals and exits receive 1,341 overlap/backtrack samples at 240Hz, with full-width self-segments at 80Hz and a complete-exit assertion. Current native evidence is `.impeccable/review/snake-uniform-arrival/`, with contact sheet, 800×600 opening and 1200×900 title; browser access remains unavailable for a fresh layout/interaction capture.

The provenance-recorded 1200×900 PNG and focus/reduced-motion still show the bold ground title at 9s. Shared playback, direct links and all manual statuses remain; the study stays WIP. No shared gallery tokens, external dependencies or fonts change.

### Warlords native film and local study — WIP

`Issues/arcade/warlords-test.html` extends the local attract direction with the original work’s four flat colored cannons, curved planet caps, and star field. Across a (24s) loop, the camera stays at (2.8×) for the pink north, orange east, mint south, and blue west firing close-ups in that order, with (3.6s) dwells and (280ms) pans. Each close-up includes seven shots, recoil, and color-matched projectiles leaving the muzzle toward the opposite edge. The existing authored **WARLORDS** geometry is uniformly scaled to (78%), roughly (573px) wide with (157px) cap height at the native (800 × 600) size. The intact word accelerates downward from (15.4–16.05s); contact triggers a brief squash/shake and a flat (8px)-cell fireball, ground shockwave, rising dark smoke, and embers behind it. A dark keyline keeps the lettering readable over the fire. The letters never fragment; fire ends (1.6s) after contact and smoke/embers dissipate within (3.2s), leaving the intact title held in place. Only the first close-up returns at (23.4–24s); no four-gun overview appears anywhere. The full 800×600 frame is active: the 68px bottom mask is removed, and arena, blast and ember bounds reach the bottom edge. The ammunition counter and **0¢ TO PLAY** are removed from this film at the user’s request; Asteroids retains its play message; Snakes has no play-price text. There are no in-art controls or extra copy. The sharp (4 / 3) study is bounded at (960px), with existing Public Sans controls outside it. The actual source-work colors stay local rather than becoming shared tokens.

`warlords-attract.js` is (9,359 bytes); the (1,996-byte) study HTML plus renderer totals (11,355 bytes), and renderer plus the shared (3,480-byte) controller totals (12,839 bytes). No animation rasters or video are used. The native (1200 × 900), (47,949-byte) `assets/warlords-attract.png` captures the settled intact word with residual smoke at (18s), with embedded provenance and an updated `assets/prompts.json` entry. It serves the study and both entry surfaces, including the standalone and original wall without JavaScript. Focus and reduced motion hold that same completed still; pause, hidden documents, wall-player suspension, and offscreen release use the shared lifecycle below.

The public original-work title is now **Warlords**, while `pieces/005-only-invaders/` remains the stable link. Its browser title, canvas accessibility name, manifest title, and README alias follow the rename; the game mechanics are unchanged and no visible title is added inside the game. Its original native-game (900 × 900), (39,459-byte) JPG thumbnail replaces the image with baked-in old lettering and carries embedded provenance. Historical prompts and rejected background images retain their original names. `warlords-test.meta.json` starts with `"wip": true`; the original work retains its manual `"wip": false`. This local extension changes neither gallery identity nor composition status.

The recorded checks in `.impeccable/review/warlords-thud-blast/checks.json` pass for the study, landing, and original wall at (1440px), (390px), and (320px), with all four firing close-ups at fixed (2.8×), midpoint pans, no four-gun overview, accelerating drop offsets, contact-triggered fire, and equal intact title ink at (17s), (18s), (19s), and (22s). Playback, pause/resume, focus and reduced-motion stills, offscreen release, direct links, wall player suspension, and no-JavaScript fallback pass, with no overflow or browser errors. Fresh visual review of (25) captures found no material fixes. Timing measured roughly (0.14ms) per native draw locally; this is a local observation rather than a device-wide performance guarantee. The subsequent Warlords-only HUD removal is recorded in `.impeccable/review/warlords-no-hud/checks.json` and ten captures: seven sampled phases have a blank footer, firing and the intact title blast remain, and the desktop (1440px), mobile (390px), small study (320px), and wall (1440px) views have no overflow or browser errors. The finish review returned **ship**; the study remains WIP.

### Unbreakable native film and local study — WIP

`Issues/arcade/unbreakable-test.html` adds a dense two-row **UNBRE** / **AKABLE** slab in eleven authored heavy block glyphs. Warm cream faces with narrow counters cover about (80.5%) of the native (800 × 600) frame, with (6px) outer margins, (4px) letter seams, a (6px) row gap and (291px) letter height. The original Unbreakable palette stays local: brick red, ochre, vermilion, gold and cream on deep purple. The title occupies the same projected plane as the long game-derived brick wall; rectangular masonry retains its small highlights and shaded lower edges. No font, animation raster, image texture or added artwork copy is required.

Across the (24.8s) loop, the title holds through (2.2s), tilts into steep perspective at (2.2–3.8s), and the camera travels (128 world units) down the wall at (3.8–8.8s). Ball and paddle emerge before the view flattens continuously at (8.8–10s). Reverse-Breakout play at (10–17.2s) adds complete brick cells after the returning ball clears them; bricks are never broken. The masonry and machine retreat at (17.2–18.7s), expanding empty ground. Eleven letters type back in at (.32s) intervals from (18.7–21.9s), then the finished slab holds. The typed title matches the opening pixels exactly across the loop boundary.

`Issues/arcade/unbreakable-attract.js` is shared by the standalone study, current landing and original wall through the existing native controller. Focus, reduced motion and the provenance-recorded (1200 × 900) `assets/unbreakable-attract.png` show the complete title at (1s). Existing pause, hidden/offscreen suspension, resolution caps and direct `pieces/003-unbreakable/` links remain; `scripts/version-arcade-assets.mjs` maintains content-hash URLs. The study stays `"wip": true`; the original manual `"wip": false`, original game and shared gallery tokens remain unchanged.

`scripts/check-unbreakable-attract.mjs` passes (2,977) draw samples at (120Hz), camera continuity, nine brick hits, nine paddle catches, nine unique added cells with ball clearance, ordered typing, wiring and exact loop state. Native full-loop rendering covers (596) frames with deterministic seeking; local measured draw time averaged roughly (2.35ms), with a (22ms) maximum, rather than a device-wide performance guarantee. Native evidence in `.impeccable/review/unbreakable-native/` includes the contact sheet, full title, steep wall, arrival and gameplay, plus a (320 × 240) still. Shared-controller checks cover pause, focus, reduced motion, hidden/offscreen behavior and DPR limits. Browser access was unavailable; no fresh browser layout or interaction pass is claimed.

### Native film entry-surface integration

`Issues/arcade/attract-player.js` is (3,480 bytes) and controls the Asteroids, Snake, and Warlords renderers on both entry surfaces and the standalone Snake and Warlords studies, using each renderer’s duration and completed-still time. Intersection observation limits its (24fps) timer to visible, active films; offscreen canvases shrink to (1 × 1) and reveal the static fallback. Hidden documents, pause, and an open wall player suspend timing. Focus and reduced motion show Asteroids at (11s), Snake at (9s), and Warlords at (18s). Rendering caps device-pixel ratio at (1.5) and canvas width at (1400px). The old `attract.js` excludes native-marked links, preventing contention; its shared wall pause still controls both systems.

The current landing has 44px back and pause icon buttons outside the artwork, with accessible names. The controller preserves SVG children for `data-icon` controls while keeping text labels functional in the standalone studies. Cards other than Asteroids, We're All Snakes, and Warlords still use original thumbnails, with the existing games / `"wip": false` / not-rejected filter. Ordinary work links remain intact if the native controller fails. With JavaScript disabled, the original wall retains all three native PNG links; the current landing page retains its existing noscript link to the Selected Games collection.

The (1200 × 900), (60,326-byte) `assets/asteroids-attract.png` is a native render at the (11s) completed title, including the constant `0¢ TO PLAY`. Embedded origin metadata and `assets/prompts.json` record its provenance. The landing cleanup retains dark skip-link text on lime during hover. Its small native `assets/linoleum.svg` pattern adds no raster to the provenance registry. The local brief is `.impeccable/surfaces/issues-landing-strip-copy.md`; the cleanup captures plus `checks.json` are in `.impeccable/review/landing-strip-copy/`. The earlier cursive sign and captioned unhoused-screen revisions are retained as historical evidence in `.impeccable/review/arcade-cursive-neon/` and `.impeccable/review/arcade-unhoused/`. The earlier framed uppercase sign is recorded in `.impeccable/review/arcade-neon-scroll/` as historical evidence. The prior sign revision’s lettering without a surrounding box, hidden work-name captions, stronger smooth pulse, and scroll layering are recorded in `.impeccable/review/arcade-neon-no-box/checks.json` and nine desktop/mobile/small high, low and overlap captures. Checks pass rim absence, six letter paths, the 3.2s .4–1 pulse, accessible names without visible captions, sticky layering, dimming and reversal, shared pause, covered-sign suspension and reduced motion, with no overflow or browser errors. That revision’s finish review returned ship after inspecting all nine captures, with no material fixes. Current four-zone layout and full fade evidence is in `.impeccable/review/arcade-scroll-zones/` and `.impeccable/surfaces/issues-arcade-scroll-zones.md`.

### Pause and flat player controls

The square pause/play button uses Ground, a muted one-pixel border, and Paper glyphs, with state and accessible name synchronized. The dark textured player contains light arrow utilities, a centered light work title, a real iframe, flat previous/next triangles, a pale lime draggable dot over a thin light rule, an acid surprise circle with Control Ink marks, and a dark sound circle with a muted one-pixel border. Utility hover turns Signal; direction hover becomes Acid with Control Ink glyphs. All controls retain accessible names and the shared focus outline.

Ordinary film activation opens a native dialog; modified clicks keep direct link behavior. Each switch replaces the iframe, stopping the previous work. Previous/next wrap through all fifteen works. Horizontal selector dragging chooses by direction; vertical dragging or clicking chooses a surprise. The quarter can be clicked or dragged to the background slot; the draw bag favors unvisited works and exhausts candidates before repeating. Escape, visible return, focus restoration, wall scroll restoration, and `#play=slug` history remain available. Same-origin iframe Escape is relayed to the parent; file-origin isolation retains the visible exit fallback.

Visits are small difference-blended dots (8px), growing to (14px) for the last played work. They are local activity only. No visit state changes metadata or curatorial status. Without JavaScript or native dialog support, direct film links and raw JPGs remain usable; enhanced controls stay absent or disabled.

### Local raster and font assets

The fifteen `assets/raw/*.jpg` plates carry embedded source provenance and entries in `assets/prompts.json`: fourteen original generated illustrations and the code-authored Many Mario photostat collage. The latter uses `pieces/016-up-mario/thumbnail.jpg`, original gallery artwork by the user, through independent crops and duotone pixel mapping; its source is `assets/source/mario.html`. The former clean geometric `assets/attract/` PNG fallbacks are removed. The earlier fourteen generated poster JPEGs and authored Many Mario geometric print persist only as desaturated background flyers, preserving their provenance. The transparent slot prop and generated `assets/wall-wear.jpg` retain their source records. The registry contains thirty-five shipping rasters: fifteen retained raw plates, fifteen printed flyers, the slot, the wall texture, and three native completed-title PNGs for Asteroids, We're All Snakes, and Warlords. These PNGs are the integrated foreground fallbacks; their old raw plates remain available as rejected background prints. All five local font families ship with licenses. No external font service or build dependency is introduced.

## Do's and Don'ts

### Do:

- **Do** preserve the white, Georgia, blue-link catalog outside themed experiences.
- **Do** keep each attract film a semantic direct link with an accessible work name; preserve the existing collection’s local first-frame fallbacks.
- **Do** keep pause, reduced-motion handling, hidden-document suspension, and direct work navigation; preserve offscreen suspension in the collection.
- **Do** keep artwork metadata and player titles outside original sketches unless the user explicitly requests otherwise.
- **Do** keep Arcade and new compositions WIP unless the user explicitly promotes them; preserve manual Selected and Rejected decisions.
- **Do** retain embedded raster provenance and the matching assets/prompts.json registry entry.
- **Do** keep the worn environment and readable control contrast; keep all three native studies WIP despite placement on both entry surfaces, and await further direction before redoing other films.

### Don't:

- **Don’t** carry the rejected street-art/comic/photostat foreground or rejected glossy 3D exploration into the pending attract-screen direction.
- **Don’t** apply Arcade’s display fonts or palette globally to the catalog.
- **Don’t** treat local visit dots or last-played activity as Selected, ratings, or curatorial decisions.
- **Don’t** infer promotion from completion, quality, or import; missing status fields mean WIP and explicit rejection takes precedence.
- **Don’t** add captions, readouts, instructions, titles, or text controls inside sketches without an explicit user request.
- **Don’t** invent promotional or editorial gallery/issue copy; use requested text, actual work names, and essential functional labels only.
- **Don’t** introduce CDN or framework dependencies for this static gallery.
