# Micro Tetris

A self-playing, full-window Tetris field. Each tetromino consists of four **4×4 CSS pixel square cells**, including on high-density displays. One-pixel seams separate the four squares within each shape and the settled pile. The board has one column for every four CSS pixels of window width. No grid across the empty field, score overlay, or external dependencies.

Starts with **8% of the board cells occupied**, rounded down to a single square. Individual squares are sampled in loose patches of varying sizes across the lower 70% of the window, with broad empty areas between them. Nearby squares often share a color to keep the sparse field from looking like multicolored static. The upper area stays clear for falling pieces. No seeded row is complete. Extremely narrow windows with fewer than five columns start empty.

Exactly one tetromino falls from the top at a time and locks on contact. The player chooses rotations and columns that limit new holes and keep the surface even, so it can play from the scattered starting field. Completed full-width rows blink before disappearing and the rows above collapse down before the next piece begins. Four-line clears get a larger, longer blink, then contract inward before collapsing. Each full-height fall takes about 0.8 seconds. If the field tops out, a fresh 8%-filled field starts automatically. This is a full-window, self-playing Tetris artwork rather than a standard ten-column competitive game.

Click or Space pauses/resumes. R reseeds. Resizing reseeds to fit the new window. Reduced motion starts paused.
