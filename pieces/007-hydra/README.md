# hydra

An autonomous game of traditional Snake, painted like a luminous fossil field.

There are five contenders and one mouse. New snakes enter from offscreen with
random starting lengths and aggression values: higher aggression makes one chase
the mouse harder, lower aggression makes it preserve more space around its own
body and the other snakes. As a snake grows, its effective aggression rises, and
every snake may look for chances to box another snake in when its available
space is small relative to the hunter's body length. Consecutive mouse catches
by the same snake increase its growth multiplier. The rule set stays small:

- touching the **mouse** grows the snake and creates a new mouse,
- consecutive mouse catches by the **same snake** grow it by 1x, 2x, 3x, ...,
- larger snakes move faster and become more aggressive,
- touching the **border** kills the snake,
- touching its **own body** anywhere kills the snake,
- touching **another snake** kills one snake,
- when the snake dies, its body remains as layered stain and bone memory,
- once only one survivor remains, new contenders enter from beyond the border.

## The look

Bright saturated bodies on black: outlined continuous snakes, one blinking
mouse, bright-eyed heads, a soft vignette, and a clear border around the arena.
Deaths accumulate into translucent color stains, darker clots, and pale snake
bones that layer under the living hunt.

## Interaction

- **Click** — reseed the board.

## Archival rule

This folder is fully self-contained: one `index.html`, no external scripts, no
build step, no dependencies. Canvas 2D and vanilla JS. Zip it, email it, open
the file — it works.
