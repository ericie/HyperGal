# Apical

A plant grows into warm ivory space. Its central shoot follows a gently wandering path; paired branches spiral around the stem, and folded leaves gradually unfurl. The camera follows the leading shoot with a full orbit every 45 seconds, letting older growth fall below the frame. Every one and a half rotations (67.5 seconds), it smoothly looks down toward the original base, lingers briefly, and returns to the growing shoot.

Open `index.html` directly. No server, build step, external assets, libraries or network requests are needed. All geometry, matrix math and GLSL lighting use the browser's native WebGL API.

- Space or **Pause** freezes growth and orbit.
- R or **New seed** starts a different plant.
- S or **Save image** downloads the canvas as a PNG.

Growth continues indefinitely while the page is visible. The first six nodes are retained for views of the base; other old nodes are discarded and branches far below the camera are not drawn, keeping the workload bounded. A new visit starts a new plant; seeds are displayed for identification, but are not persisted. Reduced-motion preferences start the sketch paused. WebGL initialization and context loss show a readable message.

The plant is an artistic growth model, rather than a botanical simulation. Its mature geometry appears progressively: tapered seven-sided stems, curved two-sided leaf blades, raised midribs, directional light and distance fog. Each piece remains fully self-contained.
