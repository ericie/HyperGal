# Kaleidoscope

Open `index.html` directly. This is a portable, dependency-free Canvas 2D artwork with no build step or network requests. It remains WIP.

The original candy-colored field combines 180 geometric fragments, 100 translucent iridescent prisms, and 4,200 glitter flecks in twelve reflected wedges. The floating panel extends that composition with 36 settings in four tabs:

| Tab | Settings |
| --- | --- |
| Optics | Mirror system, mirror points, mirror rotation, magnification, aperture, optical center X/Y, tunnel depth, tunnel twist, mirror reflectivity |
| Objects | Object cell, material, object density, object size, glitter, transparency, thin-film interference, wheel separation, cell rotation |
| Light | Palette, illumination, background, hue rotation, saturation, light intensity, edge glow, polarizer angle, vignette |
| Motion | Time scale, scope rotation, cell rotation speed, internal drift, object tumble, liquid viscosity, gravity, liquid current |

Five mirror layouts offer Full field, Two-mirror mandala, Three-mirror tessellation, Four-mirror chamber, and Tapered mirror tunnel. Radial layouts allow 3–24 mirror points. Six materials offer Dichroic prisms, Lampworked glass beads, Liquid & bubbles, Glass filaments, Agate & minerals, and Metal foil & mica. Five object cells offer Dry fragments, Liquid suspension, Gravity wand, Counter-rotating wheels, and Teleidoscope · image. Inapplicable controls are disabled.

The 12 presets are Original · glitter & prisms; Brewster · dry glass; Oil cell · liquid suspension; Dark field · lampworked beads; Tapered · infinite chamber; Three mirror · tessellation; Four mirror · glass lattice; Gravity wand · brass & mica; Wheel scope · overlapping glass; Polariscope · interference; Agate · mineral sections; and Filaments · stained glass. Editing a setting marks the configuration Custom.

These are stylized procedural interpretations inspired by real kaleidoscope mirror arrangements, object cells, and materials. They do not simulate physical optics, fluid dynamics, or particle physics. Background references: the Brewster Kaleidoscope Society's [kaleidoscopic image overview](https://brewstersociety.com/kaleidoscope-university/kaleidoscopic-image/) and [FAQ](https://brewstersociety.com/f-a-q/).

## Controls

- **Space** or the **Pause / Play** icon: pause or resume.
- **S** or **Save image**: download the current canvas as `kaleidoscope.png`, without the interface.
- **R** or **Rearrange**: generate a new object arrangement while retaining settings.
- **H**, **Escape**, or **Controls**: collapse/expand the panel; Escape collapses it.
- Drag the canvas horizontally to turn the object cell.
- Drag the panel grip to move it. With the grip focused, arrow keys move it 10px; Shift + arrow keys move it 40px.
- With a tab focused, Left/Right arrows select adjacent tabs; Home/End select the first/last.
- **Reset** restores Original settings and resets motion phase; it retains the current arrangement seed.
- **Copy settings link** copies a URL containing settings, arrangement seed, and animation phase. If clipboard access is unavailable, a selectable link appears in the panel.

Space, S, and R do not override input, select, textarea, or button keyboard behavior. H and Escape leave text-entry and select controls alone. The panel begins collapsed at widths up to 600px and stays within the viewport when moved or resized.

## Images and shared state

In Objects, load a local image to use the teleidoscope cell. The file is read in the browser and never uploaded. Shared links do not contain image pixels: load the image separately after opening the link. Without the image, the renderer uses procedural content until one is loaded.

Settings, panel position, and loaded images are not persisted between visits. A shared settings link restores the validated settings, seed, and phase; pause state follows the receiving browser's reduced-motion preference. `?seed=your-word` repeats an initial arrangement. Opening a link on another device requires that device to have the same artwork files or a hosted copy; a `file:` URL alone does not distribute the artwork.

Reduced-motion preferences start with a still image; Play opts into motion. Hidden tabs suspend animation. Rendering adapts to the viewport, caps pixel density at 2×, and bounds its offscreen source canvas at 1400px. Material detail is cached, glitter brightness changes smoothly, and local images are reduced to at most 2048px on their longest side.
