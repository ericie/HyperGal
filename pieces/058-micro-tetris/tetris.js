(() => {
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  const recipes = window.MICRO_TETRIS_RECIPES;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cellSize = 2;
  const colors = ['#090b10', '#76c9cd', '#d6bb6a', '#af93d4', '#83b995', '#cf7d8a', '#7598cf', '#cf9b74'];
  const colorBytes = colors.map(color => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)));
  let width, height, board, lanes, image, pixels;
  let active = null, paused = motion.matches, last = null, drawn = 0;
  let cleared = 0, locked = 0;

  const randomRecipe = () => recipes[Math.floor(Math.random() * recipes.length)];
  function nextPiece(lane) {
    if (lane.width < 4) {
      return { color: 1, cells: [[0,0],[0,1],[0,2],[0,3]], x: lane.cursor, y: 0 };
    }
    return lane.recipe[lane.cursor];
  }
  function fits(piece, x, y) {
    return piece.cells.every(([dx, dy]) => {
      const column = x + dx, row = y + dy;
      return column >= 0 && column < width && row >= 0 && row < height && !board[row * width + column];
    });
  }
  function place(lane, piece, x, y) {
    if (!fits(piece, x, y) || fits(piece, x, y - 1)) throw new Error('Invalid tetromino contact');
    for (const [dx, dy] of piece.cells) board[(y + dy) * width + x + dx] = piece.color;
    lane.cursor++;
    if (lane.cursor === (lane.width < 4 ? lane.width : 4)) {
      lane.base += 4;
      lane.cursor = 0;
      lane.recipe = randomRecipe();
    }
  }
  function lock() {
    const { lane, piece, x, y } = active;
    place(lane, piece, x, y);
    locked++;
    active = null;
    clearRows();
  }
  function clearRows() {
    let write = 0;
    for (let read = 0; read < height; read++) {
      const row = board.subarray(read * width, (read + 1) * width);
      if (row.every(value => value !== 0)) continue;
      if (write !== read) board.copyWithin(write * width, read * width, (read + 1) * width);
      write++;
    }
    const count = height - write;
    board.fill(0, write * width);
    // The gravity-valid recipes leave every remaining piece above cleared rows.
    for (const lane of lanes) lane.base -= count;
    cleared += count;
  }
  function reset() {
    width = Math.max(1, Math.ceil(innerWidth / cellSize));
    height = Math.max(16, Math.ceil(innerHeight / cellSize));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * cellSize}px`;
    canvas.style.height = `${height * cellSize}px`;
    board = new Uint8Array(width * height);
    image = context.createImageData(width, height);
    pixels = new Uint32Array(image.data.buffer);
    lanes = [];
    active = null;
    cleared = 0; locked = 0; last = null;
    for (let x = 0; x < width; x += 4) {
      const lane = { x, width: Math.min(4, width - x), base: 0, cursor: 0, recipe: randomRecipe() };
      lanes.push(lane);
    }
    seedRows();
    spawn();
    render();
  }
  function seedRows() {
    if (lanes.length < 2) return;
    const depth = Math.max(4, Math.floor(height * .32 / 4) * 4);
    // Keep one open four-column well, so every starting row is incomplete
    // and can be reached by falling pieces. The rest has a level surface.
    const well = Math.floor(Math.random() * Math.floor(width / 4));
    for (let i = 0; i < lanes.length; i++) {
      if (i === well) continue;
      const lane = lanes[i];
      while (lane.base < depth) {
        const piece = nextPiece(lane);
        place(lane, piece, lane.x + piece.x, lane.base + piece.y);
      }
    }
  }
  function chooseLane() {
    const floor = Math.min(...lanes.map(lane => lane.base));
    const start = Math.floor(Math.random() * lanes.length);
    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[(start + i) % lanes.length];
      // Finish the lowest band across the whole window before building higher.
      if (lane.base === floor && lane.base + 4 <= height - 4) return lane;
    }
    return null;
  }
  function spawn() {
    const lane = chooseLane();
    if (!lane) return;
    const piece = nextPiece(lane);
    const x = lane.x + piece.x;
    const y = height - 1 - Math.max(...piece.cells.map(([, dy]) => dy));
    if (!fits(piece, x, y)) return;
    active = { lane, piece, x, y, travel: 0 };
  }
  function advance(seconds) {
    if (!active) spawn();
    if (!active) return;
    // One visible top-to-bottom drop, checking every cell so frames cannot
    // skip through the stack. A full-height fall takes about 0.8 seconds.
    active.travel += seconds * height / .8;
    while (active.travel >= 1) {
      active.travel--;
      if (fits(active.piece, active.x, active.y - 1)) active.y--;
      if (!fits(active.piece, active.x, active.y - 1)) {
        lock();
        spawn();
        break;
      }
    }
  }
  // Pack RGBA using the platform's byte order rather than assuming it.
  const packed = colorBytes.map(([r,g,b]) => new Uint32Array(new Uint8Array([r,g,b,255]).buffer)[0]);
  function render() {
    for (let i = 0; i < board.length; i++) pixels[(height - 1 - Math.floor(i / width)) * width + i % width] = packed[board[i]];
    context.putImageData(image, 0, 0);
    if (active) {
      context.fillStyle = colors[active.piece.color];
      for (const [dx, dy] of active.piece.cells) context.fillRect(active.x + dx, height - 1 - active.y - dy, 1, 1);
    }
    canvas.dataset.cleared = cleared;
    canvas.dataset.locked = locked;
    canvas.dataset.active = active ? 1 : 0;
  }

  function frame(now) {
    const seconds = last === null ? 0 : Math.min(.05, (now - last) / 1000);
    last = now;
    if (!paused && !document.hidden) advance(seconds);
    if (now - drawn > 1000 / 30 && !paused) { render(); drawn = now; }
    requestAnimationFrame(frame);
  }
  function toggle() { paused = !paused; canvas.setAttribute('aria-pressed', String(paused)); }
  canvas.addEventListener('click', toggle);
  addEventListener('keydown', event => {
    if (event.code === 'Space') { event.preventDefault(); toggle(); }
    if (event.key.toLowerCase() === 'r') reset();
  });
  let resizing;
  addEventListener('resize', () => { clearTimeout(resizing); resizing = setTimeout(reset, 120); });
  motion.addEventListener('change', event => { paused = event.matches; canvas.setAttribute('aria-pressed', String(paused)); });
  canvas.setAttribute('aria-pressed', String(paused));
  reset();
  requestAnimationFrame(frame);
})();
