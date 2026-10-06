# Micro Tetris

A self-playing, full-window Tetris field. Each tetromino consists of four **1 CSS pixel square cells**, including on high-density displays. The board has as many columns as the window has CSS pixels. No enlarged blocks, grid, score overlay, or external dependencies.

Starts with legal placements covering uneven portions of the lower field, leaving deep open gaps. The player favors some columns while neglecting others until the pile approaches 70% of the window height. A hot streak fills the deepest wells, clears full-width rows, and returns the pile below 27%. The cycle repeats without topping out.

The choreography uses 160 gravity-valid recipes that pack all seven tetromino shapes into four-column bands. Many pieces fall simultaneously so this exceptionally wide board moves at a visible pace. Completed full-width packing bands clear together. This is a choreographed Tetris artwork with a constrained placement planner rather than a standard ten-column competitive game.

Click or Space pauses/resumes. R reseeds. Resizing reseeds to fit the new window. Reduced motion starts paused.
