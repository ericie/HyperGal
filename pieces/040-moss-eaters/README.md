# Moss Eaters

A small colony of segmented grazers eats its way through a damp moss field.
The resource appears as dark, noise-distributed pixel clouds: thick carpet
covers most of the stone, thinning to sparse speckle and a few pockets of bare
rock between the richest growth.

Each animal has exactly two modes.

**Mining.** Inside thick carpet it lays parallel lanes and joins them with
compact 180° hairpins. Its mouth clears a swath about four body radii wide,
and each new lane is laid one turn diameter over, with every turn's radius
drawn a little differently but always narrower than the swath, so adjacent
passes overlap slightly and no ribbon of moss survives between them. The lanes
are not ruler-straight: each run of mining shares one gentle lateral wobble,
a function of distance along the sweep, so all its lanes bend together like
contour lines and their spacing never changes.
A lane runs until the moss ahead thins well below what that lane has been
yielding, or reaches the field edge; a lane may bridge a short bare gap toward
rich moss beyond, but never runs across ground it has already mined. Even a
rich lane is eventually broken: each lane draws its own soft limit of roughly
50 to 180 pixels, past which the chance of turning rises with every step and
becomes certain at twice the limit, so mined patches stay compact rather than
striping the whole field. At each lane end the grazer previews both possible
semicircular turns and commits to the side whose parallel lane still holds
moss. A lane cut short by its limit with nowhere to turn simply carries on
under a fresh limit. When neither side holds moss, the patch is finished.

A sweep remembers its axis, its wobble, and every lane laid in it, and the
sweeps belong to the field rather than to any one animal. A grazer arriving
beside lanes already laid, by itself or by another, joins that sweep and slots
its lane into the nearest free position, so later passes by any member of the
colony extend the same tiling instead of crossing it at a new angle. Lanes are
registered as they are being laid, so two grazers never claim the same slot.
Only far from any existing lane does a grazer start a fresh sweep with a fresh
axis.

**Prospecting.** Between patches the grazer searches. A short-range sense of
remaining growth in every direction pulls it toward the nearest rich carpet,
strongly when the scent is strong and only faintly when it is weak, with
rotational Brownian noise on top so the search path curves rather than rules.
Thin growth is everywhere and never worth a detour; only carpet thick enough
to lane through attracts. The grazer keeps mowing its full swath as it
searches, so the route between patches is eaten like everything else. The
moment a real run of carpet lies ahead, it drops into mining with that heading
as the lane axis.

Every animal moves forward at its own fixed speed: there is no braking,
reversing, sideways motion, or sine-wave sweep. The mined lanes are a broad,
granular exposure of the surface beneath the moss, with a narrow scrape at the
center recording the exact course; there are no footprints or leg marks.
The trail is laid by distance rather than by frame, so a coarse step and a
smooth one leave the same exposure behind.

The field opens with a colony of three to nine grazers, sized to the screen,
each placed in its own rich patch, and with about a minute of feeding already
laid so the first lanes and hairpins are there to read from the start. From
there the trails accumulate in real time, gradually changing the image from a
field study into an all-over drawing. No grazer is ever retired or killed; the
colony persists until the field is reset.

Click or tap to move the nearest grazer to that point. Press R or Enter to
grow a new field. Press Space to pause and resume. Reduced-motion preferences
hold the opening state still; clicks add a complete local feeding path.

The piece is self-contained vanilla HTML, CSS, and Canvas with no runtime
dependencies. Add `?seed=1234` to the URL to revisit a particular field. The
private `?preview=mature` state advances the simulation only for catalog image
capture; it is never used by the public piece. `window.__mossDiagnostics()`
reports lane, turn, sweep, and prospecting counts, the path overlap rate, each
grazer's mode, and the fraction of lane-worthy moss eaten so far.
