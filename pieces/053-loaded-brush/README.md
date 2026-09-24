# Loaded Brush

A single thick oil stroke. The brush is loaded with a gradient of paint,
ultramarine along one edge to titanium white along the other, and pulled left
to right across primed linen. The paint is rendered as a relief: hair grooves,
lips of pushed-aside paint at the edges, a bulge where the brush lands, hairs
running dry one by one, and the lift at the end. Lit by a raking key light with
cast shadows, occlusion in the grooves and a wet two-lobe specular.

- The palette (bottom left, draggable by its header) sets the paint: any number
  of colour stops with positions, and whether the load runs **across** the brush
  face or **along** the stroke. Brush width (100–320 px), paint thickness, how
  much paint the brush holds, and the light angle.
- Click the linen to add a path point; it is spliced into the path where the
  stroke passes nearby, otherwise added to the nearer end. Sharp turns are
  modelled rather than approximated — see **Turns** below. Drag points to move
  them, double-click (or Delete) to remove one, arrow keys nudge. A selected
  point gets a **Pressure** slider that widens or narrows the stroke there.
- **R** / Enter replays the stroke, **S** saves a PNG, **E** hides or shows the
  palette (and the path handles with it). **Shuffle** loads a fresh brush.
- `?seed=your-word` fixes the hairs and the linen.

Open `index.html` directly. WebGL 2 with half-float render targets is
required; there is no other dependency, request or build step. Reduced motion
shows the finished stroke immediately. The palette opens on load only where it
will not sit on the stroke.

## Paint

Three passes. The linen is drawn once per resize: a plain weave of wavering,
unevenly thick threads under a thin gesso, stored as albedo and height. The
stroke is a ribbon along a centripetal Catmull-Rom spline through the points
(with a slow hand tremor so a two-point stroke is not ruled), and its fragment
shader evaluates the paint in stroke space: signed offset across the brush and
arc length along it. Gradient noise stretched along the stroke places three
families of hairs; each cuts a narrow V groove whose depth comes and goes along
its run, stronger in some bands of the brush than others. The grain travels
with the hair that left it, but only partly: the paint stands on the canvas
rather than riding the brush, so a hard turn skews the grain instead of
shearing it into a lattice. Every hair samples
the loaded gradient at its own offset, so streaks of the neighbouring colour
cross over and the mixing grows along the stroke. Each hair holds its own
amount of paint; when it runs out it stops depositing except on the crests of
the weave. The brush lifts over the last width and a bit, so the trails end one
by one. Colour and height are composited in painter's order into half-float
targets.

## Turns

A wide brush going round a bend does not sweep a uniform band, and the whole
stroke frame is built on that. Every hair runs its own distance: for a hair
offset `t` from the path, that distance grows by `1 - t * curvature` per step,
so its travel is `s - t * (total turn)`. Hairs on the inside of a bend crawl
and pile their paint up; hairs on the outside race, stretch theirs thin and run
dry sooner, which is why the outside of a turn goes streaky first. Paint wicks
sideways between hairs, so that difference saturates rather than growing with
every degree — without it a hairpin leaves half the brush soaking wet.

No offset may reach past the centre of curvature: beyond it the ribbon folds
through itself and the stroke frame turns inside out — the crease, the fold and
the chip of paint that used to appear at any corner past about eighty degrees.
Instead the inside of the ribbon is squeezed, easing onto the centre of
curvature and never crossing it, which is what the inner hairs of a turning
brush actually do. The ribbon is drawn in columns across its width so the
squeeze stays accurate between its edges, and the shader is told each hair's
true offset, so it knows those hairs are bunched. Where they are bunched past
travelling at all the brush is pivoting: those hairs skid, giving up ground at
the inner corner and dragging away as much paint as they lay down, so the
corner pinches to a point and the pivot leaves skids rather than a clean
stamped edge. A straight stroke has no turn and no curvature, so none of this
changes it.

The lighting pass builds the combined height field (paint filling the weave as
it thickens), takes normals by central differences, marches toward the light
across the relief for soft cast shadows, samples a ring for occlusion, and
shades with a warm key, a cool fill, ambient, GGX specular in two lobes and a
soft window reflection, then a gentle shoulder and sRGB encoding. Everything is
rendered at two texels per CSS pixel or more so the wet highlights do not
shimmer.

The thumbnail is a canvas capture at 1440 × 900, seed `loaded-brush`.
