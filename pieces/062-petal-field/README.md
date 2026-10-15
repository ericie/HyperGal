# Petal Field

Two to ten circles of random sizes scatter across warm paper. Each grows one petal at a time around its edge, then adds successive overlapping rows until petals cover the viewport. Each flower has a separate transparent canvas and fixed CSS z-index; a foreground flower always overlaps a background flower as a complete unit. New rows sit behind earlier rows within each flower.

Open `index.html` directly, with no dependencies or network requests. Space pauses, R starts new flowers, and S saves a PNG. The same actions are available as buttons. Resizing starts a new composition. Reduced-motion preferences produce a finished still image immediately. Growth stops when every pixel of a small coverage mask is filled.
