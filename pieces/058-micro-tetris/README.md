# Micro Tetris

A self-playing, full-window Tetris field. Each tetromino consists of four **2×2 CSS pixel square cells**, including on high-density displays. The board has one column for every two CSS pixels of window width. No grid, score overlay, or external dependencies.

Starts with haphazardly filled, uneven stacks reaching into the lower third of the window, with partial tetromino recipes scattered across the field. No empty well is reserved. Extremely narrow windows with fewer than five columns start empty. Exactly one tetromino falls from the top at a time, moves down until it contacts the floor or another piece, then locks. Completed full-width rows blink before disappearing and the rows above collapse down before the next piece begins. Four-line clears get a larger, longer blink, then contract inward before collapsing.

The placement planner uses 160 gravity-valid recipes containing all seven tetromino shapes. It fills the lowest four-column bands first to keep the field even. Each full-height fall takes about 0.8 seconds. This is a self-playing Tetris artwork with a constrained placement planner rather than a standard ten-column competitive game.

Click or Space pauses/resumes. R reseeds. Resizing reseeds to fit the new window. Reduced motion starts paused.
