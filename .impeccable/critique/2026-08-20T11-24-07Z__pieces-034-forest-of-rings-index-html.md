---
target: Forest of Rings
total_score: 19
p0_count: 0
p1_count: 4
timestamp: 2026-08-20T11-24-07Z
slug: pieces-034-forest-of-rings-index-html
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|------:|-----------|
| 1 | Visibility of System Status | 3/4 | Season, mode, values, hover, and focus respond; selected-tree state is not semantically announced. |
| 2 | Match System / Real World | 2/4 | Rings and fire are recognizable, but colors, arrows, soil values, and field marks have no readable meaning. |
| 3 | User Control and Freedom | 2/4 | Replay, reseed, Escape, and panel toggle exist; time cannot be paused, scrubbed, compared, or restored. |
| 4 | Consistency and Standards | 3/4 | The mechanical visual and interaction language is cohesive. |
| 5 | Error Prevention | 2/4 | Ranges constrain input, but reseeding discards the current state without recovery. |
| 6 | Recognition Rather Than Recall | 1/4 | The legend is absent, the hint is hidden, and comparing trees requires memorizing transient tooltips. |
| 7 | Flexibility and Efficiency | 2/4 | Keyboard and URL parameters exist, but there is no time control, pinning, or comparison. |
| 8 | Aesthetic and Minimalist Design | 2/4 | It is uncluttered, but twenty equal specimens and decorative field marks flatten the hierarchy. |
| 9 | Error Recovery | 1/4 | No undo, seed history, or state restoration exists. |
| 10 | Help and Documentation | 1/4 | The UI does not explain what the rings encode or why the transformation matters. |
| **Total** | | **19/40** | **Poor — usable mechanics, weak comprehension and engagement.** |

## Anti-Patterns Verdict

**LLM assessment:** This is not generic landing-page slop. The seeded ecology and dependency-free construction show authorship. It does, however, fall into generative-art slop: a random seed, two 0–100 sliders, twenty near-equivalent outputs, scientific monospace, a survey grid, and algorithmic complexity that produces cosmetic rather than legible variation. The current image looks like pleasant scientific wallpaper. The algorithm is more interesting than the artwork.

**Deterministic scan:** One warning in `pieces/034-forest-of-rings/index.html:58`: `flat-type-hierarchy`, based on the 9px–12px utility sizes (1.3:1 ratio). This is partially misleading because the detector omits the 20px–26px heading and cannot assess canvas hierarchy. It still identifies a real mobile issue: after responsive hiding, visible control copy is nearly all 9px–10px, and touch targets are undersized.

**Visual evidence:** Mature, active-fire, expanded-panel, and mobile states were inspected in a fresh browser tab. The mature state showed all twenty trunks and a faint historical fire corridor. At year 36 the maroon fire front was visually distinct, confirming that the strongest event exists but is transient. The closed/open panel state and ARIA attributes worked. Mobile had no horizontal overflow but hid the title, mode, hint, and endpoint labels. No visual detector overlay was available because the browser surface exposed no mutable script-injection API; screenshot, DOM, computed-style, ARIA, and console evidence were used instead.

## Overall Impression

There is real potential, but it requires a conceptual rebuild rather than polish. The source contains a compelling ecological system—shared climate, directional fire, pests, elevation, and planting age—but the finished view reduces it to twenty similar decorative discs. Nothing is dominant, the viewer has no question to pursue, and the strongest event has disappeared by the ending.

The single biggest opportunity is to make this a century-long causal story: let viewers stop on a consequential year, read that same year across the entire stand, and see the fire remain as an irreversible visual fact.

## What's Working

- **Specific underlying system:** Shared climate and disturbance interacting with local terrain, pests, and age is a strong conceptual substrate.
- **Coherent art direction:** Survey geometry, square controls, restrained forestry colors, and mechanical typography form a consistent archival language.
- **Strong technical chassis:** Deterministic seeds, URL parameters, responsive layout, reduced-motion handling, focus styles, and keyboard traversal are worth preserving.

## Priority Issues

### [P1] The ecological meaning is visually illegible

**Why it matters:** Ring color and shape read as decoration. A viewer cannot identify drought, fire, pests, or recovery, so the central ecology remains trapped in the code.

**Fix:** Replace decorative color rotation with strict semantic encoding. Make time inspectable: hovering or scrubbing a year should highlight that same ring across every tree and reveal rainfall, fire, pest, and recovery information in plain language.

**Suggested command:** `$impeccable clarify`

### [P1] There is no authored hierarchy

**Why it matters:** Twenty equal circles create pattern, not composition. The viewer has no protagonist and no reason to inspect one specimen rather than another.

**Fix:** Promote a selected tree into a large autobiography lens occupying 30–40% of the viewport. Dim the stand, connect the hero trunk back to its site, and allow two or three trees to be pinned for comparison.

**Suggested command:** `$impeccable layout`

### [P1] The strongest event has no narrative control

**Why it matters:** Fire is the only climax, but it passes automatically and the mature state hides its consequence. Replay is too blunt to support understanding.

**Fix:** Make time the primary interaction. Add pause, scrub, event markers, and automatic holds at fire, drought, and pest onset. Finish on scars and divergent recovery rather than a generic mature field.

**Suggested command:** `$impeccable animate`

### [P1] Wild-versus-orchard is treated as geometry

**Why it matters:** Moving discs into rows proves interpolation but does not express an ecological argument. Nothing meaningful is lost as management increases.

**Fix:** Collapse the controls into one authored `wild forest ↔ plantation` scenario. Let it change age diversity, ring variance, pest spread, fire propagation, and resilience—not only spacing. The plantation should become more synchronized and more vulnerable; the wild forest should preserve irregular survivors.

**Suggested command:** `$impeccable shape`

### [P2] Interpretation and access collapse on mobile and assistive technology

**Why it matters:** Mobile hides the thesis, mode, endpoints, and hint. Canvas selection is not announced, reduced motion removes the temporal story, and touch targets are below 44px.

**Fix:** Keep a one-line thesis and current mode visible, use tap-to-pin, announce selected-tree data in a live semantic region, enlarge touch targets, and provide a manual timeline in reduced-motion mode.

**Suggested command:** `$impeccable adapt`

## Persona Red Flags

**Jordan, first-time gallery visitor:** Jordan sees rings and cryptic field abbreviations but no thesis within five seconds. Opening `FOREST VARIABLES` reveals parameters rather than meaning. The colors, arrows, contours, and dashed lines cannot be interpreted, so one slider experiment is likely the end of the visit.

**Sam, keyboard/screen-reader/low-vision visitor:** Canvas traversal produces only a visual inspector. The 9px–11px telemetry is too small, reduced motion skips the temporal concept instead of making it controllable, and no pause or semantic tree-history announcement exists.

**Casey, distracted mobile visitor:** Mobile hides the title, mode, slider endpoints, and hint. The 36px toggle, 34px actions, and 22px range boxes are undersized. Rings become homogeneous at small scale, and tap-to-pin is undisclosed.

## Minor Observations

- `SEASON 96/96` implies seasonality although the model behaves like years.
- `GERMINATED 01`, `SOIL -0.03`, and `FIRE 50%` need units or plain-language framing.
- Edge-cropped trunks can feel accidental without a stronger infinite-forest composition.
- The panel covers specimens without creating a deliberate split-screen relationship.
- Contours and force arrows look authoritative but are not causally inspectable.
- The Bakalytics script conflicts with the gallery's self-reliant archival principle.

## Questions to Consider

- What is the irreversible event that makes this forest worth watching, and why is it not the protagonist?
- If every ring were gray except one year, which year deserves to command the piece?
- Are the regularity controls expressing a thesis about land management, or only proving interpolation works?
- Would one tree's 96-year autobiography be stronger than twenty interchangeable specimens?
- What can a viewer learn by comparing two trees that a static image cannot reveal?
- What should remain emotionally visible after the fire has passed?
