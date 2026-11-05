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
    fontSize: "clamp(1.9rem, 5.5vw, 3.1rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-.015em"
  catalog-controls:
    fontFamily: 'Georgia, "Times New Roman", Times, serif'
    fontSize: "clamp(1rem, 1.5vw, 1.18rem)"
    lineHeight: 1.55
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
    textColor: "{colors.catalog-ink}"
    typography: "{typography.catalog-controls}"
    padding: "0"
  catalog-option-selected:
    textColor: "{colors.catalog-blue}"
  catalog-theme-select:
    textColor: "{colors.catalog-ink}"
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

The master gallery is a quiet archival catalog: white ground, Georgia text, ordinary blue links, and artwork-led square thumbnails. The Issues index keeps that language around previews of independently directed collections.

The existing Arcade collection is a local moving-image world with the seedy darkness of an after-hours basement venue: oversized brush lettering, mottled charcoal walls, nearly buried printed debris, flat controls, and saturated illustrated collage. Fifteen original game-inspired worlds integrate bold titles, coarse ink, strange humor, and black voids. Three authored states cut abruptly from a full plate into magnified crops, splices, and overprinted lettering. Clashing screen colors retain their full intensity against the dark room and minimal player surround. The supplied Deluxx Fluxx images establish energy only; their characters, logos, lettering, and compositions are not copied. Other works retain their own visual languages.

**Direction status:** The user rejected the current street-art/comic/photostat foreground and the subsequent glossy 3D exploration; the latter was not applied. The fifteen-film raw collection still exists below as an implementation record, not an approved direction. The next step is one WIP Asteroids attract study, awaiting user feedback before any collection-wide replacement. The clarified reference is the supplied GIFs skewed toward classic Atari attract screens; only still previews were available, so this record makes no claim about inspecting their motion. Rejected images may remain as dim background posters.

**Key Characteristics:**

- Quiet serif catalog and link-based navigation.
- Themed issues keep their visual worlds local.
- The existing, foreground-rejected Arcade collection pairs distressed Permanent Marker brush lettering and a worn charcoal environment with differently sized, asymmetrically placed 4:3 screens.
- Existing collection motion uses three abrupt illustrated states; the separate WIP study tests a twenty-second cycle of title parts converging, bending, clamping, holding, and exploding out of frame.
- Original artwork runs only after entry, within a minimal flat player.

This record derives from root `index.html`, `Issues/index.html`, and `Issues/arcade/{index.html,arcade.css,arcade.js,cabinet.js,attract-art.js,attract.js}`. The existing issue direction is in `.impeccable/surfaces/issues-arcade-index-html.md`; the current test brief is `.impeccable/surfaces/issues-arcade-attract-test-html.md`. The test source is `Issues/arcade/{attract-test.html,asteroids-attract.js,attract-test.meta.json}`. Frontmatter tokens continue to describe the existing implementation; this study adds no shared tokens or fonts.

## Colors

### Primary

Catalog Blue identifies linked titles, active filter choices, selection, and keyboard focus. Visited Purple preserves ordinary link history. Arcade Signal is the pale lime local selection and focus color, the hover color for player utility links, and the draggable selector dot. Selected text uses Control Ink for contrast against this light accent.

### Secondary

Arcade Acid shares Signal’s source color but retains its distinct action role: the surprise control and previous/next hover field. These controls use dark Control Ink, not the light text ink. This lime is a local action accent, not a gallery status color. Each film has an original illustrated plate and per-work color, ink, and acid settings in `attract-art.js`; those illustrative colors are independent of shared UI colors.

### Neutral

Catalog Paper and Ink anchor the archive. Thumbnail gray is a loading fallback; muted metadata, date labels, tag borders, and dividers keep metadata subordinate. Arcade Ground supplies the dark issue field and player surround; a worn-wall texture overlays it. Arcade Ink is the warm light wordmark, link, and utility glyph color. Arcade Paper is the aged-paper pause glyph, loading line, and visit-dot color. Control Ink is reserved for dark marks on pale lime or paper. The muted Border outlines pause and sound controls; Scrollbar is the thumb against Ground. Arcade Screen is the black iframe and loading ground. The Issues cover adopts Arcade Ground only inside its preview.

**The Surface Boundary Rule.** The white, Georgia, blue-link catalog remains the master language; Arcade’s typography and palette stay within its issue and its cover preview.

**The Film Palette Rule.** Screen-specific palettes stay local rather than becoming shared UI tokens. In the existing raw collection, each illustrated plate and attract-art.js ink setting defines its screen palette; the WIP study uses its own canvas line colors.

## Typography

**Catalog:** Georgia with the source serif fallbacks; compact status tags use the recorded system sans stack. **Arcade wordmark:** self-hosted Permanent Marker. **Arcade added film lettering:** self-hosted Permanent Marker, Bangers, and Rubik Dirt. **Arcade player title:** self-hosted Anybody. **Arcade navigation and controls:** self-hosted Public Sans.

The catalog display is bold and tightly tracked; controls read as an inline sentence; captions stay underlined. Dates are italic, at (.88em) in grid captions and (.84em) in list rows. The Issues title uses its separate heading token; the cover title is (1.5rem), with a (600 .75rem system-ui) WIP tag and (.08em) tracking.

The ARCADE brush wordmark uses Permanent Marker, fitted across a (1440 × 278) SVG viewBox with a (1400) text length. Its display size token is the source SVG value, not a fixed viewport size. A repeating (420 × 420) pattern combines warm ink and the same wall texture at (.22) opacity, making the wear part of the letters. Canvas film tokens record the actual drawing fonts before each title line is scaled to (.85) of the screen width. Added lettering receives a black (11px) source stroke and a (.24) opacity plate overprint; the lettering is integrated into the collage rather than placed in an interface caption. The player uses Anybody (800), uppercase and balanced, outside the iframe. Navigation becomes (.78rem) at the mobile breakpoint; the player title becomes (1rem) in short landscape.

Bangers, Rubik Dirt, and Permanent Marker ship as uppercase-subset WOFF2 files with their licenses. Anybody remains the variable player-title face and Public Sans the utility face, also licensed and self-hosted. These local roles do not replace Georgia in the master catalog.

**The Artwork First Rule.** Gallery metadata and player chrome remain outside the artwork iframe. Requested title-film lettering does not authorize adding text to original sketches.

## Layout

The catalog keeps its fluid gutters and `repeat(auto-fill, minmax(clamp(11rem, 22vw, 17rem), 1fr))` grid. Square thumbnails precede metadata without enclosing card panels. List mode is bounded at (60rem); dates wrap below titles at (42rem). The minimum page width is (320px).

The Issues index is a simple document with a linked cover bounded at (560px), a (4 / 3) preview, and its caption beneath. Three upright first-frame film images form the cover, without poster shadows or rotation.

Arcade’s film field is a (12-column) grid bounded at (1600px), with (3%) column gaps, fluid row gaps, (4%) side padding, and (140px) bottom padding. Its six-work composition repeats spans of (7, 4, 5, 5, 8, 3) columns, with offset starts and some panels lowered by (22–30%) margins. The last film spans eight columns from column three. Every screen is (4 / 3); scale and asymmetric placement provide the variation. The wordmark nearly fills the page width; navigation uses (3.5%) side gutters.

At (650px) and below, the twelve-column structure remains, with spans of (10, 8, 9, 9, 12, 8), alternating starts, (2%) column gaps, (66px) row gaps, and (5%) side gutters. Alternate films use a (−15px) top margin. The final panel spans eleven columns. Background scraps scale to (.55) of their authored widths. The interactive background slot sits at (94%) of the wall height; there are no decorative rule lines.

The full-viewport native player uses a flat layout bounded at (1700px): (58px) title row, flexible iframe, and (62px) controls, separated by the player gap. No artwork aspect ratio is imposed. On mobile the bottom row becomes (58px), the gap becomes (5px), and padding respects safe areas. At heights of (550px) or less in landscape, rows become (42px), flexible iframe, and (46px), with (2px) gaps. Controls remain beside a low, unobtrusive selector.

## Elevation & Depth

The catalog remains flat and shadow-free. Arcade retains flat graphics, sharp edges, and a minimal player within a dim, materially worn environment. The locally shipped wall texture repeats at (900px) width behind the issue and player. Film panels cast a dark seating shadow, with a restrained (12%) palette-derived spill and inset edge falloff; this gives screens a little light against the wall without restoring neon signage, bevels, thick borders, or simulated cabinet housing. The old physical-sounding source selector names remain implementation hooks, not a description of the visible form.

### Shadow Vocabulary

- **Screen seating:** `0 16px 38px #0009`, with a spill of `0 0 36px color-mix(in srgb, var(--spill, var(--ground)) 12%, transparent)`. Each film supplies its existing palette’s ground as the spill color.
- **Screen edge:** `inset 0 0 35px #0004`, combined with a shallow transparent-to-black diagonal overlay. This darkens the screen edge without changing the source stills.

Foreground images and canvases retain full source color at rest, on hover, and on focus. The dark worn environment and shallow screen-edge overlay seat the clashing inks without a saturation or brightness filter on the artwork.

Printed background flyers use `grayscale(.75) sepia(.28) brightness(.64)`, normal blending, and (.4) opacity, with every third flyer at (.26). They remain behind the title films and do not intercept pointers. The slot prop uses `sepia(.4) brightness(.6)` at (.65) opacity. The wall moves by (scrollY × .045); scraps move by (distance × .09), clamped to (±110px). Passive scroll handling schedules one animation frame; hidden documents and an open player suspend scenery painting. Reduced motion removes scenery translation.

The existing raw collection cuts between three authored collage states rather than running games in miniature. This describes its rejected foreground implementation, not a motion rule for the pending vector direction.

Film holds are (1800ms, 1050ms, 1450ms), with staggered starts. Visible films use bounded canvas resolutions; offscreen films release their canvas to (1 × 1) and reveal the raw JPG fallback. The shared pause control, document visibility, and open player suspend timed cycling. Mouse position scrubs three horizontal regions; focus holds frame zero. Reduced-motion preference keeps frame zero and disables timed cycling and pointer scrubbing. The selector dot returns over (150ms) with the source spring easing; successful quarter flight lasts (520ms). Reduced motion removes that return transition and cancels coin flight. Optional synthesized sound begins off and suspends while hidden.

## Shapes

Catalog thumbnails and issue film panels have sharp rectangular edges. Catalog native selection and metadata tags retain small rounded corners; the image WIP badge is circular. Arcade’s wordmark, pause control, film fields, and player surround are hard-edged. Only compact sound/surprise controls, the pocket quarter, selector dot, and local visit dots use circles. There is no general rounded-card or cabinet radius scale.

## Components

### Catalog controls and work links

Unboxed inherited-serif buttons sit alongside bold labels. Hover underlines; selected choices become blue and (600) weight. Native theme selection uses a one-pixel stroke and small SVG arrow. Focus is a two-pixel blue outline. Work links retain underlined titles, purple visited titles, and a three-pixel blue thumbnail focus outline with a three-pixel offset. Metadata tags and the white WIP disc remain gallery metadata.

### Issues cover

Three upright first-frame images preview Arcade within the existing serif catalog. The linked caption and bordered WIP tag stay outside the preview.

### Arcade navigation and films

Small underlined links use Arcade Ink. Focus uses a three-pixel Signal outline, offset by (6px), or (8px) around films. The hidden skip link appears on focus. Each semantic work link contains its local raw JPG plate and an accessibility-hidden canvas; the first two JPGs load eagerly and later JPGs lazily. The canvas replaces the fallback only after the plate loads, drawing succeeds, and the three local lettering fonts are ready. Each original work name remains accessible without an added caption over the artwork.

Fifteen three-state native canvas films build on original raw illustrated plates. State zero draws the full plate, exactly matching the no-JavaScript JPG fallback. State one jumps into a (.58 × .58) crop, applies a (.28) opacity multiply ink field, and adds expressive title lettering. State two uses one of three per-work edit families: split panorama, vertical splice, or punched strips, with another title placement. Fourteen plates are newly generated game-inspired illustrations; Many Mario is an original code-authored photostat collage using its own existing game thumbnail. Film compositing and per-work colors live in `attract-art.js`; lifecycle and scrubbing live in `attract.js`.

### Asteroids attract direction study — WIP

`Issues/arcade/attract-test.html` is one representative test, not a replacement for the collection. Its sharp black (4 / 3) canvas is bounded at (960px) within the existing worn room. The requested ASTEROIDS ASSEMBLE title builds from separate rigid brackets and hinged multisegment strokes: parts converge and unfold, approach joins with (8px) gaps, then clamp with brief coral jaws and minor recoil. The completed title holds until a radial ballistic burst at (14.6s) accelerates and tumbles fragments out of frame. Incoming parts mainly originate beyond the frame edges, and a small next-cycle lead-in begins near the end of the (20s) loop. Bounding-box culling omits fully offscreen fragments. Three faint asteroid pairs drift left to right behind the lettering and coalesce into plain external union outlines, with internal edges omitted. The background carries no clamp brackets, locks, jaws, or added marks. At the same (14.6s) onset as the word burst, wedges derived from the actual asteroid polygons scatter outward and tumble; no explosion rings, sparks, or other ornaments are added. Both letter parts and asteroid chunks are culled offscreen, intentionally leaving a quiet blank field by (16.3s). Background asteroids gradually return from (18.5s) through the loop boundary. The words’ geometry, movement, and existing tiny assembly accents remain unchanged. There is no spaceship or shot sequence. This is native canvas geometry, with no animation rasters or video. HTML plus JavaScript totals (14,672 bytes); that figure excludes the reused wall, posters, and utility font.

The source uses (24fps) timeout scheduling only while active. Pause, link focus, reduced motion, and a hidden document suspend the timer. Focus and reduced motion display the completed title at (11s), rather than the scattered starting parts. The whole screen links directly to the unchanged original Vectrex Asteroids work. Navigation and the visible pause control stay outside the image, with a three-pixel lime focus outline offset by (6px). No no-JavaScript image fallback is supplied by this test. Render counts are returned for verification only and are not displayed in the artwork.

The existing wall texture and three raw images—Asteroids, Pacman, and Frogs—are reused only as dim background posters in the study: `grayscale(.65) sepia(.22) brightness(.5)` at (.45) opacity. The screen uses `0 20px 60px #000a` seating. Public Sans remains the existing utility font; the title glyphs introduce no font dependency. `attract-test.meta.json` records `"wip": true`; original artwork content and status remain unchanged. Longer loops within reasonable byte budgets are permitted, but collection-wide adoption awaits user feedback.

### Pause and flat player controls

The square pause/play button uses Ground, a muted one-pixel border, and Paper glyphs, with state and accessible name synchronized. The dark textured player contains light arrow utilities, a centered light work title, a real iframe, flat previous/next triangles, a pale lime draggable dot over a thin light rule, an acid surprise circle with Control Ink marks, and a dark sound circle with a muted one-pixel border. Utility hover turns Signal; direction hover becomes Acid with Control Ink glyphs. All controls retain accessible names and the shared focus outline.

Ordinary film activation opens a native dialog; modified clicks keep direct link behavior. Each switch replaces the iframe, stopping the previous work. Previous/next wrap through all fifteen works. Horizontal selector dragging chooses by direction; vertical dragging or clicking chooses a surprise. The quarter can be clicked or dragged to the background slot; the draw bag favors unvisited works and exhausts candidates before repeating. Escape, visible return, focus restoration, wall scroll restoration, and `#play=slug` history remain available. Same-origin iframe Escape is relayed to the parent; file-origin isolation retains the visible exit fallback.

Visits are small difference-blended dots (8px), growing to (14px) for the last played work. They are local activity only. No visit state changes metadata or curatorial status. Without JavaScript or native dialog support, direct film links and raw JPGs remain usable; enhanced controls stay absent or disabled.

### Local raster and font assets

The fifteen `assets/raw/*.jpg` plates carry embedded source provenance and entries in `assets/prompts.json`: fourteen original generated illustrations and the code-authored Many Mario photostat collage. The latter uses `pieces/016-up-mario/thumbnail.jpg`, original gallery artwork by the user, through independent crops and duotone pixel mapping; its source is `assets/source/mario.html`. The former clean geometric `assets/attract/` PNG fallbacks are removed. The earlier fourteen generated poster JPEGs and authored Many Mario geometric print persist only as desaturated background flyers, preserving their provenance. The transparent slot prop and generated `assets/wall-wear.jpg` retain their source records. The registry contains thirty-two shipping rasters: fifteen raw plates, fifteen printed flyers, the slot, and the wall texture. All five local font families ship with licenses. No external font service or build dependency is introduced.

## Do's and Don'ts

### Do:

- **Do** preserve the white, Georgia, blue-link catalog outside themed experiences.
- **Do** keep each attract film a semantic direct link with an accessible work name; preserve the existing collection’s local first-frame fallbacks.
- **Do** keep pause, reduced-motion handling, hidden-document suspension, and direct work navigation; preserve offscreen suspension in the collection.
- **Do** keep artwork metadata and player titles outside original sketches unless the user explicitly requests otherwise.
- **Do** keep Arcade and new compositions WIP unless the user explicitly promotes them; preserve manual Selected and Rejected decisions.
- **Do** retain embedded raster provenance and the matching assets/prompts.json registry entry.
- **Do** keep the worn environment and readable control contrast; treat the Asteroids vector study as WIP pending feedback before redoing the collection.

### Don't:

- **Don’t** carry the rejected street-art/comic/photostat foreground or rejected glossy 3D exploration into the pending attract-screen direction.
- **Don’t** apply Arcade’s display fonts or palette globally to the catalog.
- **Don’t** treat local visit dots or last-played activity as Selected, ratings, or curatorial decisions.
- **Don’t** infer promotion from completion, quality, or import; missing status fields mean WIP and explicit rejection takes precedence.
- **Don’t** add captions, readouts, instructions, titles, or text controls inside sketches without an explicit user request.
- **Don’t** introduce CDN or framework dependencies for this static gallery.
