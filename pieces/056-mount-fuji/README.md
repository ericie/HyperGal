# Painting Together

An evolving oil painting built with the original **Loaded Brush** material
renderer. The subject is incidental; the work is the moving application of
paint. There are no illustrative objects, visible titles, labels or controls.

Loaded multicolor brushes follow curved, pressure-varied paths. Individual
bristles leave grooves, streaks and dry trails; thick pigment piles up around
turns and catches raking light. Lean scrubs knit together the underpainting,
with smaller marks and broad gestures layered over it. Blue, teal, violet,
ochre and muted earth pigments mix across each brush in Oklab.

Up to four autonomous brushes extend through the composition at once,
continuously overpainting along a slowly changing flow field. Completed paint
stays still. Each frame starts from a half-float backing store, so advancing
edges do not accumulate opacity from repeated rendering. A raised bead of
fresh pigment travels just behind each brush front.

- Drag to paint directly into the same relief surface.
- **Space** pauses/resumes the autonomous brushes.
- **R** starts a new painting; **S** saves the current canvas as PNG.
- `?seed=your-word` fixes the initial painting and brush sequence.

Open `index.html` directly. No dependencies, server or build step. Live paint
requires WebGL 2 and floating-point render targets; a still canvas capture is
shown if unavailable. Reduced motion starts with a complete, still painting;
drag input remains available. Hidden tabs suspend animation without catching
up on return. Resizing repaints the composition to fit the new canvas.

The renderer retains the original linen, curvature-aware ribbons, bristle
noise, paint height, self-shadowing, ambient occlusion and wet specular.
Completed marks are rasterized once, and only active brush geometry and their
loaded gradients remain allocated. Twelve ribbon strips are joined with
degenerate vertices into one draw call per brush. Output uses 1.5–2 texels per
CSS pixel, capped near 2.6 million texels with a minimum scale of 1.

`thumbnail.png` is a 720 × 450 downsampled capture of the actual 1440 × 900
initial painting with the default `fuji` seed. PNG metadata records its source.

Browser verification covered desktop, phone and landscape views, two minutes
of bounded overpainting, actual paint input, reset, PNG export, pause/resume,
resize and reduced motion. The WebGL error state remained clear.
